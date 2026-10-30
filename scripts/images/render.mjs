// @ts-check
// Renders the committed images of every site in public/ (npm run images):
// - favicon.ico (32 px) from the site's favicon.svg, with sharp;
// - apple-touch-icon.png (180 px) from touch-icon-<site>.svg beside this script, or else from the
//   favicon, with sharp;
// - og.png, the social card, from og-<site>.html beside this script, with headless Chrome.
// CHROME can point to another Chrome or Chromium binary.
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { SUBSITES } from "../../src/lib/sites.ts";

const root = fileURLToPath(new URL("../../", import.meta.url));
const here = fileURLToPath(new URL(".", import.meta.url));
const chrome = process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const sites = [
  { name: "home", folder: "public" },
  ...SUBSITES.map((subsite) => ({ name: subsite, folder: `public/${subsite}` })),
];

/**
 * An ICO file holding one PNG image, which every browser that asks for /favicon.ico reads.
 * @param {Buffer} png
 * @param {number} size
 */
function ico(png, size) {
  const header = Buffer.alloc(22);
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(1, 4); // one image
  header.writeUInt8(size, 6);
  header.writeUInt8(size, 7);
  header.writeUInt16LE(1, 10); // colour planes
  header.writeUInt16LE(32, 12); // bits per pixel
  header.writeUInt32LE(png.length, 14);
  header.writeUInt32LE(header.length, 18); // the PNG starts right after this header
  return Buffer.concat([header, png]);
}

const scratch = mkdtempSync(join(tmpdir(), "og-"));
try {
  for (const { name, folder } of sites) {
    const favicon = readFileSync(join(root, folder, "favicon.svg"));
    const small = await sharp(favicon, { density: 300 }).resize(32, 32).png().toBuffer();
    writeFileSync(join(root, folder, "favicon.ico"), ico(small, 32));

    // A touch icon is a full-bleed square: iOS rounds its corners itself. A site without its own
    // drawing takes its favicon, a tile that drops its corners.
    const own = join(here, `touch-icon-${name}.svg`);
    const square = existsSync(own)
      ? readFileSync(own)
      : Buffer.from(favicon.toString("utf8").replace(/ rx="[\d.]+"/, ""));
    await sharp(square, { density: 600 })
      .resize(180, 180)
      .png()
      .toFile(join(root, folder, "apple-touch-icon.png"));

    const shot = join(scratch, "card.png");
    execFileSync(
      chrome,
      [
        "--headless=new",
        "--disable-gpu",
        "--hide-scrollbars",
        "--force-device-scale-factor=1",
        "--window-size=1200,630",
        `--screenshot=${shot}`,
        `file://${join(here, `og-${name}.html`)}`,
      ],
      // Quiet when it works; a failure throws with Chrome's output.
      { stdio: "pipe" },
    );
    await sharp(shot)
      .png({ compressionLevel: 9, palette: true, quality: 90 })
      .toFile(join(root, folder, "og.png"));
    console.log(`wrote ${folder}/favicon.ico, apple-touch-icon.png and og.png`);
  }
} finally {
  rmSync(scratch, { recursive: true, force: true });
}
