import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useDeleteTaskComment = ({ taskId }: { taskId: string }) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (commentId: string) => {
      const res = await fetch(`/api/tasks/${taskId}/comments/${commentId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete comment');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-comments', taskId] });
    },
    onError: () => toast.error('Failed to delete comment'),
  });
};
