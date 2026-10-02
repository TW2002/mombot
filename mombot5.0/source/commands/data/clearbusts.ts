logging off
gosub :help~initialize
setvar $help~help[1] $help~tab&"clearbusts"
setvar $help~help[2] $help~tab&"  - Clears busts at least the configured number of server days old."
setvar $help~help[3] $help~tab&"  - Undated busts are left alone."
gosub :help~helpfile

:clearbusts
loadvar $game~clear_bust_days
isnumber $valid_days $game~clear_bust_days
if (($valid_days = 0) or ($game~clear_bust_days < 1) or ($game~clear_bust_days > 365))
	setvar $switchboard~message "Bust age setting is missing or invalid; no busts were cleared.*"
	gosub :switchboard~switchboard
	halt
end

gosub :player~currentprompt
if (($player~current_prompt <> "Command") and ($player~current_prompt <> "Citadel"))
	setvar $switchboard~message "Run clearbusts from Command or Citadel; no busts were cleared.*"
	gosub :switchboard~switchboard
	halt
end

settextlinetrigger serverclock_am :serverclock " AM "
settextlinetrigger serverclock_pm :serverclock " PM "
send "ct"
pause

:serverclock
killtrigger serverclock_am
killtrigger serverclock_pm
setvar $serverclock_line currentline
send "q"
if ($player~current_prompt = "Citadel")
	swaiton "Citadel command"
else
	swaiton "Command [TL"
end

getword $serverclock_line $server_time 1
getword $serverclock_line $server_ampm 2
getword $serverclock_line $server_month_name 4
getword $serverclock_line $server_day 5
striptext $server_day ","
cuttext $server_time $server_hour 1 2
cuttext $server_time $server_minute 4 2
cuttext $server_time $server_second 7 2
isnumber $valid_time $server_hour
if ($valid_time = 0)
	goto :badserverclock
end
isnumber $valid_time $server_minute
if ($valid_time = 0)
	goto :badserverclock
end
isnumber $valid_time $server_second
if ($valid_time = 0)
	goto :badserverclock
end
isnumber $valid_time $server_day
if (($valid_time = 0) or ($server_hour < 1) or ($server_hour > 12) or ($server_minute > 59) or ($server_second > 59))
	goto :badserverclock
end
if ($server_ampm = "PM")
	if ($server_hour < 12)
		add $server_hour 12
	end
elseif ($server_ampm = "AM")
	if ($server_hour = 12)
		setvar $server_hour 0
	end
else
	goto :badserverclock
end
setvar $server_seconds (($server_hour * 3600) + ($server_minute * 60) + $server_second)

setvar $month_names "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec"
setvar $server_month 0
setvar $month_index 1
while ($month_index <= 12)
	getword $month_names $test_month $month_index
	if ($test_month = $server_month_name)
		setvar $server_month $month_index
		setvar $month_index 13
	else
		add $month_index 1
	end
end
if ($server_month = 0)
	goto :badserverclock
end

getdatetime $local_now
datetimetostr $local_date $local_now "yyyy-MM-dd"
datetimetostr $local_time $local_now "HH:mm:ss"
setvar $datevalue_text $local_date
gosub :datevalue
if ($datevalue_valid <> true)
	goto :badserverclock
end
setvar $local_day $datevalue_value
cuttext $local_date $local_year 1 4
cuttext $local_date $local_month 6 2
if (($local_month = 12) and ($server_month = 1))
	add $local_year 1
elseif (($local_month = 1) and ($server_month = 12))
	subtract $local_year 1
end
if ($server_month < 10)
	setvar $server_month_text "0"&$server_month
else
	setvar $server_month_text $server_month
end
getlength $server_day $server_day_length
if ($server_day_length = 1)
	setvar $server_day_text "0"&$server_day
else
	setvar $server_day_text $server_day
end
setvar $server_date $local_year&"-"&$server_month_text&"-"&$server_day_text
setvar $datevalue_text $server_date
gosub :datevalue
if ($datevalue_valid <> true)
	goto :badserverclock
end
setvar $server_today $datevalue_value
setvar $day_difference ($server_today - $local_day)
if (($day_difference < -1) or ($day_difference > 1))
	goto :badserverclock
end
cuttext $local_time $local_hour 1 2
cuttext $local_time $local_minute 4 2
cuttext $local_time $local_second 7 2
setvar $local_seconds (($local_hour * 3600) + ($local_minute * 60) + $local_second)
setvar $clock_delta (($day_difference * 86400) + $server_seconds - $local_seconds)
if (($clock_delta < -86400) or ($clock_delta > 86400))
	goto :badserverclock
end

