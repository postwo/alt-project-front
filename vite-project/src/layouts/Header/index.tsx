import { Link, useLocation } from 'react-router-dom';

export default function Header() {
  const location = useLocation();
  const pathname = location.pathname;
  const isAuthPage =
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname === '/create-post';

  return (
    <nav
      className={`flex items-center p-6 ${
        isAuthPage ? 'justify-start' : 'justify-between max-w-7xl mx-auto'
      }`}
    >
      <Link to="/" className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">알</span>
        </div>
        <span className="text-2xl font-bold text-emerald-800">알뜰모아</span>
      </Link>

      {!isAuthPage && (
        <div className="flex items-center space-x-4">
          <Link to="/login">
            <button className="text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50">
              로그인
            </button>
          </Link>
          <Link to="/signup">
            <button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-4 py-2 text-sm font-semibold">
              회원가입
            </button>
          </Link>
        </div>
      )}
    </nav>
  );
}
