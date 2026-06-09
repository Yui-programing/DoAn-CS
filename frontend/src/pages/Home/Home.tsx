import { usePlayer } from '../../contexts/PlayerContext';
import { Play, Pause, Sparkles, Heart, Music } from 'lucide-react';

const featuredPlaylists = [
  { id: '1', title: 'Giai điệu thư giãn cuối tuần', tracks: '3 bài hát', duration: '1h 10m', color: 'from-emerald-500/20 to-zinc-900' },
  { id: '2', title: 'Playlist chiến Valorant', tracks: '3 bài hát', duration: '10m', color: 'from-red-500/20 to-zinc-900' },
  { id: '3', title: 'Tuyển tập Indie Việt', tracks: '12 bài hát', duration: '45m', color: 'from-blue-500/20 to-zinc-900' },
  { id: '4', title: 'Lofi Cafe Sài Gòn', tracks: '1 bài hát', duration: '1h 00m', color: 'from-amber-500/20 to-zinc-900' },
];

// Thay thế bằng các tệp nhạc MP3 local hoạt động thực tế
const mockTracks = [
  { id: 'm1', title: 'Lần Cuối', artist: 'Ngọt Band', duration: '3:35', filePath: '/media/lancuoi.mp3', coverUrl: '/media/lancuoi.jpg', plays: '1.2M lượt nghe' },
  { id: 'm2', title: 'Em Dạo Này', artist: 'Ngọt Band', duration: '3:43', filePath: '/media/emdaonay.mp3', coverUrl: '/media/emdaonay.jpg', plays: '980K lượt nghe' },
  { id: 'm3', title: 'Die For You', artist: 'Riot Games Music', duration: '3:20', filePath: '/media/dieforyou.mp3', coverUrl: '/media/dieforyou.jpg', plays: '4.5M lượt nghe' },
  { id: 'm4', title: 'Ignite', artist: 'Riot Games Music', duration: '3:15', filePath: '/media/ignite.mp3', coverUrl: '/media/ignite.jpg', plays: '3.1M lượt nghe' },
];

export const Home = () => {
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayer();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  const handleTrackClick = (track: typeof mockTracks[0]) => {
    if (currentTrack?.id === track.id) {
      togglePlay();
    } else {
      playTrack(track, mockTracks);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Banner chào mừng */}
      <div className="bg-gradient-to-r from-emerald-900/40 via-zinc-900 to-zinc-950 p-8 rounded-2xl border border-zinc-800/40 flex justify-between items-center relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2 text-green-400 font-semibold text-sm">
            <Sparkles className="w-4 h-4" />
            <span>Gợi ý riêng cho bạn</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight">
            {getGreeting()}, Duy!
          </h2>
          <p className="text-sm text-zinc-400 max-w-md">
            Hôm nay bạn muốn nghe thể loại nhạc gì? Hãy click vào bài hát bất kỳ bên dưới để trải nghiệm âm thanh thực tế nhé.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-radial from-green-500/10 to-transparent blur-3xl" />
      </div>

      {/* Danh sách Playlist nổi bật */}
      <section className="space-y-4">
        <h3 className="text-xl font-bold tracking-tight">Thư viện gợi ý</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredPlaylists.map((playlist) => (
            <div 
              key={playlist.id}
              className={`p-5 rounded-xl bg-gradient-to-b ${playlist.color} border border-zinc-800/30 hover:border-zinc-700/50 transition-all duration-300 cursor-pointer group relative`}
            >
              <h4 className="font-bold text-base line-clamp-1 group-hover:text-green-400 transition-colors">
                {playlist.title}
              </h4>
              <p className="text-xs text-zinc-400 mt-1">{playlist.tracks} • {playlist.duration}</p>
              
              {/* Nút phát nhanh khi hover */}
              <button className="absolute right-4 bottom-4 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-black shadow-lg opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:scale-105 active:scale-95">
                <Play className="w-5 h-5 fill-current ml-0.5" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Bài hát mới thịnh hành */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold tracking-tight">Nghe nhiều gần đây</h3>
          <button className="text-xs text-green-400 hover:underline font-bold">Xem tất cả</button>
        </div>

        <div className="bg-zinc-900/20 rounded-xl border border-zinc-900 overflow-hidden">
          {mockTracks.map((track, index) => {
            const isCurrent = currentTrack?.id === track.id;
            return (
              <div 
                key={track.id}
                onClick={() => handleTrackClick(track)}
                className={`flex items-center justify-between px-6 py-4 hover:bg-zinc-900/50 transition-colors border-b border-zinc-900/50 last:border-0 group cursor-pointer ${
                  isCurrent ? 'bg-zinc-900/30' : ''
                }`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <span className={`text-sm font-bold w-4 text-right ${isCurrent ? 'text-green-400' : 'text-zinc-500'}`}>
                    {isCurrent && isPlaying ? '•' : index + 1}
                  </span>
                  <div className="w-10 h-10 bg-zinc-800 rounded flex items-center justify-center border border-zinc-800 overflow-hidden relative group-hover:border-zinc-700 shrink-0">
                    {track.coverUrl ? (
                      <img src={track.coverUrl} alt="Cover" className="w-full h-full object-cover" />
                    ) : (
                      <Music className="w-5 h-5 text-zinc-500" />
                    )}
                    <div className={`absolute inset-0 bg-black/60 flex items-center justify-center transition-opacity ${
                      isCurrent && isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}>
                      {isCurrent && isPlaying ? (
                        <Pause className="w-4.5 h-4.5 text-green-400 fill-current" />
                      ) : (
                        <Play className="w-4.5 h-4.5 text-green-400 fill-current ml-0.5" />
                      )}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <h4 className={`text-sm font-bold truncate transition-colors ${isCurrent ? 'text-green-400' : 'text-slate-200 group-hover:text-green-400'}`}>
                      {track.title}
                    </h4>
                    <p className="text-xs text-zinc-400 truncate">{track.artist}</p>
                  </div>
                </div>

                <div className="flex items-center gap-8 text-xs text-zinc-400">
                  <span className="hidden sm:inline">{track.plays}</span>
                  <button className="opacity-0 group-hover:opacity-100 hover:text-green-400 transition-all">
                    <Heart className={`w-4.5 h-4.5 ${isCurrent ? 'text-green-400 fill-current' : ''}`} />
                  </button>
                  <span className={`font-semibold ${isCurrent ? 'text-green-400' : ''}`}>{track.duration}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default Home;
