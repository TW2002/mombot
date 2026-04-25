#!/usr/bin/env python3
from __future__ import annotations

import argparse
import html
import re
import shutil
import subprocess
import sys
from collections import defaultdict
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable


WIKI_DIR = Path(__file__).resolve().parents[1]
PROJECT_ROOT = WIKI_DIR.parent
SOURCE_ROOT = PROJECT_ROOT / "source"
INCLUDE_DIR = SOURCE_ROOT / "include"
TIDDLERS_DIR = WIKI_DIR / "tiddlers"
GENERATED_DIR = TIDDLERS_DIR / "generated-include-reference"

LABEL_RE = re.compile(r"^:([A-Za-z0-9_~]+)\s*$", re.MULTILINE)
CALL_RE = re.compile(r"\b(?:gosub|goto)\s*:([A-Za-z0-9_~]+)\b", re.IGNORECASE)
INCLUDE_RE = re.compile(r'include\s+"source\\include\\([^"\\]+)"', re.IGNORECASE)

INCLUDE_OVERVIEWS = {
    "bot": "Core bot bootstrap, banner, help, hotkey, menu, and variable-loading routines.",
    "combat": "Shared fast-attack, capture, citadel-attack, and holo-kill combat helpers.",
    "connectivity": "Login, relog, movement-state, and post-login preference helpers.",
    "fighter": "Fighter deployment and fighter-related helper routines used by grid and combat flows.",
    "findproduct": "Planet-product search helpers used when choosing planets with needed stock or colonists.",
    "game": "Game-wide metadata parsing, especially game stats and universe-level information.",
    "gameprefs": "Helpers for applying or restoring game preference settings.",
    "grid": "Shared surround and grid-control helpers used by several grid and cashing paths.",
    "haggle": "Port haggle and negotiated trade helper logic.",
    "internal_commands": "Native-bot internal command helpers for timing, relog, and control actions.",
    "invader": "Shared invader command helpers for checking and starting invade macros.",
    "map": "ANSI map display and navigation rendering helpers.",
    "menus": "Native menu-building, splash-screen, and preference UI helpers.",
    "mines": "Mine and limpet deployment/report helpers.",
    "modules": "Small module-launch helpers for shared command wrappers.",
    "move": "Shared movement logic for moving product and navigating between sectors or planets.",
    "planet": "Planet parsing, landing, planet-file loading, and shared planet-state routines.",
    "planethaggle": "Planet buy/sell haggle routines split out from the larger planet include.",
    "planetnames": "Planet-name array and planet-list helper routines.",
    "player": "Prompt, quikstats, movement, formatting, CN, and shared player-state helpers.",
    "port": "Port build, destroy, upgrade, max, and ship-sale helpers.",
    "search": "Search helpers for sector and path-based lookups.",
    "sector": "Sector-data loading helpers for the database and live sector state.",
    "ship": "Ship computer parsing, ship stat loading, and ship save/load helpers.",
    "switchboard": "Subspace and switchboard messaging helper routines.",
    "targeting": "Targeting initialization and scan helpers for attack flows.",
    "update": "CIM and fighter update helpers used by update/report paths.",
    "user_interface": "Command-line dispatch and alias-resolution helpers for the bot shell.",
    "validation": "Shared validation helpers for command parsing and safety checks.",
    "xenter": "Exit/xenter wrapper routines for leaving sectors or returning from call flows.",
}

