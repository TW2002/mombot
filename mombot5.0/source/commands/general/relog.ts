gosub :loadvars~loadvars
gosub :help~initialize
loadvar $bot~username
loadvar $bot~letter
loadvar $bot~password
loadvar $bot~servername

setvar $bot~command "relog"
setvar $help~help[1] $help~tab&"relog"
setvar $help~help[2] $help~tab&"  - attempt to log the bot back into the game"
gosub :help~helpfile

:relog_attempt
loadvar $bot~dorelog
if ($bot~dorelog <> true)
	halt
end

if (connected)
	disconnect
end

killalltriggers
setdelaytrigger waitforrelogdelay :continuedoingrelog 500
pause

:continuedoingrelog
setvar $first_time true
setvar $relog~entered_game false
gosub :do_relog
if ($relog~entered_game = true)
	goto :alldone_relog
end

:enter
gosub :relog_freeze_trigger
killtrigger relog
killtrigger relog2
killtrigger firstpause
killtrigger timedwaitforrelogdelay
killtrigger showtoday
send "T*"
settexttrigger showtoday :continueshowtoday "Show today's log?"
setdelaytrigger timedwaitforrelogdelay :enter 500
setdelaytrigger unfreezingtrigger :relog_attempt 20000
pause

:continueshowtoday
killtrigger timedwaitforrelogdelay
gosub :relog_freeze_trigger
send "*"
settexttrigger pause2 :continuepause2 "[Pause]"
setdelaytrigger unfreezingtrigger :relog_attempt 20000
pause

:continuepause2
gosub :relog_freeze_trigger
send "*"
settexttrigger password :continuepassword "A password is required to enter this game."
setdelaytrigger unfreezingtrigger :relog_attempt 20000
pause

:continuepassword
gosub :relog_freeze_trigger
settextlinetrigger dead :dead "What do you want to name your ship? (30 letters)"
settexttrigger alive :alldone_relog "Command ["
settexttrigger aliveonplanet :alldone_relog "Planet command (?=help) [D]"
settexttrigger aliveincitadel :alldone_relog "Citadel command (?=help)"
settexttrigger avoids :continueavoids "Do you wish to clear some avoids? (Y/N) [N]"
settexttrigger messages :continuemessages "[Pause]"
settexttrigger delete :continuedelete "[Pause] - Delete messages? (Y/N)"
settexttrigger timed :timed_game_closed "Access to this game is limited.  Access modes are as follows:"
setdelaytrigger unfreezingtrigger :relog_attempt 20000
send $bot~password & "**  *  *  "
pause

:timed_game_closed
killalltriggers
waiton "Current time: "
gettext currentline&"[END]" $game_current_time ":" "[END]"
waiton "It will reopen at "
gettext currentline $game_open_time "It will reopen at " "."

splittext $game_current_time $current_time " "
splittext $game_open_time $open_time " "
splittext $current_time[1] $current_time_split ":"
splittext $open_time[1] $open_time_split ":"
# check if am and pm match #
setvar $foundtime false
setvar $current_hour $current_time_split[1]
setvar $open_hour $open_time_split[1]
setvar $current_minute $current_time_split[2]
setvar $open_minute $open_time_split[2]
lowercase $current_time[2]
lowercase $open_time[2]
if (($open_time[2] = "pm") and ($open_hour <> "12"))
	setvar $open_hour $open_hour+12
end
if (($current_time[2] = "pm") and ($current_hour <> "12"))
	setvar $current_hour $current_hour+12
end
setvar $hour_hand $current_hour
setvar $hours_difference 0
while ($hour_hand <> $open_hour)
	add $hours_difference 1
	add $hour_hand 1
	if ($hour_hand > 24)
		setvar $hour_hand 1
	end
end
setvar $minute_hand $current_minute
setvar $minute_difference 0
while ($minute_hand <> $open_minute)
	add $minute_difference 1
	add $minute_hand 1
	if ($minute_hand > 60)
		setvar $minute_hand 0
	end
end
if ($minute_difference > 60)
	setvar $minute_difference ($minute_difference-60)
else
	if ($minute_difference > 0)
		setvar $hours_difference ($hours_difference-1)
	end
