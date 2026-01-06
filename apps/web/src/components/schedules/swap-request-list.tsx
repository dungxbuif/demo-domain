'use client';

import { Badge } from '@/components/ui/badge';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { scheduleSwapApi } from '@/shared/lib/api/schedule.api';
import type {
  ScheduleSwapRequest,
  SwapRequestStatus,
} from '@/shared/types/schedule.types';
import { format } from 'date-fns';
import { AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useState } from 'react';

interface SwapRequestListProps {
  requests: ScheduleSwapRequest[];
  loading: boolean;
  onUpdate: () => void;
}

export function SwapRequestList({
  requests,
  loading,
  onUpdate,
}: SwapRequestListProps) {
  const [reviewDialog, setReviewDialog] = useState<{
    request: ScheduleSwapRequest;
    action: 'approved' | 'rejected';
  } | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleReview = async () => {
    if (!reviewDialog) return;

    try {
      setProcessing(true);
      // TODO: Get actual reviewer staff ID from auth context
      await scheduleSwapApi.review(reviewDialog.request.id, {
        status: reviewDialog.action === 'approved' ? 'approved' : 'rejected',
        reviewedByStaffId: 1, // Replace with actual staff ID
        reviewNotes: reviewNotes || undefined,
      });
      setReviewDialog(null);
      setReviewNotes('');
      onUpdate();
    } catch (error) {
      console.error('Failed to review swap request:', error);
      alert('Failed to process review');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusIcon = (status: SwapRequestStatus) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: SwapRequestStatus) => {
    switch (status) {
      case 'pending':
        return 'default';
      case 'approved':
        return 'default';
      case 'rejected':
        return 'destructive';
      case 'cancelled':
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">Loading...</div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No swap requests found.
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Requester</TableHead>
            <TableHead>Target Staff</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id}>
              <TableCell className="font-medium">
                {format(new Date(request.createdAt), 'MMM dd, yyyy')}
              </TableCell>
              <TableCell>{request.requester?.email || 'Unknown'}</TableCell>
              <TableCell>
                {request.targetStaff?.email || 'Any available'}
              </TableCell>
              <TableCell className="max-w-[200px] truncate">
                {request.reason || '-'}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {getStatusIcon(request.status)}
                  <Badge variant={getStatusColor(request.status)}>
                    {request.status}
                  </Badge>
                </div>
              </TableCell>
              <TableCell className="text-right">
                {request.status === 'pending' && (
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() =>
                        setReviewDialog({ request, action: 'approved' })
                      }
                    >
                      <CheckCircle className="mr-1 h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() =>
                        setReviewDialog({ request, action: 'rejected' })
                      }
                    >
                      <XCircle className="mr-1 h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {reviewDialog && (
        <Dialog open={true} onOpenChange={() => setReviewDialog(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {reviewDialog.action === 'approved' ? 'Approve' : 'Reject'} Swap
                Request
              </DialogTitle>
              <DialogDescription>
                Review the swap request from{' '}
                {reviewDialog.request.requester?.email}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">Reason:</p>
                <p className="text-sm text-muted-foreground">
                  {reviewDialog.request.reason || 'No reason provided'}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium">
                  Review Notes (Optional)
                </label>
                <Textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add any notes about your decision..."
                  className="mt-2"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setReviewDialog(null)}
                disabled={processing}
              >
                Cancel
              </Button>
              <Button
                variant={
                  reviewDialog.action === 'approved' ? 'default' : 'destructive'
                }
                onClick={handleReview}
                disabled={processing}
              >
                {processing
                  ? 'Processing...'
                  : reviewDialog.action === 'approved'
                    ? 'Approve Request'
                    : 'Reject Request'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
