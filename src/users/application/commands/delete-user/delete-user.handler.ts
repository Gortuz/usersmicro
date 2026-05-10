import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { DeleteUserCommand } from './delete-user.command';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { UserDeletedEvent } from '../../../domain/events/user-deleted.event';

@CommandHandler(DeleteUserCommand)
export class DeleteUserHandler implements ICommandHandler<DeleteUserCommand> {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly eventBus: EventBus,
  ) { }

  async execute(command: DeleteUserCommand): Promise<void> {
    const { id } = command;

    if (!id) {
      throw new BadRequestException('User ID is required');
    }

    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.userRepository.delete(id);

    this.eventBus.publish(new UserDeletedEvent(id));
  }
}
