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
// axiosInstance.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response) {
//       const status = error.response.status;
//       if (status === 401) {
//         alert('로그인이 필요합니다.');
//       } else if (status === 403) {
//         alert('권한이 없습니다.');
//       }
//     }
//     return Promise.reject(error);
//   }
// );

// 이거를 테스트할려면 로그인하고 다른곳으로페이지를 이동해서 토큰이 잘발급되는지 보면 된다
axiosInstance.interceptors.response.use(
  (res) => res,
  // 토큰이 만료되는 순간 에러 발생
  async (err) => {
    console.error('[Interceptor] error:', err);
    console.log('[Interceptor] err.response?.status =', err.response?.status);
    const originalRequest = err.config;
    // 토큰이 만료 -> 그만 -> 새로운 토큰 요청
    //_retry는 무한재시도 방지
    if (err.response?.status == 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const res = await axios.post(
          'http://localhost:8080/api/member/refresh',
          {},
          { withCredentials: true }
        );
        const newAccessToken = res.data.data.accessToken;
        cookies.set('accessToken', newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.log('Refresh실패: ', refreshError);
        window.location.href = '/login';
      }
    }

    return Promise.reject(err);
  }
);

export default axiosInstance;
