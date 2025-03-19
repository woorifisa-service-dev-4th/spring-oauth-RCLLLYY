"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function AuthError() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">인증 오류</h1>
        
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>인증 중 오류가 발생했습니다: {error || "알 수 없는 오류"}</p>
        </div>
        
        <div className="text-center mt-6">
          <button
            onClick={() => router.push("/auth/signin")}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            다시 로그인
          </button>
          
          <button
            onClick={() => router.push("/")}
            className="ml-4 text-sm text-gray-600 hover:text-gray-800"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}
