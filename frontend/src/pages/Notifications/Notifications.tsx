import { useState } from 'react';
import { Bell, Mail, UserPlus, Info, Check } from 'lucide-react';

const initialNotifications = [
  { id: '1', type: 0, text: 'Lê Phạm Hoàng Phúc đã chia sẻ một playlist cho bạn.', payload: 'Giai điệu thư giãn cuối tuần', isRead: false, time: '2 giờ trước' },
  { id: '2', type: 1, text: 'Ngọt Band vừa tải lên album mới "Tuyển tập Indie".', payload: null, isRead: true, time: '1 ngày trước' },
  { id: '3', type: 2, text: 'Hệ thống đã kết nối thành công tới máy chủ dữ liệu SQL Server.', payload: null, isRead: true, time: '2 ngày trước' },
];

export const Notifications = () => {
  const [notifications, setNotifications] = useState(initialNotifications);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const getIcon = (type: number) => {
    switch (type) {
      case 0: return <Mail className="w-5 h-5 text-blue-400" />;
      case 1: return <UserPlus className="w-5 h-5 text-green-400" />;
      default: return <Info className="w-5 h-5 text-amber-400" />;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Thông báo */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-6 h-6 text-green-400" />
          <h2 className="text-2xl font-bold tracking-tight">Thông báo</h2>
        </div>
        
        {/* Nút Đọc tất cả */}
        <button 
          onClick={markAllAsRead}
          className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-green-400 text-xs font-bold px-4 py-2 rounded-full border border-zinc-800 transition-colors"
        >
          <Check className="w-4.5 h-4.5 stroke-[2.5]" />
          <span>Đánh dấu đã đọc</span>
        </button>
      </div>

      {/* Danh sách thông báo */}
      <div className="space-y-3">
        {notifications.map((n) => (
          <div 
            key={n.id}
            className={`p-4 rounded-xl border transition-all flex gap-4 items-start ${
              n.isRead 
                ? 'bg-zinc-900/10 border-zinc-900/50 text-zinc-400' 
                : 'bg-zinc-900/40 border-zinc-800/80 text-slate-100 shadow-md shadow-green-500/[0.01]'
            }`}
          >
            {/* Icon vòng tròn */}
            <div className={`p-2.5 rounded-lg shrink-0 ${n.isRead ? 'bg-zinc-900/80' : 'bg-zinc-900 border border-zinc-800'}`}>
              {getIcon(n.type)}
            </div>

            {/* Nội dung thông báo */}
            <div className="flex-1 min-w-0 space-y-1">
              <p className={`text-sm font-semibold leading-relaxed ${n.isRead ? 'text-zinc-400' : 'text-slate-200'}`}>
                {n.text}
              </p>
              {n.payload && (
                <span className="inline-block bg-zinc-900 text-[10px] font-bold text-green-400 px-2 py-0.5 rounded border border-zinc-800">
                  {n.payload}
                </span>
              )}
              <span className="block text-[10px] text-zinc-500 font-bold">{n.time}</span>
            </div>

            {/* Chấm tròn chưa đọc */}
            {!n.isRead && (
              <span className="w-2 h-2 bg-green-500 rounded-full mt-2 shrink-0 animate-pulse" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;
