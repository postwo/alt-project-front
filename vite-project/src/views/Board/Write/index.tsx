import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../../../apis/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { useDaumPostcodePopup } from 'react-daum-postcode';
import { useUserStore } from '../../../store/userSlice';

function BoardWrite() {
  const navigate = useNavigate();
  const { isAuthenticated } = useUserStore();

  const postCodeScriptUrl =
    'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
  const open = useDaumPostcodePopup(postCodeScriptUrl);

  const [addressData, setAddressData] = useState({
    sido: '',
    sigungu: '',
    fullAddress: '',
  });

  const [formData, setFormData] = useState({
    title: '',
    hashtags: '',
    content: '',
    totalPrice: '',
    maxParticipants: '',
    address: '',
  });

  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [mainImageIndex, setMainImageIndex] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated === false) {
      alert('나눔 공고 작성을 위해 로그인이 필요합니다.');
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    return () => {
      imagePreviewUrls.forEach(URL.revokeObjectURL);
    };
  }, [imagePreviewUrls]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newFiles = [...selectedImages, ...files].slice(0, 5);
    imagePreviewUrls.forEach(URL.revokeObjectURL);
    const newPreviewUrls = newFiles.map((file) => URL.createObjectURL(file));

    setSelectedImages(newFiles);
    setImagePreviewUrls(newPreviewUrls);

    if (selectedImages.length === 0 && newFiles.length > 0) {
      setMainImageIndex(0);
    }
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imagePreviewUrls[index]);

    const newFiles = selectedImages.filter((_, i) => i !== index);
    const newPreviewUrls = imagePreviewUrls.filter((_, i) => i !== index);

    setSelectedImages(newFiles);
    setImagePreviewUrls(newPreviewUrls);

    if (index === mainImageIndex) {
      setMainImageIndex(newFiles.length > 0 ? 0 : 0);
    } else if (index < mainImageIndex) {
      setMainImageIndex(mainImageIndex - 1);
    }
  };

  const setAsMainImage = (index: number) => {
    setMainImageIndex(index);
  };

  const handleAddressComplete = useCallback((data: any) => {
    let fullAddress = data.address;
    let extraAddress = '';

    if (data.addressType === 'R') {
      if (data.bname !== '') {
        extraAddress += data.bname;
      }
      if (data.apartment === 'Y') {
        extraAddress +=
          extraAddress !== '' ? ', ' + data.buildingName : data.buildingName;
      }
      fullAddress += extraAddress !== '' ? ` (${extraAddress})` : '';
    }

    setAddressData({
      sido: data.sido || '',
      sigungu: data.sigungu || '',
      fullAddress: fullAddress,
    });

    handleInputChange('address', fullAddress);
  }, []);

  const handleAddressClick = () => {
    open({
      onComplete: handleAddressComplete,
    });
  };

  const uploadImages = async (files: File[]): Promise<string[]> => {
    const uploadPromises = files.map(async (file) => {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await axiosInstance.post('/file/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        return response.data;
      } catch (error) {
        console.error('이미지 업로드 실패:', error);
        throw error;
      }
    });

    return await Promise.all(uploadPromises);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (selectedImages.length === 0) {
      alert('상품 이미지를 최소 1개 이상 등록해주세요.');
      return;
    }

    if (!isAuthenticated) {
      alert('로그인 상태가 아닙니다. 다시 로그인해주세요.');
      navigate('/login');
      return;
    }

    const maxParticipantsNum = Number(formData.maxParticipants);
    if (maxParticipantsNum < 2 || maxParticipantsNum > 100) {
      alert('총 모집 인원은 본인 포함 최소 2명, 최대 100명으로 입력해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderedImages = [
        selectedImages[mainImageIndex],
        ...selectedImages.filter((_, i) => i !== mainImageIndex),
      ];

      const imageUrls = await uploadImages(orderedImages);

      const boardRequest = {
        title: formData.title,
        content: formData.content,
        totalPrice: Number(formData.totalPrice),
        maxParticipants: maxParticipantsNum,
        address: formData.address,
        hashtags: formData.hashtags
          .split(' ')
          .filter((tag) => tag.startsWith('#') && tag.length > 1),
        boardImageList: imageUrls,
      };

      const response = await axiosInstance.post(
        '/api/board/create',
        boardRequest,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      alert('나눔 공고가 성공적으로 등록되었습니다!');

      const boardId = response.data?.data?.id;

      if (!boardId) {
        throw new Error('게시글 생성 후 boardId를 받지 못했습니다.');
      }

      const chatRoomName = formData.title;
      const chatRequestUrl = `api/chat/room/group/create`;

      // ⬇️ [수정] 채팅방 개설 요청 시 boardId를 쿼리 파라미터로 추가
      const chatRoomResponse = await axiosInstance.post(
        `${chatRequestUrl}?roomName=${chatRoomName}&boardId=${boardId}`
      );

      const newRoomId = chatRoomResponse.data;
      console.log('채팅방 개설 성공. Room ID:', newRoomId);

      if (newRoomId) {
        const joinResponse = await axiosInstance.post(
          `api/chat/room/group/${newRoomId}/join`
        );
        console.log('채팅방 참여 성공:', joinResponse.data);
      }

      navigate('/posts');
    } catch (error) {
      console.error('나눔 공고 등록 실패:', error);
      alert('나눔 공고 등록에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      <main className="py-8 sm:py-12 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto relative">
          <div className="fixed inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-20 left-4 sm:left-10 text-4xl sm:text-6xl animate-bounce opacity-20">
              🥬
            </div>
            <div className="absolute top-40 right-8 sm:right-20 text-3xl sm:text-5xl animate-pulse opacity-20">
              🍎
            </div>
            <div className="absolute bottom-40 left-8 sm:left-20 text-3xl sm:text-4xl animate-bounce opacity-20 animation-delay-1000">
              🥕
            </div>
            <div className="absolute bottom-20 right-4 sm:right-10 text-3xl sm:text-5xl animate-pulse opacity-20 animation-delay-2000">
              🌽
            </div>
          </div>

          <div className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm rounded-xl p-6 sm:p-10">
            <div className="text-center pb-6 sm:pb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                나눔 공고 작성
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                대용량 식료품을 함께 나눌 사람들을 모집해보세요
              </p>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    📦 제목
                  </label>
                  <input
                    type="text"
                    placeholder="예: 유기농 양배추 10kg 함께 나눠요"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="h-10 sm:h-12 border border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 text-sm sm:text-base w-full px-2 rounded"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    # 해시태그
                  </label>
                  <input
                    type="text"
                    placeholder="예: #채소 #유기농 #양배추 #대용량 (공백으로 구분)"
                    value={formData.hashtags}
                    onChange={(e) =>
                      handleInputChange('hashtags', e.target.value)
                    }
                    className="h-10 sm:h-12 border border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 text-sm sm:text-base w-full px-2 rounded"
                    required
                  />
                  <p className="text-xs text-gray-500">
                    해시태그는 #으로 시작하고 공백으로 구분해주세요.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    📷 상품 이미지 (최대 5개)
                  </label>
                  <div className="space-y-4">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="h-10 sm:h-12 border border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 w-full"
                    />
                    {imagePreviewUrls.length > 0 && (
                      <div className="space-y-3">
                        <p className="text-xs text-gray-600">
                          이미지를 클릭하여 대표 이미지로 설정하세요.
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                          {imagePreviewUrls.map((url, index) => (
                            <div
                              key={index}
                              className="relative group cursor-pointer"
                              onClick={() => setAsMainImage(index)}
                            >
                              <img
                                src={url || '/placeholder.svg'}
                                alt={`미리보기 ${index + 1}`}
                                className={`w-full h-20 sm:h-24 object-cover rounded-lg border-2 transition-all ${
                                  index === mainImageIndex
                                    ? 'border-emerald-600 ring-2 ring-emerald-300'
                                    : 'border-gray-200 hover:border-emerald-400'
                                }`}
                              />
                              <span className="absolute top-1 left-1 bg-emerald-600 text-white text-xs flex items-center gap-1 px-1 rounded">
                                {index === mainImageIndex ? '⭐ 대표' : '서브'}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeImage(index);
                                }}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    상품 설명
                  </label>
                  <textarea
                    placeholder="상품의 상세 정보, 브랜드, 원산지 등을 입력해주세요"
                    value={formData.content}
                    onChange={(e) =>
                      handleInputChange('content', e.target.value)
                    }
                    className="min-h-[80px] sm:min-h-[100px] border border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 text-sm sm:text-base w-full px-2 rounded"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    💰 1인당 가격
                  </label>
                  <input
                    type="number"
                    placeholder="50000"
                    value={formData.totalPrice}
                    onChange={(e) =>
                      handleInputChange('totalPrice', e.target.value)
                    }
                    className="h-10 sm:h-12 border border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 text-sm sm:text-base w-full px-2 rounded"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    🧑‍🤝‍🧑 총 모집 인원 (본인 포함)
                  </label>
                  <input
                    type="number"
                    placeholder="5"
                    value={formData.maxParticipants}
                    onChange={(e) =>
                      handleInputChange('maxParticipants', e.target.value)
                    }
                    min="2"
                    className="h-10 sm:h-12 border border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 text-sm sm:text-base w-full px-2 rounded"
                    required
                  />
                  <p className="text-xs text-gray-500">
                    나눔에 참여할 **총 인원 수**를 입력해주세요. (예: 5명이서
                    나눌 경우 5를 입력)
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    📍 거래 지역
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      placeholder="시/도"
                      value={addressData.sido}
                      readOnly
                      className="h-10 sm:h-12 border border-gray-200 text-sm sm:text-base w-full sm:w-1/3 px-2 rounded bg-gray-50 text-gray-600"
                    />
                    <input
                      type="text"
                      placeholder="시/군/구"
                      value={addressData.sigungu}
                      readOnly
                      className="h-10 sm:h-12 border border-gray-200 text-sm sm:text-base w-full sm:w-1/3 px-2 rounded bg-gray-50 text-gray-600"
                    />
                    <input
                      type="text"
                      placeholder="클릭하여 상세 주소 검색"
                      value={formData.address || '주소 검색'}
                      readOnly
                      onClick={handleAddressClick}
                      className="h-10 sm:h-12 border border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 text-sm sm:text-base w-full sm:w-1/3 px-2 rounded cursor-pointer text-center bg-emerald-50 hover:bg-emerald-100 transition-colors"
                      required
                    />
                  </div>
                  {addressData.fullAddress && (
                    <p className="text-sm text-gray-700 font-medium mt-2 p-2 border border-dashed border-gray-300 rounded bg-white">
                      **선택된 주소:** {addressData.fullAddress}
                    </p>
                  )}
                </div>

                <div className="pt-4 sm:pt-6">
                  <button
                    type="submit"
                    disabled={isSubmitting || !isAuthenticated}
                    className={`w-full h-10 sm:h-12 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 text-sm sm:text-base ${
                      isSubmitting || !isAuthenticated
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 hover:shadow-xl'
                    }`}
                  >
                    {isSubmitting
                      ? '등록 중...'
                      : !isAuthenticated
                      ? '로그인 필요'
                      : '나눔 공고 등록하기'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default BoardWrite;
