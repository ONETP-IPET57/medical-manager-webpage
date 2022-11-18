import React from 'react';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, LineElement, PointElement, ArcElement } from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { chakra } from '@chakra-ui/react';

Chart.register(CategoryScale, LinearScale, BarElement, Tooltip, LineElement, PointElement, ArcElement);

export const BarChartChakra = chakra(Bar, {
  shouldForwardProp: (prop) => ['options', 'data', 'datasetIdKey'].includes(prop),
});

export const LineChartChakra = chakra(Line, {
  shouldForwardProp: (prop) => ['options', 'data', 'datasetIdKey'].includes(prop),
});

export const PieChartChakra = chakra(Pie, {
  shouldForwardProp: (prop) => ['options', 'data', 'datasetIdKey'].includes(prop),
});
