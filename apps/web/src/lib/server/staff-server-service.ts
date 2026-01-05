import {
  GetStaffParams,
  Staff,
  StaffCreateData,
  StaffUpdateData,
} from '@/types/staff';
import { BaseServerService } from './base-server-service';
import { AppPagination } from './branch-server-service';

export type PaginatedStaff = AppPagination<Staff>;

export class StaffServerService extends BaseServerService {
  private readonly baseUrl = '/staffs';

  async getAll(params: GetStaffParams = {}): Promise<AppPagination<Staff>> {
    try {
      const searchParams = new URLSearchParams();
      if (params.page !== undefined)
        searchParams.set('page', params.page.toString());
      if (params.take !== undefined)
        searchParams.set('take', params.take.toString());
      if (params.order) searchParams.set('order', params.order);
      if (params.q) searchParams.set('q', params.q);

      const url = `${this.baseUrl}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      const response = await this.get<AppPagination<Staff>>(url);
      return response?.data;
    } catch (error) {
      console.error('Error in getAll staffs:', error);
      return {
        page: 1,
        pageSize: 10,
        total: 0,
        result: [],
      };
    }
  }

  async getById(id: number): Promise<Staff> {
    return this.get<Staff>(`${this.baseUrl}/${id}`);
  }

  async create(data: StaffCreateData): Promise<Staff> {
    return this.post<Staff>(this.baseUrl, data);
  }

  async update(id: number, data: StaffUpdateData): Promise<Staff> {
    return this.put<Staff>(`${this.baseUrl}/${id}`, data);
  }

  async remove(id: number): Promise<void> {
    return this.delete(`${this.baseUrl}/${id}`);
  }
}

export const staffServerService = new StaffServerService();
