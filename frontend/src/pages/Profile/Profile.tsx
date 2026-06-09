import { useState } from 'react';
import { User, Edit2, Camera, Check } from 'lucide-react';

export const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    fullName: 'Phương Duy',
    bio: 'Thành viên nhóm Frontend - Chịu trách nhiệm thiết kế giao diện chính và Trình phát nhạc cho dự án TuneVault.',
    avatarUrl: ''
  });

  const [tempProfile, setTempProfile] = useState({ ...profile });

  const handleSave = () => {
    setProfile({ ...tempProfile });
    setIsEditing(false);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Banner hồ sơ */}
      <div className="flex flex-col md:flex-row items-center md:items-end gap-6 pb-6 border-b border-zinc-900">
        
        {/* Avatar */}
        <div className="relative group shrink-0">
          <div className="w-36 h-36 rounded-full bg-zinc-800 border-2 border-green-500/50 flex items-center justify-center font-black text-4xl text-green-400 shadow-2xl relative overflow-hidden">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span>PD</span>
            )}
          </div>
          {isEditing && (
            <button className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center text-slate-100 opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-6 h-6 text-green-400" />
            </button>
          )}
        </div>

        {/* Thông tin hồ sơ */}
        <div className="text-center md:text-left space-y-2 flex-1">
          <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-widest bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">
            Hồ sơ cá nhân
          </span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-slate-100 mt-1">
            {profile.fullName}
          </h2>
          <p className="text-sm text-zinc-400 font-medium leading-relaxed max-w-xl">
            {profile.bio}
          </p>
          
          <div className="text-xs text-zinc-500 font-bold tracking-wide pt-1 flex items-center justify-center md:justify-start gap-4">
            <span>2 Playlist cá nhân</span>
            <span>•</span>
            <span>12 Người theo dõi</span>
            <span>•</span>
            <span>8 Bài hát yêu thích</span>
          </div>
        </div>

        {/* Nút Edit */}
        {!isEditing && (
          <button 
            onClick={() => { setTempProfile({ ...profile }); setIsEditing(true); }}
            className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-green-400 text-xs font-bold px-4 py-2.5 rounded-full border border-zinc-800 transition-colors shrink-0"
          >
            <Edit2 className="w-4 h-4" />
            <span>Chỉnh sửa hồ sơ</span>
          </button>
        )}
      </div>

      {/* Form chỉnh sửa nếu ở chế độ Edit */}
      {isEditing && (
        <section className="bg-zinc-900/20 border border-zinc-900 rounded-2xl p-6 max-w-2xl space-y-4">
          <h3 className="text-base font-bold text-slate-200">Thông tin chỉnh sửa</h3>
          
          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-zinc-500 font-bold uppercase">Họ và Tên</label>
              <input 
                type="text" 
                value={tempProfile.fullName}
                onChange={(e) => setTempProfile({ ...tempProfile, fullName: e.target.value })}
                className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-green-500"
              />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-zinc-500 font-bold uppercase">Tiểu sử (Bio)</label>
              <textarea 
                rows={3}
                value={tempProfile.bio}
                onChange={(e) => setTempProfile({ ...tempProfile, bio: e.target.value })}
                className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-green-500 resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button 
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-xs font-bold text-zinc-400 rounded-full border border-zinc-850"
            >
              Hủy
            </button>
            <button 
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 bg-green-500 hover:bg-green-400 text-xs font-bold text-black rounded-full"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              Lưu thay đổi
            </button>
          </div>
        </section>
      )}
    </div>
  );
};

export default Profile;
