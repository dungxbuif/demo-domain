import { CleaningSwapsManagementClient } from '@/components/management/cleaning-swaps-management-client';

export default async function CleaningSwapsManagementPage() {
  // TODO: Add server-side data fetching when cleaning swap requests endpoint is available
  // const swapRequests = await cleaningServerService.getSwapRequests();
  
  return <CleaningSwapsManagementClient />;
}
