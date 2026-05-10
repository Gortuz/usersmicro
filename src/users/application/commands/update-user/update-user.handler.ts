import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Inject, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { UpdateUserCommand } from './update-user.command';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { UserUpdatedEvent } from 'src/users/domain/events/user-updated.event';
import type { IUserRepository } from 'src/users/domain/repositories/user.repository.interface';

@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler implements ICommandHandler<UpdateUserCommand> {
  private readonly logger = new Logger(UpdateUserHandler.name);

  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly eventBus: EventBus,
  ) { }

  async execute(command: UpdateUserCommand) {
    const { id, email, firstName, lastName, password, isActive } = command;

    this.logger.debug(`📝 Updating user with ID: ${id}`);

    const user = await this.userRepository.findById(id);
    if (!user) {
      this.logger.warn(`⚠️ User not found with ID: ${id}`);
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (email && email !== user.email) {
      const userWithEmail = await this.userRepository.findByEmail(email);
      if (userWithEmail && userWithEmail.id !== id) {
        this.logger.warn(`⚠️ Email already taken: ${email}`);
        throw new ConflictException(`Email ${email} is already taken by another user`);
      }
    }

    if (email !== undefined) user.email = email;
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (password !== undefined) user.password = password; 
    if (isActive !== undefined) user.isActive = isActive;

    const updatedUser = await this.userRepository.save(user);

    this.eventBus.publish(new UserUpdatedEvent(
      updatedUser.id,
      email,
      firstName,
      lastName,
      isActive
    ));

    this.logger.debug(`✅ User updated successfully: ${updatedUser.id}`);
    return ResponseHelper.success(updatedUser, 'User updated successfully');
  }
}

