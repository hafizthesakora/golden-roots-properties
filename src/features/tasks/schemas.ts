import { z } from 'zod';
import { TaskStatus } from './types';

export const createTaskSchema = z.object({
  workspaceId: z.string().trim().min(1, 'Required'),
  status: z.nativeEnum(TaskStatus, { required_error: 'Required' }),
  name: z.string().min(1, 'Required'),
  assigneeId: z.string().trim().min(1, 'Required'),
  dueDate: z.coerce.date(),
  projectId: z.string().trim().min(1, 'Required'),
  description: z.string().optional(),
  isRecurring: z.boolean().optional(),
  recurringInterval: z.enum(['daily', 'weekly', 'monthly', 'yearly']).optional(),
  recurringEndDate: z.string().optional(),
});
