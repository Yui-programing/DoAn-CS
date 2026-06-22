import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Heart, Music } from 'lucide-react';
import { usePlayer } from '../contexts/PlayerContext';
import { useFavorite } from '../contexts/FavoriteContext';
import { useAuth } from '../contexts/AuthContext';
import { mediaService } from '../services';
import { TrackDropdownMenu } from './TrackDropdownMenu';
import { ShareModal } from './ShareModal';

export interface TrackData {
    id: string;
    title: string;
    artist?: string;
    coverUrl?: string;
    duration: string;
    durationInSeconds?: number;
    mediaType?: number;
    filePath?: string;
}

interface TrackListTableProps {
    tracks: TrackData[];
    onRemoveTrack?: (trackId: string) => void;
    onAddToPlaylist?: (trackId: string) => void;
}

export const TrackListTable: React.FC<TrackListTableProps> = ({ tracks, onRemoveTrack, onAddToPlaylist }) => {
    const { user } = useAuth();
    const { currentTrack, isPlaying, togglePlay, playTrack } = usePlayer();
    const { isFavorite, toggleFavorite } = useFavorite();
    const navigate = useNavigate();
    const [sharingTrack, setSharingTrack] = useState<TrackData | null>(null);

    const handleTrackClick = (track: TrackData) => {
        const isVideo = track.mediaType === 1;
        if (isVideo) {
            navigate(`/video/${track.id}`);
        } else {
            if (currentTrack?.id === track.id) {
                togglePlay();
            } else {
                playTrack(track as any, tracks as any);
            }
        }
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-zinc-900 text-zinc-500 text-xs font-bold uppercase tracking-wider">
                        <th className="py-3 px-4 w-12 text-center">#</th>
                        <th className="py-3 px-4">Tiêu đề</th>
                        <th className="py-3 px-4 w-12 text-center"></th>
                        <th className="py-3 px-4 w-16 text-center"><Clock className="w-4 h-4 mx-auto" /></th>
                        <th className="py-3 px-4 w-12 text-center"></th>
                    </tr>
                </thead>
                <tbody>
                    {tracks.map((track, index) => {
                        const isCurrent = currentTrack?.id === track.id;
                        return (
                            <tr
                                key={track.id || index}
                                onClick={() => handleTrackClick(track)}
                                className={`hover:bg-zinc-900/40 border-b border-zinc-900/20 last:border-0 group cursor-pointer transition-colors ${isCurrent ? 'bg-zinc-900/20' : ''}`}
                            >
                                <td className={`py-4 px-4 text-center text-sm font-semibold ${isCurrent ? 'text-green-400' : 'text-zinc-500'}`}>
                                    {isCurrent && isPlaying ? '•' : index + 1}
                                </td>
                                <td className="py-4 px-4 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-zinc-900 rounded-lg flex items-center justify-center border border-zinc-800/80 overflow-hidden shrink-0 shadow-inner">
                                        {track.coverUrl ? (
                                            <img src={mediaService.getImageUrl(track.coverUrl)} alt="Cover" className="w-full h-full object-cover animate-fadeIn" />
                                        ) : (
                                            <Music className="w-5 h-5 text-zinc-550" />
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className={`text-sm font-bold truncate transition-colors ${isCurrent ? 'text-green-400' : 'text-slate-200 group-hover:text-green-400'}`}>
                                            {track.title}
                                        </h4>
                                        <p className="text-xs text-zinc-400 truncate">{track.artist || 'Không rõ ca sĩ'}</p>
                                    </div>
                                </td>
                                <td className="py-4 px-4 text-center align-middle">
                                    {user && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleFavorite(track.id);
                                            }}
                                            className={`transition-all hover:scale-110 mt-1 ${isFavorite(track.id) ? 'opacity-100 text-green-400' : 'opacity-0 group-hover:opacity-100 hover:text-green-400 text-zinc-400'}`}
                                            title={isFavorite(track.id) ? 'Bỏ thích' : 'Thích'}
                                        >
                                            <Heart className={`w-4.5 h-4.5 ${isFavorite(track.id) ? 'fill-current text-green-400' : ''}`} />
                                        </button>
                                    )}
                                </td>
                                <td className="py-4 px-4 text-center align-middle">
                                    <span className={`font-semibold tracking-wider text-xs ${isCurrent ? 'text-green-400' : 'text-zinc-400'}`}>
                                        {track.duration}
                                    </span>
                                </td>
                                <td className="py-4 px-4 text-center align-middle">
                                    {user && (
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <TrackDropdownMenu
                                                onAddToPlaylist={() => onAddToPlaylist && onAddToPlaylist(track.id)}
                                                onShare={() => setSharingTrack(track)}
                                                onRemoveFromPlaylist={onRemoveTrack ? () => onRemoveTrack(track.id) : undefined}
                                            />
                                        </div>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {sharingTrack && (
                <ShareModal 
                    isOpen={!!sharingTrack}
                    onClose={() => setSharingTrack(null)}
                    mediaItemId={sharingTrack.id}
                    title={`Bài hát: ${sharingTrack.title}`}
                />
            )}
        </div>
    );
};
