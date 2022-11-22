import { ButtonGroup, Container, Flex, Heading, Text, Button, Box, Icon } from '@chakra-ui/react';
import { GetServerSideProps, GetServerSidePropsContext, NextPage } from 'next';
import { useContext } from 'react';
import { BiCheck, BiX, BiStopwatch } from 'react-icons/bi';
import { BackButton } from '../../components/BackButton';
import { SocketContext } from '../../components/layouts/AppContainer';
import { Nurses } from '../nurses';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

const Alert: NextPage = () => {
  const socketObject = useContext(SocketContext);
  const { messageBlueCode, messageConfirmNurse } = socketObject;
  const icons = {
    'confirm': (
      <Box h={{ base: '36px', md: '72px' }} style={{ aspectRatio: 1 / 1 }} bg='green.500' rounded='full' p='6px' key={'check'}>
        <Icon as={BiCheck} w='100%' h='100%' color='white' />
      </Box>
    ),

    'pending': (
      <Box h={{ base: '36px', md: '72px' }} style={{ aspectRatio: 1 / 1 }} bg='orange.500' rounded='full' p='6px' key={'wait'}>
        <Icon as={BiStopwatch} w='100%' h='100%' color='white' />
      </Box>
    ),

    'cancel': (
      <Box h={{ base: '36px', md: '72px' }} style={{ aspectRatio: 1 / 1 }} bg='red.500' rounded='full' p='6px' key={'not'}>
        <Icon as={BiX} w='100%' h='100%' color='white' />
      </Box>
    ),
  };

  const getIcon = (nurse: Nurses) => {
    let icon = icons['pending'];
    if (messageConfirmNurse && messageConfirmNurse.nursesStates && messageConfirmNurse.nursesStates.length > 0) {
      const item = messageConfirmNurse.nursesStates.find((nurseState) => nurseState.dni_enfermero === nurse.dni_enfermero.toString());
      if (item) {
        // @ts-ignore
        icon = icons[item.state];
      }
    }
    return icon;
  };

  return (
    <Flex direction='column' h='100vh'>
      <Flex justify='flex-start' align='center' p='1rem' gap='1rem' bg='white' shadow='md'>
        <BackButton />
      </Flex>
      <Flex direction='column' justify='center' align='center' h='full' gap='1rem' p='1rem'>
        <Heading as='h1' size={{ base: 'xl', md: '4xl' }} textAlign='center' mb='1rem' color='blue.500'>
          {messageBlueCode && Object.keys(messageBlueCode).length > 0 ? 'Alerta codigo azul' : 'Sin alertas'}
        </Heading>
        {messageBlueCode && messageBlueCode.availableZone ? (
          <Text textAlign='center' fontSize={{ base: 'xl', md: '4xl' }} fontWeight='bold'>
            Zona: {messageBlueCode?.availableZone?.nombre}
          </Text>
        ) : null}
        {messageBlueCode && messageBlueCode.availableNurses && messageBlueCode.availableNurses.length > 0
          ? messageBlueCode.availableNurses.map((nurse: Nurses, index: number) => (
              <Flex gap='1rem' w='full' justify='center' key={nurse.dni_enfermero}>
                <Text textAlign='center' fontSize={{ base: 'xl', md: '4xl' }} fontWeight='bold'>
                  Medico: {nurse.nombre} {nurse.apellido}
                </Text>
                {getIcon(nurse)}
              </Flex>
            ))
          : null}
      </Flex>
    </Flex>
  );
};

// This gets called on every request
export const getServerSideProps: GetServerSideProps = async (context: GetServerSidePropsContext) => {
  const { req, res, locale, defaultLocale } = context;
  return { props: { ...(await serverSideTranslations((locale as string) || (defaultLocale as string), ['common', 'alerts'])) } };
};

export default Alert;
