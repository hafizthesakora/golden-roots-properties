'use client';

import { format, getDay, parse, startOfWeek, addMonths, subMonths } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { useState } from 'react';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon, PlusIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ContentPost } from '../types';
import { ContentEventCard } from './content-event-card';
import { useCreateContentModal } from '../hooks/use-create-content-modal';


const locales = { 'en-US': enUS };

const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

interface ContentCalendarProps {
  data: ContentPost[];
}

interface CustomToolbarProps {
  date: Date;
  onNavigate: (action: 'PREV' | 'NEXT' | 'TODAY') => void;
  onOpenCreate: () => void;
}

const CustomToolbar = ({ date, onNavigate, onOpenCreate }: CustomToolbarProps) => (
  <div className="flex mb-4 gap-x-2 items-center w-full justify-between flex-wrap gap-y-2">
    <div className="flex items-center gap-x-2">
      <Button onClick={() => onNavigate('PREV')} variant="secondary" size="icon">
        <ChevronLeftIcon className="size-4" />
      </Button>
      <div className="flex items-center border border-input rounded-md px-3 py-2 h-8 justify-center">
        <CalendarIcon className="size-4 mr-2" />
        <p className="text-sm">{format(date, 'MMMM yyyy')}</p>
      </div>
      <Button onClick={() => onNavigate('NEXT')} variant="secondary" size="icon">
        <ChevronRightIcon className="size-4" />
      </Button>
    </div>
    <Button onClick={onOpenCreate} size="sm">
      <PlusIcon className="size-4 mr-2" />
      Add Content
    </Button>
  </div>
);

export const ContentCalendar = ({ data }: ContentCalendarProps) => {
  const [value, setValue] = useState(new Date());
  const { open } = useCreateContentModal();

  const events = data.map((post) => ({
    start: new Date(post.scheduledDate),
    end: new Date(post.scheduledDate),
    title: post.title,
    resource: post,
  }));

  const handleNavigate = (action: 'PREV' | 'NEXT' | 'TODAY') => {
    if (action === 'PREV') setValue(subMonths(value, 1));
    else if (action === 'NEXT') setValue(addMonths(value, 1));
    else setValue(new Date());
  };

  return (
    <Calendar
      localizer={localizer}
      date={value}
      events={events}
      views={['month']}
      toolbar
      showAllEvents
      className="h-full"
      formats={{
        weekdayFormat: (date, culture, localizer) =>
          localizer?.format(date, 'EEE', culture) ?? '',
      }}
      components={{
        eventWrapper: ({ event }) => <ContentEventCard post={event.resource as ContentPost} />,
        toolbar: () => (
          <CustomToolbar date={value} onNavigate={handleNavigate} onOpenCreate={open} />
        ),
      }}
    />
  );
};
