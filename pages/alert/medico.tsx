import { ButtonGroup, Container, Flex, Heading, Text, Button, Select } from '@chakra-ui/react';
import axios from 'axios';
import { GetServerSideProps, GetServerSidePropsContext, InferGetServerSidePropsType, NextPage } from 'next';
import { unstable_getServerSession } from 'next-auth';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { ChangeEventHandler, useContext, useEffect, useState } from 'react';
import { BackButton } from '../../components/BackButton';
import { SocketContext } from '../../components/layouts/AppContainer';
import { getAge } from '../../lib/date';
import { authOptions } from '../api/auth/[...nextauth]';
import { Nurses } from '../nurses';
import { Patients } from '../patients';

const time = '30000';

const Medico = ({ nurses, patients }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const [timeLeft, setTimeLeft] = useState<string>(time);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [confirm, setConfirm] = useState<boolean>(false);
  const [selectedNurse, setSelectedNurse] = useState<Nurses>({} as Nurses);
  const router = useRouter();
  const { t } = useTranslation(['common', 'alerts']);
  const socketObject = useContext(SocketContext);
  const { emitConfirmNurse, messageConfirmNurse, messageBlueCode } = socketObject;

  const reset = () => {
    setTimeLeft(time);
    setIsActive(false);
  };

  useEffect(() => {
    let interval: string | number | undefined = undefined;
    if (confirm) {
      reset();
    }
    if (isActive && timeLeft !== '0') {
      interval = window.setInterval(() => {
        setTimeLeft((timeLeft) => {
          const time = parseInt(timeLeft) - 1000;
          if (time === 0) {
            changeState('cancel', true);
            setConfirm(false);
            reset();
          }
          return time.toString();
        });
      }, 1000);
    } else if (!isActive && timeLeft !== '0') {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, confirm]);

  useEffect(() => {
    setSelectedNurse(nurses.find((item) => item.estado === 1) as Nurses);
  }, [nurses]);

  useEffect(() => {
    if (messageBlueCode && Object.keys(messageBlueCode).length > 0 && messageBlueCode.availableNurses && messageBlueCode.availableNurses.length > 0) {
      messageBlueCode.availableNurses.forEach((nurse: any) => {
        if (nurse.dni_enfermero === selectedNurse.dni_enfermero) {
          changeState('pending', true);
          setIsActive(true);
          setConfirm(false);
        }
      });
    }
  }, [messageBlueCode]);

  const changeState = (state: string, emit: boolean) => {
    const tempArr = messageConfirmNurse.nursesStates;
    if (tempArr.length > 0 && tempArr.find((nurse) => nurse.dni_enfermero === selectedNurse.dni_enfermero.toString())) {
      const index = tempArr.findIndex((nurse) => nurse.dni_enfermero === selectedNurse.dni_enfermero.toString());
      tempArr[index].state = state;
    } else {
      tempArr.push({ dni_enfermero: selectedNurse.dni_enfermero.toString(), state });
    }
    if (emit) {
      emitConfirmNurse({ ...messageConfirmNurse });
    }
  };

  const handlerChangeNurse = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    const nurse = nurses.find((nurse) => nurse.dni_enfermero === parseInt(value));
    if (nurse) {
      setSelectedNurse(nurse);
    }
  };

  const handlerConfirm = () => {
    setConfirm(true);
    changeState('confirm', true);
    // router.push('/alert');
  };

  const handlerCancel = () => {
    setConfirm(false);
    setIsActive(false);
    changeState('cancel', true);
  };

  const confirmComponent = (
    <Flex direction='column' justify='center' align='center' h='100vh' gap='1rem'>
      <Heading as='h1' size='3xl'>
        ¿Confirmar?
      </Heading>
      <Text fontSize='2xl'>{parseInt(timeLeft) / 1000} seg</Text>
      <ButtonGroup variant='outline'>
        <Button colorScheme='green' onClick={() => handlerConfirm()}>
          Confirmar
        </Button>
        <Button colorScheme='red' onClick={() => handlerCancel()}>
          Cancelar
        </Button>
      </ButtonGroup>
    </Flex>
  );

  const postConfirmComponent = (
    <Flex direction='column' justify='center' align='center' h='100vh' gap='1rem'>
      <Heading as='h1' size='3xl' textAlign='center' mb='1rem'>
        Datos del paciente
      </Heading>
      <Text fontSize='2xl'>
        Nombre: {patients[0].nombre} {patients[0].apellido}
      </Text>
      <Text fontSize='2xl'>Edad: {getAge(patients[0].fecha_nac)}</Text>
      <Text fontSize='2xl'>Genero: {patients[0].sexo}</Text>
      <Text fontSize='2xl'>DNI: {patients[0].dni_paciente}</Text>
      <Text fontSize='2xl'>Patologias: {patients[0].patologia}</Text>
      <Text fontSize='2xl'>Alergias: {patients[0].alergia}</Text>
      <Button colorScheme='green' onClick={() => router.push('/patients/add')}>
        Completar ficha
      </Button>
    </Flex>
  );

  return (
    <Flex direction='column' h='100vh'>
      <Flex justify='center' align='center' p='1rem' gap='1rem' bg='white' shadow='md'>
        <BackButton />
        {nurses ? (
          <Select
            placeholder='Seleccionar enfermero'
            w='full'
            h='full'
            shadow='md'
            defaultValue={nurses.find((item) => item.estado === 1)?.dni_enfermero}
            onChange={(e) => {
              handlerChangeNurse(e);
            }}>
            {nurses.map((nurse: Nurses) => (
              <option key={nurse.dni_enfermero} value={nurse.dni_enfermero}>
                {nurse.nombre} {nurse.apellido}
              </option>
            ))}
          </Select>
        ) : null}
      </Flex>
      <Flex justify='center' align='center' p='1rem' gap='1rem' bg='white' shadow='md'>
        {messageBlueCode && messageBlueCode.availableNurses && messageBlueCode.availableNurses.length > 0
          ? messageBlueCode.availableNurses
              .filter((item) => item.dni_enfermero !== selectedNurse.dni_enfermero)
              .map((nurse: Nurses, index: number) => (
                <Flex gap='1rem' key={nurse.dni_enfermero}>
                  <Text textAlign='center' fontSize={{ base: 'md', md: 'xl' }}>
                    Medico: {nurse.nombre} {nurse.apellido}: {messageConfirmNurse && messageConfirmNurse.nursesStates && messageConfirmNurse.nursesStates.length > 0 && messageConfirmNurse.nursesStates.find((nurseState) => nurseState.dni_enfermero === nurse.dni_enfermero.toString())?.state ? `alerts:confirm_states.&{messageConfirmNurse.nursesStates.find((nurseState) => nurseState.dni_enfermero === nurse.dni_enfermero.toString())?.state}` : t('alerts:confirm_states.pending')}
                  </Text>
                </Flex>
              ))
          : null}
      </Flex>
      <Container maxW='container.xl' h='full' p='1rem'>
        {confirm ? (
          postConfirmComponent
        ) : isActive ? (
          confirmComponent
        ) : (
          <Flex h='full' justify='center' align='center'>
            <Text w='full' textAlign='center' fontSize='4xl' fontWeight='bold'>
              Esperando codigo azul
            </Text>
          </Flex>
        )}
      </Container>
    </Flex>
  );
};

// This gets called on every request
export const getServerSideProps: GetServerSideProps<{ nurses: Array<Nurses>; patients: Patients[] }> = async (context: GetServerSidePropsContext) => {
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

  const resNurses = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/enfermeros`, {
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  });
  const nurses: Array<Nurses> = await resNurses.data;

  const resPatients = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/pacientes`, {
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  });
  const patients: Patients[] = await resNurses.data;

  // Pass data to the page via props
  return { props: { nurses, patients, ...(await serverSideTranslations((locale as string) || (defaultLocale as string), ['common', 'alerts'])) } };
};

export default Medico;
