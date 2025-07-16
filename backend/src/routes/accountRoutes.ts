import { Router } from "express";
import {
  loginLocalController,
  logoutUserController,
  registerUserController,
  userInfoController,
  verifyController,
} from "../controllers/accountController";
import { validateSchemaMiddleware } from "../middleware/validationMiddleware";
import { userLoginSchema, userRegisterSchema } from "../db/schema/user";
import { isAuthenticated } from "../middleware/accountMiddleware";
import { authRateLimit } from "../middleware/rateLimitMiddleware";

// Define account routes
const accountRoutes: Router = Router();
// Login Local
accountRoutes.post(
  "/login/local",
  authRateLimit,
  validateSchemaMiddleware(userLoginSchema),
  loginLocalController
);
// TODO
// Login with Google
// Login with Apple
// Login with Facebook
accountRoutes.post(
  "/register",
  authRateLimit,
  validateSchemaMiddleware(userRegisterSchema),
  registerUserController
);
accountRoutes.post("/logout", logoutUserController);
accountRoutes.post("/verify", authRateLimit, isAuthenticated, verifyController);
accountRoutes.get("/me", isAuthenticated, userInfoController);

export default accountRoutes;
