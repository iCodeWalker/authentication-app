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

// ####### Function to verify session #########
// ########## To check if the incoming request is coming from an authenticated user / The incoming request has that authenticated cookie and it is valid cookie ##########
export async function verifyAuth() {
  const sessionCookie = cookies().get(lucia.sessionCookieName);

  if (!sessionCookie) {
    // ######## return object is upto us what we want to send ########
    return {
      user: null,
      session: null,
    };
  }

  const sessionId = sessionCookie.value;

  if (!sessionId) {
    // ######## return object is upto us what we want to send ########
    return {
      user: null,
      session: null,
    };
  }

  // ###### Validate the session ######
  const result = await lucia.validateSession(sessionId);

  try {
    // ########## When we have checked and found that it is a valid session, we can refresh it so it remains active and user is not suddenly logged out, so we have to create a new session. ##########

    // ######### This re-creates a cookie for an active session and therefore prolong it. #########
    if (result.session && result.session.fresh) {
      // ###### To create a new session ######
      const sessionCookie = lucia.createSessionCookie(result.session.id);
      // ###### Set the cookie #######
      cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
      );

      // ################## Clearing the cookie, if not valid : STARTS : ####################

      // ###### If we not found the session on the result, than we should clear the session cookie that was sent along, as it is not a cookie foer a valid session ######
      if (!result.session) {
        const sessionCookie = lucia.createBlankSessionCookie();
        // ###### Set the cookie #######
        cookies().set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes
        );
      }
      // ################## Clearing the cookie, if not valid : ENDS : ####################
    }
  } catch (error) {}

  return result;
  // result is an object with keys { user: value, session: value}
}
