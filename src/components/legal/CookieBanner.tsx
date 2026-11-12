"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AGE_COOKIE, CONSENT_COOKIE, CONSENT_EVENT, readCookie, writeCookie } from "@/lib/consent";

type Labels = { text: string; accept: string; decline: string; more: string };

/** Banner de consentimiento (nLPD). Aparece después de confirmar la edad. */
export function CookieBanner({ labels, privacyHref }: { labels: Labels; privacyHref: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const check = () => setVisible(readCookie(AGE_COOKIE) === "1" && !readCookie(CONSENT_COOKIE));
    check();
    window.addEventListener("rs:age-confirmed", check);
    return () => window.removeEventListener("rs:age-confirmed", check);
  }, []);

  if (!visible) return null;

  const decide = (value: "accepted" | "declined") => {
    writeCookie(CONSENT_COOKIE, value, 180);
    setVisible(false);
    window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value }));
  };

  return (
    <div
      role="region"
      aria-label="Cookies"
      className="fixed inset-x-3 bottom-3 z-[90] mx-auto max-w-3xl animate-rise rounded-[var(--radius-card)] border border-line-dark bg-ink-3 p-4 shadow-2xl sm:flex sm:items-center sm:gap-4"
    >
      <p className="text-sm text-paper/85">
        {labels.text}{" "}
        <Link href={privacyHref} className="underline decoration-lime underline-offset-4 hover:text-lime">
          {labels.more}
        </Link>
      </p>
      <div className="mt-3 flex shrink-0 gap-2 sm:mt-0">
        <button
          type="button"
          onClick={() => decide("declined")}
          className="min-h-11 flex-1 rounded-full border border-line-dark px-4 text-sm font-bold uppercase text-paper/80 hover:border-paper"
        >
          {labels.decline}
        </button>
        <button
          type="button"
          onClick={() => decide("accepted")}
          className="min-h-11 flex-1 rounded-full bg-lime px-4 text-sm font-bold uppercase text-ink hover:bg-lime-soft"
        >
          {labels.accept}
        </button>
      </div>
    </div>
  );
}
