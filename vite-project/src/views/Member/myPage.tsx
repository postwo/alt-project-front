import { useEffect, useState, useCallback } from 'react';
import axiosInstance from '../../apis/axiosInstance'; // axiosInstance 경로에 맞게 수정해주세요.
import { useNavigate } from 'react-router-dom';
import { useDaumPostcodePopup } from 'react-daum-postcode';
import { useUserStore } from '../../store/userSlice'; // 💡 1. Zustand store를 import 합니다.

// API 응답 데이터의 타입을 명확히 하기 위한 인터페이스 정의
interface ProfileData {
  id: number;
  nickname: string;
  email: string;
}

interface Post {
  id: number;
  title: string;
  content: string;
  hashtags: string[];
  totalPrice: number;
  currentParticipants: number;
  maxParticipants: number;
  address: string;
  imageUrls: string[];
  viewCount: number;
  favoriteCount: number;
  author?: string; // 내가 참여한 글에만 존재할 수 있음
  pricePerPerson?: number; // 내가 참여한 글에만 존재할 수 있음
  joinedAt?: string; // 내가 참여한 글에만 존재할 수 있음
}

// --- 헬퍼 함수들 ---
const formatPrice = (price: number) => price.toLocaleString();

// 💡 주소에서 시/군/구만 추출하는 함수 (PostsPage.tsx에서 가져옴)
const extractSigungu = (fullAddress: string): string => {
  if (!fullAddress) return '지역 미정';
  const parts = fullAddress.split(' ');
  if (parts.length >= 2) {
    let sigungu = parts[1];
    if (
      sigungu &&
      (sigungu.endsWith('시') ||
        sigungu.endsWith('군') ||
        sigungu.endsWith('구'))
    ) {
      return sigungu;
    }
    if (parts[0] && (parts[0].endsWith('시') || parts[0].endsWith('도'))) {
      return parts[0];
    }
  }
  return parts[0] || '지역 정보 없음';
};

