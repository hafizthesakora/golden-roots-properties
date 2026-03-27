import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/rpc';

interface UseGetContentPostsProps {
  workspaceId: string;
  projectId?: string | null;
  status?: string | null;
  month?: string | null;
}

export const useGetContentPosts = ({ workspaceId, projectId, status, month }: UseGetContentPostsProps) => {
  return useQuery({
    queryKey: ['content-posts', workspaceId, projectId, status, month],
    queryFn: async () => {
      const response = await client.api.content.$get({
        query: {
          workspaceId,
          projectId: projectId ?? undefined,
          status: status ?? undefined,
          month: month ?? undefined,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch content posts');
      const { data } = await response.json();
      return data;
    },
  });
};
