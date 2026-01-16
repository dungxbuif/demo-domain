'use client';

import { Badge } from '@/components/ui/badge';
import { BaseDataTable } from '@/components/ui/base-data-table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { usePagination } from '@/shared/hooks/use-pagination';
import { PaginationState, Penalty, PenaltyStatus } from '@qnoffice/shared';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { AlertCircle, CheckCircle2, Eye, FileText, ImageIcon } from 'lucide-react';
import { useState } from 'react';
import { FilePreviewDialog } from '../opentalk/file-preview-dialog';

interface PenaltiesDataTableProps {
  initialData: Penalty[];
  initialPagination: PaginationState;
}

export function PenaltiesDataTable({
  initialData,
  initialPagination,
}: PenaltiesDataTableProps) {
  const [selectedPenalty, setSelectedPenalty] = useState<Penalty | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const pagination = usePagination({
    defaultPage: 1,
    defaultPageSize: 10,
  });

  const getStatusBadge = (status: PenaltyStatus) => {
    if (status === PenaltyStatus.PAID) {
      return (
        <Badge
          variant="outline"
          className="bg-green-50 text-green-700 border-green-200"
        >
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Đã thanh toán
        </Badge>
      );
    }
    return (
      <Badge
        variant="outline"
        className="bg-red-50 text-red-700 border-red-200"
      >
        <AlertCircle className="h-3 w-3 mr-1" />
        Chưa thanh toán
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const columns: ColumnDef<Penalty>[] = [
    {
      accessorKey: 'staffId',
      header: 'Nhân viên',
      cell: ({ row }) => {
        const staff = row.original.staff;
        return staff?.email
      },
    },
    {
      accessorKey: 'penaltyTypeId',
      header: 'Loại phạt',
      cell: ({ row }) => {
        const penaltyType = row.original.penaltyType;
        return penaltyType?.name || `Loại ${row.original.penaltyTypeId}`;
      },
    },
    {
      accessorKey: 'date',
      header: 'Ngày',
      cell: ({ row }) => format(new Date(row.original.date), 'PP'),
    },
    {
      accessorKey: 'reason',
      header: 'Lý do',
      cell: ({ row }) => (
        <div className="max-w-xs truncate">{row.original.reason}</div>
      ),
    },
    {
      accessorKey: 'amount',
      header: 'Số tiền',
      cell: ({ row }) => (
        <div className="text-right font-medium">
          {formatCurrency(Number(row.original.amount))}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Trạng thái',
      cell: ({ row }) => getStatusBadge(row.original.status),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSelectedPenalty(row.original)}
        >
          Xem chi tiết
        </Button>
      ),
    },
  ];

  return (
    <>
      <BaseDataTable
        columns={columns}
        initialData={initialData}
        initialPagination={initialPagination}
        pagination={pagination}
        searchPlaceholder="Tìm kiếm phạt..."
        showSearch={false}
      />

      {/* Penalty Detail Modal */}
      {selectedPenalty && (
        <Dialog
          open={!!selectedPenalty}
          onOpenChange={() => setSelectedPenalty(null)}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Chi tiết phạt</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Nhân viên</p>
                  <p className="font-medium">
                    {selectedPenalty.staff?.user?.name || selectedPenalty.staff?.email || selectedPenalty.staffId}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Loại phạt</p>
                  <p className="font-medium">
                    {selectedPenalty.penaltyType?.name || `Loại ${selectedPenalty.penaltyTypeId}`}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Số tiền</p>
                  <p className="font-medium">
                    {formatCurrency(Number(selectedPenalty.amount))}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ngày</p>
                  <p className="font-medium">
                    {format(new Date(selectedPenalty.date), 'PPP')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Trạng thái</p>
                  <div>{getStatusBadge(selectedPenalty.status)}</div>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Lý do</p>
                <p className="text-sm bg-muted p-3 rounded-md">
                  {selectedPenalty.reason}
                </p>
              </div>
              {selectedPenalty.evidenceUrls &&
                selectedPenalty.evidenceUrls.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Bằng chứng
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                      {selectedPenalty.evidenceUrls.map((url, index) => {
                        const isImage = url.match(/\.(jpeg|jpg|gif|png)$/i) != null;
                        const fileName = url.split('/').pop() || `Evidence ${index + 1}`;
                        
                        return (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 border rounded-lg bg-muted/20"
                          >
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div className="h-10 w-10 flex items-center justify-center bg-primary/10 rounded-lg text-xl text-primary">
                                {isImage ? <ImageIcon className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate" title={fileName}>
                                  {fileName}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {isImage ? 'Hình ảnh' : 'Tài liệu'}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-2"
                              onClick={() => {
                                setPreviewUrl(url);
                                setShowPreview(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                              Xem
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      <FilePreviewDialog
        open={showPreview}
        onOpenChange={setShowPreview}
        url={previewUrl}
        fileName={previewUrl?.split('/').pop() || 'Bằng chứng'}
        fileType={previewUrl?.split('.').pop()}
      />
    </>
  );
}
