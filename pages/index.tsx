import { Flex, Heading, Text } from '@chakra-ui/react';
import type { GetServerSidePropsContext, GetStaticPropsContext, NextPage } from 'next';
import { MainContainer } from '../components/layouts/MainContainer';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

const Home: NextPage = () => {
  return (
    <MainContainer>
      <Flex h='100vh' direction='column' gap='1rem' p='2rem' justify='center' align='center' bg='white' rounded='lg' shadow='md'>
        <Heading as='h1' size='2xl' textAlign='center'>
          Bienvenido a Medical 57
        </Heading>
        <Text fontSize='3xl' textAlign='center'>
          Sistema de gestion hospitalario
        </Text>
      </Flex>
    </MainContainer>
  );
};

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const { locale } = ctx;
  let finalLocale = locale;
  if (!locale) {
    finalLocale = 'es';
  } else {
    finalLocale = locale;
  }
  return {
    props: {
      ...(await serverSideTranslations(finalLocale, ['common'])),
      // Will be passed to the page component as props
    },
  };
};

export default Home;
