import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, onSnapshot, deleteDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useAppStore } from '../lib/store';
import { enrichIdea } from '../lib/gemini';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  Sparkles, 
  MapPin, 
  Target, 
  Wallet, 
  Clock, 
  Lightbulb,
  ShieldAlert,
  Zap,
  CheckCircle2,
  Share2,
  Trash2,
  BarChart3,
  TrendingUp,
  AlertCircle,
  RotateCcw,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  ResponsiveContainer 
} from 'recharts';
import { motion } from 'motion/react';
import { Skeleton } from '@/components/ui/skeleton';

export function IdeaDetail({ ideaId, onBack }: { ideaId: string, onBack: () => void }) {
  const { activeThreadId } = useAppStore();
  const [idea, setIdea] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    if (!activeThreadId || !ideaId) return;

    const unsubscribe = onSnapshot(doc(db, `threads/${activeThreadId}/ideas`, ideaId), (snap) => {
      if (snap.exists()) {
        setIdea({ id: snap.id, ...snap.data() });
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [activeThreadId, ideaId]);

  const handleDelete = async () => {
    if (!activeThreadId || !ideaId) return;
    if (confirm("Are you sure you want to delete this idea?")) {
      try {
        await deleteDoc(doc(db, `threads/${activeThreadId}/ideas`, ideaId));
        toast.success("Idea deleted");
        onBack();
      } catch (err) {
        toast.error("Failed to delete idea");
      }
    }
  };

  const handleRetryAI = async () => {
    if (!activeThreadId || !ideaId || !idea) return;
    setRetrying(true);
    try {
      await updateDoc(doc(db, `threads/${activeThreadId}/ideas`, ideaId), {
        aiStatus: 'processing',
        updatedAt: serverTimestamp()
      });

      const enrichment = await enrichIdea({
        name: idea.name,
        description: idea.description,
        category: idea.category,
        location: idea.location,
        targetMarket: idea.targetMarket
      });

      await updateDoc(doc(db, `threads/${activeThreadId}/ideas`, ideaId), {
        aiStatus: 'complete',
        aiOutput: enrichment,
        updatedAt: serverTimestamp()
      });
      toast.success("Analysis complete");
    } catch (err) {
      toast.error("Failed to re-analyze");
      await updateDoc(doc(db, `threads/${activeThreadId}/ideas`, ideaId), {
        aiStatus: 'failed',
        updatedAt: serverTimestamp()
      });
    } finally {
      setRetrying(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <Skeleton className="h-8 w-32 bg-white/5 rounded-lg" />
        <Skeleton className="h-16 w-full bg-white/5 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="h-64 bg-white/5 rounded-3xl" />
          <Skeleton className="h-64 bg-white/5 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!idea) return <div>Idea not found.</div>;

  const radarData = idea.aiOutput ? [
    { subject: 'Feasibility', A: idea.aiOutput.scores.feasibility, full: 10 },
    { subject: 'Market', A: idea.aiOutput.scores.marketPotential, full: 10 },
    { subject: 'Innovation', A: idea.aiOutput.scores.innovation, full: 10 },
    { subject: 'Effort', A: 11 - idea.aiOutput.scores.effort, full: 10 }, // Higher is better (lower effort)
  ] : [];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-12 pb-20"
    >
      <header className="space-y-6">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="px-0 hover:bg-transparent text-zinc-500 hover:text-white"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Thread
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" className="w-9 h-9 border-white/10 rounded-xl hover:bg-white/5">
              <Share2 className="w-4 h-4 text-zinc-400" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleDelete}
              className="w-9 h-9 border-white/10 rounded-xl hover:bg-red-500/10 hover:border-red-500/20 group"
            >
              <Trash2 className="w-4 h-4 text-zinc-400 group-hover:text-red-500" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2 flex-1">
             <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-zinc-950 border-white/10 text-zinc-500 font-mono text-[10px] uppercase tracking-widest">{idea.category}</Badge>
                {idea.rank && <Badge className="bg-zinc-100 text-zinc-950 font-mono text-[10px] uppercase font-bold">Rank #{idea.rank}</Badge>}
             </div>
             <h2 className="text-4xl md:text-5xl font-bold tracking-tighter">{idea.name}</h2>
             <p className="text-zinc-500 max-w-2xl font-sans text-lg leading-relaxed">{idea.description}</p>
          </div>

          {idea.aiStatus === 'complete' && (
             <div className="bg-emerald-500/10 border border-emerald-500/20 px-6 py-4 rounded-3xl flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center">
                   <TrendingUp className="w-6 h-6 text-emerald-950" />
                </div>
                <div>
                   <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-emerald-500/60">Match Score</div>
                   <div className="text-3xl font-bold text-emerald-500 tracking-tighter">{(idea.rankingScore * 10).toFixed(1)}</div>
                </div>
             </div>
          )}
        </div>

        <div className="flex flex-wrap gap-6 pt-4 border-t border-white/5 font-mono text-[11px] uppercase tracking-[0.15em] text-zinc-600">
          <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> {idea.location || 'Global'}</div>
          <div className="flex items-center gap-2"><Target className="w-3.5 h-3.5" /> {idea.targetMarket || 'General'}</div>
          {idea.aiOutput?.budget_estimate && (
            <div className="flex items-center gap-2"><Wallet className="w-3.5 h-3.5" /> {idea.aiOutput.budget_estimate.min}-{idea.aiOutput.budget_estimate.max} {idea.aiOutput.budget_estimate.currency}</div>
          )}
          {idea.aiOutput?.time_required && (
            <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> {idea.aiOutput.time_required.value} {idea.aiOutput.time_required.unit}</div>
          )}
        </div>
      </header>

      {idea.aiStatus === 'failed' ? (
        <div className="bg-red-500/5 border border-red-500/10 rounded-[2.5rem] py-24 flex flex-col items-center text-center">
          <AlertCircle className="w-12 h-12 mb-6 text-red-500/50" />
          <div className="space-y-4">
            <h3 className="text-xl font-bold tracking-tight">Analysis Failed</h3>
            <p className="text-zinc-500 font-sans max-w-sm">The AI system encountered an error while analyzing this idea. This could be due to invalid input or temporary service issues.</p>
            <Button 
              onClick={handleRetryAI} 
              disabled={retrying}
              className="bg-white text-black hover:bg-zinc-200 h-12 px-8 rounded-xl font-bold"
            >
              {retrying ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RotateCcw className="w-4 h-4 mr-2" />}
              Retry AI Analysis
            </Button>
          </div>
        </div>
      ) : idea.aiStatus !== 'complete' ? (
         <div className="bg-white/[0.02] border border-dashed border-white/10 rounded-[2.5rem] py-32 flex flex-col items-center text-center">
            <Sparkles className="w-12 h-12 mb-6 text-zinc-700 animate-pulse" />
            <div className="space-y-2">
               <h3 className="text-xl font-bold tracking-tight">System Analyzing Context...</h3>
               <p className="text-zinc-600 font-sans max-w-sm">Generating deep market insights and feasibility analysis. This usually takes {"<"} 10 seconds.</p>
            </div>
         </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Analysis Core */}
          <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-8">
             <section className="space-y-6">
                <div className="h-72 w-full bg-zinc-950 border border-white/5 rounded-[2.5rem] p-8 flex flex-col justify-center items-center">
                   <div className="text-[11px] font-mono uppercase tracking-widest text-zinc-600 mb-6">Execution Fingerprint</div>
                   <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                         <PolarGrid strokeWidth={1} stroke="#1a1a1a" />
                         <PolarAngleAxis dataKey="subject" tick={{ fill: '#525252', fontSize: 10, fontFamily: 'monospace' }} />
                         <Radar
                            name="Idea"
                            dataKey="A"
                            stroke="#ffffff"
                            fill="#ffffff"
                            fillOpacity={0.1}
                         />
                      </RadarChart>
                   </ResponsiveContainer>
                </div>

                <div className="p-8 bg-zinc-100 rounded-[2.5rem] text-zinc-900 space-y-4">
                   <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      <span className="text-[10px] font-mono uppercase tracking-widest font-bold">Why it works</span>
                   </div>
                   <p className="text-lg leading-relaxed font-sans">{idea.aiOutput.why_good_for_you}</p>
                </div>
             </section>

             <section className="space-y-8">
                <div className="space-y-4">
                   <div className="text-[11px] font-mono uppercase tracking-widest text-zinc-600 px-4">Market Signal</div>
                   <div className="space-y-3">
                      {idea.aiOutput.opportunities.map((opp: string, i: number) => (
                        <div key={i} className="flex gap-4 p-5 bg-white/5 rounded-3xl border border-white/5">
                           <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                           <span className="text-sm font-medium leading-normal">{opp}</span>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="space-y-4">
                   <div className="text-[11px] font-mono uppercase tracking-widest text-zinc-600 px-4">Critical Risks</div>
                   <div className="space-y-3">
                      {idea.aiOutput.drawbacks.map((risk: string, i: number) => (
                        <div key={i} className="flex gap-4 p-5 bg-white/5 rounded-3xl border border-white/5">
                           <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0" />
                           <span className="text-sm font-medium leading-normal">{risk}</span>
                        </div>
                      ))}
                   </div>
                </div>
             </section>
          </div>

          <div className="lg:col-span-12 p-10 bg-white/[0.02] border border-white/5 rounded-[2.5rem] space-y-6">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-zinc-500" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Operational Logic</span>
              </div>
              <p className="text-xl text-zinc-400 font-sans leading-relaxed whitespace-pre-wrap">
                {idea.aiOutput.how_it_works}
              </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
