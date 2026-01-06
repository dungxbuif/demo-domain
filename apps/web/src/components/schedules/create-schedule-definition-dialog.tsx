'use client';

import { Button } from '@/components/ui/button';
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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { scheduleDefinitionApi } from '@/shared/lib/api/schedule.api';
import {
  CreateScheduleDefinitionDto,
  ScheduleStrategy,
} from '@/shared/types/schedule.types';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

interface CreateScheduleDefinitionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

export function CreateScheduleDefinitionDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateScheduleDefinitionDialogProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<CreateScheduleDefinitionDto>({
    defaultValues: {
      name: '',
      code: '',
      description: '',
      isActive: true,
      requiredPeoplePerSlot: 1,
      strategy: ScheduleStrategy.ROUND_ROBIN,
      config: {},
    },
  });

  const onSubmit = async (data: CreateScheduleDefinitionDto) => {
    try {
      setLoading(true);
      await scheduleDefinitionApi.create(data);
      form.reset();
      onCreated();
    } catch (error) {
      console.error('Failed to create schedule definition:', error);
      alert('Failed to create schedule type');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create Schedule Type</DialogTitle>
          <DialogDescription>
            Configure a new schedule type for your organization
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Cleaning Schedule" {...field} />
                  </FormControl>
                  <FormDescription>
                    Display name for this schedule type
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., cleaning"
                      {...field}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value.toLowerCase().replace(/\s+/g, '-'),
                        )
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    Unique identifier (lowercase, use hyphens for spaces)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the purpose of this schedule..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="requiredPeoplePerSlot"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>People per Slot *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    Number of people required for each schedule slot
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="strategy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assignment Strategy *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={ScheduleStrategy.ROUND_ROBIN}>
                        Round Robin
                      </SelectItem>
                      <SelectItem value={ScheduleStrategy.RANDOM}>
                        Random
                      </SelectItem>
                      <SelectItem value={ScheduleStrategy.MANUAL}>
                        Manual
                      </SelectItem>
                      <SelectItem value={ScheduleStrategy.FIRST_AVAILABLE}>
                        First Available
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    How staff will be assigned to schedule slots
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
                {loading ? 'Creating...' : 'Create Schedule Type'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
