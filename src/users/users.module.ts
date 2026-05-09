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

export const CommandHandlers = [
  CreateUserHandler,
  UpdateUserHandler,
  DeleteUserHandler,
];

export const QueryHandlers = [
  GetAllUsersHandler,
  GetUserByIdHandler,
];

@Module({
  imports: [
    CqrsModule,
    // Registramos la entidad en AMBAS conexiones para este módulo
    TypeOrmModule.forFeature([User], 'write_connection'),
    TypeOrmModule.forFeature([User], 'read_connection'),
  ],
  providers: [
    {
      provide: 'IUserRepository', // Usamos un token para Inversión de Dependencias
      useClass: UserRepository,
    },
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: ['IUserRepository'],
})
export class UsersModule {}