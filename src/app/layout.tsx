import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';

import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/sonner';
import { QueryProvider } from '@/components/query-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Golden Roots Properties',
  description: 'Project and content management platform for Golden Roots Properties',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn(inter.className, 'antialiased min-h-screen')}>
        <QueryProvider>
          <Toaster />
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
