import { CleaningPageClient } from '@/app/dashboard/schedules/cleaning/page-client';
import { cleaningServerService } from '@/shared/lib/server/cleaning-server-service';

export default async function CleaningPage() {
  let cycles = [];
  let error = null;

  try {
    const cyclesData = await cleaningServerService.getCycles();

    cycles = Array.isArray(cyclesData) ? cyclesData : [];
  } catch (err) {
    console.error('Failed to load cleaning data:', err);
    error = 'Failed to load cleaning data';
  }

  return <CleaningPageClient cycles={cycles} error={error} />;
}
