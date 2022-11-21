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
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { BackButton } from '../../components/BackButton';

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

const bloodType = [
  { value: 'A+', label: 'A+' },
  { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' },
  { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' },
  { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' },
  { value: 'O-', label: 'O-' },
];

const PatientActions = ({ data }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter();
  const { action, id } = router.query;
  const isEdit = action === 'edit';
  const { data: session } = useSession();
  const { t } = useTranslation(['common', 'patients']);

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
          {t(`patients:actions.${isEdit ? 'edit' : 'add'}.title`)}
        </Heading>
        <BackButton />
      </HStack>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Flex direction='column' p='1rem' gap='1rem' bg='white' rounded='xl'>
          <FormControl isInvalid={Boolean(errors.nombre)}>
            <FormLabel>{t(`patients:actions.${isEdit ? 'edit' : 'add'}.name.label`)}</FormLabel>
            <Input
              type='text'
              defaultValue={isEdit ? data?.nombre : ''}
              placeholder={t(`patients:actions.${isEdit ? 'edit' : 'add'}.name.placeholder`)}
              {...register('nombre', {
                required: 'This is required',
                minLength: { value: 4, message: 'Minimum length should be 4' },
                pattern: { value: /^[a-zA-Z0-9\_\-\s]+$/i, message: 'Alphanumeric characters only' },
              })}
            />
            <FormErrorMessage>{errors.nombre ? errors.nombre.message : ''}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={Boolean(errors.apellido)}>
            <FormLabel>{t(`patients:actions.${isEdit ? 'edit' : 'add'}.lastname.label`)}</FormLabel>
            <Input
              type='text'
              defaultValue={isEdit ? data?.apellido : ''}
              placeholder={t(`patients:actions.${isEdit ? 'edit' : 'add'}.lastname.placeholder`)}
              {...register('apellido', {
                required: 'This is required',
                minLength: { value: 4, message: 'Minimum length should be 4' },
                pattern: { value: /^[a-zA-Z0-9\_\-\s]+$/i, message: 'Alphanumeric characters only' },
              })}
            />
            <FormErrorMessage>{errors.apellido ? errors.apellido.message : ''}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={Boolean(errors.dni_paciente)} isDisabled={action === 'edit'}>
            <FormLabel>{t(`patients:actions.${isEdit ? 'edit' : 'add'}.id_card_patient.label`)}</FormLabel>
            <Input
              type='tel'
              placeholder={t(`patients:actions.${isEdit ? 'edit' : 'add'}.id_card_patients.placeholder`)}
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
            <FormLabel>{t(`patients:actions.${isEdit ? 'edit' : 'add'}.birth_date.label`)}</FormLabel>
            <Input
              placeholder={t(`patients:actions.${isEdit ? 'edit' : 'add'}.birth_date.placeholder`)}
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
            <FormLabel>{t(`patients:actions.${isEdit ? 'edit' : 'add'}.gender.label`)}</FormLabel>
            <Select
              placeholder={t(`patients:actions.${isEdit ? 'edit' : 'add'}.gender.placeholder`)}
              defaultValue={isEdit ? data?.sexo : ''}
              {...register('sexo', {
                required: 'This is required',
              })}>
              <option value='Masculino'>{t(`patients:actions.${isEdit ? 'edit' : 'add'}.gender.options.male`)}</option>
              <option value='Femenino'>{t(`patients:actions.${isEdit ? 'edit' : 'add'}.gender.options.female`)}</option>
            </Select>
            <FormErrorMessage>{errors.sexo ? errors.sexo.message : ''}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={Boolean(errors.telefono)}>
            <FormLabel>{t(`patients:actions.${isEdit ? 'edit' : 'add'}.phone.label`)}</FormLabel>
            <InputGroup>
              <InputLeftElement pointerEvents='none' children={<BiPhone />} />
              <Input
                type='tel'
                placeholder={t(`patients:actions.${isEdit ? 'edit' : 'add'}.phone.placeholder`)}
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
            <FormLabel>{t(`patients:actions.${isEdit ? 'edit' : 'add'}.address.label`)}</FormLabel>
            <Input
              type='text'
              defaultValue={isEdit ? data?.direccion : ''}
              placeholder={t(`patients:actions.${isEdit ? 'edit' : 'add'}.address.placeholder`)}
              {...register('direccion', {
                required: 'This is required',
                minLength: { value: 4, message: 'Minimum length should be 4' },
                pattern: { value: /^[a-zA-Z0-9\_\-\s]+$/i, message: 'Alphanumeric characters only' },
              })}
            />
            <FormErrorMessage>{errors.direccion ? errors.direccion.message : ''}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={Boolean(errors.fecha_hora_ingreso)}>
            <FormLabel>{t(`patients:actions.${isEdit ? 'edit' : 'add'}.date_entry.label`)}</FormLabel>
            <Input
              placeholder={t(`patients:actions.${isEdit ? 'edit' : 'add'}date_entry.placeholder`)}
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
            <FormLabel>{t(`patients:actions.${isEdit ? 'edit' : 'add'}.date_exit.label`)}</FormLabel>
            <Input placeholder={t(`patients:actions.${isEdit ? 'edit' : 'add'}.date_exit.placeholder`)} size='md' type='datetime-local' defaultValue={isEdit ? formatDatetimeToHTMLInput(data?.fecha_hora_egreso) : ''} {...register('fecha_hora_egreso')} />
            <FormErrorMessage>{errors.fecha_hora_egreso ? errors.fecha_hora_egreso.message : ''}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={Boolean(errors.tipo_sangre)}>
            <FormLabel>{t(`patients:actions.${isEdit ? 'edit' : 'add'}.blood_type.label`)}</FormLabel>
            <Select
              placeholder={t(`patients:actions.${isEdit ? 'edit' : 'add'}.blood_type.placeholder`)}
              defaultValue={isEdit ? data?.tipo_sangre : ''}
              {...register('tipo_sangre', {
                required: 'This is required',
              })}>
              {bloodType.map((item) => (
                <option key={item.value} value={item.value}>
                  {t(`patients:actions.${isEdit ? 'edit' : 'add'}.blood_type.options.${item.label}`)}
                </option>
              ))}
            </Select>
            <FormErrorMessage>{errors.tipo_sangre ? errors.tipo_sangre.message : ''}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={Boolean(errors.patologia)}>
            <FormLabel>{t(`patients:actions.${isEdit ? 'edit' : 'add'}.pathologies.label`)}</FormLabel>
            <Input
              type='text'
              defaultValue={isEdit ? data?.patologia : ''}
              placeholder={t(`patients:actions.${isEdit ? 'edit' : 'add'}.pathologies.placeholder`)}
              {...register('patologia', {
                required: 'This is required',
                minLength: { value: 4, message: 'Minimum length should be 4' },
                pattern: { value: /^[a-zA-Z0-9\_\-\s]+$/i, message: 'Alphanumeric characters only' },
              })}
            />
            <FormErrorMessage>{errors.patologia ? errors.patologia.message : ''}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={Boolean(errors.alergia)}>
            <FormLabel>{t(`patients:actions.${isEdit ? 'edit' : 'add'}.allergies.label`)}</FormLabel>
            <Input
              type='text'
              defaultValue={isEdit ? data?.alergia : ''}
              placeholder={t(`patients:actions.${isEdit ? 'edit' : 'add'}.allergies.placeholder`)}
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
            {t(`patients:actions.${isEdit ? 'edit' : 'add'}.submit`)}
          </Button>
        </Flex>
      </form>
    </MainContainer>
  );
};

// This gets called on every request
export const getServerSideProps: GetServerSideProps<{ data: Patients | null }> = async (context: any) => {
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
    return { props: { data, ...(await serverSideTranslations((locale as string) || (defaultLocale as string), ['common', 'patients'])) } };
  } catch (e) {
    return { props: { data: null, ...(await serverSideTranslations((locale as string) || (defaultLocale as string), ['common', 'patients'])) } };
  }
};

export default PatientActions;
