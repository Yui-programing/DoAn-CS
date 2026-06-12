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
import { VideoPlayer } from '../pages/VideoPlayer/VideoPlayer';

// Import cánh cửa bảo vệ bạn vừa tạo
import { ProtectedRoute } from '../components/ProtectedRoute';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* 1. Các trang ai cũng vào được (Public Route) */}
      <Route path="/login" element={<Login />} />

      {/* 2. CÁC TRANG CẦN BẢO VỆ (Protected Route) */}
      <Route element={<ProtectedRoute />}>

        {/* Nhóm trang có Sidebar và Header chung */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="search" element={<Search />} />
          <Route path="library" element={<Library />} />
          <Route path="playlist/:id" element={<PlaylistDetail />} />
          <Route path="profile" element={<Profile />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="share" element={<ShareInbox />} />
        </Route>

        {/* Trang xem video toàn màn hình (vẫn cần đăng nhập) */}
        <Route path="/video/:id" element={<VideoPlayer />} />

      </Route>
    </Routes>
  );
};

export default AppRoutes;
