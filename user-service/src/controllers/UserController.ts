import { Request, Response, NextFunction } from "express";
import { IUserService } from "../services/IUserService";
import {
  createUserSchema,
  updateUserSchema,
} from "../validators/userValidator";

export class UserController {
  private readonly service: IUserService;

  constructor(service: IUserService) {
    this.service = service;
  }

  create = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const parsed = createUserSchema.safeParse(req.body);
      if (!parsed.success) {
        res
          .status(400)
          .json({ message: "Validation failed", errors: parsed.error.issues });
        return;
      }
      const user = await this.service.createUser(parsed.data);
      res.status(201).json(user);
    } catch (err) {
      next(err);
    }
  };

  getAll = async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const users = await this.service.getAllUsers();
      res.json(users);
    } catch (err) {
      next(err);
    }
  };

  getById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const user = await this.service.getUserById(String(req.params.id));
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      res.json(user);
    } catch (err) {
      next(err);
    }
  };

  getByAccountNumber = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const user = await this.service.getUserByAccountNumber(
        String(req.params.accountNumber),
      );
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      res.json(user);
    } catch (err) {
      next(err);
    }
  };

  getByIdentityNumber = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const user = await this.service.getUserByIdentityNumber(
        String(req.params.identityNumber),
      );
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      res.json(user);
    } catch (err) {
      next(err);
    }
  };

  update = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const parsed = updateUserSchema.safeParse(req.body);
      if (!parsed.success) {
        res
          .status(400)
          .json({ message: "Validation failed", errors: parsed.error.issues });
        return;
      }
      const user = await this.service.updateUser(
        String(req.params.id),
        parsed.data,
      );
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      res.json(user);
    } catch (err) {
      next(err);
    }
  };

  delete = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const deleted = await this.service.deleteUser(String(req.params.id));
      if (!deleted) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };
}
