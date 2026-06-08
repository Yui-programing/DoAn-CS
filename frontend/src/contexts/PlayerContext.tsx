import { createContext, useContext, useState, type ReactNode } from 'react';

export interface Track {
  id: string;
  title: string;
  artist: string;
  filePath: string;
  duration: string; // ví dụ: "3:30" hoặc "3:00"
  album?: string;
  coverUrl?: string;
}

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
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.8);
  const [queue, setQueue] = useState<Track[]>([]);

  // Phát một bài hát và tùy chọn thiết lập hàng đợi phát nhạc
  const playTrack = (track: Track, tracksQueue?: Track[]) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    setCurrentTime(0);
    if (tracksQueue) {
      setQueue(tracksQueue);
    } else if (!queue.some(t => t.id === track.id)) {
      setQueue([track]);
    }
  };

  // Đổi trạng thái Play/Pause
  const togglePlay = () => {
    if (currentTrack) {
      setIsPlaying(!isPlaying);
    }
  };

  // Phát bài kế tiếp
  const nextTrack = () => {
    if (queue.length === 0 || !currentTrack) return;
    const currentIndex = queue.findIndex(t => t.id === currentTrack.id);
    if (currentIndex !== -1 && currentIndex < queue.length - 1) {
      playTrack(queue[currentIndex + 1]);
    } else {
      // Nếu hết hàng đợi, phát lại từ bài đầu
      playTrack(queue[0]);
    }
  };

  // Phát bài trước đó
  const prevTrack = () => {
    if (queue.length === 0 || !currentTrack) return;
    const currentIndex = queue.findIndex(t => t.id === currentTrack.id);
    if (currentIndex !== -1 && currentIndex > 0) {
      playTrack(queue[currentIndex - 1]);
    } else {
      // Nếu là bài đầu, phát lại bài cuối
      playTrack(queue[queue.length - 1]);
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
        setIsPlaying
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