setvar $cutoff_day ($server_today - $game~clear_bust_days)
setvar $kept_busts 0
setvar $undated_busts 0
setvar $cleared_busts 0
setvar $i 11
while ($i <= sectors)
	getsectorparameter $i "BUSTED" $busted
	gosub :normalizebusted
	if ($busted <> 0)
		getsectorparameter $i "BUSTDATE" $bustdate
		if (($bustdate <> "") and ($bustdate <> 0))
			setvar $datevalue_text $bustdate
			gosub :datevalue
			setvar $bust_server_day $datevalue_value
			# BUSTDATE is a client-local date, not a timestamp; an ahead server may be one day later.
			if ($clock_delta > 0)
				add $bust_server_day 1
			end
			if (($datevalue_valid = true) and ($bust_server_day <= $cutoff_day))
				setsectorparameter $i "BUSTED" ""
				setsectorparameter $i "FAKEBUST" ""
				setsectorparameter $i "BUSTDATE" ""
				add $cleared_busts 1
			else
				add $kept_busts 1
			end
		else
			add $undated_busts 1
		end
	end
	add $i 1
end
setvar $switchboard~message "Busts "&$game~clear_bust_days&"+ days old on server date "&$server_date&" (clock offset "&$clock_delta&"s): "&$cleared_busts&" cleared, "&$kept_busts&" kept, "&$undated_busts&" undated left alone.*"
gosub :switchboard~switchboard
halt

:badserverclock
setvar $switchboard~message "Could not verify server time from CTQ; no busts were cleared.*"
gosub :switchboard~switchboard
halt

:normalizebusted
if ($busted = true)
	setvar $busted 1
elseif ($busted = "TRUE")
	setvar $busted 1
elseif ($busted = "YES")
	setvar $busted 1
else
	isnumber $busted_isnum $busted
	if ($busted_isnum = 0)
		setvar $busted 0
	end
end
return

:datevalue
setvar $datevalue_valid false
setvar $datevalue_value 0
cuttext $datevalue_text $datevalue_year 1 4
cuttext $datevalue_text $datevalue_month 6 2
cuttext $datevalue_text $datevalue_day 9 2
cuttext $datevalue_month $datevalue_first 1 1
if ($datevalue_first = "0")
	cuttext $datevalue_month $datevalue_month 2 1
end
cuttext $datevalue_day $datevalue_first 1 1
if ($datevalue_first = "0")
	cuttext $datevalue_day $datevalue_day 2 1
end
isnumber $datevalue_isnum $datevalue_year
if ($datevalue_isnum = 0)
	return
end
isnumber $datevalue_isnum $datevalue_month
if ($datevalue_isnum = 0)
	return
end
isnumber $datevalue_isnum $datevalue_day
if ($datevalue_isnum = 0)
	return
end
if (($datevalue_year < 1900) or ($datevalue_month < 1) or ($datevalue_month > 12) or ($datevalue_day < 1) or ($datevalue_day > 31))
	return
end
setvar $datevalue_previous_year ($datevalue_year - 1)
setvar $datevalue_leaps4 $datevalue_previous_year
divide $datevalue_leaps4 4
setvar $datevalue_leaps100 $datevalue_previous_year
divide $datevalue_leaps100 100
setvar $datevalue_leaps400 $datevalue_previous_year
divide $datevalue_leaps400 400
setvar $datevalue_value (($datevalue_previous_year * 365) + $datevalue_leaps4 - $datevalue_leaps100 + $datevalue_leaps400)
if ($datevalue_month = 1)
	add $datevalue_value $datevalue_day
elseif ($datevalue_month = 2)
	add $datevalue_value (31 + $datevalue_day)
elseif ($datevalue_month = 3)
	add $datevalue_value (59 + $datevalue_day)
elseif ($datevalue_month = 4)
	add $datevalue_value (90 + $datevalue_day)
elseif ($datevalue_month = 5)
	add $datevalue_value (121 + $datevalue_day)
elseif ($datevalue_month = 6)
	add $datevalue_value (152 + $datevalue_day)
elseif ($datevalue_month = 7)
	add $datevalue_value (182 + $datevalue_day)
elseif ($datevalue_month = 8)
	add $datevalue_value (213 + $datevalue_day)
elseif ($datevalue_month = 9)
	add $datevalue_value (244 + $datevalue_day)
elseif ($datevalue_month = 10)
	add $datevalue_value (274 + $datevalue_day)
elseif ($datevalue_month = 11)
	add $datevalue_value (305 + $datevalue_day)
elseif ($datevalue_month = 12)
	add $datevalue_value (335 + $datevalue_day)
else
	return
end
setvar $datevalue_leap_year false
setvar $datevalue_leaps4 $datevalue_year
divide $datevalue_leaps4 4
setvar $datevalue_leaps100 $datevalue_year
divide $datevalue_leaps100 100
setvar $datevalue_leaps400 $datevalue_year
divide $datevalue_leaps400 400
if (($datevalue_leaps4 * 4 = $datevalue_year) and (($datevalue_leaps100 * 100 <> $datevalue_year) or ($datevalue_leaps400 * 400 = $datevalue_year)))
	setvar $datevalue_leap_year true
end
if ($datevalue_month > 2) and ($datevalue_leap_year = true)
	add $datevalue_value 1
end
setvar $datevalue_valid true
return

#INCLUDES:
include "source\include\help"
include "source\include\player.ts"
