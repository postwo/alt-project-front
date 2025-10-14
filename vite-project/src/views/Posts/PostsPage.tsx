import React, { useState, useMemo } from 'react';

// ====================================================================
// 1. 타입 정의 (TypeScript Interface)
// ====================================================================

interface Post {
  id: number;
  title: string;
  category: string;
  hashtags: string[];
  totalPrice: number;
  pricePerPerson: number;
  currentParticipants: number;
  maxParticipants: number;
  location: string;
  image: string;
  author: string;
}

// ====================================================================
// 2. 샘플 데이터 정의 (Post[] 타입 명시)
// ====================================================================

const samplePosts: Post[] = [
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
    image: 'https://placehold.co/600x400/047857/ffffff?text=유기농+양배추',
    author: '김나눔',
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
    image: 'https://placehold.co/600x400/d97706/ffffff?text=제철+과일',
    author: '이절약',
  },
  {
    id: 3,
    title: '대용량 닭가슴살 소분 나눔 (10kg)',
    category: '정육/계란',
    hashtags: ['닭가슴살', '단백질', '운동', '다이어트'],
    totalPrice: 95000,
    pricePerPerson: 19000,
    currentParticipants: 5,
    maxParticipants: 5,
    location: '서울시 송파구',
    image: 'https://placehold.co/600x400/ef4444/ffffff?text=닭가슴살',
    author: '박건강',
  },
  {
    id: 4,
    title: '고급 올리브 오일 3L 묶음 구매',
    category: '가공식품',
    hashtags: ['올리브오일', '샐러드', '지중해식', '유지류'],
    totalPrice: 45000,
    pricePerPerson: 15000,
    currentParticipants: 1,
    maxParticipants: 3,
    location: '서울시 서초구',
    image: 'https://placehold.co/600x400/3b82f6/ffffff?text=올리브+오일',
    author: '최쉐프',
  },
  {
    id: 5,
    title: '프리미엄 쌀 20kg 소분해요',
    category: '곡물/잡곡',
    hashtags: ['쌀', '밥', '햅쌀', '주식'],
    totalPrice: 60000,
    pricePerPerson: 15000,
    currentParticipants: 4,
    maxParticipants: 4,
    location: '서울시 용산구',
    image: 'https://placehold.co/600x400/22c55e/ffffff?text=프리미엄+쌀',
    author: '정나눔',
  },
];

// ====================================================================
// 3. 메인 컴포넌트 (React.FC 사용 및 State에 타입 명시)
// ====================================================================

