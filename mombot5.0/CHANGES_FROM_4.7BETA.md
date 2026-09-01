# Mombot 5.0 Changes From 4.7beta

Comparison date: 2026-06-02

## Scope

This document compares:

- Current 5.0 source tree: `/Users/mosleym/tw2002/mombot/mombot5.0/source`
- Current release/install payload tree: `/Users/mosleym/tw2002/mombot/mombot5.0/Release/mombot`
- Current live runnable tree: `/Users/mosleym/twx/scripts/mombot`
- 4.7beta baseline tree: `/Users/mosleym/tw2002/mombot/mombot4.7beta`

Notes:

- 5.0 currently has source for all active runtime scripts.
- 4.7beta had some `.ts` sources, but many active commands only existed as `.cts` compiled artifacts plus help files. Where 4.7beta source was missing, the comparison is based on file placement, compiled artifact names, and help text.
- This is a structural and functional summary, not a line-by-line diff.

## Inventory Summary

| Area | 4.7beta | 5.0 |
|---|---:|---:|
| Active top-level `.ts` scripts under commands/modes/daemons/startups/preload | 76 | 183 |
| Active top-level `.cts` runtime scripts under commands/modes/daemons/startups/preload | 127 | 183 |
| Release-tree `.cts` runtime scripts | Mixed in main tree | 183 plus `mombot.cts` |
| Old include/source `.ts` files | 97 split include files | 30 common include files |
| Help text files in source/help | 120 | 204 source help files; release help is generated |
| Release package `.ts` files | Mixed source/runtime tree | 0 |

## High-Level Structural Changes

### Source, Release, And Live Trees Are Now Separate

4.7beta used one tree as both working source and install/runtime content:

- command/mode/daemon directories mixed `.ts` source and `.cts` compiled artifacts
- includes lived under `source/bot_includes` and `source/module_includes`
- game state lived under `scripts/mombot/games/<GAMENAME>`
- packaging helpers were mostly batch-file oriented

5.0 separates the concerns:

- `mombot5.0/source` is the source tree and compile target.
- `mombot5.0/Release/mombot` is the release package tree.
- `scripts/mombot` is the live runnable tree.
- `compile-all.sh` compiles all active top-level source scripts and syncs compiled runtime artifacts live.
- `publish-mombot.sh` generates help, syncs help to live and release, copies config/wiki files, and creates `Release/mombot.zip`.
- Release packages include compiled runtime artifacts, generated help, config files, manual/wiki files, and no `.ts` sources.

The current live tree has the managed compiled runtime layout plus working-only support areas such as `local/`, `include/`, and `source/include/`. Those are not the release installer payload.

### Include Architecture Was Consolidated

4.7beta split includes by family and by individual routine:

- `source/bot_includes/bot/*`
- `source/bot_includes/player/*`
- `source/bot_includes/planet/*`
- `source/bot_includes/ship/*`
- `source/bot_includes/map/*`
- `source/module_includes/bot/*`
- `source/module_includes/deploy/*`
- `source/module_includes/update/*`

5.0 consolidates these into one common include directory:

- `include/bot.ts`
- `include/combat.ts`
- `include/connectivity.ts`
- `include/fighters.ts`
- `include/findproduct.ts`
- `include/game.ts`
- `include/gameprefs.ts`
- `include/grid.ts`
- `include/haggle.ts`
- `include/help.ts`
- `include/internal_commands.ts`
- `include/invader.ts`
- `include/loadvars.ts`
- `include/map.ts`
- `include/menus.ts`
- `include/merchant.ts`
- `include/mines.ts`
- `include/move.ts`
- `include/planet.ts`
- `include/planethaggle.ts`
- `include/planetnames.ts`
- `include/player.ts`
- `include/port.ts`
- `include/search.ts`
- `include/sector.ts`
- `include/ship.ts`
- `include/switchboard.ts`
- `include/update.ts`
- `include/user_interface.ts`
- `include/xenter.ts`

This is the biggest structural change. Many scripts now include a smaller set of common namespace files instead of pulling several one-routine include paths.

