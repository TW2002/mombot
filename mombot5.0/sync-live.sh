#!/bin/bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
SOURCE="$ROOT/source"
LIVE_ROOT="${MOMBOT_LIVE_ROOT:-/Users/mosleym/twx/scripts/mombot}"
SOURCE_INCLUDE="$SOURCE/include"
LIVE_INCLUDE="$LIVE_ROOT/include"

if [[ ! -d "$SOURCE" ]]; then
  echo "Source tree not found: $SOURCE" >&2
  exit 1
fi

mkdir -p "$LIVE_ROOT"

for file in aliases.cfg mombot.cts; do
  if [[ -f "$SOURCE/$file" ]]; then
    cp "$SOURCE/$file" "$LIVE_ROOT/$file"
  fi
done

sync_managed_dir() {
  local dir="$1"

  if [[ ! -d "$SOURCE/$dir" ]]; then
    return
  fi

  mkdir -p "$LIVE_ROOT/$dir"
  rsync -a --delete --prune-empty-dirs \
    --include='*/' \
    --exclude='*.ts' \
    --exclude='*.ts_*' \
    --exclude='.DS_Store' \
    --include='*' \
    "$SOURCE/$dir/" "$LIVE_ROOT/$dir/"
}

for dir in commands modes daemons startups preload; do
  sync_managed_dir "$dir"
done

if [[ -d "$SOURCE_INCLUDE" ]]; then
  mkdir -p "$LIVE_INCLUDE"
  rsync -a --delete \
    --exclude='.DS_Store' \
    "$SOURCE_INCLUDE/" "$LIVE_INCLUDE/"
fi

find "$LIVE_ROOT" -maxdepth 1 -type f \( -name '*.ts' -o -name '*.ts_*' \) -delete
for dir in commands modes daemons startups preload; do
  if [[ -d "$LIVE_ROOT/$dir" ]]; then
    find "$LIVE_ROOT/$dir" -type f \( -name '*.ts' -o -name '*.ts_*' \) -delete
    find "$LIVE_ROOT/$dir" -depth -type d -empty -delete
  fi
done

echo "Synced runtime artifacts from $SOURCE to $LIVE_ROOT"
