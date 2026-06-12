import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Music, Mail, ArrowLeft, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { authService } from '../../services/authService';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');
    setIsLoading(true);

    try {
      // Gọi API kiểm tra Email thực tế dưới Database
      const response = await authService.forgotPassword(email);
      if (response.success) {
        setSuccessMessage(response.message || 'Yêu cầu khôi phục mật khẩu đã được gửi thành công!');
      } else {
        setErrorMessage(response.message || 'Khôi phục mật khẩu thất bại!');
      }
    } catch (error: any) {
      console.error("Lỗi khôi phục mật khẩu:", error);
      // Ưu tiên hiển thị lỗi chi tiết trong mảng errors, sau đó là message, cuối cùng là mặc định
      const backendError = error.response?.data?.errors?.[0] || 
                           error.response?.data?.message || 
                           "Email không tồn tại!";
      setErrorMessage(backendError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-screen min-h-screen bg-gradient-to-br from-slate-950 via-zinc-950 to-emerald-950/80 flex items-center justify-center p-4 font-sans text-slate-100">
      <div className="max-w-md w-full p-8 bg-zinc-900/60 backdrop-blur-md border border-zinc-800 rounded-3xl shadow-2xl flex flex-col items-center cursor-default transition-all duration-300 hover:border-zinc-700/60">

        {/* Logo */}
        <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/20 mb-4">
          <Music className="w-8 h-8 text-black stroke-[2.5]" />
        </div>
        <h1 className="text-2xl font-black tracking-tight text-slate-100">Quên mật khẩu?</h1>
        <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mt-1 mb-6 text-center">
          Nhập Email của bạn để nhận hướng dẫn đặt lại mật khẩu
        </p>

        {/* Cảnh báo kiểm tra database */}
        <div className="w-full p-3.5 mb-4 text-xs text-amber-200 bg-amber-950/40 border border-amber-900/40 rounded-xl flex gap-2 animate-fadeIn">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <div>
            <span className="font-bold">Thông tin:</span> Hệ thống sẽ kiểm tra email thực tế trong Database. Nếu email tồn tại, yêu cầu khôi phục sẽ được chấp nhận.
          </div>
        </div>

        {/* Thông báo lỗi */}
        {errorMessage && (
          <div className="w-full p-3 mb-4 text-sm text-red-200 bg-red-950/50 border border-red-900/50 rounded-xl text-center animate-fadeIn">
            {errorMessage}
          </div>
        )}

        {/* Thông báo gửi thành công */}
        {successMessage && (
          <div className="w-full p-3 mb-4 text-sm text-emerald-250 bg-emerald-950/50 border border-emerald-900/50 rounded-xl flex items-center justify-center gap-2 text-center animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form khôi phục mật khẩu */}
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          {/* Email */}
          <div className="space-y-1">
            <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider pl-1">Địa chỉ Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ten@vi-du.com"
                className="w-full pl-11 pr-4 py-2.5 bg-black/40 border border-zinc-800 rounded-xl text-sm placeholder-zinc-650 text-slate-200 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
              />
            </div>
          </div>

          {/* Nút Gửi */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-green-500 hover:bg-green-400 disabled:bg-zinc-800 disabled:text-zinc-500 text-black font-bold text-sm rounded-xl transition-all duration-200 hover:scale-[1.01] active:scale-95 shadow-md flex items-center justify-center gap-1.5 mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4.5 h-4.5 animate-spin stroke-[2.5]" />
                <span>Đang xử lý...</span>
              </>
            ) : (
              <span>Gửi yêu cầu</span>
            )}
          </button>
        </form>

        <div className="h-px bg-zinc-800 w-full my-6" />

        {/* Nút quay lại đăng nhập */}
        <div className="flex flex-col items-center gap-2 text-xs">
          <Link
            to="/login"
            className="text-zinc-400 hover:text-green-400 font-bold hover:underline transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại trang Đăng nhập</span>
          </Link>
        </div>

      </div>
    </div>
  );
};

export default ForgotPassword;
