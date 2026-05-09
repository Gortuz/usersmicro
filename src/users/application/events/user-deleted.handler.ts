import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UserDeletedEvent } from '../../domain/events/user-deleted.event';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface';

@EventsHandler(UserDeletedEvent)
export class UserDeletedHandler implements IEventHandler<UserDeletedEvent> {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async handle(event: UserDeletedEvent) {
    console.log('Handling UserDeletedEvent:', event.id);
    await this.userRepository.deleteProjection(event.id);
  }
}
