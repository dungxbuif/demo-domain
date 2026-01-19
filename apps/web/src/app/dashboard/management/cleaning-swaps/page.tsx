import { CleaningSwapsManagementClient } from '@/components/management/cleaning-swaps-management-client';
import { swapRequestServerService } from '@/shared/services/server/swap-request-server-service';
import { ScheduleType } from '@qnoffice/shared';

export default async function CleaningSwapsManagementPage() {
  const swapRequests = await swapRequestServerService.getSwapRequests({
    type: ScheduleType.CLEANING,
  });

  return <CleaningSwapsManagementClient initialData={swapRequests} />;
}
