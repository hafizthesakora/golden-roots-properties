'use client';

import { formatDistanceToNow } from 'date-fns';
import { CheckCircle2Icon, PlusIcon, Trash2Icon, MessageSquareIcon, ArrowRightIcon, PencilIcon, ClipboardListIcon, UserRoundSearchIcon } from 'lucide-react';
import { useGetActivity } from '@/features/workspaces/api/use-get-activity';
import { Loader } from 'lucide-react';
import { cn } from '@/lib/utils';

const ACTION_CONFIG: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  created:        { icon: PlusIcon,           color: 'bg-green-100 text-green-700',   label: 'created' },
  updated:        { icon: PencilIcon,         color: 'bg-blue-100 text-blue-700',     label: 'updated' },
  deleted:        { icon: Trash2Icon,         color: 'bg-red-100 text-red-600',       label: 'deleted' },
  completed:      { icon: CheckCircle2Icon,   color: 'bg-emerald-100 text-emerald-700', label: 'completed' },
  status_changed: { icon: ArrowRightIcon,     color: 'bg-amber-100 text-amber-700',   label: 'changed status of' },
  commented:      { icon: MessageSquareIcon,  color: 'bg-purple-100 text-purple-700', label: 'commented on' },
  noted:          { icon: MessageSquareIcon,  color: 'bg-amber-100 text-amber-700',   label: 'added note to' },
};

const ENTITY_ICON: Record<string, React.ElementType> = {
  task: ClipboardListIcon,
  lead: UserRoundSearchIcon,
  project: ClipboardListIcon,
};

interface ActivityFeedProps {
  workspaceId: string;
  compact?: boolean;
}

export const ActivityFeed = ({ workspaceId, compact = false }: ActivityFeedProps) => {
  const { data: items, isLoading } = useGetActivity({ workspaceId });

  if (isLoading) {
    return <div className="flex justify-center py-6"><Loader className="size-4 animate-spin text-muted-foreground" /></div>;
  }

  if (!items || items.length === 0) {
    return <p className="text-sm text-neutral-400 text-center py-4">No activity yet.</p>;
  }

  const displayed = compact ? items.slice(0, 8) : items;

  return (
    <div className="flex flex-col gap-y-0">
      {displayed.map((item) => {
        const config = ACTION_CONFIG[item.action] ?? ACTION_CONFIG.updated;
        const Icon = config.icon;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const EntityIcon = ENTITY_ICON[item.entityType] ?? ClipboardListIcon;
        return (
          <div key={item.$id} className="flex gap-x-3 py-2.5 border-b border-neutral-50 last:border-0">
            <div className={cn('size-7 rounded-full flex items-center justify-center shrink-0', config.color)}>
              <Icon className="size-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-x-1 flex-wrap">
                <span className="text-xs font-semibold text-neutral-800">{item.userName}</span>
                <span className="text-xs text-neutral-500">{config.label}</span>
                <span className="text-xs font-medium text-neutral-700 truncate max-w-[160px]">{item.entityName}</span>
                <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full capitalize',
                  item.entityType === 'task' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-700'
                )}>{item.entityType}</span>
              </div>
              <span className="text-[10px] text-neutral-400 mt-0.5 block">
                {formatDistanceToNow(new Date(item.$createdAt), { addSuffix: true })}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
