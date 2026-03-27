import { parseAsBoolean, useQueryState } from 'nuqs';

export const useUploadFileModal = () => {
  const [isOpen, setIsOpen] = useQueryState(
    'upload-file',
    parseAsBoolean.withDefault(false).withOptions({ clearOnDefault: true })
  );

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  return { isOpen, open, close, setIsOpen };
};
