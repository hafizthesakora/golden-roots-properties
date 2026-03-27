import { useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from '@/lib/rpc';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';

type ResponseType = InferResponseType<(typeof client.api.leads)[':leadId']['$delete'], 200>;
type RequestType = InferRequestType<(typeof client.api.leads)[':leadId']['$delete']>;

export const useDeleteLead = () => {
  const queryClient = useQueryClient();
  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ param }) => {
      const response = await client.api.leads[':leadId'].$delete({ param });
      if (!response.ok) throw new Error('Failed to delete lead');
      return await response.json();
    },
    onSuccess: () => {
      toast.success('Lead removed');
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
    onError: () => toast.error('Failed to remove lead'),
  });
};
