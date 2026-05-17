#!/bin/bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
RELEASE_ROOT="${MOMBOT_RELEASE_ROOT:-$ROOT/Release}"
RELEASE_TREE="$RELEASE_ROOT/mombot"
LIVE_ROOT="${MOMBOT_LIVE_ROOT:-/Users/mosleym/twx/scripts/mombot}"
LIVE_HELP="$LIVE_ROOT/help"
RELEASE_HELP="$RELEASE_TREE/help"
SOURCE_ALIASES="$ROOT/source/aliases.cfg"
SOURCE_MOMBOT_CFG="$ROOT/source/mombot.cfg"
WIKI_HTML="$ROOT/mombot-scripting-wiki/Mombot_Scripting.html"
ZIP_PATH="$RELEASE_ROOT/mombot.zip"

if [[ ! -d "$RELEASE_TREE" ]]; then
  echo "Release tree not found: $RELEASE_TREE" >&2
  exit 1
fi

if [[ ! -d "$LIVE_HELP" ]]; then
  echo "Live help directory not found: $LIVE_HELP" >&2
  exit 1
fi

if [[ ! -f "$SOURCE_ALIASES" ]]; then
  echo "Source aliases file not found: $SOURCE_ALIASES" >&2
  exit 1
fi

if [[ ! -f "$SOURCE_MOMBOT_CFG" ]]; then
  echo "Source mombot config file not found: $SOURCE_MOMBOT_CFG" >&2
  exit 1
fi

if [[ ! -f "$WIKI_HTML" ]]; then
  echo "Mombot scripting wiki not found: $WIKI_HTML" >&2
  echo "Rebuild it with: /opt/homebrew/bin/ruby /Users/mosleym/.codex/skills/twx-mombot/scripts/mombot-build-scripting-wiki --publish-release" >&2
  exit 1
fi

if ! command -v rsync >/dev/null 2>&1; then
  echo "rsync is required to refresh release help files" >&2
  exit 1
fi

if ! command -v zip >/dev/null 2>&1; then
  echo "zip is required to create mombot.zip" >&2
  exit 1
fi

mkdir -p "$RELEASE_HELP"
cp "$SOURCE_ALIASES" "$RELEASE_TREE/aliases.cfg"
echo "Copied $SOURCE_ALIASES to $RELEASE_TREE/aliases.cfg"

cp "$SOURCE_MOMBOT_CFG" "$RELEASE_TREE/mombot.cfg"
echo "Copied $SOURCE_MOMBOT_CFG to $RELEASE_TREE/mombot.cfg"

cp "$WIKI_HTML" "$RELEASE_TREE/Mombot_Scripting.html"
echo "Copied $WIKI_HTML to $RELEASE_TREE/Mombot_Scripting.html"

rsync -a --delete "$LIVE_HELP/" "$RELEASE_HELP/"

help_count="$(find "$RELEASE_HELP" -type f | wc -l | tr -d ' ')"
echo "Synced $help_count help files from $LIVE_HELP to $RELEASE_HELP"

rm -f "$ZIP_PATH"
(cd "$RELEASE_ROOT" && zip -qr "$(basename "$ZIP_PATH")" mombot)

echo "Created $ZIP_PATH"
