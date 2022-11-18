import { Button, Divider, Flex, FormControl, FormErrorMessage, FormLabel, Heading, HStack, Input, Select } from '@chakra-ui/react';
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { useRouter } from 'next/router';
import { MainContainer } from '../../components/layouts/MainContainer';
import type { Zones } from '.';
import { SubmitHandler, useForm } from 'react-hook-form';
import { unstable_getServerSession } from 'next-auth/next';
import { authOptions } from '../api/auth/[...nextauth]';
import axios from 'axios';
import { Nurses } from '../nurses';
import { Patients } from '../patients';
import { useSession } from 'next-auth/react';

type Inputs = {
  nombre: string;
  numero: string;
  id_forma_llamada: string;
  'dni_enfermero': string;
  dni_paciente: string;
  descripcion: string;
  estado: string;
};

const ZonesActions = ({ data, dataNurses, dataPatients }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter();
  const { action, id } = router.query;
  const isEdit = action === 'edit';
  const { data: session } = useSession();

  console.log(data);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = (values) => {
    console.log(values);
    if (isEdit) {
      return axios
        .post(
          `/api/backend/zonas/${id}`,
          { ...data, ...values },
          {
            headers: {
              'Content-Type': 'application/json',
              accept: '*/*',
              Authorization: `Bearer ${session?.accessToken}`,
            },
          }
        )
        .then((res) => {
          console.log(res);
          router.push('/zones');
        })
        .catch((err) => {
          console.log(err);
          if (err.response.status === 401) {
            router.push('/login');
          }
        });
    } else {
      return axios
        .post(
          '/api/backend/zonas',
          { ...values, id_llamada: 1 },
          {
            headers: {
              'Content-Type': 'application/json',
              accept: '*/*',
              Authorization: `Bearer ${session?.accessToken}`,
            },
          }
        )
        .then((res) => {
          console.log(res);
          router.push('/zones');
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  return (
    <MainContainer>
      <HStack p='0.75rem' spacing='1rem'>
        <Heading as='h2' size='lg'>
          Zones
        </Heading>
      </HStack>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Flex direction='column' p='1rem' gap='1rem' bg='white' rounded='xl'>
          <FormControl isInvalid={Boolean(errors.nombre)}>
            <FormLabel>Zone Name</FormLabel>
            <Input
              type='text'
              defaultValue={isEdit ? data?.nombre : ''}
              placeholder={'Add a name'}
              {...register('nombre', {
                required: 'This is required',
                minLength: { value: 4, message: 'Minimum length should be 4' },
                pattern: { value: /^[a-zA-Z0-9\_\-\s]+$/i, message: 'Alphanumeric characters only' },
              })}
            />
            <FormErrorMessage>{errors.nombre ? errors.nombre.message : ''}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={Boolean(errors.descripcion)}>
            <FormLabel>Description</FormLabel>
            <Input
              type='text'
              defaultValue={isEdit ? data?.descripcion : ''}
              placeholder={'Add a descripcion'}
              {...register('descripcion', {
                required: 'This is required',
                minLength: { value: 4, message: 'Minimum length should be 4' },
                pattern: { value: /^[a-zA-Z0-9\_\-\s]+$/i, message: 'Alphanumeric characters only' },
              })}
            />
            <FormErrorMessage>{errors.descripcion ? errors.descripcion.message : ''}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={Boolean(errors.numero)}>
            <FormLabel>Zone Number</FormLabel>
            <Input
              type='text'
              defaultValue={isEdit ? data?.numero : ''}
              placeholder={'Add a numero'}
              {...register('numero', {
                required: 'This is required',
                pattern: { value: /^[0-9]+$/i, message: 'Numeric characters only' },
              })}
            />
            <FormErrorMessage>{errors.numero ? errors.numero.message : ''}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={Boolean(errors.estado)}>
            <FormLabel>Estado</FormLabel>
            <Select
              placeholder='Select estado'
              defaultValue={isEdit ? data?.estado : ''}
              {...register('estado', {
                required: 'This is required',
              })}>
              <option value='0'>Desocupado</option>
              <option value='1'>Ocupado</option>
            </Select>
            <FormErrorMessage>{errors.estado ? errors.estado.message : ''}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={Boolean(errors.id_forma_llamada)}>
            <FormLabel>Forma de llamada</FormLabel>
            <Select
              placeholder='Select Patient'
              defaultValue={isEdit ? data?.id_forma_llamada : ''}
              {...register('id_forma_llamada', {
                required: 'This is required',
              })}>
              <option value='1'>Llamada de paciente</option>
              <option value='2'>Televisor</option>
            </Select>
            <FormErrorMessage>{errors.id_forma_llamada ? errors.id_forma_llamada.message : ''}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={Boolean(errors.dni_paciente)}>
            <FormLabel>Patient</FormLabel>
            <Select
              placeholder='Select Patient'
              defaultValue={isEdit ? data?.dni_paciente : ''}
              {...register('dni_paciente', {
                required: 'This is required',
              })}>
              {dataPatients?.map((patient) => (
                <option key={patient.dni_paciente} value={patient.dni_paciente}>
                  {patient.nombre} {patient.apellido}
                </option>
              ))}
            </Select>
            <FormErrorMessage>{errors.dni_paciente ? errors.dni_paciente.message : ''}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={Boolean(errors.dni_enfermero)}>
            <FormLabel>Nurse</FormLabel>
            <Select
              placeholder='Select Nurse'
              defaultValue={isEdit ? data?.dni_enfermero : ''}
              {...register('dni_enfermero', {
                required: 'This is required',
              })}>
              {dataNurses?.map((nurse) => (
                <option key={nurse.dni_enfermero} value={nurse.dni_enfermero}>
                  {nurse.nombre} {nurse.apellido}
                </option>
              ))}
            </Select>
            <FormErrorMessage>{errors.dni_enfermero ? errors.dni_enfermero.message : ''}</FormErrorMessage>
          </FormControl>
          <Divider />
          <Button colorScheme='blue' variant='solid' rounded='md' w='full' type='submit' isLoading={isSubmitting}>
            Submit
          </Button>
        </Flex>
      </form>
    </MainContainer>
  );
};

// This gets called on every request
export const getServerSideProps: GetServerSideProps<{ data: Zones | null; dataNurses: Array<Nurses> | null; dataPatients: Array<Patients> | null }> = async (context: any) => {
  try {
    const session = await unstable_getServerSession(context.req, context.res, authOptions);

    if (!session) {
      return {
        redirect: {
          destination: '/login',
          permanent: false,
        },
      };
    }

    let data: Zones | null = null;

    if (context.query.action === 'edit') {
      // Fetch data from external API
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/zonas/${context.query.id}`, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });

      data = await res.data;
      console.log(res.data);
    }

    // Fetch data from external API
    const resNurses = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/enfermeros`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });

    const dataNurses: Array<Nurses> = await resNurses.data;

    // Fetch data from external API
    const resPatients = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/pacientes`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });

    const dataPatients: Array<Patients> = await resPatients.data;

    // Pass data to the page via props
    return { props: { data, dataNurses, dataPatients, session } };
  } catch (e: any) {
    if (e?.response?.status === 401) {
      return {
        redirect: {
          destination: '/login',
          permanent: false,
        },
      };
    }
    return { props: { data: null, dataNurses: null, dataPatients: null } };
  }
};

export default ZonesActions;
