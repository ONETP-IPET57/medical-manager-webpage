import { HStack, Heading, Flex, Button, Text, ButtonGroup, useToast } from '@chakra-ui/react';
import axios from 'axios';
import type { GetServerSideProps, GetServerSidePropsContext, InferGetServerSidePropsType, NextPage } from 'next';
import { unstable_getServerSession } from 'next-auth';
import { MainContainer } from '../../components/layouts/MainContainer';
import { authOptions } from '../api/auth/[...nextauth]';
import { Nurses } from '../nurses';
import { Zones } from '../zones';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import { SocketContext } from '../../components/layouts/AppContainer';
import { msgBlueCode } from '../../hooks/useSocket';

const time = '60000';

const Encargado = ({ zones, nurses }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter();
  const toast = useToast();
  const { t } = useTranslation(['common', 'alerts']);

  const [timeLeft, setTimeLeft] = useState<string>(time);
  const [isActive, setIsActive] = useState<boolean>(false);

  const reset = () => {
    setTimeLeft(time);
    setIsActive(false);
  };

  useEffect(() => {
    let interval: string | number | undefined = undefined;
    if (isActive && timeLeft !== '0') {
      interval = window.setInterval(() => {
        setTimeLeft((timeLeft) => {
          const time = parseInt(timeLeft) - 1000;
          if (time === 0) {
            emitBlueCode({} as msgBlueCode);
            if (messageConfirmNurse.nursesStates.some((item) => item.state === 'confirm')) {
              toast({
                title: 'Medicos que confirmaron',
                description:
                  'Los medicos que confirmaron son: ' +
                  messageConfirmNurse.nursesStates
                    .filter((item) => item.state === 'confirm')
                    .map((item) => nurses.find((nurse) => nurse.dni_enfermero === parseInt(item.dni_enfermero))?.nombre)
                    .join(', '),
                status: 'info',
                duration: 5000,
                isClosable: true,
              });
            } else {
              toast({
                title: 'No hay medicos confirmados',
                description: 'No hay medicos confirmados',
                status: 'error',
                duration: 5000,
                isClosable: true,
              });
            }
            reset();
          }
          return time.toString();
        });
      }, 1000);
    } else if (!isActive && timeLeft !== '0') {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const socketObject = useContext(SocketContext);
  const { emitBlueCode, messageConfirmNurse, messageBlueCode } = socketObject;

  const [availableNurses, setAvailableNurses] = useState<Nurses[]>([] as Nurses[]);
  const [availableZones, setAvailableZones] = useState<Zones[]>([] as Zones[]);

  useEffect(() => {
    if (!nurses || !zones) return;
    setAvailableNurses(nurses.filter((nurse) => nurse.estado === 1));
    setAvailableZones(zones.filter((zone) => zone.estado === 0));
  }, [nurses, zones]);

  const handleBlueCode = () => {
    emitBlueCode({ availableZone: availableZones[0], availableNurses: availableNurses.slice(0, 3) });
    setIsActive(true);
    toast({
      title: 'Alerta enviada',
      description: 'Los medicos recibiran esta alerta',
      status: 'success',
      duration: 8000,
      isClosable: true,
    });
  };

  return (
    <MainContainer>
      <HStack p='0.75rem' spacing='1rem'>
        <Heading as='h2' size='lg' textShadow='md'>
          {t('alerts:title')}
        </Heading>
      </HStack>
      <Flex w='full' h='md' direction='column' gap='1rem' p='1rem' bg='white' shadow='md' rounded='lg'>
        <Button variant='solid' colorScheme='blue' w='full' h='full' p='2rem' shadow='md' onClick={() => handleBlueCode()}>
          <Text fontSize='3xl' fontWeight='bold' wordBreak='break-all' w='full' whiteSpace='break-spaces'>
            {t('alerts:blue_code')}
          </Text>
        </Button>
        {messageBlueCode && messageBlueCode.availableNurses && messageBlueCode.availableNurses.length > 0
          ? messageBlueCode.availableNurses.map((nurse: Nurses, index: number) => (
              <Flex gap='1rem' key={nurse.dni_enfermero}>
                <Text textAlign='center' fontSize='xl'>
                  Medico: {nurse.nombre} {nurse.apellido}: {messageConfirmNurse && messageConfirmNurse.nursesStates && messageConfirmNurse.nursesStates.length > 0 && messageConfirmNurse.nursesStates.find((nurseState) => nurseState.dni_enfermero === nurse.dni_enfermero.toString())?.state ? (`alerts:confirm_states.&{messageConfirmNurse.nursesStates.find((nurseState) => nurseState.dni_enfermero === nurse.dni_enfermero.toString())?.state}`) : t('alerts:confirm_states.pending')}
                </Text>
              </Flex>
            ))
          : null}
      </Flex>
      <Flex w='full'>
        <ButtonGroup shadow='md' size='md' isAttached variant='ghost' w='full' colorScheme='blue' bg='white' rounded='lg' flexWrap='wrap'>
          <Button w='full' onClick={() => router.push('/alert/medico')}>
            {t('alerts:views.to_nurse')}
          </Button>
          <Button w='full' onClick={() => router.push('/alert')}>
            {t('alerts:views.to_alert')}
          </Button>
        </ButtonGroup>
      </Flex>
    </MainContainer>
  );
};

// This gets called on every request
export const getServerSideProps: GetServerSideProps<{ zones: Array<Zones>; nurses: Array<Nurses> }> = async (context: GetServerSidePropsContext) => {
  const { req, res, locale, defaultLocale } = context;
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

  const resNurses = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/enfermeros`, {
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  });
  const nurses: Array<Nurses> = await resNurses.data;

  // Pass data to the page via props
  return { props: { zones, nurses, ...(await serverSideTranslations((locale as string) || (defaultLocale as string), ['common', 'alerts'])) } };
};

export default Encargado;
