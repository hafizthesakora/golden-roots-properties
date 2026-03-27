'use client';

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { DottedSeparator } from '@/components/dotted-separator';
import { cn } from '@/lib/utils';

import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id';
import { LeadSource, LeadStatus, PropertyType } from '../types';
import { useCreateLead } from '../api/use-create-lead';
import { createLeadSchema } from '../schemas';

const schema = createLeadSchema.omit({ workspaceId: true });

interface CreateLeadFormProps {
  onCancel?: () => void;
}

export const CreateLeadForm = ({ onCancel }: CreateLeadFormProps) => {
  const workspaceId = useWorkspaceId();
  const { mutate, isPending } = useCreateLead();

  const form = useForm<z.infer<typeof schema>>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: { status: LeadStatus.NEW },
  });

  const onSubmit = (values: z.infer<typeof schema>) => {
    mutate(
      { json: { ...values, workspaceId } },
      { onSuccess: () => { form.reset(); onCancel?.(); } }
    );
  };

  return (
    <Card className="w-full h-full border-none shadow-none">
      <CardHeader className="p-4 md:p-7 pb-4 md:pb-5">
        <CardTitle className="text-xl font-bold text-neutral-900">Add New Lead</CardTitle>
        <p className="text-sm text-muted-foreground">Track a new prospect in your pipeline</p>
      </CardHeader>
      <div className="px-4 md:px-7"><DottedSeparator /></div>
      <CardContent className="p-4 md:p-7 pt-4 md:pt-5">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-y-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name *</FormLabel>
                  <FormControl><Input {...field} placeholder="e.g. Juan dela Cruz" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl><Input {...field} placeholder="+63 9xx xxx xxxx" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl><Input {...field} placeholder="email@example.com" type="email" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField control={form.control} name="source" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lead Source *</FormLabel>
                    <Select defaultValue={field.value} onValueChange={field.onChange}>
                      <FormControl><SelectTrigger><SelectValue placeholder="How did they find us?" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value={LeadSource.SOCIAL_MEDIA}>Social Media</SelectItem>
                        <SelectItem value={LeadSource.REFERRAL}>Referral</SelectItem>
                        <SelectItem value={LeadSource.WEBSITE}>Website</SelectItem>
                        <SelectItem value={LeadSource.WALK_IN}>Walk-in</SelectItem>
                        <SelectItem value={LeadSource.COLD_CALL}>Cold Call</SelectItem>
                        <SelectItem value={LeadSource.EVENT}>Event</SelectItem>
                        <SelectItem value={LeadSource.OTHER}>Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="status" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stage</FormLabel>
                    <Select defaultValue={field.value} onValueChange={field.onChange}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value={LeadStatus.NEW}>New</SelectItem>
                        <SelectItem value={LeadStatus.CONTACTED}>Contacted</SelectItem>
                        <SelectItem value={LeadStatus.QUALIFIED}>Qualified</SelectItem>
                        <SelectItem value={LeadStatus.PROPOSAL}>Proposal</SelectItem>
                        <SelectItem value={LeadStatus.NEGOTIATION}>Negotiation</SelectItem>
                        <SelectItem value={LeadStatus.CLOSED_WON}>Closed Won</SelectItem>
                        <SelectItem value={LeadStatus.CLOSED_LOST}>Closed Lost</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField control={form.control} name="propertyType" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Type</FormLabel>
                    <Select defaultValue={field.value} onValueChange={field.onChange}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value={PropertyType.RESIDENTIAL}>Residential</SelectItem>
                        <SelectItem value={PropertyType.COMMERCIAL}>Commercial</SelectItem>
                        <SelectItem value={PropertyType.LAND}>Land</SelectItem>
                        <SelectItem value={PropertyType.RENTAL}>Rental</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="budget" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget</FormLabel>
                    <FormControl><Input {...field} placeholder="e.g. ₱3M – ₱5M" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="propertyInterest" render={({ field }) => (
                <FormItem>
                  <FormLabel>Property of Interest</FormLabel>
                  <FormControl><Input {...field} placeholder="e.g. 3BR condo in BGC, lot in Tagaytay..." /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="notes" render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl><Textarea {...field} placeholder="Any relevant notes about this lead..." rows={3} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <DottedSeparator className="py-7" />
            <div className="flex items-center justify-between">
              <Button type="button" size="lg" variant="secondary" onClick={onCancel} disabled={isPending} className={cn(!onCancel && 'invisible')}>
                Cancel
              </Button>
              <Button type="submit" size="lg" disabled={isPending} className="bg-amber-600 hover:bg-amber-700 text-white">
                Add Lead
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
