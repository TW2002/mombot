	gosub :LOADVARS~LOADVARS
	gosub :HELP~INITIALIZE

	 setVar $HELP~HELP[1] $HELP~TAB&"Set, clear, or display avoids"
	 setVar $HELP~HELP[2] $HELP~TAB&"Using the avoids command without a parameter will display"
	 setVar $HELP~HELP[3] $HELP~TAB&"current avoids over subspace. "
	 setVar $HELP~HELP[4] $HELP~TAB&"       "
	 setVar $HELP~HELP[5] $HELP~TAB&"Options:"
	 setVar $HELP~HELP[6] $HELP~TAB&"        {set} -  Will set an avoid "
	 setVar $HELP~HELP[7] $HELP~TAB&"                                        "
	 setVar $HELP~HELP[8] $HELP~TAB&"       {save} - Save current avoids to avoids.txt "
	 setVar $HELP~HELP[9] $HELP~TAB&"                                        "
	 setVar $HELP~HELP[10] $HELP~TAB&"      {clear} -  Will clear an avoid if a sector number"
	 setVar $HELP~HELP[11] $HELP~TAB&"                 is provided, otherwise 'clear' by itself"
	setVar $HELP~HELP[12] $HELP~TAB&"                 will clear all avoids."
	setVar $HELP~HELP[13] $HELP~TAB&"       "
	setVar $HELP~HELP[14] $HELP~TAB&"Usage: "
	setVar $HELP~HELP[15] $HELP~TAB&"       >avoids set 45"
	setVar $HELP~HELP[16] $HELP~TAB&"       >avoids clear 45"
	setVar $HELP~HELP[17] $HELP~TAB&"       >avoids clear"
	gosub :HELP~HELPFILE

	setVar $AVOIDS		" "
	setVar $Temp		""
	setVar $Void_CNT	0
	setvar $avoidsfile "avoids.txt"
	gosub :PLAYER~quikstats

	if ($PLAYER~CURRENT_PROMPT = "Command") OR ($PLAYER~CURRENT_PROMPT = "Citadel")
		if ($bot~parm1 = "clear")
			isNumber $tst $bot~parm2
			if (($tst) or ($bot~parm2 = ""))
				if ($bot~parm2 = "")
					send "cv0*yyq"
					clearAllAvoids
					setVar $SWITCHBOARD~message "All Avoids Cleared*"
					gosub :SWITCHBOARD~switchboard
					halt
				else
					clearAvoid $bot~parm2
					send "cv0*yn" & $bot~parm2 & "*q"
					setTextLineTrigger	Cleared		:Cleared	"has been cleared and will be used in future plots."
					setTextLineTrigger	NoClear		:NoClear	"Invalid sector number"
					pause
					:NoClear
					killAllTriggers
					setVar $SWITCHBOARD~message "Invalid sector number*"
					gosub :SWITCHBOARD~switchboard
					halt
					:Cleared
					killAllTriggers
					getWord CURRENTLINE $bot~parm2 1
					isNumber $tst $bot~parm2
					if ($tst = 0)
						setVar $bot~parm2 0
					end
					setVar $SWITCHBOARD~message $bot~parm2&" has been cleared and will be used in future plots.*"
					gosub :SWITCHBOARD~switchboard
					halt
				end
			else
				setVar $SWITCHBOARD~message "Syntax Error*"
				gosub :SWITCHBOARD~switchboard
				halt
			end
		elseif ($bot~parm1 = "set")
			isnumber $tst $bot~parm2
			if ($tst)
            	if ($bot~parm2 > 0) and ($bot~parm2 <= sectors)
            		send "cv"&$bot~parm2&"*q"
					setTextLineTrigger		Setted		:Setted		"will now be avoided in future navigation calculations."
					setTextTrigger			NotSet		:NotSet		"Do you wish to clear some avoids?"
					pause
					:NotSet
					killAllTriggers
					send "nq"
					setVar $SWITCHBOARD~message $bot~parm2&" Is Not a Valid Sector Number*"
					gosub :SWITCHBOARD~switchboard
					halt
					:Setted
					killAllTriggers
					getWord CURRENTLINE	$bot~parm2 2
					isNumber $tst $bot~parm2
					if ($tst = 0)
						setVar $bot~parm2 0
					end
					setVar $SWITCHBOARD~message $bot~parm2&" will now be avoided in future navigation calculations.*"
					gosub :SWITCHBOARD~switchboard
					halt
				end
			else
				setVar $SWITCHBOARD~message "Syntax error*"
				gosub :SWITCHBOARD~switchboard
				halt
			end
		elseif ($bot~parm1 = "save")
			delete $avoidsfile
			send "cxq"
			waitfor "<List Avoided Sectors>"
			setTextLineTrigger		NoAvoid	:NoAvoid	"No Sectors are currently being avoided."
			setTextLineTrigger		Done	:SaveDone	"Computer command"
			setTextLineTrigger		Line	:SaveLine
			pause
			:SaveLine
    		if ((CURRENTLINE <> "") AND (CURRENTLINE <> "0"))
				splittext CURRENTLINE $line "  "
				setvar $i 1
				while ($i <= $line)
					write $avoidsfile $line[$i]
					add $i 1
				end
			end
			setTextLineTrigger		Line	:SaveLine
			pause
			:SaveDone
			killAllTriggers
			setVar $SWITCHBOARD~message "Avoids Saved*"
			gosub :SWITCHBOARD~switchboard
			halt
		end
		send "cxq"
	else
		setVar $SWITCHBOARD~message "Must be started from the Command or Citadel Prompt*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	waitfor "<List Avoided Sectors>"
	setTextLineTrigger		NoAvoid	:NoAvoid	"No Sectors are currently being avoided."
	setTextLineTrigger		Done	:Done		"Computer command"
	setTextLineTrigger		Line	:Line
	pause
	:Line
    	if ((CURRENTLINE <> "") AND (CURRENTLINE <> "0"))
			setVar $Temp (" " & CURRENTLINE & " +++ ")
			While ($Temp <> "+++")
				getWord $Temp $Avoided 1
				isNumber $tst $Avoided
				if ($tst <> 0)
					setVar $AVOIDS ($AVOIDS & $Avoided & " ")
					replacetext $Temp (" " & $Avoided & " ") ""
					add $Void_CNT 1
				else
					setVar $Temp "+++"
				end
			end
		end
		setTextLineTrigger		Line	:Line
		pause
	:NoAvoid
		killAlltriggers
		setVar $SWITCHBOARD~message "No Sectors are currently being avoided.*"
		gosub :SWITCHBOARD~switchboard
		halt
	:Done
		killAllTriggers
		if ($SWITCHBOARD~self_command = FALSE)
			setVar $SWITCHBOARD~self_command 2
		end

		setVar $SWITCHBOARD~message $Void_CNT & " Avoids Found:*  *"&$AVOIDS & "*"
		gosub :SWITCHBOARD~switchboard
		halt

include "source\include\player"
include "source\include\loadvars"
include "source\include\help"
