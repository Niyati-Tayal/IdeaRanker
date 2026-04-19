import { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { useAppStore } from '../lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, LayoutGrid, ListFilter, Search, ArrowRight, MessageSquare, Lock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'motion/react';

export function Dashboard() {
  const [threads, setThreads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { setActiveThreadId } = useAppStore();

  const [newThread, setNewThread] = useState({ name: '', description: '' });

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'threads'),
      where('userId', '==', auth.currentUser.uid),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setThreads(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleCreateThread = async () => {
    if (!newThread.name || !auth.currentUser) return;

    await addDoc(collection(db, 'threads'), {
      ...newThread,
      userId: auth.currentUser.uid,
      status: 'active',
      schemaLocked: false,
      fieldsConfig: {
        market: true,
        location: true,
        budget: true,
        timeline: true
      },
      weights: {
        feasibility: 25,
        marketPotential: 25,
        innovation: 25,
        effort: 25
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    setNewThread({ name: '', description: '' });
    setIsModalOpen(false);
  };

  const filteredThreads = threads.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">My Threads</h2>
          <p className="text-zinc-500 max-w-lg">
            Manage your idea collections. Each thread holds a unique context and ranking configuration.
          </p>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-zinc-100 text-zinc-950 hover:bg-white h-11 px-6 rounded-xl font-bold">
              <Plus className="w-4 h-4 mr-2" />
              New Thread
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-950 border-white/10 text-white sm:max-w-md rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Create New Thread</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-widest text-zinc-500">Thread Name</label>
                <Input 
                  placeholder="e.g., Q3 Product Ideas" 
                  className="bg-zinc-900 border-white/10 h-12 rounded-xl focus-visible:ring-zinc-100"
                  value={newThread.name}
                  onChange={e => setNewThread({ ...newThread, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-widest text-zinc-500">Context / Description</label>
                <Textarea 
                  placeholder="What is this collection about?" 
                  className="bg-zinc-900 border-white/10 min-h-[100px] rounded-xl focus-visible:ring-zinc-100 resize-none"
                  value={newThread.description}
                  onChange={e => setNewThread({ ...newThread, description: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                onClick={handleCreateThread}
                className="w-full bg-zinc-100 text-zinc-950 h-12 rounded-xl font-bold"
              >
                Create Collection
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter/Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <Input 
          placeholder="Search threads..." 
          className="bg-white/5 border-white/5 pl-10 h-12 rounded-2xl focus-visible:ring-zinc-500 transition-all"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="h-48 rounded-3xl bg-white/5 animate-pulse border border-white/5" />)}
        </div>
      ) : filteredThreads.length === 0 ? (
        <div className="py-32 flex flex-col items-center text-center opacity-40">
          <LayoutGrid className="w-12 h-12 mb-4 stroke-1" />
          <p className="font-mono text-sm uppercase tracking-widest">No threads found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredThreads.map((thread) => (
              <motion.div
                key={thread.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Card 
                  className="group relative h-full bg-white/5 border-white/5 hover:bg-white/[0.08] hover:border-white/20 transition-all cursor-pointer rounded-3xl overflow-hidden p-6 flex flex-col justify-between"
                  onClick={() => setActiveThreadId(thread.id)}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center group-hover:bg-zinc-100 group-hover:border-zinc-100 transition-colors">
                        <MessageSquare className="w-5 h-5 text-zinc-500 group-hover:text-zinc-950 transition-colors" />
                      </div>
                      {thread.schemaLocked && (
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-zinc-900 border border-white/10 text-[10px] font-mono text-zinc-500 uppercase">
                          <Lock className="w-3 h-3" /> Locked
                        </div>
                      )}
                    </div>
                    
                    <CardHeader className="p-0 mb-4">
                      <CardTitle className="text-xl font-bold tracking-tight group-hover:translate-x-1 transition-transform inline-flex items-center">
                        {thread.name}
                        <ArrowRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </CardTitle>
                      <CardDescription className="text-zinc-500 line-clamp-2 mt-1 font-sans">
                        {thread.description || "No description provided."}
                      </CardDescription>
                    </CardHeader>
                  </div>

                  <div className="pt-6 mt-6 border-t border-white/5 flex items-center justify-between">
                    <div className="flex -space-x-2">
                       {/* Placeholder for future collaboration features */}
                       <div className="w-6 h-6 rounded-full bg-zinc-800 border-2 border-[#0A0A0A]" />
                       <div className="w-6 h-6 rounded-full bg-zinc-900 border-2 border-[#0A0A0A]" />
                    </div>
                    <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-wider">
                      Updated {new Date(thread.updatedAt?.toDate()).toLocaleDateString()}
                    </span>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
