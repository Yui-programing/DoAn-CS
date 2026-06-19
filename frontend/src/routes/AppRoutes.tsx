import { Routes, Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Home from "../pages/Home/Home";
import Search from "../pages/Search/Search";
import Library from "../pages/Library/Library";
import PlaylistDetail from "../pages/PlaylistDetail/PlaylistDetail";
import Profile from "../pages/Profile/Profile";
import { UserProfileView } from "../pages/Profile/UserProfileView";
import Notifications from "../pages/Notifications/Notifications";
import ShareInbox from "../pages/ShareInbox/ShareInbox";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import ForgotPassword from "../pages/ForgotPassword/ForgotPassword";
import { VideoPlayer } from "../pages/VideoPlayer/VideoPlayer";
import AdminDashboard from "../pages/Admin/AdminDashboard";
import Favorites from "../pages/Favorites/Favorites";

// Import cánh cửa bảo vệ bạn vừa tạo
import { ProtectedRoute } from "../components/ProtectedRoute";
import { AdminProtectedRoute } from "../components/AdminProtectedRoute";

export const AppRoutes = () => {
  return (
    <Routes>
      {/* 1. Các trang ai cũng vào được (Public Route) */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Nhóm trang dùng chung MainLayout */}
      <Route path="/" element={<MainLayout />}>
        {/* Các trang ai cũng truy cập được (Public) */}
        <Route index element={<Home />} />
        <Route path="search" element={<Search />} />
        <Route path="playlist/:id" element={<PlaylistDetail />} />
        <Route path="album/:id" element={<PlaylistDetail />} />

        {/* Các trang cần đăng nhập mới vào được (Protected) */}
        <Route element={<ProtectedRoute />}>
          <Route path="library" element={<Library />} />
          <Route path="profile" element={<Profile />} />
          <Route path="user/:id" element={<UserProfileView />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="share" element={<ShareInbox />} />
          <Route path="favorites" element={<Favorites />} />
        </Route>

        {/* Admin route */}
        <Route element={<AdminProtectedRoute />}>
          <Route path="admin" element={<AdminDashboard />} />
        </Route>
      </Route>

      {/* Trang xem video toàn màn hình (Cần đăng nhập) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/video/:id" element={<VideoPlayer />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
