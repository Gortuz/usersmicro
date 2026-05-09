import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UserCreatedEvent } from '../../domain/events/user-created.event';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { User } from '../../domain/entities/user.entity';

@EventsHandler(UserCreatedEvent)
export class UserCreatedHandler implements IEventHandler<UserCreatedEvent> {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async handle(event: UserCreatedEvent) {
    console.log('Handling UserCreatedEvent:', event.id);
    
    const user = new User();
    user.id = event.id;
    user.email = event.email;
    user.firstName = event.firstName;
    user.lastName = event.lastName;
    user.password = event.password;
    
    await this.userRepository.syncProjection(user);
  }
}
