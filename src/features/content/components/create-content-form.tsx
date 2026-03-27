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

import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id';
import { createContentPostSchema } from '../schemas';
import { ContentPlatform, ContentPostStatus, ContentPostType } from '../types';
import { useCreateContentPost } from '../api/use-create-content-post';

const schema = createContentPostSchema.omit({ workspaceId: true });

interface CreateContentFormProps {
  onCancel?: () => void;
}

export const CreateContentForm = ({ onCancel }: CreateContentFormProps) => {
  const workspaceId = useWorkspaceId();
  const { mutate, isPending } = useCreateContentPost();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      status: ContentPostStatus.DRAFT,
      platform: ContentPlatform.ALL,
    },
  });

  const onSubmit = (values: z.infer<typeof schema>) => {
    mutate(
      { json: { ...values, workspaceId } },
      {
        onSuccess: () => {
          form.reset();
          onCancel?.();
        },
      }
    );
  };

  return (
    <Card className="w-full h-full border-none shadow-none">
      <CardHeader className="flex p-7">
        <CardTitle className="text-xl font-bold">Plan Content</CardTitle>
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
                      <Textarea {...field} placeholder="Describe the concept or message for this content..." rows={3} />
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
                      <Input {...field} placeholder="e.g. Christmas, Open House, Property Launch..." />
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
                      <Input {...field} placeholder="e.g. promo, listing, community" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DottedSeparator className="py-7" />
            <div className="flex items-center justify-between">
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
              <Button type="submit" size="lg" disabled={isPending}>
                Save Content
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
