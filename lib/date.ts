export const getAge = (birth_date: string) => {
  const today = new Date();
  const birthDate = new Date(birth_date);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

export const formatDateToHTMLInput = (date: string | undefined) => {
  if (!date) {
    return '';
  }
  const d = new Date(date);
  const month = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  const year = d.getFullYear();
  return [year, month, day].join('-');
};

export const formatDateToHuman = (date: string | undefined) => {
  if (!date) {
    return '';
  }
  const d = new Date(date);
  const month = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

export const formatDatetimeToHTMLInput = (datetime: string | undefined) => {
  if (!datetime) {
    return '';
  }
  const d = new Date(datetime);
  const month = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  const year = d.getFullYear();
  const hour = `${d.getHours()}`.padStart(2, '0');
  const minute = `${d.getMinutes()}`.padStart(2, '0');
  return [year, month, day].join('-') + 'T' + [hour, minute].join(':');
};

export const formatDatetimeToHuman = (datetime: string | undefined) => {
  if (!datetime) {
    return '';
  }
  const d = new Date(datetime);
  const month = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  const year = d.getFullYear();
  const hour = `${d.getHours()}`.padStart(2, '0');
  const minute = `${d.getMinutes()}`.padStart(2, '0');
  return `${day}/${month}/${year} ${hour}:${minute}`;
};

export const formatDateToSQL = (date: string | undefined) => {
  if (!date) {
    return '';
  }
  const d = new Date(date);
  const month = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  const year = d.getFullYear();
  return [year, month, day].join('-');
};

export const formatDatetimeToSQL = (datetime: string | undefined) => {
  if (!datetime) {
    return '';
  }
  const d = new Date(datetime);
  const month = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  const year = d.getFullYear();
  const hour = `${d.getHours()}`.padStart(2, '0');
  const minute = `${d.getMinutes()}`.padStart(2, '0');
  const second = `${d.getSeconds()}`.padStart(2, '0');
  return [year, month, day].join('-') + ' ' + [hour, minute, second].join(':');
};

export const compareMinutesAndShowDiff = (datetimeOne: string | undefined, datetimeTwo: string | undefined) => {
  if (!datetimeOne || !datetimeTwo) {
    return 0;
  }
  const d1 = new Date(datetimeOne);
  const d2 = new Date(datetimeTwo);
  const diff = d1.getTime() - d2.getTime();
  const diffMinutes = Math.abs(Math.round(diff / 60000));
  return diffMinutes;
};

export const getAverage = (minutes: number[] | undefined) => {
  if (!minutes || minutes.length === 0) {
    return 0;
  }
  const sum = minutes.reduce((a, b) => a + b, 0);
  return sum / minutes.length;
};
