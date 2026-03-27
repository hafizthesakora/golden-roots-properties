'use client';

import { ResponsiveModal } from '@/components/responsive-modal';
import { useEditLeadModal } from '../hooks/use-edit-lead-modal';
import { EditLeadForm } from './edit-lead-form';
import { useGetLeads } from '../api/use-get-leads';
import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id';
import { PageLoader } from '@/components/page-loader';
import { Lead } from '../types';

export const EditLeadModal = () => {
  const { leadId, close, setLeadId } = useEditLeadModal();
  const workspaceId = useWorkspaceId();
  const { data, isLoading } = useGetLeads({ workspaceId });

  const lead = data?.documents.find((l: Lead) => l.$id === leadId);

  return (
    <ResponsiveModal open={!!leadId} onOpenChange={(open) => !open && setLeadId(null)}>
      {isLoading ? (
        <PageLoader />
      ) : lead ? (
        <EditLeadForm initialValues={lead} onCancel={close} />
      ) : null}
    </ResponsiveModal>
  );
};
