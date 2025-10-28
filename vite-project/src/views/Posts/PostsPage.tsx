import React, { useEffect, useState, useMemo } from 'react';
import axiosInstance from '../../apis/axiosInstance'; // axios 인스턴스 import
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../../store/userSlice';

// 🚨 Users, MapPin SVG 컴포넌트 정의 제거

interface Post {
  id: number;
  title: string;
  content: string;
  address: string; // 예: '서울특별시 강남구 논현동 123-45'
  totalPrice: number;
  favoriteCount: number;
  viewCount: number;
  hashtags: string[];
  imageUrls: string[]; // 추가된 필드: 현재 참여 인원 및 최대 모집 인원
  currentParticipants: number;
  maxParticipants: number;
}

// 💡 주소에서 시/군/구만 추출하는 함수
const extractSigungu = (fullAddress: string): string => {
  if (!fullAddress) return '지역 미정'; // 주소를 공백 기준으로 분리합니다. // 예: '서울특별시 강남구 논현동' -> ['서울특별시', '강남구', '논현동']

  const parts = fullAddress.split(' '); // 시/도(parts[0])를 제외한 다음 요소(parts[1])가 시/군/구일 확률이 높습니다.

  if (parts.length >= 2) {
    let sigungu = parts[1]; // 주소가 '세종특별자치시'처럼 시/군/구가 없는 경우 parts[1]이 공백이거나 이상할 수 있음

    if (
      sigungu &&
      (sigungu.endsWith('시') ||
        sigungu.endsWith('군') ||
        sigungu.endsWith('구'))
    ) {
      return sigungu;
    } // 시/도 자체를 반환 (예: 세종특별자치시, 제주특별자치도)
    if (parts[0] && (parts[0].endsWith('시') || parts[0].endsWith('도'))) {
      return parts[0];
    }
  } // 최소한 시/도 또는 시/군/구를 찾지 못하면 전체 주소의 앞부분을 반환

  return parts[0] || '지역 정보 없음';
};

// 🆕 지역 목록 정의 (스크롤 테스트를 위해 10개 이상으로 설정)
const locations = [
  { value: 'all', label: '전체 지역' },
  { value: '강남구', label: '강남구' },
  { value: '마포구', label: '마포구' },
  { value: '송파구', label: '송파구' },
  { value: '서초구', label: '서초구' },
  { value: '용산구', label: '용산구' },
  { value: '종로구', label: '종로구' },
  { value: '노원구', label: '노원구' },
  { value: '은평구', label: '은평구' },
  { value: '동작구', label: '동작구' },
  { value: '광진구', label: '광진구' },
  { value: '성동구', label: '성동구' },
  { value: '영등포구', label: '영등포구' },
  { value: '구로구', label: '구로구' },
  { value: '금천구', label: '금천구' },
];

