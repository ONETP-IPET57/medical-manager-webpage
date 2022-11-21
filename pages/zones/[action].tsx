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
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { BackButton } from '../../components/BackButton';

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
  const { t } = useTranslation(['common', 'zones']);

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
          {t(`zones:actions.${isEdit ? 'edit' : 'add'}.title`)}
        </Heading>
        <BackButton />
      </HStack>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Flex direction='column' p='1rem' gap='1rem' bg='white' rounded='xl'>
          <FormControl isInvalid={Boolean(errors.nombre)}>
            <FormLabel>{t(`zones:actions.${isEdit ? 'edit' : 'add'}.name.title`)}</FormLabel>
            <Input
              type='text'
              defaultValue={isEdit ? data?.nombre : ''}
              placeholder={t(`zones:actions.${isEdit ? 'edit' : 'add'}.name.placeholder`)}
              {...register('nombre', {
                required: 'This is required',
                minLength: { value: 4, message: 'Minimum length should be 4' },
                pattern: { value: /^[a-zA-Z0-9\_\-\s]+$/i, message: 'Alphanumeric characters only' },
              })}
            />
            <FormErrorMessage>{errors.nombre ? errors.nombre.message : ''}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={Boolean(errors.descripcion)}>
            <FormLabel>{t(`zones:actions.${isEdit ? 'edit' : 'add'}.description.title`)}</FormLabel>
            <Input
              type='text'
              defaultValue={isEdit ? data?.descripcion : ''}
              placeholder={t(`zones:actions.${isEdit ? 'edit' : 'add'}.description.placeholder`)}
              {...register('descripcion', {
                required: 'This is required',
                minLength: { value: 4, message: 'Minimum length should be 4' },
                pattern: { value: /^[a-zA-Z0-9\_\-\s]+$/i, message: 'Alphanumeric characters only' },
              })}
            />
            <FormErrorMessage>{errors.descripcion ? errors.descripcion.message : ''}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={Boolean(errors.numero)}>
            <FormLabel>{t(`zones:actions.${isEdit ? 'edit' : 'add'}.number.title`)}</FormLabel>
            <Input
              type='text'
              defaultValue={isEdit ? data?.numero : ''}
              placeholder={t(`zones:actions.${isEdit ? 'edit' : 'add'}.number.placeholder`)}
              {...register('numero', {
                required: 'This is required',
                pattern: { value: /^[0-9]+$/i, message: 'Numeric characters only' },
              })}
            />
            <FormErrorMessage>{errors.numero ? errors.numero.message : ''}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={Boolean(errors.estado)}>
            <FormLabel>{t(`zones:actions.${isEdit ? 'edit' : 'add'}.state.title`)}</FormLabel>
            <Select
              placeholder={t(`zones:actions.${isEdit ? 'edit' : 'add'}.state.placeholder`)}
              defaultValue={isEdit ? data?.estado : ''}
              {...register('estado', {
                required: 'This is required',
              })}>
              <option value='0'>{t(`zones:actions.${isEdit ? 'edit' : 'add'}.state.options.inactive`)}</option>
              <option value='1'>{t(`zones:actions.${isEdit ? 'edit' : 'add'}.state.options.active`)}</option>
            </Select>
            <FormErrorMessage>{errors.estado ? errors.estado.message : ''}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={Boolean(errors.id_forma_llamada)}>
            <FormLabel>{t(`zones:actions.${isEdit ? 'edit' : 'add'}.form_call.title`)}</FormLabel>
            <Select
              placeholder={t(`zones:actions.${isEdit ? 'edit' : 'add'}.form_call.placeholder`)}
              defaultValue={isEdit ? data?.id_forma_llamada : ''}
              {...register('id_forma_llamada', {
                required: 'This is required',
              })}>
              <option value='1'>{t(`zones:actions.${isEdit ? 'edit' : 'add'}.form_call.options.call`)}</option>
              <option value='2'>{t(`zones:actions.${isEdit ? 'edit' : 'add'}.form_call.options.message`)}</option>
            </Select>
            <FormErrorMessage>{errors.id_forma_llamada ? errors.id_forma_llamada.message : ''}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={Boolean(errors.dni_paciente)}>
            <FormLabel>{t(`zones:actions.${isEdit ? 'edit' : 'add'}.patient.title`)}</FormLabel>
            <Select
              placeholder={t(`zones:actions.${isEdit ? 'edit' : 'add'}.patient.placeholder`)}
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
            <FormLabel>{t(`zones:actions.${isEdit ? 'edit' : 'add'}.nurse.title`)}</FormLabel>
            <Select
              placeholder={t(`zones:actions.${isEdit ? 'edit' : 'add'}.nurse.placeholder`)}
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
            {t(`zones:actions.${isEdit ? 'edit' : 'add'}.submit`)}
          </Button>
        </Flex>
      </form>
    </MainContainer>
  );
};

// This gets called on every request
export const getServerSideProps: GetServerSideProps<{ data: Zones | null; dataNurses: Array<Nurses> | null; dataPatients: Array<Patients> | null }> = async (context: any) => {
  const { locale, defaultLocale } = context;
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
    return { props: { data, dataNurses, dataPatients, session, ...(await serverSideTranslations((locale as string) || (defaultLocale as string), ['common', 'zones'])) } };
  } catch (e: any) {
    if (e?.response?.status === 401) {
      return {
        redirect: {
          destination: '/login',
          permanent: false,
        },
      };
    }
    return { props: { data: null, dataNurses: null, dataPatients: null, ...(await serverSideTranslations((locale as string) || (defaultLocale as string), ['common', 'zones'])) } };
  }
};

export default ZonesActions;
