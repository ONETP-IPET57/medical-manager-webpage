/* eslint-disable react/no-children-prop */
import { Button, Divider, Flex, FormControl, FormLabel, FormErrorMessage, Heading, HStack, Input, Select, InputGroup, InputLeftElement } from '@chakra-ui/react';
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { useRouter } from 'next/router';
import { MainContainer } from '../../components/layouts/MainContainer';
import type { Patients } from '.';
import { BiPhone } from 'react-icons/bi';
import { SubmitHandler, useForm } from 'react-hook-form';
import { unstable_getServerSession } from 'next-auth/next';
import { authOptions } from '../api/auth/[...nextauth]';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { formatDatetimeToHTMLInput, formatDatetimeToSQL, formatDateToHTMLInput } from '../../lib/date';

type Inputs = {
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
};

const PatientActions = ({ data }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
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
          `/api/backend/pacientes/${id}`,
          { ...data, ...values, fecha_nac: new Date(values.fecha_nac).toISOString().split('T')[0], fecha_hora_ingreso: formatDatetimeToSQL(values.fecha_hora_ingreso), fecha_hora_egreso: formatDatetimeToSQL(values.fecha_hora_egreso) },
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
          router.push('/patients');
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
          '/api/backend/pacientes',
          { ...values, fecha_nac: new Date(values.fecha_nac).toISOString().split('T')[0], fecha_hora_ingreso: formatDatetimeToSQL(values.fecha_hora_ingreso), fecha_hora_egreso: formatDatetimeToSQL(values.fecha_hora_egreso) },
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
          router.push('/patients');
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
          Patients
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
          <FormControl isInvalid={Boolean(errors.apellido)}>
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
          <FormControl isInvalid={Boolean(errors.dni_paciente)} isDisabled={action === 'edit'}>
            <FormLabel>DNI</FormLabel>
            <Input
              type='tel'
              placeholder='Dni'
              defaultValue={isEdit ? data?.dni_paciente : ''}
              {...(action === 'add'
                ? register('dni_paciente', {
                    required: 'This is required',
                    minLength: { value: 8, message: 'Minimum length should be 8' },
                    maxLength: { value: 11, message: 'Maximum length should be 11' },
                    pattern: { value: /^[0-9]+$/i, message: 'Numbers only' },
                  })
                : {})}
            />
            <FormErrorMessage>{errors.dni_paciente ? errors.dni_paciente.message : ''}</FormErrorMessage>
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
                  minLength: { value: 7, message: 'Minimum length should be 7' },
                  maxLength: { value: 10, message: 'Minimum length should be 10' },
                  pattern: { value: /^[0-9]+$/i, message: 'Numbers only' },
                })}
              />
            </InputGroup>
            <FormErrorMessage>{errors.telefono ? errors.telefono.message : ''}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={Boolean(errors.direccion)}>
            <FormLabel>Address</FormLabel>
            <Input
              type='text'
              defaultValue={isEdit ? data?.direccion : ''}
              placeholder={'Add the address of patient'}
              {...register('direccion', {
                required: 'This is required',
                minLength: { value: 4, message: 'Minimum length should be 4' },
                pattern: { value: /^[a-zA-Z0-9\_\-\s]+$/i, message: 'Alphanumeric characters only' },
              })}
            />
            <FormErrorMessage>{errors.direccion ? errors.direccion.message : ''}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={Boolean(errors.fecha_hora_ingreso)}>
            <FormLabel>Entry day</FormLabel>
            <Input
              placeholder='Select the Entry day of patient'
              size='md'
              type='datetime-local'
              defaultValue={isEdit ? formatDatetimeToHTMLInput(data?.fecha_hora_ingreso) : ''}
              {...register('fecha_hora_ingreso', {
                required: 'This is required',
              })}
            />
            <FormErrorMessage>{errors.fecha_hora_ingreso ? errors.fecha_hora_ingreso.message : ''}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={Boolean(errors.fecha_hora_egreso)}>
            <FormLabel>Exit day</FormLabel>
            <Input placeholder='Select the Exit day of patient' size='md' type='datetime-local' defaultValue={isEdit ? formatDatetimeToHTMLInput(data?.fecha_hora_egreso) : ''} {...register('fecha_hora_egreso')} />
            <FormErrorMessage>{errors.fecha_hora_egreso ? errors.fecha_hora_egreso.message : ''}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={Boolean(errors.tipo_sangre)}>
            <FormLabel>Tipo sangre</FormLabel>
            <Select
              placeholder='Select blood type of patient'
              defaultValue={isEdit ? data?.tipo_sangre : ''}
              {...register('tipo_sangre', {
                required: 'This is required',
              })}>
              <option value='A'>A</option>
              <option value='B'>B</option>
              <option value='AB'>AB</option>
              <option value='O'>O</option>
            </Select>
            <FormErrorMessage>{errors.tipo_sangre ? errors.tipo_sangre.message : ''}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={Boolean(errors.patologia)}>
            <FormLabel>Patologias</FormLabel>
            <Input
              type='text'
              defaultValue={isEdit ? data?.patologia : ''}
              placeholder={'Add the address of patient'}
              {...register('patologia', {
                required: 'This is required',
                minLength: { value: 4, message: 'Minimum length should be 4' },
                pattern: { value: /^[a-zA-Z0-9\_\-\s]+$/i, message: 'Alphanumeric characters only' },
              })}
            />
            <FormErrorMessage>{errors.patologia ? errors.patologia.message : ''}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={Boolean(errors.alergia)}>
            <FormLabel>Alergias</FormLabel>
            <Input
              type='text'
              defaultValue={isEdit ? data?.alergia : ''}
              placeholder={'Add the address of patient'}
              {...register('alergia', {
                required: 'This is required',
                minLength: { value: 4, message: 'Minimum length should be 4' },
                pattern: { value: /^[a-zA-Z0-9\_\-\s]+$/i, message: 'Alphanumeric characters only' },
              })}
            />
            <FormErrorMessage>{errors.alergia ? errors.alergia.message : ''}</FormErrorMessage>
          </FormControl>
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
export const getServerSideProps: GetServerSideProps<{ data: Patients | null }> = async (context: any) => {
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

    let data: Patients | null = null;

    if (context.query.action === 'edit') {
      // Fetch data from external API
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/pacientes/${context.query.id}`, {
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

export default PatientActions;
