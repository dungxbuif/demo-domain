import { BranchesDataTable } from '@/components/branches/branches-data-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  branchServerService,
  GetBranchesParams,
} from '@/shared/lib/server/branch-server-service';

interface BranchesPageProps {
  searchParams?: {
    page?: string;
    take?: string;
    order?: 'ASC' | 'DESC';
    q?: string;
  };
}

export default async function BranchesPage({
  searchParams,
}: BranchesPageProps) {
  const resolvedSearchParams = await searchParams;

  const params: GetBranchesParams = {
    page: resolvedSearchParams?.page ? parseInt(resolvedSearchParams.page) : 1,
    take: resolvedSearchParams?.take ? parseInt(resolvedSearchParams.take) : 10,
    order: (resolvedSearchParams?.order as 'ASC' | 'DESC') || 'DESC',
    q: resolvedSearchParams?.q,
  };

  const branchesResponse = await branchServerService.getAll(params);
  const branches = branchesResponse?.result || [];
  const pagination = {
    page: branchesResponse?.page || 1,
    pageSize: branchesResponse?.pageSize || 10,
    total: branchesResponse?.total || 0,
  };
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>All Branches</CardTitle>
        </CardHeader>
        <CardContent>
          <BranchesDataTable
            initialData={branches}
            initialPagination={pagination}
          />
        </CardContent>
      </Card>
    </div>
  );
}
