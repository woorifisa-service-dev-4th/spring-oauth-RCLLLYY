import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    {
      id: "oauth2",
      name: "OAuth 2.0",
      type: "oauth",
      clientId: process.env.OAUTH_CLIENT_ID,
      clientSecret: process.env.OAUTH_CLIENT_SECRET,
      authorization: {
        url: `${process.env.OAUTH_ISSUER}/oauth2/authorize`,
        params: { 
          scope: "openid profile message.read",
          response_type: "code",
          redirect_uri: "http://localhost:3000/api/auth/callback/oauth2"  // 명시적으로 지정
        }
      },
      token: {
        url: `${process.env.OAUTH_ISSUER}/oauth2/token`,
        params: {
          redirect_uri: "http://localhost:3000/api/auth/callback/oauth2"  // 여기도 명시적으로 지정
        },        
        async request({ params, provider, client }) {
          // HTTP Basic 인증 사용
          const response = await fetch(provider.token?.url as string, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              "Authorization": `Basic ${Buffer.from(`${process.env.OAUTH_CLIENT_ID}:${process.env.OAUTH_CLIENT_SECRET}`).toString("base64")}`,
            },
            body: new URLSearchParams({
              ...params,
              grant_type: "authorization_code",
              redirect_uri: "http://localhost:3000/api/auth/callback/oauth2"  // 명시적으로 추가
            }),
          });
          
          if (!response.ok) {
            console.error(`토큰 교환 실패: ${response.status}`);
            const errorData = await response.text();
            console.error(`오류 세부정보: ${errorData}`);
            throw new Error(`HTTP 오류! 상태: ${response.status}`);
          }
          
          const tokens = await response.json();
          return { tokens };
        },
      },
      userinfo: {
        url: `${process.env.OAUTH_ISSUER}/userinfo`,
      },
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name || profile.preferred_username,
          email: profile.email,
          image: profile.picture
        };
      }
    }
  ],
  callbacks: {
    async jwt({ token, account }) {
      // 초기 로그인
      if (account) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpires: account.expires_at ? account.expires_at * 1000 : 0,
        };
      }
      
      // 토큰이 아직 유효한 경우 그대로 반환
      if (token.accessTokenExpires && Date.now() < token.accessTokenExpires) {
        return token;
      }
      
      // 토큰이 만료되었으면 갱신 시도
      try {
        const response = await fetch(`${process.env.OAUTH_ISSUER}/oauth2/token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": `Basic ${Buffer.from(`${process.env.OAUTH_CLIENT_ID}:${process.env.OAUTH_CLIENT_SECRET}`).toString("base64")}`,
          },
          body: new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: token.refreshToken as string,
          }),
        });
        
        const tokens = await response.json();
        
        if (!response.ok) throw tokens;
        
        return {
          ...token,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token ?? token.refreshToken,
          accessTokenExpires: Date.now() + tokens.expires_in * 1000,
        };
      } catch (error) {
        console.error("토큰 갱신 오류:", error);
        return { ...token, error: "RefreshAccessTokenError" };
      }
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.error = token.error;
      
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error"
  },
  debug: true,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };