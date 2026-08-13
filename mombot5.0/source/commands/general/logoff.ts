gosub :loadvars~loadvars
gosub :help~initialize

setvar $help~help[1] $help~tab&"logoff {minutes} {cloak}"
setvar $help~help[2] $help~tab&"  - logs off now and optionally relogs after a timer"
setvar $help~help[3] $help~tab&"logout {minutes} {cloak}"
setvar $help~help[4] $help~tab&"  - alias for logoff"
setvar $help~help[5] $help~tab&"Examples:"
setvar $help~help[6] $help~tab&"  >logoff        - log off until manually restarted"
setvar $help~help[7] $help~tab&"  >logoff 10     - log off and relog in 10 minutes"
setvar $help~help[8] $help~tab&"  >logout cloak  - cloak and log off until manually restarted"
setvar $help~help[9] $help~tab&"  >logoff 30 cloak - cloak out and relog in 30 minutes"
gosub :help~helpfile

if (($bot~parm1 = "?") or ($bot~parm1 = "help"))
	halt
end

:logoff
:logout
killalltriggers
gosub :player~quikstats
setvar $startinglocation $player~current_prompt
setvar $quittingwithnotimer false
isnumber $test $bot~parm1

if ($startinglocation = "Citadel")
	send "q "
	gosub :planet~getplanetinfo
	send "c "
end
if ($test = false)
	setvar $quittingwithnotimer true
elseif (($bot~parm1 <= 0) or ($bot~parm1 = "cloak"))
	setvar $quittingwithnotimer true
else
	setvar $timetologbackin ($bot~parm1*60)
	gosub :calctime
end
setvar $cloakingout false
getwordpos " "&$bot~user_command_line&" " $pos " cloak "
if ($pos > 0)
	setvar $cloakingout true
end
if ($quittingwithnotimer)
	setvar $bot~do_not_resuscitate true
	savevar $bot~do_not_resuscitate
	setvar $bot~dorelog false
	savevar $bot~dorelog
end
if (($cloakingout = true) and ($player~cloaks > 0))
	if ($quittingwithnotimer)
		setvar $switchboard~message "Logging and cloaking out until I am at keys to login again.*"
		gosub :switchboard~switchboard
	else
		setvar $switchboard~message "Logging and cloaking out for "&$hours&" hours, "&$minutes&" minutes, and "&$seconds&" seconds.*"
		gosub :switchboard~switchboard
	end
	send "q q q q  * * * * q q q q y y x *"
	waiton "==-- "
else
	if ($quittingwithnotimer)
		setvar $switchboard~message "Logging out until I am at keys to login again.*"
		gosub :switchboard~switchboard
	else
		setvar $switchboard~message "Logging out for "&$hours&" hours, "&$minutes&" minutes, and "&$seconds&" seconds.*"
		gosub :switchboard~switchboard
	end
	if ($startinglocation = "Citadel")
		send "ryy* x *##"
		waiton "Game Server"
	else
		send "q q q q  * * * * q q q q y*"
		waiton "==-- "
	end
end
disconnect
setvar $timer 0
if ($quittingwithnotimer)
	halt
end
settextouttrigger logearly :endlogoffgame #32
while ($timetologbackin > 0)
	gosub :calctime
	echo ansi_10 #27 & "[1A" & #27 & "[K" & $hours ":" $minutes ":" $seconds " left before entering game " game " (" gamename ") "&ansi_15&" ["&ansi_14&"Spacebar to relog"&ansi_15&"]*"
	setdelaytrigger timebeforerelog :relogtimer 1000
	pause

	:relogtimer
	setvar $timetologbackin $timetologbackin-1
end

:endlogoffgame
killtrigger logearly
killtrigger timebeforerelog
goto :launch_relog

:launch_relog
setvar $bot~command "relog"
setvar $bot~user_command_line "relog"
savevar $bot~command
savevar $bot~user_command_line
load "scripts\"&$bot~mombot_directory&"\commands\general\relog.cts"
halt

:calctime
setvar $hours 0
setvar $minutes 0
setvar $seconds 0
setvar $testtime $timetologbackin
if ($testtime >= 3600)
	setvar $hours ($testtime/3600)
	setvar $testtime $testtime-($hours*3600)
end
if ($testtime >= 60)
	setvar $minutes ($testtime/60)
	setvar $testtime $testtime-($minutes*60)
end
if ($testtime >= 1)
	setvar $seconds $testtime
end
if ($hours < 10)
	setvar $hours "0"&$hours
end
if ($minutes < 10)
	setvar $minutes "0"&$minutes
end
if ($seconds < 10)
	setvar $seconds "0"&$seconds
end
return

#INCLUDES:
include "source\include\loadvars"
include "source\include\help"
include "source\include\planet"
include "source\include\switchboard.ts"
