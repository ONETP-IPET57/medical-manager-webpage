// @ts-nocheck
import * as csv from 'async-csv';

/**
 * Converts an array of objects into a CSV file.
 */
class ObjectsToCsv {
  data: object[];

  /**
   * Creates a new instance of the object array to csv converter.
   * @param {object[]} objectArray
   */
  constructor(objectArray: object[]) {
    if (!Array.isArray(objectArray)) {
      throw new Error('The input to objects-to-csv must be an array of objects.');
    }

    if (objectArray.length > 0) {
      if (objectArray.some((row) => typeof row !== 'object')) {
        throw new Error('The array must contain objects, not other data types.');
      }
    }

    this.data = objectArray;
  }

  /**
   * Returns the CSV file as string.
   * @param {boolean} header - If false, omit the first row containing the
   * column names.
   * @param {boolean} allColumns - Whether to check all items for column names.
   *   Uses only the first item if false.
   * @returns {Promise<string>}
   */
  async toString(header = true, allColumns = false) {
    return await convert(this.data, header, allColumns);
  }
}

/**
 * Private method to run the actual conversion of array of objects to CSV data.
 * @param {object[]} data
 * @param {boolean} header - Whether the first line should contain column headers.
 * @param {boolean} allColumns - Whether to check all items for column names.
 *   Uses only the first item if false.
 * @returns {string}
 */
async function convert(data: object[], header = true, allColumns = false) {
  if (data.length === 0) {
    return '';
  }

  const columnNames = allColumns
    ? [
        ...data.reduce((columns, row) => {
          // check each object to compile a full list of column names
          Object.keys(row).map((rowKey) => columns.add(rowKey));
          return columns;
        }, new Set()),
      ]
    : Object.keys(data[0]); // just figure out columns from the first item in array

  if (allColumns) {
    columnNames.sort(); // for predictable order of columns
  }

  // This will hold data in the format that `async-csv` can accept, i.e.
  // an array of arrays.
  let csvInput = [];
  if (header) {
    csvInput.push(columnNames);
  }

  // Add all other rows:
  csvInput.push(...data.map((row) => columnNames.map((column) => row[column])));

  return await csv.stringify(csvInput);
}

export default ObjectsToCsv;
