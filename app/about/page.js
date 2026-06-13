import { getSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "About | Crown Coffee",
  description: "The story behind Crown Coffee, a specialty cafe in Uttara, Dhaka.",
};

const VALUES = [
  {
    title: "Carefully sourced",
    body: "Our beans are sourced from small farms and roasted in small batches, so every cup tastes the way it should.",
  },
  {
    title: "Baked daily",
    body: "Pastries and breads are made fresh each morning in-house &mdash; nothing sits longer than a day.",
  },
  {
    title: "Room to stay",
    body: "Plenty of seating, steady wifi and a calm room mean you're welcome to linger over one cup or three.",
  },
];

export default async function AboutPage() {
  const settings = await getSettings();

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 lg:px-10 lg:py-24">
      <p className="text-xs font-semibold tracking-[0.3em] text-[var(--accent)] uppercase">
        About us
      </p>
      <h1 className="mt-4 max-w-2xl font-display text-5xl sm:text-6xl">
        {settings.siteName} started with one simple idea: slow down.
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[var(--ink-soft)]">
        {settings.description}
      </p>

      <div className="mt-16 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--line)] sm:grid-cols-3">
        {VALUES.map((value) => (
          <div key={value.title} className="bg-[var(--card)] p-8">
            <h2 className="font-display text-xl">{value.title}</h2>
            <p
              className="mt-3 text-sm leading-relaxed text-[var(--ink-soft)]"
              dangerouslySetInnerHTML={{ __html: value.body }}
            />
          </div>
        ))}
      </div>

      <div className="mt-16 rounded-2xl border border-[var(--line)] bg-[var(--card)] p-8 sm:p-12">
        <h2 className="font-display text-2xl sm:text-3xl">Find us</h2>
        <p className="mt-3 max-w-md text-[var(--ink-soft)]">
          {settings.address}. {settings.phone && <>Call us on {settings.phone}.</>}
        </p>
        {settings.mapUrl && (
          <a
            href={settings.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--ink)] px-7 py-3 text-sm font-semibold tracking-wide text-[var(--paper)] transition hover:bg-[var(--accent)]"
          >
            Get directions
          </a>
        )}
      </div>
    </div>
  );
}
