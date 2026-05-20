	gosub :LOADVARS~LOADVARS
	gosub :HELP~INITIALIZE
	loadvar $game~port_max

	setVar $HELP~HELP[1]   $HELP~TAB&"  deploy/put/lay/place {number} {type} {pers | corp} "
	setVar $HELP~HELP[2]   $HELP~TAB&"     "
	setVar $HELP~HELP[3]   $HELP~TAB&"  Command to replace old climp/plimp/mines/cmine/pmine "
	setVar $HELP~HELP[4]   $HELP~TAB&"  commands.  Old syntax still works but can also use new"
	setVar $HELP~HELP[5]   $HELP~TAB&"  options"
	setVar $HELP~HELP[6]   $HELP~TAB&"     "
	setVar $HELP~HELP[7]   $HELP~TAB&"   [topoff] - will fill ship up with fighters from sector "
	setVar $HELP~HELP[8]   $HELP~TAB&"              Example:"
	setVar $HELP~HELP[9]   $HELP~TAB&"                    >topoff"
	setVar $HELP~HELP[10]  $HELP~TAB&"     "
	setVar $HELP~HELP[11]  $HELP~TAB&"   [plimp | climp | cmine | pmine] - drops mines (default 1)"
	setVar $HELP~HELP[12]  $HELP~TAB&"              Examples: "
	setVar $HELP~HELP[13]  $HELP~TAB&"                    >plimp "
	setVar $HELP~HELP[14]  $HELP~TAB&"                    >place 100 limp"
	setVar $HELP~HELP[15]  $HELP~TAB&"                    >put p limp"
	setVar $HELP~HELP[16]  $HELP~TAB&"                    >lay 250 corp mine"
	setVar $HELP~HELP[17]  $HELP~TAB&"                    >deploy l p "
	setVar $HELP~HELP[18]  $HELP~TAB&"                    >plimp 3 "
	setVar $HELP~HELP[19]  $HELP~TAB&"      "
	setVar $HELP~HELP[20]  $HELP~TAB&"    [mines] - drops both mine types (default 3) "
	setVar $HELP~HELP[21]  $HELP~TAB&"              Examples:   "
	setVar $HELP~HELP[22]  $HELP~TAB&"                    >lay 250 mines"
	setVar $HELP~HELP[23]  $HELP~TAB&"                    >mines"
	setVar $HELP~HELP[24]  $HELP~TAB&"   "
	setVar $HELP~HELP[25]  $HELP~TAB&"   [deploy] - puts fighter into sector (default)"
	setVar $HELP~HELP[26]  $HELP~TAB&"              Examples: "
	setVar $HELP~HELP[27]  $HELP~TAB&"                    >deploy 10000 figs"
	setVar $HELP~HELP[28]  $HELP~TAB&"                    >deploy 100000"
	setVar $HELP~HELP[29]  $HELP~TAB&"                    >put 100 personal"
	gosub :HELP~HELPFILE

	setVar $bot~bot_name $SWITCHBOARD~bot_name
	
	gosub :PLAYER~quikstats
	setVar $startingLocation $PLAYER~CURRENT_PROMPT
	setVar $bot~startingLocation $PLAYER~CURRENT_PROMPT
	if (($startingLocation <> "Citadel") AND ($startingLocation <> "Command"))
		setVar $SWITCHBOARD~message "You must run deploy from command or citadel prompt.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	loadVar $planet~planet
	
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

	isNumber $isnumber $bot~parm1
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
		if ((CURRENTSECTOR > 0) AND (CURRENTSECTOR <= SECTORS))
			setVar $type SECTOR.FIGS.TYPE[CURRENTSECTOR]
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
			gosub :TOPOFF
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
		gosub :mines~deployLimp
	elseif ($armid)
		setvar $mines~personal $personal
		setvar $mines~amount $deploy_amount
		gosub :mines~deployArmid
	end

:TOPOFF
killalltriggers
gosub  :player~currentPrompt
setVar $bot~startingLocation $PLAYER~current_prompt
setVar $bot~validPrompts "Citadel Command"
gosub :PLAYER~CHECKSTARTINGPROMPT
if ($bot~startingLocation = "Citadel")
	send " q "
	gosub :PLANET~getPlanetInfo
	send " q "
end
if ($bot~parm1 <> "o") AND ($bot~parm1 <> "t") AND ($bot~parm1 <> "d")
	setVar $type "d"
	isNumber $test CURRENTSECTOR
	if ($test = TRUE)
		if ((CURRENTSECTOR > 0) AND (CURRENTSECTOR <= SECTORS))
			setVar $type SECTOR.FIGS.TYPE[CURRENTSECTOR]
			if ($type = "Offensive")
				setVar $type "o"
			elseif ($type = "Defensive")
				setVar $type "d"
			elseif ($type = "Toll")
				setVar $type "t"
			else
				setVar $type "d"
			end
		end
	end
	setVar $bot~parm1 $type
end
setVar $to_drop $bot~parm1
gosub :DO_TOPOFF
if ($bot~startingLocation = "Citadel")
	gosub :PLANET~landingSub
end
setVar $SWITCHBOARD~message "TopOff complete Left "&$ftrs_to_leave&" fighters.*"
gosub :SWITCHBOARD~switchboard
return

:DO_TOPOFF
	:DO_TOPOFF_AGAIN
	killalltriggers
	send " F"
	waitOn "Your ship can support up to"
	getWord CURRENTLINE $ftrs_to_leave 10
	stripText $ftrs_to_leave ","
	stripText $ftrs_to_leave " "
	if ($ftrs_to_leave < 1)
		setVar $ftrs_to_leave 1
	end
	send " " & $ftrs_to_leave & " * C " & $to_drop
	setTextLineTrigger DEPLOY_TOPOFF_SUCCESS :TOPOFF_SUCCESS "Done. You have "
	setTextLineTrigger DEPLOY_TOPOFF_FAILURE1 :DO_TOPOFF_AGAIN "You don't have that many fighters available."
	setTextLineTrigger DEPLOY_TOPOFF_FAILURE2 :DO_TOPOFF_AGAIN "Too many fighters in your fleet!  You are limited to"
	pause
	:TOPOFF_SUCCESS
return

halt

#INCLUDES:
include "source\include\loadvars"
include "source\include\mines"
include "source\include\fighters"
include "source\include\help"
include "source\include\switchboard.ts"
