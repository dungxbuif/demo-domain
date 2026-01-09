'use client';

import { EventTableRow } from '@/components/opentalk/event-table-row';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  IOpentalEventMetadata,
  ScheduleCycle,
  ScheduleEvent,
} from '@qnoffice/shared';

interface CycleCardProps {
  cycle: ScheduleCycle;
  editingTopic: number | null;
  editedTopicValue: string;
  canEditTopic: (event: ScheduleEvent<IOpentalEventMetadata>) => boolean;
  canEditSlide: (event: ScheduleEvent<IOpentalEventMetadata>) => boolean;
  onTopicEdit: (eventId: number, currentTopic: string) => void;
  onTopicSave: (eventId: number) => void;
  onTopicCancel: () => void;
  onTopicChange: (value: string) => void;
  onSlideClick: (event: ScheduleEvent<IOpentalEventMetadata>) => void;
  formatDate: (date: string) => string;
}

export function CycleCard({
  cycle,
  editingTopic,
  editedTopicValue,
  canEditTopic,
  canEditSlide,
  onTopicEdit,
  onTopicSave,
  onTopicCancel,
  onTopicChange,
  onSlideClick,
  formatDate,
}: CycleCardProps) {
  const isPast = cycle.events?.sort(
    (a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime(),
  )[0]?.eventDate
    ? new Date(
        cycle.events.sort(
          (a, b) =>
            new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime(),
        )[0].eventDate,
      ) < new Date()
    : false;
  return (
    <Card className={isPast ? 'border-muted' : ''}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <span>{cycle.name}</span>
              <Badge variant={isPast ? 'secondary' : 'default'}>
                {isPast ? 'Past' : 'Active'}
              </Badge>
            </CardTitle>
          </div>
          <div className="text-sm text-muted-foreground">
            {cycle?.events?.length || 0} events
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {cycle?.events?.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No events scheduled for this cycle
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[140px]">Date</TableHead>
                <TableHead className="w-[250px]">Topic</TableHead>
                <TableHead className="w-[200px]">Presenter</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead className="w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cycle?.events?.map((event) => (
                <EventTableRow
                  key={event.id}
                  event={event}
                  isEditingTopic={editingTopic === event.id}
                  editedTopicValue={editedTopicValue}
                  canEditTopic={canEditTopic(event)}
                  canEditSlide={canEditSlide(event)}
                  onTopicEdit={(topic) => onTopicEdit(event.id, topic)}
                  onTopicSave={() => onTopicSave(event.id)}
                  onTopicCancel={onTopicCancel}
                  onTopicChange={onTopicChange}
                  onSlideClick={() => onSlideClick(event)}
                  formatDate={formatDate}
                />
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
