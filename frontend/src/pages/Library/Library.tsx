import { NavLink } from 'react-router-dom';
import { ListMusic, User, Plus, Grid } from 'lucide-react';

const mockPlaylists = [
  { id: '1', title: 'Giai điệu thư giãn cuối tuần', type: 'Danh sách phát', owner: 'Bạn', tracks: '3 bài hát' },
  { id: '2', title: 'Playlist chiến Valorant', type: 'Danh sách phát', owner: 'Bạn', tracks: '3 bài hát' },
  { id: 'a1', title: 'Ngọt Band', type: 'Nghệ sĩ', owner: 'Indie', tracks: '4.2M lượt nghe hàng tháng' },
  { id: 'a2', title: 'Riot Games Music', type: 'Nghệ sĩ', owner: 'Soundtrack', tracks: '12.5M lượt nghe hàng tháng' },
];

export const Library = () => {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Thư viện */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListMusic className="w-6 h-6 text-green-400" />
          <h2 className="text-2xl font-bold tracking-tight">Thư viện của bạn</h2>
        </div>
        
        {/* Nút thêm Playlist */}
        <button className="flex items-center gap-1 bg-green-500 hover:bg-green-400 text-black text-xs font-bold px-4 py-2 rounded-full transition-transform active:scale-95">
          <Plus className="w-4 h-4" />
          <span>Tạo playlist</span>
        </button>
      </div>

      {/* Tabs lọc loại */}
      <div className="flex gap-2">
        <span className="px-4 py-1.5 bg-zinc-900 border border-zinc-800 text-xs font-bold rounded-full cursor-pointer hover:bg-zinc-800 text-green-400">
          Tất cả
        </span>
        <span className="px-4 py-1.5 bg-zinc-900/50 border border-zinc-900 text-xs font-bold rounded-full cursor-pointer hover:bg-zinc-800 text-zinc-400">
          Danh sách phát
        </span>
        <span className="px-4 py-1.5 bg-zinc-900/50 border border-zinc-900 text-xs font-bold rounded-full cursor-pointer hover:bg-zinc-800 text-zinc-400">
          Nghệ sĩ
        </span>
      </div>

      {/* Grid Danh sách hiển thị */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {mockPlaylists.map((item) => (
          <NavLink
            key={item.id}
            to={item.type === 'Danh sách phát' ? `/playlist/${item.id}` : '#'}
            className="p-4 bg-zinc-900/40 border border-zinc-900 hover:bg-zinc-900 hover:border-zinc-800/80 rounded-xl transition-all duration-300 group block cursor-pointer"
          >
            <div className="flex items-center gap-4">
              {/* Thumbnail */}
              <div className={`w-16 h-16 rounded-lg flex items-center justify-center border border-zinc-800 shadow-inner shrink-0 ${
                item.type === 'Nghệ sĩ' ? 'rounded-full bg-zinc-800' : 'bg-gradient-to-br from-green-500/10 to-zinc-900'
              }`}>
                {item.type === 'Nghệ sĩ' ? (
                  <User className="w-7 h-7 text-zinc-500" />
                ) : (
                  <ListMusic className="w-7 h-7 text-zinc-500" />
                )}
              </div>

              {/* Thông tin */}
              <div className="min-w-0">
                <h4 className="font-bold text-sm truncate group-hover:text-green-400 transition-colors">
                  {item.title}
                </h4>
                <p className="text-xs text-zinc-400 mt-1 capitalize">
                  {item.type} • {item.owner}
                </p>
                <p className="text-[10px] text-zinc-500 mt-0.5">{item.tracks}</p>
              </div>
            </div>
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default Library;
