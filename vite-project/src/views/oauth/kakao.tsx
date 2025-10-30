import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cookies, useCookies } from 'react-cookie';
import { useUserStore } from '../../store/userSlice';
import { jwtDecode, type JwtPayload } from 'jwt-decode';

interface DecodedToken extends JwtPayload {
  role?: 'USER' | 'ADMIN';
}

function KakaoRedirectHandler() {
  const navigate = useNavigate();
  const cookie = new Cookies();
  const setUserFromToken = useUserStore((state) => state.setUserFromToken);

  useEffect(() => {
    // 이미 URL에 토큰이 없거나, 다른 경로로 이동한 경우 함수를 종료
    if (!window.location.search.includes('accessToken')) {
      return;
    }

    //쿼리 스트링 으로 토큰값을 받아오면 URLSearchParams를 사용
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('accessToken');

    if (accessToken) {
      // accessToken을 쿠키에 저장
      cookie.set('accessToken', accessToken, {
        path: '/',
        maxAge: 60 * 60 * 24, // 1일 유지
      });

      // 1. zustand store에도 반영
      setUserFromToken(accessToken);

      // 2. 토큰을 쿠키에 저장한 후 URL의 쿼리 파라미터를 제거
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
      navigate('/login');
    }
  }, [navigate, setUserFromToken]); // `cookie`는 의존성 배열에서 제외
  // `Cookies` 클래스는 함수형 컴포넌트 내에서 매번 새롭게 인스턴스화되므로
  // 의존성 배열에 넣으면 무한 루프를 유발할 수 있습니다.

  return <div>로그인 처리 중...</div>;
}

export default KakaoRedirectHandler;
