'use client';

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../apis/axiosInstance';
import { useUserStore } from '../../store/userSlice';

// 관리자 통계 데이터
interface AdminStats {
  totalUsers: number;
  totalPosts: number;
  activePosts: number;
  completedPosts: number;
  totalRevenue: number;
  monthlyGrowth: number;
}

// 백엔드 DTO와 동기화된 사용자 인터페이스
interface MemberResponseDto {
  id: number;
  email: string;
  nickname: string;
  createdAt: string; // ISO 8601 형식의 문자열 (e.g., "2025-11-18T09:52:47.123456")
  status: 'ACTIVE' | 'SUSPENDED' | 'DELETED'; // 백엔드 Enum 값과 일치
  boardCount: number;
  chatRoomCount: number;
  // DTO에 없는 필드는 optional 또는 placeholder 처리
  profileImage?: string;
  location?: string;
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

const getTimeUntilDeadline = (
  deadline: string
): { isExpired: boolean; timeText: string } => {
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

// 날짜 포맷팅 함수
const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, role, isAuthLoading } = useUserStore();

  const [loading, setLoading] = useState<boolean>(true); // 초기 데이터(통계, 게시글) 로딩 상태
  const [isUsersLoading, setIsUsersLoading] = useState<boolean>(false); // 사용자 데이터 로딩 상태
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<MemberResponseDto | null>(
    null
  );
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState<boolean>(false);
  const [isPostDialogOpen, setIsPostDialogOpen] = useState<boolean>(false);

