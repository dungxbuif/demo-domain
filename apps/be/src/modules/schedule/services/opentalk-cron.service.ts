import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import {
  CycleStatus,
  EventStatus,
  ScheduleType,
  SearchOrder,
  StaffStatus,
} from '@qnoffice/shared';
import {
  NotificationEvent,
  OpentalkSlideReminderPayload,
} from '@src/common/events/notification.events';
import { AppLogService } from '@src/common/shared/services/app-log.service';
import {
  fromDateString,
  getCurrentDateString,
  toDateString,
} from '@src/common/utils/date.utils';
import HolidayEntity from '@src/modules/holiday/holiday.entity';
import OpentalkSlideEntity from '@src/modules/opentalk/entities/opentalk-slide.entity';
import StaffEntity from '@src/modules/staff/staff.entity';
import { addDays, addMonths, differenceInCalendarDays, startOfMonth, subDays } from 'date-fns';
import {
  Between,
  EntityManager,
  In,
  LessThan,
  Like,
  MoreThan,
  Not,
  Repository,
} from 'typeorm';
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
export class OpentalkCronService {
  constructor(
    @InjectRepository(ScheduleEventEntity)
    private readonly eventRepository: Repository<ScheduleEventEntity>,
    @InjectRepository(OpentalkSlideEntity)
    private readonly slideRepository: Repository<OpentalkSlideEntity>,
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
      'Starting opentalk events completion process',
      'OpentalkCronService',
      { scheduleType: ScheduleType.OPENTALK },
    );

    const today = getCurrentDateString();

