import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './lib/firebase';
import { Navbar } from './components/Navbar';
import { LandingPage } from './screens/LandingPage';
import { Dashboard } from './screens/Dashboard';
import { ThreadView } from './screens/ThreadView';
import { IdeaDetail } from './screens/IdeaDetail';
import { useAppStore } from './lib/store';
import { Toaster } from 'sonner';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { activeThreadId } = useAppStore();
  const [activeIdeaId, setActiveIdeaId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (activeThreadId === null) {
      setActiveIdeaId(null);
    }
  }, [activeThreadId]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-zinc-950 text-white font-mono">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-zinc-700 border-t-white rounded-full animate-spin" />
          <p className="text-xs uppercase tracking-widest opacity-50">Initializing Core...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-zinc-100 font-sans selection:bg-zinc-100 selection:text-zinc-900">
      <Navbar user={user} />
      
      <main className="pt-20 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
        {activeIdeaId ? (
          <IdeaDetail ideaId={activeIdeaId} onBack={() => setActiveIdeaId(null)} />
        ) : activeThreadId ? (
          <ThreadView 
            onViewIdea={(id) => setActiveIdeaId(id)} 
            onBack={() => useAppStore.getState().setActiveThreadId(null)} 
          />
        ) : (
          <Dashboard />
        )}
      </main>
      
      <Toaster position="bottom-right" theme="dark" richColors />
    </div>
  );
}
