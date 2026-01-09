import { API_PATHS } from '@/shared/constants';
import baseApi from '@/shared/services/client/base-api';
import {
  ApiResponse,
  ICreatePenaltyDto,
  IPaginateOptionsDto,
  IPaginationDto,
  Penalty,
  IUpdatePenaltyDto,
  IUpdatePenaltyEvidenceDto,
} from '@qnoffice/shared';

class PenaltyService {
  async create(dto: ICreatePenaltyDto) {
    return baseApi.post<ApiResponse<Penalty>>(API_PATHS.PENALTIES.CREATE, dto);
  }

  async findAll(params: Partial<IPaginateOptionsDto>) {
    return baseApi.get<ApiResponse<IPaginationDto<Penalty>>>(
      API_PATHS.PENALTIES.LIST,
      { params },
    );
  }

  async findOne(id: number) {
    return baseApi.get<ApiResponse<Penalty>>(API_PATHS.PENALTIES.BY_ID(id));
  }

  async update(id: number, dto: IUpdatePenaltyDto) {
    return baseApi.put<ApiResponse<Penalty>>(
      API_PATHS.PENALTIES.UPDATE(id),
      dto,
    );
  }

  async updateEvidence(id: number, dto: IUpdatePenaltyEvidenceDto) {
    return baseApi.put<ApiResponse<Penalty>>(
      API_PATHS.PENALTIES.UPDATE_EVIDENCE(id),
      dto,
    );
  }

  async remove(id: number) {
    return baseApi.delete<ApiResponse<void>>(API_PATHS.PENALTIES.DELETE(id));
  }
}

const penaltyService = new PenaltyService();
export default penaltyService;
