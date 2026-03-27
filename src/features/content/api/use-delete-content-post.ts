import { useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from '@/lib/rpc';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';

type ResponseType = InferResponseType<(typeof client.api.content)[':postId']['$delete'], 200>;
type RequestType = InferRequestType<(typeof client.api.content)[':postId']['$delete']>;

export const useDeleteContentPost = () => {
  const queryClient = useQueryClient();

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ param }) => {
      const response = await client.api.content[':postId'].$delete({ param });
      if (!response.ok) throw new Error('Failed to delete content post');
      return await response.json();
    },
    onSuccess: () => {
      toast.success('Content post deleted');
      queryClient.invalidateQueries({ queryKey: ['content-posts'] });
    },
    onError: () => {
      toast.error('Failed to delete content post');
    },
  });
};
