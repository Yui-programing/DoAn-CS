import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { userService } from "../services/userService";

export const RegisterArtistModal = ({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess?: () => void;
}) => {
  const { user } = useAuth();
  const [stageName, setStageName] = useState("");
  const [genres, setGenres] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!stageName.trim()) return setError("Vui lòng nhập nghệ danh.");
    if (!file) return setError("Vui lòng tải ảnh CMND/CCCD.");

    setIsSubmitting(true);
    setError("");
    try {
      const form = new FormData();
      form.append("stageName", stageName.trim());
      form.append("genres", genres.trim());
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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="w-[520px] bg-zinc-900 rounded-2xl p-6">
        <h3 className="text-lg font-bold mb-2">Đăng ký Artist</h3>
        <p className="text-sm text-zinc-400 mb-4">
          Gửi thông tin để admin xác minh và cấp quyền Artist.
        </p>

        {error && <div className="mb-3 text-sm text-red-400">{error}</div>}

        <div className="space-y-3">
          <input
            className="w-full p-3 rounded bg-zinc-800"
            placeholder="Nghệ danh"
            value={stageName}
            onChange={(e) => setStageName(e.target.value)}
          />
          <input
            className="w-full p-3 rounded bg-zinc-800"
            placeholder="Thể loại (phân tách bởi dấu phẩy)"
            value={genres}
            onChange={(e) => setGenres(e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="px-4 py-2 rounded bg-zinc-800">
            Hủy
          </button>
          <button
            onClick={submit}
            disabled={isSubmitting}
            className="px-4 py-2 rounded bg-green-500 text-black font-bold"
          >
            {isSubmitting ? "Đang gửi..." : "Gửi"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterArtistModal;
