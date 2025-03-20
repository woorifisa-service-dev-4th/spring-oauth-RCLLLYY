"use client";

import { SessionProvider, useSession, signOut, signIn } from "next-auth/react";
import { useEffect } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthWatcher />
      {children}
    </SessionProvider>
  );
}

export function AuthWatcher() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (session?.error === "RefreshAccessTokenError") {
      console.log("🔴 세션 만료됨 → Spring Security 로그아웃 실행");

      alert("세션이 만료되었습니다. 다시 로그인해주세요.");

      // ✅ 백엔드 로그아웃 API 호출
      fetch("/api/auth/logout", { method: "GET" }).finally(() => {
        signOut({ redirect: false }).then(() => {
          // signIn("oauth2")
          // window.location.href = "http://localhost:9000/login"; // ✅ 로그인 페이지로 이동
        });
      });
    }
  }, [status, session]);

  return null;
}