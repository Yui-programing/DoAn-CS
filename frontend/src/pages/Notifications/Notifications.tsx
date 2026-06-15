import { Bell, Mail, UserPlus, Info, Check } from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext';
import type { Notification } from '../../types';

export const Notifications = () => {
  const { notifications, markAsRead, markAllAsRead } = useNotification();

  const getIcon = (type: number) => {
    switch (type) {
      case 0: return <Mail className="w-5 h-5 text-blue-400" />;
      case 1: return <UserPlus className="w-5 h-5 text-green-400" />;
      default: return <Info className="w-5 h-5 text-amber-400" />;
    }
  };

  const parsePayload = (payloadJson: string) => {
    try {
      const data = JSON.parse(payloadJson);
      return data.message || data.content || "Có thông báo mới";
    } catch {
      return payloadJson;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      hour: '2-digit', minute: '2-digit',
      day: '2-digit', month: '2-digit', year: 'numeric'
    }).format(date);
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
        {notifications.some(n => !n.isRead) && (
          <button 
            onClick={markAllAsRead}
            className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-green-400 text-xs font-bold px-4 py-2 rounded-full border border-zinc-800 transition-colors"
          >
            <Check className="w-4.5 h-4.5 stroke-[2.5]" />
            <span>Đánh dấu đã đọc</span>
          </button>
        )}
      </div>

      {/* Danh sách thông báo */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 flex flex-col items-center">
            <Bell className="w-8 h-8 mb-2 opacity-20" />
            <p className="text-sm">Chưa có thông báo nào.</p>
          </div>
        ) : (
          notifications.map((n: Notification) => (
            <div 
              key={n.id}
              onClick={() => { if (!n.isRead) markAsRead(n.id); }}
              className={`p-4 rounded-xl border transition-all flex gap-4 items-start cursor-pointer ${
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
                  {parsePayload(n.payloadJson)}
                </p>
                <span className="block text-[10px] text-zinc-500 font-bold mt-1">{formatDate(n.createdAt)}</span>
              </div>

              {/* Chấm tròn chưa đọc */}
              {!n.isRead && (
                <span className="w-2 h-2 bg-green-500 rounded-full mt-2 shrink-0 animate-pulse" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
