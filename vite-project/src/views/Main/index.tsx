import { Link } from 'react-router-dom';

function Main() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                  🥬 1인 가구를 위한 식료품 나눔
                </div>
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  <span className="text-emerald-600">소량 구매의 고민,</span>
                  <br />
                  함께 해결해요
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  1인 가구도 부담 없이! 신선한 야채와 식료품을
                  <br />
                  채팅으로 모집해서 함께 나눠 사세요.
                </p>
              </div>
              <a href="/posts">
                <div className="flex flex-col sm:flex-row gap-4">
                  <button className="border-2 border-emerald-400 text-emerald-700 hover:bg-emerald-50 text-lg px-8 py-4 bg-transparent rounded-full">
                    나눔 게시글 둘러보기
                  </button>
                </div>
              </a>
              <div className="flex items-center space-x-8 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span>무료 채팅 참여</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span>신선한 식재료</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span>안전한 거래</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative w-full h-96 lg:h-[500px]">
                <div className="absolute top-8 left-8 transform rotate-12 hover:rotate-6 transition-transform duration-500">
                  <div className="w-64 h-40 bg-gradient-to-br from-emerald-500 to-emerald-600 border-0 shadow-2xl">
                    <div className="p-6 text-white">
                      <div className="space-y-2">
                        <div className="text-sm opacity-90">5명 모집 시</div>
                        <div className="text-3xl font-bold">1/5</div>
                        <div className="text-sm opacity-90">가격으로!</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute top-16 right-12 transform -rotate-12 hover:rotate-0 transition-transform duration-500">
                  <div className="bg-white rounded-2xl shadow-xl p-4 border border-emerald-100">
                    <div className="text-center">
                      <div className="text-xs text-gray-500">혼자 살 때</div>
                      <div className="text-xs text-gray-500 line-through">
                        ₩15,000
                      </div>
                      <div className="text-xs text-emerald-600">
                        함께 나눠서
                      </div>
                      <div className="text-lg font-bold text-emerald-600">
                        ₩3,000
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-16 left-16 transform hover:scale-110 transition-transform duration-300">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-500 rounded-2xl shadow-xl flex items-center justify-center">
                    <span className="text-2xl">🥬</span>
                  </div>
                </div>

                <div className="absolute bottom-8 right-8 transform hover:scale-105 transition-transform duration-300">
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-500 rounded-2xl shadow-xl flex items-center justify-center">
                    <span className="text-2xl">🥕</span>
                  </div>
                </div>

                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-emerald-200/30 to-emerald-300/30 rounded-full blur-3xl -z-10"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold text-gray-900">
              왜 알뜰모아 식료품 나눔인가요?
            </h2>
            <p className="text-xl text-gray-600">
              1인 가구를 위한 스마트한 식료품 쇼핑
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="border-emerald-100 hover:shadow-lg transition-shadow duration-300">
              <div className="p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto">
                  <span className="text-2xl">🥬</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  신선한 식재료
                </h3>
                <p className="text-gray-600">
                  대용량으로 구매해서 신선함은 그대로, 가격은 더 저렴하게!
                </p>
              </div>
            </div>

            <div className="border-emerald-100 hover:shadow-lg transition-shadow duration-300">
              <div className="p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto">
                  <span className="text-2xl">💬</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  채팅으로 간편하게
                </h3>
                <p className="text-gray-600">
                  채팅방에서 실시간으로 소통하며 나눔 일정과 장소를 조율하세요.
                </p>
              </div>
            </div>

            <div className="border-emerald-100 hover:shadow-lg transition-shadow duration-300">
              <div className="p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto">
                  <span className="text-2xl">🏠</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  1인 가구 맞춤
                </h3>
                <p className="text-gray-600">
                  혼자 살아도 부담 없이 필요한 만큼만 나눠서 구매할 수 있어요.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Food Sharing Posts Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold text-gray-900">
              진행 중인 식료품 나눔
            </h2>
            <p className="text-xl text-gray-600">
              지금 참여할 수 있는 신선한 식재료 나눔
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="aspect-video overflow-hidden">
                {/* Ensure these image paths are correct relative to your project's public directory or asset folder */}
                <img
                  src="/fresh-organic-vegetables-cabbage-lettuce-carrots.png"
                  alt="유기농 야채 세트 나눔"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="bg-green-100 text-green-800">유기농 야채</div>
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <div className="w-4 h-4" />{' '}
                    {/* Replaced SVG with an icon component */}
                    <span>3명 참여</span>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  유기농 야채 세트 (5kg)
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">총 가격 ₩25,000</span>
                    <span className="text-emerald-600 font-bold">
                      1인당 ₩5,000
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-emerald-500 h-2 rounded-full"
                      style={{ width: '60%' }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>3/5명 모집</span>
                    <span>내일 수령</span>
                  </div>
                </div>
                <button className="w-full bg-emerald-600 hover:bg-emerald-700 py-3 px-6 rounded-lg text-white font-medium transition-colors">
                  채팅방 참여하기
                </button>
              </div>
            </div>

            <div className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="aspect-video overflow-hidden">
                <img
                  src="/fresh-fruits-apples-oranges-bananas.png"
                  alt="제철 과일 박스 나눔"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="bg-orange-100 text-orange-800">제철 과일</div>
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <div className="w-4 h-4" />
                    <span>4명 참여</span>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  제철 과일 박스 (3kg)
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">총 가격 ₩20,000</span>
                    <span className="text-emerald-600 font-bold">
                      1인당 ₩4,000
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-emerald-500 h-2 rounded-full"
                      style={{ width: '80%' }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>4/5명 모집</span>
                    <span>2일 후 수령</span>
                  </div>
                </div>
                <button className="w-full bg-emerald-600 hover:bg-emerald-700 py-3 px-6 rounded-lg text-white font-medium transition-colors">
                  채팅방 참여하기
                </button>
              </div>
            </div>

            <div className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="aspect-video overflow-hidden">
                <img
                  src="/bulk-rice-grains-10kg-bag.png"
                  alt="쌀 10kg 나눔"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="bg-yellow-100 text-yellow-800">곡물</div>
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <div className="w-4 h-4" />
                    <span>2명 참여</span>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  프리미엄 쌀 10kg
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">총 가격 ₩40,000</span>
                    <span className="text-emerald-600 font-bold">
                      1인당 ₩8,000
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-emerald-500 h-2 rounded-full"
                      style={{ width: '40%' }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>2/5명 모집</span>
                    <span>3일 후 수령</span>
                  </div>
                </div>
                <button className="w-full bg-emerald-600 hover:bg-emerald-700 py-3 px-6 rounded-lg text-white font-medium transition-colors">
                  채팅방 참여하기
                </button>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <a href="/posts">
              <button className="border-2 border-emerald-400 text-emerald-600 bg-transparent hover:bg-emerald-50 px-8 py-3 rounded-full font-medium transition-colors">
                더 많은 나눔 보기
              </button>
            </a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-emerald-600 to-emerald-700">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl font-bold text-white">
            지금 식료품 나눔에 참여하세요
          </h2>
          <p className="text-xl text-emerald-100">
            1인 가구도 부담 없이 신선한 식재료를 나눠 사는 즐거움을 경험해보세요
          </p>
        </div>
      </section>
    </>
  );
}

export default Main;
