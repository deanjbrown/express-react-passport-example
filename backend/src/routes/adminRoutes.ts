import { Router } from "express";
import { isAdmin } from "../middleware/accountMiddleware";
import {
  adminCreateUserController,
  adminDeleteUserController,
  adminEditUserController,
  adminGetAllUsersController,
} from "../controllers/admin/adminAccountController";
import {
  adminDeletePostController,
  adminUpdatePostController,
  adminGetAllPostsController,
} from "../controllers/admin/adminPostController";
import {
  validateId,
  validateSchemaMiddleware,
} from "../middleware/validationMiddleware";
import { userRegisterSchema, userUpdateSchema } from "../db/schema/user";
import { postUpdateSchema } from "../db/schema/post";

const adminRoutes: Router = Router();

adminRoutes
  // User routes
  .get("/users", isAdmin, adminGetAllUsersController)
  .post(
    "/users",
    isAdmin,
    validateSchemaMiddleware(userRegisterSchema),
    adminCreateUserController
  )
  .put(
    "/users/:id",
    isAdmin,
    validateId,
    validateSchemaMiddleware(userUpdateSchema),
    adminEditUserController
  )
  .delete("/users/:id", isAdmin, validateId, adminDeleteUserController)

  // Post routes
  .get("/posts", isAdmin, adminGetAllPostsController)
  .put(
    "/posts/:id",
    isAdmin,
    validateId,
    validateSchemaMiddleware(postUpdateSchema),
    adminUpdatePostController
  )
  .delete("/posts/:id", isAdmin, validateId, adminDeletePostController);

export default adminRoutes;
