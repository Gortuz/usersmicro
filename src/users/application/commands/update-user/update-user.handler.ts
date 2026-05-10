import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { UpdateUserCommand } from './update-user.command';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { User } from '../../../domain/entities/user.entity';
import { UserUpdatedEvent } from '../../../domain/events/user-updated.event';

@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler implements ICommandHandler<UpdateUserCommand> {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly eventBus: EventBus,
  ) { }

  async execute(command: UpdateUserCommand): Promise<User> {
    const { id, email, firstName, lastName, password } = command;

    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (email && email !== user.email) {
      const userWithEmail = await this.userRepository.findByEmail(email);
      if (userWithEmail && userWithEmail.id !== id) {
        throw new ConflictException(`Email ${email} is already taken by another user`);
      }
    }

    if (email !== undefined) user.email = email;
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (password !== undefined) user.password = password; 

    const updatedUser = await this.userRepository.save(user);

    this.eventBus.publish(new UserUpdatedEvent(
      updatedUser.id,
      email,
      firstName,
      lastName
    ));

    return updatedUser;
  }
}
