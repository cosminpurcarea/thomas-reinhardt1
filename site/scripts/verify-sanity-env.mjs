import { createClient } from "@sanity/client";

const pid = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const ds = process.env.NEXT_PUBLIC_SANITY_DATASET;
const tok = process.env.SANITY_API_TOKEN;

const formatOk = pid && /^[a-z0-9-]+$/.test(pid) && !pid.includes("YOUR");

console.log("NEXT_PUBLIC_SANITY_PROJECT_ID:", pid);
console.log("Format check (lowercase a-z, 0-9, hyphens only):", formatOk ? "PASS" : "FAIL");

if (!formatOk) {
  console.error(
    "\nUse the Project ID from sanity.io/manage (e.g. xyz12abc), not the project title."
  );
  process.exit(1);
}

const client = createClient({
  projectId: pid,
  dataset: ds || "production",
  apiVersion: "2024-01-01",
  useCdn: false,
  token: tok,
});

try {
  const n = await client.fetch(`count(*[_type == "product"])`);
  console.log("API reachable. Product documents in dataset:", n);
  process.exit(0);
} catch (e) {
  console.error("Sanity API error:", e.message);
  process.exit(1);
}