### Strict Include Compatibility

5.0 source has been reshaped around explicit include ownership. Scripts now generally call namespaced labels such as `:player~quikstats`, `:move~move`, `:planet~getplanetinfo`, `:planethaggle~buy`, `:help~helpfile`, and `:switchboard~switchboard`, and include the relevant common file explicitly.

The practical impact is:

- fewer accidental compile successes from include leakage
- clearer rebuild scope when a common include changes
- less duplicated local code inside command/mode scripts
- better compatibility with strict-includes compiler checks

### Help Became A Common Include Workflow

Old-style help blocks generally used:

- `$BOT~HELP[]`
- `$BOT~TAB`
- `:bot~helpfile`
- direct writes to `scripts\MOMBot\Help\...`

5.0 scripts generally use:

- `gosub :loadvars~loadvars`
- `gosub :help~initialize`
- `$help~help[]`
- `$help~tab`
- `gosub :help~helpfile`

The release process now generates help from script help blocks and publishes the generated help into both:

- `scripts/mombot/help`
- `mombot5.0/Release/mombot/help`

### Switchboard Became The Standard Message Path

Many 4.7beta scripts sent bot messages directly with patterns like:

```twx
send "'{" $bot_name "} - message*"
```

5.0 generally routes bot messages through:

```twx
setvar $switchboard~message "message*"
gosub :switchboard~switchboard
```

This centralizes subspace/self/silent/deaf behavior and reduces the need for scripts to include the full `bot.ts` just to display a banner or help text.

### Preload, Startup, And Retired Areas

5.0 introduces or clarifies:

- `preload/` for support scripts such as `_dock_shopper`, `_kazi`, `_ldrop`, and `_macro_kit`
- `startups/` for startup scripts such as `watcher`
- `retired/` for old daemon/source references that are no longer part of active release packaging

In 4.7beta, some of those lived directly under `commands` or `daemons`, or existed as startup `.cts` copies.

## Config And State Changes

### Version And Mombot Directory Selection

4.7beta version state:

- `$bot~major_version = "4"`
- `$bot~minor_version = "01p"`

5.0 version state:

- `$bot~major_version = "5"`
- `$bot~minor_version = "0"`

5.0 also adds:

- `$bot~default_bot_directory = "mombot"`
- `scripts/mombot5_0.cfg`, which stores the selected Mombot directory name
- `$bot~mombot_directory`, which is used to build paths such as `scripts/<mombot_directory>/mombot.cfg`

### Game State Moved Out Of The Mombot Script Tree

4.7beta used:

```twx
scripts/mombot/games/&GAMENAME
```

5.0 uses:

```twx
games/&GAMENAME
```

The current startup code sets:

- `$bot~legacy_folder = "scripts/"&$bot~mombot_directory&"/games/"&gamename`
- `$bot~folder = "games/"&gamename`
- `gosub :bot~migrate_game_folder`

So 5.0 is designed to migrate or mirror older per-game files into the newer game-root location.

### Game-Specific Files

The core per-game files remain conceptually similar, but are now under `$bot~folder`:

- `bot.cfg`
- `game_settings.cfg`
- `bot_users.lst`
- `ships.cfg`
- `planets.cfg`

5.0 adds:

- `planetprods.cfg`, exposed through `$planet~planet_prods_file`

That supports the newer planet product/class refresh parsing work.

### Hotkey And Custom Command Config

4.7beta used three files:

- `scripts/mombot/hotkeys.cfg`
- `scripts/mombot/custom_keys.cfg`
- `scripts/mombot/custom_commands.cfg`

5.0 consolidates these into:

- `scripts/<mombot_directory>/mombot.cfg`

The file stores one binding per line, in slot/key/command form:

```text
1$K$:INTERNAL_COMMANDS~autokill
```

5.0 can still read legacy `custom_keys.cfg` and `custom_commands.cfg`, write the new `mombot.cfg`, and delete the old split files after a valid migration.

### Aliases

