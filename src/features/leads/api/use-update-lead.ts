import { useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from '@/lib/rpc';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';

type ResponseType = InferResponseType<(typeof client.api.leads)[':leadId']['$patch'], 200>;
type RequestType = InferRequestType<(typeof client.api.leads)[':leadId']['$patch']>;

export const useUpdateLead = () => {
  const queryClient = useQueryClient();
  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ param, json }) => {
      const response = await client.api.leads[':leadId'].$patch({ param, json });
      if (!response.ok) throw new Error('Failed to update lead');
      return await response.json();
    },
    onSuccess: () => {
      toast.success('Lead updated');
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
    onError: () => toast.error('Failed to update lead'),
  });
};
