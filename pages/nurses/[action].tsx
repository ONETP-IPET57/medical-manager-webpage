/* eslint-disable react/no-children-prop */
import { Button, Divider, Flex, FormControl, FormLabel, Heading, HStack, Input, Select, InputGroup, InputLeftElement, FormErrorMessage } from '@chakra-ui/react';
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { useRouter } from 'next/router';
import { MainContainer } from '../../components/layouts/MainContainer';
import { Nurses, nurseState } from '.';
import { BiPhone } from 'react-icons/bi';
import { SubmitHandler, useForm } from 'react-hook-form';
import { unstable_getServerSession } from 'next-auth/next';
import { authOptions } from '../api/auth/[...nextauth]';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { formatDateToSQL, formatDateToHTMLInput } from '../../lib/date';

type Inputs = {
  dni_enfermero: string;
  nombre: string;
  apellido: string;
  sexo: string;
  telefono: string;
  estado: number;
  fecha_nac: string;
};

const NurseActions = ({ data }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter();
  const { action, id } = router.query;
  const isEdit = action === 'edit';
  const { data: session } = useSession();

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
          `/api/backend/enfermeros/${id}`,
          { ...data, ...values, fecha_nac: formatDateToSQL(values.fecha_nac) },
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
          router.push('/nurses');
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
          '/api/backend/enfermeros',
          { ...values, fecha_nac: formatDateToSQL(values.fecha_nac) },
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
          router.push('/nurses');
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
          Nurses
        </Heading>
      </HStack>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Flex direction='column' p='1rem' gap='1rem' bg='white' rounded='xl'>
          <FormControl isInvalid={Boolean(errors.nombre)}>
            <FormLabel>Name</FormLabel>
            <Input
              type='text'
              defaultValue={isEdit ? data?.nombre : ''}
              placeholder={'Add the name of patient'}
              {...register('nombre', {
                required: 'This is required',
                minLength: { value: 4, message: 'Minimum length should be 4' },
                pattern: { value: /^[a-zA-Z0-9\_\-\s]+$/i, message: 'Alphanumeric characters only' },
              })}
            />
            <FormErrorMessage>{errors.nombre ? errors.nombre.message : ''}</FormErrorMessage>
          </FormControl>
          <FormControl>
            <FormLabel>Lastname</FormLabel>
            <Input
              type='text'
              defaultValue={isEdit ? data?.apellido : ''}
              placeholder={'Add the lastname of patient'}
              {...register('apellido', {
                required: 'This is required',
                minLength: { value: 4, message: 'Minimum length should be 4' },
                pattern: { value: /^[a-zA-Z0-9\_\-\s]+$/i, message: 'Alphanumeric characters only' },
              })}
            />
            <FormErrorMessage>{errors.apellido ? errors.apellido.message : ''}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={Boolean(errors.dni_enfermero)}>
            <FormLabel>DNI</FormLabel>
            <Input
              type='tel'
              placeholder='Dni'
              defaultValue={isEdit ? data?.dni_enfermero : ''}
              {...register('dni_enfermero', {
                required: 'This is required',
                minLength: { value: 8, message: 'Minimum length should be 8' },
                maxLength: { value: 11, message: 'Maximum length should be 11' },
                pattern: { value: /^[0-9]+$/i, message: 'Numbers only' },
              })}
            />
            <FormErrorMessage>{errors.dni_enfermero ? errors.dni_enfermero.message : ''}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={Boolean(errors.fecha_nac)}>
            <FormLabel>Birth date</FormLabel>
            <Input
              placeholder='Select the birth date of patient'
              size='md'
              type='date'
              defaultValue={isEdit ? formatDateToHTMLInput(data?.fecha_nac) : ''}
              {...register('fecha_nac', {
                required: 'This is required',
              })}
            />
            <FormErrorMessage>{errors.fecha_nac ? errors.fecha_nac.message : ''}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={Boolean(errors.estado)}>
            <FormLabel>Estado</FormLabel>
            <Select
              placeholder='Select estado'
              defaultValue={isEdit ? data?.estado : ''}
              {...register('estado', {
                required: 'This is required',
              })}>
              {nurseState.map((item, id) => (
                <option key={id} value={id}>
                  {item}
                </option>
              ))}
            </Select>
            <FormErrorMessage>{errors.estado ? errors.estado.message : ''}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={Boolean(errors.sexo)}>
            <FormLabel>Gender</FormLabel>
            <Select
              placeholder='Select Gender of patient'
              defaultValue={isEdit ? data?.sexo : ''}
              {...register('sexo', {
                required: 'This is required',
              })}>
              <option value='Masculino'>Male</option>
              <option value='Femenino'>Female</option>
              <option value='Other'>Other</option>
            </Select>
            <FormErrorMessage>{errors.sexo ? errors.sexo.message : ''}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={Boolean(errors.telefono)}>
            <FormLabel>Phone</FormLabel>
            <InputGroup>
              <InputLeftElement pointerEvents='none' children={<BiPhone />} />
              <Input
                type='tel'
                placeholder='Phone number'
                defaultValue={isEdit ? data?.telefono : ''}
                {...register('telefono', {
                  required: 'This is required',
                  minLength: { value: 11, message: 'Minimum length should be 11' },
                  pattern: { value: /^[0-9]+$/i, message: 'Numbers only' },
                })}
              />
            </InputGroup>
            <FormErrorMessage>{errors.telefono ? errors.telefono.message : ''}</FormErrorMessage>
          </FormControl>
          {/*  <FormControl>
          <FormLabel>Email</FormLabel>
          <Input type='email' defaultValue={isEdit ? email : ''} placeholder={'Add the email of patient'} />
        </FormControl> */}
          <Divider />
          <Button colorScheme='blue' variant='solid' rounded='md' w='full' type='submit'>
            Submit
          </Button>
        </Flex>
      </form>
    </MainContainer>
  );
};

// This gets called on every request
export const getServerSideProps: GetServerSideProps<{ data: Nurses | null }> = async (context: any) => {
  try {
    const session = await unstable_getServerSession(context.req, context.res, authOptions);

    if (!session) {
      return {
        redirect: {
          destination: '/',
          permanent: false,
        },
      };
    }

    let data: Nurses | null = null;

    if (context.query.action === 'edit') {
      // Fetch data from external API
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/enfermeros/${context.query.id}`, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });

      data = await res.data;
    }

    // Pass data to the page via props
    return { props: { data } };
  } catch (e) {
    return { props: { data: null } };
  }
};

export default NurseActions;