5.0 adds a release/source `aliases.cfg`. This formalizes command aliases that used to be embedded in command rewriting or doubled command lists. Examples include:

- `logout=logoff`
- `setparms=setparam`
- `corp_info=corpinfo`
- `finder=find`
- `shipstore=storeship`
- `holotorp=htorp`

This also lets removed or renamed commands keep user-facing compatibility in a cleaner place.

## Common Include Movement

This section intentionally records common-code movement once so the same point does not have to be repeated for every script that now calls the shared include.

| 4.7beta area | 5.0 include | What changed |
|---|---|---|
| `module_includes/bot/loadvars/bot.ts` | `include/loadvars.ts` | Common bot/game/player vars load through `:loadvars~loadvars`; this lets many scripts avoid including full `bot.ts`. |
| `module_includes/bot/helpfile/bot.ts`, `displayhelp`, `formathelpline` | `include/help.ts` | Help initialization, help-file writing, and help display are centralized under `:help~...`. |
| `module_includes/bot/banner/bot.ts` | `include/switchboard.ts` | Startup banners are switchboard messages instead of bot banners. |
| `bot_includes/player/twarp`, `findjumpsector`, `moveintosector` | `include/move.ts` | Travel/mow/twarp/jump-sector movement logic moved out of `player.ts` into `move.ts`. |
| `bot_includes/player/getportinfo` | `include/port.ts` | Port info collection is now `:port~getportinfo`. |
| `bot_includes/player/starthaggle` | `include/haggle.ts` | Standard port haggle entry moved into `haggle.ts`. |
| `bot_includes/planet/planetneg` | `include/planethaggle.ts` | Planet sell/buy haggling moved into `planethaggle.ts`, including native handoff support. |
| `bot_includes/planet/makeplanetarray` | `include/planetnames.ts` | Planet-name lookup table creation moved out of the main planet include. |
| `module_includes/deploy/*` | `include/fighters.ts`, `include/mines.ts` | Fighter, armid, and limpet deploy logic is shared and used by the new `deploy` command. |
| `module_includes/update/*` | `include/update.ts`, `include/mines.ts` | Fighter, limpet, armid, CIM update/report logic moved into shared update/mines routines. |
| local grid/attack logic in scripts | `include/grid.ts`, `include/combat.ts`, `include/invader.ts` | Surround, pgrid, attack, cap, holo-kill, and invader logic are common routines instead of script-local islands. |
| local search/list/finder helpers | `include/search.ts`, `include/findproduct.ts`, `include/sector.ts` | Sector parsing, nearest-sector search, product-finding, and avoid/backdoor helpers are centralized. |
| local CN/preferences handling | `include/gameprefs.ts`, `include/game.ts` | Game preference changes and game settings/cost parsing are common routines. |
| merchant/salesman/merch logic | `include/merchant.ts`, `include/planethaggle.ts` | Merchant trade scoring, port refresh, rob/upgrade helpers, and planet buy/sell support moved into reusable code. |

## Install Tree Structure

### 4.7beta

The 4.7beta tree contained:

- command/mode/daemon `.cts` files directly beside many `.ts` files
- `source/bot_includes` and `source/module_includes`
- `games/placeholder.file`
- `help.zip` and a static `help/` directory
- batch build scripts such as `compile_all.bat`, `compile_bot.bat`, `compile_commands.bat`, `compile_daemons.bat`, and `compile_modes.bat`

### 5.0 Release Tree

The current release tree contains:

- `commands/**.cts`
- `modes/**.cts`
- `daemons/**.cts`
- `startups/**.cts`
- `preload/**.cts`
- `mombot.cts`
- generated `help/*.txt`
- `aliases.cfg`
- `mombot.cfg`
- `Mombot_Scripting.html`
- `MOMBot_Manual.html`
- `license.txt`
- `page.wav`

The release tree has no `.ts` source files.

### 5.0 Live Tree

The live tree mirrors managed compiled artifacts into:

- `commands`
- `modes`
- `daemons`
- `startups`
- `preload`
- `help`

