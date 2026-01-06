import { StaffDataTable } from '@/components/staff/staff-data-table';
import { StaffPageActions } from '@/components/staff/staff-page-actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { branchServerService } from '@/shared/lib/server/branch-server-service';
import { staffServerService } from '@/shared/lib/server/staff-server-service';
import { GetStaffParams } from '@/shared/types/staff';

interface StaffPageProps {
  searchParams?: {
    page?: string;
    take?: string;
    order?: 'ASC' | 'DESC';
    q?: string;
  };
}

export default async function StaffPage({ searchParams }: StaffPageProps) {
  const resolvedSearchParams = await searchParams;

  const params: GetStaffParams = {
    page: resolvedSearchParams?.page ? parseInt(resolvedSearchParams.page) : 1,
    take: resolvedSearchParams?.take ? parseInt(resolvedSearchParams.take) : 10,
    order: (resolvedSearchParams?.order as 'ASC' | 'DESC') || 'DESC',
    q: resolvedSearchParams?.q,
  };

  // Fetch staff data and branches in parallel
  const [staffResponse, branchesResponse] = await Promise.all([
    staffServerService.getAll(params),
    branchServerService.getAll({ page: 1, take: 100 }), // Get all branches for dropdown
  ]);

  const staff = staffResponse?.result || [];
  const branches = branchesResponse?.result || [];
  const pagination = {
    page: staffResponse?.page || 1,
    pageSize: staffResponse?.pageSize || 10,
    total: staffResponse?.total || 0,
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>All Staff</CardTitle>
          <StaffPageActions branches={branches} />
        </CardHeader>
        <CardContent>
          <StaffDataTable initialData={staff} initialPagination={pagination} />
        </CardContent>
      </Card>
    </div>
  );
}
