"use server";

import { createAuthSession, destroySession } from "@/lib/auth";
import { hashUserPassword, verifyPassword } from "@/lib/hash";
import { createUser, getUserByEmail } from "@/lib/user";
import { redirect } from "next/navigation";

export async function signUp(prevState, formData) {
  const email = formData.get("email");
  const password = formData.get("password");

  // ########### validate user input ##############

  let errors = {};
  if (!email.includes("@") || !email.includes(".")) {
    errors.email = "Please enter a valid email address.";
  }

  if (password.trim().length < 8) {
    errors.password = "Password must be 8 characters long.";
  }

  if (Object.keys(errors).length > 0) {
    return {
      errors: errors,
    };
  }

  // ########### Store in database to create a user ###########
  // ###### With this approach the password will be stored in data base as a plain text ######

  // We should never save password as plain text in the database.

  // We should hash the password and than store it into the database
  //   createUser(email, password);

  // #### using function to create a hashed password
  const hashedPassword = hashUserPassword(password);

  // ############ Checking for duplicate email ############

  try {
    const id = createUser(email, hashedPassword);
    // #### Create a new auth session ######
    await createAuthSession(id);
    redirect("/training");
  } catch (error) {
    if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return {
        errors: {
          email: "User with this email already exists",
        },
      };
    }
    throw error;
  }
}

export async function login(prevState, formData) {
  const email = formData.get("email");
  const password = formData.get("password");

  const existingUser = getUserByEmail(email);

  if (!existingUser) {
    return {
      errors: {
        email: "User not found. Please check your credentials.",
      },
    };
  }

  const isValidPassword = verifyPassword(existingUser.password, password);

  if (!isValidPassword) {
    return {
      errors: {
        password: "Could not authenticate user. Please check your credentials",
      },
    };
  }

  // #### Create a new auth session ######
  await createAuthSession(existingUser.id);
  redirect("/training");
}

export async function auth(mode, prevState, formData) {
  if (mode === "login") {
    return login(prevState, formData);
  }
  return signUp(prevState, formData);
}

export async function logout() {
  await destroySession();
  redirect("/");
}
