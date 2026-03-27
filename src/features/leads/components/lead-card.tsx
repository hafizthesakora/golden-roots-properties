'use client';

import {
  PhoneIcon,
  MailIcon,
  HomeIcon,
  BanknoteIcon,
  MoreHorizontalIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Lead, LeadSource } from '../types';
import { useEditLeadModal } from '../hooks/use-edit-lead-modal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDeleteLead } from '../api/use-delete-lead';
import { useConfirm } from '@/hooks/use-confirm';

const sourceLabels: Record<LeadSource, string> = {
  [LeadSource.SOCIAL_MEDIA]: 'Social',
  [LeadSource.REFERRAL]: 'Referral',
  [LeadSource.WEBSITE]: 'Website',
  [LeadSource.WALK_IN]: 'Walk-in',
  [LeadSource.COLD_CALL]: 'Cold Call',
  [LeadSource.EVENT]: 'Event',
  [LeadSource.OTHER]: 'Other',
};

const sourceBadge: Record<LeadSource, string> = {
  [LeadSource.SOCIAL_MEDIA]: 'bg-pink-50 text-pink-600 border-pink-200',
  [LeadSource.REFERRAL]: 'bg-amber-50 text-amber-700 border-amber-200',
  [LeadSource.WEBSITE]: 'bg-blue-50 text-blue-600 border-blue-200',
  [LeadSource.WALK_IN]: 'bg-amber-50 text-amber-700 border-amber-200',
  [LeadSource.COLD_CALL]: 'bg-purple-50 text-purple-600 border-purple-200',
  [LeadSource.EVENT]: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  [LeadSource.OTHER]: 'bg-slate-50 text-slate-600 border-slate-200',
};

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function getAvatarColor(name: string) {
  const colors = [
    'from-amber-500 to-orange-600',
    'from-blue-500 to-indigo-600',
    'from-violet-500 to-purple-600',
    'from-amber-500 to-orange-600',
    'from-rose-500 to-pink-600',
    'from-teal-500 to-cyan-600',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

interface LeadCardProps {
  lead: Lead;
}

export const LeadCard = ({ lead }: LeadCardProps) => {
  const { open } = useEditLeadModal();
  const { mutate: deleteLead, isPending } = useDeleteLead();
  const [ConfirmDialog, confirm] = useConfirm(
    'Remove lead?',
    `"${lead.name}" will be permanently deleted.`,
    'destructive'
  );

  const handleDelete = async () => {
    const ok = await confirm();
    if (ok) deleteLead({ param: { leadId: lead.$id } });
  };

  const gradient = getAvatarColor(lead.name);

  return (
    <>
      <ConfirmDialog />
      <div
        className="bg-white rounded-xl border border-neutral-200/80 shadow-sm hover:shadow-md hover:border-amber-200 transition-all duration-200 group cursor-pointer"
        onClick={() => open(lead.$id)}
      >
        {/* Card top bar */}
        <div className="p-4 pb-3">
          <div className="flex items-start justify-between gap-x-2">
            {/* Avatar + name */}
            <div className="flex items-center gap-x-3 min-w-0">
              <div
                className={cn(
                  'size-10 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0 shadow-sm',
                  gradient
                )}
              >
                <span className="text-white text-sm font-bold">{getInitials(lead.name)}</span>
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm text-neutral-900 truncate leading-tight">
                  {lead.name}
                </p>
                <span
                  className={cn(
                    'inline-flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded-full border mt-0.5',
                    sourceBadge[lead.source]
                  )}
                >
                  {sourceLabels[lead.source]}
                </span>
              </div>
            </div>
            {/* Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <button className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                  <MoreHorizontalIcon className="size-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                <DropdownMenuItem onClick={() => open(lead.$id)}>Edit lead</DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDelete}
                  disabled={isPending}
                  className="text-red-600 focus:text-red-600 focus:bg-red-50"
                >
                  Delete lead
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-4 border-t border-neutral-100" />

        {/* Details */}
        <div className="px-4 py-3 space-y-2">
          {lead.propertyInterest && (
            <div className="flex items-center gap-x-2 text-xs text-neutral-600">
              <HomeIcon className="size-3.5 shrink-0 text-amber-600" />
              <span className="truncate">{lead.propertyInterest}</span>
            </div>
          )}
          {lead.budget && (
            <div className="flex items-center gap-x-2 text-xs text-neutral-600">
              <BanknoteIcon className="size-3.5 shrink-0 text-amber-600" />
              <span className="truncate font-medium">{lead.budget}</span>
            </div>
          )}
          {lead.phone && (
            <div className="flex items-center gap-x-2 text-xs text-neutral-500">
              <PhoneIcon className="size-3 shrink-0" />
              <span>{lead.phone}</span>
            </div>
          )}
          {lead.email && (
            <div className="flex items-center gap-x-2 text-xs text-neutral-500">
              <MailIcon className="size-3 shrink-0" />
              <span className="truncate">{lead.email}</span>
            </div>
          )}
        </div>

        {/* Notes pill */}
        {lead.notes && (
          <div className="px-4 pb-3">
            <p className="text-[11px] text-neutral-500 bg-neutral-50 rounded-lg px-2.5 py-1.5 line-clamp-2 border border-neutral-100">
              {lead.notes}
            </p>
          </div>
        )}
      </div>
    </>
  );
};
