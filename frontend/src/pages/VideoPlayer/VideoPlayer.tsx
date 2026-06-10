import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Pause, Volume2, Maximize, ArrowLeft, Loader2 } from 'lucide-react';
import './VideoPlayer.css';

// Mock danh sách video để lấy thông tin hiển thị (nếu chưa tích hợp API)
const mockVideos: Record<string, { title: string; artist: string; filePath: string }> = {
    'm9': {
        title: 'Valorant Champions Tour Highlights',
        artist: 'Riot Games Music',
        filePath: 'http://localhost:5000/api/media/e1a63c32-b6ab-4cb7-a5ad-611ff1a94245/stream' // Thay đổi GUID khớp với dữ liệu trong database của bạn
    },
    'm10': {
        title: 'Hướng dẫn ReactJS cơ bản',
        artist: 'Phương Duy',
        filePath: 'http://localhost:5000/api/media/f47ac10b-58cc-4372-a567-0e02b2c3d479/stream'
    }
};

export const VideoPlayer = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const videoRef = useRef<HTMLVideoElement | null>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.8);
    const [isLoading, setIsLoading] = useState(true);
    const [showControls, setShowControls] = useState(true);

    // Lấy link phát video từ API của Backend (với ID tương ứng từ Route)
    const videoInfo = (id && mockVideos[id]) || {
        title: 'Đang phát Video',
        artist: 'TuneVault Media',
        filePath: `http://localhost:5000/api/media/${id}/stream`
    };

    // Tự động ẩn thanh điều khiển (Controls Overlay) sau 3 giây nếu không di chuột
    useEffect(() => {
        let timeoutId: number;
        const handleMouseMove = () => {
            setShowControls(true);
            clearTimeout(timeoutId);
            timeoutId = window.setTimeout(() => {
                if (isPlaying) {
                    setShowControls(false);
                }
            }, 3000);
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            clearTimeout(timeoutId);
        };
    }, [isPlaying]);

    // Nút Play / Pause
    const togglePlay = () => {
        if (!videoRef.current) return;
        if (isPlaying) {
            videoRef.current.pause();
            setIsPlaying(false);
        } else {
            videoRef.current.play().catch(err => console.log("Lỗi tự phát:", err));
            setIsPlaying(true);
        }
    };

    // Đồng bộ thời gian hiện tại của video
    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
        }
    };

    // Đọc tổng độ dài video khi tải xong thông tin (metadata)
    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
            setIsLoading(false);
        }
    };

    // Kéo thanh trượt để tua video
    const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTime = parseFloat(e.target.value);
        setCurrentTime(newTime);
        if (videoRef.current) {
            videoRef.current.currentTime = newTime;
        }
    };

    // Điều chỉnh âm lượng bằng slider
    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (videoRef.current) {
            videoRef.current.volume = newVolume;
        }
    };

    // Phóng to toàn màn hình
    const toggleFullscreen = () => {
        if (videoRef.current) {
            if (videoRef.current.requestFullscreen) {
                videoRef.current.requestFullscreen();
            }
        }
    };

    // Định dạng hiển thị thời gian (phút:giây)
    const formatTime = (timeInSeconds: number) => {
        if (isNaN(timeInSeconds)) return '0:00';
        const mins = Math.floor(timeInSeconds / 60);
        const secs = Math.floor(timeInSeconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <div className="video-player-container w-screen h-screen bg-black flex items-center justify-center relative overflow-hidden select-none">

            {/* Video chính */}
            <video
                ref={videoRef}
                src={videoInfo.filePath}
                className="w-full h-full object-contain cursor-pointer"
                onClick={togglePlay}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onWaiting={() => setIsLoading(true)}
                onPlaying={() => setIsLoading(false)}
            />

            {/* Vòng quay chờ tải Video (Loading) */}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-20">
                    <Loader2 className="w-12 h-12 text-green-500 animate-spin" />
                </div>
            )}

            {/* Nút quay lại góc trái phía trên */}
            <div className={`absolute top-6 left-6 z-30 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center justify-center w-12 h-12 rounded-full bg-zinc-950/80 hover:bg-zinc-900 border border-zinc-800 text-slate-100 hover:text-green-400 shadow-lg transition-all active:scale-90"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
            </div>

            {/* Thanh điều khiển video dưới đáy */}
            <div className={`absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/80 to-transparent z-10 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className="space-y-4 max-w-5xl mx-auto">

                    {/* Tên video & tác giả */}
                    <div className="mb-2">
                        <h2 className="text-xl font-extrabold text-slate-100">{videoInfo.title}</h2>
                        <p className="text-sm text-zinc-400 font-semibold">{videoInfo.artist}</p>
                    </div>

                    {/* Thanh chạy tiến trình tua video */}
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-zinc-400">{formatTime(currentTime)}</span>
                        <input
                            type="range"
                            min={0}
                            max={duration || 100}
                            value={currentTime}
                            onChange={handleProgressChange}
                            className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer bg-zinc-800 accent-green-500 outline-none transition-all hover:h-2"
                        />
                        <span className="text-xs font-bold text-zinc-400">{formatTime(duration)}</span>
                    </div>

                    {/* Nút bấm (Play/Pause, Âm lượng, Toàn màn hình) */}
                    <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-6">

                            {/* Nút Play/Pause */}
                            <button
                                onClick={togglePlay}
                                className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-black hover:scale-105 transition-transform active:scale-95 shadow-md"
                            >
                                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                            </button>

                            {/* Slider Âm lượng */}
                            <div className="flex items-center gap-2 group">
                                <Volume2 className="w-5 h-5 text-zinc-400 hover:text-slate-100 cursor-pointer" />
                                <input
                                    type="range"
                                    min={0}
                                    max={1}
                                    step={0.05}
                                    value={volume}
                                    onChange={handleVolumeChange}
                                    className="w-20 h-1 rounded-full appearance-none bg-zinc-850 accent-green-500 outline-none"
                                />
                            </div>
                        </div>

                        {/* Phóng to toàn màn hình */}
                        <button
                            onClick={toggleFullscreen}
                            className="p-2 text-zinc-450 hover:text-green-400 transition-colors"
                        >
                            <Maximize className="w-6 h-6" />
                        </button>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoPlayer;
