import { useQuery } from '@tanstack/react-query';

export const useGetTaskComments = ({ taskId }: { taskId: string }) =>
  useQuery({
    queryKey: ['task-comments', taskId],
    queryFn: async () => {
      const res = await fetch(`/api/tasks/${taskId}/comments`);
      if (!res.ok) throw new Error('Failed to fetch comments');
      const { data } = await res.json();
      return data as {
        $id: string; $createdAt: string; taskId: string; workspaceId: string;
        authorId: string; authorName: string; content: string;
      }[];
    },
  });
