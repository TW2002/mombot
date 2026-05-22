loadvar $switchboard~bot_name
gosub :loadvars~loadvars
gosub :help~initialize

#HELP FILE
setvar $help~help[1]  $help~tab&"   Zero Turn Mapping"
setvar $help~help[2]  $help~tab&"  "
setvar $help~help[3]  $help~tab&"   ztm {p:n} {s:n} {one} {noreport}"
setvar $help~help[4]  $help~tab&"         "
setvar $help~help[5]  $help~tab&"   Will resume from PASS and FROMSECTOR if cancelled "
setvar $help~help[6]  $help~tab&"         "
setvar $help~help[7]  $help~tab&"   {p:n} - Start Pass - n from 0 to 6"
setvar $help~help[8]  $help~tab&"   {s:n} - Start Sector - n from 2 to MAXSECTORS"
setvar $help~help[9]  $help~tab&"   {one} - Plot to Terra instead of random"
setvar $help~help[10]  $help~tab&"   {noreport} - Will not report potenial Class 0s"
setvar $help~help[11] $help~tab&"   "
setvar $help~help[12] $help~tab&"   Examples:"
setvar $help~help[13] $help~tab&"   >ztm p:2 s:400   - Pass 2, sector 400"
setvar $help~help[14] $help~tab&"   >ztm one         - Plot to one"
setvar $help~help[15] $help~tab&"   >ztm p:0 s:2 one - Start Again, Plot to one"
gosub :help~helpfile

#----- INCLUDES -----
reqrecording

# CREDITS
# -------
# Written by Hammer

# REVISION HISTORY
# ----------------
# 1.0.0 Initial version, Plots a map with no turn usage
#
#  re-write of Cherokee's as I had reliability issues - stored in ztm_old.ts in the bot archives if this one turns out bad

# --- CHECK LOCATION ---

gosub :player~quikstats
setvar $location $player~current_prompt
setvar $startlocation "x"

:checklocation
if (($location = "Command") or ($location = "Citadel") or ($location = "Computer"))
	if ($location <> "Computer")
		send "C"
		waitfor "Computer command [TL="
	else
		setvar $startlocation "comp"
	end
else
	setvar $switchboard~message "ZTM must be started from Command, Computer, or Citadel prompt.*"
	gosub :switchboard~switchboard
end

if ($location = "Command")

	if ($map~stardock = 0)
		send "qvc"
		settextlinetrigger getbackdock :getbackdock "The StarDock is located in sector"
		pause

		:getbackdock
		killalltriggers
		getword currentline $map~stardock 7

		waitfor "Computer command [TL="
	end
end
# --- INIT VARIABLES ---
:initvars
setvar $maxsector sectors
# testing purposes going from 10011 to 10100
# setVar $maxSector 500

setvar $forwardi 2
setvar $backi $maxsector
# How many paths to do at once.
setvar $sectorstofind 40
setvar $forwardsectors 0

# ADD THESE IN LATER
loadvar $dztm_resumepass
loadvar $dztm_resumesectorforward

setvar $bot~user_command_line ($bot~user_command_line & " ")
setvar $useone 0
getwordpos $bot~user_command_line $pos "one"
if ($pos > 0)
	setvar $useone 1
end

setvar $error 0

getwordpos $bot~user_command_line $pos "p:"
if ($pos > 0)
	gettext $bot~user_command_line $value "p:" " "
	isnumber $number $value

	if ($number = 1)
		if ($value > 6)
			setvar $error 1
		else
			setvar $dztm_resumepass $value
			savevar $dztm_resumepass
		end

	else
		setvar $error 1
	end
end

setvar $sendstats 1
getwordpos $bot~user_command_line $pos "noreport"
if ($pos > 0)
	setvar $sendstats 0

end

if ($error = 1)
	setvar $switchboard~message "Please use format >ztm p:2 s:400*"
	gosub :switchboard~switchboard
	halt
end

