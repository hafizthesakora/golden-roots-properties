'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  const pathname = usePathname();
  const isSignIn = pathname === '/sign-in';

  return (
    <main className="bg-green-800 min-h-screen">
      <div className="mx-auto max-w-screen-2xl p-4">
        <nav className="flex justify-between items-center py-2">
          <Link href="/" className="flex flex-col leading-tight">
            <span className="text-amber-400 font-bold text-lg tracking-wide">Golden Roots</span>
            <span className="text-white/60 text-[11px] tracking-widest uppercase">Properties</span>
          </Link>
          <Button
            variant="outline"
            className="border-white/30 text-white hover:bg-white/10 hover:text-white bg-transparent"
            asChild
          >
            <Link href={isSignIn ? '/sign-up' : '/sign-in'}>
              {isSignIn ? 'Sign Up' : 'Log In'}
            </Link>
          </Button>
        </nav>
        <div className="flex flex-col items-center justify-center pt-4 md:pt-10">
          {children}
        </div>
      </div>
    </main>
  );
};

export default AuthLayout;
