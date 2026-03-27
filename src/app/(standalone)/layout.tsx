import { UserButton } from '@/features/auth/components/user-button';
import Link from 'next/link';

interface StandAloneLayoutProps {
  children: React.ReactNode;
}

const StandAloneLayout = ({ children }: StandAloneLayoutProps) => {
  return (
    <main className="bg-neutral-50 min-h-screen">
      <div className="mx-auto max-w-screen-2xl p-4">
        <nav className="flex justify-between items-center h-[73px]">
          <Link href="/" className="flex flex-col leading-tight">
            <span className="text-green-800 font-bold text-lg tracking-wide">Golden Roots</span>
            <span className="text-green-700/60 text-[11px] tracking-widest uppercase">Properties</span>
          </Link>
          <UserButton />
        </nav>
        <div className="flex flex-col items-center justify-center py-4">
          {children}
        </div>
      </div>
    </main>
  );
};

export default StandAloneLayout;
