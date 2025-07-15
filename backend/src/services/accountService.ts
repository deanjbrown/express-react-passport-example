import { compare, hash } from "bcrypt";
import { eq } from "drizzle-orm";
import { UserRegisterSchema, users, UserUpdateSchema } from "../db/schema/user";
import {
  SessionUser,
  UserDeleteResult,
  UserListResult,
  UserLoginResult,
  UserRegisterResult,
} from "../types/services/user";
import { db } from "../db";

/**
 *
 * @param email - Email address of the user to authenticate
 * @param password - The password entered by the user to verify
 * @returns success / failure message and a session user or an error
 */
export async function loginUserService(
  email: string,
  password: string
): Promise<UserLoginResult> {
  // Retrieve the user from the database
  const [retrievedUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, email));

  if (!retrievedUser) {
    return { success: false, error: "User does not exist" };
  }

  // Check if the password is valid
  const isPasswordValid = await compare(password, retrievedUser.password);
  if (!isPasswordValid) {
    return { success: false, error: "Incorrect email or password" };
  }

  // Check if the user is verified
  const isVerified = retrievedUser.isVerified;
  if (!isVerified) {
    return {
      success: false,
      error:
        "User is not verified. Please check your inbox or request a new verification code",
    };
  }

  // Remove the password from the retrievedUser object before returning to the controller
  const { password: _password, ...safeUser } = retrievedUser;
  return { success: true, data: safeUser satisfies SessionUser };
}

/**
 * registerUserService
 *
 * @param userData UserRegisterSchema to validate and insert into the database
 * @returns success / failure message and a session user or an error
 */
export async function registerUserService(
  userData: UserRegisterSchema
): Promise<UserRegisterResult> {
  // Check if there is already a user in the database with this email
  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, userData.email));

  if (existingUser) {
    return { success: false, error: "User with this email already exists" };
  }

  // Remove the confirmPassword from the schema
  const { confirmPassword: confirmPassword_, ...newUser } = userData;

  // Hash the password
  const hashedPassword = await hash(newUser.password, 10);

  // Insert the user into the database
  const [insertedUser] = await db
    .insert(users)
    .values({ ...newUser, password: hashedPassword })
    .returning();

  if (!insertedUser) {
    return {
      success: false,
      error: "Could not insert user into database",
    };
  }

  // Remove the password from the insertedUser
  const { password: password_, ...safeUser } = insertedUser;

  // Return the inserted safe inserted user
  return { success: true, data: safeUser };
}

/**
 * getAllUsersService
 * @returns success / failure message and an array of session users or an error
 */
export async function getAllUsersService(): Promise<UserListResult> {
  const allUsers = await db.select().from(users);
  if (!allUsers) {
    return { success: false, error: "Could not retrieve users from database" };
  }

  // Remove the password from each user
  const safeUsers = allUsers.map(
    ({ password: _password, ...safeUser }) => safeUser
  );

  return { success: true, data: safeUsers };
}

/**
 * userGetByIdService
 *
 * @param userId The ID of the user to retrieve
 * @returns success / failure message and a session user or an error
 *
 * This service is used to retrieve a user by their ID.
 */
export async function userGetByIdService(
  userId: number
): Promise<UserRegisterResult> {
  const [retrievedUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId));

  if (!retrievedUser) {
    return { success: false, error: "User not found" };
  }

  // Remove the password from the retrievedUser
  const { password: _password, ...safeUser } = retrievedUser;

  return { success: true, data: safeUser satisfies SessionUser };
}

/**
 * updateUserService
 *
 * Updates an existing user in the database
 *
 * @param userId  The ID of the user to update
 * @param userData The user data to update
 * @returns The updated user or an error message
 */
export async function updateUserService(
  userId: number,
  userData: UserUpdateSchema
): Promise<UserRegisterResult> {
  // Ensure the user exists in the database
  const existingUser = await userGetByIdService(userId);
  if (!existingUser.success) {
    return { success: false, error: "User not found" };
  }

  // If the email is being updated, check if the new email already exists
  if (existingUser.data.email !== userData.email) {
    const [emailExists] = await db
      .select()
      .from(users)
      .where(eq(users.email, userData.email));

    if (emailExists) {
      return { success: false, error: "Email already in use" };
    }
  }

  // Hash the updated password
  const hashedPassword = await hash(userData.password, 10);

  // Update the user in the database
  const [updatedUser] = await db
    .update(users)
    .set({ ...userData, password: hashedPassword })
    .where(eq(users.id, userId))
    .returning();

  const { password: password_, ...safeUser } = updatedUser;

  if (updatedUser) {
    return { success: true, data: safeUser satisfies SessionUser };
  } else {
    return { success: false, error: "Could not update user in database" };
  }
}

/**
 * deleteUserService
 *
 * @param userId The Id of the user to delete
 * @returns The deleted user or an error message
 */
export async function deleteUserService(
  userId: number
): Promise<UserDeleteResult> {
  // Delete the user from the database
  const [deletedUser] = await db
    .delete(users)
    .where(eq(users.id, userId))
    .returning();

  const { password: password_, ...safeUser } = deletedUser;

  if (deletedUser) {
    return { success: true, data: safeUser satisfies SessionUser };
  } else {
    return { success: false, error: "Could not delete user from database" };
  }
}
