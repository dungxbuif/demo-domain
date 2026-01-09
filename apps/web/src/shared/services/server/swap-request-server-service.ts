import {
  ICreateSwapRequestDto,
  IReviewSwapRequestDto,
  ISwapRequestQueryDto,
  SwapRequest,
} from '@qnoffice/shared';
import { BaseServerService } from './base-server-service';

class SwapRequestServerService extends BaseServerService {
  private readonly baseUrl = '/swap-requests';

  async getSwapRequests(params?: ISwapRequestQueryDto): Promise<SwapRequest[]> {
    const response = await this.get<SwapRequest[]>(this.baseUrl, params);
    return response?.data || [];
  }

  async getSwapRequestById(id: number): Promise<SwapRequest> {
    const response = await this.get<SwapRequest>(`${this.baseUrl}/${id}`);
    return response?.data;
  }

  async createSwapRequest(data: ICreateSwapRequestDto): Promise<SwapRequest> {
    const response = await this.post<SwapRequest>(this.baseUrl, data);
    return response?.data;
  }

  async reviewSwapRequest(
    id: number,
    data: IReviewSwapRequestDto,
  ): Promise<SwapRequest> {
    const response = await this.put<SwapRequest>(
      `${this.baseUrl}/${id}/review`,
      data,
    );
    return response?.data;
  }

  async deleteSwapRequest(id: number): Promise<void> {
    await this.delete(`${this.baseUrl}/${id}`);
  }
}

export const swapRequestServerService = new SwapRequestServerService();
