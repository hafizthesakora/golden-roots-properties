import Link from 'next/link';
import { DottedSeparator } from './dotted-separator';
import { Navigation } from './navigation';
import { WorkspaceSwitcher } from './workspace-switcher';
import { Projects } from './projects';

export const Sidebar = () => {
  return (
    <aside className="h-full bg-green-800 p-4 w-full flex flex-col">
      <Link href="/" className="flex items-center justify-center py-3 group">
        <div className="text-center">
          <p className="text-amber-400 font-bold text-base leading-tight tracking-wide transition-colors duration-200 group-hover:text-amber-300">
            Golden Roots
          </p>
          <p className="text-white/60 text-[11px] tracking-widest uppercase">Properties</p>
        </div>
      </Link>
      <DottedSeparator className="my-4" color="#ffffff25" />
      <WorkspaceSwitcher />
      <DottedSeparator className="my-4" color="#ffffff25" />
      <Navigation />
      <DottedSeparator className="my-4" color="#ffffff25" />
      <div className="flex-1 overflow-y-auto">
        <Projects />
      </div>
    </aside>
  );
};
