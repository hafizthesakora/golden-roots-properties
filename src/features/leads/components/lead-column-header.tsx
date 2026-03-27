'use client';

import { PlusIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LeadStatus } from '../types';
import { useCreateLeadModal } from '../hooks/use-create-lead-modal';
import { cn } from '@/lib/utils';

interface LeadColumnHeaderProps {
  status: LeadStatus;
  count: number;
}

export const columnConfig: Record<
  LeadStatus,
  { label: string; color: string; dotColor: string; headerBg: string; countBg: string }
> = {
  [LeadStatus.NEW]: {
    label: 'New',
    color: 'text-sky-700',
    dotColor: 'bg-sky-400',
    headerBg: 'bg-sky-50 border-sky-200',
    countBg: 'bg-sky-100 text-sky-700',
  },
  [LeadStatus.CONTACTED]: {
    label: 'Contacted',
    color: 'text-violet-700',
    dotColor: 'bg-violet-400',
    headerBg: 'bg-violet-50 border-violet-200',
    countBg: 'bg-violet-100 text-violet-700',
  },
  [LeadStatus.QUALIFIED]: {
    label: 'Qualified',
    color: 'text-amber-700',
    dotColor: 'bg-amber-400',
    headerBg: 'bg-amber-50 border-amber-200',
    countBg: 'bg-amber-100 text-amber-700',
  },
  [LeadStatus.PROPOSAL]: {
    label: 'Proposal',
    color: 'text-blue-700',
    dotColor: 'bg-blue-400',
    headerBg: 'bg-blue-50 border-blue-200',
    countBg: 'bg-blue-100 text-blue-700',
  },
  [LeadStatus.NEGOTIATION]: {
    label: 'Negotiation',
    color: 'text-orange-700',
    dotColor: 'bg-orange-400',
    headerBg: 'bg-orange-50 border-orange-200',
    countBg: 'bg-orange-100 text-orange-700',
  },
  [LeadStatus.CLOSED_WON]: {
    label: 'Closed Won',
    color: 'text-emerald-700',
    dotColor: 'bg-emerald-500',
    headerBg: 'bg-emerald-50 border-emerald-200',
    countBg: 'bg-emerald-100 text-emerald-700',
  },
  [LeadStatus.CLOSED_LOST]: {
    label: 'Closed Lost',
    color: 'text-slate-600',
    dotColor: 'bg-slate-400',
    headerBg: 'bg-slate-50 border-slate-200',
    countBg: 'bg-slate-200 text-slate-600',
  },
};

export const LeadColumnHeader = ({ status, count }: LeadColumnHeaderProps) => {
  const { open } = useCreateLeadModal();
  const cfg = columnConfig[status];

  return (
    <div className={cn('px-3 py-2.5 flex items-center justify-between rounded-t-xl border-b', cfg.headerBg)}>
      <div className="flex items-center gap-x-2">
        <span className={cn('size-2.5 rounded-full shrink-0', cfg.dotColor)} />
        <h3 className={cn('text-sm font-semibold', cfg.color)}>{cfg.label}</h3>
        <span
          className={cn(
            'text-[11px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center',
            cfg.countBg
          )}
        >
          {count}
        </span>
      </div>
      <Button
        onClick={open}
        variant="ghost"
        size="icon"
        className={cn('size-6 rounded-md', cfg.color, 'hover:bg-white/60')}
      >
        <PlusIcon className="size-3.5" />
      </Button>
    </div>
  );
};
