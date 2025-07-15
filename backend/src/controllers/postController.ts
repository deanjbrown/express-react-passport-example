import { Request, Response } from "express";
import {
  postCreateservice,
  postDeleteService,
  postUpdateService,
  postGetByIdService,
  postListService,
} from "../services/postService";
import { SessionUser } from "../types/services/user";

/**
 *  postListController
 *  Uses the postListService to retrieve a list of posts
 */
export async function postListController(req: Request, res: Response) {
  try {
    const retrievedPostsResult = await postListService();
    if (retrievedPostsResult.success) {
      res.status(200).json({ posts: retrievedPostsResult.data });
    } else {
      res.status(401).json({ error: retrievedPostsResult.error });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * postCreateController
 * Uses the postCreateService to crate a new post
 */
export async function postCreateController(req: Request, res: Response) {
  try {
    const user = req.user as SessionUser;
    const postCreateServiceResult = await postCreateservice(
      req.body.validatedData,
      user
    );
    if (postCreateServiceResult.success) {
      res.status(201).json(postCreateServiceResult.data);
    } else {
      res.status(400).json(postCreateServiceResult);
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 *
 * postDeleteController
 * Uses the postDeleteService to delete a post by its ID
 */
export async function postDeleteController(req: Request, res: Response) {
  try {
    const user = req.user as SessionUser;
    const postId = req.validated.id!;

    // Check the post exists
    const getPostByIdServiceResult = await postGetByIdService(postId);
    if (!getPostByIdServiceResult.success) {
      res.status(404).json(getPostByIdServiceResult);
      return;
    }

    // Check the post belongs to the user
    if (getPostByIdServiceResult.data.userId !== user.id) {
      res
        .status(403)
        .json({ error: "You do not have permission to delete this post" });
      return;
    }

    // Delete the post
    const postDeleteResult = await postDeleteService(postId);
    if (postDeleteResult.success) {
      res.status(200).json(postDeleteResult);
    } else {
      res.status(400).json(postDeleteResult);
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * postUpdateController
 * Uses the postUpdateService to edit a post by its ID
 */
export async function postUpdateController(req: Request, res: Response) {
  try {
    const user = req.user as SessionUser;
    const postId = req.validated.id!;
    const postData = req.body.validatedData;

    // Check if the post exists
    const getPostByIdServiceResult = await postGetByIdService(postId);
    if (!getPostByIdServiceResult.success) {
      res.status(404).json({ error: getPostByIdServiceResult.error });
      return;
    }

    // Check if the post belongs to the user
    if (getPostByIdServiceResult.data.userId !== user.id) {
      res
        .status(403)
        .json({ error: "You do not have permission to edit this post" });
      return;
    }

    // Edit the post
    const postUpdateServiceResult = await postUpdateService(postId, postData);
    if (!postUpdateServiceResult.success) {
      res.status(400).json({ error: postUpdateServiceResult.error });
    } else {
      res.status(200).json(postUpdateServiceResult.data);
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}
