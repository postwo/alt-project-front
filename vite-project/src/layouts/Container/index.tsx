import { Outlet, useLocation } from 'react-router-dom';
import Footer from '../Footer';
import Header from '../Header';

function Container() {
  const { pathname } = useLocation();

  return (
    <>
      <Header />
      <Outlet />
      {pathname !== '/auth' && <Footer />}
    </>
  );
}

export default Container;
