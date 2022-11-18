import { ButtonGroup, Container, Flex, Heading, Text, Button, Box, Icon } from '@chakra-ui/react';
import { NextPage } from 'next';
import { BiCheck, BiX, BiStopwatch } from 'react-icons/bi';

const tempAlert = {
  zone: 'Quirofano 1',
  nurse: 'Juan Perez',
};

const Alert: NextPage = () => {
  return (
    <Container w='70%' maxWidth='70%'>
      <Flex direction='column' justify='center' align='center' h='100vh' gap='1rem'>
        <Heading as='h1' size='4xl' textAlign='center' mb='1rem' color='blue.500'>
          Alerta codigo azul
        </Heading>
        <Text textAlign='center' fontSize='4xl' fontWeight='bold'>
          Zona: {tempAlert.zone}
        </Text>
        <Flex gap='1rem' w='full' justify='center'>
          <Text textAlign='center' fontSize='4xl' fontWeight='bold' color='green.500'>
            Medico: {tempAlert.nurse}
          </Text>
          <Box h='100%' style={{ aspectRatio: 1 / 1 }} bg='green.500' rounded='full' p='6px'>
            <Icon as={BiCheck} w='100%' h='100%' color='white' />
          </Box>
        </Flex>
        <Flex gap='1rem' w='full' justify='center'>
          <Text textAlign='center' fontSize='4xl' fontWeight='bold' color='orange.500'>
            Medico: {tempAlert.nurse}
          </Text>
          <Box h='100%' style={{ aspectRatio: 1 / 1 }} bg='orange.500' rounded='full' p='6px'>
            <Icon as={BiStopwatch} w='100%' h='100%' color='white' />
          </Box>
        </Flex>
        <Flex gap='1rem' w='full' justify='center'>
          <Text textAlign='center' fontSize='4xl' fontWeight='bold' color='red.500'>
            Medico: {tempAlert.nurse}
          </Text>
          <Box h='100%' style={{ aspectRatio: 1 / 1 }} bg='red.500' rounded='full' p='6px'>
            <Icon as={BiX} w='100%' h='100%' color='white' />
          </Box>
        </Flex>
      </Flex>
    </Container>
  );
};

export default Alert;
