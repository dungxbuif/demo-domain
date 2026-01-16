'use client';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { swapRequestClientService } from '@/shared/services/client/swap-request-client-service';
import { formatDateVN } from '@/shared/utils';
import {
    ICreateSwapRequestDto,
    ScheduleEvent,
    ScheduleType,
} from '@qnoffice/shared';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface CreateSwapRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scheduleId: number;
  onSuccess?: () => void;
  lockedEventIds?: number[];
}

export function CreateSwapRequestModal({
  open,
  onOpenChange,
  scheduleId,
  onSuccess,
  lockedEventIds = [],
}: CreateSwapRequestModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [availableEvents, setAvailableEvents] = useState<ScheduleEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);
  const [reason, setReason] = useState('');

  const fetchAvailableEvents = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/opentalk/events/${scheduleId}/cycle-events`,
      );
      if (response.ok) {
        const data = await response.json();
        setAvailableEvents(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching available events for swap:', error);
      toast.error('Không thể tải danh sách sự kiện');
    }
  }, [scheduleId]);

  useEffect(() => {
    if (open) {
      fetchAvailableEvents();
      setReason('');
      setSelectedEvent(null);
    }
  }, [open, fetchAvailableEvents]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedEvent) {
      toast.error('Vui lòng chọn sự kiện để đổi');
      return;
    }

    setIsLoading(true);

    try {
      const requestData: ICreateSwapRequestDto = {
        fromEventId: scheduleId,
        toEventId: selectedEvent,
        reason: reason,
        type: ScheduleType.OPENTALK,
      };

      await swapRequestClientService.createSwapRequest(requestData);

      toast.success('Tạo yêu cầu đổi lịch thành công');
      setReason('');
      setSelectedEvent(null);
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error creating swap request:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gửi yêu cầu đổi lịch</DialogTitle>
          <DialogDescription>
            Chọn lịch OpenTalk mà bạn muốn đổi.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="targetEvent">Đổi với sự kiện</Label>
              <Select
                value={selectedEvent?.toString() || ''}
                onValueChange={(value) => setSelectedEvent(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn sự kiện để đổi" />
                </SelectTrigger>
                <SelectContent>
                  {availableEvents.map((event) => {
                    const isLocked = lockedEventIds.includes(event.id);
                    return (
                      <SelectItem
                        key={event.id}
                        value={event.id.toString()}
                        disabled={isLocked}
                      >
                        {event.title || 'Lịch OpenTalk'} -{' '}
                        {formatDateVN(event.eventDate)}
                        {event.eventParticipants &&
                          event.eventParticipants.length > 0 && (
                            <span className="text-muted-foreground ml-2">
                              (
                              {event.eventParticipants
                                .map(
                                  (ep) =>
                                    ep.staff?.user?.name || ep.staff?.email,
                                )
                                .join(', ')}
                              )
                            </span>
                          )}
                        {isLocked ? ' (Chờ duyệt)' : ''}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Lý do</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Giải thích lý do bạn cần đổi lịch..."
                rows={4}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading || !selectedEvent}>
              {isLoading ? 'Đang gửi...' : 'Gửi yêu cầu'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
