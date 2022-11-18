import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { ChakraProvider } from '@chakra-ui/react';
import { SessionProvider } from 'next-auth/react';
import { AppCointainer } from '../components/layouts/AppContainer';

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <ChakraProvider>
      <SessionProvider session={session}>
        <AppCointainer>
          <Component {...pageProps} />
        </AppCointainer>
      </SessionProvider>
    </ChakraProvider>
  );
}

export default MyApp;
