// ChatModal.tsx

import React, { useState, useRef, useEffect } from 'react';
import type { ReactElement } from 'react';
import axiosInstance from '../../apis/axiosInstance';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useUserStore } from '../../store/userSlice';
import { Cookies } from 'react-cookie';

// 백엔드와 통신할 기본 URL 설정
const API_BASE_URL = '/chat';
// SockJS 사용을 위해 http:// 엔드포인트 사용
const WS_URL = 'http://localhost:8080/connect';

interface Message {
  id: number;
  user: string;
  message: string;
  timestamp: string;
  isSystem?: boolean;
}

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  postTitle: string;
  currentParticipants: number;
  maxParticipants: number;
  onParticipantChange: (change: number) => void;
  roomId: number;
  position?: { x: number; y: number };
}

interface ChatMessageDto {
  senderEmail: string;
  message: string;
}

let stompClient: Client | null = null;

const getCurrentTimestamp = (): string => {
  return new Date().toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

const cookies = new Cookies();

// ChatModal.tsx
export default function ChatModal({
  isOpen,
  onClose,
  postTitle,
  currentParticipants,
  maxParticipants,
  onParticipantChange,
  roomId,
  position = { x: 100, y: 100 },
}: ChatModalProps): ReactElement | null {
  const myEmail = useUserStore((state) => state.email);
  const MY_EMAIL = myEmail;
  const MY_NICKNAME = '나';

  const accessToken = cookies.get('accessToken') || '';

  const initialTimestamp = getCurrentTimestamp();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      user: '시스템',
      message:
        '채팅방에 오신 것을 환영합니다! 나눔에 대해 자유롭게 대화해보세요.',
      timestamp: initialTimestamp,
      isSystem: true,
    },
  ]);

  const [newMessage, setNewMessage] = useState('');
  // ⭐️ 수정: 모달이 열리면 이미 참여가 확인되었다고 가정합니다.
  const [isParticipating, setIsParticipating] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [modalPosition, setModalPosition] = useState<{ x: number; y: number }>(
    position
  );
  const modalRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // --- WebSocket 연결 및 API 통신 로직 ---
  useEffect(() => {
    console.log('ChatModal useEffect Triggered');
    console.log(`isOpen: ${isOpen}, MY_EMAIL: ${MY_EMAIL}, roomId: ${roomId}`);

    // ⭐️ 추가됨: 이전 STOMP 연결이 남아있는 경우 정리
    if (stompClient && stompClient.active) {
      stompClient.deactivate();
      stompClient = null;
    }

    if (!isOpen || !MY_EMAIL || !roomId || roomId <= 0) {
      console.log(
        'ChatModal: 유효하지 않은 roomId 또는 로그인 정보로 인해 연결 건너뜀'
      );
      return;
    }

    const connectAndFetch = async (): Promise<void> => {
      // -------------------------------------------------------------------------
      // 🚨 핵심 수정: 채팅방 참여 API 호출 로직을 제거했습니다. (BoardDetail.tsx로 이동)
      // -------------------------------------------------------------------------

      // 1. 이전 메시지 불러오기
      const fetchChatHistory = async (): Promise<void> => {
        try {
          console.log(
            `[API CALL] 채팅 이력 요청: ${API_BASE_URL}/history/${roomId}`
          );
          const response = await axiosInstance.get<ChatMessageDto[]>(
            `${API_BASE_URL}/history/${roomId}`
          );

          console.log(`[HISTORY] 불러온 메시지 수: ${response.data.length}`);

          const historyMessages: Message[] = response.data.map(
            (dto, index) => ({
              id: index + 2,
              user:
                dto.senderEmail === MY_EMAIL
                  ? MY_NICKNAME
                  : dto.senderEmail.split('@')[0],
              message: dto.message,
              timestamp: getCurrentTimestamp(),
            })
          );

          setMessages((prev) => [prev[0], ...historyMessages]);
        } catch (error) {
          console.error('[ERROR] 채팅 이력 불러오기 실패:', error);
        }
      };

      // 2. WebSocket 연결 (STOMP + SockJS)
      stompClient = new Client({
        webSocketFactory: () => {
          return new SockJS(WS_URL);
        },

        connectHeaders: {
          Authorization: `Bearer ${accessToken}`,
        },

        onConnect: () => {
          console.log('STOMP 연결 성공');

          fetchChatHistory(); // 연결 성공 후 이력 불러오기

          stompClient!.subscribe(
            `/topic/${roomId}`,
            (message) => {
              const body: ChatMessageDto = JSON.parse(message.body);
              const newMsg: Message = {
                id: Date.now(),
                user:
                  body.senderEmail === MY_EMAIL
                    ? MY_NICKNAME
                    : body.senderEmail.split('@')[0],
                message: body.message,
                timestamp: getCurrentTimestamp(),
              };
              setMessages((prev) => [...prev, newMsg]);
            },
            {
              Authorization: `Bearer ${accessToken}`,
            }
          );

          // 메시지 읽음 처리 API 호출
          console.log(
            `[API CALL] 메시지 읽음 처리: ${API_BASE_URL}/room/${roomId}/read`
          );
          axiosInstance.post(`${API_BASE_URL}/room/${roomId}/read`);
        },
        onStompError: (frame) => {
          console.error(
            '[STOMP ERROR] Broker reported error: ' + frame.headers['message']
          );
          console.error('Additional details: ' + frame.body);
          alert(
            'WebSocket 연결에 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
          );
        },
        reconnectDelay: 5000,
      });

      stompClient.activate();
    };

    connectAndFetch();

    return () => {
      if (stompClient) {
        console.log('STOMP 연결 해제');
        stompClient.deactivate();
        stompClient = null;
      }
    };
  }, [isOpen, roomId, MY_EMAIL, accessToken]); // 의존성 배열 유지

  // --- 함수 로직 ---
  const handleSendMessage = (): void => {
    if (!MY_EMAIL) {
      alert('로그인 정보가 없습니다. 메시지를 보낼 수 없습니다.');
      return;
    }

    if (
      newMessage.trim() &&
      isParticipating &&
      stompClient &&
      stompClient.active
    ) {
      const chatMessageDto: Pick<ChatMessageDto, 'message' | 'senderEmail'> & {
        roomId: number;
      } = {
        roomId: roomId,
        message: newMessage.trim(),
        senderEmail: MY_EMAIL,
      };

      try {
        console.log('[STOMP PUBLISH] 메시지 전송 시도');
        stompClient.publish({
          destination: `/publish/${roomId}`,
          body: JSON.stringify(chatMessageDto),
        });
        setNewMessage('');
      } catch (error) {
        console.error('[ERROR] 메시지 전송 실패:', error);
        alert('메시지 전송에 실패했습니다. 연결 상태를 확인해주세요.');
      }
    }
  };

  const handleLeaveChat = async (): Promise<void> => {
    if (!MY_EMAIL) {
      alert('로그인 정보가 없습니다. 채팅방을 나갈 수 없습니다.');
      return;
    }

    try {
      console.log(
        `[API CALL] 채팅방 나가기 요청: ${API_BASE_URL}/room/group/${roomId}/leave`
      );
      await axiosInstance.delete(`${API_BASE_URL}/room/group/${roomId}/leave`);

      // ⭐️ 수정: isParticipating 상태를 false로 변경
      setIsParticipating(false);
      onParticipantChange(-1);

      if (stompClient) {
        console.log('STOMP 연결 해제 (나가기)');
        stompClient.deactivate();
        stompClient = null;
      }

      const leaveMessage: Message = {
        id: messages.length + 1,
        user: '시스템',
        message: '채팅방에서 나갔습니다.',
        timestamp: getCurrentTimestamp(),
        isSystem: true,
      };
      setMessages((prev) => [...prev, leaveMessage]);
      onClose();
    } catch (error) {
      console.error('[ERROR] 채팅방 나가기 실패:', error);
      alert('채팅방을 나가는 데 실패했습니다.');
    }
  };

  // --- 드래그 및 UI 로직 (유지) ---
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (modalRef.current) {
      const rect = modalRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setIsDragging(true);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent): void => {
      if (isDragging) {
        const modalWidth =
          window.innerWidth < 640 ? window.innerWidth - 32 : 384;
        const modalHeight =
          window.innerWidth < 640 ? window.innerHeight - 100 : 600;
        const newX = Math.max(
          16,
          Math.min(
            window.innerWidth - modalWidth - 16,
            e.clientX - dragOffset.x
          )
        );
        const newY = Math.max(
          16,
          Math.min(
            window.innerHeight - modalHeight - 16,
            e.clientY - dragOffset.y
          )
        );
        setModalPosition({ x: newX, y: newY });
      }
    };

    const handleMouseUp = (): void => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div
        ref={modalRef}
        className="absolute bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden pointer-events-auto
