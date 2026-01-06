'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FullCalendar } from '@/components/ui/full-calendar';
import { addDays } from 'date-fns';

const sampleEvents = [
  {
    id: 1,
    title: 'Cleaning - John & Mary',
    date: new Date(),
    type: 'cleaning' as const,
  },
  {
    id: 2,
    title: 'Cleaning - Bob & Alice',
    date: addDays(new Date(), 2),
    type: 'cleaning' as const,
  },
  {
    id: 3,
    title: 'Open Talk: React Performance',
    date: addDays(new Date(), 5),
    type: 'opentalk' as const,
  },
  {
    id: 4,
    title: 'Cleaning - Charlie & David',
    date: addDays(new Date(), 7),
    type: 'cleaning' as const,
  },
  {
    id: 5,
    title: 'Open Talk: TypeScript Best Practices',
    date: addDays(new Date(), 12),
    type: 'opentalk' as const,
  },
];

export default function CalendarPage() {
  const handleEventClick = (event: any) => {
    alert(`Event: ${event.title}`);
  };

  const handleDateClick = (date: Date) => {
    console.log('Date clicked:', date);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Office Schedule Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <FullCalendar
            events={sampleEvents}
            onEventClick={handleEventClick}
            onDateClick={handleDateClick}
          />
        </CardContent>
      </Card>
    </div>
  );
}
