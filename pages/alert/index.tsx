import { ButtonGroup, Container, Flex, Heading, Text, Button } from '@chakra-ui/react';
import { NextPage } from 'next';

const tempAlert = {
  zone: 'Quirofano 1',
  nurse: 'Juan Perez',
};

const Alert: NextPage = () => {
  return (
    <Container>
      <Flex direction='column' justify='center' align='center' h='100vh' gap='1rem'>
        <Heading>Alerta</Heading>
        <Text textAlign='center'>
          Se ha generado una alerta en la zona {tempAlert.zone} por parte de la enfermera {tempAlert.nurse}
        </Text>
      </Flex>
    </Container>
  );
};

export default Alert;
