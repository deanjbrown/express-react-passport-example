import { compare, hash } from "bcrypt";
import { eq } from "drizzle-orm";
import {
  UserPasswordResetRequestSchema,
  UserRegisterSchema,
  users,
  userUpdateSchema,
  UserUpdateSchema,
  ChangePasswordSchema,
} from "../db/schema/user";
import {
  PasswordResetResult,
  SessionUser,
  UserDeleteResult,
  UserListResult,
  UserLoginResult,
  UserRegisterResult,
  VerifyUserResult,
} from "../types/services/user";
import { db } from "../db";
import {
  generateSecureToken,
  getVerificationCodeExpiryDate,
  sanitizeUser,
} from "../utils/auth";
import { sendPasswordResetEmail, sendVerificationEmail } from "./emailService";
import {
  ValidateVerificationCodeSchema,
  verificationCodes,
} from "../db/schema/verificationCode";
import { verificationCodeGetByCode } from "./verificationCodeService";
import { ServiceResult } from "../types/services/serviceResult";

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
            expiresAt: getVerificationCodeExpiryDate(),
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
 *
 * @param userEmail The email address of the user to retrieve
 * @returns success / failure message and a session user or an error
 */
export async function userGetByEmailService(
  userEmail: string
): Promise<UserRegisterResult> {
  // Retrieve the user from the database
  const [retrievedUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, userEmail));

  // If the user does not exist, return an error
  if (!retrievedUser) {
    return { success: false, error: "User not found" };
  }

  // Santitize the user before returning
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

  // Check the code exists, hasn't been used, and hasn't expired
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

/**
 * passwordResetRequestService
 *
 * @param userId The ID of the user to create the password reset for
 * @returns Success message or an error
 */
export async function passwordResetRequestService(
  userData: UserPasswordResetRequestSchema
): Promise<PasswordResetResult> {
  // Retrieve the user
  const retrievedUserResult = await userGetByEmailService(userData.email);

  // Check if the user exists
  if (!retrievedUserResult.success) {
    return { success: false, error: "Error resetting password" };
  }

  // Check if the user is verified
  if (!retrievedUserResult.data.isVerified) {
    return { success: false, error: "User is not verified" };
  }

  // Generate a password reset verification code
  const passwordResetToken = generateSecureToken(32);
  const [insertedVerificationCode] = await db
    .insert(verificationCodes)
    .values({
      userId: retrievedUserResult.data.id,
      type: "passwordReset",
      code: passwordResetToken,
      expiresAt: getVerificationCodeExpiryDate(),
    })
    .returning();

  if (insertedVerificationCode) {
    sendPasswordResetEmail(userData.email, insertedVerificationCode.code);
    return { success: true, data: "Password reset email sent" };
  } else {
    return { success: false, error: "Could not reset password" };
  }
}

/**
 * passwordResetVerifyService
 *
 * @param verificationCode
 * @returns
 */
export async function passwordResetVerifyService(
  verificationCode: ValidateVerificationCodeSchema
): Promise<ServiceResult<string>> {
  // Retrieve the verification code
  const retrievedVerificationCodeResult = await verificationCodeGetByCode(
    verificationCode.code
  );

  // Check the code exists, hasn't been used, and hasn't expired
  if (
    !retrievedVerificationCodeResult.success ||
    retrievedVerificationCodeResult.data.isUsed ||
    new Date() > retrievedVerificationCodeResult.data.expiresAt
  ) {
    return {
      success: false,
      error: "Invalid verification code or code has expired",
    };
  }

  return { success: true, data: "Verification code valid" };
}

/**
 * passwordResetChangePasswordService
 * @param changePasswordData
 * @returns
 */
export async function passwordResetChangePasswordService(
  changePasswordData: ChangePasswordSchema
): Promise<ServiceResult<string>> {
  // Validate the code again:
  const retrievedVerificationCodeResult = await verificationCodeGetByCode(
    changePasswordData.code
  );

  // Check the code exists, hasn't been used, and hasn't expired
  if (
    !retrievedVerificationCodeResult.success ||
    retrievedVerificationCodeResult.data.isUsed ||
    new Date() > retrievedVerificationCodeResult.data.expiresAt
  ) {
    return {
      success: false,
      error: "Invalid verification code or code has expired",
    };
  }

  // Retrieve the user based on the userId
  const retrievedUserResult = await userGetByIdService(
    retrievedVerificationCodeResult.data.userId
  );
  if (!retrievedUserResult.success) {
    return { success: false, error: "User not found" };
  }

  // Ensure the users data, including the new password and repeat password is valid:
  const validatedUserData = userUpdateSchema.safeParse({
    ...retrievedUserResult.data,
    password: changePasswordData.password,
    confirmPassword: changePasswordData.password,
  });

  if (!validatedUserData.success) {
    return { success: false, error: validatedUserData.error.issues[0].message };
  }

  // Hash the new password
  const hashedPassword = await hash(validatedUserData.data.password, 10);

  // Update the user and the verification code in a transaction to avoid partial updates
  try {
    await db.transaction(async (tx) => {
      const [updatedUser] = await tx
        .update(users)
        .set({
          password: hashedPassword,
        })
        .where(eq(users.id, retrievedUserResult.data.id))
        .returning();

      if (!updatedUser) {
        throw new Error("Failed to update user");
      }

      const [updatedVerificationCode] = await tx
        .update(verificationCodes)
        .set({
          isUsed: true,
          usedAt: new Date(),
        })
        .where(
          eq(verificationCodes.id, retrievedVerificationCodeResult.data.id)
        )
        .returning();

      if (!updatedVerificationCode) {
        throw new Error("Failed to update verification code");
      }

      return { updatedUser, updatedVerificationCode };
    });
  } catch (error) {
    return { success: false, error: "Failed to change password" };
  }

  return { success: true, data: "User updated successfully" };
}
