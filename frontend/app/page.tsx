"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import router from "next/router";
import { useEffect, useState } from "react";

export default function Home() {
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    if (session?.accessToken) {
      fetchMessages();
      // 토큰에서 권한 정보 추출
      try {
        const tokenParts = session.accessToken.split('.');
        const payload = JSON.parse(atob(tokenParts[1]));
        
        if (payload.authorities && payload.authorities.includes('ROLE_ADMIN')) {
          setUserRole('ADMIN');
        } else if (payload.authorities && payload.authorities.includes('ROLE_USER')) {
          setUserRole('USER');
        }
      } catch (err) {
        console.error("Failed to parse token:", err);
      }
    }
  }, [session]);

  const fetchMessages = async () => {
    // 기존 코드 유지
  };

  if (status === "loading") {
    return <div className="container mx-auto p-6">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      {userRole === 'ADMIN' && (
        <div className="mb-6 bg-red-50 p-4 rounded-lg border border-red-200">
          <h3 className="text-lg font-medium mb-2 text-red-700">관리자 기능</h3>
          <p className="mb-2">관리자 권한이 있습니다. 아래 버튼을 클릭하여 관리자 기능에 접근할 수 있습니다.</p>
          <button 
            onClick={() => router.push("/admin")}
            className="mt-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            관리자 대시보드
          </button>
        </div>
      )}      
      <h1 className="text-3xl font-bold mb-6">OAuth2 Demo</h1>
      
      {!session ? (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">로그인이 필요합니다</h2>
          <p className="mb-4">보호된 리소스에 접근하려면 로그인하세요.</p>
          <button
            onClick={() => signIn("oauth2")}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            로그인
          </button>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">
              환영합니다, {session.user?.name || "사용자"}님! 
              {userRole === 'ADMIN' && <span className="ml-2 text-red-600">(관리자)</span>}
            </h2>
            <button
              onClick={() => signOut()}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            >
              로그아웃
            </button>
          </div>
          
          {/* 관리자 전용 콘텐츠 */}
          {userRole === 'ADMIN' && (
            <div className="mb-6 bg-red-50 p-4 rounded-lg border border-red-200">
              <h3 className="text-lg font-medium mb-2 text-red-700">관리자 전용 콘텐츠</h3>
              <p>이 콘텐츠는 관리자 권한을 가진 사용자만 볼 수 있습니다.</p>
              <button className="mt-2 bg-red-500 text-white px-3 py-1 rounded">
                관리자 기능
              </button>
            </div>
          )}
          
          {/* 모든 사용자 콘텐츠 */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">보호된 메시지</h3>
            {loading ? (
              <p>메시지 로딩 중...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : messages.length > 0 ? (
              <ul className="border rounded-lg divide-y">
                {messages.map((message) => (
                  <li key={message.id} className="p-4">
                    <p className="font-medium">{message.text}</p>
                    <p className="text-sm text-gray-500">{new Date(message.timestamp).toLocaleString()}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>메시지가 없습니다.</p>
            )}
          </div>
          
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-2">세션 정보</h3>
            <pre className="text-sm overflow-x-auto">
              {JSON.stringify(session, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}