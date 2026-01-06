'use client';

import { Card } from '@/components/ui/card';
import { cn } from '@/shared/lib/utils';
import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Button } from './button';

interface CalendarEvent {
  id: string | number;
  title: string;
  date: Date;
  type: 'cleaning' | 'opentalk';
  color?: string;
}

interface FullCalendarProps {
  events?: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onDateClick?: (date: Date) => void;
}

export function FullCalendar({
  events = [],
  onEventClick,
  onDateClick,
}: FullCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const previousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1),
    );
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1),
    );
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(
      (event) =>
        format(new Date(event.date), 'yyyy-MM-dd') ===
        format(date, 'yyyy-MM-dd'),
    );
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={previousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => setCurrentMonth(new Date())}>
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card className="p-4">
        {/* Week days header */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-sm font-semibold text-muted-foreground py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day, idx) => {
            const dayEvents = getEventsForDate(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isTodayDate = isToday(day);

            return (
              <div
                key={idx}
                onClick={() => onDateClick?.(day)}
                className={cn(
                  'min-h-[100px] p-2 border rounded-lg cursor-pointer transition-colors',
                  'hover:bg-accent',
                  !isCurrentMonth && 'bg-muted/50 text-muted-foreground',
                  isTodayDate && 'border-primary border-2',
                )}
              >
                <div
                  className={cn(
                    'text-sm font-medium mb-1',
                    isTodayDate && 'text-primary font-bold',
                  )}
                >
                  {format(day, 'd')}
                </div>
                <div className="space-y-1">
                  {dayEvents.map((event) => (
                    <div
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick?.(event);
                      }}
                      className={cn(
                        'text-xs p-1 rounded truncate',
                        event.type === 'cleaning'
                          ? 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100'
                          : 'bg-purple-100 text-purple-900 dark:bg-purple-900 dark:text-purple-100',
                      )}
                      style={
                        event.color ? { backgroundColor: event.color } : {}
                      }
                    >
                      {event.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Legend */}
      <div className="flex gap-4 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-blue-500"></div>
          <span className="text-sm">Cleaning Schedule</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-purple-500"></div>
          <span className="text-sm">Open Talk</span>
        </div>
      </div>
    </div>
  );
}
