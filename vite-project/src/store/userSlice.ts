import { jwtDecode } from 'jwt-decode';
import { Cookies } from 'react-cookie';
import { create } from 'zustand';
import axiosInstance from '../apis/axiosInstance'; // API 호출을 위해 axios 인스턴스 임포트

const cookies = new Cookies();

// JWT 토큰 내부의 payload 타입을 정의합니다.
interface DecodedToken {
  sub: string; // email
  nickname: string;
  // 'roles' 또는 'role' 필드 모두 처리할 수 있도록 타입을 지정합니다.
  roles?: string[] | string;
  role?: string[] | string;
  exp: number;
  iat: number;
}

// 백엔드의 MyChatListResDto와 동일한 타입
interface UnreadRoom {
  roomId: number;
  roomName: string;
  isGroupChat: 'Y' | 'N';
  unReadCount: number;
  boardId: number;
}

// 스토어의 상태(state)와 액션(action)에 대한 타입을 정의합니다.
interface UserState {
  email: string | null;
  nickname: string | null;
  role: 'USER' | 'ADMIN' | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  unreadCount: number; // 읽지 않은 알림 수
  unreadRooms: UnreadRoom[]; // 안 읽은 메시지가 있는 채팅방 목록
  fetchUnreadCount: () => Promise<void>; // 알림 수를 가져오는 액션
  fetchUnreadRooms: () => Promise<void>; // 채팅방 목록을 가져오는 액션
  setUserFromToken: (token: string) => void;
  setNickname: (nickname: string) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  email: null,
  nickname: null,
  role: null,
  isAuthenticated: false,
  isAuthLoading: true,
  unreadCount: 0, // 초기값 설정
  unreadRooms: [], // 초기값 설정

  // 읽지 않은 알림 수를 백엔드에서 가져오는 비동기 액션
  fetchUnreadCount: async () => {
    try {
      const response = await axiosInstance.get<number>(
        '/api/chat/notifications/unread-count'
      );
      if (response.status === 200) {
        // ⬇️ [수정] 상태 비교 로직 없이 바로 업데이트
        set({ unreadCount: response.data });
      }
    } catch (error) {
      console.error('읽지 않은 알림 수를 가져오는데 실패했습니다:', error);
    }
  },

  // 안 읽은 메시지가 있는 채팅방 목록을 가져오는 액션
  fetchUnreadRooms: async () => {
    try {
      const response = await axiosInstance.get<UnreadRoom[]>(
        '/api/chat/my/rooms'
      );
      if (response.status === 200) {
        // 안 읽은 메시지가 있는 방만 필터링
        const roomsWithUnread = response.data.filter(
          (room) => room.unReadCount > 0
        );
        set({ unreadRooms: roomsWithUnread });
      }
    } catch (error) {
      console.error('안 읽은 채팅방 목록을 가져오는데 실패했습니다:', error);
    }
  },

  setUserFromToken: (token: string) => {
    try {
      // jwtDecode의 반환 타입을 DecodedToken으로 지정합니다.
      const decoded: DecodedToken = jwtDecode(token);
      const roleSource = decoded.roles || decoded.role;

      set({
        email: decoded.sub,
        nickname: decoded.nickname,
        // roleSource가 배열이면 첫 번째 요소를, 아니면 그 값을 사용합니다.
        role: Array.isArray(roleSource)
          ? (roleSource[0] as 'USER' | 'ADMIN')
          : (roleSource as 'USER' | 'ADMIN'),
        isAuthenticated: true,
        isAuthLoading: false,
      });
    } catch {
      set({
        email: null,
        nickname: null,
        role: null,
        isAuthenticated: false,
        isAuthLoading: false,
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
      isAuthLoading: false,
      unreadCount: 0, // 로그아웃 시 알림 수 초기화
      unreadRooms: [], // 로그아웃 시 목록 초기화
    });
  },
}));
