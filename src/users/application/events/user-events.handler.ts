import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UserCreatedEvent } from '../../domain/events/user-created.event';
import { UserUpdatedEvent } from '../../domain/events/user-updated.event';
import { UserDeletedEvent } from '../../domain/events/user-deleted.event';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { User } from '../../domain/entities/user.entity';

@EventsHandler(UserCreatedEvent, UserUpdatedEvent, UserDeletedEvent)
export class UserEventsHandler implements IEventHandler<UserCreatedEvent | UserUpdatedEvent | UserDeletedEvent> {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async handle(event: UserCreatedEvent | UserUpdatedEvent | UserDeletedEvent) {
    console.log('Handling event:', event.constructor.name);

    if (event instanceof UserCreatedEvent) {
      const user = new User();
      user.id = event.id;
      user.email = event.email;
      user.firstName = event.firstName;
      user.lastName = event.lastName;
      await this.userRepository.syncProjection(user);
    } 
    
    else if (event instanceof UserUpdatedEvent) {
      const user = await this.userRepository.findById(event.id);
      if (user) {
        if (event.email !== undefined) user.email = event.email;
        if (event.firstName !== undefined) user.firstName = event.firstName;
        if (event.lastName !== undefined) user.lastName = event.lastName;
        if (event.isActive !== undefined) user.isActive = event.isActive;
        await this.userRepository.syncProjection(user);
      }
    } 
    
    else if (event instanceof UserDeletedEvent) {
      await this.userRepository.deleteProjection(event.id);
    }
  }
}