It also currently has working/development support areas:

- `local/`, where local scripts are placed
- `include/` and `source/include/` `.ts` support copies
- `retired/`

Those support areas are not equivalent to the release installer payload.

## Script Inventory Changes

### Added Or Newly Sourced Commands

5.0 adds source-backed commands that did not exist as 4.7beta `.ts` sources, or did not exist in 4.7beta at all:

| Category | Scripts | Summary |
|---|---|---|
| Cashing commands | `bust`, `trade` | Planet popping for experience and day-1 MCIC/trading support. |
| Data commands | `armids`, `cim`, `class0`, `corpinfo`, `fedbd`, `figs`, `findplanet`, `getnear`, `limps`, `msgs`, `msl`, `news`, `probe`, `qreport`, `remaliens`, `storeship`, `update` | More data refresh/report commands have source, plus new/find/report helpers. `corpinfo` replaces `corp_info`. |
| General commands | `cn9`, `emq`, `fed`, `keep`, `lift`, `login`, `logoff`, `page`, `qset`, `refresh`, `reset`, `run`, `scrub`, `sendfile`, `ss`, `switch`, `topoff`, `wait` | More utility commands are source-backed, with clearer help and switchboard output. |
| Grid commands | `clearfig`, `deploy`, `haz`, `surround` | New deploy abstraction replaces old one-off mine/limp commands; haz/clearfig/surround are source-backed. |
| Offense commands | `cap`, `htorp`, `invader`, `kill`, `mex`, `mxex` | Source-backed offense dispatcher and attack helpers replace several compiled-only command artifacts. |
| Resource commands | `hagexp`, `refurb`, `scruball` | Resource support expanded with haggling experience, refurb, and scrub-all command handling. |

### Added Or Newly Sourced Modes

| Category | Scripts | Summary |
|---|---|---|
| Cashing modes | `alienhunt`, `gpm`, `marco`, `merch`, `psst`, `quikpanel`, `salesman`, `tbust`, `wrob`, `wsst` | Major cashing expansion: alien hunting, planet/grid product mapping, merch/salesman route selling, panel automation, world rob/SST helpers. |
| Data modes | `beam`, `fedmon`, `finder`, `list`, `proztm`, `ridealong` | Data sharing, fed movement monitor, finder daemon mode, database listing, and mapping/ridealong helpers. |
| Defense modes | `citfill`, `reloader`, `runaway`, `tsaveme`, `unstack` | More automated defense and save/reload/unstack behavior. |
| General modes | `xenter` | `xenter` moved from command/grid style into a mode-style helper and common `xenter` include. |
| Grid modes | `disr`, `dora`, `gridcheck`, `limpshovel`, `minesweep`, `mow`, `mowfuel`, `passgrid`, `pgridder`, `plimper`, `ramgrid`, `tram`, `ugrid`, `wall`, `wander` | Large grid/mapping expansion with shared movement, mine, sector, and search helpers. |
| Offense modes | `boton`, `citcap`, `citkill`, `density`, `dockkill`, `drop`, `foton`, `pdrop`, `plock` | Offense automation moved into source-backed mode scripts with common combat/move support. |
| Resource modes | `colo`, `dump`, `ecolo`, `farm`, `fillships`, `makeplanet`, `move`, `movefig`, `moveship`, `patp`, `pimp`, `stripships`, `upgrade` | Resource automation expanded and moved into source-backed modes. |

### Added Daemons, Preloads, And Startup Scripts

| Area | Scripts | Summary |
|---|---|---|
| Daemons | `at`, `fillsector`, `nofed`, `teammega` | Time-delayed command execution, sector filling, fed/subspace helper, team mega support. |
| Preload | `_dock_shopper`, `_kazi`, `_ldrop`, `_macro_kit` | Support scripts moved out of ordinary command folders and into preload. |
| Startup | `watcher` | Watcher moved from daemon placement to startup placement. |

### Removed, Retired, Or Replaced

