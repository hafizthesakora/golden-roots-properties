'use client';

import { Loader, PlusIcon, TrendingUpIcon, UsersIcon, CheckCircleIcon, XCircleIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id';
import { useGetLeads } from '../api/use-get-leads';
import { useCreateLeadModal } from '../hooks/use-create-lead-modal';
import { LeadsKanban } from './leads-kanban';
import { Lead, LeadStatus } from '../types';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}

const StatCard = ({ label, value, icon: Icon, iconBg, iconColor }: StatCardProps) => (
  <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-4 flex items-center gap-x-4">
    <div className={cn('size-11 rounded-xl flex items-center justify-center shrink-0', iconBg)}>
      <Icon className={cn('size-5', iconColor)} />
    </div>
    <div>
      <p className="text-2xl font-bold text-neutral-900 leading-none">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  </div>
);

export const LeadsView = () => {
  const workspaceId = useWorkspaceId();
  const { open } = useCreateLeadModal();
  const { data, isLoading } = useGetLeads({ workspaceId });

  const leads = (data?.documents ?? []) as Lead[];
  const total = leads.length;
  const active = leads.filter(
    (l) => ![LeadStatus.CLOSED_WON, LeadStatus.CLOSED_LOST].includes(l.status)
  ).length;
  const closedWon = leads.filter((l) => l.status === LeadStatus.CLOSED_WON).length;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const closedLost = leads.filter((l) => l.status === LeadStatus.CLOSED_LOST).length;
  const conversionRate = total > 0 ? Math.round((closedWon / total) * 100) : 0;

  return (
    <div className="flex flex-col gap-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-neutral-900">Leads Pipeline</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Track and manage your property leads from first contact to close
          </p>
        </div>
        <Button
          onClick={open}
          className="bg-amber-600 hover:bg-amber-700 text-white shadow-sm w-full sm:w-auto shrink-0"
        >
          <PlusIcon className="size-4 mr-2" />
          Add Lead
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total Leads" value={total} icon={UsersIcon} iconBg="bg-amber-50" iconColor="text-amber-700" />
        <StatCard label="Active Leads" value={active} icon={TrendingUpIcon} iconBg="bg-blue-50" iconColor="text-blue-600" />
        <StatCard label="Closed Won" value={closedWon} icon={CheckCircleIcon} iconBg="bg-emerald-50" iconColor="text-emerald-600" />
        <StatCard label="Conversion Rate" value={`${conversionRate}%`} icon={XCircleIcon} iconBg="bg-amber-50" iconColor="text-amber-600" />
      </div>

      {/* Kanban */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader className="size-6 animate-spin text-amber-600" />
        </div>
      ) : (
        <LeadsKanban data={leads} />
      )}
    </div>
  );
};
