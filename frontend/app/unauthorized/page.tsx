"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function UnauthorizedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [errorType, setErrorType] = useState<string>("unauthorized");
  const [errorMessage, setErrorMessage] = useState<string>("인증이 필요한 페이지입니다.");

  useEffect(() => {
    const type = searchParams.get("type") || "unauthorized";
    setErrorType(type);
    
    if (type === "forbidden") {
      setErrorMessage("해당 리소스에 접근할 권한이 없습니다.");
    }
  }, [searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md">
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-red-100">
          <svg 
            className="w-8 h-8 text-red-600" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        
        <h1 className="mb-4 text-xl font-bold text-center text-gray-800">
          {errorType === "forbidden" ? "접근 거부됨" : "인증 필요"}
        </h1>
        
        <p className="mb-6 text-center text-gray-600">
          {errorMessage}
        </p>
        
        <div className="flex flex-col space-y-4">
          {!session ? (
            <button
              onClick={() => router.push("/auth/signin")}
              className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
            >
              로그인하기
            </button>
          ) : errorType === "forbidden" ? (
            <div className="text-center p-4 bg-yellow-50 rounded-md">
              <p className="text-sm text-yellow-700">
                현재 <strong>{session.user?.name}</strong> 계정으로 로그인되어 있습니다.
                해당 기능에 접근하려면 관리자 권한이 필요합니다.
              </p>
            </div>
          ) : null}
          
          <button
            onClick={() => router.push("/")}
            className="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}