import React, { useState } from "react";
import { X, UploadCloud, Film, Music, Check, AlertCircle, Loader2 } from "lucide-react";
import { mediaService } from "../services/mediaService";

interface UploadMediaModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export const UploadMediaModal = ({ onClose, onSuccess }: UploadMediaModalProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [mediaType, setMediaType] = useState<0 | 1>(0); // 0 = Audio, 1 = Video
  const [isPrivate, setIsPrivate] = useState(false);
  
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>("");

  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [error, setError] = useState("");

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setCoverImage(null);
      setCoverPreview("");
    }
  };

  const handleMediaFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setMediaFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Vui lòng nhập tiêu đề tác phẩm.");
      return;
    }
    if (!mediaFile) {
      setError("Vui lòng chọn tệp Media để tải lên.");
      return;
    }

    setIsUploading(true);
    setError("");
    setUploadStatus("Đang tải dữ liệu lên Cloudinary (Quá trình này có thể mất vài phút)...");

    try {
      const formData = new FormData();
      formData.append("Title", title.trim());
      formData.append("Description", description.trim());
      formData.append("MediaType", mediaType.toString());
      formData.append("IsPrivate", isPrivate.toString());
      formData.append("MediaFile", mediaFile);
      if (coverImage) {
        formData.append("CoverImage", coverImage);
      }

      const res = await mediaService.uploadMedia(formData);
      if (res.success) {
        setUploadStatus("Tải lên tác phẩm thành công!");
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 1500);
      } else {
        setError(res.message || "Tải lên thất bại. Vui lòng thử lại.");
        setIsUploading(false);
      }
    } catch (err: any) {
      console.error(err);
      const backendError = err.response?.data?.errors?.[0] || err.response?.data?.message;
      setError(backendError || "Có lỗi xảy ra khi kết nối tới máy chủ.");
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn p-4">
      <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-900 bg-zinc-950">
          <div className="flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-green-400" />
            <h3 className="text-lg font-bold text-slate-100">Đăng tác phẩm mới</h3>
          </div>
          <button 
            onClick={onClose}
            disabled={isUploading}
            type="button"
            className="text-zinc-400 hover:text-slate-100 hover:bg-zinc-900 p-1.5 rounded-full transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-zinc-850">
          {error && (
            <div className="flex items-center gap-2 p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-bold animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isUploading && (
            <div className="flex flex-col items-center justify-center p-6 bg-zinc-900/40 border border-zinc-900 rounded-xl text-center space-y-3">
              <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
              <p className="text-sm font-semibold text-green-400">{uploadStatus}</p>
              <span className="text-xs text-zinc-500">Vui lòng giữ cửa sổ này mở và không tải lại trang</span>
            </div>
          )}

          {!isUploading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Cover & Files */}
              <div className="space-y-5">
                {/* Cover Image Selector */}
                <div className="space-y-2">
                  <label className="text-xs text-zinc-400 font-extrabold uppercase tracking-wider">
                    Ảnh bìa tác phẩm (Tùy chọn)
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-28 h-28 bg-zinc-900 rounded-xl border border-zinc-800 flex items-center justify-center overflow-hidden relative shadow-inner shrink-0">
                      {coverPreview ? (
                        <img src={coverPreview} alt="Cover Preview" className="w-full h-full object-cover" />
                      ) : (
                        <Music className="w-8 h-8 text-zinc-700" />
                      )}
                    </div>
                    <div className="flex-1">
                      <label className="inline-block px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-slate-100 text-xs font-bold rounded-lg cursor-pointer transition-colors">
                        Chọn ảnh bìa
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleCoverChange} 
                          className="hidden" 
                        />
                      </label>
                      <p className="text-[10px] text-zinc-500 mt-2">Định dạng JPG, PNG. Tối đa 2MB.</p>
                    </div>
                  </div>
                </div>

                {/* MediaType Selector */}
                <div className="space-y-2">
                  <label className="text-xs text-zinc-400 font-extrabold uppercase tracking-wider">
                    Định dạng nghệ thuật
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setMediaType(0)}
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl border font-bold text-xs transition-all ${
                        mediaType === 0
                          ? "bg-green-500/10 border-green-500 text-green-400"
                          : "bg-zinc-900/50 border-zinc-850 text-zinc-450 hover:border-zinc-800 hover:text-zinc-300"
                      }`}
                    >
                      <Music className="w-4 h-4" />
                      Audio (Nhạc/Podcast)
                    </button>
                    <button
                      type="button"
                      onClick={() => setMediaType(1)}
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl border font-bold text-xs transition-all ${
                        mediaType === 1
                          ? "bg-green-500/10 border-green-500 text-green-400"
                          : "bg-zinc-900/50 border-zinc-850 text-zinc-450 hover:border-zinc-800 hover:text-zinc-300"
                      }`}
                    >
                      <Film className="w-4 h-4" />
                      Video (MV/Clip)
                    </button>
                  </div>
                </div>

                {/* Media File Selector */}
                <div className="space-y-2">
                  <label className="text-xs text-zinc-400 font-extrabold uppercase tracking-wider">
                    Tệp tác phẩm ({mediaType === 0 ? "Audio" : "Video"})
                  </label>
                  <div className="border border-dashed border-zinc-800 hover:border-green-500/50 bg-zinc-900/10 hover:bg-zinc-900/30 rounded-xl p-5 flex flex-col items-center justify-center text-center transition-all relative cursor-pointer">
                    <input 
                      type="file" 
                      accept={mediaType === 0 ? "audio/*" : "video/*"} 
                      onChange={handleMediaFileChange} 
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                    />
                    <UploadCloud className="w-8 h-8 text-zinc-500 mb-2" />
                    <span className="text-xs font-bold text-zinc-300">
                      {mediaFile ? mediaFile.name : "Kéo thả hoặc nhấp để chọn tệp"}
                    </span>
                    <span className="text-[10px] text-zinc-500 mt-1">
                      {mediaType === 0 ? "Hỗ trợ MP3, WAV, FLAC (Tối đa 15MB)" : "Hỗ trợ MP4, WEBM (Tối đa 100MB)"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Title & Description */}
              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-zinc-400 font-extrabold uppercase tracking-wider">
                    Tiêu đề tác phẩm
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-green-500 placeholder-zinc-650"
                    placeholder="Nhập tên bài hát hoặc video..."
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-zinc-400 font-extrabold uppercase tracking-wider">
                    Mô tả / Lời tựa
                  </label>
                  <textarea
                    rows={6}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-green-500 resize-none placeholder-zinc-650"
                    placeholder="Nhập lời bài hát hoặc thông tin mô tả chi tiết..."
                  />
                </div>

                {/* Privacy toggle */}
                <div className="flex items-center justify-between p-3.5 bg-zinc-900/40 border border-zinc-900 rounded-xl">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-slate-200">Chế độ riêng tư</span>
                    <span className="text-[10px] text-zinc-500">Chỉ mình bạn mới có quyền nghe/xem</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                    className="w-4 h-4 accent-green-500 cursor-pointer rounded" 
                  />
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Footer buttons */}
        {!isUploading && (
          <div className="flex justify-end gap-2.5 px-6 py-4 border-t border-zinc-900 bg-zinc-950 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-xs font-bold text-zinc-400 hover:text-slate-100 rounded-full border border-zinc-850 transition-colors"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-green-500 hover:bg-green-400 text-xs font-bold text-black rounded-full shadow-lg shadow-green-500/10 active:scale-95 transition-transform"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              Đăng tác phẩm
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadMediaModal;
