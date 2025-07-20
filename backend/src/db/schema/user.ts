import { InferSelectModel, relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import z from "zod/v4";
import { posts } from "./post";
import { verificationCodes } from "./verificationCode";

// Define user roles
export const userRoles = pgEnum("user_roles", ["admin", "user"]);

// Define the users table
export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  role: userRoles("user_role").default("user").notNull(),
  firstName: varchar("first_name", { length: 64 }).notNull(),
  lastName: varchar("last_name", { length: 64 }).notNull(),
  email: varchar("email", { length: 64 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  isVerified: boolean("is_verified").default(false).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
});

// Define user relationsships
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  verificationCodes: many(verificationCodes)
}));

// Define a base schema for creating a user
export const userBaseSchema = createInsertSchema(users, {
  firstName: z
    .string()
    .trim()
    .min(2, { message: "First name must be at least 2 characters long" })
    .max(64, { message: "First name must be less than 64 characters long" }),
  lastName: z
    .string()
    .trim()
    .min(2, { message: "Last name must be at least 2 characters long" })
    .max(64, { message: "Last name must be less than 64 characters long" }),
  email: z
    .email("Invalid email address")
    .trim()
    .toLowerCase()
    .max(64, { message: "Email must be less than 64 characters long" }),
  password: z
    .string()
    .trim()
    .min(8, { message: "Password must be at least 8 characters long" })
    .max(255, { message: "Password must be less than 255 characters long" })
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
});

// Define modes for the user schema (register, login, update)
export const userRegisterSchema = z
  .object({
    firstName: userBaseSchema.shape.firstName,
    lastName: userBaseSchema.shape.lastName,
    email: userBaseSchema.shape.email,
    password: userBaseSchema.shape.password,
    confirmPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" })
      .max(255, { message: "Password must be less than 255 characters long" })
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"], // Attaches the error to the confirm password field
  });

export const userLoginSchema = z.object({
  email: userBaseSchema.shape.email,
  password: userBaseSchema.shape.password,
});

export const userUpdateSchema = z
  .object({
    firstName: userBaseSchema.shape.firstName,
    lastName: userBaseSchema.shape.lastName,
    email: userBaseSchema.shape.email,
    password: userBaseSchema.shape.password,
    confirmPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" })
      .max(255, { message: "Password must be less than 255 characters long" })
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"], // Attaches the error to the confirm password field
  });

export type UserRegisterSchema = z.infer<typeof userRegisterSchema>;
export type UserLoginSchema = z.infer<typeof userLoginSchema>;
export type UserUpdateSchema = z.infer<typeof userUpdateSchema>;
export type SelectUserModel = InferSelectModel<typeof users>;
