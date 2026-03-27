'use client';

import { ResponsiveModal } from '@/components/responsive-modal';
import { useUploadFileModal } from '../hooks/use-upload-file-modal';
import { useGetCategories } from '../api/use-get-categories';
import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id';
import { UploadFileForm } from './upload-file-form';

export const UploadFileModal = () => {
  const { isOpen, setIsOpen, close } = useUploadFileModal();
  const workspaceId = useWorkspaceId();
  const { data: categories } = useGetCategories({ workspaceId });

  return (
    <ResponsiveModal open={isOpen} onOpenChange={setIsOpen}>
      <UploadFileForm onCancel={close} categories={categories ?? []} />
    </ResponsiveModal>
  );
};
