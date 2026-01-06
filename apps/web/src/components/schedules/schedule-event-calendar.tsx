'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { ScheduleEvent } from '@/shared/types/schedule.types';
import { format } from 'date-fns';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface ScheduleEventCalendarProps {
  events: ScheduleEvent[];
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
  loading: boolean;
}

export function ScheduleEventCalendar({
  events,
  currentMonth,
  onMonthChange,
  loading,
}: ScheduleEventCalendarProps) {
  const handlePrevMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    onMonthChange(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    onMonthChange(newDate);
  };

  const handleToday = () => {
    onMonthChange(new Date());
  };

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days in the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return events.filter((event) => event.date === dateStr);
  };

  const days = getDaysInMonth();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          <h2 className="text-xl font-semibold">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleToday}>
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">
          Loading events...
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-sm font-medium text-muted-foreground py-2"
            >
              {day}
            </div>
          ))}

          {days.map((day, index) => {
            if (!day) {
              return <div key={`empty-${index}`} className="min-h-[100px]" />;
            }

            const dayEvents = getEventsForDate(day);
            const isToday =
              format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

            return (
              <div
                key={index}
                className={`min-h-[100px] border rounded-lg p-2 ${
                  isToday ? 'bg-primary/5 border-primary' : 'bg-card'
                }`}
              >
                <div className="text-sm font-medium mb-1">
                  {format(day, 'd')}
                </div>
                <div className="space-y-1">
                  {dayEvents.map((event) => (
                    <div
                      key={event.id}
                      className="text-xs p-1 rounded bg-primary/10 truncate"
                      title={event.definition?.name}
                    >
                      <Badge variant="outline" className="text-xs">
                        {event.definition?.code || 'Unknown'}
                      </Badge>
                      <div className="mt-1 text-muted-foreground">
                        {event.assignments?.length || 0} assigned
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
