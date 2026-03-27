import { useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from '@/lib/rpc';
import { InferRequestType, InferResponseType } from 'hono';

type ResponseType = InferResponseType<(typeof client.api.leads)['bulk-update']['$post'], 200>;
type RequestType = InferRequestType<(typeof client.api.leads)['bulk-update']['$post']>;

export const useBulkUpdateLeads = () => {
  const queryClient = useQueryClient();
  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.leads['bulk-update'].$post({ json });
      if (!response.ok) throw new Error('Failed to update leads');
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
};
