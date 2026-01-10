import { OpentalkSwapsManagementClient } from '@/components/management/opentalk-swaps-management-client';
import { swapRequestServerService } from '@/shared/services/server/swap-request-server-service';
import { ScheduleType } from '@qnoffice/shared';

export default async function OpentalkSwapsManagementPage() {
  const swapRequests = await swapRequestServerService.getSwapRequests({
    type: ScheduleType.OPENTALK,
  });

  return <OpentalkSwapsManagementClient initialData={swapRequests} />;
}
