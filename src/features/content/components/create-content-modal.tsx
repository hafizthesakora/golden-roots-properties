'use client';

import { ResponsiveModal } from '@/components/responsive-modal';
import { useCreateContentModal } from '../hooks/use-create-content-modal';
import { CreateContentForm } from './create-content-form';

export const CreateContentModal = () => {
  const { isOpen, setIsOpen, close } = useCreateContentModal();

  return (
    <ResponsiveModal open={isOpen} onOpenChange={setIsOpen}>
      <CreateContentForm onCancel={close} />
    </ResponsiveModal>
  );
};
