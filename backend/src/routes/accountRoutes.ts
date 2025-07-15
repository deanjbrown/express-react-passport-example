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

// Define account routes
const accountRoutes: Router = Router();
// Login Local
accountRoutes.post(
  "/login/local",
  validateSchemaMiddleware(userLoginSchema),
  loginLocalController
);
// TODO
// Login with Google
// Login with Apple
// Login with Facebook
accountRoutes.post(
  "/register",
  validateSchemaMiddleware(userRegisterSchema),
  registerUserController
);
accountRoutes.post("/logout", logoutUserController);
accountRoutes.post("/verify", isAuthenticated, verifyController);
accountRoutes.get("/me", isAuthenticated, userInfoController);

export default accountRoutes;