end
setvar $minutes_until_game (($hours_difference*60)+$minute_difference)
if ($minutes_until_game > 2)
	killalltriggers
	disconnect
	setvar $timer 0
	settextouttrigger logearly :endlogoffgame #32
	setvar $timetologbackin (($minutes_until_game-2)*60)
	while ($timetologbackin > 0)
		gosub :calctime
		echo ansi_10 #27 & "[1A" & #27 & "[K" & $hours ":" $minutes ":" $seconds " left before entering game " game " (" gamename ") (2 minutes early)"&ansi_15&" ["&ansi_14&"Spacebar to relog"&ansi_15&"]*"
		setdelaytrigger timebeforerelog :relogtimer 1000
		pause

		:relogtimer
		setvar $timetologbackin $timetologbackin-1
	end

	:endlogoffgame
	killtrigger logearly
	killtrigger timebeforerelog
	goto :relog_attempt
else
	setdelaytrigger timedwaitforrelogdelay :enter 500
	setdelaytrigger unfreezingtrigger :relog_attempt 20000
	pause
end

:continuedelete
send "*  * "
pause

:continuemessages
send "  "
gosub :relog_freeze_trigger
settexttrigger messages :continuemessages "[Pause]"
setdelaytrigger unfreezingtrigger :relog_attempt 20000
pause

:continueavoids
send "* * "
pause

:dead
send "Mind ()ver Matter*y "
pause

:alldone_relog
killtrigger clearvoids
killtrigger novoids
killtrigger morepauses
killtrigger avoids
killtrigger messages
killtrigger alive
killtrigger aliveonplanet
killtrigger aliveincitadel
killtrigger delete
gosub :relog_freeze_trigger
killtrigger 1
setdelaytrigger 1 :didnotmakeittogame 10000
gosub :player~quikstats
killtrigger 1
setvar $relog~starting_prompt $player~current_prompt
if (($relog~starting_prompt <> "Planet") and ($relog~starting_prompt <> "Citadel"))
	send "Z*  *  Z*  Z   A 9999*  Z*  "
end
setvar $switchboard~message "Auto-relog activated*"
gosub :switchboard~switchboard
loadvar $bot~startmacro
if ($bot~startmacro <> "")
	halt
end

:continuerelogmessage
gosub :player~quikstats
gosub :relog_freeze_trigger
loadvar $planet~planet
loadvar $relog_nocitadel
if (($planet~planet <> 0) and ($player~current_prompt = "Command") and ($player~current_sector <> 1) and ($player~current_sector <> $map~stardock))
	gosub :planet~landingsub
end
if (($planet~successfulcitadel = true) and ($relog_nocitadel < 1))
	setvar $switchboard~message "In citadel, planet "&$planet~planet&".*"
	gosub :switchboard~switchboard
	halt
end
gosub :player~currentprompt
if ($player~current_prompt = "Citadel")
	goto :relog_send_message
end
if ($player~current_prompt = "Planet")
	gosub :planet~getplanetinfo
	if ($planet~citadel > 0) and ($relog_nocitadel < 1)
		send "c "
		setvar $switchboard~message "In citadel, planet "&$planet~planet&".*"
		gosub :switchboard~switchboard
		halt
	end
	setvar $switchboard~message "On planet "&$planet~planet&".*"
	gosub :switchboard~switchboard
	halt
end

:relog_send_message
loadvar $relog_message
if (($relog_message <> "") and ($relog_message <> "0"))
	setvar $switchboard~message $relog_message
	gosub :switchboard~switchboard
	setvar $relog_message ""
	savevar $relog_message
end
halt

:didnotmakeittogame
echo ansi_4&"*Didn't make it into the game!  Bot will try again in about 30 seconds.*"&ansi_15
halt
#============================== END ONLINE WATCH/RELOG SUB ==============================
:relog_freeze_trigger
killtrigger unfreezingtrigger
killtrigger unfreezingtriggerbigdelay
return

:do_relog
:thedelay
if (connected <> true)
	connect
end
gosub :killrelogtriggers
seteventtrigger continuelogin :continuelogin "CONNECTION ACCEPTED"
pause

:continuelogin
gosub :killrelogtriggers
settexttrigger relog3 :continuerelog3 "Please enter your name"
pause

:continuerelog3
gosub :killrelogtriggers
settexttrigger loginsuccessful :continuerelog4 "==-- "
settexttrigger loginsuccessful2 :continuerelog4 "Copyright (C) EIS"
settexttrigger loginsuccessful3 :continuerelog4 "OpenTW Server"
send $bot~servername & "*"
pause

