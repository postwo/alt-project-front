import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../apis/axiosInstance';
import type { User } from './type';

function Admin() {
  const [users, setUsers] = useState<User[]>([]);
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get('/api/admin/users');
      setUsers(res.data);
    } catch (err: any) {
      console.error('Admin API 에러:', err.response?.data || err.message);
      if (err.response?.status === 401) {
        navigate('/login'); // 로그인 페이지로
      } else if (err.response?.status === 403) {
        navigate('/'); // 권한 없으면 홈으로
      }
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="home">
      <div>admin 페이지</div>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.nickname} ({user.memberRoleList.join(', ')})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Admin;
