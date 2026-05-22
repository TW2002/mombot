logging off
gosub :loadvars~loadvars
gosub :help~initialize

setvar $help~help[1]  $help~tab&"    Fills all empty ships with fighters from sector.        "
gosub :help~helpfile

:emptyships
killalltriggers
gosub :player~quikstats
setvar $startship $player~ship_number
setvar $startinglocation $player~current_prompt
setvar $total_figs 0
send "** "
setvar $fuelinsector false
if (($startinglocation <> "Citadel") and ($startingsector <> "Planet") and ($startinglocation <> "Command"))
	setvar $switchboard~message "Must be in Command, Citadel or Planet prompt to run*"
	gosub :switchboard~switchboard
	halt
end

if ($startinglocation = "Citadel")
	send "q "
end
setvar $shipcount 0
if (($startinglocation = "Planet") or ($startinglocation = "Citadel"))
	gosub :planet~getplanetinfo
	send "q "
end
setvar $switchboard~message "Ship Filler starting up!  Starting ship scan..*"
gosub :switchboard~switchboard

:tryshipscan
send "wnq*@"
settextlinetrigger statlinetrig :shipline "-----------------------------------------------------------------------------"
settextlinetrigger towalreadyon :continuetowon "You shut off your Tractor Beam."
pause

:continuetowon
killtrigger statlinetrig
goto :tryshipscan

:shipline
killtrigger towalreadyon
setvar $line currentline
getwordpos $line $pos "Average Interval Lag:"
getword $line $temp 1
isnumber $result $temp
if (($result = true))
	if ($temp > 0)
		add $shipcount 1
		setvar $theships[$shipcount] $temp
	end
end
if ($pos > 0)
	goto :gotships
else
	settextlinetrigger getline :shipline
	pause
end

:gotships
setvar $switchboard~message "Found "&$shipcount&" empty ships to strip.*"
gosub :switchboard~switchboard
setvar $i 1
while ($i <= $shipcount)
	if ($theships[$i] > 0)
		send "x "&$theships[$i]&"*   *   "
		gosub :player~quikstats
		gosub :do_topoff
	end
	add $i 1
end
send "x "&$startship&"*  *   "
if (($startinglocation = "Planet") or ($startinglocation = "Citadel"))
	gosub :planet~landingsub
end
setvar $switchboard~message "Done filling empty ships.*"
gosub :switchboard~switchboard

halt
# ============================== END Move Ship (moveship) Sub ==============================
:do_topoff
:do_topoff_again
killalltriggers
send " F"
waiton "Your ship can support up to"
getword currentline $ftrs_to_leave 10
striptext $ftrs_to_leave ","
striptext $ftrs_to_leave " "
if ($ftrs_to_leave < 1)
	setvar $ftrs_to_leave 1
end
send " " & $ftrs_to_leave & " * C D"
settextlinetrigger topoff_success :topoff_success "Done. You have "
settextlinetrigger topoff_failure1 :do_topoff_again "You don't have that many fighters available."
settextlinetrigger topoff_failure2 :do_topoff_again "Too many fighters in your fleet!  You are limited to"
pause

:topoff_success
return
include "source\include\planet"
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
