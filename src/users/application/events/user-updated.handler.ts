import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UserUpdatedEvent } from '../../domain/events/user-updated.event';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface';

@EventsHandler(UserUpdatedEvent)
export class UserUpdatedHandler implements IEventHandler<UserUpdatedEvent> {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async handle(event: UserUpdatedEvent) {
    console.log('Handling UserUpdatedEvent:', event.id);
    
    const user = await this.userRepository.findById(event.id);
    if (user) {
      if (event.email !== undefined) user.email = event.email;
      if (event.firstName !== undefined) user.firstName = event.firstName;
      if (event.lastName !== undefined) user.lastName = event.lastName;
      if (event.isActive !== undefined) user.isActive = event.isActive;
      
      await this.userRepository.syncProjection(user);
    }
  }
}
