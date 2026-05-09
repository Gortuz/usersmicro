import { ICommand } from '@nestjs/cqrs';

export class UpdateUserCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly email?: string,
    public readonly firstName?: string,
    public readonly lastName?: string,
    public readonly password?: string,
  ) {}
}
