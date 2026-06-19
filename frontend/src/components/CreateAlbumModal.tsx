import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Music, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { mediaService } from '../services';
import { albumService } from '../services';
import type { MediaItem } from '../types';

interface CreateAlbumModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CreateAlbumModal: React.FC<CreateAlbumModalProps> = ({ isOpen, onClose }) => {
    const [title, setTitle] = useState('');
    const [releaseDate, setReleaseDate] = useState(new Date().toISOString().split('T')[0]);
    const [coverImage, setCoverImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    
    const [mySongs, setMySongs] = useState<MediaItem[]>([]);
    const [selectedTrackIds, setSelectedTrackIds] = useState<string[]>([]);
    
    const [isLoadingSongs, setIsLoadingSongs] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            fetchMySongs();
            setTitle('');
            setCoverImage(null);
            setPreviewUrl(null);
            setSelectedTrackIds([]);
            setReleaseDate(new Date().toISOString().split('T')[0]);
            setError(null);
            setSuccess(null);
        }
    }, [isOpen]);

    const fetchMySongs = async () => {
        try {
            setIsLoadingSongs(true);
            const res = await mediaService.getMyMedia();
            if (res.success && res.data) {
                // Chỉ lấy các bài hát (MediaType = 0) chưa thuộc Album nào
                const songs = res.data.filter(s => s.mediaType === 0 && !s.albumId);
                setMySongs(songs);
            }
        } catch (err) {
            console.error("Lỗi lấy danh sách bài hát:", err);
            setError("Không thể tải danh sách bài hát của bạn.");
        } finally {
            setIsLoadingSongs(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                setError("Vui lòng chọn file hình ảnh.");
                return;
            }
            setCoverImage(file);
            setPreviewUrl(URL.createObjectURL(file));
            setError(null);
        }
    };

    const handleToggleTrack = (trackId: string) => {
        setSelectedTrackIds(prev => 
            prev.includes(trackId) 
                ? prev.filter(id => id !== trackId)
                : [...prev, trackId]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        
        if (!title.trim()) {
            setError("Vui lòng nhập tên Album.");
            return;
        }

        try {
            setIsSubmitting(true);
            let coverImageUrl = '';

            // Upload ảnh nếu có
            if (coverImage) {
                const formData = new FormData();
                formData.append('file', coverImage);
                const uploadRes = await mediaService.uploadMedia(formData);
                if (uploadRes.success && uploadRes.data) {
                    coverImageUrl = uploadRes.data;
                } else {
                    throw new Error("Lỗi upload ảnh bìa.");
                }
            }

            // Tạo Album
            const res = await albumService.createAlbum({
                title,
                coverImageUrl,
                releaseDate: new Date(releaseDate).toISOString(),
                trackIds: selectedTrackIds
            });

            if (res.success) {
                setSuccess("Tạo Album thành công!");
                setTimeout(() => {
                    onClose();
                    setSuccess(null);
                }, 1000);
            } else {
                setError(res.message || "Không thể tạo Album.");
            }
        } catch (err: any) {
            console.error("Lỗi tạo album:", err);
            setError(err.message || "Đã xảy ra lỗi.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="bg-zinc-900 border border-zinc-800 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-slideUp">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-zinc-800">
                    <h2 className="text-xl font-bold text-white">Tạo Album Mới</h2>
                    <button 
                        onClick={onClose}
                        className="text-zinc-400 hover:text-white transition-colors p-1 rounded-full hover:bg-zinc-800"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-400 text-sm font-semibold">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}
                    
                    {success && (
                        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-3 text-green-400 text-sm font-semibold">
                            <CheckCircle className="w-5 h-5 shrink-0" />
                            <p>{success}</p>
                        </div>
                    )}

                    <form id="create-album-form" onSubmit={handleSubmit} className="space-y-6">
                        <div className="flex flex-col sm:flex-row gap-6">
                            {/* Cột trái: Ảnh */}
                            <div className="shrink-0 flex flex-col items-center gap-3">
                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-48 h-48 sm:w-56 sm:h-56 bg-zinc-800 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-700 transition-colors border-2 border-dashed border-zinc-700 hover:border-green-500 group relative overflow-hidden shadow-lg"
                                >
                                    {previewUrl ? (
                                        <>
                                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                <span className="text-white font-medium text-sm">Thay đổi ảnh</span>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-10 h-10 text-zinc-500 group-hover:text-green-500 transition-colors mb-2" />
                                            <span className="text-sm font-medium text-zinc-400 group-hover:text-green-500 transition-colors">Chọn ảnh bìa</span>
                                        </>
                                    )}
                                </div>
                                <input 
                                    type="file" 
                                    ref={fileInputRef}
                                    onChange={handleImageChange}
                                    accept="image/*"
                                    className="hidden" 
                                />
                                <p className="text-[10px] text-zinc-500 text-center">Định dạng hỗ trợ: JPG, PNG, WEBP.</p>
                            </div>

                            {/* Cột phải: Thông tin */}
                            <div className="flex-1 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-1.5">Tên Album <span className="text-red-500">*</span></label>
                                    <input 
                                        type="text" 
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Nhập tên album..."
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-1.5">Ngày phát hành</label>
                                    <input 
                                        type="date" 
                                        value={releaseDate}
                                        onChange={(e) => setReleaseDate(e.target.value)}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Chọn bài hát */}
                        <div className="pt-4 border-t border-zinc-800">
                            <h3 className="text-base font-bold text-white mb-3">Thêm bài hát vào Album</h3>
                            <p className="text-xs text-zinc-400 mb-4">Chỉ những bài hát bạn đã upload và chưa thuộc Album nào mới được hiển thị ở đây.</p>
                            
                            {isLoadingSongs ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="w-6 h-6 text-green-500 animate-spin" />
                                </div>
                            ) : mySongs.length === 0 ? (
                                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 text-center">
                                    <Music className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                                    <p className="text-sm text-zinc-400">Bạn chưa có bài hát nào trống để thêm vào album.</p>
                                </div>
                            ) : (
                                <div className="bg-zinc-950 border border-zinc-800 rounded-xl max-h-60 overflow-y-auto custom-scrollbar divide-y divide-zinc-800/50">
                                    {mySongs.map(song => (
                                        <label 
                                            key={song.id} 
                                            className="flex items-center gap-3 p-3 hover:bg-zinc-800/50 cursor-pointer transition-colors"
                                        >
                                            <div className="relative flex items-center justify-center w-5 h-5">
                                                <input 
                                                    type="checkbox"
                                                    checked={selectedTrackIds.includes(song.id)}
                                                    onChange={() => handleToggleTrack(song.id)}
                                                    className="w-5 h-5 rounded border-zinc-700 bg-zinc-900 text-green-500 focus:ring-green-500 focus:ring-offset-zinc-900 transition-colors cursor-pointer appearance-none checked:bg-green-500 checked:border-green-500"
                                                />
                                                {selectedTrackIds.includes(song.id) && (
                                                    <svg className="absolute w-3 h-3 text-black pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="20 6 9 17 4 12"></polyline>
                                                    </svg>
                                                )}
                                            </div>
                                            <div className="w-10 h-10 bg-zinc-800 rounded overflow-hidden shrink-0 shadow-sm">
                                                {song.coverUrl ? (
                                                    <img src={mediaService.getImageUrl(song.coverUrl)} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-zinc-600">
                                                        <Music className="w-4 h-4" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h4 className="text-sm font-semibold text-white truncate">{song.title}</h4>
                                                <p className="text-xs text-zinc-500 truncate">{song.artistName || 'Nghệ sĩ tự do'}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-zinc-800 flex justify-end gap-3 shrink-0 bg-zinc-900 rounded-b-2xl">
                    <button 
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-full text-sm font-bold text-white hover:bg-zinc-800 transition-colors"
                    >
                        Hủy
                    </button>
                    <button 
                        type="submit"
                        form="create-album-form"
                        disabled={isSubmitting || !title.trim()}
                        className="px-6 py-2.5 rounded-full text-sm font-bold bg-white text-black hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-white/10"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Đang tạo...
                            </>
                        ) : (
                            'Phát hành Album'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
