'use client';

import { DataTable } from '@/components/ui/data-table';
import {
  PaginationState,
  UsePaginationReturn,
} from '@/shared/types/pagination';
import { ColumnDef } from '@tanstack/react-table';
import { useEffect, useState } from 'react';

interface BaseDataTableProps<TData> {
  columns: ColumnDef<TData>[];
  initialData: TData[];
  initialPagination: PaginationState;
  pagination: UsePaginationReturn;
  searchKey?: string;
  searchPlaceholder?: string;
  showSearch?: boolean;
  showColumnFilter?: boolean;
  onRowAction?: (row: TData) => void;
  maxHeight?: string;
}

/**
 * Base reusable data table component with built-in pagination and search
 */
export function BaseDataTable<TData>({
  columns,
  initialData,
  initialPagination,
  pagination,
  searchKey = '',
  searchPlaceholder = 'Search...',
  showSearch = true,
  showColumnFilter = false,
  onRowAction,
  maxHeight = '500px',
}: BaseDataTableProps<TData>) {
  const [data, setData] = useState<TData[]>(initialData);

  // Update data when initialData changes (new page data arrives)
  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  // Handle search input changes with debouncing
  useEffect(() => {
    if (!showSearch) return;

    const timeoutId = setTimeout(() => {
      const searchValue = pagination.currentQuery;
      // The search is handled by the pagination hook
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [pagination.currentQuery, showSearch]);

  return (
    <DataTable
      columns={columns}
      data={data}
      pagination={initialPagination}
      onPageChange={pagination.handlePageChange}
      onPageSizeChange={pagination.handlePageSizeChange}
      isLoading={pagination.isLoading}
      searchKey={searchKey}
      searchPlaceholder={searchPlaceholder}
      showColumnFilter={showColumnFilter}
      maxHeight={maxHeight}
    />
  );
}
