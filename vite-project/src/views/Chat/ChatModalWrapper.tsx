import React, { useState } from 'react';
import type { ReactElement } from 'react';
import ChatModal from './chat-modal';

// 파일명을 ChatModalWrapper.tsx로 변경합니다.
// 이 ChatModalWrapper 컴포넌트를 테스트하거나 미리보기 위한 용도
export default function ChatModalWrapper(): ReactElement | null {
  const [isOpen, setIsOpen] = useState(true);
  const [participants, setParticipants] = useState(1);
  const [roomId] = useState(123);

  const handleParticipantChange = (change: number) => {
    setParticipants((prev) => prev + change);
  };

  return (
    <ChatModal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      postTitle="테스트 게시글"
      currentParticipants={participants}
      maxParticipants={5}
      onParticipantChange={handleParticipantChange}
      roomId={roomId}
    />
  );
}
