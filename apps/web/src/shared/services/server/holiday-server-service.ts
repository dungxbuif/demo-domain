import {
    ApiResponse,
    Holiday,
    ICreateHolidayDto,
    IHolidayQuery,
    IPaginationDto,
    IUpdateHolidayDto,
} from '@qnoffice/shared';
import { BaseServerService } from './base-server-service';

export class HolidayServerService extends BaseServerService {
  private readonly baseUrl = '/holidays';

  async getAll(
    params: IHolidayQuery = {},
  ): Promise<IPaginationDto<Holiday>> {
    try {
      const searchParams = new URLSearchParams();
      // Since IHolidayQuery includes IPaginateOptionsDto fields
      const p = params as any;
      if (p.page !== undefined)
        searchParams.set('page', p.page.toString());
      if (p.take !== undefined)
        searchParams.set('take', p.take.toString());
      if (p.order) searchParams.set('order', p.order);
      if (params.startDate) searchParams.set('startDate', params.startDate);
      if (params.endDate) searchParams.set('endDate', params.endDate);

      const url = `${this.baseUrl}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      const response = await this.get<IPaginationDto<Holiday>>(url);
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

  async create(data: ICreateHolidayDto): Promise<ApiResponse<Holiday>> {
    return this.post<Holiday>(this.baseUrl, data);
  }

  async update(
    id: number,
    data: IUpdateHolidayDto,
  ): Promise<ApiResponse<Holiday>> {
    return this.put<Holiday>(`${this.baseUrl}/${id}`, data);
  }

  async deleteHoliday(id: number): Promise<ApiResponse<void>> {
    return super.delete<void>(`${this.baseUrl}/${id}`);
  }
}

export const holidayServerService = new HolidayServerService();
