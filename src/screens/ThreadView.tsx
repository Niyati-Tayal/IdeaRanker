import { useState, useEffect, useMemo } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { useAppStore } from '../lib/store';
import { RankingTable } from '../components/RankingTable';
import { FilterPanel } from '../components/FilterPanel';
import { AddIdeaForm } from '../components/AddIdeaForm';
import { computeRankings } from '../lib/ranking';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  ChevronLeft, 
  Plus, 
  Settings2, 
  Share2, 
  TrendingUp, 
  BarChart3, 
  Layers,
  Search,
  SlidersHorizontal,
  Sheet as SheetIcon
} from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

export function ThreadView({ onViewIdea, onBack }: { onViewIdea: (id: string) => void, onBack: () => void }) {
  const { activeThreadId, weights, filters } = useAppStore();
  const [thread, setThread] = useState<any>(null);
  const [ideas, setIdeas] = useState<any[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    if (!activeThreadId) return;

    const threadUnsubscribe = onSnapshot(doc(db, 'threads', activeThreadId), (doc) => {
      setThread({ id: doc.id, ...doc.data() });
    });

    const ideasQuery = query(
      collection(db, `threads/${activeThreadId}/ideas`),
      orderBy('createdAt', 'desc')
    );

    const ideasUnsubscribe = onSnapshot(ideasQuery, (snapshot) => {
      setIdeas(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      threadUnsubscribe();
      ideasUnsubscribe();
    };
  }, [activeThreadId]);

  const rankedIdeas = useMemo(() => {
    // 1. Calculate weighted scores
    const computed = computeRankings(ideas, weights);
    
    // 2. Apply Filters
    return computed.filter(idea => {
      const matchCategory = filters.category === 'All' || idea.category === filters.category;
      const matchSearch = idea.name.toLowerCase().includes(filters.search.toLowerCase());
      return matchCategory && matchSearch;
    }).map((idea, index) => ({ ...idea, rank: index + 1 }));
  }, [ideas, weights, filters]);

  if (!thread) return null;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Main Content */}
      <div className="flex-1 space-y-8 min-w-0">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack}
              className="px-0 hover:bg-transparent text-zinc-500 hover:text-white"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to Dashboard
            </Button>
            <div className="flex flex-col gap-2">
               <h2 className="text-4xl font-bold tracking-tighter">{thread.name}</h2>
               <p className="text-zinc-500 font-sans max-w-xl">{thread.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <Sheet>
               <SheetTrigger asChild>
                 <Button variant="outline" className="lg:hidden border-white/10 rounded-xl">
                   <SlidersHorizontal className="w-4 h-4 mr-2" />
                   Controls
                 </Button>
               </SheetTrigger>
               <SheetContent side="right" className="bg-zinc-950 border-white/10 text-white pt-12">
                 <FilterPanel />
               </SheetContent>
             </Sheet>
             
             <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
               <DialogTrigger asChild>
                 <Button className="bg-zinc-100 text-zinc-950 hover:bg-white px-6 h-11 rounded-xl font-bold transition-all hover:scale-105 active:scale-95">
                   <Plus className="w-4 h-4 mr-2" />
                   Capture Idea
                 </Button>
               </DialogTrigger>
               <DialogContent className="bg-zinc-950 border-white/10 text-white sm:max-w-xl rounded-3xl overflow-hidden">
                 <DialogHeader>
                   <DialogTitle className="text-2xl font-bold tracking-tight">Capture New Idea</DialogTitle>
                 </DialogHeader>
                 <div className="py-2">
                   <AddIdeaForm 
                    threadId={activeThreadId!} 
                    onSuccess={() => setIsAddModalOpen(false)} 
                   />
                 </div>
               </DialogContent>
             </Dialog>
          </div>
        </header>

        {/* Stats strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Ideas', value: ideas.length, icon: Layers },
            { label: 'Avg Potential', value: '7.8', icon: TrendingUp },
            { label: 'Synced', value: ideas.filter(i => i.aiStatus === 'complete').length, icon: BarChart3 },
            { label: 'Global Rank', value: '#12', icon: Settings2 },
          ].map((stat, i) => (
            <div key={i} className="bg-white/5 border border-white/5 p-4 rounded-3xl group hover:border-white/10 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className="w-3.5 h-3.5 text-zinc-600" />
                <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-600">{stat.label}</span>
              </div>
              <div className="text-2xl font-bold tracking-tight font-sans group-hover:translate-x-1 transition-transform">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Main Ranking Table */}
        <div className="space-y-4">
           <div className="flex items-center justify-between px-2">
             <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600">Dynamic Priority Index</div>
             <div className="font-mono text-[9px] text-zinc-700 italic">Recomputes on weight change</div>
           </div>
           <RankingTable data={rankedIdeas} onViewIdea={onViewIdea} />
        </div>
      </div>

      {/* Persistent Sidebar (Desktop) */}
      <aside className="hidden lg:block w-80 shrink-0 pt-16">
        <div className="sticky top-32">
          <FilterPanel />
        </div>
      </aside>
    </div>
  );
}
