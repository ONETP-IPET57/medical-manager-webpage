import { Box, Flex, Drawer, DrawerBody, DrawerFooter, DrawerHeader, DrawerOverlay, DrawerContent, DrawerCloseButton, Button, useDisclosure } from '@chakra-ui/react';
import { PropsWithChildren, RefObject, useRef } from 'react';
import { BiMenu } from 'react-icons/bi';
import { Menu } from '../Menu';

export const MainContainer: React.FunctionComponent<PropsWithChildren> = ({ children }: PropsWithChildren) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Flex bg='blackAlpha.200'>
      <Flex display={{ base: 'none', md: 'flex' }} bg='white'>
        <Menu />
      </Flex>

      <Flex display={{ base: 'flex', md: 'none' }}>
        <Drawer isOpen={isOpen} placement='left' onClose={onClose}>
          <DrawerOverlay />
          <DrawerContent>
            <Menu />
          </DrawerContent>
        </Drawer>
      </Flex>
      <Flex direction='column' w={{ base: 'full', md: '75%' }} h='full'>
        <Flex display={{ base: 'flex', md: 'none' }} w='full' bg='white' shadow='md' position='fixed'>
          <Button colorScheme='blue' onClick={onOpen} variant='ghost' leftIcon={<BiMenu />}>
            Menu
          </Button>
        </Flex>
        <Flex direction='column' w='full' h='full' p='1rem' gap='1rem' mt={{ base: '40px', md: '0' }}>
          {children}
        </Flex>
      </Flex>
    </Flex>
  );
};
