import { useState } from 'react';
import { Mail, Send, Music, ExternalLink } from 'lucide-react';

const initialMessages = [
  { id: '1', sender: 'Lê Phạm Hoàng Phúc', message: 'Nhạc này nghe lúc rảnh hay lắm nè!', playlistName: 'Giai điệu thư giãn cuối tuần', time: '20:15' },
  { id: '2', sender: 'Bạn', message: 'Cảm ơn ông nhé, đang code bật lofi nghe cuốn ghê.', playlistName: null, time: '20:18' }
];

export const ShareInbox = () => {
  const [messages, setMessages] = useState(initialMessages);
  const [inputValue, setInputValue] = useState('');

  const handleSend = () => {
    if (!inputValue.trim()) return;
    const newMsg = {
      id: Date.now().toString(),
      sender: 'Bạn',
      message: inputValue,
      playlistName: null,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([...messages, newMsg]);
    setInputValue('');
  };

  return (
    <div className="h-full flex flex-col gap-4 animate-fadeIn">
      {/* Header Hộp thư */}
      <div className="flex items-center gap-2 border-b border-zinc-900 pb-4 shrink-0">
        <Mail className="w-6 h-6 text-green-400" />
        <h2 className="text-2xl font-bold tracking-tight">Hộp thư chia sẻ</h2>
      </div>

      {/* Cửa sổ chat chính */}
      <div className="flex-1 min-h-[350px] bg-zinc-900/10 border border-zinc-900 rounded-2xl flex flex-col overflow-hidden">
        
        {/* Lịch sử tin nhắn */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => {
            const isMe = msg.sender === 'Bạn';
            return (
              <div 
                key={msg.id}
                className={`flex flex-col max-w-[70%] ${isMe ? 'ml-auto items-end' : 'items-start'}`}
              >
                {/* Tên người gửi */}
                <span className="text-[10px] text-zinc-500 font-bold mb-1 px-1">
                  {msg.sender}
                </span>

                {/* Bong bóng tin nhắn */}
                <div className={`p-4 rounded-2xl space-y-3 shadow-md ${
                  isMe 
                    ? 'bg-green-600 text-slate-100 rounded-tr-none' 
                    : 'bg-zinc-900 border border-zinc-800 text-slate-200 rounded-tl-none'
                }`}>
                  <p className="text-sm font-medium leading-relaxed">{msg.message}</p>
                  
                  {/* Nếu tin nhắn có đính kèm playlist */}
                  {msg.playlistName && (
                    <div className="flex items-center justify-between gap-4 p-3 bg-black/30 border border-black/10 rounded-xl">
                      <div className="flex items-center gap-2 min-w-0">
                        <Music className="w-4 h-4 text-green-400 shrink-0" />
                        <span className="text-xs font-bold truncate">{msg.playlistName}</span>
                      </div>
                      <button className="text-green-400 hover:text-green-300 p-1">
                        <ExternalLink className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Thời gian */}
                <span className="text-[9px] text-zinc-600 font-bold mt-1 px-1">{msg.time}</span>
              </div>
            );
          })}
        </div>

        {/* Ô nhập tin nhắn */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-900 flex gap-2 shrink-0">
          <input 
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Viết lời nhắn chia sẻ nhạc..."
            className="flex-1 px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-full text-sm placeholder-zinc-500 text-slate-100 focus:outline-none focus:border-green-500 transition-all"
          />
          <button 
            onClick={handleSend}
            className="w-11 h-11 bg-green-500 hover:bg-green-400 rounded-full flex items-center justify-center text-black shrink-0 transition-transform active:scale-95 shadow-md"
          >
            <Send className="w-4.5 h-4.5 fill-current ml-0.5" />
          </button>
        </div>

      </div>
    </div>
  );
};

export default ShareInbox;
