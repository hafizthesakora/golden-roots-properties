import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface CategoryInput {
  workspaceId: string;
  label: string;
  icon: string;
  color: string;
  textColor: string;
}

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: CategoryInput) => {
      const res = await fetch('/api/repository/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Failed to create category');
      return res.json();
    },
    onSuccess: (_, vars) => {
      toast.success('Category created');
      queryClient.invalidateQueries({ queryKey: ['categories', vars.workspaceId] });
    },
    onError: () => toast.error('Failed to create category'),
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ categoryId, workspaceId, ...body }: Partial<CategoryInput> & { categoryId: string; workspaceId: string }) => {
      const res = await fetch(`/api/repository/categories/${categoryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Failed to update category');
      return res.json();
    },
    onSuccess: (_, vars) => {
      toast.success('Category updated');
      queryClient.invalidateQueries({ queryKey: ['categories', vars.workspaceId] });
    },
    onError: () => toast.error('Failed to update category'),
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ categoryId, workspaceId }: { categoryId: string; workspaceId: string }) => {
      const res = await fetch(`/api/repository/categories/${categoryId}`, { method: 'DELETE' });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || 'Failed to delete category');
      }
      return res.json();
    },
    onSuccess: (_, vars) => {
      toast.success('Category deleted');
      queryClient.invalidateQueries({ queryKey: ['categories', vars.workspaceId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
};
