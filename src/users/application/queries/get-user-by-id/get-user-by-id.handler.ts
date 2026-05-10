import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, Logger } from '@nestjs/common';
import { GetUserByIdQuery } from './get-user-by-id.query';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import type { IUserRepository } from 'src/users/domain/repositories/user.repository.interface';

@QueryHandler(GetUserByIdQuery)
export class GetUserByIdHandler implements IQueryHandler<GetUserByIdQuery> {
  private readonly logger = new Logger(GetUserByIdHandler.name);

  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) { }

  async execute(query: GetUserByIdQuery) {
    const { id } = query;

    this.logger.debug(`🔍 Finding user with id: ${id}`);

    const user = await this.userRepository.findById(id);

    if (!user) {
      this.logger.warn(`⚠️ User not found with id: ${id}`);
      throw new NotFoundException('User not found');
    }

    

    this.logger.debug(`✅ User found: ${user.id}`);
    return ResponseHelper.success(user, 'User retrieved successfully');
  }
}