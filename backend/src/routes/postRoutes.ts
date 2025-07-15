import { Router } from "express";
import {
  postCreateController,
  postDeleteController,
  postUpdateController,
  postListController,
} from "../controllers/postController";
import { isAuthenticated } from "../middleware/accountMiddleware";
import {
  validateId,
  validateSchemaMiddleware,
} from "../middleware/validationMiddleware";
import { postCreateSchema, postUpdateSchema } from "../db/schema/post";

const postRoutes: Router = Router();

postRoutes
  .get("/", postListController)
  .post(
    "/",
    isAuthenticated,
    validateSchemaMiddleware(postCreateSchema),
    postCreateController
  )
  .put(
    "/:id",
    isAuthenticated,
    validateId,
    validateSchemaMiddleware(postUpdateSchema),
    postUpdateController
  )
  .delete("/:postId", isAuthenticated, validateId, postDeleteController);

export default postRoutes;
