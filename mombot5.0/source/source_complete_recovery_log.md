# Mombot 5.0 Source Recovery Log

Date: 2026-04-11

## What Was Done

- Recovered missing `.ts` source for runtime-only `.cts` commands, daemons, and modes by decompiling binaries from the 5.0 tree and, where needed, `~/twx/scripts/mombot`.
- Verified recovered scripts in a temporary recovery workspace before installing them into the real 5.0 tree.
- Rewired recovered scripts to use the cleaner shared include layout in `source/include` and appended recovered labels to shared includes where that was the cleanest fit.
- Lowercased recovered script basenames so command/mode/daemon filenames are consistent.
- Lowercased the shared include filenames in `source/include` and updated active include references to match.

## Build Result

- Compiler: `/usr/local/bin/twxc`
- Command: `./compile-all.sh`
- Result: `success=208 fail=0`

Compiled output counts:

- `commands`: 124 `.cts`
- `modes`: 67 `.cts`
- `daemons`: 16 `.cts`
- `startups`: 4 `.cts`
- `root`: `mombot.cts`

## Runtime Parity Check

Compared built 5.0 output under `source/` against runtime scripts under `~/twx/scripts/mombot`.

- Runtime `.cts` count: 202
- 5.0 built `.cts` count: 212
- Missing from 5.0 relative to runtime: 0
- Extra in 5.0 relative to runtime: 10

5.0-only extras:

- `commands/data/corp_info.cts`
- `commands/general/bg2019.cts`
- `commands/general/hht2020.cts`
- `commands/grid/port.cts`
- `daemons/ephaggle.cts`
- `modes/general/xenter.cts`
- `modes/resource/dump.cts`
- `startups/chat.cts`
- `startups/ephaggle.cts`
- `startups/viewscreen.cts`

## Notes

- The recovery staging/conflict artifacts remain under `.recovery_work/` for auditability.
- The include-collapse notes remain in `source/include_collapse_log.md`.
- Active shared includes now live under `source/include/`; active source, the Windows file enumerator, and installer packaging were all repointed to that canonical include tree.
- The legacy `source/bot_includes/` tree was retired after migrating active consumers to `source/include/` and preserving the old external wrapper helpers as `include/call.ts`, `include/holo.ts`, `include/pel.ts`, and `include/pgrid.ts`.
