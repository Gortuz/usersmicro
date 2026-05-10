import { Controller } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateUserCommand } from '../../application/commands/create-user/create-user.command';
import { UpdateUserCommand } from '../../application/commands/update-user/update-user.command';
import { DeleteUserCommand } from '../../application/commands/delete-user/delete-user.command';
import { GetAllUsersQuery } from '../../application/queries/get-all-users/get-all-users.query';
import { GetUserByIdQuery } from '../../application/queries/get-user-by-id/get-user-by-id.query';
import { UseFilters } from '@nestjs/common';
import { AllExceptionsFilter } from '../../../common/filters/all-exception.filter';

@Controller()
@UseFilters(AllExceptionsFilter)
export class UsersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) { }

  @MessagePattern('user.create')
  async create(@Payload() data: any) {
    const { email, password, firstName, lastName } = data;
    return await this.commandBus.execute(
      new CreateUserCommand(email, password, firstName, lastName),
    );
  }

  @MessagePattern('user.find.all')
  async findAll() {
    return await this.queryBus.execute(new GetAllUsersQuery());
  }

  @MessagePattern('user.find.one')
  async findOne(@Payload() data: { id: string }) {
    return await this.queryBus.execute(new GetUserByIdQuery(data.id));
  }

  @MessagePattern('user.update')
  async update(@Payload() data: any) {
    const { id, email, firstName, lastName, password } = data;
    return await this.commandBus.execute(
      new UpdateUserCommand(id, email, firstName, lastName, password),
    );
  }

  @MessagePattern('user.delete')
  async remove(@Payload() data: { id: string }) {
    return await this.commandBus.execute(new DeleteUserCommand(data.id));
  }
}