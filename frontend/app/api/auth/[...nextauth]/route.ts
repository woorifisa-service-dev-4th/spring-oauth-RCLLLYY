// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { JWT } from "next-auth/jwt";
import OAuth2Provider from "next-auth/providers/oauth2";

interface Token extends JWT {
  accessToken?: string;
  refreshToken?: string;
  accessTokenExpires?: number;
  error?: string;
}

// 토큰의 만료 여부 확인
const isTokenExpired = (token: Token) => {
  if (!token.accessTokenExpires) return true;
  return Math.floor(Date.now() / 1000) >= token.accessTokenExpires;
};

// 리프레시 토큰으로 액세스 토큰 갱신
async function refreshAccessToken(token: Token) {
  try {
    const response = await fetch(`${process.env.OAUTH_ISSUER}/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${process.env.OAUTH_CLIENT_ID}:${process.env.OAUTH_CLIENT_SECRET}`
        ).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: token.refreshToken as string,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw data;
    }

    return {
      ...token,
      accessToken: data.access_token,
      refreshToken: data.refresh_token ?? token.refreshToken,
      accessTokenExpires: Math.floor(Date.now() / 1000) + data.expires_in,
    };
  } catch (error) {
    console.error("RefreshAccessToken error", error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

const handler = NextAuth({
  providers: [
    OAuth2Provider({
      id: "oauth2",
      name: "OAuth 2.0",
      clientId: process.env.OAUTH_CLIENT_ID,
      clientSecret: process.env.OAUTH_CLIENT_SECRET,
      issuer: process.env.OAUTH_ISSUER,
      authorization: {
        url: `${process.env.OAUTH_ISSUER}/oauth2/authorize`,
        params: {
          scope: "openid profile message.read",
          response_type: "code",
        },
      },
      token: `${process.env.OAUTH_ISSUER}/oauth2/token`,
      userinfo: `${process.env.OAUTH_ISSUER}/userinfo`,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      // 최초 로그인 시 토큰 정보 저장
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.accessTokenExpires = Math.floor(Date.now() / 1000) + (account.expires_in as number);
        return token;
      }

      // 토큰이 만료되지 않았으면 그대로 반환
      if (!isTokenExpired(token)) {
        return token;
      }

      // 토큰이 만료되었으면 리프레시
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.error = token.error;
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  debug: process.env.NODE_ENV === "development",
});

export { handler as GET, handler as POST };