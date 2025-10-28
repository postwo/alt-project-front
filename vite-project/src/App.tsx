import { Route, Routes } from 'react-router-dom';
import './App.css';
import Main from './views/Main';
import BoardDetail from './views/Board/Detail';
import BoardWrite from './views/Board/Write';
import Container from './layouts/Container';
import Login from './views/Member/login';
import SignUp from './views/Member/signup';
import Admin from './views/Admin/indes';
import { Cookies } from 'react-cookie';
import { useUserStore } from './store/userSlice';
import { useEffect } from 'react';
import KakaoRedirectHandler from './views/oauth/kakao';
import GoogleRedirectHandler from './views/oauth/GoogleRedirectHandler';
import Posts from './views/Posts/PostsPage';
import ChatModal from './views/Chat/chat-modal';
import ChatModalWrapper from './views/Chat/ChatModalWrapper';
import MyPage from './views/Member/myPage';

const cookies = new Cookies();

function App() {
  const setUserFromToken = useUserStore((state) => state.setUserFromToken);

  // 앱 초기 렌더링 시 쿠키에서 토큰 가져와 Zustand 상태 초기화
  useEffect(() => {
    const token = cookies.get('accessToken');
    if (token) {
      setUserFromToken(token);
    } else {
      // ⭐️ 토큰이 없으면 명시적으로 false로 설정
      useUserStore.setState({ isAuthenticated: false });
    }
  }, [setUserFromToken]);

  return (
    <Routes>
      <Route element={<Container />}>
        <Route
          path="/oauth2/callback/kakao"
          element={<KakaoRedirectHandler />}
        />
        <Route
          path="/oauth2/callback/google"
          element={<GoogleRedirectHandler />}
        />
        <Route path="/" element={<Main />} /> {/* 메인 페이지 */}
        <Route path="/login" element={<Login />} /> {/* 로그인 페이지 */}
        <Route path="/signup" element={<SignUp />} /> {/* 회원가입 페이지 */}
        <Route path="/admin" element={<Admin />} /> {/* 관리자 페이지 */}
        <Route path="/posts" element={<Posts />} /> {/* 게시글 목록 페이지 */}
        <Route path="/chat" element={<ChatModalWrapper />} /> {/* 채팅 모달 */}
        <Route path="/mypage" element={<MyPage />} /> {/* 마이페이지 */}
        <Route path="/board">
          {/* 게시글 상세보기 */}
          <Route path=":boardNumber" element={<BoardDetail />} />
          {/* 게시글 작성 페이지 */}
          <Route path="create-post" element={<BoardWrite />} />
          {/* 게시글 수정 페이지 */}
          {/* <Route path="update/:boardNumber" element={<BoardUpdate />} /> */}
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
