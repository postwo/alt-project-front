'use client';

import { useState, useEffect } from 'react';
import axiosInstance from '../../apis/axiosInstance';

// 관리자 통계 데이터
interface AdminStats {
  totalUsers: number;
  totalPosts: number;
  activePosts: number;
  completedPosts: number;
  totalRevenue: number;
  monthlyGrowth: number;
}

interface User {
  id: number;
  name: string;
  email: string;
  joinDate: string;
  postsCount: number;
  participationCount: number;
  status: 'active' | 'suspended';
  profileImage: string;
  location: string;
}

interface Post {
  id: number;
  title: string;
  author: string;
  category: string;
  totalPrice: number;
  currentParticipants: number;
  maxParticipants: number;
  location: string;
  deadline: string;
  status: 'active' | 'reported' | 'completed';
  createdAt: string;
  reportCount: number;
}

const getTimeUntilDeadline = (deadline: string) => {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const diff = deadlineDate.getTime() - now.getTime();

  if (diff <= 0) {
    return { isExpired: true, timeText: '마감됨' };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days > 0) {
    return { isExpired: false, timeText: `${days}일 남음` };
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours > 0) {
    return { isExpired: false, timeText: `${hours}시간 남음` };
  }

  const minutes = Math.floor(diff / (1000 * 60));
  return { isExpired: false, timeText: `${minutes}분 남음` };
};

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);

  // API 데이터 상태
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 여러 API를 동시에 호출
        const [statsRes, usersRes, postsRes] = await Promise.all([
          axiosInstance.get('/api/admin/stats'), // 통계 API 엔드포인트 (예시)
          axiosInstance.get('/api/admin/users'), // 사용자 목록 API 엔드포인트 (예시)
          axiosInstance.get('/api/admin/posts'), // 게시글 목록 API 엔드포인트 (예시)
        ]);

        setAdminStats(statsRes.data.data);
        setUsers(usersRes.data.data);
        setPosts(postsRes.data.data);
      } catch (error) {
        console.error('관리자 데이터를 불러오는 데 실패했습니다:', error);
        alert('데이터를 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleUserAction = (
    userId: number,
    action: 'suspend' | 'activate' | 'delete'
  ) => {
    console.log(`User ${userId} action: ${action}`);
    // 실제 구현에서는 API 호출
  };

  const handlePostAction = (
    postId: number,
    action: 'approve' | 'reject' | 'delete'
  ) => {
    console.log(`Post ${postId} action: ${action}`);
    // 실제 구현에서는 API 호출
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">관리자 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // adminStats가 null일 경우를 대비
  const safeAdminStats = adminStats || {
    totalUsers: 0,
    totalPosts: 0,
    activePosts: 0,
    monthlyGrowth: 0,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <main className="py-6 sm:py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* 페이지 헤더 */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              관리자 대시보드
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              알뜰모아 플랫폼 관리
            </p>
          </div>

          {/* 통계 카드 */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-white/80 backdrop-blur-sm border-blue-100 border rounded-lg shadow-md">
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      총 사용자
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-blue-600">
                      {safeAdminStats.totalUsers.toLocaleString()}
                    </p>
                  </div>
                  <span className="w-8 h-8 text-blue-600">👥</span>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm border-emerald-100 border rounded-lg shadow-md">
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      총 게시글
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-emerald-600">
                      {safeAdminStats.totalPosts}
                    </p>
                  </div>
                  <span className="w-8 h-8 text-emerald-600">📄</span>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm border-orange-100 border rounded-lg shadow-md">
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">진행 중</p>
                    <p className="text-2xl sm:text-3xl font-bold text-orange-600">
                      {safeAdminStats.activePosts}
                    </p>
                  </div>
                  <span className="w-8 h-8 text-orange-600">📈</span>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm border-red-100 border rounded-lg shadow-md">
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      신고된 글
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-red-600">
                      {posts.filter((p) => p.reportCount > 0).length}
                    </p>
                  </div>
                  <span className="w-8 h-8 text-red-600">⚠️</span>
                </div>
              </div>
            </div>
          </div>

          {/* 탭 메뉴 */}
          <div className="w-full">
            <div className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm border rounded-md">
              <button
                onClick={() => setActiveTab('overview')}
                className={`p-2 rounded-md ${
                  activeTab === 'overview' ? 'bg-slate-600 text-white' : ''
                }`}
              >
                개요
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`p-2 rounded-md ${
                  activeTab === 'users' ? 'bg-slate-600 text-white' : ''
                }`}
              >
                사용자 관리
              </button>
              <button
                onClick={() => setActiveTab('posts')}
                className={`p-2 rounded-md ${
                  activeTab === 'posts' ? 'bg-slate-600 text-white' : ''
                }`}
              >
                게시글 관리
              </button>
            </div>

            {/* 개요 탭 */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 최근 활동 */}
                <div className="bg-white/80 backdrop-blur-sm border rounded-lg shadow-md">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold">최근 활동</h3>
                  </div>
                  <div className="p-6 pt-0">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                        <span className="w-5 h-5 text-emerald-600">✓</span>
                        <div className="flex-1">
                          <p className="text-sm font-medium">새 게시글 등록</p>
                          <p className="text-xs text-gray-500">
                            김나눔님이 "유기농 양배추" 게시글을 등록했습니다
                          </p>
                        </div>
                        <span className="text-xs text-gray-400">2시간 전</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                        <span className="w-5 h-5 text-blue-600">👥</span>
                        <div className="flex-1">
                          <p className="text-sm font-medium">새 사용자 가입</p>
                          <p className="text-xs text-gray-500">
                            정공구님이 가입했습니다
                          </p>
                        </div>
                        <span className="text-xs text-gray-400">4시간 전</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                        <span className="w-5 h-5 text-red-600">⚠️</span>
                        <div className="flex-1">
                          <p className="text-sm font-medium">신고 접수</p>
                          <p className="text-xs text-gray-500">
                            "의심스러운 상품 판매" 게시글이 신고되었습니다
                          </p>
                        </div>
                        <span className="text-xs text-gray-400">6시간 전</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 월별 통계 */}
                <div className="bg-white/80 backdrop-blur-sm border rounded-lg shadow-md">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold">월별 통계</h3>
                  </div>
                  <div className="p-6 pt-0">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium">신규 사용자</span>
                        <span className="text-lg font-bold text-blue-600">
                          +127
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium">새 게시글</span>
                        <span className="text-lg font-bold text-emerald-600">
                          +23
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium">완료된 나눔</span>
                        <span className="text-lg font-bold text-orange-600">
                          +18
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium">성장률</span>
                        <span className="text-lg font-bold text-green-600">
                          +{safeAdminStats.monthlyGrowth}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 사용자 관리 탭 */}
            {activeTab === 'users' && (
              <div className="bg-white/80 backdrop-blur-sm border rounded-lg shadow-md mt-6">
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <h3 className="text-lg font-semibold">사용자 관리</h3>
                    <div className="relative w-full sm:w-auto">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4">
                        🔍
                      </span>
                      <input
                        placeholder="사용자 검색..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-full sm:w-64 border rounded-md p-2"
                      />
                    </div>
                  </div>
                </div>
                <div className="p-6 pt-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                      <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3">
                            사용자
                          </th>
                          <th scope="col" className="px-6 py-3">
                            가입일
                          </th>
                          <th scope="col" className="px-6 py-3">
                            활동
                          </th>
                          <th scope="col" className="px-6 py-3">
                            상태
                          </th>
                          <th scope="col" className="px-6 py-3">
                            작업
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.length === 0 ? (
                          <tr>
                            <td
                              colSpan={5}
                              className="text-center py-10 text-gray-500"
                            >
                              <div className="text-2xl mb-2">🤷</div>
                              검색 결과와 일치하는 사용자가 없습니다.
                            </td>
                          </tr>
                        ) : (
                          <></>
                        )}
                        {filteredUsers.map((user) => (
                          <tr key={user.id} className="bg-white border-b">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                                  <img
                                    src={
                                      user.profileImage || '/placeholder.svg'
                                    }
                                    alt={user.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) =>
                                      (e.currentTarget.style.display = 'none')
                                    }
                                  />
                                </div>
                                <div>
                                  <p className="font-medium text-sm">
                                    {user.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {user.email}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm">
                              {user.joinDate}
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-xs space-y-1">
                                <div>작성: {user.postsCount}개</div>
                                <div>참여: {user.participationCount}개</div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  user.status === 'active'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {user.status === 'active' ? '활성' : '정지'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div>
                                  <button
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setIsUserDialogOpen(true);
                                    }}
                                    className="h-8 w-8 p-0 flex items-center justify-center hover:bg-gray-100 rounded-md"
                                  >
                                    <span className="w-4 h-4">👁️</span>
                                  </button>
                                  {isUserDialogOpen &&
                                    selectedUser?.id === user.id && (
                                      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                                        <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
                                          <div className="p-6 border-b">
                                            <h3 className="text-xl font-semibold text-gray-900">
                                              사용자 상세 정보
                                            </h3>
                                          </div>
                                          <div className="p-6">
                                            <div className="space-y-4">
                                              <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                                                  <img
                                                    src={
                                                      selectedUser.profileImage ||
                                                      '/placeholder.svg'
                                                    }
                                                    className="w-full h-full object-cover"
                                                    alt={selectedUser.name}
                                                  />
                                                </div>
                                                <div>
                                                  <h3 className="font-semibold text-lg">
                                                    {selectedUser.name}
                                                  </h3>
                                                  <p className="text-gray-600">
                                                    {selectedUser.email}
                                                  </p>
                                                  <p className="text-sm text-gray-500 flex items-center gap-1">
                                                    <span className="w-3 h-3">
                                                      📍
                                                    </span>
                                                    {selectedUser.location}
                                                  </p>
                                                </div>
                                              </div>
                                              <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                  <span className="font-medium">
                                                    가입일:
                                                  </span>{' '}
                                                  {selectedUser.joinDate}
                                                </div>
                                                <div>
                                                  <span className="font-medium">
                                                    상태:
                                                  </span>{' '}
                                                  <span
                                                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                      selectedUser.status ===
                                                      'active'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                    }`}
                                                  >
                                                    {selectedUser.status ===
                                                    'active'
                                                      ? '활성'
                                                      : '정지'}
                                                  </span>
                                                </div>
                                                <div>
                                                  <span className="font-medium">
                                                    작성한 글:
                                                  </span>{' '}
                                                  {selectedUser.postsCount}개
                                                </div>
                                                <div>
                                                  <span className="font-medium">
                                                    참여한 글:
                                                  </span>{' '}
                                                  {
                                                    selectedUser.participationCount
                                                  }
                                                  개
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                          <div className="flex justify-end gap-3 p-4 bg-gray-50 rounded-b-lg">
                                            <button
                                              onClick={() =>
                                                setIsUserDialogOpen(false)
                                              }
                                              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors"
                                            >
                                              닫기
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                </div>

                                {user.status === 'active' ? (
                                  <button
                                    className="h-8 w-8 p-0 flex items-center justify-center text-red-600 hover:bg-red-100 rounded-md"
                                    onClick={() => {
                                      if (
                                        window.confirm(
                                          `${user.name}님의 계정을 정지하시겠습니까? 모든 활동이 제한됩니다.`
                                        )
                                      ) {
                                        handleUserAction(user.id, 'suspend');
                                      }
                                    }}
                                  >
                                    <span className="w-4 h-4">🚫</span>
                                  </button>
                                ) : (
                                  <button
                                    onClick={() =>
                                      handleUserAction(user.id, 'activate')
                                    }
                                    className="h-8 w-8 p-0 flex items-center justify-center text-green-600 hover:bg-green-100 rounded-md"
                                  >
                                    <span className="w-4 h-4">✅</span>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 게시글 관리 탭 */}
            {activeTab === 'posts' && (
              <div className="bg-white/80 backdrop-blur-sm border rounded-lg shadow-md mt-6">
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <h3 className="text-lg font-semibold">게시글 관리</h3>
                    <div className="relative w-full sm:w-auto">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4">
                        🔍
                      </span>
                      <input
                        placeholder="게시글 검색..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-full sm:w-64 border rounded-md p-2"
                      />
                    </div>
                  </div>
                </div>
                <div className="p-6 pt-0">
                  <div className="space-y-4">
                    {filteredPosts.length === 0 ? (
                      <div className="text-center py-10 text-gray-500">
                        <div className="text-2xl mb-2">🤷</div>
                        검색 결과와 일치하는 게시글이 없습니다.
                      </div>
                    ) : (
                      <></>
                    )}
                    {filteredPosts.map((post) => {
                      const { isExpired, timeText } = getTimeUntilDeadline(
                        post.deadline
                      );

                      return (
                        <div
                          key={post.id}
                          className={`border rounded-lg ${
                            post.reportCount > 0
                              ? 'border-red-200 bg-red-50/50'
                              : 'border-gray-200'
                          }`}
                        >
                          <div className="p-4">
                            <div className="flex flex-col sm:flex-row gap-4">
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-2">
                                  <h3 className="font-semibold text-lg">
                                    {post.title}
                                  </h3>
                                  {post.reportCount > 0 && (
                                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                                      신고 {post.reportCount}건
                                    </span>
                                  )}
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm text-gray-600 mb-3">
                                  <div>
                                    <span className="font-medium">작성자:</span>{' '}
                                    {post.author}
                                  </div>
                                  <div>
                                    <span className="font-medium">
                                      카테고리:
                                    </span>{' '}
                                    {post.category}
                                  </div>
                                  <div>
                                    <span className="font-medium">가격:</span>{' '}
                                    {post.totalPrice.toLocaleString()}원
                                  </div>
                                  <div>
                                    <span className="font-medium">참여:</span>{' '}
                                    {post.currentParticipants}/
                                    {post.maxParticipants}명
                                  </div>
                                </div>

                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                  <div className="flex items-center gap-1">
                                    <span className="w-3 h-3">📅</span>
                                    작성일: {post.createdAt}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span className="w-3 h-3">🕒</span>
                                    {timeText}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span className="w-3 h-3">📍</span>
                                    {post.location}
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-row sm:flex-col gap-2">
                                <div>
                                  <button
                                    onClick={() => {
                                      setSelectedPost(post);
                                      setIsPostDialogOpen(true);
                                    }}
                                    className="flex items-center justify-center px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors bg-transparent text-gray-700"
                                  >
                                    <span className="w-4 h-4 mr-1">👁️</span>
                                    상세
                                  </button>
                                  {isPostDialogOpen &&
                                    selectedPost?.id === post.id && (
                                      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                                        <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl">
                                          <div className="p-6 border-b">
                                            <h3 className="text-xl font-semibold text-gray-900">
                                              게시글 상세 정보
                                            </h3>
                                          </div>
                                          <div className="p-6">
                                            <div className="space-y-4">
                                              <h3 className="font-semibold text-lg">
                                                {selectedPost.title}
                                              </h3>
                                              <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                  <span className="font-medium">
                                                    작성자:
                                                  </span>{' '}
                                                  {selectedPost.author}
                                                </div>
                                                <div>
                                                  <span className="font-medium">
                                                    카테고리:
                                                  </span>{' '}
                                                  {selectedPost.category}
                                                </div>
                                                <div>
                                                  <span className="font-medium">
                                                    총 가격:
                                                  </span>{' '}
                                                  {selectedPost.totalPrice.toLocaleString()}
                                                  원
                                                </div>
                                                <div>
                                                  <span className="font-medium">
                                                    참여 현황:
                                                  </span>{' '}
                                                  {
                                                    selectedPost.currentParticipants
                                                  }
                                                  /
                                                  {selectedPost.maxParticipants}
                                                  명
                                                </div>
                                                <div>
                                                  <span className="font-medium">
                                                    지역:
                                                  </span>{' '}
                                                  {selectedPost.location}
                                                </div>
                                                <div>
                                                  <span className="font-medium">
                                                    마감일:
                                                  </span>{' '}
                                                  {
                                                    getTimeUntilDeadline(
                                                      selectedPost.deadline
                                                    ).timeText
                                                  }
                                                </div>
                                                <div>
                                                  <span className="font-medium">
                                                    신고 수:
                                                  </span>{' '}
                                                  {selectedPost.reportCount}건
                                                </div>
                                                <div>
                                                  <span className="font-medium">
                                                    상태:
                                                  </span>{' '}
                                                  <span
                                                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                      selectedPost.status ===
                                                      'active'
                                                        ? 'bg-green-100 text-green-800'
                                                        : selectedPost.status ===
                                                          'reported'
                                                        ? 'bg-red-100 text-red-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                    }`}
                                                  >
                                                    {selectedPost.status ===
                                                    'active'
                                                      ? '활성'
                                                      : selectedPost.status ===
                                                        'reported'
                                                      ? '신고됨'
                                                      : '비활성'}
                                                  </span>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                          <div className="flex justify-end gap-3 p-4 bg-gray-50 rounded-b-lg">
                                            <button
                                              onClick={() =>
                                                setIsPostDialogOpen(false)
                                              }
                                              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors"
                                            >
                                              닫기
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                </div>

                                {post.status === 'reported' ? (
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() =>
                                        handlePostAction(post.id, 'approve')
                                      }
                                      className="flex items-center justify-center px-3 py-1.5 text-sm text-green-600 border border-green-200 hover:bg-green-50 bg-transparent rounded-md"
                                    >
                                      <span className="w-4 h-4 mr-1">✅</span>
                                      승인
                                    </button>
                                    <button
                                      className="flex items-center justify-center px-3 py-1.5 text-sm text-red-600 border border-red-200 hover:bg-red-50 bg-transparent rounded-md"
                                      onClick={() => {
                                        if (
                                          window.confirm(
                                            '게시글을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.'
                                          )
                                        ) {
                                          handlePostAction(post.id, 'delete');
                                        }
                                      }}
                                    >
                                      <span className="w-4 h-4 mr-1">❌</span>
                                      삭제
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    className="flex items-center justify-center px-3 py-1.5 text-sm text-red-600 border border-red-200 hover:bg-red-50 bg-transparent rounded-md"
                                    onClick={() => {
                                      if (
                                        window.confirm(
                                          '게시글을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.'
                                        )
                                      ) {
                                        handlePostAction(post.id, 'delete');
                                      }
                                    }}
                                  >
                                    <span className="w-4 h-4 mr-1">❌</span>
                                    삭제
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
