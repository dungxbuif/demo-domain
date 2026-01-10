'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { BaseDataTable } from '@/components/ui/base-data-table';
import { Button } from '@/components/ui/button';
import { PERMISSIONS, ProtectedComponent } from '@/shared/auth';
import { usePagination } from '@/shared/hooks/use-pagination';
import penaltyTypeService from '@/shared/services/client/penalty-type.service';
import { PaginationState, PenaltyType } from '@qnoffice/shared';
import { ColumnDef } from '@tanstack/react-table';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { PenaltyTypeForm } from './penalty-type-form';

interface PenaltyTypeManagerProps {
  initialData: PenaltyType[];
  initialPagination: PaginationState;
}

export function PenaltyTypeManager({
  initialData,
  initialPagination,
}: PenaltyTypeManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [selectedType, setSelectedType] = useState<PenaltyType | undefined>();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const pagination = usePagination({
    defaultPage: 1,
    defaultPageSize: 10,
  });

  const handleEdit = (type: PenaltyType) => {
    setSelectedType(type);
    setShowForm(true);
  };

  const handleCreate = () => {
    setSelectedType(undefined);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await penaltyTypeService.remove(deleteId);
      toast.success('Xóa loại phạt thành công');
      window.location.reload();
    } catch {
      toast.error('Xóa loại phạt thất bại');
    } finally {
      setDeleteId(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const columns: ColumnDef<PenaltyType>[] = [
    {
      accessorKey: 'name',
      header: 'Tên',
      cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
    },
    {
      accessorKey: 'description',
      header: 'Mô tả',
      cell: ({ row }) => (
        <div className="max-w-md truncate">
          {row.original.description || '-'}
        </div>
      ),
    },
    {
      accessorKey: 'amount',
      header: 'Mức phạt mặc định',
      cell: ({ row }) => (
        <div className="text-right font-medium">
          {formatCurrency(Number(row.original.amount))}
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Thao tác',
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <ProtectedComponent permission={PERMISSIONS.MANAGE_PENALTIES}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(row.original)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeleteId(row.original.id)}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </ProtectedComponent>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <ProtectedComponent permission={PERMISSIONS.MANAGE_PENALTIES}>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm loại phạt
          </Button>
        </ProtectedComponent>
      </div>

      <BaseDataTable
        columns={columns}
        initialData={initialData}
        initialPagination={initialPagination}
        pagination={pagination}
        searchPlaceholder="Tìm loại phạt..."
        showSearch={false}
      />

      <PenaltyTypeForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setSelectedType(undefined);
        }}
        onSuccess={() => window.location.reload()}
        penaltyType={selectedType}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn?</AlertDialogTitle>
            <AlertDialogDescription>
              Thao tác này sẽ xóa vĩnh viễn loại phạt này. Không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
