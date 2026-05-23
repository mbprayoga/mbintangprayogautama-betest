import { IUserService } from "./IUserService";
import {
  IUserRepository,
  CreateUserDto,
  UpdateUserDto,
} from "../repositories/IUserRepository";
import { ICacheService } from "../cache/ICacheService";
import { IUser } from "../models/User";

export class UserService implements IUserService {
  private readonly repo: IUserRepository;
  private readonly cache: ICacheService;

  constructor(repo: IUserRepository, cache: ICacheService) {
    this.repo = repo;
    this.cache = cache;
  }

  async createUser(data: CreateUserDto): Promise<IUser> {
    const user = await this.repo.create(data);
    await this.cache.del("user:all");
    return user;
  }

  async getUserById(id: string): Promise<IUser | null> {
    const cacheKey = `user:id:${id}`;
    const cached = await this.cache.get<IUser>(cacheKey);
    if (cached) return cached;
    const user = await this.repo.findById(id);
    if (user) await this.cache.set(cacheKey, user);
    return user;
  }

  async getUserByAccountNumber(accountNumber: string): Promise<IUser | null> {
    const cacheKey = `user:account:${accountNumber}`;
    const cached = await this.cache.get<IUser>(cacheKey);
    if (cached) return cached;
    const user = await this.repo.findByAccountNumber(accountNumber);
    if (user) await this.cache.set(cacheKey, user);
    return user;
  }

  async getUserByIdentityNumber(identityNumber: string): Promise<IUser | null> {
    const cacheKey = `user:identity:${identityNumber}`;
    const cached = await this.cache.get<IUser>(cacheKey);
    if (cached) return cached;
    const user = await this.repo.findByIdentityNumber(identityNumber);
    if (user) await this.cache.set(cacheKey, user);
    return user;
  }

  async getAllUsers(): Promise<IUser[]> {
    const cacheKey = "user:all";
    const cached = await this.cache.get<IUser[]>(cacheKey);
    if (cached) return cached;
    const users = await this.repo.findAll();
    await this.cache.set(cacheKey, users, 300);
    return users;
  }

  async updateUser(id: string, data: UpdateUserDto): Promise<IUser | null> {
    const user = await this.repo.update(id, data);
    if (user) {
      await Promise.all([
        this.cache.set(`user:id:${id}`, user),
        this.cache.set(`user:account:${user.accountNumber}`, user),
        this.cache.set(`user:identity:${user.identityNumber}`, user),
        this.cache.del("user:all"),
      ]);
    }
    return user;
  }

  async deleteUser(id: string): Promise<boolean> {
    const user = await this.repo.findById(id);
    const deleted = await this.repo.delete(id);
    if (deleted && user) {
      await Promise.all([
        this.cache.del(`user:id:${id}`),
        this.cache.del(`user:account:${user.accountNumber}`),
        this.cache.del(`user:identity:${user.identityNumber}`),
        this.cache.del("user:all"),
      ]);
    }
    return deleted;
  }
}