| Old script/artifact | 5.0 replacement or status |
|---|---|
| `commands/data/corp_info` | Replaced by `commands/data/corpinfo`; alias preserves `corp_info=corpinfo`. |
| `commands/data/setparms` | Replaced by `setparam`; alias preserves `setparms=setparam`. |
| `commands/grid/climp`, `cmine`, `mines`, `plimp`, `pmine` | Replaced by `commands/grid/deploy` plus `include/fighters.ts` and `include/mines.ts`. |
| `commands/grid/exit` | Replaced by `modes/general/xenter` and `include/xenter.ts`. |
| `commands/offense/pe`, `ped`, `pel`, `pelk`, `pex`, `pxe`, `pxed`, `pxedx`, `pxel`, `pxelk`, `pxex` | Collapsed into `commands/offense/invader` plus offense modes such as `foton`, `drop`, `pdrop`, and `plock`. |
| `commands/general/photon` | Removed from active source/release; photon behavior is now handled by offense command/mode paths. |
| `commands/defense/_macro_kit` | Moved to `preload/_macro_kit`. |
| `commands/resource/_dock_shopper` | Moved to `preload/_dock_shopper`. |
| `daemons/chat`, `comms`, `ephaggle`, `ignore`, `online`, `stats`, `viewscreen` | Removed from active release tree or retired; startup/runtime behavior is handled by current bot/native/live mechanisms. |
| `bg2019` | Removed from active tree. |

## Notable Same-Script Functional And Structural Changes

This section focuses on scripts with a 4.7beta source counterpart and meaningful 5.0 changes.

### Bot Runtime

`mombot.ts`

- Version changed from `4.01p` to `5.0`.
- Startup now chooses a configurable Mombot directory through `scripts/mombot5_0.cfg`.
- Game files now target `games/<GAMENAME>` and run a migration helper for legacy `scripts/mombot/games/<GAMENAME>` data.
- Startup initializes new shared state such as `$planet~planet_prods_file`.
- Command lists and aliases were updated for the larger 5.0 command/mode set.
- Backward-compatible bare variables are still saved for older scripts, but canonical state is increasingly namespaced.

`include/bot.ts`

- Hotkey/custom-command config changed from three files to `mombot.cfg`.
- Adds migration from legacy key/command config.
- Adds menu deaf-state helpers, startup helpers, watcher variable loading, game folder migration, and cleaner variable save/load.
- Keeps compatibility with old command dispatch concepts while feeding the newer common include structure.

### Help And Command Routing

`commands/general/help.ts`

- Moved from `:bot~helpfile` / `:bot~displayhelp` to `:help~helpfile` / `:help~displayhelp`.
- Reads help from `scripts/<mombot_directory>/help`.
- Handles self-command and silent-running display paths more explicitly.
- Still includes `bot.ts` and `menus.ts` because hotkey display and bot help menu behavior need bot/menu state.

`include/user_interface.ts`

- Command routing is centralized for self, team, and all-addressed commands.
- Command-line compatibility preserves both rewritten params and raw `$bot~user_command_line`.
- Aliases and local command/mode routing are separated more cleanly than in 4.7beta.

### Movement And Travel

`commands/general/bwarp.ts`, `pwarp.ts`, `twarp.ts`

- Travel commands now depend on common movement/planet/player includes rather than individual old player include fragments.
- Help syntax now supports sector plus quoted trader-name style arguments in current help.
- Messages route through switchboard instead of raw subspace sends.

`modes/grid/mow.ts`, `modes/grid/mowfuel.ts`, `modes/resource/move.ts`, `modes/resource/movefig.ts`, `modes/resource/moveship.ts`

- Movement logic is concentrated in `include/move.ts`.
- `:move~mow`, `:move~move`, `:move~moveintosector`, `:move~twarp`, `:move~findjumpsector`, and `:move~test_red_sector` are now shared entry points.
- This reduces local getcourse/twarp/move duplication and lets movement fixes apply to multiple scripts.

### Trading And Haggle

`commands/cashing/ppt.ts`

