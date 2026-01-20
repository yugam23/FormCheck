import React, { useState, useEffect } from 'react';
import WebcamCapture from './components/WebcamCapture';
import StatsPanel from './components/StatsPanel';
import Dashboard from './components/Dashboard';
import { Activity, BarChart2, ChevronLeft, Play, Dumbbell } from 'lucide-react';

function App() {
  const [view, setView] = useState('home'); // home, workout, dashboard
  const [activeExercise, setActiveExercise] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('Connecting');
  const [poseData, setPoseData] = useState(null);

  // Mock session time for demo
  const [sessionTime, setSessionTime] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    let interval;
    if (timerActive) {
      interval = setInterval(() => setSessionTime(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  const startWorkout = (exercise) => {
    setActiveExercise(exercise);
    setView('workout');
    setSessionTime(0);
    setTimerActive(true);
  };

  const endWorkout = () => {
    setTimerActive(false);
    setView('dashboard');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-green-500/30">

      {/* Navigation Bar */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => setView('home')}
          >
            <div className="w-8 h-8 bg-gradient-to-tr from-green-400 to-emerald-600 rounded-lg flex items-center justify-center">
              <Activity size={20} className="text-black" />
            </div>
            <span className="text-xl font-bold tracking-tight">FormCheck<span className="text-green-400">.AI</span></span>
          </div>

          <div className="flex space-x-6">
            <button
              onClick={() => setView('home')}
              className={`text-sm font-medium transition-colors ${view === 'home' ? 'text-green-400' : 'text-gray-400 hover:text-white'}`}
            >
              Exercises
            </button>
            <button
              onClick={() => setView('dashboard')}
              className={`text-sm font-medium transition-colors ${view === 'dashboard' ? 'text-green-400' : 'text-gray-400 hover:text-white'}`}
            >
              Dashboard
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">

          {/* HOME VIEW: Exercise Selector */}
          {view === 'home' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="text-center space-y-4 max-w-2xl mx-auto mt-12">
                <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
                  Perfect Form.<br />Every Rep.
                </h1>
                <p className="text-xl text-gray-400">
                  AI-powered real-time coaching for your calisthenics workouts.
                  Select an exercise to begin.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-12">
                {/* Pushup Card */}
                <div
                  className="group relative h-80 rounded-2xl overflow-hidden cursor-pointer border border-white/10 hover:border-green-500/50 transition-all duration-300 transform hover:-translate-y-2"
                  onClick={() => startWorkout('Pushups')}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10" />
                  {/* Abstract placeholder bg or image */}
                  <div className="absolute inset-0 bg-gray-900 group-hover:scale-105 transition-transform duration-700">
                    <div className="w-full h-full opacity-30 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-green-900 via-gray-900 to-black"></div>
                  </div>

                  <div className="absolute bottom-0 left-0 p-8 z-20 w-full">
                    <div className="flex justify-between items-end">
                      <div>
                        <h3 className="text-3xl font-bold text-white mb-2">Pushups</h3>
                        <p className="text-gray-300 text-sm">Chest & Triceps • Beginner</p>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-black opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                        <Play fill="currentColor" size={20} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Squat Card */}
                <div
                  className="group relative h-80 rounded-2xl overflow-hidden cursor-pointer border border-white/10 hover:border-blue-500/50 transition-all duration-300 transform hover:-translate-y-2"
                  onClick={() => startWorkout('Squats')}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10" />
                  <div className="absolute inset-0 bg-gray-900 group-hover:scale-105 transition-transform duration-700">
                    <div className="w-full h-full opacity-30 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900 via-gray-900 to-black"></div>
                  </div>

                  <div className="absolute bottom-0 left-0 p-8 z-20 w-full">
                    <div className="flex justify-between items-end">
                      <div>
                        <h3 className="text-3xl font-bold text-white mb-2">Squats</h3>
                        <p className="text-gray-300 text-sm">Legs & Glutes • Beginner</p>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-black opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                        <Play fill="currentColor" size={20} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* WORKOUT VIEW */}
          {view === 'workout' && (
            <div className="animate-in fade-in zoom-in-95 duration-500 max-w-5xl mx-auto">
              <div className="flex items-center space-x-4 mb-6">
                <button
                  onClick={endWorkout}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <ChevronLeft size={24} />
                </button>
                <h2 className="text-2xl font-bold">{activeExercise} Session</h2>
                <div className="ml-auto flex items-center space-x-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-gray-400">
                  <div className={`w-2 h-2 rounded-full ${connectionStatus === 'Open' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                  <span>WS: {connectionStatus}</span>
                </div>
              </div>

              {/* Pass data handler up from Webcam if needed, but for now WebcamCapture handles mostly everything internally or we lift state. 
                   Ideally WebcamCapture should expose the data via callback for the StatsPanel.
                   Let's modify WebcamCapture slightly to bubble up data if we want StatsPanel separated, or pass a callback.
                   Checking WebcamCapture code... it has `onConnectionStatus` but not `onPoseData`. 
                   Wait, I implemented `WebcamCapture` to have internal state `poseData`.
                   I should lift `poseData` state to App or pass a callback `onPoseData` to WebcamCapture so StatsPanel can use it.
                   
                   Actually, looking at my `WebcamCapture` implementation again:
                   It has `const [poseData, setPoseData] = useState(null);` internally.
                   I should add a prop `onPoseDataUpdate` to `WebcamCapture` and call it.
                   
                   Alternatively, I can just render StatsPanel INSIDE WebcamCapture? No, separation is better.
                   I will modify App to pass a callback to WebcamCapture.
               */}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <WebcamCapture
                    onConnectionStatus={setConnectionStatus}
                    onPoseDataUpdate={setPoseData}
                  />
                </div>

                <div className="lg:col-span-1">
                  <StatsPanel
                    repData={poseData?.rep_data}
                    feedback={poseData?.feedback}
                    sessionTime={sessionTime}
                  />

                  <div className="mt-6 flex justify-center">
                    <button
                      onClick={endWorkout}
                      className="w-full btn-secondary text-red-400 border-red-500/30 hover:bg-red-500/10"
                    >
                      End Session
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* DASHBOARD VIEW */}
          {view === 'dashboard' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <Dashboard />
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

export default App;
