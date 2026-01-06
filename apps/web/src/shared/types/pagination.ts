// Base pagination interfaces for consistent pagination across the app

export interface PaginationParams {
  page?: number;
  take?: number;
  order?: 'ASC' | 'DESC';
  q?: string;
}

export interface SearchParams {
  page?: string;
  take?: string;
  order?: string;
  q?: string;
}

export interface PaginationResponse<T> {
  result: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages?: number;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

export interface UsePaginationOptions {
  defaultPage?: number;
  defaultPageSize?: number;
  defaultOrder?: 'ASC' | 'DESC';
}

export interface UsePaginationReturn {
  isLoading: boolean;
  handlePageChange: (page: number) => void;
  handlePageSizeChange: (pageSize: number) => void;
  handleSearch: (query: string) => void;
  handleOrderChange: (order: 'ASC' | 'DESC') => void;
  currentPage: number;
  currentPageSize: number;
  currentOrder: 'ASC' | 'DESC';
  currentQuery: string;
}

// Helper function to parse search params to pagination params
export const parseSearchParams = (
  searchParams: SearchParams,
  defaults: UsePaginationOptions = {},
): PaginationParams => {
  return {
    page: searchParams?.page
      ? parseInt(searchParams.page)
      : defaults.defaultPage || 1,
    take: searchParams?.take
      ? parseInt(searchParams.take)
      : defaults.defaultPageSize || 10,
    order:
      (searchParams?.order as 'ASC' | 'DESC') ||
      defaults.defaultOrder ||
      'DESC',
    q: searchParams?.q,
  };
};

// Helper function to build URL search params
export const buildSearchParams = (params: PaginationParams): string => {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set('page', params.page.toString());
  if (params.take) searchParams.set('take', params.take.toString());
  if (params.order) searchParams.set('order', params.order);
  if (params.q) searchParams.set('q', params.q);

  return searchParams.toString();
};
