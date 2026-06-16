import React, { useState, useEffect } from 'react';
import { X, ListPlus, Loader2, AlertCircle, Plus } from 'lucide-react';
import { playlistService } from '../services/playlistService';
import type { Playlist } from '../types';

interface AddToPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaItemId: string; // ID của bài hát cần thêm
}

export const AddToPlaylistModal: React.FC<AddToPlaylistModalProps> = ({ isOpen, onClose, mediaItemId }) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchPlaylists();
      setError(null);
      setSuccess(null);
    }
  }, [isOpen]);

  const fetchPlaylists = async () => {
    try {
      setIsLoading(true);
      const res = await playlistService.getMyPlaylists();
      if (res.success) {
        setPlaylists(res.data);
      }
    } catch (err) {
      console.error(err);
      setError("Không thể tải danh sách playlist.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToPlaylist = async (playlistId: string) => {
    if (!mediaItemId) return;
    
    setActionLoadingId(playlistId);
    setError(null);
    setSuccess(null);

    try {
      const res = await playlistService.addTrack(playlistId, mediaItemId);
      if (res.success) {
        setSuccess("Đã thêm thành công!");
        // Đóng sau 1 giây
        setTimeout(() => {
          onClose();
          setSuccess(null);
        }, 1000);
      } else {
        setError(res.message || "Không thể thêm vào danh sách này.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Lỗi khi thêm bài hát.");
    } finally {
      setActionLoadingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fadeIn"
        onClick={!actionLoadingId ? onClose : undefined}
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-slideUp flex flex-col max-h-[80vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800 shrink-0">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <ListPlus className="w-5 h-5 text-green-400" />
            Lưu vào thư viện
          </h2>
          <button 
            onClick={onClose}
            disabled={!!actionLoadingId}
            className="text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 flex-1">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2 text-green-400 text-xs font-semibold">
              <ListPlus className="w-4 h-4 shrink-0" />
              <p>{success}</p>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
            </div>
          ) : playlists.length === 0 ? (
            <div className="text-center py-10 text-zinc-500 text-sm">
              Bạn chưa có Playlist hoặc Album nào.
            </div>
          ) : (
            <div className="space-y-2">
              {playlists.map(playlist => (
                <button
                  key={playlist.id}
                  onClick={() => handleAddToPlaylist(playlist.id)}
                  disabled={!!actionLoadingId}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-zinc-800/30 hover:bg-zinc-800 border border-zinc-800/50 transition-colors group disabled:opacity-50 text-left"
                >
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-slate-200 line-clamp-1 group-hover:text-green-400 transition-colors">
                      {playlist.title}
                    </h4>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {playlist.type === 1 ? 'Album' : 'Playlist'} • {playlist.tracksCount} bài hát
                    </p>
                  </div>
                  {actionLoadingId === playlist.id ? (
                    <Loader2 className="w-4 h-4 text-green-400 animate-spin shrink-0" />
                  ) : (
                    <Plus className="w-4 h-4 text-zinc-500 group-hover:text-green-400 shrink-0 transition-colors" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
