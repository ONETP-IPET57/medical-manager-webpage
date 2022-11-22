import CredentialsProvider from 'next-auth/providers/credentials';
import NextAuth, { Session } from 'next-auth';
import type { NextAuthOptions } from 'next-auth';
import axios from 'axios';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text', placeholder: 'Username' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        try {
          const res = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/api/login`,
            JSON.stringify({
              username: credentials?.username,
              password: credentials?.password,
            }),
            {
              headers: {
                accept: '*/*',
                'Content-Type': 'application/json',
              },
            }
          );
          const user = res.data;

          if (res.status === 200 && user) {
            return user;
          }
          return null;
        } catch (e) {
          // console.log(e);
          return null;
        }
      },
    }),
  ],
  jwt: {
    secret: process.env.NEXT_PUBLIC_JWT_SECRET,
  },
  callbacks: {
    // Getting the JWT token from API response
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.user = user;
      }

      return token;
    },

    async session({ session, token, user }) {
      if (token) {
        session.accessToken = token.accessToken;
        session.user = token.user;
      }
      /* try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/user`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.accessToken}`,
            Cookie: `access_token_cookie=${session.accessToken}`,
          },
        });
        const user = res.data;
        console.log(user);

        if (res.status === 200 && user) {
          session.user = user;
        } else {
          return {} as Session;
        }
      } catch (e) {
        console.log(e);
        return {} as Session;
      } */

      return session;
    },
  },

  pages: {
    signIn: '/login', // Changing the error redirect page to our custom login page
  },
};

export default NextAuth(authOptions);
