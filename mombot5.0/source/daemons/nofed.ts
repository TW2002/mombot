systemscript
gosub :help~initialize
setvar $help~help[1] $help~tab&"Converts federation-message hotkey output to subspace."
gosub :help~helpfile

settextouttrigger fed :fed "`"
pause

:fed
send "'"
settextouttrigger fed :fed "`"
pause

include "source\include\help"
