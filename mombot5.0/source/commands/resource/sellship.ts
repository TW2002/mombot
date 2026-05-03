gosub :LOADVARS~LOADVARS
gosub :HELP~INITIALIZE

setvar $HELP~HELP[1] $HELP~TAB&"  sellship   "
setvar $HELP~HELP[2] $HELP~TAB&"  "
setvar $HELP~HELP[3] $HELP~TAB&"     Sells all the ships at dock it can "
gosub :HELP~HELPFILE
:SELLSHIP
:SHIPSELL

killalltriggers
gosub :PLAYER~QUIKSTATS
gosub :PORT~SHIPSELL
halt

# includes:
include "source\include\loadvars"
include "source\include\port"
include "source\include\help"
