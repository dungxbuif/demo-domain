import baseApi from '@/shared/services/client/base-api';
import {
  ApiResponse,
  ICreateSwapRequestDto,
  IReviewSwapRequestDto,
  ISwapRequestQueryDto,
  SwapRequest,
} from '@qnoffice/shared';

class SwapRequestClientService {
  private readonly baseUrl = '/swap-requests';

  async getSwapRequests(params?: ISwapRequestQueryDto) {
    return baseApi.get<ApiResponse<SwapRequest[]>>(this.baseUrl, { params });
  }

  async getSwapRequestById(id: number) {
    return baseApi.get<ApiResponse<SwapRequest>>(`${this.baseUrl}/${id}`);
  }

  async createSwapRequest(data: ICreateSwapRequestDto) {
    return baseApi.post<ApiResponse<SwapRequest>>(this.baseUrl, data);
  }

  async reviewSwapRequest(id: number, data: IReviewSwapRequestDto) {
    return baseApi.put<ApiResponse<SwapRequest>>(
      `${this.baseUrl}/${id}/review`,
      data,
    );
  }

  async deleteSwapRequest(id: number) {
    return baseApi.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`);
  }
}

export const swapRequestClientService = new SwapRequestClientService();
