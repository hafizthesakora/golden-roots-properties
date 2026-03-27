import { parseAsBoolean, useQueryState } from 'nuqs';

export const useCreateContentModal = () => {
  const [isOpen, setIsOpen] = useQueryState(
    'create-content',
    parseAsBoolean.withDefault(false).withOptions({ clearOnDefault: true })
  );

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  return { isOpen, open, close, setIsOpen };
};
