
import { Play, ArrowRight, Activity, Zap, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


const HomeView = () => {
    const navigate = useNavigate();

    const startWorkout = (exercise: string) => {
        navigate('/workout', { state: { exercise } });
    };

    return (
        <div className="relative space-y-24 animate-fade-in pb-20">
            {/* Hero Section */}
            <section className="relative text-center space-y-8 max-w-4xl mx-auto mt-12 z-20">
                <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-4 backdrop-blur-md">
                    <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                    <span className="text-xs font-medium text-primary uppercase tracking-wider">AI-Powered Analysis</span>
                </div>
                
                <h1 className="text-6xl md:text-8xl font-display font-bold tracking-tight text-white leading-[0.9]">
                    Master Your <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-emerald-400 to-teal-400">Movement.</span>
                </h1>
                
                <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-light">
                    Real-time form correction for calisthenics. <br/>
                    <strong className="text-white font-medium">Precision coaching</strong> in every rep.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                    <button 
                        onClick={() => document.getElementById('exercises')?.scrollIntoView({ behavior: 'smooth' })}
                        className="btn-primary group flex items-center shadow-2xl shadow-primary/20"
                    >
                        Start Training
                        <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button className="glass-button">
                        View Demo
                    </button>
                </div>
            </section>

            {/* Features Grid (Mini) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto relative z-20">
                {[
                    { icon: Activity, title: "Real-time Tracking", desc: "Latency-free skeletal detection at 30FPS" },
                    { icon: Zap, title: "Instant Feedback", desc: "Voice and visual cues for form correction" },
                    { icon: Trophy, title: "Progress Analytics", desc: "Detailed breakdown of your improvement" },
                ].map((feature, i) => (
                    <div key={i} className="glass-panel p-6 rounded-2xl flex flex-col items-center text-center space-y-3 hover:bg-white/10 transition-colors">
                        <div className="p-3 rounded-full bg-primary/10 text-primary mb-2">
                            <feature.icon size={24} />
                        </div>
                        <h3 className="font-bold text-lg">{feature.title}</h3>
                        <p className="text-sm text-muted-foreground">{feature.desc}</p>
                    </div>
                ))}
            </div>

            {/* Exercise Selection */}
            <section id="exercises" className="space-y-12 pt-12">
                <div className="flex items-end justify-between max-w-6xl mx-auto px-4">
                    <div>
                        <h2 className="text-4xl font-display font-bold">Select Exercise</h2>
                        <p className="text-muted-foreground mt-2">Choose a movement to begin analysis</p>
                    </div>
                    <button className="text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center">
                        View all <ArrowRight size={16} className="ml-1" />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto px-4">
                    {/* Pushup Card */}
                    <button
                        type="button"
                        className="group relative h-96 w-full text-left rounded-3xl overflow-hidden cursor-pointer border border-white/5 bg-zinc-900 shadow-2xl transition-all duration-500 hover:shadow-primary/20 hover:scale-[1.01] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                        onClick={() => startWorkout('Pushups')}
                        aria-label="Start Pushups Workout"
                    >
                        {/* Background Image / Gradient */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-zinc-800 via-zinc-950 to-black opacity-80 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:32px_32px]"></div>
                        
                        {/* Glow Effect */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] opacity-0 group-hover:opacity-40 transition-opacity duration-700"></div>

                        <div className="absolute inset-0 p-8 flex flex-col justify-end z-10">
                            <div className="space-y-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold mb-3 tracking-wider">UPPER BODY</div>
                                        <h3 className="text-4xl font-bold text-white mb-2 font-display">Pushups</h3>
                                        <p className="text-zinc-400 max-w-xs text-sm leading-relaxed">
                                            Master the fundamental pushing movement. accurate dept detection and elbow tuck analysis.
                                        </p>
                                    </div>
                                    <div className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300 shadow-lg shadow-white/20">
                                        <Play fill="currentColor" size={24} className="ml-1" />
                                    </div>
                                </div>
                                
                                <div className="pt-4 flex items-center gap-4 text-xs font-mono text-zinc-500 opacity-60 group-hover:opacity-100 transition-opacity delay-100">
                                    <span>DIFFICULTY: BEGINNER</span>
                                    <span>•</span>
                                    <span>TARGET: CHEST, TRICEPS</span>
                                </div>
                            </div>
                        </div>
                    </button>

                    {/* Squat Card */}
                    <button
                        type="button"
                        className="group relative h-96 w-full text-left rounded-3xl overflow-hidden cursor-pointer border border-white/5 bg-zinc-900 shadow-2xl transition-all duration-500 hover:shadow-blue-500/20 hover:scale-[1.01] focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                        onClick={() => startWorkout('Squats')}
                        aria-label="Start Squats Workout"
                    >
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-zinc-800 via-zinc-950 to-black opacity-80 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:32px_32px]"></div>
                        
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px] opacity-0 group-hover:opacity-40 transition-opacity duration-700"></div>

                        <div className="absolute inset-0 p-8 flex flex-col justify-end z-10">
                            <div className="space-y-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="inline-block px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold mb-3 tracking-wider">LOWER BODY</div>
                                        <h3 className="text-4xl font-bold text-white mb-2 font-display">Squats</h3>
                                        <p className="text-zinc-400 max-w-xs text-sm leading-relaxed">
                                            The king of leg exercises. Monitors hip depth, knee alignment, and back posture.
                                        </p>
                                    </div>
                                    <div className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300 shadow-lg shadow-white/20">
                                        <Play fill="currentColor" size={24} className="ml-1" />
                                    </div>
                                </div>
                                
                                <div className="pt-4 flex items-center gap-4 text-xs font-mono text-zinc-500 opacity-60 group-hover:opacity-100 transition-opacity delay-100">
                                    <span>DIFFICULTY: INTERMEDIATE</span>
                                    <span>•</span>
                                    <span>TARGET: QUADS, GLUBES</span>
                                </div>
                            </div>
                        </div>
                    </button>
                </div>
            </section>
        </div>
    );
};

export default HomeView;
