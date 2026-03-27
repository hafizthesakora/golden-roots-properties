'use client';

import { ResponsiveModal } from '@/components/responsive-modal';
import { useCreateLeadModal } from '../hooks/use-create-lead-modal';
import { CreateLeadForm } from './create-lead-form';

export const CreateLeadModal = () => {
  const { isOpen, setIsOpen, close } = useCreateLeadModal();
  return (
    <ResponsiveModal open={isOpen} onOpenChange={setIsOpen}>
      <CreateLeadForm onCancel={close} />
    </ResponsiveModal>
  );
};
