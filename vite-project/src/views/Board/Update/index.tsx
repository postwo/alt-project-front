import { useState } from 'react';

function BoardUpdate() {
  const [formData, setFormData] = useState({
    title: '',
    hashtags: '',
    description: '',
    totalPrice: '',
    maxParticipants: '',
    location: '',
    deadline: '',
  });

  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);

  const handleInputChange = (field: string, value: string) => {
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
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('나눔 공고 데이터:', formData);
    console.log('첨부된 이미지:', selectedImages);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      <main className="py-8 sm:py-12 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <div className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
            <div className="text-center pb-6 sm:pb-8">
              <div className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                나눔 공고 작성
              </div>
              <p className="text-sm sm:text-base text-gray-600">
                대용량 식료품을 함께 나눌 사람들을 모집해보세요
              </p>
            </div>

            <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                {/* 제목 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <div>📦 제목</div>
                  </label>
                  <input
                    id="title"
                    type="text"
                    placeholder="예: 유기농 양배추 10kg 함께 나눠요"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="h-10 sm:h-12 border-gray-200 border rounded-md focus:border-emerald-500 focus:ring-emerald-500 text-sm sm:text-base w-full px-2"
                    required
                  />
                </div>

                {/* 해시태그 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <div># 해시태그</div>
                  </label>
                  <input
                    id="hashtags"
                    type="text"
                    placeholder="예: #채소 #유기농 #양배추 #대용량 (공백으로 구분)"
                    value={formData.hashtags}
                    onChange={(e) =>
                      handleInputChange('hashtags', e.target.value)
                    }
                    className="h-10 sm:h-12 border-gray-200 border rounded-md focus:border-emerald-500 focus:ring-emerald-500 text-sm sm:text-base w-full px-2"
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
                    <div>📷 상품 이미지 (최대 5개)</div>
                  </label>
                  <div className="space-y-4">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="h-10 sm:h-12 border-gray-200 border rounded-md focus:border-emerald-500 focus:ring-emerald-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 w-full"
                    />

                    {imagePreviewUrls.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                        {imagePreviewUrls.map((url, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={url || '/placeholder.svg'}
                              alt={`미리보기 ${index + 1}`}
                              className="w-full h-20 sm:h-24 object-cover rounded-lg border border-gray-200"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                            >
                              ✖
                            </button>
                          </div>
                        ))}
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
                    id="description"
                    placeholder="상품의 상세 정보, 브랜드, 원산지 등을 입력해주세요"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange('description', e.target.value)
                    }
                    className="min-h-[100px] border border-gray-200 rounded-md focus:border-emerald-500 focus:ring-emerald-500 text-sm sm:text-base w-full p-2"
                    required
                  />
                </div>

                {/* 총 가격 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <div>💰 총 가격</div>
                  </label>
                  <input
                    id="totalPrice"
                    type="number"
                    placeholder="50000"
                    value={formData.totalPrice}
                    onChange={(e) =>
                      handleInputChange('totalPrice', e.target.value)
                    }
                    className="h-10 sm:h-12 border-gray-200 border rounded-md focus:border-emerald-500 focus:ring-emerald-500 text-sm sm:text-base w-full px-2"
                    required
                  />
                </div>

                {/* 모집 인원 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <div>👥 모집 인원</div>
                  </label>
                  <input
                    id="maxParticipants"
                    type="number"
                    placeholder="5"
                    value={formData.maxParticipants}
                    onChange={(e) =>
                      handleInputChange('maxParticipants', e.target.value)
                    }
                    className="h-10 sm:h-12 border-gray-200 border rounded-md focus:border-emerald-500 focus:ring-emerald-500 text-sm sm:text-base w-full px-2"
                    required
                  />
                </div>

                {/* 거래 지역 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <div>📍 거래 지역</div>
                  </label>
                  <input
                    id="location"
                    type="text"
                    placeholder="서울시 강남구"
                    value={formData.location}
                    onChange={(e) =>
                      handleInputChange('location', e.target.value)
                    }
                    className="h-10 sm:h-12 border-gray-200 border rounded-md focus:border-emerald-500 focus:ring-emerald-500 text-sm sm:text-base w-full px-2"
                    required
                  />
                </div>

                {/* 마감일 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    마감일
                  </label>
                  <input
                    id="deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={(e) =>
                      handleInputChange('deadline', e.target.value)
                    }
                    className="h-10 sm:h-12 border-gray-200 border rounded-md focus:border-emerald-500 focus:ring-emerald-500 text-sm sm:text-base w-full px-2"
                    required
                  />
                </div>

                {/* 제출 버튼 */}
                <div className="pt-4 sm:pt-6">
                  <button
                    type="submit"
                    className="w-full h-10 sm:h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base"
                  >
                    나눔 공고 등록하기
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

export default BoardUpdate;
