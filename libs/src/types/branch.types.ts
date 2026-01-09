export interface Branch {
  id: number;
  name: string;
  code: string;
  address?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface ICreateBranchDto {
  name: string;
  code: string;
  address?: string;
}

export interface IUpdateBranchDto {
  name?: string;
  code?: string;
  address?: string;
}
