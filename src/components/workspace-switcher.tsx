'use client';
import { RiAddCircleFill } from 'react-icons/ri';

import { useGetWorkspaces } from '@/features/workspaces/api/use-get-workspaces';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { WorkspaceAvatar } from '@/features/workspaces/components/workspace-avatar';
import { useRouter } from 'next/navigation';
import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id';
import { useCreateWorkspaceModal } from '@/features/workspaces/hooks/use-create-workspace-modal';

export const WorkspaceSwitcher = () => {
  const workspaceId = useWorkspaceId();
  const router = useRouter();
  const { data: workspaces } = useGetWorkspaces();
  const { open } = useCreateWorkspaceModal();
  const onSelect = (id: string) => {
    router.push(`/workspaces/${id}`);
  };
  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase text-white/50 font-semibold tracking-wider">Workspaces</p>
        <RiAddCircleFill
          onClick={open}
          className="size-5 text-white/50 cursor-pointer hover:text-white transition"
        />
      </div>
      <Select onValueChange={onSelect} value={workspaceId}>
        <SelectTrigger className="w-full bg-white/10 border-white/20 text-white font-medium p-1 hover:bg-white/15">
          <SelectValue placeholder="No workspace selected" />
        </SelectTrigger>
        <SelectContent>
          {workspaces?.documents.map((workspace) => (
            <SelectItem key={workspace.$id} value={workspace.$id}>
              <div className="flex justify-start items-center gap-3 font-medium">
                <WorkspaceAvatar
                  name={workspace.name}
                  image={workspace.imageUrl}
                />
                <span className="truncate">{workspace.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
