import { compare, hash } from "bcrypt";
import { eq } from "drizzle-orm";
import { UserRegisterSchema, users, UserUpdateSchema } from "../db/schema/user";
import {
  SessionUser,
  UserDeleteResult,
  UserListResult,
  UserLoginResult,
  UserRegisterResult,
  VerifyUserResult,
} from "../types/services/user";
import { db } from "../db";
import { generateSecureToken, sanitizeUser } from "../utils/auth";
import { sendVerificationEmail } from "./emailService";
import {
  ValidateVerificationCodeSchema,
  verificationCodes,
} from "../db/schema/verificationCode";

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

  // Sanitize the user object before returning
  const safeUser = sanitizeUser(retrievedUser);
  return { success: true, data: safeUser };
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

  // generate the verification code
  const verificationCode = generateSecureToken(32);

  // Use a transaction to avoid partial inserts
  try {
    const { insertedUser, insertedVerificationCode } = await db.transaction(
      async (tx) => {
        const [insertedUser] = await tx
          .insert(users)
          .values({
            ...newUser,
            password: hashedPassword,
          })
          .returning();

        if (!insertedUser) {
          throw new Error("Failed to insert user");
        }

        const [insertedVerificationCode] = await tx
          .insert(verificationCodes)
          .values({
            userId: insertedUser.id,
            type: "register",
            code: verificationCode,
            expiresAt: new Date(Date.now() + 1000 * 60 * 30), // 30 mins
          })
          .returning();

        if (!insertedVerificationCode) {
          throw new Error("Failed to insert verification code");
        }

        return { insertedUser, insertedVerificationCode };
      }
    );

    // Sanitize the user before returning
    const safeUser = sanitizeUser(insertedUser);

    // Send the verification email
    sendVerificationEmail(insertedUser.email, verificationCode);

    // Return the inserted safe inserted user
    return { success: true, data: safeUser };
  } catch (error) {
    return { success: false, error: "Failed to register user" };
  }
}

/**
 * getAllUsersService
 * 
 * @returns success / failure message and an array of session users or an error
 */
export async function getAllUsersService(): Promise<UserListResult> {
  const allUsers = await db.select().from(users);
  if (!allUsers) {
    return { success: false, error: "Could not retrieve users from database" };
  }

  // Sanitize all users
  const safeUsers = allUsers.map((user) => sanitizeUser(user));

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
  // Retrieve the user from the database
  const [retrievedUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId));

  // If the user does not exist, return an error
  if (!retrievedUser) {
    return { success: false, error: "User not found" };
  }

  // Sanitize the user before returning
  const safeUser = sanitizeUser(retrievedUser);
  return { success: true, data: safeUser };
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

  // Sanitize the user before returning
  const safeUser = sanitizeUser(updatedUser);

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

  // Sanitize user before returning
  const safeUser = sanitizeUser(deletedUser);

  if (deletedUser) {
    return { success: true, data: safeUser };
  } else {
    return { success: false, error: "Could not delete user from database" };
  }
}

/**
 * verifyUserService
 *
 * @param verificationCode
 * @returns
 */
export async function verifyUserService(
  verificationCode: ValidateVerificationCodeSchema
): Promise<VerifyUserResult> {
  // Retrieve both user and verification code
  const [{ retrievedVerificationCode, retrievedUser }] = await db
    .select({
      retrievedVerificationCode: verificationCodes,
      retrievedUser: users,
    })
    .from(verificationCodes)
    .innerJoin(users, eq(verificationCodes.userId, users.id))
    .where(eq(verificationCodes.code, verificationCode.code));

  // Check if the code exists, hasn't been used, and hasn't expired
  if (
    !retrievedVerificationCode ||
    retrievedVerificationCode.isUsed ||
    new Date() > retrievedVerificationCode.expiresAt
  ) {
    return {
      success: false,
      error: "Invalid verification code or code has expired",
    };
  }

  // Use a transaction to avoid partial update
  try {
    await db.transaction(async (tx) => {
      // Update the verification code
      const [updatedVerificationCode] = await tx
        .update(verificationCodes)
        .set({
          isUsed: true,
          usedAt: new Date(),
        })
        .where(eq(verificationCodes.id, retrievedVerificationCode.id))
        .returning();

      // Throw an error if we have been unable to update the verification code
      if (!updatedVerificationCode) {
        throw new Error("Failed to update verification code");
      }

      // Update the user
      const updatedUser = await tx
        .update(users)
        .set({ isVerified: true })
        .where(eq(users.id, retrievedUser.id))
        .returning();

      // Throw an error if we have been unable to update the user
      if (!updatedUser) {
        throw new Error("Failed to update user");
      }
    });
  } catch (error) {
    return { success: false, error: "Failed update the user" };
  }

  return { success: true, data: "Account verified" };
}
