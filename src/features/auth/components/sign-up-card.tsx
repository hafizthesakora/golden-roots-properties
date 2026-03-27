'use client';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { DottedSeparator } from '@/components/dotted-separator';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { registerSchema } from '../schemas';
import { useRegister } from '../api/use-register';

export const SignUpCard = () => {
  const { mutate, isPending } = useRegister();
  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = (values: z.infer<typeof registerSchema>) => {
    mutate({ json: values });
  };

  return (
    <Card className="w-full h-full md:w-[460px] border border-green-200/60 shadow-2xl shadow-black/30 bg-white rounded-2xl">
      <CardHeader className="flex flex-col items-center justify-center text-center p-8 pb-4">
        <CardTitle className="text-2xl font-bold text-neutral-900">Create an account</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">Join Golden Roots Properties</p>
      </CardHeader>
      <div className="px-8"><DottedSeparator /></div>
      <CardContent className="p-8 pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              name="name"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-neutral-900 font-medium">Full Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      type="text"
                      placeholder="Juan dela Cruz"
                      className="border-green-200 focus-visible:ring-green-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-neutral-900 font-medium">Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      type="email"
                      placeholder="you@example.com"
                      className="border-green-200 focus-visible:ring-green-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-neutral-900 font-medium">Password</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      type="password"
                      placeholder="••••••••"
                      className="border-green-200 focus-visible:ring-green-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              disabled={isPending}
              className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold h-11 rounded-lg"
              size="lg"
            >
              {isPending ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>
        </Form>
      </CardContent>
      <div className="px-8"><DottedSeparator /></div>
      <CardContent className="p-6 flex items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/sign-in" className="text-green-700 font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </CardContent>
    </Card>
  );
};
