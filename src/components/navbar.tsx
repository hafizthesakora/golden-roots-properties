'use client';
import { usePathname } from 'next/navigation';

import { UserButton } from '@/features/auth/components/user-button';
import { MobileSidebar } from './mobile-sidebar';
import { motion, AnimatePresence } from 'framer-motion';

const pathnameMap: Record<string, { title: string; description: string }> = {
  tasks: { title: 'My Tasks', description: 'View all of your tasks here' },
  'all-tasks': { title: 'All Tasks', description: 'View every task across the workspace' },
  projects: { title: 'My Project', description: 'View tasks of your project here' },
  leads: { title: 'Leads Pipeline', description: 'Track and manage property leads' },
  content: { title: 'Content Calendar', description: 'Plan and schedule your content' },
  repository: { title: 'File Repository', description: 'Manage workspace documents' },
  members: { title: 'Members', description: 'Manage your workspace team' },
  settings: { title: 'Settings', description: 'Manage your workspace settings' },
};

const defaultMap = {
  title: 'Dashboard',
  description: 'Monitor all of your projects and tasks here',
};

export const Navbar = () => {
  const pathname = usePathname();
  const pathnameParts = pathname.split('/');
  const pathnameKey = pathnameParts[3] as keyof typeof pathnameMap;

  const { title, description } = pathnameMap[pathnameKey] || defaultMap;
  return (
    <nav className="pt-4 px-3 md:px-6 flex items-center justify-between gap-x-2">
      <div className="flex items-center gap-x-2 min-w-0">
        <MobileSidebar />
        <div className="flex flex-col min-w-0">
          <AnimatePresence mode="wait">
            <motion.h1
              key={title}
              className="text-lg md:text-2xl font-semibold truncate"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.2 }}
            >
              {title}
            </motion.h1>
          </AnimatePresence>
          <AnimatePresence mode="wait">
            <motion.p
              key={description}
              className="text-muted-foreground text-xs md:text-sm hidden sm:block"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, delay: 0.05 }}
            >
              {description}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
      <UserButton />
    </nav>
  );
};
