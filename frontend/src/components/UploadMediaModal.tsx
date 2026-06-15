import React, { useState, useRef } from 'react';
import { X, UploadCloud, Image as ImageIcon, Music, Loader2, AlertCircle } from 'lucide-react';
import { mediaService } from '../services/mediaService';

interface UploadMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UploadMediaModal: React.FC<UploadMediaModalProps> = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [duration, setDuration] = useState<number>(0);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const mediaInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setMediaFile(file);
      // Tự động điền tiêu đề từ tên file nếu tiêu đề đang trống
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ""));
      }

      // Trích xuất thời lượng (duration) thực tế của file nhạc/video
      const audio = new Audio();
      const objectUrl = URL.createObjectURL(file);
      audio.src = objectUrl;
      audio.onloadedmetadata = () => {
        setDuration(Math.round(audio.duration));
        URL.revokeObjectURL(objectUrl);
      };
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setCoverImage(file);
      
      // Tạo preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!title.trim()) {
      setError("Vui lòng nhập tên bài hát.");
      return;
    }
    if (!mediaFile) {
      setError("Vui lòng chọn file âm thanh hoặc video.");
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('Title', title);
      if (description) formData.append('Description', description);
      
      // Xác định loại file dựa vào định dạng
      const isVideo = mediaFile.type.startsWith('video/');
      formData.append('MediaType', isVideo ? '1' : '0'); 
      
      formData.append('IsPrivate', isPrivate.toString());
      formData.append('Duration', duration.toString()); // Đẩy thời lượng thực tế lên backend
      formData.append('MediaFile', mediaFile);
      if (coverImage) {
        formData.append('CoverImage', coverImage);
      }

      const res = await mediaService.uploadMedia(formData);
      
      if (res.success) {
        setSuccess("Tải lên thành công! Bài hát đã được đưa vào thư viện.");
        // Làm mới form
        setTitle('');
        setDescription('');
        setMediaFile(null);
        setCoverImage(null);
        setCoverPreviewUrl(null);
        setIsPrivate(false);
        setDuration(0);
        if (mediaInputRef.current) mediaInputRef.current.value = '';
        if (coverInputRef.current) coverInputRef.current.value = '';
        
        // Đóng modal sau 2 giây
        setTimeout(() => {
          onClose();
          setSuccess(null);
          // Báo cho toàn bộ app biết là có nhạc mới để tự động fetch lại
          window.dispatchEvent(new Event('mediaUploaded'));
        }, 2000);
      } else {
        setError(res.message || "Có lỗi xảy ra khi tải lên.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Lỗi kết nối máy chủ. File có thể quá lớn (Max: 15MB cho Audio).");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fadeIn"
        onClick={!isLoading ? onClose : undefined}
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-slideUp flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800 shrink-0">
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <UploadCloud className="w-6 h-6 text-green-400" />
            Tải lên Media mới
          </h2>
          <button 
            onClick={onClose}
            disabled={isLoading}
            className="text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-400 text-sm font-semibold">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-3 text-green-400 text-sm font-semibold">
              <UploadCloud className="w-5 h-5 shrink-0" />
              <p>{success}</p>
            </div>
          )}

          <form id="upload-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* File & Cover Section */}
            <div className="flex flex-col md:flex-row gap-6">
              
              {/* Cover Upload */}
              <div className="flex flex-col gap-2 shrink-0">
                <label className="text-sm font-semibold text-zinc-300">Ảnh bìa (Tùy chọn)</label>
                <div 
                  className={`w-40 h-40 rounded-xl border-2 border-dashed ${coverPreviewUrl ? 'border-green-500' : 'border-zinc-700 hover:border-zinc-500'} flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-colors relative group`}
                  onClick={() => coverInputRef.current?.click()}
                >
                  {coverPreviewUrl ? (
                    <>
                      <img src={coverPreviewUrl} alt="Cover Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-sm font-bold text-white">Đổi ảnh</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-8 h-8 text-zinc-500 mb-2" />
                      <span className="text-xs text-zinc-400 font-semibold text-center px-2">Chọn ảnh bìa vuông</span>
                    </>
                  )}
                  <input 
                    type="file" 
                    ref={coverInputRef} 
                    className="hidden" 
                    accept="image/jpeg, image/png, image/webp"
                    onChange={handleCoverChange}
                  />
                </div>
              </div>

              {/* Media Upload & Title */}
              <div className="flex-1 flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-zinc-300">File Audio / Video <span className="text-red-400">*</span></label>
                  <div 
                    className="w-full h-20 rounded-xl border-2 border-dashed border-zinc-700 hover:border-zinc-500 flex flex-col items-center justify-center cursor-pointer transition-colors bg-zinc-800/30"
                    onClick={() => mediaInputRef.current?.click()}
                  >
                    {mediaFile ? (
                      <div className="flex items-center gap-3 px-4 w-full">
                        <Music className="w-6 h-6 text-green-400 shrink-0" />
                        <span className="text-sm font-semibold text-zinc-300 truncate flex-1">{mediaFile.name}</span>
                        <span className="text-xs text-zinc-500 font-medium bg-zinc-800 px-2 py-1 rounded-md shrink-0">
                          {(mediaFile.size / (1024 * 1024)).toFixed(2)} MB
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-zinc-400 px-4 text-center">
                        <UploadCloud className="w-5 h-5 shrink-0" />
                        <span className="text-sm font-semibold">Nhấn để chọn file nhạc (mp3) hoặc video (mp4)</span>
                      </div>
                    )}
                    <input 
                      type="file" 
                      ref={mediaInputRef} 
                      className="hidden" 
                      accept="audio/mpeg, audio/wav, video/mp4, video/webm"
                      onChange={handleMediaChange}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="title" className="text-sm font-semibold text-zinc-300">Tiêu đề bài hát <span className="text-red-400">*</span></label>
                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="VD: Có Chàng Trai Viết Lên Cây"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-slate-100 placeholder-zinc-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
                  />
                </div>
              </div>

            </div>

            {/* Description */}
            <div className="flex flex-col gap-2">
              <label htmlFor="description" className="text-sm font-semibold text-zinc-300">Mô tả (Tùy chọn)</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Nhập mô tả ngắn cho bài hát của bạn..."
                rows={3}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-slate-100 placeholder-zinc-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors resize-none"
              />
            </div>

            {/* Privacy Toggle */}
            <div className="flex items-center gap-3 p-4 bg-zinc-800/50 rounded-lg border border-zinc-800">
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                />
                <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
              </label>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-200">Chế độ riêng tư</span>
                <span className="text-xs text-zinc-400">Nếu bật, chỉ mình bạn mới có thể nghe bài hát này.</span>
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-zinc-800 bg-zinc-900 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-6 py-2.5 rounded-full font-bold text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="submit"
            form="upload-form"
            disabled={isLoading}
            className="px-8 py-2.5 rounded-full font-bold text-sm bg-green-500 hover:bg-green-400 text-black shadow-lg shadow-green-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              'Tải lên ngay'
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
