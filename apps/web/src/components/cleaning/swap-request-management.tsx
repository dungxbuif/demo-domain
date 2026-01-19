'use client';

import { Badge } from '@/components/ui/badge';
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
  cleaningClientService,
  CleaningEvent,
} from '@/shared/services/client/cleaning-client-service';
import { swapRequestClientService } from '@/shared/services/client/swap-request-client-service';
import { formatDateVN } from '@/shared/utils';
import { ScheduleType, SwapRequest, SwapRequestStatus } from '@qnoffice/shared';
import { ArrowRightLeft, Calendar, Plus } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { CreateSwapRequestModal } from './create-swap-request-modal';

export function SwapRequestManagement() {
  const { user } = useAuth();
  const [swapRequests, setSwapRequests] = useState<SwapRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(
    null,
  );
  const [userSchedules, setUserSchedules] = useState<CleaningEvent[]>([]);

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
        type: ScheduleType.CLEANING,
      });
      setSwapRequests(response?.data?.data || []);

      if (userStaffId) {
        try {
          const schedulesResponse =
            await cleaningClientService.getUserSchedules(userStaffId);
          console.log('Schedules response:', schedulesResponse);
          const schedules =
            schedulesResponse?.data?.data || schedulesResponse?.data || [];
          console.log('Extracted schedules:', schedules);
          setUserSchedules(schedules);
        } catch (error) {
          console.error('Failed to load user schedules:', error);
        }
      }
    } catch (error) {
      console.error('Failed to load swap requests:', error);
      toast.error('Không thể tải yêu cầu đổi lịch');
    } finally {
      setIsLoading(false);
    }
  }, [userStaffId]);

  useEffect(() => {
    if (user?.staffId) {
      loadSwapRequests();
    }
  }, [user?.staffId, loadSwapRequests]);
  if (!user) {
    return (
      <div className="text-center text-muted-foreground py-8">
        Vui lòng đăng nhập để sử dụng chức năng này.
      </div>
    );
  }

  const handleCreateSuccess = async () => {
    setCreateModalOpen(false);
    setSelectedScheduleId(null);
    await loadSwapRequests();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRequests = swapRequests.filter(
    (req) => req.requesterId === user?.staffId,
  );

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="animate-spin h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-2">Đang tải yêu cầu...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Yêu cầu đổi lịch của tôi</h2>
        {
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
                          {schedule.title || 'Lịch trực nhật'} -{' '}
                          {formatDateVN(schedule.eventDate)}
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
                  Tạo yêu cầu đổi lịch
                </Button>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                <p>Bạn chưa có lịch trực nhật nào để đổi.</p>
                <p className="text-xs mt-1">
                  Mã người dùng: {user?.mezonId} | Số lịch:{' '}
                  {userSchedules.length}
                </p>
              </div>
            )}

            {selectedScheduleId && (
              <CreateSwapRequestModal
                open={createModalOpen}
                onOpenChange={setCreateModalOpen}
                scheduleId={selectedScheduleId}
                onSuccess={handleCreateSuccess}
                userStaffId={userStaffId}
              />
            )}
          </>
        }
      </div>

      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-muted-foreground">
                <ArrowRightLeft className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Bạn chưa gửi yêu cầu đổi lịch nào</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredRequests.map((request) => (
            <Card key={request.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center space-x-4">
                      <Badge className={getStatusColor(request.status)}>
                        {request.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {formatDateVN(request.createdAt)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center space-x-2 mb-2">
                          <Calendar className="h-4 w-4 text-blue-600" />
                          <span className="font-medium text-blue-900">
                            Lịch hiện tại của bạn
                          </span>
                        </div>
                        <p className="text-sm text-blue-800">
                          Ngày: {formatDateVN(request?.fromEvent?.eventDate)}
                        </p>
                        <p className="text-sm text-blue-700 mt-1">
                          Người tham gia:{' '}
                          {request?.fromEvent?.eventParticipants
                            ?.map((p) => p.staff?.user?.name || p.staff?.email)
                            .join(', ') || 'N/A'}
                        </p>
                      </div>

                      <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="flex items-center space-x-2 mb-2">
                          <Calendar className="h-4 w-4 text-purple-600" />
                          <span className="font-medium text-purple-900">
                            Lịch muốn đổi
                          </span>
                        </div>
                        <p className="text-sm text-purple-800">
                          Ngày: {formatDateVN(request?.toEvent?.eventDate)}
                        </p>
                        <p className="text-sm text-purple-700 mt-1">
                          Người tham gia:{' '}
                          {request?.toEvent?.eventParticipants
                            ?.map((p) => p.staff?.user?.name || p.staff?.email)
                            .join(', ') || 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-1">Lý do:</p>
                      <p className="text-sm text-muted-foreground">
                        {request.reason}
                      </p>
                    </div>

                    {request.reviewNote && (
                      <div>
                        <p className="text-sm font-medium mb-1">
                          Ghi chú duyệt:
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {request.reviewNote}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
