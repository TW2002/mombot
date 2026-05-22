gosub :loadvars~loadvars
gosub :help~initialize

setvar $help~help[1]   $help~tab&"  invader is a wrapper for the following commands:"
setvar $help~help[2]   $help~tab&"  pe, ped, pel, pelk, pex, pxe, pxed, pxedx, pxel, pxelk, pxex"
setvar $help~help[3]   $help~tab&"     "
setvar $help~help[4]   $help~tab&"  usage:"
setvar $help~help[5]   $help~tab&"     "
setvar $help~help[6]   $help~tab&"  pe [Sector] - Launch photon into adjacent sector and immediately enter "
setvar $help~help[7]   $help~tab&"  ped [Sector] - Launch photon, enter and launch genesis torpedo "
setvar $help~help[8]   $help~tab&"  pel [Sector] [Planet#] - Photon, enter and land on planet "
setvar $help~help[9]   $help~tab&"  pelk [Sector] [Planet#] - Photon, enter, land and send one wave of fighters "
setvar $help~help[10]   $help~tab&"  pex [Sector] [Ship#] - Photon, enter and export to another ship "
setvar $help~help[11]   $help~tab&"  pxe [Sector] [Ship#] - Photon, export to another ship and enter "
setvar $help~help[12]   $help~tab&"  pxed [Sector] [Ship#] - Photon, export, enter and launch genesis torpedo "
setvar $help~help[13]   $help~tab&"  pxel [Sector] [Ship#] [Planet#] - Photon, export, enter and land on planet "
setvar $help~help[14]   $help~tab&"  pxelk [Sector] [Ship#] [Planet#] - Photon, export, enter, land and send wave "
setvar $help~help[15]   $help~tab&"  pxex [Sector] [Ship#] - Photon, export, enter and export back "
setvar $help~help[16]  $help~tab&"     "
setvar $help~help[17]   $help~tab&"  Examples:"
setvar $help~help[18]  $help~tab&"     "
setvar $help~help[19]  $help~tab&"  >pe 24902 "
setvar $help~help[20]  $help~tab&"  >pel 24902 15"
setvar $help~help[21]  $help~tab&"  >pxel 24902 3 15"
gosub :help~helpfile

setvar $invader~command $bot~command_typed
if (($invader~command = "") or ($invader~command = 0))
	setvar $invader~command $bot~command
end
lowercase $invader~command

setvar $invader~valid_commands " pe ped pel pelk pex pxe pxed pxedx pxel pxelk pxex "
getwordpos $invader~valid_commands $invader~pos " "&$invader~command&" "
if ($invader~pos <= 0)
	setvar $switchboard~message "Invader must be called through one of: pe ped pel pelk pex pxe pxed pxedx pxel pxelk pxex.*"
	gosub :switchboard~switchboard
	halt
end

killalltriggers
if (($invader~command = "") or ($invader~command = 0))
	setvar $invader~command $bot~command_typed
	if (($invader~command = "") or ($invader~command = 0))
		setvar $invader~command $bot~command
	end
	lowercase $invader~command
end
setarray $invader~scan_array 1000
gosub :player~quikstats
setvar $bot~startinglocation $player~current_prompt
setvar $bot~validprompts "Citadel Command"
gosub :player~checkstartingprompt
setvar $player~startinglocation $player~current_prompt
setvar $invader~starting_ship $player~ship_number

if ($ship~ship_max_attack <= 0)
	gosub :ship~getshipstats
end

if ($player~photons <= 0)
	setvar $switchboard~message "This command requires a photon*"
	gosub :switchboard~switchboard
	halt
end

isnumber $invader~test $bot~parm2
if ((($invader~test = false) or ($bot~parm2 = 0)) and (($invader~command <> "pe") and ($invader~command <> "ped")))
	setvar $switchboard~message "Parameter 2 invalid*"
	gosub :switchboard~switchboard
	halt
end

isnumber $invader~test $bot~parm3
if (($invader~test = false) or ($bot~parm3 = 0))
	if ($invader~command = "pxex")
		setvar $bot~parm3 $player~ship_number
	elseif (($invader~command = "pxel") or ($invader~command = "pxelk"))
		setvar $switchboard~message "Planet Parameter in-valid*"
		gosub :switchboard~switchboard
		halt
	end
end

isnumber $invader~test $bot~parm1
if ($invader~test = false)
	setvar $switchboard~message "Sector Parameter invalid*"
	gosub :switchboard~switchboard
	halt
end
if (($bot~parm1 > 10) and (($bot~parm1 <= sectors) and ($bot~parm1 <> $map~stardock)))
else
	setvar $switchboard~message "Invalid attack sector entered*"
	gosub :switchboard~switchboard
	halt
end

setvar $invader~i 1
setvar $invader~isfound false
while (sector.warps[$player~current_sector][$invader~i] > 0)
	if (sector.warps[$player~current_sector][$invader~i] = $bot~parm1)
		setvar $invader~isfound true
	end
	add $invader~i 1
end
if ($invader~isfound = false)
	setvar $switchboard~message "Cannot continue.  Sector not Adjacent, aborting..*"
	gosub :switchboard~switchboard
	halt