const Posts: React.FC = () => {
  const navigate = useNavigate(); // Zustand store에서 로그인 상태 가져오기

  const { isAuthenticated } = useUserStore();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedHashtag, setSelectedHashtag] = useState<string>('');

  // 🆕 커스텀 드롭다운 상태 추가
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  // 나눔 공고 작성 버튼 클릭 핸들러
  const handleCreatePost = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Zustand store의 isAuthenticated로 로그인 여부 확인

    if (!isAuthenticated) {
      alert('로그인이 필요한 서비스입니다.');
      navigate('/login');
      return;
    }

    navigate('/board/create-post');
  }; // 📡 서버에서 게시글 목록 불러오기

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axiosInstance.get('/api/board/latest-list'); // ApiResponse.Success 구조에서 .data 접근 // 🚨 테스트를 위해 임시 데이터 추가 (currentParticipants를 최소 1로 설정)
        const fetchedData: Post[] = (response.data?.data || []).map(
          (post: any) => ({
            ...post, // API 응답 구조에 맞게 수정 필요
            currentParticipants: post.currentParticipants || 1, // 최소 1 (작성자)
            maxParticipants: post.maxParticipants || 4,
          })
        );
        setPosts(fetchedData);
      } catch (error) {
        console.error('게시글 목록 불러오기 실패:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []); // 필터링

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const searchLower = searchTerm.toLowerCase();
      const hashtagLower = selectedHashtag.toLowerCase();

      const matchesSearch = post.title.toLowerCase().includes(searchLower); // 💡 지역 필터링도 시/군/구로만 확인

      const postSigungu = extractSigungu(post.address);
      const matchesLocation =
        selectedLocation === 'all' || postSigungu.includes(selectedLocation);

      const matchesHashtag =
        !selectedHashtag ||
        post.hashtags.some((tag) => tag.toLowerCase().includes(hashtagLower));

      return matchesSearch && matchesLocation && matchesHashtag;
    });
  }, [posts, searchTerm, selectedLocation, selectedHashtag]);

  if (loading) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 text-lg">게시글을 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100 font-sans">
      <main className="py-6 sm:py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {/* 🔥 필터 섹션 전체에 relative z-50 추가 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8 border border-emerald-100 relative z-50">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
              {/* 상품명 검색 */}
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
                <input
                  type="text"
                  placeholder="상품명으로 검색..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    if (e.target.value) setSelectedHashtag('');
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none text-sm sm:text-base"
                />
              </div>
              {/* Hashtag 검색 */}
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <line x1="4" y1="9" x2="20" y2="9"></line>
                  <line x1="4" y1="15" x2="20" y2="15"></line>
                  <line x1="10" y1="3" x2="8" y2="21"></line>{' '}
                  <line x1="16" y1="3" x2="14" y2="21"></line>
                </svg>
                <input
                  type="text"
                  placeholder="해시태그로 검색..."
                  value={selectedHashtag}
                  onChange={(e) => {
                    setSelectedHashtag(e.target.value);
                    if (e.target.value) setSearchTerm('');
                  }}
                  className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-md focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none text-sm sm:text-base"
                />
                {selectedHashtag && (
                  <button
                    onClick={() => setSelectedHashtag('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xl leading-none"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* 🗺️ 지역 필터: 커스텀 드롭다운으로 대체 (스크롤 기능 포함) */}
              {/* 🔥 z-50 제거 (부모가 이미 z-50이므로) */}
              <div className="relative">
                {/* 🔽 현재 선택된 값 표시 및 드롭다운 토글 버튼 */}
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  // onBlur: 외부 클릭 시 드롭다운 닫기 위한 처리. setTimeout으로 선택 이벤트가 먼저 처리되도록 합니다.
                  onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                  className={`
                        w-full px-4 py-2 border rounded-md text-sm sm:text-base bg-white flex justify-between items-center transition-all duration-150
                        ${
                          isDropdownOpen
                            ? 'border-emerald-600 ring-1 ring-emerald-600'
                            : 'border-gray-200 hover:border-emerald-500'
                        }
                    `}
                >
                  {locations.find((loc) => loc.value === selectedLocation)
                    ?.label || '지역 선택'}
                  <svg
                    className={`w-4 h-4 ml-2 transition-transform duration-200 ${
                      isDropdownOpen ? 'transform rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>

                {/* 🔽 드롭다운 목록 (스크롤 가능) */}
                {isDropdownOpen && (
                  <div
                    className="absolute mt-1 w-full bg-white border border-emerald-600 rounded-md shadow-xl"
                    style={{ maxHeight: '300px', overflowY: 'auto' }} // 목록 높이 고정 (약 10줄) 및 넘치면 스크롤
                  >
                    {locations.map((location) => (
                      <button
                        key={location.value}
                        onClick={() => {
                          setSelectedLocation(location.value);
                          setIsDropdownOpen(false); // 선택 후 닫기
                        }}
                        className={`
                                    w-full text-left px-4 py-2 text-sm sm:text-base block transition-colors duration-100
                                    ${
                                      selectedLocation === location.value
                                        ? 'bg-blue-600 text-white font-semibold' // 이미지의 파란색 하이라이트 스타일
                                        : 'text-gray-900 hover:bg-gray-100'
                                    }
                                `}
                      >
                        {location.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 나눔 공고 작성 버튼 */}
              <button
                onClick={handleCreatePost}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md flex items-center justify-center text-sm sm:text-base transition-colors"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <line x1="12" y1="5" x2="12" y2="19"></line>{' '}
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                <span className="hidden sm:inline">나눔 공고 작성</span>
                <span className="sm:hidden">공고 작성</span>
              </button>
            </div>
          </div>
          {/* 게시글 목록 */}
          {/* 🔥 게시글 목록은 z-0으로 설정하여 필터보다 아래에 위치 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredPosts.map((post) => (
              <a key={post.id} href={`/board/${post.id}`} className="block">
                <div className="group hover:shadow-2xl transition-all duration-300 border border-gray-100 rounded-xl bg-white overflow-hidden cursor-pointer">
                  <div className="relative">
                    <img
                      src={
                        post.imageUrls.length > 0
                          ? post.imageUrls[0]
                          : '/no-image.png'
                      }
                      alt={post.title}
                      className="w-full h-40 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center justify-center font-medium rounded-full bg-emerald-600 text-white text-xs px-3 py-1 shadow-md">
                        공동구매
                      </span>
                    </div>
                  </div>

                  <div className="p-4 sm:p-5">
                    <h3 className="font-semibold text-base sm:text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                      {post.title}
                    </h3>
                    {/* ⭐️ 모집 인원 및 지역 정보 섹션 ⭐️ */}
                    <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600 mb-3">
                      <div className="flex items-center">
                        {/* 👥 아이콘 */}
                        <span className="mr-1 text-base leading-none">👥</span>

                        <span>
                          {/* 현재 참여 인원/최대 모집 인원 표시 */}{' '}
                          {post.currentParticipants}/{post.maxParticipants}명
                        </span>
                      </div>

                      <div className="flex items-center">
                        {/* 📍 아이콘 */}
                        <span className="mr-1 text-base leading-none">📍</span>

                        <span className="truncate max-w-20 sm:max-w-none">
                          {extractSigungu(post.address)}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {post.hashtags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center justify-center font-medium rounded-full text-xs px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="text-xs text-gray-600 flex justify-between pt-2 border-t border-gray-50">
                      <span className="font-medium text-gray-700">
                        1인당 가격
                      </span>

                      <span className="font-medium text-gray-700">
                        {post.totalPrice.toLocaleString()}원
                      </span>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-12 bg-white/50 backdrop-blur-sm rounded-xl mt-8 border border-dashed border-gray-300">
              <p className="text-xl font-medium text-gray-700">
                😢 검색 결과가 없습니다.
              </p>

              <p className="text-sm text-gray-500 mt-2">
                다른 검색 조건이나 키워드로 다시 시도해 보세요.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Posts;
