gosub :loadvars~loadvars
gosub :help~initialize

setvar $help~help[1] $help~tab&"Shows course path to sectors"
setvar $help~help[2] $help~tab&"   course {start sector} {end sector}"
setvar $help~help[3] $help~tab&"   course {end sector}"
gosub :help~helpfile

# =============================== START COURSE DISPLAY ===============================
:course
killalltriggers
clearallavoids
gosub :player~quikstats
isnumber $test $bot~parm1
if (($bot~parm1 = "") or ($test = false))
	setvar $switchboard~message "Sectors entered not valid.*"
	gosub :switchboard~switchboard
	halt
end
isnumber $test $bot~parm2
if (($test = false) or ($bot~parm2 = ""))
	setvar $destination $bot~parm1
	setvar $start $player~current_sector
else
	if ($bot~parm2 > 0)
		setvar $start $bot~parm1
		setvar $destination $bot~parm2
	else
		setvar $switchboard~message "Sectors entered not valid.*"
		gosub :switchboard~switchboard
		halt
	end
end
getcourse $course $start $destination
if ($course <= 0)
	send "^f"&$start&"*"&$destination&"*q "
	waiton ": ENDINTERROG"
	getcourse $course $start $destination
end
if ($course <= 0)
	setvar $switchboard~message "No path to that sector.*"
	gosub :switchboard~switchboard
	halt
end
setvar $i 1
setvar $course_length ($course + 1)
setvar $directions ""
while ($i <= $course_length)
	getsectorparameter $course[$i] "FIGSEC" $isfigged
	if ($isfigged = "")
		setvar $isfigged false
	end
	if ($isfigged)
		setvar $directions $directions&"["&$course[$i]&"]"
	else
		setvar $directions $directions&$course[$i]
	end
	if ($i <> $course_length)
		setvar $directions $directions&" > "
	end
	add $i 1
end
setvar $switchboard~message "Path from "&$start&" to "&$destination&": "&$directions&"*"
gosub :switchboard~switchboard
halt
#================================== END COURSE DISPLAY ==============================

# includes:
include "source\include\player"
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
