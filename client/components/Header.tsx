import { User, Activity } from 'lucide-react';

export default function Header() {
  return (
    <div className="bg-primary-teal p-6 pb-12 rounded-b-[3rem] shadow-md relative z-10">
      <div className="flex items-center justify-between gap-4">
        {/* Brand Name */}
        <div className="flex items-center gap-2">
          <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
            <Activity className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Medi<span className="text-teal-100">Manager</span>
            </h1>
          </div>
        </div>

        {/* User Profile */}
        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white backdrop-blur-sm hover:bg-white/30 transition-colors cursor-pointer">
          <User size={24} />
        </div>
      </div>
    </div>
  );
}
