import { Box, Flex } from '@chakra-ui/react';
import type { PropsWithChildren } from 'react';
import { Menu } from '../Menu';

export const MainContainer: React.FunctionComponent<PropsWithChildren> = ({ children }: PropsWithChildren) => {
  return (
    <Flex>
      <Menu />
      <Flex direction='column' bg='blackAlpha.200' w='75%' p='1rem' gap='1rem'>
        {children}
      </Flex>
    </Flex>
  );
};
