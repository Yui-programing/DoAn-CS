import React, { useState, useEffect, useRef } from 'react';
import { Mail, Send, Music, ExternalLink, Search, User, Check, Clock, Disc } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { inboxService } from '../../services/inboxService';
import { shareService } from '../../services/shareService';
import type { InboxContact, ChatHistoryItem } from '../../types';
import { mediaService } from '../../services';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '../../contexts/PlayerContext';

export const ShareInbox = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'main' | 'requests'>('main');
  const [mainContacts, setMainContacts] = useState<InboxContact[]>([]);
  const [requestContacts, setRequestContacts] = useState<InboxContact[]>([]);
  const [selectedUser, setSelectedUser] = useState<InboxContact | null>(null);
  
  const navigate = useNavigate();
  const { playTrack } = usePlayer();
  
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const res = await inboxService.getContacts();
      if (res.success) {
        setMainContacts(res.data.mainInbox);
        setRequestContacts(res.data.messageRequests);
      }
    } catch (error) {
      console.error("Failed to fetch contacts", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChatHistory = async (otherUserId: string) => {
    try {
      const res = await inboxService.getChatHistory(otherUserId);
      if (res.success) {
        setChatHistory(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch chat history", error);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchChatHistory(selectedUser.userId);
    } else {
      setChatHistory([]);
    }
  }, [selectedUser]);

  useEffect(() => {
    // Scroll to bottom when chat updates
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleAcceptRequest = async () => {
    if (!selectedUser) return;
    try {
      const res = await inboxService.acceptMessageRequest(selectedUser.userId);
      if (res.success) {
        // Move from requests to main, avoiding duplicates
        const newRequests = requestContacts.filter(c => c.userId !== selectedUser.userId);
        setRequestContacts(newRequests);
        setMainContacts(prev => {
          const filtered = prev.filter(c => c.userId !== selectedUser.userId);
          return [selectedUser, ...filtered];
        });
        setActiveTab('main');
      }
    } catch (error) {
      console.error("Failed to accept", error);
    }
  };

  // Currently we don't have a plain text message endpoint, 
  // but if we do, we could send it. For now, sending a message in chat 
  // requires attaching a media/playlist. We can simulate sending a text-only
  // message by calling shareService if it supports text only, 
  // but the backend requires MediaItemId, PlaylistId or AlbumId.
  // Wait, backend allows MediaItemId = null? No, it's NOT NULL in Dto but NULL in DB.
  // Let's implement a dummy handleSend or alert for now.
  const handleSend = () => {
    if (!messageInput.trim() || !selectedUser) return;
    alert("Vui lòng đính kèm một bài hát/playlist để gửi tin nhắn (Chức năng chat chay chưa hỗ trợ ở bản này).");
    setMessageInput('');
  };

  const displayedContacts = activeTab === 'main' ? mainContacts : requestContacts;

  return (
    <div className="h-full flex flex-col gap-4 animate-fadeIn">
      <div className="flex items-center gap-2 border-b border-zinc-900 pb-4 shrink-0">
        <Mail className="w-6 h-6 text-green-400" />
        <h2 className="text-2xl font-bold tracking-tight">Hộp thư chia sẻ</h2>
      </div>

      {/* 2 Column Layout */}
      <div className="flex-1 min-h-[500px] flex gap-4 overflow-hidden">
        
        {/* Left Column: Contacts List */}
        <div className="w-1/3 bg-zinc-900/10 border border-zinc-900 rounded-2xl flex flex-col overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-zinc-900">
            <button 
              onClick={() => setActiveTab('main')}
              className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'main' ? 'text-green-400 border-b-2 border-green-400' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Hộp thư
            </button>
            <button 
              onClick={() => setActiveTab('requests')}
              className={`flex-1 py-3 text-sm font-bold transition-colors flex items-center justify-center gap-2 ${activeTab === 'requests' ? 'text-green-400 border-b-2 border-green-400' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Tin nhắn chờ
              {requestContacts.length > 0 && (
                <span className="bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {requestContacts.length}
                </span>
              )}
            </button>
          </div>

          {/* Contact List */}
          <div className="flex-1 overflow-y-auto p-2">
            {loading ? (
              <div className="p-4 text-center text-zinc-500 text-sm">Đang tải...</div>
            ) : displayedContacts.length === 0 ? (
              <div className="p-4 text-center text-zinc-500 text-sm mt-10">
                Không có tin nhắn nào.
              </div>
            ) : (
              displayedContacts.map(contact => (
                <div 
                  key={contact.userId}
                  onClick={() => setSelectedUser(contact)}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${selectedUser?.userId === contact.userId ? 'bg-zinc-800' : 'hover:bg-zinc-900/50'}`}
                >
                  <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden flex-shrink-0">
                    {contact.avatarUrl ? (
                      <img 
                        src={mediaService.getImageUrl(contact.avatarUrl)} 
                        alt="" 
                        className="w-full h-full object-cover" 
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(contact.fullName || 'User')}&background=3f3f46&color=fff`;
                        }}
                      />
                    ) : (
                      <User className="w-full h-full p-2 text-zinc-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-200 truncate">{contact.fullName}</h4>
                    <p className="text-xs text-zinc-500 truncate">{contact.lastMessage || 'Đã gửi một tệp đính kèm'}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Chat Window */}
        <div className="flex-1 bg-zinc-900/10 border border-zinc-900 rounded-2xl flex flex-col overflow-hidden relative">
          {!selectedUser ? (
            <div className="flex-1 flex flex-col items-center justify-center text-zinc-500">
              <Mail className="w-12 h-12 mb-2 opacity-20" />
              <p>Chọn một cuộc trò chuyện để xem tin nhắn</p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-zinc-900 flex items-center gap-3 bg-zinc-950/50">
                <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden flex-shrink-0">
                  {selectedUser.avatarUrl ? (
                    <img 
                      src={mediaService.getImageUrl(selectedUser.avatarUrl)} 
                      alt="" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser.fullName || 'User')}&background=3f3f46&color=fff`;
                      }}
                    />
                  ) : (
                    <User className="w-full h-full p-2 text-zinc-500" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-slate-200">{selectedUser.fullName}</h3>
                  <p className="text-xs text-zinc-500">Đang trò chuyện</p>
                </div>
              </div>

              {/* Lịch sử tin nhắn */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatHistory.map((msg) => {
                  const isMe = msg.senderId === user?.id;
                  
                  // Helper function to render attached media
                  const renderAttachment = () => {
                    if (msg.mediaItemId) {
                      return (
                        <div 
                          onClick={() => {
                            playTrack({
                              id: msg.mediaItemId!,
                              title: msg.attachedMediaTitle || 'Bài hát',
                              artist: 'Shared Track',
                              coverUrl: msg.attachedMediaCoverUrl,
                              duration: '0:00',
                              filePath: mediaService.getStreamUrl(msg.mediaItemId!)
                            });
                          }}
                          className="flex items-center gap-3 p-3 bg-black/40 border border-white/5 rounded-xl mt-2 w-64 cursor-pointer hover:bg-black/60 transition-colors"
                        >
                          <div className="w-10 h-10 rounded-md overflow-hidden bg-zinc-800 shrink-0">
                             {msg.attachedMediaCoverUrl ? <img src={mediaService.getImageUrl(msg.attachedMediaCoverUrl)} className="w-full h-full object-cover" /> : <Music className="w-full h-full p-2 text-zinc-500" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-bold truncate block text-slate-200">{msg.attachedMediaTitle || 'Bài hát chưa rõ'}</span>
                            <span className="text-[10px] text-zinc-500">Bài hát</span>
                          </div>
                          <ExternalLink className="w-4 h-4 text-green-400 shrink-0" />
                        </div>
                      );
                    }
                    if (msg.playlistId) {
                       return (
                        <div 
                          onClick={() => navigate(`/playlist/${msg.playlistId}`)}
                          className="flex items-center gap-3 p-3 bg-black/40 border border-white/5 rounded-xl mt-2 w-64 cursor-pointer hover:bg-black/60 transition-colors"
                        >
                          <div className="w-10 h-10 rounded-md overflow-hidden bg-zinc-800 shrink-0 flex items-center justify-center">
                             <Disc className="w-5 h-5 text-zinc-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-bold truncate block text-slate-200">Playlist đính kèm</span>
                            <span className="text-[10px] text-zinc-500">Playlist</span>
                          </div>
                          <ExternalLink className="w-4 h-4 text-green-400 shrink-0" />
                        </div>
                      );
                    }
                    if (msg.albumId) {
                      return (
                       <div 
                         onClick={() => navigate(`/album/${msg.albumId}`)}
                         className="flex items-center gap-3 p-3 bg-black/40 border border-white/5 rounded-xl mt-2 w-64 cursor-pointer hover:bg-black/60 transition-colors"
                       >
                         <div className="w-10 h-10 rounded-md overflow-hidden bg-zinc-800 shrink-0 flex items-center justify-center">
                            <Disc className="w-5 h-5 text-zinc-500" />
                         </div>
                         <div className="flex-1 min-w-0">
                           <span className="text-xs font-bold truncate block text-slate-200">Album đính kèm</span>
                           <span className="text-[10px] text-zinc-500">Album</span>
                         </div>
                         <ExternalLink className="w-4 h-4 text-green-400 shrink-0" />
                       </div>
                     );
                   }
                    return null;
                  };

                  return (
                    <div 
                      key={msg.id}
                      className={`flex flex-col w-full ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div className={`p-3 rounded-2xl shadow-sm max-w-[80%] ${
                        isMe 
                          ? 'bg-green-600/90 text-slate-100 rounded-tr-sm' 
                          : 'bg-zinc-900 border border-zinc-800 text-slate-200 rounded-tl-sm'
                      }`}>
                        {msg.message && <p className="text-sm font-medium whitespace-pre-wrap">{msg.message}</p>}
                        {renderAttachment()}
                      </div>
                      <span className="text-[10px] text-zinc-600 font-bold mt-1 px-1">
                        {new Date(msg.sharedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input or Accept Button */}
              <div className="p-4 bg-zinc-950 border-t border-zinc-900 shrink-0">
                {activeTab === 'requests' ? (
                  <div className="flex flex-col items-center justify-center gap-3">
                    <p className="text-xs text-zinc-500">Chấp nhận tin nhắn để có thể xem nội dung người này chia sẻ</p>
                    <button 
                      onClick={handleAcceptRequest}
                      className="px-6 py-2.5 bg-green-500 hover:bg-green-400 text-black font-bold rounded-full transition-transform active:scale-95 flex items-center gap-2 text-sm"
                    >
                      <Check className="w-4 h-4" />
                      Chấp nhận
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-center">
                    <p className="text-xs text-zinc-600 font-medium">Hộp thư này chỉ dùng để hiển thị các bài hát/album/playlist được chia sẻ.</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareInbox;
