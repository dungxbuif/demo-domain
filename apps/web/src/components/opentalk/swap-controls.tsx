'use client';

import { ActionPanel } from '@/components/ui/action-panel';
import { ArrowRightLeft } from 'lucide-react';

interface SwapControlsProps {
  selectedCount: number;
  isSwapping: boolean;
  onSwap: () => void;
  onClear: () => void;
}

export function SwapControls({
  selectedCount,
  isSwapping,
  onSwap,
  onClear,
}: SwapControlsProps) {
  const message =
    selectedCount === 1
      ? '1 sự kiện đã chọn. Chọn thêm 1 sự kiện nữa để đổi lịch.'
      : '2 sự kiện đã chọn. Sẵn sàng đổi lịch.';

  return (
    <ActionPanel
      open={selectedCount > 0}
      onClose={onClear}
      icon={<ArrowRightLeft className="h-5 w-5" />}
      title={message}
      variant="warning"
      position="bottom"
      primaryAction={{
        label: 'Đổi lịch',
        onClick: onSwap,
        disabled: selectedCount !== 2,
        loading: isSwapping,
      }}
      secondaryAction={{
        label: 'Xóa lựa chọn',
        onClick: onClear,
        variant: 'outline',
      }}
      showClose={false}
    />
  );
}
