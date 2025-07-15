import { hash } from "bcrypt";
import { eq } from "drizzle-orm";
import prompts from "prompts";
import { db } from ".";
import { userRegisterSchema, users } from "./schema/user";

async function main() {
  console.log("👤 Create Admin User\n");

  // Prompt the user for the admin's details
  const { email } = await prompts({
    type: "text",
    name: "email",
    message: "Enter your email address:",
    validate: (value) => {
      const result = userRegisterSchema.shape.email.safeParse(value);
      return result.success ? true : result.error.issues[0].message;
    },
  });

  const { firstName } = await prompts({
    type: "text",
    name: "firstName",
    message: "Enter your first name:",
    validate: (value) => {
      const result = userRegisterSchema.shape.firstName.safeParse(value);
      return result.success ? true : result.error.issues[0].message;
    },
  });

  const { lastName } = await prompts({
    type: "text",
    name: "lastName",
    message: "Enter your last name:",
    validate: (value) => {
      const result = userRegisterSchema.shape.lastName.safeParse(value);
      return result.success ? true : result.error.issues[0].message;
    },
  });

  const { password } = await prompts({
    type: "password",
    name: "password",
    message: "Enter a password",
    validate: (value) => {
      const result = userRegisterSchema.shape.password.safeParse(value);
      return result.success ? true : result.error.issues[0].message;
    },
  });

  const { confirmPassword } = await prompts({
    type: "password",
    name: "confirmPassword",
    message: "Confirm your pasword",
    validate: (value) => {
      if (value !== password) {
        return "Passwords do not match";
      }
      return true;
    },
  });

  // Validate the users details
  const validatedData = userRegisterSchema.safeParse({
    firstName,
    lastName,
    email,
    password,
    confirmPassword,
  });

  if (!validatedData.success) {
    console.error(validatedData.error.issues[0].message);
    process.exit();
  }

  // Check that a user with that email address does not already exist
  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, email));

  if (existingUser) {
    console.error("[-] A user with that email address already exists");
    process.exit(1);
  }

  // Hash the password
  const hashedPassword = await hash(password, 10);

  // Create the user
  await db.insert(users).values({
    ...validatedData.data,
    role: "admin",
    isVerified: true,
    password: hashedPassword,
  });
}

main()
  .then(() => {
    console.log("[+] Admin user created successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("[-] Error: ", error);
    process.exit(1);
  });
