import { z } from 'zod';
import { ContentPlatform, ContentPostStatus, ContentPostType } from './types';

export const createContentPostSchema = z.object({
  workspaceId: z.string().trim().min(1, 'Required'),
  title: z.string().min(1, 'Required'),
  concept: z.string().min(1, 'Required'),
  postType: z.nativeEnum(ContentPostType, { required_error: 'Required' }),
  platform: z.nativeEnum(ContentPlatform, { required_error: 'Required' }),
  status: z.nativeEnum(ContentPostStatus, { required_error: 'Required' }),
  scheduledDate: z.coerce.date(),
  projectId: z.string().optional(),
  tags: z.string().optional(),
  festivity: z.string().optional(),
});
