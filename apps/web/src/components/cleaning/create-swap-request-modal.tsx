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
}

export function CreateSwapRequestModal({
  open,
  onOpenChange,
  scheduleId,
  onSuccess,
}: CreateSwapRequestModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [availableEvents, setAvailableEvents] = useState<ScheduleEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);
  const [reason, setReason] = useState('');

  const fetchAvailableEvents = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/cleaning/events/${scheduleId}/cycle-events`,
      );
      if (response.ok) {
        const data = await response.json();
        setAvailableEvents(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching available events for swap:', error);
      toast.error('Failed to load available events');
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
      toast.error('Please select an event to swap to');
      return;
    }

    setIsLoading(true);

    try {
      const requestData: ICreateSwapRequestDto = {
        fromEventId: scheduleId,
        toEventId: selectedEvent,
        reason: reason,
        type: ScheduleType.CLEANING,
      };

      await swapRequestClientService.createSwapRequest(requestData);

      toast.success('Swap request created successfully');
      setReason('');
      setSelectedEvent(null);
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error creating swap request:', error);
      toast.error('Failed to create swap request');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request Schedule Swap</DialogTitle>
          <DialogDescription>
            Select which cleaning event you&apos;d like to swap your schedule
            with
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="targetEvent">Swap with Event</Label>
              <Select
                value={selectedEvent?.toString() || ''}
                onValueChange={(value) => setSelectedEvent(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select event to swap with" />
                </SelectTrigger>
                <SelectContent>
                  {availableEvents.map((event) => (
                    <SelectItem key={event.id} value={event.id.toString()}>
                      {event.title || 'Cleaning'} -{' '}
                      {new Date(event.eventDate).toLocaleDateString()}
                      {event.eventParticipants &&
                        event.eventParticipants.length > 0 && (
                          <span className="text-muted-foreground ml-2">
                            (
                            {event.eventParticipants
                              .map(
                                (ep) => ep.staff?.user?.name || ep.staff?.email,
                              )
                              .join(', ')}
                            )
                          </span>
                        )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain why you need to swap your schedule..."
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
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !selectedEvent}>
              {isLoading ? 'Submitting...' : 'Submit Request'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
