'use client';

import { PlusIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LeadStatus } from '../types';
import { useCreateLeadModal } from '../hooks/use-create-lead-modal';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface LeadColumnHeaderProps {
  status: LeadStatus;
  count: number;
}

export const columnConfig: Record<
  LeadStatus,
  { label: string; color: string; dotColor: string; headerBg: string; countBg: string; tooltip: string }
> = {
  [LeadStatus.NEW]: {
    label: 'New',
    color: 'text-sky-700',
    dotColor: 'bg-sky-400',
    headerBg: 'bg-sky-50 border-sky-200',
    countBg: 'bg-sky-100 text-sky-700',
    tooltip: 'Fresh leads with no contact made yet. Add them here as soon as they enquire.',
  },
  [LeadStatus.CONTACTED]: {
    label: 'Contacted',
    color: 'text-violet-700',
    dotColor: 'bg-violet-400',
    headerBg: 'bg-violet-50 border-violet-200',
    countBg: 'bg-violet-100 text-violet-700',
    tooltip: 'You have reached out to these leads. Follow up regularly to keep them warm.',
  },
  [LeadStatus.QUALIFIED]: {
    label: 'Qualified',
    color: 'text-amber-700',
    dotColor: 'bg-amber-400',
    headerBg: 'bg-amber-50 border-amber-200',
    countBg: 'bg-amber-100 text-amber-700',
    tooltip: 'Serious buyers or renters with a confirmed budget and genuine interest.',
  },
  [LeadStatus.PROPOSAL]: {
    label: 'Proposal',
    color: 'text-blue-700',
    dotColor: 'bg-blue-400',
    headerBg: 'bg-blue-50 border-blue-200',
    countBg: 'bg-blue-100 text-blue-700',
    tooltip: 'A property proposal or offer has been sent. Awaiting their feedback.',
  },
  [LeadStatus.NEGOTIATION]: {
    label: 'Negotiation',
    color: 'text-orange-700',
    dotColor: 'bg-orange-400',
    headerBg: 'bg-orange-50 border-orange-200',
    countBg: 'bg-orange-100 text-orange-700',
    tooltip: 'Actively discussing price and terms. Close attention needed here.',
  },
  [LeadStatus.CLOSED_WON]: {
    label: 'Closed Won',
    color: 'text-emerald-700',
    dotColor: 'bg-emerald-500',
    headerBg: 'bg-emerald-50 border-emerald-200',
    countBg: 'bg-emerald-100 text-emerald-700',
    tooltip: '🎉 Deal done! The lead has successfully converted into a client.',
  },
  [LeadStatus.CLOSED_LOST]: {
    label: 'Closed Lost',
    color: 'text-slate-600',
    dotColor: 'bg-slate-400',
    headerBg: 'bg-slate-50 border-slate-200',
    countBg: 'bg-slate-200 text-slate-600',
    tooltip: 'Lead did not proceed. Keep a record for potential future re-engagement.',
  },
};

export const LeadColumnHeader = ({ status, count }: LeadColumnHeaderProps) => {
  const { open } = useCreateLeadModal();
  const cfg = columnConfig[status];

  return (
    <TooltipProvider delayDuration={300}>
      <div className={cn('px-3 py-2.5 flex items-center justify-between rounded-t-xl border-b', cfg.headerBg)}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-x-2 cursor-default">
              <span className={cn('size-2.5 rounded-full shrink-0', cfg.dotColor)} />
              <h3 className={cn('text-sm font-semibold', cfg.color)}>{cfg.label}</h3>
              <span className={cn('text-[11px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center', cfg.countBg)}>
                {count}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-[200px] text-center text-xs">
            {cfg.tooltip}
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={open}
              variant="ghost"
              size="icon"
              className={cn('size-6 rounded-md', cfg.color, 'hover:bg-white/60')}
            >
              <PlusIcon className="size-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            Add lead to {cfg.label}
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};
