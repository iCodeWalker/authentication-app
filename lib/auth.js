import { Lucia } from "lucia";
import { BetterSqlite3Adapter } from "@lucia-auth/adapter-sqlite";
import db from "./db";
import { cookies } from "next/headers";

const adapter = new BetterSqlite3Adapter(db, {
  user: "users",
  session: "sessions",
});

const lucia = new Lucia(adapter, {
  sessionCookie: {
    expires: false,
    attributes: {
      secure: process.env.NODE_ENV === "production",
    },
  },
});

// ##### This function should create and store a new session in the sessions database table. ######
// ##### and set such a cookie to the outgoing request ######
export async function createAuthSession(userId) {
  // #### Under the hood this will create a new entry in the new sessions database table ####
  const session = await lucia.createSession(userId, {});

  const sessionCookie = lucia.createSessionCookie(session.id); // Creates a cookie

  // #### Function we can call to access the cookie that belongs to the outgoing response ####
  // #### to set the cookies on the ongoing response ####
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );
}
