gosub :loadvars~loadvars
gosub :help~initialize
setvar $bot~command "surround"
setvar $player~save true
loadvar $player~surroundoverwrite
loadvar $player~surroundavoidallplanets
loadvar $player~surroundavoidshieldedonly
loadvar $player~surroundpassive
loadvar $player~surroundlimp
loadvar $player~surroundmine
loadvar $player~surroundfigs

loadvar $shipphotoncheck

setvar $help~help[1] $help~tab&"surround   "
setvar $help~help[2] $help~tab&"      Surrounds sector with fighters, armids, or limpets.  "
setvar $help~help[3] $help~tab&"      "
setvar $help~help[4] $help~tab&"    - Options for surround can be found in the"
setvar $help~help[5] $help~tab&"      preferences menu in bot"
gosub :help~helpfile

gosub :player~quikstats
if (($player~turns <= $bot~bot_turn_limit) and ($player~unlimitedgame <> true))
	setvar $switchboard~message "Turns Exceed Bot Turn Limit.*"
	gosub :switchboard~switchboard
	halt
end
if ($player~photons > 0)
	if ($shipphotoncheck = $player~ship_number)

	else
		setvar $shipphotoncheck $player~ship_number
		savevar $shipphotoncheck
		echo "*"&ansi_14&"You are carrying photons. *If you wish to surround anyway, press TAB-S again.*"&ansi_7
		halt
	end
end
setvar $startinglocation $player~current_prompt
if ($startinglocation = "Command")
elseif ($startinglocation = "Citadel")
	send "q "
	gosub :planet~getplanetinfo
	send "q "
elseif ($startinglocation = "Planet")
	gosub :planet~getplanetinfo
	send "q "
else
	echo "*Wrong prompt for surround command.*"
	halt

end
gosub :grid~surround

if (($startinglocation = "Citadel") or ($startinglocation = "Planet"))
	gosub :planet~landingsub
else
	gosub :player~quikstats
end
setvar $switchboard~message "Surrounded sector "&$player~current_sector&".*"
gosub :switchboard~switchboard
echo "*"&ansi_14&$player~surroundoutput&"*"&ansi_7
halt

# includes:
include "source\include\grid"
include "source\include\planet"
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
