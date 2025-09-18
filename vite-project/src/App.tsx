import { Route, Routes } from 'react-router-dom';
import './App.css';
import Main from './views/Main';
import BoardDetail from './views/Board/Detail';
import BoardWrite from './views/Board/Write';
import BoardUpdate from './views/Board/Update';
import Container from './layouts/Container';
import Login from './views/Member/login';
import SignUp from './views/Member/signup';
import Admin from './views/Admin/indes';
import { Cookies } from 'react-cookie';
import { useUserStore } from './store/userSlice';
import { useEffect } from 'react';

const cookies = new Cookies();

function App() {
  const setUserFromToken = useUserStore((state) => state.setUserFromToken);

  // 앱 초기 렌더링 시 쿠키에서 토큰 가져와 Zustand 상태 초기화
  useEffect(() => {
    const token = cookies.get('accessToken');
    if (token) {
      setUserFromToken(token);
    }
  }, [setUserFromToken]);

  return (
    <Routes>
      <Route element={<Container />}>
        <Route path="/" element={<Main />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/board">
          <Route path=":boardNumber" element={<BoardDetail />} />
          <Route path="write" element={<BoardWrite />} />
          <Route path="update/:boardNumber" element={<BoardUpdate />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
