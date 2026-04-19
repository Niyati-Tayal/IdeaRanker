import * as React from 'react';
import { useState } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { enrichIdea } from '../lib/gemini';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Rocket, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export function AddIdeaForm({ threadId, onSuccess }: { threadId: string, onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'SaaS',
    location: '',
    targetMarket: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !auth.currentUser) return;

    setLoading(true);
    try {
      // 1. Save initial record
      const ideaRef = await addDoc(collection(db, `threads/${threadId}/ideas`), {
        ...formData,
        userId: auth.currentUser.uid,
        threadId,
        aiStatus: 'processing',
        createdAt: serverTimestamp(),
      });

      // Update thread updatedAt and schema lock
      await updateDoc(doc(db, 'threads', threadId), {
        updatedAt: serverTimestamp(),
        schemaLocked: true
      });

      toast.success("Idea captured! enrichment started...", {
        icon: <Sparkles className="w-4 h-4 text-emerald-400" />
      });
      
      onSuccess();

      // 2. Trigger AI Enrichment asynchronously (client-side simulation of background job)
      const enrichment = await enrichIdea(formData);
      
      // 3. Update with AI output
      await updateDoc(ideaRef, {
        aiStatus: 'complete',
        aiOutput: enrichment,
        updatedAt: serverTimestamp()
      });

      toast.success("AI Analysis complete!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to process idea.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Essential Data</label>
          <Input 
            placeholder="Idea Name" 
            autoFocus
            className="bg-zinc-900 border-white/10 h-12 rounded-xl focus:ring-0 focus-visible:ring-zinc-500"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Textarea 
            placeholder="Core Description" 
            className="bg-zinc-900 border-white/10 rounded-xl min-h-[100px] resize-none"
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Category</label>
            <select 
              className="w-full bg-zinc-900 border border-white/10 rounded-xl h-12 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-600"
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value })}
            >
              <option>SaaS</option>
              <option>Hardware</option>
              <option>Service</option>
              <option>Marketplace</option>
              <option>D2C</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Geography</label>
            <Input 
              placeholder="e.g. USA, Global" 
              className="bg-zinc-900 border-white/10 h-12 rounded-xl"
              value={formData.location}
              onChange={e => setFormData({ ...formData, location: e.target.value })}
            />
          </div>
        </div>
      </div>

      <Button 
        type="submit" 
        disabled={loading}
        className="w-full h-14 bg-zinc-100 text-zinc-950 font-bold rounded-2xl group relative overflow-hidden"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <Rocket className="w-5 h-5 mr-2 group-hover:-translate-y-1 transition-transform" />
            Launch Idea Analysis
          </>
        )}
      </Button>

      <div className="flex items-start gap-3 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
        <Sparkles className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
        <p className="text-[11px] text-emerald-500/70 font-sans leading-snug">
          Gemini 3 Flash will perform a deep analysis of market potential, effort, and innovation upon submission.
        </p>
      </div>
    </form>
  );
}
