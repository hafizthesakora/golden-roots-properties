'use client';

import { useGetProjects } from '@/features/projects/api/use-get-projects';
import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id';
import Link from 'next/link';
import { RiAddCircleFill } from 'react-icons/ri';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useCreateProjectModal } from '@/features/projects/hooks/use-create-project-modal';
import { ProjectAvatar } from '@/features/projects/components/project-avatar';

export const Projects = () => {
  const pathname = usePathname();
  const { open } = useCreateProjectModal();
  const workspaceId = useWorkspaceId();
  const { data } = useGetProjects({ workspaceId });
  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase text-white/50 font-semibold tracking-wider">Projects</p>
        <RiAddCircleFill
          onClick={open}
          className="size-5 text-white/50 cursor-pointer hover:text-white transition"
        />
      </div>
      {data?.documents.map((project) => {
        const href = `/workspaces/${workspaceId}/projects/${project.$id}`;
        const isActive = pathname === href;

        return (
          <Link href={href} key={project.$id}>
            <div
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all cursor-pointer text-white/60 hover:text-white hover:bg-white/10 text-sm font-medium',
                isActive && 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
              )}
            >
              <ProjectAvatar image={project.imageUrl} name={project.name} />
              <span className="truncate text-sm">{project.name}</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
};