ROUTINE_OVERRIDES = {
    "BOT~LOADVARS": "Loads the standard bot variable set and shared runtime state before command logic runs.",
    "BOT~HELPFILE": "Resolves and loads the matching help text for the active command or mode.",
    "BOT~BANNER": "Prints the standard command banner and status framing used across many scripts.",
    "BOT~CHECKSTARTINGPROMPT": "Validates that the current prompt is one of the prompts a command allows before it continues.",
    "BOT~KILLTHETRIGGERS": "Clears bot-managed triggers before switching flows or re-entering a prompt parser.",
    "BOT~WAIT_FOR_COMMAND": "Waits until the game is back at a normal command prompt before continuing.",
    "BOT~DISPLAYHELP": "Displays help text through the shared bot help path.",
    "BOT~LOAD_BOT": "Loads core bot startup state and shared configuration.",
    "BOT~GETINITIAL_SETTINGS": "Runs the initial settings/data gather path needed after a fresh setup or reset.",
    "COMBAT~INIT": "Initializes shared combat state and attack settings before a combat macro runs.",
    "COMBAT~FASTATTACK": "Runs the fast-attack combat macro against the current target.",
    "COMBAT~FASTCAPTURE": "Runs the fast capture path used by cap and capture-oriented scripts.",
    "COMBAT~FASTCITADELATTACK": "Runs the citadel-specific fast-attack sequence.",
    "COMBAT~HOLOKILL": "Coordinates holo kill logic after a scan or targeting pass.",
    "CONNECTIVITY~ENTER_NEW_GAME": "Handles new-game entry/setup logic for native login or reconnect paths.",
    "CONNECTIVITY~MOVING": "Marks and handles transient movement state during login or reconnect flows.",
    "FINDPRODUCT~FINDPRODUCT": "Searches candidate planets for the product or colonist profile a caller needs.",
    "GAME~GAMESTATS": "Pulls game stats and updates shared game-wide values from the live game prompt.",
    "GAMEPREFS~SETGAMEPREFS": "Applies stored game preferences back into the current game session.",
    "GRID~SURROUND": "Runs the shared surround routine used by surround-capable combat and grid scripts.",
    "HAGGLE~HAGGLE": "Performs the standard port haggle routine and updates shared haggle values.",
    "MAP~DISPLAYSECTOR": "Renders the sector display view used by sector/data commands.",
    "MAP~DISPLAYADJACENTGRIDANSI": "Builds the adjacent-sector ANSI grid view used by the bot UI.",
    "MAP~COMMAS": "Formats large numeric values with comma separators for display.",
    "MENUS~DOSPLASHSCREEN": "Builds or displays the native splash screen.",
    "MENUS~DONEPREFER": "Completes preference editing and returns from the native preferences menu.",
    "MODULES~CLEAR": "Runs the shared clear behavior used by the clear command wrapper.",
    "MODULES~XENTER": "Runs the shared xenter behavior used by exit/xenter wrappers.",
    "MOVE~MOVE": "Executes the shared move-product movement routine used by upgrade and makeplanet paths.",
    "PLANET~GETPLANETINFO": "Parses the current planet screen and fills the shared planet variables.",
    "PLANET~PLANETINFO": "Runs the deeper planet parser used by callers that need full production arrays and construction state.",
    "PLANET~LANDINGSUB": "Handles landing on the requested planet and returning to the expected prompt.",
    "PLANET~LANDONPLANETENTERCITADEL": "Lands on a planet and enters the citadel in one shared path.",
    "PLANET~LOADPLANETINFO": "Loads cached planet-file data into shared planet variables and arrays.",
    "PLANET~GETPLANETSTATS": "Refreshes shared planet stats from the live game prompts.",
    "PLANETCHECK~PLANETCHECK": "Runs the legacy planet-check path used by findproduct compatibility logic.",
    "PLANET~COUNTPLANETS": "Counts planets in the current sector or current working set.",
    "PLANETHAGGLE~BUY": "Runs the shared planet buy/buydown path for merch, salesman, and patp.",
    "PLANETHAGGLE~PLANETNEG": "Runs the shared planet sell negotiation path.",
    "PLANETNAMES~MAKE_PLANET_ARRAY": "Builds the planet-name array used by makeplanet and related planet-list logic.",
    "PLAYER~QUIKSTATS": "Refreshes the current prompt and player/ship quickstats from the live game output.",
    "PLAYER~CURRENTPROMPT": "Parses the current prompt and updates shared prompt/location state.",
    "PLAYER~GETINFO": "Loads broader player state than quikstats, including prompt and game context details.",
    "PLAYER~TWARP": "Runs the shared transwarp movement path.",
    "PLAYER~BWARP": "Runs the shared blind-warp movement path.",
    "PLAYER~PWARP": "Runs the shared pwarp movement path.",
    "PLAYER~MOVEINTOSECTOR": "Moves into a target sector while preserving shared movement state.",
    "PLAYER~GETCOURSE": "Resolves a course/path between sectors for callers that need route data.",
    "PLAYER~VOIDADJACENT": "Sets adjacent-sector avoids for the current ship/session.",
    "PLAYER~CLEARVOIDADJACENT": "Clears adjacent-sector avoids that were previously set.",
    "PLAYER~STARTCNSETTINGS": "Loads or initializes CN settings through the shared player path.",
    "PLAYER~STARTHAGGLE": "Initializes the shared haggle setup used before haggle-capable flows.",
    "PLAYER~TURNONANSI": "Turns ANSI back on through the shared player prompt path.",
    "PLAYER~TURNOFFANSI": "Turns ANSI off through the shared player prompt path.",
    "PLAYER~TOPOFF": "Tops off holds or resources through the shared player helper path.",
    "PORT~BUILDPORT": "Builds a port through the shared port helper path.",
    "PORT~DESTROYPORT": "Destroys a port through the shared port helper path.",
    "PORT~UPGRADEPORT": "Upgrades a port through the shared port helper path.",
    "PORT~DOMAXPORT": "Runs the max-port helper path used by merch/maxport flows.",
    "PORT~SHIPSELL": "Handles the shared ship-sale path used by ship-move/resource flows.",
    "SEARCH~FIND": "Runs the shared search routine used by the find command.",
    "SECTOR~GETSECTORDATA": "Loads sector data for a specific sector into the shared sector variables.",
    "SECTOR~GETAUTOSECTORDATA": "Loads sector data for the current/implicit sector.",
    "SHIP~GETSHIPSTATS": "Parses the ship computer/stat screen and loads shared ship values.",
    "SHIP~GETSHIPCAPSTATS": "Parses ship capability stats such as holds, fighters, and transport range.",
    "SHIP~LOADSHIPINFO": "Loads cached ship information from saved ship data.",
    "SHIP~SAVETHESHIP": "Persists the current ship’s saved data back to storage.",
    "SWITCHBOARD~SWITCHBOARD": "Sends formatted status or report lines through the shared switchboard/subspace path.",
    "TARGETING~INITIALIZETARGETING": "Initializes targeting state for attack-capable routines.",
    "TARGETING~INITIALIZE_TARGETING": "Initializes targeting state for attack-capable routines.",
    "TARGETING~SCANITCITKILL": "Scans and prepares citkill targeting data.",
    "TARGETING~SCANIT_CIT_KILL": "Scans and prepares citkill targeting data.",
    "UPDATE~CIM": "Runs the shared CIM update routine.",
    "UPDATE~FIGHTERS": "Runs the shared fighter update/import routine.",
    "UPDATE~REPORT": "Builds the shared update report output.",
    "USER_INTERFACE~RUNUSERCOMMANDLINE": "Dispatches a resolved command line through the bot user-interface layer.",
    "XENTER~RUN": "Runs the shared xenter/exit wrapper flow.",
}


