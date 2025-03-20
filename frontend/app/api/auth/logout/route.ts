import { NextResponse } from "next/server";

export async function GET() {
  try {
    // ✅ Spring Security 로그아웃 요청 (리디렉트 방지)
    const logoutResponse = await fetch("http://localhost:9000/logout", {
      method: "POST",
      credentials: "include", // JSESSIONID 포함
      redirect: "manual", // 🚀 리디렉트 방지
      mode: "cors",
    });

    if (!logoutResponse.ok && logoutResponse.status !== 302) {
      throw new Error(`Spring Security 로그아웃 실패: ${logoutResponse.status}`);
    }

    console.log("✅ Spring Security 로그아웃 성공");

    // ✅ Next.js의 쿠키 제거 (JSESSIONID 삭제)
    const response = NextResponse.json({ message: "Logged out" }, { status: 200 });
    response.headers.set("Set-Cookie", "JSESSIONID=; Path=/; Max-Age=0; HttpOnly");

    return response;
  } catch (error) {
    console.error("🚨 Logout failed:", error);
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
