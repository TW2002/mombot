gosub :loadvars~loadvars
gosub :help~initialize
setvar $help~help[1]  $help~tab&"Gives the first five sector quasar shots for entered planets."
setvar $help~help[2]  $help~tab&" "
setvar $help~help[3]  $help~tab&"qreport [planet1] [planet2] ... [planet x]"
gosub :help~helpfile

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
loadvar $mbbs

:cannoncalculator
gosub :player~quikstats
setvar $startinglocation $player~current_prompt
if ($startinglocation <> "Command")
	setvar $switchboard~message "Cannon Calculator must be run from command prompt*"
	gosub :switchboard~switchboard
	halt
end
setarray $cannonplanet 100
setarray $cannonfuel 100
setarray $cannonpercent 100
setvar $cannonplanetcount 0
getword $user_command_line $temp 1
while ($temp <> 0)
	add $cannonplanetcount 1
	setvar $cannonplanet[$cannonplanetcount] $temp
	getword $user_command_line $temp ($cannonplanetcount + 1)
end
if ($cannonplanetcount <= 0)
	setvar $switchboard~message "No planet numbers entered*"
	gosub :switchboard~switchboard
	halt
end
setvar $planetmemory " "
setvar $i 1
while ($i <= $cannonplanetcount)
	getwordpos $planetmemory $pos " "&$cannonplanet[$i]&" "
	if ($pos > 0)

	else
		setvar $planetmemory $planetmemory&" "&$cannonplanet[$i]&" "
		send "l "&$cannonplanet[$i]&"** "
		settextlinetrigger wrongplanet :badplanet "That planet is not in this sector."
		settextlinetrigger badplanet :badplanet "Invalid registry number, landing aborted."
		settextlinetrigger goodplanet :goodplanet "Claimed by:"
		pause

		:badplanet
		setvar $switchboard~message "Planet number " $cannonplanet[$i] " entered not valid. *"
		gosub :switchboard~switchboard
		halt

		:goodplanet
		killtrigger wrongplanet
		killtrigger badplanet
		gosub :planet~getplanetinfo
		send "q "
		setvar $cannonfuel[$i] $planet~planet_fuel
		setvar $cannonpercent[$i] $planet~sector_cannon
	end

	add $i 1
end
setvar $count 1
setvar $quasaroutput "'*"
setvar $quasaroutput $quasaroutput&"{"&$bot_name&"}    Sector Quasar Report    {"&$bot_name&"}*  (Planet "
setvar $i 1
while ($i <= $cannonplanetcount)
	if (($i = $cannonplanetcount) and ($i > 1))
		setvar $quasaroutput $quasaroutput&" and "&$cannonplanet[$i]&")*"
	elseif ($i = $cannonplanetcount)
		setvar $quasaroutput $quasaroutput&$cannonplanet[$i]&")*"
	elseif ($i = 1)
		setvar $quasaroutput $quasaroutput&$cannonplanet[$i]
	else
		setvar $quasaroutput $quasaroutput&", "&$cannonplanet[$i]
	end
	add $i 1
end
while ($count <= 5)
	setvar $cannondamage 0
	setvar $i 1
	while ($i <= $cannonplanetcount)
		if ($mbbs)
			add $cannondamage ((($cannonfuel[$i] * $cannonpercent[$i]) / 100) / 2)
		else
			add $cannondamage ((($cannonfuel[$i] * $cannonpercent[$i]) / 100) / 3)
		end
		subtract $cannonfuel[$i] (($cannonfuel[$i] * $cannonpercent[$i]) / 100)
		if ($cannonfuel[$i] < 0)
			setvar $cannonfuel[$i] 0
		end
		add $i 1
	end

	setvar $formattedcannondamage ""
	getlength $cannondamage $length
	while ($length > 3)
		cuttext $cannondamage $snippet ($length - 2) 9999
		cuttext $cannondamage $cannondamage 1 ($length - 3)
		getlength $cannondamage $length
		setvar $formattedcannondamage ","&$snippet&$formattedcannondamage
	end
	setvar $formattedcannondamage $cannondamage&$formattedcannondamage
	setvar $quasaroutput $quasaroutput&"  Shot "&$count&": "&$formattedcannondamage&" points of damage.*"
	add $count 1
end
setvar $quasaroutput $quasaroutput&"{"&$bot_name&"}    Sector Quasar Report    {"&$bot_name&"}**"
send $quasaroutput
halt

# includes:
include "source\include\loadvars"
include "source\include\planet"
include "source\include\help"
include "source\include\switchboard.ts"
