import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CheckCircle, Loader2, Music, ShieldAlert, ListMusic } from "lucide-react";
import { userService } from "../../services/userService";
import { mediaService, albumService, followService } from "../../services";
import { playlistService } from "../../services/playlistService";
import type { UserProfile, MediaItem } from "../../types";
import { useAuth } from "../../contexts/AuthContext";
import { usePlayer } from "../../contexts/PlayerContext";
import { formatDuration } from "../../utils";
import { MarqueeText } from "../../components/MarqueeText";
import { ContextMenu } from "../../components/ContextMenu";
import { AddToPlaylistModal } from "../../components/AddToPlaylistModal";
import { ShareModal } from "../../components/ShareModal";

export const UserProfileView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);
  const [isLoadingAlbums, setIsLoadingAlbums] = useState(false);
  const [mvs, setMvs] = useState<any[]>([]);
  const [isLoadingMvs, setIsLoadingMvs] = useState(false);
  const [publicPlaylists, setPublicPlaylists] = useState<any[]>([]);
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(false);
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayer();

  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; track: any } | null>(null);
  const [selectedAddToPlaylistTrackId, setSelectedAddToPlaylistTrackId] = useState<string | null>(null);
  const [sharingTrack, setSharingTrack] = useState<any | null>(null);

  const handleContextMenu = (e: React.MouseEvent, track: any) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      track
    });
  };

  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);

  const handleFollowToggle = async () => {
    if (!id || !currentUser || isFollowLoading) return;
    try {
      setIsFollowLoading(true);
      if (isFollowing) {
        const res = await followService.unfollowArtist(id);
        if (res.success) {
          setIsFollowing(false);
          setFollowerCount((prev) => Math.max(0, prev - 1));
        }
      } else {
        const res = await followService.followArtist(id);
        if (res.success) {
          setIsFollowing(true);
          setFollowerCount((prev) => prev + 1);
        }
      }
    } catch (err) {
      console.error("Lỗi khi thay đổi trạng thái theo dõi:", err);
    } finally {
      setIsFollowLoading(false);
    }
  };

  const playSong = (song: any) => {
    const trackForPlayer = {
      id: song.id,
      title: song.title,
      artist: song.artistName || profile?.fullName || 'Nghệ sĩ',
      coverUrl: song.coverUrl,
      duration: song.durationInSeconds ? formatDuration(song.durationInSeconds) : '0:00',
      durationInSeconds: song.durationInSeconds,
      filePath: mediaService.getStreamUrl(song.id),
      artistId: song.artistId || id
    };

    const queueForPlayer = mediaList.map((s: any) => ({
      id: s.id,
      title: s.title,
      artist: s.artistName || profile?.fullName || 'Nghệ sĩ',
      coverUrl: s.coverUrl,
      duration: s.durationInSeconds ? formatDuration(s.durationInSeconds) : '0:00',
      durationInSeconds: s.durationInSeconds,
      filePath: mediaService.getStreamUrl(s.id),
      artistId: s.artistId || id
    }));

    if (currentTrack?.id === song.id) {
      togglePlay();
    } else {
      playTrack(trackForPlayer, queueForPlayer);
    }
  };

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
          setFollowerCount(res.data.followerCount || 0);

          if (currentUser) {
            try {
              const followRes = await followService.checkFollowStatus(id);
              if (followRes.success) {
                setIsFollowing(followRes.data);
              }
            } catch (err) {
              console.error("Lỗi khi kiểm tra trạng thái follow:", err);
            }
          }

          // Lấy playlist công khai của user này
          try {
            setIsLoadingPlaylists(true);
            const playlistRes = await playlistService.getPublicPlaylistsByUser(id);
            if (playlistRes.success) {
              setPublicPlaylists(playlistRes.data || []);
            }
          } catch (err) {
            console.error("Lỗi khi tải playlist công khai:", err);
          } finally {
            setIsLoadingPlaylists(false);
          }

          if (res.data.role === "Artist") {
            try {
              const songsRes = await mediaService.getArtistMedia(id);
              let officialMedia = songsRes.success ? (songsRes.data || []) : [];
              
              // Gọi API tìm kiếm theo tên đầy đủ của nghệ sĩ để lấy các tác phẩm song ca / liên quan
              let searchMedia: any[] = [];
              try {
                setIsLoadingMvs(true);
                const searchRes = await mediaService.searchSongs(res.data.fullName || '', 50);
                if (searchRes.success && searchRes.data?.items) {
                  searchMedia = searchRes.data.items;
                }
              } catch (searchErr) {
                console.error("Lỗi khi tìm kiếm tác phẩm liên quan:", searchErr);
              } finally {
                setIsLoadingMvs(false);
              }

              // Gộp và loại trùng lặp theo ID
              const uniqueMediaMap = new Map<string, any>();
              
              // Đưa các tác phẩm chính thức vào map trước
              officialMedia.forEach((item: any) => {
                uniqueMediaMap.set(item.id, item);
              });

              // Đưa các tác phẩm tìm kiếm được vào map (map cấu trúc SearchItemDto về MediaItem)
              searchMedia.forEach((item: any) => {
                if (!uniqueMediaMap.has(item.id)) {
                  uniqueMediaMap.set(item.id, {
                    id: item.id,
                    title: item.title || item.name || '',
                    coverUrl: item.coverUrl,
                    durationInSeconds: item.durationInSeconds || 0,
                    mediaType: item.mediaType, // 0: Audio, 1: Video
                    artistName: item.artistName || res.data.fullName,
                    viewCount: item.viewCount || 0
                  });
                }
              });

              const allMediaList = Array.from(uniqueMediaMap.values());

              // Phân loại:
              // - Bài hát (Audio: mediaType === 0)
              // - MV ca nhạc (Video: mediaType === 1)
              const audioList = allMediaList.filter(item => item.mediaType === 0);
              const videoList = allMediaList.filter(item => item.mediaType === 1);

              setMediaList(audioList);
              setMvs(videoList);
            } catch (err) {
              console.error("Lỗi khi tải danh sách tác phẩm nghệ sĩ:", err);
            }

            try {
              setIsLoadingAlbums(true);
              const albumRes = await albumService.getAlbumsByArtist(id);
              if (albumRes.success) {
                setAlbums(albumRes.data || []);
              }
            } catch (err) {
              console.error("Lỗi khi tải danh sách album nghệ sĩ:", err);
            } finally {
              setIsLoadingAlbums(false);
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
                <p className="text-sm md:text-base font-semibold text-zinc-300 drop-shadow-md pt-2">
                  {followerCount.toLocaleString()} người theo dõi
                </p>
                
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
              <p className="text-sm font-semibold text-zinc-400">
                {followerCount.toLocaleString()} người theo dõi
              </p>
            </div>
          </div>
        )}

        {/* --- NỘI DUNG CHÍNH --- */}
        <div className="mt-8 space-y-8 max-w-4xl">
          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            {currentUser && (
              <button
                disabled={isFollowLoading}
                onClick={handleFollowToggle}
                className={`px-8 py-3 font-bold rounded-full hover:scale-105 transition-transform flex items-center gap-2 ${
                  isFollowing
                    ? "bg-zinc-800 text-white border border-zinc-700 hover:bg-zinc-700"
                    : "bg-white text-black hover:bg-zinc-100"
                }`}
              >
                {isFollowLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isFollowing ? "Đang theo dõi" : "Theo dõi"}
              </button>
            )}
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

          {/* === SECTION PLAYLIST CÔNG KHAI === */}
          {(isLoadingPlaylists || publicPlaylists.length > 0) && (
            <div className="mt-4">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <ListMusic className="w-6 h-6 text-green-400" />
                Playlist công khai
              </h2>
              {isLoadingPlaylists ? (
                <div className="flex items-center gap-2 py-8 text-zinc-500">
                  <Loader2 className="w-5 h-5 animate-spin text-green-500" />
                  <span className="text-sm">Đang tải playlist...</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {publicPlaylists.map((playlist) => (
                    <div
                      key={playlist.id}
                      onClick={() => navigate(`/playlist/${playlist.id}`)}
                      className="group relative bg-zinc-900/40 hover:bg-zinc-800/60 border border-zinc-800/30 hover:border-zinc-700/60 rounded-xl p-4 transition-all duration-300 cursor-pointer flex flex-col gap-3"
                    >
                      {/* Ảnh đại diện playlist */}
                      <div className="aspect-square w-full rounded-lg overflow-hidden bg-zinc-800 relative shadow-inner flex items-center justify-center">
                        <ListMusic className="w-10 h-10 text-zinc-600 group-hover:text-green-500 transition-colors" />
                        {/* Nút play khi hover */}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-black shadow-lg">
                            <svg className="w-5 h-5 fill-current ml-0.5" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" fill="currentColor" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      {/* Thông tin playlist */}
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-slate-200 truncate group-hover:text-green-400 transition-colors" title={playlist.title}>
                          {playlist.title}
                        </h4>
                        <p className="text-[11px] text-zinc-500 mt-0.5 font-medium">
                          {playlist.tracksCount ?? 0} bài hát
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Nghệ sĩ Playlist (Phổ biến) */}
          {isArtist && mediaList.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-white mb-6">Phổ biến</h2>
              <div className="space-y-1 bg-zinc-900/20 p-2 rounded-2xl border border-zinc-800/50">
                {mediaList.map((song, index) => (
                  <div 
                    key={song.id} 
                    onClick={() => playSong(song)}
                    onContextMenu={(e) => handleContextMenu(e, { ...song, artist: song.artistName || profile?.fullName })}
                    className="group flex items-center justify-between p-3 hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <span className={`text-zinc-500 text-base font-medium w-6 flex items-center justify-center transition-colors ${currentTrack?.id === song.id ? 'text-green-500 font-bold' : ''}`}>
                        {currentTrack?.id === song.id && isPlaying ? (
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                        ) : (
                          index + 1
                        )}
                      </span>
                      <img 
                        src={mediaService.getImageUrl(song.coverUrl)} 
                        alt="Cover" 
                        className="w-12 h-12 rounded object-cover shadow-md" 
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className={`text-sm font-semibold transition-colors ${currentTrack?.id === song.id ? 'text-green-500' : 'text-white'}`} title={song.title}>
                          <MarqueeText text={song.title} />
                        </h4>
                      </div>
                    </div>
                    <span className="text-zinc-400 text-xs font-medium">{song.viewCount?.toLocaleString() || '0'} lượt nghe</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MV của Nghệ sĩ */}
          {isArtist && (mvs.length > 0 || isLoadingMvs) && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-white mb-6">MV ca nhạc</h2>
              {isLoadingMvs ? (
                <div className="flex items-center justify-center py-12 text-zinc-500 gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-green-500" />
                  <p className="text-xs font-medium">Đang tải danh sách MV...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {mvs.map((mv) => (
                    <div
                      key={mv.id}
                      onClick={() => navigate(`/video/${mv.id}`)}
                      onContextMenu={(e) => handleContextMenu(e, { ...mv, artist: mv.artistName || profile?.fullName })}
                      className="group relative bg-zinc-900/40 hover:bg-zinc-800/40 border border-zinc-800/30 hover:border-zinc-700/50 rounded-2xl p-4 transition-all duration-300 cursor-pointer flex flex-col space-y-3"
                    >
                      {/* Bìa MV */}
                      <div className="aspect-video w-full rounded-xl overflow-hidden bg-zinc-950 relative border border-zinc-800/50 group-hover:border-zinc-700/80 transition-colors shadow-inner">
                        {mv.coverUrl ? (
                          <img
                            src={mediaService.getImageUrl(mv.coverUrl)}
                            alt={mv.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                            <Music className="w-8 h-8 text-zinc-650" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-black transform scale-90 group-hover:scale-100 transition-transform duration-300 hover:scale-110 shadow-lg">
                            <svg className="w-6 h-6 fill-current ml-0.5" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" fill="currentColor" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      {/* Thông tin MV */}
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-slate-200 group-hover:text-green-400 transition-colors" title={mv.title}>
                          <MarqueeText text={mv.title} />
                        </h4>
                        <p className="text-[10px] text-zinc-500 mt-1 font-medium">
                          {mv.viewCount?.toLocaleString() || '0'} lượt nghe
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Album của Nghệ sĩ */}
          {isArtist && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-white mb-6">Album</h2>
              {isLoadingAlbums ? (
                <div className="flex items-center justify-center py-12 text-zinc-500 gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-green-500" />
                  <p className="text-xs font-medium">Đang tải danh sách album...</p>
                </div>
              ) : albums.length === 0 ? (
                <div className="text-left py-6 text-zinc-500">
                  <p className="text-sm font-medium">Nghệ sĩ chưa phát hành album nào.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {albums.map((album) => (
                    <div
                      key={album.id}
                      onClick={() => navigate(`/album/${album.id}`)}
                      className="group relative bg-zinc-900/40 hover:bg-zinc-800/40 border border-zinc-800/30 hover:border-zinc-700/50 rounded-2xl p-4 transition-all duration-300 cursor-pointer flex flex-col space-y-3"
                    >
                      {/* Bìa Album */}
                      <div className="aspect-square w-full rounded-xl overflow-hidden bg-zinc-950 relative border border-zinc-800/50 group-hover:border-zinc-700/80 transition-colors shadow-inner">
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
                        <p className="text-[10px] text-zinc-500 mt-1 font-medium">
                          {new Date(album.releaseDate).toLocaleDateString("vi-VN")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal Add to Playlist */}
      {selectedAddToPlaylistTrackId && (
        <AddToPlaylistModal
          isOpen={true}
          onClose={() => setSelectedAddToPlaylistTrackId(null)}
          mediaItemId={selectedAddToPlaylistTrackId}
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

      {/* Context Menu chuột phải */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          isPlaylist={contextMenu.track.isPlaylist}
          onAddToPlaylist={() => {
            setSelectedAddToPlaylistTrackId(contextMenu.track.id);
            setContextMenu(null);
          }}
          onShare={() => {
            setSharingTrack(contextMenu.track);
            setContextMenu(null);
          }}
        />
      )}
    </div>
  );
};
