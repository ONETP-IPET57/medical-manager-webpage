/* eslint-disable react/no-children-prop */
import { Badge, Button, ButtonGroup, Divider, Flex, Grid, GridItem, Heading, HStack, Icon, IconButton, Input, InputGroup, InputLeftElement, Select, Text } from '@chakra-ui/react';
import type { GetServerSideProps, GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import { MainContainer } from '../../components/layouts/MainContainer';
import { IoMdAdd } from 'react-icons/io';
import { useRouter } from 'next/router';
import axios, { AxiosError } from 'axios';
import { useSession } from 'next-auth/react';
import { BiSearch } from 'react-icons/bi';
import { useEffect, useState } from 'react';
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]';

export type Zones = {
  id_zona: number;
  nombre: string;
  numero: number;
  id_forma_llamada: number;
  'dni_enfermero': number;
  dni_paciente: number;
  descripcion: string;
  estado: number;
  nombre_paciente: string;
  apellido_paciente: string;
  nombre_enfermero: string;
  apellido_enfermero: string;
  id_llamada: number;
};

type ZonesKeysString = {
  [key in keyof Zones]: string;
};

export type ZonesKeys = keyof ZonesKeysString;

export const zoneStates = ['Desocupada', 'Ocupada'];

const Zones = ({ data }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [searchType, setSearchType] = useState<ZonesKeys>('nombre');
  const [pagination, setPagination] = useState<number>(0);
  const [zones, setZones] = useState<Zones[][]>([data]);

  useEffect(() => {
    reloadPagination();
  }, [data, searchFilter, searchType, pagination]);

  console.log(data);

  const handlerAddZone = () => {
    console.log('Add Zone');
    router.push('/zones/add');
  };

  const handlerEditZone = (id: number) => {
    console.log('Edit Zone', id);
    router.push(`/zones/edit?id=${id}`);
  };

  const handlerDeleteZone = async (id: number) => {
    console.log('Delete Zone', id);
    const res = await axios.delete(`/api/backend/zonas/${id}`, {
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
    const tempData = data.filter((zone) => searchFilterFunc(zone));
    let tempPaginationPatients = [];

    for (let i = 0; i < tempData.length; i += 6) {
      tempPaginationPatients.push(tempData.slice(i, i + 6));
    }

    setZones(tempPaginationPatients);
  };

  const handlerSearchZone = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
    setSearchFilter(e.target.value);
  };

  const handlerSearchType = (e: React.ChangeEvent<HTMLSelectElement>) => {
    console.log(e.target.value);
    setSearchType(e.target.value as ZonesKeys);
  };

  const searchFilterFunc = (zone: any) => {
    if (searchType === 'estado') {
      return zone[searchType].toString().toLowerCase().startsWith(searchFilter.toLowerCase());
    } else if (searchType === 'nombre_paciente') {
      return zone.nombre_paciente.toLowerCase().startsWith(searchFilter.toLowerCase()) || zone.apellido_paciente.toLowerCase().startsWith(searchFilter.toLowerCase());
    } else if (searchType === 'nombre_enfermero') {
      return zone.nombre_enfermero.toLowerCase().startsWith(searchFilter.toLowerCase()) || zone.apellido_enfermero.toLowerCase().startsWith(searchFilter.toLowerCase());
    } else {
      return zone[searchType].toString().toLowerCase().includes(searchFilter.toLowerCase());
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
      <HStack p='0.75rem' gap='1rem' flexWrap='wrap'>
        <Heading as='h2' size='lg' textShadow='md'>
          Zones: {data?.length}
        </Heading>
        <IconButton w='min' fontSize='20px' colorScheme='blue' variant='ghost' bg='white' rounded='lg' aria-label='Add Zone' shadow='md' icon={<IoMdAdd />} onClick={() => handlerAddZone()} />
        <Button w='min' colorScheme='blue' variant='ghost' bg='white' rounded='lg' shadow='md'>
          Export
        </Button>

        <InputGroup bg='white' rounded='lg' shadow='md' flex='1'>
          <InputLeftElement pointerEvents='none' children={<BiSearch />} />
          <Input type='text' placeholder='Search' onChange={(e) => handlerSearchZone(e)} />
        </InputGroup>

        <Select defaultValue='nombre' onChange={(e) => handlerSearchType(e)} bg='white' rounded='lg' shadow='md' flex='1'>
          <option value='nombre'>Nombre</option>
          <option value='descripcion'>Descripcion</option>
          <option value='numero'>Numero de zona</option>
          <option value='estado'>Estado</option>
          <option value='nombre_paciente'>Paciente</option>
          <option value='nombre_enfermero'>Enfermero</option>
        </Select>
      </HStack>
      <Grid h='auto' w='full' templateColumns={{ base: 'auto', md: 'repeat(6, 1fr)' }} templateRows='auto' gap='2rem'>
        {zones[pagination] ? (
          zones[pagination]
            .map((zone) => {
              return {
                ...zone,
                estado: zoneStates[zone.estado],
              };
            })
            .map((zone) => (
              <GridItem rowSpan={2} colSpan={3} bg='white' p='0.75rem' rounded='lg' key={zone.id_zona} overflow='hidden' shadow='md'>
                <Flex direction='column' gap='0.5rem' h='full'>
                  <Heading as='h3' size='md'>
                    {zone.nombre}
                  </Heading>
                  <Text size='sm' color='blackAlpha.600'>
                    {zone.descripcion}
                  </Text>
                  <Divider />
                  <Text size='sm'>Estado: {zone.estado}</Text>
                  <Divider />
                  <Text size='sm'>
                    Paciente: {zone.nombre_paciente} {zone.apellido_paciente}
                  </Text>
                  <Divider />
                  <Text size='sm'>
                    Enfermero: {zone.nombre_enfermero} {zone.apellido_enfermero}
                  </Text>
                  <Divider />
                  <Flex direction='row' justifyContent='space-between' alignItems='center'>
                    {/* <Badge colorScheme={zone.status === 'active' ? 'green' : 'red'}>{zone.status}</Badge> */}
                    <Badge>Lastcall: {zone.id_llamada}</Badge>
                    <Badge>Zona Numero: {zone.numero}</Badge>
                  </Flex>
                  <Divider />
                  <ButtonGroup mt='auto' isAttached size='sm' variant='outline' w='full'>
                    <Button w='full' colorScheme='blue' onClick={() => handlerEditZone(zone.id_zona)}>
                      Edit
                    </Button>
                    <Button w='full' colorScheme='blue' onClick={() => handlerDeleteZone(zone.id_zona)}>
                      Delete
                    </Button>
                  </ButtonGroup>
                </Flex>
              </GridItem>
            ))
        ) : (
          <GridItem colSpan={6} rowSpan={1} bg='white' rounded='lg' shadow='md'>
            <Flex direction='column' justify='center' align='center' py='4rem' px='2rem'>
              <Text fontSize='lg' fontWeight='bold' textTransform='uppercase'>
                No se encontraron zonas
              </Text>
            </Flex>
          </GridItem>
        )}
      </Grid>
      <ButtonGroup shadow='md' size='sm' isAttached variant='outline' w='full' colorScheme='blue' bg='white' rounded='lg'>
        <Button w='full' onClick={(e) => handlerPagination(e)} value='prev' disabled={pagination === 0 || !zones[pagination]}>
          Prev
        </Button>
        <Button w='full' onClick={(e) => handlerPagination(e)} value='next' disabled={pagination === zones.length - 1 || !zones[pagination]}>
          Next
        </Button>
      </ButtonGroup>
    </MainContainer>
  );
};

// This gets called on every request
export const getServerSideProps: GetServerSideProps<{ data: Zones[] }> = async (context: GetServerSidePropsContext) => {
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
    const resNurses = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/zonas`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });

    const data: Zones[] = await resNurses.data;

    // Pass data to the page via props
    return { props: { data } };
  } catch (e: Error | AxiosError | any) {
    return { props: { data: [] as Zones[] } };
  }
};

export default Zones;