:continuerelog4
gosub :killrelogtriggers
settexttrigger relog69 :continuerelog5 "Make a Selection:"
settexttrigger relog3 :continuerelog5 "Selection (? for menu):"
settexttrigger relog5 :continuerelog5 ": "
#send "#"&#8
pause

:continuerelog5
gosub :killrelogtriggers
settexttrigger firstpause :firstpause "[Pause]"
settexttrigger alive :done_do_relog "Command ["
settexttrigger aliveonplanet :done_do_relog "Planet command (?=help) [D]"
settexttrigger aliveincitadel :done_do_relog "Citadel command (?=help)"
settexttrigger enter :enter_game_menu "Enter your choice"
setdelaytrigger relogmenupromptcheck :relog_check_game_menu_prompt 100
send $bot~letter
pause

:relog_check_game_menu_prompt
setvar $relog~line currentline
getwordpos $relog~line $relog~pos "Command ["
if ($relog~pos > 0)
	goto :done_do_relog
end
getwordpos $relog~line $relog~pos "Planet command (?=help) [D]"
if ($relog~pos > 0)
	goto :done_do_relog
end
getwordpos $relog~line $relog~pos "Citadel command (?=help)"
if ($relog~pos > 0)
	goto :done_do_relog
end
getwordpos $relog~line $relog~pos "Enter your choice"
if ($relog~pos > 0)
	goto :enter_game_menu
end
setdelaytrigger relogmenupromptcheck :relog_check_game_menu_prompt 100
pause

:firstpause
send "*"
settexttrigger firstpause :firstpause "[Pause]"
pause

:enter_game_menu
gosub :killrelogtriggers
settexttrigger gamelogprompt :continue_relog_game_log "Show today's log?"
setdelaytrigger unfreezingtrigger :relog_attempt 20000
send "T*"
pause

:continue_relog_game_log
gosub :relog_freeze_trigger
killtrigger gamelogprompt
settexttrigger postgamepause :continue_relog_game_pause "[Pause]"
settexttrigger password :continuepassword "A password is required to enter this game."
settexttrigger alive :done_do_relog "Command ["
settexttrigger aliveonplanet :done_do_relog "Planet command (?=help) [D]"
settexttrigger aliveincitadel :done_do_relog "Citadel command (?=help)"
setdelaytrigger relogenteredcheck :relog_check_entered_game 100
send "*"
pause

:continue_relog_game_pause
gosub :relog_freeze_trigger
killtrigger relogenteredcheck
send "*"
settexttrigger postgamepause :continue_relog_game_pause "[Pause]"
settexttrigger password :continuepassword "A password is required to enter this game."
settexttrigger alive :done_do_relog "Command ["
settexttrigger aliveonplanet :done_do_relog "Planet command (?=help) [D]"
settexttrigger aliveincitadel :done_do_relog "Citadel command (?=help)"
setdelaytrigger relogenteredcheck :relog_check_entered_game 100
setdelaytrigger unfreezingtrigger :relog_attempt 20000
pause

:relog_check_entered_game
setvar $relog~line currentline
getwordpos $relog~line $relog~pos "Command ["
if ($relog~pos > 0)
	goto :done_do_relog
end
getwordpos $relog~line $relog~pos "Planet command (?=help) [D]"
if ($relog~pos > 0)
	goto :done_do_relog
end
getwordpos $relog~line $relog~pos "Citadel command (?=help)"
if ($relog~pos > 0)
	goto :done_do_relog
end
setdelaytrigger relogenteredcheck :relog_check_entered_game 100
pause

:done_do_relog
killalltriggers
setvar $relog~entered_game true
return

:killrelogtriggers
killtrigger continuelogin
killtrigger thedelay
killtrigger thedelay2
killtrigger relog
killtrigger relog2
killtrigger relog3
killtrigger relog69
killtrigger relog89
killtrigger loginsuccessful
killtrigger loginsuccessful2
killtrigger loginsuccessful3
killtrigger firstpause
killtrigger postgamepause
killtrigger password
killtrigger enter
killtrigger gamelogprompt
killtrigger relogmenupromptcheck
killtrigger relogenteredcheck
killtrigger alive
killtrigger aliveonplanet
killtrigger aliveincitadel
setdelaytrigger thedelay2 :relog_attempt 20000
return

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
include "source\include\map"
include "source\include\switchboard.ts"
