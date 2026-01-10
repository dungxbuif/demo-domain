'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from '@/components/ui/table';
import { PERMISSIONS, ProtectedComponent } from '@/shared/auth';
import { Calendar, User } from 'lucide-react';

export function CleaningSwapsManagementClient() {
  // Placeholder data structure for when API is ready
  const swapRequests: any[] = [];

  return (
    <ProtectedComponent permission={PERMISSIONS.MANAGE_CLEANING_SWAP_REQUESTS}>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Yêu cầu đổi lịch trực nhật</h1>
            <p className="text-muted-foreground">
              Xem xét và phê duyệt/từ chối yêu cầu đổi lịch trực nhật
            </p>
          </div>
          <div className="flex gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">0</div>
              <div className="text-muted-foreground">Chờ duyệt</div>
            </div>
          </div>
        </div>

        {swapRequests.length === 0 ? (
          <div className="text-center py-12 border rounded-lg bg-muted/20">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Không có yêu cầu đổi lịch</p>
            <p className="text-sm text-muted-foreground mt-2">
              Yêu cầu đổi lịch trực nhật sẽ hiển thị ở đây khi nhân viên gửi yêu cầu
            </p>
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Người yêu cầu</TableHead>
                  <TableHead>Từ ngày</TableHead>
                  <TableHead>Đến ngày</TableHead>
                  <TableHead>Lý do</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày yêu cầu</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {swapRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {request.requester}
                      </div>
                    </TableCell>
                    <TableCell>{request.fromDate}</TableCell>
                    <TableCell>{request.toDate}</TableCell>
                    <TableCell className="max-w-xs truncate">{request.reason}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">Chờ duyệt</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {request.createdAt}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" size="sm">
                          Từ chối
                        </Button>
                        <Button size="sm">Phê duyệt</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </ProtectedComponent>
  );
}
