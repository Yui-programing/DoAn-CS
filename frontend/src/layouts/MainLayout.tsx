import { useRef, useEffect, useState } from "react";
import { NavLink, Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { usePlayer } from "../contexts/PlayerContext";
import { useAuth } from "../contexts/AuthContext";
import { mediaService, playlistService } from "../services";
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
  Volume1,
  Volume2,
  VolumeX,
  Heart,
  Repeat,
  Shuffle,
  Music,
  LogOut,
  ShieldCheck,
  Info,
  ChevronLeft,
  ChevronRight,
  Folder,
  Plus,
  Check,
  CheckCircle,
  Share2,
} from "lucide-react";
import { NotificationBell } from "../components/NotificationBell";
import { RightPanel } from "../components/RightPanel";
import { CreatePlaylistModal } from "../components/CreatePlaylistModal";
import { CreateAlbumModal } from "../components/CreateAlbumModal";
import { AddToPlaylistModal } from "../components/AddToPlaylistModal";
import { ShareModal } from "../components/ShareModal";
import { useFavorite } from "../contexts/FavoriteContext";
import { formatTime, formatDuration, parseArtists } from "../utils";
import { MarqueeText } from "../components/MarqueeText";

export const MainLayout = () => {
  const { isAuthenticated, user, logoutState } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorite();
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    playTrack,
    togglePlay,
    nextTrack,
    prevTrack,
    seek,
    setVolume,
    setCurrentTime,
    setDuration,
    setIsPlaying,
    isShuffle,
    setIsShuffle,
    repeatMode,
    setRepeatMode,
  } = usePlayer();

  const navigate = useNavigate();
  const location = useLocation();
  const [searchValue, setSearchValue] = useState("");

  // Trạng thái gợi ý tìm kiếm
  const [showDropdown, setShowDropdown] = useState(false);
  const [keywordSuggestions, setKeywordSuggestions] = useState<any[]>([]);
  const [songSuggestions, setSongSuggestions] = useState<any[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Trạng thái hiển thị menu profile ở góc trên bên phải
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const handleCloseUserMenu = (e: MouseEvent) => {
      if (showUserMenu && !(e.target as Element).closest('.user-profile-menu-container')) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleCloseUserMenu);
    return () => document.removeEventListener('mousedown', handleCloseUserMenu);
  }, [showUserMenu]);

  // Trạng thái thu gọn sidebar bên trái
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem("sidebar_collapsed") === "true";
  });

  const [sidebarPlaylists, setSidebarPlaylists] = useState<any[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [addToPlaylistTrackId, setAddToPlaylistTrackId] = useState<string | null>(null);
  const [playlistModalPlacement, setPlaylistModalPlacement] = useState<'player' | 'right-panel'>('player');
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  const [showCreateAlbum, setShowCreateAlbum] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [isTrackInPlaylist, setIsTrackInPlaylist] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [authTooltipTarget, setAuthTooltipTarget] = useState<'plus' | 'create-btn' | null>(null);
  const [authTooltipCoords, setAuthTooltipCoords] = useState<{ top: number; left: number } | null>(null);

  // Lưu trạng thái thu gọn vào localStorage
  const handleToggleSidebar = (collapsed: boolean) => {
    setIsSidebarCollapsed(collapsed);
    localStorage.setItem("sidebar_collapsed", collapsed ? "true" : "false");
  };

  // Lấy danh sách playlists cho sidebar
  useEffect(() => {
    const fetchSidebarPlaylists = () => {
      if (isAuthenticated) {
        playlistService.getMyPlaylists()
          .then(res => {
            if (res.success && res.data) {
              setSidebarPlaylists(res.data);
            }
          })
          .catch(err => {
            console.error("Lỗi lấy danh sách phát ở sidebar:", err);
          });
      } else {
        setSidebarPlaylists([]);
      }
    };

    fetchSidebarPlaylists();

    const handlePlaylistChanged = () => {
      fetchSidebarPlaylists();
    };

    window.addEventListener('playlistChanged', handlePlaylistChanged);
    return () => {
      window.removeEventListener('playlistChanged', handlePlaylistChanged);
    };
  }, [isAuthenticated]);

  // Kiểm tra bài hát hiện tại có nằm trong bất kỳ playlist nào không
  useEffect(() => {
    const checkTrackContainment = async () => {
      if (!isAuthenticated || !currentTrack) {
        setIsTrackInPlaylist(false);
        return;
      }
      try {
        const playlistsRes = await playlistService.getMyPlaylists();
        if (playlistsRes.success) {
          const list = playlistsRes.data;
          let found = false;
          // Kiểm tra từng playlist xem có chứa bài hát hiện tại không
          for (const playlist of list) {
            const tracksRes = await playlistService.getTracks(playlist.id);
            if (tracksRes.success) {
              const hasTrack = tracksRes.data.some((t: any) => t.mediaItemId === currentTrack.id);
              if (hasTrack) {
                found = true;
                break;
              }
            }
          }
          setIsTrackInPlaylist(found);
        }
      } catch (err) {
        console.error("Lỗi kiểm tra bài hát trong playlist:", err);
      }
    };

    checkTrackContainment();

    const handlePlaylistChanged = () => {
      checkTrackContainment();
    };

    window.addEventListener('playlistChanged', handlePlaylistChanged);
    return () => {
      window.removeEventListener('playlistChanged', handlePlaylistChanged);
    };
  }, [currentTrack?.id, isAuthenticated]);

  // Đồng bộ ô tìm kiếm ở header với URL q param khi ở trang Search
  useEffect(() => {
    if (location.pathname === "/search") {
      const q = new URLSearchParams(location.search).get("q") || "";
      setSearchValue(q);
    } else {
      setSearchValue("");
    }
  }, [location.pathname, location.search]);

  // Lắng nghe phím Space, Enter để Phát/Tạm dừng nhạc bên ngoài và ArrowLeft, ArrowRight để tua nhạc
  useEffect(() => {
    // Ngăn chặn phím tắt nhạc bên ngoài hoạt động khi đang ở trang VideoPlayer để tránh xung đột
    if (location.pathname.startsWith("/video/")) {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput = activeEl && (
        activeEl.tagName === 'INPUT' ||
        activeEl.tagName === 'TEXTAREA' ||
        activeEl.getAttribute('contenteditable') === 'true'
      );
      if (isInput) return;

      const audioElement = audioRef.current || (document.getElementById('global-audio-element') as HTMLAudioElement | null);
      if (!audioElement) return;

      // Space hoặc Enter: Phát/Tạm dừng nhạc (bỏ qua nếu đang focus vào nút bấm vì trình duyệt sẽ tự kích hoạt click)
      if (e.key === ' ' || e.key === 'Spacebar' || e.key === 'Enter') {
        if (activeEl && activeEl.tagName === 'BUTTON') {
          return;
        }
        e.preventDefault(); // Ngăn trình duyệt cuộn trang khi bấm Space
        togglePlay();
      }
      // ArrowLeft: Tua lùi 5 giây
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const cur = audioElement.currentTime;
        const newTime = Math.max(0, cur - 5);
        seek(newTime);
      }
      // ArrowRight: Tua tiến 5 giây
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        const cur = audioElement.currentTime;
        const dur = audioElement.duration;
        // Nếu duration không hợp lệ (NaN, Infinity, 0), cho phép tua tiến trực tiếp
        const maxTime = (dur && isFinite(dur) && dur > 0) ? dur : cur + 1000;
        const newTime = Math.min(maxTime, cur + 5);
        seek(newTime);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [togglePlay, seek, location.pathname]);

  const handleArtistClick = async () => {
    if (!currentTrack) return;
    try {
      const res = await mediaService.getMediaDetails(currentTrack.id);
      if (res.success && res.data?.artistId) {
        navigate(`/user/${res.data.artistId}`);
      }
    } catch (error) {
      console.error("Lỗi khi tải thông tin nghệ sĩ:", error);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchValue(val);
  };



  const handlePlaySong = (song: any, tracksPool: any[]) => {
    const trackForPlayer = {
      id: song.id,
      title: song.name || song.title,
      artist: song.artistName || 'Nghệ sĩ tự do',
      filePath: mediaService.getStreamUrl(song.id),
      coverUrl: song.coverUrl || undefined,
      album: song.artistName || undefined,
      duration: formatDuration(song.durationInSeconds || 180),
    };

    const queueTracks = tracksPool
      .filter(item => item.type === 'Song')
      .map(item => ({
        id: item.id,
        title: item.name || item.title,
        artist: item.artistName || 'Nghệ sĩ tự do',
        filePath: mediaService.getStreamUrl(item.id),
        coverUrl: item.coverUrl || undefined,
        album: item.artistName || undefined,
        duration: formatDuration(item.durationInSeconds || 180),
      }));

    if (currentTrack?.id === song.id) {
      togglePlay();
    } else {
      playTrack(trackForPlayer, queueTracks);
    }
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query) return <span className="text-zinc-300">{text}</span>;
    const index = text.toLowerCase().indexOf(query.toLowerCase());
    if (index === -1) return <span className="text-zinc-300">{text}</span>;
    const before = text.substring(0, index);
    const match = text.substring(index, index + query.length);
    const after = text.substring(index + query.length);
    return (
      <span className="text-zinc-400">
        {before}
        <strong className="text-white font-bold">{match}</strong>
        {after}
      </span>
    );
  };

  // Gọi API lấy dữ liệu gợi ý
  useEffect(() => {
    if (!searchValue.trim()) {
      setKeywordSuggestions([]);
      setSongSuggestions([]);
      setShowDropdown(false);
      setActiveIndex(null);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        // 1. Gọi API search/quick lấy từ khóa
        const quickRes = await mediaService.searchQuick(searchValue);
        if (quickRes.success && quickRes.data) {
          setKeywordSuggestions(quickRes.data.slice(0, 4));
        } else {
          setKeywordSuggestions([]);
        }

        // 2. Gọi API search/full giới hạn lấy danh sách chi tiết (bài hát + nghệ sĩ) hiển thị
        const fullRes = await mediaService.searchAll(searchValue, 6);
        if (fullRes.success && fullRes.data && fullRes.data.items) {
          setSongSuggestions(fullRes.data.items);
        } else {
          setSongSuggestions([]);
        }

        setShowDropdown(true);
      } catch (error) {
        console.error("Lỗi lấy gợi ý tìm kiếm:", error);
      }
    }, 200);

    return () => clearTimeout(delayDebounce);
  }, [searchValue]);

  // Điều hướng dropdown bằng phím
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown) return;

    const totalSuggestions = keywordSuggestions.length;
    const totalSongs = songSuggestions.length;
    const totalItems = totalSuggestions + totalSongs;

    if (totalItems === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex(prev => (prev === null || prev >= totalItems - 1) ? 0 : prev + 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex(prev => (prev === null || prev <= 0) ? totalItems - 1 : prev - 1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex !== null && activeIndex >= 0) {
        if (activeIndex < totalSuggestions) {
          const suggestion = keywordSuggestions[activeIndex];
          const textVal = suggestion.text || suggestion.Text;
          setSearchValue(textVal);
          navigate(`/search?q=${encodeURIComponent(textVal)}`);
          setShowDropdown(false);
        } else {
          const itemIdx = activeIndex - totalSuggestions;
          const item = songSuggestions[itemIdx];
          if (item.type === 'Song') {
            if (item.mediaType === 1) {
              navigate(`/video/${item.id}`);
            } else {
              handlePlaySong(item, songSuggestions);
            }
          } else if (item.type === 'Artist' || item.type === 'User') {
            navigate(`/user/${item.id}`);
          } else if (item.type === 'Album') {
            navigate(`/album/${item.id}`);
          } else if (item.type === 'Playlist') {
            navigate(`/playlist/${item.id}`);
          }
          setShowDropdown(false);
        }
      } else {
        if (searchValue.trim()) {
          navigate(`/search?q=${encodeURIComponent(searchValue.trim())}`);
          setShowDropdown(false);
        }
      }
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Trạng thái hiển thị Right Panel (chi tiết bài hát)
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(() => {
    return localStorage.getItem("right_panel_open") !== "false";
  });

  // Trạng thái kéo thả thanh tiến trình nhạc
  const [isDraggingTime, setIsDraggingTime] = useState(false);
  const [dragTime, setDragTime] = useState(0);

  // Trạng thái kéo thả thanh âm lượng
  const [isDraggingVolume, setIsDraggingVolume] = useState(false);

  // Trạng thái hiển thị tooltip khi di chuột qua thanh tiến trình
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverX, setHoverX] = useState<number>(0);

  // Lưu trữ âm lượng trước khi tắt tiếng
  const prevVolumeRef = useRef<number>(volume > 0 ? volume : 0.8);

  // Lưu lại âm lượng trước khi tắt tiếng mỗi khi volume thay đổi (> 0)
  useEffect(() => {
    if (volume > 0) {
      prevVolumeRef.current = volume;
    }
  }, [volume]);

  // Tự động mở Right Panel khi có bài hát mới được phát
  useEffect(() => {
    if (currentTrack && isAuthenticated) {
      setIsRightPanelOpen(true);
      localStorage.setItem("right_panel_open", "true");
    }
  }, [currentTrack?.id, isAuthenticated]);



  // Trạng thái kích hoạt hoạt ảnh của loa khi thay đổi âm lượng
  const [isVolumeChanging, setIsVolumeChanging] = useState(false);

  useEffect(() => {
    setIsVolumeChanging(true);
    const timeout = setTimeout(() => {
      setIsVolumeChanging(false);
    }, 150);
    return () => clearTimeout(timeout);
  }, [volume]);

  // Hàm bật/tắt tiếng
  const toggleMute = () => {
    if (volume > 0) {
      setVolume(0);
    } else {
      setVolume(prevVolumeRef.current > 0 ? prevVolumeRef.current : 0.8);
    }
  };

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

  // Xử lý khi bài hát kết thúc tự nhiên
  const handleAudioEnded = () => {
    if (repeatMode === 'one') {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch((err) => {
          console.log("Lỗi tự động lặp bài:", err);
        });
      }
    } else {
      nextTrack();
    }
  };

  // Xử lý kéo thả để tua nhạc
  const handleProgressMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || duration === 0) return;

    const progressBar = e.currentTarget;

    const updateProgress = (clientX: number) => {
      const rect = progressBar.getBoundingClientRect();
      const clickX = clientX - rect.left;
      const width = rect.width;
      const percentage = Math.min(Math.max(clickX / width, 0), 1);
      const newTime = percentage * duration;
      setDragTime(newTime);
    };

    setIsDraggingTime(true);
    updateProgress(e.clientX);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      updateProgress(moveEvent.clientX);
    };

    const handleMouseUp = (upEvent: MouseEvent) => {
      const rect = progressBar.getBoundingClientRect();
      const clickX = upEvent.clientX - rect.left;
      const width = rect.width;
      const percentage = Math.min(Math.max(clickX / width, 0), 1);
      const finalTime = percentage * duration;

      seek(finalTime);
      setIsDraggingTime(false);

      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // Xử lý di chuột để hiển thị tooltip thời gian
  const handleProgressBarMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (duration === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const percentage = Math.min(Math.max(clickX / width, 0), 1);
    setHoverTime(percentage * duration);
    setHoverX(percentage * 100);
  };

  const handleProgressBarMouseLeave = () => {
    setHoverTime(null);
  };

  // Xử lý kéo thả để điều chỉnh âm lượng
  const handleVolumeMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const volumeBar = e.currentTarget;

    const updateVolume = (clientX: number) => {
      const rect = volumeBar.getBoundingClientRect();
      const clickX = clientX - rect.left;
      const width = rect.width;
      const newVolume = Math.min(Math.max(clickX / width, 0), 1);
      setVolume(newVolume);
    };

    setIsDraggingVolume(true);
    updateVolume(e.clientX);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      updateVolume(moveEvent.clientX);
    };

    const handleMouseUp = () => {
      setIsDraggingVolume(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const displayTime = isDraggingTime ? dragTime : currentTime;
  const progressPercent = duration > 0 ? (displayTime / duration) * 100 : 0;

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
          onEnded={handleAudioEnded}
        />
      )}

      {/* 0. GLOBAL TOP HEADER */}
      <header className="h-16 flex items-center justify-between px-6 bg-black shrink-0 z-20">
        {/* Left: Navigation Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 bg-zinc-900/80 hover:bg-zinc-850 hover:text-white rounded-full flex items-center justify-center text-zinc-400 cursor-pointer transition-all active:scale-90"
            title="Quay lại"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigate(1)}
            className="w-8 h-8 bg-zinc-900/80 hover:bg-zinc-850 hover:text-white rounded-full flex items-center justify-center text-zinc-400 cursor-pointer transition-all active:scale-90"
            title="Tiếp theo"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Center: Home Button + Search Bar */}
        <div className="flex items-center gap-2 flex-1 max-w-lg mx-4">
          {/* Home Button */}
          <button
            onClick={() => navigate("/")}
            className={`w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all active:scale-95 shrink-0 shadow-md ${
              location.pathname === "/" 
                ? "bg-[#1f1f1f] text-white border border-zinc-800" 
                : "bg-[#1f1f1f] hover:bg-[#2a2a2a] text-zinc-350 hover:text-white"
            }`}
            title="Trang chủ"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-7 h-7 text-white"
            >
              {location.pathname === "/" ? (
                <path d="M12 3L4 9v11a1 1 0 0 0 1 1h5v-6a2 2 0 0 1 4 0v6h5a1 1 0 0 0 1-1V9L12 3z" fill="currentColor" />
              ) : (
                <path 
                  d="M4 10.14V20a1 1 0 0 0 1 1h5v-6a2 2 0 0 1 4 0v6h5a1 1 0 0 0 1-1v-9.86a1 1 0 0 0-.447-.832l-7-4.666a1 1 0 0 0-1.106 0l-7 4.666A1 1 0 0 0 4 10.14Z" 
                  stroke="currentColor" 
                  strokeWidth="2.2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  fill="none" 
                />
              )}
            </svg>
          </button>

          {/* Search Bar */}
          <div className="relative flex-1 flex items-center bg-[#1f1f1f] hover:bg-[#242424] focus-within:bg-[#1f1f1f] focus-within:hover:bg-[#1f1f1f] border border-transparent focus-within:border-zinc-700/80 rounded-full transition-all group/search shadow-md">
            <Search className="absolute left-4 text-zinc-400 w-5 h-5 pointer-events-none group-focus-within/search:text-white transition-colors" />
            <input
              type="text"
              value={searchValue}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (searchValue.trim()) setShowDropdown(true);
              }}
              onBlur={() => {
                setTimeout(() => setShowDropdown(false), 200);
              }}
              placeholder="Bạn muốn phát nội dung gì?"
              className="w-full bg-transparent py-3 pl-12 pr-14 text-xs placeholder-zinc-500 text-slate-100 outline-none"
            />


            {/* SUGGESTION DROPDOWN */}
            {showDropdown && (keywordSuggestions.length > 0 || songSuggestions.length > 0) && (
              <div 
                className="absolute top-full left-0 right-0 mt-2 bg-[#282828] text-white rounded-lg shadow-2xl z-50 overflow-hidden border border-zinc-800/80 max-h-[420px] overflow-y-auto"
                onMouseDown={(e) => e.preventDefault()}
              >
                {/* Từ khóa gợi ý */}
                {keywordSuggestions.length > 0 && (
                  <div className="p-1">
                    {keywordSuggestions.map((suggestion, index) => {
                      const isSelected = activeIndex === index;
                      const textVal = suggestion.text || suggestion.Text;
                      return (
                        <div
                          key={`kw-${index}-${textVal}`}
                          className={`px-3 py-2 rounded-md flex items-center gap-3 cursor-pointer transition-colors ${
                            isSelected ? "bg-zinc-750 text-white" : "hover:bg-zinc-800/40 text-zinc-350"
                          }`}
                          onClick={() => {
                            setSearchValue(textVal);
                            navigate(`/search?q=${encodeURIComponent(textVal)}`);
                            setShowDropdown(false);
                          }}
                          onMouseEnter={() => setActiveIndex(index)}
                        >
                          <Search className="w-4 h-4 text-zinc-450 shrink-0" />
                          <span className="text-xs truncate">{highlightMatch(textVal, searchValue)}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Phân tách giữa từ khóa gợi ý và bài hát gợi ý */}
                {keywordSuggestions.length > 0 && songSuggestions.length > 0 && (
                  <div className="h-px bg-zinc-800/80 my-0.5" />
                )}

                {/* Danh sách bài hát/nghệ sĩ gợi ý */}
                {songSuggestions.length > 0 && (
                  <div className="p-1">
                    {songSuggestions.map((item, idx) => {
                      const index = keywordSuggestions.length + idx;
                      const isSelected = activeIndex === index;
                      const isThisPlaying = currentTrack?.id === item.id && isPlaying;
                      return (
                        <div
                          key={`song-${idx}-${item.id}`}
                          className={`px-3 py-1.5 rounded-md flex items-center justify-between cursor-pointer transition-colors group ${
                            isSelected ? "bg-zinc-750" : "hover:bg-zinc-800/40"
                          }`}
                          onClick={() => {
                            if (item.type === 'Song') {
                              if (item.mediaType === 1) {
                                navigate(`/video/${item.id}`);
                              } else {
                                handlePlaySong(item, songSuggestions);
                              }
                            } else if (item.type === 'Artist' || item.type === 'User') {
                              navigate(`/user/${item.id}`);
                            } else if (item.type === 'Album') {
                              navigate(`/album/${item.id}`);
                            } else if (item.type === 'Playlist') {
                              navigate(`/playlist/${item.id}`);
                            }
                            setShowDropdown(false);
                          }}
                          onMouseEnter={() => setActiveIndex(index)}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Thumbnail: Tròn đối với ca sĩ, vuông đối với nhạc */}
                            {item.coverUrl ? (
                              <img
                                src={mediaService.getImageUrl(item.coverUrl)}
                                alt={item.name || item.title}
                                className={`w-8 h-8 object-cover shrink-0 ${
                                  item.type === 'Artist' || item.type === 'User' ? 'rounded-full' : 'rounded'
                                }`}
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name || item.title || 'A')}&background=3f3f46&color=fff`;
                                }}
                              />
                            ) : (
                              <div className={`w-8 h-8 bg-zinc-800 flex items-center justify-center shrink-0 ${
                                item.type === 'Artist' || item.type === 'User' ? 'rounded-full' : 'rounded'
                              }`}>
                                <Music className="w-4 h-4 text-zinc-500" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <h5 className={`text-xs font-semibold flex items-center gap-1.5 truncate ${isThisPlaying ? "text-green-400" : "text-zinc-200"}`}>
                                {item.name || item.title}
                                {item.type === 'Artist' && item.isVerified && (
                                  <CheckCircle className="w-3.5 h-3.5 text-blue-400 shrink-0" fill="currentColor" />
                                )}
                              </h5>
                              <p className="text-[10px] text-zinc-400 truncate">
                                {item.type === 'Artist' ? 'Nghệ sĩ' : item.type === 'User' ? 'Người dùng' : item.type === 'Album' ? `Album • ${item.artistName || 'Nghệ sĩ tự do'}` : item.type === 'Playlist' ? 'Danh sách phát' : `Bài hát • ${item.artistName || 'Nghệ sĩ tự do'}`}
                              </p>
                            </div>
                          </div>

                          {/* Action Button bên phải */}
                          <div>
                            {item.type !== 'Artist' && isThisPlaying ? (
                              <span className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center text-black shadow-sm">
                                <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current">
                                  <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                                </svg>
                              </span>
                            ) : item.type !== 'Artist' ? (
                              <button className="text-zinc-450 hover:text-white transition-colors cursor-pointer p-0.5">
                                <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-current fill-none stroke-[2]">
                                  <circle cx="12" cy="12" r="10" />
                                  <line x1="12" y1="8" x2="12" y2="16" />
                                  <line x1="8" y1="12" x2="16" y2="12" />
                                </svg>
                              </button>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Notifications + User Profile */}
        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <NavLink
              to="/share"
              className={({ isActive }) =>
                `relative p-2 rounded-full hover:bg-zinc-800 transition-colors focus:outline-none ${
                  isActive ? "text-white bg-[#1f1f1f]" : "text-zinc-400 hover:text-slate-100"
                }`
              }
              title="Hộp thư chia sẻ"
            >
              <Mail className="w-5 h-5" />
            </NavLink>
          )}

          {isAuthenticated && <NotificationBell />}

          {isAuthenticated && user ? (
            <div className="relative user-profile-menu-container">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-xs text-green-400 border border-zinc-700 hover:scale-105 active:scale-95 transition-transform cursor-pointer focus:outline-none overflow-hidden"
                title={user.fullName || "Tài khoản"}
              >
                {user.avatarUrl ? (
                  <img
                    src={mediaService.getImageUrl(user.avatarUrl)}
                    alt={user.fullName || "Avatar"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || 'U')}&background=3f3f46&color=fff&size=256`;
                    }}
                  />
                ) : (
                  user.fullName ? user.fullName.charAt(0).toUpperCase() : "U"
                )}
              </button>
              
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-36 bg-[#282828] text-zinc-200 rounded-md shadow-2xl z-50 py-1 border border-zinc-800 text-xs overflow-hidden animate-fadeIn">
                  <button
                    onClick={() => {
                      navigate('/profile');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer flex items-center gap-2 font-medium"
                  >
                    Hồ sơ
                  </button>
                  <div className="h-px bg-zinc-800 my-0.5" />
                  <button
                    onClick={() => {
                      logoutState();
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-zinc-800 hover:text-red-400 transition-colors cursor-pointer flex items-center gap-2 font-medium"
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                to="/register"
                className="text-xs font-bold text-zinc-400 hover:text-slate-100 transition-colors"
              >
                Đăng ký
              </Link>
              <Link
                to="/login"
                className="px-5 py-2 bg-white text-black font-bold text-xs rounded-full hover:scale-105 transition-transform active:scale-95 shadow-md"
              >
                Đăng nhập
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Khung chính: Sidebar + Main Content */}
      <div className="flex-1 flex overflow-hidden p-2 gap-2 pt-0">
        {/* 1. SIDEBAR (Bên trái) */}
        <aside 
          className={`${
            isSidebarCollapsed ? "w-[88px]" : "w-80"
          } bg-zinc-950 rounded-xl flex flex-col p-3.5 gap-4 shrink-0 border border-zinc-900 transition-all duration-300 ease-in-out overflow-hidden`}
        >
          {/* Logo */}
          {isSidebarCollapsed ? (
            <div className="flex justify-center w-full px-2" title="TuneVault">
              <div 
                className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20 cursor-pointer"
                onClick={() => handleToggleSidebar(false)}
              >
                <Music className="w-6 h-6 text-black stroke-[2.5]" />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 px-2">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
                <Music className="w-6 h-6 text-black stroke-[2.5]" />
              </div>
              <div className="animate-fadeIn">
                <h1 className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
                  TuneVault
                </h1>
              </div>
            </div>
          )}

          {/* Library Header */}
          {isSidebarCollapsed ? (
            <div className="flex flex-col items-center gap-4 w-full border-t border-zinc-900 pt-3.5">
              <button 
                onClick={() => navigate("/library")} 
                className="w-10 h-10 rounded-full hover:bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-slate-100 transition-colors cursor-pointer" 
                title="Thư viện"
              >
                <Library className="w-5 h-5" />
              </button>
              <button 
                onClick={() => handleToggleSidebar(false)} 
                className="w-10 h-10 rounded-full hover:bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-slate-100 transition-colors cursor-pointer" 
                title="Mở rộng"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between px-2 text-zinc-400 border-t border-zinc-900 pt-3.5">
              <div 
                className="flex items-center gap-3 hover:text-slate-100 transition-colors cursor-pointer" 
                onClick={() => navigate("/library")}
              >
                <Library className="w-5 h-5" />
                <span className="font-bold text-sm">Thư viện</span>
              </div>
              <div className="flex items-center gap-1.5">

                <div className="relative">
                   <button 
                    onClick={(e) => {
                      if (!isAuthenticated) {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setAuthTooltipCoords({
                          top: rect.top + rect.height / 2,
                          left: rect.left + rect.width + 12
                        });
                        setAuthTooltipTarget(authTooltipTarget === 'plus' ? null : 'plus');
                      } else {
                        setShowAddMenu(!showAddMenu);
                      }
                    }} 
                    className="w-7 h-7 rounded-full hover:bg-zinc-900 flex items-center justify-center hover:text-white transition-colors cursor-pointer" 
                    title="Tạo mới"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  
                  {/* Dropdown Menu Tạo Mới */}
                  {showAddMenu && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setShowAddMenu(false)}
                      />
                      <div className="absolute top-full right-0 mt-1 w-48 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl z-50 overflow-hidden py-1">
                        <button
                          onClick={() => {
                            setShowAddMenu(false);
                            setIsCreateModalOpen(true);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                        >
                          Tạo playlist mới
                        </button>
                        
                        {user?.role === 'Artist' && (
                          <button
                            onClick={() => {
                              setShowAddMenu(false);
                              setShowCreateAlbum(true);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                          >
                            Tạo album mới
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
                <button 
                  onClick={() => handleToggleSidebar(true)} 
                  className="w-7 h-7 rounded-full hover:bg-zinc-900 flex items-center justify-center hover:text-white transition-colors cursor-pointer" 
                  title="Thu gọn"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Playlists List */}
          <div className="flex-1 overflow-y-auto space-y-1.5 scrollbar-thin scrollbar-thumb-zinc-800/80 pr-0.5">
            {isAuthenticated ? (
              <>
                {/* Liked Songs item */}
                <div
                  onClick={() => navigate('/favorites')}
                  className={`flex items-center gap-3 p-1.5 rounded-lg hover:bg-zinc-900/50 transition-colors cursor-pointer group ${
                    location.pathname === '/favorites' ? "bg-zinc-900" : ""
                  }`}
                  title="Bài hát đã thích"
                >
                  {/* Liked Songs Cover */}
                  <div className={`${isSidebarCollapsed ? 'w-11 h-11' : 'w-12 h-12'} bg-gradient-to-br from-[#450e74] to-[#c3a0df] rounded flex items-center justify-center shrink-0 shadow`}>
                    <Heart className={`${isSidebarCollapsed ? 'w-5 h-5' : 'w-6 h-6'} text-white fill-current`} />
                  </div>
                  
                  {!isSidebarCollapsed && (
                    <div className="min-w-0">
                      <h4 className={`text-sm font-bold truncate transition-colors ${
                        location.pathname === '/favorites' ? "text-green-400" : "text-slate-200 group-hover:text-green-400"
                      }`}>
                        Bài hát đã thích
                      </h4>
                      <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-1">
                        <span className="text-green-500 font-bold text-[8px] shrink-0">📌</span>
                        <span className="truncate">Danh sách phát • {user?.fullName || 'Yui'}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Other User Playlists */}
                {sidebarPlaylists.map((playlist) => {
                  const isActive = location.pathname === `/playlist/${playlist.id}`;
                  return (
                    <div
                      key={playlist.id}
                      onClick={() => navigate(`/playlist/${playlist.id}`)}
                      className={`flex items-center gap-3 p-1.5 rounded-lg hover:bg-zinc-900/50 transition-colors cursor-pointer group ${
                        isActive ? "bg-zinc-900" : ""
                      }`}
                      title={playlist.title}
                    >
                      <div className={`${isSidebarCollapsed ? 'w-11 h-11' : 'w-12 h-12'} bg-gradient-to-br from-green-500/10 to-zinc-900 flex items-center justify-center rounded shrink-0 shadow overflow-hidden`}>
                        {playlist.coverUrl ? (
                          <img
                            src={mediaService.getImageUrl(playlist.coverUrl)}
                            alt={playlist.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <svg viewBox="0 0 24 24" className={`${isSidebarCollapsed ? 'w-5 h-5' : 'w-6 h-6'} text-zinc-500 group-hover:text-green-400 transition-colors`}>
                            <path fill="currentColor" d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                          </svg>
                        )}
                      </div>
                      
                      {!isSidebarCollapsed && (
                        <div className="min-w-0">
                          <h4 className={`text-sm font-bold truncate group-hover:text-green-400 transition-colors ${
                            isActive ? "text-green-400" : "text-slate-200"
                          }`}>
                            {playlist.title}
                          </h4>
                          <p className="text-xs text-zinc-400 mt-1 truncate">
                            Danh sách phát • {user?.fullName || 'Yui'}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            ) : (
              /* Khung hiển thị kêu gọi Đăng nhập khi chưa đăng nhập */
              isSidebarCollapsed ? (
                <div 
                  onClick={() => navigate('/login')}
                  className="flex items-center justify-center p-3 text-zinc-500 hover:text-white hover:bg-zinc-900/50 rounded-lg transition-colors cursor-pointer mx-1.5"
                  title="Đăng nhập để xem danh sách phát"
                >
                  <Plus className="w-5 h-5" />
                </div>
              ) : (
                <div className="bg-zinc-900/40 p-4 rounded-xl space-y-3 mx-2 border border-zinc-800/40 shadow-md">
                  <h5 className="font-bold text-sm text-white leading-snug">Tạo danh sách phát đầu tiên của bạn</h5>
                  <p className="text-xs text-zinc-400 font-medium">Rất dễ dàng, chúng tôi sẽ giúp bạn</p>
                  <button 
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setAuthTooltipCoords({
                        top: rect.top + rect.height / 2,
                        left: rect.left + rect.width + 12
                      });
                      setAuthTooltipTarget(authTooltipTarget === 'create-btn' ? null : 'create-btn');
                    }}
                    className="px-4 py-1.5 bg-white text-black text-xs font-black rounded-full hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer shadow"
                  >
                    Tạo danh sách phát
                  </button>
                </div>
              )
            )}
          </div>

          {/* Admin link (if present) */}
          {user?.role === "Admin" && (
            <div className="border-t border-zinc-900 pt-2 shrink-0">
              {isSidebarCollapsed ? (
                <div className="flex justify-center">
                  <button
                    onClick={() => navigate("/admin")}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-zinc-400 hover:text-slate-100 hover:bg-zinc-900 transition-all duration-200 cursor-pointer ${
                      location.pathname === "/admin" ? "bg-zinc-900 text-green-400" : ""
                    }`}
                    title="Quản trị"
                  >
                    <ShieldCheck className="w-5 h-5" />
                  </button>
                </div>
              ) : (
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
            </div>
          )}
        </aside>

        {/* 2. MAIN CONTENT (Ở giữa & phải) */}
        <main className="flex-1 bg-zinc-950 rounded-xl flex flex-col overflow-hidden border border-zinc-900 relative">
          {/* Nội dung động thay đổi theo route */}
          <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-zinc-800">
            <Outlet />
          </div>
        </main>

        {/* 4. RIGHT PANEL (Bên phải) */}
        {isAuthenticated && isRightPanelOpen && (
          <aside className="w-80 bg-zinc-950 rounded-xl border border-zinc-900 flex flex-col shrink-0 overflow-hidden">
            <RightPanel 
              track={currentTrack} 
              onClose={() => {
                setIsRightPanelOpen(false);
                localStorage.setItem("right_panel_open", "false");
              }} 
              isTrackInPlaylist={isTrackInPlaylist}
              onAddToPlaylist={() => {
                if (currentTrack) {
                  setAddToPlaylistTrackId(currentTrack.id);
                  setPlaylistModalPlacement('right-panel');
                }
              }}
            />
          </aside>
        )}
      </div>

      {/* 3. PLAYER BAR (Dưới cùng) */}
      <footer className="h-24 bg-black border-t border-zinc-900 px-6 flex items-center justify-between shrink-0">
        {/* Phía bên trái: Thông tin bài hát đang phát */}
        <div className="flex items-center gap-4 w-1/3">
          <div className="w-14 h-14 bg-zinc-900 rounded-lg flex items-center justify-center border border-zinc-800 overflow-hidden shrink-0 shadow-inner">
            {currentTrack ? (
              currentTrack.coverUrl ? (
                <img
                  src={mediaService.getImageUrl(currentTrack.coverUrl)}
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
          <div className="min-w-0 flex-1 flex items-center justify-start gap-2">
            <div className="min-w-0">
              <MarqueeText 
                text={currentTrack ? currentTrack.title : "Chưa có bài hát"} 
                className="text-sm font-bold hover:underline cursor-pointer"
              />
              {currentTrack ? (
                <MarqueeText text={currentTrack.artist} className="text-xs text-zinc-400 mt-0.5">
                  {parseArtists(currentTrack.artist, currentTrack.artistId).map((artist, idx, arr) => (
                    <span key={idx}>
                      {artist.id ? (
                        <span 
                          onClick={() => navigate(`/user/${artist.id}`)} 
                          className="hover:underline cursor-pointer"
                        >
                          {artist.name}
                        </span>
                      ) : (
                        <span>{artist.name}</span>
                      )}
                      {idx < arr.length - 1 ? ", " : ""}
                    </span>
                  ))}
                </MarqueeText>
              ) : (
                <p className="text-xs text-zinc-400 mt-0.5">
                  Chọn một bài hát để nghe
                </p>
              )}
            </div>
            {currentTrack && (
              <div className="flex items-center gap-1 ml-2 shrink-0">
                <button 
                  onClick={() => toggleFavorite(currentTrack.id)}
                  className={`transition-colors p-1 cursor-pointer hover:scale-110 active:scale-95 ${
                    isFavorite(currentTrack.id) ? "text-green-400" : "text-zinc-450 hover:text-green-400"
                  }`} 
                  title={isFavorite(currentTrack.id) ? "Bỏ thích" : "Thích"}
                >
                  <Heart className={`w-5 h-5 ${isFavorite(currentTrack.id) ? "fill-current" : ""}`} />
                </button>
                
                <button 
                  onClick={() => {
                    setAddToPlaylistTrackId(currentTrack.id);
                    setPlaylistModalPlacement('player');
                  }}
                  className="text-zinc-450 hover:text-white transition-all duration-200 p-1 cursor-pointer hover:scale-105 active:scale-90"
                  title="Lưu vào danh sách phát"
                >
                  {isTrackInPlaylist ? (
                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-black">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  ) : (
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-[2.2]">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="16" />
                      <line x1="8" y1="12" x2="16" y2="12" />
                    </svg>
                  )}
                </button>
                
                <button
                  onClick={() => setShowShareModal(true)}
                  className="text-zinc-450 hover:text-green-400 transition-all duration-200 p-1 cursor-pointer hover:scale-105 active:scale-90"
                  title="Chia sẻ bài hát"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
        {/* Ở giữa: Các nút điều khiển nhạc & Thanh tiến trình */}
        <div className="flex flex-col items-center gap-2 w-1/3 max-w-xl">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsShuffle(!isShuffle)}
              className={`relative flex flex-col items-center transition-colors cursor-pointer group/shuffle ${
                isShuffle ? "text-green-500 hover:text-green-400" : "text-zinc-450 hover:text-slate-100"
              }`}
            >
              <Shuffle className="w-4 h-4" />
              {isShuffle && (
                <span className="absolute -bottom-1.5 w-1 h-1 bg-green-500 rounded-full"></span>
              )}
            </button>
            <button
              onClick={prevTrack}
              className="text-zinc-400 hover:text-slate-100 transition-colors cursor-pointer"
            >
              <SkipBack className="w-5 h-5 fill-current" />
            </button>

            <button
              onClick={togglePlay}
              disabled={!currentTrack}
              className="w-10 h-10 bg-slate-100 disabled:bg-zinc-800 disabled:text-zinc-600 rounded-full flex items-center justify-center text-black hover:scale-105 transition-transform active:scale-95 shadow-md cursor-pointer"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>

            <button
              onClick={nextTrack}
              className="text-zinc-400 hover:text-slate-100 transition-colors cursor-pointer"
            >
              <SkipForward className="w-5 h-5 fill-current" />
            </button>
            <button
              onClick={() => {
                if (repeatMode === 'off') setRepeatMode('all');
                else if (repeatMode === 'all') setRepeatMode('one');
                else setRepeatMode('off');
              }}
              className={`relative flex flex-col items-center transition-colors cursor-pointer group/repeat ${
                repeatMode !== 'off' ? "text-green-500 hover:text-green-400" : "text-zinc-450 hover:text-slate-100"
              }`}
              title={
                repeatMode === 'off' 
                  ? 'Bật lặp lại tất cả' 
                  : repeatMode === 'all' 
                    ? 'Bật lặp lại 1 bài' 
                    : 'Tắt lặp lại'
              }
            >
              <Repeat className="w-4 h-4" />
              {repeatMode === 'one' && (
                <span className="absolute -top-1 -right-1.5 bg-green-500 text-black text-[7px] font-extrabold w-3 h-3 rounded-full flex items-center justify-center border border-black scale-90 select-none">
                  1
                </span>
              )}
              {repeatMode !== 'off' && (
                <span className="absolute -bottom-1.5 w-1 h-1 bg-green-500 rounded-full"></span>
              )}
            </button>
          </div>

          {/* Thanh chạy tiến trình phát nhạc */}
          <div className="w-full flex items-center gap-2.5 text-[10px] text-zinc-500 font-bold">
            <span>{formatTime(displayTime)}</span>
            <div
              onMouseDown={handleProgressMouseDown}
              onMouseMove={handleProgressBarMouseMove}
              onMouseLeave={handleProgressBarMouseLeave}
              className="flex-1 h-3 flex items-center relative group cursor-pointer"
            >
              {/* Unfilled track background */}
              <div className="w-full h-1 bg-zinc-800 rounded-full">
                {/* Filled track */}
                <div
                  className={`h-full rounded-full transition-colors ${
                    isDraggingTime ? "bg-green-500" : "bg-slate-100 group-hover:bg-green-500"
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              {/* Thumb/Knob */}
              <div
                className={`absolute w-3 h-3 bg-slate-100 rounded-full shadow transition-opacity ${
                  isDraggingTime ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                }`}
                style={{
                  left: `${progressPercent}%`,
                  transform: "translate(-50%, -50%)",
                  top: "50%",
                }}
              />
              {/* Hover Tooltip */}
              {hoverTime !== null && (
                <div
                  className="absolute -top-8 -translate-x-1/2 bg-zinc-900 text-slate-100 text-[10px] px-2 py-1 rounded font-bold shadow-lg pointer-events-none border border-zinc-800"
                  style={{ left: `${hoverX}%` }}
                >
                  {formatTime(hoverTime)}
                </div>
              )}
            </div>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Phía bên phải: Âm lượng & Tiện ích */}
        <div className="flex items-center justify-end gap-3 w-1/3 text-zinc-400 group/volume">
          {/* Nút bật/tắt Right Panel */}
          {isAuthenticated && (
            <button
              onClick={() => {
                const nextState = !isRightPanelOpen;
                setIsRightPanelOpen(nextState);
                localStorage.setItem("right_panel_open", nextState ? "true" : "false");
              }}
              className={`p-1 hover:text-slate-100 transition-colors cursor-pointer mr-2 relative ${
                isRightPanelOpen ? 'text-green-400' : 'text-zinc-400'
              }`}
              title={isRightPanelOpen ? "Đóng bảng chi tiết" : "Mở bảng chi tiết"}
            >
              <Info className="w-5 h-5" />
              {isRightPanelOpen && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-green-500 rounded-full"></span>
              )}
            </button>
          )}

          <button
            onClick={toggleMute}
            className="hover:text-slate-100 cursor-pointer p-1 transition-colors"
          >
            <div
              className={`transition-all duration-150 transform ${
                isVolumeChanging ? "scale-120 text-green-400" : "scale-100"
              }`}
            >
              {volume === 0 ? (
                <VolumeX className="w-5 h-5 text-zinc-500" />
              ) : volume < 0.5 ? (
                <Volume1 className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </div>
          </button>
          <div
            onMouseDown={handleVolumeMouseDown}
            className="w-24 h-3 flex items-center relative cursor-pointer"
          >
            {/* Unfilled track background */}
            <div className="w-full h-1 bg-zinc-800 rounded-full">
              {/* Filled track */}
              <div
                className={`h-full rounded-full ${
                  isDraggingVolume ? "" : "transition-[width,background-color] duration-300 ease-out"
                } ${
                  isDraggingVolume ? "bg-green-500" : "bg-slate-100 group-hover/volume:bg-green-500"
                }`}
                style={{ width: `${volume * 100}%` }}
              />
            </div>
            {/* Thumb/Knob */}
            <div
              className={`absolute w-3 h-3 bg-slate-100 rounded-full shadow ${
                isDraggingVolume ? "" : "transition-[left,opacity] duration-300 ease-out"
              } ${
                isDraggingVolume ? "opacity-100" : "opacity-0 group-hover/volume:opacity-100"
              }`}
              style={{
                left: `${volume * 100}%`,
                transform: "translate(-50%, -50%)",
                top: "50%",
              }}
            />
          </div>
        </div>
      </footer>

      {/* MODAL TẠO PLAYLIST */}
      <CreatePlaylistModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {showCreateAlbum && (
        <CreateAlbumModal
          isOpen={showCreateAlbum}
          onClose={() => setShowCreateAlbum(false)}
        />
      )}
      
      {/* MODAL THÊM BÀI HÁT VÀO PLAYLIST */}
      {addToPlaylistTrackId && (
        <AddToPlaylistModal
          isOpen={!!addToPlaylistTrackId}
          onClose={() => setAddToPlaylistTrackId(null)}
          mediaItemId={addToPlaylistTrackId}
          placement={playlistModalPlacement}
        />
      )}

      {/* MODAL CHIA SẺ */}
      {showShareModal && currentTrack && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          mediaItemId={currentTrack.id}
          title={`Bài hát: ${currentTrack.title}`}
        />
      )}

      {/* POPUP YÊU CẦU ĐĂNG NHẬP (DÙNG FIXED ĐỂ TRÁNH BỊ CLIP BỞI OVERFLOW CỦA SIDEBAR) */}
      {authTooltipTarget && authTooltipCoords && (
        <>
          <div 
            className="fixed inset-0 z-[9998]" 
            onClick={() => {
              setAuthTooltipTarget(null);
              setAuthTooltipCoords(null);
            }}
          />
          <div 
            style={{ 
              position: 'fixed', 
              top: `${authTooltipCoords.top}px`, 
              left: `${authTooltipCoords.left}px`,
              transform: 'translateY(-50%)'
            }}
            className="w-[300px] bg-[#0d72ea] text-white p-4 rounded-lg shadow-2xl z-[9999] animate-fadeIn flex flex-col pointer-events-auto"
          >
            {/* Mũi tên trỏ sang trái */}
            <div className="absolute right-full top-1/2 -translate-y-1/2 border-[8px] border-transparent border-r-[#0d72ea]" />
            <h4 className="font-bold text-sm text-white">Tạo danh sách phát</h4>
            <p className="text-xs text-blue-100 mt-1.5 mb-4 leading-normal">
              Đăng nhập để tạo và chia sẻ playlist.
            </p>
            <div className="flex justify-end items-center gap-4">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setAuthTooltipTarget(null);
                  setAuthTooltipCoords(null);
                }}
                className="text-xs font-bold text-blue-100 hover:text-white cursor-pointer transition-colors bg-transparent border-0 outline-none p-0"
              >
                Để sau
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setAuthTooltipTarget(null);
                  setAuthTooltipCoords(null);
                  navigate('/login');
                }}
                className="bg-white text-black text-xs font-bold px-4 py-2 rounded-full hover:scale-105 active:scale-95 transition-all shadow cursor-pointer border-0 outline-none"
              >
                Đăng nhập
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MainLayout;


