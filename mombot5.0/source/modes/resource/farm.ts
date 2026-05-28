gosub :loadvars~loadvars
gosub :help~initialize

setvar $help~help[1] $help~tab&"Visits sectors in list and farms the planets there."
setvar $help~help[2] $help~tab&"Default will visit all planets on the tl list."
setvar $help~help[3] $help~tab&"       "
setvar $help~help[4] $help~tab&"  Usage:  farm set {sector1} {sector2} {...}"
setvar $help~help[5] $help~tab&"  Usage:  farm list"
setvar $help~help[6] $help~tab&"  Usage:  farm clear"
setvar $help~help[7] $help~tab&"  Usage:  farm {options}"
setvar $help~help[8] $help~tab&"       "
setvar $help~help[9] $help~tab&"Modes:"
setvar $help~help[10] $help~tab&"       "
setvar $help~help[11] $help~tab&"   set - Adds sectors in the order entered into the farm set."
setvar $help~help[12] $help~tab&"   list - Lists all sectors in the farm set."
setvar $help~help[13] $help~tab&"   clear - Removes all sectors from the farm set."
setvar $help~help[14] $help~tab&"      "
setvar $help~help[15] $help~tab&"   Running farm with no options attempts to farm all products."
setvar $help~help[16] $help~tab&"   If you specify one or more options, only those will be farmed."
setvar $help~help[17] $help~tab&"       "
setvar $help~help[18] $help~tab&"       Product Options:"
setvar $help~help[19] $help~tab&"            {f}   - Farm fuel ore"
setvar $help~help[20] $help~tab&"            {o}   - Farm organics"
setvar $help~help[21] $help~tab&"            {e}   - Farm equipment"
setvar $help~help[22] $help~tab&"           {fc}   - Farm fuel ore colonists"
setvar $help~help[23] $help~tab&"           {oc}   - Farm organic colonists"
setvar $help~help[24] $help~tab&"           {ec}   - Farm equipment colonists"
setvar $help~help[25] $help~tab&"          {fig}   - Farm fighters"
setvar $help~help[26] $help~tab&"           {sh}   - Farm shields"
gosub :help~helpfile

#setvar $farmer_file $bot~folder&"/_"&gamename&"_FARMER.list"
loadvar $farmsectors

getwordpos $bot~user_command_line $pos "silent"
if ($pos > 0)
	setvar $silent true
else
	setvar $silent false
end

getwordpos $bot~parm1 $pos "clear"
if ($pos > 0)
	#delete $farmer_file
	#setvar $switchboard~message "Bot Farming File has been deleted.*"
	setvar $farmsectors ""
	savevar $farmsectors
	setvar $switchboard~message "Bot Farming Configuration has been cleared.*"
	gosub :switchboard~switchboard
	halt
end

getwordpos $bot~parm1 $pos "list"
if ($pos > 0)
	if ($farmsectors = "") or ($farmsectors = 0)
		setvar $switchboard~message "No sectors in farming list.*"
		gosub :switchboard~switchboard
		halt
	else
		setvar $switchboard~message "Farming List (In traveling order) *"&$farmsectors&"*"
		gosub :switchboard~switchboard
		halt
	end
end

getwordpos $bot~parm1 $pos "set"
if ($pos > 0)
	setvar $i 2
	setvar $newfarmlist ""
	setvar $sectorsadded 0
	setvar $check ""
	while ($check <> "%%%")
		getword $bot~user_command_line $check $i "%%%"
		if ($check <> "%%%")
			isnumber $test $check
			if ($test)
				if (($check > 0) and ($check <= sectors))
					if ($newfarmlist = "")
						setvar $newfarmlist $check
					else
						setvar $newfarmlist $newfarmlist&" "&$check
					end
					add $sectorsadded 1
				end
			end
		end
		add $i 1
	end
	if ($farmsectors = "") or ($farmsectors = 0)
		setvar $farmsectors $newfarmlist
	else
		setvar $farmsectors $farmsectors&" "&$newfarmlist
	end
	savevar $farmsectors
	setvar $switchboard~message ""&$sectorsadded&" Sectors added to Bot Farming Configuration.*"
	gosub :switchboard~switchboard
	halt
end

setvar $i 1
setarray $planets 3000
gosub :player~quikstats

if ($player~planet_scanner = "No")
	setvar $switchboard~message "Planet Farmer must be run with a planet scanner.*"
	gosub :switchboard~switchboard
	halt
end

if ($player~current_prompt <> "Citadel")
	setvar $switchboard~message "Planet Farmer must be run from the Citadel Prompt.*"
	gosub :switchboard~switchboard
	halt
end

if ($farmsectors = "") or ($farmsectors = 0)
	setvar $switchboard~message "No Farming Configuration, Please specify list.*"
	gosub :switchboard~switchboard
	halt
