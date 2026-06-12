import { useAuth } from '../../contexts/AuthContext.tsx';
import { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { Music, Eye, EyeOff, Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';
import api from '../../services/api';

export const Login = () => {
  const { loginState } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(''); // Xóa lỗi cũ nếu có
    setIsLoading(true);  // Bật trạng thái đang xoay (Task 4)

    try {
      // Gọi API thực tế lên Backend (Task 1)
      const response = await api.post('/auth/login', {
        email: email,
        password: password
      });

      // Nếu Backend trả về 200 OK
      if (response.data) {
        loginState(); // Bật trạng thái đã đăng nhập an toàn
        navigate('/'); // Cho vào nhà
      }
    } catch (error: any) {
      // Backend từ chối (400 hoặc 401)
      console.error("Đăng nhập thất bại:", error);

      // Lấy câu thông báo lỗi từ Backend gửi về, nếu không có thì dùng câu mặc định
      const backendError = error.response?.data?.message || "Sai tài khoản hoặc mật khẩu!";
      setErrorMessage(backendError); // Hiển thị lỗi lên UI (Task 4)
    } finally {
      setIsLoading(false); // Tắt trạng thái xoay
    }
  };


  return (
    <div className="w-screen min-h-screen bg-gradient-to-br from-slate-950 via-zinc-950 to-emerald-950/80 flex items-center justify-center p-4 font-sans text-slate-100">
      <div className="max-w-md w-full p-8 bg-zinc-900/60 backdrop-blur-md border border-zinc-800 rounded-3xl shadow-2xl flex flex-col items-center cursor-default transition-all duration-300 hover:border-zinc-700/60">

        {/* Logo */}
        <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/20 mb-4">
          <Music className="w-8 h-8 text-black stroke-[2.5]" />
        </div>
        <h1 className="text-2xl font-black tracking-tight text-slate-100">Chào mừng trở lại!</h1>
        <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mt-1 mb-8">
          Đăng nhập vào hệ thống TuneVault
        </p>

        {/* Lỗi */}
        {errorMessage && (
          <div className="w-full p-3 mb-4 text-sm text-red-200 bg-red-950/50 border border-red-900/50 rounded-xl text-center animate-fadeIn">
            {errorMessage}
          </div>
        )}

        {/* Form Đăng nhập */}
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

          {/* Mật khẩu */}
          <div className="space-y-1">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Mật khẩu</label>
              <a href="#" className="text-[10px] text-green-400 font-bold hover:underline">Quên mật khẩu?</a>
            </div>
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

          {/* Nút Đăng nhập */}
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
              <>
                <span>Đăng nhập</span>
                <ArrowRight className="w-4.5 h-4.5 stroke-[2.5]" />
              </>
            )}
          </button>
        </form>

        <div className="h-px bg-zinc-800 w-full my-6" />

        {/* Nút điều hướng bỏ qua / Đăng ký */}
        <div className="flex flex-col items-center gap-2 text-xs">
          <p className="text-zinc-500 font-semibold">
            Chưa có tài khoản?{' '}
            <a href="#" className="text-green-400 font-bold hover:underline">Đăng ký ngay</a>
          </p>

          <NavLink
            to="/"
            className="text-zinc-400 hover:text-green-400 font-bold hover:underline transition-colors mt-2"
          >
            Bỏ qua đăng nhập (Vào App trực tiếp)
          </NavLink>
        </div>

      </div>
    </div>
  );
};

export default Login;
