import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import './App.css';

function App() {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    let pageTitle = "TuneVault";

    if (path === "/" || path === "") {
      pageTitle = "TuneVault - Trang chủ";
    } else if (path === "/search") {
      pageTitle = "TuneVault - Tìm kiếm";
    } else if (path.startsWith("/playlist/")) {
      pageTitle = "TuneVault - Danh sách phát";
    } else if (path === "/library") {
      pageTitle = "TuneVault - Thư viện";
    } else if (path === "/profile") {
      pageTitle = "TuneVault - Hồ sơ cá nhân";
    } else if (path === "/notifications") {
      pageTitle = "TuneVault - Thông báo";
    } else if (path === "/share") {
      pageTitle = "TuneVault - Hộp thư chia sẻ";
    } else if (path === "/favorites") {
      pageTitle = "TuneVault - Bài hát đã thích";
    } else if (path === "/admin") {
      pageTitle = "TuneVault - Quản trị viên";
    } else if (path.startsWith("/video/")) {
      pageTitle = "TuneVault - Xem Video";
    } else if (path === "/login") {
      pageTitle = "TuneVault - Đăng nhập";
    } else if (path === "/register") {
      pageTitle = "TuneVault - Đăng ký tài khoản";
    } else if (path === "/forgot-password") {
      pageTitle = "TuneVault - Quên mật khẩu";
    }

    document.title = pageTitle;
  }, [location.pathname]);

  return <AppRoutes />;
}

export default App;
