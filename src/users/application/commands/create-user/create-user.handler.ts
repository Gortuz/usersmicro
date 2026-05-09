// En los handlers va la lógica de negocio en general

import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateUserCommand } from './create-user.command';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { User } from '../../../domain/entities/user.entity';
// Importa tu Evento de Dominio aquí cuando lo crees
// import { UserCreatedEvent } from '../../domain/events/user-created.event';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(command: CreateUserCommand): Promise<User> {
    const { email, password, firstName, lastName } = command;

    // 1. Instanciar la entidad de dominio
    const user = new User();
    user.email = email;
    user.password = password; // Recuerda hashear esto antes de llegar aquí
    user.firstName = firstName;
    user.lastName = lastName;

    // 2. Persistir en la base de datos de ESCRITURA
    const savedUser = await this.userRepository.save(user);

    // 3. (Opcional) Publicar evento para sincronizar la base de datos de LECTURA
    // En CQRS, esto activaría el Proyeccionista para actualizar users-read
    /*
    const userModel = this.publisher.mergeObjectContext(savedUser);
    userModel.apply(new UserCreatedEvent(savedUser.id, savedUser.email));
    userModel.commit();
    */

    return savedUser;
  }
}