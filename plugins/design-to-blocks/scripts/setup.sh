#!/usr/bin/env bash
# Install the Node packages design-to-blocks needs into the plugin's data folder.
# Usage: bash setup.sh <data-dir>
# Safe to run again: it only reinstalls when a lockfile changed.
set -euo pipefail

DATA_DIR="${1:?Usage: bash setup.sh DATA_DIR}"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

command -v node >/dev/null || { echo "Node.js 20 or newer is required." >&2; exit 1; }
command -v npm  >/dev/null || { echo "npm is required." >&2; exit 1; }

for SET in wp-7.0 latest tools; do
  SRC="$HERE/deps/$SET"
  DEST="$DATA_DIR/deps/$SET"
  mkdir -p "$DEST"
  if [ -d "$DEST/node_modules" ] && cmp -s "$SRC/package-lock.json" "$DEST/package-lock.json"; then
    echo "deps/$SET: up to date"
    continue
  fi
  cp "$SRC/package.json" "$SRC/package-lock.json" "$DEST/"
  echo "deps/$SET: installing (one time, about a minute)..."
  (cd "$DEST" && npm ci --ignore-scripts --no-audit --no-fund --loglevel=error)
done

echo "Ready. Data folder: $DATA_DIR"