@dataclass
class LabelInfo:
    raw_label: str
    normalized_label: str
    line_no: int
    excerpt: str
    callers: set[str] = field(default_factory=set)


@dataclass
class IncludeInfo:
    stem: str
    path: Path
    labels: list[LabelInfo] = field(default_factory=list)
    consumers: set[str] = field(default_factory=set)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Build a dedicated TiddlyWiki include reference for Mombot."
    )
    parser.add_argument("--wiki-dir", type=Path, default=WIKI_DIR)
    parser.add_argument("--source-root", type=Path, default=SOURCE_ROOT)
    parser.add_argument("--skip-build", action="store_true", help="Refresh tiddlers only; do not render the single-file HTML.")
    return parser.parse_args()


def tw_timestamp() -> str:
    return datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S000")


def slugify(value: str) -> str:
    pieces: list[str] = []
    for char in value:
        if char.isalnum():
            pieces.append(char)
        else:
            pieces.append("_")
    slug = "".join(pieces).strip("_")
    while "__" in slug:
        slug = slug.replace("__", "_")
    return slug or "tiddler"


def tid_path(root: Path, title: str) -> Path:
    return root / f"{slugify(title)}.tid"


def write_tid(path: Path, title: str, body: str, tags: Iterable[str] = (), extra_fields: dict[str, str] | None = None) -> None:
    stamp = tw_timestamp()
    lines = [
        f"created: {stamp}",
        f"modified: {stamp}",
        f"title: {title}",
        "type: text/vnd.tiddlywiki",
    ]
    tag_list = " ".join(tags).strip()
    if tag_list:
        lines.append(f"tags: {tag_list}")
    if extra_fields:
        for key, value in extra_fields.items():
            lines.append(f"{key}: {value}")
    path.write_text("\n".join(lines) + "\n\n" + body.rstrip() + "\n", encoding="utf-8")


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="replace").replace("\r\n", "\n")


