import { jwtDecode } from 'jwt-decode';
import { Cookies } from 'react-cookie';
import { create } from 'zustand';

// 이거는 로그인한 회원을 전역적으로 관리해주기 위해 만듬

const cookies = new Cookies();

interface UserState {
  email: string | null;
  nickname: string | null;
  role: 'USER' | 'ADMIN' | null; // 단일 역할로 변경
  isAuthenticated: boolean; // 로그인 상태
  isAuthLoading: boolean; // 이름 변경: isLoading -> isAuthLoading
  setUserFromToken: (token: string) => void;
  setNickname: (nickname: string) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  email: null,
  nickname: null,
  role: null,
  isAuthenticated: false,
  isAuthLoading: true, // 초기 로딩 상태 true

  setUserFromToken: (token: string) => {
    try {
      const decoded: any = jwtDecode(token); // jwtDecode 타입이 any일 수 있음
      // 'roles' 필드를 우선적으로 확인하고, 없으면 'role' 필드를 사용합니다.
      const roleSource = decoded.roles || decoded.role;
      set({
        email: decoded.sub,
        nickname: decoded.nickname,
        // 역할 정보가 배열이면 첫 번째 요소를, 문자열이면 그대로 사용합니다.
        role: Array.isArray(roleSource) ? roleSource[0] : roleSource,
        isAuthenticated: true,
        isAuthLoading: false, // 로딩 완료
      });
    } catch {
      set({
        email: null,
        nickname: null,
        role: null,
        isAuthenticated: false,
        isAuthLoading: false, // 로딩 완료
      });
    }
  },

  setNickname: (newNickname: string) =>
    set((state) => ({
      ...state,
      nickname: newNickname,
    })),

  logout: () => {
    cookies.remove('accessToken', { path: '/' });
    set({
      email: null,
      nickname: null,
      role: null,
      isAuthenticated: false,
      isAuthLoading: false, // 로딩 완료
    });
  },
}));
