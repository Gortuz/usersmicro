import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../domain/entities/user.entity';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    // Conexión para Comandos (Escritura)
    @InjectRepository(User, 'write_connection')
    private readonly writeRepo: Repository<User>,

    // Conexión para Consultas y Proyecciones (Lectura)
    @InjectRepository(User, 'read_connection')
    private readonly readRepo: Repository<User>,
  ) {}

  /**
   * COMMAND SIDE
   * Guarda en la DB de escritura. 
   * En CQRS, tras esto se dispararía un evento de dominio para actualizar la lectura.
   */
  async save(user: User): Promise<User> {
    return await this.writeRepo.save(user);
  }

  /**
   * QUERY SIDE
   * Las búsquedas siempre se realizan en la base de datos de lectura.
   */
  async findAll(): Promise<User[]> {
    return await this.readRepo.find({
      where: { isActive: true }
    });
  }

  async findById(id: string): Promise<User | null> {
    return await this.readRepo.findOneBy({ id });
  }

  /**
   * PROJECTION SIDE (Sincronización Manual)
   * Este método se usaría dentro de un Handler de Eventos (Event Handler)
   * para replicar los cambios en la DB de lectura.
   */
  async syncProjection(user: User): Promise<void> {
    await this.readRepo.save(user);
  }
}