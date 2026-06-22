import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '../../contexts/PlayerContext';
// Import thêm Loader2 để làm icon xoay vòng lúc chờ mạng
import { Play, Pause, Sparkles, Heart, Music, Loader2, ListMusic } from 'lucide-react';
// Import dịch vụ API để lấy dữ liệu thật
import { playlistService, mediaService } from '../../services';
import { useAuth } from '../../contexts/AuthContext';
import { TrackDropdownMenu } from '../../components/TrackDropdownMenu';
import { AddToPlaylistModal } from '../../components/AddToPlaylistModal';
import { ShareModal } from '../../components/ShareModal';
import { useFavorite } from '../../contexts/FavoriteContext';
import { formatDuration, formatViewCount } from '../../utils';

export const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayer();
  const { isFavorite, toggleFavorite } = useFavorite();

  // BƯỚC 1: Khai báo State chứa dữ liệu thật
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [recentTracks, setRecentTracks] = useState<any[]>([]);
  const [suggestedTracks, setSuggestedTracks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'music' | 'video'>('all');

  // Phân tách nhạc gợi ý dựa vào loại media (0 = Audio, 1 = Video)
  const audioTracks = suggestedTracks.filter((track: any) => track.mediaType === 0);
  const videoTracks = suggestedTracks.filter((track: any) => track.mediaType === 1);

  // Trạng thái cho Add to Playlist Modal và Share Modal
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(null);
  const [sharingTrack, setSharingTrack] = useState<any | null>(null);

  // BƯỚC 2: Tự động gọi API khi vừa mở trang Home
  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setIsLoading(true);

        // 1. Gọi API lấy bài hát gợi ý (Public API)
        const searchRes = await mediaService.searchSongs('%', 10);
        if (searchRes.success && searchRes.data && searchRes.data.items) {
          const mapped = searchRes.data.items.map((item: any) => ({
            id: item.id,
            title: item.name,
            artist: item.artistName || 'Nghệ sĩ TuneVault',
            coverUrl: item.coverUrl,
            filePath: mediaService.getStreamUrl(item.id),
            duration: formatDuration(item.durationInSeconds),
            durationInSeconds: item.durationInSeconds,
            viewCount: item.viewCount,
            mediaType: item.mediaType // Nhận thêm loại media từ Backend (0: Audio, 1: Video)
          }));
          setSuggestedTracks(mapped);
        }

        // 2. Các API cần đăng nhập (Private APIs)
        if (isAuthenticated) {
          // Gọi API lấy Playlist thật từ Backend
          const playlistRes = await playlistService.getMyPlaylists();
          if (playlistRes.success) {
            setPlaylists(playlistRes.data);
          }

          // Gọi API lấy Lịch sử bài hát thật
          const historyRes = await mediaService.getPlayHistory();
          if (historyRes.success) {
            const tracks = historyRes.data.map((h: any) => {
              if (!h.mediaItem) return null;
              return {
                id: h.mediaItem.id,
                title: h.mediaItem.title,
                artist: h.mediaItem.artistName || 'Nghệ sĩ tự do',
                coverUrl: h.mediaItem.coverUrl,
                filePath: mediaService.getStreamUrl(h.mediaItem.id),
                duration: formatDuration(h.mediaItem.durationInSeconds),
                durationInSeconds: h.mediaItem.durationInSeconds,
                viewCount: h.mediaItem.viewCount,
                mediaType: h.mediaItem.mediaType
              };
            }).filter(Boolean);
            setRecentTracks(tracks);
          }
        }
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu trang chủ:', error);
      } finally {
        setIsLoading(false); // Gọi xong (dù thành công hay lỗi) thì tắt vòng xoay
      }
    };

    fetchHomeData();

    // Lắng nghe sự kiện để tự động load lại danh sách bài hát sau khi upload thành công
    const handleMediaUploaded = () => {
      fetchHomeData();
    };
    window.addEventListener('mediaUploaded', handleMediaUploaded);

    return () => {
      window.removeEventListener('mediaUploaded', handleMediaUploaded);
    };
  }, [isAuthenticated]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  const handleTrackClick = (track: any, queueTracks: any[]) => {
    // Kiểm tra nếu là MV (MediaType = 1) hoặc đường dẫn kết thúc bằng .mp4
    const isVideo = track.mediaType === 1 || track.filePath?.endsWith('.mp4');

    if (isVideo) {
      navigate(`/video/${track.id}`);
    } else {
      const trackForPlayer = {
        id: track.id,
        title: track.title,
        artist: track.artist,
        filePath: track.filePath,
        duration: track.duration,
        coverUrl: track.coverUrl,
      };

      const queueForPlayer = queueTracks.map(t => ({
        id: t.id,
        title: t.title,
        artist: t.artist,
        filePath: t.filePath,
        duration: t.duration,
        coverUrl: t.coverUrl,
      }));

      if (currentTrack?.id === track.id) {
        togglePlay();
      } else {
        playTrack(trackForPlayer, queueForPlayer);
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
            {getGreeting()}{isAuthenticated && user ? `, ${user.fullName}!` : '!'}
          </h2>
          <p className="text-sm text-zinc-400 max-w-md">
            Hôm nay bạn muốn nghe thể loại nhạc gì? Hãy click vào bài hát bất kỳ bên dưới để trải nghiệm âm thanh thực tế nhé.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-radial from-green-500/10 to-transparent blur-3xl" />
      </div>

      {/* CHIPS BỘ LỌC (1) */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-5 py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
            activeFilter === 'all'
              ? 'bg-white text-black shadow-md'
              : 'bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border border-zinc-800/60'
          }`}
        >
          Tất cả
        </button>
        <button
          onClick={() => setActiveFilter('music')}
          className={`px-5 py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
            activeFilter === 'music'
              ? 'bg-white text-black shadow-md'
              : 'bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border border-zinc-800/60'
          }`}
        >
          Nhạc
        </button>
        <button
          onClick={() => setActiveFilter('video')}
          className={`px-5 py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
            activeFilter === 'video'
              ? 'bg-white text-black shadow-md'
              : 'bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border border-zinc-800/60'
          }`}
        >
          Video
        </button>
      </div>

      {/* SECTION 1: Playlists của user dạng lưới thẻ ngang 4x2 (2) */}
      {isAuthenticated && (activeFilter === 'all' || activeFilter === 'music') && playlists.length > 0 && (
        <section className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {playlists.map((playlist) => (
              <div
                key={playlist.id}
                onClick={() => navigate(`/playlist/${playlist.id}`)}
                className="flex items-center gap-3 rounded-lg bg-[#2b2b2b]/40 hover:bg-[#2b2b2b]/95 border border-zinc-800/20 transition-all duration-300 cursor-pointer group relative overflow-hidden h-14 shadow-sm"
              >
                {/* Thumbnail bên trái */}
                <div className="h-full aspect-square bg-gradient-to-br from-green-500/10 to-zinc-950 flex items-center justify-center shrink-0 overflow-hidden">
                  {playlist.coverUrl ? (
                    <img 
                      src={mediaService.getImageUrl(playlist.coverUrl)} 
                      alt={playlist.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                    />
                  ) : (
                    <ListMusic className="w-5 h-5 text-zinc-500 group-hover:text-green-400 transition-colors" />
                  )}
                </div>
                {/* Thông tin ở giữa */}
                <div className="flex-1 min-w-0 pr-12">
                  <h4 className="font-bold text-xs text-slate-200 truncate group-hover:text-white transition-colors">
                    {playlist.title}
                  </h4>
                </div>
                {/* Nút Play tròn màu xanh nổi lên khi hover */}
                <div className="absolute right-3 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-black opacity-0 group-hover:opacity-100 transition-all duration-200 shadow hover:scale-105 shrink-0">
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SECTION 2: Gợi ý bài hát hôm nay dưới dạng ô vuông to (3) */}
      {(activeFilter === 'all' || activeFilter === 'music') && (
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold tracking-tight">Gợi ý bài hát hôm nay (Dữ liệu thật)</h3>
          </div>

          {audioTracks.length === 0 ? (
            <p className="text-zinc-500 text-sm">Chưa có bài hát nào trên hệ thống.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {audioTracks.map((track, index) => {
                const isCurrent = currentTrack?.id === track.id;
                return (
                  <div
                    key={track.id || index}
                    onClick={() => handleTrackClick(track, audioTracks)}
                    className={`group relative bg-zinc-900/40 hover:bg-zinc-800/40 border border-zinc-800/30 hover:border-zinc-700/50 rounded-xl p-4 transition-all duration-300 cursor-pointer flex flex-col space-y-3 ${
                      isCurrent ? 'bg-zinc-850/50 border-green-500/20 shadow-md' : ''
                    }`}
                  >
                    {/* Bìa vuông lớn */}
                    <div className="aspect-square w-full rounded-lg overflow-hidden bg-zinc-950 relative border border-zinc-800/50 group-hover:border-zinc-700/80 transition-colors shadow-inner">
                      {track.coverUrl ? (
                        <img 
                          src={mediaService.getImageUrl(track.coverUrl)} 
                          alt="Cover" 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                          <Music className="w-8 h-8 text-zinc-650" />
                        </div>
                      )}
                      {/* Nút play nổi khi hover */}
                      <div className={`absolute inset-0 bg-black/40 flex flex-col justify-between p-2 transition-opacity duration-300 ${
                        isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}>
                        {/* Góc trên phải: Menu Dropdown */}
                        <div className="flex justify-end">
                          <TrackDropdownMenu 
                            onAddToPlaylist={() => setSelectedMediaId(track.id)}
                            onShare={() => setSharingTrack(track)}
                          />
                        </div>
                        {/* Góc dưới phải: Nút Play */}
                        <div className="flex justify-end">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTrackClick(track, audioTracks);
                            }}
                            className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-black shadow-lg hover:scale-105 active:scale-95 transition-all transform translate-y-2 group-hover:translate-y-0 duration-300 cursor-pointer"
                          >
                            {isCurrent && isPlaying ? (
                              <Pause className="w-5 h-5 fill-current" />
                            ) : (
                              <Play className="w-5 h-5 fill-current ml-0.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                    {/* Thông tin bài hát */}
                    <div className="min-w-0">
                      <h4 className={`font-bold text-sm truncate transition-colors ${
                        isCurrent ? 'text-green-400' : 'text-slate-200 group-hover:text-green-400'
                      }`} title={track.title}>
                        {track.title}
                      </h4>
                      <p className="text-xs text-zinc-400 truncate mt-1">{track.artist}</p>
                      <span className="text-[10px] text-zinc-500 font-semibold block mt-1.5">{formatViewCount(track.viewCount)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* SECTION MV: MV ca nhạc gợi ý */}
      {(activeFilter === 'all' || activeFilter === 'video') && videoTracks.length > 0 && (
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-green-400" />
              MV ca nhạc gợi ý (Dữ liệu thật)
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {videoTracks.map((track) => {
              return (
                <div
                  key={track.id}
                  onClick={() => navigate(`/video/${track.id}`)}
                  className="group relative bg-zinc-900/40 hover:bg-zinc-800/40 border border-zinc-800/30 hover:border-zinc-700/50 rounded-xl p-4 transition-all duration-300 cursor-pointer flex flex-col space-y-3"
                >
                  <div className="aspect-video w-full rounded-lg overflow-hidden bg-zinc-950 relative border border-zinc-800/50 group-hover:border-zinc-700/80 transition-colors">
                    {track.coverUrl ? (
                      <img src={mediaService.getImageUrl(track.coverUrl)} alt={track.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                        <Music className="w-8 h-8 text-zinc-600" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-black transform scale-90 group-hover:scale-100 transition-transform duration-300 hover:scale-110 shadow-lg">
                        <Play className="w-6 h-6 fill-current ml-0.5" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-200 line-clamp-1 group-hover:text-green-400 transition-colors">
                      {track.title}
                    </h4>
                    <p className="text-xs text-zinc-400 mt-1">{track.artist} • {formatViewCount(track.viewCount)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* SECTION 3: Hiển thị Lịch sử bài hát THẬT */}
      {isAuthenticated && (activeFilter === 'all' || activeFilter === 'music') && (
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold tracking-tight">Nghe nhiều gần đây (Dữ liệu thật)</h3>
            <button className="text-xs text-green-400 hover:underline font-bold">Xem tất cả</button>
          </div>

          {recentTracks.length === 0 ? (
            <p className="text-zinc-500 text-sm">Bạn chưa nghe bài nào trên hệ thống này.</p>
          ) : (
            <div className="bg-zinc-900/20 rounded-xl border border-zinc-900 overflow-y-auto max-h-[400px] scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent divide-y divide-zinc-900/50">
              {recentTracks.map((track, index) => {
                const isCurrent = currentTrack?.id === track.id;
                return (
                  <div
                    key={track.id || index}
                    onClick={() => handleTrackClick(track, recentTracks)}
                    className={`flex items-center justify-between px-6 py-4 hover:bg-zinc-900/50 transition-colors group cursor-pointer ${isCurrent ? 'bg-zinc-900/30' : ''}`}
                  >
                    {/* CỘT 1 */}
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <span className={`text-sm font-bold w-4 text-right shrink-0 ${isCurrent ? 'text-green-400' : 'text-zinc-500'}`}>
                        {isCurrent && isPlaying ? '•' : index + 1}
                      </span>
                      <div className="w-12 h-12 bg-zinc-900 rounded-lg flex items-center justify-center border border-zinc-800/80 overflow-hidden relative shrink-0 shadow-inner group-hover:shadow-green-500/10 transition-shadow">
                        {track.coverUrl ? (
                          <img src={mediaService.getImageUrl(track.coverUrl)} alt="Cover" className="w-full h-full object-cover animate-fadeIn" />
                        ) : (
                          <Music className="w-5 h-5 text-zinc-550" />
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
                        <p className="text-xs text-zinc-400 truncate mt-0.5">{track.artist || 'Không có tên ca sĩ'}</p>
                      </div>
                    </div>

                    {/* CỘT 2 */}
                    <div className="w-48 text-right shrink-0 text-xs text-zinc-400 hidden md:block">
                      <span className="font-medium">{formatViewCount(track.viewCount)}</span>
                    </div>

                    {/* CỘT 3 */}
                    <div className="w-36 flex items-center justify-end gap-4 shrink-0 text-xs text-zinc-400">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(track.id);
                        }}
                        className={`transition-all hover:scale-110 ${isFavorite(track.id) ? 'opacity-100 text-green-400' : 'opacity-0 group-hover:opacity-100 hover:text-green-400'}`}
                      >
                        <Heart className={`w-4.5 h-4.5 ${isFavorite(track.id) ? 'fill-current' : ''}`} />
                      </button>
                      <span className={`font-semibold tracking-wider ${isCurrent ? 'text-green-400' : ''}`}>
                        {track.duration}
                      </span>
                      <TrackDropdownMenu 
                        onAddToPlaylist={() => setSelectedMediaId(track.id)}
                        onShare={() => setSharingTrack(track)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Modal Add to Playlist */}
      {selectedMediaId && (
        <AddToPlaylistModal
          isOpen={true}
          onClose={() => setSelectedMediaId(null)}
          mediaItemId={selectedMediaId}
        />
      )}

      {/* Modal Share */}
      {sharingTrack && (
        <ShareModal 
          isOpen={!!sharingTrack}
          onClose={() => setSharingTrack(null)}
          mediaItemId={sharingTrack.id}
          title={`Bài hát: ${sharingTrack.title}`}
        />
      )}
    </div>
  );
};

export default Home;
