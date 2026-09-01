gosub :loadvars~loadvars
gosub :help~initialize

setvar $help~help[1] $help~tab&"Set, clear, or display avoids"
setvar $help~help[2] $help~tab&"Using the avoids command without a parameter will display"
setvar $help~help[3] $help~tab&"current avoids over subspace. "
setvar $help~help[4] $help~tab&"       "
setvar $help~help[5] $help~tab&"Options:"
setvar $help~help[6] $help~tab&"        {set} -  Will set an avoid "
setvar $help~help[7] $help~tab&"                                        "
setvar $help~help[8] $help~tab&"       {save} - Save current avoids to avoids.txt "
setvar $help~help[9] $help~tab&"                                        "
setvar $help~help[10] $help~tab&"      {clear} -  Will clear an avoid if a sector number"
setvar $help~help[11] $help~tab&"                 is provided, otherwise 'clear' by itself"
setvar $help~help[12] $help~tab&"                 will clear all avoids."
setvar $help~help[13] $help~tab&"       "
setvar $help~help[14] $help~tab&"Usage: "
setvar $help~help[15] $help~tab&"       >avoids set 45"
setvar $help~help[16] $help~tab&"       >avoids clear 45"
setvar $help~help[17] $help~tab&"       >avoids clear"
gosub :help~helpfile

setvar $avoids		" "
setvar $temp		""
setvar $void_cnt	0
loadvar $bot~folder
setvar $avoidsfile $bot~folder&"/avoids.txt"
gosub :player~quikstats

if ($player~current_prompt = "Command") or ($player~current_prompt = "Citadel")
	if ($bot~parm1 = "clear")
		isnumber $tst $bot~parm2
		if (($tst) or ($bot~parm2 = ""))
			if ($bot~parm2 = "")
				send "cv0*yyq"
				clearallavoids
				setvar $switchboard~message "All Avoids Cleared*"
				gosub :switchboard~switchboard
				halt
			else
				clearavoid $bot~parm2
				send "cv0*yn" & $bot~parm2 & "*q"
				settextlinetrigger	cleared		:cleared	"has been cleared and will be used in future plots."
				settextlinetrigger	noclear		:noclear	"Invalid sector number"
				pause

				:noclear
				killalltriggers
				setvar $switchboard~message "Invalid sector number*"
				gosub :switchboard~switchboard
				halt

				:cleared
				killalltriggers
				getword currentline $bot~parm2 1
				isnumber $tst $bot~parm2
				if ($tst = 0)
					setvar $bot~parm2 0
				end
				setvar $switchboard~message $bot~parm2&" has been cleared and will be used in future plots.*"
				gosub :switchboard~switchboard
				halt
			end
		else
			setvar $switchboard~message "Syntax Error*"
			gosub :switchboard~switchboard
			halt
		end
	elseif ($bot~parm1 = "set")
		isnumber $tst $bot~parm2
		if ($tst)
			if ($bot~parm2 > 0) and ($bot~parm2 <= sectors)
				send "cv"&$bot~parm2&"*q"
				settextlinetrigger		setted		:setted		"will now be avoided in future navigation calculations."
				setstrigger			notset		:notset		"Do you wish to clear some avoids?"
				pause

				:notset
				killalltriggers
				send "nq"
				setvar $switchboard~message $bot~parm2&" Is Not a Valid Sector Number*"
				gosub :switchboard~switchboard
				halt

				:setted
				killalltriggers
				getword currentline	$bot~parm2 2
				isnumber $tst $bot~parm2
				if ($tst = 0)
					setvar $bot~parm2 0
				end
				setvar $switchboard~message $bot~parm2&" will now be avoided in future navigation calculations.*"
				gosub :switchboard~switchboard
				halt
			end
		else
			setvar $switchboard~message "Syntax error*"
			gosub :switchboard~switchboard
			halt
		end
	elseif ($bot~parm1 = "save")
		delete $avoidsfile
		send "cxq"
		waitfor "<List Avoided Sectors>"
		settextlinetrigger		noavoid	:noavoid	"No Sectors are currently being avoided."
		setslinetrigger		done	:savedone	"Computer command"
		settextlinetrigger		line	:saveline
		pause

		:saveline
		if ((currentline <> "") and (currentline <> "0"))
			splittext currentline $line "  "
			setvar $i 1
			while ($i <= $line)
				write $avoidsfile $line[$i]
				add $i 1
			end
		end
		settextlinetrigger		line	:saveline
		pause

		:savedone
		killalltriggers
		setvar $switchboard~message "Avoids Saved*"
		gosub :switchboard~switchboard
		halt
	end
	send "cxq"
else
	setvar $switchboard~message "Must be started from the Command or Citadel Prompt*"
	gosub :switchboard~switchboard
	halt
end
waitfor "<List Avoided Sectors>"
settextlinetrigger		noavoid	:noavoid	"No Sectors are currently being avoided."
setslinetrigger		done	:done		"Computer command"
settextlinetrigger		line	:line
pause

:line
if ((currentline <> "") and (currentline <> "0"))
	setvar $temp (" " & currentline & " +++ ")
	while ($temp <> "+++")
		getword $temp $avoided 1
		isnumber $tst $avoided
		if ($tst <> 0)
			setvar $avoids ($avoids & $avoided & " ")
			replacetext $temp (" " & $avoided & " ") ""
			add $void_cnt 1
		else
			setvar $temp "+++"
		end
	end
end
settextlinetrigger		line	:line
pause

:noavoid
killalltriggers
setvar $switchboard~message "No Sectors are currently being avoided.*"
gosub :switchboard~switchboard
halt

:done
killalltriggers
if ($switchboard~self_command = false)
	setvar $switchboard~self_command 2
end

setvar $switchboard~message $void_cnt & " Avoids Found:*  *"&$avoids & "*"
gosub :switchboard~switchboard
halt

include "source\include\player"
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
