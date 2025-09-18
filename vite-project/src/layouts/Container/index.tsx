import { Outlet, useLocation } from 'react-router-dom';
import Footer from '../Footer';
import Header from '../Header';

function Container() {
  const { pathname } = useLocation();
  const noFooterPaths = ['/login', '/signup'];
  return (
    <>
      <Header />
      <Outlet />
      {!noFooterPaths.includes(pathname) && <Footer />}
    </>
  );
}

export default Container;
