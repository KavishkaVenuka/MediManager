import { Search, User } from 'lucide-react';

export default function Header() {
  return (
    <div className="bg-primary-teal p-6 pb-12 rounded-b-[3rem] shadow-md relative z-10">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Search size={20} />
          </div>
          <input
            type="text"
            className="w-full bg-white rounded-full py-3 pl-10 pr-4 text-gray-700 focus:outline-none shadow-sm"
            placeholder=""
          />
        </div>
        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white backdrop-blur-sm">
           <User size={24} />
        </div>
      </div>
    </div>
  );
}
