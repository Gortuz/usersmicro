import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Inject, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { CreateUserCommand } from './create-user.command';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { User } from 'src/users/domain/entities/user.entity';
import { UserCreatedEvent } from 'src/users/domain/events/user-created.event';
import type { IUserRepository } from 'src/users/domain/repositories/user.repository.interface';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  private readonly logger = new Logger(CreateUserHandler.name);

  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly eventBus: EventBus,
  ) { }

  async execute(command: CreateUserCommand) {
    const { email, password, firstName, lastName } = command;

    this.logger.debug(`📝 Creating user with email: ${email}`);

    if (!email || !password || !firstName || !lastName) {
      this.logger.warn(`⚠️ Missing required fields for email: ${email}`);
      throw new BadRequestException('All fields are required');
    }

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      this.logger.warn(`⚠️ User already exists with email: ${email}`);
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

    this.logger.debug(`✅ User created successfully: ${savedUser.id}`);
    return ResponseHelper.success(savedUser, 'User created successfully');
  }
}