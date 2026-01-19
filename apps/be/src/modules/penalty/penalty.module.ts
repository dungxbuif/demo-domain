import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PenaltyTypeModule } from '../penalty-type/penalty-type.module';
import { PenaltyProofEntity } from './entities/penalty-proof.entity';
import { PenaltyController } from './penalty.controller';
import { Penalty } from './penalty.entity';
import { PenaltyService } from './penalty.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Penalty, PenaltyProofEntity]),
    PenaltyTypeModule,
  ],
  controllers: [PenaltyController],
  providers: [PenaltyService],
  exports: [PenaltyService],
})
export class PenaltyModule {}
