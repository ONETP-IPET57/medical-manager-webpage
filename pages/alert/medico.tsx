import { ButtonGroup, Container, Flex, Heading, Text, Button } from '@chakra-ui/react';
import { NextPage } from 'next';

const time = '10000';

const Medico: NextPage = () => {
  return (
    <Container>
      <Flex direction='column' justify='center' align='center' h='100vh' gap='1rem'>
        <Heading as='h1' size='3xl'>
          ¿Confirmar?
        </Heading>
        <ButtonGroup variant='outline'>
          <Button colorScheme='green'>Confirmar</Button>
          <Button colorScheme='red'>Cancelar</Button>
        </ButtonGroup>
      </Flex>
    </Container>
  );
};

export default Medico;
