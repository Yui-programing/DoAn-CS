import React, { useState, useEffect, useRef } from 'react';
import { MoreVertical, ListPlus, Share2, Trash2 } from 'lucide-react';

interface TrackDropdownMenuProps {
  onAddToPlaylist: () => void;
  onShare: () => void;
  onRemoveFromPlaylist?: () => void;
}

export const TrackDropdownMenu: React.FC<TrackDropdownMenuProps> = ({ onAddToPlaylist, onShare, onRemoveFromPlaylist }) => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, right: 0 });

  // Đóng dropdown khi click ra ngoài hoặc cuộn chuột
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Bỏ qua click vào nút mở menu vì nút đó tự xử lý đóng/mở
      if (buttonRef.current && buttonRef.current.contains(event.target as Node)) {
        return;
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleScroll = () => {
      if (isOpen) setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // capture: true để bắt sự kiện cuộn từ bất kỳ div nào bên trong
      window.addEventListener('scroll', handleScroll, true); 
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen]);

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom, 
        right: window.innerWidth - rect.right
      });
    }
    setIsOpen(!isOpen);
  };

  return (
    <>
      <button 
        ref={buttonRef}
        onClick={toggleMenu}
        className="opacity-0 group-hover:opacity-100 hover:text-green-400 transition-all p-1"
      >
        <MoreVertical className="w-5 h-5" />
      </button>

      {isOpen && (
        <div 
          ref={dropdownRef} 
          onClick={(e) => e.stopPropagation()}
          style={{ position: 'fixed', top: `${position.top + 8}px`, right: `${position.right}px` }}
          className="w-56 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl z-[9999] overflow-hidden py-1 animate-fadeIn"
        >
          <button 
            onClick={() => {
              setIsOpen(false);
              onAddToPlaylist();
            }}
            className="w-full px-4 py-3 flex items-center gap-3 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors text-left"
          >
            <ListPlus className="w-4 h-4" />
            <span className="font-semibold">Thêm vào Playlist/Album</span>
          </button>
          
          <button 
            onClick={() => {
              setIsOpen(false);
              onShare();
            }}
            className="w-full px-4 py-3 flex items-center gap-3 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors text-left border-b border-zinc-800"
          >
            <Share2 className="w-4 h-4" />
            <span className="font-semibold">Chia sẻ bài hát</span>
          </button>

          {onRemoveFromPlaylist && (
            <button 
              onClick={() => {
                setIsOpen(false);
                onRemoveFromPlaylist();
              }}
              className="w-full px-4 py-3 flex items-center gap-3 text-sm text-red-400 hover:text-red-300 hover:bg-zinc-800 transition-colors text-left"
            >
              <Trash2 className="w-4 h-4" />
              <span className="font-semibold">Xóa khỏi Playlist</span>
            </button>
          )}
        </div>
      )}
    </>
  );
};
