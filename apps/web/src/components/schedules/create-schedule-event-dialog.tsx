'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { scheduleEventApi } from '@/shared/lib/api/schedule.api';
import { cn } from '@/shared/lib/utils';
import {
  CreateScheduleEventDto,
  ScheduleDefinition,
  ScheduleEventStatus,
} from '@/shared/types/schedule.types';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

interface CreateScheduleEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  definitions: ScheduleDefinition[];
  onCreated: () => void;
}

export function CreateScheduleEventDialog({
  open,
  onOpenChange,
  definitions,
  onCreated,
}: CreateScheduleEventDialogProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<CreateScheduleEventDto & { date: Date }>({
    defaultValues: {
      definitionId: 0,
      date: new Date(),
      cycleNumber: 1,
      status: ScheduleEventStatus.SCHEDULED,
      isHolidaySkipped: false,
      metadata: {},
    },
  });

  const onSubmit = async (data: CreateScheduleEventDto & { date: Date }) => {
    try {
      setLoading(true);
      const payload = {
        ...data,
        date: format(data.date, 'yyyy-MM-dd'),
      };
      await scheduleEventApi.create(payload);
      form.reset();
      onCreated();
    } catch (error) {
      console.error('Failed to create schedule event:', error);
      alert('Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Schedule Event</DialogTitle>
          <DialogDescription>
            Create a new scheduled event for a specific date
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="definitionId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Schedule Type *</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value ? String(field.value) : ''}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select schedule type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {definitions.map((def) => (
                        <SelectItem key={def.id} value={String(def.id)}>
                          {def.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date *</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground',
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'PPP')
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Select the date for this schedule event
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cycleNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cycle Number</FormLabel>
                  <FormControl>
                    <input
                      type="number"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      min={1}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    Cycle number for tracking schedule rotation
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Event'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