    try {
      this.appLogService.stepLog(
        1,
        'Finding ACTIVE opentalk events before today',
        'OpentalkCronService',
        journeyId,
        { today },
      );

      const pastActiveEvents = await this.eventRepository.find({
        where: {
          type: ScheduleType.OPENTALK,
          eventDate: LessThan(today),
          status: Not(EventStatus.COMPLETED),
        },
      });

      this.appLogService.stepLog(
        2,
        `Found ${pastActiveEvents.length} past ACTIVE opentalk events`,
        'OpentalkCronService',
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
          'Marking past ACTIVE opentalk events as COMPLETED',
          'OpentalkCronService',
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
          `Marked ${result.affected ?? 0} opentalk events as COMPLETED`,
          'OpentalkCronService',
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
          'No past ACTIVE opentalk events to mark as COMPLETED',
          'OpentalkCronService',
          journeyId,
          { today, reason: 'No events found before today' },
        );
      }
    } catch (error) {
      this.appLogService.journeyError(
        journeyId,
        '❌ Error in opentalk events completion process',
        error.stack,
        'OpentalkCronService',
        { error: error.message },
      );
    }
  }

  async checkSlideSubmission(journeyId: string): Promise<void> {
    const today = getCurrentDateString();
    const sevenDaysFromNow = toDateString(addDays(fromDateString(today), 7));

    try {
      const reminderDays = [1, 3, 5, 7];
      const upcomingEvents = await this.eventRepository.find({
        where: {
          type: ScheduleType.OPENTALK,
          eventDate: Between(today, sevenDaysFromNow),
        },
        relations: ['eventParticipants', 'eventParticipants.staff'],
      });
      this.appLogService.journeyLog(
        journeyId,
        `Checking slide submissions for ${upcomingEvents.length} upcoming Opentalk events`,
        'OpentalkCronService',
        {
          eventCount: upcomingEvents.length,
          dateRange: { from: today, to: sevenDaysFromNow },
        },
      );

      if (upcomingEvents.length === 0) {
        this.appLogService.journeyLog(
          journeyId,
          'No upcoming Opentalk events found within 7 days',
          'OpentalkCronService',
          { today, sevenDaysFromNow },
        );
        return;
      }

      const eventIds = upcomingEvents.map((e) => e.id);
      const slides = await this.slideRepository.find({
        where: {
          eventId: In(eventIds),
        },
      });

      const slideMap = new Map(slides.map((s) => [s.eventId, s]));
      let totalReminders = 0;

      for (const event of upcomingEvents) {
        const daysUntilEvent = differenceInCalendarDays(
          fromDateString(event.eventDate),
          fromDateString(today),
        );
        if (!reminderDays.includes(daysUntilEvent)) {
          continue;
        }
        const slide = slideMap.get(event.id);
        const hasSlide = !!slide;
        const participants = event.eventParticipants || [];

        participants.forEach((participant) => {
          const staff = participant.staff;
          const mezonId = staff?.userId;
          const email = staff?.email;

          if (mezonId && email) {
            const payload: OpentalkSlideReminderPayload = {
              eventId: event.id,
              eventDate: event.eventDate,
              participant: {
                userId: mezonId,
                username: email.split('@')[0],
              },
              daysUntilEvent,
              slideSubmitted: hasSlide,
              journeyId: journeyId,
            };

            this.eventEmitter.emit(
              NotificationEvent.OPENTALK_SLIDE_REMINDER,
              payload,
            );

            totalReminders++;

            this.appLogService.stepLog(
              2,
              `Emitted slide reminder for ${email}`,
              'OpentalkCronService',
              journeyId,
              {
                eventId: event.id,
                staffId: participant.staffId,
                email,
                mezonId,
                daysUntilEvent,
                slideSubmitted: hasSlide,
              },
            );
          }
        });
      }

      this.appLogService.journeyLog(
        journeyId,
        `✅ Successfully completed slide check - sent ${totalReminders} reminders`,
        'OpentalkCronService',
        {
          totalEvents: upcomingEvents.length,
          totalReminders,
          dateRange: { from: today, to: sevenDaysFromNow },
        },
      );
    } catch (error) {
      this.appLogService.journeyError(
        journeyId,
        '❌ Error checking slide submissions',
        error.stack,
        'OpentalkCronService',
        { error: error.message },
      );
    }
  }

  async handleAutomaticCycleCreation(journeyId: string): Promise<void> {
    this.appLogService.journeyLog(
      journeyId,
      'Checking if new opentalk cycle needs to be created',
      'OpentalkCronService',
    );

    try {
      const currentCycle = await this.cycleRepository.findOne({
        where: { type: ScheduleType.OPENTALK, status: CycleStatus.ACTIVE },
        relations: ['events'],
        order: { id: SearchOrder.DESC },
      });

      if (!currentCycle || currentCycle.events.length === 0) {
        this.appLogService.journeyLog(
          journeyId,
          'No active cycle found or cycle has no events. Skipping auto-creation.',
          'OpentalkCronService',
        );
        return;
      }

      const sortedEvents = currentCycle.events.sort((a, b) =>
        a.eventDate.localeCompare(b.eventDate),
      );
      const lastEvent = sortedEvents[sortedEvents.length - 1];
      const lastEventDate = new Date(lastEvent.eventDate);
      const today = new Date(getCurrentDateString());

      const sevenDaysBeforeEnd = subDays(lastEventDate, 7);

      if (today < sevenDaysBeforeEnd) {
        this.appLogService.journeyLog(
          journeyId,
          'Current cycle is not near completion. Skipping.',
          'OpentalkCronService',
          {
            lastEventDate: lastEvent.eventDate,
            checkDate: getCurrentDateString(),
            triggerDate: toDateString(sevenDaysBeforeEnd),
          },
        );
        return;
      }

      const startOfNextMonth = startOfMonth(addMonths(lastEventDate, 1));
      const nextMonthStr = `${startOfNextMonth.getMonth() + 1}/${startOfNextMonth.getFullYear()}`;

      const existingNextCycle = await this.cycleRepository.findOne({
        where: {
          type: ScheduleType.OPENTALK,
          name: Like(`%${nextMonthStr}%`),
        },
      });

      const newerCycleEncoded = await this.cycleRepository.findOne({
        where: {
          type: ScheduleType.OPENTALK,
          id: MoreThan(currentCycle.id),
        },
      });

      if (newerCycleEncoded || existingNextCycle) {
        this.appLogService.journeyLog(
          journeyId,
          'Next cycle likely already exists. Skipping.',
          'OpentalkCronService',
          {
            newerCycleId: newerCycleEncoded?.id,
            existingNextCycleId: existingNextCycle?.id,
          },
        );
        return;
      }

      this.appLogService.journeyLog(
        journeyId,
        ' Triggering new opentalk cycle creation!',
        'OpentalkCronService',
      );

      await this.createNextCycle(currentCycle, journeyId);
    } catch (error) {
      this.appLogService.journeyError(
        journeyId,
        '❌ Error in automatic cycle creation check',
        error.stack,
        'OpentalkCronService',
        { error: error.message },
      );
    }
  }

  private async createNextCycle(
    previousCycleEntity: ScheduleCycleEntity,
    journeyId: string,
  ): Promise<void> {
    const staff = await this.staffRepository.find({
      where: { status: StaffStatus.ACTIVE },
      relations: ['user'],
    });

    if (staff.length === 0) {
      this.appLogService.journeyError(
        journeyId,
        '❌ No active staff found',
        'OpentalkCronService',
      );
      return;
    }
    const algorithmStaff: Staff[] = staff.map((s) => ({
      id: s.id,
      username: s.email || `staff_${s.id}`,
    }));

    const previousEvents = await this.eventRepository.find({
      where: {
        cycleId: previousCycleEntity.id,
        type: ScheduleType.OPENTALK,
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
    const startDate = startOfMonth(addDays(lastEventDate, 1));
    const endDate = addMonths(startDate, 1);

    const holidays = await this.holidayRepository.find({
      where: {
        date: Between(
          toDateString(startDate),
          toDateString(addMonths(endDate, 12)),
        ),
      },
    });

    const config: SchedulerConfig = {
      type: ScheduleType.OPENTALK,
      startDate: toDateString(startDate),
      slotSize: 1,
      holidays: holidays.map((h) =>
        typeof h.date === 'string' ? h.date : toDateString(h.date),
      ),
    };

    this.appLogService.stepLog(
      1,
      `Generating opentalk schedule for ${toDateString(startDate)}`,
      'OpentalkCronService',
      journeyId,
      { config },
    );

    const schedule = SchedulingAlgorithm.generateNewCycle(
      algorithmStaff,
      previousCycleData,
      config,
    );
    this.appLogService.stepLog(
      2,
      `Generated opentalk schedule for ${toDateString(startDate)}`,
      'OpentalkCronService',
      journeyId,
      { schedule },
    );
    await this.entityManager.transaction(async (manager) => {
      const newCycle = manager.create(ScheduleCycleEntity, {
        name: `OpenTalk tháng ${startDate.getMonth() + 1}/${startDate.getFullYear()}`,
        type: ScheduleType.OPENTALK,
        description: `Auto-generated schedule for ${startDate.getMonth() + 1}/${startDate.getFullYear()}`,
        status: CycleStatus.DRAFT,
      });

      this.appLogService.stepLog(
        3,
        `Creating new cycle for ${startDate.getMonth() + 1}/${startDate.getFullYear()}`,
        'OpentalkCronService',
        journeyId,
        { cycleName: newCycle.name },
      );

      const savedCycle = await manager.save(ScheduleCycleEntity, newCycle);

      // Create events with participants in memory
      const events = schedule.map((scheduleEvent, i) => {
        const assignedStaffId = scheduleEvent.staffIds[0];
        const assignedStaff = staff.find((s) => s.id === assignedStaffId);

        const eventTitle = `OpenTalk hàng tuần #${i + 1}`;
        const presenterInfo = assignedStaff
          ? assignedStaff.email || assignedStaff.email
          : 'Không rõ';

        const event = manager.create(ScheduleEventEntity, {
          title: eventTitle,
          type: ScheduleType.OPENTALK,
          notes: `Weekly Opentalk - Diễn giả: ${presenterInfo}`,
          eventDate: scheduleEvent.date,
          status: EventStatus.PENDING,
          cycle: savedCycle,
          ...(scheduleEvent.staffIds.length > 0 && {
            eventParticipants: scheduleEvent.staffIds.map((staffId) =>
              manager.create(ScheduleEventParticipantEntity, { staffId }),
            ),
          }),
        });

        return event;
      });

      this.appLogService.stepLog(
        4,
        `Creating ${events.length} events (batch save with participant cascade)`,
        'OpentalkCronService',
        journeyId,
        { eventCount: events.length },
      );

      await manager.save(ScheduleEventEntity, events);

      this.appLogService.journeyLog(
        journeyId,
        `✅ Created new opentalk cycle ${savedCycle.name} with ${events.length} events`,
        'OpentalkCronService',
        { cycleId: savedCycle.id },
      );
    });
  }
}
