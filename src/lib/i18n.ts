// The languages of the home page, shared by the Astro pages and the Worker: English at /, French at
// /fr/. The Worker sends a visitor whose browser prefers French from / to /fr/, and remembers a
// language picked with the switch on the page in a cookie.

export const LOCALES = ["en", "fr"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/** The home page in each language, as a built path. */
export const HOME_PATHS: Record<Locale, string> = { en: "/", fr: "/fr/" };

/** Each language as <html lang> and as Open Graph writes it. */
export const LANGUAGE_TAGS: Record<Locale, { html: string; og: string }> = {
  en: { html: "en-GB", og: "en_GB" },
  fr: { html: "fr-FR", og: "fr_FR" },
};

/** The query parameter of the switch's links (/fr/?lang=fr), and the cookie that keeps the choice. */
export const LANGUAGE_PARAM = "lang";

export function isLocale(value: string | null | undefined): value is Locale {
  return (LOCALES as readonly (string | null | undefined)[]).includes(value);
}

/** The language a browser prefers among ours: "fr-FR,fr;q=0.9,en;q=0.8" → "fr". English if none. */
export function preferredLocale(acceptLanguage: string | null): Locale {
  let best = DEFAULT_LOCALE;
  let bestWeight = 0;
  for (const range of (acceptLanguage ?? "").split(",")) {
    const [tag = "", ...params] = range.split(";").map((part) => part.trim());
    const language = tag.split("-")[0]?.toLowerCase();
    if (!isLocale(language)) continue;
    const q = params.find((param) => param.startsWith("q="));
    const weight = q ? Number(q.slice(2)) : 1;
    // Strictly greater: of two languages with the same weight, the first listed wins.
    if (weight > bestWeight) {
      best = language;
      bestWeight = weight;
    }
  }
  return best;
}
