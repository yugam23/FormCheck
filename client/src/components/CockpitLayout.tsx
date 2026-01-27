import { Sidebar } from './Sidebar';

export function CockpitLayout() {
  return (
    <div className="flex h-screen bg-surface">
      <Sidebar active />
      
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative">
        {/* Video Canvas Container */}
        <div className="w-full max-w-5xl aspect-video bg-base border border-border rounded-lg relative overflow-hidden shadow-2xl shadow-black/50">
           
           {/* Placeholder for Video Feed */}
           <div className="absolute inset-0 flex items-center justify-center text-gray-700 font-mono text-sm">
               AWAITING_VIDEO_SIGNAL...
           </div>

           {/* Overlay Elements (Mock) */}
           <div className="absolute top-6 right-6 flex flex-col items-end">
               <span className="text-gray-500 font-mono text-xs uppercase tracking-widest">Reps</span>
               <span className="text-6xl font-mono text-primary font-bold tabular-nums">00</span>
           </div>

        </div>

        {/* Status Bar */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-base/80 backdrop-blur border border-border rounded-full flex items-center gap-4">
            <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-mono text-emerald-400">SYSTEM_ONLINE</span>
            </div>
            <div className="w-px h-4 bg-gray-700" />
            <span className="text-xs font-mono text-gray-400">CAMERA_READY</span>
        </div>
      </main>
    </div>
  );
}
