import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './domain/entities/user.entity';
import { UserRepository } from './infrastructure/repositories/user.repository';

@Module({
  imports: [
    // Registramos la entidad en AMBAS conexiones para este módulo
    TypeOrmModule.forFeature([User], 'write_connection'),
    TypeOrmModule.forFeature([User], 'read_connection'),
  ],
  providers: [
    {
      provide: 'IUserRepository', // Usamos un token para Inversión de Dependencias
      useClass: UserRepository,
    },
  ],
  exports: ['IUserRepository'],
})
export class UsersModule {}