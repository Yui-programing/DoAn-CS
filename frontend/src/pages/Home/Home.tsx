import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '../../contexts/PlayerContext';
// Import thêm Loader2 để làm icon xoay vòng lúc chờ mạng
import { Play, Pause, Sparkles, Heart, Music, Loader2 } from 'lucide-react';
// Import dịch vụ API để lấy dữ liệu thật
import { playlistService, mediaService } from '../../services';
import { useAuth } from '../../contexts/AuthContext';

export const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayer();

  // BƯỚC 1: Khai báo State chứa dữ liệu thật
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [recentTracks, setRecentTracks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // BƯỚC 2: Tự động gọi API khi vừa mở trang Home (chỉ khi đã đăng nhập)
  useEffect(() => {
    const fetchHomeData = async () => {
      if (!isAuthenticated) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // Gọi API lấy Playlist thật từ Backend
        const playlistRes = await playlistService.getMyPlaylists();
        if (playlistRes.success) {
          setPlaylists(playlistRes.data);
        }

        // Gọi API lấy Lịch sử bài hát thật
        const historyRes = await mediaService.getPlayHistory();
        if (historyRes.success) {
          // Lọc mảng lịch sử để lấy ra đúng bài hát (mediaItem)
          const tracks = historyRes.data.map((h: any) => h.mediaItem).filter(Boolean);
          setRecentTracks(tracks);
        }
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu trang chủ:', error);
      } finally {
        setIsLoading(false); // Gọi xong (dù thành công hay lỗi) thì tắt vòng xoay
      }
    };

    fetchHomeData();
  }, [isAuthenticated]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  const handleTrackClick = (track: any) => {
    const isVideo = track.filePath?.endsWith('.mp4');

    if (isVideo) {
      navigate(`/video/${track.id}`);
    } else {
      if (currentTrack?.id === track.id) {
        togglePlay();
      } else {
        playTrack(track, recentTracks);
      }
    }
  };

  // MÀN HÌNH CHỜ: Nếu API chưa trả về kịp thì hiện vòng xoay
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] space-y-4">
        <Loader2 className="w-10 h-10 text-green-500 animate-spin" />
        <p className="text-zinc-400 font-medium">Đang tải dữ liệu từ máy chủ...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Banner chào mừng */}
      <div className="bg-gradient-to-r from-emerald-900/40 via-zinc-900 to-zinc-950 p-8 rounded-2xl border border-zinc-800/40 flex justify-between items-center relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2 text-green-400 font-semibold text-sm">
            <Sparkles className="w-4 h-4" />
            <span>Gợi ý riêng cho bạn</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight">
            {getGreeting()}{isAuthenticated ? ', Duy!' : '!'}
          </h2>
          <p className="text-sm text-zinc-400 max-w-md">
            Hôm nay bạn muốn nghe thể loại nhạc gì? Hãy click vào bài hát bất kỳ bên dưới để trải nghiệm âm thanh thực tế nhé.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-radial from-green-500/10 to-transparent blur-3xl" />
      </div>

      {/* BƯỚC 3: Hiển thị danh sách Playlists THẬT */}
      <section className="space-y-4">
        <h3 className="text-xl font-bold tracking-tight">Thư viện gợi ý (Dữ liệu thật)</h3>
        {playlists.length === 0 ? (
          <p className="text-zinc-500 text-sm">Chưa có playlist nào. Hãy tạo trên Backend nhé!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {playlists.map((playlist) => (
              <div
                key={playlist.id}
                onClick={() => navigate(`/playlist/${playlist.id}`)}
                className="p-5 rounded-xl bg-gradient-to-b from-emerald-500/20 to-zinc-900 border border-zinc-800/30 hover:border-zinc-700/50 transition-all duration-300 cursor-pointer group relative"
              >
                <h4 className="font-bold text-base line-clamp-1 group-hover:text-green-400 transition-colors">
                  {playlist.title}
                </h4>
                <p className="text-xs text-zinc-400 mt-1">{playlist.description || 'Không có mô tả'}</p>

                <button className="absolute right-4 bottom-4 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-black shadow-lg opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:scale-105 active:scale-95">
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* BƯỚC 4: Hiển thị Lịch sử bài hát THẬT */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold tracking-tight">Nghe nhiều gần đây (Dữ liệu thật)</h3>
          <button className="text-xs text-green-400 hover:underline font-bold">Xem tất cả</button>
        </div>

        {recentTracks.length === 0 ? (
          <p className="text-zinc-500 text-sm">Bạn chưa nghe bài nào trên hệ thống này.</p>
        ) : (
          <div className="bg-zinc-900/20 rounded-xl border border-zinc-900 overflow-hidden">
            {recentTracks.map((track, index) => {
              const isCurrent = currentTrack?.id === track.id;
              return (
                <div
                  key={track.id || index}
                  onClick={() => handleTrackClick(track)}
                  className={`flex items-center justify-between px-6 py-4 hover:bg-zinc-900/50 transition-colors border-b border-zinc-900/50 last:border-0 group cursor-pointer ${isCurrent ? 'bg-zinc-900/30' : ''}`}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <span className={`text-sm font-bold w-4 text-right ${isCurrent ? 'text-green-400' : 'text-zinc-500'}`}>
                      {isCurrent && isPlaying ? '•' : index + 1}
                    </span>
                    <div className="w-10 h-10 bg-zinc-800 rounded flex items-center justify-center border border-zinc-800 overflow-hidden relative group-hover:border-zinc-700 shrink-0">
                      {track.coverUrl ? (
                        <img src={track.coverUrl} alt="Cover" className="w-full h-full object-cover" />
                      ) : (
                        <Music className="w-5 h-5 text-zinc-500" />
                      )}
                      <div className={`absolute inset-0 bg-black/60 flex items-center justify-center transition-opacity ${isCurrent && isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                        {isCurrent && isPlaying ? (
                          <Pause className="w-4.5 h-4.5 text-green-400 fill-current" />
                        ) : (
                          <Play className="w-4.5 h-4.5 text-green-400 fill-current ml-0.5" />
                        )}
                      </div>
                    </div>
                    <div className="min-w-0">
                      <h4 className={`text-sm font-bold truncate transition-colors ${isCurrent ? 'text-green-400' : 'text-slate-200 group-hover:text-green-400'}`}>
                        {track.title}
                      </h4>
                      <p className="text-xs text-zinc-400 truncate">{track.artist || 'Không có tên ca sĩ'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-8 text-xs text-zinc-400">
                    <button className="opacity-0 group-hover:opacity-100 hover:text-green-400 transition-all">
                      <Heart className={`w-4.5 h-4.5 ${isCurrent ? 'text-green-400 fill-current' : ''}`} />
                    </button>
                    <span className={`font-semibold ${isCurrent ? 'text-green-400' : ''}`}>
                      {/* Vì DTO Backend có thể chưa tính thời lượng nên tạm để trống */}
                      Phát nhạc
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
