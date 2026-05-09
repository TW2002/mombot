setVar $includesDir ".\includes"

gosub :LOADVARS~LOADVARS
gosub :HELP~INITIALIZE

setVar $HELP~HELP[1] $HELP~TAB&"keep {amount} "
setVar $HELP~HELP[2] $HELP~TAB&"   Will withdraw or deposit to/from citadel so you"
setVar $HELP~HELP[3] $HELP~TAB&"   have the amount of credits requested."
setVar $HELP~HELP[4] $HELP~TAB&"     "
setVar $HELP~HELP[5] $HELP~TAB&"   Examples:"
setVar $HELP~HELP[6] $HELP~TAB&"      >keep 500k"
setVar $HELP~HELP[7] $HELP~TAB&"      >keep 2m"
setVar $HELP~HELP[8] $HELP~TAB&"      >keep 200000"
setVar $HELP~HELP[8] $HELP~TAB&"     "
setVar $HELP~HELP[8] $HELP~TAB&"                     - Author: Deign "
gosub :HELP~HELPFILE

gosub :player~quikstats
setVar $loc $player~CURRENT_PROMPT
setVar $roll $player~CREDITS

IF ($loc <> "Citadel")
     setvar $switchboard~message "Must be at the Citadel prompt (not " & $loc & ")*"
     gosub :switchboard~switchboard
     halt
END

replaceText $bot~parm1 "m" "000000"
replaceText $bot~parm1 "M" "000000"
replaceText $bot~parm1 "k" "000"
replaceText $bot~parm1 "K" "000"

IF ($bot~parm1 > 0)
     setVar $k $bot~parm1
ELSE
     setVar $k 500000
END

setTextLineTrigger treas :checkBalance "You have"

IF ($roll > $k)
  setVar $cmd "tt"
ELSEIF ($roll < $k)
  setVar $cmd "tf"
ELSE
	setvar $switchboard~message "No transaction required*"
	gosub :switchboard~switchboard
	halt
END

send $cmd
pause
:treasReturn
IF ($roll > $k)
  setVar $x $roll-$k
  format $x $formatted_x NUMBER
  setvar $switchboard~message $formatted_x & " credits deposited into citadel*"
ELSEIF ($roll < $k)
  setVar $x $k-$roll
  format $x $formatted_x NUMBER
  setvar $switchboard~message $formatted_x & " credits taken from citadel*"
  IF ($x > $balance)
    setVar $x 0
    setvar $switchboard~message "NSF error*"
  END
END
send $x "*"
gosub :switchboard~switchboard

halt

:checkBalance
setVar $treasLine CURRENTLINE
replaceText $treasLine "," ""
replaceText $treasLine "." ""
getWord $treasLine $roll 3
getWord $treasLine $balance 9
killTrigger treas
goto :treasReturn

#includes
include "source\include\player"
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
