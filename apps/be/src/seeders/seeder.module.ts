import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from '@src/common/database/database.module';
import { BranchEntity } from '@src/modules/branch/branch.entity';
import StaffEntity from '@src/modules/staff/staff.entity';
import { BranchSeeder } from '@src/seeders/branch.seeder';
import { DatabaseSeeder } from '@src/seeders/database.seeder';
import { StaffSeeder } from '@src/seeders/staff.seeder';

@Module({
  imports: [
    DatabaseModule,
    TypeOrmModule.forFeature([BranchEntity, StaffEntity]),
  ],
  providers: [BranchSeeder, StaffSeeder, DatabaseSeeder],
  exports: [DatabaseSeeder],
})
export class SeederModule {}
