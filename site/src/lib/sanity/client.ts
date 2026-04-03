import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;

function isValidSanityProjectId(value: string | undefined) {
  if (!value) return false;
  // Sanity projectId must be lowercase with only [a-z0-9-].
  // We also treat common placeholders like "YOUR_*" as invalid.
  if (value.includes("YOUR")) return false;
  return /^[a-z0-9-]+$/.test(value);
}

export function getSanityClient() {
  if (!isValidSanityProjectId(projectId) || !dataset) return null;

  // useCdn: false — avoid stale lists after CMS publishes (CDN can lag ~60s).
  return createClient({
    projectId,
    dataset,
    apiVersion: "2024-01-01",
    useCdn: false,
  });
}

/** Editor token required — used for admin uploads and mutations only. */
export function getSanityWriteClient() {
  if (!isValidSanityProjectId(projectId) || !dataset) return null;
  const token = process.env.SANITY_API_TOKEN;
  if (!token || token.includes("YOUR")) return null;

  return createClient({
    projectId,
    dataset,
    apiVersion: "2024-01-01",
    useCdn: false,
    token,
  });
}

/** Human-readable blockers for admin UI (server-safe). */
export function getSanityEnvIssues(): string[] {
  const issues: string[] = [];
  const rawPid = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const ds = process.env.NEXT_PUBLIC_SANITY_DATASET;
  const tok = process.env.SANITY_API_TOKEN;

  if (!rawPid?.trim()) {
    issues.push(
      "Set NEXT_PUBLIC_SANITY_PROJECT_ID to your project id from sanity.io/manage → Project settings."
    );
  } else if (rawPid.includes("YOUR") || !isValidSanityProjectId(rawPid)) {
    issues.push(
      "Replace NEXT_PUBLIC_SANITY_PROJECT_ID: use the Project ID field from Sanity (lowercase letters, numbers, hyphens only — e.g. abc12xyz). It is not your project display name."
    );
    if (/[A-Z_]/.test(rawPid)) {
      issues.push(
        "Your value looks like a project title (uppercase or _). Open sanity.io/manage → select the project → Project settings → copy Project ID."
      );
    }
  }

  if (!ds?.trim()) {
    issues.push(
      "Set NEXT_PUBLIC_SANITY_DATASET (usually production) to match your Sanity dataset name."
    );
  }

  if (!tok?.trim() || tok.includes("YOUR")) {
    issues.push(
      "Set SANITY_API_TOKEN to an API token with Editor access (sanity.io/manage → API → Tokens)."
    );
  }

  return issues;
}

