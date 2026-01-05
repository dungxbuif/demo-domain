import UserEntity from '@src/modules/user/user.entity';
import { Branch } from '../../modules/branch/branch.entity';
import { Campaign } from '../../modules/campaign/campaign.entity';
import { Channel } from '../../modules/channel/channel.entity';
import { CleaningSchedule } from '../../modules/cleaning-schedule/cleaning-schedule.entity';
import { Holiday } from '../../modules/holiday/holiday.entity';
import { OpenTalkSchedule } from '../../modules/open-talk-schedule/open-talk-schedule.entity';
import { PenaltyType } from '../../modules/penalty-type/penalty-type.entity';
import { Penalty } from '../../modules/penalty/penalty.entity';

const entities = [
  UserEntity,
  Branch,
  Channel,
  Holiday,
  CleaningSchedule,
  OpenTalkSchedule,
  Penalty,
  PenaltyType,
  Campaign,
];
export default entities;
