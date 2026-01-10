'use client';

import { CycleCard } from '@/components/opentalk/cycle-card';
import { SlideDialog } from '@/components/opentalk/slide-dialog';
import { hasPermission, PERMISSIONS } from '@/shared/auth/permissions';
import { useAuth } from '@/shared/contexts/auth-context';
import { opentalkClientService } from '@/shared/services/client/opentalk-client-service';
import { swapRequestClientService } from '@/shared/services/client/swap-request-client-service';
import {
  IOpentalkEventMetadata,
  ScheduleCycle,
  ScheduleEvent,
  ScheduleType,
  SwapRequestStatus,
} from '@qnoffice/shared';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { SwapControls } from './swap-controls';

interface OpentalkSpreadsheetViewProps {
  cycles: ScheduleCycle<IOpentalkEventMetadata>[];
}

export function OpentalkSpreadsheetView({
  cycles = [],
}: OpentalkSpreadsheetViewProps) {
  const { user } = useAuth();
  const [editingTopic, setEditingTopic] = useState<number | null>(null);
  const [editedTopicValue, setEditedTopicValue] = useState<string>('');
  const [slideDialogOpen, setSlideDialogOpen] = useState(false);
  const [selectedEventForSlide, setSelectedEventForSlide] =
    useState<ScheduleEvent<IOpentalkEventMetadata> | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<number[]>([]);
  const [lockedEvents, setLockedEvents] = useState<number[]>([]);
  const [isSwapping, setIsSwapping] = useState(false);

  useEffect(() => {
    const fetchPendingRequests = async () => {
      try {
        const response = await swapRequestClientService.getSwapRequests({
          type: ScheduleType.OPENTALK,
          status: SwapRequestStatus.PENDING,
        });

        if (response?.data?.data) {
          const locked = response.data.data.flatMap((req) => [
            req.fromEventId,
            req.toEventId,
          ]);
          setLockedEvents(locked);
        }
      } catch (error) {
        console.error('Failed to fetch pending requests:', error);
      }
    };

    fetchPendingRequests();
  }, []);

  const userStaffId = user?.staffId;
  const canManageOpentalk = hasPermission(
    user?.role,
    PERMISSIONS.MANAGE_OPENTALK,
  );

  const canEditTopic = (event: ScheduleEvent<IOpentalkEventMetadata>) => {
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

  const canEditSlide = (event: ScheduleEvent<IOpentalkEventMetadata>) => {
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

  const handleSelectEvent = (eventId: number) => {
    if (lockedEvents.includes(eventId)) {
      toast.error('Sự kiện này đang có yêu cầu đổi lịch chờ duyệt');
      return;
    }

    // Find the event first to validate
    let targetEvent: ScheduleEvent<IOpentalkEventMetadata> | undefined;
    for (const cycle of cycles) {
      const found = cycle.events?.find((e) => e.id === eventId);
      if (found) {
        targetEvent = found;
        break;
      }
    }

    if (targetEvent) {
      const isPast = new Date(targetEvent.eventDate).getTime() < Date.now();
      if (
        isPast ||
        targetEvent.status === 'COMPLETED' ||
        targetEvent.status === 'CANCELLED'
      ) {
        toast.error('Không thể chọn sự kiện đã kết thúc hoặc trong quá khứ');
        return;
      }
    }

    if (selectedEvents.includes(eventId)) {
      setSelectedEvents(selectedEvents.filter((id) => id !== eventId));
    } else {
      if (selectedEvents.length >= 2) {
        toast.error('Chỉ được chọn tối đa 2 sự kiện để đổi lịch');
        return;
      }

      // Check if same cycle
      if (selectedEvents.length === 1 && targetEvent) {
        const firstEventId = selectedEvents[0];
        // Find first event to check cycleId
        let firstEvent: ScheduleEvent | undefined;
        for (const cycle of cycles) {
          const e1 = cycle.events?.find((e) => e.id === firstEventId);
          if (e1) {
            firstEvent = e1;
            break;
          }
        }

        if (
          firstEvent &&
          targetEvent &&
          firstEvent.cycleId !== targetEvent.cycleId
        ) {
          toast.error(
            'Chỉ được đổi lịch giữa các sự kiện trong cùng một chu kỳ',
          );
          return;
        }
      }

      setSelectedEvents([...selectedEvents, eventId]);
    }
  };

  const handleClearSelection = () => {
    setSelectedEvents([]);
  };

  const handleSwapEvents = async () => {
    if (selectedEvents.length !== 2) return;

    setIsSwapping(true);
    try {
      await opentalkClientService.swapEvents({
        event1Id: selectedEvents[0],
        event2Id: selectedEvents[1],
      });
      toast.success('Đổi lịch thành công');
      window.location.reload();
    } catch (error) {
      console.error('Swap failed:', error);
      toast.error('Đổi lịch thất bại');
    } finally {
      setIsSwapping(false);
    }
  };

  const handleSlideClick = (
    event: ScheduleEvent<IOpentalkEventMetadata>,
  ) => {
    setSelectedEventForSlide(event);
    setSlideDialogOpen(true);
  };

  const sortedCycles = useMemo(() => {
    return [...cycles].sort((a, b) => {
      // Helper to get latest event timestamp
      const getLatestEventTime = (cycle: typeof a) => {
        if (!cycle.events?.length)
          return new Date(cycle.createdAt).getTime();
        return Math.max(
          ...cycle.events.map((e) => new Date(e.eventDate).getTime()),
        );
      };

      const timeA = getLatestEventTime(a);
      const timeB = getLatestEventTime(b);

      // Sort ASC: Earlier cycles first
      return timeA - timeB;
    });
  }, [cycles]);

  return (
    <div className="h-[calc(100vh-240px)] flex flex-col">
      <div className="flex-1 overflow-y-auto pr-4 space-y-6">
        {sortedCycles.map((cycle) => (
          <CycleCard
            key={cycle.id}
            cycle={cycle}
            editingTopic={editingTopic}
            editedTopicValue={editedTopicValue}
            selectedEvents={selectedEvents}
            canManageOpentalk={canManageOpentalk}
            canEditTopic={canEditTopic}
            canEditSlide={canEditSlide}
            onTopicEdit={handleTopicEdit}
            onTopicSave={handleTopicSave}
            onTopicCancel={handleTopicCancel}
            onTopicChange={setEditedTopicValue}
            onSlideClick={handleSlideClick}
            onSelectEvent={handleSelectEvent}
            formatDate={formatDate}
            lockedEvents={lockedEvents}
          />
        ))}
      </div>

      <SwapControls
        selectedCount={selectedEvents.length}
        isSwapping={isSwapping}
        onSwap={handleSwapEvents}
        onClear={handleClearSelection}
      />

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
  );
}
