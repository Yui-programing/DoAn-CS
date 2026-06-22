import React, { useState, useEffect } from 'react';
import { X, Search, Send, CheckCircle2, User } from 'lucide-react';
import { followService } from '../services/followService';
import { shareService } from '../services/shareService';
import { mediaService } from '../services';
import type { UserProfile } from '../types';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaItemId?: string;
  playlistId?: string;
  albumId?: string;
  title: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, mediaItemId, playlistId, albumId, title }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [sendingTo, setSendingTo] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      setMessage('');
      setSearchQuery('');
      setSuccessMsg('');
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await followService.getFollowingUsers();
      if (res.success) {
        setUsers(res.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async (receiverId: string) => {
    if (!receiverId) return;
    setSendingTo(receiverId);
    try {
      if (mediaItemId) {
        await shareService.shareMedia({ receiverId, mediaItemId, message });
      } else if (playlistId) {
        await shareService.sharePlaylist({ receiverId, playlistId, message });
      } else if (albumId) {
        await shareService.shareAlbum({ receiverId, albumId, message });
      }
      setSuccessMsg('Đã chia sẻ thành công!');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      alert("Chia sẻ thất bại!");
    } finally {
      setSendingTo(null);
    }
  };

  if (!isOpen) return null;

  const filteredUsers = users.filter(u => 
    u.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[85vh] animate-slideUp">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-100">Chia sẻ {title}</h2>
          <button 
            onClick={onClose}
            className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {successMsg ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 gap-4">
            <CheckCircle2 className="w-16 h-16 text-green-400" />
            <p className="text-xl font-bold text-slate-100">{successMsg}</p>
          </div>
        ) : (
          <>
            {/* Search Bar */}
            <div className="p-4 border-b border-zinc-800">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm người bạn đang theo dõi..."
                  className="w-full bg-black border border-zinc-800 rounded-full py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-zinc-500 focus:outline-none focus:border-green-500 transition-colors"
                />
              </div>
            </div>
            {/* Message Input */}
            <div className="p-4 border-b border-zinc-800">
              <textarea 
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Thêm lời nhắn (Không bắt buộc)..."
                className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-sm text-slate-100 placeholder-zinc-500 focus:outline-none focus:border-green-500 transition-colors resize-none h-20"
              />
            </div>

            {/* User List */}
            <div className="flex-1 overflow-y-auto p-2">
              {loading ? (
                <div className="p-4 text-center text-zinc-500 text-sm">Đang tải danh sách...</div>
              ) : filteredUsers.length === 0 ? (
                <div className="p-4 text-center text-zinc-500 text-sm">
                  {searchQuery ? 'Không tìm thấy người dùng.' : 'Bạn chưa theo dõi ai.'}
                </div>
              ) : (
                filteredUsers.map(user => (
                  <div key={user.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-zinc-800 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-zinc-700 overflow-hidden shrink-0">
                        {user.avatarUrl ? (
                          <img 
                            src={mediaService.getImageUrl(user.avatarUrl)} 
                            alt="" 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || 'User')}&background=3f3f46&color=fff`;
                            }}
                          />
                        ) : (
                          <User className="w-full h-full p-2 text-zinc-400" />
                        )}
                      </div>
                      <span className="font-bold text-sm text-slate-200 truncate">{user.fullName}</span>
                    </div>
                    <button 
                      onClick={() => handleShare(user.id!)}
                      disabled={sendingTo === user.id}
                      className="ml-4 px-4 py-1.5 bg-green-500 hover:bg-green-400 disabled:opacity-50 text-black text-xs font-bold rounded-full transition-transform active:scale-95 flex items-center gap-2 shrink-0"
                    >
                      {sendingTo === user.id ? 'Đang gửi...' : (
                        <>
                          <Send className="w-3 h-3" />
                          Gửi
                        </>
                      )}
                    </button>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
