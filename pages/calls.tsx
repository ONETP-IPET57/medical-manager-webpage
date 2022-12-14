/* eslint-disable react/no-children-prop */
import { Badge, Divider, Flex, Grid, GridItem, Heading, HStack, Input, InputGroup, InputLeftElement, Select, Text, ButtonGroup, Button } from '@chakra-ui/react';
import type { GetServerSideProps, GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import { MainContainer } from '../components/layouts/MainContainer';
import axios, { AxiosError } from 'axios';
import { BiSearch } from 'react-icons/bi';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]';
import { formatDatetimeToHuman } from '../lib/date';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import ObjectsToCsv from '../lib/objectToCsv';
import { saveAs } from 'file-saver';

export type Call = {
  id_llamada: number;
  tipo: string;
  fecha_hora_llamada: string;
  fecha_hora_atentido: string;
  origen_llamada: string;
  dni_paciente: number;
  id_zona: number;
  nombre_paciente: string;
  apellido_paciente: string;
  nombre_zona: string;
  numero_zona: number;
};

type CallKeysString = {
  [key in keyof Call]: string;
};

export type CallKeys = keyof CallKeysString;

const Calls = ({ data }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const { data: session } = useSession();
  const { t } = useTranslation(['common', 'calls']);
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [searchType, setSearchType] = useState<CallKeys>('id_llamada');
  const [pagination, setPagination] = useState<number>(0);
  const [calls, setCalls] = useState<Call[][]>([data]);

  useEffect(() => {
    reloadPagination();
    console.log(data);
  }, [data, searchFilter, searchType, pagination]);

  const handlerSearchCall = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
    setSearchFilter(e.target.value);
  };

  const handlerSearchType = (e: React.ChangeEvent<HTMLSelectElement>) => {
    console.log(e.target.value);
    setSearchType(e.target.value as CallKeys);
  };

  const reloadPagination = () => {
    const tempData = data.filter((call) => searchFilterFunc(call));
    let tempPaginationData = [];

    for (let i = 0; i < tempData.length; i += 4) {
      tempPaginationData.push(tempData.slice(i, i + 4));
    }

    setCalls(tempPaginationData);
  };

  const searchFilterFunc = (call: any) => {
    if (searchType === 'tipo' || searchType === 'origen_llamada' || searchType === 'id_llamada') {
      return call[searchType].toString().toLowerCase().startsWith(searchFilter.toLowerCase());
    } else if (searchType === 'nombre_paciente') {
      return call.nombre_paciente.toLowerCase().startsWith(searchFilter.toLowerCase()) || call.apellido_paciente.toLowerCase().startsWith(searchFilter.toLowerCase());
    } else if (searchType === 'fecha_hora_atentido') {
      if (!call.fecha_hora_atendido) {
        if (searchFilter.length > 0) {
          return 'no atendido'.startsWith(searchFilter);
        } else {
          return true;
        }
      } else {
        return call.fecha_hora_atendido.toString().toLowerCase().includes(searchFilter.toLowerCase());
      }
    } else {
      return call[searchType].toString().toLowerCase().includes(searchFilter.toLowerCase());
    }
  };

  const handlerPagination = (e: React.MouseEvent<HTMLButtonElement>) => {
    const { value } = e.currentTarget;
    if (value === 'next') {
      setPagination(pagination + 1);
    } else if (value === 'prev') {
      setPagination(pagination - 1);
    }
  };

  const handlerExport = async () => {
    console.log('Export');
    const csvFromObject = new ObjectsToCsv(data);
    var blob = new Blob([await csvFromObject.toString()], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, 'calls.csv');
  };

  return (
    <MainContainer>
      <HStack p='0.75rem' gap='1rem' flexWrap='wrap'>
        <Heading as='h2' size='lg'>
          {t('calls:title', { length: data?.length })}
        </Heading>
        <Button w='min' colorScheme='blue' variant='ghost' bg='white' rounded='lg' shadow='md' onClick={() => handlerExport()}>
          {t('common:actions.export')}
        </Button>

        <InputGroup bg='white' rounded='lg' shadow='md' flex='1'>
          <InputLeftElement pointerEvents='none' children={<BiSearch />} />
          <Input type='text' placeholder='Search' onChange={(e) => handlerSearchCall(e)} />
        </InputGroup>

        <Select defaultValue='nombre' onChange={(e) => handlerSearchType(e)} bg='white' rounded='lg' shadow='md' flex='1'>
          <option value='id_llamada'>{t('calls:search-filter.id_call')}</option>
          <option value='tipo'>{t('calls:search-filter.type')}</option>
          <option value='fecha_hora_llamada'>{t('calls:search-filter.datetime_call')}</option>
          <option value='fecha_hora_atendido'>{t('calls:search-filter.datetime_answer')}</option>
          <option value='origen_llamada'>{t('calls:search-filter.origin')}</option>
          <option value='nombre_zona'>{t('calls:search-filter.zone_name')}</option>
          <option value='nombre_paciente'>{t('calls:search-filter.patient_name')}</option>
        </Select>
      </HStack>
      <Grid h='auto' w='full' templateColumns={{ base: 'auto', md: 'repeat(6, 1fr)' }} templateRows='auto' gap='2rem'>
        {calls[pagination] ? (
          calls[pagination]
            /* .map((call) => {
            return {
              ...call,
              estado: zoneStates[zone.estado],
            };
          }) */
            .map((call) => (
              <GridItem rowSpan={2} colSpan={3} bg='white' p='0.75rem' rounded='lg' key={call.id_llamada} shadow='md'>
                <Flex direction='column' gap='0.5rem' h='full'>
                  <Heading as='h3' size='md'>
                    {t('calls:item.id_call', { id_call: call.id_llamada })}
                  </Heading>
                  <Divider />
                  <Flex direction='column' w='full' gap='0.5rem'>
                    <Text fontSize='md' fontWeight='bold'>
                      {t('calls:item.zone')}
                    </Text>
                    <Text fontSize='md'>
                      {call.nombre_zona} - {call.numero_zona}
                    </Text>
                  </Flex>
                  <Divider />
                  <Flex direction='column' w='full' gap='0.5rem'>
                    <Text fontSize='md' fontWeight='bold'>
                      {t('calls:item.patient')}
                    </Text>
                    <Text fontSize='md'>
                      {call.nombre_paciente} {call.apellido_paciente}
                    </Text>
                  </Flex>
                  <Divider />
                  <Flex direction='column' w='full' gap='0.5rem'>
                    <Text fontSize='md' fontWeight='bold'>
                      {t('calls:item.origin')}
                    </Text>
                    <Text fontSize='md'>{call.origen_llamada}</Text>
                  </Flex>
                  <Divider />
                  <Flex direction='column' w='full' gap='0.5rem'>
                    <Text fontSize='md' fontWeight='bold'>
                      {t('calls:item.type')}
                    </Text>
                    <Text fontSize='md'>{call.tipo}</Text>
                  </Flex>
                  <Divider />
                  <Flex direction='column' w='full' gap='0.5rem' justify='space-between'>
                    <Badge colorScheme='blue' mr='0.5rem'>
                      {t('calls:item.datetime_call', { datetime_call: formatDatetimeToHuman(call.fecha_hora_llamada) })}
                    </Badge>
                    <Badge colorScheme='green' mr='0.5rem'>
                      {call.fecha_hora_atentido ? t('calls:item.datetime_answer', { datetime_answer: formatDatetimeToHuman(call.fecha_hora_atentido) }) : t('calls:item.not_answer')}
                    </Badge>
                  </Flex>
                  <Divider />
                </Flex>
              </GridItem>
            ))
        ) : (
          <GridItem colSpan={6} rowSpan={1} bg='white' rounded='lg' shadow='md'>
            <Flex direction='column' justify='center' align='center' py='4rem' px='2rem'>
              <Text fontSize='lg' fontWeight='bold' textTransform='uppercase'>
                {t('patients:not_found')}
              </Text>
            </Flex>
          </GridItem>
        )}
      </Grid>
      <ButtonGroup shadow='md' size='sm' isAttached variant='outline' w='full' colorScheme='blue' bg='white' rounded='lg'>
        <Button w='full' onClick={(e) => handlerPagination(e)} value='prev' disabled={pagination === 0 || !calls[pagination]}>
          {t('common:actions.previous')}
        </Button>
        <Button w='full' onClick={(e) => handlerPagination(e)} value='next' disabled={pagination === calls.length - 1 || !calls[pagination]}>
          {t('common:actions.next')}
        </Button>
      </ButtonGroup>
    </MainContainer>
  );
};

// This gets called on every request
export const getServerSideProps: GetServerSideProps<{ data: Call[] }> = async (context: GetServerSidePropsContext) => {
  const { locale, defaultLocale } = context;
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
    const resLlamadas = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/llamadas`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });

    const data: Call[] = await resLlamadas.data;

    console.log(data);

    // Pass data to the page via props
    return { props: { data, ...(await serverSideTranslations((locale as string) || (defaultLocale as string), ['common', 'calls'])) } };
  } catch (e: Error | AxiosError | any) {
    return { props: { data: [] as Call[], ...(await serverSideTranslations((locale as string) || (defaultLocale as string), ['common', 'calls'])) } };
  }
};

export default Calls;
