import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
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

    // Buscamos en la base de datos de ESCRITURA para asegurar consistencia
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (email !== undefined) user.email = email;
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (password !== undefined) user.password = password; // Remember to hash if provided

    const updatedUser = await this.userRepository.save(user);

    // Publicamos el evento para la proyección
    this.eventBus.publish(new UserUpdatedEvent(
      updatedUser.id,
      email,
      firstName,
      lastName
    ));

    return updatedUser;
  }
}
