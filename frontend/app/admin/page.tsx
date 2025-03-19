"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { getAdminDashboard, getUsers } from "../utils/api-service";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // 로그인 상태 확인
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    // 데이터 로드
    if (session?.accessToken) {
      loadAdminData();
    }
  }, [session, status, router]);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      // 관리자 대시보드 데이터 가져오기
      const dashboardResponse = await getAdminDashboard();
      setDashboardData(dashboardResponse);
      
      // 사용자 목록 가져오기
      const usersResponse = await getUsers();
      setUsers(usersResponse);
      
      setLoading(false);
    } catch (err) {
      // 오류는 api-service에서 자동으로 처리됨
      setLoading(false);
      setError("데이터 로딩 중 오류가 발생했습니다.");
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">로딩 중...</h2>
            <p className="text-gray-600">관리자 정보를 불러오고 있습니다.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">관리자 대시보드</h1>
      
      {error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      ) : null}
      
      {dashboardData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-2">전체 사용자</h2>
            <p className="text-3xl font-bold text-blue-600">{dashboardData.adminData.stats.totalUsers}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-2">활성 사용자</h2>
            <p className="text-3xl font-bold text-green-600">{dashboardData.adminData.stats.activeUsers}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-2">오늘 신규 가입자</h2>
            <p className="text-3xl font-bold text-purple-600">{dashboardData.adminData.stats.newUsersToday}</p>
          </div>
        </div>
      )}
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">사용자 목록</h2>
        
        {users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">사용자명</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이메일</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">역할</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{user.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{user.username}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${user.role === 'ADMIN' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                        {user.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">사용자 데이터가 없습니다.</p>
        )}
      </div>
      
      <div className="mt-6">
        <button
          onClick={() => router.push("/")}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded"
        >
          홈으로 돌아가기
        </button>
      </div>
    </div>
  );
}