'use client';

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { DottedSeparator } from '@/components/dotted-separator';
import { DatePicker } from '@/components/date-picker';
import { cn } from '@/lib/utils';

import { useConfirm } from '@/hooks/use-confirm';
import { createContentPostSchema } from '../schemas';
import { ContentPlatform, ContentPost, ContentPostStatus, ContentPostType } from '../types';
import { useUpdateContentPost } from '../api/use-update-content-post';
import { useDeleteContentPost } from '../api/use-delete-content-post';

const schema = createContentPostSchema.omit({ workspaceId: true });

interface EditContentFormProps {
  onCancel?: () => void;
  initialValues: ContentPost;
}

export const EditContentForm = ({ onCancel, initialValues }: EditContentFormProps) => {
  const { mutate: update, isPending: isUpdating } = useUpdateContentPost();
  const { mutate: remove, isPending: isDeleting } = useDeleteContentPost();
  const [ConfirmDialog, confirm] = useConfirm(
    'Delete content post?',
    'This action cannot be undone.',
    'destructive'
  );

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      ...initialValues,
      scheduledDate: initialValues.scheduledDate ? new Date(initialValues.scheduledDate) : new Date(),
    },
  });

  const onSubmit = (values: z.infer<typeof schema>) => {
    update(
      { param: { postId: initialValues.$id }, json: values },
      { onSuccess: () => onCancel?.() }
    );
  };

  const onDelete = async () => {
    const ok = await confirm();
    if (!ok) return;
    remove({ param: { postId: initialValues.$id } }, { onSuccess: () => onCancel?.() });
  };

  const isPending = isUpdating || isDeleting;

  return (
    <>
      <ConfirmDialog />
      <Card className="w-full h-full border-none shadow-none">
        <CardHeader className="flex p-7">
          <CardTitle className="text-xl font-bold">Edit Content</CardTitle>
        </CardHeader>
        <div className="px-7">
          <DottedSeparator />
        </div>
        <CardContent className="p-7">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Content title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="concept"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Concept / Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Describe the concept..." rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="postType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Post Type</FormLabel>
                        <Select defaultValue={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={ContentPostType.FLYER}>Flyer</SelectItem>
                            <SelectItem value={ContentPostType.VIDEO}>Video</SelectItem>
                            <SelectItem value={ContentPostType.REEL}>Reel</SelectItem>
                            <SelectItem value={ContentPostType.STORY}>Story</SelectItem>
                            <SelectItem value={ContentPostType.CAROUSEL}>Carousel</SelectItem>
                            <SelectItem value={ContentPostType.GRAPHIC}>Graphic</SelectItem>
                            <SelectItem value={ContentPostType.OTHER}>Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="platform"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Platform</FormLabel>
                        <Select defaultValue={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select platform" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={ContentPlatform.ALL}>All Platforms</SelectItem>
                            <SelectItem value={ContentPlatform.INSTAGRAM}>Instagram</SelectItem>
                            <SelectItem value={ContentPlatform.FACEBOOK}>Facebook</SelectItem>
                            <SelectItem value={ContentPlatform.TIKTOK}>TikTok</SelectItem>
                            <SelectItem value={ContentPlatform.LINKEDIN}>LinkedIn</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select defaultValue={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={ContentPostStatus.DRAFT}>Draft</SelectItem>
                            <SelectItem value={ContentPostStatus.SCHEDULED}>Scheduled</SelectItem>
                            <SelectItem value={ContentPostStatus.PUBLISHED}>Published</SelectItem>
                            <SelectItem value={ContentPostStatus.CANCELLED}>Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="scheduledDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Scheduled Date</FormLabel>
                        <FormControl>
                          <DatePicker value={field.value} onChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="festivity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Program / Festivity (optional)</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ''} placeholder="e.g. Christmas, Open House..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags (optional)</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ''} placeholder="e.g. promo, listing" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DottedSeparator className="py-7" />
              <div className="flex items-center justify-between">
                <div className="flex gap-x-2">
                  <Button
                    type="button"
                    size="lg"
                    variant="secondary"
                    onClick={onCancel}
                    disabled={isPending}
                    className={cn(!onCancel && 'invisible')}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="lg"
                    variant="destructive"
                    onClick={onDelete}
                    disabled={isPending}
                  >
                    Delete
                  </Button>
                </div>
                <Button type="submit" size="lg" disabled={isPending}>
                  Save Changes
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
};
