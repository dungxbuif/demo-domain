import { API_PATHS } from '@/shared/constants';
import baseApi from '@/shared/services/client/base-api';
import {
    ApiResponse,
    Branch,
    CreateBranchDto,
    IPaginateOptionsDto,
    IPaginationDto,
    UpdateBranchDto,
} from '@qnoffice/shared';

class BranchService {
  async getAll(params?: Partial<IPaginateOptionsDto>) {
    const response = await baseApi.get<ApiResponse<IPaginationDto<Branch>>>(
      API_PATHS.BRANCHES.LIST,
      { params },
    );
    return response.data;
  }

  async getById(id: number | string) {
    const response = await baseApi.get<ApiResponse<Branch>>(
      API_PATHS.BRANCHES.BY_ID(id),
    );
    return response.data;
  }

  async create(data: CreateBranchDto) {
    const response = await baseApi.post<ApiResponse<Branch>>(
      API_PATHS.BRANCHES.CREATE,
      data,
    );
    return response.data;
  }

  async update(id: number | string, data: UpdateBranchDto) {
    const response = await baseApi.put<ApiResponse<Branch>>(
      API_PATHS.BRANCHES.UPDATE(id),
      data,
    );
    return response.data;
  }

  async remove(id: number | string) {
    const response = await baseApi.delete<ApiResponse<void>>(
      API_PATHS.BRANCHES.DELETE(id),
    );
    return response.data;
  }
}

export const branchService = new BranchService();
