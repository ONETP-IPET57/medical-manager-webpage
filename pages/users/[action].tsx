import { Grid, Heading, HStack, Flex, FormControl, FormErrorMessage, FormLabel, Input, Divider, Select, Button } from '@chakra-ui/react';
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { SubmitHandler, useForm } from 'react-hook-form';
import { MainContainer } from '../../components/layouts/MainContainer';
import axios from 'axios';
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]';
import { User } from '.';

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
          Add User
        </Heading>
      </HStack>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Flex direction='column' p='1rem' gap='1rem' bg='white' rounded='xl'>
          <FormControl isInvalid={Boolean(errors.username)}>
            <FormLabel>Username</FormLabel>
            <Input
              type='text'
              placeholder={'Add a username'}
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
            <FormLabel>Password</FormLabel>
            <Input
              type='password'
              placeholder={'Add a password'}
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
            <FormLabel>Email</FormLabel>
            <Input
              type='email'
              placeholder={'Add a email'}
              defaultValue={isEdit ? data?.email : ''}
              {...register('email', {
                required: 'This is required',
                pattern: { value: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/i, message: 'Alphanumeric characters only' },
              })}
            />
            <FormErrorMessage>{errors.email ? errors.email.message : ''}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={Boolean(errors.role)}>
            <FormLabel>Rol</FormLabel>
            <Select
              placeholder='Select rol'
              defaultValue={isEdit ? data?.role : ''}
              {...register('role', {
                required: 'This is required',
              })}>
              <option value='1'>Administrador</option>
              <option value='0'>Usuario</option>
            </Select>
            <FormErrorMessage>{errors.role ? errors.role.message : ''}</FormErrorMessage>
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
export const getServerSideProps: GetServerSideProps<{ data: User | null }> = async (context: any) => {
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
    return { props: { data } };
  } catch (e) {
    return { props: { data: null } };
  }
};

export default UserActions;
