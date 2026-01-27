import { useSocketStore } from '../store/socketStore';
import { ReadyState } from 'react-use-websocket';
import clsx from 'clsx';
import { Sidebar } from './Sidebar';
import { VideoFeed } from './VideoFeed';

export function CockpitLayout() {
  const { readyState, lastMessage } = useSocketStore();
  
  // Parse last message
  let reps = 0;
  let feedback = "READY";
  
  if (lastMessage) {
      try {
          const data = JSON.parse(lastMessage);
          if (data.type === "RESULT") {
              reps = data.reps || 0;
              feedback = data.feedback || "READY";
          }
      } catch (e) {
          // ignore
      }
  }

  const connectionStatus = {
    [ReadyState.CONNECTING]: { text: 'CONNECTING', color: 'bg-yellow-500', textCol: 'text-yellow-400' },
    [ReadyState.OPEN]: { text: 'SYSTEM_ONLINE', color: 'bg-emerald-500', textCol: 'text-emerald-400' },
    [ReadyState.CLOSING]: { text: 'DISCONNECTING', color: 'bg-orange-500', textCol: 'text-orange-400' },
    [ReadyState.CLOSED]: { text: 'OFFLINE', color: 'bg-alert', textCol: 'text-alert' },
    [ReadyState.UNINSTANTIATED]: { text: 'INITIALIZING', color: 'bg-gray-500', textCol: 'text-gray-400' },
  }[readyState];

  return (
    <div className="flex h-screen bg-surface">
      <Sidebar active />
      
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative">
        {/* Video Canvas Container */}
        <div className="w-full max-w-5xl aspect-video bg-base border border-border rounded-lg relative overflow-hidden shadow-2xl shadow-black/50">
           <VideoFeed />
           
           {/* Feedback Toast */}
           <div className="absolute top-6 left-1/2 -translate-x-1/2">
               <div className={clsx(
                   "px-6 py-3 rounded-full backdrop-blur-md border",
                   feedback === "GOOD DEPTH! PUSH UP" ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400" :
                   feedback === "READY" ? "bg-base/50 border-gray-700 text-gray-400" :
                   "bg-alert/20 border-alert/50 text-alert"
               )}>
                   <span className="font-mono font-bold tracking-wider">{feedback}</span>
               </div>
           </div>

           {/* Overlay Elements (Mock) */}
           <div className="absolute top-6 right-6 flex flex-col items-end pointer-events-none">
               <span className="text-gray-500 font-mono text-xs uppercase tracking-widest">Reps</span>
               <span className="text-6xl font-mono text-primary font-bold tabular-nums">{String(reps).padStart(2, '0')}</span>
           </div>

        </div>

        {/* Status Bar */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-base/80 backdrop-blur border border-border rounded-full flex items-center gap-4">
            <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${connectionStatus.color} ${readyState === ReadyState.OPEN ? 'animate-pulse' : ''}`} />
                <span className={`text-xs font-mono ${connectionStatus.textCol}`}>{connectionStatus.text}</span>
            </div>
            <div className="w-px h-4 bg-gray-700" />
            <span className="text-xs font-mono text-gray-400">CAMERA_READY</span>
        </div>
      </main>
    </div>
  );
}
