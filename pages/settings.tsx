import { Divider, Flex, Grid, GridItem, Heading, HStack, Text } from '@chakra-ui/react';
import type { NextPage } from 'next';
import { MainContainer } from '../components/layouts/MainContainer';

const settings = [
  {
    id: 1,
    name: 'Emergencia',
    value: 'Emergencia',
  },
  {
    id: 2,
    name: 'Normal',
    value: 'Normal',
  },
];

const Settings: NextPage = () => {
  return (
    <MainContainer>
      <HStack p='0.75rem' spacing='1rem'>
        <Heading as='h2' size='lg'>
          Settings
        </Heading>
      </HStack>
      <Grid h='full' w='full' templateColumns='repeat(6, 1fr)' templateRows='repeat(12, 1fr)' gap='2rem'>
        {settings.map((setting) => (
          <GridItem rowSpan={1} colSpan={6} bg='white' p='0.75rem' rounded='lg' key={setting.id}></GridItem>
        ))}
      </Grid>
    </MainContainer>
  );
};

export default Settings;
