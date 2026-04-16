systemscript


	gosub :BOT~loadVars
	setVar $BOT~help[1]  $BOT~tab&"Does bot command at certain time "
	setVar $BOT~help[2]  $BOT~tab&"      "
	setVar $BOT~help[3]  $BOT~tab&"  at [time] [bot command]"
	setVar $BOT~help[4]  $BOT~tab&"         "
	setVar $BOT~help[5]  $BOT~tab&"  Options: "
	setVar $BOT~help[6]  $BOT~tab&"            {time} - time to do command each day"
	setVar $BOT~help[7]  $BOT~tab&"     {bot command} - bot command to run, parameters and all"
	setVar $BOT~help[8]  $BOT~tab&"           {clear} - clears all commands"
	setVar $BOT~help[9]  $BOT~tab&"               "
	setVar $BOT~help[10]  $BOT~tab&"                     example: 5:30:00 PM"
	setVar $BOT~help[11] $BOT~tab&"     The time is on your machine, not the game server"
	gosub :bot~helpfile


	loadVar $bot~bot_name
	loadVar $bot~parm1
	loadVar $bot~user_command_line
	loadvar $bot~timer_file

	if ($bot~parm1 = "clear")
		delete $bot~timer_file
		setvar $switchboard~message "Timer file for this game has been cleared.*"
		gosub :switchboard~switchboard
		halt
	end





	getLength $bot~parm1 $length
	getWordPos $bot~user_command_line $pos $bot~parm1
	
	
	if (($bot~parm2 <> "pm") and ($bot~parm2 <> "am"))
		send "'{"&$bot~bot_name&"} - Time must be entered in system format.*"
		goto :just_loaded_timers
	end

    fileExists $exists $bot~timer_file
    if ($exists)
		readToArray $bot~timer_file $timer_array
		setvar $i 1
		setvar $isfound false
		while (($i <= $timer_array) and ($isfound <> true))
			if ($bot~user_command_line = $timer_array[$i])
				setvar $isfound true
			end
			add $i 1
		end		
    end
    if ($isfound <> true)
    	uppercase $bot~user_command_line
		write $bot~timer_file $bot~user_command_line
	end


	:just_loaded_timers

	setvar $saved_timers false
    fileExists $exists $bot~timer_file
    if ($exists)
        readToArray $bot~timer_file $timer_array
        if ($timer_array > 0)
        	setvar $saved_timers true
        end
    end

	:settimer
	setvar $i 1
	while ($i <= $timer_array)
		killtrigger $i&"timer"
		add $i 1
	end
	setvar $i 1
	setvar $switchboard~self_command 2
	setvar $switchboard~message ""
	while ($i <= $timer_array)
		gosub :strip_time_line
		setEventTrigger $i&"timer" :continue "TIME HIT" $time&" "&$ampm
		setvar $switchboard~message $switchboard~message&"At "&$time&" "&$ampm&", I will be running this command: "&$bot_command&"*"
		add $i 1
	end
	gosub :switchboard~switchboard

	pause


	:continue
	setvar $time_hit TIME
	setvar $i 1
	setvar $isfound false
	while (($i <= $timer_array) and ($isfound <> true))
		getwordpos $timer_array[$i] $pos $time_hit
		
		if ($pos > 0)
			setvar $isfound true
			gosub :strip_time_line
			send "'"&$bot~bot_name&" "&$bot_command&"*"
		end
		add $i 1
	end
	goto :settimer

halt 

:strip_time_line
	getword $timer_array[$i] $time 1
	getword $timer_array[$i] $ampm 2
	uppercase $ampm
	getLength $time $length
	getWordPos $timer_array[$i] $pos $time	
	cutText $timer_array[$i] $bot_command ($pos + $length + 3) 9999
	lowercase $bot_command
return

#INCLUDES:
include "source\include\bot"
