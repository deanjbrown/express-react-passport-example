import { Request, Response } from "express";
import {
  deleteUserService,
  getAllUsersService,
  registerUserService,
  updateUserService,
} from "../../services/accountService";

/**
 * ** Admin protected route **
 * adminGetAllUsersController
 *
 * Returns all users in the database
 */
export async function adminGetAllUsersController(req: Request, res: Response) {
  try {
    const retrievedUsersResult = await getAllUsersService();
    if (retrievedUsersResult.success) {
      res.status(200).json(retrievedUsersResult.data);
    } else {
      res.status(401).json({ error: retrievedUsersResult.error });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * ** Admin protected route **
 * adminCreateUserController
 *
 * Creates a new user in the database
 */
export async function adminCreateUserController(req: Request, res: Response) {
  try {
    const createdUserResult = await registerUserService(req.body.validatedData);
    if (createdUserResult.success) {
      res.status(201).json(createdUserResult);
    } else {
      res.status(400).json(createdUserResult);
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * ** Admin protected route **
 * adminEditUserController
 *
 * Edits an existing user in the database
 */
export async function adminEditUserController(req: Request, res: Response) {
  try {
    // Update the user with the validated data
    const updatedUserResult = await updateUserService(
      req.validated.id!,
      req.body.validatedData
    );

    if (updatedUserResult.success) {
      res.status(200).json(updatedUserResult);
    } else {
      res.status(400).json(updatedUserResult);
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * ** Admin protected route **
 * adminDeleteUserController
 *
 * Deletes a user from the database
 */
export async function adminDeleteUserController(req: Request, res: Response) {
  try {
    const deleteUserResult = await deleteUserService(req.validated.id!);
    if (deleteUserResult.success) {
      res.status(200).json(deleteUserResult);
    } else {
      res.status(400).json(deleteUserResult);
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}
