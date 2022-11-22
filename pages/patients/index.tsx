/* eslint-disable react/no-children-prop */
import { Heading, HStack, IconButton, Flex, Text, Divider, Badge, Button, ButtonGroup, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, Input, InputGroup, InputLeftElement, Select } from '@chakra-ui/react';
import type { GetServerSideProps, GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import { MainContainer } from '../../components/layouts/MainContainer';
import { IoMdAdd } from 'react-icons/io';
import { useRouter } from 'next/router';
import axios, { AxiosError } from 'axios';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { BiSearch } from 'react-icons/bi';
import { formatDatetimeToHuman, formatDateToHuman } from '../../lib/date';
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import ObjectsToCsv from '../../lib/objectToCsv';
import { saveAs } from 'file-saver';

export type Antecedente = {
  id_antecedente: number;
  dni_paciente: number;
  motivo: string;
  diagnostico: string;
  tratamiento: string;
  medicacion: string;
  fecha: string;
};

export type Patients = {
  dni_paciente: number;
  nombre: string;
  apellido: string;
  fecha_nac: string;
  sexo: string;
  telefono: string;
  fecha_hora_ingreso: string;
  fecha_hora_egreso: string;
  tipo_sangre: string;
  direccion: string;
  patologia: string;
  alergia: string;
  ultimo_antecedente: Antecedente;
};

type PatientsKeysString = {
  [key in keyof Patients]: string;
};

export type PatientsKeys = keyof PatientsKeysString;

const Patients = ({ data }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter();
  const { data: session } = useSession();
  const { t } = useTranslation(['common', 'patients']);
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [searchType, setSearchType] = useState<PatientsKeys>('nombre');
  const [pagination, setPagination] = useState<number>(0);
  const [patients, setPatients] = useState<Patients[][]>([data]);

  useEffect(() => {
    reloadPagination();
  }, [data, searchFilter, searchType, pagination]);

  const handlerAddPatient = () => {
    console.log('Add Patient');
    router.push('/patients/add');
  };

  const handlerEditPatient = (id: number) => {
    console.log('Edit Patient', id);
    router.push(`/patients/edit?id=${id}`);
  };

  const handlerDeletePatient = async (id: number) => {
    console.log('Delete Patient', id);
    const res = await axios.delete(`/api/backend/pacientes/${id}`, {
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
    const tempData = data.filter((patient) => searchFilterFunc(patient));
    let tempPaginationPatients = [];

    for (let i = 0; i < tempData.length; i += 10) {
      tempPaginationPatients.push(tempData.slice(i, i + 10));
    }

    setPatients(tempPaginationPatients);
  };

  const handlerSearchPatient = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
    setSearchFilter(e.target.value);
  };

  const handlerSearchType = (e: React.ChangeEvent<HTMLSelectElement>) => {
    console.log(e.target.value);
    setSearchType(e.target.value as PatientsKeys);
  };

  const searchFilterFunc = (patient: any) => {
    if (searchType === 'dni_paciente' || searchType === 'telefono') {
      return patient[searchType].toString().toLowerCase().startsWith(searchFilter.toLowerCase());
    } else if (searchType === 'nombre') {
      return patient.nombre.toLowerCase().startsWith(searchFilter.toLowerCase()) || patient.apellido.toLowerCase().startsWith(searchFilter.toLowerCase());
    } else if (searchType === 'tipo_sangre') {
      return patient.tipo_sangre.toLowerCase() === searchFilter.toLowerCase();
    } else {
      return patient[searchType].toString().toLowerCase().includes(searchFilter.toLowerCase());
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
    saveAs(blob, 'patients.csv');
  };

  return (
    <MainContainer>
      <HStack p='0.75rem' gap='1rem' flexWrap='wrap'>
        <Heading as='h2' size='lg'>
          {t('patients:title', { length: data?.length })}
        </Heading>
        <IconButton w='min' fontSize='20px' colorScheme='blue' variant='ghost' bg='white' rounded='lg' aria-label='Add Zone' shadow='md' icon={<IoMdAdd />} onClick={() => handlerAddPatient()} />
        <Button w='min' colorScheme='blue' variant='ghost' bg='white' rounded='lg' shadow='md' onClick={() => handlerExport()}>
          {t('common:actions.export')}
        </Button>

        <InputGroup bg='white' rounded='lg' shadow='md' flex='1'>
          <InputLeftElement pointerEvents='none' children={<BiSearch />} />
          <Input type='text' placeholder='Search' onChange={(e) => handlerSearchPatient(e)} />
        </InputGroup>

        <Select defaultValue='nombre' onChange={(e) => handlerSearchType(e)} bg='white' rounded='lg' shadow='md' flex='1'>
          <option value='nombre'>{t('patients:search-filter.name')}</option>
          <option value='dni_paciente'>{t('patients:search-filter.id_card_patient')}</option>
          <option value='fecha_nac'>{t('patients:search-filter.birth_date')}</option>
          <option value='sexo'>{t('patients:search-filter.gender')}</option>
          <option value='telefono'>{t('patients:search-filter.phone')}</option>
          <option value='tipo_sangre'>{t('patients:search-filter.blood_type')}</option>
        </Select>
      </HStack>
      <Accordion allowToggle w='full'>
        {patients[pagination] ? (
          patients[pagination].map((patient) => (
            <AccordionItem key={patient.dni_paciente} my='1rem' bg='white' rounded='lg' border='none' shadow='md'>
              <AccordionButton p='1rem'>
                <Flex direction='row' w='full' gap='0.5rem' justify='flex-start' align='center'>
                  <Heading as='h3' size='md'>
                    {patient.nombre} {patient.apellido}
                  </Heading>
                  <Text fontSize='sm'>{patient.dni_paciente}</Text>
                </Flex>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4}>
                <Flex direction='column' gap={4}>
                  <Divider />
                  <Flex direction='row' w='full' h='full' gap='0.5rem'>
                    <Flex direction='column' w='full' gap='0.5rem' flex='1'>
                      <Text fontSize='md' fontWeight='bold'>
                        {t('patients:item.phone')}
                      </Text>
                      <Text fontSize='md'>{patient.telefono}</Text>
                    </Flex>
                    <Flex direction='column' w='full' gap='0.5rem' flex='1'>
                      <Text fontSize='md' fontWeight='bold'>
                        {t('patients:item.gender')}
                      </Text>
                      <Text fontSize='md'>{patient.sexo}</Text>
                    </Flex>
                  </Flex>
                  <Divider />
                  <Flex direction='row' w='full' gap='0.5rem'>
                    <Flex direction='column' w='full' gap='0.5rem' flex='1'>
                      <Text fontSize='md' fontWeight='bold'>
                        {t('patients:item.birth_date')}
                      </Text>
                      <Text fontSize='md'>{formatDateToHuman(patient.fecha_nac)}</Text>
                    </Flex>
                    <Flex direction='column' w='full' gap='0.5rem' flex='1'>
                      <Text fontSize='md' fontWeight='bold'>
                        {t('patients:item.address')}
                      </Text>
                      <Text fontSize='md'>{patient.direccion}</Text>
                    </Flex>
                  </Flex>
                  <Divider />
                  <Flex direction='row' w='full' gap='0.5rem'>
                    <Flex direction='column' w='full' gap='0.5rem' flex='1'>
                      <Text fontSize='md' fontWeight='bold'>
                        {t('patients:item.pathologies')}
                      </Text>
                      <Text fontSize='md'>{patient.patologia ? patient.patologia : 'Sin patologias registradas'}</Text>
                    </Flex>
                    <Flex direction='column' w='full' gap='0.5rem' flex='1'>
                      <Text fontSize='md' fontWeight='bold'>
                        {t('patients:item.allergies')}
                      </Text>
                      <Text fontSize='md'>{patient.alergia ? patient.alergia : 'Sin alergias registradas'}</Text>
                    </Flex>
                  </Flex>
                  <Divider />
                  {patient.ultimo_antecedente ? (
                    <>
                      <Flex direction='column' w='full' gap='0.5rem' flex='1'>
                        <Text fontSize='md' fontWeight='bold'>
                          {t('patients:antecedent_item.last_antecedent')}
                        </Text>
                        <Flex direction='row' w='full' gap='0.5rem'>
                          <Flex direction='column' w='full' gap='0.5rem' flex='1'>
                            <Text fontSize='md' fontWeight='bold'>
                              {t('patients:antecedent_item.date')}
                            </Text>
                            <Text fontSize='md'>{patient.ultimo_antecedente.fecha}</Text>
                          </Flex>
                          <Flex direction='column' w='full' gap='0.5rem' flex='1'>
                            <Text fontSize='md' fontWeight='bold'>
                              {t('patients:antecedent_item.reason')}
                            </Text>
                            <Text fontSize='md'>{patient.ultimo_antecedente.motivo}</Text>
                          </Flex>
                          <Flex direction='column' w='full' gap='0.5rem' flex='1'>
                            <Text fontSize='md' fontWeight='bold'>
                              {t('patients:antecedent_item.diagnosis')}
                            </Text>
                            <Text fontSize='md'>{patient.ultimo_antecedente.diagnostico}</Text>
                          </Flex>
                        </Flex>
                      </Flex>
                      <Divider />
                    </>
                  ) : null}
                  <Flex direction='row' w='full' gap='0.5rem' justify='space-between'>
                    <Badge colorScheme='blue' mr='0.5rem'>
                      {t('patients:item.date_entry', { date: formatDatetimeToHuman(patient.fecha_hora_ingreso) })}
                    </Badge>
                    {patient.fecha_hora_egreso ? (
                      <Badge colorScheme='green' mr='0.5rem'>
                        {t('patients:item.date_exit', { date: formatDatetimeToHuman(patient.fecha_hora_egreso) })}
                      </Badge>
                    ) : null}
                  </Flex>
                  <Divider />
                  <ButtonGroup isAttached variant='outline' colorScheme='blue' size='md' w='full'>
                    {/* <Button w='full' onClick={() => handlerViewPatient(patient.dni_paciente)}>
                      View
                    </Button> */}
                    <Button w='full' onClick={() => handlerEditPatient(patient.dni_paciente)}>
                      {t('common:actions.edit')}
                    </Button>
                    <Button w='full' onClick={() => handlerDeletePatient(patient.dni_paciente)}>
                      {t('common:actions.delete')}
                    </Button>
                  </ButtonGroup>
                </Flex>
              </AccordionPanel>
            </AccordionItem>
          ))
        ) : (
          <Flex direction='column' w='full' justify='center' align='center' py='4rem' px='2rem' bg='white' rounded='lg' shadow='md'>
            <Text fontSize='lg' fontWeight='bold' textTransform='uppercase'>
              {t('patients:not_found')}
            </Text>
          </Flex>
        )}
      </Accordion>
      <ButtonGroup shadow='md' size='sm' isAttached variant='outline' w='full' colorScheme='blue' bg='white' rounded='lg'>
        <Button w='full' onClick={(e) => handlerPagination(e)} value='prev' disabled={pagination === 0 || !patients[pagination]}>
          {t('common:actions.previous')}
        </Button>
        <Button w='full' onClick={(e) => handlerPagination(e)} value='next' disabled={pagination === patients.length - 1 || !patients[pagination]}>
          {t('common:actions.next')}
        </Button>
      </ButtonGroup>
    </MainContainer>
  );
};

// This gets called on every request
export const getServerSideProps: GetServerSideProps<{ data: Patients[] }> = async (context: GetServerSidePropsContext) => {
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
    const resNurses = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/pacientes`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });

    const data: Patients[] = await resNurses.data;

    // Pass data to the page via props
    return { props: { data, ...(await serverSideTranslations((locale as string) || (defaultLocale as string), ['common', 'patients'])) } };
  } catch (e: Error | AxiosError | any) {
    return { props: { data: [] as Patients[], ...(await serverSideTranslations((locale as string) || (defaultLocale as string), ['common', 'patients'])) } };
  }
};

export default Patients;
