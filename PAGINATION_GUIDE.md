# Base Pagination System

A comprehensive, reusable pagination system for the QnUtilities application that provides consistent pagination behavior across all data tables.

## Features

- ✅ URL-synchronized pagination state
- ✅ Automatic loading states
- ✅ Search functionality
- ✅ Customizable page sizes
- ✅ Sort order management
- ✅ TypeScript support
- ✅ Reusable across all pages

## Core Components

### 1. Base Types (`/shared/types/pagination.ts`)

```typescript
// Base interfaces for pagination
interface PaginationParams {
  page?: number;
  take?: number;
  order?: 'ASC' | 'DESC';
  q?: string;
}

interface PaginationResponse<T> {
  result: T[];
  page: number;
  pageSize: number;
  total: number;
}
```

### 2. Pagination Hook (`/shared/hooks/use-pagination.ts`)

```typescript
const pagination = usePagination({
  defaultPage: 1,
  defaultPageSize: 10,
  defaultOrder: 'DESC',
});

// Provides:
// - pagination.handlePageChange(page)
// - pagination.handlePageSizeChange(size)
// - pagination.handleSearch(query)
// - pagination.isLoading
```

### 3. Base Data Table (`/components/ui/base-data-table.tsx`)

```typescript
<BaseDataTable
  columns={columns}
  initialData={data}
  initialPagination={pagination}
  pagination={paginationHook}
  searchPlaceholder="Search..."
/>
```

### 4. Base Service (`/shared/lib/base-paginated-service.ts`)

```typescript
export class MyService extends BasePaginatedService<MyType> {
  protected baseUrl = '/api/my-endpoint';
  // Automatically gets: getAll, getById, create, update, delete
}
```

## Quick Start Guide

### 1. Create a New Paginated Page

```typescript
// app/dashboard/my-items/page.tsx
import { getServerPaginationParams, SearchParams } from '@/shared/lib/base-paginated-service';

interface MyItemsPageProps {
  searchParams?: SearchParams;
}

export default async function MyItemsPage({ searchParams }: MyItemsPageProps) {
  const resolvedSearchParams = await searchParams;

  const params = getServerPaginationParams(
    resolvedSearchParams || {},
    { defaultPage: 1, defaultPageSize: 10, defaultOrder: 'DESC' }
  );

  const response = await myItemService.getAll(params);
  const items = response?.result || [];
  const pagination = {
    page: response?.page || 1,
    pageSize: response?.pageSize || 10,
    total: response?.total || 0,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Items</CardTitle>
      </CardHeader>
      <CardContent>
        <MyItemsDataTable
          initialData={items}
          initialPagination={pagination}
        />
      </CardContent>
    </Card>
  );
}
```

### 2. Create Data Table Component

```typescript
// components/my-items/my-items-data-table.tsx
'use client';

import { BaseDataTable } from '@/components/ui/base-data-table';
import { usePagination } from '@/shared/hooks/use-pagination';
import { PaginationState } from '@/shared/types/pagination';
import { ColumnDef } from '@tanstack/react-table';

interface MyItemsDataTableProps {
  initialData: MyItem[];
  initialPagination: PaginationState;
}

export function MyItemsDataTable({
  initialData,
  initialPagination,
}: MyItemsDataTableProps) {
  const pagination = usePagination({
    defaultPage: 1,
    defaultPageSize: 10,
    defaultOrder: 'DESC'
  });

  const columns: ColumnDef<MyItem>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
    },
    // ... more columns
  ];

  return (
    <BaseDataTable
      columns={columns}
      initialData={initialData}
      initialPagination={initialPagination}
      pagination={pagination}
      searchPlaceholder="Search items..."
    />
  );
}
```

### 3. Create Service

```typescript
// shared/lib/server/my-item-server-service.ts
import { BasePaginatedService } from '@/shared/lib/base-paginated-service';
import { MyItem } from '@/shared/types/my-item';

class MyItemServerService extends BasePaginatedService<MyItem> {
  protected baseUrl = process.env.API_BASE_URL + '/my-items';
}

export const myItemServerService = new MyItemServerService();
export type GetMyItemsParams = Parameters<typeof myItemServerService.getAll>[0];
```

## Migration Guide

### From Existing Pages

