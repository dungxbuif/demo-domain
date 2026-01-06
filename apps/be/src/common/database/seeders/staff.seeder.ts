import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRole } from '@src/common/constants/user.constants';
import { BranchEntity } from '@src/modules/branch/branch.entity';
import StaffEntity from '@src/modules/staff/staff.entity';
import { Repository } from 'typeorm';
import { logger } from './../../../../node_modules/handlebars/types/index.d';

const mails = [
  'dung.buihuu@ncc.asia',
  'dung.phammanh@ncc.asia',
  'duy.huynhle@ncc.asia',
  'duy.nguyenxuan@ncc.asia',
  'du.levanky@ncc.asia',
  'dat.haquoc@ncc.asia',
  'hien.nguyenthanh@ncc.asia',
  'hoang.tranlehuy@ncc.asia',
  'ho.nguyenphi@ncc.asia',
  'huy.trannam@ncc.asia',
  'huong.nguyenthithanh@ncc.asia',
  'kien.trinhduy@ncc.asia',
  'lich.duongthanh@ncc.asia',
  'loi.huynhphuc@ncc.asia',
  'minh.dovan@ncc.asia',
  'ngan.tonthuy@ncc.asia',
  'nguyen.nguyenphuoc@ncc.asia',
  'phu.nguyenthien@ncc.asia',
  'phuong.nguyenhonghang@ncc.asia',
  'quang.tranduong@ncc.asia',
  'son.cuhoangnguyen@ncc.asia',
  'tam.daonhon@ncc.asia',
  'thang.thieuquang@ncc.asia',
  'thuan.nguyenleanh@ncc.asia',
  'tien.caothicam@ncc.asia',
  'tien.nguyenvan@ncc.asia',
  'trinh.truongthiphuong@ncc.asia',
  'tuan.nguyentrong@ncc.asia',
];

const roleMapping = {
  'ngan.tonthuy@ncc.asia': UserRole.HR,
  'duy.nguyenxuan@ncc.asia': UserRole.GDVP,
  'dung.buihuu@ncc.asia': UserRole.GDVP,
};

@Injectable()
export class StaffSeeder {
  constructor(
    @InjectRepository(StaffEntity)
    private readonly staffRepository: Repository<StaffEntity>,
    @InjectRepository(BranchEntity)
      private readonly branchRepository: Repository<BranchEntity>,
  ) {}

  async seed(): Promise<void> {
    const repositories = [];
    const existingStaff = await this.staffRepository.find({
      where: { email: mails },
    });

    const branch  = await this.branchRepository.findOneBy({ code: 'QN' });
    if (!branch) {
         logger.error('Branch with code QN not found. Staff seeding aborted.');
         return;}
    const    existingEmails = existingStaff.map((staff) => staff.email);
    for (const email of mails) {
      if (existingEmails.includes(email)) {
        continue;
      }
      const staff = this.staffRepository.create({
        email,
        role: roleMapping[email] || UserRole.STAFF,
        isActive: true,
      });
      repositories.push(staff);
    }
    await this.staffRepository.save(repositories);
    console.log('Staff seeding completed!');
  }
}
