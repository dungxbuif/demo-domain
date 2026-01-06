import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { ScheduleDefinition } from './entities/schedule-definition.entity';
import { ScheduleEvent } from './entities/schedule-event.entity';
import { ScheduleAssignment } from './entities/schedule-assignment.entity';
import { ScheduleSwapRequest } from './entities/schedule-swap-request.entity';
import StaffEntity from '../staff/staff.entity';

// Services
import { ScheduleDefinitionService } from './schedule-definition.service';
import { ScheduleEventService } from './schedule-event.service';
import { ScheduleAssignmentService } from './schedule-assignment.service';
import { ScheduleSwapService } from './schedule-swap.service';

// Controllers
import { ScheduleDefinitionController } from './schedule-definition.controller';
import { ScheduleEventController } from './schedule-event.controller';
import { ScheduleAssignmentController } from './schedule-assignment.controller';
import { ScheduleSwapController } from './schedule-swap.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ScheduleDefinition,
      ScheduleEvent,
      ScheduleAssignment,
      ScheduleSwapRequest,
      StaffEntity,
    ]),
  ],
  controllers: [
    ScheduleDefinitionController,
    ScheduleEventController,
    ScheduleAssignmentController,
    ScheduleSwapController,
  ],
  providers: [
    ScheduleDefinitionService,
    ScheduleEventService,
    ScheduleAssignmentService,
    ScheduleSwapService,
  ],
  exports: [
    ScheduleDefinitionService,
    ScheduleEventService,
    ScheduleAssignmentService,
    ScheduleSwapService,
  ],
})
export class ScheduleModule {}
