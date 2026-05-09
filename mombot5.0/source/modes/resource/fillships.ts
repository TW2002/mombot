logging off
gosub :LOADVARS~LOADVARS
gosub :HELP~INITIALIZE

	setVar $HELP~HELP[1]  $HELP~TAB&"    Fills all empty ships with fighters from sector.        "
	gosub :HELP~HELPFILE

:emptyships
	killalltriggers
	gosub :player~quikstats
	setVar $startShip $player~ship_number
	setVar $startingLocation $player~current_prompt
	setVar $total_figs 0
	send "** "
	setVar $fuelInSector FALSE
	if (($startingLocation <> "Citadel") AND ($startingSector <> "Planet") AND ($startingLocation <> "Command"))
		setvar $switchboard~message "Must be in Command, Citadel or Planet prompt to run*"
		gosub :switchboard~switchboard
		halt
	end

	if ($startingLocation = "Citadel")
		send "q "
	end
	setVar $shipCount 0
	if (($startingLocation = "Planet") OR ($startingLocation = "Citadel"))
		gosub :planet~getplanetinfo
		send "q "
	end
	setvar $switchboard~message "Ship Filler starting up!  Starting ship scan..*"
	gosub :switchboard~switchboard
	:tryshipscan
		send "wnq*@"
		setTextLineTrigger statlinetrig :shipline "-----------------------------------------------------------------------------"
		setTextLineTrigger towalreadyon :continuetowon "You shut off your Tractor Beam."
		pause
		:continuetowon
			killtrigger statlinetrig
			goto :tryshipscan

	:shipline
		killtrigger towalreadyon
		setVar $line CURRENTLINE
		getWordPos $line $pos "Average Interval Lag:"
		getWord $line $temp 1
		isNumber $result $temp
		if (($result = TRUE))
			if ($temp > 0)
				add $shipCount 1
				setVar $theShips[$shipCount] $temp
			end
		end
		if ($pos > 0)
			goto :gotShips
		else
			setTextLineTrigger getLine :shipline
			pause
		end


	:gotShips
		setvar $switchboard~message "Found "&$shipCount&" empty ships to strip.*"
		gosub :switchboard~switchboard
		setVar $i 1
		while ($i <= $shipCount)
			if ($theShips[$i] > 0)
				send "x "&$theShips[$i]&"*   *   "
				gosub :player~quikstats
				gosub :do_topoff
			end
			add $i 1
		end
		send "x "&$startShip&"*  *   "
		if (($startingLocation = "Planet") OR ($startingLocation = "Citadel"))
			gosub :planet~landingSub
		end
		setvar $switchboard~message "Done filling empty ships.*"
		gosub :switchboard~switchboard

halt
# ============================== END Move Ship (moveship) Sub ==============================

:do_topoff
	:do_topoff_again
		killalltriggers
		send " F"
		waitOn "Your ship can support up to"
		getWord CURRENTLINE $ftrs_to_leave 10
		stripText $ftrs_to_leave ","
		stripText $ftrs_to_leave " "
		if ($ftrs_to_leave < 1)
			setVar $ftrs_to_leave 1
		end
		send " " & $ftrs_to_leave & " * C D"
		setTextLineTrigger topoff_success :topoff_success "Done. You have "
		setTextLineTrigger topoff_failure1 :do_topoff_again "You don't have that many fighters available."
		setTextLineTrigger topoff_failure2 :do_topoff_again "Too many fighters in your fleet!  You are limited to"
		pause
	:topoff_success
return
include "source\include\planet"
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
