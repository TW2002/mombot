loadvar $bot_name
loadvar $user_command_line
loadvar $parm1
loadvar $parm2
loadvar $parm3
loadvar $parm4
loadvar $parm5
loadvar $parm6
loadvar $parm7
loadvar $parm8
setarray $dropsector 1000

getwordpos $user_command_line $pos "direct"
if ($pos > 0)
	setvar $direct true
else
	setvar $direct false
end

:ldrop_start
isnumber $test $parm1
if ($test = true)
	setvar $delay $parm1
else
	setvar $delay 0
end
gosub :player~quikstats
setvar $startinglocation $player~current_prompt
if ($startinglocation <> "Citadel")
	setvar $switchboard~message "Must start from Citadel*"
	gosub :switchboard~switchboard
	halt
end
send "q"
gosub :planet~getplanetinfo
send "q"
getwordpos $user_command_line $pos "kill"
if ($pos > 0)
	setvar $kill true
	gosub :combat~init
else
	setvar $kill false
end

setvar $home $player~current_sector

:ldrop_re_scan
setvar $i 0
setvar $r 0

:ldrop_scan
killalltriggers
send "q q q * k2"
waitfor "Activated  Limpet  Scan"
settextlinetrigger corp_limp :ldrop_corp_limp "Corporate"
settextlinetrigger pers_limp :ldrop_pers_limp "Personal "
settextlinetrigger no_limp :ldrop_no_limp "No Active Limpet"
settexttrigger lets_move :ldrop_re_scan "Command [TL="
pause

:ldrop_corp_limp
add $i 1
setvar $temp $dropsector[$i]
getword currentline $dropsector[$i] 1
if ($temp <> 0)
	if ($dropsector[$i] <> $temp)
		getsectorparameter $dropsector[$i] "FIGSEC" $isfigged
		if ($isfigged)
			if ($direct)
				setvar $adjsec $dropsector[$i]
				goto :droptosector
			else
				goto :ldrop_re_scan
			end
		end
		goto :ldrop_lets_move
	end
end
settextlinetrigger corp_limp :ldrop_corp_limp "Corporate"
pause

:ldrop_pers_limp
add $i 1
setvar $temp $dropsector[$i]
getword currentline $dropsector[$i] 1
if ($temp <> 0)
	if ($dropsector[$i] <> $temp)
		getsectorparameter $dropsector[$i] "FIGSEC" $isfigged
		if ($isfigged)
			if ($direct)
				setvar $adjsec $dropsector[$i]
				goto :droptosector
			else
				goto :ldrop_re_scan
			end
		end
		goto :ldrop_lets_move
	end
end
settextlinetrigger pers_limp :ldrop_pers_limp "Personal"
pause

:ldrop_no_limp
killalltriggers
goto :ldrop_scan

:ldrop_lets_move
killalltriggers

gosub :ldrop_get_adj

:droptosector
killalltriggers
if ($delay > 0)
	setdelaytrigger delay_drop :go_go_go $delay
	pause
end

:go_go_go
send "l "&$planet~planet&"* cp "&$adjsec&"*y"
settextlinetrigger no_fig :ldrop_no_fig "Your own fighters must be in the destination"
settextlinetrigger in_sector :ldrop_in_sector "-=-=-=- Planetary TransWarp Drive Engaged! -=-=-=-"
pause

:ldrop_no_fig
killtrigger in_sector
setvar $switchboard~message "No Adjacent fig in drop sector*"
gosub :switchboard~switchboard
goto :ldrop_scan

:ldrop_in_sector
killalltriggers
if ($kill)
	gosub :scanitcitkill
else
	send "s* "
end
halt

:ldrop_return_home
send "p "&$home&"* "
goto :ldrop_scan

:ldrop_get_adj
setvar $adjsec 0
setvar $s 1
while (sector.warps[$dropsector[$i]][$s] > 0)
	setvar $checksector sector.warps[$dropsector[$i]][$s]
	getsectorparameter $checksector "FIGSEC" $isfigged
	if ($isfigged)
		setvar $adjsec $checksector
		return
	end
	add $s 1
end
goto :ldrop_re_scan

return

:scanitcitkill
gosub :player~quikstats
setvar $player~startinglocation $player~current_prompt
gosub :sector~getsectordata
if ($sector~corpiecount < $sector~realtradercount)
	gosub :combat~fastcitadelattack
	goto :scanitcitkill
end
echo ansi_12 "*NO Targets*"
return

# includes:
include "source\include\combat"
include "source\include\planet"
include "source\include\switchboard.ts"
