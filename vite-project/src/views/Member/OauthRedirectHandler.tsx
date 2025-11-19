import { useEffect, useRef } from 'react';
import { useCookies } from 'react-cookie';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUserStore } from '../../store/userSlice';
import { jwtDecode } from 'jwt-decode';
import type { DecodedToken } from './login'; // login.tsx에서 export 필요

function OauthRedirectHandler() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [, setCookie] = useCookies(['accessToken']);
  const setUserFromToken = useUserStore((state) => state.setUserFromToken);
  const effectRan = useRef(false);

  useEffect(() => {
    // StrictMode에서 이중 실행을 방지하기 위한 로직
    // effectRan.current가 true이면 이미 한 번 실행된 것이므로 즉시 종료합니다.
    if (effectRan.current === true) {
      return;
    }

    const accessToken = searchParams.get('accessToken');
    const error = searchParams.get('error');
    const message = searchParams.get('message');

    if (error && message) {
      // 1. 에러가 있는 경우 (정지된 사용자 등)
      alert(decodeURIComponent(message));
      navigate('/login', { replace: true });
    } else if (accessToken) {
      // 2. 토큰이 있는 경우 (정상 로그인)
      setCookie('accessToken', accessToken, {
        maxAge: 60 * 60 * 24, // 1일
        path: '/',
      });
      setUserFromToken(accessToken);

      try {
        const decoded: DecodedToken = jwtDecode(accessToken);
        const roleSource = decoded.roles || decoded.role;
        const userRole = Array.isArray(roleSource) ? roleSource[0] : roleSource;

        navigate(userRole === 'ADMIN' ? '/admin' : '/', { replace: true });
      } catch (e) {
        console.error('토큰 디코딩 실패:', e);
        navigate('/', { replace: true });
      }
    } else {
      // 3. 토큰도 에러도 없는 비정상적인 접근
      alert('잘못된 접근입니다.');
      navigate('/login', { replace: true });
    }

    // 이펙트가 실행되었음을 표시합니다.
    return () => {
      effectRan.current = true;
    };
  }, [navigate, searchParams, setCookie, setUserFromToken]);

  return null; // 이 컴포넌트는 화면에 아무것도 그리지 않습니다.
}

export default OauthRedirectHandler;
