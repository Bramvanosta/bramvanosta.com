// @ts-check
// Cuts JetBrains Mono 600, Ranch's wordmark and label font, down to the characters its pages
// can use, and writes it to src/assets/fonts/ (npm run font). Run it again before using the
// font for a character outside printable ASCII and the punctuation below.
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import subsetFont from "subset-font";

const require = createRequire(import.meta.url);
const source = require.resolve("@fontsource/jetbrains-mono/files/jetbrains-mono-latin-600-normal.woff2");
const output = fileURLToPath(new URL("../../src/assets/fonts/jetbrains-mono-600-subset.woff2", import.meta.url));

const ascii = Array.from({ length: 0x7f - 0x20 }, (_, index) => String.fromCharCode(0x20 + index)).join("");
const punctuation = "·‘’“”–—…→↗";

// No layout closure: the code ligatures (->, ===…) would bring hundreds of glyphs that labels never need.
const subset = await subsetFont(readFileSync(source), ascii + punctuation, {
  targetFormat: "woff2",
  noLayoutClosure: true,
});
writeFileSync(output, subset);
console.log(`wrote ${output} (${subset.length} bytes)`);
