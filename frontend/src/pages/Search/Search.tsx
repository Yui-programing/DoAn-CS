import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  Sparkles,
  ListMusic,
  Heart
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { TrackDropdownMenu } from '../../components/TrackDropdownMenu';
import { AddToPlaylistModal } from '../../components/AddToPlaylistModal';
import { formatDuration, formatViewCount } from '../../utils';
import { useFavorite } from '../../contexts/FavoriteContext';

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
  const location = useLocation();
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayer();

  const queryParam = new URLSearchParams(location.search).get('q') || '';
  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [results, setResults] = useState<any[]>([]);
  const [trendingTracks, setTrendingTracks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'All' | 'Artist' | 'Song' | 'Video' | 'Profile'>('All');

  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorite();

  // Đồng bộ searchQuery khi URL query thay đổi
  useEffect(() => {
    setSearchQuery(queryParam);
  }, [queryParam]);

  // Lấy danh sách nhạc Trending khi mở trang lần đầu
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await mediaService.searchSongs('%', 5);
        if (res.success && res.data && res.data.items) {
          setTrendingTracks(res.data.items);
        }
      } catch (error) {
        console.error('Lỗi tải nhạc trending:', error);
      }
    };
    fetchTrending();
  }, []);

  // Gọi API tìm kiếm chi tiết khi URL query thay đổi (khi nhấn Enter hoặc chọn từ khoá gợi ý)
  useEffect(() => {
    if (!queryParam.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    const fetchSearchResults = async () => {
      setIsLoading(true);
      try {
        const res = await mediaService.searchAll(queryParam, 30);
        if (res.success && res.data && res.data.items) {
          setResults(res.data.items);
        } else {
          setResults([]);
        }
      } catch (error) {
        console.error('Lỗi tìm kiếm chi tiết:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSearchResults();
  }, [queryParam]);

  // Phân loại kết quả tìm được
  const audioSongs = results.filter(item => item.type === 'Song' && item.mediaType === 0);
  const videoMVs = results.filter(item => item.type === 'Song' && item.mediaType === 1);
  const artists = results.filter(item => item.type === 'Artist');
  const playlists = results.filter(item => item.type === 'Playlist');
  const profiles = results.filter(item => item.type === 'User');

  const tabs: { id: 'All' | 'Artist' | 'Song' | 'Video' | 'Profile', label: string }[] = [
    { id: 'All', label: 'Tất cả' },
    { id: 'Song', label: 'Bài hát' },
    { id: 'Artist', label: 'Nghệ sĩ' },
    { id: 'Profile', label: 'Hồ sơ' },
    { id: 'Video', label: 'Video' },
  ];

  // Xử lý phát nhạc audio tìm kiếm
  const handlePlaySong = (song: any, tracksPool: any[]) => {
    const trackForPlayer = {
      id: song.id,
      title: song.name || song.title,
      artist: song.artistName || 'Nghệ sĩ tự do',
      filePath: mediaService.getStreamUrl(song.id),
      coverUrl: song.coverUrl || undefined,
      album: song.artistName || undefined,
      duration: formatDuration(song.durationInSeconds),
    };

    const queueTracks = tracksPool.map(item => ({
      id: item.id,
      title: item.name || item.title,
      artist: item.artistName || 'Nghệ sĩ tự do',
      filePath: mediaService.getStreamUrl(item.id),
      coverUrl: item.coverUrl || undefined,
      album: item.artistName || undefined,
      duration: formatDuration(item.durationInSeconds),
    }));

    if (currentTrack?.id === song.id) {
      togglePlay();
    } else {
      playTrack(trackForPlayer, queueTracks);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 2. HIỂN THỊ KẾT QUẢ TÌM KIẾM */}
      {searchQuery.trim() !== '' ? (
        <div className="space-y-10">

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
              {/* Tabs Lọc */}
              <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${activeTab === tab.id ? 'bg-white text-black' : 'bg-zinc-800 text-white hover:bg-zinc-700'
                      }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* PHẦN 2.1: BÀI HÁT (AUDIO) */}
              {(activeTab === 'All' || activeTab === 'Song') && audioSongs.length > 0 && (
                <section className="space-y-4">
                  <div className="flex items-center gap-2 text-zinc-200 font-bold">
                    <Music className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-xl tracking-tight">Bài hát gợi ý</h3>
                  </div>

                  <div className="bg-zinc-900/40 border border-zinc-800/40 rounded-xl divide-y divide-zinc-800/30 overflow-hidden">
                    {audioSongs.map((song, index) => {
                      const isThisPlaying = currentTrack?.id === song.id && isPlaying;
                      return (
                        <div
                          key={song.id}
                          className="flex items-center justify-between p-3.5 hover:bg-zinc-850/50 transition-all duration-200 group cursor-pointer"
                          onClick={() => handlePlaySong(song, audioSongs)}
                        >
                          {/* Cột 1: Thông tin bài nhạc */}
                          <div className="flex items-center gap-4 min-w-0 flex-1">
                            <span className={`text-xs font-bold w-4 text-right shrink-0 ${isThisPlaying ? 'text-green-400' : 'text-zinc-500'}`}>
                              {index + 1}
                            </span>
                            <div className="relative w-11 h-11 rounded-md overflow-hidden bg-zinc-800 shrink-0 shadow">
                              {song.coverUrl ? (
                                <img
                                  src={mediaService.getImageUrl(song.coverUrl)}
                                  alt={song.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                                  <Music className="w-5 h-5 text-zinc-600" />
                                </div>
                              )}

                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                {isThisPlaying ? (
                                  <Pause className="w-5 h-5 text-green-400 fill-green-400" />
                                ) : (
                                  <Play className="w-5 h-5 text-white fill-white" />
                                )}
                              </div>
                            </div>

                            <div className="min-w-0">
                              <p className={`font-bold text-sm truncate ${isThisPlaying ? 'text-green-400' : 'text-slate-100'}`}>
                                {song.name}
                              </p>
                              <p className="text-xs text-zinc-400 truncate mt-0.5">
                                {song.artistName || 'Nghệ sĩ tự do'}
                              </p>
                            </div>
                          </div>

                          {/* Cột 2: Số lượt nghe */}
                          <div className="w-48 text-right shrink-0 text-xs text-zinc-400 hidden md:block">
                            <span className="font-medium">{formatViewCount(song.viewCount)}</span>
                          </div>

                          {/* Cột 3: Thời lượng & Action */}
                          <div className="w-36 flex items-center justify-end gap-4 shrink-0 text-xs text-zinc-400">
                            {isThisPlaying && (
                              <span className="text-[9px] bg-green-500/10 border border-green-500/20 text-green-400 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse hidden lg:inline-block">
                                Đang phát
                              </span>
                            )}
                            {user && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavorite(song.id);
                                }}
                                className={`transition-all hover:scale-110 ${isFavorite(song.id) ? 'opacity-100 text-green-400' : 'opacity-0 group-hover:opacity-100 hover:text-green-400 text-zinc-400'}`}
                              >
                                <Heart className={`w-4 h-4 ${isFavorite(song.id) ? 'fill-current text-green-400' : ''}`} />
                              </button>
                            )}
                            <span className={`font-semibold tracking-wider ${isThisPlaying ? 'text-green-400' : ''}`}>
                              {formatDuration(song.durationInSeconds)}
                            </span>
                            {user && (
                              <TrackDropdownMenu
                                onAddToPlaylist={() => setSelectedMediaId(song.id)}
                                onShare={() => console.log('Share')}
                              />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* PHẦN 2.2: PLAYLISTS */}
              {activeTab === 'All' && playlists.length > 0 && (
                <section className="space-y-4">
                  <div className="flex items-center gap-2 text-zinc-200 font-bold">
                    <ListMusic className="w-5 h-5 text-yellow-400" />
                    <h3 className="text-xl tracking-tight">Danh sách phát (Playlists)</h3>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    {playlists.map((pl) => (
                      <div
                        key={pl.id}
                        onClick={() => navigate(`/playlist/${pl.id}`)}
                        className="p-4 rounded-xl bg-zinc-900/50 hover:bg-zinc-850 border border-zinc-800/40 hover:border-zinc-700/60 transition-all duration-300 cursor-pointer group relative flex flex-col gap-3"
                      >
                        <div className="aspect-square w-full rounded-lg bg-zinc-800 overflow-hidden relative shadow">
                          {pl.coverUrl ? (
                            <img
                              src={mediaService.getImageUrl(pl.coverUrl)}
                              alt={pl.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-yellow-500/10 to-zinc-800 flex items-center justify-center text-yellow-500/80">
                              <ListMusic className="w-10 h-10" />
                            </div>
                          )}
                          <div className="absolute right-2 bottom-2 w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-black opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-lg">
                            <Play className="w-5 h-5 fill-current ml-0.5" />
                          </div>
                        </div>

                        <div>
                          <h4 className="font-extrabold text-sm text-slate-100 truncate group-hover:text-green-400 transition-colors">
                            {pl.name}
                          </h4>
                          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-1 block">Playlist</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* PHẦN 2.3: MV CA NHẠC (VIDEO) */}
              {(activeTab === 'All' || activeTab === 'Video') && videoMVs.length > 0 && (
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
                        <div className="aspect-video w-full bg-zinc-800 relative overflow-hidden">
                          {mv.coverUrl ? (
                            <img
                              src={mediaService.getImageUrl(mv.coverUrl)}
                              alt={mv.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
                              <Film className="w-10 h-10 text-zinc-600" />
                            </div>
                          )}

                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300">
                            <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform text-black font-bold">
                              <Play className="w-6 h-6 fill-current ml-0.5" />
                            </div>
                          </div>
                        </div>

                        <div className="p-4">
                          <h4 className="font-extrabold text-sm text-slate-100 line-clamp-1 group-hover:text-green-400 transition-colors">
                            {mv.name}
                          </h4>
                          <p className="text-xs text-zinc-400 mt-1 truncate">
                            Nghệ sĩ: {mv.artistName || 'Nghệ sĩ tự do'} • {formatViewCount(mv.viewCount)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* PHẦN 2.4: NGHỆ SĨ */}
              {(activeTab === 'All' || activeTab === 'Artist') && artists.length > 0 && (
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
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-zinc-850 shadow-md mb-3 relative group-hover:shadow-purple-500/10 transition-shadow">
                          {artist.coverUrl ? (
                            <img
                              src={mediaService.getImageUrl(artist.coverUrl)}
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
              {/* PHẦN 2.5: NGƯỜI DÙNG (PROFILE) */}
              {(activeTab === 'All' || activeTab === 'Profile') && profiles.length > 0 && (
                <section className="space-y-4 mt-8">
                  <div className="flex items-center gap-2 text-zinc-200 font-bold">
                    <User className="w-5 h-5 text-blue-400" />
                    <h3 className="text-xl tracking-tight">Hồ sơ</h3>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                    {profiles.map((profile) => (
                      <div
                        key={profile.id}
                        onClick={() => navigate(`/user/${profile.id}`)}
                        className="flex flex-col items-center p-3 bg-zinc-900/35 hover:bg-zinc-850/40 border border-transparent hover:border-zinc-800/50 rounded-xl transition-all duration-200 cursor-pointer text-center group"
                      >
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-zinc-850 shadow-md mb-3 relative group-hover:shadow-blue-500/10 transition-shadow">
                          {profile.coverUrl ? (
                            <img
                              src={mediaService.getImageUrl(profile.coverUrl)}
                              alt={profile.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || 'U')}&background=3f3f46&color=fff`;
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-500">
                              <User className="w-8 h-8" />
                            </div>
                          )}
                        </div>

                        <span className="font-bold text-xs text-zinc-300 group-hover:text-white line-clamp-1">
                          {profile.name}
                        </span>
                        <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">Hồ sơ</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}

        </div>
      ) : (
        /* 3. TRẠNG THÁI TRỐNG: DUYỆT TÌM & GỢI Ý TRENDING */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* CỘT TRÁI & GIỮA: DANH MỤC DUYỆT TÌM */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2 text-zinc-300 font-bold">
              <Compass className="w-5 h-5 text-green-400" />
              <h3 className="text-xl tracking-tight">Duyệt tìm tất cả danh mục</h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {categories.map((category, index) => (
                <div
                  key={index}
                  onClick={() => setSearchQuery(category.query)}
                  className={`h-36 rounded-xl bg-gradient-to-br ${category.color} p-4 relative overflow-hidden cursor-pointer hover:scale-[1.02] active:scale-[0.99] transition-all duration-200 shadow group`}
                >
                  <h4 className="font-extrabold text-base sm:text-lg text-white leading-tight break-words">
                    {category.title}
                  </h4>
                  <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-white/10 rounded-full rotate-12 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-45" />
                </div>
              ))}
            </div>
          </div>

          {/* CỘT PHẢI: TRENDING NỔI BẬT */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-zinc-350 font-bold">
              <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
              <h3 className="text-xl tracking-tight">Trending nổi bật</h3>
            </div>

            {trendingTracks.length === 0 ? (
              <div className="h-40 border border-zinc-800/40 bg-zinc-900/10 rounded-xl flex items-center justify-center text-xs text-zinc-500">
                Đang tải bảng xếp hạng...
              </div>
            ) : (
              <div className="bg-zinc-900/40 border border-zinc-800/40 rounded-xl divide-y divide-zinc-850 overflow-hidden shadow-sm">
                {trendingTracks.map((song, idx) => {
                  const isThisPlaying = currentTrack?.id === song.id && isPlaying;
                  return (
                    <div
                      key={song.id}
                      onClick={() => handlePlaySong(song, trendingTracks)}
                      className="flex items-center justify-between p-3 hover:bg-zinc-850/40 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span className="w-5 text-center font-extrabold text-sm text-zinc-555 group-hover:text-green-400 shrink-0">
                          {idx + 1}
                        </span>

                        <div className="relative w-9 h-9 rounded bg-zinc-800 overflow-hidden shrink-0">
                          {song.coverUrl ? (
                            <img src={mediaService.getImageUrl(song.coverUrl)} alt={song.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Music className="w-4 h-4 text-zinc-600" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            {isThisPlaying ? (
                              <Pause className="w-4 h-4 text-green-400 fill-green-400" />
                            ) : (
                              <Play className="w-4 h-4 text-white fill-white" />
                            )}
                          </div>
                        </div>

                        <div className="min-w-0">
                          <p className={`font-bold text-xs truncate ${isThisPlaying ? 'text-green-400' : 'text-slate-200'}`}>
                            {song.name || song.title}
                          </p>
                          <p className="text-[10px] text-zinc-500 truncate mt-0.5">
                            {song.artistName || 'Nghệ sĩ tự do'}
                          </p>
                        </div>
                      </div>

                      {/* Cột Lượt nghe ở Trending */}
                      <div className="text-[10px] text-zinc-400 text-right pr-2 shrink-0 font-medium">
                        {formatViewCount(song.viewCount)}
                      </div>

                      {/* Thời lượng & Action ở Trending */}
                      <div className="w-24 flex items-center justify-end gap-3 shrink-0">
                        <span className="text-[10px] text-zinc-500 font-semibold tracking-wider">
                          {formatDuration(song.durationInSeconds)}
                        </span>
                        {user && (
                          <TrackDropdownMenu
                            onAddToPlaylist={() => setSelectedMediaId(song.id)}
                            onShare={() => console.log('Share')}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Add to Playlist */}
      {selectedMediaId && (
        <AddToPlaylistModal
          isOpen={true}
          onClose={() => setSelectedMediaId(null)}
          mediaItemId={selectedMediaId}
        />
      )}
    </div>
  );
};

export default Search;
