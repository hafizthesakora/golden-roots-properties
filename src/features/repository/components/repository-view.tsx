'use client';

import { useState } from 'react';
import { Loader, PlusIcon, SearchIcon, SlidersHorizontalIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DottedSeparator } from '@/components/dotted-separator';
import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id';
import { useGetFiles } from '../api/use-get-files';
import { useGetCategories } from '../api/use-get-categories';
import { useUploadFileModal } from '../hooks/use-upload-file-modal';
import { FileCard } from './file-card';
import { ManageCategoriesForm } from './manage-categories-form';
import { RepositoryFile } from '../types';

export const RepositoryView = () => {
  const workspaceId = useWorkspaceId();
  const { open } = useUploadFileModal();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('ALL');
  const [manageOpen, setManageOpen] = useState(false);

  const { data: categories, isLoading: isLoadingCategories } = useGetCategories({ workspaceId });
  const { data, isLoading } = useGetFiles({
    workspaceId,
    category: category === 'ALL' ? null : category,
    search: search || null,
  });

  return (
    <div className="flex flex-col gap-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-x-2 shrink-0">
          <Button variant="outline" size="sm" onClick={() => setManageOpen(true)}>
            <SlidersHorizontalIcon className="size-4 mr-2" />
            Categories
          </Button>
          <Button onClick={open} size="sm">
            <PlusIcon className="size-4 mr-2" />
            Upload File
          </Button>
        </div>
      </div>
      <DottedSeparator />

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
          <Input placeholder="Search files..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Categories</SelectItem>
            {(categories ?? []).map((cat) => (
              <SelectItem key={cat.name} value={cat.name}>{cat.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading || isLoadingCategories ? (
        <div className="flex items-center justify-center h-40">
          <Loader className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : data?.documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 text-neutral-500 gap-y-2">
          <p className="text-sm">No files found.</p>
          <Button variant="secondary" size="sm" onClick={open}>Upload your first file</Button>
        </div>
      ) : (
        <div className="flex flex-col gap-y-2">
          {data?.documents.map((file: RepositoryFile) => (
            <FileCard key={file.$id} file={file} categories={categories ?? []} />
          ))}
        </div>
      )}

      {/* Manage categories dialog */}
      <Dialog open={manageOpen} onOpenChange={setManageOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Manage Categories</DialogTitle>
          </DialogHeader>
          <DottedSeparator className="mb-2" />
          {categories && <ManageCategoriesForm categories={categories} />}
        </DialogContent>
      </Dialog>
    </div>
  );
};
