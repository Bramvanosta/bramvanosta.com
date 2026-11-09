// Retake's public links, and its install commands as its README and its Homebrew tap give them.
const REPO = "https://github.com/Bramvanosta/Retake";

export const RETAKE = {
  repo: REPO,
  releases: `${REPO}/releases/latest`,
  changelog: `${REPO}/blob/main/CHANGELOG.md`,
  remotionLicense: "https://www.remotion.dev/license",

  /** Homebrew: the stable releases, or the release candidates too. Apple silicon only. */
  brew: "brew install --cask bramvanosta/tap/retake",
  brewBeta: "brew install --cask bramvanosta/tap/retake@beta",

  source: `git clone ${REPO}.git && cd Retake
pnpm install && pnpm build
pnpm --filter @retake/runner-web exec playwright-core install chromium
pnpm retake doctor        # is this machine ready?`,
} as const;
