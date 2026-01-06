import { ApiResponse } from '@/shared/types';
import {
  CreateHolidayData,
  GetHolidaysParams,
  Holiday,
  UpdateHolidayData,
} from '@/shared/types/holiday';
import { BaseServerService } from './base-server-service';
import { AppPagination } from './branch-server-service';

export type PaginatedHoliday = AppPagination<Holiday>;

export class HolidayServerService extends BaseServerService {
  private readonly baseUrl = '/holidays';

  async getAll(
    params: GetHolidaysParams = {},
  ): Promise<AppPagination<Holiday>> {
    try {
      const searchParams = new URLSearchParams();
      if (params.page !== undefined)
        searchParams.set('page', params.page.toString());
      if (params.take !== undefined)
        searchParams.set('take', params.take.toString());
      if (params.order) searchParams.set('order', params.order);
      if (params.startDate) searchParams.set('startDate', params.startDate);
      if (params.endDate) searchParams.set('endDate', params.endDate);

      const url = `${this.baseUrl}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      const response = await this.get<AppPagination<Holiday>>(url);
      return response?.data;
    } catch (error) {
      console.error('Error in getAll holidays:', error);
      return {
        page: 1,
        pageSize: 10,
        total: 0,
        result: [],
      };
    }
  }

  async getById(id: number): Promise<ApiResponse<Holiday>> {
    return this.get<Holiday>(`${this.baseUrl}/${id}`);
  }

  async create(data: CreateHolidayData): Promise<ApiResponse<Holiday>> {
    return this.post<Holiday>(this.baseUrl, data);
  }

  async update(
    id: number,
    data: UpdateHolidayData,
  ): Promise<ApiResponse<Holiday>> {
    return this.put<Holiday>(`${this.baseUrl}/${id}`, data);
  }

  async delete(id: number): Promise<ApiResponse<void>> {
    return this.delete<void>(`${this.baseUrl}/${id}`);
  }
}

export const holidayServerService = new HolidayServerService();
