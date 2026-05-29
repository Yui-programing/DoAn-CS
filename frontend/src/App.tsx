//Import
import { useState } from "react";
import  './App.css';
//Build
function App() {
  const [count, setCount] = useState(0);

  return (
    
// 1. Khung nền lớn toàn màn hình với hiệu ứng chuyển màu Gradient huyền ảo
  <div className="w-screen min-h-screen bg-gradient-to-br from-slate-950 via-cyan-950 to-indigo-950 flex justify-center items-center p-4">
    
    {/* 2. Chiếc hộp chứa nội dung được thiết kế lại */}
    {/* - bg-slate-900/60: Nền tối trong suốt 60% */}
    {/* - backdrop-blur-md: Làm mờ những gì nằm phía sau hộp (hiệu ứng kính) */}
    {/* - hover:shadow-cyan-500/20: Khi di chuột vào sẽ tỏa ra ánh hào quang màu xanh cyan */}
    <div className="
      max-w-2xl w-full p-8 md:p-12
      bg-slate-900/60 backdrop-blur-md 
      border border-slate-800 rounded-3xl shadow-2xl
      text-center cursor-pointer
      
      /* Cấu hình hiệu ứng chuyển động mượt mà */
      transition-all duration-500 ease-out
      
      /* Hiệu ứng khi RE CHUỘT: Nhấc hộp lên, đổi màu viền, phát sáng */
      hover:-translate-y-2 hover:border-cyan-400/50 hover:shadow-cyan-500/20
    ">
      
      {/* 3. Phần tiêu đề / Tên của bạn */}
      {/* bg-clip-text kết hợp text-transparent giúp chữ cũng có hiệu ứng chuyển màu Gradient */}
      <h1 className="text-3xl md:text-4xl font-black tracking-wide bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-4">
        CON CẶC
      </h1>
      
      {/* 4. Đoạn văn phụ trợ */}
      <p className="text-base md:text-lg text-slate-400 font-medium leading-relaxed">
        Đang làm chủ 
        <span className="text-cyan-400 font-semibold ml-1a"> Tailwind CSS</span>
      </p>

      {/* 5. Điểm nhấn trang trí thêm: Một chấm tròn xanh nhỏ giả lập trạng thái Online */}
      <div className="mt-6 flex justify-center items-center gap-2">
        <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse"></span>
        <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">Ready to build</span>
      </div>

    </div>

  </div>
  );
}

export default App;
