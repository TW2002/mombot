gosub :loadvars~loadvars
gosub :help~initialize
loadvar $game~port_max

setvar $help~help[1]   $help~tab&"  deploy/put/lay/place {number} {type} {pers | corp} "
setvar $help~help[2]   $help~tab&"     "
setvar $help~help[3]   $help~tab&"  Command to replace old climp/plimp/mines/cmine/pmine "
setvar $help~help[4]   $help~tab&"  commands.  Old syntax still works but can also use new"
setvar $help~help[5]   $help~tab&"  options"
setvar $help~help[6]   $help~tab&"     "
setvar $help~help[7]   $help~tab&"   [topoff] - will fill ship up with fighters from sector "
setvar $help~help[8]   $help~tab&"              Example:"
setvar $help~help[9]   $help~tab&"                    >topoff"
setvar $help~help[10]  $help~tab&"     "
setvar $help~help[11]  $help~tab&"   [plimp | climp | cmine | pmine] - drops mines (default 1)"
setvar $help~help[12]  $help~tab&"              Examples: "
setvar $help~help[13]  $help~tab&"                    >plimp "
setvar $help~help[14]  $help~tab&"                    >place 100 limp"
setvar $help~help[15]  $help~tab&"                    >put p limp"
setvar $help~help[16]  $help~tab&"                    >lay 250 corp mine"
setvar $help~help[17]  $help~tab&"                    >deploy l p "
setvar $help~help[18]  $help~tab&"                    >plimp 3 "
setvar $help~help[19]  $help~tab&"      "
setvar $help~help[20]  $help~tab&"    [mines] - drops both mine types (default 3) "
setvar $help~help[21]  $help~tab&"              Examples:   "
setvar $help~help[22]  $help~tab&"                    >lay 250 mines"
setvar $help~help[23]  $help~tab&"                    >mines"
setvar $help~help[24]  $help~tab&"   "
setvar $help~help[25]  $help~tab&"   [deploy] - puts fighter into sector (default)"
setvar $help~help[26]  $help~tab&"              Examples: "
setvar $help~help[27]  $help~tab&"                    >deploy 10000 figs"
setvar $help~help[28]  $help~tab&"                    >deploy 100000"
setvar $help~help[29]  $help~tab&"                    >put 100 personal"
gosub :help~helpfile

setvar $bot~bot_name $switchboard~bot_name

gosub :player~quikstats
setvar $startinglocation $player~current_prompt
setvar $bot~startinglocation $player~current_prompt
if (($startinglocation <> "Citadel") and ($startinglocation <> "Command"))
	setvar $switchboard~message "You must run deploy from command or citadel prompt.*"
	gosub :switchboard~switchboard
	halt
end
loadvar $planet~planet

setvar $i 1
setvar $line $bot~user_command_line
setvar $bot~user_command_line ""
setvar $nothing "<>!<>junk<>!<>!"
getword $line $word 1 $nothing

while ($word <> $nothing)
	getword $line $word $i $nothing
	if ($word <> $nothing)
		setvar $bot~user_command_line $bot~user_command_line&" "&$word
	end
	add $i 1
end

# Old mine commands can be routed into deploy; use the original command
# name to preserve their default mine/corp settings.
setvar $legacy_deploy_command $bot~command_typed
if ($legacy_deploy_command = "")
	setvar $legacy_deploy_command $bot~command
end
lowercase $legacy_deploy_command
if ($legacy_deploy_command = "plimp")
	setvar $bot~user_command_line $bot~user_command_line&" personal limp "
elseif ($legacy_deploy_command = "pmine")
	setvar $bot~user_command_line $bot~user_command_line&" personal mine "
elseif ($legacy_deploy_command = "climp")
	setvar $bot~user_command_line $bot~user_command_line&" corporate limp "
elseif ($legacy_deploy_command = "cmine")
	setvar $bot~user_command_line $bot~user_command_line&" corporate mine "
elseif ($legacy_deploy_command = "mines")
	setvar $bot~user_command_line $bot~user_command_line&" mines "
end

isnumber $isnumber $bot~parm1
setvar $default false
if ($isnumber = true)
	setvar $deploy_amount $bot~parm1
else
	setvar $deploy_amount 1
	setvar $default true
end
setvar $deploy_corp true
setvar $deploy "defensive"

getwordpos " "&$bot~user_command_line&" " $pos " f"
if ($pos > 0)
	setvar $fighter true
else
	setvar $fighter false
end

getwordpos " "&$bot~user_command_line&" " $pos " l"
getwordpos " "&$bot~user_command_line&" " $pos2 "limp"
if (($pos > 0) or ($pos2 > 0))
	setvar $limpet true
else
	setvar $limpet false
end

getwordpos " "&$bot~user_command_line&" " $pos " a"
getwordpos " "&$bot~user_command_line&" " $pos2 "mine"
if (($pos > 0) or ($pos2 > 0))
	setvar $armid true
