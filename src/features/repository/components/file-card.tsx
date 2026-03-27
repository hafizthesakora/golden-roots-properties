'use client';

import { RepositoryFile, FileCategory } from '../types';
import { useDeleteFile } from '../api/use-delete-file';
import { useConfirm } from '@/hooks/use-confirm';
import { Button } from '@/components/ui/button';
import { DownloadIcon, TrashIcon, FileIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ICON_REGISTRY } from './manage-categories-form';

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface FileCardProps {
  file: RepositoryFile;
  categories?: FileCategory[];
}

export const FileCard = ({ file, categories }: FileCardProps) => {
  const { mutate: deleteFile, isPending } = useDeleteFile();
  const [ConfirmDialog, confirm] = useConfirm(
    'Delete file?',
    `"${file.name}" will be permanently removed from Google Drive.`,
    'destructive'
  );

  const category = categories?.find((c) => c.name === file.category);
  const Icon = category ? (ICON_REGISTRY[category.icon] ?? FileIcon) : FileIcon;
  const colorClass = category ? `${category.color} ${category.textColor}` : 'bg-neutral-100 text-neutral-600';

  const handleDelete = async () => {
    const ok = await confirm();
    if (ok) deleteFile({ param: { fileDocId: file.$id } });
  };

  const handleDownload = async () => {
    const response = await fetch(`/api/repository/download/${file.$id}`);
    if (!response.ok) return;
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <ConfirmDialog />
      <div className="flex items-center gap-x-4 p-4 border rounded-lg bg-white hover:bg-neutral-50 transition group">
        <div className={cn('p-3 rounded-lg shrink-0', colorClass)}>
          <Icon className="size-6" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{file.name}</p>
          {file.description && (
            <p className="text-xs text-neutral-500 truncate">{file.description}</p>
          )}
          <div className="flex items-center gap-x-2 mt-1">
            <span className="text-xs text-neutral-400">{category?.label ?? file.category}</span>
            <span className="text-neutral-300">·</span>
            <span className="text-xs text-neutral-400">{formatFileSize(file.size)}</span>
            <span className="text-neutral-300">·</span>
            <span className="text-xs text-neutral-400">
              {format(new Date(file.$createdAt), 'MMM d, yyyy')}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-x-2 opacity-0 group-hover:opacity-100 transition shrink-0">
          <Button size="icon" variant="ghost" onClick={handleDownload} title="Download">
            <DownloadIcon className="size-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleDelete}
            disabled={isPending}
            title="Delete"
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            <TrashIcon className="size-4" />
          </Button>
        </div>
      </div>
    </>
  );
};
