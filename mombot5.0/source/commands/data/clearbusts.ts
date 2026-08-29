logging off
gosub :help~initialize
setvar $help~help[1] $help~tab&"clearbusts"
setvar $help~help[2] $help~tab&"  - Will clear old dated busts in database."
setvar $help~help[3] $help~tab&"  - If busts are not dated, clears all busts."
gosub :help~helpfile

setvar $switchboard~message "Bust Clearer starting up!*"
gosub :switchboard~switchboard

:clearbusts
getdatetime $now
datetimetostr $current_bust_date $now "yyyy-MM-dd"
setvar $datevalue_text $current_bust_date
gosub :datevalue
setvar $current_bust_day $datevalue_value
setvar $dated_busts 0
setvar $old_busts 0
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
			add $dated_busts 1
			setvar $datevalue_text $bustdate
			gosub :datevalue
			if (($datevalue_valid = true) and ($datevalue_value < $current_bust_day))
				add $old_busts 1
			end
		else
			add $undated_busts 1
		end
	end
	add $i 1
end
setvar $i 11
while ($i <= sectors)
	getsectorparameter $i "BUSTED" $busted
	gosub :normalizebusted
	if ($busted <> 0)
		getsectorparameter $i "BUSTDATE" $bustdate
		if ($dated_busts > 0)
			if (($bustdate <> "") and ($bustdate <> 0))
				setvar $datevalue_text $bustdate
				gosub :datevalue
				if (($datevalue_valid = true) and ($datevalue_value < $current_bust_day))
					setsectorparameter $i "BUSTED" ""
					setsectorparameter $i "FAKEBUST" ""
					setsectorparameter $i "BUSTDATE" ""
					add $cleared_busts 1
				else
					add $kept_busts 1
				end
			else
				add $kept_busts 1
			end
		else
			setsectorparameter $i "BUSTED" ""
			setsectorparameter $i "FAKEBUST" ""
			setsectorparameter $i "BUSTDATE" ""
			add $cleared_busts 1
		end
	end
	add $i 1
end
if ($dated_busts > 0)
	setvar $switchboard~message "Old dated bust data cleared: "&$cleared_busts&" cleared, "&$kept_busts&" kept, "&$undated_busts&" undated left alone.*"
else
	setvar $switchboard~message "Undated bust data for this bot has been cleared: "&$cleared_busts&" cleared.*"
end
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
setvar $datevalue_value ($datevalue_year * 365)
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
setvar $datevalue_valid true
return

#INCLUDES:
include "source\include\help"
include "source\include\switchboard.ts"
