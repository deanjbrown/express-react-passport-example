import { eq } from "drizzle-orm";
import { db } from "../db";
import { PostCreateSchema, posts } from "../db/schema/post";
import {
  PostCreateResult,
  PostDeleteResult,
  PostDetailResult,
  PostListResult,
} from "../types/services/post";
import { SessionUser } from "../types/services/user";

/**
 * postListService
 * @returns success / failure message and an array of posts or an error
 */
export async function postListService(): Promise<PostListResult> {
  const postList = await db.select().from(posts).orderBy(posts.createdAt);
  return { success: true, data: postList };
}

/**
 * postGetByIdService
 * @param postId  The ID of the post to retrieve
 * @returns The result of the retrieval operation, including success status and the post data or an error message
 */
export async function postGetByIdService(
  postId: number
): Promise<PostDetailResult> {
  const [retrievedPost] = await db
    .select()
    .from(posts)
    .where(eq(posts.id, postId));

  if (!retrievedPost) {
    return { success: false, error: "Post not found" };
  } else {
    return { success: true, data: retrievedPost };
  }
}

/**
 *
 * @param postData PostCreateSchema to validate and insert into the database
 * @param user The session user making the request
 * @returns success / failure message and the created post or an error
 */
export async function postCreateservice(
  postData: PostCreateSchema,
  user: SessionUser
): Promise<PostCreateResult> {
  const [createdPost] = await db
    .insert(posts)
    .values({ ...postData, userId: user.id })
    .returning();

  return { success: true, data: createdPost };
}

/**
 *
 * @param postId The Id of the post to delete
 * @returns The result of the deletion operation, including success status and the ID of the deleted post or an error message
 */
export async function postDeleteService(
  postId: number
): Promise<PostDeleteResult> {
  // Delete the post
  const [deletedPost] = await db
    .delete(posts)
    .where(eq(posts.id, postId))
    .returning();

  if (deletedPost) {
    return { success: true, data: deletedPost };
  } else {
    return { success: false, error: "Post not found or could not be deleted" };
  }
}

/**
 *
 * @param postId The Id of the post to edit
 * @param postData The data to update the post with, validated against the postUpdateSchema
 * @returns THe result of the update operation, including success status and the updated post or an error message
 */
export async function postUpdateService(
  postId: number,
  postData: PostCreateSchema
): Promise<PostCreateResult> {
  // Update the posts data
  const [updatedPost] = await db
    .update(posts)
    .set(postData)
    .where(eq(posts.id, postId))
    .returning();

  if (updatedPost) {
    return { success: true, data: updatedPost };
  } else {
    return { success: false, error: "Post could not be updated" };
  }
}