getwordpos $bot~user_command_line $pos "s:"
if ($pos > 0)
	gettext $bot~user_command_line $value "s:" " "
	isnumber $number $value
	if ($number = 1)
		if ($value < 2) or ($value > sectors)
			setvar $error 1
		else
			setvar $dztm_resumesectorforward $value
			savevar $dztm_resumesectorforward
		end

	else
		setvar $error 1
	end
else
	# Just to be safe we'll take one loop off
	setvar $dztm_resumesectorforward ($dztm_resumesectorforward - $sectorstofind)
	if ($dztm_resumesectorforward < 2)
		setvar $dztm_resumesectorforward 2
	end

end

if ($error = 1)
	setvar $switchboard~message "Please use format >ztm p:2 s:400*"
	gosub :switchboard~switchboard
	halt
end

if ($dztm_resumesectorforward > 0)
	setvar $forwardi $dztm_resumesectorforward
end

setvar $warpscheckedi 0
setarray $sendreport sectors

# --- INIT PROGRAM ---
:init
send "V0*YY"
waitfor "Computer command [TL="
gosub :player~quikstats

:start
if ($forwardi > $maxsector)
	setvar $forwardi 2
end
if ($dztm_resumepass = 7)

	setvar $msg "ZTM Appears to be complete, use >ztm p:0 s:2 to reset*"
	setvar $switchboard~message $msg
	gosub :switchboard~switchboard
	if ($startlocation <> "comp")
		send "q"
	end
	halt
else

	setvar $msg "Starting ZTM from Pass: " & $dztm_resumepass & " Sector: " & $forwardi & "*"
	setvar $switchboard~message $msg
	gosub :switchboard~switchboard
end

setvar $forwardsectorsfound 0
setvar $letslook 1
setvar $donepasses 0

while ($letslook = 1)

	:resumepasses
	while ($forwardsectorsfound < $sectorstofind)

		if (sector.warpcount[$forwardi] = $dztm_resumepass)
			add $forwardsectorsfound 1
			setvar $forwardsectors[$forwardsectorsfound] $forwardi
			echo "Checking: " $forwardi " has " sector.warpcount[$forwardi] " looking for " $dztm_resumepass "*"
			add $warpscheckedi 1
		else
			echo "Skip: " $forwardi " has " sector.warpcount[$forwardi] " looking for " $dztm_resumepass "*"
		end

		add $forwardi 1
		if ($forwardi > $maxsector)

			if ($dztm_resumepass < 7)
				# Start Next Pass
				add $dztm_resumepass 1
				savevar $dztm_resumepass

				setvar $forwardi 2
				if ($dztm_resumepass = 7)
					setvar $letslook 0
				end
			elseif ($dztm_resumepass = 7)
				setvar $letslook 0
			end
			goto :breakoutsearch
		end
	end

	:breakoutsearch
	setvar $i 1
	while ($i <= $forwardsectorsfound)
		gosub :checkconnection
		if ($dztm_resumepass > 0)
			setvar $y 1
			while ($y <= sector.warpcount[$forwardsectors[$i]])
				send "v" sector.warps[$forwardsectors[$i]][$y] "*"
				add $y 1
			end

		end

		setvar $othersector $maxsector
		subtract $othersector $forwardsectors[$i]
		if ($useone = 1)
			send "f" $forwardsectors[$i] "*1**"
		else
			send "f" $forwardsectors[$i] "*" $othersector "**"
		end

		if ($dztm_resumepass > 0)
			send "v0*yy"
		end
		add $i 1
	end

	gosub :waitforcomplete

	# Check Stats

	if ($sendstats = 1) and ($warpscheckedi > 200)

		setvar $i 1
		setvar $warpscheckedi 0
		while ($i <= sectors)

			if (sector.warpcount[$i] = 6)

				if (sector.backdoorcount[$i] > 0)
					if ($sendreport[$i] = 0)
						setvar $sendreport[$i] 1
						if ($i <> $map~stardock)
							send "'Potenial Class 0 Sector: " $i " backdoor: " sector.backdoors[$i][1] "*"
						end
					end
				end
			end

			add $i 1
		end

	end
	# Remove
	setvar $dztm_resumesectorforward $forwardi
	savevar $dztm_resumesectorforward

	setvar $forwardsectorsfound 0
	setvar $forwardsectors 0

