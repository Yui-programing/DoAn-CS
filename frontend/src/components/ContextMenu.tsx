import React, { useEffect, useRef } from 'react';
import { Plus, Share2 } from 'lucide-react';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onAddToPlaylist: () => void;
  onShare: () => void;
  isPlaylist?: boolean;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, onClose, onAddToPlaylist, onShare, isPlaylist }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Điều chỉnh vị trí để không bị tràn màn hình
  const screenW = window.innerWidth;
  const screenH = window.innerHeight;
  const menuW = 224; // w-56 = 224px
  const menuH = isPlaylist ? 50 : 100; // Playlist chỉ có 1 nút nên chiều cao ngắn hơn

  const left = x + menuW > screenW ? screenW - menuW - 10 : x;
  const top = y + menuH > screenH ? screenH - menuH - 10 : y;

  return (
    <div
      ref={menuRef}
      style={{ top: `${top}px`, left: `${left}px` }}
      className="fixed w-56 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl z-[9999] overflow-hidden py-1 animate-fadeIn text-sm text-slate-100"
    >
      {!isPlaylist && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddToPlaylist();
          }}
          className="w-full text-left px-4 py-2.5 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors flex items-center gap-3 font-semibold cursor-pointer"
        >
          <Plus className="w-4.5 h-4.5 text-zinc-400" />
          <span>Thêm vào Playlist/Album</span>
        </button>
      )}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onShare();
        }}
        className="w-full text-left px-4 py-2.5 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors flex items-center gap-3 font-semibold cursor-pointer"
      >
        <Share2 className="w-4.5 h-4.5 text-zinc-400" />
        <span>{isPlaylist ? "Chia sẻ danh sách phát" : "Chia sẻ bài hát"}</span>
      </button>
    </div>
  );
};
