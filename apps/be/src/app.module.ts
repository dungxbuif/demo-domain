import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { DatabaseModule } from '@src/common/database/database.module';
import { SharedModule } from '@src/common/shared/shared.module';
import { BranchModule } from './modules/branch/branch.module';
import { CleaningScheduleModule } from './modules/cleaning-schedule/cleaning-schedule.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    SharedModule,
    DatabaseModule,
    EventEmitterModule.forRoot(),
    UserModule,
    BranchModule,
    CleaningScheduleModule,
  ],
})
export class AppModule {}
