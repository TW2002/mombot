gosub :loadvars~loadvars
gosub :help~initialize

setvar $help~help[1] $help~tab&"refresh - refresh cached bot state from the live game"
setvar $help~help[2] $help~tab&"  "
setvar $help~help[3] $help~tab&"  refresh"
setvar $help~help[4] $help~tab&"    - re-reads player, game, ship, and planet data"
setvar $help~help[5] $help~tab&"      from the current prompt"
gosub :help~helpfile

killalltriggers
gosub :player~quikstats
setvar $bot~validprompts "Citadel Command"
gosub :player~checkstartingprompt
if ($player~current_prompt = "Citadel")
	send "q"
	gosub :planet~getplanetinfo
	send "q"
end

gosub :player~getinfo
gosub :game~gamestats
gosub :ship~getshipstats

gosub :player~quikstats
gosub :ship~getshipcapstats
gosub :ship~loadshipinfo

gosub :planet~getplanetstats
gosub :planet~loadplanetinfo

if ($player~current_prompt = "Citadel")
	gosub :planet~landingsub
end

if ($map~stardock > 0) and ($map~backdoor = 0)
	setvar $sector~destination $map~stardock
	gosub :sector~getbackdoor
end

setvar $switchboard~message "Bot data refresh completed.*"
gosub :switchboard~switchboard
halt

# includes:
include "source\include\loadvars"
include "source\include\help"
include "source\include\game"
include "source\include\player"
include "source\include\ship"
include "source\include\planet"
include "source\include\sector"
include "source\include\switchboard"
