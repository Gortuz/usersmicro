import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './domain/entities/user.entity';
import { UserRepository } from './infrastructure/repositories/user.repository';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateUserHandler } from './application/commands/create-user/create-user.handler';
import { UpdateUserHandler } from './application/commands/update-user/update-user.handler';
import { DeleteUserHandler } from './application/commands/delete-user/delete-user.handler';
import { GetAllUsersHandler } from './application/queries/get-all-users/get-all-users.handler';
import { GetUserByIdHandler } from './application/queries/get-user-by-id/get-user-by-id.handler';
import { UsersController } from './infrastructure/controllers/users.controller';
import { UserCreatedHandler } from './application/events/user-created.handler';
import { UserUpdatedHandler } from './application/events/user-updated.handler';
import { UserDeletedHandler } from './application/events/user-deleted.handler';

export const CommandHandlers = [
  CreateUserHandler,
  UpdateUserHandler,
  DeleteUserHandler,
];

export const QueryHandlers = [
  GetAllUsersHandler,
  GetUserByIdHandler,
];

export const EventHandlers = [
  UserCreatedHandler,
  UserUpdatedHandler,
  UserDeletedHandler,
];

@Module({
  imports: [
    CqrsModule,
    // Registramos la entidad en AMBAS conexiones para este módulo
    TypeOrmModule.forFeature([User], 'write_connection'),
    TypeOrmModule.forFeature([User], 'read_connection'),
  ],
  controllers: [UsersController],
  providers: [
    ...QueryHandlers,
    ...CommandHandlers,
    ...EventHandlers,
    {
      provide: 'IUserRepository', // Usamos un token para Inversión de Dependencias
      useClass: UserRepository,
    },
  ],
  exports: ['IUserRepository'],
})
export class UsersModule { }