export default function MyPage() {
  // 💡 2. Zustand store에서 닉네임 변경 함수를 가져옵니다.
  const { setNickname } = useUserStore();

  // --- 상태 관리 ---
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [participatedPosts, setParticipatedPosts] = useState<Post[]>([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('my-posts');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedProfile, setEditedProfile] = useState<ProfileData | null>(null);
  const [isEditingPost, setIsEditingPost] = useState<number | null>(null);
  const [editedPost, setEditedPost] = useState<Post | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<number | null>(null);
  const [postToView, setPostToView] = useState<Post | null>(null);
  // --- 게시글 수정을 위한 추가 상태 ---
  const postCodeScriptUrl =
    'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
  const openPostcodePopup = useDaumPostcodePopup(postCodeScriptUrl);
  const [addressData, setAddressData] = useState({
    sido: '',
    sigungu: '',
    fullAddress: '',
  });
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [mainImageIndex, setMainImageIndex] = useState<number>(0);

  // --- 리소스 정리 ---
  useEffect(() => {
    return () => {
      imagePreviewUrls.forEach((url) => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [imagePreviewUrls]);

  // --- 데이터 불러오기 ---
  useEffect(() => {
    const fetchMyPageData = async () => {
      try {
        // 1. 프로필 정보 가져오기
        const profileResponse = await axiosInstance.get('/api/member/me');
        const profileData = profileResponse.data.data;
        setProfile(profileData);
        setEditedProfile(profileData); // 수정용 데이터도 초기화

        // 2. 내가 쓴 글 목록 가져오기
        try {
          const myPostsResponse = await axiosInstance.get(
            `/api/board/user-board-list/${profileData.email}`
          );
          setMyPosts(
            (myPostsResponse.data?.data || []).map((post: any) => ({
              ...post,
              currentParticipants: post.currentParticipants || 1, // API 응답에 없으면 기본값 1 (작성자 본인)
              maxParticipants: post.maxParticipants || 4, // API 응답에 없으면 기본값 4
            }))
          );
        } catch (postError) {
          console.warn('내가 작성한 글 목록 불러오기 실패:', postError);
          setMyPosts([]); // 실패 시 빈 배열로 설정
        }

        // 3. 내가 참여한 글 목록 가져오기
        try {
          const participatedPostsResponse = await axiosInstance.get(
            '/api/board/participated-boards'
          );
          setParticipatedPosts(
            (participatedPostsResponse.data?.data || []).map((post: any) => ({
              ...post,
              currentParticipants: post.currentParticipants || 1, // API 응답에 없으면 기본값 1
              maxParticipants: post.maxParticipants || 4, // API 응답에 없으면 기본값 4
            }))
          );
        } catch (participatedError) {
          console.warn('내가 참여한 글 목록 불러오기 실패:', participatedError);
          setParticipatedPosts([]); // 실패 시 빈 배열로 설정
        }
      } catch (error) {
        console.error('마이페이지 프로필 정보 불러오기 실패:', error);
        alert('데이터를 불러오는 데 실패했습니다. 다시 로그인해주세요.');
      } finally {
        setLoading(false);
      }
    };

    fetchMyPageData();
  }, []); // 컴포넌트가 처음 마운트될 때 한 번만 실행

  // --- 핸들러 함수들 (추후 API 연동 필요) ---
  const handleProfileSave = async () => {
    if (!editedProfile) return;
    try {
      // 닉네임을 쿼리 파라미터로 전송
      const response = await axiosInstance.patch(
        `/api/member/update?nickname=${editedProfile.nickname}`
      );

      // 서버로부터 받은 최신 데이터로 상태 업데이트
      const updatedProfile = response.data.data;
      setProfile(updatedProfile);
      // 💡 3. Zustand store의 닉네임도 함께 업데이트합니다.
      setNickname(updatedProfile.nickname);

      setIsEditingProfile(false);
      alert('프로필이 성공적으로 저장되었습니다.');
    } catch (error) {
      console.error('프로필 저장 실패:', error);
      alert('프로필 저장에 실패했습니다.');
    }
  };

  const handlePostEdit = (post: Post) => {
    // 기존 이미지 URL과 새로 추가된 Blob URL을 모두 해제
    imagePreviewUrls.forEach((url) => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });

    // 수정할 게시글 데이터 설정
    setEditedPost({
      ...post,
      hashtags: Array.isArray(post.hashtags) ? post.hashtags : [], // 해시태그가 배열이 아니면 빈 배열로 초기화
    });

    // 이미지 관련 상태 초기화
    setImagePreviewUrls(post.imageUrls || []);
    setSelectedImages([]);
    setMainImageIndex(0);

    // 주소 관련 상태 초기화
    const addressParts = post.address ? post.address.split(' ') : [];
    setAddressData({
      sido: addressParts[0] || '',
      sigungu: addressParts[1] || '',
      fullAddress: post.address || '',
    });

    setIsEditingPost(post.id);
  };

  // 이미지 업로드 함수 (Board/Write와 동일)
  const uploadImages = async (files: File[]): Promise<string[]> => {
    if (files.length === 0) return [];
    const uploadPromises = files.map(async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      const response = await axiosInstance.post('/file/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    });
    return await Promise.all(uploadPromises);
  };

  const handlePostSave = async () => {
    if (!editedPost) return;

    if (imagePreviewUrls.length === 0) {
      alert('상품 이미지를 최소 1개 이상 등록해주세요.');
      return;
    }

    try {
      // 1. 새로 추가된 이미지 업로드
      const newImageUrls = await uploadImages(selectedImages);

      // 2. 기존 이미지 URL과 새로 업로드된 URL 병합
      const existingImageUrls = imagePreviewUrls.filter(
        (url) => !url.startsWith('blob:')
      );
      const finalImageUrls = [...existingImageUrls, ...newImageUrls];

      // 3. 대표 이미지 순서 조정
      const mainImageUrl = imagePreviewUrls[mainImageIndex];
      const orderedImageUrls = [
        mainImageUrl,
        ...finalImageUrls.filter((url) => url !== mainImageUrl),
      ];

      // 4. 서버에 보낼 데이터 구성
      const boardRequest = {
        title: editedPost.title,
        content: editedPost.content,
        totalPrice: Number(editedPost.totalPrice),
        maxParticipants: Number(editedPost.maxParticipants),
        address: addressData.fullAddress,
        hashtags:
          typeof editedPost.hashtags === 'string'
            ? (editedPost.hashtags as string)
                .split(' ')
                .filter((tag) => tag.startsWith('#') && tag.length > 1)
            : editedPost.hashtags,
        boardImageList: orderedImageUrls,
      };

      console.log('게시글 수정 요청 데이터:', boardRequest);

      // 5. 게시글 수정 API 호출
      const response = await axiosInstance.patch(
        `/api/board/update/${editedPost.id}`,
        boardRequest
      );

      // 6. 성공 후 상태 업데이트 및 모달 닫기
      // API 응답으로 받은 최신 데이터로 상태를 업데이트합니다.
      const updatedPostFromServer = response.data.data;
      setMyPosts(
        myPosts.map((p) =>
          p.id === updatedPostFromServer.id ? updatedPostFromServer : p
        )
      );

      setIsEditingPost(null);
      setEditedPost(null);
      alert('게시글이 성공적으로 수정되었습니다.');
    } catch (error) {
      console.error('게시글 저장 실패:', error);
      alert('게시글 저장에 실패했습니다.');
    }
  };

  const handleCloseEditModal = () => {
    // Blob URL 해제
    imagePreviewUrls.forEach((url) => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });
    setIsEditingPost(null);
    setEditedPost(null);
    setImagePreviewUrls([]);
    setSelectedImages([]);
  };

  const handleAddressComplete = useCallback((data: any) => {
    setAddressData({
      sido: data.sido || '',
      sigungu: data.sigungu || '',
      fullAddress: data.address || '',
    });
  }, []);

  const handleAddressClick = () => {
    openPostcodePopup({ onComplete: handleAddressComplete });
  };

  const handleDeleteClick = (postId: number) => {
    setPostToDelete(postId);
    setIsAlertOpen(true);
  };

  const handlePostDelete = async (postId: number | null) => {
    if (postId === null) return;
    try {
      await axiosInstance.delete(`/api/board/delete/${postId}`);
      console.log('게시글 삭제:', postId);
      setMyPosts(myPosts.filter((p) => p.id !== postId));
      setParticipatedPosts(participatedPosts.filter((p) => p.id !== postId));
      setIsAlertOpen(false);
      setPostToDelete(null);
      alert('게시글이 삭제되었습니다.');
    } catch (error) {
      console.error('게시글 삭제 실패:', error);
      alert('게시글 삭제에 실패했습니다.');
    }
  };

  const handlePostView = (post: Post) => {
    setPostToView(post);
    setIsDialogOpen(true);
  };

  // --- 로딩 및 에러 상태 렌더링 ---
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-emerald-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-500 text-lg">
            마이페이지 정보를 불러오는 중...
          </p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-emerald-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            사용자 정보를 찾을 수 없습니다.
          </h1>
          <p className="text-gray-600">다시 로그인한 후 시도해주세요.</p>
        </div>
      </div>
    );
  }

  // --- 메인 렌더링 ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100">
      {/* <Header /> */}

      <main className="py-6 sm:py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {/* 페이지 헤더 */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              마이페이지
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              내 활동과 정보를 관리하세요
            </p>
          </div>

          {/* 프로필 카드 */}
          <div className="mb-6 sm:mb-8 bg-white/80 backdrop-blur-sm border border-emerald-100 rounded-lg shadow-md">
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-4 sm:gap-6">
                {/* 프로필 정보 (수정/보기 모드) */}
                <div className="flex-1">
                  {isEditingProfile && editedProfile ? (
                    <div className="space-y-3">
                      <div>
                        <label
                          htmlFor="nickname-edit"
                          className="text-sm font-medium block"
                        >
                          닉네임
                        </label>
                        <input
                          id="nickname-edit"
                          value={editedProfile.nickname}
                          onChange={(e) =>
                            setEditedProfile({
                              ...editedProfile,
                              nickname: e.target.value,
                            })
                          }
                          className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div className="flex gap-2 justify-center sm:justify-start">
                        <button
                          onClick={handleProfileSave}
                          className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
                        >
                          저장
                        </button>
                        <button
                          onClick={() => setIsEditingProfile(false)}
                          className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 text-center sm:text-left">
                      <div className="flex items-center justify-center sm:justify-start gap-2">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                          {profile.nickname}
                        </h2>
                        <button
                          onClick={() => {
                            setIsEditingProfile(true);
                            setEditedProfile(profile);
                          }}
                          className="p-1 text-emerald-600 rounded-full hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                        >
                          <span className="w-4 h-4 block">✏️</span>
                        </button>
                      </div>
                      <p className="text-gray-600">{profile.email}</p>
                    </div>
                  )}
                </div>

                {/* 활동 요약 */}
                <div className="flex flex-row sm:flex-col gap-4 text-center">
                  <div className="bg-emerald-50 rounded-lg p-3 w-20 sm:w-auto">
                    <div className="text-lg sm:text-xl font-bold text-emerald-600">
                      {myPosts.length}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">
                      작성한 글
                    </div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3 w-20 sm:w-auto">
                    <div className="text-lg sm:text-xl font-bold text-blue-600">
                      {participatedPosts.length}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">
                      참여한 글
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 탭 메뉴 */}
          <div className="w-full">
            <div className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-sm rounded-t-lg shadow-inner p-1 border border-gray-200">
              <button
                onClick={() => setActiveTab('my-posts')}
                className={`p-2 text-center text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'my-posts'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-emerald-50'
                }`}
              >
                내가 작성한 글
              </button>
              <button
                onClick={() => setActiveTab('participated-posts')}
                className={`p-2 text-center text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'participated-posts'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-emerald-50'
                }`}
              >
                내가 참여한 글
              </button>
            </div>

            {/* 내가 작성한 글 목록 */}
            <div
              className={`mt-6 ${
                activeTab === 'my-posts' ? 'block' : 'hidden'
              }`}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {myPosts.map((post) => {
                  return (
                    <div
                      key={post.id}
                      className="group flex flex-col transition-all duration-300 border border-gray-100 rounded-xl bg-white overflow-hidden"
                    >
                      <div className="flex-grow">
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
                          <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600 mb-3">
                            <div className="flex items-center">
                              <span className="mr-1 text-base leading-none">
                                👥
                              </span>
                              <span>
                                {post.currentParticipants}/
                                {post.maxParticipants}명
                              </span>
                            </div>
                            <div className="flex items-center">
                              <span className="mr-1 text-base leading-none">
                                📍
                              </span>
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
                      <div className="p-4 sm:p-5 pt-0 mt-auto">
                        <div className="flex gap-2 pt-4 border-t border-gray-100">
                          <button
                            onClick={() => navigate(`/board/${post.id}`)}
                            className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors bg-transparent text-gray-700"
                          >
                            상세보기
                          </button>
                          <button
                            onClick={() => handlePostEdit(post)}
                            className="px-3 py-1.5 text-sm text-emerald-600 border border-emerald-200 rounded-md hover:bg-emerald-50 transition-colors bg-transparent"
                          >
                            수정
                          </button>
                          <button
                            onClick={() => handleDeleteClick(post.id)}
                            className="px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition-colors bg-transparent"
                          >
                            삭제
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {myPosts.length === 0 && (
                <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-lg shadow-md">
                  <div className="text-4xl mb-4">📝</div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    작성한 게시글이 없습니다
                  </h3>
                  <p className="text-gray-500 mb-4">
                    첫 번째 공동구매 공고를 작성해보세요!
                  </p>
                  <button // This button navigates to the post creation page
                    onClick={() => navigate('/board/create-post')}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
                  >
                    공동구매 공고 작성하기
                  </button>
                </div>
              )}
            </div>

            {/* 내가 참여한 글 목록 */}
            <div
              className={`mt-6 ${
                activeTab === 'participated-posts' ? 'block' : 'hidden'
              }`}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {participatedPosts.map((post) => {
                  return (
                    <div
                      key={post.id}
                      className="group flex flex-col transition-all duration-300 border border-gray-100 rounded-xl bg-white overflow-hidden"
                    >
                      <div className="flex-grow">
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
                            <span className="inline-flex items-center justify-center font-medium rounded-full bg-blue-600 text-white text-xs px-3 py-1 shadow-md">
                              참여중
                            </span>
                          </div>
                        </div>

                        <div className="p-4 sm:p-5">
                          <h3 className="font-semibold text-base sm:text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                            {post.title}
                          </h3>
                          <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600 mb-3">
                            <div className="flex items-center">
                              <span className="mr-1 text-base leading-none">
                                👥
                              </span>
                              <span>
                                {post.currentParticipants}/
                                {post.maxParticipants}명
                              </span>
                            </div>
                            <div className="flex items-center">
                              <span className="mr-1 text-base leading-none">
                                📍
                              </span>
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
                              {formatPrice(post.totalPrice || 0)}원
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 sm:p-5 pt-0 mt-auto">
                        <div className="flex gap-2 pt-4 border-t border-gray-100">
                          <button
                            onClick={() => navigate(`/board/${post.id}`)}
                            className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors bg-transparent text-gray-700"
                          >
                            상세보기
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {participatedPosts.length === 0 && (
                <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-lg shadow-md">
                  <div className="text-4xl mb-4">🤝</div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    참여한 게시글이 없습니다
                  </h3>
                  <p className="text-gray-500 mb-4">
                    다른 사람들의 나눔에 참여해보세요!
                  </p>
                  <button // This button navigates to the posts list page
                    onClick={() => navigate('/posts')}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
                  >
                    공동구매 게시글 둘러보기
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* --- 모달 섹션 (기존 코드와 동일) --- */}
      {isEditingPost && editedPost && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={handleCloseEditModal}
        >
          <div
            className="bg-white rounded-lg shadow-xl m-4 sm:mx-auto sm:my-10 p-6 max-w-4xl max-h-[90vh] overflow-y-auto transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b pb-3 mb-4 flex justify-between items-start">
              <h2 className="text-xl font-bold">게시글 수정</h2>
              <button
                onClick={handleCloseEditModal}
                className="text-gray-400 hover:text-gray-600 text-2xl font-semibold"
              >
                &times;
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="edit-title"
                  className="text-sm font-medium block"
                >
                  제목
                </label>
                <input
                  id="edit-title"
                  value={editedPost.title}
                  onChange={(e) =>
                    setEditedPost({ ...editedPost, title: e.target.value })
                  }
                  className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label
                  htmlFor="edit-hashtags"
                  className="text-sm font-medium block"
                >
                  해시태그
                </label>
                <input
                  id="edit-hashtags"
                  value={
                    Array.isArray(editedPost.hashtags)
                      ? editedPost.hashtags.join(' ')
                      : editedPost.hashtags
                  }
                  onChange={(e) =>
                    setEditedPost({
                      ...editedPost,
                      hashtags: e.target.value.split(' '),
                    })
                  }
                  placeholder="예: #채소 #유기농 (공백으로 구분)"
                  className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              {/* 이미지 수정 섹션 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  상품 이미지 (최대 5개)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (imagePreviewUrls.length + files.length > 5) {
                      alert('이미지는 최대 5개까지 등록할 수 있습니다.');
                      return;
                    }
                    setSelectedImages((prev) => [...prev, ...files]);
                    const newPreviews = files.map((file) =>
                      URL.createObjectURL(file)
                    );
                    setImagePreviewUrls((prev) => [...prev, ...newPreviews]);
                  }}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                />
                {imagePreviewUrls.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 mt-2">
                    {imagePreviewUrls.map((url, index) => (
                      <div
                        key={index}
                        className="relative group cursor-pointer"
                        onClick={() => setMainImageIndex(index)}
                      >
                        <img
                          src={url}
                          alt={`미리보기 ${index + 1}`}
                          className={`w-full h-24 object-cover rounded-lg border-2 ${
                            index === mainImageIndex
                              ? 'border-emerald-500'
                              : 'border-transparent'
                          }`}
                        />
                        <span
                          className={`absolute top-1 left-1 text-white text-xs px-1.5 py-0.5 rounded ${
                            index === mainImageIndex
                              ? 'bg-emerald-600'
                              : 'bg-gray-500'
                          }`}
                        >
                          {index === mainImageIndex ? '대표' : '서브'}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const urlToRemove = imagePreviewUrls[index];
                            if (urlToRemove.startsWith('blob:')) {
                              URL.revokeObjectURL(urlToRemove);
                              const fileIndex = imagePreviewUrls
                                .slice(0, index)
                                .filter((u) => u.startsWith('blob:')).length;
                              setSelectedImages((prev) =>
                                prev.filter((_, i) => i !== fileIndex)
                              );
                            }
                            setImagePreviewUrls((prev) =>
                              prev.filter((_, i) => i !== index)
                            );
                            if (index === mainImageIndex) {
                              setMainImageIndex(0);
                            } else if (index < mainImageIndex) {
                              setMainImageIndex((prev) => prev - 1);
                            }
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label
                  htmlFor="edit-content"
                  className="text-sm font-medium block"
                >
                  상품 설명
                </label>
                <textarea
                  id="edit-content"
                  value={editedPost.content}
                  onChange={(e) =>
                    setEditedPost({ ...editedPost, content: e.target.value })
                  }
                  className="mt-1 w-full p-2 border border-gray-300 rounded-md min-h-[100px]"
                />
              </div>
              <div>
                <label
                  htmlFor="edit-price"
                  className="text-sm font-medium block"
                >
                  1인당 가격
                </label>
                <input
                  id="edit-price"
                  type="number"
                  value={editedPost.totalPrice}
                  onChange={(e) =>
                    setEditedPost({
                      ...editedPost,
                      totalPrice: Number(e.target.value),
                    })
                  }
                  className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label
                  htmlFor="edit-participants"
                  className="text-sm font-medium block"
                >
                  최대 참여 인원
                </label>
                <input
                  id="edit-participants"
                  type="number"
                  value={editedPost.maxParticipants}
                  onChange={(e) =>
                    setEditedPost({
                      ...editedPost,
                      maxParticipants: Number(e.target.value),
                    })
                  }
                  className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              {/* 주소 수정 섹션 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  거래 지역
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    placeholder="시/도"
                    value={addressData.sido}
                    readOnly
                    className="h-10 border border-gray-200 w-full sm:w-1/3 px-2 rounded bg-gray-50"
                  />
                  <input
                    type="text"
                    placeholder="시/군/구"
                    value={addressData.sigungu}
                    readOnly
                    className="h-10 border border-gray-200 w-full sm:w-1/3 px-2 rounded bg-gray-50"
                  />
                  <button
                    type="button"
                    onClick={handleAddressClick}
                    className="h-10 border border-gray-300 w-full sm:w-1/3 px-2 rounded bg-emerald-50 hover:bg-emerald-100"
                  >
                    주소 검색
                  </button>
                </div>
                {addressData.fullAddress && (
                  <p className="text-sm text-gray-600 mt-1">
                    선택된 주소: {addressData.fullAddress}
                  </p>
                )}
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  onClick={handlePostSave}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
                >
                  저장
                </button>
                <button
                  onClick={handleCloseEditModal}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isDialogOpen && postToView && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={() => {
            setIsDialogOpen(false);
            setPostToView(null);
          }}
        >
          <div
            className="bg-white rounded-lg shadow-xl m-4 sm:mx-auto sm:my-10 p-6 max-w-2xl max-h-[80vh] overflow-y-auto transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b pb-3 mb-4 flex justify-between items-start">
              <h2 className="text-xl font-bold">{postToView.title}</h2>
              <button
                onClick={() => {
                  setIsDialogOpen(false);
                  setPostToView(null);
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl font-semibold"
              >
                &times;
              </button>
            </div>
            <div className="space-y-4">
              <img
                src={postToView.imageUrls?.[0] || '/placeholder.svg'}
                alt={postToView.title}
                className="w-full h-60 object-cover rounded-lg"
              />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">해시태그:</span>{' '}
                  {postToView.hashtags.join(', ')}
                </div>
                <div>
                  <span className="font-medium">총 가격:</span>{' '}
                  {formatPrice(postToView.totalPrice)}원
                </div>
                <div>
                  <span className="font-medium">참여 현황:</span>{' '}
                  {postToView.currentParticipants}/{postToView.maxParticipants}
                  명
                </div>
              </div>
              <div className="pt-4">
                <p className="text-gray-700">{postToView.content}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {isAlertOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={() => setIsAlertOpen(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl m-4 sm:mx-auto sm:my-20 p-6 max-w-sm transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b pb-3 mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                게시글을 삭제하시겠습니까?
              </h3>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              이 작업은 되돌릴 수 없습니다. 게시글과 관련된 모든 데이터가
              영구적으로 삭제됩니다.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsAlertOpen(false)}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => handlePostDelete(postToDelete)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
