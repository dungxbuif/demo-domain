import { ICreateBranchDto, IUpdateBranchDto } from '@qnoffice/shared';

export class CreateBranchDto implements ICreateBranchDto {
  name: string;
  code: string;
  address?: string;
}

export class UpdateBranchDto implements IUpdateBranchDto {
  name?: string;
  code?: string;
  address?: string;
}
