import { Route, Routes } from 'react-router-dom';
import './App.css';
import Main from './views/Main';
import Authentication from './views/Authentication';
import BoardDetail from './views/Board/Detail';
import BoardWrite from './views/Board/Write';
import BoardUpdate from './views/Board/Update';
import Container from './layouts/Container';

function App() {
  return (
    <Routes>
      <Route element={<Container />}>
        <Route path="/" element={<Main />} />
        <Route path="/auth" element={<Authentication />} />
        <Route path="/board">
          <Route path=":boardNumber" element={<BoardDetail />} />
          <Route path="write" element={<BoardWrite />} />
          <Route path="update/:boardNumber" element={<BoardUpdate />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
