import { Activity, Settings, Video, LogOut } from 'lucide-react';
import clsx from 'clsx';

interface SidebarProps {
  active?: boolean;
}

export function Sidebar({ active = false }: SidebarProps) {
  return (
    <aside className="w-[280px] bg-base/95 backdrop-blur-md border-r border-border h-screen flex flex-col p-6 z-20 shadow-2xl">
      {/* Brand */}
      <div className="flex items-center gap-3 mb-10 text-primary font-mono text-xl font-bold tracking-tighter select-none">
        <Activity className="w-6 h-6 animate-pulse" />
        FORMCHECK
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        <div className="text-xs text-muted font-mono uppercase tracking-widest mb-4 pl-3">Mode Select</div>
        
        <button className={clsx(
          "w-full flex items-center gap-4 px-4 py-3 border-l-2 transition-all duration-200 group relative overflow-hidden",
          active 
            ? "border-primary bg-primary/10 text-primary-hover shadow-glow-primary" 
            : "border-transparent text-gray-400 hover:bg-surface hover:text-white hover:border-white/20"
        )}>
          <Video className="w-5 h-5" />
          <span className="font-sans font-medium tracking-wide">Workout Mode</span>
        </button>

        <button className="w-full flex items-center gap-4 px-4 py-3 border-l-2 border-transparent text-gray-400 hover:bg-surface hover:text-white hover:border-white/20 transition-all duration-200">
          <Settings className="w-5 h-5" />
          <span className="font-sans font-medium tracking-wide">Settings</span>
        </button>
      </nav>

      {/* Footer Controls */}
      <div className="pt-6 border-t border-border space-y-6">
         {/* Exercise Selector Mock */}
         <div className="space-y-2">
             <label className="text-xs text-muted font-mono uppercase tracking-widest flex items-center gap-2">
                Program
                <span className="w-1.5 h-1.5 rounded-full bg-primary/50" />
             </label>
             <div className="relative">
                 <select className="w-full bg-surface border border-border rounded-none px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-colors appearance-none cursor-pointer">
                     <option>Pushups</option>
                     <option>Squats</option>
                     <option>Plank</option>
                 </select>
                 <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                     ▼
                 </div>
             </div>
         </div>

         <button className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-alert text-alert text-sm hover:bg-alert hover:text-white transition-all duration-300 uppercase font-mono tracking-wider shadow-glow-alert/20 group">
             <LogOut className="w-4 h-4 group-hover:rotate-90 transition-transform" />
             End Session
         </button>
      </div>
    </aside>
  );
}
