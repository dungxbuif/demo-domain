'use client';

import { CleaningSpreadsheetView } from '@/components/cleaning/cleaning-spreadsheet-view';
import { SwapRequestManagement } from '@/components/cleaning/swap-request-management';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { hasPermission, PERMISSIONS } from '@/shared/auth/permissions';
import { useAuth } from '@/shared/contexts/auth-context';
import { useEffect } from 'react';
import { toast } from 'sonner';

interface CleaningPageClientProps {
  cycles: any[];
  error?: string | null;
}

export function CleaningPageClient({ cycles, error }: CleaningPageClientProps) {
  const { user } = useAuth();

  const canApproveRequests = hasPermission(
    user?.role,
    PERMISSIONS.APPROVE_CLEANING_SWAP_REQUESTS,
  );

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const events = cycles.flatMap((cycle) => cycle.events || []);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="schedules" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="schedules">Schedule Management</TabsTrigger>
          <TabsTrigger value="requests">Swap Requests</TabsTrigger>
          {canApproveRequests && (
            <TabsTrigger value="approval">GDVP Approval</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="schedules" className="space-y-4">
          <CleaningSpreadsheetView events={events} cycles={cycles} />
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <SwapRequestManagement mode="user" user={user || undefined} />
        </TabsContent>

        {canApproveRequests && (
          <TabsContent value="approval" className="space-y-4">
            <SwapRequestManagement mode="hr" user={user} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
