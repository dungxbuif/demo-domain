import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { DatabaseModule } from '@src/common/database/database.module';
import { SharedModule } from '@src/common/shared/shared.module';
import { StaffModule } from '@src/modules/staff/staff.module';
import { AuthModule } from './modules/auth/auth.module';
import { BranchModule } from './modules/branch/branch.module';
import { ScheduleModule } from './modules/schedule/schedule.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    SharedModule,
    DatabaseModule,
    EventEmitterModule.forRoot(),
    UserModule,
    BranchModule,
    AuthModule,
    StaffModule,
    ScheduleModule,
  ],
})
export class AppModule {}
