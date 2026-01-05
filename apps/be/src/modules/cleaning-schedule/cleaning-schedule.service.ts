import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CleaningSchedule } from './cleaning-schedule.entity';

@Injectable()
export class CleaningScheduleService {
  constructor(
    @InjectRepository(CleaningSchedule)
    private readonly cleaningScheduleRepository: Repository<CleaningSchedule>,
  ) {}

  async findAll(): Promise<CleaningSchedule[]> {
    return this.cleaningScheduleRepository.find({
      relations: ['user1', 'user2'],
      order: { date: 'DESC' },
    });
  }

  async findByMonth(year: number, month: number): Promise<CleaningSchedule[]> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    return this.cleaningScheduleRepository
      .createQueryBuilder('schedule')
      .leftJoinAndSelect('schedule.user1', 'user1')
      .leftJoinAndSelect('schedule.user2', 'user2')
      .where('schedule.date >= :startDate', { startDate })
      .andWhere('schedule.date <= :endDate', { endDate })
      .orderBy('schedule.date', 'ASC')
      .getMany();
  }

  async create(
    scheduleData: Partial<CleaningSchedule>,
  ): Promise<CleaningSchedule> {
    const schedule = this.cleaningScheduleRepository.create(scheduleData);
    return this.cleaningScheduleRepository.save(schedule);
  }

  async update(
    id: number,
    scheduleData: Partial<CleaningSchedule>,
  ): Promise<CleaningSchedule | null> {
    await this.cleaningScheduleRepository.update(id, scheduleData);
    return this.cleaningScheduleRepository.findOne({
      where: { id },
      relations: ['user1', 'user2'],
    });
  }
}
