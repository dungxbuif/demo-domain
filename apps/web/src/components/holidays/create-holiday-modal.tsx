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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ICreateHolidayDto, ICreateHolidaysRangeDto } from '@qnoffice/shared';
import { useState } from 'react';
import { toast } from 'sonner';

interface CreateHolidayModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateHolidayModal({
  open,
  onOpenChange,
  onSuccess,
}: CreateHolidayModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'single' | 'range'>('single');
  const [singleFormData, setSingleFormData] = useState<ICreateHolidayDto>({
    date: '',
    name: '',
  });
  const [rangeFormData, setRangeFormData] = useState<ICreateHolidaysRangeDto>({
    startDate: '',
    endDate: '',
    name: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const endpoint =
        mode === 'single' ? '/api/holidays' : '/api/holidays/bulk';
      const body = mode === 'single' ? singleFormData : rangeFormData;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Tạo ngày nghỉ thất bại');
      }

      const successMessage =
        mode === 'single'
          ? 'Tạo ngày nghỉ thành công'
          : 'Tạo nhiều ngày nghỉ thành công';
      toast.success(successMessage);

      setSingleFormData({ date: '', name: '' });
      setRangeFormData({ startDate: '', endDate: '', name: '' });
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Tạo ngày nghỉ thất bại',
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
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Thêm ngày nghỉ mới</DialogTitle>
          <DialogDescription>
            Tạo một ngày nghỉ hoặc nhiều ngày nghỉ theo khoảng ngày.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Tabs
            value={mode}
            onValueChange={(v) => setMode(v as 'single' | 'range')}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="single">Ngày đơn</TabsTrigger>
              <TabsTrigger value="range">Khoảng ngày</TabsTrigger>
            </TabsList>

            <TabsContent value="single" className="space-y-4 mt-4">
              <div className="grid gap-2">
                <Label htmlFor="single-date">Ngày</Label>
                <Input
                  id="single-date"
                  type="date"
                  min={getTodayString()}
                  value={singleFormData.date}
                  onChange={(e) =>
                    setSingleFormData({
                      ...singleFormData,
                      date: e.target.value,
                    })
                  }
                  required={mode === 'single'}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="single-name">Tên ngày nghỉ</Label>
                <Input
                  id="single-name"
                  placeholder="VD: Tết Dương lịch"
                  value={singleFormData.name}
                  onChange={(e) =>
                    setSingleFormData({
                      ...singleFormData,
                      name: e.target.value,
                    })
                  }
                  required={mode === 'single'}
                />
              </div>
            </TabsContent>

            <TabsContent value="range" className="space-y-4 mt-4">
              <div className="grid gap-2">
                <Label htmlFor="start-date">Ngày bắt đầu</Label>
                <Input
                  id="start-date"
                  type="date"
                  min={getTodayString()}
                  value={rangeFormData.startDate}
                  onChange={(e) =>
                    setRangeFormData({
                      ...rangeFormData,
                      startDate: e.target.value,
                    })
                  }
                  required={mode === 'range'}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="end-date">Ngày kết thúc</Label>
                <Input
                  id="end-date"
                  type="date"
                  min={rangeFormData.startDate || getTodayString()}
                  value={rangeFormData.endDate}
                  onChange={(e) =>
                    setRangeFormData({
                      ...rangeFormData,
                      endDate: e.target.value,
                    })
                  }
                  required={mode === 'range'}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="range-name">Tên ngày nghỉ</Label>
                <Input
                  id="range-name"
                  placeholder="VD: Nghỉ lễ Xuân"
                  value={rangeFormData.name}
                  onChange={(e) =>
                    setRangeFormData({ ...rangeFormData, name: e.target.value })
                  }
                  required={mode === 'range'}
                />
                <p className="text-xs text-muted-foreground">
                  Tên này sẽ được áp dụng cho tất cả các ngày trong khoảng
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? 'Đang tạo...'
                : mode === 'single'
                  ? 'Tạo ngày nghỉ'
                  : 'Tạo nhiều ngày nghỉ'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
