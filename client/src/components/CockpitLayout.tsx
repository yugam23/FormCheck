import { useSocketStore } from '../store/socketStore';
import { ReadyState } from 'react-use-websocket';
import clsx from 'clsx';
import { Sidebar } from './Sidebar';
import { VideoFeed } from './VideoFeed';
import { OverlayCanvas } from './OverlayCanvas';

export function CockpitLayout() {
  const { readyState, lastMessage } = useSocketStore();
  
  // Parse last message
  let reps = 0;
  let feedback = "READY";
  let landmarks = null;
  
  if (lastMessage) {
      try {
          const data = JSON.parse(lastMessage);
          if (data.type === "RESULT") {
              reps = data.reps || 0;
              feedback = data.feedback || "READY";
              landmarks = data.landmarks || null;
          }
      } catch (e) {
          // ignore
      }
  }

  const connectionStatus = {
    [ReadyState.CONNECTING]: { text: 'CONNECTING', color: 'bg-yellow-500', textCol: 'text-yellow-500', glow: 'shadow-yellow-500/50' },
    [ReadyState.OPEN]: { text: 'SYSTEM ONLINE', color: 'bg-emerald-500', textCol: 'text-emerald-400', glow: 'shadow-emerald-500/50' },
    [ReadyState.CLOSING]: { text: 'DISCONNECTING', color: 'bg-orange-500', textCol: 'text-orange-500', glow: 'shadow-orange-500/50' },
    [ReadyState.CLOSED]: { text: 'OFFLINE', color: 'bg-alert', textCol: 'text-alert', glow: 'shadow-alert/50' },
    [ReadyState.UNINSTANTIATED]: { text: 'INITIALIZING', color: 'bg-gray-500', textCol: 'text-gray-500', glow: 'shadow-gray-500/50' },
  }[readyState];

  return (
    <div className="flex h-screen bg-base overflow-hidden selection:bg-primary/30">
      <Sidebar active />
      
      <main className="flex-1 flex flex-col items-center justify-center p-8 relative">
        {/* Background Grid Effect (Optional) */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.5)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none" />

        {/* Video Canvas Container */}
        <div className="w-full max-w-6xl aspect-video bg-black border border-border/50 rounded-none relative overflow-hidden shadow-2xl shadow-black ring-1 ring-white/5">
           <VideoFeed />
           <OverlayCanvas landmarks={landmarks} />
           
           {/* Scanline Effect */}
           <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[size:100%_2px,3px_100%] pointer-events-none opacity-20" />

           {/* Feedback Toast */}
           <div className="absolute top-8 left-1/2 -translate-x-1/2 z-30">
               <div className={clsx(
                   "px-8 py-4 backdrop-blur-md border shadow-lg transition-all duration-300",
                   feedback === "GOOD DEPTH! PUSH UP" ? "bg-emerald-900/40 border-emerald-500/50 text-emerald-300 shadow-glow-primary" :
                   feedback === "READY" ? "bg-surface/60 border-gray-700 text-gray-400" :
                   "bg-red-900/40 border-alert/50 text-alert shadow-glow-alert"
               )}>
                   <span className="font-mono font-bold tracking-widest text-lg uppercase flex items-center gap-3">
                       {feedback === "READY" && <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse" />}
                       {feedback}
                   </span>
               </div>
           </div>

           {/* Top Right: Rep Counter */}
           <div className="absolute top-8 right-8 flex flex-col items-end z-20">
               <span className="text-muted font-mono text-xs uppercase tracking-[0.2em] mb-1">Repetition</span>
               <div className="relative">
                   <span className="text-7xl font-mono text-primary font-bold tabular-nums drop-shadow-lg tracking-tighter">
                    {String(reps).padStart(2, '0')}
                   </span>
                   {/* Ghosting effect for numbers */}
                   <span className="absolute inset-0 text-7xl font-mono text-primary blur-lg opacity-40 tabular-nums tracking-tighter" aria-hidden="true">
                    {String(reps).padStart(2, '0')}
                   </span>
               </div>
           </div>
        </div>

        {/* Status Bar */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 bg-surface/80 backdrop-blur-lg border border-border rounded-full flex items-center gap-6 shadow-xl z-20">
            <div className="flex items-center gap-3">
                <div className={`relative w-2.5 h-2.5 rounded-full ${connectionStatus.color} ${readyState === ReadyState.OPEN ? 'animate-pulse' : ''} shadow-[0_0_8px_currentColor]`}>
                    <div className={`absolute inset-0 rounded-full ${connectionStatus.color} animate-ping opacity-75`} />
                </div>
                <span className={`text-xs font-mono font-bold tracking-wider ${connectionStatus.textCol}`}>{connectionStatus.text}</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-2 text-xs font-mono text-muted tracking-wider">
                <span>LATENCY</span>
                <span className="text-white">12ms</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <span className="text-xs font-mono text-gray-500 tracking-wider">V1.0.4-TACTICAL</span>
        </div>
      </main>
    </div>
  );
}
