'use client';

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { useConfirm } from '@/hooks/use-confirm';

import { Lead, LeadSource, LeadStatus, PropertyType } from '../types';
import { useUpdateLead } from '../api/use-update-lead';
import { useDeleteLead } from '../api/use-delete-lead';
import { updateLeadSchema } from '../schemas';
import { LeadNotes } from './lead-notes';

const schema = updateLeadSchema;

interface EditLeadFormProps {
  onCancel?: () => void;
  initialValues: Lead;
}

export const EditLeadForm = ({ onCancel, initialValues }: EditLeadFormProps) => {
  const { mutate: update, isPending: isUpdating } = useUpdateLead();
  const { mutate: remove, isPending: isDeleting } = useDeleteLead();
  const [ConfirmDialog, confirm] = useConfirm('Delete lead?', 'This cannot be undone.', 'destructive');

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialValues.name,
      email: initialValues.email ?? '',
      phone: initialValues.phone ?? '',
      source: initialValues.source,
      propertyInterest: initialValues.propertyInterest ?? '',
      propertyType: initialValues.propertyType ?? undefined,
      budget: initialValues.budget ?? '',
      status: initialValues.status,
      notes: initialValues.notes ?? '',
    },
  });

  const onSubmit = (values: z.infer<typeof schema>) => {
    update({ param: { leadId: initialValues.$id }, json: values }, { onSuccess: () => onCancel?.() });
  };

  const onDelete = async () => {
    const ok = await confirm();
    if (ok) remove({ param: { leadId: initialValues.$id } }, { onSuccess: () => onCancel?.() });
  };

  const isPending = isUpdating || isDeleting;

  return (
    <>
      <ConfirmDialog />
      <Card className="w-full h-full border-none shadow-none">
        <CardHeader className="p-4 md:p-7 pb-2 md:pb-3">
          <CardTitle className="text-xl font-bold text-neutral-900">Edit Lead</CardTitle>
          <p className="text-sm text-muted-foreground">Update lead details and stage</p>
        </CardHeader>
        <div className="px-7"><DottedSeparator /></div>
        <CardContent className="p-0">
          <Tabs defaultValue="details">
            <TabsList className="w-full rounded-none border-b bg-transparent px-4 md:px-7 h-10">
              <TabsTrigger value="details" className="text-sm">Details</TabsTrigger>
              <TabsTrigger value="notes" className="text-sm">Notes & History</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="p-4 md:p-7 pt-4 md:pt-5">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-y-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl><Input {...field} value={field.value ?? ''} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl><Input {...field} value={field.value ?? ''} type="email" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField control={form.control} name="source" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lead Source</FormLabel>
                      <Select defaultValue={field.value} onValueChange={field.onChange}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
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
                      <FormControl><Input {...field} value={field.value ?? ''} placeholder="e.g. ₱3M – ₱5M" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="propertyInterest" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property of Interest</FormLabel>
                    <FormControl><Input {...field} value={field.value ?? ''} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="notes" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl><Textarea {...field} value={field.value ?? ''} rows={3} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <DottedSeparator className="py-7" />
              <div className="flex items-center justify-between">
                <div className="flex gap-x-2">
                  <Button type="button" size="lg" variant="secondary" onClick={onCancel} disabled={isPending} className={cn(!onCancel && 'invisible')}>
                    Cancel
                  </Button>
                  <Button type="button" size="lg" variant="destructive" onClick={onDelete} disabled={isPending}>
                    Delete
                  </Button>
                </div>
                <Button type="submit" size="lg" disabled={isPending} className="bg-amber-600 hover:bg-amber-700 text-white">
                  Save Changes
                </Button>
              </div>
            </form>
          </Form>
            </TabsContent>
            <TabsContent value="notes" className="p-4 md:p-7">
              <LeadNotes leadId={initialValues.$id} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </>
  );
};
