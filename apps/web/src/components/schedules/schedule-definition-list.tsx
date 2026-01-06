'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { scheduleDefinitionApi } from '@/shared/lib/api/schedule.api';
import type { ScheduleDefinition } from '@/shared/types/schedule.types';
import { Edit, MoreHorizontal, Power, PowerOff, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface ScheduleDefinitionListProps {
  definitions: ScheduleDefinition[];
  loading: boolean;
  onUpdate: () => void;
}

export function ScheduleDefinitionList({
  definitions,
  loading,
  onUpdate,
}: ScheduleDefinitionListProps) {
  const [processing, setProcessing] = useState<number | null>(null);

  const handleToggleActive = async (id: number) => {
    try {
      setProcessing(id);
      await scheduleDefinitionApi.toggleActive(id);
      onUpdate();
    } catch (error) {
      console.error('Failed to toggle schedule:', error);
      alert('Failed to toggle schedule status');
    } finally {
      setProcessing(null);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      setProcessing(id);
      await scheduleDefinitionApi.delete(id);
      onUpdate();
    } catch (error) {
      console.error('Failed to delete schedule:', error);
      alert('Failed to delete schedule');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">Loading...</div>
    );
  }

  if (definitions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No schedule types configured yet. Create your first schedule type to get
        started.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Code</TableHead>
          <TableHead>Strategy</TableHead>
          <TableHead>People/Slot</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {definitions.map((def) => (
          <TableRow key={def.id}>
            <TableCell className="font-medium">
              {def.name}
              {def.description && (
                <div className="text-xs text-muted-foreground">
                  {def.description}
                </div>
              )}
            </TableCell>
            <TableCell>
              <code className="text-xs bg-muted px-2 py-1 rounded">
                {def.code}
              </code>
            </TableCell>
            <TableCell className="capitalize">
              {def.strategy.replace('_', ' ')}
            </TableCell>
            <TableCell>{def.requiredPeoplePerSlot}</TableCell>
            <TableCell>
              {def.isActive ? (
                <Badge variant="default">Active</Badge>
              ) : (
                <Badge variant="secondary">Inactive</Badge>
              )}
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={processing === def.id}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleToggleActive(def.id)}>
                    {def.isActive ? (
                      <>
                        <PowerOff className="mr-2 h-4 w-4" />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <Power className="mr-2 h-4 w-4" />
                        Activate
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => handleDelete(def.id, def.name)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
