import { useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from '@/lib/rpc';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';

type ResponseType = InferResponseType<typeof client.api.content.$post, 200>;
type RequestType = InferRequestType<typeof client.api.content.$post>;

export const useCreateContentPost = () => {
  const queryClient = useQueryClient();

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.content.$post({ json });
      if (!response.ok) throw new Error('Failed to create content post');
      return await response.json();
    },
    onSuccess: () => {
      toast.success('Content post created');
      queryClient.invalidateQueries({ queryKey: ['content-posts'] });
    },
    onError: () => {
      toast.error('Failed to create content post');
    },
  });
};
