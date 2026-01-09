export interface Holiday {
  id: number;
  date: string | Date;
  name: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface ICreateHolidayDto {
  date: string;
  name: string;
}

export interface IUpdateHolidayDto {
  date?: string;
  name?: string;
}

export interface ICreateHolidaysRangeDto {
  startDate: string;
  endDate: string;
  name: string;
}

import { SearchParams } from './pagination.types';

export interface IHolidayQuery extends SearchParams {
  startDate?: string;
  endDate?: string;
  name?: string;
}
