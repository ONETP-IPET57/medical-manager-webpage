/* eslint-disable react/no-children-prop */
import { Badge, Divider, Flex, Grid, GridItem, Heading, HStack, Input, InputGroup, InputLeftElement, Select, Text } from '@chakra-ui/react';
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { MainContainer } from '../components/layouts/MainContainer';
import axios from 'axios';
import { BiSearch } from 'react-icons/bi';
import { useState } from 'react';
import { useSession } from 'next-auth/react';

export type Call = {
  id_llamada: number;
  tipo: string;
  fecha_hora_llamada: string;
  fecha_hora_atendido: string;
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
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [searchType, setSearchType] = useState<CallKeys>('id_llamada');

  const handlerSearchCall = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
    setSearchFilter(e.target.value);
  };

  const handlerSearchType = (e: React.ChangeEvent<HTMLSelectElement>) => {
    console.log(e.target.value);
    setSearchType(e.target.value as CallKeys);
  };

  const searchFilterFunc = (call: any) => {
    if (searchType === 'tipo' || searchType === 'origen_llamada' || searchType === 'id_llamada') {
      return call[searchType].toString().toLowerCase().startsWith(searchFilter.toLowerCase());
    } else if (searchType === 'nombre_paciente') {
      return call.nombre_paciente.toLowerCase().startsWith(searchFilter.toLowerCase()) || call.apellido_paciente.toLowerCase().startsWith(searchFilter.toLowerCase());
    } else if (searchType === 'fecha_hora_atendido') {
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

  return (
    <MainContainer>
      <HStack p='0.75rem' spacing='1rem'>
        <Heading as='h2' size='lg'>
          Calls
        </Heading>

        <InputGroup bg='white' rounded='lg'>
          <InputLeftElement pointerEvents='none' children={<BiSearch />} />
          <Input type='text' placeholder='Search' onChange={(e) => handlerSearchCall(e)} />
        </InputGroup>

        <Select defaultValue='nombre' onChange={(e) => handlerSearchType(e)} bg='white' rounded='lg'>
          <option value='id_llamada'>Numero de llamada</option>
          <option value='tipo'>Tipo de llamada</option>
          <option value='fecha_hora_llamada'>Fecha y hora de llamada</option>
          <option value='fecha_hora_atendido'>Fecha y hora de atendido</option>
          <option value='origen_llamada'>Origen de la Llamada</option>
          <option value='nombre_zona'>Nombre de la zona</option>
          <option value='nombre_paciente'>Paciente</option>
        </Select>
      </HStack>
      <Grid h='full' w='full' templateColumns='repeat(6, 1fr)' templateRows='repeat(12, 1fr)' gap='2rem'>
        {data
          /* .map((call) => {
            return {
              ...call,
              estado: zoneStates[zone.estado],
            };
          }) */
          .filter((call) => searchFilterFunc(call))
          .map((call) => (
            <GridItem rowSpan={2} colSpan={3} bg='white' p='0.75rem' rounded='lg' key={call.id_llamada}>
              <Flex direction='column' gap='0.5rem' h='full'>
                <Heading as='h3' size='md'>
                  Llamada numero: {call.id_llamada}
                </Heading>
                <Divider />
                <Flex direction='column' w='full' gap='0.5rem'>
                  <Text fontSize='md' fontWeight='bold'>
                    Zona
                  </Text>
                  <Text fontSize='md'>
                    {call.nombre_zona} - {call.numero_zona}
                  </Text>
                </Flex>
                <Divider />
                <Flex direction='column' w='full' gap='0.5rem'>
                  <Text fontSize='md' fontWeight='bold'>
                    Paciente
                  </Text>
                  <Text fontSize='md'>
                    {call.nombre_paciente} {call.apellido_paciente}
                  </Text>
                </Flex>
                <Divider />
                <Flex direction='column' w='full' gap='0.5rem'>
                  <Text fontSize='md' fontWeight='bold'>
                    Origen llamada
                  </Text>
                  <Text fontSize='md'>{call.origen_llamada}</Text>
                </Flex>
                <Divider />
                <Flex direction='column' w='full' gap='0.5rem'>
                  <Text fontSize='md' fontWeight='bold'>
                    Tipo de llamada
                  </Text>
                  <Text fontSize='md'>{call.tipo}</Text>
                </Flex>
                <Divider />
                <Flex direction='row' w='full' gap='0.5rem' justify='space-between'>
                  <Badge colorScheme='blue' mr='0.5rem'>
                    Fecha y hora de llamada: {call.fecha_hora_llamada}
                  </Badge>
                  <Badge colorScheme='green' mr='0.5rem'>
                    {call.fecha_hora_atendido ? 'Fecha y hora de atencion: ' + call.fecha_hora_atendido : 'No atendido'}
                  </Badge>
                </Flex>
                <Divider />
              </Flex>
            </GridItem>
          ))}
      </Grid>
    </MainContainer>
  );
};

// This gets called on every request
export const getServerSideProps: GetServerSideProps<{ data: Array<Call> }> = async () => {
  // Fetch data from external API
  const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/llamadas`);
  const data: Array<Call> = await res.data;

  // Pass data to the page via props
  return { props: { data } };
};

export default Calls;
