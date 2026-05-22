gosub :loadvars~loadvars
gosub :help~initialize
setvar $help~help[1]  $help~tab&"Pages the bot owner."
setvar $help~help[2]  $help~tab&" "
setvar $help~help[3]  $help~tab&"page"
gosub :help~helpfile

loadvar $bot_name
loadvar $parm1

:page
setvar $switchboard~message "Paging Bot Owner...*"
gosub :switchboard~switchboard
waiton "{"&$bot_name&"} - Paging Bot Owner..."
echo "[5;31;47m[37;41m[0m[5;31;47m[37;41m[0m [1;5;31mWARNING! WARNING! [5;31;47m[37;41m[0m[5;31;47m[37;41m[0m*"
echo ansi_7 ansi_15 "-YOU ARE BEING PAGED-  " ansi_14 "  -YOU ARE BEING PAGED-  " ansi_14 "  -YOU ARE BEING PAGED-  " ansi_15 "  -YOU ARE BEING PAGED-*" ansi_7
echo "[5;31;47m[37;41m[0m[5;31;47m[37;41m[0m [1;5;31mWARNING! WARNING! [5;31;47m[37;41m[0m[5;31;47m[37;41m[0m*"
echo ansi_14 "-YOU ARE BEING PAGED-  " ansi_15 "  -YOU ARE BEING PAGED-  " ansi_15 "  -YOU ARE BEING PAGED-  " ansi_14 "  -YOU ARE BEING PAGED-*" ansi_7
echo "[5;31;47m[37;41m[0m[5;31;47m[37;41m[0m [1;5;31mWARNING! WARNING! [5;31;47m[37;41m[0m[5;31;47m[37;41m[0m*"
echo ansi_15 "-YOU ARE BEING PAGED-  " ansi_14 "  -YOU ARE BEING PAGED-  " ansi_14 "  -YOU ARE BEING PAGED-  " ansi_15 "  -YOU ARE BEING PAGED-*" ansi_7
echo "[5;31;47m[37;41m[0m[5;31;47m[37;41m[0m [1;5;31mWARNING! WARNING! [5;31;47m[37;41m[0m[5;31;47m[37;41m[0m*"
echo ansi_14 "-YOU ARE BEING PAGED-  " ansi_15 "  -YOU ARE BEING PAGED-  " ansi_15 "  -YOU ARE BEING PAGED-  " ansi_14 "  -YOU ARE BEING PAGED-*" ansi_7
sound "scripts/MomBot/page.wav"
echo ansi_7 "*****" ansi_12 "-YOU ARE BEING PAGED-  " ansi_11 "  -YOU ARE BEING PAGED-  " ansi_12 "  -YOU ARE BEING PAGED-  " ansi_11 "  -YOU ARE BEING PAGED-*" ansi_7
echo "[5;31;47m[37;41m[0m[5;31;47m[37;41m[0m [1;5;31mWARNING! WARNING! [5;31;47m[37;41m[0m[5;31;47m[37;41m[0m*"
echo ansi_14 "-YOU ARE BEING PAGED-  " ansi_15 "  -YOU ARE BEING PAGED-  " ansi_15 "  -YOU ARE BEING PAGED-  " ansi_14 "  -YOU ARE BEING PAGED-*" ansi_7
echo "[5;31;47m[37;41m[0m[5;31;47m[37;41m[0m [1;5;31mWARNING! WARNING! [5;31;47m[37;41m[0m[5;31;47m[37;41m[0m*"
echo ansi_12 "-YOU ARE BEING PAGED-  " ansi_11 "  -YOU ARE BEING PAGED-  " ansi_12 "  -YOU ARE BEING PAGED-  " ansi_11 "  -YOU ARE BEING PAGED-*" ansi_7
echo "[5;31;47m[37;41m[0m[5;31;47m[37;41m[0m [1;5;31mWARNING! WARNING! [5;31;47m[37;41m[0m[5;31;47m[37;41m[0m*"
echo ansi_14 "-YOU ARE BEING PAGED-  " ansi_15 "  -YOU ARE BEING PAGED-  " ansi_15 "  -YOU ARE BEING PAGED-  " ansi_14 "  -YOU ARE BEING PAGED-*" ansi_7
sound "scripts/MomBot/page.wav"
echo ansi_7 "*****" ansi_15 "-YOU ARE BEING PAGED-  " ansi_14 "  -YOU ARE BEING PAGED-  " ansi_14 "  -YOU ARE BEING PAGED-  " ansi_15 "  -YOU ARE BEING PAGED-*" ansi_7
echo "[5;31;47m[37;41m[0m[5;31;47m[37;41m[0m [1;5;31mWARNING! WARNING! [5;31;47m[37;41m[0m[5;31;47m[37;41m[0m*"
echo ansi_12 "-YOU ARE BEING PAGED-  " ansi_11 "  -YOU ARE BEING PAGED-  " ansi_12 "  -YOU ARE BEING PAGED-  " ansi_11 "  -YOU ARE BEING PAGED-*" ansi_7
echo "[5;31;47m[37;41m[0m[5;31;47m[37;41m[0m [1;5;31mWARNING! WARNING! [5;31;47m[37;41m[0m[5;31;47m[37;41m[0m*"
echo ansi_15 "-YOU ARE BEING PAGED-  " ansi_14 "  -YOU ARE BEING PAGED-  " ansi_14 "  -YOU ARE BEING PAGED-  " ansi_15 "  -YOU ARE BEING PAGED-*" ansi_7
echo "[5;31;47m[37;41m[0m[5;31;47m[37;41m[0m [1;5;31mWARNING! WARNING! [5;31;47m[37;41m[0m[5;31;47m[37;41m[0m*"
echo ansi_12 "-YOU ARE BEING PAGED-  " ansi_11 "  -YOU ARE BEING PAGED-  " ansi_11 "  -YOU ARE BEING PAGED-  " ansi_11 "  -YOU ARE BEING PAGED-*" ansi_7
sound "scripts/MomBot/page.wav"
echo ansi_7 "*****" ansi_15 "-YOU ARE BEING PAGED-  " ansi_14 "  -YOU ARE BEING PAGED-  " ansi_14 "  -YOU ARE BEING PAGED-  " ansi_15 "  -YOU ARE BEING PAGED-*" ansi_7
echo "[5;31;47m[37;41m[0m[5;31;47m[37;41m[0m [1;5;31mWARNING! WARNING! [5;31;47m[37;41m[0m[5;31;47m[37;41m[0m*"
echo ansi_14 "-YOU ARE BEING PAGED-  " ansi_15 "  -YOU ARE BEING PAGED-  " ansi_15 "  -YOU ARE BEING PAGED-  " ansi_14 "  -YOU ARE BEING PAGED-*" ansi_7
echo "[5;31;47m[37;41m[0m[5;31;47m[37;41m[0m [1;5;31mWARNING! WARNING! [5;31;47m[37;41m[0m[5;31;47m[37;41m[0m*"
echo ansi_15 "-YOU ARE BEING PAGED-  " ansi_14 "  -YOU ARE BEING PAGED-  " ansi_14 "  -YOU ARE BEING PAGED-  " ansi_15 "  -YOU ARE BEING PAGED-*" ansi_7
echo "[5;31;47m[37;41m[0m[5;31;47m[37;41m[0m [1;5;31mWARNING! WARNING! [5;31;47m[37;41m[0m[5;31;47m[37;41m[0m*"
echo ansi_14 "-YOU ARE BEING PAGED-  " ansi_15 "  -YOU ARE BEING PAGED-  " ansi_15 "  -YOU ARE BEING PAGED-  " ansi_14 "  -YOU ARE BEING PAGED-*" ansi_7
sound "scripts/MomBot/page.wav"
echo ansi_7 "*****" ansi_12 "-YOU ARE BEING PAGED-  " ansi_11 "  -YOU ARE BEING PAGED-  " ansi_12 "  -YOU ARE BEING PAGED-  " ansi_11 "  -YOU ARE BEING PAGED-*" ansi_7
echo "[5;31;47m[37;41m[0m[5;31;47m[37;41m[0m [1;5;31mWARNING! WARNING! [5;31;47m[37;41m[0m[5;31;47m[37;41m[0m*"
echo ansi_14 "-YOU ARE BEING PAGED-  " ansi_15 "  -YOU ARE BEING PAGED-  " ansi_15 "  -YOU ARE BEING PAGED-  " ansi_14 "  -YOU ARE BEING PAGED-*" ansi_7
echo "[5;31;47m[37;41m[0m[5;31;47m[37;41m[0m [1;5;31mWARNING! WARNING! [5;31;47m[37;41m[0m[5;31;47m[37;41m[0m*"
echo ansi_12 "-YOU ARE BEING PAGED-  " ansi_11 "  -YOU ARE BEING PAGED-  " ansi_12 "  -YOU ARE BEING PAGED-  " ansi_11 "  -YOU ARE BEING PAGED-*" ansi_7
echo "[5;31;47m[37;41m[0m[5;31;47m[37;41m[0m [1;5;31mWARNING! WARNING! [5;31;47m[37;41m[0m[5;31;47m[37;41m[0m*"
echo ansi_14 "-YOU ARE BEING PAGED-  " ansi_15 "  -YOU ARE BEING PAGED-  " ansi_15 "  -YOU ARE BEING PAGED-  " ansi_14 "  -YOU ARE BEING PAGED-*" ansi_7
setvar $switchboard~message "Bot Owner Paged*"
gosub :switchboard~switchboard
halt
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
