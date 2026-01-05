import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StaffController } from '@src/modules/staff/staff.controller';
import StaffEntity from '@src/modules/staff/staff.entity';
import { StaffService } from '@src/modules/staff/staff.service';
import { UserModule } from '@src/modules/user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([StaffEntity]), UserModule],
  controllers: [StaffController],
  providers: [StaffService],
})
export class StaffModule {}