- Still supports internal, no-haggle, and third-party haggle options.
- Movement calls were moved from `:player~twarp` / `:player~moveintosector` to `:move~twarp` / `:move~moveintosector`.
- Haggle calls now use `include/haggle.ts`.
- Startup banner is now a switchboard message instead of `:bot~banner`.

`modes/cashing/wppt.ts`

- Help now includes `{pay}` and `{fast}` in addition to holoscan/evade.
- Uses `include/move.ts` with `$move~checksub` and `:move~move`.
- Uses `include/haggle.ts` and `include/gameprefs.ts`.
- Turns off autohaggle when needed and restores game preferences.
- Uses switchboard startup/completion/error messaging.

`modes/cashing/sdt.ts` and `modes/cashing/sst.ts`

- Help is normalized through `help.ts`.
- Sector void/clear behavior moved toward `include/sector.ts`.
- Both scripts now interact with current/native haggle flows rather than only old EP-haggle detection.
- `sdt` adds or documents `{swap}` and `resetlra` behavior more explicitly.
- Both use switchboard messages for status/error reporting.

`commands/cashing/neg.ts`, `commands/resource/buy.ts`, `modes/resource/patp.ts`, `modes/resource/upgrade.ts`, `modes/cashing/merch.ts`, `modes/cashing/salesman.ts`

- Planet and port buy/sell logic moved into `include/planethaggle.ts`, `include/haggle.ts`, `include/merchant.ts`, `include/port.ts`, and related support includes.
- Native-haggle handoff is supported from shared helpers instead of each script inventing its own bid path.
- Merchant/salesman/upgrade scoring and product movement use common refresh, port, sector, and planet routines.

### Planet/Product Movement

`modes/resource/strip.ts`

- Still strips products/colonists/fighters from planets, but now relies on common planet/player helpers.
- Help now includes `{sh}`, `{all}`, `{silent}`, and `{deaf}` options in addition to product/colonist/fighter options.
- Product movement has been moved toward common planet movement routines so the script does not maintain all low-level product-transfer logic itself.
- Completion reporting is centralized through switchboard.

`modes/resource/dump.ts`, `farm.ts`, `pimp.ts`, `makeplanet.ts`, `stripships.ts`, `fillships.ts`

- Resource scripts increasingly use `planet.ts`, `findproduct.ts`, `move.ts`, `planetnames.ts`, and `switchboard.ts`.
- Several older script-local planet/product scans were replaced by shared planet counting/info/product routines.

### Grid, Mines, And Deployment

`commands/grid/pgrid.ts`

- 4.7beta contained the core pgrid implementation locally.
- 5.0 is mostly a wrapper around `:grid~pgrid`.
- This moves validation, sector attack/retreat behavior, and message handling into common grid/combat helpers.

`commands/grid/deploy.ts`

- Replaces several old one-off mine/limp/fighter deployment commands.
- Uses shared `include/fighters.ts` and `include/mines.ts`.
- Supports aliases/verbs such as deploy/put/lay/place for number/type/personal-or-corp deployment.

`commands/grid/clear.ts`, `clearfig.ts`, `surround.ts`, `modes/grid/minesweep.ts`, `limpshovel.ts`, `plimper.ts`, `ugrid.ts`

- Use shared mine/fighter/grid helpers.
- Mine/limp update and report logic moved into `include/mines.ts`.
- Surround/grid helper logic moved into `include/grid.ts`.

### Combat And Offense

`commands/offense/hkill.ts`

- 4.7beta source had no include declarations and relied on local/implicit behavior.
- 5.0 source uses common loadvars/help/switchboard behavior and common combat paths.

`commands/offense/invader.ts`

- Replaces many old compiled photon-invasion variants with one source-backed dispatcher.
- Legacy commands such as `pe`, `ped`, `pel`, `pelk`, `pex`, `pxe`, `pxed`, `pxel`, `pxelk`, and `pxex` are treated as invader-style command variants.

`modes/offense/*`