end

setvar $prodstofarm false

getwordpos " "&$bot~user_command_line&" " $pos " f "
if ($pos > 0)
	setvar $planet~emptyfuel true
	setvar $prodstofarm true
else
	setvar $planet~emptyfuel false
end

getwordpos " "&$bot~user_command_line&" " $pos " o "
if ($pos > 0)
	setvar $planet~emptyorganics true
	setvar $prodstofarm true
else
	setvar $planet~emptyorganics false
end

getwordpos " "&$bot~user_command_line&" " $pos " e "
if ($pos > 0)
	setvar $planet~emptyequipment true
	setvar $prodstofarm true
else
	setvar $planet~emptyequipment false
end

getwordpos " "&$bot~user_command_line&" " $pos " c1 "
getwordpos " "&$bot~user_command_line&" " $pos2 " fc "
if (($pos > 0) or ($pos2 > 0))
	setvar $planet~emptyfuelcolos true
	setvar $prodstofarm true
else
	setvar $planet~emptyfuelcolos false
end

getwordpos " "&$bot~user_command_line&" " $pos " c2 "
getwordpos " "&$bot~user_command_line&" " $pos2 " oc "
if (($pos > 0) or ($pos2 > 0))
	setvar $planet~emptyorgcolos true
	setvar $prodstofarm true
else
	setvar $planet~emptyorgcolos false
end

getwordpos " "&$bot~user_command_line&" " $pos " c3 "
getwordpos " "&$bot~user_command_line&" " $pos2 " ec "
if (($pos > 0) or ($pos2 > 0))
	setvar $planet~emptyequcolos true
	setvar $prodstofarm true
else
	setvar $planet~emptyequcolos false
end

getwordpos " "&$bot~user_command_line&" " $pos " fig "
getwordpos " "&$bot~user_command_line&" " $pos2 " figs "
if (($pos > 0) or ($pos2 > 0))
	setvar $planet~emptyfigs true
	setvar $prodstofarm true
else
	setvar $planet~emptyfigs false
end

getwordpos " "&$bot~user_command_line&" " $pos " sh "
if ($pos > 0)
	setvar $planet~emptyshields true
	setvar $prodstofarm true
else
	setvar $planet~emptyshields false
end

if ($prodstofarm = false)
	setvar $planet~emptyfuel true
	setvar $planet~emptyorganics true
	setvar $planet~emptyequipment true
	setvar $planet~emptyfuelcolos false
	setvar $planet~emptyorgcolos false
	setvar $planet~emptyequcolos false
	setvar $planet~emptyfigs true
	setvar $planet~emptyshields false
	setvar $prodstofarm true
end

setvar $sector sectors
setarray $sector sectors
setvar $i 1
:getfarmsector
getword $farmsectors $check $i
if ($check <> "") and ($check > 0)
	isnumber $test $check
	if ($test)
		if (($check > 0) and ($check <= sectors))
			setvar $sector[$i] $check
		end
	end
	add $i 1
	goto :getfarmsector
end
setvar $farmlistcount ($i - 1)

setvar $switchboard~message "Farm List Loaded, starting the farming!*"
gosub :switchboard~switchboard

logging off
send "q"
gosub :planet~getplanetinfo
send "c"
setvar $startinglocation $player~current_sector
setvar $planet~planettofill $planet~planet
setvar $startingprompt $player~current_prompt

:start
killalltriggers
setvar $i 0

:tryagain
add $i 1
while ($i <= $farmlistcount)
	:retryland
	gosub :player~currentprompt
	if ($player~current_prompt = "Command")
		setvar $planet~planet $planet~planettofill
		gosub :planet~landingsub
		if ($planet~sucessfulplanet = false)
			goto :endfarmer
		end
		gosub :player~currentprompt
	end
	if ($player~current_prompt = "Planet")
		send "c"
	end
	send "q"
	gosub :planet~getplanetinfo
	if ($planet~planet <> $planet~planettofill)
		send "qqq**"
		goto :retryland
	end
	send "c"
	setvar $planet~warpto $sector[$i]
	gosub :planet~pwarp
	if ($planet~pwarpsuccess = false)
		goto :tryagain
	end

	send "qqq**"
	gosub :planet~countplanets
	if ($planet~planetcount < 2)
		goto :tryagain
	end

	setvar $j 0
	:tryagain2
	add $j 1
	while ($j <= $planet~planetcount)
		:retryland2
		gosub :player~currentprompt
		if ($player~current_prompt = "Command")
			setvar $planet~planet $planet~planettofill
			gosub :planet~landingsub
			if ($planet~sucessfulplanet = false)
				goto :tryagain2
			end
		end
		gosub :player~currentprompt
		if ($player~current_prompt = "Citadel")
			send "q"
		end
		gosub :planet~getplanetinfo
		if ($planet~planet <> $planet~planettofill)
			send "qqq**"
			goto :retryland2
		end
		setvar $planet~planettostrip $planet~planets[$j]
		if ($planet~planettostrip <> $planet~planettofill)
			gosub :planet~stripplanet
		end
		add $j 1
	end

	if ($silent <> true)
		setvar $switchboard~message "Done farming sector " $sector[$i] ".*"
		gosub :switchboard~switchboard
	end

	:retryland3
	gosub :player~currentprompt
	if ($player~current_prompt = "Command")
		setvar $planet~planet $planet~planettofill
		gosub :planet~landingsub
		if ($planet~sucessfulplanet = false)
			goto :endfarmer
		end
		gosub :player~currentprompt
	end
	if ($player~current_prompt = "Citadel")
		send "q"
	end
	gosub :planet~getplanetinfo
	if ($planet~planet <> $planet~planettofill)
		send "qqq**"
		goto :retryland3
	end

	if (($planet~planet_organics > ($planet~planet_organics_max - 1000)) and ($planet~planet_equipment > ($planet~planet_equipment_max - 1000)))
		setvar $planetisfull true
		goto :endfarmer
	end
	add $i 1
