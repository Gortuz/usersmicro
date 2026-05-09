import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetAllUsersQuery } from './get-all-users.query';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { User } from '../../../domain/entities/user.entity';

console.log('PATH HANDLER:', require.resolve('./get-all-users.query'));

@QueryHandler(GetAllUsersQuery)
export class GetAllUsersHandler implements IQueryHandler<GetAllUsersQuery> {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {
    console.log('Handler Init:', GetAllUsersQuery.name, 'Metadata:', Reflect.getMetadata('__query__', GetAllUsersQuery));
    console.log('Same as Controller?', (global as any).ControllerQueryRef === GetAllUsersQuery);
  }

  async execute(query: GetAllUsersQuery): Promise<User[]> {
    return await this.userRepository.findAll();
  }
}
