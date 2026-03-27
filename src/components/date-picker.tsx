'use client';

import { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';

interface DatePickerProps {
  value: Date | undefined;
  onChange: (date: Date) => void;
  className?: string;
  placeholder?: string;
}

export const DatePicker = ({
  value,
  onChange,
  className,
  placeholder = 'Select date',
}: DatePickerProps) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div ref={containerRef} className="relative w-full">
      <Button
        type="button"
        variant="outline"
        size="lg"
        className={cn(
          'w-full justify-start text-left font-normal px-3',
          !value && 'text-muted-foreground',
          className
        )}
        onClick={() => setOpen((o) => !o)}
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {value ? format(value, 'PPP') : <span>{placeholder}</span>}
      </Button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 rounded-md border bg-popover shadow-md max-w-[calc(100vw-2rem)]">
          <Calendar
            mode="single"
            selected={value}
            onSelect={(date) => {
              if (date) {
                onChange(date);
                setOpen(false);
              }
            }}
          />
        </div>
      )}
    </div>
  );
};
