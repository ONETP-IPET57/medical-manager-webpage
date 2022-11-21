import { useCallback, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import { Zones } from '../pages/zones';
import { Nurses } from '../pages/nurses';

export type msgBlueCode = {
  availableZone: Zones;
  availableNurses: Nurses[];
};

export type msgConfirmNurse = {
  nursesStates: confirmNurse[];
};

export type confirmNurse = {
  dni_enfermero: string;
  state: string;
};

export type useSocketType = {
  emitBlueCode: (msg: msgBlueCode) => void;
  emitConfirmNurse: (msg: msgConfirmNurse) => void;
  messageBlueCode: msgBlueCode;
  messageConfirmNurse: msgConfirmNurse;
};

export const useSocket = () => {
  const [messageBlueCode, setMessageBlueCode] = useState<msgBlueCode>({} as msgBlueCode);
  const [messageConfirmNurse, setMessageConfirmNurse] = useState<msgConfirmNurse>({ nursesStates: [] as confirmNurse[] });
  const [socket, setSocket] = useState<Socket>(io('http://localhost:3001'));

  const emitBlueCode = useCallback(
    (msg: msgBlueCode) => {
      setMessageConfirmNurse({ nursesStates: [] as confirmNurse[] });
      setMessageBlueCode({} as msgBlueCode);
      socket.emit('createdBlueCodeAlert', msg);
      console.log('emitBlueCode', msg);
    },
    [socket]
  );

  const emitConfirmNurse = useCallback(
    (msg: msgConfirmNurse) => {
      socket.emit('createdConfirmNurse', msg);
      console.log('emitBlueCode', msg);
    },
    [socket]
  );

  useEffect(() => {
    setSocket(io('http://localhost:3001'));

    socket.on('error', (socket) => {
      console.log(socket);
      console.log('error');
    });

    socket.on('newIncomingBlueCodeAlert', (msg) => {
      setMessageBlueCode(msg);
      console.log(msg);
    });

    socket.on('newIncomingConfirmNurse', (msg) => {
      setMessageConfirmNurse(msg);
      console.log(msg);
    });
  }, []);

  return { messageBlueCode, messageConfirmNurse, emitBlueCode, emitConfirmNurse };
};
