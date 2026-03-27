import { z } from 'zod';

export const uploadFileSchema = z.object({
  workspaceId: z.string().trim().min(1, 'Required'),
  name: z.string().min(1, 'Required'),
  category: z.string().min(1, 'Required'),
  description: z.string().optional(),
  projectId: z.string().optional(),
  file: z
    .instanceof(File)
    .refine((f) => f.size > 0, 'File is required')
    .refine((f) => f.size <= 50 * 1024 * 1024, 'File must be under 50MB'),
});
