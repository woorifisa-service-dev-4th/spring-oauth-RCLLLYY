// utils/api-service.tsx
import { getSession } from "next-auth/react";

const BASE_URL = process.env.NEXT_PUBLIC_RESOURCE_SERVER_URL || "http://localhost:8080";

interface FetchOptions extends RequestInit {
  token?: string;
}

export async function fetchWithAuth(url: string, options: FetchOptions = {}) {
  const session = await getSession();
  
  if (!session?.accessToken && !options.token) {
    throw new Error("인증 토큰이 없습니다");
  }
  
  const token = options.token || session?.accessToken;
  
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
    Authorization: `Bearer ${token}`,
  };
  
  try {
    const response = await fetch(`${BASE_URL}${url}`, {
      ...options,
      headers,
    });
    
    // 401 상태코드면 세션 만료로 간주
    if (response.status === 401) {
      throw new Error("인증 실패: 토큰이 만료되었거나 유효하지 않습니다");
    }

    // 다른 에러 상태 코드 처리
    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status}`);
    }
    
    return response;
  } catch (error) {
    console.error("API 요청 중 오류 발생:", error);
    throw error;
  }
}

export async function getUserInfo() {
  try {
    const response = await fetchWithAuth("/api/user-info");
    return response.json();
  } catch (error) {
    console.error("사용자 정보 가져오기 실패:", error);
    throw error;
  }
}

export async function getMessages() {
  try {
    const response = await fetchWithAuth("/api/messages");
    return response.json();
  } catch (error) {
    console.error("메시지 가져오기 실패:", error);
    throw error;
  }
}