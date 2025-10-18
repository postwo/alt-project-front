import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUserStore } from '../../store/userSlice';
import axiosInstance from '../../apis/axiosInstance';
import { Cookies } from 'react-cookie';

export default function Header() {
  const location = useLocation();
  const pathname = location.pathname;
  const isAuthPage =
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname === '/create-post';

  // Zustand에서 상태와 액션 가져오기
  const { email, isAuthenticated, logout } = useUserStore();

  const cookies = new Cookies();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axiosInstance.post('/api/member/logout');
    } catch (err) {
      console.error('로그아웃 실패: ', err);
    }
    cookies.remove('accessToken', { path: '/' });
    logout();
    navigate('/');
  };

  return (
    <nav
      className={`flex items-center p-6 ${
        isAuthPage ? 'justify-start' : 'justify-between max-w-7xl mx-auto'
      }`}
    >
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
              <span className="text-gray-700 font-medium">
                안녕하세요, {email}님
              </span>
              <Link to="/mypage">
                <button className="text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg px-4 py-2 text-sm font-semibold">
                  마이페이지
                </button>
              </Link>
              <button
                onClick={handleLogout} // Zustand logout 사용
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
