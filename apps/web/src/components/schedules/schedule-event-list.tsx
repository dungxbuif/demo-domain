'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type {
  ScheduleDefinition,
  ScheduleEvent,
} from '@/shared/types/schedule.types';
import { format } from 'date-fns';
import { MoreHorizontal, Trash2, Users } from 'lucide-react';

interface ScheduleEventListProps {
  events: ScheduleEvent[];
  definitions: ScheduleDefinition[];
  loading: boolean;
  onUpdate: () => void;
}

export function ScheduleEventList({
  events,
  definitions,
  loading,
  onUpdate,
}: ScheduleEventListProps) {
  const getDefinitionName = (definitionId: number) => {
    const def = definitions.find((d) => d.id === definitionId);
    return def?.name || 'Unknown';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'default';
      case 'completed':
        return 'default';
      case 'cancelled':
        return 'destructive';
      case 'skipped':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Loading events...
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No events found for the selected filters.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Schedule Type</TableHead>
          <TableHead>Cycle</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Assigned</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {events.map((event) => (
          <TableRow key={event.id}>
            <TableCell className="font-medium">
              {format(new Date(event.date + 'T00:00:00'), 'MMM dd, yyyy')}
            </TableCell>
            <TableCell>{getDefinitionName(event.definitionId)}</TableCell>
            <TableCell>Cycle {event.cycleNumber}</TableCell>
            <TableCell>
              <Badge variant={getStatusColor(event.status)}>
                {event.status}
              </Badge>
              {event.isHolidaySkipped && (
                <Badge variant="outline" className="ml-2">
                  Holiday
                </Badge>
              )}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {event.assignments?.length || 0}
              </div>
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>View Details</DropdownMenuItem>
                  <DropdownMenuItem>Manage Assignments</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
