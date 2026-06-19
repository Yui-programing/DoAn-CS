import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CheckCircle, Loader2, Music, ShieldAlert } from "lucide-react";
import { userService } from "../../services/userService";
import { mediaService } from "../../services";
import type { UserProfile, MediaItem } from "../../types";
import { useAuth } from "../../contexts/AuthContext";

export const UserProfileView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);

  useEffect(() => {
    // Nếu ID là ID của người đang đăng nhập, thì điều hướng sang trang Profile cá nhân của họ luôn
    if (currentUser && id === currentUser.id) {
      navigate("/profile");
      return;
    }

    const fetchProfile = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        setError(null);
        const res = await userService.getUserProfile(id);
        if (res.success && res.data) {
          setProfile(res.data);
          
          if (res.data.role === "Artist") {
            const searchRes = await mediaService.searchAll(res.data.fullName || '', 20);
            if (searchRes.success && searchRes.data && searchRes.data.items) {
              const songs = searchRes.data.items.filter((i: any) => i.type === 'Song' && i.artistName === res.data.fullName);
              setMediaList(songs);
            }
          }
        } else {
          setError(res.message || "Không thể tải hồ sơ");
        }
      } catch (err: any) {
        if (err.response?.status === 403) {
          setError("Người dùng này đã đặt hồ sơ ở chế độ riêng tư.");
        } else {
          setError("Không tìm thấy người dùng.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [id, currentUser, navigate]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-zinc-400 gap-2">
        <Loader2 className="w-8 h-8 animate-spin text-green-500" />
        <p className="text-sm font-medium">Đang tải hồ sơ...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center max-w-md mx-auto space-y-4">
        <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-800">
          <ShieldAlert className="w-8 h-8 text-zinc-500" />
        </div>
        <h2 className="text-xl font-bold text-white">Hồ sơ không khả dụng</h2>
        <p className="text-sm text-zinc-400 leading-relaxed">
          {error || "Không thể tìm thấy thông tin của người dùng này."}
        </p>
        <button 
          onClick={() => navigate("/")}
          className="px-6 py-2 bg-white text-black font-bold text-sm rounded-full hover:scale-105 transition-transform"
        >
          Về trang chủ
        </button>
      </div>
    );
  }

  const isArtist = profile.role === "Artist";

  return (
    <div className="min-h-screen bg-black text-slate-100 flex flex-col font-sans pb-24 overflow-x-hidden w-full relative h-full">
      {/* Background Banner / Blur (cho User bình thường) */}
      {!isArtist && (
        <div className="absolute top-0 left-0 w-full h-[40vh] bg-gradient-to-b from-zinc-800/40 to-black -z-10"></div>
      )}

      <div className="px-6 md:px-10 pt-8 md:pt-12">
        {/* === HEADER HỒ SƠ === */}
        {isArtist ? (
          /* --- LAYOUT DÀNH CHO ARTIST --- */
          <div className="relative w-full h-[350px] md:h-[450px] lg:h-[500px] bg-zinc-900 border border-zinc-800 overflow-hidden group shadow-2xl rounded-3xl -mt-4">
            {profile.bannerUrl ? (
              <img
                src={mediaService.getImageUrl(profile.bannerUrl)}
                alt="Banner"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                <Music className="w-24 h-24 text-zinc-700" />
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-900/40 to-transparent pointer-events-none" />

            <div className="absolute bottom-0 left-0 p-6 md:p-10 w-full flex flex-col md:flex-row items-start md:items-end justify-between gap-6 z-10">
              <div className="space-y-1 md:space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-5 h-5 md:w-6 md:h-6 fill-blue-500 text-white" />
                  <span className="text-xs md:text-sm text-white font-medium tracking-wide drop-shadow-md">Verified by TuneVault</span>
                </div>
                <h1 className="text-5xl md:text-7xl lg:text-[100px] font-black text-white tracking-tighter drop-shadow-2xl leading-none">
                  {profile.fullName}
                </h1>
                
                {profile.genres && (
                  <div className="flex flex-wrap items-center gap-2 pt-4">
                    {profile.genres.split(",").map((genre, index) => (
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
            </div>
          </div>
        ) : (
          /* --- LAYOUT DÀNH CHO USER BÌNH THƯỜNG --- */
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 pb-6 border-b border-zinc-900 relative z-10 pt-4">
            <div className="relative group shrink-0">
              <div className="w-36 h-36 rounded-full bg-zinc-800 border-2 border-green-500/50 flex items-center justify-center font-black text-4xl text-green-400 shadow-2xl relative overflow-hidden">
                {profile.avatarUrl ? (
                  <img
                    src={mediaService.getImageUrl(profile.avatarUrl)}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.fullName || 'U')}&background=3f3f46&color=fff&size=256`;
                    }}
                  />
                ) : (
                  <Music className="w-12 h-12 text-zinc-600" />
                )}
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-end text-center md:text-left z-10 pb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">
                Hồ sơ
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-white tracking-tighter drop-shadow-md mb-2">
                {profile.fullName}
              </h1>
            </div>
          </div>
        )}

        {/* --- NỘI DUNG CHÍNH --- */}
        <div className="mt-8 space-y-8 max-w-4xl">
          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            <button className="px-8 py-3 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform">
              Theo dõi
            </button>
            <button className="w-10 h-10 rounded-full border border-zinc-700 flex items-center justify-center text-zinc-300 hover:text-white hover:border-white transition-colors">
              •••
            </button>
          </div>

          {profile.bio && (
            <div className="bg-zinc-900/40 p-6 rounded-2xl border border-zinc-800/50 backdrop-blur-sm">
              <h3 className="text-base font-bold text-white mb-2">Tiểu sử</h3>
              <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
                {profile.bio}
              </p>
            </div>
          )}

          {/* Nghệ sĩ Playlist (Phổ biến) */}
          {isArtist && mediaList.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-white mb-6">Phổ biến</h2>
              <div className="space-y-1 bg-zinc-900/20 p-2 rounded-2xl border border-zinc-800/50">
                {mediaList.map((song, index) => (
                  <div key={song.id} className="group flex items-center justify-between p-3 hover:bg-white/10 rounded-xl transition-colors cursor-pointer">
                    <div className="flex items-center gap-4">
                      <span className="text-zinc-500 text-base font-medium w-6 text-center group-hover:text-white transition-colors">
                        {index + 1}
                      </span>
                      <img 
                        src={mediaService.getImageUrl(song.coverUrl)} 
                        alt="Cover" 
                        className="w-12 h-12 rounded object-cover shadow-md" 
                      />
                      <div>
                        <h4 className="text-white text-sm font-semibold">{song.title}</h4>
                      </div>
                    </div>
                    <span className="text-zinc-400 text-xs font-medium">{song.viewCount?.toLocaleString() || '0'} lượt nghe</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
