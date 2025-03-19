// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { JWT } from "next-auth/jwt";
import { OAuthConfig } from "next-auth/providers";
import { Profile } from "next-auth";

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
    // Define token endpoint URL
    const tokenEndpoint = `${process.env.OAUTH_ISSUER}/oauth2/token`;
    
    console.log(`Refreshing token at: ${tokenEndpoint}`);
    
    // Create authorization header
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
        refresh_token: token.refreshToken as string,
      }),
    });

    // Check for non-JSON responses
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      console.error(`Invalid response content-type: ${contentType}`);
      console.error(`Response body: ${text.substring(0, 200)}`);
      throw new Error(`Non-JSON response from OAuth server: ${text.substring(0, 100)}...`);
    }

    const data = await response.json();

    if (!response.ok) {
      console.error("OAuth server error response:", data);
      throw new Error(`OAuth server returned ${response.status}: ${JSON.stringify(data)}`);
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
      token: {
        url: `${process.env.OAUTH_ISSUER}/oauth2/token`,
        async request({ client, params, checks, provider }) {
          const response = await client.oauthCallback(
            provider.callbackUrl,
            params,
            checks,
            {
              exchangeBody: {
                client_id: process.env.OAUTH_CLIENT_ID,
                client_secret: process.env.OAUTH_CLIENT_SECRET,
              },
              headers: {
                Accept: "application/json",
              },
            }
          );
          return { tokens: response };
        },
      },
      userinfo: {
        url: `${process.env.OAUTH_ISSUER}/userinfo`,
        async request({ tokens, provider }) {
          try {
            const res = await fetch(provider.userinfo?.url as string, {
              headers: {
                Authorization: `Bearer ${tokens.access_token}`,
                Accept: "application/json",
              },
            });
            
            if (!res.ok) {
              const errorText = await res.text();
              console.error(`Userinfo error: ${res.status}`, errorText);
              throw new Error(`Failed to fetch user info: ${res.status}`);
            }
            
            return await res.json();
          } catch (error) {
            console.error("Error fetching user profile:", error);
            throw error;
          }
        },
      },
      profile(profile: Profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
    } as OAuthConfig<Profile>,
  ],
  callbacks: {
    async jwt({ token, account }) {
      // 최초 로그인 시 토큰 정보 저장
      if (account) {
        console.log("Initial sign-in, storing tokens");
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.accessTokenExpires = Math.floor(Date.now() / 1000) + (account.expires_in as number);
        return token;
      }

      // 토큰이 만료되지 않았으면 그대로 반환
      if (!isTokenExpired(token)) {
        return token;
      }

      console.log("Token expired, attempting refresh");
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
  debug: true, // Always enable debug mode to see what's happening
});

export { handler as GET, handler as POST };