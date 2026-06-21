import { useState, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { userService } from "../services/userService";
import { UploadCloud, FileImage, X, Loader2, Music } from "lucide-react";

const POPULAR_GENRES = ["Pop", "R&B", "Hip Hop", "EDM", "Rock", "Indie", "Jazz", "Lofi", "Acoustic", "Nhạc Trữ Tình"];

export const RegisterArtistModal = ({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess?: () => void;
}) => {
  const { user } = useAuth();
  const [stageName, setStageName] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [showOtherGenre, setShowOtherGenre] = useState(false);
  const [otherGenre, setOtherGenre] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const submit = async () => {
    if (!stageName.trim()) return setError("Vui lòng nhập nghệ danh.");
    if (!file) return setError("Vui lòng tải ảnh CMND/CCCD.");

    setIsSubmitting(true);
    setError("");
    try {
      const form = new FormData();
      form.append("stageName", stageName.trim());
      
      let finalGenres = selectedGenres.join(", ");
      if (showOtherGenre && otherGenre.trim()) {
        finalGenres += finalGenres ? `, ${otherGenre.trim()}` : otherGenre.trim();
      }
      form.append("genres", finalGenres);
      form.append("idCard", file);

      const res = await userService.submitArtistRegistration(form);
      if (res.success) {
        onSuccess && onSuccess();
        onClose();
      } else {
        setError(res.message || "Gửi yêu cầu thất bại.");
      }
    } catch (e: any) {
      setError(e.response?.data?.message || "Lỗi kết nối.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="w-full max-w-[560px] max-h-[90vh] overflow-y-auto bg-zinc-950 rounded-2xl p-6 sm:p-8 border border-zinc-800 shadow-2xl relative">
        
        {/* Nút đóng (X) */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
            <Music className="w-5 h-5 text-green-400" />
          </div>
          <h3 className="text-2xl font-black text-slate-100 tracking-tight">Đăng ký Artist</h3>
        </div>
        <p className="text-sm text-zinc-400 mb-6 font-medium">
          Trở thành Nghệ sĩ trên TuneVault để bắt đầu chia sẻ âm nhạc của bạn với thế giới. Vui lòng cung cấp các thông tin dưới đây để chúng tôi xác minh.
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold rounded-xl flex items-center gap-2">
            {error}
          </div>
        )}

        {/* Form Fields */}
        <div className="space-y-5">
          
          {/* Nghệ danh */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-200">
              Nghệ danh (Stage Name) <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-zinc-500 font-medium">Tên bạn sẽ hiển thị trên nền tảng với tư cách là Nghệ sĩ.</p>
            <input
              className="w-full p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-slate-200 focus:outline-none focus:border-green-500 transition-colors"
              placeholder="VD: Sơn Tùng M-TP, tlinh..."
              value={stageName}
              onChange={(e) => setStageName(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Thể loại */}
          <div className="space-y-3">
            <div>
              <label className="text-sm font-bold text-slate-200">Thể loại âm nhạc chính</label>
              <p className="text-xs text-zinc-500 font-medium mt-1">Các thể loại âm nhạc bạn thường sáng tác hoặc biểu diễn.</p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {POPULAR_GENRES.map(genre => (
                <label 
                  key={genre}
                  className={`px-4 py-2 rounded-full text-sm font-medium border cursor-pointer transition-all ${
                    selectedGenres.includes(genre) 
                      ? 'bg-green-500/20 border-green-500 text-green-400' 
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-600'
                  }`}
                >
                  <input 
                    type="checkbox" 
                    className="hidden"
                    checked={selectedGenres.includes(genre)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedGenres([...selectedGenres, genre]);
                      } else {
                        setSelectedGenres(selectedGenres.filter(g => g !== genre));
                      }
                    }}
                    disabled={isSubmitting}
                  />
                  {genre}
                </label>
              ))}
              
              <label 
                className={`px-4 py-2 rounded-full text-sm font-medium border cursor-pointer transition-all ${
                  showOtherGenre 
                    ? 'bg-green-500/20 border-green-500 text-green-400' 
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-600'
                }`}
              >
                <input 
                  type="checkbox" 
                  className="hidden"
                  checked={showOtherGenre}
                  onChange={(e) => setShowOtherGenre(e.target.checked)}
                  disabled={isSubmitting}
                />
                Khác
              </label>
            </div>

            {showOtherGenre && (
              <div className="animate-fadeIn mt-2">
                <input
                  className="w-full p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-slate-200 focus:outline-none focus:border-green-500 transition-colors"
                  placeholder="Nhập thể loại khác (phân cách bằng dấu phẩy nếu có nhiều)"
                  value={otherGenre}
                  onChange={(e) => setOtherGenre(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            )}
          </div>

          {/* Ảnh CMND/CCCD */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-200">
              Xác minh danh tính (CMND/CCCD) <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-zinc-500 font-medium">
              Tải lên ảnh chụp rõ nét mặt trước CMND/CCCD. Chúng tôi cam kết bảo mật tuyệt đối.
            </p>
            
            <div 
              className={`mt-2 border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                file ? 'border-green-500 bg-green-500/5' : 'border-zinc-700 bg-zinc-900 hover:bg-zinc-800 hover:border-zinc-500'
              } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => !isSubmitting && fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="hidden"
                disabled={isSubmitting}
              />
              
              {file ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-green-500/20 flex items-center justify-center">
                    <FileImage className="w-7 h-7 text-green-500" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-green-400">{file.name}</div>
                    <div className="text-xs text-zinc-500 font-medium mt-1">Nhấn để chọn ảnh khác</div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center">
                    <UploadCloud className="w-7 h-7 text-zinc-400" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-300">Nhấn vào đây để tải ảnh lên</div>
                    <div className="text-xs text-zinc-500 font-medium mt-1">Hỗ trợ định dạng JPG, PNG</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Nút hành động */}
        <div className="flex justify-end gap-3 mt-6 pt-5 border-t border-zinc-800/50">
          <button 
            onClick={onClose} 
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-full text-sm font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={submit}
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 px-8 py-2.5 rounded-full bg-green-500 hover:bg-green-400 text-black text-sm font-extrabold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-500/20"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang gửi...
              </>
            ) : "Gửi yêu cầu"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterArtistModal;
