gosub :loadvars~loadvars
gosub :help~initialize

setvar $help~help[1] $help~tab&"  sellship   "
setvar $help~help[2] $help~tab&"  "
setvar $help~help[3] $help~tab&"     Sells all the ships at dock it can "
gosub :help~helpfile

:sellship
:shipsell
killalltriggers
gosub :player~quikstats
gosub :port~shipsell
halt

# includes:
include "source\include\loadvars"
include "source\include\port"
include "source\include\help"
