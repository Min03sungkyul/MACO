// Login (Auth.js v5). 기획서 A1: 카카오·네이버 로그인 + 시연용 계정. Each provider turns on as soon as
// its keys are in .env.local (or Netlify env); until then the demo account lets the team use the app.
//
//   AUTH_SECRET=...            (already generated in .env.local)
//   AUTH_KAKAO_ID=...          Kakao REST API key
//   AUTH_KAKAO_SECRET=...      Kakao client secret
//   AUTH_NAVER_ID=...          Naver Login client ID
//   AUTH_NAVER_SECRET=...      Naver Login client secret
//   AUTH_APPLE_ID=...          Apple Services ID (optional)
//   AUTH_APPLE_SECRET=...      Apple client secret (JWT)
//   MACO_TEST_LOGIN=off        hide the test account (e.g. for the final demo)

import NextAuth from 'next-auth';
import type { Provider } from 'next-auth/providers';
import Kakao from 'next-auth/providers/kakao';
import Apple from 'next-auth/providers/apple';
import Naver from 'next-auth/providers/naver';
import Credentials from 'next-auth/providers/credentials';

const providers: Provider[] = [];
if (process.env.AUTH_KAKAO_ID && process.env.AUTH_KAKAO_SECRET) providers.push(Kakao);
if (process.env.AUTH_NAVER_ID && process.env.AUTH_NAVER_SECRET) providers.push(Naver);
if (process.env.AUTH_APPLE_ID && process.env.AUTH_APPLE_SECRET) providers.push(Apple);
if (process.env.MACO_TEST_LOGIN !== 'off') {
  providers.push(
    Credentials({
      id: 'test',
      name: '시연용 계정',
      credentials: { name: { label: '이름' } },
      authorize: async (c) => {
        const name = String(c?.name ?? '').trim().slice(0, 20) || '테스트 사장님';
        return { id: `test-${name}`, name };
      },
    }),
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers,
  session: { strategy: 'jwt' },
  trustHost: true, // lets the phone open the app at the computer's Wi-Fi address
  pages: { signIn: '/start', error: '/start' },
});

/** Which login buttons can work right now (used by the sign-up sheet). */
export const enabledLogins = {
  kakao: providers.some((p) => (typeof p === 'function' ? p() : p).id === 'kakao'),
  naver: providers.some((p) => (typeof p === 'function' ? p() : p).id === 'naver'),
  apple: providers.some((p) => (typeof p === 'function' ? p() : p).id === 'apple'),
  test: process.env.MACO_TEST_LOGIN !== 'off',
};