end

### CHECK BACKDOORS
setvar $donepasses 1
setvar $msg "Checking Backdoors.*"
setvar $switchboard~message $msg
gosub :switchboard~switchboard

:resumebackdoor
setvar $checki 2
setvar $forwardsectorsfound 0
setvar $forwardsectors 0
setvar $forwardsectorsto 0

while ($checki < $maxsector)

	if (sector.backdoorcount[$checki] > 0)
		setvar $check 0
		setvar $checky 1
		while ($checky <= sector.backdoorcount[$checki])

			add $forwardsectorsfound 1
			setvar $forwardsectors[$forwardsectorsfound] $checki
			setvar $forwardsectorsto[$forwardsectorsfound] sector.backdoors[$checki][$checky]

			add $checky 1
		end

	end
	add $checki 1
	if ($forwardsectorsfound >= $sectorstofind)
		gosub :checkconnection
		setvar $i 1
		while ($i <= $forwardsectorsfound)
			send "f" $forwardsectors[$i] "*" $forwardsectorsto[$i] "**"
			add $i 1
		end
		setvar $forwardsectorsfound 0
		setvar $forwardsectors 0
		setvar $forwardsectorsto 0
		send "@"
		waitfor "Average Interval Lag"

	end

end

gosub :checkconnection
setvar $i 1
while ($i <= $forwardsectorsfound)

	send "f" $forwardsectors[$i] "*" $forwardsectorsto[$i] "**"

	add $i 1
end
setvar $forwardsectorsfound 0
setvar $forwardsectors 0
setvar $forwardsectorsto 0
gosub :waitforcomplete

if ($startlocation <> "comp")
	send "q"
end
setvar $msg "Ztm is Complete!*"
setvar $switchboard~message $msg
gosub :switchboard~switchboard

halt

:waitforcomplete
killalltriggers
setdelaytrigger     timeout :timeout 		90000
settextlinetrigger  finishedpaths :finishedpaths	"Average Interval Lag"
send "@"
pause

:timeout
killtrigger finishedpaths
gosub :waitforsaferesume

setvar $forwardsectorsfound 0
if ($donepasses = 1)
	goto :resumebackdoor
else
	# go back a bit ot make sure we don't miss any warps
	subtract $forwardi 100
	if ($forwardi < 2)
		setvar $forwardi 2
	end
	goto :resumepasses
end
halt

:finishedpaths
killtrigger timeout
#waitfor "�PlScn"
return

:waitforsaferesume
setvar $tagline				"[ZTM]"
setvar $taglineb			"[ZTM]"
killalltriggers
echo "**" & ansi_14 & $taglineb & ansi_15 & " Disconnected **"

:disco_test
if (connected <> true)
	setdelaytrigger		emancipate_cpu		:emancipate_cpu 3000
	echo "**" & ansi_14 & $taglineb & ansi_15 & " Auto Resume Initiated - Awaiting Connection!**"
	pause

	:emancipate_cpu
	goto :disco_test
end
waitfor "(?="
setdelaytrigger		waitingabit		:waitingabit	10000
echo "**" & ansi_14 & $taglineb & ansi_15 & " Connected - Will resume in 10 seconds**"
pause

:waitingabit
killalltriggers
gosub :player~quikstats
setvar $location $player~current_prompt

if ($location = "Command")
	send "c"
	waitfor "<Computer activated>"
	setvar $switchboard~message $taglineb&" - Restarting!*"
	gosub :switchboard~switchboard
	return
elseif ($location = "Citadel")
	setvar $switchboard~message $taglineb&" - Restarting!*"
	gosub :switchboard~switchboard
	send "c"
	waitfor "<Computer activated>"
	return
else
	setvar $switchboard~message $taglineb&" - Connection returned but wrong prompt - halting.."
	gosub :switchboard~switchboard
	halt
end

return

:checkconnection
if (connected <> true)
	halt
end

return
#INCLUDES:
include "source\include\player"
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
