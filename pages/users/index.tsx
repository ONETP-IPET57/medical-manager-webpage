/* eslint-disable react/no-children-prop */
import { IconButton, Heading, HStack, InputGroup, InputLeftElement, Input, Select, Grid, GridItem, Divider, Flex, Text, Badge, Button, ButtonGroup } from '@chakra-ui/react';
import type { GetServerSideProps, GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import { MainContainer } from '../../components/layouts/MainContainer';
import { IoMdAdd } from 'react-icons/io';
import axios, { AxiosError } from 'axios';
import { BiSearch } from 'react-icons/bi';
import { useEffect, useState } from 'react';
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

export type User = {
  id_user: number;
  username: string;
  password: string;
  email: string;
  role: string;
};

type UserKeysString = {
  [key in keyof User]: string;
};

export type UserKeys = keyof UserKeysString;

const Users = ({ data }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [searchType, setSearchType] = useState<UserKeys>('username');
  const [pagination, setPagination] = useState<number>(0);
  const [users, setUsers] = useState<User[][]>([data]);

  useEffect(() => {
    reloadPagination();
  }, [data, searchFilter, searchType, pagination]);

  console.log(data);

  const handlerAddUser = () => {
    console.log('Add user');
    router.push('/users/add');
  };

  const handlerEditUser = (id: number) => {
    console.log('Edit user', id);
    router.push(`/users/edit?id=${id}`);
  };

  const handlerDeleteUser = async (id: number) => {
    console.log('Delete Patient', id);
    const res = await axios.delete(`/api/backend/users/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        accept: '*/*',
        Authorization: `Bearer ${session?.accessToken}`,
      },
    });
    if (res.status === 200) {
      router.reload();
    }
  };

  const reloadPagination = () => {
    const tempData = data.filter((user) => searchFilterFunc(user));
    let tempPaginationPatients = [];

    for (let i = 0; i < tempData.length; i += 6) {
      tempPaginationPatients.push(tempData.slice(i, i + 6));
    }

    setUsers(tempPaginationPatients);
  };

  const handlerSearchUser = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
    setSearchFilter(e.target.value);
  };

  const handlerSearchType = (e: React.ChangeEvent<HTMLSelectElement>) => {
    console.log(e.target.value);
    setSearchType(e.target.value as UserKeys);
  };

  const searchFilterFunc = (zone: any) => {
    if (searchType === 'username' || searchType === 'email') {
      return zone[searchType].toString().toLowerCase().startsWith(searchFilter.toLowerCase());
    } else {
      return zone[searchType].toString().toLowerCase().includes(searchFilter.toLowerCase());
    }
  };

  const handlerPagination = (e: React.MouseEvent<HTMLButtonElement>) => {
    const { value } = e.currentTarget;
    if (value === 'next') {
      setPagination(pagination + 1);
    } else if (value === 'prev') {
      setPagination(pagination - 1);
    }
  };

  return (
    <MainContainer>
      <HStack p='0.75rem' gap='1rem' flexWrap='wrap'>
        <Heading as='h2' size='lg'>
          Users: {data?.length}
        </Heading>
        <IconButton w='min' fontSize='20px' colorScheme='blue' variant='ghost' bg='white' rounded='lg' aria-label='Add User' shadow='md' icon={<IoMdAdd />} onClick={() => handlerAddUser()} />
        <Button w='min' colorScheme='blue' variant='ghost' bg='white' rounded='lg' shadow='md'>
          Export
        </Button>

        <InputGroup bg='white' rounded='lg' shadow='md' flex='1'>
          <InputLeftElement pointerEvents='none' children={<BiSearch />} />
          <Input type='text' placeholder='Search' onChange={(e) => handlerSearchUser(e)} />
        </InputGroup>

        <Select defaultValue='nombre' onChange={(e) => handlerSearchType(e)} bg='white' rounded='lg' shadow='md' flex='1'>
          <option value='username'>Username</option>
          <option value='email'>Email</option>
          <option value='role'>Rol</option>
        </Select>
      </HStack>
      <Grid h='auto' w='full' templateColumns={{ base: 'auto', md: 'repeat(6, 1fr)' }} templateRows='auto' gap='2rem'>
        {users[pagination] ? (
          users[pagination].map((user) => (
            <GridItem rowSpan={1} colSpan={3} bg='white' p='0.75rem' rounded='lg' key={user.id_user} overflow='hidden' shadow='md'>
              <Flex direction='column' gap='0.5rem' h='full'>
                <Heading as='h3' size='md'>
                  {user.username}
                </Heading>
                <Divider />
                <Flex direction='row' w='full' gap='0.5rem'>
                  <Flex direction='column' w='full' gap='0.5rem' flex='1'>
                    <Text fontSize='md' fontWeight='bold'>
                      Email
                    </Text>
                    <Text fontSize='md'>{user.email}</Text>
                  </Flex>
                  <Flex direction='column' w='full' gap='0.5rem' flex='1'>
                    <Text fontSize='md' fontWeight='bold'>
                      Rol
                    </Text>
                    <Text fontSize='md'>{user.role}</Text>
                  </Flex>
                </Flex>
                <Divider />
                <ButtonGroup mt='auto' isAttached size='sm' variant='outline' w='full'>
                  <Button w='full' colorScheme='blue' onClick={() => handlerEditUser(user.id_user)}>
                    Edit
                  </Button>
                  <Button w='full' colorScheme='blue' onClick={() => handlerDeleteUser(user.id_user)}>
                    Delete
                  </Button>
                </ButtonGroup>
              </Flex>
            </GridItem>
          ))
        ) : (
          <GridItem colSpan={6} rowSpan={1} bg='white' rounded='lg' shadow='md'>
            <Flex direction='column' justify='center' align='center' py='4rem' px='2rem'>
              <Text fontSize='lg' fontWeight='bold' textTransform='uppercase'>
                No se encontraron usuarios
              </Text>
            </Flex>
          </GridItem>
        )}
      </Grid>
      <ButtonGroup shadow='md' size='sm' isAttached variant='outline' w='full' colorScheme='blue' bg='white' rounded='lg'>
        <Button w='full' onClick={(e) => handlerPagination(e)} value='prev' disabled={pagination === 0 || !users[pagination]}>
          Prev
        </Button>
        <Button w='full' onClick={(e) => handlerPagination(e)} value='next' disabled={pagination === users.length - 1 || !users[pagination]}>
          Next
        </Button>
      </ButtonGroup>
    </MainContainer>
  );
};

// This gets called on every request
export const getServerSideProps: GetServerSideProps<{ data: User[] }> = async (context: GetServerSidePropsContext) => {
  try {
    const { req, res } = context;
    const session = await unstable_getServerSession(req, res, authOptions);

    if (!session) {
      return {
        redirect: {
          destination: '/login',
          permanent: false,
        },
      };
    }

    // Fetch data from external API
    const resUsers = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/users`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });

    const data: User[] = await resUsers.data;

    // Pass data to the page via props
    return { props: { data } };
  } catch (e: Error | AxiosError | any) {
    return { props: { data: [] as User[] } };
  }
};

export default Users;
