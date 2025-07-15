import { NextFunction, Request, Response } from "express";
import { ZodObject } from "zod/v4";

/**
 * validateId
 *
 * Middleware to validate that the ID in the request parameters is a valid number
 */
export function validateId(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const validatedId = parseInt(req.params.id, 10);
  if (isNaN(validatedId)) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  // Merge the validated Id with any existing validated data
  req.validated = { ...(req.validated ?? {}), id: validatedId };
  next();
}

/**
 * validateSchemaMiddleware
 *
 * Middleware to validate the request body against a Zod schema
 */
export const validateSchemaMiddleware =
  (schema: ZodObject) => (req: Request, res: Response, next: NextFunction) => {
    const validatedData = schema.safeParse(req.body);
    if (validatedData.success) {
      // Add the validated data to the request object
      // TODO => We should be adding this to the validated object on the augmented request
      req.body.validatedData = validatedData.data;
      return next();
    } else {
      res
        .status(400)
        .json({ success: false, error: validatedData.error.issues[0].message });
    }
  };
