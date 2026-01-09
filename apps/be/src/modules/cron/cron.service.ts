import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AppLogService } from '@src/common/shared/services/app-log.service';
import { AuditLogService } from '@src/modules/audit-log/audit-log.service';
import { CleaningCronService } from '@src/modules/schedule/services/cleaning-cron.service';
import { OpentalkCronService } from '@src/modules/schedule/services/opentalk-cron.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(
    private readonly cleaningCronService: CleaningCronService,
    private readonly opentalkCronService: OpentalkCronService,
    private readonly auditLogService: AuditLogService,
    private readonly appLogService: AppLogService,
  ) {}

  @Cron('0 0 * * 2-6', {
    name: 'mark-cleaning-events-completed',
    timeZone: 'Asia/Bangkok',
  })
  async markCleaningEventsCompleted(): Promise<void> {
    const journeyId = uuidv4();
    const executionTime = new Date();
    
    this.logger.log(
      '=== CRON: Mark Cleaning Events Completed (00:00 Tue-Sat UTC+7) ===',
    );

    this.appLogService.journeyLog(
      journeyId,
      'Starting cleaning events completion cron job (Tuesday-Saturday)',
      'CronService',
      {
        cronJob: 'mark-cleaning-events-completed',
        dayOfWeek: executionTime.getDay(),
        dayName: executionTime.toLocaleDateString('en-US', { weekday: 'long' }),
        executionTime: executionTime.toISOString(),
        timezone: 'Asia/Bangkok',
        localTime: executionTime.toLocaleString('en-US', {
          timeZone: 'Asia/Bangkok',
        }),
      },
    );

    try {
      this.appLogService.stepLog(
        1,
        'Executing cleaning events cleanup',
        'CronService',
        journeyId,
      );

      await this.cleaningCronService.markPastEventsCompleted(journeyId);

      this.logger.log('✅ Successfully marked past cleaning events as completed');
      this.appLogService.journeyLog(
        journeyId,
        '✅ Successfully marked past cleaning events as completed',
        'CronService',
      );
    } catch (error) {
      this.logger.error('❌ Error marking past cleaning events completed', error);
      this.appLogService.journeyError(
        journeyId,
        '❌ Error marking past cleaning events completed',
        error.stack,
        'CronService',
        { error: error.message },
      );
    }
  }

  @Cron('0 0 * * 0', {
    name: 'mark-opentalk-events-completed',
    timeZone: 'Asia/Bangkok',
  })
  async markOpentalkEventsCompleted(): Promise<void> {
    const journeyId = uuidv4();
    const executionTime = new Date();
    
    this.logger.log(
      '=== CRON: Mark Opentalk Events Completed (00:00 Sunday UTC+7) ===',
    );

    this.appLogService.journeyLog(
      journeyId,
      'Starting opentalk events completion cron job (Sunday)',
      'CronService',
      {
        cronJob: 'mark-opentalk-events-completed',
        dayOfWeek: executionTime.getDay(),
        dayName: executionTime.toLocaleDateString('en-US', { weekday: 'long' }),
        executionTime: executionTime.toISOString(),
        timezone: 'Asia/Bangkok',
        localTime: executionTime.toLocaleString('en-US', {
          timeZone: 'Asia/Bangkok',
        }),
      },
    );

    try {
      this.appLogService.stepLog(
        1,
        'Executing opentalk events cleanup and activation',
        'CronService',
        journeyId,
      );

      await this.opentalkCronService.markPastEventsCompleted(journeyId);

      this.logger.log('✅ Successfully marked past opentalk events as completed');
      this.appLogService.journeyLog(
        journeyId,
        '✅ Successfully marked past opentalk events as completed',
        'CronService',
      );
    } catch (error) {
      this.logger.error('❌ Error marking past opentalk events completed', error);
      this.appLogService.journeyError(
        journeyId,
        '❌ Error marking past opentalk events completed',
        error.stack,
        'CronService',
        { error: error.message },
      );
    }
  }

  @Cron('0 2 1 * *', {
    name: 'cleanup-old-audit-logs',
    timeZone: 'Asia/Bangkok',
  })
  async cleanupOldAuditLogs(): Promise<void> {
    const journeyId = uuidv4();
    this.logger.log(
      '=== CRON: Cleanup Old Audit Logs (02:00 1st of month UTC+7) ===',
    );

    this.appLogService.journeyLog(
      journeyId,
      'Starting monthly audit log cleanup cron job',
      'CronService',
      { cronJob: 'cleanup-old-audit-logs' },
    );

    try {
      this.appLogService.stepLog(
        1,
        'Deleting audit logs older than 30 days',
        'CronService',
        journeyId,
      );

      const deletedCount = await this.auditLogService.deleteOldLogs(30);

      this.logger.log(
        `✅ Successfully deleted ${deletedCount} old audit log entries`,
      );
      this.appLogService.journeyLog(
        journeyId,
        `✅ Successfully deleted ${deletedCount} old audit log entries`,
        'CronService',
        { deletedCount },
      );
    } catch (error) {
      this.logger.error('❌ Error cleaning up old audit logs', error);
      this.appLogService.journeyError(
        journeyId,
        '❌ Error cleaning up old audit logs',
        error.stack,
        'CronService',
        { error: error.message },
      );
    }
  }
}
