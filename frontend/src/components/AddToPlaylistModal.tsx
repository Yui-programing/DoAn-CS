import React, { useState, useEffect } from 'react';
import { Search, Loader2, AlertCircle, Plus, Music, Check } from 'lucide-react';
import { playlistService } from '../services/playlistService';
import { mediaService } from '../services/mediaService';
import type { Playlist } from '../types';
import { CreatePlaylistModal } from './CreatePlaylistModal';

interface AddToPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaItemId: string; // ID của bài hát cần thêm
  placement?: 'player' | 'right-panel' | 'center'; // Vị trí hiển thị để tự định vị
}

export const AddToPlaylistModal: React.FC<AddToPlaylistModalProps> = ({ 
  isOpen, 
  onClose, 
  mediaItemId, 
  placement = 'player' 
}) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Trạng thái tìm kiếm playlist
  const [searchQuery, setSearchQuery] = useState('');

  // Trạng thái lưu trữ bài hát ban đầu có nằm trong các playlist hay không
  const [playlistContainment, setPlaylistContainment] = useState<Record<string, boolean>>({});

  // Trạng thái check hiện tại của người dùng
  const [selectedPlaylistIds, setSelectedPlaylistIds] = useState<string[]>([]);

  // Trạng thái mở modal tạo playlist mới con
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const fetchPlaylistsAndContainment = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const res = await playlistService.getMyPlaylists();
      if (res.success) {
        const list = res.data;
        setPlaylists(list);

        // Kiểm tra song containment cho từng playlist song song
        const containment: Record<string, boolean> = {};
        await Promise.all(
          list.map(async (playlist) => {
            try {
              const tracksRes = await playlistService.getTracks(playlist.id);
              if (tracksRes.success) {
                const hasTrack = tracksRes.data.some((t: any) => t.mediaItemId === mediaItemId);
                containment[playlist.id] = hasTrack;
              }
            } catch (err) {
              console.error(`Lỗi lấy danh sách bài hát cho playlist ${playlist.id}:`, err);
              containment[playlist.id] = false;
            }
          })
        );

        setPlaylistContainment(containment);
        // Khởi tạo các playlist được tích chọn ban đầu
        setSelectedPlaylistIds(Object.keys(containment).filter(id => containment[id]));
      } else {
        setError(res.message || "Không thể tải danh sách playlist.");
      }
    } catch (err) {
      console.error(err);
      setError("Có lỗi xảy ra khi tải dữ liệu.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && mediaItemId) {
      fetchPlaylistsAndContainment();
      setSearchQuery('');
    }
  }, [isOpen, mediaItemId]);

  // Đăng ký nhận sự kiện khi người dùng tạo playlist mới thành công
  useEffect(() => {
    if (!isOpen) return;

    const handlePlaylistChanged = () => {
      fetchPlaylistsAndContainment();
    };

    window.addEventListener('playlistChanged', handlePlaylistChanged);
    return () => {
      window.removeEventListener('playlistChanged', handlePlaylistChanged);
    };
  }, [isOpen, mediaItemId]);

  if (!isOpen) return null;

  // Cập nhật trạng thái tích chọn local
  const handleTogglePlaylist = (playlistId: string) => {
    setSelectedPlaylistIds(prev => 
      prev.includes(playlistId) 
        ? prev.filter(id => id !== playlistId)
        : [...prev, playlistId]
    );
  };

  // Lưu các thay đổi lên máy chủ khi người dùng nhấn "Xong"
  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      // Tìm playlist mới được chọn (chưa có trong containment ban đầu)
      const toAdd = selectedPlaylistIds.filter(id => !playlistContainment[id]);
      
      // Tìm playlist bị bỏ chọn (đã có trong containment ban đầu nhưng hiện tại không được chọn)
      const toRemove = Object.keys(playlistContainment).filter(
        id => playlistContainment[id] && !selectedPlaylistIds.includes(id)
      );

      // Thực thi gọi API đồng thời
      await Promise.all([
        ...toAdd.map(id => playlistService.addTrack(id, mediaItemId)),
        ...toRemove.map(id => playlistService.removeTrack(id, mediaItemId))
      ]);

      // Báo cho toàn hệ thống biết playlist đã được cập nhật
      window.dispatchEvent(new Event('playlistChanged'));
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Lỗi khi lưu thay đổi bài hát vào danh sách phát.");
    } finally {
      setIsSaving(false);
    }
  };

  // Lọc playlist theo từ khóa tìm kiếm
  const filteredPlaylists = playlists.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Phân chia thành 2 mục: Đã lưu vào & Mới cập nhật gần đây
  const savedPlaylists = filteredPlaylists.filter(p => selectedPlaylistIds.includes(p.id));
  const recentPlaylists = filteredPlaylists.filter(p => !selectedPlaylistIds.includes(p.id));

  const renderPlaylistItem = (playlist: Playlist) => {
    const isChecked = selectedPlaylistIds.includes(playlist.id);
    const cover = (playlist as any).coverUrl;
    return (
      <div
        key={playlist.id}
        onClick={() => handleTogglePlaylist(playlist.id)}
        className="w-full flex items-center justify-between p-1.5 rounded hover:bg-zinc-800/40 cursor-pointer group select-none transition-colors"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Cover Image */}
          <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center shadow overflow-hidden shrink-0 border border-zinc-850">
            {cover ? (
              <img 
                src={mediaService.getImageUrl(cover)} 
                alt={playlist.title} 
                className="w-full h-full object-cover" 
              />
            ) : (
              <Music className="w-3.5 h-3.5 text-zinc-500" />
            )}
          </div>
          {/* Title & tracks count */}
          <div className="min-w-0">
            <h4 className="text-[11px] font-bold text-slate-200 truncate group-hover:text-white transition-colors">
              {playlist.title}
            </h4>
            <p className="text-[9px] text-zinc-500 mt-0.5">
              {playlist.tracksCount || 0} bài hát
            </p>
          </div>
        </div>

        {/* Checkbox tròn bên phải */}
        <div className="shrink-0 ml-2">
          {isChecked ? (
            <div className="w-4.5 h-4.5 rounded-full bg-green-500 flex items-center justify-center text-black">
              <Check className="w-3 h-3 stroke-[3]" />
            </div>
          ) : (
            <div className="w-4.5 h-4.5 rounded-full border border-zinc-650 group-hover:border-zinc-400 transition-colors" />
          )}
        </div>
      </div>
    );
  };

  if (isCreateOpen) {
    return (
      <CreatePlaylistModal 
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          onClose(); // Đóng luôn cả popup thêm bài hát
        }}
        onSuccess={async (newPlaylistId) => {
          try {
            // Tự động thêm bài hát đang chọn vào playlist mới tạo
            await playlistService.addTrack(newPlaylistId, mediaItemId);
            // Báo cho toàn hệ thống để cập nhật lại số lượng bài hát ở sidebar
            window.dispatchEvent(new Event('playlistChanged'));
          } catch (err) {
            console.error("Lỗi khi tự động thêm bài hát vào playlist mới:", err);
          }
          setIsCreateOpen(false);
          onClose(); // Đóng luôn cả popup thêm bài hát
        }}
      />
    );
  }

  return (
    <>
      {/* Nền mờ/vô hình để đóng modal khi click ra ngoài */}
      <div 
        className={`fixed inset-0 z-50 cursor-default ${
          placement === 'center' ? 'bg-black/60 backdrop-blur-xs' : 'bg-transparent'
        }`} 
        onClick={onClose}
      />

      {/* Khung chứa nổi */}
      <div 
        className={`fixed z-55 w-[310px] bg-[#181818] border border-zinc-800/80 rounded-lg shadow-2xl flex flex-col max-h-[380px] p-4 text-slate-100 ${
          placement === 'player'
            ? 'bottom-28 left-6 animate-slideUp'
            : placement === 'right-panel'
              ? 'top-32 right-[340px] animate-slideUp'
              : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-fadeIn'
        }`}
      >
        {/* Title */}
        <div className="text-[11px] font-bold text-zinc-400 mb-3 uppercase tracking-wider">
          Thêm vào danh sách phát
        </div>

        {error && (
          <div className="mb-3 p-2 bg-red-500/10 border border-red-500/20 rounded flex items-center gap-1.5 text-red-400 text-[10px] font-semibold shrink-0">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <p className="flex-1 truncate">{error}</p>
          </div>
        )}

        {/* Ô tìm kiếm danh sách phát */}
        <div className="relative flex items-center bg-[#242424] hover:bg-[#2a2a2a] focus-within:bg-[#242424] border border-transparent focus-within:border-zinc-700 rounded-md transition-all mb-3 shrink-0">
          <Search className="absolute left-2.5 text-zinc-500 w-3.5 h-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm một danh sách phát"
            className="w-full bg-transparent py-1.5 pl-8 pr-3 text-[11px] placeholder-zinc-500 text-slate-100 outline-none"
          />
        </div>

        {/* Nút Tạo danh sách phát mới nhanh */}
        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2.5 w-full text-left py-1.5 px-0.5 hover:text-white text-zinc-300 transition-colors text-xs font-bold shrink-0 mb-2 border-b border-zinc-800/50 pb-3 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-zinc-400" />
          <span>Danh sách phát mới</span>
        </button>

        {/* Danh sách Playlists cuộn */}
        <div className="flex-1 overflow-y-auto space-y-1 pr-1 scrollbar-thin scrollbar-thumb-zinc-800 min-h-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-8 text-zinc-500 text-[10px] gap-2">
              <Loader2 className="w-4 h-4 text-green-500 animate-spin" />
              <span>Đang tải...</span>
            </div>
          ) : (
            <>
              {/* Section 1: Đã lưu vào */}
              {savedPlaylists.length > 0 && (
                <div className="space-y-0.5">
                  <div className="text-[9px] font-extrabold text-zinc-500 uppercase tracking-wider py-1 select-none">
                    Đã lưu vào
                  </div>
                  {savedPlaylists.map(renderPlaylistItem)}
                </div>
              )}

              {/* Section 2: Mới cập nhật gần đây */}
              {recentPlaylists.length > 0 && (
                <div className="space-y-0.5 pt-2">
                  <div className="text-[9px] font-extrabold text-zinc-500 uppercase tracking-wider py-1 select-none">
                    Mới cập nhật gần đây
                  </div>
                  {recentPlaylists.map(renderPlaylistItem)}
                </div>
              )}

              {savedPlaylists.length === 0 && recentPlaylists.length === 0 && (
                <div className="text-center py-6 text-zinc-500 text-[10px] font-medium">
                  Không tìm thấy danh sách phát.
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-3 mt-1 border-t border-zinc-800/40 shrink-0 gap-2 items-center">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-1.5 hover:text-white text-zinc-400 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
          >
            Hủy
          </button>
          
          <button
            type="button"
            onClick={handleSave}
            disabled={isLoading || isSaving}
            className="px-5 py-1.5 bg-white text-black hover:scale-105 active:scale-95 transition-all rounded-full font-bold text-xs disabled:opacity-50 disabled:scale-100 cursor-pointer flex items-center gap-1.5"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Lưu...
              </>
            ) : (
              'Xong'
            )}
          </button>
        </div>
      </div>
    </>
  );
};
