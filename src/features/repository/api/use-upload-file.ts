import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface UploadFileInput {
  workspaceId: string;
  name: string;
  category: string;
  description?: string;
  projectId?: string;
  file: File;
}

export const useUploadFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UploadFileInput) => {
      const formData = new FormData();
      formData.append('workspaceId', input.workspaceId);
      formData.append('name', input.name);
      formData.append('category', input.category);
      formData.append('file', input.file);
      if (input.description) formData.append('description', input.description);
      if (input.projectId) formData.append('projectId', input.projectId);

      const response = await fetch('/api/repository', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to upload file');
      return response.json();
    },
    onSuccess: () => {
      toast.success('File uploaded successfully');
      queryClient.invalidateQueries({ queryKey: ['repository-files'] });
    },
    onError: () => {
      toast.error('Failed to upload file');
    },
  });
};
