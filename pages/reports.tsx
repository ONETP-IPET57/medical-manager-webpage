import { Flex, Grid, GridItem, Heading, HStack } from '@chakra-ui/react';
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { MainContainer } from '../components/layouts/MainContainer';
import { Nurses } from './nurses';
import { Patients } from './patients';
import { Zones } from './zones';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { BarChartChakra } from '../components/ChartsChakra';
import type { ChartData, ChartOptions } from 'chart.js';
import { getAge } from '../lib/date';

const Reports = ({ dataZones, dataNurses, dataPatients }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const [dataChart, setDataChart] = useState<ChartData<'bar'> | undefined>(undefined);
  const [dataChartAgePatients, setDataChartAgePatients] = useState<ChartData<'line'> | undefined>(undefined);

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

  useEffect(() => {
    if (!dataPatients || !dataNurses || !dataZones) return;
    console.log(dataZones);
    console.log(dataPatients);
    console.log(dataNurses);

    console.log(dataPatients.map((patient) => getAge(patient.fecha_nac)));
    console.log(dataNurses.map((nurses) => getAge(nurses.fecha_nac)));
  }, [dataZones, dataPatients, dataNurses]);

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
  }, [dataPatients, dataNurses]);

  return (
    <MainContainer>
      <HStack p='0.75rem' spacing='1rem'>
        <Heading as='h2' size='lg'>
          Reports
        </Heading>
      </HStack>
      <Grid h='full' w='full' templateColumns='repeat(6, 1fr)' templateRows='repeat(12, 1fr)' gap='2rem'>
        <GridItem rowSpan={2} colSpan={2} bg='white' p='0.75rem' rounded='lg'>
          <Flex direction='column' gap='1rem' h='full'>
            <Heading as='h3' size='md'>
              Genero
            </Heading>
            {dataChart && Object.keys(dataChart).length > 0 ? <BarChartChakra options={chartOptions} data={dataChart} /> : null}
          </Flex>
        </GridItem>
      </Grid>
    </MainContainer>
  );
};

// This gets called on every request
export const getServerSideProps: GetServerSideProps<{ dataZones: Array<Zones> | null; dataNurses: Array<Nurses> | null; dataPatients: Array<Patients> | null }> = async (context: any) => {
  try {
    // Fetch data from external API
    const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/zonas`);

    const dataZones: Array<Zones> = await res.data;

    // Fetch data from external API
    const resNurses = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/enfermeros`);

    const dataNurses: Array<Nurses> = await resNurses.data;

    // Fetch data from external API
    const resPatients = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/pacientes`);

    const dataPatients: Array<Patients> = await resPatients.data;

    // Pass data to the page via props
    return { props: { dataZones, dataNurses, dataPatients } };
  } catch (e: any) {
    return { props: { dataZones: null, dataNurses: null, dataPatients: null } };
  }
};

export default Reports;
