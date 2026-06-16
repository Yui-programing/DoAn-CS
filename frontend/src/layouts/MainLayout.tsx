import { useRef, useEffect } from "react";
import { NavLink, Outlet, Link } from "react-router-dom";
import { usePlayer } from "../contexts/PlayerContext";
import { useAuth } from "../contexts/AuthContext";
import {
  Home,
  Search,
  Library,
  Bell,
  Mail,
  User,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Heart,
  Repeat,
  Shuffle,
  Music,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { NotificationBell } from "../components/NotificationBell";

// Hàm định dạng số giây thành phút:giây (ví dụ: 195 -> 3:15)
const formatTime = (seconds: number) => {
  if (isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
};

export const MainLayout = () => {
  const { isAuthenticated, user, logoutState } = useAuth();
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    togglePlay,
    nextTrack,
    prevTrack,
    seek,
    setVolume,
    setCurrentTime,
    setDuration,
    setIsPlaying,
  } = usePlayer();

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Theo dõi và cập nhật trạng thái Play/Pause thực tế của thẻ audio
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch((err) => {
        console.log("Tự động phát bị chặn bởi trình duyệt:", err);
        setIsPlaying(false);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentTrack]);

  // Đồng bộ âm lượng
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Xử lý sự kiện cập nhật tiến trình thời gian
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  // Xử lý sự kiện khi file nhạc load xong thông tin (Metadata)
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  // Tua nhạc bằng thanh trượt
  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || duration === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newProgress = clickX / width;
    const newTime = newProgress * duration;
    seek(newTime);
  };

  // Tua âm lượng bằng thanh trượt
  const handleVolumeBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newVolume = Math.min(Math.max(clickX / width, 0), 1);
    setVolume(newVolume);
  };

  return (
    <div className="h-screen w-screen bg-black text-slate-100 flex flex-col overflow-hidden font-sans">
      {/* THẺ AUDIO ẨN CHƠI NHẠC THỰC TẾ */}
      {currentTrack && (
        <audio
          id="global-audio-element"
          ref={audioRef}
          src={currentTrack.filePath}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={nextTrack}
        />
      )}

      {/* Khung chính: Sidebar + Main Content */}
      <div className="flex-1 flex overflow-hidden p-2 gap-2">
        {/* 1. SIDEBAR (Bên trái) */}
        <aside className="w-64 bg-zinc-950 rounded-xl flex flex-col p-4 gap-6 shrink-0 border border-zinc-900">
          {/* Logo */}
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
              <Music className="w-6 h-6 text-black stroke-[2.5]" />
            </div>
            <div>
              <h1 className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
                TuneVault
              </h1>
              <span className="text-[10px] text-zinc-500 font-bold tracking-wider uppercase">
                Spotify Clone
              </span>
            </div>
          </div>

          {/* Navigation links */}
          <nav className="flex flex-col gap-1.5 flex-1">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-3 rounded-lg font-semibold text-sm transition-all duration-200 ${
                  isActive
                    ? "bg-zinc-900 text-green-400 shadow-sm"
                    : "text-zinc-400 hover:text-slate-100 hover:bg-zinc-900/50"
                }`
              }
            >
              <Home className="w-5 h-5" />
              <span>Trang chủ</span>
            </NavLink>

            <NavLink
              to="/search"
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-3 rounded-lg font-semibold text-sm transition-all duration-200 ${
                  isActive
                    ? "bg-zinc-900 text-green-400 shadow-sm"
                    : "text-zinc-400 hover:text-slate-100 hover:bg-zinc-900/50"
                }`
              }
            >
              <Search className="w-5 h-5" />
              <span>Tìm kiếm</span>
            </NavLink>

            <NavLink
              to="/library"
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-3 rounded-lg font-semibold text-sm transition-all duration-200 ${
                  isActive
                    ? "bg-zinc-900 text-green-400 shadow-sm"
                    : "text-zinc-400 hover:text-slate-100 hover:bg-zinc-900/50"
                }`
              }
            >
              <Library className="w-5 h-5" />
              <span>Thư viện</span>
            </NavLink>

            <div className="h-px bg-zinc-900 my-2" />

            <NavLink
              to="/notifications"
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-3 rounded-lg font-semibold text-sm transition-all duration-200 ${
                  isActive
                    ? "bg-zinc-900 text-green-400 shadow-sm"
                    : "text-zinc-400 hover:text-slate-100 hover:bg-zinc-900/50"
                }`
              }
            >
              <Bell className="w-5 h-5" />
              <span>Thông báo</span>
            </NavLink>

            <NavLink
              to="/share"
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-3 rounded-lg font-semibold text-sm transition-all duration-200 ${
                  isActive
                    ? "bg-zinc-900 text-green-400 shadow-sm"
                    : "text-zinc-400 hover:text-slate-100 hover:bg-zinc-900/50"
                }`
              }
            >
              <Mail className="w-5 h-5" />
              <span>Hộp thư chia sẻ</span>
            </NavLink>

            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-3 rounded-lg font-semibold text-sm transition-all duration-200 ${
                  isActive
                    ? "bg-zinc-900 text-green-400 shadow-sm"
                    : "text-zinc-400 hover:text-slate-100 hover:bg-zinc-900/50"
                }`
              }
            >
              <User className="w-5 h-5" />
              <span>Hồ sơ</span>
            </NavLink>

            {user?.role === "Admin" && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `flex items-center gap-4 px-4 py-3 rounded-lg font-semibold text-sm transition-all duration-200 ${
                    isActive
                      ? "bg-zinc-900 text-green-400 shadow-sm"
                      : "text-zinc-400 hover:text-slate-100 hover:bg-zinc-900/50"
                  }`
                }
              >
                <ShieldCheck className="w-5 h-5" />
                <span>Quản trị</span>
              </NavLink>
            )}
          </nav>

          {/* Footer Sidebar / Nút đăng nhập/đăng xuất */}
          <div className="mt-auto">
            {isAuthenticated ? (
              <button
                onClick={logoutState}
                className="w-full flex items-center gap-4 px-4 py-3 rounded-lg font-semibold text-sm text-red-400 hover:bg-red-950/20 hover:text-red-300 transition-all duration-200 text-left"
              >
                <LogOut className="w-5 h-5" />
                <span>Đăng xuất</span>
              </button>
            ) : (
              <NavLink
                to="/login"
                className="flex items-center gap-4 px-4 py-3 rounded-lg font-semibold text-sm text-green-400 hover:bg-green-950/20 hover:text-green-300 transition-all duration-200"
              >
                <LogOut className="w-5 h-5" />
                <span>Đăng nhập</span>
              </NavLink>
            )}
          </div>
        </aside>

        {/* 2. MAIN CONTENT (Ở giữa & phải) */}
        <main className="flex-1 bg-zinc-950 rounded-xl flex flex-col overflow-hidden border border-zinc-900 relative">
          {/* Header trong suốt mờ ảo */}
          <header className="h-16 flex items-center justify-between px-6 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-900/50 shrink-0 z-10">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-zinc-400">
                Trạng thái hệ thống:
              </span>
              <span className="flex items-center gap-1.5 bg-green-500/10 text-green-400 text-xs px-2.5 py-1 rounded-full font-bold border border-green-500/20">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                Connected
              </span>
            </div>

            {/* Avatar / Nút điều khiển đăng nhập đăng ký */}
            {isAuthenticated && user ? (
              <div className="flex items-center gap-4">
                <NotificationBell />
                <NavLink
                  to="/profile"
                  className="flex items-center gap-2 hover:bg-zinc-900 p-1.5 pr-3 rounded-full transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-sm text-green-400 border border-zinc-700">
                    {user.fullName
                      ? user.fullName.charAt(0).toUpperCase()
                      : "U"}
                  </div>
                  <span className="text-sm font-semibold text-zinc-300">
                    {user.fullName || "Tài khoản"}
                  </span>
                </NavLink>
              </div>
            ) : (
              <div className="flex items-center gap-6">
                <Link
                  to="/register"
                  className="text-sm font-bold text-zinc-450 hover:text-slate-100 transition-colors"
                >
                  Đăng ký
                </Link>
                <Link
                  to="/login"
                  className="px-6 py-2.5 bg-white text-black font-bold text-sm rounded-full hover:scale-105 transition-transform active:scale-95 shadow-md"
                >
                  Đăng nhập
                </Link>
              </div>
            )}
          </header>

          {/* Nội dung động thay đổi theo route */}
          <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-zinc-800">
            <Outlet />
          </div>
        </main>
      </div>

      {/* 3. PLAYER BAR (Dưới cùng) */}
      <footer className="h-24 bg-black border-t border-zinc-900 px-6 flex items-center justify-between shrink-0">
        {/* Phía bên trái: Thông tin bài hát đang phát */}
        <div className="flex items-center gap-4 w-1/3">
          <div className="w-14 h-14 bg-zinc-900 rounded-lg flex items-center justify-center border border-zinc-800 overflow-hidden shrink-0 shadow-inner">
            {currentTrack ? (
              currentTrack.coverUrl ? (
                <img
                  src={currentTrack.coverUrl}
                  alt={currentTrack.title}
                  className="w-full h-full object-cover animate-fadeIn"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-green-500/10 to-zinc-900 flex items-center justify-center">
                  <Music className="w-6 h-6 text-green-400" />
                </div>
              )
            ) : (
              <Music className="w-6 h-6 text-zinc-600" />
            )}
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-bold truncate hover:underline cursor-pointer">
              {currentTrack ? currentTrack.title : "Chưa có bài hát"}
            </h4>
            <p className="text-xs text-zinc-400 truncate hover:underline cursor-pointer">
              {currentTrack ? currentTrack.artist : "Chọn một bài hát để nghe"}
            </p>
          </div>
          {currentTrack && (
            <button className="text-zinc-450 hover:text-green-400 transition-colors p-1 ml-2">
              <Heart className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Ở giữa: Các nút điều khiển nhạc & Thanh tiến trình */}
        <div className="flex flex-col items-center gap-2 w-1/3 max-w-xl">
          <div className="flex items-center gap-6">
            <button className="text-zinc-550 hover:text-slate-100 transition-colors">
              <Shuffle className="w-4 h-4" />
            </button>
            <button
              onClick={prevTrack}
              className="text-zinc-400 hover:text-slate-100 transition-colors"
            >
              <SkipBack className="w-5 h-5 fill-current" />
            </button>

            <button
              onClick={togglePlay}
              disabled={!currentTrack}
              className="w-10 h-10 bg-slate-100 disabled:bg-zinc-800 disabled:text-zinc-600 rounded-full flex items-center justify-center text-black hover:scale-105 transition-transform active:scale-95 shadow-md"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>

            <button
              onClick={nextTrack}
              className="text-zinc-400 hover:text-slate-100 transition-colors"
            >
              <SkipForward className="w-5 h-5 fill-current" />
            </button>
            <button className="text-zinc-550 hover:text-slate-100 transition-colors">
              <Repeat className="w-4 h-4" />
            </button>
          </div>

          {/* Thanh chạy tiến trình phát nhạc */}
          <div className="w-full flex items-center gap-2.5 text-[10px] text-zinc-500 font-bold">
            <span>{formatTime(currentTime)}</span>
            <div
              onClick={handleProgressBarClick}
              className="flex-1 h-1 bg-zinc-800 rounded-full relative group cursor-pointer"
            >
              <div
                className="absolute top-0 left-0 h-full bg-green-500 rounded-full group-hover:bg-green-400"
                style={{
                  width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
                }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-slate-100 rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  left: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
                  transform: "translate(-50%, -50%)",
                }}
              />
            </div>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Phía bên phải: Âm lượng & Tiện ích */}
        <div className="flex items-center justify-end gap-3 w-1/3 text-zinc-400">
          <Volume2 className="w-5 h-5 hover:text-slate-100 cursor-pointer" />
          <div
            onClick={handleVolumeBarClick}
            className="w-24 h-1 bg-zinc-800 rounded-full cursor-pointer relative group"
          >
            <div
              className="absolute top-0 left-0 h-full bg-green-500 rounded-full group-hover:bg-green-400"
              style={{ width: `${volume * 100}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-slate-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              style={{
                left: `${volume * 100}%`,
                transform: "translate(-50%, -50%)",
              }}
            />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
