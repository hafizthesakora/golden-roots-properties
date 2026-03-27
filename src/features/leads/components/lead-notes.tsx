'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Loader, SendIcon, MessageSquareIcon, ArrowRightIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useGetLeadNotes } from '../api/use-get-lead-notes';
import { useCreateLeadNote } from '../api/use-create-lead-note';
import { cn } from '@/lib/utils';

interface LeadNotesProps {
  leadId: string;
}

export const LeadNotes = ({ leadId }: LeadNotesProps) => {
  const [text, setText] = useState('');
  const { data: notes, isLoading } = useGetLeadNotes({ leadId });
  const { mutate: addNote, isPending } = useCreateLeadNote({ leadId });

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    addNote(trimmed, { onSuccess: () => setText('') });
  };

  return (
    <div className="flex flex-col gap-y-4 pt-2">
      {/* Input */}
      <div className="flex flex-col gap-y-2">
        <Textarea
          placeholder="Add a note about this lead..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={2}
          className="resize-none text-sm"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit();
          }}
        />
        <div className="flex justify-end">
          <Button size="sm" onClick={handleSubmit} disabled={isPending || !text.trim()}>
            <SendIcon className="size-3 mr-1.5" />
            {isPending ? 'Saving...' : 'Add Note'}
          </Button>
        </div>
      </div>

      {/* Timeline */}
      {isLoading ? (
        <div className="flex justify-center py-4">
          <Loader className="size-4 animate-spin text-muted-foreground" />
        </div>
      ) : notes && notes.length > 0 ? (
        <div className="relative flex flex-col gap-y-0">
          <div className="absolute left-3.5 top-4 bottom-4 w-px bg-neutral-200" />
          {[...notes].reverse().map((note) => {
            const isStatusChange = note.type === 'status_change';
            let meta: { from?: string; to?: string } = {};
            if (note.meta) {
              try { meta = JSON.parse(note.meta); } catch { /* noop */ }
            }
            return (
              <div key={note.$id} className="relative flex gap-x-3 pb-5">
                <div className={cn(
                  'size-7 rounded-full flex items-center justify-center shrink-0 z-10 border-2 border-white',
                  isStatusChange ? 'bg-amber-100' : 'bg-green-100'
                )}>
                  {isStatusChange
                    ? <ArrowRightIcon className="size-3 text-amber-600" />
                    : <MessageSquareIcon className="size-3 text-green-700" />
                  }
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-center gap-x-2 flex-wrap">
                    <span className="text-xs font-semibold text-neutral-700">{note.authorName}</span>
                    {isStatusChange && meta.from && meta.to ? (
                      <span className="text-xs text-neutral-500">
                        moved from <span className="font-medium">{meta.from.replace('_', ' ')}</span> to{' '}
                        <span className="font-medium text-amber-700">{meta.to.replace('_', ' ')}</span>
                      </span>
                    ) : (
                      <span className="text-xs text-neutral-500">added a note</span>
                    )}
                    <span className="text-[10px] text-neutral-400 ml-auto">
                      {format(new Date(note.$createdAt), 'MMM d, h:mm a')}
                    </span>
                  </div>
                  {!isStatusChange && (
                    <p className="text-sm text-neutral-600 mt-1 whitespace-pre-wrap break-words bg-white rounded-md px-3 py-2 border border-neutral-100">
                      {note.content}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-neutral-400 text-center py-3">No notes yet.</p>
      )}
    </div>
  );
};
