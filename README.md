# bramvanosta.com

My personal site and my projects’ sites, from one repository and one deployment:

| Host                                                   | Pages               | What it is                                                                 |
| ------------------------------------------------------ | ------------------- | -------------------------------------------------------------------------- |
| [bramvanosta.com](https://bramvanosta.com)             | `src/pages/*.astro` | Who I am, what I do, my projects                                           |
| [ranch.bramvanosta.com](https://ranch.bramvanosta.com) | `src/pages/ranch/`  | [Ranch](https://github.com/Bramvanosta/Ranch), a desktop client for BullMQ |

Static pages built with [Astro](https://astro.build), served by a [Cloudflare Worker](https://developers.cloudflare.com/workers/static-assets/) with its static assets. No client framework, no cookies, no analytics: the only JavaScript is the clock on the home page and the copy button on Ranch’s.

A project’s own site is a **subsite**: it is built under `src/pages/<subsite>/` and served on `<subsite>.bramvanosta.com`. The list lives in `src/lib/sites.ts`.

## How it works

- **One build for every host.** Astro builds everything into `dist/`: the home page at its root, each subsite in its folder (`dist/ranch/`).
- **The Worker routes by host** (`worker/index.ts`):
  - `ranch.bramvanosta.com/x` serves `dist/ranch/x`;
  - `bramvanosta.com/ranch/x` redirects there (301);
  - `www.` and unknown subdomains redirect to the apex, and `http://` to `https://`;
  - the hashed build files under `/_astro/` are shared by every host and cached for a year.

  It sets the security headers on every response, redirects included: CSP with Trusted Types, HSTS, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy` and frame protection. The CSP allows scripts, fonts and images from the site itself only, so `astro.config.mjs` never inlines them; stylesheets are inlined on purpose, and the JSON-LD blocks are data, not scripts. Icons and social cards are cached for a day, and a 404 page answers with a 404 even at its own path.

- **Links between hosts** go through `link()` (`src/lib/links.ts`): the build path in development, the public URL in production.
- **Each host gets** its own `robots.txt` and `sitemap.xml` (`src/lib/site-files.ts`), 404 page, icons and social card.
- **Projects** are Markdown files in `src/content/projects/`, listed on the home page in their `order`. One with `draft: true` is not listed, but its file is public like the rest of the repository.

## Development

Requires Node 24 ([mise](https://mise.jdx.dev) reads `mise.toml`).

```bash
npm install
npm run dev        # Astro dev server: http://localhost:4321, Ranch at /ranch/
npm run check      # types, formatting (Prettier) and tests, as CI runs them
npm test           # the tests alone: the Worker's routing and headers, the site helpers
npm run format     # format every file with Prettier
npm run preview    # build, then serve dist/ through the Worker
```

`npm run preview` serves every host on port 8787: the apex at http://localhost:8787 and Ranch at http://ranch.localhost:8787. It is a production build, so a link from one host to the other leads to the live site.

### Images

Each site’s icons (`favicon.ico`, `apple-touch-icon.png`) and social card (`og.png`) are committed in `public/`. Render them again after changing what they are made from:

- the site’s `favicon.svg`, for the icons;
- its card, `scripts/images/og-<site>.html`, which also uses JetBrains Mono from `node_modules` and, for Ranch, the screenshot in `src/assets/ranch/`.

```bash
npm run images
```

sharp draws the icons, headless Chrome takes the cards. The script looks for Chrome where macOS installs it; set `CHROME` to use another Chrome or Chromium binary.

### Font

Ranch’s wordmark and labels use JetBrains Mono 600, cut down to printable ASCII and a little punctuation (`src/assets/fonts/`, about 9 KB). Before using it for another character, render the subset again:

```bash
npm run font
```

### Screenshots

Ranch’s screenshots in `src/assets/ranch/` come from the Ranch repository (`.github/assets/`). Astro turns them into AVIF and WebP at build time. A presentation video will take their place on Ranch’s page (`src/components/ranch/Screenshot.astro`).

### Adding a subsite

1. Add it to `SUBSITES` in `src/lib/sites.ts`.
2. Write its pages in `src/pages/<subsite>/`, including a `404.astro`.
3. Put its `favicon.svg` in `public/<subsite>/`, write its card as `scripts/images/og-<subsite>.html`, and run `npm run images`.
4. Add its `<subsite>.bramvanosta.com` route in `wrangler.jsonc`.
5. Add its project in `src/content/projects/` with `subsite: <subsite>`.

## Deployment

Every push to `main` is checked, built and deployed with `wrangler deploy` by `.github/workflows/deploy.yml`. Pull requests are checked and built only, and so is `main` until the two secrets below exist. `npm run deploy` deploys from a machine logged in with `npx wrangler login`.

### First-time setup

These steps move the domain’s DNS from OVH to Cloudflare without a moment offline: the old OVH web redirect keeps answering until the Worker takes its place. Nothing in this repository needs a secret: the two values below live in the GitHub repository settings only.

1. **Add the zone to Cloudflare.**
   - In the dashboard, choose _Add a domain_, enter `bramvanosta.com` and pick the Free plan.
   - Cloudflare imports the current records. Before going further, check that the mail records (MX) and the verification TXT records came along. Recreate any that is missing, with the value shown at OVH.
2. **Switch the nameservers at OVH.**
   - If DNSSEC is on at OVH, turn it off first.
   - In _Domain names › bramvanosta.com › DNS servers_, replace OVH’s servers with the two Cloudflare gives.
   - Wait until Cloudflare shows the zone as _Active_: from a few minutes to a day. Mail and the old redirect keep working meanwhile.
3. **Create an API token in Cloudflare** (_My Profile › API Tokens_) from the _Edit Cloudflare Workers_ template, limited to this account and the `bramvanosta.com` zone. If the first deploy fails while creating the custom domains, add _Zone › DNS › Edit_ to it.
4. **Add two repository secrets on GitHub** (_Settings › Secrets and variables › Actions_): `CLOUDFLARE_API_TOKEN`, and `CLOUDFLARE_ACCOUNT_ID` (shown on the account’s home page in the dashboard). From now on, every push to `main` deploys.
5. **Remove OVH’s web redirect from the zone**, right before deploying: the `A` record on the apex that points to OVH’s redirect service, the matching `www` record if there is one, and the TXT record starting with `4|`. A custom domain cannot be attached over them.
6. **Deploy**: in GitHub, _Actions › Deploy › Run workflow_ on `main`. Wrangler creates the Worker and attaches `bramvanosta.com`, `www.bramvanosta.com` and `ranch.bramvanosta.com` to it as custom domains, with their DNS records and certificates.
7. **Check every host**:
   - `https://bramvanosta.com` and `https://ranch.bramvanosta.com` answer;
   - `https://www.bramvanosta.com`, `http://bramvanosta.com` and `https://bramvanosta.com/ranch/` redirect;
   - a mail to the domain still arrives.
8. Later, once everything works on HTTPS: turn on DNSSEC in Cloudflare (_DNS › Settings_) and add the DS record it gives at OVH.

## License

The code is under the [MIT License](LICENSE). The written content, the images and the logos are © Bram van Osta, all rights reserved. [JetBrains Mono](https://github.com/JetBrains/JetBrainsMono) is under the [SIL Open Font License 1.1](src/assets/fonts/OFL.txt).
