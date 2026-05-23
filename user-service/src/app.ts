import express, { Application, Request, Response, NextFunction } from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import Redis from "ioredis";
import { UserRepository } from "./repositories/UserRepository";
import { RedisCacheService } from "./cache/RedisCacheService";
import { UserService } from "./services/UserService";
import { UserController } from "./controllers/UserController";
import { createUserRouter } from "./routes/userRoutes";

interface AppError extends Error {
  code?: number;
}

export function createApp(redisClient: Redis): Application {
  const app = express();

  const repo = new UserRepository();
  const cache = new RedisCacheService(redisClient);
  const service = new UserService(repo, cache);
  const controller = new UserController(service);
  const grpcUrl = process.env.AUTH_SERVICE_GRPC_URL ?? "localhost:50051";

  app.use(helmet());
  app.set("trust proxy", 1);
  app.use(express.json());
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  app.get("/health", (_req: Request, res: Response) => {
    res.json({ service: "user-service", status: "ok" });
  });

  app.use("/users", createUserRouter(controller, grpcUrl));

  app.use(
    (err: AppError, _req: Request, res: Response, _next: NextFunction) => {
      if (err.code === 11000) {
        res.status(409).json({ message: "Conflict: Duplicate data" });
        return;
      }
      res.status(500).json({ message: "Internal server error" });
    },
  );

  return app;
}
