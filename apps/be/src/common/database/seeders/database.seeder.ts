import { Injectable } from '@nestjs/common';
import { StaffSeeder } from '@src/common/database/seeders/staff.seeder';
import { BranchSeeder } from './branch.seeder';

@Injectable()
export class DatabaseSeeder {
  constructor(
    private readonly branchSeeder: BranchSeeder,
    private readonly staffSeeder: StaffSeeder,
  ) {}

  async seed(): Promise<void> {
    console.log('Starting database seeding...');

    try {
      await this.branchSeeder.seed();
      await this.staffSeeder.seed();
      console.log('Database seeding completed successfully!');
    } catch (error) {
      console.error('Error during database seeding:', error);
      throw error;
    }
  }
}
