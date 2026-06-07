#!/bin/bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
RELEASE_ROOT="${MOMBOT_RELEASE_ROOT:-$ROOT/Release}"
RELEASE_TREE="$RELEASE_ROOT/mombot"
LIVE_ROOT="${MOMBOT_LIVE_ROOT:-/Users/mosleym/twx/scripts/mombot}"
LIVE_HELP="$LIVE_ROOT/help"
LIVE_INCLUDE="$LIVE_ROOT/include"
RELEASE_HELP="$RELEASE_TREE/help"
RELEASE_INCLUDE="$RELEASE_TREE/include"
HELP_GENERATOR="${MOMBOT_HELP_GENERATOR:-/Users/mosleym/.codex/skills/twx-mombot/scripts/mombot-generate-help}"
SOURCE_ALIASES="$ROOT/source/aliases.cfg"
SOURCE_MOMBOT_CFG="$ROOT/source/mombot.cfg"
SOURCE_INCLUDE="$ROOT/source/include"
WIKI_HTML="$ROOT/mombot-scripting-wiki/Mombot_Scripting.html"
ZIP_PATH="$RELEASE_ROOT/mombot.zip"
GENERATED_HELP="$(mktemp -d "${TMPDIR:-/tmp}/mombot-help.XXXXXX")"

cleanup() {
  rm -rf "$GENERATED_HELP"
}
trap cleanup EXIT

if [[ ! -d "$RELEASE_TREE" ]]; then
  echo "Release tree not found: $RELEASE_TREE" >&2
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

if [[ ! -d "$SOURCE_INCLUDE" ]]; then
  echo "Source include tree not found: $SOURCE_INCLUDE" >&2
  exit 1
fi

if [[ ! -f "$WIKI_HTML" ]]; then
  echo "Mombot scripting wiki not found: $WIKI_HTML" >&2
  echo "Rebuild it with: /opt/homebrew/bin/ruby /Users/mosleym/.codex/skills/twx-mombot/scripts/mombot-build-scripting-wiki --publish-release" >&2
  exit 1
fi

if [[ ! -x "$HELP_GENERATOR" ]]; then
  echo "Mombot help generator not found or not executable: $HELP_GENERATOR" >&2
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

mkdir -p "$LIVE_HELP" "$LIVE_INCLUDE" "$RELEASE_HELP" "$RELEASE_INCLUDE"

"$HELP_GENERATOR" \
  --source-root "$ROOT/source" \
  --out-dir "$GENERATED_HELP" \
  --compare-dir "$LIVE_HELP"

generated_help_count="$(find "$GENERATED_HELP" -type f -name '*.txt' | wc -l | tr -d ' ')"
echo "Generated $generated_help_count help files from source into $GENERATED_HELP"

rsync -a --delete "$GENERATED_HELP/" "$LIVE_HELP/"
echo "Synced generated help files to $LIVE_HELP"

rsync -a --delete --exclude='.DS_Store' "$SOURCE_INCLUDE/" "$LIVE_INCLUDE/"
echo "Synced source include files to $LIVE_INCLUDE"

cp "$SOURCE_ALIASES" "$RELEASE_TREE/aliases.cfg"
echo "Copied $SOURCE_ALIASES to $RELEASE_TREE/aliases.cfg"

cp "$SOURCE_MOMBOT_CFG" "$RELEASE_TREE/mombot.cfg"
echo "Copied $SOURCE_MOMBOT_CFG to $RELEASE_TREE/mombot.cfg"

cp "$WIKI_HTML" "$RELEASE_TREE/Mombot_Scripting.html"
echo "Copied $WIKI_HTML to $RELEASE_TREE/Mombot_Scripting.html"

rsync -a --delete "$GENERATED_HELP/" "$RELEASE_HELP/"

help_count="$(find "$RELEASE_HELP" -type f | wc -l | tr -d ' ')"
echo "Synced $help_count generated help files to $RELEASE_HELP"

rsync -a --delete --exclude='.DS_Store' "$SOURCE_INCLUDE/" "$RELEASE_INCLUDE/"

include_count="$(find "$RELEASE_INCLUDE" -type f | wc -l | tr -d ' ')"
echo "Synced $include_count source include files to $RELEASE_INCLUDE"

rm -f "$ZIP_PATH"
(cd "$RELEASE_ROOT" && zip -qr "$(basename "$ZIP_PATH")" mombot)

echo "Created $ZIP_PATH"
