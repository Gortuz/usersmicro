export class UserUpdatedEvent {
  constructor(
    public readonly id: string,
    public readonly email?: string,
    public readonly firstName?: string,
    public readonly lastName?: string,
    public readonly isActive?: boolean,
  ) {}
}