end
getwordpos " "&$bot~user_command_line&" " $invader~pos "speed"
if ($invader~pos > 0)
	setvar $invader~speed true
else
	setvar $invader~speed false
end

send " c v * y * "&$bot~parm1&"*  "

if ($player~startinglocation = "Citadel")
	if ($player~credits > 0)
		send "t t"&$player~credits&"* "
	end
	send " q  q"
	gosub :planet~getplanetinfo
	send "  C C  "
end
setvar $invader~enter "m  "&$bot~parm1&"*"
setvar $invader~xport "x   "&$bot~parm2&"*  q  z  n  "
setvar $invader~xport_back "x   "&$invader~starting_ship&"*  q  z  n  "
setvar $invader~photon "  p y"&$bot~parm1&"*  q  "

setvar $invader~xport_commands " pxe pxed pxedx pxel pxelk pxex "
getwordpos $invader~xport_commands $invader~pos " "&$invader~command&" "
if ($invader~pos > 0)
	setvar $invader~speed_invade_macro $invader~xport&$invader~enter&"       * "
	setvar $invader~normal_invade_macro $invader~xport&$invader~enter&"** "
else
	setvar $invader~speed_invade_macro $invader~enter&"     *  "
	setvar $invader~normal_invade_macro $invader~enter&"*            "
end

if ($player~startinglocation = "Citadel")
	setvar $invader~mac_starting $invader~photon&"q  q  "
else
	setvar $invader~mac_starting $invader~photon&"  "
end
if ($invader~command = "pxex")
	setvar $invader~mac_ending "x   "&$bot~parm3&"*  q  q  z  n"
	setvar $invader~ends_in_sector true
elseif ($invader~command = "pex")
	setvar $invader~mac_ending "x    "&$bot~parm2&"*  q  q  *  z  n  *  "
	setvar $invader~ends_in_sector true
elseif ($invader~command = "pel")
	setvar $invader~mac_ending "l "&$bot~parm2&"*  *"
	setvar $invader~ends_in_sector false
elseif ($invader~command = "pxel")
	setvar $invader~mac_ending "l "&$bot~parm3&"*  *  "
	setvar $invader~ends_in_sector false
elseif ($invader~command = "pxelk")
	setvar $invader~mac_ending "l "&$bot~parm3&"*  *  a"&$ship~ship_max_attack&"*"
	setvar $invader~ends_in_sector false
elseif ($invader~command = "pelk")
	setvar $invader~mac_ending "l "&$bot~parm2&"*  *  a"&$ship~ship_max_attack&"*"
	setvar $invader~ends_in_sector false
elseif (($invader~command = "pxed") or ($invader~command = "ped"))
	setvar $invader~mac_ending "u  y  n  . *  j  c  *  "
	setvar $invader~ends_in_sector false
elseif (($invader~command = "pxedx") or ($invader~command = "pedx"))
	setvar $invader~mac_ending "u  y  n  . *  j  c  *  "&$invader~xport_back
	setvar $invader~ends_in_sector true
else
	setvar $invader~mac_ending ""
	setvar $invader~ends_in_sector false
end
if (($player~startinglocation = "Citadel") and ($invader~ends_in_sector = true))
	setvar $invader~mac_ending $invader~mac_ending&"l "&$planet~planet&" * c"
end
setvar $invader~mac_ending $invader~mac_ending&"@"

send "  t"
waitfor ", 2"
getword currentline $invader~inittime 1

:photon_attack_timer
send "  t"
waitfor ", 2"
getword currentline $invader~currenttime 1
waitfor "Computer"
if ($invader~inittime <> $invader~currenttime)
	if ($invader~speed = true)
		send $invader~mac_starting&$invader~speed_invade_macro&$invader~mac_ending
	else
		send $invader~mac_starting&$invader~normal_invade_macro&$invader~mac_ending
	end
else
	goto :photon_attack_timer
end

if ($invader~speed = false)
	setvar $invader~i 1
	settextlinetrigger damage :invader~collect_damage "The console reports damages of "
	settextlinetrigger damage_done :invader~damage_done "Average Interval Lag:"
	settextlinetrigger damage_pod :invader~collect_pod "You rush to an escape pod and abandon"
	settextlinetrigger death :invader~collect_death "You will have to start"
	pause

	:invader~collect_damage
	setvar $invader~scan_array[$invader~i] currentline
	add $invader~i 1
	settextlinetrigger damage :invader~collect_damage "The console reports damages of "
	pause

	:invader~collect_pod
	setvar $invader~scan_array[$invader~i] currentline
	add $invader~i 1

	:invader~damage_done
	killalltriggers
	if ($invader~i > 1)
		setvar $invader~j 1
		send "'*"
		settextlinetrigger comm :invader~continuedamage "Comm-link open on sub-space band"
		pause

		:invader~continuedamage
		while ($invader~j < $invader~i)
			send $invader~scan_array[$invader~j]&"*"
			add $invader~j 1
		end
		send "*"
		settextlinetrigger comm2 :invader~continuedamage2 "Sub-space comm-link terminated"
		pause

		:invader~continuedamage2
	end

	:invader~collect_death
	killalltriggers
	halt
end
halt

# includes:
include "source\include\planet"
include "source\include\ship"
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
