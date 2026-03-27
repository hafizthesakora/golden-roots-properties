import { parseAsString, useQueryState } from 'nuqs';

export const useEditLeadModal = () => {
  const [leadId, setLeadId] = useQueryState(
    'edit-lead',
    parseAsString.withOptions({ clearOnDefault: true })
  );
  const open = (id: string) => setLeadId(id);
  const close = () => setLeadId(null);
  return { leadId, open, close, setLeadId };
};
