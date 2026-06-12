import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Pause, Volume2, Maximize, ArrowLeft, Loader2 } from 'lucide-react';
// Import dịch vụ API để gọi dữ liệu thật
import { mediaService } from '../../services';
import './VideoPlayer.css';

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

    // BƯỚC 1: Khai báo State để lưu thông tin video từ Backend
    const [videoInfo, setVideoInfo] = useState<{
        title: string;
        artist: string;
        filePath: string;
    } | null>(null);

    // BƯỚC 2: Gọi API lấy chi tiết video dựa trên ID ở URL
    useEffect(() => {
        const fetchVideoDetails = async () => {
            if (!id) return;
            try {
                setIsLoading(true);
                // Gọi API lấy Meta Data của Video
                const response = await mediaService.getMediaDetails(id);
                if (response.success && response.data) {
                    setVideoInfo({
                        title: response.data.title,
                        artist: response.data.ownerId || 'Chưa rõ tác giả',

                        filePath: mediaService.getStreamUrl(id) // Lấy link stream chuẩn truyền vào src của Video
                    });
                }
            } catch (error) {
                console.error("Lỗi khi tải thông tin video:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchVideoDetails();
    }, [id]);

    // Tự động ẩn thanh điều khiển sau 3 giây
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

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
            setIsLoading(false); // Khi video đã có sẵn sẵng để phát, tắt Loading
        }
    };

    const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTime = parseFloat(e.target.value);
        setCurrentTime(newTime);
        if (videoRef.current) {
            videoRef.current.currentTime = newTime;
        }
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (videoRef.current) {
            videoRef.current.volume = newVolume;
        }
    };

    const toggleFullscreen = () => {
        if (videoRef.current) {
            if (videoRef.current.requestFullscreen) {
                videoRef.current.requestFullscreen();
            }
        }
    };

    const formatTime = (timeInSeconds: number) => {
        if (isNaN(timeInSeconds)) return '0:00';
        const mins = Math.floor(timeInSeconds / 60);
        const secs = Math.floor(timeInSeconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    // BƯỚC 4: Hiển thị nếu lỗi không tìm thấy Video
    if (!videoInfo && !isLoading) {
        return (
            <div className="w-screen h-screen bg-black flex flex-col items-center justify-center text-white space-y-4">
                <h2 className="text-2xl font-bold text-red-500">Lỗi: Không tìm thấy Video!</h2>
                <button
                    onClick={() => navigate(-1)}
                    className="px-6 py-2 bg-zinc-800 rounded-full hover:bg-zinc-700 transition-colors"
                >
                    Quay lại
                </button>
            </div>
        );
    }

    return (
        <div className="video-player-container w-screen h-screen bg-black flex items-center justify-center relative overflow-hidden select-none">
            {/* BƯỚC 3: Video chính kết nối với filePath từ API */}
            {videoInfo && (
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
            )}

            {/* Vòng quay chờ tải Video (Loading) */}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-20">
                    <Loader2 className="w-12 h-12 text-green-500 animate-spin" />
                </div>
            )}

            {/* Nút quay lại */}
            <div className={`absolute top-6 left-6 z-30 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center justify-center w-12 h-12 rounded-full bg-zinc-950/80 hover:bg-zinc-900 border border-zinc-800 text-slate-100 hover:text-green-400 shadow-lg transition-all active:scale-90"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
            </div>

            {/* Thanh điều khiển video dưới đáy (Liên kết với videoInfo) */}
            {videoInfo && (
                <div className={`absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/80 to-transparent z-10 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    <div className="space-y-4 max-w-5xl mx-auto">
                        <div className="mb-2">
                            <h2 className="text-xl font-extrabold text-slate-100">{videoInfo.title}</h2>
                            <p className="text-sm text-zinc-400 font-semibold">{videoInfo.artist}</p>
                        </div>

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

                        <div className="flex items-center justify-between pt-1">
                            <div className="flex items-center gap-6">
                                <button
                                    onClick={togglePlay}
                                    className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-black hover:scale-105 transition-transform active:scale-95 shadow-md"
                                >
                                    {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                                </button>
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
                            <button
                                onClick={toggleFullscreen}
                                className="p-2 text-zinc-450 hover:text-green-400 transition-colors"
                            >
                                <Maximize className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VideoPlayer;
