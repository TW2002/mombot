gosub :loadvars~loadvars
gosub :help~initialize

setvar $help~help[1] $help~tab&"PLIST - Displays Sector planet scan on subspace "
gosub :help~helpfile

# ============================== START PLANET LIST (PLIST)  ==============================
:plist
killalltriggers
setvar $planet~planet 0
gosub :player~quikstats
setvar $planet~planetoutput ""
setvar $startinglocation $player~current_prompt
setvar $bot~startinglocation $player~current_prompt
setvar $bot~validprompts "Citadel Command"
gosub :player~checkstartingprompt

:planet_listing_start
if ($startinglocation = "Citadel")
	send "S* Q"
	gosub :planet~getplanetinfo
	send "Q"
else
	send "** "
end
if ((sector.planetcount[$player~current_sector] <= 1) and ($player~planet_scanner = "No"))
	setvar $switchboard~message "Must be more than one planet in sector if bot doesn't have planet scanner*"
	gosub :switchboard~switchboard
	if ($startinglocation = "Citadel")
		gosub :planet~landingsub
	end
	halt
end
send "L"
settexttrigger beginscan :planet_listing_beginscan "Atmospheric maneuvering system engaged"
pause

:planet_listing_beginscan
killalltriggers
settextlinetrigger nothing2do :planet_listing_nothing2do "You can create one with a Genesis Torpedo"
setstrigger pscandone :planet_listing_pscandone "Land on which planet"
settextlinetrigger line_trig :planet_listing_parse_scan_line
pause

:planet_listing_nothing2do
killalltriggers
waiton "(?="
setvar $switchboard~message "No Planets In Sector!*"
gosub :switchboard~switchboard
halt

:planet_listing_parse_scan_line
killtrigger line_trig
setvar $s currentline
if (($s = "") or ($s = 0))
	setvar $s "          "
end
replacetext $s "        Level" "Lvl"
replacetext $s "-----------------------------------------------" "-------------------------------------------"
replacetext $s "        Citadel" "Citadel"
replacetext $s "l Fighters Q" "l  Figs Q"
getlength $s $length
if ($length > 70)
	cuttext $s $s 1 70
end
setvar $planet~planetoutput $planet~planetoutput&$s&"*"
killalltriggers
goto :planet_listing_beginscan

:planet_listing_pscandone
setvar $strlocal ""
killalltriggers
setvar $idx 1
if (($planet~planet <> 0) and ($player~current_sector <> 1))
	send $planet~planet & "* c "
	setvar $switchboard~message "On Planet #" & $planet~planet & "*"
else
	send " * "
	setvar $switchboard~message ""
end
waiton "(?="
send "'*"
waiton "Comm-link open on sub-space band"
send $planet~planetoutput
send "**"
waiton "Sub-space comm-link terminated"
gosub :switchboard~switchboard
halt
# ============================== END PLANET LIST (PLIST) Sub ==============================

# includes:
include "source\include\planet"
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
