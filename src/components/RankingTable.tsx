import { useMemo } from 'react';
import { 
  useReactTable, 
  getCoreRowModel, 
  getSortedRowModel, 
  flexRender, 
  createColumnHelper,
} from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown, Minus, ExternalLink, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

const columnHelper = createColumnHelper<any>();

export function RankingTable({ data, onViewIdea }: { data: any[], onViewIdea: (id: string) => void }) {
  const columns = useMemo(() => [
    columnHelper.accessor('rank', {
      header: 'Rank',
      cell: info => {
        const val = info.getValue();
        return (
          <div className="flex items-center gap-3">
             <span className="font-mono text-xs font-bold w-4 text-zinc-100 italic">#{val}</span>
             <Minus className="w-3 h-3 text-zinc-700" />
          </div>
        );
      }
    }),
    columnHelper.accessor('sno', {
      header: 'Sno',
      cell: info => <span className="font-mono text-[10px] text-zinc-500">{info.getValue() || '—'}</span>
    }),
    columnHelper.accessor('name', {
      header: 'Idea Name',
      cell: info => (
        <div className="flex flex-col">
          <span className="font-bold text-sm tracking-tight">{info.getValue()}</span>
          <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest leading-none mt-1">
            {info.row.original.category}
          </span>
        </div>
      )
    }),
    columnHelper.accessor('rankingScore', {
      header: 'Match Score',
      cell: info => {
        const val = info.getValue();
        if (typeof val !== 'number' || isNaN(val) || val === 0) return <span className="text-zinc-700">—</span>;
        return (
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-16 bg-zinc-900 rounded-full overflow-hidden">
               <div className="h-full bg-zinc-100" style={{ width: `${Math.min(val * 10, 100)}%` }} />
            </div>
            <span className="font-mono text-xs font-bold">{(val * 10).toFixed(1)}</span>
          </div>
        );
      }
    }),
    columnHelper.accessor('aiStatus', {
      header: 'System Sync',
      cell: info => {
        const status = info.getValue();
        if (status === 'processing' || status === 'pending') {
          return (
            <Badge variant="outline" className="bg-zinc-900 border-zinc-800 text-zinc-500 animate-pulse font-mono text-[9px] uppercase tracking-widest">
              <Loader2 className="w-2 h-2 mr-1 animate-spin" /> Analyzing
            </Badge>
          );
        }
        if (status === 'complete') {
          return (
            <Badge variant="outline" className="bg-white/5 border-white/10 text-zinc-300 font-mono text-[9px] uppercase tracking-widest">
              Synced
            </Badge>
          );
        }
        return status;
      }
    }),
    columnHelper.accessor('id', {
      header: '',
      cell: info => (
        <Button 
          variant="ghost" 
          size="icon" 
          className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            onViewIdea(info.getValue());
          }}
        >
          <ExternalLink className="w-3 h-3 text-zinc-400" />
        </Button>
      )
    })
  ], []);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="w-full overflow-hidden border border-white/5 rounded-3xl bg-white/[0.02]">
      <table className="w-full text-left border-collapse">
        <thead className="bg-zinc-950/50 border-b border-white/5">
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th key={header.id} className="px-6 py-4 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <motion.tr 
              key={row.id}
              layout
              className="group border-b border-white/5 hover:bg-white/[0.03] transition-colors cursor-pointer"
              onClick={() => onViewIdea(row.original.id)}
            >
              {row.getVisibleCells().map(cell => (
                <td key={cell.id} className="px-6 py-5 whitespace-nowrap">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </motion.tr>
          ))}
        </tbody>
      </table>
      {data.length === 0 && (
         <div className="py-20 text-center text-zinc-600 font-mono text-xs uppercase tracking-widest">
           No entries in this thread yet.
         </div>
      )}
    </div>
  );
}

