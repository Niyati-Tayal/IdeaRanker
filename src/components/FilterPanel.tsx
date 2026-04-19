import { useAppStore } from '../lib/store';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { X, SlidersHorizontal, Settings2, RotateCcw } from 'lucide-react';

export function FilterPanel() {
  const { weights, setWeights, filters, setFilter, resetFilters } = useAppStore();

  const handleWeightChange = (key: keyof typeof weights, val: number[]) => {
    setWeights({ [key]: val[0] });
  };

  return (
    <div className="space-y-10">
      {/* Search */}
      <div className="space-y-3">
        <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest pl-1">Quick Search</label>
        <Input 
          placeholder="Filter ideas..." 
          className="bg-zinc-900 border-white/5 h-11 rounded-xl focus-visible:ring-zinc-500"
          value={filters.search}
          onChange={(e) => setFilter({ search: e.target.value })}
        />
      </div>

      {/* Weights */}
      <div className="space-y-6">
        <div className="flex items-center justify-between pl-1">
          <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Ranking Weights</label>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 px-2 text-[9px] uppercase tracking-widest text-zinc-600 hover:text-white"
            onClick={resetFilters}
          >
            <RotateCcw className="w-3 h-3 mr-1" /> Reset
          </Button>
        </div>
        
        <div className="space-y-8 bg-white/[0.02] border border-white/5 p-6 rounded-3xl">
          {[
            { id: 'feasibility', label: 'Feasibility' },
            { id: 'marketPotential', label: 'Market Potential' },
            { id: 'innovation', label: 'Innovation' },
            { id: 'effort', label: 'Effort (Inverse)' }
          ].map((item) => (
            <div key={item.id} className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-zinc-300">{item.label}</span>
                <span className="font-mono text-zinc-500">{(weights as any)[item.id]}%</span>
              </div>
              <Slider 
                value={[(weights as any)[item.id]]} 
                max={100} 
                step={1} 
                className="[&_[role=slider]]:bg-zinc-100 [&_.relative]:h-1"
                onValueChange={(val) => handleWeightChange(item.id as any, val as number[])}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Quick Filters */}
      <div className="space-y-4">
        <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest pl-1">Category Filter</label>
        <div className="flex flex-wrap gap-2">
          {['All', 'SaaS', 'Hardware', 'Service', 'Other'].map((cat) => (
            <Badge 
              key={cat}
              variant={filters.category === cat ? 'default' : 'outline'}
              className={`cursor-pointer h-8 px-4 rounded-full font-sans transition-all ${
                filters.category === cat ? 'bg-zinc-100 text-zinc-900' : 'border-white/10 text-zinc-500 hover:border-white/30'
              }`}
              onClick={() => setFilter({ category: cat })}
            >
              {cat}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
