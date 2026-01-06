'use client';

import { CreateScheduleEventDialog } from '@/components/schedules/create-schedule-event-dialog';
import { ScheduleEventCalendar } from '@/components/schedules/schedule-event-calendar';
import { ScheduleEventList } from '@/components/schedules/schedule-event-list';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  scheduleDefinitionApi,
  scheduleEventApi,
} from '@/shared/lib/api/schedule.api';
import type {
  ScheduleDefinition,
  ScheduleEvent,
} from '@/shared/types/schedule.types';
import { Calendar as CalendarIcon, Filter, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ScheduleEventsPage() {
  const [definitions, setDefinitions] = useState<ScheduleDefinition[]>([]);
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [selectedDefinition, setSelectedDefinition] = useState<number | 'all'>(
    'all',
  );
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const loadData = async () => {
    try {
      setLoading(true);

      // Load definitions
      const defsData = await scheduleDefinitionApi.getAll({ isActive: true });
      setDefinitions(defsData);

      // Load events for current month
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;
      const dateFrom = `${year}-${month.toString().padStart(2, '0')}-01`;
      const lastDay = new Date(year, month, 0).getDate();
      const dateTo = `${year}-${month.toString().padStart(2, '0')}-${lastDay}`;

      const params: any = { dateFrom, dateTo };
      if (selectedDefinition !== 'all') {
        params.definitionId = selectedDefinition;
      }

      const eventsData = await scheduleEventApi.getAll(params);
      setEvents(eventsData.data || []);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDefinition, currentMonth]);

  const handleCreated = () => {
    setCreateDialogOpen(false);
    loadData();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Schedule Events</h1>
          <p className="text-muted-foreground">
            View and manage scheduled events
          </p>
        </div>
        <div className="flex gap-2">
          <Select
            value={viewMode}
            onValueChange={(v: 'calendar' | 'list') => setViewMode(v)}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="calendar">
                <div className="flex items-center">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  Calendar
                </div>
              </SelectItem>
              <SelectItem value="list">
                <div className="flex items-center">
                  <Filter className="mr-2 h-4 w-4" />
                  List
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Event
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Filter</CardTitle>
              <CardDescription>Filter events by schedule type</CardDescription>
            </div>
            <Select
              value={
                selectedDefinition === 'all'
                  ? 'all'
                  : String(selectedDefinition)
              }
              onValueChange={(v) =>
                setSelectedDefinition(v === 'all' ? 'all' : Number(v))
              }
            >
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Schedule Types</SelectItem>
                {definitions.map((def) => (
                  <SelectItem key={def.id} value={String(def.id)}>
                    {def.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {viewMode === 'calendar' ? (
        <ScheduleEventCalendar
          events={events}
          currentMonth={currentMonth}
          onMonthChange={setCurrentMonth}
          loading={loading}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Events List</CardTitle>
            <CardDescription>All scheduled events</CardDescription>
          </CardHeader>
          <CardContent>
            <ScheduleEventList
              events={events}
              definitions={definitions}
              loading={loading}
              onUpdate={loadData}
            />
          </CardContent>
        </Card>
      )}

      <CreateScheduleEventDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        definitions={definitions}
        onCreated={handleCreated}
      />
    </div>
  );
}
