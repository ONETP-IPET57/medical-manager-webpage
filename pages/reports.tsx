import { Flex, Grid, GridItem, Heading, HStack, Stat, StatLabel, StatNumber, StatHelpText, Text, Button } from '@chakra-ui/react';
import type { GetServerSideProps, GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import { MainContainer } from '../components/layouts/MainContainer';
import { Nurses, nurseState } from './nurses';
import { Patients } from './patients';
import { Zones, zoneStates } from './zones';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { BarChartChakra, LineChartChakra, PieChartChakra } from '../components/ChartsChakra';
import type { ChartData, ChartOptions } from 'chart.js';
import { compareMinutesAndShowDiff, getAge, getAverage } from '../lib/date';
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]';
import { Call } from './calls';

const Reports = ({ dataZones, dataNurses, dataPatients, dataCalls }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const [dataChart, setDataChart] = useState<ChartData<'bar'> | undefined>(undefined);
  const [dataChartZonesState, setDataChartZonesState] = useState<ChartData<'pie'> | undefined>(undefined);
  const [dataChartZonesFormaLlamada, setDataChartZonesFormaLlamada] = useState<ChartData<'pie'> | undefined>(undefined);
  const [dataChartNurseState, setDataChartNurseState] = useState<ChartData<'pie'> | undefined>(undefined);
  const [dataChartAgePatients, setDataChartAgePatients] = useState<ChartData<'bar'> | undefined>(undefined);
  const [averageCall, setAverageCall] = useState<string>('0');

  const chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    scales: {
      x: {
        grid: {
          display: false,
          drawTicks: false,
          drawBorder: false,
        },
        ticks: {
          padding: 10,
        },
      },
      y: {
        grid: {
          display: false,
          drawTicks: false,
          drawBorder: false,
        },
        ticks: {
          display: false,
        },
      },
    },
    datasets: {
      bar: {
        barPercentage: 0.5,
        borderRadius: { topLeft: 10, topRight: 10, bottomLeft: 0, bottomRight: 0 },
      },
    },
  };

  const chartOptionsVertical: ChartOptions<'bar'> = {
    indexAxis: 'y' as const,
    responsive: true,
    scales: {
      x: {
        grid: {
          display: false,
          drawTicks: false,
          drawBorder: false,
        },
        ticks: {
          padding: 10,
        },
      },
      y: {
        grid: {
          display: false,
          drawTicks: false,
          drawBorder: false,
        },
        ticks: {
          padding: 10,
        },
      },
    },
    datasets: {
      bar: {
        barPercentage: 0.5,
        borderRadius: { topLeft: 10, topRight: 10, bottomLeft: 0, bottomRight: 0 },
      },
    },
  };

  const chartOptionsPie: ChartOptions<'pie'> = {
    responsive: true,
    scales: {
      x: {
        grid: {
          display: false,
          drawTicks: false,
          drawBorder: false,
        },
        ticks: {
          padding: 10,
        },
      },
      y: {
        grid: {
          display: false,
          drawTicks: false,
          drawBorder: false,
        },
        ticks: {
          display: false,
        },
      },
    },
  };

  useEffect(() => {
    if (!dataPatients || !dataNurses || !dataZones || !dataCalls) return;
    console.log(dataZones);
    console.log(dataPatients);
    console.log(dataNurses);

    console.log(dataPatients.map((patient) => getAge(patient.fecha_nac)));
    console.log(dataNurses.map((nurses) => getAge(nurses.fecha_nac)));
    console.log(dataCalls.map((call) => compareMinutesAndShowDiff(call.fecha_hora_atentido, call.fecha_hora_llamada)));
    setAverageCall(getAverage(dataCalls.map((call) => compareMinutesAndShowDiff(call.fecha_hora_atentido, call.fecha_hora_llamada))).toFixed(2));
  }, [dataZones, dataPatients, dataNurses, dataCalls]);

  useEffect(() => {
    if (!dataPatients || !dataNurses) return;
    setDataChart({
      labels: ['Pacientes', 'Enfermeros'],
      datasets: [
        {
          label: 'Masculino',
          data: [dataPatients.filter((patient) => patient.sexo === 'Masculino').length, dataNurses.filter((nurse) => nurse.sexo === 'Masculino').length],
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
        },
        {
          label: 'Femenino',
          data: [dataPatients.filter((patient) => patient.sexo === 'Femenino').length, dataNurses.filter((nurse) => nurse.sexo === 'Femenino').length],
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
        },
      ],
    });
    setDataChartNurseState({
      labels: nurseState,
      datasets: [
        {
          label: 'Estado',
          data: nurseState.map((state) => dataNurses.filter((nurse) => nurseState[nurse.estado] === state).length),
          backgroundColor: ['rgba(255, 99, 132, 0.5)', 'rgba(53, 162, 235, 0.5)', 'rgba(255, 205, 86, 0.5)'],
        },
      ],
    });
    setDataChartAgePatients({
      labels: ['Pacientes', 'Enfermeros'],
      datasets: [
        {
          label: 'Masculino',
          data: [parseInt(getAverage(dataPatients.filter((patient) => patient.sexo === 'Masculino').map((patient) => getAge(patient.fecha_nac))).toFixed(2)), parseInt(getAverage(dataNurses.filter((nurse) => nurse.sexo === 'Masculino').map((nurse) => getAge(nurse.fecha_nac))).toFixed(2))],
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
        },
        {
          label: 'Femenino',
          data: [parseInt(getAverage(dataPatients.filter((patient) => patient.sexo === 'Femenino').map((patient) => getAge(patient.fecha_nac))).toFixed(2)), parseInt(getAverage(dataNurses.filter((nurse) => nurse.sexo === 'Femenino').map((nurse) => getAge(nurse.fecha_nac))).toFixed(2))],
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
        },
      ],
    });
  }, [dataPatients, dataNurses]);

  useEffect(() => {
    if (!dataZones || !dataCalls) return;
    setDataChartZonesState({
      labels: zoneStates,
      datasets: [
        {
          label: 'Estado',
          data: zoneStates.map((state) => dataZones.filter((zone) => zoneStates[zone.estado] === state).length),
          backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)'],
        },
      ],
    });
    setDataChartZonesFormaLlamada({
      labels: ['Normal', 'Emergencia'],
      datasets: [
        {
          label: 'Forma de Llamada',
          data: [dataCalls.filter((call) => call.tipo === 'Normal').length, dataCalls.filter((call) => call.tipo === 'Emergencia').length],
          backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)'],
        },
      ],
    });
  }, [dataCalls, dataZones]);

  return (
    <MainContainer>
      <HStack p='0.75rem' spacing='1rem'>
        <Heading as='h2' size='lg'>
          Reports
        </Heading>
        <Button w='min' colorScheme='blue' variant='ghost' bg='white' rounded='lg' shadow='md'>
          Export
        </Button>
      </HStack>
      <Grid h='auto' w='full' templateColumns='repeat(6, 1fr)' templateRows='auto' gap='2rem'>
        <GridItem rowSpan={1} colSpan={3} bg='white' p='0.75rem' rounded='lg'>
          <Flex direction='column' gap='1rem' h='full' p='1rem'>
            <Heading as='h3' size='md'>
              Genero
            </Heading>
            {dataChart && Object.keys(dataChart).length > 0 ? <BarChartChakra options={chartOptions} data={dataChart} /> : null}
          </Flex>
        </GridItem>
        <GridItem rowSpan={1} colSpan={3} bg='white' p='0.75rem' rounded='lg'>
          <Flex direction='column' gap='1rem' h='full' align='flex-start' p='1rem'>
            <Heading as='h3' size='md'>
              Tiempo promedio en respuesta de llamadas
            </Heading>
            <Text fontWeight='bold' fontSize='4xl'>
              {averageCall}min
            </Text>
          </Flex>
        </GridItem>
        <GridItem rowSpan={1} colSpan={3} bg='white' p='0.75rem' rounded='lg'>
          <Flex direction='column' gap='1rem' h='full' p='1rem'>
            <Heading as='h3' size='md'>
              Estado de zonas
            </Heading>
            {dataChartZonesState && Object.keys(dataChartZonesState).length > 0 ? <PieChartChakra options={chartOptionsPie} data={dataChartZonesState} /> : null}
          </Flex>
        </GridItem>
        <GridItem rowSpan={1} colSpan={3} bg='white' p='0.75rem' rounded='lg'>
          <Flex direction='column' gap='1rem' h='full' p='1rem'>
            <Heading as='h3' size='md'>
              Forma de llamada
            </Heading>
            {dataChartZonesFormaLlamada && Object.keys(dataChartZonesFormaLlamada).length > 0 ? <PieChartChakra options={chartOptionsPie} data={dataChartZonesFormaLlamada} /> : null}
          </Flex>
        </GridItem>
        <GridItem rowSpan={1} colSpan={6} bg='white' p='0.75rem' rounded='lg'>
          <Flex direction='column' gap='1rem' h='full' p='1rem'>
            <Heading as='h3' size='md'>
              Promedio de edad
            </Heading>
            {dataChartAgePatients && Object.keys(dataChartAgePatients).length > 0 ? <BarChartChakra options={chartOptionsVertical} data={dataChartAgePatients} /> : null}
          </Flex>
        </GridItem>
        <GridItem rowSpan={1} colSpan={3} bg='white' p='0.75rem' rounded='lg'>
          <Flex direction='column' gap='1rem' h='full' p='1rem'>
            <Heading as='h3' size='md'>
              Estado de Medicos
            </Heading>
            {dataChartNurseState && Object.keys(dataChartNurseState).length > 0 ? <PieChartChakra options={chartOptionsPie} data={dataChartNurseState} /> : null}
          </Flex>
        </GridItem>
      </Grid>
    </MainContainer>
  );
};

