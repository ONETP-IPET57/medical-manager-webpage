import NextAuth, { DefaultSession } from 'next-auth';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth/jwt' {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    accessToken: string;
    user: {
      accessToken: string;
      email: string;
      username: string;
      role: string;
    };
  }
}

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      accessToken: string;
      email: string;
      username: string;
      role: string;
    } & DefaultSession['user'];
    accessToken: string;
  }

  interface User {
    accessToken: string;
    email: string;
    username: string;
    role: string;
  }
}
