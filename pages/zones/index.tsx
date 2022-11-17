/* eslint-disable react/no-children-prop */
import { Badge, Button, ButtonGroup, Divider, Flex, Grid, GridItem, Heading, HStack, Icon, IconButton, Input, InputGroup, InputLeftElement, Select, Text } from '@chakra-ui/react';
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { MainContainer } from '../../components/layouts/MainContainer';
import { IoMdAdd } from 'react-icons/io';
import { useRouter } from 'next/router';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { BiSearch } from 'react-icons/bi';
import { useState } from 'react';

export type Zones = {
  id_zona: number;
  nombre: string;
  descripcion: string;
  numero: number;
  id_forma_llamada: number;
  id_llamada: number;
  dni_paciente: number;
  'dni_enfermero': number;
  nombre_paciente: string;
  apellido_paciente: string;
  nombre_enfermero: string;
  apellido_enfermero: string;
  estado: number;
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

  return (
    <MainContainer>
      <HStack p='0.75rem' spacing='1rem'>
        <Heading as='h2' size='lg' textShadow='md'>
          Zones
        </Heading>
        <IconButton w='min' size='sm' fontSize='20px' colorScheme='blue' variant='outline' bg='white' rounded='lg' aria-label='Add Zone' icon={<IoMdAdd />} onClick={() => handlerAddZone()}>
          Add Zone
        </IconButton>

        <InputGroup bg='white' rounded='lg' shadow='md'>
          <InputLeftElement pointerEvents='none' children={<BiSearch />} />
          <Input type='text' placeholder='Search' onChange={(e) => handlerSearchZone(e)} />
        </InputGroup>

        <Select defaultValue='nombre' onChange={(e) => handlerSearchType(e)} bg='white' rounded='lg' shadow='md'>
          <option value='nombre'>Nombre</option>
          <option value='descripcion'>Descripcion</option>
          <option value='numero'>Numero de zona</option>
          <option value='estado'>Estado</option>
          <option value='nombre_paciente'>Paciente</option>
          <option value='nombre_enfermero'>Enfermero</option>
        </Select>
      </HStack>
      <Grid h='full' w='full' templateColumns='repeat(6, 1fr)' templateRows='repeat(12, 1fr)' gap='2rem'>
        {data
          .map((zone) => {
            return {
              ...zone,
              estado: zoneStates[zone.estado],
            };
          })
          .filter((zone) => searchFilterFunc(zone))
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
          ))}
      </Grid>
    </MainContainer>
  );
};

// This gets called on every request
export const getServerSideProps: GetServerSideProps<{ data: Array<Zones> }> = async () => {
  // Fetch data from external API
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/zonas`);
  const data: Array<Zones> = await res.json();

  // Pass data to the page via props
  return { props: { data } };
};

export default Zones;
