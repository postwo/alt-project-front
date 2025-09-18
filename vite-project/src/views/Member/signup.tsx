import axios from 'axios';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function SignUp() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nickname: '',
    email: '',
    password: '',
    agreeTerms: false,
    agreePrivacy: false,
    agreeMarketing: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('회원가입 데이터:', formData);

    try {
      // 서버로 보낼 데이터 (필수 입력만)
      const payload = {
        nickname: formData.nickname,
        email: formData.email,
        password: formData.password,
      };

      // POST 요청
      const response = await axios.post(
        'http://localhost:8080/api/member/signup', // 서버 API 주소에 맞게 수정
        payload
      );

      console.log('회원가입 성공:', response.data);
      alert('회원가입이 완료되었습니다!');

        navigate("/");
    } catch (error: any) {
      console.error('회원가입 실패:', error.response?.data || error.message);
      alert('회원가입에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100 flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4 relative">
        {/* 배경 장식 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-16 h-16 bg-emerald-200 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-20 w-12 h-12 bg-emerald-300 rounded-full opacity-30 animate-bounce"></div>
          <div className="absolute bottom-32 left-1/4 w-20 h-20 bg-emerald-100 rounded-full opacity-25"></div>
          <div className="absolute bottom-20 right-1/3 w-14 h-14 bg-emerald-200 rounded-full opacity-20 animate-pulse"></div>
        </div>

        <div className="w-full max-w-md relative z-10 bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-8 border border-emerald-100">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">회원가입</h2>
            <p className="text-gray-600">
              알뜰모아와 함께 똑똑한 식료품 나눔을 시작하세요
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 닉네임 입력 */}
            <div className="space-y-2">
              <label
                htmlFor="nickname"
                className="text-sm font-medium text-gray-700 text-left block"
              >
                닉네임
              </label>
              <input
                id="nickname"
                name="nickname"
                type="text"
                required
                value={formData.nickname}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="사용할 닉네임을 입력해주세요"
              />
            </div>

            {/* 이메일 입력 */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-700 text-left block"
              >
                이메일
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="example@email.com"
              />
            </div>

            {/* 비밀번호 입력 */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-700 text-left block"
              >
                비밀번호
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="8자 이상 입력해주세요"
              />
            </div>

            {/* 체크박스 */}
            <div className="space-y-3 pt-4 border-t border-gray-100">
              <div className="flex items-center space-x-2">
                <input
                  id="agreeTerms"
                  name="agreeTerms"
                  type="checkbox"
                  checked={formData.agreeTerms}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 text-emerald-600 rounded"
                />
                <label htmlFor="agreeTerms" className="text-sm text-gray-700">
                  <span className="text-emerald-600 font-medium">[필수]</span>{' '}
                  이용약관에 동의합니다
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="agreePrivacy"
                  name="agreePrivacy"
                  type="checkbox"
                  checked={formData.agreePrivacy}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 text-emerald-600 rounded"
                />
                <label htmlFor="agreePrivacy" className="text-sm text-gray-700">
                  <span className="text-emerald-600 font-medium">[필수]</span>{' '}
                  개인정보 처리방침에 동의합니다
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="agreeMarketing"
                  name="agreeMarketing"
                  type="checkbox"
                  checked={formData.agreeMarketing}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 text-emerald-600 rounded"
                />
                <label
                  htmlFor="agreeMarketing"
                  className="text-sm text-gray-700"
                >
                  <span className="text-gray-500">[선택]</span> 마케팅 정보
                  수신에 동의합니다
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 mt-6 rounded-lg"
              disabled={!formData.agreeTerms || !formData.agreePrivacy}
            >
              회원가입
            </button>
          </form>

          <div className="text-center mt-6 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              이미 계정이 있으신가요?{' '}
              <Link
                to="/login"
                className="text-emerald-600 hover:text-emerald-700 font-medium"
              >
                로그인하기
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
