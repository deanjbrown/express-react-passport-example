import crypto from "crypto";

import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { SessionUser } from "../types/services/user";
import { loginUserService } from "../services/accountService";
import { SelectUserModel } from "../db/schema/user";
import env from "./env";

// Define the passport config and strategies
export default function passportConfig() {
  passport.use(
    new LocalStrategy({ usernameField: "email" }, async function verify(
      username,
      password,
      cb
    ) {
      const email = username;
      const userLoginServiceResult = await loginUserService(email, password);
      if (!userLoginServiceResult.success) {
        return cb(null, false, { message: userLoginServiceResult.error });
      }
      return cb(null, userLoginServiceResult.data satisfies SessionUser);
    })
  );

  // Serialize user
  passport.serializeUser(function (user, cb) {
    process.nextTick(function () {
      const sessionUser: SessionUser = {
        id: user.id,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
      return cb(null, sessionUser);
    });
  });

  // Deserialize user
  passport.deserializeUser<SessionUser>(function (user, cb) {
    process.nextTick(function () {
      return cb(null, user);
    });
  });
}

// Generates a token (for email verification / password reset / etc)
export function generateSecureToken(length: number = 32) {
  return crypto.randomBytes(length).toString("hex");
}

// Removes sensitive fields from a user object and returns
export function sanitizeUser(unsafeUser: SelectUserModel): SessionUser {
  const { password: password_, ...safeUser } = unsafeUser satisfies SessionUser;
  return safeUser;
}

// Sets the expiry date for verification tokens
export function getVerificationCodeExpiryDate(): Date {
  const expiryDate = new Date(Date.now() + 1000 * 60 * env.VERIFICATION_CODE_DURATION)
  return expiryDate;
}