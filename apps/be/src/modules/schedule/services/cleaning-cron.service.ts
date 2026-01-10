import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { CycleStatus, EventStatus, ScheduleType } from '@qnoffice/shared';
import {
  CleaningReminderPayload,
  NotificationEvent,
} from '@src/common/events/notification.events';
import { AppLogService } from '@src/common/shared/services/app-log.service';
import {
  getCurrentDateString,
  toDateString,
} from '@src/common/utils/date.utils';
import HolidayEntity from '@src/modules/holiday/holiday.entity';
import StaffEntity from '@src/modules/staff/staff.entity';
import { addDays, addMonths, startOfMonth } from 'date-fns';
import { Between, LessThan, MoreThanOrEqual, Repository } from 'typeorm';
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
    @InjectRepository(ScheduleEventParticipantEntity)
    private readonly participantRepository: Repository<ScheduleEventParticipantEntity>,
    @InjectRepository(StaffEntity)
    private readonly staffRepository: Repository<StaffEntity>,
    @InjectRepository(HolidayEntity)
    private readonly holidayRepository: Repository<HolidayEntity>,
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
      // Step 1: Find all ACTIVE events before today
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
          status: EventStatus.ACTIVE,
        },
        order: {
          eventDate: 'ASC',
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

      // Step 2: Mark past ACTIVE events as COMPLETED
      if (pastActiveEvents.length > 0) {
        this.appLogService.stepLog(
          3,
          'Marking past ACTIVE events as COMPLETED',
          'CleaningCronService',
          journeyId,
          {
            eventsToUpdate: pastActiveEvents.length,
            eventIdsToUpdate: pastActiveEvents.map((e) => e.id),
            statusBefore: EventStatus.ACTIVE,
            statusAfter: EventStatus.COMPLETED,
          },
        );

        const result = await this.eventRepository.update(
          {
            type: ScheduleType.CLEANING,
            eventDate: LessThan(today),
            status: EventStatus.ACTIVE,
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

      // Step 3: Find the next PENDING event to activate
      this.appLogService.stepLog(
        5,
        'Finding next PENDING cleaning event to activate',
        'CleaningCronService',
        journeyId,
        { fromDate: today },
      );

      const nextPendingEvent = await this.eventRepository.findOne({
        where: {
          type: ScheduleType.CLEANING,
          eventDate: MoreThanOrEqual(today),
          status: EventStatus.PENDING,
        },
        order: {
          eventDate: 'ASC',
        },
      });

      // Step 4: Activate the next PENDING event
      if (nextPendingEvent) {
        const daysUntilEvent = Math.ceil(
          (new Date(nextPendingEvent.eventDate).getTime() -
            new Date(today).getTime()) /
            (1000 * 60 * 60 * 24),
        );

        this.appLogService.stepLog(
          6,
          'Activating next PENDING cleaning event',
          'CleaningCronService',
          journeyId,
          {
            eventId: nextPendingEvent.id,
            eventDate: nextPendingEvent.eventDate,
            title: nextPendingEvent.title,
            cycleId: nextPendingEvent.cycleId,
            daysUntilEvent,
            statusBefore: EventStatus.PENDING,
            statusAfter: EventStatus.ACTIVE,
            today,
          },
        );

        await this.eventRepository.update(
          { id: nextPendingEvent.id },
          { status: EventStatus.ACTIVE },
        );

        this.appLogService.stepLog(
          7,
          `Successfully activated cleaning event ${nextPendingEvent.id}`,
          'CleaningCronService',
          journeyId,
          {
            eventId: nextPendingEvent.id,
            eventDate: nextPendingEvent.eventDate,
            title: nextPendingEvent.title,
            newStatus: EventStatus.ACTIVE,
            activatedAt: new Date().toISOString(),
          },
        );
      } else {
        this.appLogService.stepLog(
          6,
          'No PENDING cleaning events found to activate',
          'CleaningCronService',
          journeyId,
          {
            searchCriteria: {
              type: ScheduleType.CLEANING,
              status: EventStatus.PENDING,
              dateFrom: today,
            },
            reason: 'No PENDING events found from today onwards',
          },
        );
      }

      this.appLogService.journeyLog(
        journeyId,
        '✅ Successfully completed cleaning events process',
        'CleaningCronService',
        {
          completedCount: pastActiveEvents.length,
          activatedEvent: nextPendingEvent?.id || null,
          activatedEventDate: nextPendingEvent?.eventDate || null,
          executionDate: today,
          totalStepsExecuted: nextPendingEvent ? 7 : 6,
        },
      );
    } catch (error) {
      this.appLogService.journeyError(
        journeyId,
        '❌ Error in cleaning events completion process',
        error.stack,
        'CleaningCronService',
        { error: error.message },
      );
      throw error;
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
          status: EventStatus.ACTIVE,
        },
        relations: [
          'eventParticipants',
          'eventParticipants.staff',
          'eventParticipants.staff.user',
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
      let eventsWithParticipants = 0;

      for (const event of todayEvents) {
        const eventParticipants = event.eventParticipants || [];

        // Map to Participant format with mezonId and email prefix
        const participants = eventParticipants
          .filter((p) => p.staff?.user?.mezonId && p.staff?.email)
          .map((p) => ({
            userId: p.staff.user.mezonId,
            username: p.staff.email.split('@')[0], // Email prefix before @
          }));

        if (participants.length > 0) {
          eventsWithParticipants++;
          totalParticipants += participants.length;

          const payload: CleaningReminderPayload = {
            eventId: event.id,
            eventDate: event.eventDate,
            participants,
            type: 'morning',
            journeyId: journeyId,
          };

          this.appLogService.stepLog(
            3,
            `Emitting morning reminder for event ${event.id}`,
            'CleaningCronService',
            journeyId,
            {
              eventId: event.id,
              eventDate: event.eventDate,
              participantCount: participants.length,
              participants: participants.map((p) => p.username),
            },
          );

          this.eventEmitter.emit(
            NotificationEvent.CLEANING_MORNING_REMINDER,
            payload,
          );
        }
      }

      this.appLogService.journeyLog(
        journeyId,
        `✅ Successfully sent morning reminders for ${eventsWithParticipants} events`,
        'CleaningCronService',
        {
          totalEvents: todayEvents.length,
          eventsWithParticipants,
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
      throw error;
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
    const tomorrow = addDays(new Date(today), 1).toISOString().split('T')[0];

    try {
      // Process today's events (afternoon reminder)
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
          status: EventStatus.ACTIVE,
        },
        relations: [
          'eventParticipants',
          'eventParticipants.staff',
          'eventParticipants.staff.user',
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

      let todayParticipants = 0;
      let todayEventsWithParticipants = 0;

      for (const event of todayEvents) {
        const eventParticipants = event.eventParticipants || [];

        // Map to Participant format with mezonId and email prefix
        const participants = eventParticipants
          .filter((p) => p.staff?.user?.mezonId && p.staff?.email)
          .map((p) => ({
            userId: p.staff.user.mezonId,
            username: p.staff.email.split('@')[0],
          }));

        if (participants.length > 0) {
          todayEventsWithParticipants++;
          todayParticipants += participants.length;

          const payload: CleaningReminderPayload = {
            eventId: event.id,
            eventDate: event.eventDate,
            participants,
            type: 'afternoon',
            journeyId: journeyId,
          };

          this.appLogService.stepLog(
            3,
            `Emitting afternoon reminder for event ${event.id}`,
            'CleaningCronService',
            journeyId,
            {
              eventId: event.id,
              eventDate: event.eventDate,
              participantCount: participants.length,
              participants: participants.map((p) => p.username),
            },
          );

          this.eventEmitter.emit(
            NotificationEvent.CLEANING_AFTERNOON_REMINDER,
            payload,
          );
        }
      }

      // Process tomorrow's events (next day reminder)
      this.appLogService.stepLog(
        4,
        "Finding tomorrow's ACTIVE cleaning events for next day reminder",
        'CleaningCronService',
        journeyId,
        { tomorrow },
      );

      const tomorrowEvents = await this.eventRepository.find({
        where: {
          type: ScheduleType.CLEANING,
          eventDate: tomorrow,
          status: EventStatus.ACTIVE,
        },
        relations: [
          'eventParticipants',
          'eventParticipants.staff',
          'eventParticipants.staff.user',
        ],
      });

      this.appLogService.stepLog(
        5,
        `Found ${tomorrowEvents.length} cleaning events for tomorrow`,
        'CleaningCronService',
        journeyId,
        {
          eventCount: tomorrowEvents.length,
          eventIds: tomorrowEvents.map((e) => e.id),
          tomorrow,
        },
      );

      let tomorrowParticipants = 0;
      let tomorrowEventsWithParticipants = 0;

      for (const event of tomorrowEvents) {
        const eventParticipants = event.eventParticipants || [];

        // Map to Participant format with mezonId and email prefix
        const participants = eventParticipants
          .filter((p) => p.staff?.user?.mezonId && p.staff?.email)
          .map((p) => ({
            userId: p.staff.user.mezonId,
            username: p.staff.email.split('@')[0],
          }));

        if (participants.length > 0) {
          tomorrowEventsWithParticipants++;
          tomorrowParticipants += participants.length;

          const payload: CleaningReminderPayload = {
            eventId: event.id,
            eventDate: event.eventDate,
            participants,
            type: 'nextday',
            journeyId: journeyId,
          };

          this.appLogService.stepLog(
            6,
            `Emitting next day reminder for event ${event.id}`,
            'CleaningCronService',
            journeyId,
            {
              eventId: event.id,
              eventDate: event.eventDate,
              participantCount: participants.length,
              participants: participants.map((p) => p.username),
            },
          );

          this.eventEmitter.emit(
            NotificationEvent.CLEANING_NEXT_DAY_REMINDER,
            payload,
          );
        }
      }

      this.appLogService.journeyLog(
        journeyId,
        `✅ Successfully sent afternoon reminders for ${todayEventsWithParticipants} events and next day reminders for ${tomorrowEventsWithParticipants} events`,
        'CleaningCronService',
        {
          today: {
            date: today,
            totalEvents: todayEvents.length,
            eventsWithParticipants: todayEventsWithParticipants,
            totalParticipants: todayParticipants,
          },
          tomorrow: {
            date: tomorrow,
            totalEvents: tomorrowEvents.length,
            eventsWithParticipants: tomorrowEventsWithParticipants,
            totalParticipants: tomorrowParticipants,
          },
        },
      );
    } catch (error) {
      this.appLogService.journeyError(
        journeyId,
        '❌ Error sending afternoon/next day reminders',
        error.stack,
        'CleaningCronService',
        { error: error.message, today, tomorrow },
      );
      throw error;
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
      username: s.email || s.user?.email || `staff_${s.id}`,
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

    const newCycle = this.cycleRepository.create({
      name: `Cleaning ${startDate.getMonth() + 1}/${startDate.getFullYear()}`,
      type: ScheduleType.CLEANING,
      description: `Auto-generated schedule for ${startDate.getMonth() + 1}/${startDate.getFullYear()}`,
      status: CycleStatus.DRAFT,
    });

    const savedCycle = await this.cycleRepository.save(newCycle);

    for (const item of schedule) {
      const eventDate = new Date(item.date);
      const isSpecial = eventDate.getDay() === 5; // Friday

      const assignedStaff = staff.filter((s) => item.staffIds.includes(s.id));
      const names = assignedStaff
        .map(
          (s) =>
            s.email?.split('@')[0] || s.user?.email?.split('@')[0] || 'Unknown',
        )
        .join(' & ');

      const title = isSpecial
        ? `Dọn dẹp + Đặc biệt (${names})`
        : `Dọn dẹp văn phòng (${names})`;

      const notes = isSpecial
        ? 'Dọn dẹp văn phòng + vệ sinh lò vi sóng và tủ lạnh (đặc biệt Thứ Sáu)'
        : 'Dọn dẹp văn phòng hàng ngày';

      const event = this.eventRepository.create({
        title,
        type: ScheduleType.CLEANING,
        notes,
        eventDate: item.date,
        status: EventStatus.PENDING,
        cycleId: savedCycle.id,
      });
      const savedEvent = await this.eventRepository.save(event);

      for (const staffId of item.staffIds) {
        await this.participantRepository.save({
          eventId: savedEvent.id,
          staffId,
        });
      }
    }

    this.appLogService.journeyLog(
      journeyId,
      `✅ Created new cycle ${savedCycle.name} with ${schedule.length} events`,
      'CleaningCronService',
      { cycleId: savedCycle.id },
    );
  }
}
