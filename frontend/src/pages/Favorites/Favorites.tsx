import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { usePlayer } from '../../contexts/PlayerContext';
import { Play, Pause, Clock, Heart, Music, ArrowLeft, Loader2 } from 'lucide-react';
import { mediaService } from '../../services';
import { useAuth } from '../../contexts/AuthContext';
import { TrackDropdownMenu } from '../../components/TrackDropdownMenu';
import { AddToPlaylistModal } from '../../components/AddToPlaylistModal';
import { TrackListTable } from '../../components/TrackListTable';
import { formatDuration } from '../../utils';
import { useFavorite } from '../../contexts/FavoriteContext';

export const Favorites = () => {
  const navigate = useNavigate();
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayer();
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorite();

  const [tracks, setTracks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(null);

  useEffect(() => {
    const fetchFavoritesData = async () => {
      try {
        setIsLoading(true);
        const res = await mediaService.getFavorites();
        if (res.success && res.data) {
          const mappedTracks = res.data.map((fav: any) => ({
            id: fav.mediaItemId,
            title: fav.mediaTitle || 'Không rõ tên',
            artist: fav.artistName || 'Không rõ ca sĩ',
            coverUrl: fav.coverUrl,
            duration: formatDuration(fav.durationInSeconds),
            durationInSeconds: fav.durationInSeconds || 180,
            mediaType: fav.mediaType,
            filePath: mediaService.getStreamUrl(fav.mediaItemId)
          }));
          setTracks(mappedTracks);
        }
      } catch (error) {
        console.error('Lỗi khi tải danh sách yêu thích:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavoritesData();
  }, []); // Run on mount



  // Xử lý nút Play lớn (Phát tất cả)
  const handleBigPlayClick = () => {
    if (tracks.length === 0) return;

    const isPlayingCurrentList = tracks.some(t => t.id === currentTrack?.id);
    if (isPlayingCurrentList) {
      togglePlay();
    } else {
      playTrack(tracks[0], tracks);
    }
  };

  const isCurrentListPlaying = tracks.some(t => t.id === currentTrack?.id) && isPlaying;



  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] space-y-4">
        <Loader2 className="w-10 h-10 text-green-500 animate-spin" />
        <p className="text-zinc-400 font-medium">Đang tải danh sách bài hát đã thích...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Nút quay lại */}
      <NavLink
        to="/library"
        className="inline-flex items-center gap-2 text-zinc-400 hover:text-green-400 text-sm font-semibold transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Quay lại thư viện</span>
      </NavLink>

      {/* Header */}
      <div className="flex flex-col md:flex-row items-center md:items-end gap-6 pb-6 border-b border-zinc-900">
        <div className="w-48 h-48 bg-gradient-to-br from-[#450e74] to-[#c3a0df] rounded-2xl flex items-center justify-center border border-zinc-800 shadow-2xl shrink-0">
          <Heart className="w-20 h-20 text-white fill-current" />
        </div>

        <div className="text-center md:text-left space-y-2">
          <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-widest bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">
            Danh sách phát
          </span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight mt-1 text-slate-100">
            Bài hát đã thích
          </h2>
          <div className="text-xs text-zinc-300 font-semibold pt-1 flex flex-wrap items-center justify-center md:justify-start gap-1 mt-3">
            {user?.fullName && (
              <>
                <span className="font-bold text-slate-200">{user.fullName}</span>
                <span className="text-zinc-600">•</span>
              </>
            )}
            <span>{tracks.length} bài hát</span>
          </div>
        </div>
      </div>

      {/* Nút thao tác */}
      <div className="flex items-center gap-4 py-2">
        <button
          onClick={handleBigPlayClick}
          className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center text-black shadow-lg shadow-green-500/10 hover:scale-105 active:scale-95 transition-transform disabled:opacity-50"
          disabled={tracks.length === 0}
        >
          {isCurrentListPlaying ? (
            <Pause className="w-6 h-6 fill-current" />
          ) : (
            <Play className="w-6 h-6 fill-current ml-0.5" />
          )}
        </button>
      </div>

      {/* Danh sách bài hát */}
      {tracks.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-zinc-800 rounded-xl mt-4">
          <p className="text-zinc-500 font-medium">Bạn chưa thả tim bài hát nào.</p>
        </div>
      ) : (
        <TrackListTable tracks={tracks} onAddToPlaylist={setSelectedMediaId} />
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

export default Favorites;
