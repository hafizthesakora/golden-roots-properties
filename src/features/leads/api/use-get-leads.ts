import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/rpc';

export const useGetLeads = ({ workspaceId }: { workspaceId: string }) => {
  return useQuery({
    queryKey: ['leads', workspaceId],
    queryFn: async () => {
      const response = await client.api.leads.$get({ query: { workspaceId } });
      if (!response.ok) throw new Error('Failed to fetch leads');
      const { data } = await response.json();
      return data;
    },
  });
};