w-[calc(100vw-2rem)] h-[calc(100vh-6rem)] max-w-sm max-h-[600px]
sm:w-96 sm:h-[600px]"
        style={{
          left: modalPosition.x,
          top: modalPosition.y,
          cursor: isDragging ? 'grabbing' : 'default',
        }}
      >
        {/* 헤더 (생략) */}
        <div
          className="bg-emerald-600 text-white p-3 sm:p-4 flex items-center justify-between cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
        >
          <div>
            <h3 className="font-semibold text-sm">{postTitle}</h3>
            <p className="text-xs text-emerald-100">
              {currentParticipants}/{maxParticipants}명 참여
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-white bg-transparent border-none text-lg ml-2"
            onMouseDown={(e) => e.stopPropagation()}
          >
            ✕
          </button>
        </div>
        {/* 메시지 영역 (생략) */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 bg-gray-50">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.user === MY_NICKNAME ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-3 py-2 ${
                  message.isSystem
                    ? 'bg-gray-200 text-gray-600 text-center text-sm mx-auto'
                    : message.user === MY_NICKNAME
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white text-gray-900 border border-gray-200'
                }`}
              >
                {!message.isSystem && message.user !== MY_NICKNAME && (
                  <div className="text-xs text-gray-500 mb-1">
                    {message.user}
                  </div>
                )}
                <div className="text-sm">{message.message}</div>

                <div
                  className={`text-xs mt-1 ${
                    message.isSystem
                      ? 'text-gray-500'
                      : message.user === MY_NICKNAME
                      ? 'text-emerald-100'
                      : 'text-gray-400'
                  }`}
                >
                  {message.timestamp}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        {/* 입력 영역 (생략) */}
        <div className="border-t border-gray-200 p-3 sm:p-4 bg-white">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                placeholder={
                  MY_EMAIL
                    ? '메시지를 입력하세요...'
                    : '로그인 정보가 없습니다.'
                }
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={!MY_EMAIL || !isParticipating}
                className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm disabled:bg-gray-100"
              />

              <button
                onClick={handleSendMessage}
                disabled={
                  !MY_EMAIL ||
                  !newMessage.trim() ||
                  !stompClient ||
                  !stompClient.active ||
                  !isParticipating
                }
                className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white px-3 py-2 rounded text-sm"
              >
                전송
              </button>
            </div>

            <button
              onClick={handleLeaveChat}
              disabled={!MY_EMAIL || !isParticipating}
              className="w-full border border-red-300 text-red-600 hover:bg-red-50 bg-transparent rounded py-2 text-sm disabled:border-gray-300 disabled:text-gray-500"
            >
              방 나가기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
