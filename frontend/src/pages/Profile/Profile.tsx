import { useState, useEffect } from "react";
import { Edit2, Camera, Check, Loader2, UploadCloud, Music, Film, Eye } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { userService } from "../../services/userService";
import { mediaService } from "../../services";
import RegisterArtistModal from "../../components/RegisterArtistModal";
import { UploadMediaModal } from "../../components/UploadMediaModal";
import type { MediaItem } from "../../types";

export const Profile = () => {
  const { user, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [tempProfile, setTempProfile] = useState({
    fullName: "",
    bio: "",
    avatarUrl: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [myMedia, setMyMedia] = useState<MediaItem[]>([]);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);

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

  // Đồng bộ tempProfile khi user thay đổi
  useEffect(() => {
    if (user) {
      setTempProfile({
        fullName: user.fullName || "",
        bio: user.bio || "",
        avatarUrl: user.avatarUrl || "",
      });
      if (user.role === "Artist") {
        loadMyMedia();
      }
    }
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

      {/* Banner hồ sơ */}
      <div className="flex flex-col md:flex-row items-center md:items-end gap-6 pb-6 border-b border-zinc-900">
        {/* Avatar */}
        <div className="relative group shrink-0">
          <div className="w-36 h-36 rounded-full bg-zinc-800 border-2 border-green-500/50 flex items-center justify-center font-black text-4xl text-green-400 shadow-2xl relative overflow-hidden">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
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
            <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center text-slate-100 opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-6 h-6 text-green-400" />
            </div>
          )}
        </div>

        {/* Thông tin hồ sơ */}
        <div className="text-center md:text-left space-y-2 flex-1">
          <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-widest bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">
            Hồ sơ cá nhân
          </span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-slate-100 mt-1">
            {user.fullName}
          </h2>
          <p className="text-sm text-zinc-400 font-medium leading-relaxed max-w-xl">
            {user.bio || "Chưa có tiểu sử giới thiệu bản thân."}
          </p>

          <div className="text-xs text-zinc-500 font-bold tracking-wide pt-1 flex items-center justify-center md:justify-start gap-4">
            <span>2 Playlist cá nhân</span>
            <span>•</span>
            <span>12 Người theo dõi</span>
            <span>•</span>
            <span>8 Bài hát yêu thích</span>
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

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-zinc-500 font-bold uppercase">
                Ảnh đại diện (Avatar URL)
              </label>
              <input
                type="text"
                value={tempProfile.avatarUrl}
                onChange={(e) =>
                  setTempProfile({ ...tempProfile, avatarUrl: e.target.value })
                }
                className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-green-500"
                placeholder="Nhập link ảnh (URL)..."
                disabled={isSaving}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-xs font-bold text-zinc-400 rounded-full border border-zinc-850"
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

      {/* Bảng điều khiển nghệ sĩ (Artist Panel) */}
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

          {isLoadingMedia ? (
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
                    <tr key={media.id} className="hover:bg-zinc-900/20 group transition-colors">
                      {/* Title + Cover */}
                      <td className="py-3 pl-2 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800/80 overflow-hidden flex items-center justify-center shrink-0">
                          {media.coverUrl ? (
                            <img src={media.coverUrl} alt={media.title} className="w-full h-full object-cover" />
                          ) : (
                            <Music className="w-5 h-5 text-zinc-650" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-200 truncate group-hover:text-green-400 transition-colors">{media.title}</p>
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
