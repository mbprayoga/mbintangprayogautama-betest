import { IUser } from "../models/User";

export interface CreateUserDto {
  userName: string;
  accountNumber: string;
  emailAddress: string;
  identityNumber: string;
}

export interface UpdateUserDto {
  userName?: string;
  emailAddress?: string;
}

export interface IUserRepository {
  create(data: CreateUserDto): Promise<IUser>;
  findById(id: string): Promise<IUser | null>;
  findByAccountNumber(accountNumber: string): Promise<IUser | null>;
  findByIdentityNumber(identityNumber: string): Promise<IUser | null>;
  findAll(): Promise<IUser[]>;
  update(id: string, data: UpdateUserDto): Promise<IUser | null>;
  delete(id: string): Promise<boolean>;
}
