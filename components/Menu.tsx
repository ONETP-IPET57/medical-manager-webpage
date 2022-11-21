import { Badge, Box, Button, Divider, Flex, Heading, Icon } from '@chakra-ui/react';
import { BiHome, BiClinic, BiBody, BiDoughnutChart, BiPhoneCall, BiLogOut, BiCog, BiError, BiUser, BiDownload, BiHelpCircle } from 'react-icons/bi';
import { TbNurse } from 'react-icons/tb';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession, signOut } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import { MenuItem } from '../types/types';
import axios from 'axios';

export const Menu: React.FC = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const { t } = useTranslation('common');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([] as MenuItem[]);

  useEffect(() => {
    setMenuItems([
      {
        icon: <BiHome />,
        title: 'menu.home',
        link: '/',
        role: 'all',
      },
      {
        icon: <BiClinic />,
        title: 'menu.zones',
        link: '/zones',
        role: 'all',
      },
      {
        icon: <BiBody />,
        title: 'menu.patients',
        link: '/patients',
        role: 'all',
      },
      {
        icon: <TbNurse />,
        title: 'menu.nurses',
        link: '/nurses',
        role: 'all',
      },
      {
        icon: <BiPhoneCall />,
        title: 'menu.calls',
        link: '/calls',
        role: 'all',
      },
      {
        icon: <BiDoughnutChart />,
        title: 'menu.statistics',
        link: '/reports',
        role: 'all',
      },
      {
        icon: <BiError />,
        title: 'menu.alerts',
        link: '/alert/encargado',
        role: 'all',
      },
      {
        icon: <BiUser />,
        title: 'menu.users',
        link: '/users',
        role: 'administrador',
      },
      /* {
        icon: <BiCog />,
        title: 'menu.settings',
        link: '/settings',
        role: 'administrador',
      }, */
    ]);
  }, []);

  const logout = () => {
    console.log('logout');
    signOut({ callbackUrl: '/login' });
  };

  const downloadApp = () => {
    window.open('https://staticfiles.tikkix2.com.ar/app-medical-57', '_blank');
  };

  const downloadHelp = () => {
    window.open('https://staticfiles.tikkix2.com.ar/app-medical-57', '_blank');
  };

  const handlerButtonSection = (link: string) => {
    console.log(link);
    router.push(link);
  };

  return (
    <Box h='100vh'>
      <Flex direction='column' gap='1rem' p='2rem' justifyContent='flex-start' alignItems='center'>
        <Heading as='h4' size='lg'>
          {t('menu.welcome', { username: session?.user.username })}
        </Heading>
        <Badge colorScheme='blue'>{session?.user.role}</Badge>
        <Divider />
        {menuItems.map((item) => {
          if (item.role === 'all' || item.role === session?.user.role)
            return (
              <Button key={item.title} colorScheme='blue' variant='ghost' leftIcon={item.icon} w='full' onClick={() => handlerButtonSection(item.link)}>
                {t(item.title)}
              </Button>
            );
        })}
        <Button w='full' variant='ghost' colorScheme='blue' leftIcon={<Icon as={BiLogOut} />} onClick={() => logout()}>
          {t('menu.logout')}
        </Button>
        <Button w='full' variant='ghost' colorScheme='blue' leftIcon={<Icon as={BiDownload} />} onClick={() => downloadApp()}>
          {t('menu.download.app')}
        </Button>
        <Button w='full' variant='ghost' colorScheme='blue' leftIcon={<Icon as={BiHelpCircle} />} onClick={() => downloadHelp()}>
          {t('menu.download.help')}
        </Button>
      </Flex>
    </Box>
  );
};
