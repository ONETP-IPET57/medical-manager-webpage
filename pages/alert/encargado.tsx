import { HStack, Heading, Flex, Button, Text } from '@chakra-ui/react';
import axios from 'axios';
import type { GetServerSideProps, GetServerSidePropsContext, InferGetServerSidePropsType, NextPage } from 'next';
import { unstable_getServerSession } from 'next-auth';
import { MainContainer } from '../../components/layouts/MainContainer';
import { authOptions } from '../api/auth/[...nextauth]';
import { Nurses } from '../nurses';
import { Zones } from '../zones';

const Encargado = ({ zones, nurses }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return (
    <MainContainer>
      <HStack p='0.75rem' spacing='1rem'>
        <Heading as='h2' size='lg' textShadow='md'>
          Alerta de emergencia
        </Heading>
      </HStack>
      <Flex w='full' h='sm'>
        <Button variant='solid' colorScheme='blue' w='full' h='full' p='2rem'>
          <Text fontSize='3xl' fontWeight='bold'>
            Enviar alerta codigo azul
          </Text>
        </Button>
      </Flex>
    </MainContainer>
  );
};

// This gets called on every request
export const getServerSideProps: GetServerSideProps<{ zones: Array<Zones>; nurses: Array<Nurses> }> = async (context: GetServerSidePropsContext) => {
  const { req, res } = context;
  const session = await unstable_getServerSession(req, res, authOptions);

  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  // Fetch data from external API
  const resZones = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/zonas`, {
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  });
  const zones: Array<Zones> = await resZones.data;

  const resNurses = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/pacientes`, {
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  });
  const nurses: Array<Nurses> = await resNurses.data;

  // Pass data to the page via props
  return { props: { zones, nurses } };
};

export default Encargado;
