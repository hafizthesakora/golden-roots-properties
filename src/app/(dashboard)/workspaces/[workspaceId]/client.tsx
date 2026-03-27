'use client';

import { useGetWorkspaceAnalytics } from '@/features/workspaces/api/use-get-workspace-analytics';
import { useGetTasks } from '@/features/tasks/api/use-get-tasks';
import { useGetProjects } from '@/features/projects/api/use-get-projects';
import { useGetMembers } from '@/features/members/api/use-get-members';
import { useGetLeads } from '@/features/leads/api/use-get-leads';
import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id';
import { useCreateTaskModal } from '@/features/tasks/hooks/use-create-task-modal';
import { useCreateProjectModal } from '@/features/projects/hooks/use-create-project-modal';
import { PageLoader } from '@/components/page-loader';
import { PageError } from '@/components/page-error';
import { ProjectAvatar } from '@/features/projects/components/project-avatar';
import { MemberAvatar } from '@/features/members/components/members-avatar';
import { Task, TaskStatus } from '@/features/tasks/types';
import { Lead, LeadStatus } from '@/features/leads/types';
import { Project } from '@/features/projects/types';
import { Member } from '@/features/members/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusIcon, ArrowRightIcon, ClipboardListIcon, CheckCircle2Icon, AlertCircleIcon, UsersIcon, FolderIcon, UserRoundSearchIcon } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatDistanceToNow, isPast } from 'date-fns';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ActivityFeed } from '@/components/activity-feed';
import { useRealtimeUpdates } from '@/hooks/use-realtime-updates';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

const STATUS_COLORS: Record<string, string> = {
  BACKLOG: '#94a3b8',
  TODO: '#60a5fa',
  IN_PROGRESS: '#f59e0b',
  IN_REVIEW: '#8b5cf6',
  DONE: '#22c55e',
};

const STATUS_LABELS: Record<string, string> = {
  BACKLOG: 'Backlog', TODO: 'To Do', IN_PROGRESS: 'In Progress', IN_REVIEW: 'In Review', DONE: 'Done',
};

const LEAD_STATUS_COLORS: Record<string, string> = {
  NEW: '#60a5fa', CONTACTED: '#a78bfa', QUALIFIED: '#f59e0b',
  PROPOSAL: '#fb923c', NEGOTIATION: '#f43f5e', CLOSED_WON: '#22c55e', CLOSED_LOST: '#94a3b8',
};

function cardAnim(i: number) {
  return {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { type: 'spring' as const, bounce: 0.25, duration: 0.5, delay: i * 0.07 },
  };
}

