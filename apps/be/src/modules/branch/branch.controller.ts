import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { Branch } from './branch.entity';
import { BranchService } from './branch.service';

@Controller('branches')
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  @Get()
  findAll(): Promise<Branch[]> {
    return this.branchService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Branch | null> {
    return this.branchService.findOne(+id);
  }

  @Post()
  create(@Body() branchData: Partial<Branch>): Promise<Branch> {
    return this.branchService.create(branchData);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() branchData: Partial<Branch>,
  ): Promise<Branch | null> {
    return this.branchService.update(+id, branchData);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.branchService.remove(+id);
  }
}
