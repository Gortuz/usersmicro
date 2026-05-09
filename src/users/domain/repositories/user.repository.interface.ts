import { User } from '../entities/user.entity';

export interface IUserRepository {
  save(user: User): Promise<User>;
  findAll(): Promise<User[]>;
  findById(id: string): Promise<User | null>;
  delete(id: string): Promise<void>;
  syncProjection(user: User): Promise<void>;
  deleteProjection(id: string): Promise<void>;
}