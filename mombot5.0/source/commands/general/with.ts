gosub :LOADVARS~LOADVARS
gosub :HELP~INITIALIZE

if (($bot~parm1 = "?") or ($bot~parm1 = "help"))
	goto :wait_for_command
end

setVar $PLAYER_CASH_MAX     999999999
setVar $planet~citadel_CASH_MAX    999999999999999

## ============================== START WITHDRAW (WITH) ==============================
:with
:w
replaceText $bot~parm1 "m" "000000"
replaceText $bot~parm1 "M" "000000"
replaceText $bot~parm1 "k" "000"
replaceText $bot~parm1 "K" "000"

gosub :bankProtections
if ($bot~parm1 = "")
	setVar $cashToTransfer $PLAYER_CASH_MAX
else
	setVar $cashToTransfer $bot~parm1
end
if ($cashToTransfer > $PLAYER_CASH_MAX)
	setVar $SWITCHBOARD~message "Can't withdraw more than 1 bil at a time*"
	gosub :SWITCHBOARD~switchboard
	goto :wait_for_command
end
send "D" 
waitOn "Citadel treasury contains "
getWord CURRENTLINE $planet~citadelCash 4
stripText $planet~citadelCash ","
stripText $planet~citadelCash "."
if (($PLAYER~CREDITS+$cashToTransfer) > $PLAYER_CASH_MAX)
	setVar $cashToTransfer ($PLAYER_CASH_MAX-$PLAYER~CREDITS)
end
if ($planet~citadelCash < $cashToTransfer)
	setVar $cashToTransfer $planet~citadelCash
end
send "t f "&$cashToTransfer&"* "
waiton "credits, and the Treasury"
setvar $map~value $cashtotransfer
gosub :map~commas
setvar $cashtotransfer $map~value
setVar $SWITCHBOARD~message $cashToTransfer &" credits taken from citadel.*"
gosub :SWITCHBOARD~switchboard
goto :wait_for_command
# ============================== END WITHDRAW (WITH) ==============================
:bankProtections
gosub :PLAYER~quikstats
setVar $bot~validPrompts "Citadel"
gosub :PLAYER~CHECKSTARTINGPROMPT
if ($bot~parm1 = "ss")
	setVar $bot~parm1 ""
end
isNumber $test $bot~parm1 
if (($test = FALSE) and ($bot~parm1 <> ""))
	setVar $SWITCHBOARD~message "Cash entered is not a number, try again.*" 
	gosub :SWITCHBOARD~switchboard
	goto :wait_for_command  
end
return

:wait_for_command
setVar $HELP~HELP[1]  $HELP~TAB&"with {cash to withdrawl} "
setVar $HELP~HELP[2]  $HELP~TAB&"  Withdrawls cash from citadel treasury."
setVar $HELP~HELP[3]  $HELP~TAB&"        default is max credits possible"
gosub :HELP~HELPFILE
halt




# includes:
include "source\include\map"
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
