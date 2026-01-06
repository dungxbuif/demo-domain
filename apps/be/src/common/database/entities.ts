import { BranchEntity } from '@src/modules/branch/branch.entity';
import { Campaign } from '@src/modules/campaign/campaign.entity';
import { Channel } from '@src/modules/channel/channel.entity';
import HolidayEntity from '@src/modules/holiday/holiday.entity';
import { PenaltyType } from '@src/modules/penalty-type/penalty-type.entity';
import { Penalty } from '@src/modules/penalty/penalty.entity';
import { ScheduleAssignment } from '@src/modules/schedule/entities/schedule-assignment.entity';
import { ScheduleDefinition } from '@src/modules/schedule/entities/schedule-definition.entity';
import { ScheduleEvent } from '@src/modules/schedule/entities/schedule-event.entity';
import { ScheduleSwapRequest } from '@src/modules/schedule/entities/schedule-swap-request.entity';
import StaffEntity from '@src/modules/staff/staff.entity';
import UserEntity from '@src/modules/user/user.entity';

const entities = [
  UserEntity,
  BranchEntity,
  StaffEntity,
  Channel,
  HolidayEntity,
  Penalty,
  PenaltyType,
  Campaign,
  ScheduleDefinition,
  ScheduleEvent,
  ScheduleAssignment,
  ScheduleSwapRequest,
];
export default entities;
