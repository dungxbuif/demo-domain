'use client';

import { CycleCard } from '@/components/opentalk/cycle-card';
import { SlideDialog } from '@/components/opentalk/slide-dialog';
import { hasPermission, PERMISSIONS } from '@/shared/auth/permissions';
import { useAuth } from '@/shared/contexts/auth-context';
import { opentalkClientService } from '@/shared/services/client/opentalk-client-service';
import {
  IOpentalEventMetadata,
  ScheduleCycle,
  ScheduleEvent,
} from '@qnoffice/shared';
import { useState } from 'react';
import { toast } from 'sonner';

interface OpentalkSpreadsheetViewProps {
  cycles: ScheduleCycle<IOpentalEventMetadata>[];
}

export function OpentalkSpreadsheetView({
  cycles = [],
}: OpentalkSpreadsheetViewProps) {
  const { user } = useAuth();
  const [editingTopic, setEditingTopic] = useState<number | null>(null);
  const [editedTopicValue, setEditedTopicValue] = useState<string>('');
  const [slideDialogOpen, setSlideDialogOpen] = useState(false);
  const [selectedEventForSlide, setSelectedEventForSlide] =
    useState<ScheduleEvent<IOpentalEventMetadata> | null>(null);
  const userStaffId = user?.staffId;

  const canEditTopic = (event: ScheduleEvent<IOpentalEventMetadata>) => {
    if (event.status === 'COMPLETED') {
      return false;
    }

    if (hasPermission(user?.role, PERMISSIONS.EDIT_OPENTALK_TOPIC)) {
      return true;
    }

    const userIsOrganizer = event.eventParticipants?.some(
      (participant) => participant.staffId === userStaffId,
    );
    return userIsOrganizer || false;
  };

  const canEditSlide = (event: ScheduleEvent<IOpentalEventMetadata>) => {
    const userIsPresenter = event.eventParticipants?.some(
      (participant) => participant.staffId === userStaffId,
    );
    return userIsPresenter || false;
  };

  const handleTopicEdit = (eventId: number, currentTopic: string) => {
    setEditingTopic(eventId);
    setEditedTopicValue(currentTopic || '');
  };

  const handleTopicSave = async (eventId: number) => {
    try {
      await opentalkClientService.updateEvent(eventId, {
        title: editedTopicValue,
      });
      toast.success('Topic updated successfully');
      setEditingTopic(null);
      window.location.reload();
    } catch (error) {
      toast.error('Failed to update topic');
      console.error(error);
    }
  };

  const handleTopicCancel = () => {
    setEditingTopic(null);
    setEditedTopicValue('');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleSlideClick = (event: ScheduleEvent<IOpentalEventMetadata>) => {
    setSelectedEventForSlide(event);
    setSlideDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        {cycles.map((cycle) => (
          <CycleCard
            key={cycle.id}
            cycle={cycle}
            editingTopic={editingTopic}
            editedTopicValue={editedTopicValue}
            canEditTopic={canEditTopic}
            canEditSlide={canEditSlide}
            onTopicEdit={handleTopicEdit}
            onTopicSave={handleTopicSave}
            onTopicCancel={handleTopicCancel}
            onTopicChange={setEditedTopicValue}
            onSlideClick={handleSlideClick}
            formatDate={formatDate}
          />
        ))}

        {selectedEventForSlide &&
          selectedEventForSlide.id &&
          canEditSlide(selectedEventForSlide) && (
            <SlideDialog
              mode="edit"
              canEdit={true}
              event={selectedEventForSlide}
              open={slideDialogOpen}
              onOpenChange={setSlideDialogOpen}
              onSuccess={() => window.location.reload()}
            />
          )}

        {selectedEventForSlide &&
          selectedEventForSlide.id &&
          !canEditSlide(selectedEventForSlide) && (
            <SlideDialog
              mode="view"
              canEdit={false}
              event={selectedEventForSlide}
              open={slideDialogOpen}
              onOpenChange={setSlideDialogOpen}
            />
          )}
      </div>
    </div>
  );
}
