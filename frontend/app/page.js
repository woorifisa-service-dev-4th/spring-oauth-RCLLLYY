// app/page.tsx
"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect, useState } from "react";

export default function Home() {
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (session?.accessToken) {
      fetchMessages();
    }
  }, [session]);

  const fetchMessages = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_RESOURCE_SERVER_URL || "http://localhost:8080"}/api/messages`, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      setMessages(data);
    } catch (err) {
      setError(`Failed to fetch messages: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return <div className="container mx-auto p-6">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
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
            <h2 className="text-xl font-semibold">환영합니다, {session.user?.name || "사용자"}님!</h2>
            <button
              onClick={() => signOut()}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            >
              로그아웃
            </button>
          </div>
          
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