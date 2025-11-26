// BoardDetail.tsx

import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import ChatModal from '../../Chat/chat-modal';
import axiosInstance from '../../../apis/axiosInstance';
import { useUserStore } from '../../../store/userSlice';

interface Post {
  id: number;
  title: string;
  content: string;
  address: string;
  totalPrice: number;
  favoriteCount: number;
  viewCount: number;
  hashtags: string[];
  imageUrls: string[];
  writerEmail?: string;
  chatRoomId: number;
  liked?: boolean; // 👈 백엔드에서 'liked'로 보내고 있음
}

// API BASE URL 정의 (ChatModal에서도 사용)
const API_BASE_URL = '/chat';

// 신고 사유 Enum (백엔드의 ReportReason.java와 일치)
const reportReasons = {
  SPAM: '스팸/홍보성',
  INAPPROPRIATE_CONTENT: '음란물/불건전한 만남 및 대화',
  ABUSE: '욕설/비하',
  SCAM: '사기/사칭',
  OTHER: '기타',
};

function BoardDetail() {
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation(); // 👈 useLocation 훅을 추가합니다.
  const boardId = Number(params.boardNumber);
  const { isAuthenticated, email } = useUserStore();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatPosition, setChatPosition] = useState({ x: 100, y: 100 });

  // 신고 기능 관련 상태
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState<string>('');
  const [reportDetails, setReportDetails] = useState('');

  // StrictMode에서도 API가 딱 한 번만 호출되도록 보장하는 '문지기'
  const isInitialLoad = useRef(true);

  // 게시글 데이터 조회 및 조회수 증가 로직을 역할에 따라 분리
  useEffect(() => {
    // 순수하게 데이터만 가져오는 함수
    const fetchPostData = async () => {
      try {
        const response = await axiosInstance.get(
          `/api/board/detail/${boardId}`
        );
        const postData = response.data?.data || null;
        setPost(postData);

        // 👈 백엔드에서 'liked'로 보내므로 liked 사용
        if (postData && postData.liked !== undefined) {
          setIsLiked(postData.liked);
        }

        setCurrentImageIndex(0);
      } catch (error) {
        console.error('게시글 불러오기 실패:', error);
        alert('게시글을 불러오는데 실패했습니다.');
        navigate('/posts');
      } finally {
        setLoading(false);
      }
    };

    // 조회수만 1 증가시키는 함수
    const incrementViewCount = async () => {
      try {
        await axiosInstance.patch(`/api/board/${boardId}/view`);
      } catch (error) {
        console.error('조회수 증가 요청 실패:', error);
      }
    };

    // '문지기'가 처음이라고 할 때만 두 API를 각각 한 번씩 호출
    if (isInitialLoad.current) {
      fetchPostData();
      incrementViewCount();
      isInitialLoad.current = false;
    }
  }, [boardId, navigate]);

  // 이미지 배열 길이가 변경되면 인덱스 초기화
  useEffect(() => {
    if (post && currentImageIndex >= post.imageUrls.length) {
      setCurrentImageIndex(0);
    }
  }, [post?.imageUrls.length]);

  // 작성자 여부 확인
  const isAuthor = post?.writerEmail === email;

  // 게시글 삭제
  const handleDelete = async () => {
    if (!window.confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
      return;
    }
    try {
      await axiosInstance.delete(`/api/board/delete/${boardId}`);
      alert('게시글이 삭제되었습니다.');
      navigate('/posts');
    } catch (error) {
      console.error('게시글 삭제 실패:', error);
      alert('게시글 삭제에 실패했습니다.');
    }
  };

  // 게시글 수정 페이지로 이동
  const handleEdit = () => {
    navigate(`/board/edit/${boardId}`);
  };

  // 좋아요 처리
  const handleLike = async () => {
    if (!isAuthenticated) {
      alert('로그인이 필요한 기능입니다.');
      navigate('/login');
      return;
    }
    try {
      await axiosInstance.put(`/api/board/${boardId}/favorite`);
      setIsLiked(!isLiked);
      setPost((prev) =>
        prev
          ? {
              ...prev,
              favoriteCount: isLiked
                ? prev.favoriteCount - 1
                : prev.favoriteCount + 1,
            }
          : null
      );
    } catch (error) {
      console.error('좋아요 실패:', error);
    }
  };

  const handlePrevImage = () => {
    if (!post) return;
    setCurrentImageIndex((prev) =>
      prev === 0 ? post.imageUrls.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    if (!post) return;
    setCurrentImageIndex((prev) =>
      prev === post.imageUrls.length - 1 ? 0 : prev + 1
    );
  };

  // 채팅방 참여 및 모달 열기
  const handleChatOpen = async () => {
    if (!isAuthenticated) {
      alert('로그인이 필요한 기능입니다.');
      navigate('/login');
      return;
    }
    if (!post || post.chatRoomId <= 0) {
      alert('유효하지 않은 채팅방 정보입니다.');
      return;
    }
    try {
      await axiosInstance.post(
        `${API_BASE_URL}/room/group/${post.chatRoomId}/join`
      );
    } catch (error) {
      console.error('[ERROR] 채팅방 참여 요청 실패:', error);
      const status = (error as any).response?.status;
      if (status === 500) {
        alert('채팅방 참여에 실패했습니다. (서버 내부 오류)');
        return;
      }
    }
    const modalWidth = window.innerWidth < 640 ? window.innerWidth - 32 : 384;
    const modalHeight =
      window.innerWidth < 640 ? window.innerHeight - 100 : 600;
    const newPosition = {
      x: Math.max(16, Math.random() * (window.innerWidth - modalWidth - 32)),
      y: Math.max(
        16,
        Math.random() * (window.innerHeight - modalHeight - 32) + 50
      ),
    };
    setChatPosition(newPosition);
    setIsChatOpen(true);
  };

  // 신고 버튼 클릭 핸들러
  const handleReportButtonClick = () => {
    if (!isAuthenticated) {
      alert('로그인이 필요한 기능입니다.');
      navigate('/login');
      return;
    }
    setIsReportModalOpen(true);
  };

  // 신고 모달 닫기 핸들러
  const handleCloseReportModal = () => {
    setIsReportModalOpen(false);
    setReportReason('');
    setReportDetails('');
  };

  // 신고 제출 핸들러
  const handleSubmitReport = async () => {
    if (!reportReason) {
      alert('신고 사유를 선택해주세요.');
      return;
    }
    if (reportReason === 'OTHER' && !reportDetails.trim()) {
      alert('기타 사유를 선택한 경우, 상세 내용을 입력해주세요.');
      return;
    }

    try {
      await axiosInstance.post(`/api/board/${boardId}/report`, {
        reason: reportReason,
        details: reportDetails,
      });
      alert('게시글이 정상적으로 신고되었습니다.');
      handleCloseReportModal();
    } catch (error) {
      const errorResponse = (error as any).response;
      if (errorResponse?.data?.message === 'ALREADY_REPORTED_BOARD') {
        alert('이미 신고한 게시글입니다.');
      } else {
        console.error('신고 실패:', error);
        alert('신고 처리에 실패했습니다. 다시 시도해주세요.');
      }
      handleCloseReportModal();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100">
        <main className="py-12 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-gray-500 text-lg">게시글을 불러오는 중...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100">
        <main className="py-12 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              게시글을 찾을 수 없습니다
            </h1>
            <button
              onClick={() => navigate('/posts')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg"
            >
              목록으로 돌아가기
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100">
      <main className="py-6 sm:py-8 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          {/* 뒤로 가기 버튼 및 수정/삭제/신고 */}
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => navigate('/posts')}
              className="text-gray-600 hover:text-gray-900 flex items-center gap-1"
            >
              ← 목록으로
            </button>

            <div className="flex gap-2">
              {/* 작성자에게만 보이는 수정/삭제 버튼 */}
              {isAuthenticated && isAuthor && (
                <>
                  <button
                    onClick={handleEdit}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm transition-colors"
                  >
                    수정
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
                  >
                    삭제
                  </button>
                </>
              )}
              {/* 작성자가 아닌 사용자에게만 보이는 신고 버튼 */}
              {!isAuthor && (
                <button
                  onClick={handleReportButtonClick}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
                >
                  신고
                </button>
              )}
            </div>
          </div>

          <div className="overflow-hidden shadow-xl border-0 bg-white/80 backdrop-blur-sm rounded-xl">
            {/* 이미지 슬라이더 */}
            <div className="relative aspect-video bg-gray-100">
              {post.imageUrls.length > 0 ? (
                <img
                  src={post.imageUrls[currentImageIndex]}
                  alt={post.title}
                  className="w-full h-full object-cover"
                  onError={() => {
                    if (currentImageIndex < post.imageUrls.length - 1) {
                      setCurrentImageIndex(currentImageIndex + 1);
                    } else {
                      setCurrentImageIndex(0);
                    }
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <div className="text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="mt-2 text-sm text-gray-500">
                      이미지가 없습니다
                    </p>
                  </div>
                </div>
              )}
              {post.imageUrls.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-10 h-10 flex items-center justify-center text-2xl transition-colors"
                  >
                    ‹
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-10 h-10 flex items-center justify-center text-2xl transition-colors"
                  >
                    ›
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {post.imageUrls.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentImageIndex
                            ? 'bg-white w-6'
                            : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
              <div className="absolute top-4 left-4">
                <span className="bg-emerald-600 text-white text-sm px-3 py-1 rounded-full shadow-md">
                  나눔
                </span>
              </div>
            </div>
            <div className="p-6 sm:p-8">
              <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                  {post.title}
                </h1>
              </div>
              {post.hashtags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {post.hashtags.map((hashtag, index) => (
                    <span
                      key={index}
                      className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-3 py-1 rounded-full text-sm"
                    >
                      {hashtag}
                    </span>
                  ))}
                </div>
              )}
              <div className="bg-emerald-50 border border-emerald-200 mb-6 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">1인당 가격</p>
                    <p className="text-xl font-bold text-gray-900">
                      {post.totalPrice.toLocaleString()}원
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">거래 지역</p>
                    <p className="text-lg font-semibold text-emerald-600">
                      📍 {post.address}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  상품 설명
                </h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {post.content}
                </p>
              </div>
              <div className="flex items-center gap-6 mb-6 pb-6 border-b">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-2 transition-colors ${
                    isLiked
                      ? 'text-red-500'
                      : 'text-gray-600 hover:text-red-500'
                  }`}
                >
                  <span className="text-xl">{isLiked ? '❤️' : '🤍'}</span>
                  <span className="font-medium">{post.favoriteCount}</span>
                </button>
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="text-xl">👁</span>
                  <span className="font-medium">{post.viewCount}</span>
                </div>
              </div>
              <button
                onClick={handleChatOpen}
                className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white text-lg font-semibold rounded-lg transition-colors shadow-lg hover:shadow-xl"
              >
                채팅방 참여하기
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* 'post'가 null이 아님을 보장하여 오류 해결 */}
      {isChatOpen && post && (
        <ChatModal
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          postTitle={post.title}
          currentParticipants={0}
          maxParticipants={5}
          onParticipantChange={() => {}}
          position={chatPosition}
          roomId={post.chatRoomId}
        />
      )}

      {/* 신고 모달 */}
      {isReportModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
            <div className="p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-900">
                게시글 신고
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">
                신고 사유를 선택해주세요. 허위 신고 시 제재를 받을 수 있습니다.
              </p>
              <div className="space-y-2">
                {Object.entries(reportReasons).map(([key, value]) => (
                  <label key={key} className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="reportReason"
                      value={key}
                      checked={reportReason === key}
                      onChange={(e) => setReportReason(e.target.value)}
                      className="h-4 w-4 text-emerald-600 border-gray-300 focus:ring-emerald-500"
                    />
                    <span className="text-gray-800">{value}</span>
                  </label>
                ))}
              </div>
              {reportReason === 'OTHER' && (
                <textarea
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder="상세 사유를 입력해주세요."
                  className="w-full h-24 p-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 transition"
                />
              )}
            </div>
            <div className="flex justify-end gap-3 p-4 bg-gray-50 rounded-b-lg">
              <button
                onClick={handleCloseReportModal}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSubmitReport}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
              >
                신고 제출
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BoardDetail;
