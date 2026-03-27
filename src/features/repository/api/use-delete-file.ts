import { useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from '@/lib/rpc';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';

type ResponseType = InferResponseType<(typeof client.api.repository)[':fileDocId']['$delete'], 200>;
type RequestType = InferRequestType<(typeof client.api.repository)[':fileDocId']['$delete']>;

export const useDeleteFile = () => {
  const queryClient = useQueryClient();

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ param }) => {
      const response = await client.api.repository[':fileDocId'].$delete({ param });
      if (!response.ok) throw new Error('Failed to delete file');
      return await response.json();
    },
    onSuccess: () => {
      toast.success('File deleted');
      queryClient.invalidateQueries({ queryKey: ['repository-files'] });
    },
    onError: () => {
      toast.error('Failed to delete file');
    },
  });
};
