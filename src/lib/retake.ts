// Retake's public links, and its build-from-source commands as its README gives them.
const REPO = "https://github.com/Bramvanosta/Video";

export const RETAKE = {
  repo: REPO,
  releases: `${REPO}/releases`,
  changelog: `${REPO}/blob/main/CHANGELOG.md`,

  /** False until the first release is on GitHub: the page then says it is on its way and points to the source. */
  released: false,

  source: `git clone ${REPO}.git && cd Video
pnpm install && pnpm build
pnpm --filter @retake/runner-web exec playwright-core install chromium
pnpm retake doctor        # is this machine ready?`,
} as const;
