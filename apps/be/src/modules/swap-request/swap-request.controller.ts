import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppRequest } from '@src/common/types';
import { JwtAuthGuard } from '@src/modules/auth/guards/jwt-auth.guard';
import SwapRequestEntity from '@src/modules/swap-request/swap-request.entity';
import { CreateSwapRequestDto } from './dtos/create-swap-request.dto';
import { ReviewSwapRequestDto } from './dtos/review-swap-request.dto';
import { SwapRequestQueryDto } from './dtos/swap-request-query.dto';
import { SwapRequestService } from './swap-request.service';

@ApiTags('Swap Requests')
@Controller('swap-requests')
@UseGuards(JwtAuthGuard)
export class SwapRequestController {
  constructor(private readonly swapRequestService: SwapRequestService) {}

  @Post()
  async create(
    @Req() req: AppRequest,
    @Body() dto: CreateSwapRequestDto,
  ): Promise<SwapRequestEntity> {
    const requesterId = req.user?.staffId;
    return this.swapRequestService.create(dto, requesterId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all swap requests' })
  @ApiResponse({
    status: 200,
    description: 'Swap requests retrieved successfully',
  })
  async findAll(
    @Query() query: SwapRequestQueryDto,
  ): Promise<SwapRequestEntity[]> {
    return this.swapRequestService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a swap request by ID' })
  @ApiResponse({
    status: 200,
    description: 'Swap request retrieved successfully',
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SwapRequestEntity> {
    return this.swapRequestService.findOne(id);
  }

  @Put(':id/review')
  async review(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ReviewSwapRequestDto,
  ) {
    return this.swapRequestService.review(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a swap request' })
  @ApiResponse({
    status: 200,
    description: 'Swap request deleted successfully',
  })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.swapRequestService.delete(id);
  }
}
