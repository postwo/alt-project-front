import { useState } from 'react';

function BoardWrite() {
  const [formData, setFormData] = useState({
    title: '',
    hashtags: '',
    description: '',
    totalPrice: '',
    maxParticipants: '',
    location: '',
  });

  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [mainImageIndex, setMainImageIndex] = useState<number>(0);

  const handleinputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newFiles = [...selectedImages, ...files].slice(0, 5);
    setSelectedImages(newFiles);

    const newPreviewUrls = newFiles.map((file) => URL.createObjectURL(file));
    setImagePreviewUrls(newPreviewUrls);
  };

  const removeImage = (index: number) => {
    const newFiles = selectedImages.filter((_, i) => i !== index);
    const newPreviewUrls = imagePreviewUrls.filter((_, i) => i !== index);

    URL.revokeObjectURL(imagePreviewUrls[index]);

    setSelectedImages(newFiles);
    setImagePreviewUrls(newPreviewUrls);

    if (index === mainImageIndex) {
      setMainImageIndex(0);
    } else if (index < mainImageIndex) {
      setMainImageIndex(mainImageIndex - 1);
    }
  };

  const setAsMainImage = (index: number) => {
    setMainImageIndex(index);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('나눔 공고 데이터:', formData);
    console.log('첨부된 이미지:', selectedImages);
    console.log('대표 이미지 인덱스:', mainImageIndex);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      <main className="py-8 sm:py-12 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto relative">
          {/* 장식용 이모지 */}
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
          {/* Card 대체 */}
          <div className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm rounded-xl">
            {/* CardHeader + CardTitle 대체 */}
            <div className="text-center pb-6 sm:pb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                나눔 공고 작성
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                대용량 식료품을 함께 나눌 사람들을 모집해보세요
              </p>
            </div>
            {/* CardContent 대체 */}
            <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                {/* 제목 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    📦 제목
                  </label>
                  <input
                    type="text"
                    placeholder="예: 유기농 양배추 10kg 함께 나눠요"
                    value={formData.title}
                    onChange={(e) => handleinputChange('title', e.target.value)}
                    className="h-10 sm:h-12 border border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 text-sm sm:text-base w-full px-2 rounded"
                    required
                  />
                </div>

                {/* 해시태그 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    #<span>해시태그</span>
                  </label>
                  <input
                    type="text"
                    placeholder="예: #채소 #유기농 #양배추 #대용량 (공백으로 구분)"
                    value={formData.hashtags}
                    onChange={(e) =>
                      handleinputChange('hashtags', e.target.value)
                    }
                    className="h-10 sm:h-12 border border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 text-sm sm:text-base w-full px-2 rounded"
                    required
                  />
                  <p className="text-xs text-gray-500">
                    해시태그는 #으로 시작하고 공백으로 구분해주세요 (예: #채소
                    #유기농 #양배추 #대용량)
                  </p>
                </div>

                {/* 이미지 업로드 */}
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

                {/* 상품 설명 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    상품 설명
                  </label>
                  <textarea
                    placeholder="상품의 상세 정보, 브랜드, 원산지 등을 입력해주세요"
                    value={formData.description}
                    onChange={(e) =>
                      handleinputChange('description', e.target.value)
                    }
                    className="min-h-[80px] sm:min-h-[100px] border border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 text-sm sm:text-base w-full px-2 rounded"
                    required
                  />
                </div>

                {/* 총 가격 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    💰 총 가격
                  </label>
                  <input
                    type="number"
                    placeholder="50000"
                    value={formData.totalPrice}
                    onChange={(e) =>
                      handleinputChange('totalPrice', e.target.value)
                    }
                    className="h-10 sm:h-12 border border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 text-sm sm:text-base w-full px-2 rounded"
                    required
                  />
                </div>

                {/* 모집 인원 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    👥 모집 인원
                  </label>
                  <input
                    type="number"
                    placeholder="5"
                    value={formData.maxParticipants}
                    onChange={(e) =>
                      handleinputChange('maxParticipants', e.target.value)
                    }
                    className="h-10 sm:h-12 border border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 text-sm sm:text-base w-full px-2 rounded"
                    required
                  />
                </div>

                {/* 거래 지역 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    📍 거래 지역
                  </label>
                  <input
                    type="text"
                    placeholder="서울시 강남구"
                    value={formData.location}
                    onChange={(e) =>
                      handleinputChange('location', e.target.value)
                    }
                    className="h-10 sm:h-12 border border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 text-sm sm:text-base w-full px-2 rounded"
                    required
                  />
                </div>

                <div className="pt-4 sm:pt-6">
                  <button
                    type="submit"
                    className="w-full h-10 sm:h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base"
                  >
                    나눔 공고 등록하기
                  </button>
                </div>
              </form>
            </div>{' '}
            {/* CardContent 대체한 div 끝 */}
          </div>{' '}
          {/* Card 대체한 div 끝 */}
        </div>{' '}
        {/* max-w-2xl */}
      </main>
    </div>
  );
}

export default BoardWrite;
