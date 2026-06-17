import { useState, useEffect } from 'react';
import { useParams, NavLink, useNavigate } from 'react-router-dom';
import { usePlayer } from '../../contexts/PlayerContext';
// Thêm icon Loader2
import { Play, Pause, Heart, Music, ArrowLeft, Loader2, Edit2, Trash2 } from 'lucide-react';
// Import dịch vụ API
import { playlistService, mediaService } from '../../services';
import { useAuth } from '../../contexts/AuthContext';
import { CreatePlaylistModal } from '../../components/CreatePlaylistModal';
import { TrackListTable } from '../../components/TrackListTable';
import { AddToPlaylistModal } from '../../components/AddToPlaylistModal';
import { formatDuration } from '../../utils';
import { useFavorite } from '../../contexts/FavoriteContext';

export const PlaylistDetail = () => {
  const { id } = useParams<{ id: string }>(); // Lấy ID của playlist từ thanh URL
  const navigate = useNavigate();
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayer();
  const { user } = useAuth();

  // BƯỚC 1: Khai báo State chứa dữ liệu thật
  const [playlistInfo, setPlaylistInfo] = useState<any>(null); // Chứa Tên, Mô tả
  const [tracks, setTracks] = useState<any[]>([]);             // Chứa danh sách bài hát
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(null);

  // BƯỚC 2: Gọi API khi vào trang chi tiết
  useEffect(() => {
    const fetchPlaylistDetail = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        // 1. Tìm thông tin cơ bản của Playlist (Title, Description)
        const playlistsRes = await playlistService.getMyPlaylists();
        if (playlistsRes.success) {
          const found = playlistsRes.data.find((p: any) => p.id === id);
          if (found) setPlaylistInfo(found);
        }

        // 2. Lấy danh sách các bài hát trong Playlist này
        const tracksRes = await playlistService.getTracks(id);
        if (tracksRes.success) {
          // Bóc tách bài hát từ PlaylistTrackDto trả về
          const mappedTracks = tracksRes.data.map((pt: any) => ({
            id: pt.mediaItemId,
            title: pt.title,
            artist: pt.artistName || 'Không rõ ca sĩ',
            coverUrl: pt.coverUrl,
            duration: formatDuration(pt.durationInSeconds), // Gọi helper bên dưới hoặc tự viết
            durationInSeconds: pt.durationInSeconds,
            mediaType: pt.mediaType,
            filePath: mediaService.getStreamUrl(pt.mediaItemId) // Sử dụng mediaService
          }));
          setTracks(mappedTracks);
        }
      } catch (error) {
        console.error('Lỗi khi tải chi tiết playlist:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlaylistDetail();

    const handlePlaylistChanged = () => {
      fetchPlaylistDetail();
    };
    window.addEventListener('playlistChanged', handlePlaylistChanged);
    return () => {
      window.removeEventListener('playlistChanged', handlePlaylistChanged);
    };
  }, [id]);

  const handleDeletePlaylist = async () => {
    if (!id || !window.confirm('Bạn có chắc chắn muốn xóa không? Hành động này không thể hoàn tác.')) return;
    try {
      const res = await playlistService.deletePlaylist(id);
      if (res.success) {
        window.dispatchEvent(new Event('playlistChanged'));
        navigate('/library');
      } else {
        alert(res.message || 'Xóa thất bại.');
      }
    } catch (error) {
      console.error(error);
      alert('Lỗi kết nối khi xóa.');
    }
  };

  const handleRemoveTrack = async (trackId: string) => {
    if (!id || !window.confirm('Bạn có chắc chắn muốn xóa bài hát này khỏi playlist?')) return;
    try {
      const res = await playlistService.removeTrack(id, trackId);
      if (res.success) {
        setTracks(prev => prev.filter(t => t.id !== trackId));
        window.dispatchEvent(new Event('playlistChanged'));
      } else {
        alert(res.message || 'Xóa thất bại.');
      }
    } catch (error) {
      console.error(error);
      alert('Lỗi kết nối khi xóa.');
    }
  };

  const handleBigPlayClick = () => {
    if (tracks.length === 0) return;

    const isPlayingCurrentPlaylist = tracks.some(t => t.id === currentTrack?.id);
    if (isPlayingCurrentPlaylist) {
      togglePlay();
    } else {
      playTrack(tracks[0], tracks);
    }
  };

  const isCurrentPlaylistPlaying = tracks.some(t => t.id === currentTrack?.id) && isPlaying;

  // MÀN HÌNH CHỜ
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] space-y-4">
        <Loader2 className="w-10 h-10 text-green-500 animate-spin" />
        <p className="text-zinc-400 font-medium">Đang tải chi tiết playlist...</p>
      </div>
    );
  }

  // Nếu ID sai hoặc playlist bị xóa
  if (!playlistInfo && !isLoading) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-slate-200">Không tìm thấy Playlist</h2>
        <NavLink to="/library" className="text-green-400 hover:underline mt-2 inline-block">Quay lại Thư viện</NavLink>
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

      {/* Header Playlist (Dữ liệu thật) */}
      <div className="flex flex-col md:flex-row items-center md:items-end gap-6 pb-6 border-b border-zinc-900">
        <div className="w-48 h-48 bg-gradient-to-br from-green-500/20 to-zinc-900 rounded-2xl flex items-center justify-center border border-zinc-800 shadow-2xl shrink-0">
          <Music className="w-16 h-16 text-zinc-650" />
        </div>

        <div className="text-center md:text-left space-y-2">
          <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-widest bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">
            Danh sách phát
          </span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight mt-1 text-slate-100">
            {playlistInfo?.title || 'Playlist không tên'}
          </h2>
          <p className="text-sm text-zinc-400 font-medium leading-relaxed max-w-xl">
            {playlistInfo?.description || 'Không có mô tả cho playlist này.'}
          </p>
          <div className="text-xs text-zinc-300 font-semibold pt-1 flex flex-wrap items-center justify-center md:justify-start gap-1">
            <span className="text-green-400">{playlistInfo?.ownerId === user?.id ? 'Bạn tạo' : 'Người khác tạo'}</span>
            <span className="text-zinc-600">•</span>
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
          {isCurrentPlaylistPlaying ? (
            <Pause className="w-6 h-6 fill-current" />
          ) : (
            <Play className="w-6 h-6 fill-current ml-0.5" />
          )}
        </button>
        <button className="text-zinc-400 hover:text-green-400 transition-colors p-2">
          <Heart className="w-6 h-6" />
        </button>

        {user && playlistInfo && user.id === playlistInfo.ownerId && (
          <>
            <div className="w-px h-8 bg-zinc-800 mx-2"></div>
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="text-zinc-400 hover:text-white transition-colors p-2 flex items-center gap-2 text-sm font-semibold"
            >
              <Edit2 className="w-5 h-5" /> Sửa
            </button>
            <button 
              onClick={handleDeletePlaylist}
              className="text-zinc-400 hover:text-red-400 transition-colors p-2 flex items-center gap-2 text-sm font-semibold"
            >
              <Trash2 className="w-5 h-5" /> Xóa
            </button>
          </>
        )}
      </div>

      {/* BƯỚC 3 & 4: Danh sách bài hát THẬT */}
      {tracks.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-zinc-800 rounded-xl mt-4">
          <p className="text-zinc-500 font-medium">Playlist này chưa có bài hát nào.</p>
        </div>
      ) : (
        <TrackListTable 
            tracks={tracks} 
            onRemoveTrack={
                user?.id === playlistInfo?.ownerId 
                  ? handleRemoveTrack 
                  : undefined
            }
            onAddToPlaylist={setSelectedMediaId}
        />
      )}

      {/* Modal Edit Playlist/Album */}
      <CreatePlaylistModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        playlistToEdit={playlistInfo}
      />

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

export default PlaylistDetail;
