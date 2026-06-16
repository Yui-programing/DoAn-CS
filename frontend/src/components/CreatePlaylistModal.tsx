import React, { useState, useEffect } from 'react';
import { X, ListMusic, Loader2, AlertCircle } from 'lucide-react';
import { playlistService } from '../services/playlistService';
import type { Playlist } from '../types';

interface CreatePlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  playlistToEdit?: Playlist | null; // Nếu có, modal sẽ chuyển sang chế độ Sửa
}

export const CreatePlaylistModal: React.FC<CreatePlaylistModalProps> = ({ isOpen, onClose, playlistToEdit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [type, setType] = useState<number>(0); // 0: Playlist, 1: Album
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Khi mở Modal hoặc đổi playlistToEdit, nạp dữ liệu vào form
  useEffect(() => {
    if (isOpen) {
      if (playlistToEdit) {
        setTitle(playlistToEdit.title);
        setDescription(playlistToEdit.description || '');
        setIsPublic(playlistToEdit.isPublic);
        setType(playlistToEdit.type);
      } else {
        // Reset form cho tạo mới
        setTitle('');
        setDescription('');
        setIsPublic(true);
        setType(0);
      }
      setError(null);
      setSuccess(null);
    }
  }, [isOpen, playlistToEdit]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!title.trim()) {
      setError("Vui lòng nhập tên.");
      return;
    }

    setIsLoading(true);

    try {
      const data = {
        title,
        description,
        isPublic,
        type
      };

      let res;
      if (playlistToEdit) {
        res = await playlistService.updatePlaylist(playlistToEdit.id, data);
      } else {
        res = await playlistService.createPlaylist(data);
      }
      
      if (res.success) {
        setSuccess(playlistToEdit ? "Cập nhật thành công!" : "Tạo thành công!");
        
        // Đóng modal sau 1 giây
        setTimeout(() => {
          onClose();
          setSuccess(null);
          // Báo cho toàn bộ app biết là có playlist mới để tự động fetch lại
          window.dispatchEvent(new Event('playlistChanged'));
        }, 1000);
      } else {
        setError(res.message || "Có lỗi xảy ra.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Lỗi kết nối máy chủ.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fadeIn"
        onClick={!isLoading ? onClose : undefined}
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-slideUp flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800 shrink-0">
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <ListMusic className="w-6 h-6 text-green-400" />
            {playlistToEdit ? 'Chỉnh sửa' : 'Tạo mới'}
          </h2>
          <button 
            onClick={onClose}
            disabled={isLoading}
            className="text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-400 text-sm font-semibold">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-3 text-green-400 text-sm font-semibold">
              <ListMusic className="w-5 h-5 shrink-0" />
              <p>{success}</p>
            </div>
          )}

          <form id="playlist-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Loại (Playlist / Album) */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-zinc-300">Loại <span className="text-red-400">*</span></label>
              <div className="flex gap-4">
                <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-colors ${type === 0 ? 'border-green-500 bg-green-500/10 text-green-400' : 'border-zinc-700 hover:border-zinc-500 text-zinc-400'}`}>
                  <input 
                    type="radio" 
                    name="type" 
                    value={0} 
                    checked={type === 0} 
                    onChange={() => setType(0)} 
                    className="hidden"
                  />
                  <span className="font-semibold text-sm">Playlist</span>
                </label>
                <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-colors ${type === 1 ? 'border-green-500 bg-green-500/10 text-green-400' : 'border-zinc-700 hover:border-zinc-500 text-zinc-400'}`}>
                  <input 
                    type="radio" 
                    name="type" 
                    value={1} 
                    checked={type === 1} 
                    onChange={() => setType(1)} 
                    className="hidden"
                  />
                  <span className="font-semibold text-sm">Album</span>
                </label>
              </div>
            </div>

            {/* Title */}
            <div className="flex flex-col gap-2">
              <label htmlFor="title" className="text-sm font-semibold text-zinc-300">Tên {type === 0 ? 'Playlist' : 'Album'} <span className="text-red-400">*</span></label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={type === 0 ? "VD: Nhạc quẩy cuối tuần" : "VD: Tên Album"}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-slate-100 placeholder-zinc-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
              />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-2">
              <label htmlFor="description" className="text-sm font-semibold text-zinc-300">Mô tả (Tùy chọn)</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Vài dòng mô tả..."
                rows={3}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-slate-100 placeholder-zinc-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors resize-none"
              />
            </div>

            {/* Public/Private Toggle */}
            <div className="flex items-center gap-3 p-4 bg-zinc-800/50 rounded-lg border border-zinc-800">
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                />
                <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
              </label>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-200">Công khai</span>
                <span className="text-xs text-zinc-400">Người khác có thể tìm thấy và xem {type === 0 ? 'Playlist' : 'Album'} này.</span>
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-zinc-800 bg-zinc-900 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-6 py-2.5 rounded-full font-bold text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="submit"
            form="playlist-form"
            disabled={isLoading}
            className="px-8 py-2.5 rounded-full font-bold text-sm bg-green-500 hover:bg-green-400 text-black shadow-lg shadow-green-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang lưu...
              </>
            ) : (
              'Lưu lại'
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