else
	setvar $armid false
end

getwordpos " "&$bot~user_command_line&" " $pos " o"
if ($pos > 0)
	setvar $offensive true
	setvar $defensive false
	setvar $toll false
else
	setvar $offensive false
end

getwordpos " "&$bot~user_command_line&" " $pos " d"
if ($pos > 0)
	setvar $defensive true
	setvar $toll false
	setvar $offensive false
else
	setvar $defensive false
end

getwordpos " "&$bot~user_command_line&" " $pos " t"
if ($pos > 0)
	setvar $toll true
	setvar $defensive false
	setvar $offensive false
else
	setvar $toll false
end

getwordpos " "&$bot~user_command_line&" " $pos " p"
if ($pos > 0)
	setvar $personal true
	setvar $corporate false
else
	setvar $personal false
end

getwordpos " "&$bot~user_command_line&" " $pos " c"
if ($pos > 0)
	setvar $corporate true
	setvar $personal false
else
	setvar $corporate false
end

getwordpos " "&$bot~user_command_line&" " $pos " mines "
if ($pos > 0)
	setvar $limpet true
	setvar $armid true
end

getwordpos " "&$bot~user_command_line&" " $pos " topoff "
if ($pos > 0)
	setvar $topoff true
	setvar $fighter true
	setvar $armid false
	setvar $limpet false
end

if (($fighter <> true) and ($limpet <> true) and ($armid <> true))
	setvar $fighter true
end
if (($offensive <> true) and ($defensive <> true) and ($toll <> true))
	if ((currentsector > 0) and (currentsector <= sectors))
		setvar $type sector.figs.type[currentsector]
		if ($type = "Offensive")
			setvar $offensive true
		elseif ($type = "Defensive")
			setvar $defensive true
		elseif ($type = "Toll")
			setvar $toll true
		else
			setvar $defensive true
		end
	else
		setvar $defensive true
	end
end
if (($corporate <> true) and ($personal <> true))
	setvar $corporate true
end

if ($fighter)
	if ($topoff)
		gosub :topoff
	else
		setvar $fighters~offensive $offensive
		setvar $fighters~defensive $defensive
		setvar $fighters~toll $toll
		setvar $fighters~corporate $corporate
		setvar $fighters~personal $personal
		setvar $fighters~amount $deploy_amount
		gosub :fighters~deploy
	end
elseif (($limpet) and ($armid))
	setvar $mines~personal $personal
	if ($default)
		setvar $deploy_amount 3
	end
	setvar $mines~amount $deploy_amount
	gosub :mines~deploy
elseif ($limpet)
	setvar $mines~personal $personal
	setvar $mines~amount $deploy_amount
	gosub :mines~deploylimp
elseif ($armid)
	setvar $mines~personal $personal
	setvar $mines~amount $deploy_amount
	gosub :mines~deployarmid
end

:topoff
killalltriggers
gosub  :player~currentprompt
setvar $bot~startinglocation $player~current_prompt
setvar $bot~validprompts "Citadel Command"
gosub :player~checkstartingprompt
if ($bot~startinglocation = "Citadel")
	send " q "
	gosub :planet~getplanetinfo
	send " q "
end
if ($bot~parm1 <> "o") and ($bot~parm1 <> "t") and ($bot~parm1 <> "d")
	setvar $type "d"
	isnumber $test currentsector
	if ($test = true)
		if ((currentsector > 0) and (currentsector <= sectors))
			setvar $type sector.figs.type[currentsector]
			if ($type = "Offensive")
				setvar $type "o"
			elseif ($type = "Defensive")
				setvar $type "d"
			elseif ($type = "Toll")
				setvar $type "t"
			else
				setvar $type "d"
			end
		end
	end
	setvar $bot~parm1 $type
end
setvar $to_drop $bot~parm1
gosub :do_topoff
if ($bot~startinglocation = "Citadel")
	gosub :planet~landingsub
end
setvar $switchboard~message "TopOff complete Left "&$ftrs_to_leave&" fighters.*"
gosub :switchboard~switchboard
return

:do_topoff
:do_topoff_again
killalltriggers
send " F"
waiton "Your ship can support up to"
getword currentline $ftrs_to_leave 10
striptext $ftrs_to_leave ","
striptext $ftrs_to_leave " "
if ($ftrs_to_leave < 1)
	setvar $ftrs_to_leave 1
end
send " " & $ftrs_to_leave & " * C " & $to_drop
settextlinetrigger deploy_topoff_success :topoff_success "Done. You have "
settextlinetrigger deploy_topoff_failure1 :do_topoff_again "You don't have that many fighters available."
settextlinetrigger deploy_topoff_failure2 :do_topoff_again "Too many fighters in your fleet!  You are limited to"
pause

:topoff_success
return

halt

#INCLUDES:
include "source\include\loadvars"
include "source\include\mines"
include "source\include\fighters"
include "source\include\help"
include "source\include\switchboard.ts"
