gosub :help~initialize
setvar $help~help[1] $help~tab&"Monitors public FedSpace movement messages."
setvar $help~help[2] $help~tab&"Relays warps, docks, Terra/Sol movement, logins, exits,"
setvar $help~help[3] $help~tab&"weapon power-up, and fighter launch messages to subspace."
gosub :help~helpfile

:start
loadvar $bot_name

setvar $switchboard~message "OZ Fed Monitor On Line!*"
gosub :switchboard~switchboard

:main
killalltriggers
setdelaytrigger notice :warning 300000
settexttrigger 0 :warning "INACTIVITY WARNING"
settexttrigger 1 :grab " is surrounded by a glowing corona of warp energies!"
settexttrigger 2 :grab " ship vanishes from scanners with a brilliant flash!"
settexttrigger 3 :grab " warps into the sector."
settexttrigger 4 :grab " warps out of the sector."
settexttrigger 5 :grab "Scanners detect a wormhole opening in this sector!"
settexttrigger 6 :grab " appears in a brilliant flash of warp energies!"
settexttrigger 7 :grab " lands on the StarDock."
settexttrigger 8 :grab " blasts off from the StarDock."
settexttrigger 9 :grab " lands on Terra."
settexttrigger 10 :grab " lifts off from Terra."
settexttrigger 11 :grab " enters the game"
settexttrigger 12 :grab " exits the game"
settexttrigger 13 :grab " docks at Sol"
settexttrigger 14 :grab " lifts off from Sol"
settexttrigger 15 :grab " is powering up weapons systems!"
settexttrigger 16 :grab " launches a wave of fighters at"
pause

:grab
killalltriggers
cuttext currentline $spoof 1 2
if (($spoof = "P ") or ($spoof = "R ") or ($spoof = "F "))
	goto :main
end
cuttext currentline $ss 1 1
if ($ss = "'")
	goto :main
end
setvar $line currentline
setvar $switchboard~message $line&"*"
gosub :switchboard~switchboard
goto :main

:warning
killalltriggers
setvar $switchboard~message "OZ Fed Monitor On Line!*"
gosub :switchboard~switchboard
goto :main
include "source\include\switchboard.ts"
include "source\include\help"
