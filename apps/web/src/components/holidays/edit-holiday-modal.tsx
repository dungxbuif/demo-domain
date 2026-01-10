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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Holiday, IUpdateHolidayDto } from '@qnoffice/shared';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface EditHolidayModalProps {
  holiday: Holiday | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditHolidayModal({
  holiday,
  open,
  onOpenChange,
  onSuccess,
}: EditHolidayModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<IUpdateHolidayDto>({
    date: '',
    name: '',
  });

  useEffect(() => {
    if (holiday) {
      setFormData({
        date:
          typeof holiday.date === 'string'
            ? holiday.date.split('T')[0]
            : holiday.date.toISOString().split('T')[0],
        name: holiday.name,
      });
    }
  }, [holiday]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!holiday) return;

    setIsLoading(true);

    try {
      const response = await fetch(`/api/holidays/${holiday.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update holiday');
      }

      toast.success('Cập nhật ngày nghỉ thành công');

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Cập nhật ngày nghỉ thất bại',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getTodayString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa ngày nghỉ</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin ngày nghỉ. Không thể chỉnh sửa ngày nghỉ trong
            quá khứ.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-date">Ngày</Label>
              <Input
                id="edit-date"
                type="date"
                min={getTodayString()}
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Tên ngày nghỉ</Label>
              <Input
                id="edit-name"
                placeholder="VD: Tết Dương lịch"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Đang cập nhật...' : 'Cập nhật ngày nghỉ'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
