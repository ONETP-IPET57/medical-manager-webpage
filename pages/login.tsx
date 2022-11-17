import { Center, Flex, FormControl, FormLabel, FormErrorMessage, FormHelperText, Input, Box, Divider, Button, HStack, Heading, Text } from '@chakra-ui/react';
import type { NextPage } from 'next';
import { ChangeEvent, useState } from 'react';
import { Image } from '../components/Image';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useRouter } from 'next/router';
import { signIn } from 'next-auth/react';

type Inputs = {
  username: string;
  password: string;
};

const Login: NextPage = () => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = (values) => {
    return signIn('credentials', {
      username: values.username,
      password: values.password,
      redirect: false,
    }).then((res) => {
      console.log(res);
      if (res?.error) {
        console.log('error', res?.error);
      } else {
        router.push('/');
        console.log('redirect');
      }
    });
  };

  return (
    <Flex justifyContent='center' alignItems='center' h='100vh' w='100vw'>
      <Center flex='1'>
        <Box p='1rem' rounded='xl' bg='white'>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Flex direction='column' gap='1rem' justifyContent='center' alignItems='flex-start' w='full'>
              <Heading as='h3' size='lg'>
                Login
              </Heading>
              <Text fontSize='md' color='blackAlpha.600'>
                Logeate para poder ingresar en el sistema
              </Text>
              <Divider />
              <FormControl isInvalid={Boolean(errors.username)}>
                <FormLabel>Username</FormLabel>
                <Input
                  type='text'
                  {...register('username', {
                    required: 'This is required',
                    minLength: { value: 4, message: 'Minimum length should be 4' },
                    pattern: { value: /^[a-zA-Z0-9\_\-]+$/i, message: 'Alphanumeric characters only' },
                  })}
                />
                <FormErrorMessage>{errors.username ? errors.username.message : ''}</FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={Boolean(errors.password)}>
                <FormLabel>Password</FormLabel>
                <Input
                  type='password'
                  {...register('password', {
                    required: 'This is required',
                    minLength: { value: 4, message: 'Minimum length should be 4' },
                    pattern: { value: /^[a-zA-Z0-9\_\-]+$/i, message: 'Alphanumeric characters and _ - only' },
                  })}
                />
                <FormErrorMessage>{errors.password ? errors.password.message : ''}</FormErrorMessage>
              </FormControl>
              <Button colorScheme='blue' variant='solid' rounded='md' w='full' type='submit' isLoading={isSubmitting}>
                Submit
              </Button>
            </Flex>
          </form>
        </Box>
      </Center>
      <Box w='50%' pos='relative' inset='0 0 0 0' zIndex='-2' flex='1' h='100%' rounded='0 0 0 100px' overflow='hidden' display={{ md: 'block', base: 'none' }}>
        <Box pos='relative' h='100%' w='100%' zIndex='-1'>
          <Image src={'/img/login-image.jpg'} alt='Background' fill='true' filter='blur(5px)' />
        </Box>
        <Heading as='h1' size='2xl' pos='absolute' top='50%' left='50%' transform='translate(-50%, -50%)' color='white' zIndex='1' textAlign='center'>
          Bienvenido a <br></br> Medical Manager
        </Heading>
      </Box>
    </Flex>
  );
};

export default Login;
