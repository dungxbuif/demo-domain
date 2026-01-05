import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Branch } from './branch.entity';

@Injectable()
export class BranchService {
  constructor(
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
  ) {}

  async findAll(): Promise<Branch[]> {
    return this.branchRepository.find({ relations: ['users'] });
  }

  async findOne(id: number): Promise<Branch | null> {
    return this.branchRepository.findOne({
      where: { id },
      relations: ['users'],
    });
  }

  async create(branchData: Partial<Branch>): Promise<Branch> {
    const branch = this.branchRepository.create(branchData);
    return this.branchRepository.save(branch);
  }

  async update(
    id: number,
    branchData: Partial<Branch>,
  ): Promise<Branch | null> {
    await this.branchRepository.update(id, branchData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.branchRepository.delete(id);
  }
}
