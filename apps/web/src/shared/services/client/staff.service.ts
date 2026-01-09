import { API_PATHS } from '@/shared/constants';
import baseApi from '@/shared/services/client/base-api';
import {
  ApiResponse,
  ICreateStaffDto,
  IPaginateOptionsDto,
  IPaginationDto,
  Staff,
  IUpdateStaffUserIdDto,
} from '@qnoffice/shared';

class StaffService {
  async getStaffs(params?: Partial<IPaginateOptionsDto>) {
    return baseApi.get<ApiResponse<IPaginationDto<Staff>>>(
      API_PATHS.STAFF.LIST,
      { params },
    );
  }

  async getAllActive() {
    return baseApi.get<ApiResponse<Staff[]>>(API_PATHS.STAFF.ACTIVE);
  }

  async findById(id: number) {
    return baseApi.get<ApiResponse<Staff>>(API_PATHS.STAFF.BY_ID(id));
  }

  async findByUserId(userId: string) {
    return baseApi.get<ApiResponse<Staff>>(API_PATHS.STAFF.BY_USER(userId));
  }

  async create(dto: ICreateStaffDto) {
    return baseApi.post<ApiResponse<Staff>>(API_PATHS.STAFF.CREATE, dto);
  }

  async updateMezonId(id: number, dto: IUpdateStaffUserIdDto) {
    return baseApi.put<ApiResponse<Staff>>(
      API_PATHS.STAFF.UPDATE_MEZON_ID(id),
      dto,
    );
  }
}

const staffService = new StaffService();
export default staffService;
