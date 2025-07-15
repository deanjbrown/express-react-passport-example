import { Request, Response } from "express";
import {
  postDeleteService,
  postListService,
  postUpdateService,
} from "../../services/postService";

/**
 * ** Admin protected route **
 * getAllPostsController
 *
 * Returns all posts in the database
 */
export async function adminGetAllPostsController(req: Request, res: Response) {
  try {
    const retrievedPostsResult = await postListService();
    if (retrievedPostsResult.success) {
      res.status(200).json(retrievedPostsResult.data);
    } else {
      res.status(401).json({ error: retrievedPostsResult.error });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * ** Admin protected route **
 * adminEditPostController
 *
 * Edits an existing post in the database
 */
export async function adminUpdatePostController(req: Request, res: Response) {
  try {
    const updatePostResult = await postUpdateService(
      req.validated.id!,
      req.body.validatedData
    );

    if (updatePostResult.success) {
      res.status(200).json(updatePostResult);
    } else {
      res.status(400).json(updatePostResult);
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * ** Admin protected route **
 * adminDeletePostController
 *
 * Deletes a post from the database
 */
export async function adminDeletePostController(req: Request, res: Response) {
  try {
    const deletePostResult = await postDeleteService(req.validated.id!);
    if (deletePostResult.success) {
      res.status(200).json(deletePostResult);
    } else {
      res.status(400).json(deletePostResult);
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}
