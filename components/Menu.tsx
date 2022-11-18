import { Badge, Box, Button, Divider, Flex, Heading, Icon } from '@chakra-ui/react';
import { BiHome, BiClinic, BiBody, BiDoughnutChart, BiPhoneCall, BiLogOut, BiCog, BiError, BiUser } from 'react-icons/bi';
import { TbNurse } from 'react-icons/tb';
import React from 'react';
import { useRouter } from 'next/router';
import { useSession, signOut } from 'next-auth/react';

const menuItems = [
  {
    icon: <BiHome />,
    title: 'Home',
    link: '/',
    role: 'all',
  },
  {
    icon: <BiClinic />,
    title: 'Zones',
    link: '/zones',
    role: 'all',
  },
  {
    icon: <BiBody />,
    title: 'Patients',
    link: '/patients',
    role: 'all',
  },
  {
    icon: <TbNurse />,
    title: 'Nurses',
    link: '/nurses',
    role: 'all',
  },
  {
    icon: <BiPhoneCall />,
    title: 'Calls',
    link: '/calls',
    role: 'all',
  },
  {
    icon: <BiDoughnutChart />,
    title: 'Reports',
    link: '/reports',
    role: 'all',
  },
  {
    icon: <BiError />,
    title: 'Alerta',
    link: '/alert/encargado',
    role: 'all',
  },
  {
    icon: <BiUser />,
    title: 'Users',
    link: '/users',
    role: 'administrador',
  },
  {
    icon: <BiCog />,
    title: 'Settings',
    link: '/settings',
    role: 'administrador',
  },
];

export const Menu: React.FC = () => {
  const router = useRouter();
  const { data: session } = useSession();

  console.log(session);

  const logout = () => {
    console.log('logout');
    signOut({ callbackUrl: '/login' });
  };

  const handlerButtonSection = (link: string) => {
    console.log(link);
    router.push(link);
  };

  return (
    <Box h='100vh'>
      <Flex direction='column' gap='1rem' p='2rem' justifyContent='flex-start' alignItems='center'>
        <Heading as='h4' size='lg'>
          Welcome {session?.user.username}
        </Heading>
        <Badge colorScheme='blue'>{session?.user.role}</Badge>
        <Divider />
        {menuItems.map((item) => {
          if (item.role === 'all' || item.role === session?.user.role)
            return (
              <Button key={item.title} colorScheme='blue' variant='ghost' leftIcon={item.icon} w='full' onClick={() => handlerButtonSection(item.link)}>
                {item.title}
              </Button>
            );
        })}
        <Button w='full' variant='ghost' colorScheme='blue' leftIcon={<Icon as={BiLogOut} />} onClick={() => logout()}>
          Logout
        </Button>
      </Flex>
    </Box>
  );
};
