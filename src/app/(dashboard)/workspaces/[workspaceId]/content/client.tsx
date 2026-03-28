'use client';

import { Loader } from 'lucide-react';
import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id';
import { useGetContentPosts } from '@/features/content/api/use-get-content-posts';
import { ContentCalendar } from '@/features/content/components/content-calendar';
import { ContentPost } from '@/features/content/types';
import { CreateContentModal } from '@/features/content/components/create-content-modal';
import { EditContentModal } from '@/features/content/components/edit-content-modal';

export const ContentPageClient = () => {
  const workspaceId = useWorkspaceId();
  const { data, isLoading } = useGetContentPosts({ workspaceId });

  return (
    <>
      <CreateContentModal />
      <EditContentModal />
      <div className="h-full flex flex-col">
{isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <ContentCalendar data={(data?.documents ?? []) as ContentPost[]} />
        )}
      </div>
    </>
  );
};
