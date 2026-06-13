import { getSettings } from "@/lib/data";
import { DAY_ORDER, DAY_LABELS, formatDayHours } from "@/lib/hours";
import StatusBadge from "@/components/StatusBadge";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Contact | Crown Coffee",
  description: "Address, phone number, opening hours and map for Crown Coffee, Uttara.",
};

export default async function ContactPage() {
  const settings = await getSettings();

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 lg:px-10 lg:py-24">
      <p className="text-xs font-semibold tracking-[0.3em] text-[var(--accent)] uppercase">
        Contact
      </p>
      <h1 className="mt-4 font-display text-5xl sm:text-6xl">Get in touch</h1>
      <p className="mt-4 max-w-xl text-[var(--ink-soft)]">
        Stop by, call ahead, or get directions &mdash; we&rsquo;re easy to find on Shah Makdum Avenue.
      </p>

      <div className="mt-14 grid grid-cols-1 gap-12 lg:grid-cols-2">
        <div className="flex flex-col gap-10">
          <div>
            <h2 className="text-xs font-semibold tracking-[0.2em] text-[var(--mute)] uppercase">
              Address
            </h2>
            <p className="mt-2 font-display text-xl">{settings.address}</p>
            {settings.mapUrl && (
              <a
                href={settings.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-2 text-sm font-semibold tracking-wide text-[var(--accent)] hover:underline"
              >
                Open in Google Maps &rarr;
              </a>
            )}
          </div>

          <div>
            <h2 className="text-xs font-semibold tracking-[0.2em] text-[var(--mute)] uppercase">
              Phone
            </h2>
            <p className="mt-2 font-display text-xl">
              <a href={`tel:${settings.phone}`} className="hover:text-[var(--accent)]">
                {settings.phone}
              </a>
            </p>
          </div>

          <div>
            <h2 className="text-xs font-semibold tracking-[0.2em] text-[var(--mute)] uppercase">
              Hours
            </h2>
            <div className="mt-3">
              <StatusBadge hours={settings.hours} />
            </div>
            <dl className="mt-5 flex flex-col divide-y divide-[var(--line)] text-sm">
              {DAY_ORDER.map((dayKey) => (
                <div key={dayKey} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--ink-soft)]">{DAY_LABELS[dayKey]}</dt>
                  <dd
                    className="font-medium text-[var(--ink)]"
                    dangerouslySetInnerHTML={{ __html: formatDayHours(settings.hours?.[dayKey]) }}
                  />
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[var(--line)]">
          <iframe
            title="Crown Coffee location map"
            src={`https://www.google.com/maps?q=${encodeURIComponent(
              `Crown Coffee, ${settings.address}`
            )}&output=embed`}
            className="h-80 w-full lg:h-full"
            style={{ border: 0, minHeight: "420px" }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </div>
  );
}
