import { createContext, useContext, useState, type ReactNode } from 'react';
import { mediaService } from '../services';

export interface Track {
  id: string;
  title: string;
  artist: string;
  filePath: string;
  duration: string; // ví dụ: "3:30" hoặc "3:00"
  album?: string;
  coverUrl?: string;
  artistId?: string;
}

// Thuật toán xáo trộn Fisher-Yates
const shuffleArray = <T,>(array: T[]): T[] => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

// Tạo hàng đợi đã xáo trộn với bài hiện tại ở đầu
const shuffleQueue = (original: Track[], activeTrack: Track | null): Track[] => {
  if (!activeTrack) return shuffleArray(original);
  const otherTracks = original.filter(t => t.id !== activeTrack.id);
  const shuffledOthers = shuffleArray(otherTracks);
  return [activeTrack, ...shuffledOthers];
};

interface PlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  queue: Track[];
  playTrack: (track: Track, tracksQueue?: Track[]) => void;
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  seek: (seconds: number) => void;
  setVolume: (value: number) => void;
  setCurrentTime: (value: number) => void;
  setDuration: (value: number) => void;
  setIsPlaying: (value: boolean) => void;
  isShuffle: boolean;
  setIsShuffle: (value: boolean) => void;
  repeatMode: 'off' | 'all' | 'one';
  setRepeatMode: (value: 'off' | 'all' | 'one') => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.8);
  const [queue, setQueue] = useState<Track[]>([]); // Hàng đợi đang phát thực tế
  const [originalQueue, setOriginalQueue] = useState<Track[]>([]); // Hàng đợi gốc chưa xáo trộn
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');

  // Phát một bài hát và tùy chọn thiết lập hàng đợi phát nhạc
  const playTrack = (track: Track, tracksQueue?: Track[]) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    setCurrentTime(0);
    
    if (tracksQueue) {
      setOriginalQueue(tracksQueue);
      if (isShuffle) {
        const idx = tracksQueue.findIndex(t => t.id === track.id);
        const shuffled = shuffleQueue(tracksQueue, idx !== -1 ? tracksQueue[idx] : track);
        setQueue(shuffled);
      } else {
        setQueue(tracksQueue);
      }
    } else {
      // Nếu không truyền hàng đợi, kiểm tra xem bài có sẵn trong hàng đợi chưa
      const inQueue = queue.some(t => t.id === track.id);
      if (!inQueue) {
        setOriginalQueue(prev => [...prev, track]);
        setQueue(prev => [...prev, track]);
      }
    }

    // Ghi nhận lượt nghe và lưu lịch sử
    mediaService.recordPlayHistory(track.id).catch(err => {
      console.log('Không thể ghi nhận lượt nghe:', err);
    });
  };

  // Đổi trạng thái Play/Pause
  const togglePlay = () => {
    if (currentTrack) {
      setIsPlaying(!isPlaying);
    }
  };

  // Thay đổi trạng thái shuffle và tự động xáo trộn/khôi phục hàng đợi
  const handleSetIsShuffle = (shuffle: boolean) => {
    setIsShuffle(shuffle);
    if (!currentTrack) return;

    if (shuffle) {
      // Xáo trộn phần còn lại của hàng đợi gốc
      const otherTracks = originalQueue.filter(t => t.id !== currentTrack.id);
      const shuffledOthers = shuffleArray(otherTracks);
      setQueue([currentTrack, ...shuffledOthers]);
    } else {
      // Khôi phục về thứ tự gốc
      setQueue(originalQueue);
    }
  };

  // Phát bài kế tiếp
  const nextTrack = () => {
    if (queue.length === 0 || !currentTrack) return;
    
    const currentIndex = queue.findIndex(t => t.id === currentTrack.id);
    if (currentIndex !== -1 && currentIndex < queue.length - 1) {
      playTrack(queue[currentIndex + 1]);
    } else {
      // Đã hết hàng đợi phát nhạc
      if (repeatMode === 'all') {
        playTrack(queue[0]);
      } else if (repeatMode === 'one') {
        // Phát lại bài hiện tại từ đầu
        seek(0);
        setIsPlaying(true);
        const audioElement = document.getElementById('global-audio-element') as HTMLAudioElement | null;
        if (audioElement) {
          audioElement.currentTime = 0;
          audioElement.play().catch(err => console.log('Lỗi phát lại bài:', err));
        }
      } else {
        // repeatMode === 'off' -> Dừng phát nhạc
        setIsPlaying(false);
        setCurrentTime(0);
        const audioElement = document.getElementById('global-audio-element') as HTMLAudioElement | null;
        if (audioElement) {
          audioElement.currentTime = 0;
          audioElement.pause();
        }
      }
    }
  };

  // Phát bài trước đó
  const prevTrack = () => {
    if (queue.length === 0 || !currentTrack) return;

    // Nếu bài đang phát đã chạy > 3 giây, nút quay lại sẽ phát lại bài hiện tại từ đầu
    const audioElement = document.getElementById('global-audio-element') as HTMLAudioElement | null;
    if (audioElement && audioElement.currentTime > 3) {
      seek(0);
      setIsPlaying(true);
      if (audioElement) {
        audioElement.currentTime = 0;
        audioElement.play().catch(err => console.log('Lỗi phát lại bài:', err));
      }
      return;
    }

    const currentIndex = queue.findIndex(t => t.id === currentTrack.id);
    if (currentIndex !== -1 && currentIndex > 0) {
      playTrack(queue[currentIndex - 1]);
    } else {
      // Ở đầu hàng đợi
      if (repeatMode === 'all') {
        playTrack(queue[queue.length - 1]);
      } else {
        // Nếu repeat off/one và ở bài đầu, chỉ phát lại bài đầu từ đầu
        seek(0);
        setIsPlaying(true);
        if (audioElement) {
          audioElement.currentTime = 0;
          audioElement.play().catch(err => console.log('Lỗi phát lại bài đầu:', err));
        }
      }
    }
  };

  // Tua nhạc
  const seek = (seconds: number) => {
    setCurrentTime(seconds);
    const audioElement = document.getElementById('global-audio-element') as HTMLAudioElement | null;
    if (audioElement) {
      audioElement.currentTime = seconds;
    }
  };

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        volume,
        queue,
        playTrack,
        togglePlay,
        nextTrack,
        prevTrack,
        seek,
        setVolume,
        setCurrentTime,
        setDuration,
        setIsPlaying,
        isShuffle,
        setIsShuffle: handleSetIsShuffle,
        repeatMode,
        setRepeatMode
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer phải được sử dụng bên trong PlayerProvider');
  }
  return context;
};
