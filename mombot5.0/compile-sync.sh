#!/bin/bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
SOURCE="$ROOT/source"
SYNC_SCRIPT="$ROOT/sync-live.sh"

if [[ -n "${TWXC_PATH:-}" ]]; then
  COMPILER="$TWXC_PATH"
else
  COMPILER="$(command -v twxc || true)"
fi

if [[ ! -x "$COMPILER" ]]; then
  echo "Compiler not found or not executable: $COMPILER" >&2
  exit 1
fi

TWXC_FLAGS_ARRAY=()
if [[ -n "${TWXC_FLAGS:-}" ]]; then
  read -r -a TWXC_FLAGS_ARRAY <<< "$TWXC_FLAGS"
fi

if [[ $# -lt 1 ]]; then
  echo "Usage: $(basename "$0") <script.ts> [more scripts.ts ...]" >&2
  exit 1
fi

for input in "$@"; do
  if [[ "$input" = /* ]]; then
    target="$input"
  elif [[ -f "$ROOT/$input" ]]; then
    target="$ROOT/$input"
  elif [[ -f "$SOURCE/$input" ]]; then
    target="$SOURCE/$input"
  else
    echo "Script not found: $input" >&2
    exit 1
  fi

  if [[ "$target" != "$ROOT/"* ]]; then
    echo "Script must live under $ROOT: $target" >&2
    exit 1
  fi

  rel="${target#$ROOT/}"
  echo "Compiling $rel ..."
  (cd "$ROOT" && "$COMPILER" ${TWXC_FLAGS_ARRAY[@]+"${TWXC_FLAGS_ARRAY[@]}"} "$rel")
done

"$SYNC_SCRIPT"
