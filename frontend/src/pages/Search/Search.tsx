import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '../../contexts/PlayerContext';
import { mediaService } from '../../services';
import { 
  Search as SearchIcon, 
  Compass, 
  Loader2, 
  Play, 
  Pause, 
  Music, 
  Film, 
  User, 
  Sparkles 
} from 'lucide-react';

const categories = [
  { title: 'Nhạc Pop', color: 'from-pink-500 to-rose-600', query: 'Pop' },
  { title: 'Indie Việt', color: 'from-emerald-500 to-teal-600', query: 'Indie' },
  { title: 'Gaming', color: 'from-blue-600 to-indigo-700', query: 'Gaming' },
  { title: 'Chill', color: 'from-purple-500 to-indigo-600', query: 'Chill' },
  { title: 'Lofi Cafe', color: 'from-amber-500 to-orange-600', query: 'Lofi' },
  { title: 'Tập trung', color: 'from-cyan-500 to-blue-600', query: 'Focus' },
  { title: 'K-Pop', color: 'from-fuchsia-500 to-pink-600', query: 'K-Pop' },
  { title: 'Podcast', color: 'from-violet-600 to-purple-800', query: 'Podcast' },
];

export const Search = () => {
  const navigate = useNavigate();
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayer();

  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Debounce API call
  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const delayDebounce = setTimeout(async () => {
      try {
        const res = await mediaService.searchAll(searchQuery, 30);
        if (res.success && res.data && res.data.items) {
          setResults(res.data.items);
        } else {
          setResults([]);
        }
      } catch (error) {
        console.error('Lỗi tìm kiếm:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Phân loại kết quả tìm được
  const audioSongs = results.filter(item => item.type === 'Song' && item.mediaType === 0);
  const videoMVs = results.filter(item => item.type === 'Song' && item.mediaType === 1);
  const artists = results.filter(item => item.type === 'Artist');

  // Xử lý phát nhạc audio
  const handlePlaySong = (song: any) => {
    // Chuyển đổi DTO search sang format bài hát mà PlayerContext cần
    const trackForPlayer = {
      id: song.id,
      title: song.name,
      artist: song.artistName || 'Nghệ sĩ tự do',
      filePath: mediaService.getStreamUrl(song.id),
      coverUrl: song.coverUrl || undefined,
      album: song.artistName || undefined,
      duration: 'Phát nhạc',
    };

    // Tạo danh sách hàng đợi phát từ các bài hát tìm thấy
    const queueTracks = audioSongs.map(item => ({
      id: item.id,
      title: item.name,
      artist: item.artistName || 'Nghệ sĩ tự do',
      filePath: mediaService.getStreamUrl(item.id),
      coverUrl: item.coverUrl || undefined,
      album: item.artistName || undefined,
      duration: 'Phát nhạc',
    }));

    if (currentTrack?.id === song.id) {
      togglePlay();
    } else {
      playTrack(trackForPlayer, queueTracks);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Ô tìm kiếm xịn mịn */}
      <div className="max-w-xl relative">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Bạn muốn nghe gì?" 
          className="w-full pl-12 pr-12 py-3 bg-zinc-900 border border-zinc-800/80 rounded-full text-sm placeholder-zinc-500 text-slate-100 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all shadow-inner"
        />
        {isLoading && (
          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500 animate-spin w-5 h-5" />
        )}
      </div>

      {/* 2. HIỂN THỊ KẾT QUẢ TÌM KIẾM */}
      {searchQuery.trim() !== '' ? (
        <div className="space-y-10">
          
          {/* Lớp phủ loading mờ khi đang gọi API */}
          {isLoading && results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
              <p className="text-sm text-zinc-400">Đang tìm kiếm kết quả tốt nhất...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-20 space-y-2">
              <p className="text-lg font-bold text-zinc-300">Không tìm thấy kết quả cho "{searchQuery}"</p>
              <p className="text-sm text-zinc-500">Hãy chắc chắn rằng các từ khóa được viết chính xác, hoặc thử tìm kiếm bằng từ khóa khác.</p>
            </div>
          ) : (
            <>
              {/* PHẦN 2.1: BÀI HÁT (AUDIO) */}
              {audioSongs.length > 0 && (
                <section className="space-y-4">
                  <div className="flex items-center gap-2 text-zinc-200 font-bold">
                    <Music className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-xl tracking-tight">Bài hát gợi ý</h3>
                  </div>

                  <div className="bg-zinc-900/40 border border-zinc-800/40 rounded-xl divide-y divide-zinc-800/30 overflow-hidden">
                    {audioSongs.map((song) => {
                      const isThisPlaying = currentTrack?.id === song.id && isPlaying;
                      return (
                        <div 
                          key={song.id}
                          className="flex items-center justify-between p-3.5 hover:bg-zinc-850/50 transition-all duration-200 group cursor-pointer"
                          onClick={() => handlePlaySong(song)}
                        >
                          <div className="flex items-center gap-4 min-w-0 flex-1">
                            {/* Bọc ảnh bìa + nút play */}
                            <div className="relative w-11 h-11 rounded-md overflow-hidden bg-zinc-800 shrink-0 shadow">
                              {song.coverUrl ? (
                                <img 
                                  src={song.coverUrl} 
                                  alt={song.name} 
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                                  <Music className="w-5 h-5 text-zinc-600" />
                                </div>
                              )}
                              
                              {/* Hover Overlay Play/Pause button */}
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                {isThisPlaying ? (
                                  <Pause className="w-5 h-5 text-green-400 fill-green-400" />
                                ) : (
                                  <Play className="w-5 h-5 text-white fill-white" />
                                )}
                              </div>
                            </div>

                            {/* Tên & ca sĩ */}
                            <div className="min-w-0">
                              <p className={`font-bold text-sm truncate ${isThisPlaying ? 'text-green-400' : 'text-slate-100'}`}>
                                {song.name}
                              </p>
                              <p className="text-xs text-zinc-400 truncate mt-0.5">
                                {song.artistName || 'Nghệ sĩ tự do'}
                              </p>
                            </div>
                          </div>

                          {/* Action badge */}
                          <div className="flex items-center gap-3 pr-2 shrink-0">
                            {isThisPlaying && (
                              <span className="text-[10px] bg-green-500/10 border border-green-500/20 text-green-400 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                                Đang phát
                              </span>
                            )}
                            <button className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-green-500 hover:scale-105 flex items-center justify-center text-zinc-400 hover:text-black transition-all">
                              {isThisPlaying ? (
                                <Pause className="w-4 h-4 fill-current" />
                              ) : (
                                <Play className="w-4 h-4 fill-current ml-0.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* PHẦN 2.2: MV CA NHẠC (VIDEO) */}
              {videoMVs.length > 0 && (
                <section className="space-y-4">
                  <div className="flex items-center gap-2 text-zinc-200 font-bold">
                    <Film className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-xl tracking-tight">MV ca nhạc gợi ý</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {videoMVs.map((mv) => (
                      <div 
                        key={mv.id}
                        onClick={() => navigate(`/video/${mv.id}`)}
                        className="group bg-zinc-900 border border-zinc-800/60 rounded-xl overflow-hidden cursor-pointer hover:border-zinc-700 transition-all duration-300 shadow-md"
                      >
                        {/* Thumbnail 16:9 với overlay hoành tráng */}
                        <div className="aspect-video w-full bg-zinc-800 relative overflow-hidden">
                          {mv.coverUrl ? (
                            <img 
                              src={mv.coverUrl} 
                              alt={mv.name} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
                              <Film className="w-10 h-10 text-zinc-600" />
                            </div>
                          )}

                          {/* Hover Play Icon Overlay */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300">
                            <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform text-black font-bold">
                              <Play className="w-6 h-6 fill-current ml-0.5" />
                            </div>
                          </div>
                        </div>

                        {/* Title và ca sĩ */}
                        <div className="p-4">
                          <h4 className="font-extrabold text-sm text-slate-100 line-clamp-1 group-hover:text-green-400 transition-colors">
                            {mv.name}
                          </h4>
                          <p className="text-xs text-zinc-400 mt-1 truncate">
                            Nghệ sĩ: {mv.artistName || 'Nghệ sĩ tự do'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* PHẦN 2.3: NGHỆ SĨ (ARTIST) */}
              {artists.length > 0 && (
                <section className="space-y-4">
                  <div className="flex items-center gap-2 text-zinc-200 font-bold">
                    <User className="w-5 h-5 text-purple-400" />
                    <h3 className="text-xl tracking-tight">Nghệ sĩ</h3>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                    {artists.map((artist) => (
                      <div 
                        key={artist.id}
                        className="flex flex-col items-center p-3 bg-zinc-900/35 hover:bg-zinc-850/40 border border-transparent hover:border-zinc-800/50 rounded-xl transition-all duration-200 cursor-pointer text-center group"
                      >
                        {/* Avatar hình tròn */}
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-zinc-850 shadow-md mb-3 relative group-hover:shadow-purple-500/10 transition-shadow">
                          {artist.coverUrl ? (
                            <img 
                              src={artist.coverUrl} 
                              alt={artist.name} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-500">
                              <User className="w-8 h-8" />
                            </div>
                          )}
                        </div>

                        <span className="font-bold text-xs text-zinc-300 group-hover:text-white line-clamp-1">
                          {artist.name}
                        </span>
                        <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">Nghệ sĩ</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}

        </div>
      ) : (
        /* 3. TRẠNG THÁI TRỐNG: HIỂN THỊ CÁC THỂ LOẠI DUYỆT TÌM */
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-zinc-300 font-bold">
            <Compass className="w-5 h-5 text-green-400" />
            <h3 className="text-xl tracking-tight">Duyệt tìm tất cả danh mục</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((category, index) => (
              <div 
                key={index}
                onClick={() => setSearchQuery(category.query)}
                className={`h-40 rounded-xl bg-gradient-to-br ${category.color} p-5 relative overflow-hidden cursor-pointer hover:scale-[1.02] active:scale-[0.99] transition-all duration-200 shadow-md group`}
              >
                <h4 className="font-extrabold text-lg sm:text-xl text-white leading-tight break-words">
                  {category.title}
                </h4>
                
                {/* Trang trí hình đĩa nhạc chéo đặc trưng */}
                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full rotate-12 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-45" />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Search;
