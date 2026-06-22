import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Edit2, Camera, Check, Loader2, UploadCloud, Music, Film, Eye, CheckCircle } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { userService } from "../../services/userService";
import { mediaService, albumService } from "../../services";
import RegisterArtistModal from "../../components/RegisterArtistModal";
import { UploadMediaModal } from "../../components/UploadMediaModal";
import type { MediaItem } from "../../types";
import { usePlayer } from "../../contexts/PlayerContext";
import { formatDuration } from "../../utils";

export const Profile = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayer();

  const playSong = (song: any) => {
    if (song.mediaType !== 0) return; // Chỉ phát âm thanh (Audio/Song)
    
    const trackForPlayer = {
      id: song.id,
      title: song.title,
      artist: user?.fullName || 'Nghệ sĩ',
      coverUrl: song.coverUrl,
      duration: song.durationInSeconds ? formatDuration(song.durationInSeconds) : '0:00',
      durationInSeconds: song.durationInSeconds,
      filePath: mediaService.getStreamUrl(song.id)
    };

    const queueForPlayer = myMedia
      .filter((s: any) => s.mediaType === 0)
      .map((s: any) => ({
        id: s.id,
        title: s.title,
        artist: user?.fullName || 'Nghệ sĩ',
        coverUrl: s.coverUrl,
        duration: s.durationInSeconds ? formatDuration(s.durationInSeconds) : '0:00',
        durationInSeconds: s.durationInSeconds,
        filePath: mediaService.getStreamUrl(s.id)
      }));

    if (currentTrack?.id === song.id) {
      togglePlay();
    } else {
      playTrack(trackForPlayer, queueForPlayer);
    }
  };
  const [isEditing, setIsEditing] = useState(false);
  const [tempProfile, setTempProfile] = useState({
    fullName: "",
    bio: "",
    avatarUrl: "",
    bannerUrl: "",
    isPublic: true,
  });
  const [myAlbums, setMyAlbums] = useState<any[]>([]);
  const [isLoadingAlbums, setIsLoadingAlbums] = useState(false);
  const [activeTab, setActiveTab] = useState<'works' | 'albums'>('works');
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [myMedia, setMyMedia] = useState<MediaItem[]>([]);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingAvatar(true);
      setErrorMessage("");
      const response = await userService.uploadAvatar(file);
      if (response.success && response.data) {
        setTempProfile({ ...tempProfile, avatarUrl: response.data });
      } else {
        setErrorMessage(response.message || "Tải ảnh lên thất bại.");
      }
    } catch (error: any) {
      console.error("Lỗi khi tải ảnh lên:", error);
      setErrorMessage("Có lỗi xảy ra khi tải ảnh lên.");
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingBanner(true);
      setErrorMessage("");
      const response = await userService.uploadBanner(file);
      if (response.success && response.data) {
        setTempProfile({ ...tempProfile, bannerUrl: response.data });
      } else {
        setErrorMessage(response.message || "Tải ảnh bìa lên thất bại.");
      }
    } catch (error: any) {
      console.error("Lỗi khi tải ảnh bìa lên:", error);
      setErrorMessage("Có lỗi xảy ra khi tải ảnh bìa lên.");
    } finally {
      setIsUploadingBanner(false);
      if (bannerInputRef.current) {
        bannerInputRef.current.value = "";
      }
    }
  };

  const loadMyMedia = async () => {
    if (user?.role !== "Artist") return;
    try {
      setIsLoadingMedia(true);
      const response = await mediaService.getMyMedia();
      if (response.success) {
        setMyMedia(response.data || []);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách tác phẩm:", error);
    } finally {
      setIsLoadingMedia(false);
    }
  };

  const loadMyAlbums = async () => {
    if (user?.role !== "Artist" || !user.id) return;
    try {
      setIsLoadingAlbums(true);
      const response = await albumService.getAlbumsByArtist(user.id);
      if (response.success) {
        setMyAlbums(response.data || []);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách album:", error);
    } finally {
      setIsLoadingAlbums(false);
    }
  };

  // Đồng bộ tempProfile khi user thay đổi
  useEffect(() => {
    if (user) {
      setTempProfile({
        fullName: user.fullName || "",
        bio: user.bio || "",
        avatarUrl: user.avatarUrl || "",
        bannerUrl: user.bannerUrl || "",
        isPublic: user.isPublic ?? true,
      });
      if (user.role === "Artist") {
        loadMyMedia();
        loadMyAlbums();
      }
    }
  }, [user]);

  // Lắng nghe sự kiện để tự động load lại dữ liệu khi upload thành công hoặc album thay đổi
  useEffect(() => {
    if (user?.role !== "Artist") return;
    
    const handleMediaUploaded = () => {
      loadMyMedia();
    };
    const handleAlbumChanged = () => {
      loadMyAlbums();
      loadMyMedia();
    };
    
    window.addEventListener('mediaUploaded', handleMediaUploaded);
    window.addEventListener('albumChanged', handleAlbumChanged);

    return () => {
      window.removeEventListener('mediaUploaded', handleMediaUploaded);
      window.removeEventListener('albumChanged', handleAlbumChanged);
    };
  }, [user]);

  // Tự động ẩn thông báo sau 4 giây
  useEffect(() => {
    if (successMessage || errorMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
        setErrorMessage("");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, errorMessage]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-zinc-400 gap-2">
        <Loader2 className="w-8 h-8 animate-spin text-green-500" />
        <p className="text-sm font-medium">Đang tải thông tin hồ sơ...</p>
      </div>
    );
  }

  const handleSave = async () => {
    if (!tempProfile.fullName.trim()) {
      setErrorMessage("Họ và Tên không được để trống.");
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      const response = await userService.updateProfile({
        fullName: tempProfile.fullName.trim(),
        bio: tempProfile.bio?.trim(),
        avatarUrl: tempProfile.avatarUrl?.trim(),
        isPublic: tempProfile.isPublic,
      });

      if (response.success) {
        setSuccessMessage("Cập nhật hồ sơ thành công!");
        await refreshUser(); // Đồng bộ lại thông tin user trong Context
        setIsEditing(false);
      } else {
        setErrorMessage(response.message || "Cập nhật hồ sơ thất bại.");
      }
    } catch (error: any) {
      console.error("Lỗi khi cập nhật hồ sơ:", error);
      const backendError =
        error.response?.data?.errors?.[0] || error.response?.data?.message;
      setErrorMessage(
        backendError || "Có lỗi xảy ra khi kết nối tới hệ thống.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Register as Artist button */}
      {user?.role !== "Artist" && (
        <div className="flex justify-end">
          <button
            onClick={() => setShowRegisterModal(true)}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-green-400 text-xs font-bold rounded-full border border-zinc-800"
          >
            Đăng ký Artist
          </button>
        </div>
      )}

      {showRegisterModal && (
        <RegisterArtistModal
          onClose={() => setShowRegisterModal(false)}
          onSuccess={() => {
            /* maybe refresh user */
          }}
        />
      )}
      {successMessage && (
        <div className="p-3.5 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl text-xs font-bold max-w-2xl animate-fadeIn">
          {successMessage}
        </div>
      )}

      {/* === HEADER HỒ SƠ === */}
      {user.role === "Artist" ? (
        /* --- LAYOUT DÀNH CHO ARTIST (Giống Spotify) --- */
        <div className="relative w-full h-[350px] md:h-[450px] lg:h-[500px] bg-zinc-900 border border-zinc-800 overflow-hidden group shadow-2xl rounded-3xl -mt-4">
          {/* Banner Image */}
          {(isEditing ? tempProfile.bannerUrl : user.bannerUrl) ? (
            <img
              src={isEditing ? tempProfile.bannerUrl : user.bannerUrl}
              alt="Banner"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
              <Music className="w-24 h-24 text-zinc-700" />
            </div>
          )}

          {/* Gradient Overlay (làm tối phía dưới để chữ trắng nổi lên) */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-900/40 to-transparent pointer-events-none" />

          {/* Nội dung Text */}
          <div className="absolute bottom-0 left-0 p-6 md:p-10 w-full flex flex-col md:flex-row items-start md:items-end justify-between gap-6 z-10">
            <div className="space-y-1 md:space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-5 h-5 md:w-6 md:h-6 fill-blue-500 text-white" />
                <span className="text-xs md:text-sm text-white font-medium tracking-wide drop-shadow-md">Verified by TuneVault</span>
              </div>
              <h1 className="text-5xl md:text-7xl lg:text-[100px] font-black text-white tracking-tighter drop-shadow-2xl leading-none">
                {user.fullName}
              </h1>
              
              {/* Thể loại âm nhạc */}
              {user.genres && (
                <div className="flex flex-wrap items-center gap-2 pt-4">
                  {user.genres.split(",").map((genre, index) => (
                    <span 
                      key={index} 
                      className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] md:text-xs font-bold rounded-full uppercase tracking-wider"
                    >
                      {genre.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Nút Edit */}
            {!isEditing && (
              <button
                onClick={() => {
                  setTempProfile({
                    fullName: user.fullName || "",
                    bio: user.bio || "",
                    avatarUrl: user.avatarUrl || "",
                    bannerUrl: user.bannerUrl || "",
                    isPublic: user.isPublic || false,
                  });
                  setIsEditing(true);
                }}
                className="shrink-0 bg-white hover:bg-zinc-200 text-black text-xs font-bold px-5 py-2.5 rounded-full transition-colors flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                <span>Chỉnh sửa hồ sơ</span>
              </button>
            )}
          </div>

          {/* Banner Upload Overlay (Khi Edit) */}
          {isEditing && (
            <div 
              className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm z-20"
              onClick={() => bannerInputRef.current?.click()}
            >
              <div className="flex flex-col items-center gap-2 bg-zinc-900/90 px-8 py-6 rounded-3xl border border-zinc-700/50 shadow-2xl">
                {isUploadingBanner ? (
                  <Loader2 className="w-8 h-8 text-green-400 animate-spin" />
                ) : (
                  <>
                    <Camera className="w-8 h-8 text-green-400" />
                    <span className="text-base font-bold text-slate-200">Đổi ảnh bìa nền</span>
                  </>
                )}
              </div>
            </div>
          )}
          <input
            type="file"
            ref={bannerInputRef}
            onChange={handleBannerUpload}
            accept="image/*"
            className="hidden"
          />
        </div>
      ) : (
        /* --- LAYOUT DÀNH CHO USER BÌNH THƯỜNG --- */
        <>
          {/* Thông tin hồ sơ Header */}
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 pb-6 border-b border-zinc-900 relative z-10 pt-4">
            {/* Avatar */}
            <div className="relative group shrink-0">
              <div className="w-36 h-36 rounded-full bg-zinc-800 border-2 border-green-500/50 flex items-center justify-center font-black text-4xl text-green-400 shadow-2xl relative overflow-hidden">
                {(isEditing ? tempProfile.avatarUrl : user.avatarUrl) ? (
                  <img
                    src={isEditing ? tempProfile.avatarUrl : user.avatarUrl}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>
                    {user.fullName
                      ? user.fullName
                          .split(" ")
                          .pop()
                          ?.substring(0, 2)
                          .toUpperCase()
                      : "U"}
                  </span>
                )}
              </div>
              {isEditing && (
                <div 
                  className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center text-slate-100 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {isUploadingAvatar ? (
                    <Loader2 className="w-6 h-6 text-green-400 animate-spin" />
                  ) : (
                    <Camera className="w-6 h-6 text-green-400" />
                  )}
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarUpload}
                accept="image/*"
                className="hidden"
              />
            </div>

            {/* Thông tin hồ sơ */}
            <div className="text-center md:text-left space-y-2 flex-1">
              <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-widest bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800 inline-block">
                Hồ sơ cá nhân
              </span>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight text-slate-100 mt-1 flex items-center justify-center md:justify-start gap-2">
                {user.fullName}
              </h2>
              <p className="text-sm text-zinc-400 font-medium leading-relaxed max-w-xl">
                {user.bio || "Chưa có tiểu sử giới thiệu bản thân."}
              </p>

              <div className="text-xs text-zinc-500 font-bold tracking-wide pt-1 flex items-center justify-center md:justify-start gap-4">
                <span>{user.playlistCount || 0} Playlist cá nhân</span>
                <span>•</span>
                <span>{user.followerCount || 0} Người theo dõi</span>
                <span>•</span>
                <span>{user.favoriteCount || 0} Bài hát yêu thích</span>
              </div>
            </div>

            {/* Nút Edit */}
            {!isEditing && (
              <button
                onClick={() => {
                  setTempProfile({
                    fullName: user.fullName || "",
                    bio: user.bio || "",
                    avatarUrl: user.avatarUrl || "",
                    bannerUrl: user.bannerUrl || "",
                    isPublic: user.isPublic || false,
                  });
                  setIsEditing(true);
                }}
                className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-green-400 text-xs font-bold px-4 py-2.5 rounded-full border border-zinc-800 transition-colors shrink-0"
              >
                <Edit2 className="w-4 h-4" />
                <span>Chỉnh sửa hồ sơ</span>
              </button>
            )}
          </div>
        </>
      )}

      {/* Form chỉnh sửa nếu ở chế độ Edit */}
      {isEditing && (
        <section className="bg-zinc-900/20 border border-zinc-900 rounded-2xl p-6 max-w-2xl space-y-4 relative">
          <h3 className="text-base font-bold text-slate-200">
            Thông tin chỉnh sửa
          </h3>

          {errorMessage && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs font-bold animate-fadeIn">
              {errorMessage}
            </div>
          )}

          <div className="space-y-4">
            {/* Nếu là Artist thì cho thêm nút upload Avatar ở đây (vì header ẩn mất Avatar rồi) */}
            {user.role === "Artist" && (
              <div className="flex flex-col gap-1.5 pb-2">
                <label className="text-xs text-zinc-500 font-bold uppercase">
                  Ảnh đại diện (Avatar)
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center overflow-hidden shrink-0">
                    {tempProfile.avatarUrl || user.avatarUrl ? (
                      <img
                        src={tempProfile.avatarUrl || user.avatarUrl}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || 'U')}&background=3f3f46&color=fff&size=128`;
                        }}
                      />
                    ) : (
                      <Music className="w-6 h-6 text-zinc-600" />
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold rounded-lg transition-colors flex items-center gap-2"
                  >
                    {isUploadingAvatar ? (
                      <Loader2 className="w-4 h-4 animate-spin text-green-400" />
                    ) : (
                      <Camera className="w-4 h-4" />
                    )}
                    Tải ảnh lên
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-zinc-500 font-bold uppercase">
                Họ và Tên
              </label>
              <input
                type="text"
                value={tempProfile.fullName}
                onChange={(e) =>
                  setTempProfile({ ...tempProfile, fullName: e.target.value })
                }
                className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-green-500"
                placeholder="Nhập họ và tên của bạn..."
                disabled={isSaving}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-zinc-500 font-bold uppercase">
                Tiểu sử (Bio)
              </label>
              <textarea
                rows={3}
                value={tempProfile.bio}
                onChange={(e) =>
                  setTempProfile({ ...tempProfile, bio: e.target.value })
                }
                className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-green-500 resize-none"
                placeholder="Viết một vài dòng giới thiệu về bản thân..."
                disabled={isSaving}
              />
            </div>

            {/* Toggle IsPublic */}
            <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 p-4 rounded-lg">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-200">Hiển thị hồ sơ công khai</span>
                <span className="text-xs text-zinc-500">Cho phép người khác tìm thấy và xem hồ sơ của bạn</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={tempProfile.isPublic}
                  onChange={(e) => setTempProfile({ ...tempProfile, isPublic: e.target.checked })}
                  disabled={isSaving}
                />
                <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
              </label>
            </div>

          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 rounded-full border border-zinc-850"
              disabled={isSaving}
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 bg-green-500 hover:bg-green-400 text-xs font-bold text-black rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  Lưu thay đổi
                </>
              )}
            </button>
          </div>
        </section>
      )}

      {user?.role === "Artist" && (
        <section className="bg-zinc-900/10 border border-zinc-900 rounded-2xl p-6 mt-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-900">
            <div>
              <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                <Music className="w-5 h-5 text-green-400" />
                Bảng điều khiển Nghệ sĩ
              </h3>
              <p className="text-xs text-zinc-550 mt-1">Quản lý các bài hát, video và theo dõi trạng thái kiểm duyệt.</p>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center justify-center gap-1.5 px-4 py-2 bg-green-500 hover:bg-green-400 text-black text-xs font-bold rounded-full shadow-lg shadow-green-500/10 active:scale-95 transition-transform"
            >
              <UploadCloud className="w-4 h-4 stroke-[2.5]" />
              Đăng tác phẩm mới
            </button>
          </div>

          {/* Hệ thống TAB */}
          <div className="flex gap-6 border-b border-zinc-800 pb-px">
            <button
              onClick={() => setActiveTab('works')}
              className={`pb-3 text-xs font-bold border-b-2 cursor-pointer transition-all duration-250 ${
                activeTab === 'works'
                  ? 'border-green-500 text-green-400'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Tác phẩm ({myMedia.length})
            </button>
            <button
              onClick={() => setActiveTab('albums')}
              className={`pb-3 text-xs font-bold border-b-2 cursor-pointer transition-all duration-250 ${
                activeTab === 'albums'
                  ? 'border-green-500 text-green-400'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Album ({myAlbums.length})
            </button>
          </div>

          {activeTab === 'works' ? (
            isLoadingMedia ? (
              <div className="flex flex-col items-center justify-center py-12 text-zinc-550 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-green-500" />
                <p className="text-xs font-medium">Đang tải danh sách tác phẩm...</p>
              </div>
            ) : myMedia.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-zinc-800 rounded-xl space-y-2">
                <p className="text-xs font-bold text-zinc-550">Bạn chưa đăng tải tác phẩm nào cả.</p>
                <p className="text-[10px] text-zinc-600">Hãy nhấn nút "Đăng tác phẩm mới" để chia sẻ sản phẩm âm nhạc đầu tiên!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-900 text-zinc-500 font-extrabold uppercase tracking-wider">
                      <th className="pb-3 pl-2">Tác phẩm</th>
                      <th className="pb-3">Định dạng</th>
                      <th className="pb-3">Lượt nghe/xem</th>
                      <th className="pb-3 text-center">Trạng thái</th>
                      <th className="pb-3 text-right pr-2">Chế độ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900/60 font-semibold text-zinc-300">
                    {myMedia.map((media) => (
                      <tr 
                        key={media.id} 
                        onClick={() => playSong(media)}
                        className={`hover:bg-zinc-900/20 group transition-colors ${media.mediaType === 0 ? 'cursor-pointer' : ''}`}
                      >
                        {/* Title + Cover */}
                        <td className="py-3 pl-2 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800/80 overflow-hidden flex items-center justify-center shrink-0">
                            {media.coverUrl ? (
                              <img src={mediaService.getImageUrl(media.coverUrl)} alt={media.title} className="w-full h-full object-cover" />
                            ) : (
                              <Music className="w-5 h-5 text-zinc-650" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className={`font-bold truncate group-hover:text-green-400 transition-colors ${currentTrack?.id === media.id ? 'text-green-500 font-extrabold' : 'text-slate-200'}`}>
                              {media.title}
                              {currentTrack?.id === media.id && isPlaying && (
                                <span className="inline-flex items-center gap-1 text-[10px] text-green-500 font-bold ml-2">
                                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                  Đang phát
                                </span>
                              )}
                            </p>
                            <p className="text-[10px] text-zinc-550 truncate mt-0.5">{media.description || "Không có mô tả"}</p>
                          </div>
                        </td>
                        
                        {/* MediaType */}
                        <td className="py-3">
                          <span className="flex items-center gap-1 text-zinc-400">
                            {media.mediaType === 0 ? (
                              <>
                                <Music className="w-3.5 h-3.5 text-zinc-500" />
                                Audio
                              </>
                            ) : (
                              <>
                                <Film className="w-3.5 h-3.5 text-zinc-500" />
                                Video
                              </>
                            )}
                          </span>
                        </td>

                        {/* Views */}
                        <td className="py-3">
                          <span className="flex items-center gap-1 text-zinc-400">
                            <Eye className="w-3.5 h-3.5 text-zinc-500" />
                            {media.viewCount.toLocaleString()} lượt
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3 text-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            media.approvalStatus === "Approved"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : media.approvalStatus === "Rejected"
                              ? "bg-red-500/10 text-red-400 border-red-500/20"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          }`}>
                            {media.approvalStatus === "Approved" ? "Đã duyệt" : media.approvalStatus === "Rejected" ? "Từ chối" : "Chờ duyệt"}
                          </span>
                        </td>

                        {/* Privacy */}
                        <td className="py-3 text-right pr-2">
                          <span className="text-[10px] text-zinc-500 font-bold uppercase">
                            {media.isPrivate ? "Riêng tư" : "Công khai"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            isLoadingAlbums ? (
              <div className="flex flex-col items-center justify-center py-12 text-zinc-550 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-green-500" />
                <p className="text-xs font-medium">Đang tải danh sách album...</p>
              </div>
            ) : myAlbums.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-zinc-800 rounded-xl space-y-2">
                <p className="text-xs font-bold text-zinc-550">Bạn chưa tạo album nào.</p>
                <p className="text-[10px] text-zinc-600">Sử dụng nút tạo album ở thanh công cụ hoặc sidebar để tạo mới.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {myAlbums.map((album) => (
                  <div
                    key={album.id}
                    onClick={() => navigate(`/album/${album.id}`)}
                    className="group relative bg-zinc-900/40 hover:bg-zinc-800/40 border border-zinc-800/30 hover:border-zinc-700/50 rounded-xl p-4 transition-all duration-300 cursor-pointer flex flex-col space-y-3"
                  >
                    {/* Bìa Album */}
                    <div className="aspect-square w-full rounded-lg overflow-hidden bg-zinc-950 relative border border-zinc-800/50 group-hover:border-zinc-700/80 transition-colors shadow-inner">
                      {album.coverImageUrl ? (
                        <img
                          src={mediaService.getImageUrl(album.coverImageUrl)}
                          alt={album.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                          <Music className="w-8 h-8 text-zinc-650" />
                        </div>
                      )}
                    </div>
                    {/* Thông tin Album */}
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-slate-200 truncate group-hover:text-green-400 transition-colors" title={album.title}>
                        {album.title}
                      </h4>
                      <p className="text-[10px] text-zinc-550 mt-1">
                        {new Date(album.releaseDate).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </section>
      )}

      {showUploadModal && (
        <UploadMediaModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={loadMyMedia}
        />
      )}
    </div>
  );
};

export default Profile;
