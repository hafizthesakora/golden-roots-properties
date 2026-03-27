import { parseAsBoolean, useQueryState } from 'nuqs';

export const useCreateLeadModal = () => {
  const [isOpen, setIsOpen] = useQueryState(
    'create-lead',
    parseAsBoolean.withDefault(false).withOptions({ clearOnDefault: true })
  );
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  return { isOpen, open, close, setIsOpen };
};
