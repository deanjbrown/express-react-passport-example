import dotenv from "dotenv";
import z, { ZodError } from "zod";

// Define a env schema
const envSchema = z.object({
  IS_DEV: z.string().transform((val) => (val === "true" ? true : false)),
  EXPRESS_HOST: z.string().min(1),
  EXPRESS_PORT: z.coerce.number().min(1),
  POSTGRES_HOST: z.string().min(1),
  POSTGRES_PORT: z.coerce.number().min(1),
  POSTGRES_USER: z.string().min(1),
  POSTGRES_PASSWORD: z.string().min(1),
  POSTGRES_DB: z.string().min(1),
  POSTGRES_SSL: z.string().transform((val) => (val === "true" ? true : false)),
  PASSPORT_SECRET: z.string().min(1),
  EMAIL_SERVICE: z.string().min(1),
  EMAIL_PORT: z.coerce.number().min(1),
  EMAIL_SECURE: z.string().transform((val) => (val === "true" ? true : false)),
  EMAIL_ADDRESS: z.string().min(1),
  EMAIL_PASSWORD: z.string().min(1),
});

// Import the environment variables
dotenv.config();

// Attempt to process the environment variables.
try {
  envSchema.parse(process.env);
} catch (e) {
  // Display an eror if this fails
  if (e instanceof ZodError) {
    console.error(`Environment validation failed: ${e.errors}`);
  }
}

// Export an object containing the environment variables
export default envSchema.parse(process.env);
