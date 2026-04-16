logging off

gosub :BOT~loadVars
setVar $BOT~help[1] $BOT~tab&"fillsector {fighters}"
setVar $BOT~help[2] $BOT~tab&""
setVar $BOT~help[3] $BOT~tab&"Buys fighters and adds them to the current sector."
setVar $BOT~help[4] $BOT~tab&"Must be started from Citadel with a known planet number."
setVar $BOT~help[5] $BOT~tab&"{fighters} - optional total fighters to buy"
setVar $BOT~help[6] $BOT~tab&"If omitted, keeps buying until credits run low."
gosub :BOT~helpfile
loadVar $MAP~STARDOCK
loadVar $planet~planet
setVar $total 0
setVar $desired 0
gosub :player~quikstats
setVar $startingLocation $player~CURRENT_PROMPT

if ($startingLocation <> "Citadel")
		setvar $switchboard~message "Must start at Citadel.*"
		gosub :switchboard~switchboard
		halt
end
if ($planet~planet <= 0)
		setvar $switchboard~message "Unknown planet number. Display planet to bot so it can know the planet number.*"
		gosub :switchboard~switchboard
		halt
end
isNumber $isNumber $bot~parm1
if ($isNumber)
	if ($bot~parm1 > 0)
		setVar $buyLimited TRUE
		setVar $desired $bot~parm1
	end
end
setVar $continue TRUE
while (($continue = TRUE))
	send "'"&$switchboard~bot_name&" w*"
	waitOn " credits taken from citadel."
	gosub :player~quikstats
	if ($player~CREDITS < 1000)
			setvar $switchboard~message "Credits are under 1000.*"
			gosub :switchboard~switchboard
			setVar $continue FALSE
	else
		setvar $bot~command "buy"
		setVar $BOT~user_command_line " buy fig "&($desired-$total)
		setVar $BOT~parm1 "fig"
		saveVar $BOT~parm1
		setVar $BOT~parm2 ($desired-$total)
		saveVar $BOT~parm2
		setVar $BOT~parm3 ""
		saveVar $BOT~parm3
		setVar $BOT~parm4 ""
		saveVar $BOT~parm4
		setVar $BOT~parm5 ""
		saveVar $BOT~parm5
		setVar $BOT~parm6 ""
		saveVar $BOT~parm6
		saveVar $BOT~command
		saveVar $BOT~user_command_line
		load "scripts\"&$bot~mombot_directory&"\commands\resource\buy.cts"
		setTextLineTrigger		buyadded		:buyadded " Fighters added on planet "&$planet~planet&"."
		setTextLineTrigger		buynone			:buynone "No fighters able to be purchased"
		setTextLineTrigger		buymaxed		:buymaxed "Fighters maxxed out on planet "&$planet~planet&"."
		setEventTrigger		buyended		:buyended "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\commands\resource\buy.cts"
		pause
		:buyadded
		killalltriggers
		getWord CURRENTLINE $added 4
		isNumber $isAdded $added
		if ($isAdded = FALSE)
			getWord CURRENTLINE $added 1
			isNumber $isAdded $added
			if ($isAdded = FALSE)
				setVar $added 0
			end
		end
		goto :afterbuy
		:buynone
		killalltriggers
		setVar $added 0
		setVar $continue FALSE
		goto :afterbuy
		:buymaxed
		killalltriggers
		setVar $added 0
		setVar $continue FALSE
		goto :afterbuy
		:buyended
		killalltriggers
		setVar $added 0
		setVar $continue FALSE
		:afterbuy
		add $total $added
		if ($added <= 0)
			setVar $continue FALSE
		else

			setvar $bot~command "movefig"
			setVar $BOT~user_command_line " movefig s " & $added
			setVar $BOT~parm1 "s"
			saveVar $BOT~parm1
			setVar $BOT~parm2 $added
			saveVar $BOT~parm2
			saveVar $BOT~command
			saveVar $BOT~user_command_line
			setVar $COMMAND "movefig"
			setVar $USER_COMMAND_LINE "s " & $added
			setVar $PARM1 "s"
			setVar $PARM2 $added
			saveVar $COMMAND
			saveVar $USER_COMMAND_LINE
			saveVar $PARM1
			saveVar $PARM2
			load "scripts\"&$bot~mombot_directory&"\modes\resource\movefig.cts"
			setEventTrigger		moveended		:moveended "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\modes\resource\movefig.cts"
			pause
			:moveended

		end
	end
	if (($buyLimited = TRUE) AND ($total >= $desired))
		setVar $continue FALSE
	end
end
setvar $bot~command "dep"
setVar $BOT~user_command_line " dep "
setVar $BOT~parm1 ""
saveVar $BOT~parm1
saveVar $BOT~command
saveVar $BOT~user_command_line
load "scripts\"&$bot~mombot_directory&"\commands\general\dep.cts"
setEventTrigger		depended		:depended "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\commands\general\dep.cts"
pause
:depended
	setvar $switchboard~message $total&" fighters purchased and added to sector.*"
	gosub :switchboard~switchboard
	halt

#INCLUDES:
include "source\include\bot"
include "source\include\player"
