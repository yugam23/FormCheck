
import { Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HomeView = () => {
    const navigate = useNavigate();

    const startWorkout = (exercise: string) => {
        // Navigate to workout view with state
        navigate('/workout', { state: { exercise } });
    };

    return (
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
                    {/* Abstract placeholder bg */}
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
    );
};

export default HomeView;
