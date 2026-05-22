logging off
gosub :loadvars~loadvars
gosub :help~initialize

setvar $help~help[1]  $help~tab&" history {limit:#} {filter:x}"
setvar $help~help[2]  $help~tab&"   "
setvar $help~help[3]  $help~tab&"     Displays the most recent self commands"
setvar $help~help[4]  $help~tab&"     this bot has given."
setvar $help~help[5]  $help~tab&"         "
setvar $help~help[6]  $help~tab&"      {limit:#} - display the last # of commands"
setvar $help~help[7]  $help~tab&"     {filter:x} - only show commands matching this"
setvar $help~help[8]  $help~tab&"                      "
setvar $help~help[9]  $help~tab&"     Example:                      "
setvar $help~help[10] $help~tab&"         >history 10                      "
setvar $help~help[11] $help~tab&"         >history pdrop                   "
setvar $help~help[12] $help~tab&"         >history 3 pdrop                   "

gosub :help~helpfile

setvar $bot~historymax      100

loadvar $bot~historystring
setvar $bot~historycount 0

setvar $switchboard~message ""

getwordpos $bot~historystring $pos "<<|HS|>>"
while (($pos > 0) and ($bot~historycount < $bot~historymax))
	cuttext $bot~historystring $archive 1 ($pos-1)
	replacetext $bot~historystring $archive&"<<|HS|>>" ""
	setvar $history[($bot~historycount+1)] $archive
	add $bot~historycount 1
	getwordpos $bot~historystring $pos "<<|HS|>>"
end

isnumber $isnumber $bot~parm1
if ($isnumber = true)
	setvar $history_limit $bot~parm1
else
	setvar $filter $bot~parm1
end
if ($history_limit = 0)
	setvar $history_limit $bot~historycount
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
	setvar $i $bot~historycount
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
include "source\include\switchboard.ts"
