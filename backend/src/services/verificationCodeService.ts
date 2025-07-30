import { eq } from "drizzle-orm";
import { db } from "../db";
import {
  SelectVerificationCodeModel,
  verificationCodes,
} from "../db/schema/verificationCode";
import { ServiceResult } from "../types/services/serviceResult";

/**
 * verificationCodeGetByCode
 *
 * @param verificationCode The verification code to retrieve
 * @returns The full verification code or an error
 */
export async function verificationCodeGetByCode(
  verificationCode: string
): Promise<ServiceResult<SelectVerificationCodeModel>> {
  const [retrievedVerificationCode] = await db
    .select()
    .from(verificationCodes)
    .where(eq(verificationCodes.code, verificationCode));

  if (!retrievedVerificationCode) {
    return { success: false, error: "Verification code not found" };
  }

  return { success: true, data: retrievedVerificationCode };
}
