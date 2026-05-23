import {
  IUserRepository,
  CreateUserDto,
  UpdateUserDto,
} from "./IUserRepository";
import { User, IUser } from "../models/User";

export class UserRepository implements IUserRepository {
  async create(data: CreateUserDto): Promise<IUser> {
    const user = new User(data);
    const saved = await user.save();
    return saved.toObject() as IUser;
  }

  async findById(id: string): Promise<IUser | null> {
    return User.findById(id).lean<IUser>().exec();
  }

  async findByAccountNumber(accountNumber: string): Promise<IUser | null> {
    return User.findOne({ accountNumber }).lean<IUser>().exec();
  }

  async findByIdentityNumber(identityNumber: string): Promise<IUser | null> {
    return User.findOne({ identityNumber }).lean<IUser>().exec();
  }

  async findAll(): Promise<IUser[]> {
    return User.find().lean<IUser[]>().exec();
  }

  async update(id: string, data: UpdateUserDto): Promise<IUser | null> {
    return User.findByIdAndUpdate(id, data, { new: true, runValidators: true })
      .lean<IUser>()
      .exec();
  }

  async delete(id: string): Promise<boolean> {
    const result = await User.findByIdAndDelete(id).lean().exec();
    return result !== null;
  }
}
