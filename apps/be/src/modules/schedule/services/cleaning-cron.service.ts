import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { EventStatus, ScheduleType } from '@qnoffice/shared';
import {
    CleaningReminderPayload,
    NotificationEvent,
} from '@src/common/events/notification.events';
import { AppLogService } from '@src/common/shared/services/app-log.service';
import { getCurrentDateString } from '@src/common/utils/date.utils';
import { addDays } from 'date-fns';
import { LessThan, MoreThanOrEqual, Repository } from 'typeorm';
import ScheduleEventEntity from '../enties/schedule-event.entity';

@Injectable()
export class CleaningCronService {
  private readonly logger = new Logger(CleaningCronService.name);

  constructor(
    @InjectRepository(ScheduleEventEntity)
    private readonly eventRepository: Repository<ScheduleEventEntity>,
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
          newestEventDate: pastActiveEvents[pastActiveEvents.length - 1]?.eventDate || null,
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

  async sendMorningReminder(): Promise<void> {
    this.logger.log('Running: Send cleaning morning reminder at 8h UTC+7');

    const today = getCurrentDateString();

    const todayEvents = await this.eventRepository.find({
      where: {
        type: ScheduleType.CLEANING,
        eventDate: today,
        status: EventStatus.ACTIVE,
      },
      relations: ['eventParticipants', 'eventParticipants.staff'],
    });

    for (const event of todayEvents) {
      const participants = event.eventParticipants || [];
      const participantIds = participants.map((p) => p.staffId);
      const participantEmails = participants
        .map((p) => p.staff?.email)
        .filter(Boolean) as string[];

      if (participantIds.length > 0) {
        const payload: CleaningReminderPayload = {
          eventId: event.id,
          eventDate: event.eventDate,
          participantIds,
          participantEmails,
          type: 'morning',
        };
        this.logger.log(
          `Sending cleaning morning reminder for event ${event.id}`,
        );
        this.eventEmitter.emit(
          NotificationEvent.CLEANING_MORNING_REMINDER,
          payload,
        );
      }
    }

    this.logger.log(
      `Sent morning reminders for ${todayEvents.length} cleaning events`,
    );
  }

  async sendAfternoonReminder(): Promise<void> {
    this.logger.log('Running: Send cleaning afternoon reminder at 17h UTC+7');

    const today = getCurrentDateString();
    const tomorrow = addDays(new Date(today), 1).toISOString().split('T')[0];

    const todayEvents = await this.eventRepository.find({
      where: {
        type: ScheduleType.CLEANING,
        eventDate: today,
        status: EventStatus.ACTIVE,
      },
      relations: ['eventParticipants', 'eventParticipants.staff'],
    });

    for (const event of todayEvents) {
      const participants = event.eventParticipants || [];
      const participantIds = participants.map((p) => p.staffId);
      const participantEmails = participants
        .map((p) => p.staff?.email)
        .filter(Boolean) as string[];

      if (participantIds.length > 0) {
        const payload: CleaningReminderPayload = {
          eventId: event.id,
          eventDate: event.eventDate,
          participantIds,
          participantEmails,
          type: 'afternoon',
        };
        this.logger.log(
          `Sending cleaning afternoon reminder for event ${event.id}`,
        );
        this.eventEmitter.emit(
          NotificationEvent.CLEANING_AFTERNOON_REMINDER,
          payload,
        );
      }
    }

    const tomorrowEvents = await this.eventRepository.find({
      where: {
        type: ScheduleType.CLEANING,
        eventDate: tomorrow,
        status: EventStatus.ACTIVE,
      },
      relations: ['eventParticipants', 'eventParticipants.staff'],
    });

    for (const event of tomorrowEvents) {
      const participants = event.eventParticipants || [];
      const participantIds = participants.map((p) => p.staffId);
      const participantEmails = participants
        .map((p) => p.staff?.email)
        .filter(Boolean) as string[];

      if (participantIds.length > 0) {
        const payload: CleaningReminderPayload = {
          eventId: event.id,
          eventDate: event.eventDate,
          participantIds,
          participantEmails,
          type: 'nextday',
        };
        this.logger.log(
          `Sending cleaning next day reminder for event ${event.id}`,
        );
        this.eventEmitter.emit(
          NotificationEvent.CLEANING_NEXT_DAY_REMINDER,
          payload,
        );
      }
    }

    this.logger.log(
      `Sent afternoon reminders for ${todayEvents.length} events and next day reminders for ${tomorrowEvents.length} events`,
    );
  }
}
