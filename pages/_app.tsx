import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { ChakraProvider } from '@chakra-ui/react';
import { SessionProvider } from 'next-auth/react';
import { AppContainer } from '../components/layouts/AppContainer';
import { appWithTranslation } from 'next-i18next';

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <ChakraProvider>
      <SessionProvider session={session}>
        <AppContainer>
          <Component {...pageProps} />
        </AppContainer>
      </SessionProvider>
    </ChakraProvider>
  );
}

export default appWithTranslation(MyApp);
