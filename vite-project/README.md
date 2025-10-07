npm install react-router-dom
npm i jwt-decode

# header 에서 로그인 버튼 기능을 하게 할려면 app.tsx에서

<Route path="/login" element={<Login />} /> 이렇게 설정하면 알아서 경로에 맞춰서 렌더링 된다

# link to 사용방법

React Router에서 <Link to="/login">의 to 속성은 App.tsx에서 정의한 Route 경로와 연결됩니다. 예를 들어,

// App.tsx
import { Routes, Route } from "react-router-dom";
import Login from "./views/Login";
import SignUp from "./views/SignUp";

function App() {
return (
<Routes>
<Route path="/login" element={<Login />} />
<Route path="/signup" element={<SignUp />} />
{/_ 다른 경로 _/}
</Routes>
);
}

export default App;

이렇게 /login 경로를 Login 컴포넌트에 연결해두면,

<Link to="/login">로그인하기</Link>

# cookie 사용방법

react-cookie의 useCookies 훅은 내부적으로 React Context를 사용합니다.

즉, 쿠키 값을 전역적으로 관리하고, 컴포넌트들이 공통된 쿠키 상태를 읽고 쓸 수 있도록 Context Provider가 필요합니다.

그게 바로 CookiesProvider 입니다

결론은 useCookies를 사용할려면 main.tsx에서
createRoot(document.getElementById('root')!).render(
<StrictMode>
<BrowserRouter>
<CookiesProvider>
<App />
</CookiesProvider>
</BrowserRouter>
</StrictMode>
);

이렇게 CookiesProvider로 감싸줘야 한다
