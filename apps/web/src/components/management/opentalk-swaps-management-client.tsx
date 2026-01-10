'use client';

import { SwapRequestTable } from '@/components/opentalk/swap-request-table';
import { PERMISSIONS, ProtectedComponent } from '@/shared/auth';
import { swapRequestClientService } from '@/shared/services/client/swap-request-client-service';
import { SwapRequest, SwapRequestStatus } from '@qnoffice/shared';
import { useState } from 'react';
import { toast } from 'sonner';

interface OpentalkSwapsManagementClientProps {
  initialData: SwapRequest[];
}

export function OpentalkSwapsManagementClient({
  initialData = [],
}: OpentalkSwapsManagementClientProps) {
  const [requests, setRequests] = useState<SwapRequest[]>(initialData);
  const [isProcessing, setIsProcessing] = useState<number | null>(null);

  const pendingCount = requests.filter(
    (r) => r.status === SwapRequestStatus.PENDING,
  ).length;

  const handleReview = async (id: number, status: SwapRequestStatus) => {
    setIsProcessing(id);
    try {
      await swapRequestClientService.reviewSwapRequest(id, {
        status,
        reviewNote:
          status === SwapRequestStatus.APPROVED ? 'Approved' : 'Rejected',
      });

      setRequests((prev) =>
        prev.map((req) => (req.id === id ? { ...req, status } : req)),
      );

      toast.success(
        status === SwapRequestStatus.APPROVED
          ? 'Đã phê duyệt yêu cầu'
          : 'Đã từ chối yêu cầu',
      );
    } catch (error) {
      console.error(error);
      toast.error('Có lỗi xảy ra khi xử lý yêu cầu');
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <ProtectedComponent permission={PERMISSIONS.MANAGE_OPENTALK_SWAP_REQUESTS}>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Yêu cầu đổi lịch OpenTalk</h1>
            <p className="text-muted-foreground">
              Xem xét và phê duyệt/từ chối yêu cầu đổi lịch OpenTalk
            </p>
          </div>
          <div className="flex gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {pendingCount}
              </div>
              <div className="text-muted-foreground">Chờ duyệt</div>
            </div>
          </div>
        </div>

        <SwapRequestTable
          requests={requests}
          onReview={handleReview}
          isProcessingId={isProcessing}
        />
      </div>
    </ProtectedComponent>
  );
}
