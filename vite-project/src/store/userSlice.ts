import { jwtDecode } from 'jwt-decode';
import { Cookies } from 'react-cookie';
import { create } from 'zustand';

// 이거는 로그인한 회원을 전역적으로 관리해주기 위해 만듬

const cookies = new Cookies();

interface UserState {
  email: string | null;
  nickname: string | null;
  role: 'USER' | 'ADMIN' | null;
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
      const decoded: any = jwtDecode(token);
      const roleSource = decoded.roles || decoded.role;

      // 백엔드에서 이미 검증되었으므로, 토큰이 있다는 것 자체가 정상 사용자임을 의미합니다.
      // 따라서 status를 확인할 필요가 없습니다.
      set({
        email: decoded.sub,
        nickname: decoded.nickname,
        role: Array.isArray(roleSource) ? roleSource[0] : roleSource,
        isAuthenticated: true,
        isAuthLoading: false, // 로딩 완료
      });
    } catch {
      // 토큰 디코딩에 실패한 경우 (유효하지 않은 토큰)
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
