import { jwtDecode } from 'jwt-decode';
import { Cookies } from 'react-cookie';
import { create } from 'zustand';

// 이거는 로그인한 회원을 전역적으로 관리해주기 위해 만듬

const cookies = new Cookies();

interface UserState {
  email: string | null;
  nickname: string | null;
  memberRoleList: string[] | null;
  isAuthenticated: boolean | null; // 로그인 상태
  setUserFromToken: (token: string) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  email: null,
  nickname: null,
  memberRoleList: null,
  // isAuthenticated: false,
  isAuthenticated: null, // ⭐️ 초기값 null (아직 확인 안됨)

  setUserFromToken: (token: string) => {
    try {
      const decoded: any = jwtDecode(token); // jwtDecode 타입이 any일 수 있음
      set({
        email: decoded.sub,
        nickname: decoded.nickname ?? null,
        memberRoleList: decoded.role ?? null,
        isAuthenticated: true,
      });
    } catch {
      set({
        email: null,
        nickname: null,
        memberRoleList: null,
        isAuthenticated: false,
      });
    }
  },

  logout: () => {
    cookies.remove('accessToken', { path: '/' });
    set({
      email: null,
      nickname: null,
      memberRoleList: null,
      isAuthenticated: false,
    });
  },
}));
