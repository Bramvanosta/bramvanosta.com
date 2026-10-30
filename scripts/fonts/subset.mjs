// @ts-check
// Cuts each self-hosted font down to the characters its pages can use, and writes it to
// src/assets/fonts/ with its license (npm run font). Run it again before using a font for a
// character outside its set below.
import { copyFileSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import subsetFont from "subset-font";
import { PROFILE } from "../../src/lib/profile.ts";

const require = createRequire(import.meta.url);
const folder = new URL("../../src/assets/fonts/", import.meta.url);

const ascii = Array.from({ length: 0x7f - 0x20 }, (_, index) => String.fromCharCode(0x20 + index)).join("");
const punctuation = "·‘’“”–—…→↗";

const fonts = [
  // Ranch's wordmark and labels.
  { family: "jetbrains-mono", weight: 600, text: ascii + punctuation },
  // The home page: its text (and its footer's ©), its labels, its 404 title, and the name in its logo only.
  { family: "inter", weight: 400, text: ascii + punctuation + "©" },
  { family: "inter", weight: 600, text: ascii + punctuation },
  { family: "inter-tight", weight: 700, text: ascii + punctuation },
  { family: "ibm-plex-mono", weight: 400, text: ascii + punctuation },
  { family: "newsreader", weight: 500, text: PROFILE.name },
];

for (const { family, weight, text } of fonts) {
  const source = require.resolve(`@fontsource/${family}/files/${family}-latin-${weight}-normal.woff2`);
  const output = fileURLToPath(new URL(`${family}-${weight}-subset.woff2`, folder));
  // No layout closure: features like JetBrains Mono's code ligatures (->, ===…) would bring
  // hundreds of glyphs that these pages never need.
  const subset = await subsetFont(readFileSync(source), [...new Set(text)].join(""), {
    targetFormat: "woff2",
    noLayoutClosure: true,
  });
  writeFileSync(output, subset);
  copyFileSync(require.resolve(`@fontsource/${family}/LICENSE`), fileURLToPath(new URL(`${family}-OFL.txt`, folder)));
  console.log(`wrote ${output} (${subset.length} bytes)`);
}
