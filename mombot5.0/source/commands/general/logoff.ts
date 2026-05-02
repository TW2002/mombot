	gosub :BOT~loadVars

	setVar $BOT~help[1] $BOT~tab&"logoff {minutes} {cloak}"
	setVar $BOT~help[2] $BOT~tab&"  - logs off now and optionally relogs after a timer"
	setVar $BOT~help[3] $BOT~tab&"logout {minutes} {cloak}"
	setVar $BOT~help[4] $BOT~tab&"  - alias for logoff"
	setVar $BOT~help[5] $BOT~tab&"Examples:"
	setVar $BOT~help[6] $BOT~tab&"  >logoff        - log off until manually restarted"
	setVar $BOT~help[7] $BOT~tab&"  >logoff 10     - log off and relog in 10 minutes"
	setVar $BOT~help[8] $BOT~tab&"  >logout cloak  - cloak and log off until manually restarted"
	setVar $BOT~help[9] $BOT~tab&"  >logoff 30 cloak - cloak out and relog in 30 minutes"
	gosub :BOT~helpfile

	if (($BOT~parm1 = "?") or ($BOT~parm1 = "help"))
		halt
	end

:logoff
:logout
	killalltriggers
	gosub :PLAYER~quikstats
	setVar $startingLocation $PLAYER~CURRENT_PROMPT
	setVar $quittingWithNoTimer FALSE
	isNumber $test $BOT~parm1

	if ($startingLocation = "Citadel")
		send "q "
		gosub :PLANET~getPlanetInfo
		send "c "
	end
	if ($test = FALSE)
		setVar $quittingWithNoTimer TRUE
	elseif (($BOT~parm1 <= 0) OR ($BOT~parm1 = "cloak"))
		setVar $quittingWithNoTimer TRUE
	else
		setVar $timeToLogBackIn ($BOT~parm1*60)
		gosub :calcTime
	end
	setVar $cloakingOut FALSE
	getWordPos " "&$BOT~user_command_line&" " $pos " cloak "
	if ($pos > 0)
		setVar $cloakingOut TRUE
	end
	if (($cloakingOut = TRUE) AND ($PLAYER~CLOAKS > 0))
		if ($quittingWithNoTimer)
			send "'{" $SWITCHBOARD~bot_name "} - Logging and cloaking out until I am at keys to login again.*"
		else
			send "'{" $SWITCHBOARD~bot_name "} - Logging and cloaking out for "&$hours&" hours, "&$minutes&" minutes, and "&$seconds&" seconds.*"
		end
		send "q q q q  * * * * q q q q y y x *"
		waitOn "==-- Trade Wars 2002 --=="
	else
		if ($quittingWithNoTimer)
			send "'{" $SWITCHBOARD~bot_name "} - Logging out until I am at keys to login again.*"
		else
			send "'{" $SWITCHBOARD~bot_name "} - Logging out for "&$hours&" hours, "&$minutes&" minutes, and "&$seconds&" seconds.*"
		end
		if ($startingLocation = "Citadel")
			send "ryy* x *##"
			waitOn "Game Server"
		else
			send "q q q q  * * * * q q q q y*"
			waitOn "==-- Trade Wars 2002 --=="
		end
	end
	disconnect
	setVar $timer 0
	if ($quittingWithNoTimer)
		setvar $bot~do_not_resuscitate true
		savevar $bot~do_not_resuscitate
		halt
	end
	setTextOutTrigger logearly :endLogoffGame #32
	while ($timeToLogBackIn > 0)
		gosub :calcTime
		echo ANSI_10 #27 & "[1A" & #27 & "[K" & $hours ":" $minutes ":" $seconds " left before entering game " GAME " (" GAMENAME ") "&ANSI_15&" ["&ANSI_14&"Spacebar to relog"&ANSI_15&"]*"
		setDelayTrigger timeBeforeRelog :relogTimer 1000
		pause
		:relogTimer
			setVar $timeToLogBackIn $timeToLogBackIn-1
	end
:endLogoffGame
	killtrigger logearly
	killtrigger timeBeforeRelog
	goto :launch_relog

:launch_relog
	setVar $BOT~command "relog"
	setVar $BOT~user_command_line "relog"
	saveVar $BOT~command
	saveVar $BOT~user_command_line
	load "scripts\"&$bot~mombot_directory&"\commands\general\relog.cts"
	halt

:calcTime
	setVar $hours 0
	setVar $minutes 0
	setVar $seconds 0
	setVar $testTime $timeToLogBackIn
	if ($testTime >= 3600)
		setVar $hours ($testTime/3600)
		setVar $testTime $testTime-($hours*3600)
	end
	if ($testTime >= 60)
		setVar $minutes ($testTime/60)
		setVar $testTime $testTime-($minutes*60)
	end
	if ($testTime >= 1)
		setVar $seconds $testTime
	end
	if ($hours < 10)
		setVar $hours "0"&$hours
	end
	if ($minutes < 10)
		setVar $minutes "0"&$minutes
	end
	if ($seconds < 10)
		setVar $seconds "0"&$seconds
	end
return

#INCLUDES:
include "source\include\bot"
