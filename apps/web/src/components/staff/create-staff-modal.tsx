'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
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
import { zodResolver } from '@hookform/resolvers/zod';
import { UserRole } from '@qnoffice/shared';
import { Loader2, Plus } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

const createStaffSchema = z.object({
  username: z
    .string()
    .min(1, 'Please enter a username')
    .regex(
      /^[a-zA-Z0-9._-]+$/,
      'Username can only contain letters, numbers, dots, hyphens, and underscores',
    ),
  branchId: z.string().min(1, 'Please select a branch'),
  role: z.string().min(1, 'Please select a role'),
  status: z.string().optional(),
});

type CreateStaffFormValues = z.infer<typeof createStaffSchema>;

interface CreateStaffModalProps {
  onStaffCreated?: () => void;
  branches?: Array<{ id: number; name: string; code: string }>;
}

export function CreateStaffModal({
  onStaffCreated,
  branches = [],
}: CreateStaffModalProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CreateStaffFormValues>({
    resolver: zodResolver(createStaffSchema),
    defaultValues: {
      username: '',
      branchId: '',
      role: '',
    },
  });

  const onSubmit = async (values: CreateStaffFormValues) => {
    setIsLoading(true);
    try {
      const email = `${values.username}@ncc.asia`;
      const response = await fetch('/api/staffs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          branchId: parseInt(values.branchId),
          role: parseInt(values.role),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create staff');
      }

      toast.success('Staff member created successfully');
      form.reset();
      setOpen(false);
      onStaffCreated?.();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to create staff',
      );
      setOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const hasBranches = branches.length > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={!hasBranches}>
          <Plus className="mr-2 h-4 w-4" />
          Add Staff
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Add New Staff Member</DialogTitle>
          <DialogDescription>
            {hasBranches
              ? 'Create a new staff member. If the user exists, they will be linked automatically.'
              : 'No branches available. Please create at least one branch before adding staff members.'}
          </DialogDescription>
        </DialogHeader>
        {hasBranches ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="john.doe"
                          {...field}
                          className="pr-20"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                          @ncc.asia
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="branchId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Branch</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a branch" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {branches.map((branch) => (
                          <SelectItem
                            key={branch.id}
                            value={branch.id.toString()}
                          >
                            {branch.name} ({branch.code})
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
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={UserRole.STAFF.toString()}>
                          Staff
                        </SelectItem>
                        <SelectItem value={UserRole.HR.toString()}>
                          HR
                        </SelectItem>
                        <SelectItem value={UserRole.GDVP.toString()}>
                          GDVP
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create Staff
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
