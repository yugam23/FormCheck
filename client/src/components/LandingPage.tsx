import { ArrowRight, Activity, TrendingUp, Zap, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * Marketing landing page for the FormCheck application.
 *
 * Sections:
 * - Header/Navigation
 * - Hero with call-to-action
 * - Feature highlights grid
 * - Product benefits and technological overview
 *
 * @example
 * ```tsx
 * <LandingPage />
 * ```
 */
export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-base text-white font-sans selection:bg-primary/30">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-base/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary font-mono text-xl font-bold tracking-tighter">
            <Activity className="w-6 h-6" />
            FORMCHECK
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
            <a href="#" className="hover:text-primary transition-colors">Home</a>
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#contact" className="hover:text-primary transition-colors">Contact</a>
          </nav>
          <div className="flex items-center gap-6">
            <button className="text-sm font-medium hover:text-white text-gray-400 transition-colors">
              Login
            </button>
            <button 
                onClick={() => navigate('/app')}
                className="bg-primary hover:bg-primary-hover text-base font-bold px-6 py-2.5 rounded text-sm transition-all shadow-glow-primary"
            >
              Start Training
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Abstract Background */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-1/2 h-full bg-accent/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-primary text-xs font-mono mb-8">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              AI-POWERED FORM ANALYSIS
            </div>
            <h1 className="text-6xl md:text-8xl font-bold tracking-tight leading-[0.9] mb-8">
              FITNESS <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">HEROES</span>
            </h1>
            <p className="text-xl text-gray-400 mb-10 max-w-xl leading-relaxed">
              Train like a professional with real-time skeletal tracking and AI feedback.
              Perfect your form, prevent injury, and maximize your gains.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => navigate('/app')}
                className="group flex items-center justify-center gap-3 bg-primary hover:bg-primary-hover text-base font-bold px-8 py-4 rounded transition-all shadow-glow-primary"
              >
                Start Your Journey
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="flex items-center justify-center gap-3 px-8 py-4 rounded border border-white/10 hover:bg-white/5 transition-colors font-medium">
                View Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-surface/50 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Zap className="w-8 h-8 text-primary" />}
              title="Real-time Analysis"
              desc="Instant overlay feedback on your form using advanced skeletal tracking computer vision."
            />
            <FeatureCard 
              icon={<TrendingUp className="w-8 h-8 text-accent" />}
              title="Progress Tracking"
              desc="Monitor your rep counts, meaningful metrics, and consistency over time."
            />
             <FeatureCard 
              icon={<Activity className="w-8 h-8 text-alert" />}
              title="Injury Prevention"
              desc="Get alerted immediately when your form deviates from safe biomechanical standards."
            />
          </div>
        </div>
      </section>

      {/* Image Gallery / Mockup */}
      <section className="py-24 border-t border-white/5 bg-black/40">
           <div className="max-w-7xl mx-auto px-6">
               <div className="flex flex-col md:flex-row gap-12 items-center">
                   <div className="flex-1 space-y-8">
                       <h2 className="text-4xl font-bold leading-tight">
                           POWER YOURSELF <br />
                           <span className="text-gray-500">HIGHER</span>
                       </h2>
                       <p className="text-gray-400">
                           FormCheck uses state-of-the-art MediaPipe models to detect 33 skeletal landmarks at 30fps. 
                           It calculates joint angles in real-time to ensure your squats actuate below parallel and your pushups achieve full range of motion.
                       </p>
                       <ul className="space-y-4">
                           <ListItem text="Zero-latency WebSocket feedback loop" />
                           <ListItem text="Privacy-first: Processing happens locally" />
                           <ListItem text="No specialized hardware required" />
                       </ul>
                   </div>
                   <div className="flex-1 relative group">
                       <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-accent/20 blur-2xl opacity-50 group-hover:opacity-75 transition-opacity" />
                       <div className="relative aspect-video bg-surface border border-white/10 rounded-lg overflow-hidden shadow-2xl">
                           {/* Abstract Placeholder for App Screenshot */}
                           <div className="absolute inset-0 flex items-center justify-center bg-base">
                               <span className="font-mono text-gray-600">APP INTERFACE PREVIEW</span>
                           </div>
                       </div>
                   </div>
               </div>
           </div>
      </section>

       {/* Footer */}
       <footer className="py-12 border-t border-white/10 text-center text-gray-500 text-sm">
           <p>© 2026 FormCheck AI. Built for the elite.</p>
       </footer>

    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <div className="p-8 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/30 transition-colors group">
            <div className="mb-6 p-4 rounded-xl bg-base inline-block border border-white/5 group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <h3 className="text-xl font-bold mb-3">{title}</h3>
            <p className="text-gray-400 leading-relaxed">
                {desc}
            </p>
        </div>
    )
}

function ListItem({ text }: { text: string }) {
    return (
        <li className="flex items-center gap-3 text-gray-300">
            <CheckCircle className="w-5 h-5 text-primary" />
            {text}
        </li>
    )
}
