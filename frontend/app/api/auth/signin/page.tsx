"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function SignIn() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // const callbackUrl = searchParams.get("callbackUrl") || "/";
  const error = searchParams.get("error");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn("oauth2", { 
        callbackUrl: "http://localhost:3000/api/auth/callback/oauth2",
        redirect: true
      });
    } catch (err) {
      console.error("로그인 오류:", err);
    } finally {
      setIsLoading(false);
    }
  };

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
            onClick={handleSignIn}
            disabled={isLoading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "로그인 중..." : "OAuth2 로그인"}
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