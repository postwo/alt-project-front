import axios from 'axios';
import { Cookies } from 'react-cookie';

/*
쿠키에서 로그인한 사용자의 JWT 토큰(accessToken)을 꺼냅니다.

토큰이 있으면 **HTTP 요청 헤더에 Authorization: Bearer <토큰값>**을 자동으로 붙입니다.

이렇게 하면 서버는 이 요청을 받을 때 누가 보낸 요청인지 JWT로 인증할 수 있습니다. 
*/
const cookies = new Cookies();

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080',
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = cookies.get('accessToken'); // 쿠키에서 토큰 꺼내기
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터: 401/403 처리
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      if (status === 401) {
        alert('로그인이 필요합니다.');
      } else if (status === 403) {
        alert('권한이 없습니다.');
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
