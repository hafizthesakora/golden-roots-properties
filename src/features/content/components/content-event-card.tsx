'use client';

import { cn } from '@/lib/utils';
import { ContentPost, ContentPostStatus, ContentPostType } from '../types';
import { useEditContentModal } from '../hooks/use-edit-content-modal';
import {
  ImageIcon,
  VideoIcon,
  FileTextIcon,
  LayoutIcon,
  BookOpenIcon,
  StarIcon,
  HelpCircleIcon,
} from 'lucide-react';

interface ContentEventCardProps {
  post: ContentPost;
}

const postTypeColorMap: Record<ContentPostType, string> = {
  [ContentPostType.FLYER]: 'border-l-orange-500',
  [ContentPostType.VIDEO]: 'border-l-blue-500',
  [ContentPostType.REEL]: 'border-l-pink-500',
  [ContentPostType.STORY]: 'border-l-purple-500',
  [ContentPostType.CAROUSEL]: 'border-l-cyan-500',
  [ContentPostType.GRAPHIC]: 'border-l-green-500',
  [ContentPostType.OTHER]: 'border-l-neutral-400',
};

const postTypeIconMap: Record<ContentPostType, React.ElementType> = {
  [ContentPostType.FLYER]: ImageIcon,
  [ContentPostType.VIDEO]: VideoIcon,
  [ContentPostType.REEL]: VideoIcon,
  [ContentPostType.STORY]: BookOpenIcon,
  [ContentPostType.CAROUSEL]: LayoutIcon,
  [ContentPostType.GRAPHIC]: StarIcon,
  [ContentPostType.OTHER]: HelpCircleIcon,
};

const statusBadgeMap: Record<ContentPostStatus, string> = {
  [ContentPostStatus.DRAFT]: 'bg-neutral-100 text-neutral-600',
  [ContentPostStatus.SCHEDULED]: 'bg-blue-100 text-blue-700',
  [ContentPostStatus.PUBLISHED]: 'bg-emerald-100 text-emerald-700',
  [ContentPostStatus.CANCELLED]: 'bg-red-100 text-red-700',
};

export const ContentEventCard = ({ post }: ContentEventCardProps) => {
  const { open } = useEditContentModal();
  const Icon = postTypeIconMap[post.postType] ?? FileTextIcon;

  return (
    <div className="px-2">
      <div
        onClick={(e) => {
          e.stopPropagation();
          open(post.$id);
        }}
        className={cn(
          'p-1.5 text-xs bg-white text-primary border rounded-md border-l-4 flex flex-col gap-y-1 cursor-pointer hover:opacity-75 transition',
          postTypeColorMap[post.postType]
        )}
      >
        <div className="flex items-center gap-x-1">
          <Icon className="size-3 shrink-0" />
          <p className="font-medium truncate">{post.title}</p>
        </div>
        <div className="flex items-center gap-x-1 flex-wrap">
          <span className={cn('px-1 py-0.5 rounded text-[10px] font-medium', statusBadgeMap[post.status])}>
            {post.status}
          </span>
          <span className="text-neutral-400 text-[10px]">{post.postType}</span>
          {post.festivity && (
            <span className="text-amber-600 text-[10px] font-medium truncate">{post.festivity}</span>
          )}
        </div>
      </div>
    </div>
  );
};
