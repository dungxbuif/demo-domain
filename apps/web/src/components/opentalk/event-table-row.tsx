'use client';

import { TopicEditControls } from '@/components/opentalk/topic-edit-controls';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { getStatusBadgeProps } from '@/shared/utils';
import { IOpentalkEventMetadata, ScheduleEvent } from '@qnoffice/shared';
import { Calendar, FileText, User } from 'lucide-react';

import { Checkbox } from '@/components/ui/checkbox';

interface EventTableRowProps {
  event: ScheduleEvent<IOpentalkEventMetadata>;
  isEditingTopic: boolean;
  editedTopicValue: string;
  canEditTopic: boolean;
  canEditSlide: boolean;
  canManageOpentalk: boolean;
  isSelected: boolean;
  onTopicEdit: (topic: string) => void;
  onTopicSave: () => void;
  onTopicCancel: () => void;
  onTopicChange: (value: string) => void;
  onSlideClick: () => void;
  onSelect: (checked: boolean) => void;
  formatDate: (date: string) => string;
  isLocked?: boolean;
}

export function EventTableRow({
  event,
  isEditingTopic,
  editedTopicValue,
  canEditTopic,
  canEditSlide,
  canManageOpentalk,
  isSelected,
  onTopicEdit,
  onTopicSave,
  onTopicCancel,
  onTopicChange,
  onSlideClick,
  onSelect,
  formatDate,
  isLocked = false,
}: EventTableRowProps) {
  const renderPresenter = () => {
    if (event.eventParticipants && event.eventParticipants.length > 0) {
      const presenters = event.eventParticipants
        .map((ep) => {
          if (ep.staff?.email) return ep.staff.email;
          if (ep.staff?.user?.email) return ep.staff.user.email;
          if (ep.staff?.id) return `Staff ${ep.staff.id}`;
          if (ep.staffId) return `Staff ${ep.staffId}`;
          return 'Unknown Staff';
        })
        .filter(Boolean);

      if (presenters.length > 0) {
        return presenters.join(', ');
      }
    }

    return 'Unassigned';
  };

  const isPast = new Date(event.eventDate).getTime() < new Date().getTime();
  const isCompleted =
    event.status === 'COMPLETED' || event.status === 'CANCELLED';
  const isCheckboxDisabled = isLocked || isPast || isCompleted;

  return (
    <TableRow
      className={`hover:bg-muted/50 ${isSelected ? 'bg-muted/50' : ''} ${
        isCheckboxDisabled ? 'opacity-60 bg-gray-50' : ''
      }`}
    >
      {canManageOpentalk && (
        <TableCell className="w-[50px]">
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onSelect(checked as boolean)}
            disabled={isCheckboxDisabled}
          />
        </TableCell>
      )}
      <TableCell>
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">
            {formatDate(event.eventDate)}
          </span>
        </div>
      </TableCell>
      <TableCell>
        {isEditingTopic ? (
          <TopicEditControls
            value={editedTopicValue}
            onChange={onTopicChange}
            onSave={onTopicSave}
            onCancel={onTopicCancel}
          />
        ) : (
          <div
            className={`cursor-pointer hover:bg-muted/50 p-1 rounded ${
              canEditTopic ? 'hover:bg-blue-50' : ''
            }`}
            onClick={(e) => {
              e.stopPropagation();
              if (canEditTopic) {
                onTopicEdit(event.title);
              }
            }}
          >
            <span className="font-medium">{event.title || 'No topic set'}</span>
            {canEditTopic && (
              <span className="text-xs text-muted-foreground ml-1">
                (click to edit)
              </span>
            )}
          </div>
        )}
      </TableCell>
      <TableCell>
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{renderPresenter()}</span>
        </div>
      </TableCell>
      <TableCell>
        <Badge {...getStatusBadgeProps(event.status)} />
      </TableCell>
      <TableCell>
        <Button size="sm" variant="outline" onClick={onSlideClick}>
          <FileText className="h-4 w-4 mr-1" />
          {canEditSlide ? 'Update' : 'View'}
        </Button>
      </TableCell>
    </TableRow>
  );
}
