import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Home from '../pages/Home/Home';
import Search from '../pages/Search/Search';
import Library from '../pages/Library/Library';
import PlaylistDetail from '../pages/PlaylistDetail/PlaylistDetail';
import Profile from '../pages/Profile/Profile';
import Notifications from '../pages/Notifications/Notifications';
import ShareInbox from '../pages/ShareInbox/ShareInbox';
import Login from '../pages/Login/Login';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Route sử dụng MainLayout chung */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="search" element={<Search />} />
        <Route path="library" element={<Library />} />
        <Route path="playlist/:id" element={<PlaylistDetail />} />
        <Route path="profile" element={<Profile />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="share" element={<ShareInbox />} />
      </Route>
      
      {/* Route độc lập cho Đăng nhập (Toàn màn hình) */}
      <Route path="/login" element={<Login />} />
    </Routes>
  );
};

export default AppRoutes;
