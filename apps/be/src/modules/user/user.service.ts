import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { AppEventEnum } from '@src/common/constants';
import { isEmpty } from 'lodash';
import { In, Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  private async create(user: Partial<User>) {
    const newUser = this.userRepository.create(user);
    return this.userRepository.save(newUser);
  }

  async getUserByClanData(payload: {
    id?: string;
    username?: string;
    clan?: { clan_id: string; clan_nick: string };
  }) {
    const { id, username, clan } = payload;
    if (!id && !username && isEmpty(clan)) {
      this.logger.warn(
        'getUserByClanData called without id, username or clan data',
      );
      return null;
    }
    const query = {};
    if (id) {
      Object.assign(query, { id });
    }
    if (username) {
      Object.assign(query, { username });
    }
    if (clan) {
      Object.assign(query, {
        clanMetaData: `clanMetaData @> '[{"clan_id": "${clan.clan_id}"}]'`,
      });
    }
    return this.userRepository.findOneBy(query);
  }

  async getManyByIdsAndUsernames({
    ids,
    mezonUserIds,
  }: {
    ids?: string[];
    mezonUserIds?: string[];
  }) {
    const orConditions: Array<import('typeorm').FindOptionsWhere<User>> = [];
    if (ids?.length) {
      orConditions.push({ id: In(ids.map((id) => parseInt(id))) });
    }
    if (mezonUserIds?.length) {
      orConditions.push({ mezon_user_id: In(mezonUserIds) });
    }
    if (orConditions.length === 0) {
      return [];
    }
    return this.userRepository.find({ where: orConditions });
  }

  @OnEvent(AppEventEnum.CREATE_USER)
  async handleUserCreatedEvent(payload: { id: string } & Partial<User>) {
    const existingUser = await this.userRepository.findOneBy({
      id: parseInt(payload.id),
    });
    if (existingUser) {
      // Update existing user with new data
      Object.assign(existingUser, payload);
      existingUser.id = parseInt(payload.id);
      await this.userRepository.save(existingUser);
      return;
    }
    // Create new user
    const newUserData = { ...payload };
    delete newUserData.id; // Let the database auto-generate the ID
    await this.create(newUserData);
  }
}
