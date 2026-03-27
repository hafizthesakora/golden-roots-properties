import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/rpc';

interface UseGetFilesProps {
  workspaceId: string;
  projectId?: string | null;
  category?: string | null;
  search?: string | null;
}

export const useGetFiles = ({ workspaceId, projectId, category, search }: UseGetFilesProps) => {
  return useQuery({
    queryKey: ['repository-files', workspaceId, projectId, category, search],
    queryFn: async () => {
      const response = await client.api.repository.$get({
        query: {
          workspaceId,
          projectId: projectId ?? undefined,
          category: category ?? undefined,
          search: search ?? undefined,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch files');
      const { data } = await response.json();
      return data;
    },
  });
};
