/* eslint-disable react/no-children-prop */
import { Heading, HStack, IconButton, Flex, Text, Divider, Badge, Button, ButtonGroup, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, Input, InputGroup, InputLeftElement, Select } from '@chakra-ui/react';
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { MainContainer } from '../../components/layouts/MainContainer';
import { IoMdAdd } from 'react-icons/io';
import { useRouter } from 'next/router';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { BiSearch } from 'react-icons/bi';

export type Patients = {
  dni_paciente: number;
  nombre: string;
  apellido: string;
  fecha_nac: string;
  sexo: string;
  direccion: string;
  telefono: string;
  fecha_hora_ingreso: string;
  fecha_hora_egreso: string;
  tipo_sangre: string;
};

type PatientsKeysString = {
  [key in keyof Patients]: string;
};

export type PatientsKeys = keyof PatientsKeysString;

const Patients = ({ data }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter();
  const { data: session } = useSession();
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

  return (
    <MainContainer>
      <HStack p='0.75rem' spacing='1rem'>
        <Heading as='h2' size='lg'>
          Patients
        </Heading>
        <IconButton w='min' size='sm' fontSize='20px' colorScheme='blue' variant='outline' rounded='md' aria-label='Add Zone' icon={<IoMdAdd />} onClick={() => handlerAddPatient()}>
          Add Zone
        </IconButton>

        <InputGroup bg='white' rounded='lg' shadow='md'>
          <InputLeftElement pointerEvents='none' children={<BiSearch />} />
          <Input type='text' placeholder='Search' onChange={(e) => handlerSearchPatient(e)} />
        </InputGroup>

        <Select defaultValue='nombre' onChange={(e) => handlerSearchType(e)} bg='white' rounded='lg' shadow='md'>
          <option value='nombre'>Nombre</option>
          <option value='dni_paciente'>DNI</option>
          <option value='fecha_nac'>Fecha de nacimiento</option>
          <option value='sexo'>Genero</option>
          <option value='telefono'>Telefono</option>
          <option value='tipo_sangre'>Tipo de sangre</option>
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
                  <Flex direction='column' w='full' gap='0.5rem'>
                    <Text fontSize='md' fontWeight='bold'>
                      Telefono
                    </Text>
                    <Text fontSize='md'>{patient.telefono}</Text>
                  </Flex>
                  <Divider />
                  <Flex direction='column' w='full' gap='0.5rem'>
                    <Text fontSize='md' fontWeight='bold'>
                      Fecha de nacimiento
                    </Text>
                    <Text fontSize='md'>{patient.fecha_nac}</Text>
                  </Flex>
                  <Divider />
                  <Flex direction='column' w='full' gap='0.5rem'>
                    <Text fontSize='md' fontWeight='bold'>
                      Direccion
                    </Text>
                    <Text fontSize='md'>{patient.direccion}</Text>
                  </Flex>
                  <Divider />
                  <Flex direction='column' w='full' gap='0.5rem'>
                    <Text fontSize='md' fontWeight='bold'>
                      Genero
                    </Text>
                    <Text fontSize='md'>{patient.sexo}</Text>
                  </Flex>
                  <Divider />
                  <Flex direction='row' w='full' gap='0.5rem' justify='space-between'>
                    <Badge colorScheme='blue' mr='0.5rem'>
                      Fecha de ingreso: {patient.fecha_hora_ingreso}
                    </Badge>
                    {patient.fecha_hora_egreso ? (
                      <Badge colorScheme='green' mr='0.5rem'>
                        Fecha de egreso: {patient.fecha_hora_egreso}
                      </Badge>
                    ) : null}
                  </Flex>
                  <Divider />
                  <ButtonGroup isAttached variant='outline' colorScheme='blue' size='md' w='full'>
                    <Button w='full' onClick={() => handlerEditPatient(patient.dni_paciente)}>
                      Edit
                    </Button>
                    <Button w='full' onClick={() => handlerDeletePatient(patient.dni_paciente)}>
                      Delete
                    </Button>
                  </ButtonGroup>
                </Flex>
              </AccordionPanel>
            </AccordionItem>
          ))
        ) : (
          <Flex direction='column' w='full' justify='center' align='center' py='4rem' px='2rem' bg='white' rounded='lg' shadow='md'>
            <Text fontSize='lg' fontWeight='bold' textTransform='uppercase'>
              No se encontraron pacientes
            </Text>
          </Flex>
        )}
      </Accordion>
      <ButtonGroup shadow='md' size='sm' isAttached variant='outline' w='full' colorScheme='blue' bg='white' rounded='lg'>
        <Button w='full' onClick={(e) => handlerPagination(e)} value='prev' disabled={pagination === 0 || !patients[pagination]}>
          Prev
        </Button>
        <Button w='full' onClick={(e) => handlerPagination(e)} value='next' disabled={pagination === patients.length - 1 || !patients[pagination]}>
          Next
        </Button>
      </ButtonGroup>
    </MainContainer>
  );
};

// This gets called on every request
export const getServerSideProps: GetServerSideProps<{ data: Array<Patients> }> = async () => {
  // Fetch data from external API
  const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/pacientes`);
  const data: Array<Patients> = await res.data;

  // Pass data to the page via props
  return { props: { data } };
};

export default Patients;