// This gets called on every request
export const getServerSideProps: GetServerSideProps<{ dataZones: Zones[]; dataNurses: Nurses[]; dataPatients: Patients[]; dataCalls: Call[] }> = async (context: GetServerSidePropsContext) => {
  try {
    const { req, res } = context;
    const session = await unstable_getServerSession(req, res, authOptions);

    if (!session) {
      return {
        redirect: {
          destination: '/login',
          permanent: false,
        },
      };
    }

    // Fetch data from external API
    const resZonas = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/zonas`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });

    const dataZones: Zones[] = await resZonas.data;

    // Fetch data from external API
    const resNurses = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/enfermeros`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });

    const dataNurses: Nurses[] = await resNurses.data;

    // Fetch data from external API
    const resPatients = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/pacientes`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });

    const dataPatients: Patients[] = await resPatients.data;

    // Fetch data from external API
    const resCalls = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/llamadas`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });

    const dataCalls: Call[] = await resCalls.data;

    // Pass data to the page via props
    return { props: { dataZones, dataNurses, dataPatients, dataCalls } };
  } catch (e: any) {
    return { props: { dataZones: [] as Zones[], dataNurses: [] as Nurses[], dataPatients: [] as Patients[], dataCalls: [] as Call[] } };
  }
};

export default Reports;
