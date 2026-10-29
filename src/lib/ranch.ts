// Ranch's public links, and its install commands as its README gives them.
const REPO = "https://github.com/Bramvanosta/Ranch";

export const RANCH = {
  repo: REPO,
  releases: `${REPO}/releases/latest`,
  changelog: `${REPO}/blob/main/CHANGELOG.md`,
  security: `${REPO}/blob/main/SECURITY.md`,
  serverGuide: `${REPO}/blob/main/docs/server.md`,

  brew: "brew install --cask bramvanosta/tap/ranch",

  linux: `sudo apt install ./Ranch_*_amd64.deb      # Debian, Ubuntu
sudo dnf install ./Ranch-*.x86_64.rpm     # Fedora, RHEL
chmod +x Ranch_*.AppImage && ./Ranch_*.AppImage`,

  server: `# Once: the key that encrypts the passwords Ranch stores. Keep this file.
(umask 077 && openssl rand -base64 32 > ranch-secret.key)

docker run -d --name ranch -p 127.0.0.1:8080:8080 -v ranch-data:/data \\
  -e RANCH_PASSWORD='choose-one' -e RANCH_SECRET_KEY="$(cat ranch-secret.key)" \\
  ghcr.io/bramvanosta/ranch:latest`,
} as const;
