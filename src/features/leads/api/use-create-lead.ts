import { useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from '@/lib/rpc';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';

type ResponseType = InferResponseType<typeof client.api.leads.$post, 200>;
type RequestType = InferRequestType<typeof client.api.leads.$post>;

export const useCreateLead = () => {
  const queryClient = useQueryClient();
  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.leads.$post({ json });
      if (!response.ok) throw new Error('Failed to create lead');
      return await response.json();
    },
    onSuccess: () => {
      toast.success('Lead added');
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
    onError: () => toast.error('Failed to add lead'),
  });
};
