/**
 * ActionPanel Component - Usage Examples
 * 
 * A flexible, reusable bottom/top panel component for displaying contextual actions
 * Built with shadcn/ui components and Tailwind CSS
 */

import { ActionPanel } from '@/components/ui/action-panel';
import {
    AlertCircle,
    ArrowRightLeft,
    CheckCircle2,
    Download,
    Info,
    Trash2,
    Upload,
} from 'lucide-react';

// ============================================================================
// Example 1: Swap/Exchange Actions (like swap-controls)
// ============================================================================
export function SwapExample() {
  return (
    <ActionPanel
      open={true}
      icon={<ArrowRightLeft className="h-5 w-5" />}
      title="2 sự kiện đã chọn. Sẵn sàng đổi lịch."
      variant="warning"
      position="bottom"
      primaryAction={{
        label: 'Đổi lịch',
        onClick: () => console.log('Swap'),
        disabled: false,
      }}
      secondaryAction={{
        label: 'Xóa lựa chọn',
        onClick: () => console.log('Clear'),
        variant: 'outline',
      }}
    />
  );
}

// ============================================================================
// Example 2: Bulk Delete Confirmation
// ============================================================================
export function BulkDeleteExample() {
  return (
    <ActionPanel
      open={true}
      icon={<Trash2 className="h-5 w-5" />}
      title="5 mục đã chọn"
      description="Bạn có chắc chắn muốn xóa các mục này?"
      variant="error"
      position="bottom"
      primaryAction={{
        label: 'Xóa',
        onClick: () => console.log('Delete'),
        variant: 'destructive',
      }}
      secondaryAction={{
        label: 'Hủy',
        onClick: () => console.log('Cancel'),
        variant: 'outline',
      }}
      showClose={true}
      onClose={() => console.log('Close')}
    />
  );
}

// ============================================================================
// Example 3: Download/Export Actions
// ============================================================================
export function ExportExample() {
  return (
    <ActionPanel
      open={true}
      icon={<Download className="h-5 w-5" />}
      title="Xuất dữ liệu"
      description="Chọn định dạng để xuất 120 bản ghi"
      variant="info"
      position="bottom"
      actions={[
        {
          label: 'CSV',
          onClick: () => console.log('Export CSV'),
          variant: 'outline',
        },
        {
          label: 'Excel',
          onClick: () => console.log('Export Excel'),
          variant: 'outline',
        },
      ]}
      primaryAction={{
        label: 'PDF',
        onClick: () => console.log('Export PDF'),
      }}
      showClose={true}
      onClose={() => console.log('Close')}
    />
  );
}

// ============================================================================
// Example 4: Upload Progress
// ============================================================================
export function UploadProgressExample() {
  return (
    <ActionPanel
      open={true}
      icon={<Upload className="h-5 w-5" />}
      title="Đang tải lên..."
      description="3 file đang được tải lên"
      variant="info"
      position="bottom"
      primaryAction={{
        label: 'Tải lên',
        onClick: () => {},
        loading: true,
        disabled: true,
      }}
      secondaryAction={{
        label: 'Hủy',
        onClick: () => console.log('Cancel upload'),
        variant: 'outline',
      }}
      showClose={false}
    />
  );
}

// ============================================================================
// Example 5: Success Notification
// ============================================================================
export function SuccessNotificationExample() {
  return (
    <ActionPanel
      open={true}
      icon={<CheckCircle2 className="h-5 w-5" />}
      title="Thành công!"
      description="Đã lưu 15 thay đổi"
      variant="success"
      position="top"
      primaryAction={{
        label: 'Xem chi tiết',
        onClick: () => console.log('View details'),
      }}
      showClose={true}
      onClose={() => console.log('Close')}
    />
  );
}

// ============================================================================
// Example 6: Warning/Alert
// ============================================================================
export function WarningExample() {
  return (
    <ActionPanel
      open={true}
      icon={<AlertCircle className="h-5 w-5" />}
      title="Cảnh báo"
      description="Có 3 xung đột lịch trình cần được giải quyết"
      variant="warning"
      position="top"
      primaryAction={{
        label: 'Giải quyết ngay',
        onClick: () => console.log('Resolve'),
      }}
      secondaryAction={{
        label: 'Để sau',
        onClick: () => console.log('Later'),
        variant: 'ghost',
      }}
      showClose={true}
      onClose={() => console.log('Close')}
    />
  );
}

// ============================================================================
// Example 7: Custom Content
// ============================================================================
export function CustomContentExample() {
  return (
    <ActionPanel
      open={true}
      icon={<Info className="h-5 w-5" />}
      variant="default"
      position="bottom"
      primaryAction={{
        label: 'Xác nhận',
        onClick: () => console.log('Confirm'),
      }}
      showClose={true}
      onClose={() => console.log('Close')}
    >
      <div className="space-y-1">
        <p className="font-medium">Nội dung tùy chỉnh</p>
        <p className="text-sm text-muted-foreground">
          Bạn có thể truyền bất kỳ JSX nào vào children
        </p>
        <div className="flex gap-2 mt-2">
          <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded">Tag 1</span>
          <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded">Tag 2</span>
        </div>
      </div>
    </ActionPanel>
  );
}

// ============================================================================
// Example 8: Multiple Actions
// ============================================================================
export function MultipleActionsExample() {
  return (
    <ActionPanel
      open={true}
      icon={<CheckCircle2 className="h-5 w-5" />}
      title="Đã chọn 10 mục"
      variant="default"
      position="bottom"
      actions={[
        {
          label: 'Sao chép',
          onClick: () => console.log('Copy'),
          variant: 'outline',
        },
        {
          label: 'Di chuyển',
          onClick: () => console.log('Move'),
          variant: 'outline',
        },
        {
          label: 'Chia sẻ',
          onClick: () => console.log('Share'),
          variant: 'outline',
        },
      ]}
      primaryAction={{
        label: 'Xóa',
        onClick: () => console.log('Delete'),
        variant: 'destructive',
      }}
      showClose={true}
      onClose={() => console.log('Close')}
    />
  );
}
