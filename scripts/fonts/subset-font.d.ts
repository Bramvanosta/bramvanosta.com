// subset-font ships no types: the part of its API that subset.mjs uses.
declare module "subset-font" {
  interface Options {
    targetFormat?: "sfnt" | "woff" | "woff2" | "truetype";
    noLayoutClosure?: boolean;
  }

  export default function subsetFont(font: Buffer, text: string, options?: Options): Promise<Buffer>;
}
