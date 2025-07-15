import { NextFunction, Request, Response } from "express";

/**
 * isAuthenticated
 *
 * Middleware to protect an endpoint from being accessed if a user is not logged in
 */
export function isAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "Not logged in" });
}

/**
 * isAdmin
 *
 * Middleware to protect an endpoint from being accessed if a user is not an admin
 */
export function isAdmin(req: Request, res: Response, next: NextFunction): void {
  if (req.isAuthenticated() && req.user?.role === "admin") {
    return next();
  } else {
    res.status(403).json({ error: "Forbidden" });
  }
}
