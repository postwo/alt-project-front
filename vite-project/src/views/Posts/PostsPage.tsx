import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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
}

const Posts: React.FC = () => {
  const navigate = useNavigate();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedHashtag, setSelectedHashtag] = useState<string>('');

  // ✅ axios 기본 URL 설정
  axios.defaults.baseURL = 'http://localhost:8080';

  // 📡 서버에서 게시글 목록 불러오기
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('/api/board/latest-list');
        console.log(
          '첫 번째 게시글 이미지:',
          response.data?.data[0]?.imageUrls
        );
        // ApiResponse.Success 구조에서 .data 접근
        setPosts(response.data?.data || []);
      } catch (error) {
        console.error('게시글 목록 불러오기 실패:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  // 필터링
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const searchLower = searchTerm.toLowerCase();
      const hashtagLower = selectedHashtag.toLowerCase();

      const matchesSearch = post.title.toLowerCase().includes(searchLower);
      const matchesLocation =
        selectedLocation === 'all' || post.address.includes(selectedLocation);
      const matchesHashtag =
        !selectedHashtag ||
        post.hashtags.some((tag) => tag.toLowerCase().includes(hashtagLower));

      return matchesSearch && matchesLocation && matchesHashtag;
    });
  }, [posts, searchTerm, selectedLocation, selectedHashtag]);

  const allHashtags = useMemo(() => {
    return Array.from(new Set(posts.flatMap((p) => p.hashtags)));
  }, [posts]);

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
          {/* 게시글 목록 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredPosts.map((post) => (
              <a key={post.id} href={`/board/${post.id}`} className="block">
                <div className="group hover:shadow-2xl transition-all duration-300 border border-gray-100 rounded-xl bg-white overflow-hidden cursor-pointer">
                  <div className="relative">
                    <img
                      src={
                        // 이미지 가지고오기
                        post.imageUrls.length > 0
                          ? post.imageUrls[0]
                          : '/no-image.png'
                      }
                      alt={post.title}
                      className="w-full h-40 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center justify-center font-medium rounded-full bg-emerald-600 text-white text-xs px-3 py-1 shadow-md">
                        나눔
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
                      <span className="font-medium text-gray-700">
                        {post.address}
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
