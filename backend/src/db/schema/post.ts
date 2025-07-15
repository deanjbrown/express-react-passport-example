import { InferSelectModel, relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./user";
import { createInsertSchema } from "drizzle-zod";
import z from "zod/v4";

// Define the post table
export const posts = pgTable("posts", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  coverImage: varchar("cover_image", { length: 2048 }).notNull(),
  isDraft: boolean("is_draft").default(true).notNull(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
    }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
});

// Define the post relations
export const postsRelations = relations(posts, ({ one }) => ({
  user: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
}));

// Define a base schema for creating a post
export const postBaseSchema = createInsertSchema(posts, {
  title: z
    .string()
    .min(2, { message: "Post title must be at least 2 characters long" })
    .max(255, { message: "Post title must be less than 255 characters long" }),
  content: z
    .string()
    .min(2, { message: "Post content must be at least 2 characters long" })
    .max(20000),
  coverImage: z
    .string()
    .min(2, { message: "Cover image must be at least 2 characters long" })
    .max(2048),
  isDraft: z.boolean().default(true),
  userId: z.number().int().positive(),
});

// Define modes for the post schema (create, update, delete)
export const postCreateSchema = z.object({
  title: postBaseSchema.shape.title,
  content: postBaseSchema.shape.content,
  coverImage: postBaseSchema.shape.coverImage,
  isDraft: postBaseSchema.shape.isDraft,
});

export const postUpdateSchema = z.object({
  title: postBaseSchema.shape.title.optional(),
  content: postBaseSchema.shape.content.optional(),
  coverImage: postBaseSchema.shape.coverImage.optional(),
  isDraft: postBaseSchema.shape.isDraft.optional(),
});

export type PostCreateSchema = z.infer<typeof postCreateSchema>;
export type PostUpdateSchema = z.infer<typeof postUpdateSchema>;
export type SelectPostModel = InferSelectModel<typeof posts>;