  // API 데이터 상태
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<MemberResponseDto[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    // 인증 상태 로딩이 끝나면 접근 권한을 확인합니다.
    if (!isAuthLoading) {
      if (!isAuthenticated || role !== 'ADMIN') {
        alert('접근 권한이 없습니다.');
        navigate('/');
      }
    }
  }, [isAuthenticated, role, isAuthLoading, navigate]);

  // --- 1. 초기 데이터(통계, 게시글) 로딩 ---
  useEffect(() => {
    // 인증이 완료되고 관리자 권한이 있을 때만 데이터를 가져옵니다.
    if (!isAuthLoading && isAuthenticated && role === 'ADMIN') {
      const fetchInitialData = async () => {
        setLoading(true);
        try {
          // 통계와 게시글 API만 먼저 호출
          const [statsRes, postsRes] = await Promise.all([
            axiosInstance.get('/api/admin/stats'),
            axiosInstance.get('/api/admin/posts'),
          ]);

          setAdminStats(statsRes.data.data);
          setPosts(postsRes.data.data);
        } catch (error) {
          console.error(
            '초기 관리자 데이터를 불러오는 데 실패했습니다:',
            error
          );
          alert('데이터를 불러오는 데 실패했습니다.');
        } finally {
          setLoading(false);
        }
      };

      fetchInitialData();
    }
  }, [isAuthLoading, isAuthenticated, role]);

  // --- 2. '사용자 관리' 탭 클릭 시 사용자 데이터 로딩 ---
  useEffect(() => {
    // 'users' 탭이 활성화되었고, 아직 사용자 데이터를 불러온 적이 없을 때만 실행
    if (activeTab === 'users' && users.length === 0) {
      const fetchUsers = async () => {
        setIsUsersLoading(true);
        try {
          const usersRes = await axiosInstance.get<MemberResponseDto[]>(
            '/api/admin/members'
          );
          setUsers(usersRes.data);
        } catch (error) {
          console.error('사용자 목록을 불러오는 데 실패했습니다:', error);
          alert('사용자 목록을 불러오는 데 실패했습니다.');
        } finally {
          setIsUsersLoading(false);
        }
      };

      fetchUsers();
    }
  }, [activeTab, users.length]); // activeTab이 변경될 때마다 이 효과를 재평가

  // 인증 상태를 확인하는 동안 로딩 UI를 보여줍니다.
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">사용자 정보를 확인하는 중...</p>
        </div>
      </div>
    );
  }

  // 인증이 완료되었지만 권한이 없는 경우, 아무것도 렌더링하지 않습니다. (useEffect에서 리디렉션 처리)
  if (!isAuthenticated || role !== 'ADMIN') return null;

  const handleUserAction = (userId: number, action: 'suspend' | 'activate') => {
    const actionText = action === 'suspend' ? '정지' : '활성화';
    const userNickname = users.find((u) => u.id === userId)?.nickname;
    const confirmMessage =
      action === 'suspend'
        ? `${userNickname}님의 계정을 정지하시겠습니까? 모든 활동이 제한됩니다.`
        : `${userNickname}님의 계정을 다시 활성화하시겠습니까?`;

    if (window.confirm(confirmMessage)) {
      const request = async () => {
        try {
          await axiosInstance.patch(`/api/admin/members/${userId}/${action}`);
          alert(`사용자 계정이 성공적으로 ${actionText}되었습니다.`);
          // UI 즉시 업데이트
          setUsers(
            users.map((user) =>
              user.id === userId
                ? {
                    ...user,
                    status: action === 'suspend' ? 'SUSPENDED' : 'ACTIVE',
                  }
                : user
            )
          );
        } catch (error) {
          console.error(`사용자 계정 ${actionText} 처리 중 오류 발생:`, error);
          alert(`사용자 계정 ${actionText}에 실패했습니다.`);
        }
      };
      request();
    }
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
      user.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
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
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setSearchTerm(e.target.value)
                        }
                        className="pl-10 w-full sm:w-64 border rounded-md p-2"
                      />
                    </div>
                  </div>
                </div>
                <div className="p-6 pt-0">
                  <div className="overflow-x-auto">
                    {/* --- 3. 사용자 목록 로딩 UI --- */}
                    {isUsersLoading ? (
                      <div className="min-h-[300px] flex items-center justify-center">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 mx-auto mb-4"></div>
                          <p className="text-gray-600">
                            사용자 목록을 불러오는 중...
                          </p>
                        </div>
                      </div>
                    ) : (
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
                                      alt={user.nickname}
                                      className="w-full h-full object-cover"
                                      onError={(e) =>
                                        ((
                                          e.target as HTMLImageElement
                                        ).style.display = 'none')
                                      }
                                    />
                                  </div>
                                  <div>
                                    <p className="font-medium text-sm">
                                      {user.nickname}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {user.email}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm">
                                {formatDate(user.createdAt)}
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-xs space-y-1">
                                  <div>작성: {user.boardCount}개</div>
                                  <div>참여: {user.chatRoomCount}개</div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span
                                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    user.status.toLowerCase() === 'active'
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}
                                >
                                  {user.status.toLowerCase() === 'active'
                                    ? '활성'
                                    : '정지'}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <div>
                                    {/* <button  상세보기 일단 주석처리 
                                      onClick={() => {
                                        setSelectedUser(user);
                                        setIsUserDialogOpen(true);
                                      }}
                                      className="h-8 w-8 p-0 flex items-center justify-center hover:bg-gray-100 rounded-md"
                                    >
                                      <span className="w-4 h-4">👁️</span>
                                    </button> */}
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
                                                      alt={
                                                        selectedUser.nickname
                                                      }
                                                    />
                                                  </div>
                                                  <div>
                                                    <h3 className="font-semibold text-lg">
                                                      {selectedUser.nickname}
                                                    </h3>
                                                    <p className="text-gray-600">
                                                      {selectedUser.email}
                                                    </p>
                                                    <p className="text-sm text-gray-500 flex items-center gap-1">
                                                      <span className="w-3 h-3">
                                                        📍
                                                      </span>
                                                      {selectedUser.location ||
                                                        '지역 정보 없음'}
                                                    </p>
                                                  </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                  <div>
                                                    <span className="font-medium">
                                                      가입일:
                                                    </span>{' '}
                                                    {formatDate(
                                                      selectedUser.createdAt
                                                    )}
                                                  </div>
                                                  <div>
                                                    <span className="font-medium">
                                                      상태:
                                                    </span>{' '}
                                                    <span
                                                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                        selectedUser.status.toLowerCase() ===
                                                        'active'
                                                          ? 'bg-green-100 text-green-800'
                                                          : 'bg-red-100 text-red-800'
                                                      }`}
                                                    >
                                                      {selectedUser.status.toLowerCase() ===
                                                      'active'
                                                        ? '활성'
                                                        : '정지'}
                                                    </span>
                                                  </div>
                                                  <div>
                                                    <span className="font-medium">
                                                      작성한 글:
                                                    </span>{' '}
                                                    {selectedUser.boardCount}개
                                                  </div>
                                                  <div>
                                                    <span className="font-medium">
                                                      참여한 글:
                                                    </span>{' '}
                                                    {selectedUser.chatRoomCount}
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

                                  {user.status.toLowerCase() === 'active' ? (
                                    <button
                                      className="h-8 w-8 p-0 flex items-center justify-center text-red-600 hover:bg-red-100 rounded-md"
                                      onClick={() =>
                                        handleUserAction(user.id, 'suspend')
                                      }
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
                    )}
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
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setSearchTerm(e.target.value)
                        }
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
                                    작성일: {formatDate(post.createdAt)}
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
};

export default Admin;
