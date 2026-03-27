'use client';

import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import {
  FolderOpenIcon, SettingsIcon, UsersIcon, UserRoundSearchIcon,
  LayoutListIcon, CalendarDaysIcon,
} from 'lucide-react';
import Link from 'next/link';
import {
  GoCheckCircle, GoCheckCircleFill, GoHome, GoHomeFill,
} from 'react-icons/go';
import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id';
import { motion } from 'framer-motion';

const routes = [
  { label: 'Dashboard', href: '', icon: GoHome, activeIcon: GoHomeFill },
  { label: 'My Tasks', href: '/tasks', icon: GoCheckCircle, activeIcon: GoCheckCircleFill },
  { label: 'All Tasks', href: '/all-tasks', icon: LayoutListIcon, activeIcon: LayoutListIcon },
  { label: 'Leads', href: '/leads', icon: UserRoundSearchIcon, activeIcon: UserRoundSearchIcon },
  { label: 'Content', href: '/content', icon: CalendarDaysIcon, activeIcon: CalendarDaysIcon },
  { label: 'Repository', href: '/repository', icon: FolderOpenIcon, activeIcon: FolderOpenIcon },
  { label: 'Members', href: '/members', icon: UsersIcon, activeIcon: UsersIcon },
  { label: 'Settings', href: '/settings', icon: SettingsIcon, activeIcon: SettingsIcon },
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -12 },
  show: { opacity: 1, x: 0, transition: { type: 'spring' as const, bounce: 0.2, duration: 0.4 } },
};

export const Navigation = () => {
  const workspaceId = useWorkspaceId();
  const pathname = usePathname();

  return (
    <motion.ul
      className="flex flex-col gap-y-0.5"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {routes.map((item) => {
        const fullHref = `/workspaces/${workspaceId}${item.href}`;
        const isActive = pathname === fullHref;
        const Icon = isActive ? item.activeIcon : item.icon;
        return (
          <motion.li key={item.href} variants={itemVariants}>
            <Link href={fullHref}>
              <div className={cn('relative flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-colors duration-150 text-white/60 hover:text-white hover:bg-white/10', isActive && 'text-amber-300 hover:bg-transparent hover:text-amber-300')}>
                {isActive && (
                  <motion.div
                    layoutId="nav-active-bg"
                    className="absolute inset-0 bg-amber-400/20 border border-amber-400/30 rounded-lg"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <Icon className={cn('size-4.5 shrink-0 relative z-10 transition-colors', isActive ? 'text-amber-400' : 'text-white/40')} />
                <span className="text-sm relative z-10">{item.label}</span>
              </div>
            </Link>
          </motion.li>
        );
      })}
    </motion.ul>
  );
};
