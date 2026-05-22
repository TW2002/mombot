logging off

gosub :loadvars~loadvars
gosub :help~initialize
setvar $help~help[1] $help~tab&"fillsector {fighters}"
setvar $help~help[2] $help~tab&""
setvar $help~help[3] $help~tab&"Buys fighters and adds them to the current sector."
setvar $help~help[4] $help~tab&"Must be started from Citadel with a known planet number."
setvar $help~help[5] $help~tab&"{fighters} - optional total fighters to buy"
setvar $help~help[6] $help~tab&"If omitted, keeps buying until credits run low."
gosub :help~helpfile
loadvar $map~stardock
loadvar $planet~planet
setvar $total 0
setvar $desired 0
gosub :player~quikstats
setvar $startinglocation $player~current_prompt

if ($startinglocation <> "Citadel")
	setvar $switchboard~message "Must start at Citadel.*"
	gosub :switchboard~switchboard
	halt
end
if ($planet~planet <= 0)
	setvar $switchboard~message "Unknown planet number. Display planet to bot so it can know the planet number.*"
	gosub :switchboard~switchboard
	halt
end
isnumber $isnumber $bot~parm1
if ($isnumber)
	if ($bot~parm1 > 0)
		setvar $buylimited true
		setvar $desired $bot~parm1
	end
end
setvar $continue true
while (($continue = true))
	send "'"&$switchboard~bot_name&" w*"
	waiton " credits taken from citadel."
	gosub :player~quikstats
	if ($player~credits < 1000)
		setvar $switchboard~message "Credits are under 1000.*"
		gosub :switchboard~switchboard
		setvar $continue false
	else
		setvar $bot~command "buy"
		setvar $bot~user_command_line " buy fig "&($desired-$total)
		setvar $bot~parm1 "fig"
		savevar $bot~parm1
		setvar $bot~parm2 ($desired-$total)
		savevar $bot~parm2
		setvar $bot~parm3 ""
		savevar $bot~parm3
		setvar $bot~parm4 ""
		savevar $bot~parm4
		setvar $bot~parm5 ""
		savevar $bot~parm5
		setvar $bot~parm6 ""
		savevar $bot~parm6
		savevar $bot~command
		savevar $bot~user_command_line
		load "scripts\"&$bot~mombot_directory&"\commands\resource\buy.cts"
		settextlinetrigger		buyadded		:buyadded " Fighters added on planet "&$planet~planet&"."
		settextlinetrigger		buynone			:buynone "No fighters able to be purchased"
		settextlinetrigger		buymaxed		:buymaxed "Fighters maxxed out on planet "&$planet~planet&"."
		seteventtrigger		buyended		:buyended "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\commands\resource\buy.cts"
		pause

		:buyadded
		killalltriggers
		getword currentline $added 4
		isnumber $isadded $added
		if ($isadded = false)
			getword currentline $added 1
			isnumber $isadded $added
			if ($isadded = false)
				setvar $added 0
			end
		end
		goto :afterbuy

		:buynone
		killalltriggers
		setvar $added 0
		setvar $continue false
		goto :afterbuy

		:buymaxed
		killalltriggers
		setvar $added 0
		setvar $continue false
		goto :afterbuy

		:buyended
		killalltriggers
		setvar $added 0
		setvar $continue false

		:afterbuy
		add $total $added
		if ($added <= 0)
			setvar $continue false
		else

			setvar $bot~command "movefig"
			setvar $bot~user_command_line " movefig s " & $added
			setvar $bot~parm1 "s"
			savevar $bot~parm1
			setvar $bot~parm2 $added
			savevar $bot~parm2
			savevar $bot~command
			savevar $bot~user_command_line
			setvar $command "movefig"
			setvar $user_command_line "s " & $added
			setvar $parm1 "s"
			setvar $parm2 $added
			savevar $command
			savevar $user_command_line
			savevar $parm1
			savevar $parm2
			load "scripts\"&$bot~mombot_directory&"\modes\resource\movefig.cts"
			seteventtrigger		moveended		:moveended "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\modes\resource\movefig.cts"
			pause

			:moveended
		end
	end
	if (($buylimited = true) and ($total >= $desired))
		setvar $continue false
	end
end
setvar $bot~command "dep"
setvar $bot~user_command_line " dep "
setvar $bot~parm1 ""
savevar $bot~parm1
savevar $bot~command
savevar $bot~user_command_line
load "scripts\"&$bot~mombot_directory&"\commands\general\dep.cts"
seteventtrigger		depended		:depended "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\commands\general\dep.cts"
pause

:depended
setvar $switchboard~message $total&" fighters purchased and added to sector.*"
gosub :switchboard~switchboard
halt

#INCLUDES:
include "source\include\player"
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
