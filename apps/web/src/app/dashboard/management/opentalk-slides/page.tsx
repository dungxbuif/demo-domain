import { OpentalkSlidesManagementClient } from '@/components/management/opentalk-slides-management-client';
import { opentalkServerService } from '@/shared/services/server/opentalk-server-service';

export default async function OpentalkSlidesManagementPage() {
  // Server-side data fetching using existing service
  const events = await opentalkServerService.getEvents();

  return <OpentalkSlidesManagementClient events={events} />;
}
