import { parseAsString, useQueryState } from 'nuqs';

export const useEditContentModal = () => {
  const [postId, setPostId] = useQueryState(
    'edit-content',
    parseAsString.withOptions({ clearOnDefault: true })
  );

  const open = (id: string) => setPostId(id);
  const close = () => setPostId(null);

  return { postId, open, close, setPostId };
};
