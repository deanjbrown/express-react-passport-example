import { NextFunction, Request, Response } from "express";
import passport from "passport";
import {
  registerUserService,
  verifyUserService,
} from "../services/accountService";
import { SessionUser } from "../types/services/user";

/**
 * loginLocalController
 *
 * Uses passport to authenticate with local credentials
 * Returns either a user object or an error
 */
export async function loginLocalController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  passport.authenticate(
    "local",
    (
      err: any,
      user: SessionUser | false,
      info: { message?: string | undefined }
    ) => {
      if (err) return next(err);
      if (!user)
        return res
          .status(401)
          .json({ message: info?.message || "Invalid credentials" });

      req.login(user, (err) => {
        if (err) return next(err);
        return res.status(200).json({ user });
      });
    }
  )(req, res, next);
}

/**
 * logoutUserController
 * Ends the current session
 */
export async function logoutUserController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  req.logout(function (error) {
    if (error) return next(error);

    req.session.destroy(function (error) {
      if (error) return next(error);
      res.clearCookie("connect.sid", {
        path: "/",
      });
      res.status(200).json({ message: "Logged out" });
    });
  });
}

/**
 * registerUserController
 * Uses the registerUserService to validate and create a new user
 * Returns the created user or an error
 */
export async function registerUserController(req: Request, res: Response) {
  try {
    const userRegisterServiceResult = await registerUserService(
      req.body.validatedData
    );
    if (userRegisterServiceResult.success) {
      res.status(201).json(userRegisterServiceResult.data);
    } else {
      res.status(400).json(userRegisterServiceResult);
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * verifyController
 *
 * Uses the verifyUserService to validate and verify a user
 * Returns success message or an error
 */
export async function verifyController(req: Request, res: Response) {
  try {
    const verifyUserServiceResult = await verifyUserService(
      req.body.validatedData
    );
    if (verifyUserServiceResult.success) {
      res.status(200).json(verifyUserServiceResult.data);
    } else {
      res.status(400).json(verifyUserServiceResult);
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * userInfoController
 *
 * Returns the users info from the session
 */
export async function userInfoController(req: Request, res: Response) {
  try {
    if (req.isAuthenticated()) {
      res.status(200).json({ user: req.user });
    } else {
      res.status(401).json({ error: "Not logged in" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}