function useCountUp(target: number, duration = 900) {
  const [count, setCount] = useState(0);
  const prevTarget = useRef(0);
  useEffect(() => {
    if (target === prevTarget.current) return;
    prevTarget.current = target;
    let startTime: number | null = null;
    const start = 0;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(start + (target - start) * eased));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return count;
}

export const WorkspaceIdClient = () => {
  const workspaceId = useWorkspaceId();
  useRealtimeUpdates(workspaceId);
  const { open: openCreateProject } = useCreateProjectModal();
  const { open: openCreateTask } = useCreateTaskModal();
  const { data: analytics, isLoading: la } = useGetWorkspaceAnalytics({ workspaceId });
  const { data: tasks, isLoading: lt } = useGetTasks({ workspaceId });
  const { data: projects, isLoading: lp } = useGetProjects({ workspaceId });
  const { data: members, isLoading: lm } = useGetMembers({ workspaceId });
  const { data: leads, isLoading: ll } = useGetLeads({ workspaceId });

  if (la || lt || lp || lm || ll) return <PageLoader />;
  if (!analytics || !tasks || !projects || !members || !leads) return <PageError message="Failed to load workspace data" />;

  const taskDocs = tasks.documents as Task[];
  const leadDocs = leads.documents as Lead[];

  const statusCounts = taskDocs.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(STATUS_LABELS)
    .map(([key, name]) => ({ name, value: statusCounts[key] ?? 0, fill: STATUS_COLORS[key] }))
    .filter((d) => d.value > 0);

  const leadCounts = leadDocs.reduce((acc, l) => { acc[l.status] = (acc[l.status] ?? 0) + 1; return acc; }, {} as Record<string, number>);
  const totalLeads = leadDocs.length;
  const wonLeads = leadCounts[LeadStatus.CLOSED_WON] ?? 0;
  const activeLeads = totalLeads - (leadCounts[LeadStatus.CLOSED_WON] ?? 0) - (leadCounts[LeadStatus.CLOSED_LOST] ?? 0);

  const recentTasks = [...taskDocs].sort((a, b) => new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime()).slice(0, 5);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const emoji = hour < 12 ? '🌅' : hour < 17 ? '☀️' : '🌙';

  return (
    <div className="flex flex-col gap-y-4 md:gap-y-6 pb-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <h1 className="text-xl md:text-2xl font-bold text-neutral-800">{greeting} {emoji}</h1>
        <p className="text-neutral-500 text-xs md:text-sm mt-0.5">Here&apos;s what&apos;s happening in your workspace today.</p>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-2 md:gap-4">
        <StatCard i={0} icon={<ClipboardListIcon className="size-5 text-blue-600" />} bg="bg-blue-50" iconBg="group-hover:bg-blue-100" label="Total Tasks" value={analytics.taskCount} sub={`${analytics.completedTaskCount} completed`} />
        <StatCard i={1} icon={<CheckCircle2Icon className="size-5 text-green-600" />} bg="bg-green-50" iconBg="group-hover:bg-green-100" label="Completed" value={analytics.completedTaskCount} sub={analytics.taskCount > 0 ? `${Math.round((analytics.completedTaskCount / analytics.taskCount) * 100)}% done` : '0% done'} />
        <StatCard i={2} icon={<AlertCircleIcon className="size-5 text-red-500" />} bg="bg-red-50" iconBg="group-hover:bg-red-100" label="Overdue" value={analytics.overdueTaskCount} sub="need attention" danger={analytics.overdueTaskCount > 0} />
        <StatCard i={3} icon={<UserRoundSearchIcon className="size-5 text-amber-600" />} bg="bg-amber-50" iconBg="group-hover:bg-amber-100" label="Active Leads" value={activeLeads} sub={`${wonLeads} closed won`} />
      </div>

      {/* Charts + Pipeline row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <motion.div {...cardAnim(0)}>
          <Card className="h-full hover:shadow-md transition-shadow duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Tasks by Status</CardTitle>
            </CardHeader>
            <CardContent>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value" animationBegin={100} animationDuration={800}>
                      {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip formatter={(v, n) => [v, n]} />
                    <Legend iconType="circle" iconSize={10} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[220px] flex flex-col items-center justify-center gap-3 text-neutral-400">
                  <ClipboardListIcon className="size-10 text-neutral-200" />
                  <p className="text-sm">No tasks yet</p>
                  <Button variant="outline" size="sm" onClick={openCreateTask} className="text-xs">Create your first task</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...cardAnim(1)}>
          <Card className="h-full hover:shadow-md transition-shadow duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center justify-between">
                Lead Pipeline
                <Link href={`/workspaces/${workspaceId}/leads`}>
                  <Button variant="ghost" size="sm" className="text-xs h-7">View All <ArrowRightIcon className="size-3 ml-1" /></Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-y-2.5">
                {Object.values(LeadStatus).map((status, idx) => {
                  const count = leadCounts[status] ?? 0;
                  const pct = totalLeads > 0 ? (count / totalLeads) * 100 : 0;
                  return (
                    <div key={status} className="flex items-center gap-x-3">
                      <span className="text-xs text-neutral-500 w-24 shrink-0">{status.replace('_', ' ')}</span>
                      <div className="flex-1 bg-neutral-100 rounded-full h-2 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: LEAD_STATUS_COLORS[status] }}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, delay: 0.1 + idx * 0.06, ease: 'easeOut' }}
                        />
                      </div>
                      <span className="text-xs font-medium text-neutral-700 w-6 text-right">{count}</span>
                    </div>
                  );
                })}
                {totalLeads === 0 && <p className="text-sm text-neutral-400 text-center py-4">No leads yet</p>}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Tasks + Quick Stats row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <motion.div {...cardAnim(2)} className="xl:col-span-2">
          <Card className="h-full hover:shadow-md transition-shadow duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center justify-between">
                Recent Tasks
                <Link href={`/workspaces/${workspaceId}/all-tasks`}>
                  <Button variant="ghost" size="sm" className="text-xs h-7">View All <ArrowRightIcon className="size-3 ml-1" /></Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-y-1">
              {recentTasks.length === 0 ? (
                <div className="text-sm text-neutral-400 text-center py-6">No tasks yet</div>
              ) : recentTasks.map((task, i) => (
                <RecentTaskRow key={task.$id} task={task} workspaceId={workspaceId} index={i} />
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <div className="flex flex-col gap-y-4">
          <motion.div {...cardAnim(3)}>
            <Card className="hover:shadow-md transition-shadow duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-x-2">
                  <FolderIcon className="size-4 text-neutral-500" /> Projects
                  <span className="ml-auto text-2xl font-bold text-green-700">{projects.total}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-y-1.5">
                {(projects.documents as Project[]).slice(0, 4).map((p) => (
                  <Link key={p.$id} href={`/workspaces/${workspaceId}/projects/${p.$id}`}>
                    <div className="flex items-center gap-x-2 py-1 rounded-md px-1 hover:bg-neutral-50 transition-colors duration-150 group">
                      <ProjectAvatar name={p.name} image={p.imageUrl} className="size-6" fallbackClassName="text-xs" />
                      <span className="text-sm truncate group-hover:text-green-700 transition-colors">{p.name}</span>
                    </div>
                  </Link>
                ))}
                <Button variant="ghost" size="sm" className="text-xs mt-1 w-full justify-start text-neutral-500 hover:text-green-700" onClick={openCreateProject}>
                  <PlusIcon className="size-3 mr-1" /> New project
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div {...cardAnim(4)}>
            <Card className="hover:shadow-md transition-shadow duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-x-2">
                  <UsersIcon className="size-4 text-neutral-500" /> Team
                  <span className="ml-auto text-2xl font-bold text-green-700">{members.total}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-y-1.5">
                {(members.documents as Member[]).slice(0, 4).map((m) => (
                  <div key={m.$id} className="flex items-center gap-x-2 py-1">
                    <MemberAvatar name={m.name ?? ''} className="size-6" />
                    <div className="min-w-0">
                      <p className="text-sm truncate">{m.name}</p>
                    </div>
                    <Badge variant="outline" className="ml-auto text-[10px] shrink-0">{m.role}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Activity Feed */}
      <motion.div {...cardAnim(5)}>
        <Card className="hover:shadow-md transition-shadow duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityFeed workspaceId={workspaceId} compact />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

// ── Sub-components ─────────────────────────────────────────────────────────────

function StatCard({ i, icon, bg, iconBg, label, value, sub, danger }: {
  i: number; icon: React.ReactNode; bg: string; iconBg: string; label: string; value: number; sub: string; danger?: boolean;
}) {
  const animatedValue = useCountUp(value);
  return (
    <motion.div {...cardAnim(i)}>
      <Card className="group hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
        <CardContent className="p-3 md:p-4 flex items-start gap-x-2 md:gap-x-3">
          <div className={cn('p-2 md:p-2.5 rounded-xl shrink-0 transition-colors duration-200', bg, iconBg)}>{icon}</div>
          <div className="min-w-0">
            <p className="text-[10px] md:text-xs text-neutral-500 font-medium">{label}</p>
            <p className={cn('text-xl md:text-2xl font-bold tabular-nums', danger ? 'text-red-600' : 'text-neutral-800')}>{animatedValue}</p>
            <p className="text-[10px] md:text-xs text-neutral-400 mt-0.5 hidden sm:block">{sub}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function RecentTaskRow({ task, workspaceId, index }: { task: Task; workspaceId: string; index: number }) {
  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== TaskStatus.DONE;
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: 0.3 + index * 0.06 }}
    >
      <Link href={`/workspaces/${workspaceId}/tasks/${task.$id}`}>
        <div className="flex items-center gap-x-2 md:gap-x-3 p-2 md:p-2.5 rounded-lg hover:bg-neutral-50 transition-colors duration-150 group cursor-pointer">
          <div className="size-2 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLORS[task.status] }} />
          <div className="flex-1 min-w-0">
            <p className="text-xs md:text-sm font-medium truncate group-hover:text-green-700 transition-colors">{task.name}</p>
            <p className="text-[10px] md:text-xs text-neutral-400">{task.project?.name ?? 'No project'}</p>
          </div>
          {task.dueDate && (
            <span className={cn('text-[10px] md:text-xs shrink-0 hidden sm:inline', isOverdue ? 'text-red-500 font-medium' : 'text-neutral-400')}>
              {isOverdue ? 'Overdue' : formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}
            </span>
          )}
          <div className="text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0" style={{ backgroundColor: STATUS_COLORS[task.status] + '20', color: STATUS_COLORS[task.status] }}>
            {STATUS_LABELS[task.status]}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