1. **Update Page Component**:

   ```diff
   - interface MyPageProps {
   -   searchParams?: {
   -     page?: string;
   -     take?: string;
   -     order?: 'ASC' | 'DESC';
   -     q?: string;
   -   };
   - }
   + interface MyPageProps {
   +   searchParams?: SearchParams;
   + }

   - const params = {
   -   page: searchParams?.page ? parseInt(searchParams.page) : 1,
   -   take: searchParams?.take ? parseInt(searchParams.take) : 10,
   -   // ...
   - };
   + const params = getServerPaginationParams(
   +   resolvedSearchParams || {},
   +   { defaultPage: 1, defaultPageSize: 10, defaultOrder: 'DESC' }
   + );
   ```

2. **Update Data Table Component**:

   ```diff
   - import { DataTable } from '@/components/ui/data-table';
   - import { useRouter, useSearchParams } from 'next/navigation';
   + import { BaseDataTable } from '@/components/ui/base-data-table';
   + import { usePagination } from '@/shared/hooks/use-pagination';

   - // Remove custom pagination handlers
   - const handlePageChange = (page: number) => { ... };
   + const pagination = usePagination({ ... });

   - <DataTable
   -   onPageChange={handlePageChange}
   -   onPageSizeChange={handlePageSizeChange}
   -   isLoading={isLoading}
   - />
   + <BaseDataTable
   +   pagination={pagination}
   + />
   ```

## Advanced Usage

### Custom Search Implementation

```typescript
// For complex search requirements
const pagination = usePagination();

useEffect(() => {
  // Custom search logic
  const delayedSearch = setTimeout(() => {
    if (searchTerm) {
      pagination.handleSearch(searchTerm);
    }
  }, 300);

  return () => clearTimeout(delayedSearch);
}, [searchTerm]);
```

### Server-Side Filtering

```typescript
// Add custom filters to the service
const params = {
  ...getServerPaginationParams(searchParams),
  category: searchParams?.category,
  status: searchParams?.status,
};
```

### Custom Loading States

```typescript
// Access loading state from the hook
const { isLoading } = usePagination();

return (
  <div>
    {isLoading && <LoadingSpinner />}
    <BaseDataTable ... />
  </div>
);
```

## API Reference

### `usePagination(options)`

**Parameters:**

- `options.defaultPage` - Initial page number (default: 1)
- `options.defaultPageSize` - Initial page size (default: 10)
- `options.defaultOrder` - Initial sort order (default: 'DESC')

**Returns:**

- `isLoading` - Boolean loading state
- `handlePageChange(page)` - Function to change page
- `handlePageSizeChange(size)` - Function to change page size
- `handleSearch(query)` - Function to search
- `handleOrderChange(order)` - Function to change sort order
- `currentPage`, `currentPageSize`, `currentOrder`, `currentQuery` - Current values

### `BaseDataTable<T>(props)`

**Props:**

- `columns` - Column definitions
- `initialData` - Initial data array
- `initialPagination` - Pagination state
- `pagination` - Pagination hook return value
- `searchPlaceholder` - Search input placeholder
- `showSearch` - Whether to show search input
- `showColumnFilter` - Whether to show column filters

### `BasePaginatedService<T>`

**Methods:**

- `getAll(params)` - Get paginated data
- `getById(id)` - Get single item
- `create(data)` - Create new item
- `update(id, data)` - Update existing item
- `delete(id)` - Delete item

## Best Practices

1. **Always use the base system** for new paginated tables
2. **Consistent naming**: Use `SearchParams` interface for all page props
3. **Default values**: Always provide sensible defaults for pagination
4. **Loading states**: The system handles loading automatically
5. **URL sync**: All pagination state is automatically synced with URL
6. **Type safety**: Use TypeScript interfaces for all data types

## Troubleshooting

### Page not updating when clicking pagination

- Ensure you're using the `BaseDataTable` component
- Check that `initialPagination` prop is being passed correctly
- Verify the server component is receiving `searchParams` prop

### Search not working

- Make sure `showSearch={true}` is set on `BaseDataTable`
- Check that the server endpoint supports the `q` parameter
- Implement search in your API endpoint

### Loading state stuck

- The loading state should reset automatically when new data arrives
- If stuck, check that `initialData` is changing when pagination changes
- Verify the URL is actually changing when pagination buttons are clicked

## Examples

See the updated staff and branches pages for complete working examples of the base pagination system in action.
