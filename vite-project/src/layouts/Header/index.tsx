// src/components/Header.tsx

import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUserStore } from '../../store/userSlice';
import axiosInstance from '../../apis/axiosInstance';
import { Cookies } from 'react-cookie';
import { useEffect, useState, useRef } from 'react'; // useEffect, useState, useRef 임포트

// BellIcon 컴포넌트의 props 타입을 정의합니다.
interface BellIconProps {
  className?: string;
}

// BellIcon 컴포넌트에 props 타입을 적용합니다.
const BellIcon = ({ className }: BellIconProps) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

export default function Header() {
  const location = useLocation();
  const pathname = location.pathname;
  const isAuthPage =
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname === '/create-post';

  // Zustand 스토어에서 가져온 상태와 액션은 이미 타입이 지정되어 있습니다.
  const {
    nickname,
    isAuthenticated,
    logout,
    role,
    unreadCount,
    fetchUnreadCount,
    unreadRooms,
    fetchUnreadRooms,
  } = useUserStore();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // 드롭다운 상태
  const prevUnreadCount = useRef(unreadCount); // 이전 알림 수를 기억하기 위한 ref
  const notificationSound = useRef<HTMLAudioElement | null>(null); // 오디오 객체 ref

  const cookies = new Cookies();
  const navigate = useNavigate();

  // 컴포넌트 마운트 시 오디오 파일 미리 로드
  useEffect(() => {
    // public 폴더에 사운드 파일(예: notification.mp3)이 있어야 합니다.
    notificationSound.current = new Audio('/notification.mp3');
  }, []);

  // 로그인 상태가 되면 읽지 않은 알림 수를 가져옵니다.
  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();

      // 실시간처럼 보이게 하기 위해 주기적으로 알림 수를 다시 가져옵니다 (폴링)
      const intervalId = setInterval(fetchUnreadCount, 60000); // 1분에 한 번씩

      // 컴포넌트가 사라질 때 인터벌을 정리합니다.
      return () => clearInterval(intervalId);
    }
  }, [isAuthenticated, fetchUnreadCount]);

  // unreadCount가 변경될 때 소리 재생 로직
  useEffect(() => {
    if (unreadCount > prevUnreadCount.current) {
      notificationSound.current
        ?.play()
        .catch((e) => console.error('알림 소리 재생 실패:', e));
    }
    prevUnreadCount.current = unreadCount; // 현재 카운트를 이전 카운트로 업데이트
  }, [unreadCount]);

  const handleLogout = async () => {
    try {
      await axiosInstance.post('/api/member/logout');
    } catch (err) {
      console.error('로그아웃 실패: ', err);
    }
    logout();
    navigate('/');
  };

  // 알림 아이콘 클릭 핸들러
  const handleNotificationClick = () => {
    if (!isDropdownOpen) {
      fetchUnreadRooms(); // 드롭다운이 열릴 때 안 읽은 방 목록을 가져옴
    }
    setIsDropdownOpen(!isDropdownOpen);
  };

  const displayNickname = nickname || '회원';

  return (
    <nav
      className={`flex items-center p-6 ${
        isAuthPage ? 'justify-start' : 'justify-between max-w-7xl mx-auto'
      }`}
    >
      {/* 로고 링크 부분 (변경 없음) */}
      <Link to="/" className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">알</span>
        </div>
        <span className="text-2xl font-bold text-emerald-800">알뜰모아</span>
      </Link>

      {!isAuthPage && (
        <div className="flex items-center space-x-4">
          {!isAuthenticated ? (
            <>
              {/* 로그인/회원가입 버튼 (변경 없음) */}
              <Link to="/login">
                <button className="text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50">
                  로그인
                </button>
              </Link>
              <Link to="/signup">
                <button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-4 py-2 text-sm font-semibold">
                  회원가입
                </button>
              </Link>
            </>
          ) : (
            <>
              {/* 알림 아이콘 (관리자가 아닐 때만 표시) */}
              {role !== 'ADMIN' && (
                <div className="relative">
                  {/* 아이콘 버튼으로 변경 */}
                  <button
                    onClick={handleNotificationClick}
                    className="relative text-emerald-700 hover:text-emerald-800 p-2 focus:outline-none"
                  >
                    <BellIcon className="w-6 h-6" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 block h-5 w-5 transform rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* 알림 드롭다운 메뉴 */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-10">
                      <div className="p-4 font-bold border-b">알림</div>
                      <ul className="max-h-96 overflow-y-auto">
                        {unreadRooms.length > 0 ? (
                          unreadRooms.map((room) => (
                            <li
                              key={room.roomId}
                              onClick={() => {
                                // ❗️ boardId가 유효한지 확인하는 방어 코드 추가
                                if (room.boardId) {
                                  // room 객체의 boardId를 사용해 상세 페이지로 이동하고,
                                  // ❗️ App.tsx에 정의된 올바른 경로로 수정합니다.
                                  navigate(`/board/${room.boardId}`);
                                  setIsDropdownOpen(false); // 드롭다운 닫기
                                } else {
                                  console.error(
                                    'boardId가 없어 상세 페이지로 이동할 수 없습니다.',
                                    room
                                  );
                                  alert('해당 게시글 정보를 찾을 수 없습니다.');
                                }
                              }}
                              className="cursor-pointer"
                            >
                              <div className="flex items-center justify-between p-4 hover:bg-gray-100">
                                <p className="font-semibold text-gray-800 truncate">
                                  {room.roomName}
                                </p>
                                <span className="text-xs text-white bg-emerald-500 rounded-full px-2 py-1">
                                  {room.unReadCount}
                                </span>
                              </div>
                            </li>
                          ))
                        ) : (
                          <li className="p-4 text-center text-gray-500">
                            새로운 알림이 없습니다.
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <span className="text-gray-700 font-medium">
                안녕하세요, {displayNickname}님
              </span>

              {role !== 'ADMIN' && (
                <Link to="/mypage">
                  <button className="text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg px-4 py-2 text-sm font-semibold">
                    마이페이지
                  </button>
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white rounded-lg px-4 py-2 text-sm font-semibold"
              >
                로그아웃
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
