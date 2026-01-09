import { API_PATHS } from '@/shared/constants';
import baseApi from '@/shared/services/client/base-api';
import {
  ApiResponse,
  ICreatePenaltyTypeDto,
  IPaginateOptionsDto,
  IPaginationDto,
  PenaltyType,
  IUpdatePenaltyTypeDto,
} from '@qnoffice/shared';

class PenaltyTypeService {
  async create(dto: ICreatePenaltyTypeDto) {
    return baseApi.post<ApiResponse<PenaltyType>>(
      API_PATHS.PENALTY_TYPES.CREATE,
      dto,
    );
  }

  async findAll(params?: Partial<IPaginateOptionsDto>) {
    return baseApi.get<ApiResponse<IPaginationDto<PenaltyType>>>(
      API_PATHS.PENALTY_TYPES.LIST,
      { params },
    );
  }

  async findOne(id: number) {
    return baseApi.get<ApiResponse<PenaltyType>>(
      API_PATHS.PENALTY_TYPES.BY_ID(id),
    );
  }

  async update(id: number, dto: IUpdatePenaltyTypeDto) {
    return baseApi.put<ApiResponse<PenaltyType>>(
      API_PATHS.PENALTY_TYPES.UPDATE(id),
      dto,
    );
  }

  async remove(id: number) {
    return baseApi.delete<ApiResponse<void>>(
      API_PATHS.PENALTY_TYPES.DELETE(id),
    );
  }
}

const penaltyTypeService = new PenaltyTypeService();
export default penaltyTypeService;
