import { Activity, Settings, Video, LogOut } from 'lucide-react';
import clsx from 'clsx';

interface SidebarProps {
  active?: boolean;
}

export function Sidebar({ active = false }: SidebarProps) {
  return (
    <aside className="w-[250px] bg-base border-r border-border h-screen flex flex-col p-4">
      {/* Brand */}
      <div className="flex items-center gap-2 mb-8 text-primary font-mono text-xl font-bold tracking-tighter">
        <Activity className="w-6 h-6" />
        FORMCHECK
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        <button className={clsx(
          "w-full flex items-center gap-3 px-3 py-2 rounded font-sans text-sm transition-colors",
          active ? "bg-surface text-white border border-border" : "text-gray-400 hover:bg-surface hover:text-white"
        )}>
          <Video className="w-4 h-4" />
          Workout Mode
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded font-sans text-sm text-gray-400 hover:bg-surface hover:text-white transition-colors">
          <Settings className="w-4 h-4" />
          Settings
        </button>
      </nav>

      {/* Footer Controls */}
      <div className="pt-4 border-t border-border">
         <div className="space-y-4">
             {/* Exercise Selector Mock */}
             <div className="space-y-1">
                 <label className="text-xs text-gray-500 font-mono uppercase">Exercise</label>
                 <select className="w-full bg-surface border border-border rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-primary">
                     <option>Pushups</option>
                     <option>Squats</option>
                     <option>Plank</option>
                 </select>
             </div>

             <button className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded border border-alert/50 text-alert text-sm hover:bg-alert/10 transition-colors uppercase font-mono tracking-wider">
                 <LogOut className="w-4 h-4" />
                 End Session
             </button>
         </div>
      </div>
    </aside>
  );
}
