/**
 * One-time: create or reset a Clerk user (email + password) via Backend API.
 * Usage (from site/): node --env-file=.env.local scripts/create-admin-user.mjs
 * Optional: set ADMIN_EMAIL_TO_CREATE (defaults to cosmin.purcarea@outlook.com)
 */
import { createClerkClient } from "@clerk/backend";
import crypto from "crypto";

const email =
  process.env.ADMIN_EMAIL_TO_CREATE?.trim() ||
  "cosmin.purcarea@outlook.com";

function generatePassword(length = 28) {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*-_=+";
  const bytes = crypto.randomBytes(length);
  let pwd = "";
  for (let i = 0; i < length; i++) {
    pwd += chars[bytes[i] % chars.length];
  }
  return pwd;
}

const secretKey = process.env.CLERK_SECRET_KEY;
if (!secretKey) {
  console.error("Missing CLERK_SECRET_KEY (load .env.local with --env-file).");
  process.exit(1);
}

const clerk = createClerkClient({ secretKey });
const password = generatePassword();

try {
  const existing = await clerk.users.getUserList({
    emailAddress: [email],
    limit: 5,
  });

  if (existing.data?.length) {
    const userId = existing.data[0].id;
    await clerk.users.updateUser(userId, {
      password,
      signOutOfOtherSessions: true,
    });
    console.log(JSON.stringify({ ok: true, action: "password_reset", userId, email }));
  } else {
    await clerk.users.createUser({
      emailAddress: [email],
      password,
    });
    console.log(JSON.stringify({ ok: true, action: "created", email }));
  }

  console.log("\n--- PASSWORD (save in a password manager; do not commit) ---\n");
  console.log(password);
  console.log("\n--- end ---\n");
} catch (e) {
  console.error(e?.message || e);
  process.exit(1);
}
