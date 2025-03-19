// // app/api/auth/[...nextauth]/route.ts
// import NextAuth from "next-auth";
// import { JWT } from "next-auth/jwt";
// import { OAuthConfig } from "next-auth/providers";
// import { Profile } from "next-auth";

// interface Token extends JWT {
//   accessToken?: string;
//   refreshToken?: string;
//   accessTokenExpires?: number;
//   error?: string;
// }

// // 토큰의 만료 여부 확인
// const isTokenExpired = (token: Token) => {
//   if (!token.accessTokenExpires) return true;
//   return Math.floor(Date.now() / 1000) >= token.accessTokenExpires;
// };

// // 리프레시 토큰으로 액세스 토큰 갱신
// async function refreshAccessToken(token: Token) {
//   try {
//     const tokenEndpoint = `${process.env.OAUTH_ISSUER}/oauth2/token`;
    
//     console.log(`Refreshing token at: ${tokenEndpoint}`);
    
//     // Create request body and headers directly
//     const response = await fetch(tokenEndpoint, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/x-www-form-urlencoded",
//         "Authorization": `Basic ${Buffer.from(`${process.env.OAUTH_CLIENT_ID}:${process.env.OAUTH_CLIENT_SECRET}`).toString("base64")}`,
//       },
//       body: new URLSearchParams({
//         grant_type: "refresh_token",
//         refresh_token: token.refreshToken as string,
//       }),
//     });

//     // Log HTTP response details for debugging
//     console.log(`Token refresh response status: ${response.status}`);
    
//     const contentType = response.headers.get("content-type");
//     if (!contentType || !contentType.includes("application/json")) {
//       const text = await response.text();
//       console.error(`Invalid response content-type: ${contentType}`);
//       console.error(`Response body: ${text.substring(0, 200)}`);
//       throw new Error(`Non-JSON response from OAuth server: ${text.substring(0, 100)}...`);
//     }

//     const data = await response.json();

//     if (!response.ok) {
//       console.error("OAuth server error response:", data);
//       throw new Error(`OAuth server returned ${response.status}: ${JSON.stringify(data)}`);
//     }

//     return {
//       ...token,
//       accessToken: data.access_token,
//       refreshToken: data.refresh_token ?? token.refreshToken,
//       accessTokenExpires: Math.floor(Date.now() / 1000) + data.expires_in,
//     };
//   } catch (error) {
//     console.error("RefreshAccessToken error", error);
//     return {
//       ...token,
//       error: "RefreshAccessTokenError",
//     };
//   }
// }

// const handler = NextAuth({
//   providers: [
//     {
//       id: "oauth2",
//       name: "OAuth 2.0",
//       type: "oauth",
//       clientId: process.env.OAUTH_CLIENT_ID,
//       clientSecret: process.env.OAUTH_CLIENT_SECRET,
//       authorization: {
//         url: `${process.env.OAUTH_ISSUER}/oauth2/authorize`,
//         params: {
//           scope: "openid profile message.read",
//           response_type: "code",
//         },
//       },
//       token: {
//         url: `${process.env.OAUTH_ISSUER}/oauth2/token`,
//         // Explicitly specify how to handle the token exchange
//         async request({ params, provider, client }) {
//           console.log("Token exchange request - clientId:", process.env.OAUTH_CLIENT_ID);
          
//           // Build the request manually to ensure correct client authentication
//           const response = await fetch(provider.token?.url as string, {
//             method: "POST",
//             headers: {
//               "Content-Type": "application/x-www-form-urlencoded",
//               "Authorization": `Basic ${Buffer.from(`${process.env.OAUTH_CLIENT_ID}:${process.env.OAUTH_CLIENT_SECRET}`).toString("base64")}`,
//             },
//             body: new URLSearchParams({
//               ...params,
//               grant_type: "authorization_code",
//               client_id: process.env.OAUTH_CLIENT_ID as string,
//               // Don't include client_secret in body when using Basic auth
//             }),
//           });

//           // Log HTTP response details for debugging
//           console.log(`Token exchange response status: ${response.status}`);
          
//           if (!response.ok) {
//             // Log the error response for debugging
//             try {
//               const errorData = await response.json();
//               console.error("Token exchange error:", errorData);
//             } catch (e) {
//               const text = await response.text();
//               console.error("Token exchange error (text):", text);
//             }
//             throw new Error(`HTTP error! Status: ${response.status}`);
//           }

//           const tokens = await response.json();
//           return { tokens };
//         },
//       },
//       userinfo: {
//         url: `${process.env.OAUTH_ISSUER}/userinfo`,
//       },
//       profile(profile) {
//         return {
//           id: profile.sub,
//           name: profile.name || profile.preferred_username,
//           email: profile.email,
//           image: profile.picture,
//         };
//       },
//     } as OAuthConfig<Profile>,
//   ],
//   callbacks: {
//     async jwt({ token, account }) {
//       // Initial sign-in
//       if (account) {
//         console.log("Initial sign-in, storing tokens");
//         return {
//           ...token,
//           accessToken: account.access_token,
//           refreshToken: account.refresh_token,
//           accessTokenExpires: account.expires_at ? account.expires_at * 1000 : 0,
//         };
//       }

//       // Return previous token if not expired
//       if (!isTokenExpired(token)) {
//         return token;
//       }

//       // Token expired, try to refresh
//       console.log("Token expired, attempting refresh");
//       return refreshAccessToken(token);
//     },
//     async session({ session, token }) {
//       session.accessToken = token.accessToken;
//       session.error = token.error;
      
//       return session;
//     },
//   },
//   pages: {
//     signIn: "/auth/signin",
//     error: "/auth/error",
//   },
//   debug: true,
// });

// export { handler as GET, handler as POST };


// app/api/auth/[...nextauth]/route.ts
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
          response_type: "code" 
        }
      },
      token: `${process.env.OAUTH_ISSUER}/oauth2/token`,
      userinfo: `${process.env.OAUTH_ISSUER}/userinfo`,
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
  debug: true,
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error"
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };