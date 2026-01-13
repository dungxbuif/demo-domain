import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { CycleStatus, EventStatus, ScheduleType } from '@qnoffice/shared';
import {
  CleaningReminderPayload,
  NotificationEvent,
} from '@src/common/events/notification.events';
import { AppLogService } from '@src/common/shared/services/app-log.service';
import {
  fromDateString,
  getCurrentDateString,
  toDateString,
} from '@src/common/utils/date.utils';
import HolidayEntity from '@src/modules/holiday/holiday.entity';
import StaffEntity from '@src/modules/staff/staff.entity';
import { addDays, addMonths, startOfMonth } from 'date-fns';
import { Between, EntityManager, In, LessThan, Not, Repository } from 'typeorm';
import ScheduleCycleEntity from '../enties/schedule-cycle.entity';
import ScheduleEventParticipantEntity from '../enties/schedule-event-participant.entity';
import ScheduleEventEntity from '../enties/schedule-event.entity';
import {
  CycleData,
  SchedulerConfig,
  SchedulingAlgorithm,
  Staff,
} from '../schedule.algorith';

@Injectable()
export class CleaningCronService {
  constructor(
    @InjectRepository(ScheduleEventEntity)
    private readonly eventRepository: Repository<ScheduleEventEntity>,
    @InjectRepository(ScheduleCycleEntity)
    private readonly cycleRepository: Repository<ScheduleCycleEntity>,
    @InjectRepository(StaffEntity)
    private readonly staffRepository: Repository<StaffEntity>,
    @InjectRepository(HolidayEntity)
    private readonly holidayRepository: Repository<HolidayEntity>,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    private readonly eventEmitter: EventEmitter2,
    private readonly appLogService: AppLogService,
  ) {}

  async markPastEventsCompleted(journeyId: string): Promise<void> {
    this.appLogService.journeyLog(
      journeyId,
      'Starting cleaning events completion process',
      'CleaningCronService',
      { scheduleType: ScheduleType.CLEANING },
    );

    const today = getCurrentDateString();

    try {
      this.appLogService.stepLog(
        1,
        'Finding ACTIVE cleaning events before today',
        'CleaningCronService',
        journeyId,
        { today },
      );

      const pastActiveEvents = await this.eventRepository.find({
        where: {
          type: ScheduleType.CLEANING,
          eventDate: LessThan(today),
          status: Not(EventStatus.COMPLETED),
        },
      });

      this.appLogService.stepLog(
        2,
        `Found ${pastActiveEvents.length} past ACTIVE cleaning events`,
        'CleaningCronService',
        journeyId,
        {
          count: pastActiveEvents.length,
          eventIds: pastActiveEvents.map((e) => e.id),
          eventDates: pastActiveEvents.map((e) => e.eventDate),
          eventTitles: pastActiveEvents.map((e) => e.title),
          oldestEventDate: pastActiveEvents[0]?.eventDate || null,
          newestEventDate:
            pastActiveEvents[pastActiveEvents.length - 1]?.eventDate || null,
          today,
        },
      );

      if (pastActiveEvents.length > 0) {
        this.appLogService.stepLog(
          3,
          'Marking past ACTIVE events as COMPLETED',
          'CleaningCronService',
          journeyId,
          {
            eventsToUpdate: pastActiveEvents.length,
            eventIdsToUpdate: pastActiveEvents.map((e) => e.id),
          },
        );

        const result = await this.eventRepository.update(
          {
            id: In(pastActiveEvents.map((e) => e.id)),
          },
          {
            status: EventStatus.COMPLETED,
          },
        );

        this.appLogService.stepLog(
          4,
          `Marked ${result.affected ?? 0} cleaning events as COMPLETED`,
          'CleaningCronService',
          journeyId,
          {
            affectedCount: result.affected ?? 0,
            expectedCount: pastActiveEvents.length,
            matched: (result.affected ?? 0) === pastActiveEvents.length,
            updateSuccess: (result.affected ?? 0) > 0,
          },
        );
      } else {
        this.appLogService.stepLog(
          3,
          'No past ACTIVE cleaning events to mark as COMPLETED',
          'CleaningCronService',
          journeyId,
          { today, reason: 'No events found before today' },
        );
      }

      this.appLogService.stepLog(
        5,
        'Finding next PENDING cleaning event to activate',
        'CleaningCronService',
        journeyId,
        { fromDate: today },
      );
    } catch (error) {
      this.appLogService.journeyError(
        journeyId,
        '❌ Error in cleaning events completion process',
        error.stack,
        'CleaningCronService',
        { error: error.message },
      );
    }
  }

  async sendMorningReminder(journeyId: string): Promise<void> {
    this.appLogService.journeyLog(
      journeyId,
      'Starting cleaning morning reminder process',
      'CleaningCronService',
      { reminderType: 'morning', scheduleType: ScheduleType.CLEANING },
    );
    const today = getCurrentDateString();
    try {
      this.appLogService.stepLog(
        1,
        "Finding today's ACTIVE cleaning events",
        'CleaningCronService',
        journeyId,
        { today },
      );

      const todayEvents = await this.eventRepository.find({
        where: {
          type: ScheduleType.CLEANING,
          eventDate: today,
        },
        relations: [
          'eventParticipants',
          'eventParticipants.staff',
        ],
      });

      this.appLogService.stepLog(
        2,
        `Found ${todayEvents.length} cleaning events for today`,
        'CleaningCronService',
        journeyId,
        {
          eventCount: todayEvents.length,
          eventIds: todayEvents.map((e) => e.id),
          today,
        },
      );

      let totalParticipants = 0;
      const payloads: CleaningReminderPayload[] = (todayEvents.map((event) => {
        const eventParticipants = event.eventParticipants || [];

        const participants = eventParticipants.map((p) => ({
          userId: p.staff.userId || '',
          username: p.staff.email.split('@')[0],
        }));

        if (!participants.length) {
            return null
        }

        totalParticipants += participants.length;
          return {
            eventId: event.id,
            eventDate: event.eventDate,
            participants,
            type: 'morning',
            journeyId: journeyId,
          };
      }).filter(Boolean)) as CleaningReminderPayload[]; 


      if (payloads.length > 0) {
        this.appLogService.stepLog(
          3,
          `Emitting morning reminders for ${payloads.length} events`,
          'CleaningCronService',
          journeyId,
          {
            eventCount: payloads.length,
            totalParticipants,
          },
        );

        payloads.forEach((payload) => {
          this.eventEmitter.emit(
            NotificationEvent.CLEANING_MORNING_REMINDER,
            payload,
          );
        });
      }

      this.appLogService.journeyLog(
        journeyId,
        `✅ Successfully sent morning reminders for ${payloads.length} events`,
        'CleaningCronService',
        {
          totalEvents: todayEvents.length,
          eventsWithParticipants: payloads.length,
          totalParticipants,
          today,
        },
      );
    } catch (error) {
      this.appLogService.journeyError(
        journeyId,
        '❌ Error sending morning reminders',
        error.stack,
        'CleaningCronService',
        { error: error.message, today },
      );
    }
  }

  async sendAfternoonReminder(journeyId: string): Promise<void> {
    this.appLogService.journeyLog(
      journeyId,
      'Starting cleaning afternoon reminder process',
      'CleaningCronService',
      { reminderType: 'afternoon', scheduleType: ScheduleType.CLEANING },
    );

    const today = getCurrentDateString();

    try {
      this.appLogService.stepLog(
        1,
        "Finding today's ACTIVE cleaning events for afternoon reminder",
        'CleaningCronService',
        journeyId,
        { today },
      );

      const todayEvents = await this.eventRepository.find({
        where: {
          type: ScheduleType.CLEANING,
          eventDate: today,
        },
        relations: [
          'eventParticipants',
          'eventParticipants.staff',
        ],
      });

      this.appLogService.stepLog(
        2,
        `Found ${todayEvents.length} cleaning events for today`,
        'CleaningCronService',
        journeyId,
        {
          eventCount: todayEvents.length,
          eventIds: todayEvents.map((e) => e.id),
          today,
        },
      );

      const payloads: CleaningReminderPayload[] = [];
      let totalParticipants = 0;
      todayEvents.forEach((event) => {
        const eventParticipants = event.eventParticipants || [];
        const participants = eventParticipants.map((p) => ({
          userId: p.staff.userId || '',
          username: p.staff.email.split('@')[0],
        }));
        if (participants.length > 0) {
          totalParticipants += participants.length;
          payloads.push({
            eventId: event.id,
            eventDate: event.eventDate,
            participants,
            type: 'afternoon',
            journeyId: journeyId,
          });
        }
      });

      if (payloads.length > 0) {
        this.appLogService.stepLog(
          3,
          `Emitting afternoon reminders for ${payloads.length} events`,
          'CleaningCronService',
          journeyId,
          {
            eventCount: payloads.length,
            totalParticipants,
          },
        );

        payloads.forEach((payload) => {
          this.eventEmitter.emit(
            NotificationEvent.CLEANING_AFTERNOON_REMINDER,
            payload,
          );
        });
      }

      this.appLogService.journeyLog(
        journeyId,
        `✅ Successfully sent afternoon reminders for ${payloads.length} events`,
        'CleaningCronService',
        {
          today: {
            date: today,
            totalEvents: todayEvents.length,
            eventsWithParticipants: payloads.length,
            totalParticipants: totalParticipants,
          },
        },
      );
    } catch (error) {
      this.appLogService.journeyError(
        journeyId,
        '❌ Error sending afternoon reminders',
        error.stack,
        'CleaningCronService',
        { error: error.message, today },
      );
    }
  }

  async sendNextDayReminder(journeyId: string): Promise<void> {
    this.appLogService.journeyLog(
      journeyId,
      'Starting cleaning next day reminder process',
      'CleaningCronService',
      { reminderType: 'nextday', scheduleType: ScheduleType.CLEANING },
    );
    const today = getCurrentDateString();
    const tomorrow = toDateString(addDays(fromDateString(today), 1));
    try {
      this.appLogService.stepLog(
        1,
        "Finding tomorrow's ACTIVE cleaning events for next day reminder",
        'CleaningCronService',
        journeyId,
        { tomorrow },
      );

      const tomorrowEvents = await this.eventRepository.find({
        where: {
          type: ScheduleType.CLEANING,
          eventDate: tomorrow,
        },
        relations: [
          'eventParticipants',
          'eventParticipants.staff',
        ],
      });

      this.appLogService.stepLog(
        2,
        `Found ${tomorrowEvents.length} cleaning events for tomorrow`,
        'CleaningCronService',
        journeyId,
        {
          eventCount: tomorrowEvents.length,
          eventIds: tomorrowEvents.map((e) => e.id),
          tomorrow,
        },
      );

      const payloads: CleaningReminderPayload[] = [];
      let totalParticipants = 0;

      tomorrowEvents.forEach((event) => {
        const eventParticipants = event.eventParticipants || [];
        const participants = eventParticipants.map((p) => ({
          userId: p.staff.userId || '',
          username: p.staff.email.split('@')[0],
        }));
        if (participants.length > 0) {
          totalParticipants += participants.length;
          payloads.push({
            eventId: event.id,
            eventDate: event.eventDate,
            participants,
            type: 'nextday',
            journeyId: journeyId,
          });
        }
      });

      if (payloads.length > 0) {
        this.appLogService.stepLog(
          3,
          `Emitting next day reminders for ${payloads.length} events`,
          'CleaningCronService',
          journeyId,
          {
            eventCount: payloads.length,
            totalParticipants,
          },
        );

        payloads.forEach((payload) => {
          this.eventEmitter.emit(
            NotificationEvent.CLEANING_NEXT_DAY_REMINDER,
            payload,
          );
        });
      }

      this.appLogService.journeyLog(
        journeyId,
        `✅ Successfully sent next day reminders for ${payloads.length} events`,
        'CleaningCronService',
        {
          tomorrow: {
            date: tomorrow,
            totalEvents: tomorrowEvents.length,
            eventsWithParticipants: payloads.length,
            totalParticipants: totalParticipants,
          },
        },
      );
    } catch (error) {
      this.appLogService.journeyError(
        journeyId,
        '❌ Error sending next day reminders',
        error.stack,
        'CleaningCronService',
        { error: error.message, tomorrow },
      );
    }
  }

  async handleAutomaticCycleCreation(journeyId: string): Promise<void> {
    this.appLogService.journeyLog(
      journeyId,
      'Checking if new cleaning cycle needs to be created',
      'CleaningCronService',
    );

    try {
      // 1. Get current active cycle
      const currentCycle = await this.cycleRepository.findOne({
        where: { type: ScheduleType.CLEANING, status: CycleStatus.ACTIVE },
        relations: ['events'],
        order: { id: 'DESC' }, // Get latest active
      });

      if (!currentCycle || currentCycle.events.length === 0) {
        this.appLogService.journeyLog(
          journeyId,
          'No active cycle found or cycle has no events. Skipping auto-creation.',
          'CleaningCronService',
        );
        return;
      }

      await this.createNextCycle(currentCycle, journeyId);
    } catch (error) {
      this.appLogService.journeyError(
        journeyId,
        '❌ Error in automatic cycle creation check',
        error.stack,
        'CleaningCronService',
        { error: error.message },
      );
    }
  }

  private async createNextCycle(
    previousCycleEntity: ScheduleCycleEntity,
    journeyId: string,
  ): Promise<void> {
    const staff = await this.staffRepository.find({
      where: { status: 0 }, // Active staff
      relations: ['user'],
    });

    if (staff.length === 0) {
      throw new Error('No active staff found');
    }

    const algorithmStaff: Staff[] = staff.map((s) => ({
      id: s.id,
      username: s.email || `staff_${s.id}`,
    }));

    // Prepare previous cycle data for algorithm
    const previousEvents = await this.eventRepository.find({
      where: {
        cycleId: previousCycleEntity.id,
        type: ScheduleType.CLEANING,
      },
      relations: ['eventParticipants'],
      order: { eventDate: 'ASC' },
    });

    const previousCycleData: CycleData = {
      id: previousCycleEntity.id,
      events: previousEvents.map((e) => ({
        date: e.eventDate,
        staffIds: e.eventParticipants.map((p) => p.staffId),
      })),
    };

    const lastEventDate = new Date(
      previousEvents[previousEvents.length - 1].eventDate,
    );
    // Start from the first day of the NEXT month after the last event
    const startDate = startOfMonth(addDays(lastEventDate, 1));
    const endDate = addMonths(startDate, 1); // 1 month duration

    // Holidays
    const holidays = await this.holidayRepository.find({
      where: {
        date: Between(
          toDateString(startDate),
          toDateString(addMonths(endDate, 3)), // Fetch enough ahead
        ),
      },
    });

    const config: SchedulerConfig = {
      type: ScheduleType.CLEANING,
      startDate: toDateString(startDate),
      slotSize: 2,
      holidays: holidays.map((h) =>
        typeof h.date === 'string' ? h.date : toDateString(h.date),
      ),
    };

    this.appLogService.stepLog(
      1,
      `Generating schedule for ${toDateString(startDate)}`,
      'CleaningCronService',
      journeyId,
      { config },
    );

    const schedule = SchedulingAlgorithm.generateNewCycle(
      algorithmStaff,
      previousCycleData,
      config,
    );

    await this.entityManager.transaction(async (manager) => {
      const newCycle = manager.create(ScheduleCycleEntity, {
        name: `Cleaning ${startDate.getMonth() + 1}/${startDate.getFullYear()}`,
        type: ScheduleType.CLEANING,
        description: `Auto-generated schedule for ${startDate.getMonth() + 1}/${startDate.getFullYear()}`,
        status: CycleStatus.DRAFT,
      });

      this.appLogService.stepLog(
        2,
        `Creating new cleaning cycle for ${startDate.getMonth() + 1}/${startDate.getFullYear()}`,
        'CleaningCronService',
        journeyId,
        { cycleName: newCycle.name },
      );

      const savedCycle = await manager.save(ScheduleCycleEntity, newCycle);

      const events = schedule.map((item) => {
        const eventDate = new Date(item.date);
        const isSpecial = eventDate.getDay() === 5; // Friday

        const assignedStaff = staff.filter((s) => item.staffIds.includes(s.id));
        const names = assignedStaff
          .map((s) => s.email?.split('@')[0] || 'Unknown')
          .join(' & ');

        const title = isSpecial
          ? `Dọn dẹp + Đặc biệt (${names})`
          : `Dọn dẹp văn phòng (${names})`;

        const notes = isSpecial
          ? 'Dọn dẹp văn phòng + vệ sinh lò vi sóng và tủ lạnh (đặc biệt Thứ Sáu)'
          : 'Dọn dẹp văn phòng hàng ngày';

        return manager.create(ScheduleEventEntity, {
          title,
          type: ScheduleType.CLEANING,
          notes,
          eventDate: item.date,
          status: EventStatus.PENDING,
          cycle: savedCycle,
          ...(item.staffIds.length > 0 && {
            eventParticipants: item.staffIds.map((staffId) =>
              manager.create(ScheduleEventParticipantEntity, { staffId }),
            ),
          }),
        });
      });

      this.appLogService.stepLog(
        3,
        `Creating ${events.length} events (batch save with participant cascade)`,
        'CleaningCronService',
        journeyId,
        { eventCount: events.length },
      );

      await manager.save(ScheduleEventEntity, events);

      this.appLogService.journeyLog(
        journeyId,
        `✅ Created new cycle ${savedCycle.name} with ${events.length} events`,
        'CleaningCronService',
        { cycleId: savedCycle.id },
      );
    });
  }
}