def relative_source_path(path: Path, source_root: Path) -> str:
    return path.resolve().relative_to(source_root.resolve()).as_posix()


def build_excerpt(body: str, max_lines: int = 8) -> str:
    collected: list[str] = []
    for raw_line in body.splitlines():
        line = raw_line.rstrip()
        if not line.strip():
            continue
        collected.append(line)
        if len(collected) >= max_lines:
            break
    return "\n".join(collected).strip()


def parse_include_files(source_root: Path) -> dict[str, IncludeInfo]:
    include_dir = source_root / "include"
    includes: dict[str, IncludeInfo] = {}
    for path in sorted(include_dir.glob("*.ts")):
        text = read_text(path)
        matches = list(LABEL_RE.finditer(text))
        info = IncludeInfo(stem=path.stem, path=path)
        for idx, match in enumerate(matches):
            label = match.group(1)
            start = match.end()
            end = matches[idx + 1].start() if idx + 1 < len(matches) else len(text)
            body = text[start:end].strip("\n")
            line_no = text[: match.start()].count("\n") + 1
            info.labels.append(
                LabelInfo(
                    raw_label=label,
                    normalized_label=label.upper(),
                    line_no=line_no,
                    excerpt=build_excerpt(body),
                )
            )
        includes[path.stem] = info
    return includes


def scan_current_source_files(source_root: Path) -> list[Path]:
    current_files: list[Path] = []
    for path in sorted(source_root.rglob("*.ts")):
        rel = path.relative_to(source_root).as_posix()
        if rel.startswith("retired/"):
            continue
        current_files.append(path)
    return current_files


def apply_call_graph(includes: dict[str, IncludeInfo], source_root: Path) -> None:
    label_index: dict[str, LabelInfo] = {}
    owner_index: dict[str, Path] = {}
    for include_info in includes.values():
        for label in include_info.labels:
            label_index[label.normalized_label] = label
            owner_index[label.normalized_label] = include_info.path

    for path in scan_current_source_files(source_root):
        text = read_text(path)
        rel = relative_source_path(path, source_root)

        for match in INCLUDE_RE.finditer(text):
            include_name = match.group(1).lower()
            include_info = includes.get(include_name)
            if include_info is not None and include_info.path != path:
                include_info.consumers.add(rel)

        for match in CALL_RE.finditer(text):
            normalized = match.group(1).upper()
            label = label_index.get(normalized)
            owner_path = owner_index.get(normalized)
            if label is None or owner_path is None:
                continue
            if owner_path == path:
                continue
            label.callers.add(rel)


