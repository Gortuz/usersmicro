import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { GetAllUsersQuery } from './get-all-users.query';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import type { IUserRepository } from 'src/users/domain/repositories/user.repository.interface';

@QueryHandler(GetAllUsersQuery)
export class GetAllUsersHandler implements IQueryHandler<GetAllUsersQuery> {
  private readonly logger = new Logger(GetAllUsersHandler.name);

  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) { }

  async execute(query: GetAllUsersQuery) {
    this.logger.debug('🔍 Fetching all users');
    
    const users = await this.userRepository.findAll();
    
    this.logger.debug(`✅ Found ${users.length} users`);
    return ResponseHelper.success(users, 'Users retrieved successfully');
  }
}

