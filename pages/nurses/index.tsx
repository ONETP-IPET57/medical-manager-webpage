/* eslint-disable react/no-children-prop */
import { Heading, HStack, IconButton, Grid, GridItem, Flex, Text, Divider, Badge, Button, ButtonGroup, Input, InputGroup, InputLeftElement, Select } from '@chakra-ui/react';
import type { GetServerSideProps, GetServerSidePropsContext, InferGetServerSidePropsType, Redirect } from 'next';
import { MainContainer } from '../../components/layouts/MainContainer';
import { IoMdAdd } from 'react-icons/io';
import { useRouter } from 'next/router';
import axios, { AxiosError } from 'axios';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { BiSearch } from 'react-icons/bi';
import { formatDateToHuman } from '../../lib/date';
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import ObjectsToCsv from '../../lib/objectToCsv';
import { saveAs } from 'file-saver';

export type Nurses = {
  dni_enfermero: number;
  nombre: string;
  apellido: string;
  sexo: string;
  telefono: string;
  fecha_nac: string;
  estado: number;
};

type NursesKeysString = {
  [key in keyof Nurses]: string;
};

export type NursesKeys = keyof NursesKeysString;

export const nurseState = ['inactive', 'available', 'busy'];

const Nurses = ({ data }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter();
  const { data: session } = useSession();
  const { t } = useTranslation(['common', 'nurses']);
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [searchType, setSearchType] = useState<NursesKeys>('nombre');
  const [pagination, setPagination] = useState<number>(0);
  const [nurses, setNurses] = useState<Nurses[][]>([data]);

  useEffect(() => {
    reloadPagination();
  }, [data, searchFilter, searchType, pagination]);

  const handlerAddNurse = () => {
    console.log('Add Nurse');
    router.push('/nurses/add');
  };

  const handlerEditNurse = (id: number) => {
    console.log('Edit Nurse', id);
    router.push(`/nurses/edit?id=${id}`);
  };

  const handlerDeleteNurse = async (id: number) => {
    console.log('Delete Patient', id);
    const res = await axios.delete(`/api/backend/enfermeros/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        accept: '*/*',
        Authorization: `Bearer ${session?.accessToken}`,
      },
    });
    if (res.status === 200) {
      router.reload();
    }
  };

  const reloadPagination = () => {
    const tempData = data.filter((nurse) => searchFilterFunc(nurse));

    let tempPaginationData = [];

    for (let i = 0; i < tempData.length; i += 6) {
      tempPaginationData.push(tempData.slice(i, i + 6));
    }

    setNurses(tempPaginationData);
  };

  const handlerSearchNurses = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
    setSearchFilter(e.target.value);
  };

  const handlerSearchType = (e: React.ChangeEvent<HTMLSelectElement>) => {
    console.log(e.target.value);
    setSearchType(e.target.value as NursesKeys);
  };

  const searchFilterFunc = (nurse: any) => {
    if (searchType === 'dni_enfermero' || searchType === 'telefono') {
      return nurse[searchType].toString().toLowerCase().startsWith(searchFilter.toLowerCase());
    } else if (searchType === 'nombre') {
      return nurse.nombre.toLowerCase().startsWith(searchFilter.toLowerCase()) || nurse.apellido.toLowerCase().startsWith(searchFilter.toLowerCase());
    } else {
      return nurse[searchType].toString().toLowerCase().includes(searchFilter.toLowerCase());
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
    saveAs(blob, 'nurses.csv');
  };

  return (
    <MainContainer>
      <HStack p='0.75rem' gap='1rem' flexWrap='wrap'>
        <Heading as='h2' size='lg'>
          {t('nurses:title', { length: data?.length })}
        </Heading>
        <IconButton w='min' fontSize='20px' colorScheme='blue' variant='ghost' bg='white' rounded='lg' aria-label='Add Zone' shadow='md' icon={<IoMdAdd />} onClick={() => handlerAddNurse()} />
        <Button w='min' colorScheme='blue' variant='ghost' bg='white' rounded='lg' shadow='md' onClick={() => handlerExport()}>
          {t('common:actions.export')}
        </Button>

        <InputGroup bg='white' rounded='lg' shadow='md' flex='1'>
          <InputLeftElement pointerEvents='none' children={<BiSearch />} />
          <Input type='text' placeholder='Search' onChange={(e) => handlerSearchNurses(e)} />
        </InputGroup>

        <Select defaultValue='nombre' onChange={(e) => handlerSearchType(e)} bg='white' rounded='lg' shadow='md' flex='1'>
          <option value='nombre'>{t('nurses:search-filter.name')}</option>
          <option value='dni_enfermero'>{t('nurses:search-filter.id_card_nurse')}</option>
          <option value='fecha_nac'>{t('nurses:search-filter.birth_date')}</option>
          <option value='sexo'>{t('nurses:search-filter.gender')}</option>
          <option value='telefono'>{t('nurses:search-filter.phone')}</option>
        </Select>
      </HStack>
      <Grid h='auto' w='full' templateColumns={{ base: 'auto', md: 'repeat(6, 1fr)' }} templateRows='auto' gap='2rem'>
        {nurses[pagination] ? (
          nurses[pagination]
            .map((nurse) => {
              return {
                ...nurse,
                estado: t(`nurses:item.status_options.${nurseState[nurse.estado]}`),
              };
            })
            .map((nurse) => (
              <GridItem key={nurse.dni_enfermero} colSpan={3} rowSpan={1} bg='white' rounded='lg' shadow='md'>
                <Flex w='full' h='full' p='0.75rem' gap='0.5rem' direction='column' justify='space-between'>
                  <Flex direction='column' justify='flex-start' align='flex-start' gap='0.5rem'>
                    <Flex direction='row' w='full' gap='0.5rem' justify='flex-start' align='center'>
                      <Heading as='h3' size='md'>
                        {nurse.nombre} {nurse.apellido}
                      </Heading>
                      <Text fontSize='sm'>{nurse.dni_enfermero}</Text>
                    </Flex>
                    {/* <Text fontSize='sm' fontWeight='normal'>
                  {nurse.email}
                </Text> */}
                    <Divider />
                    <Flex direction='row' w='full' gap='0.5rem'>
                      <Flex direction='column' w='full' gap='0.5rem'>
                        <Text fontSize='md' fontWeight='bold'>
                          {t('nurses:item.status')}
                        </Text>
                        <Text fontSize='md'>{nurse.estado}</Text>
                      </Flex>
                      <Flex direction='column' w='full' gap='0.5rem'>
                        <Text fontSize='md' fontWeight='bold'>
                          {t('nurses:item.birth_date')}
                        </Text>
                        <Text fontSize='md'>{formatDateToHuman(nurse.fecha_nac)}</Text>
                      </Flex>
                    </Flex>
                    <Divider />
                    <Flex direction='row' w='full' gap='0.5rem'>
                      <Flex direction='column' w='full' gap='0.5rem'>
                        <Text fontSize='md' fontWeight='bold'>
                          {t('nurses:item.phone')}
                        </Text>
                        <Text fontSize='md'>{nurse.telefono}</Text>
                      </Flex>
                      <Flex direction='column' w='full' gap='0.5rem'>
                        <Text fontSize='md' fontWeight='bold'>
                          {t('nurses:item.gender')}
                        </Text>
                        <Text fontSize='md'>{nurse.sexo}</Text>
                      </Flex>
                    </Flex>
                    <Divider />
                  </Flex>
                  <Divider />
                  <ButtonGroup w='full' isAttached size='sm' variant='outline'>
                    <Button w='full' colorScheme='blue' onClick={() => handlerEditNurse(nurse.dni_enfermero)}>
                      {t('common:actions.edit')}
                    </Button>
                    <Button w='full' colorScheme='blue' onClick={() => handlerDeleteNurse(nurse.dni_enfermero)}>
                      {t('common:actions.delete')}
                    </Button>
                  </ButtonGroup>
                </Flex>
              </GridItem>
            ))
        ) : (
          <GridItem colSpan={6} rowSpan={1} bg='white' rounded='lg' shadow='md'>
            <Flex direction='column' justify='center' align='center' py='4rem' px='2rem'>
              <Text fontSize='lg' fontWeight='bold' textTransform='uppercase'>
                {t('nurses:not_found')}
              </Text>
            </Flex>
          </GridItem>
        )}
      </Grid>
      <ButtonGroup shadow='md' size='sm' isAttached variant='outline' w='full' colorScheme='blue' bg='white' rounded='lg'>
        <Button w='full' onClick={(e) => handlerPagination(e)} value='prev' disabled={pagination === 0 || !nurses[pagination]}>
          {t('common:actions.previous')}
        </Button>
        <Button w='full' onClick={(e) => handlerPagination(e)} value='next' disabled={pagination === nurses.length - 1 || !nurses[pagination]}>
          {t('common:actions.next')}
        </Button>
      </ButtonGroup>
    </MainContainer>
  );
};

// This gets called on every request
export const getServerSideProps: GetServerSideProps<{ data: Nurses[] }> = async (context: GetServerSidePropsContext) => {
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
    const resNurses = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/enfermeros`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });

    const data: Nurses[] = await resNurses.data;

    // Pass data to the page via props
    return { props: { data, ...(await serverSideTranslations((locale as string) || (defaultLocale as string), ['common', 'nurses'])) } };
  } catch (e: Error | AxiosError | any) {
    return { props: { data: [] as Nurses[], ...(await serverSideTranslations((locale as string) || (defaultLocale as string), ['common', 'nurses'])) } };
  }
};

export default Nurses;
