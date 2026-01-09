import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventStatus, ScheduleType } from '@qnoffice/shared';
import { AppLogService } from '@src/common/shared/services/app-log.service';
import { getCurrentDateString } from '@src/common/utils/date.utils';
import { addDays } from 'date-fns';
import { Between, LessThan, Repository } from 'typeorm';
import ScheduleEventEntity from '../enties/schedule-event.entity';

@Injectable()
export class OpentalkCronService {

  constructor(
    @InjectRepository(ScheduleEventEntity)
    private readonly eventRepository: Repository<ScheduleEventEntity>,
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
    const sevenDaysFromNow = addDays(new Date(today), 7)
      .toISOString()
      .split('T')[0];

    try {
      // Step 1: Find all ACTIVE events before today
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
          status: EventStatus.ACTIVE,
        },
        order: {
          eventDate: 'ASC',
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
          newestEventDate: pastActiveEvents[pastActiveEvents.length - 1]?.eventDate || null,
          today,
        },
      );

      // Step 2: Mark past ACTIVE events as COMPLETED
      if (pastActiveEvents.length > 0) {
        this.appLogService.stepLog(
          3,
          'Marking past ACTIVE opentalk events as COMPLETED',
          'OpentalkCronService',
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
            type: ScheduleType.OPENTALK,
            eventDate: LessThan(today),
            status: EventStatus.ACTIVE,
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

      // Step 3: Find the next PENDING event within 7 days to activate
      this.appLogService.stepLog(
        5,
        'Finding next PENDING opentalk event within 7 days to activate',
        'OpentalkCronService',
        journeyId,
        { fromDate: today, toDate: sevenDaysFromNow },
      );

      const nextPendingEvent = await this.eventRepository.findOne({
        where: {
          type: ScheduleType.OPENTALK,
          eventDate: Between(today, sevenDaysFromNow),
          status: EventStatus.PENDING,
        },
        order: {
          eventDate: 'ASC',
        },
      });

      // Step 4: Activate the next PENDING event within 7 days
      if (nextPendingEvent) {
        const daysFromToday = Math.ceil(
          (new Date(nextPendingEvent.eventDate).getTime() -
            new Date(today).getTime()) /
            (1000 * 60 * 60 * 24),
        );

        this.appLogService.stepLog(
          6,
          'Activating next PENDING opentalk event',
          'OpentalkCronService',
          journeyId,
          {
            eventId: nextPendingEvent.id,
            eventDate: nextPendingEvent.eventDate,
            title: nextPendingEvent.title,
            cycleId: nextPendingEvent.cycleId,
            daysFromToday,
            withinSevenDays: daysFromToday <= 7,
            searchWindow: {
              from: today,
              to: sevenDaysFromNow,
              windowDays: 7,
            },
            statusBefore: EventStatus.PENDING,
            statusAfter: EventStatus.ACTIVE,
            metadata: nextPendingEvent.metadata,
          },
        );

        await this.eventRepository.update(
          { id: nextPendingEvent.id },
          { status: EventStatus.ACTIVE },
        );

        this.appLogService.stepLog(
          7,
          `Successfully activated opentalk event ${nextPendingEvent.id}`,
          'OpentalkCronService',
          journeyId,
          {
            eventId: nextPendingEvent.id,
            eventDate: nextPendingEvent.eventDate,
            title: nextPendingEvent.title,
            newStatus: EventStatus.ACTIVE,
            activatedAt: new Date().toISOString(),
            daysUntilEvent: daysFromToday,
          },
        );
      } else {
        this.appLogService.stepLog(
          6,
          'No PENDING opentalk events found within 7 days to activate',
          'OpentalkCronService',
          journeyId,
          {
            searchRange: `${today} to ${sevenDaysFromNow}`,
            searchCriteria: {
              type: ScheduleType.OPENTALK,
              status: EventStatus.PENDING,
              dateRange: {
                from: today,
                to: sevenDaysFromNow,
              },
            },
            reason: 'No PENDING events found within 7-day window',
            windowDays: 7,
          },
        );
      }

      this.appLogService.journeyLog(
        journeyId,
        '✅ Successfully completed opentalk events process',
        'OpentalkCronService',
        {
          completedCount: pastActiveEvents.length,
          activatedEvent: nextPendingEvent?.id || null,
          activatedEventDate: nextPendingEvent?.eventDate || null,
          executionDate: today,
          searchWindow: {
            from: today,
            to: sevenDaysFromNow,
          },
          totalStepsExecuted: nextPendingEvent ? 7 : 6,
        },
      );
    } catch (error) {
      this.appLogService.journeyError(
        journeyId,
        '❌ Error in opentalk events completion process',
        error.stack,
        'OpentalkCronService',
        { error: error.message },
      );
      throw error;
    }
  }

  async checkSlideSubmission(): Promise<void> {}
}
