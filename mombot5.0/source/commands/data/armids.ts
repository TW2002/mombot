gosub :loadvars~loadvars
gosub :help~initialize

setvar $help~help[1] $help~tab&"Refreshes Deployed Armid List"
setvar $help~help[2] $help~tab&"  - Will show difference since last command was run."
gosub :help~helpfile

gosub :player~quikstats
setvar $startinglocation $player~current_prompt
if ($startinglocation = "Citadel")
	send "q"
	waiton "You leave the citadel"
end
if (($startinglocation = "Citadel") or ($startinglocation = "Planet"))
	gosub :planet~getplanetinfo
	setvar $startingplanet $planet~planet
	send "q"
end

setvar $switchboard~message "Armid Report starting up!*"
gosub :switchboard~switchboard

logging off
gosub :mines~updatearmids
logging on
gosub :mines~reportarmids
gosub :switchboard~switchboard

if ($startinglocation = "Citadel")
	setvar $planet~planet $startingplanet
	gosub :planet~landonplanetentercitadel
elseif ($startinglocation = "Planet")
	send "l "&$startingplanet&"*"
end
halt

# includes:
include "source\include\mines"
include "source\include\loadvars"
include "source\include\help"
include "source\include\player"
include "source\include\planet"
include "source\include\switchboard.ts"
