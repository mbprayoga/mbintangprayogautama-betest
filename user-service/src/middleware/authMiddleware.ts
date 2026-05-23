import { Request, Response, NextFunction } from "express";
import { AuthClient } from "../grpc/AuthClient";

export function createAuthMiddleware(grpcUrl: string) {
  const authClient = new AuthClient(grpcUrl);

  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      res
        .status(401)
        .json({ message: "Missing or invalid Authorization header" });
      return;
    }

    const token = authHeader.slice(7);

    try {
      const result = await authClient.validateToken(token);
      if (!result.valid) {
        res.status(401).json({ message: result.error || "Invalid token" });
        return;
      }
      next();
    } catch {
      res.status(401).json({ message: "Token validation failed" });
    }
  };
}
