'use client';

import { SwapRequestList } from '@/components/schedules/swap-request-list';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { scheduleSwapApi } from '@/shared/lib/api/schedule.api';
import type {
  ScheduleSwapRequest,
  SwapRequestStatus,
} from '@/shared/types/schedule.types';
import { AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function SwapRequestsPage() {
  const [swapRequests, setSwapRequests] = useState<ScheduleSwapRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<SwapRequestStatus | 'all'>(
    'pending',
  );

  const loadSwapRequests = async (status?: SwapRequestStatus) => {
    try {
      setLoading(true);
      const params = status ? { status } : undefined;
      const data = await scheduleSwapApi.getAll(params);
      setSwapRequests(data);
    } catch (error) {
      console.error('Failed to load swap requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'all') {
      loadSwapRequests();
    } else {
      loadSwapRequests(activeTab as SwapRequestStatus);
    }
  }, [activeTab]);

  const pendingCount = swapRequests.filter(
    (r) => r.status === 'pending',
  ).length;
  const approvedCount = swapRequests.filter(
    (r) => r.status === 'approved',
  ).length;
  const rejectedCount = swapRequests.filter(
    (r) => r.status === 'rejected',
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Swap Requests</h1>
        <p className="text-muted-foreground">
          Review and manage schedule swap requests from staff
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedCount}</div>
            <p className="text-xs text-muted-foreground">Approved requests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rejectedCount}</div>
            <p className="text-xs text-muted-foreground">Rejected requests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{swapRequests.length}</div>
            <p className="text-xs text-muted-foreground">All requests</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Swap Requests</CardTitle>
          <CardDescription>
            Review and approve/reject schedule swap requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList>
              <TabsTrigger value="pending">
                Pending {pendingCount > 0 && `(${pendingCount})`}
              </TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              <SwapRequestList
                requests={swapRequests}
                loading={loading}
                onUpdate={() =>
                  loadSwapRequests(
                    activeTab === 'all'
                      ? undefined
                      : (activeTab as SwapRequestStatus),
                  )
                }
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
