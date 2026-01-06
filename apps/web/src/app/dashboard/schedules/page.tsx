'use client';

import { CreateScheduleDefinitionDialog } from '@/components/schedules/create-schedule-definition-dialog';
import { ScheduleDefinitionList } from '@/components/schedules/schedule-definition-list';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { scheduleDefinitionApi } from '@/shared/lib/api/schedule.api';
import type { ScheduleDefinition } from '@/shared/types/schedule.types';
import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function SchedulesPage() {
  const [definitions, setDefinitions] = useState<ScheduleDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const loadDefinitions = async () => {
    try {
      setLoading(true);
      const data = await scheduleDefinitionApi.getAll();
      setDefinitions(data);
    } catch (error) {
      console.error('Failed to load schedule definitions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDefinitions();
  }, []);

  const handleCreated = () => {
    setCreateDialogOpen(false);
    loadDefinitions();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Schedule Management
          </h1>
          <p className="text-muted-foreground">
            Configure and manage schedule types for your organization
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Schedule Type
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Schedule Types</CardTitle>
            <CardDescription>All configured schedules</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{definitions.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Schedules</CardTitle>
            <CardDescription>Currently active</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {definitions.filter((d) => d.isActive).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inactive Schedules</CardTitle>
            <CardDescription>Disabled schedules</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {definitions.filter((d) => !d.isActive).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Schedule Types</CardTitle>
          <CardDescription>
            Manage different types of schedules (Cleaning, Open Talk, etc.)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScheduleDefinitionList
            definitions={definitions}
            loading={loading}
            onUpdate={loadDefinitions}
          />
        </CardContent>
      </Card>

      <CreateScheduleDefinitionDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreated={handleCreated}
      />
    </div>
  );
}