def significant_labels(include_info: IncludeInfo) -> list[LabelInfo]:
    return sorted(
        [
            label
            for label in include_info.labels
            if "~" in label.raw_label and label.callers
        ],
        key=lambda item: (-len(item.callers), item.raw_label.upper()),
    )


def describe_include(stem: str) -> str:
    return INCLUDE_OVERVIEWS.get(
        stem,
        f"Shared `{stem}` include routines and support labels used across the Mombot source tree.",
    )


def describe_routine(include_stem: str, label: str) -> str:
    normalized = label.upper()
    override = ROUTINE_OVERRIDES.get(normalized)
    if override:
        return override

    tail = normalized.split("~", 1)[1] if "~" in normalized else normalized

    if "QUIKSTATS" in tail:
        return "Refreshes quickstats and prompt-state values from the live game output."
    if "CURRENTPROMPT" in tail or "CURRENT_PROMPT" in tail:
        return "Parses the current prompt and updates shared prompt-state values."
    if tail.startswith("LOAD"):
        return "Loads shared state or cached data for later command use."
    if tail.startswith("SAVE"):
        return "Saves shared state or cached data back to storage."
    if tail.startswith("GET"):
        return "Reads live game or cached state into shared include variables."
    if tail.startswith("CHECK"):
        return "Checks a prerequisite or validates current state before the caller continues."
    if tail.startswith("WAIT"):
        return "Waits for a prompt or game condition before the caller continues."
    if "ATTACK" in tail or "CAPTURE" in tail or "KILL" in tail:
        return "Runs or prepares a shared combat sequence."
    if "LAND" in tail:
        return "Handles a shared landing or citadel-entry path."
    if "HAGGLE" in tail or tail.startswith("BUY") or tail.startswith("SELL"):
        return "Handles a shared trade or negotiation path."
    if "WARP" in tail or tail.startswith("MOVE"):
        return "Runs a shared movement or warp helper path."
    if "SECTOR" in tail:
        return "Loads or renders shared sector state for the caller."
    if "PLANET" in tail:
        return "Loads or parses shared planet state for the caller."
    if "SHIP" in tail:
        return "Loads or parses shared ship state for the caller."
    if "DISPLAY" in tail or "BANNER" in tail or "ECHO" in tail:
        return "Displays shared output through the bot UI layer."

    return (
        f"Shared `{include_stem}` routine exported for cross-file use. "
        "Use the caller list and source excerpt below to confirm the exact behavior."
    )


def format_code_list(items: Iterable[str]) -> list[str]:
    return [f"* `/{item}`" for item in items]


def function_tiddler_title(label: str) -> str:
    return label


def include_tiddler_title(filename: str) -> str:
    return filename


def build_home_body(includes: list[IncludeInfo], routine_count: int) -> str:
    lines = [
        "! Mombot Include Reference",
        "",
        "This wiki is generated from `source/include` and cross-references the current live source tree.",
        "",
        f"* Include files documented: {len(includes)}",
        f"* Significant exported routines documented: {routine_count}",
        "",
        "!! Browse",
        "* [[Include Directory]]",
        "* [[Routine Directory]]",
        "* [[Include Usage Summary]]",
        "* [[Include Reference Conventions]]",
        "",
        "!! Scope",
        "* One tiddler per include file",
        "* One tiddler per significant exported include routine",
        "* Caller lists based on current non-retired `source/*.ts` files",
        "",
        "!! Notes",
        "* Significant routines are namespaced include labels with at least one caller outside their own file.",
        "* Routine summaries are generated from the label name plus a curated override table for the busiest shared helpers.",
        "* Use the source excerpt and caller list when exact behavior matters.",
    ]
    return "\n".join(lines)


