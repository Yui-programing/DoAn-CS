import { useState, useEffect } from 'react';
import { Playlist } from '../../types';
import { NavLink } from 'react-router-dom';
import { ListMusic, Plus, Loader2 } from 'lucide-react';
import { CreatePlaylistModal } from '../../components/CreatePlaylistModal';
// Import API Service
import { playlistService, mediaService } from '../../services';

export const Library = () => {
  // BƯỚC 1: Khai báo State
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // BƯỚC 2: Tự động gọi API lấy Playlist thật khi vào trang Thư viện
  useEffect(() => {
    const fetchLibraryData = async () => {
      try {
        setIsLoading(true);
        const response = await playlistService.getMyPlaylists();
        if (response.success) {
          setPlaylists(response.data);
        }
      } catch (error) {
        console.error('Lỗi khi tải thư viện:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLibraryData();

    // Lắng nghe event khi có playlist mới
    const handlePlaylistChanged = () => {
      fetchLibraryData();
    };
    window.addEventListener('playlistChanged', handlePlaylistChanged);
    return () => {
      window.removeEventListener('playlistChanged', handlePlaylistChanged);
    };
  }, []);

  // MÀN HÌNH CHỜ
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] space-y-4">
        <Loader2 className="w-10 h-10 text-green-500 animate-spin" />
        <p className="text-zinc-400 font-medium">Đang tải thư viện của bạn...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Thư viện */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListMusic className="w-6 h-6 text-green-400" />
          <h2 className="text-2xl font-bold tracking-tight">Thư viện của bạn</h2>
        </div>

        {/* Nút thêm Playlist */}
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-1 bg-green-500 hover:bg-green-400 text-black text-xs font-bold px-4 py-2 rounded-full transition-transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo mới</span>
        </button>
      </div>

      {/* Tabs lọc loại */}
      <div className="flex gap-2">
        <span className="px-4 py-1.5 bg-zinc-900 border border-zinc-800 text-xs font-bold rounded-full cursor-pointer hover:bg-zinc-800 text-green-400">
          Danh sách phát của tôi
        </span>
      </div>

      {/* BƯỚC 3 & 4: Hiển thị danh sách THẬT (Nếu trống thì báo chưa có) */}
      {playlists.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-zinc-800 rounded-xl">
          <p className="text-zinc-500 font-medium">Bạn chưa có Playlist nào cả.</p>
          <p className="text-sm text-zinc-600 mt-1">Hãy bấm nút "Tạo playlist" ở góc trên bên phải nhé!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {playlists.map((item) => (
            <NavLink
              key={item.id}
              to={`/playlist/${item.id}`}
              className="p-4 bg-zinc-900/40 border border-zinc-900 hover:bg-zinc-900 hover:border-zinc-800/80 rounded-xl transition-all duration-300 group block cursor-pointer"
            >
              <div className="flex items-center gap-4">
                {/* Thumbnail */}
                <div className="w-16 h-16 rounded-lg overflow-hidden flex items-center justify-center border border-zinc-800 shadow-inner shrink-0 bg-gradient-to-br from-green-500/10 to-zinc-900">
                  {item.coverUrl ? (
                    <img src={mediaService.getImageUrl(item.coverUrl)} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
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
                    {item.type === 1 ? 'Album' : 'Playlist'} • Bạn tạo
                  </p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">{item.description || 'Không có mô tả'}</p>
                </div>
              </div>
            </NavLink>
          ))}
        </div>
      )}

      {/* Modal tạo Playlist/Album */}
      <CreatePlaylistModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
    </div>
  );
};

export default Library;
