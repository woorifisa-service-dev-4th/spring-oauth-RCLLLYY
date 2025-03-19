"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SignIn() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const error = searchParams.get("error");

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">로그인</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>로그인 중 오류가 발생했습니다: {error}</p>
          </div>
        )}
        
        <div className="space-y-4">
          <p className="text-center text-gray-600 mb-4">
            OAuth2 인증으로 로그인하여 리소스에 접근하세요
          </p>
          
          <button
            onClick={() => {
              console.log("Login attempt with oauth2 provider");
              console.log("Using OAuth issuer:", process.env.NEXT_PUBLIC_OAUTH_ISSUER || "Not set");
              signIn("oauth2", { 
                redirect: true,
                callbackUrl: window.location.origin 
              }).catch(err => {
                console.error("SignIn error:", err);
              });
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            로그인
          </button>
          
          <div className="text-center mt-4">
            <button
              onClick={() => router.push("/")}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              홈으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