def build_conventions_body() -> str:
    return "\n".join(
        [
            "! Include Reference Conventions",
            "",
            "* ''Include file:'' a file under `source/include`.",
            "* ''Significant exported routine:'' a namespaced label like `PLAYER~QUIKSTATS` or `PLANET~GETPLANETINFO` that is called from outside its own include file.",
            "* ''Direct include users:'' files that explicitly `include \"source\\include\\...\"` that include file.",
            "* ''External callers:'' files that `gosub` or `goto` the routine label from outside its owning include file.",
            "",
            "Retired scripts are intentionally excluded from the caller counts so the reference stays focused on the current tree.",
        ]
    )


def build_include_directory_body(includes: list[IncludeInfo]) -> str:
    lines = [
        "! Include Directory",
        "",
        f"Includes: {len(includes)}",
        "",
    ]
    for include_info in includes:
        lines.append(
            f"* [[{include_tiddler_title(include_info.path.name)}]]"
            f" - {describe_include(include_info.stem)}"
        )
    return "\n".join(lines)


def build_routine_directory_body(includes: list[IncludeInfo]) -> str:
    total = sum(len(significant_labels(include_info)) for include_info in includes)
    lines = [
        "! Routine Directory",
        "",
        f"Routines: {total}",
        "",
    ]
    for include_info in includes:
        routines = significant_labels(include_info)
        if not routines:
            continue
        lines.append(f"!! {include_info.path.name}")
        for label in routines:
            lines.append(
                f"* [[{function_tiddler_title(label.raw_label)}]]"
                f" - {describe_routine(include_info.stem, label.raw_label)}"
            )
        lines.append("")
    return "\n".join(lines).rstrip()


def build_include_usage_summary_body(includes: list[IncludeInfo]) -> str:
    ranked = sorted(
        includes,
        key=lambda item: (-len(item.consumers), item.path.name.lower()),
    )
    ascending = sorted(
        includes,
        key=lambda item: (len(item.consumers), item.path.name.lower()),
    )

    top_slice = ranked[:10]
    bottom_slice = ascending[:10]

    lines = [
        "! Include Usage Summary",
        "",
        "This page shows direct include usage based on current non-retired `source/*.ts` files.",
        "",
        "!! Most Used Includes",
    ]
    for include_info in top_slice:
        lines.append(
            f"* [[{include_tiddler_title(include_info.path.name)}]]"
            f" - {len(include_info.consumers)} direct include users"
        )

    lines.extend(["", "!! Least Used Includes"])
    for include_info in bottom_slice:
        lines.append(
            f"* [[{include_tiddler_title(include_info.path.name)}]]"
            f" - {len(include_info.consumers)} direct include users"
        )

    return "\n".join(lines)


def build_include_body(include_info: IncludeInfo, source_root: Path) -> str:
    routines = significant_labels(include_info)
    rel_path = relative_source_path(include_info.path, source_root)
    lines = [
        f"! {include_info.path.name}",
        "",
        describe_include(include_info.stem),
        "",
        f"''Source:'' `/{rel_path}`",
        "",
        "!! Significant Exported Routines",
    ]

    if routines:
        for label in routines:
            lines.append(
                f"* [[{function_tiddler_title(label.raw_label)}]]"
                f" - {describe_routine(include_info.stem, label.raw_label)}"
            )
    else:
        lines.append("No significant exported namespaced routines were detected for the current non-retired source tree.")

    lines.extend(["", "!! Direct Include Users"])
    if include_info.consumers:
        lines.extend(format_code_list(sorted(include_info.consumers)))
    else:
        lines.append("No direct include users were found in the current non-retired source tree.")

    lines.extend(
        [
            "",
            "!! Maintenance",
            "This tiddler is generated from the source tree. Re-run the builder after include refactors so caller counts and routine links stay current.",
        ]
    )
    return "\n".join(lines)


