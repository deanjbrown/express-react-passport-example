import { Router } from "express";
import {
  passwordResetChangePasswordController,
  loginLocalController,
  logoutUserController,
  passwordResetRequestController,
  passwordResetVerifyController,
  registerUserController,
  userInfoController,
  verifyController,
} from "../controllers/accountController";
import { validateSchemaMiddleware } from "../middleware/validationMiddleware";
import {
  userLoginSchema,
  userPasswordResetRequestSchema,
  userRegisterSchema,
} from "../db/schema/user";
import { isAuthenticated } from "../middleware/accountMiddleware";
import { authRateLimit } from "../middleware/rateLimitMiddleware";
import { validateVerificationCodeSchema } from "../db/schema/verificationCode";
import { changePasswordSchema } from "../db/schema/user";

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
accountRoutes.post(
  "/verify",
  authRateLimit,
  validateSchemaMiddleware(validateVerificationCodeSchema),
  verifyController
);

accountRoutes.post(
  "/password_reset",
  authRateLimit,
  validateSchemaMiddleware(userPasswordResetRequestSchema),
  passwordResetRequestController
);
accountRoutes.post(
  "/verify_password_reset",
  authRateLimit,
  validateSchemaMiddleware(validateVerificationCodeSchema),
  passwordResetVerifyController
);
accountRoutes.post(
  "/verify_password_reset/change_password",
  authRateLimit,
  validateSchemaMiddleware(changePasswordSchema),
  passwordResetChangePasswordController
);
accountRoutes.get("/me", isAuthenticated, userInfoController);

export default accountRoutes;
