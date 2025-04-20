"use server";

import { hashUserPassword } from "@/lib/hash";
import { createUser } from "@/lib/user";
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
    createUser(email, hashUserPassword);
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

  redirect("/training");
}
