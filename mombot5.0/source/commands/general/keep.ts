setvar $includesdir ".\includes"

gosub :loadvars~loadvars
gosub :help~initialize

setvar $help~help[1] $help~tab&"keep {amount} "
setvar $help~help[2] $help~tab&"   Will withdraw or deposit to/from citadel so you"
setvar $help~help[3] $help~tab&"   have the amount of credits requested."
setvar $help~help[4] $help~tab&"     "
setvar $help~help[5] $help~tab&"   Examples:"
setvar $help~help[6] $help~tab&"      >keep 500k"
setvar $help~help[7] $help~tab&"      >keep 2m"
setvar $help~help[8] $help~tab&"      >keep 200000"
setvar $help~help[8] $help~tab&"     "
setvar $help~help[8] $help~tab&"                     - Author: Deign "
gosub :help~helpfile

gosub :player~quikstats
setvar $loc $player~current_prompt
setvar $roll $player~credits

if ($loc <> "Citadel")
	setvar $switchboard~message "Must be at the Citadel prompt (not " & $loc & ")*"
	gosub :switchboard~switchboard
	halt
end

replacetext $bot~parm1 "m" "000000"
replacetext $bot~parm1 "M" "000000"
replacetext $bot~parm1 "k" "000"
replacetext $bot~parm1 "K" "000"

if ($bot~parm1 > 0)
	setvar $k $bot~parm1
else
	setvar $k 500000
end

settextlinetrigger treas :checkbalance "You have"

if ($roll > $k)
	setvar $cmd "tt"
elseif ($roll < $k)
	setvar $cmd "tf"
else
	setvar $switchboard~message "No transaction required*"
	gosub :switchboard~switchboard
	halt
end

send $cmd
pause

:treasreturn
if ($roll > $k)
	setvar $x $roll-$k
	format $x $formatted_x number
	setvar $switchboard~message $formatted_x & " credits deposited into citadel*"
elseif ($roll < $k)
	setvar $x $k-$roll
	format $x $formatted_x number
	setvar $switchboard~message $formatted_x & " credits taken from citadel*"
	if ($x > $balance)
		setvar $x 0
		setvar $switchboard~message "NSF error*"
	end
end
send $x "*"
gosub :switchboard~switchboard

halt

:checkbalance
setvar $treasline currentline
replacetext $treasline "," ""
replacetext $treasline "." ""
getword $treasline $roll 3
getword $treasline $balance 9
killtrigger treas
goto :treasreturn

#includes
include "source\include\player"
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
