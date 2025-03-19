// utils/api-service.ts
import { getSession } from "next-auth/react";

const BASE_URL = process.env.NEXT_PUBLIC_RESOURCE_SERVER_URL || "http://localhost:8080";

interface FetchOptions extends RequestInit {
  token?: string;
}

export async function fetchWithAuth(url: string, options: FetchOptions = {}) {
  const session = await getSession();
  
  if (!session?.accessToken && !options.token) {
    throw new Error("No authentication token available");
  }
  
  const token = options.token || session?.accessToken;
  
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
    Authorization: `Bearer ${token}`,
  };
  
  const response = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers,
  });
  
  // 401 상태코드면 세션 만료로 간주
  if (response.status === 401) {
    throw new Error("Authentication failed: Token may have expired");
  }
  
  return response;
}

export async function getUserInfo() {
  const response = await fetchWithAuth("/api/user-info");
  
  if (!response.ok) {
    throw new Error(`Failed to get user info: ${response.status}`);
  }
  
  return response.json();
}

export async function getMessages() {
  const response = await fetchWithAuth("/api/messages");
  
  if (!response.ok) {
    throw new Error(`Failed to get messages: ${response.status}`);
  }
  
  return response.json();
}