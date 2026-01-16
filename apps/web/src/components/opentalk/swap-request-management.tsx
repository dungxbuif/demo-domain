'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/shared/contexts/auth-context';
import {
  opentalkClientService,
  OpentalkEvent,
} from '@/shared/services/client/opentalk-client-service';
import { swapRequestClientService } from '@/shared/services/client/swap-request-client-service';
import { formatDateVN } from '@/shared/utils';
import {
  ScheduleType,
  SwapRequest,
  SwapRequestStatus
} from '@qnoffice/shared';
import { Plus } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { CreateSwapRequestModal } from './create-swap-request-modal';
import { SwapRequestTable } from './swap-request-table';


export function SwapRequestManagement() {
  const { user  } = useAuth();
  const [swapRequests, setSwapRequests] = useState<SwapRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(
    null,
  );
  const [userSchedules, setUserSchedules] = useState<OpentalkEvent[]>([]);
  const [isProcessing, setIsProcessing] = useState<number | null>(null);

  const userStaffId = user?.staffId;

  const lockedEventIds = useMemo(() => {
    return swapRequests
      .filter((req) => req.status === SwapRequestStatus.PENDING)
      .flatMap((req) => [req.fromEventId, req.toEventId]);
  }, [swapRequests]);

  const loadSwapRequests = useCallback(async () => {
    try {
      setIsLoading(true);

      const response = await swapRequestClientService.getSwapRequests({
        type: ScheduleType.OPENTALK,
      });
      setSwapRequests(response?.data?.data || []);

      if ( userStaffId) {
        try {
          const schedules =
            await opentalkClientService.getUserSchedules(userStaffId);
          console.log('Loaded schedules:', schedules);
          setUserSchedules(schedules);
        } catch (error) {
          console.error('Failed to load user schedules:', error);
        }
      }
    } catch (error) {
      console.error('Failed to load swap requests:', error);
      toast.error('Không thể tải danh sách yêu cầu đổi lịch');
    } finally {
      setIsLoading(false);
    }
  }, [userStaffId]);

  useEffect(() => {
    if (user?.staffId) {
      loadSwapRequests();
    }
  }, [user?.staffId, loadSwapRequests]);


  const handleReviewRequest = async (
    requestId: number,
    action: SwapRequestStatus,
  ) => {
    setIsProcessing(requestId);
    try {
      await swapRequestClientService.reviewSwapRequest(requestId, {
        status: action,
        reviewNote:
          action === SwapRequestStatus.APPROVED ? 'Đã duyệt' : 'Từ chối',
      });

      toast.success(
        `Yêu cầu đã được ${
          action === SwapRequestStatus.APPROVED ? 'duyệt' : 'từ chối'
        } thành công`,
      );
      await loadSwapRequests();
    } catch (error) {
      console.error('Failed to review request:', error);
      toast.error('Không thể duyệt yêu cầu');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleCreateSuccess = async () => {
    setCreateModalOpen(false);
    setSelectedScheduleId(null);
    await loadSwapRequests();
  };

  const filteredRequests = swapRequests.filter((req) => req.requesterId === user?.staffId);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="animate-spin h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-2">Loading requests...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          {'Tất cả yêu cầu đổi lịch'}
        </h2>
        {(
          <>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">
                Đang tải lịch của bạn...
              </p>
            ) : userSchedules.length > 0 ? (
              <div className="flex items-center space-x-2">
                <Select
                  value={selectedScheduleId?.toString() || ''}
                  onValueChange={(value) =>
                    setSelectedScheduleId(parseInt(value))
                  }
                >
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Chọn lịch trực để đổi" />
                  </SelectTrigger>
                  <SelectContent>
                    {userSchedules.map((schedule) => {
                      const isLocked = lockedEventIds.includes(schedule.id);
                      return (
                        <SelectItem
                          key={schedule.id}
                          value={schedule.id.toString()}
                          disabled={isLocked}
                        >
                          {schedule.title || 'Lịch OpenTalk'} -{' '}
                          {formatDateVN(schedule.eventDate)}
                          {isLocked ? ' (Chờ duyệt)' : ''}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => setCreateModalOpen(true)}
                  disabled={!selectedScheduleId}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tạo yêu cầu
                </Button>
              </div>
            ) : (
              // ...
              <div className="text-sm text-muted-foreground">
                <p>Bạn không có lịch OpenTalk nào để đổi.</p>
                <p className="text-xs mt-1">
             Số lịch: {userSchedules.length}
                </p>
              </div>
            )}

            {selectedScheduleId && (
              <CreateSwapRequestModal
                open={createModalOpen}
                onOpenChange={setCreateModalOpen}
                scheduleId={selectedScheduleId}
                onSuccess={handleCreateSuccess}
                lockedEventIds={lockedEventIds}
              />
            )}
          </>
        )}
      </div>

      <SwapRequestTable
        requests={filteredRequests}
        onReview={handleReviewRequest}
        isProcessingId={isProcessing}
      />
    </div>
  );
}
