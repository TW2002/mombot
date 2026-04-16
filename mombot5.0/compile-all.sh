#!/bin/bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
SOURCE="$ROOT/source"

if [[ -n "${TWXC_PATH:-}" ]]; then
  COMPILER="$TWXC_PATH"
else
  COMPILER="$(command -v twxc || true)"
fi

if [[ ! -x "$COMPILER" ]]; then
  echo "Compiler not found or not executable: $COMPILER" >&2
  exit 1
fi

targets=("$SOURCE/mombot.ts")
compile_roots=()
for dir in "$SOURCE/commands" "$SOURCE/modes" "$SOURCE/daemons" "$SOURCE/preload"; do
  if [[ -d "$dir" ]]; then
    compile_roots+=("$dir")
  fi
done

while IFS= read -r file; do
  targets+=("$file")
done < <(find "${compile_roots[@]}" -name '*.ts' | sort)

success=0
fail=0

for target in "${targets[@]}"; do
  rel="${target#$ROOT/}"
  echo "Compiling $rel ..."
  output="$("$COMPILER" "$rel" 2>&1 || true)"
  echo "$output"
  if grep -q "Compilation successful." <<<"$output"; then
    success=$((success + 1))
  else
    fail=$((fail + 1))
  fi
done

if [[ -d "$SOURCE/daemons" ]]; then
  mkdir -p "$SOURCE/startups"
  for name in watcher viewscreen chat ephaggle; do
    src="$SOURCE/daemons/$name.cts"
    dst="$SOURCE/startups/$name.cts"
    if [[ -f "$src" ]]; then
      cp "$src" "$dst"
      echo "Copied ${src#$ROOT/} -> ${dst#$ROOT/}"
    fi
  done
fi

echo "Summary: success=$success fail=$fail"
if [[ $fail -gt 0 ]]; then
  exit 1
fi
