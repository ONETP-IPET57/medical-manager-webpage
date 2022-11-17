import React from 'react';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, LineElement } from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { chakra } from '@chakra-ui/react';

Chart.register(CategoryScale, LinearScale, BarElement, Tooltip, LineElement);

export const BarChartChakra = chakra(Bar, {
  shouldForwardProp: (prop) => ['options', 'data', 'datasetIdKey'].includes(prop),
});

export const LineChartChakra = chakra(Line, {
  shouldForwardProp: (prop) => ['options', 'data', 'datasetIdKey'].includes(prop),
});
