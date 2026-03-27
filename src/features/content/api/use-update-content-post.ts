import { useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from '@/lib/rpc';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';

type ResponseType = InferResponseType<(typeof client.api.content)[':postId']['$patch'], 200>;
type RequestType = InferRequestType<(typeof client.api.content)[':postId']['$patch']>;

export const useUpdateContentPost = () => {
  const queryClient = useQueryClient();

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ param, json }) => {
      const response = await client.api.content[':postId'].$patch({ param, json });
      if (!response.ok) throw new Error('Failed to update content post');
      return await response.json();
    },
    onSuccess: () => {
      toast.success('Content post updated');
      queryClient.invalidateQueries({ queryKey: ['content-posts'] });
    },
    onError: () => {
      toast.error('Failed to update content post');
    },
  });
};
