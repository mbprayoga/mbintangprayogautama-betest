import express, { Application, Request, Response } from "express";
import { AuthService } from "../services/AuthService";

export function createHttpApp(authService: AuthService): Application {
  const app = express();
  app.use(express.json());

  app.post("/auth/token", (_req: Request, res: Response) => {
    const token = authService.generateToken("demo-user");
    res.json({ token });
  });

  app.get("/health", (_req: Request, res: Response) => {
    res.json({ service: "auth-service", status: "ok" });
  });

  return app;
}
