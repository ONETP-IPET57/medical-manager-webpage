import { ButtonGroup, Container, Flex, Heading, Text, Button } from '@chakra-ui/react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const time = '30000';

const Medico: NextPage = () => {
  const [timeLeft, setTimeLeft] = useState<string>(time);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [confirm, setConfirm] = useState<boolean>(false);
  const router = useRouter();

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
            setIsActive(false);
          }
          return time.toString();
        });
      }, 1000);
    } else if (!isActive && timeLeft !== '0') {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, confirm]);

  const confirmComponent = (
    <Flex direction='column' justify='center' align='center' h='100vh' gap='1rem'>
      <Heading as='h1' size='3xl'>
        ¿Confirmar?
      </Heading>
      <Text fontSize='2xl'>{parseInt(timeLeft) / 1000} seg</Text>
      <ButtonGroup variant='outline'>
        <Button colorScheme='green' onClick={() => setConfirm(true)}>
          Confirmar
        </Button>
        <Button colorScheme='red' onClick={() => setConfirm(false)}>
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
      <Text fontSize='2xl'>Nombre: Juan Perez</Text>
      <Text fontSize='2xl'>Edad: 25</Text>
      <Text fontSize='2xl'>Sexo: Masculino</Text>
      <Text fontSize='2xl'>DNI: 12345678</Text>
      <Text fontSize='2xl'>Patologias: nn, nn, nn</Text>
      <Text fontSize='2xl'>Alergias: nn, nn, nn</Text>
      <Button colorScheme='green' onClick={() => router.push('/patients/add')}>
        Completar ficha
      </Button>
    </Flex>
  );

  return <Container>{confirm ? postConfirmComponent : confirmComponent}</Container>;
};

export default Medico;
