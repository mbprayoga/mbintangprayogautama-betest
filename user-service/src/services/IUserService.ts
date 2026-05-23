import { IUser } from "../models/User";
import { CreateUserDto, UpdateUserDto } from "../repositories/IUserRepository";

export interface IUserService {
  createUser(data: CreateUserDto): Promise<IUser>;
  getUserById(id: string): Promise<IUser | null>;
  getUserByAccountNumber(accountNumber: string): Promise<IUser | null>;
  getUserByIdentityNumber(identityNumber: string): Promise<IUser | null>;
  getAllUsers(): Promise<IUser[]>;
  updateUser(id: string, data: UpdateUserDto): Promise<IUser | null>;
  deleteUser(id: string): Promise<boolean>;
}
