import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cookies } from 'react-cookie';
import { useUserStore } from '../../store/userSlice';
import { jwtDecode, type JwtPayload } from 'jwt-decode';

interface DecodedToken extends JwtPayload {
  role?: 'USER' | 'ADMIN';
}

function GoogleRedirectHandler() {
  const navigate = useNavigate();
  const cookie = new Cookies();
  const setUserFromToken = useUserStore((state) => state.setUserFromToken);

  useEffect(() => {
    // URL에 'accessToken'이 있는지 확인합니다.
    if (!window.location.search.includes('accessToken')) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('accessToken');

    if (accessToken) {
      // accessToken을 쿠키에 저장
      cookie.set('accessToken', accessToken, {
        path: '/',
        maxAge: 60 * 60 * 24, // 1일 유지
      });

      // 1. Zustand 스토어에 토큰 반영
      setUserFromToken(accessToken);

      // 2. URL에서 쿼리 파라미터를 제거하여 재렌더링 시 문제를 방지합니다.
      window.history.replaceState({}, document.title, window.location.pathname);

      // 3. 토큰을 디코딩하여 역할에 따라 리디렉션
      try {
        const decoded: DecodedToken = jwtDecode(accessToken);
        if (decoded.role === 'ADMIN') {
          navigate('/admin'); // ADMIN이면 관리자 페이지로 이동
        } else {
          navigate('/'); // 그 외에는 메인 페이지로 이동
        }
      } catch (e) {
        console.error('토큰 디코딩 실패:', e);
        navigate('/'); // 디코딩 실패 시 기본 페이지로 이동
      }
    } else {
      // 토큰이 없으면 로그인 페이지로 이동합니다.
      navigate('/login');
    }
  }, [navigate, setUserFromToken]);

  return <div>구글 로그인 처리 중...</div>;
}

export default GoogleRedirectHandler;
