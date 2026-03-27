import { useQuery } from '@tanstack/react-query';

export type ActivityItem = {
  $id: string; $createdAt: string; workspaceId: string;
  userId: string; userName: string; action: string;
  entityType: string; entityId: string; entityName: string; details?: string;
};

export const useGetActivity = ({ workspaceId }: { workspaceId: string }) =>
  useQuery({
    queryKey: ['activity', workspaceId],
    queryFn: async () => {
      const res = await fetch(`/api/workspaces/${workspaceId}/activity`);
      if (!res.ok) throw new Error('Failed to fetch activity');
      const { data } = await res.json();
      return data as ActivityItem[];
    },
  });
