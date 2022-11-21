import { Grid, Heading, HStack, Flex, FormControl, FormErrorMessage, FormLabel, Input, Divider, Select, Button } from '@chakra-ui/react';
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { SubmitHandler, useForm } from 'react-hook-form';
import { MainContainer } from '../../components/layouts/MainContainer';
import axios from 'axios';
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]';
import { User, usersRole } from '.';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { BackButton } from '../../components/BackButton';

type Inputs = {
  username: string;
  password: string;
  email: string;
  role: string;
};

const UserActions = ({ data }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter();
  const { action, id } = router.query;
  const isEdit = action === 'edit';
  const { data: session } = useSession();
  const { t } = useTranslation(['common', 'users']);

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
          `/api/backend/users/${id}`,
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
          router.push('/users');
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
          `/api/backend/signup`,
          { ...values },
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
          router.push('/users');
        })
        .catch((err) => {
          console.log(err);
          if (err.response.status === 401) {
            router.push('/login');
          }
        });
    }
  };

  return (
    <MainContainer>
      <HStack p='0.75rem' spacing='1rem'>
        <Heading as='h2' size='lg'>
          {t(`users:actions.${isEdit ? 'edit' : 'add'}.title`)}
        </Heading>
        <BackButton />
      </HStack>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Flex direction='column' p='1rem' gap='1rem' bg='white' rounded='xl'>
          <FormControl isInvalid={Boolean(errors.username)}>
            <FormLabel>{t(`users:actions.${isEdit ? 'edit' : 'add'}.username.label`)}</FormLabel>
            <Input
              type='text'
              placeholder={t(`users:actions.${isEdit ? 'edit' : 'add'}.username.placeholder`)}
              defaultValue={isEdit ? data?.username : ''}
              {...register('username', {
                required: 'This is required',
                minLength: { value: 4, message: 'Minimum length should be 4' },
                maxLength: { value: 20, message: 'Maximum length should be 20' },
                pattern: { value: /^[a-zA-Z0-9\_\-]+$/i, message: 'Alphanumeric characters only' },
              })}
            />
            <FormErrorMessage>{errors.username ? errors.username.message : ''}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={Boolean(errors.password)} isDisabled={action === 'edit'}>
            <FormLabel>{t(`users:actions.${isEdit ? 'edit' : 'add'}.password.label`)}</FormLabel>
            <Input
              type='password'
              placeholder={t(`users:actions.${isEdit ? 'edit' : 'add'}.password.placeholder`)}
              defaultValue={isEdit ? data?.password : ''}
              {...(action === 'add'
                ? register('password', {
                    required: 'This is required',
                    minLength: { value: 4, message: 'Minimum length should be 4' },
                    maxLength: { value: 30, message: 'Maximum length should be 30' },
                    pattern: { value: /^[a-zA-Z0-9\_\-\s]+$/i, message: 'Alphanumeric characters only' },
                  })
                : {})}
            />
            <FormErrorMessage>{errors.password ? errors.password.message : ''}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={Boolean(errors.email)}>
            <FormLabel>{t(`users:actions.${isEdit ? 'edit' : 'add'}.email.label`)}</FormLabel>
            <Input
              type='email'
              placeholder={t(`users:actions.${isEdit ? 'edit' : 'add'}.email.placeholder`)}
              defaultValue={isEdit ? data?.email : ''}
              {...register('email', {
                required: 'This is required',
                pattern: { value: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/i, message: 'Alphanumeric characters only' },
              })}
            />
            <FormErrorMessage>{errors.email ? errors.email.message : ''}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={Boolean(errors.role)}>
            <FormLabel>{t(`users:actions.${isEdit ? 'edit' : 'add'}.role.label`)}</FormLabel>
            <Select
              placeholder={t(`users:actions.${isEdit ? 'edit' : 'add'}.role.placeholder`)}
              defaultValue={isEdit ? data?.role : ''}
              {...register('role', {
                required: 'This is required',
              })}>
              {usersRole.map((role, id) => (
                <option key={id} value={id}>
                  {t(`users:actions.${isEdit ? 'edit' : 'add'}.role.options.${role}`)}
                </option>
              ))}
            </Select>
            <FormErrorMessage>{errors.role ? errors.role.message : ''}</FormErrorMessage>
          </FormControl>
          <Divider />
          <Button colorScheme='blue' variant='solid' rounded='md' w='full' type='submit' isLoading={isSubmitting}>
            {t(`users:actions.${isEdit ? 'edit' : 'add'}.submit`)}
          </Button>
        </Flex>
      </form>
    </MainContainer>
  );
};

// This gets called on every request
export const getServerSideProps: GetServerSideProps<{ data: User | null }> = async (context: any) => {
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

    let data: User | null = null;

    if (context.query.action === 'edit') {
      // Fetch data from external API
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${context.query.id}`, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });

      data = await res.data;
    }

    // Pass data to the page via props
    return { props: { data, ...(await serverSideTranslations((locale as string) || (defaultLocale as string), ['common', 'users'])) } };
  } catch (e) {
    return { props: { data: null, ...(await serverSideTranslations((locale as string) || (defaultLocale as string), ['common', 'users'])) } };
  }
};

export default UserActions;
