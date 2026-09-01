gosub :loadvars~loadvars
gosub :help~initialize

setvar $help~help[1] $help~tab&"HAZKILL - Remove NavHaz Command"
setvar $help~help[2] $help~tab&"          Scans Current-Sector and launches Genesis Torpedos"
setvar $help~help[3] $help~tab&"          to removes any NavHaz"
gosub :help~helpfile

# ============================== START NAV HAZ KILLER (navhaz) Sub ==============================
:hazkill
setvar $pname "M()M - NAV HAZ KiLLA!"
gosub :player~quikstats
setvar $startinglocation $player~current_prompt
if (($startinglocation <> "Command") and ($startinglocation <> "Citadel"))
	setvar $switchboard~message "Please Start from Command or Citadel Prompts!*"
	gosub :switchboard~switchboard
	halt
end
if ($player~genesis <= 0)
	setvar $switchboard~message "No Genesis Torps On Hand.*"
	gosub :switchboard~switchboard
	halt
end
if ($startinglocation = "Citadel")
	send "Q"
	gosub :planet~getplanetinfo
	send "  Q  "
	waitfor "Command [TL="
end
send "*"
waitfor "(?="
setvar $haz sector.navhaz[$player~current_sector]
if ($haz <= 10)
	setvar $2Bpopped 1
elseif ($haz <= 20)
	setvar $2Bpopped 2
elseif ($haz <= 30)
	setvar $2Bpopped 3
elseif ($haz <= 40)
	setvar $2Bpopped 4
elseif ($haz <= 50)
	setvar $2Bpopped 5
elseif ($haz <= 60)
	setvar $2Bpopped 6
elseif ($haz <= 70)
	setvar $2Bpopped 7
elseif ($haz <= 80)
	setvar $2Bpopped 8
elseif ($haz <= 90)
	setvar $2Bpopped 9
else
	setvar $2Bpopped 10
end
if ($2Bpopped > $player~genesis)
	setvar $switchboard~message "Short " & ($2Bpopped - $player~genesis) & " Genesis Torps.*"
	gosub :switchboard~switchboard
	setvar $2Bpopped $player~genesis
	waitfor "Message sent on sub-space"
end
while ($2Bpopped > 0)
	send "U Y "
	setslinetrigger planetname :planetname "What do you want to name this planet?"
	setstrigger override :override "Do you wish to abort?"
	pause

	:override
	send "N "
	pause

	:planetname
	killtrigger planetname
	killtrigger override
	send $pname & "* Z  C * "
	subtract $2Bpopped 1
end
if ($startinglocation = "Citadel")
	send " L " & $planet~planet & "* C "
end
setvar $switchboard~message "Nav Haz Killa Complete!*"
gosub :switchboard~switchboard

halt
# ============================== END NAV HAZ KILLER (navhaz) Sub ==============================

#INCLUDES:
include "source\include\planet"
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
