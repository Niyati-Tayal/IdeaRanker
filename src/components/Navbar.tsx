import { User, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Button } from '@/components/ui/button';
import { LayoutGrid, Plus, LogOut, Lightbulb } from 'lucide-react';
import { useAppStore } from '../lib/store';

export function Navbar({ user }: { user: User }) {
  const { setActiveThreadId } = useAppStore();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => setActiveThreadId(null)}
        >
          <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center transition-transform group-hover:scale-110">
            <Lightbulb className="w-5 h-5 text-zinc-950" />
          </div>
          <span className="font-sans font-bold text-lg tracking-tight">IdeaRanker</span>
        </div>

        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-zinc-400 hover:text-white"
            onClick={() => setActiveThreadId(null)}
          >
            <LayoutGrid className="w-4 h-4 mr-2" />
            Dashboard
          </Button>
          
          <div className="h-4 w-[1px] bg-white/10 mx-2" />
          
          <div className="flex items-center gap-3">
            <img 
              src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} 
              alt="Avatar" 
              className="w-8 h-8 rounded-full border border-white/10"
              referrerPolicy="no-referrer"
            />
            <Button 
              variant="outline" 
              size="icon" 
              className="w-8 h-8 border-white/5 hover:bg-white/5"
              onClick={() => signOut(auth)}
            >
              <LogOut className="w-4 h-4 text-zinc-400" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
