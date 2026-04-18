#!/bin/bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
SOURCE="$ROOT/source"
LIVE_ROOT="${MOMBOT_LIVE_ROOT:-/Users/mosleym/twx/scripts/mombot}"

if [[ ! -d "$SOURCE" ]]; then
  echo "Source tree not found: $SOURCE" >&2
  exit 1
fi

mkdir -p "$LIVE_ROOT"

rsync -a --delete --prune-empty-dirs \
  --include='/aliases.cfg' \
  --include='/mombot.cts' \
  --include='/commands/' \
  --include='/commands/**' \
  --include='/modes/' \
  --include='/modes/**' \
  --include='/daemons/' \
  --include='/daemons/**' \
  --include='/startups/' \
  --include='/startups/**' \
  --include='/preload/' \
  --include='/preload/**' \
  --exclude='*.ts' \
  --exclude='*' \
  "$SOURCE/" "$LIVE_ROOT/"

find "$LIVE_ROOT" -type f \( -name '*.ts' -o -name '*.ts_*' \) -delete
find "$LIVE_ROOT" -type d -empty -delete

echo "Synced runtime artifacts from $SOURCE to $LIVE_ROOT"
