'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EventStatus, ScheduleType } from '@qnoffice/shared';
import { format, getDay, parse, startOfWeek } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  resource: {
    type: ScheduleType;
    status: EventStatus;
    staffName: string;
    assignmentId: number;
  };
}

export function ScheduleCalendarView() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null,
  );

  useEffect(() => {
    loadCalendarEvents();
  }, []);

  const loadCalendarEvents = async () => {
    try {
      setLoading(true);
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1); // Load previous month
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 3); // Load next 3 months

      // Fetch assignments from API
      const response = await fetch(
        `/api/schedules/assignments?startDate=${startDate.toISOString().split('T')[0]}&endDate=${endDate.toISOString().split('T')[0]}&status=${EventStatus.PENDING}`,
      );
      const data = await response.json();
      const assignments = data.result || [];

      if (assignments) {
        const calendarEvents: CalendarEvent[] = assignments.map(
          (assignment: any) => {
            const eventDate = new Date(assignment.assignedDate);
            return {
              id: assignment.id,
              title: `${assignment.type} - ${assignment.staff?.user?.name || 'Unknown'}`,
              start: eventDate,
              end: new Date(eventDate.getTime() + 60 * 60 * 1000), // 1 hour duration
              resource: {
                type: assignment.type,
                status: assignment.status,
                staffName: assignment.staff?.user?.name || 'Unknown',
                assignmentId: assignment.id,
              },
            };
          },
        );
        setEvents(calendarEvents);
      }
    } catch (error) {
      console.error('Error loading calendar events:', error);
    } finally {
      setLoading(false);
    }
  };

  const eventStyleGetter = (event: CalendarEvent) => {
    const { type } = event.resource;
    let backgroundColor = '#3174ad';

    switch (type) {
      case ScheduleType.OPENTALK:
        backgroundColor = '#059669'; // green
        break;
      case ScheduleType.CLEANING:
        backgroundColor = '#dc2626'; // red
        break;
      default:
        backgroundColor = '#3174ad'; // blue
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
      },
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Schedule Calendar</h2>
        <div className="flex gap-2">
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            OpenTalk
          </Badge>
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            Cleaning
          </Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">
            Read-only calendar view of all scheduled assignments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[600px]">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              eventPropGetter={eventStyleGetter}
              onSelectEvent={(event) => setSelectedEvent(event)}
              views={['month', 'week', 'day']}
              defaultView="month"
              popup
              popupOffset={{ x: 30, y: 20 }}
            />
          </div>
        </CardContent>
      </Card>

      {selectedEvent && (
        <Card>
          <CardHeader>
            <CardTitle>Assignment Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <span className="font-semibold">Type: </span>
                <Badge
                  variant={
                    selectedEvent.resource.type === ScheduleType.OPENTALK
                      ? 'default'
                      : 'destructive'
                  }
                >
                  {selectedEvent.resource.type}
                </Badge>
              </div>
              <div>
                <span className="font-semibold">Staff: </span>
                {selectedEvent.resource.staffName}
              </div>
              <div>
                <span className="font-semibold">Date: </span>
                {selectedEvent.start.toLocaleDateString()}
              </div>
              <div>
                <span className="font-semibold">Status: </span>
                <Badge variant="outline">{selectedEvent.resource.status}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
