// utils/api-service.tsx
import { getSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

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
    
    // 401 상태코드면 인증 오류
    if (response.status === 401) {
      // 세션이 만료된 경우 로그아웃 처리
      await signOut({ redirect: false });
      window.location.href = "/unauthorized?type=unauthorized";
      throw new Error("인증 실패: 토큰이 만료되었거나 유효하지 않습니다");
    }

    // 403 상태코드면 접근 권한 없음
    if (response.status === 403) {
      window.location.href = "/unauthorized?type=forbidden";
      throw new Error("접근 권한이 없습니다");
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

// 기존 API 함수들...

// 관리자 대시보드 데이터 가져오기 함수 추가
export async function getAdminDashboard() {
  try {
    const response = await fetchWithAuth("/api/admin/dashboard");
    return response.json();
  } catch (error) {
    console.error("관리자 데이터 가져오기 실패:", error);
    throw error;
  }
}

// 사용자 목록 가져오기 함수 추가
export async function getUsers() {
  try {
    const response = await fetchWithAuth("/api/admin/users");
    return response.json();
  } catch (error) {
    console.error("사용자 목록 가져오기 실패:", error);
    throw error;
  }
}