- 5.0 adds source-backed offense modes for citadel combat, density triggers, dock killing, ship/planet drops, foton, pdrop, and plock.
- Common attack/capture/holo-kill logic lives in `include/combat.ts`.

### Defense

`modes/defense/saveme.ts`

- Help remains similar, but the implementation uses common `ship`, `mines`, `help`, and `switchboard` includes.
- Mine deployment from saveme commands now calls shared mine routines.
- Defender/kill/disarm/arm behavior remains script-specific but is better isolated from low-level mine/ship parsing.

`commands/defense/call.ts`, `evac.ts`, `hazkill.ts`

- Help and status messages use the common help/switchboard path.
- `call` now depends on common `xenter`, `player`, `planet`, and `combat` helpers.
- `evac` and `hazkill` use shared movement/planet/combat helpers where appropriate.

`modes/defense/citfill.ts`, `reloader.ts`, `runaway.ts`, `tsaveme.ts`, `unstack.ts`

- New or newly sourced 5.0 defense modes for refilling, save response, flee handling, and planet stack management.

### Data And Refresh

`commands/data/figs.ts`, `limps.ts`, `armids.ts`, `update.ts`

- Fighter updates moved to `include/update.ts`.
- Limpet/armid updates moved to `include/mines.ts`.
- Data updates now also set sector parameter data used by later routing/search commands.

`commands/general/refresh.ts`

- New source-backed state refresh command.
- Refreshes cached bot state from the live game through shared `game`, `player`, `ship`, `planet`, and `sector` includes.
- Supports the newer planet/ship/config file generation behavior.

`commands/data/sector.ts`, `select.ts`, `find.ts`, `getnear.ts`, `storeship.ts`

- More database/search behavior is source-backed.
- Sector parsing and display are increasingly routed through `include/sector.ts`, `include/search.ts`, and shared map/port/planet state.

`modes/data/ztm.ts`, `sentinel.ts`

- Help and switchboard output were normalized.
- Existing mapping/sentinel behavior remains conceptually similar, with updated include paths and prompt handling.

### General Utility Commands

`commands/general/dep.ts`, `with.ts`, `land.ts`, `lift.ts`, `mac.ts`, `nmac.ts`, `corp.ts`, `subspace.ts`, `reboot.ts`, `unlock.ts`, `callout.ts`

- Functionality is broadly the same.
- Main structural changes are normalized help, loadvars, switchboard messages, lower-case namespace usage, and removal of unnecessary full bot include dependencies.

`commands/general/relog.ts`

- Expanded from 4.7beta.
- Adds clearer auto-relog activation, freeze/stuck prompt triggers, more prompt recovery paths, and planet landing restoration support through `planet.ts` and `map.ts`.

`commands/general/run.ts`

- New command dispatcher helper for running a raw Mombot command line.

`commands/general/sendfile.ts`

- New utility to send/display ANSI/text files.

## User-Facing Compatibility Notes

- Many old command names are preserved through `aliases.cfg`.
- Some old one-off commands are intentionally replaced by a consolidated command:
  - mine/limp deploy commands collapse into `deploy`
  - photon invasion variants collapse into `invader`
  - `corp_info` becomes `corpinfo`
  - `setparms` becomes `setparam`
- Help output is generated from source help blocks and should be more consistent with the current scripts.
- Bot messages increasingly respect switchboard routing, self-command display, silent-running behavior, and Discord/no-discord flags.
- Game-specific state has moved to `games/<GAMENAME>`, reducing game data stored inside the mombot script tree.
- Current scripts are more sensitive to correct explicit includes, but this is intentional and supports strict-includes compilation.

## Open Caveats

- 4.7beta had many compiled-only scripts. For those, this document records tree/help/replacement-level changes rather than source-level diffs.
- The current live tree includes local/development support folders that are not release payload. Use `Release/mombot` as the package-installer truth.
- Some help files are generated from script help blocks; if help text drifts, regenerate help with the Mombot help generator before treating static help as authoritative.
- `mombot-command-reference.md` is useful for orientation but may lag behind the exact current source; source files and generated help should win when they differ.
