'use client';

import { ResponsiveModal } from '@/components/responsive-modal';
import { useEditContentModal } from '../hooks/use-edit-content-modal';
import { EditContentForm } from './edit-content-form';
import { useGetContentPosts } from '../api/use-get-content-posts';
import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id';
import { PageLoader } from '@/components/page-loader';
import { ContentPost } from '../types';

export const EditContentModal = () => {
  const { postId, close, setPostId } = useEditContentModal();
  const workspaceId = useWorkspaceId();

  const { data, isLoading } = useGetContentPosts({ workspaceId });

  const post = data?.documents.find((p: ContentPost) => p.$id === postId);

  return (
    <ResponsiveModal open={!!postId} onOpenChange={(open) => !open && setPostId(null)}>
      {isLoading ? (
        <PageLoader />
      ) : post ? (
        <EditContentForm initialValues={post} onCancel={close} />
      ) : null}
    </ResponsiveModal>
  );
};
