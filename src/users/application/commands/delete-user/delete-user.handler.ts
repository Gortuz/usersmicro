import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Inject, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { DeleteUserCommand } from './delete-user.command';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { UserDeletedEvent } from 'src/users/domain/events/user-deleted.event';
import type { IUserRepository } from 'src/users/domain/repositories/user.repository.interface';

@CommandHandler(DeleteUserCommand)
export class DeleteUserHandler implements ICommandHandler<DeleteUserCommand> {
  private readonly logger = new Logger(DeleteUserHandler.name);

  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly eventBus: EventBus,
  ) { }

  async execute(command: DeleteUserCommand) {
    const { id } = command;

    this.logger.debug(`📝 Deleting user with ID: ${id}`);

    if (!id) {
      this.logger.warn(`⚠️ User ID is required`);
      throw new BadRequestException('User ID is required');
    }

    const user = await this.userRepository.findById(id);
    if (!user) {
      this.logger.warn(`⚠️ User not found with ID: ${id}`);
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.userRepository.delete(id);

    this.eventBus.publish(new UserDeletedEvent(id));

    this.logger.debug(`✅ User deleted successfully: ${id}`);
    return ResponseHelper.success({ id }, 'User deleted successfully');
  }
}

