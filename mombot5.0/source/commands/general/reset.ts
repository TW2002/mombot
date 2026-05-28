gosub :help~initialize
setvar $help~help[1] $help~tab&"Disconnects from the game server; also used by the EMX alias."
gosub :help~helpfile

:emx
:reset
disconnect
halt

include "source\include\help"
