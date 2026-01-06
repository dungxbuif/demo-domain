export interface Holiday {
  id: number;
  date: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateHolidayData {
  date: string;
  name: string;
}

export interface CreateHolidaysRangeData {
  startDate: string;
  endDate: string;
  name: string;
}

export interface UpdateHolidayData {
  date?: string;
  name?: string;
}

export interface GetHolidaysParams {
  page?: number;
  take?: number;
  order?: 'ASC' | 'DESC';
  startDate?: string;
  endDate?: string;
}
