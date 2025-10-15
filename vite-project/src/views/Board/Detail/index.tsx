import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ChatModal from '../../Chat/chat-modal';

const samplePosts = [
  {
    id: 1,
    title: '유기농 양배추 10kg 함께 나눠요',
    category: '채소류',
    hashtags: ['유기농', '양배추', '건강식품', '신선'],
    totalPrice: 50000,
    pricePerPerson: 10000,
    currentParticipants: 3,
    maxParticipants: 5,
    location: '서울시 강남구',
    images: [
      '/fresh-organic-vegetables-cabbage-lettuce-carrots.png',
      '/fresh-organic-vegetables-cabbage-lettuce-carrots.png',
      '/fresh-organic-vegetables-cabbage-lettuce-carrots.png',
    ],
    author: '김나눔',
    description:
      '신선한 유기농 양배추 10kg을 함께 나눠요! 직접 농장에서 받아온 신선한 양배추입니다. 건강하고 맛있는 양배추로 다양한 요리를 만들어보세요.',
    createdAt: '2025-01-20',
  },
  {
    id: 2,
    title: '제철 과일 박스 (사과, 배, 귤)',
    category: '과일류',
    hashtags: ['제철과일', '사과', '배', '귤', '비타민'],
    totalPrice: 80000,
    pricePerPerson: 20000,
    currentParticipants: 2,
    maxParticipants: 4,
    location: '서울시 마포구',
    images: ['/fresh-fruits-apples-oranges-bananas.png'],
    author: '이절약',
    description:
      '제철 과일 박스입니다. 사과, 배, 귤이 골고루 들어있어요. 신선하고 맛있는 과일을 함께 나눠요!',
    createdAt: '2025-01-19',
  },
  {
    id: 3,
    title: '프리미엄 쌀 20kg (햅쌀)',
    category: '곡물류',
    hashtags: ['햅쌀', '프리미엄', '국산쌀', '대용량'],
    totalPrice: 120000,
    pricePerPerson: 24000,
    currentParticipants: 4,
    maxParticipants: 5,
    location: '서울시 송파구',
    images: ['/bulk-rice-grains-10kg-bag.png'],
    author: '박알뜰',
    description:
      '올해 수확한 햅쌀입니다. 프리미엄 품질의 국산쌀로 밥맛이 정말 좋아요!',
    createdAt: '2025-01-18',
  },
];

function BoardDetail() {
  const params = useParams();
  const navigate = useNavigate();
  const postId = Number(params.id);

  const post = samplePosts.find((p) => p.id === postId);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [likes, setLikes] = useState(12);
  const [isLiked, setIsLiked] = useState(false);
  const [views, setViews] = useState(156);
  const [currentParticipants, setCurrentParticipants] = useState(
    post?.currentParticipants || 0
  );
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatPosition, setChatPosition] = useState({ x: 100, y: 100 });

  useEffect(() => {
    setViews((prev) => prev + 1);
  }, []);

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
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded"
            >
              목록으로 돌아가기
            </button>
          </div>
        </main>
      </div>
    );
  }

  const handleLike = () => {
    setLikes((prev) => (isLiked ? prev - 1 : prev + 1));
    setIsLiked(!isLiked);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? post.images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === post.images.length - 1 ? 0 : prev + 1
    );
  };

  const handleChatOpen = () => {
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

  const handleParticipantChange = (change: number) => {
    setCurrentParticipants((prev) =>
      Math.max(0, Math.min(post.maxParticipants, prev + change))
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100">
      <main className="py-6 sm:py-8 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          {/* 뒤로 가기 버튼 */}
          <button
            onClick={() => navigate('/posts')}
            className="mb-4 text-gray-600 hover:text-gray-900"
          >
            ← 목록으로
          </button>

          <div className="overflow-hidden shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            {/* 이미지 슬라이더 */}
            <div className="relative aspect-video bg-gray-100">
              <img
                src={post.images[currentImageIndex] || '/placeholder.svg'}
                alt={post.title}
                className="w-full h-full object-cover"
              />

              {/* 이미지 네비게이션 */}
              {post.images.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2"
                  >
                    ‹
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2"
                  >
                    ›
                  </button>

                  {/* 이미지 인디케이터 */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {post.images.map((_, index) => (
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

              {/* 카테고리 표시 */}
              <div className="absolute top-4 left-4">
                <span className="bg-emerald-600 text-white text-sm px-2 py-1 rounded">
                  {post.category}
                </span>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              {/* 제목 및 작성자 */}
              <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                  {post.title}
                </h1>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>작성자: {post.author}</span>
                  <span>{post.createdAt}</span>
                </div>
              </div>

              {/* 해시태그 */}
              <div className="flex flex-wrap gap-2 mb-6">
                {post.hashtags.map((hashtag) => (
                  <span
                    key={hashtag}
                    className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded text-sm"
                  >
                    #{hashtag}
                  </span>
                ))}
              </div>

              {/* 가격 정보 */}
              <div className="bg-emerald-50 border border-emerald-200 mb-6 p-4 rounded">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">총 가격</p>
                    <p className="text-xl font-bold text-gray-900">
                      {post.totalPrice.toLocaleString()}원
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">1인당 가격</p>
                    <p className="text-xl font-bold text-emerald-600">
                      {post.pricePerPerson.toLocaleString()}원
                    </p>
                  </div>
                </div>
              </div>

              {/* 모집 정보 */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between text-gray-700">
                  <div>
                    👥 {currentParticipants}/{post.maxParticipants}명 참여 중
                  </div>
                  <div>📍 {post.location}</div>
                </div>

                {/* 진행률 바 */}
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-emerald-500 h-3 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        (currentParticipants / post.maxParticipants) * 100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* 상품 설명 */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  상품 설명
                </h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {post.description}
                </p>
              </div>

              {/* 좋아요 및 조회수 */}
              <div className="flex items-center gap-6 mb-6 pb-6 border-b">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-2 ${
                    isLiked
                      ? 'text-red-500'
                      : 'text-gray-600 hover:text-red-500'
                  }`}
                >
                  {isLiked ? '❤️' : '🤍'} <span>{likes}</span>
                </button>
                <div className="flex items-center gap-2 text-gray-600">
                  👁 <span>{views}</span>
                </div>
              </div>

              {/* 채팅 참여 버튼 */}
              <button
                onClick={handleChatOpen}
                className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white text-lg font-semibold rounded"
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
          currentParticipants={currentParticipants}
          maxParticipants={post.maxParticipants}
          onParticipantChange={handleParticipantChange}
          position={chatPosition}
        />
      )}
    </div>
  );
}

export default BoardDetail;
