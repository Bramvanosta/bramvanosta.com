import assert from "node:assert/strict";
import { test } from "node:test";
import { preferredLocale } from "./i18n.ts";

test("a browser's preferred language is the first of ours by weight, English if none", () => {
  assert.equal(preferredLocale("fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7"), "fr");
  assert.equal(preferredLocale("en-GB,en;q=0.9,fr;q=0.8"), "en");
  assert.equal(preferredLocale("de-DE,fr;q=0.5,en;q=0.3"), "fr");
  assert.equal(preferredLocale("en;q=0.5, FR;q=0.8"), "fr");
  assert.equal(preferredLocale("fr, en"), "fr");
  assert.equal(preferredLocale("nl-NL,de"), "en");
  assert.equal(preferredLocale("*"), "en");
  assert.equal(preferredLocale(null), "en");
});
