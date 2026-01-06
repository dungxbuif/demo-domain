import { opentalkServerService } from '@/shared/lib/server/opentalk-server-service';
import { OpentalkPageClient } from './page-client';

export default async function OpentalkPage() {
  let cycles = [];
  let error = null;

  try {
    const cyclesData = await opentalkServerService.getCycles();

    cycles = Array.isArray(cyclesData) ? cyclesData : [];
  } catch (err) {
    console.error('Failed to load opentalk data:', err);
    error = 'Failed to load opentalk data';
  }

  return <OpentalkPageClient cycles={cycles} error={error} />;
}
