import { SsoCallbackClient } from "./SsoCallbackClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Server entry so segment config applies; client body deferred until mount.
 */
export default function SsoCallbackPage() {
  return <SsoCallbackClient />;
}
