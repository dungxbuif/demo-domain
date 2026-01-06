import { Controller, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AppPaginationDto } from '@src/common/dtos/paginate.dto';
import { HolidayQuery } from '@src/modules/holiday/dtos/holiday.query';
import HolidayEntity from '@src/modules/holiday/holiday.entity';
import { HolidayService } from '@src/modules/holiday/holiday.service';

@Controller('holidays')
@ApiTags('Holidays')
export class HolidayController {
  constructor(private readonly holidayService: HolidayService) {}

  async getAllHolidays(
    @Query() query: HolidayQuery,
  ): Promise<AppPaginationDto<HolidayEntity>> {
    return this.holidayService.getAllHolidays(query);
  }
}
