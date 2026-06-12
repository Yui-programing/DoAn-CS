import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Music, Eye, EyeOff, Lock, Mail, User, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { authService } from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext.tsx';

export const Register = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Tự động chuyển hướng nếu đã đăng nhập
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Kiểm tra mật khẩu xác nhận trùng khớp
    if (password !== confirmPassword) {
      setErrorMessage('Mật khẩu xác nhận không khớp!');
      return;
    }

    setIsLoading(true);

    try {
      // Gọi API đăng ký qua authService
      const response = await authService.register({
        name: name,
        email: email,
        password: password
      });

      if (response.success) {
        setSuccessMessage('Đăng ký tài khoản thành công! Đang chuyển hướng sang trang Đăng nhập...');
        // Chuyển hướng sang trang đăng nhập sau 2 giây
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setErrorMessage(response.message || 'Đăng ký thất bại!');
      }
    } catch (error: any) {
      console.error("Lỗi đăng ký:", error);
      // Trích xuất lỗi từ Backend
      const backendError = error.response?.data?.message || 
                           error.response?.data?.errors?.[0] || 
                           "Đăng ký thất bại, vui lòng thử lại!";
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
        <h1 className="text-2xl font-black tracking-tight text-slate-100">Tạo tài khoản mới</h1>
        <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mt-1 mb-6">
          Khởi tạo tài khoản TuneVault của bạn
        </p>

        {/* Thông báo lỗi */}
        {errorMessage && (
          <div className="w-full p-3 mb-4 text-sm text-red-200 bg-red-950/50 border border-red-900/50 rounded-xl text-center animate-fadeIn">
            {errorMessage}
          </div>
        )}

        {/* Thông báo thành công */}
        {successMessage && (
          <div className="w-full p-3 mb-4 text-sm text-emerald-250 bg-emerald-950/50 border border-emerald-900/50 rounded-xl flex items-center justify-center gap-2 text-center animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form Đăng ký */}
        <form onSubmit={handleSubmit} className="w-full space-y-3">
          {/* Tên hiển thị */}
          <div className="space-y-1">
            <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider pl-1">Họ và tên</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-500" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="w-full pl-11 pr-4 py-2.5 bg-black/40 border border-zinc-800 rounded-xl text-sm placeholder-zinc-650 text-slate-200 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
              />
            </div>
          </div>

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

          {/* Mật khẩu */}
          <div className="space-y-1">
            <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider pl-1">Mật khẩu</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-11 py-2.5 bg-black/40 border border-zinc-800 rounded-xl text-sm placeholder-zinc-650 text-slate-200 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-0.5"
              >
                {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>
          </div>

          {/* Xác nhận Mật khẩu */}
          <div className="space-y-1">
            <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider pl-1">Xác nhận mật khẩu</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-500" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-11 py-2.5 bg-black/40 border border-zinc-800 rounded-xl text-sm placeholder-zinc-650 text-slate-200 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-0.5"
              >
                {showConfirmPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>
          </div>

          {/* Nút Đăng ký */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-green-500 hover:bg-green-400 disabled:bg-zinc-800 disabled:text-zinc-500 text-black font-bold text-sm rounded-xl transition-all duration-200 hover:scale-[1.01] active:scale-95 shadow-md flex items-center justify-center gap-1.5 mt-4"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4.5 h-4.5 animate-spin stroke-[2.5]" />
                <span>Đang xử lý...</span>
              </>
            ) : (
              <>
                <span>Đăng ký</span>
                <ArrowRight className="w-4.5 h-4.5 stroke-[2.5]" />
              </>
            )}
          </button>
        </form>

        <div className="h-px bg-zinc-800 w-full my-5" />

        {/* Nút điều hướng về đăng nhập */}
        <div className="flex flex-col items-center gap-2 text-xs">
          <p className="text-zinc-500 font-semibold">
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-green-400 font-bold hover:underline">Đăng nhập</Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Register;
