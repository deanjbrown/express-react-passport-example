import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { userBaseSchema, users } from "./user";
import { createInsertSchema } from "drizzle-zod";
import z from "zod/v4";
import { InferSelectModel, relations } from "drizzle-orm";

// Define types of verification code
export const verificationCodeTypes = pgEnum("verification_code_types", [
  "register",
  "passwordReset",
]);

// Define the verification codes table
export const verificationCodes = pgTable("verification_codes", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
    }),
  type: verificationCodeTypes("type").notNull(),
  code: varchar("code").notNull().unique(),
  isUsed: boolean("is_used").notNull().default(false),
  usedAt: timestamp("used_at", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
});

// Define the verification codes relations
export const verificationCodesRelations = relations(
  verificationCodes,
  ({ one }) => ({
    user: one(users, {
      fields: [verificationCodes.userId],
      references: [users.id],
    }),
  })
);

// Define the base schema
export const verificationCodeBaseSchema = createInsertSchema(
  verificationCodes,
  {
    code: z
      .string()
      .length(64, { message: "Invalid verification code length" })
      .regex(/^[a-f0-9]{64}$/i, {
        message: "Invalid verification code format",
      }),
    type: z.enum(verificationCodeTypes.enumValues),
  }
);

// Define validation scheme
export const validateVerificationCodeSchema = z.object({
  code: verificationCodeBaseSchema.shape.code,
});

export type ValidateVerificationCodeSchema = z.infer<
  typeof validateVerificationCodeSchema
>;

export type SelectVerificationCodeModel = InferSelectModel<
  typeof verificationCodes
>;
