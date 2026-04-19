import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Button } from '@/components/ui/button';
import { motion } from 'motion/react';
import { Lightbulb, ArrowRight, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';

export function LandingPage() {
  const loginWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-zinc-100 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-zinc-800 rounded-full blur-[120px]" />
      </div>

      <main className="flex-1 flex flex-col items-center justify-center px-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center text-center max-w-4xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-400 text-xs font-mono uppercase tracking-widest mb-8">
            <Sparkles className="w-3 h-3 text-zinc-100" />
            AI-Powered Decision Intelligence
          </div>
          
          <h1 className="text-6xl md:text-9xl font-bold tracking-tighter leading-[0.8] mb-10 flex flex-col items-center">
            <span className="block italic font-serif font-light text-zinc-500 text-4xl mb-4 self-start md:ml-20">Prioritize</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-zinc-100 to-zinc-500">WHAT MATTERS.</span>
          </h1>
          
          <p className="text-zinc-500 text-lg md:text-2xl max-w-3xl mb-14 font-sans font-light leading-relaxed">
            IdeaRanker helps you capture, analyze, and rank your most ambitious projects 
            using deep AI insights and <span className="text-zinc-100 font-medium">custom weighted scoring. Stop guessing. Start building.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-5 mb-24">
            <Button 
              size="lg" 
              onClick={loginWithGoogle}
              className="bg-zinc-100 text-zinc-950 hover:bg-white px-10 h-16 text-lg font-bold rounded-2xl group transition-all shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]"
            >
              Get Started for Free
              <ArrowRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              size="lg" 
              className="h-16 px-10 bg-zinc-900 border border-white/10 hover:bg-zinc-800 text-zinc-100 text-lg font-medium rounded-2xl"
            >
              How it works
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
            {[
              { icon: ShieldCheck, title: "Structured Analysis", desc: "Automated business analysis pipeline." },
              { icon: TrendingUp, title: "Weighted Ranking", desc: "Dynamic scoring based on your values." },
              { icon: Lightbulb, title: "Idea Context", desc: "Organize everything into semantic threads." }
            ].map((feature, i) => (
              <div key={i} className="p-6 rounded-3xl bg-white/5 border border-white/10 text-left">
                <feature.icon className="w-6 h-6 mb-4 text-zinc-100" />
                <h3 className="font-bold mb-1 text-sm">{feature.title}</h3>
                <p className="text-zinc-500 text-xs leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </main>

      <footer className="py-8 px-4 border-t border-white/5 text-center text-zinc-600 text-xs font-mono tracking-widest uppercase">
        Built for the next 1% of founders • IdeaRanker © 2026
      </footer>
    </div>
  );
}
