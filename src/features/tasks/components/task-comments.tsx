'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Loader, SendIcon, Trash2Icon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { DottedSeparator } from '@/components/dotted-separator';
import { useGetTaskComments } from '../api/use-get-task-comments';
import { useCreateTaskComment } from '../api/use-create-task-comment';
import { useDeleteTaskComment } from '../api/use-delete-task-comment';
import { useCurrent } from '@/features/auth/api/use-current';
import { cn } from '@/lib/utils';

interface TaskCommentsProps {
  taskId: string;
}

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
}

export const TaskComments = ({ taskId }: TaskCommentsProps) => {
  const [text, setText] = useState('');
  const { data: comments, isLoading } = useGetTaskComments({ taskId });
  const { mutate: createComment, isPending: isPosting } = useCreateTaskComment({ taskId });
  const { mutate: deleteComment } = useDeleteTaskComment({ taskId });
  const { data: currentUser } = useCurrent();

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    createComment(trimmed, { onSuccess: () => setText('') });
  };

  return (
    <div className="bg-muted rounded-lg p-4 flex flex-col gap-y-4">
      <p className="text-lg font-semibold">Comments</p>
      <DottedSeparator />

      {/* Input */}
      <div className="flex gap-x-3">
        <div className="size-8 rounded-full bg-green-800 flex items-center justify-center shrink-0 text-white text-xs font-bold">
          {getInitials(currentUser?.name ?? '?')}
        </div>
        <div className="flex-1 flex flex-col gap-y-2">
          <Textarea
            placeholder="Write a comment..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={2}
            className="resize-none text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit();
            }}
          />
          <div className="flex justify-end">
            <Button size="sm" onClick={handleSubmit} disabled={isPosting || !text.trim()}>
              <SendIcon className="size-3 mr-1.5" />
              {isPosting ? 'Posting...' : 'Post'}
            </Button>
          </div>
        </div>
      </div>

      {/* Thread */}
      {isLoading ? (
        <div className="flex justify-center py-4">
          <Loader className="size-4 animate-spin text-muted-foreground" />
        </div>
      ) : comments && comments.length > 0 ? (
        <div className="flex flex-col gap-y-4">
          {comments.map((comment) => {
            const isOwn = comment.authorId === currentUser?.$id;
            return (
              <div key={comment.$id} className="flex gap-x-3 group">
                <div className="size-8 rounded-full bg-neutral-200 flex items-center justify-center shrink-0 text-neutral-600 text-xs font-bold">
                  {getInitials(comment.authorName)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-x-2">
                    <span className="text-sm font-medium">{comment.authorName}</span>
                    <span className="text-xs text-neutral-400">
                      {formatDistanceToNow(new Date(comment.$createdAt), { addSuffix: true })}
                    </span>
                    {isOwn && (
                      <button
                        onClick={() => deleteComment(comment.$id)}
                        className="ml-auto opacity-0 group-hover:opacity-100 transition text-neutral-400 hover:text-red-500"
                      >
                        <Trash2Icon className="size-3.5" />
                      </button>
                    )}
                  </div>
                  <p className={cn('text-sm mt-0.5 text-neutral-700 whitespace-pre-wrap break-words')}>{comment.content}</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-neutral-400 text-center py-2">No comments yet. Be the first to comment.</p>
      )}
    </div>
  );
};
