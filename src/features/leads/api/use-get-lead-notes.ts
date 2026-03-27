import { useQuery } from '@tanstack/react-query';

export type LeadNote = {
  $id: string; $createdAt: string; leadId: string; workspaceId: string;
  authorId: string; authorName: string; content: string; type: string; meta?: string;
};

export const useGetLeadNotes = ({ leadId }: { leadId: string }) =>
  useQuery({
    queryKey: ['lead-notes', leadId],
    queryFn: async () => {
      const res = await fetch(`/api/leads/${leadId}/notes`);
      if (!res.ok) throw new Error('Failed to fetch notes');
      const { data } = await res.json();
      return data as LeadNote[];
    },
  });
