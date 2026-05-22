gosub :loadvars~loadvars
gosub :help~initialize
setvar $help~help[1]  $help~tab&"dep {cash to deposit} "
setvar $help~help[2]  $help~tab&"  Deposits cash into citadel treasury."
setvar $help~help[3]  $help~tab&"        default is max credits possible"
gosub :help~helpfile

setvar $player_cash_max     999999999
setvar $planet~citadel_cash_max    999999999999999

# ============================== START DEPOSIT (DEP) ==============================
:dep
:d
replacetext $bot~parm1 "m" "000000"
replacetext $bot~parm1 "M" "000000"
replacetext $bot~parm1 "k" "000"
replacetext $bot~parm1 "K" "000"

gosub :bankprotections
if ($bot~parm1 = "")
	setvar $cashtotransfer $player~credits
else
	setvar $cashtotransfer $bot~parm1
end
send "D"
waiton "Citadel treasury contains "
getword currentline $planet~citadelcash 4
striptext $planet~citadelcash ","
striptext $planet~citadelcash "."
if (($cashtotranfer+$planet~citadelcash) >= $planet~citadel_cash_max)
	setvar $switchboard~message "Citadel has too much cash to do transfer (how sad for you)*"
	gosub :switchboard~switchboard
	goto :wait_for_command
end
send "t t "&$cashtotransfer&"* "
waiton "credits, and the Treasury"
setvar $map~value $cashtotransfer
gosub :map~commas
setvar $cashtotransfer $map~value
setvar $switchboard~message $cashtotransfer &" credits deposited into citadel.*"
gosub :switchboard~switchboard
goto :wait_for_command
# ============================== END DEPOSIT (DEP) ==============================
:bankprotections
gosub :player~quikstats
setvar $bot~validprompts "Citadel"
gosub :player~checkstartingprompt
if ($bot~parm1 = "ss")
	setvar $bot~parm1 ""
end
isnumber $test $bot~parm1
if (($test = false) and ($bot~parm1 <> ""))
	setvar $switchboard~message "Cash entered is not a number, try again.*"
	gosub :switchboard~switchboard
	goto :wait_for_command
end
return

:wait_for_command
halt

# includes:
include "source\include\map"
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
