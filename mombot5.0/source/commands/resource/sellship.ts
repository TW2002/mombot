gosub :BOT~LOADVARS

setvar $BOT~HELP[1] $BOT~TAB&"  sellship   "
setvar $BOT~HELP[2] $BOT~TAB&"  "
setvar $BOT~HELP[3] $BOT~TAB&"     Sells all the ships at dock it can "
gosub :BOT~HELPFILE
:SELLSHIP
:SHIPSELL

killalltriggers
gosub :PLAYER~QUIKSTATS
gosub :PORT~SHIPSELL
halt

# includes:
include "source\include\port"
