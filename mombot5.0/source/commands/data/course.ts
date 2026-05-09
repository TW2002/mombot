	gosub :LOADVARS~LOADVARS
	gosub :HELP~INITIALIZE
		
	setVar $HELP~HELP[1] $HELP~TAB&"Shows course path to sectors"
	setVar $HELP~HELP[2] $HELP~TAB&"   course {start sector} {end sector}"
	setVar $HELP~HELP[3] $HELP~TAB&"   course {end sector}"
	gosub :HELP~HELPFILE

# =============================== START COURSE DISPLAY ===============================
:course
	killalltriggers
	clearAllAvoids
	gosub :PLAYER~quikstats
	isNumber $test $bot~parm1
	if (($bot~parm1 = "") OR ($test = FALSE))
		setVar $SWITCHBOARD~message "Sectors entered not valid.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	isNumber $test $bot~parm2
	if (($test = FALSE) OR ($bot~parm2 = ""))
		setVar $destination $bot~parm1
		setVar $start $PLAYER~CURRENT_SECTOR
	else
		if ($bot~parm2 > 0)
			setVar $start $bot~parm1
			setVar $destination $bot~parm2
		else
			setVar $SWITCHBOARD~message "Sectors entered not valid.*"
			gosub :SWITCHBOARD~switchboard
			halt
		end
	end
	getCourse $course $start $destination
	if ($course <= 0)
		send "^f"&$start&"*"&$destination&"*q "
		waitOn ": ENDINTERROG"
		getCourse $course $start $destination
	end
	if ($course <= 0)
		setVar $SWITCHBOARD~message "No path to that sector.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	setVar $i 1
	setVar $course_length ($course + 1)
	setVar $directions ""
	while ($i <= $course_length)
		getSectorParameter $course[$i] "FIGSEC" $isFigged
		if ($isFigged = "")
			setvar $isFigged false
		end
		if ($isFigged)
			setVar $directions $directions&"["&$course[$i]&"]"
		else
			setVar $directions $directions&$course[$i]  
		end
		if ($i <> $course_length)
			setVar $directions $directions&" > "
		end
		add $i 1
	end
	setVar $SWITCHBOARD~message "Path from "&$start&" to "&$destination&": "&$directions&"*"
	gosub :SWITCHBOARD~switchboard
	halt
#================================== END COURSE DISPLAY ==============================





# includes:
include "source\include\player"
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
