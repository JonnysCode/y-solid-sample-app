import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './pages/Layout';
import Home from './pages/Home';
import Tasklist from './pages/Tasklist';
import Collaborators from './pages/Collaborators';
import Profile from './pages/Profile';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Layout />}>
          <Route index element={<Home />} />
          <Route path='tasklist' element={<Tasklist />} />
          <Route path='collaborators' element={<Collaborators />} />
          <Route path='profile' element={<Profile />} />
          <Route path='*' element={<div>Not Found</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
