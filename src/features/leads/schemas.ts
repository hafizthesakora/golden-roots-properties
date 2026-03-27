import { z } from 'zod';
import { LeadSource, LeadStatus, PropertyType } from './types';

export const createLeadSchema = z.object({
  workspaceId: z.string().trim().min(1, 'Required'),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  source: z.nativeEnum(LeadSource, { required_error: 'Source is required' }),
  propertyInterest: z.string().optional(),
  propertyType: z.nativeEnum(PropertyType).optional(),
  budget: z.string().optional(),
  status: z.nativeEnum(LeadStatus).default(LeadStatus.NEW),
  notes: z.string().optional(),
  assigneeId: z.string().optional(),
});

export const updateLeadSchema = createLeadSchema
  .omit({ workspaceId: true })
  .partial()
  .extend({
    position: z.number().int().positive().optional(),
    status: z.nativeEnum(LeadStatus).optional(),
  });
