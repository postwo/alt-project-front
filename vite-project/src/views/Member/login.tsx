import axios from 'axios';
import { jwtDecode, type JwtPayload } from 'jwt-decode';
import { useState } from 'react';
import { Cookies, useCookies } from 'react-cookie';
import { Link, useNavigate } from 'react-router-dom';
import { useUserStore } from '../../store/userSlice';
import kakaoLoginImg from '../../assets/kakao_login_medium_narrow.png';
import googleLoginImg from '../../assets/google_login.png';

export interface DecodedToken extends JwtPayload {
  role?: 'USER' | 'ADMIN' | string[]; // 일반 로그인용 (단수형)
  roles?: 'USER' | 'ADMIN' | string[]; // 소셜 로그인용 (복수형) 또는 백엔드 설정에 따라
}

function Login() {
  const setUserFromToken = useUserStore((state) => state.setUserFromToken);
  const navigate = useNavigate();
  const cookies = new Cookies();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('로그인 시도:', formData);

    try {
      const payload = {
        email: formData.email,
        password: formData.password,
      };

      // 로그인 요청
      const response = await axios.post(
        'http://localhost:8080/api/member/login', // 서버 API 주소에 맞게 수정
        payload,
        { withCredentials: true }
      );

      //로그인 상태를 브라우저를 닫아도 유지하고 싶다면 maxAge를 넣는 게 좋고, 사이트 전체에서 사용하려면 path: '/'를 넣는 게 안전
      cookies.set('accessToken', response.data.data.accessToken, {
        maxAge: 60 * 60 * 24,
        path: '/',
      });

      const token = response.data.data.accessToken;

      if (token) {
        setUserFromToken(token);
        alert('로그인 성공!');

        try {
          const decoded: DecodedToken = jwtDecode(token);
          // 'roles' 필드를 우선적으로 확인하고, 없으면 'role' 필드를 사용합니다.
          const roleSource = decoded.roles || decoded.role;
          const userRole = Array.isArray(roleSource)
            ? roleSource[0]
            : roleSource;
          if (userRole === 'ADMIN') {
            navigate('/admin');
          } else {
            navigate('/');
          }
        } catch (e) {
          console.error('토큰 디코딩 실패:', e);
          navigate('/'); // 디코딩 실패 시 기본 페이지로 이동
        }
      }
    } catch (error: any) {
      console.error('로그인 실패:', error.response?.data || error.message);
      const errorMessage =
        error.response?.data?.message ||
        '이메일 또는 비밀번호가 올바르지 않습니다.';
      alert(errorMessage);
    }
  };

  const handleKakaoLogin = () => {
    // 서버에서 설정한 카카오 OAuth2 엔드포인트로 이동
    // 서버로 요청하는거기 때문에 서버랑 포트가 일치해야 한다
    window.location.href = 'http://localhost:8080/oauth2/authorization/kakao';
  };

  const handleGoogleLogin = () => {
    // 👈 추가
    // 백엔드에서 설정한 구글 OAuth2 엔드포인트로 이동
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100 flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-20 left-10 w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full opacity-20 animate-bounce"
            style={{ animationDelay: '0s', animationDuration: '3s' }}
          ></div>
          <div
            className="absolute top-40 right-20 w-12 h-12 bg-gradient-to-br from-green-400 to-green-500 rounded-lg opacity-30 animate-pulse"
            style={{ animationDelay: '1s' }}
          ></div>
          <div
            className="absolute bottom-32 left-20 w-20 h-20 bg-gradient-to-br from-emerald-300 to-emerald-400 rounded-full opacity-25 animate-bounce"
            style={{ animationDelay: '2s', animationDuration: '4s' }}
          ></div>
          <div
            className="absolute bottom-20 right-10 w-14 h-14 bg-gradient-to-br from-teal-400 to-teal-500 rounded-lg opacity-20 animate-pulse"
            style={{ animationDelay: '0.5s' }}
          ></div>
        </div>

        <div className="w-full max-w-md">
          {/* Login Form */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-emerald-100">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">로그인</h1>
              <p className="text-gray-600">
                알뜰모아에서 똑똑한 식료품 나눔을 시작하세요
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700 text-left block"
                >
                  이메일
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="example@email.com"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700 text-left block"
                >
                  비밀번호
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="비밀번호를 입력해주세요"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    id="rememberMe"
                    name="rememberMe"
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-emerald-600 rounded"
                  />
                  <label htmlFor="rememberMe" className="text-sm text-gray-600">
                    로그인 상태 유지
                  </label>
                </div>
                <Link
                  to="/forgot-password"
                  className="text-sm text-emerald-600 hover:text-emerald-700"
                >
                  비밀번호 찾기
                </Link>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-medium transition-colors cursor-pointer"
              >
                로그인
              </button>
            </form>

            <div className="social-login">
              <img
                src={kakaoLoginImg}
                className="kakao-img w-full h-12 object-contain cursor-pointer"
                onClick={handleKakaoLogin}
              />
              <img
                src={googleLoginImg}
                className="google-img w-full h-12 object-contain cursor-pointer"
                onClick={handleGoogleLogin}
                alt="구글 로그인"
              />
            </div>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                아직 계정이 없으신가요?{' '}
                <Link
                  to="/signup"
                  className="text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  회원가입
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
