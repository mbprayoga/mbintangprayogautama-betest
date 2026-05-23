import { Router } from "express";
import { UserController } from "../controllers/UserController";
import { createAuthMiddleware } from "../middleware/authMiddleware";

export function createUserRouter(
  controller: UserController,
  grpcUrl: string,
): Router {
  const router = Router();

  router.use(createAuthMiddleware(grpcUrl));

  router.post("/", controller.create);
  router.get("/", controller.getAll);
  router.get("/account/:accountNumber", controller.getByAccountNumber);
  router.get("/identity/:identityNumber", controller.getByIdentityNumber);
  router.get("/:id", controller.getById);
  router.put("/:id", controller.update);
  router.delete("/:id", controller.delete);

  return router;
}
