import { useEffect, useState } from 'react';
import { X, Music, Eye, Clock, Check } from 'lucide-react';
import { mediaService } from '../services';
import { formatDuration, formatViewCount } from '../utils';

interface RightPanelProps {
  track: any;
  onClose: () => void;
  isTrackInPlaylist?: boolean;
  onAddToPlaylist?: () => void;
}

export const RightPanel = ({ track, onClose, isTrackInPlaylist, onAddToPlaylist }: RightPanelProps) => {
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!track?.id) {
      setDetails(null);
      return;
    }

    let isMounted = true;
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const res = await mediaService.getMediaDetails(track.id);
        if (res.success && isMounted) {
          setDetails(res.data);
        }
      } catch (error) {
        console.error('Lỗi khi tải chi tiết bài hát:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDetails();

    return () => {
      isMounted = false;
    };
  }, [track?.id]);

  if (!track) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center h-full text-zinc-500 animate-fadeIn">
        <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-4 border border-zinc-800">
          <Music className="w-8 h-8 text-zinc-600" />
        </div>
        <h4 className="font-bold text-slate-350 text-sm">Chưa phát bài hát nào</h4>
        <p className="text-xs text-zinc-500 mt-2 max-w-[200px] leading-relaxed">
          Hãy chọn một bài hát bất kỳ từ Trang chủ hoặc Thư viện để bắt đầu nghe và xem thông tin chi tiết.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-900 shrink-0">
        <span className="text-sm font-bold text-slate-200">Chi tiết bài hát</span>
        <button
          onClick={onClose}
          className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-full transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-thin scrollbar-thumb-zinc-800">
        {/* Cover Image */}
        <div className="w-full aspect-square bg-zinc-900 rounded-xl border border-zinc-800 shadow-lg overflow-hidden group relative">
          {track.coverUrl ? (
            <img
              src={mediaService.getImageUrl(track.coverUrl)}
              alt={track.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-500/10 to-zinc-900">
              <Music className="w-16 h-16 text-green-400/50" />
            </div>
          )}
        </div>

        {/* Title, Artist & Save button */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-xl font-bold text-slate-100 hover:text-green-400 cursor-pointer transition-colors line-clamp-2" title={track.title}>
              {track.title}
            </h3>
            <p className="text-sm text-zinc-400 mt-1 hover:underline cursor-pointer font-medium inline-block">
              {track.artist}
            </p>
          </div>
          
          {onAddToPlaylist && (
            <button 
              onClick={onAddToPlaylist}
              className="text-zinc-450 hover:text-white transition-all duration-200 p-1 cursor-pointer hover:scale-105 active:scale-90 shrink-0 mt-1"
              title="Lưu vào danh sách phát"
            >
              {isTrackInPlaylist ? (
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-black">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              ) : (
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-[2.2]">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="16" />
                  <line x1="8" y1="12" x2="16" y2="12" />
                </svg>
              )}
            </button>
          )}
        </div>

        {/* Listen Stats & Duration */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-zinc-900/60 border border-zinc-900/80 rounded-xl flex flex-col gap-1">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-zinc-555" />
              Lượt nghe
            </span>
            <span className="text-sm font-bold text-slate-200 mt-0.5">
              {loading ? '...' : details ? formatViewCount(details.viewCount) : '...'}
            </span>
          </div>

          <div className="p-3 bg-zinc-900/60 border border-zinc-900/80 rounded-xl flex flex-col gap-1">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-zinc-555" />
              Thời lượng
            </span>
            <span className="text-sm font-bold text-slate-200 mt-0.5">
              {loading ? '...' : details ? formatDuration(details.durationInSeconds) : track.duration || '...'}
            </span>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Thông tin chi tiết</h4>
          <div className="p-3 bg-zinc-900/30 border border-zinc-900/60 rounded-xl text-xs text-zinc-300 leading-relaxed min-h-[80px] whitespace-pre-wrap">
            {loading ? (
              <div className="text-zinc-500 italic text-center py-4">Đang tải mô tả bài hát...</div>
            ) : details?.description ? (
              details.description
            ) : (
              'Không có mô tả chi tiết cho bài hát này.'
            )}
          </div>
        </div>

        {/* Artist Profile Info Card */}
        <div className="p-4 bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-900 rounded-2xl flex flex-col gap-4 relative overflow-hidden group/artist">
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-emerald-400 border border-zinc-700 uppercase shrink-0">
              {track.artist ? track.artist.charAt(0) : 'A'}
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Nghệ sĩ chính</span>
              <h4 className="text-sm font-bold text-slate-200 group-hover/artist:text-green-400 transition-colors truncate">
                {track.artist}
              </h4>
            </div>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed relative z-10">
            Thưởng thức và khám phá thêm nhiều tác phẩm âm nhạc khác của nghệ sĩ {track.artist} được cập nhật liên tục trên nền tảng TuneVault.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RightPanel;
