import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './pages/Layout';
import Home from './pages/Home';
import Tasklist from './pages/Tasklist';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Layout />}>
          <Route index element={<Home />} />
          <Route path='tasklist' element={<Tasklist />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
