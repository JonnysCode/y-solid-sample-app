import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import Layout from './pages/Layout';
import Home from './pages/Home';
import Tasklist from './pages/Tasklist';
import Collaborators from './pages/Collaborators';
import Profile from './pages/Profile';
import { useSession } from '@inrupt/solid-ui-react';
import Login from './pages/Login';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path='/'
          element={
            <RequireAuth>
              <Layout />
            </RequireAuth>
          }
        >
          <Route index element={<Home />} />
          <Route path='tasklist' element={<Tasklist />} />
          <Route path='collaborators' element={<Collaborators />} />
          <Route path='profile' element={<Profile />} />
          <Route path='*' element={<div>Not Found</div>} />
        </Route>
        <Route path='/login' element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

const RequireAuth = ({ children }: any) => {
  const { session } = useSession();
  const location = useLocation();

  console.log('RequireAuth session', session.info);

  return session.info.isLoggedIn ? (
    children
  ) : (
    <Navigate to='/login' replace state={{ path: location.pathname }} />
  );
};

export default App;