def build_function_body(include_info: IncludeInfo, label: LabelInfo, source_root: Path) -> str:
    rel_path = relative_source_path(include_info.path, source_root)
    lines = [
        f"! {label.raw_label}",
        "",
        describe_routine(include_info.stem, label.raw_label),
        "",
        f"''Include:'' [[{include_tiddler_title(include_info.path.name)}]]",
        f"''Defined at:'' `/{rel_path}:{label.line_no}`",
        "",
        "!! Source Excerpt",
    ]
    if label.excerpt:
        lines.append("<pre>")
        lines.append(html.escape(label.excerpt))
        lines.append("</pre>")
    else:
        lines.append("No source excerpt was captured for this label.")

    lines.extend(
        [
            "",
            "!! Notes",
            "This summary is generated from the routine name plus a curated override list for the busiest shared helpers. Treat it as a navigation aid, then verify against the source if the exact side effects matter.",
        ]
    )
    return "\n".join(lines)


def seed_manual_tiddlers(tiddlers_dir: Path, includes: list[IncludeInfo], routine_count: int) -> None:
    seeds = {
        "Mombot Include Reference": build_home_body(includes, routine_count),
        "Include Reference Conventions": build_conventions_body(),
    }
    for title, body in seeds.items():
        path = tid_path(tiddlers_dir, title)
        write_tid(path, title, body, tags=("mombot", "include-reference", "guide"))


def main() -> int:
    args = parse_args()

    wiki_dir = args.wiki_dir.resolve()
    source_root = args.source_root.resolve()
    tiddlers_dir = wiki_dir / "tiddlers"
    generated_dir = tiddlers_dir / "generated-include-reference"
    generated_dir.mkdir(parents=True, exist_ok=True)

    for old_file in generated_dir.glob("*.tid"):
        old_file.unlink()

    includes_by_stem = parse_include_files(source_root)
    apply_call_graph(includes_by_stem, source_root)

    includes = sorted(includes_by_stem.values(), key=lambda item: item.path.name.lower())
    routine_count = sum(len(significant_labels(include_info)) for include_info in includes)

    write_tid(
        tid_path(generated_dir, "Include Directory"),
        "Include Directory",
        build_include_directory_body(includes),
        tags=("mombot", "include-reference", "directory"),
    )
    write_tid(
        tid_path(generated_dir, "Routine Directory"),
        "Routine Directory",
        build_routine_directory_body(includes),
        tags=("mombot", "include-reference", "directory"),
    )
    write_tid(
        tid_path(generated_dir, "Include Usage Summary"),
        "Include Usage Summary",
        build_include_usage_summary_body(includes),
        tags=("mombot", "include-reference", "directory"),
    )

    for include_info in includes:
        write_tid(
            tid_path(generated_dir, include_tiddler_title(include_info.path.name)),
            include_tiddler_title(include_info.path.name),
            build_include_body(include_info, source_root),
            tags=("mombot", "include-reference", "include"),
            extra_fields={"caption": include_info.path.name},
        )
        for label in significant_labels(include_info):
            write_tid(
                tid_path(generated_dir, function_tiddler_title(label.raw_label)),
                function_tiddler_title(label.raw_label),
                build_function_body(include_info, label, source_root),
                tags=("mombot", "include-reference", "routine", f"include-{include_info.stem}"),
                extra_fields={"caption": label.raw_label},
            )

    seed_manual_tiddlers(tiddlers_dir, includes, routine_count)

    if args.skip_build:
        print(f"Generated include reference tiddlers in {generated_dir}")
        return 0

    subprocess.run(
        ["tiddlywiki", str(wiki_dir), "--build", "index"],
        check=True,
        cwd=wiki_dir,
    )

    output_dir = wiki_dir / "output"
    index_html = output_dir / "index.html"
    named_html = output_dir / "mombot-include-reference.html"
    if index_html.exists():
        shutil.copyfile(index_html, named_html)

    print(f"Generated include reference tiddlers in {generated_dir}")
    print(f"Built wiki output at {named_html if named_html.exists() else index_html}")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except subprocess.CalledProcessError as exc:
        print(f"Build failed: {exc}", file=sys.stderr)
        raise SystemExit(exc.returncode)
