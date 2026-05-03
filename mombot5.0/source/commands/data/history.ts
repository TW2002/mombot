	logging off
	gosub :LOADVARS~LOADVARS
	gosub :HELP~INITIALIZE

	setVar $HELP~HELP[1]  $HELP~TAB&" history {limit:#} {filter:x}"
	setVar $HELP~HELP[2]  $HELP~TAB&"   "
	setVar $HELP~HELP[3]  $HELP~TAB&"     Displays the most recent self commands"
	setVar $HELP~HELP[4]  $HELP~TAB&"     this bot has given."
	setVar $HELP~HELP[5]  $HELP~TAB&"         "
	setVar $HELP~HELP[6]  $HELP~TAB&"      {limit:#} - display the last # of commands"
	setVar $HELP~HELP[7]  $HELP~TAB&"     {filter:x} - only show commands matching this"
	setVar $HELP~HELP[8]  $HELP~TAB&"                      "
	setVar $HELP~HELP[9]  $HELP~TAB&"     Example:                      "
	setVar $HELP~HELP[10] $HELP~TAB&"         >history 10                      "
	setVar $HELP~HELP[11] $HELP~TAB&"         >history pdrop                   "
	setVar $HELP~HELP[12] $HELP~TAB&"         >history 3 pdrop                   "

	gosub :HELP~HELPFILE

	setVar $bot~historyMax      100

	loadVar $BOT~historyString
	setVar $BOT~historyCount 0



	setvar $switchboard~message ""

	getWordPos $BOT~historyString $pos "<<|HS|>>"
	while (($pos > 0) AND ($BOT~historyCount < $BOT~historyMax))
		cutText $BOT~historyString $archive 1 ($pos-1)
		replaceText $BOT~historyString $archive&"<<|HS|>>" "" 
		setVar $history[($BOT~historyCount+1)] $archive
		add $BOT~historyCount 1
		getWordPos $BOT~historyString $pos "<<|HS|>>"
	end

	isNumber $isnumber $bot~parm1
	if ($isnumber = true)
		setvar $history_limit $bot~parm1
	else
		setvar $filter $bot~parm1
	end
	if ($history_limit = 0)
		setvar $history_limit $BOT~historyCount
	else
		setvar $filter $bot~parm2
	end
	if ($filter = "")
		setvar $i $history_limit
		setvar $switchboard~message $switchboard~message&"Displaying last "&$history_limit&" commands:*"
		while ($i >= 1)
			if ($history[($i+$place)] <> "0")
				setvar $switchboard~message $switchboard~message&$history[($i+$place)]&"*"
			end
			subtract $i 1
		end
	else
		setvar $count 0
		setvar $i $BOT~historyCount
		setvar $switchboard~message $switchboard~message&"Displaying last commands matching ["&$filter&"]:*"
		while (($i >= 1) and ($count <= $history_limit))
			if ($history[($i+$place)] <> "0")
				getwordpos $history[($i+$place)] $pos $filter 
				if ($pos > 0)
					add $count 1
					setvar $switchboard~message $switchboard~message&$history[($i+$place)]&"*"
				end
			end
			subtract $i 1
		end	
	end


	gosub :switchboard~switchboard
halt

#INCLUDES:
include "source\include\loadvars"
include "source\include\help"
