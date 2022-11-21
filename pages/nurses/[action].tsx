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
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { BackButton } from '../../components/BackButton';

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
  const { t } = useTranslation(['common', 'nurses']);

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
          {t(`nurses:actions.${isEdit ? 'edit' : 'add'}.title`)}
        </Heading>
        <BackButton />
      </HStack>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Flex direction='column' p='1rem' gap='1rem' bg='white' rounded='xl'>
          <FormControl isInvalid={Boolean(errors.nombre)}>
            <FormLabel>{t(`nurses:actions.${isEdit ? 'edit' : 'add'}.name.label`)}</FormLabel>
            <Input
              type='text'
              defaultValue={isEdit ? data?.nombre : ''}
              placeholder={t(`nurses:actions.${isEdit ? 'edit' : 'add'}.name.placeholder`)}
              {...register('nombre', {
                required: 'This is required',
                minLength: { value: 4, message: 'Minimum length should be 4' },
                pattern: { value: /^[a-zA-Z0-9\_\-\s]+$/i, message: 'Alphanumeric characters only' },
              })}
            />
            <FormErrorMessage>{errors.nombre ? errors.nombre.message : ''}</FormErrorMessage>
          </FormControl>
          <FormControl>
            <FormLabel>{t(`nurses:actions.${isEdit ? 'edit' : 'add'}.lastname.label`)}</FormLabel>
            <Input
              type='text'
              defaultValue={isEdit ? data?.apellido : ''}
              placeholder={t(`nurses:actions.${isEdit ? 'edit' : 'add'}.lastname.placeholder`)}
              {...register('apellido', {
                required: 'This is required',
                minLength: { value: 4, message: 'Minimum length should be 4' },
                pattern: { value: /^[a-zA-Z0-9\_\-\s]+$/i, message: 'Alphanumeric characters only' },
              })}
            />
            <FormErrorMessage>{errors.apellido ? errors.apellido.message : ''}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={Boolean(errors.dni_enfermero)}>
            <FormLabel>{t(`nurses:actions.${isEdit ? 'edit' : 'add'}.id_card_nurse.label`)}</FormLabel>
            <Input
              type='tel'
              placeholder={t(`nurses:actions.${isEdit ? 'edit' : 'add'}.id_card_nurse.placeholder`)}
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
            <FormLabel>{t(`nurses:actions.${isEdit ? 'edit' : 'add'}.birth_date.label`)}</FormLabel>
            <Input
              placeholder={t(`nurses:actions.${isEdit ? 'edit' : 'add'}.birth_date.placeholder`)}
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
            <FormLabel>{t(`nurses:actions.${isEdit ? 'edit' : 'add'}.status.label`)}</FormLabel>
            <Select
              placeholder={t(`nurses:actions.${isEdit ? 'edit' : 'add'}.status.placeholder`)}
              defaultValue={isEdit ? data?.estado : ''}
              {...register('estado', {
                required: 'This is required',
              })}>
              {nurseState.map((item, id) => (
                <option key={id} value={id}>
                  {t(`nurses:item.status_options.${item}`)}
                </option>
              ))}
            </Select>
            <FormErrorMessage>{errors.estado ? errors.estado.message : ''}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={Boolean(errors.sexo)}>
            <FormLabel>{t(`nurses:actions.${isEdit ? 'edit' : 'add'}.gender.label`)}</FormLabel>
            <Select
              placeholder={t(`nurses:actions.${isEdit ? 'edit' : 'add'}.gender.placeholder`)}
              defaultValue={isEdit ? data?.sexo : ''}
              {...register('sexo', {
                required: 'This is required',
              })}>
              <option value='Masculino'>{t(`nurses:actions.${isEdit ? 'edit' : 'add'}.gender.options.male`)}</option>
              <option value='Femenino'>{t(`nurses:actions.${isEdit ? 'edit' : 'add'}.gender.options.female`)}</option>
            </Select>
            <FormErrorMessage>{errors.sexo ? errors.sexo.message : ''}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={Boolean(errors.telefono)}>
            <FormLabel>{t(`nurses:actions.${isEdit ? 'edit' : 'add'}.phone.label`)}</FormLabel>
            <InputGroup>
              <InputLeftElement pointerEvents='none' children={<BiPhone />} />
              <Input
                type='tel'
                placeholder={t(`nurses:actions.${isEdit ? 'edit' : 'add'}.phone.placeholder`)}
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
            {t(`nurses:actions.${isEdit ? 'edit' : 'add'}.submit`)}
          </Button>
        </Flex>
      </form>
    </MainContainer>
  );
};

// This gets called on every request
export const getServerSideProps: GetServerSideProps<{ data: Nurses | null }> = async (context: any) => {
  const { locale, defaultLocale } = context;
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
    return { props: { data, ...(await serverSideTranslations((locale as string) || (defaultLocale as string), ['common', 'nurses'])) } };
  } catch (e) {
    return { props: { data: null, ...(await serverSideTranslations((locale as string) || (defaultLocale as string), ['common', 'nurses'])) } };
  }
};

export default NurseActions;
