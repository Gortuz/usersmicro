// En los handlers va la lógica de negocio en general

import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Inject, ConflictException, BadRequestException } from '@nestjs/common';
import { CreateUserCommand } from './create-user.command';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { User } from '../../../domain/entities/user.entity';
import { UserCreatedEvent } from '../../../domain/events/user-created.event';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly eventBus: EventBus,
  ) { }

  async execute(command: CreateUserCommand): Promise<User> {
    const { email, password, firstName, lastName } = command;

    if (!email || !password || !firstName || !lastName) {
      throw new BadRequestException('All fields are required');
    }

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictException(`User with email ${email} already exists`);
    }

    const user = new User();
    user.email = email;
    user.password = password; // TODO: hash
    user.firstName = firstName;
    user.lastName = lastName;

    const savedUser = await this.userRepository.save(user);

    const userCreatedEvent = new UserCreatedEvent(
      savedUser.id,
      savedUser.email,
      savedUser.firstName,
      savedUser.lastName,
      savedUser.password
    );

    this.eventBus.publish(userCreatedEvent);

    return savedUser;
  }
}