// app/auth/error/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function Error() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-red-600">인증 오류</h1>
        
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-red-700">
            {error || "인증 과정에서 오류가 발생했습니다."}
          </p>
        </div>
        
        <p className="text-gray-600 mb-6">
          다시 시도하거나 관리자에게 문의하세요.
        </p>
        
        <div className="flex justify-center space-x-4">
          <Link 
            href="/auth/signin"
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
          >
            로그인 페이지
          </Link>
          
          <Link 
            href="/"
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded"
          >
            홈으로
          </Link>
        </div>
      </div>
    </div>
  );
}