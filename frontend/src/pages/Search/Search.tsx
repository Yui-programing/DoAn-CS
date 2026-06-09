import { Search as SearchIcon, Compass } from 'lucide-react';

const categories = [
  { title: 'Nhạc Pop', color: 'from-pink-500 to-rose-600' },
  { title: 'Indie Việt', color: 'from-emerald-500 to-teal-600' },
  { title: 'Gaming', color: 'from-blue-600 to-indigo-700' },
  { title: 'Chill', color: 'from-purple-500 to-indigo-600' },
  { title: 'Lofi Cafe', color: 'from-amber-500 to-orange-600' },
  { title: 'Tập trung', color: 'from-cyan-500 to-blue-600' },
  { title: 'K-Pop', color: 'from-fuchsia-500 to-pink-600' },
  { title: 'Podcast', color: 'from-violet-600 to-purple-800' },
];

export const Search = () => {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Thanh tìm kiếm */}
      <div className="max-w-xl relative">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
        <input 
          type="text" 
          placeholder="Bạn muốn nghe gì?" 
          className="w-full pl-12 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-full text-sm placeholder-zinc-500 text-slate-100 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all shadow-inner"
        />
      </div>

      {/* Duyệt tìm các danh mục */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-zinc-300 font-bold">
          <Compass className="w-5 h-5 text-green-400" />
          <h3 className="text-xl tracking-tight">Duyệt tìm tất cả danh mục</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((category, index) => (
            <div 
              key={index}
              className={`h-40 rounded-xl bg-gradient-to-br ${category.color} p-5 relative overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform duration-200 shadow-md group`}
            >
              <h4 className="font-extrabold text-lg sm:text-xl text-white leading-tight break-words">
                {category.title}
              </h4>
              
              {/* Trang trí hình đĩa nhạc chéo đặc trưng */}
              <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full rotate-12 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-45" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Search;
