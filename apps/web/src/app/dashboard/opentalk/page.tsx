'use client';

import { OpentalkSpreadsheetView } from '@/components/opentalk/opentalk-spreadsheet-view';
import { SwapRequestManagement } from '@/components/opentalk/swap-request-management';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/shared/contexts/auth-context';
import { hasPermission, PERMISSIONS } from '@/shared/lib/auth/permissions';
import { opentalkClientService } from '@/shared/lib/client/opentalk-client-service';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function OpentalkPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [cycles, setCycles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const canManageRequests = hasPermission(
    user?.role,
    PERMISSIONS.MANAGE_OPENTALK_SWAP_REQUESTS,
  );
  const canApproveRequests = hasPermission(
    user?.role,
    PERMISSIONS.APPROVE_OPENTALK_SWAP_REQUESTS,
  );

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [eventsData, cyclesData] = await Promise.all([
        opentalkClientService.getEvents(),
        opentalkClientService.getCycles(),
      ]);
      setEvents(Array.isArray(eventsData) ? eventsData : []);
      setCycles(Array.isArray(cyclesData) ? cyclesData : []);
    } catch (error) {
      console.error('Failed to load opentalk data:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">
          OpenTalk Management
        </h1>
        <div className="text-sm text-muted-foreground">
          {events.length} events • {cycles.length} cycles
        </div>
      </div>

      <Tabs defaultValue="schedules" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="schedules">Schedule Management</TabsTrigger>
          <TabsTrigger value="requests">Swap Requests</TabsTrigger>
          {canApproveRequests && (
            <TabsTrigger value="approval">GDVP Approval</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="schedules" className="space-y-4">
          <OpentalkSpreadsheetView
            events={events}
            cycles={cycles}
            user={user}
          />
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <SwapRequestManagement mode="user" user={user} />
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
