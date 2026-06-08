import { useParams, NavLink } from 'react-router-dom';
import { Play, Clock, Heart, Music, ArrowLeft } from 'lucide-react';

const mockPlaylistsData: Record<string, {
  title: string;
  description: string;
  owner: string;
  tracksCount: number;
  duration: string;
  tracks: Array<{ id: string; title: string; artist: string; duration: string; album: string }>;
}> = {
  '1': {
    title: 'Giai điệu thư giãn cuối tuần',
    description: 'Tuyển tập nhạc nhẹ nhàng, thư giãn dành riêng cho ngày nghỉ của bạn.',
    owner: 'Lê Phạm Hoàng Phúc',
    tracksCount: 3,
    duration: '1h 10m',
    tracks: [
      { id: 'm1', title: 'Lần Cuối', artist: 'Ngọt Band', duration: '3:30', album: 'Tuyển tập Indie' },
      { id: 'm2', title: 'Em Dạo Này', artist: 'Ngọt Band', duration: '3:15', album: 'Tuyển tập Indie' },
      { id: 'm6', title: 'Lofi Cafe Sài Gòn', artist: 'Nhiều nghệ sĩ', duration: '1:00:00', album: 'Single' },
    ]
  },
  '2': {
    title: 'Playlist chiến Valorant',
    description: 'Nhạc điện tử và game đầy nhiệt huyết, kích thích sự tập trung đỉnh cao.',
    owner: 'Lê Phạm Hoàng Phúc',
    tracksCount: 3,
    duration: '10m 5s',
    tracks: [
      { id: 'm3', title: 'Die For You', artist: 'Riot Games Music', duration: '3:25', album: 'Valorant Champions' },
      { id: 'm4', title: 'Ignite', artist: 'Riot Games Music', duration: '3:00', album: 'Worlds 2018' },
      { id: 'm5', title: 'Ticking Away', artist: 'Riot Games Music', duration: '3:40', album: 'Champions 2023' },
    ]
  }
};

export const PlaylistDetail = () => {
  const { id } = useParams<{ id: string }>();
  
  // Lấy dữ liệu playlist theo id, mặc định dùng playlist 1 nếu không thấy
  const playlist = (id && mockPlaylistsData[id]) || mockPlaylistsData['1'];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Nút quay lại */}
      <NavLink 
        to="/library" 
        className="inline-flex items-center gap-2 text-zinc-400 hover:text-green-400 text-sm font-semibold transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Quay lại thư viện</span>
      </NavLink>

      {/* Header Playlist */}
      <div className="flex flex-col md:flex-row items-center md:items-end gap-6 pb-6 border-b border-zinc-900">
        {/* Ảnh bìa */}
        <div className="w-48 h-48 bg-gradient-to-br from-green-500/20 to-zinc-900 rounded-2xl flex items-center justify-center border border-zinc-800 shadow-2xl shrink-0">
          <Music className="w-16 h-16 text-zinc-600" />
        </div>
        
        {/* Thông tin */}
        <div className="text-center md:text-left space-y-2">
          <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-widest bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">
            Danh sách phát
          </span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight mt-1 text-slate-100">
            {playlist.title}
          </h2>
          <p className="text-sm text-zinc-400 font-medium leading-relaxed max-w-xl">
            {playlist.description}
          </p>
          <div className="text-xs text-zinc-300 font-semibold pt-1 flex flex-wrap items-center justify-center md:justify-start gap-1">
            <span className="text-green-400 hover:underline cursor-pointer">{playlist.owner}</span>
            <span className="text-zinc-600">•</span>
            <span>{playlist.tracksCount} bài hát</span>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-400">{playlist.duration}</span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-4 py-2">
        <button className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center text-black shadow-lg shadow-green-500/10 hover:scale-105 active:scale-95 transition-transform">
          <Play className="w-6 h-6 fill-current ml-0.5" />
        </button>
        <button className="text-zinc-400 hover:text-green-400 transition-colors p-2">
          <Heart className="w-6 h-6" />
        </button>
      </div>

      {/* Danh sách các bài hát */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-900 text-zinc-500 text-xs font-bold uppercase tracking-wider">
              <th className="py-3 px-4 w-12 text-center">#</th>
              <th className="py-3 px-4">Tiêu đề</th>
              <th className="py-3 px-4">Album</th>
              <th className="py-3 px-4 w-20 text-center"><Clock className="w-4 h-4 mx-auto" /></th>
            </tr>
          </thead>
          <tbody>
            {playlist.tracks.map((track, index) => (
              <tr 
                key={track.id}
                className="hover:bg-zinc-900/40 border-b border-zinc-900/20 last:border-0 group cursor-pointer transition-colors"
              >
                <td className="py-4 px-4 text-center text-zinc-500 text-sm font-semibold group-hover:text-green-400">
                  {index + 1}
                </td>
                <td className="py-4 px-4 flex items-center gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-200 group-hover:text-green-400 transition-colors truncate max-w-xs">
                      {track.title}
                    </h4>
                    <p className="text-xs text-zinc-400 truncate max-w-xs">{track.artist}</p>
                  </div>
                </td>
                <td className="py-4 px-4 text-zinc-400 text-sm font-medium">
                  {track.album}
                </td>
                <td className="py-4 px-4 text-center text-zinc-400 text-sm font-semibold">
                  {track.duration}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PlaylistDetail;
