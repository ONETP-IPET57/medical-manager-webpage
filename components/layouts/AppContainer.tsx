import Head from 'next/head';
import { createContext, PropsWithChildren } from 'react';
import { useSocket, useSocketType, msgConfirmNurse, confirmNurse } from '../../hooks/useSocket';
import { Nurses } from '../../pages/nurses';
import { Zones } from '../../pages/zones';

export const SocketContext = createContext<useSocketType>({
  messageBlueCode: { availableZone: {} as Zones, availableNurses: [] as Nurses[] },
  messageConfirmNurse: { nursesStates: [] as confirmNurse[] },
  emitBlueCode: (msg: { availableZone: Zones; availableNurses: Nurses[] }) => {},
  emitConfirmNurse: (msg: msgConfirmNurse) => {},
});

export const AppContainer: React.FunctionComponent<PropsWithChildren> = ({ children }: PropsWithChildren) => {
  const socketObject = useSocket();

  return (
    <>
      <Head>
        <title>Medical 57 Manager</title>
        <link rel='apple-touch-icon' sizes='180x180' href='/apple-touch-icon.png' />
        <link rel='icon' type='image/png' sizes='32x32' href='/favicon-32x32.png' />
        <link rel='icon' type='image/png' sizes='16x16' href='/favicon-16x16.png' />
        <link rel='manifest' href='/site.webmanifest' />
        <link rel='mask-icon' href='/safari-pinned-tab.svg' color='#5bbad5' />
        <meta name='msapplication-TileColor' content='#da532c' />
        <meta name='theme-color' content='#ffffff' />
      </Head>
      <SocketContext.Provider value={socketObject}>{children}</SocketContext.Provider>
    </>
  );
};
