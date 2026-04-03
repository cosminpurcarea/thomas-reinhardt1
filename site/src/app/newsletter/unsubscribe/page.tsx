import UnsubscribeClient from "./UnsubscribeClient";

export default async function NewsletterUnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const e = typeof params.e === "string" ? params.e : "";
  const exp = typeof params.exp === "string" ? params.exp : "";
  const sig = typeof params.sig === "string" ? params.sig : "";

  return (
    <div className="mx-auto w-full max-w-xl px-6 py-16">
      <UnsubscribeClient e={e} exp={exp} sig={sig} />
    </div>
  );
}

