import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import SwapRequestEntity from '@src/modules/schedule/enties/swap-request.entity';
import { SwapRequestController } from './swap-request.controller';
import { SwapRequestService } from './swap-request.service';

@Module({
  imports: [TypeOrmModule.forFeature([SwapRequestEntity])],
  controllers: [SwapRequestController],
  providers: [SwapRequestService],
  exports: [SwapRequestService],
})
export class SwapRequestModule {}