const Posts: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedHashtag, setSelectedHashtag] = useState<string>('');
  // const [selectedCategory] = useState<string>('all'); // 사용하지 않으므로 제거

  // 게시글 필터링 로직 (useMemo로 성능 최적화)
  const filteredPosts = useMemo(() => {
    return samplePosts.filter((post) => {
      const searchLower = searchTerm.toLowerCase();
      const hashtagLower = selectedHashtag.toLowerCase();

      // 1. 상품명 검색 필터
      const matchesSearch = post.title.toLowerCase().includes(searchLower);

      // 2. 지역 필터
      const matchesLocation =
        selectedLocation === 'all' || post.location.includes(selectedLocation);

      // 3. 해시태그 필터 (정확히 일치하거나, 해시태그 검색 필드에 입력된 문자열을 포함하는 태그 검색)
      const matchesHashtag =
        !selectedHashtag ||
        post.hashtags.some((tag) => tag.toLowerCase().includes(hashtagLower));

      return matchesSearch && matchesLocation && matchesHashtag;
    });
  }, [searchTerm, selectedLocation, selectedHashtag]);

  // 모든 해시태그 목록 생성 (중복 제거)
  const allHashtags = useMemo(() => {
    return Array.from(new Set(samplePosts.flatMap((post) => post.hashtags)));
  }, []);

  const handleHashtagClick = (hashtag: string) => {
    // 이미 선택된 태그를 다시 클릭하면 해제
    if (selectedHashtag === hashtag) {
      setSelectedHashtag('');
    } else {
      setSelectedHashtag(hashtag);
      setSearchTerm(''); // 해시태그 선택 시 상품명 검색 초기화
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    if (value) setSelectedHashtag(''); // 상품명 검색 시 해시태그 초기화
  };

  const clearFilter = () => {
    setSearchTerm('');
    setSelectedHashtag('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100 font-sans">
      <main className="py-6 sm:py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {/* 페이지 헤더 */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 font-['Inter']">
              나눔 게시글
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              1인 가구를 위한 똑똑한 식료품 나눔
            </p>
          </div>

          {/* 검색, 해시태그, 지역, 작성 버튼 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8 border border-emerald-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
              {/* 상품명 검색 (Search 아이콘 인라인 SVG로 대체) */}
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input
                  type="text"
                  placeholder="상품명으로 검색..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-10 border border-gray-200 rounded-lg focus:border-emerald-500 focus:ring-emerald-500 text-sm sm:text-base p-2 transition duration-150"
                />
              </div>

              {/* 해시태그 검색 (input은 검색 기능으로 사용) */}
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm font-bold">
                  #
                </span>
                <input
                  type="text"
                  placeholder="해시태그로 검색..."
                  // 선택된 해시태그가 있으면 input에 표시, 아니면 일반 검색어로 사용
                  value={selectedHashtag}
                  onChange={(e) => {
                    // 해시태그 입력 시 selectedHashtag state를 직접 변경하여 필터링
                    setSelectedHashtag(e.target.value);
                    if (e.target.value) setSearchTerm('');
                  }}
                  className="w-full pl-8 border border-gray-200 rounded-lg focus:border-emerald-500 focus:ring-emerald-500 text-sm sm:text-base p-2 transition duration-150"
                />
                {/* 해시태그가 검색/선택된 경우 초기화 버튼 표시 */}
                {(selectedHashtag || searchTerm) && (
                  <button
                    onClick={clearFilter}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition duration-150"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* 지역 선택 */}
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="border border-gray-200 rounded-lg focus:border-emerald-500 text-sm sm:text-base p-2 transition duration-150"
              >
                <option value="all">📍 전체 지역</option>
                <option value="강남구">서울시 강남구</option>
                <option value="마포구">서울시 마포구</option>
                <option value="송파구">서울시 송파구</option>
                <option value="서초구">서울시 서초구</option>
                <option value="용산구">서울시 용산구</option>
                <option value="종로구">서울시 종로구</option>
                <option value="노원구">서울시 노원구</option>
                <option value="은평구">서울시 은평구</option>
                <option value="동작구">서울시 동작구</option>
              </select>

              {/* 나눔 공고 작성 버튼 (Plus 아이콘 인라인 SVG로 대체) */}
              <a href="/board/create-post" className="w-full">
                <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm sm:text-base px-4 py-2 rounded-lg flex items-center justify-center transition-colors duration-150 shadow-md hover:shadow-lg">
                  <svg
                    className="w-4 h-4 mr-2"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  <span className="hidden sm:inline">나눔 공고 작성</span>
                </button>
              </a>
            </div>

            {/* 인기 해시태그 */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100 mt-4">
              <span className="text-xs sm:text-sm text-gray-600 mr-2 font-semibold">
                인기 해시태그:
              </span>
              {allHashtags.slice(0, 8).map((hashtag) => (
                <button
                  key={hashtag}
                  onClick={() => handleHashtagClick(hashtag)}
                  className={`text-xs px-3 py-1 rounded-full border transition-colors duration-150 ${
                    selectedHashtag === hashtag
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-white text-emerald-600 border-emerald-200 hover:bg-emerald-50'
                  }`}
                >
                  #{hashtag}
                </button>
              ))}
            </div>
          </div>

          {/* 게시글 목록 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredPosts.map((post) => (
              <a key={post.id} href={`/posts/${post.id}`} className="block">
                <div className="group hover:shadow-2xl transition-all duration-300 border border-gray-100 rounded-xl bg-white overflow-hidden cursor-pointer">
                  <div className="relative">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-40 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      {/* Badge 컴포넌트 대신 <span> 태그 사용 */}
                      <span className="inline-flex items-center justify-center font-medium rounded-full bg-emerald-600 text-white text-xs px-3 py-1 shadow-md">
                        {post.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 sm:p-5">
                    <h3 className="font-semibold text-base sm:text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                      {post.title}
                    </h3>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {post.hashtags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center justify-center font-medium rounded-full text-xs px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-200"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <div className="text-xs text-gray-600 flex justify-between pt-2 border-t border-gray-50">
                      <div className="flex items-center">
                        {/* Users 아이콘 인라인 SVG로 대체 */}
                        <svg
                          className="w-3 h-3 inline mr-1 text-emerald-500"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                          <circle cx="9" cy="7" r="4"></circle>
                          <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                        <span className="font-medium text-gray-700">
                          {post.currentParticipants}/{post.maxParticipants}명
                        </span>
                      </div>
                      <div className="flex items-center">
                        {/* MapPin 아이콘 인라인 SVG로 대체 */}
                        <svg
                          className="w-3 h-3 inline mr-1 text-emerald-500"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                          <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        <span className="font-medium text-gray-700">
                          {post.location.replace('서울시 ', '')}
                        </span>
                      </div>
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
