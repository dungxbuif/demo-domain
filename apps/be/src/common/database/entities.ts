import { BranchEntity } from '@src/modules/branch/branch.entity';
import { Campaign } from '@src/modules/campaign/campaign.entity';
import { Channel } from '@src/modules/channel/channel.entity';
import HolidayEntity from '@src/modules/holiday/holiday.entity';
import { PenaltyType } from '@src/modules/penalty-type/penalty-type.entity';
import { Penalty } from '@src/modules/penalty/penalty.entity';
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
];
export default entities;
