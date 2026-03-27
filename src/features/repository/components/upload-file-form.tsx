'use client';

import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { DottedSeparator } from '@/components/dotted-separator';
import { cn } from '@/lib/utils';
import { Loader, UploadIcon } from 'lucide-react';
import { FileIcon } from 'lucide-react';

import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id';
import { useUploadFile } from '../api/use-upload-file';
import { FileCategory } from '../types';
import { ICON_REGISTRY } from './manage-categories-form';

const schema = z.object({
  name: z.string().min(1, 'Required'),
  category: z.string().min(1, 'Required'),
  description: z.string().optional(),
  projectId: z.string().optional(),
});

interface UploadFileFormProps {
  onCancel?: () => void;
  categories: FileCategory[];
}

export const UploadFileForm = ({ onCancel, categories }: UploadFileFormProps) => {
  const workspaceId = useWorkspaceId();
  const { mutate, isPending } = useUploadFile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', description: '' },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
    setFileError(null);
    if (file && !form.getValues('name')) {
      form.setValue('name', file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const onSubmit = (values: z.infer<typeof schema>) => {
    if (!selectedFile) { setFileError('Please select a file'); return; }
    if (selectedFile.size > 50 * 1024 * 1024) { setFileError('File must be under 50MB'); return; }
    mutate({ ...values, workspaceId, file: selectedFile }, {
      onSuccess: () => { form.reset(); setSelectedFile(null); onCancel?.(); },
    });
  };

  return (
    <Card className="w-full h-full border-none shadow-none">
      <CardHeader className="flex p-7">
        <CardTitle className="text-xl font-bold">Upload to Google Drive</CardTitle>
      </CardHeader>
      <div className="px-7"><DottedSeparator /></div>
      <CardContent className="p-7">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-y-4">
              <div>
                <p className="text-sm font-medium mb-2">File</p>
                <div onClick={() => fileInputRef.current?.click()}
                  className={cn('border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-y-2 cursor-pointer hover:bg-neutral-50 transition',
                    fileError ? 'border-red-400' : 'border-neutral-200')}>
                  <UploadIcon className="size-8 text-neutral-400" />
                  {selectedFile ? (
                    <p className="text-sm text-primary font-medium">{selectedFile.name}</p>
                  ) : (
                    <p className="text-sm text-neutral-500">Click to select a file (max 50MB)</p>
                  )}
                  <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
                </div>
                {fileError && <p className="text-sm text-red-500 mt-1">{fileError}</p>}
              </div>

              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>File Name</FormLabel>
                  <FormControl><Input {...field} placeholder="Descriptive file name" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="category" render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select defaultValue={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((cat) => {
                        const Icon = ICON_REGISTRY[cat.icon] ?? FileIcon;
                        return (
                          <SelectItem key={cat.name} value={cat.name}>
                            <div className="flex items-center gap-x-2">
                              <Icon className="size-4" />
                              {cat.label}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl><Textarea {...field} placeholder="Brief description or reference notes..." rows={2} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <DottedSeparator className="py-7" />
            <div className="flex items-center justify-between">
              <Button type="button" size="lg" variant="secondary" onClick={onCancel} disabled={isPending}
                className={cn(!onCancel && 'invisible')}>
                Cancel
              </Button>
              <Button type="submit" size="lg" disabled={isPending}>
                {isPending ? <Loader className="size-4 animate-spin mr-2" /> : null}
                Upload to Drive
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
