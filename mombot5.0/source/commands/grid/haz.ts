loadvar $bot_name

gosub :player~quikstats

if ($player~current_prompt <> "Command")
	setvar $switchboard~message "Start From Command Prompt!*"
	gosub :switchboard~switchboard
	halt
end
if ($player~genesis < 10)
	setvar $switchboard~message "Not Enough Gen Torps!*"
	gosub :switchboard~switchboard
	halt
end
if ($player~atomic < 10)
	setvar $switchboard~message "Not Enough Atomic Dets!*"
	gosub :switchboard~switchboard
	halt
end
if ($player~current_sector = 1)
	setvar $switchboard~message "The intense traffic in sector 1 prohibits planetary construction.*"
	gosub :switchboard~switchboard
	halt
end

if ($player~current_sector <> stardock)
	setvar $buffer ($player~shields + $player~fighters)
	if ($buffer < 5500)
		setvar $switchboard~message "Not Enough Shields/Fighters***"
		gosub :switchboard~switchboard
		halt
	end
end

setvar $start_figs $player~fighters
setvar $start_shields $player~shields
setvar $i 1

getrnd $id 1000 9999

setvar $id "["&$id&"] Planet Creation"

loadvar $haz_pmax
isnumber $tst $haz_pmax
if ($tst = 0)
	setvar $haz_pmax 0
end

if ($haz_pmax < 1)
	send "  **  V"
	waiton "Warps to Sector(s) :"
	waiton "The Maximum number of Planets per sector:"
	gettext currentline $pmax "sector:" ","
	striptext $pmax " "
	setvar $haz_pmax $pmax
	savevar $haz_pmax
else
	send "  **  "
	waiton "Warps to Sector(s) :"
	setvar $pmax $haz_pmax
end

setvar $pnum sector.planetcount[$player~current_sector]
setvar $str ""

setvar $i 1
while ($i <= 10)
	if ($pnum < $pmax)
		setvar $str $str&" U  Y "&$id&"*  J  C  * "
		add $pnum 1
	else
		setvar $str $str&" U  Y  N "&$id&"*  J  C  * "
	end
	add $i 1
end

send $str&"  /"

waitfor #179&"Turns"

setarray $registry 10
setvar $i 1
send " L"
waitfor "--------------------------------------------------"
settexttrigger donedrawing :donedrawing "Land on which planet <Q to abort>"

:loop
waiton "> "&$id
gettext currentline $str "<" ">"
striptext $str " "
setvar $registry[$i] $str
add $i 1
goto :loop

:donedrawing
killalltriggers
setvar $str ""
send "*   "
setvar $i 1
while ($i <= 10)
	setvar $str $str&"  L  Z"&#8&#8&#8&$registry[$i]&"*   z  d  y  *   "
	add $i 1
end

send $str&"  **  "

gosub :player~quikstats

setvar $switchboard~message sector.navhaz[$player~current_sector]&"% Haz Created (Lost "&($start_figs - $player~fighters)&" Figs, "&($start_shields - $player~shields)&" Shields)*"
gosub :switchboard~switchboard
halt
include "source\include\player"
include "source\include\switchboard.ts"
