import { useQuery } from '@tanstack/react-query';
import type { FileCategory } from '../types';

export const useGetCategories = ({ workspaceId }: { workspaceId: string }) => {
  return useQuery({
    queryKey: ['categories', workspaceId],
    queryFn: async () => {
      const res = await fetch(`/api/repository/categories?workspaceId=${workspaceId}`);
      if (!res.ok) throw new Error('Failed to fetch categories');
      const { data } = await res.json();
      return data as FileCategory[];
    },
    staleTime: 1000 * 60 * 5,
  });
};
