import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
}

function BoardDetail() {
  const params = useParams();
  const navigate = useNavigate();
  const postId = Number(params.boardNumber); // 보드넘버를 가지고 올려면 app.tsx에서 라우트한 path=":boardNumber" 아거랑 이름을 같게 해야한다 (중요)
  const { isAuthenticated, email } = useUserStore();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatPosition, setChatPosition] = useState({ x: 100, y: 100 });

  // 게시글 데이터 불러오기 (수정된 부분)
  useEffect(() => {
    const fetchPost = async () => {
      try {
        // ✅ 쿼리 파라미터로 boardId 전달
        // const response = await axiosInstance.get('/api/board/detail', {
        //   params: { boardId: postId },
        // });

        // postId를 URL 경로에 직접 삽입 = pathvariable
        const response = await axiosInstance.get(`/api/board/detail/${postId}`);
        console.log('게시글 상세 응답:', response);
        setPost(response.data?.data || null);
      } catch (error) {
        console.error('게시글 불러오기 실패:', error);
        alert('게시글을 불러오는데 실패했습니다.');
        navigate('/posts');
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      // 이조건이 맞은면 게시글을 가지고 온다
      fetchPost();
    }
  }, [postId, navigate]);

  // 작성자 여부 확인
  const isAuthor = post?.writerEmail === email;

  // 게시글 삭제
  const handleDelete = async () => {
    if (!window.confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await axiosInstance.delete(`/api/board/delete/${postId}`);
      alert('게시글이 삭제되었습니다.');
      navigate('/posts');
    } catch (error) {
      console.error('게시글 삭제 실패:', error);
      alert('게시글 삭제에 실패했습니다.');
    }
  };

  // 게시글 수정 페이지로 이동
  const handleEdit = () => {
    navigate(`/board/edit/${postId}`);
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      alert('로그인이 필요한 기능입니다.');
      navigate('/login');
      return;
    }

    try {
      // 좋아요 API 호출
      await axiosInstance.post(`/api/board/${postId}/favorite`);
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

  const handleChatOpen = () => {
    if (!isAuthenticated) {
      alert('로그인이 필요한 기능입니다.');
      navigate('/login');
      return;
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
          {/* 뒤로 가기 버튼 및 수정/삭제 */}
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => navigate('/posts')}
              className="text-gray-600 hover:text-gray-900 flex items-center gap-1"
            >
              ← 목록으로
            </button>

            {/* 작성자만 보이는 수정/삭제 버튼 */}
            {isAuthenticated && isAuthor && (
              <div className="flex gap-2">
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
              </div>
            )}
          </div>

          <div className="overflow-hidden shadow-xl border-0 bg-white/80 backdrop-blur-sm rounded-xl">
            {/* 이미지 슬라이더 */}
            <div className="relative aspect-video bg-gray-100">
              <img
                src={
                  post.imageUrls.length > 0
                    ? post.imageUrls[currentImageIndex]
                    : '/no-image.png'
                }
                alt={post.title}
                className="w-full h-full object-cover"
              />

              {/* 이미지 네비게이션 */}
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

                  {/* 이미지 인디케이터 */}
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

              {/* 나눔 표시 */}
              <div className="absolute top-4 left-4">
                <span className="bg-emerald-600 text-white text-sm px-3 py-1 rounded-full shadow-md">
                  나눔
                </span>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              {/* 제목 */}
              <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                  {post.title}
                </h1>
              </div>

              {/* 해시태그 */}
              {post.hashtags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {post.hashtags.map((hashtag, index) => (
                    <span
                      key={index}
                      className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-3 py-1 rounded-full text-sm"
                    >
                      #{hashtag}
                    </span>
                  ))}
                </div>
              )}

              {/* 가격 및 지역 정보 */}
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

              {/* 상품 설명 */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  상품 설명
                </h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {post.content}
                </p>
              </div>

              {/* 좋아요 및 조회수 */}
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

              {/* 채팅 참여 버튼 */}
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

      {isChatOpen && (
        <ChatModal
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          postTitle={post.title}
          currentParticipants={0}
          maxParticipants={5}
          onParticipantChange={() => {}}
          position={chatPosition}
        />
      )}
    </div>
  );
}

export default BoardDetail;
