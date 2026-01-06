import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AppPaginationDto } from '@src/common/dtos/paginate.dto';
import { HolidayQuery } from '@src/modules/holiday/dtos/holiday.query';
import HolidayEntity from '@src/modules/holiday/holiday.entity';
import { Repository } from 'typeorm';

@Injectable()
export class HolidayService {
  constructor(
    @InjectRepository(HolidayEntity)
    private readonly holidayRepository: Repository<HolidayEntity>,
  ) {}

  async getAllHolidays(
    query: HolidayQuery,
  ): Promise<AppPaginationDto<HolidayEntity>> {
    const qb = this.holidayRepository.createQueryBuilder('holiday');

    if (query.startDate) {
      qb.andWhere('holiday.date >= :startDate', { startDate: query.startDate });
    }
    if (query.endDate) {
      qb.andWhere('holiday.date <= :endDate', { endDate: query.endDate });
    }

    qb.orderBy('holiday.date', query.order || 'DESC')
      .skip((query.page - 1) * query.take)
      .take(query.take);

    const [result, total] = await qb.getManyAndCount();

    return {
      result,
      total,
      page: query.page,
      pageSize: query.take,
    };
  }
}