end

:endfarmer
killalltriggers
logging on
gosub :player~currentprompt
if ($player~current_prompt = "Planet")
	send "c"
end
send "p "&$startinglocation&"  *ys* "
if ($planetisfull)
	setvar $switchboard~message "Farming Planet is full.  Ready to sell off the product!*"
	gosub :switchboard~switchboard
else
	setvar $switchboard~message "Farming run is complete.*"
	gosub :switchboard~switchboard
end
gosub :player~quikstats
if ($player~current_sector <> $startinglocation)
	setvar $switchboard~message "Could not make it back to starting sector!*"
	gosub :switchboard~switchboard
end
halt

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:discod
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
setvar $tagline "[Farmer]"
setvar $taglineb "[Farmer]"
killalltriggers
echo "**"&ansi_14&$taglineb&ansi_15&" Disconnected **"

:disco_test
if (connected <> true)
	setdelaytrigger emancipate_cpu :emancipate_cpu 3000
	echo "**"&ansi_14&$taglineb&ansi_15&" Auto Land & Resume Initiated - Awaiting Connection!**"
	pause

	:emancipate_cpu
	goto :disco_test
end
waitfor "(?="
setdelaytrigger waitingabit :waitingabit 3000
echo "**"&ansi_14&$taglineb&ansi_15&" Connected - Waiting For Command Prompt!**"
pause

:waitingabit
killalltriggers
gosub :player~quikstats
if ($player~current_prompt = "Command")
	send " L Z"&#8&$planet~planet&"*  *  J  C  *  "
	settextlinetrigger notlanded :notlanded "Are you sure you want to jettison all cargo?"
	settextlinetrigger landed :landed "<Enter Citadel>"
	setdelaytrigger testconn :testconn 3000
	pause

	:testconn
	killalltriggers
	if (connected = false)
		goto :disco_test
	else
		setvar $switchboard~message ""&$taglineb&" Problem Detected Unable to Land!*"
		gosub :switchboard~switchboard
		halt
	end

	:notlanded
	killalltriggers
	setvar $switchboard~message "Boton Unable To Land, Check my TA.*"
	gosub :switchboard~switchboard
	setvar $switchboard~message $taglineb&" - Unable To Land After Reconnect,Check My TA!**"
	gosub :switchboard~switchboard
	halt

	:landed
	killalltriggers
	setvar $switchboard~message $taglineb&" - Restarting!**"
	gosub :switchboard~switchboard
	waitfor "Message sent on sub-space channel"
	goto :start
elseif ($player~current_prompt = "Citadel")
	setvar $switchboard~message $taglineb&" - Restarting!**"
	gosub :switchboard~switchboard
	waitfor "Message sent on sub-space channel"
	goto :start
else
	send " p d 0* 0* 0* * *** * c q q q q q z 2 2 c q * z * *** * * '"&$taglineb&"Attempting to Reach Correct Prompt...*"
	settextlinetrigger emq_complete :emq_delay "Attempting to Reach Correct Prompt..."
	setdelaytrigger emq_delay :emq_delay 3000
	pause

	:emq_delay
	killalltriggers
	goto :disco_test
end

:setconnectiontriggers
killtrigger discod1
killtrigger discod2
seteventtrigger discod1 :discod "CONNECTION LOST"
seteventtrigger discod2 :discod "Connections have been temporarily disabled."

return

include "source\include\loadvars"
include "source\include\help"
include "source\include\player"
include "source\include\planet"
include "source\include\switchboard.ts"
