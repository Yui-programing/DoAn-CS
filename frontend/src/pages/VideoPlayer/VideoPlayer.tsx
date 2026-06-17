import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Play, 
    Pause, 
    Volume1,
    Volume2, 
    VolumeX, 
    Maximize, 
    ArrowLeft, 
    Loader2, 
    Heart, 
    Repeat, 
    SkipBack, 
    SkipForward, 
    Music 
} from 'lucide-react';
// Import dịch vụ API để gọi dữ liệu thật
import { mediaService } from '../../services';
import { useFavorite } from '../../contexts/FavoriteContext';
import { useAuth } from '../../contexts/AuthContext';
import { usePlayer } from '../../contexts/PlayerContext';
import { AddToPlaylistModal } from '../../components/AddToPlaylistModal';
import { formatTime } from '../../utils';
import './VideoPlayer.css';

export const VideoPlayer = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { isFavorite, toggleFavorite } = useFavorite();
    const { setIsPlaying: setGlobalIsPlaying } = usePlayer();

    const videoRef = useRef<HTMLVideoElement | null>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.8);

    // Lưu âm lượng trước khi tắt tiếng để khôi phục
    const prevVolumeRef = useRef<number>(0.8);

    const [isLoading, setIsLoading] = useState(true);
    const [showControls, setShowControls] = useState(true);
    const [hasRecordedView, setHasRecordedView] = useState(false);
    const [showPlaylistModal, setShowPlaylistModal] = useState(false);

    // Trạng thái kéo thả thanh tiến trình
    const [isDraggingTime, setIsDraggingTime] = useState(false);
    const [dragTime, setDragTime] = useState(0);

    // Trạng thái kéo thả thanh âm lượng
    const [isDraggingVolume, setIsDraggingVolume] = useState(false);

    // Trạng thái tooltip khi hover thanh tiến trình
    const [hoverTime, setHoverTime] = useState<number | null>(null);
    const [hoverX, setHoverX] = useState<number>(0);

    // BƯỚC 1: Khai báo State để lưu thông tin video từ Backend
    const [videoInfo, setVideoInfo] = useState<{
        title: string;
        artist: string;
        coverUrl: string | null;
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
                        artist: response.data.artistName || 'Nghệ sĩ tự do',
                        coverUrl: response.data.coverUrl || null,
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

    // Tạm dừng nhạc nền toàn cục khi mở MV - dừng cả audio element thực sự
    useEffect(() => {
        // Dừng trạng thái toàn cục
        setGlobalIsPlaying(false);
        // Dừng cả audio element thực sự để tránh phát đồng thời
        const audioElement = document.getElementById('global-audio-element') as HTMLAudioElement | null;
        if (audioElement) {
            audioElement.pause();
        }
    }, []); // Chỉ chạy một lần khi component mount

    // Đồng bộ âm lượng với thẻ video
    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.volume = volume;
            // Đảm bảo video không bị mute khi volume > 0
            videoRef.current.muted = false;
        }
    }, [volume]);

    // Lưu âm lượng trước khi tắt tiếng
    useEffect(() => {
        if (volume > 0) {
            prevVolumeRef.current = volume;
        }
    }, [volume]);

    const togglePlay = () => {
        if (!videoRef.current) return;
        if (isPlaying) {
            videoRef.current.pause();
            setIsPlaying(false);
        } else {
            // Đảm bảo không bị mute và gán đúng volume trước khi phát
            videoRef.current.muted = false;
            videoRef.current.volume = volume > 0 ? volume : 0.8;
            videoRef.current.play().catch(err => console.log("Lỗi tự phát:", err));
            setIsPlaying(true);
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current && !isDraggingTime) {
            setCurrentTime(videoRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
            // Đặt âm lượng ngay khi video sẵn sàng
            videoRef.current.volume = volume;
            videoRef.current.muted = false;
            setIsLoading(false); // Khi video đã có sẵn để phát, tắt Loading
        }
    };

    // Xử lý kéo thả để tua video
    const handleProgressMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!videoRef.current || duration === 0) return;

        const progressBar = e.currentTarget;

        const updateProgress = (clientX: number) => {
            const rect = progressBar.getBoundingClientRect();
            const clickX = clientX - rect.left;
            const width = rect.width;
            const percentage = Math.min(Math.max(clickX / width, 0), 1);
            const newTime = percentage * duration;
            setDragTime(newTime);
        };

        setIsDraggingTime(true);
        updateProgress(e.clientX);

        const handleMouseMove = (moveEvent: MouseEvent) => {
            updateProgress(moveEvent.clientX);
        };

        const handleMouseUp = (upEvent: MouseEvent) => {
            const rect = progressBar.getBoundingClientRect();
            const clickX = upEvent.clientX - rect.left;
            const width = rect.width;
            const percentage = Math.min(Math.max(clickX / width, 0), 1);
            const finalTime = percentage * duration;

            // Tua video đến vị trí mới
            if (videoRef.current) {
                videoRef.current.currentTime = finalTime;
            }
            setCurrentTime(finalTime);
            setIsDraggingTime(false);

            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
    };

    // Hiển thị tooltip thời gian khi hover
    const handleProgressBarMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (duration === 0) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        const percentage = Math.min(Math.max(clickX / width, 0), 1);
        setHoverTime(percentage * duration);
        setHoverX(percentage * 100);
    };

    const handleProgressBarMouseLeave = () => {
        setHoverTime(null);
    };

    // Xử lý kéo thả thanh âm lượng
    const handleVolumeMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        const volumeBar = e.currentTarget;

        const updateVolume = (clientX: number) => {
            const rect = volumeBar.getBoundingClientRect();
            const clickX = clientX - rect.left;
            const width = rect.width;
            const newVolume = Math.min(Math.max(clickX / width, 0), 1);
            setVolume(newVolume);
            if (videoRef.current) {
                videoRef.current.volume = newVolume;
                videoRef.current.muted = false;
            }
        };

        setIsDraggingVolume(true);
        updateVolume(e.clientX);

        const handleMouseMove = (moveEvent: MouseEvent) => {
            updateVolume(moveEvent.clientX);
        };

        const handleMouseUp = () => {
            setIsDraggingVolume(false);
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
    };

    // Bật/tắt tiếng
    const toggleMute = () => {
        if (!videoRef.current) return;
        if (volume > 0) {
            setVolume(0);
            videoRef.current.volume = 0;
        } else {
            const restored = prevVolumeRef.current > 0 ? prevVolumeRef.current : 0.8;
            setVolume(restored);
            videoRef.current.volume = restored;
            videoRef.current.muted = false;
        }
    };

    const toggleFullscreen = () => {
        if (videoRef.current) {
            if (videoRef.current.requestFullscreen) {
                videoRef.current.requestFullscreen();
            }
        }
    };

    // Tính toán % tiến trình hiển thị
    const displayTime = isDraggingTime ? dragTime : currentTime;
    const progressPercent = duration > 0 ? (displayTime / duration) * 100 : 0;

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
                    onPlaying={() => {
                        setIsLoading(false);
                        if (!hasRecordedView && id) {
                            mediaService.recordPlayHistory(id).catch(err => console.error("Không thể ghi nhận lượt nghe video:", err));
                            setHasRecordedView(true);
                        }
                    }}
                />
            )}

            {/* Vòng quay chờ tải Video (Loading) */}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-20">
                    <Loader2 className="w-12 h-12 text-green-500 animate-spin" />
                </div>
            )}

            {/* Thanh phía trên (Top Bar) - chỉ nút Back và tiêu đề */}
            {videoInfo && (
                <div className={`absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/85 via-black/40 to-transparent z-30 flex items-center gap-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-zinc-950/40 hover:bg-zinc-900/80 text-slate-100 hover:text-green-400 shadow-lg transition-all active:scale-90 cursor-pointer shrink-0"
                        title="Quay lại"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-base font-bold text-slate-100 tracking-wide truncate">
                        {videoInfo.title}
                    </h1>
                </div>
            )}

            {/* Thanh phía dưới (Bottom Player Bar) - Giống Spotify */}
            {videoInfo && (
                <div className={`absolute bottom-0 left-0 right-0 h-24 bg-black border-t border-zinc-900 px-6 flex items-center justify-between z-30 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    {/* 1. Bên trái: Thông tin bài hát & Nút tương tác */}
                    <div className="flex items-center gap-4 w-1/3 min-w-[240px]">
                        {/* Thumbnail nhỏ */}
                        <div className="w-14 h-14 bg-zinc-900 rounded-lg flex items-center justify-center border border-zinc-800 overflow-hidden shrink-0 shadow-inner">
                            {videoInfo.coverUrl ? (
                                <img
                                    src={mediaService.getImageUrl(videoInfo.coverUrl)}
                                    alt={videoInfo.title}
                                    className="w-full h-full object-cover animate-fadeIn"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-green-500/10 to-zinc-900 flex items-center justify-center">
                                    <Music className="w-6 h-6 text-green-400" />
                                </div>
                            )}
                        </div>
                        {/* Tên bài hát & Nghệ sĩ */}
                        <div className="min-w-0">
                            <h4 className="text-sm font-bold text-slate-100 truncate hover:underline cursor-pointer" title={videoInfo.title}>
                                {videoInfo.title}
                            </h4>
                            <p className="text-xs text-zinc-400 truncate hover:underline cursor-pointer font-medium mt-0.5">
                                {videoInfo.artist}
                            </p>
                        </div>
                        
                        {/* Nút Thả tim & Nút thêm playlist - màu giống MainLayout */}
                        {user && id && (
                            <div className="flex items-center gap-1 ml-2 shrink-0">
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleFavorite(id);
                                    }}
                                    className={`transition-colors p-1 cursor-pointer hover:scale-110 active:scale-95 ${
                                        isFavorite(id) 
                                            ? "text-green-400" 
                                            : "text-zinc-450 hover:text-green-400"
                                    }`}
                                    title={isFavorite(id) ? "Bỏ thích" : "Thích"}
                                >
                                    <Heart className={`w-5 h-5 ${isFavorite(id) ? "fill-current" : ""}`} />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowPlaylistModal(true);
                                    }}
                                    className="text-zinc-450 hover:text-white transition-all duration-200 p-1 cursor-pointer hover:scale-105 active:scale-90"
                                    title="Thêm vào danh sách phát"
                                >
                                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-[2.2]">
                                        <circle cx="12" cy="12" r="10" />
                                        <line x1="12" y1="8" x2="12" y2="16" />
                                        <line x1="8" y1="12" x2="16" y2="12" />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* 2. Ở giữa: Playback Control & Progress Bar */}
                    <div className="flex flex-col items-center gap-2 w-1/3 max-w-xl">
                        {/* Hàng nút điều khiển */}
                        <div className="flex items-center gap-6">
                            <button className="text-zinc-400 hover:text-slate-100 transition-colors cursor-pointer" title="Bài trước">
                                <SkipBack className="w-5 h-5 fill-current" />
                            </button>

                            <button
                                onClick={togglePlay}
                                className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-black hover:scale-105 active:scale-95 transition-transform shadow-md cursor-pointer"
                                title={isPlaying ? "Tạm dừng" : "Phát"}
                              >
                                {isPlaying ? (
                                  <Pause className="w-4 h-4 fill-current" />
                                ) : (
                                  <Play className="w-4 h-4 fill-current ml-0.5" />
                                )}
                            </button>

                            <button className="text-zinc-400 hover:text-slate-100 transition-colors cursor-pointer" title="Bài kế tiếp">
                                <SkipForward className="w-5 h-5 fill-current" />
                            </button>
                            <button className="text-zinc-400 hover:text-slate-100 transition-colors cursor-pointer" title="Lặp lại">
                                <Repeat className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Thanh tiến trình - giống MainLayout dùng div custom */}
                        <div className="w-full flex items-center gap-2.5 text-[10px] text-zinc-500 font-bold">
                            <span>{formatTime(displayTime)}</span>
                            {/* Vùng kéo thả thanh tiến trình */}
                            <div
                                onMouseDown={handleProgressMouseDown}
                                onMouseMove={handleProgressBarMouseMove}
                                onMouseLeave={handleProgressBarMouseLeave}
                                className="flex-1 h-3 flex items-center relative group cursor-pointer"
                            >
                                {/* Track nền */}
                                <div className="w-full h-1 bg-zinc-800 rounded-full">
                                    {/* Track đã phát - màu trắng khi bình thường, xanh khi hover/drag */}
                                    <div
                                        className={`h-full rounded-full transition-colors ${
                                            isDraggingTime ? "bg-green-500" : "bg-slate-100 group-hover:bg-green-500"
                                        }`}
                                        style={{ width: `${progressPercent}%` }}
                                    />
                                </div>
                                {/* Nút kéo (Thumb) */}
                                <div
                                    className={`absolute w-3 h-3 bg-slate-100 rounded-full shadow transition-opacity ${
                                        isDraggingTime ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                    }`}
                                    style={{
                                        left: `${progressPercent}%`,
                                        transform: "translate(-50%, -50%)",
                                        top: "50%",
                                    }}
                                />
                                {/* Tooltip thời gian hover */}
                                {hoverTime !== null && (
                                    <div
                                        className="absolute -top-8 -translate-x-1/2 bg-zinc-900 text-slate-100 text-[10px] px-2 py-1 rounded font-bold shadow-lg pointer-events-none border border-zinc-800"
                                        style={{ left: `${hoverX}%` }}
                                    >
                                        {formatTime(hoverTime)}
                                    </div>
                                )}
                            </div>
                            <span>{formatTime(duration)}</span>
                        </div>
                    </div>

                    {/* 3. Bên phải: Âm lượng & Fullscreen */}
                    <div className="flex items-center justify-end gap-3 w-1/3 text-zinc-400 group/volume">
                        {/* Nút tắt/bật tiếng */}
                        <button 
                            onClick={toggleMute}
                            className="hover:text-slate-100 cursor-pointer p-1 transition-colors"
                        >
                            {volume === 0 ? (
                                <VolumeX className="w-5 h-5 text-zinc-500" />
                            ) : volume < 0.5 ? (
                                <Volume1 className="w-5 h-5" />
                            ) : (
                                <Volume2 className="w-5 h-5" />
                            )}
                        </button>
                        {/* Thanh âm lượng - dùng div custom giống MainLayout */}
                        <div
                            onMouseDown={handleVolumeMouseDown}
                            className="w-24 h-3 flex items-center relative cursor-pointer"
                        >
                            {/* Track nền âm lượng */}
                            <div className="w-full h-1 bg-zinc-800 rounded-full">
                                {/* Track đã điền - màu trắng khi bình thường, xanh khi hover/drag */}
                                <div
                                    className={`h-full rounded-full ${
                                        isDraggingVolume ? "" : "transition-[width,background-color] duration-300 ease-out"
                                    } ${
                                        isDraggingVolume ? "bg-green-500" : "bg-slate-100 group-hover/volume:bg-green-500"
                                    }`}
                                    style={{ width: `${volume * 100}%` }}
                                />
                            </div>
                            {/* Nút kéo âm lượng (Thumb) */}
                            <div
                                className={`absolute w-3 h-3 bg-slate-100 rounded-full shadow ${
                                    isDraggingVolume ? "" : "transition-[left,opacity] duration-300 ease-out"
                                } ${
                                    isDraggingVolume ? "opacity-100" : "opacity-0 group-hover/volume:opacity-100"
                                }`}
                                style={{
                                    left: `${volume * 100}%`,
                                    transform: "translate(-50%, -50%)",
                                    top: "50%",
                                }}
                            />
                        </div>
                        
                        <button
                            onClick={toggleFullscreen}
                            className="p-1 text-zinc-400 hover:text-green-400 transition-colors cursor-pointer"
                            title="Toàn màn hình"
                        >
                            <Maximize className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}
            {/* MODAL THÊM VÀO PLAYLIST */}
            {showPlaylistModal && id && (
                <div onClick={(e) => e.stopPropagation()}>
                    <AddToPlaylistModal
                        isOpen={showPlaylistModal}
                        onClose={() => setShowPlaylistModal(false)}
                        mediaItemId={id}
                        placement="center"
                    />
                </div>
            )}
        </div>
    );
};

export default VideoPlayer;
