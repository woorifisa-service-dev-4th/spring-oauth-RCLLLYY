// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import { JWT } from "next-auth/jwt";

interface Token extends JWT {
  accessToken?: string;
  refreshToken?: string;
  accessTokenExpires?: number;
  error?: string;
}

// 토큰의 만료 여부 확인
const isTokenExpired = (token: Token) => {
  if (!token.accessTokenExpires) return true;
  return Math.floor(Date.now() / 1000) >= (token.accessTokenExpires - 10);
};

// 리프레시 토큰으로 액세스 토큰 갱신
async function refreshAccessToken(token: Token) {
  try {
    if (!token.refreshToken) {
      throw new Error("No refresh token available");
    }

    const tokenEndpoint = `${process.env.OAUTH_ISSUER}/oauth2/token`;
    const authHeader = Buffer.from(
      `${process.env.OAUTH_CLIENT_ID}:${process.env.OAUTH_CLIENT_SECRET}`
    ).toString("base64");
    
    const response = await fetch(tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${authHeader}`,
        Accept: "application/json",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: token.refreshToken,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to refresh token: ${response.status}`);
    }

    const data = await response.json();
    return {
      ...token,
      accessToken: data.access_token,
      refreshToken: data.refresh_token ?? token.refreshToken,
      accessTokenExpires: Math.floor(Date.now() / 1000) + (data.expires_in || 3600),
    };
  } catch (error) {
    console.error("RefreshAccessToken error", error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

const config: NextAuthConfig = {
  providers: [
    {
      id: "oauth2",
      name: "OAuth 2.0",
      type: "oauth",
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
          name: profile.name || profile.sub,
          email: profile.email,
          image: profile.picture,
        };
      },
    },
  ],
  callbacks: {
    async jwt({ token, account }) {
      // 최초 로그인 시 토큰 정보 저장
      if (account) {
        console.log("Initial sign-in, storing tokens");
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.accessTokenExpires = Math.floor(Date.now() / 1000) + (account.expires_in as number);
        
        // 토큰 디코딩하여 권한 정보 가져오기
        try {
          const tokenParts = account.access_token.split('.');
          const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
          token.authorities = payload.authorities;
        } catch (err) {
          console.error("Failed to parse token:", err);
        }
        
        return token;
      }
      
      // 토큰이 만료되지 않았으면 그대로 반환
      if (!isTokenExpired(token as Token)) {
        return token;
      }

      console.log("Token expired, attempting refresh");
      // 토큰이 만료되었으면 리프레시
      return refreshAccessToken(token as Token);
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.error = token.error;
      session.authorities = token.authorities; // 권한 정보 세션에 추가
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(config);
export { handler as GET, handler as POST };