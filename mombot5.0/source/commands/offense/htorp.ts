logging off
gosub :loadvars~loadvars
gosub :help~initialize

setvar $help~help[1] $help~tab&"htorp "
setvar $help~help[2] $help~tab&"  - Holoscans and then photons if enemy in adjacent sector."
gosub :help~helpfile

#===============================START HTORP (HTORP) =================================
:htorp
gosub :player~quikstats
if ($player~scan_type <> "Holo")
	setvar $switchboard~message "You can not run htorp without a holographic scanner.*"
	gosub :switchboard~switchboard
	halt
end
setvar $player~startinglocation $player~current_prompt
if ($player~startinglocation = "Command")

elseif ($player~startinglocation = "Citadel")
	send "q "
	gosub :planet~getplanetinfo
else
	echo "*Wrong prompt for htorp.*"
	halt
end
if ($player~startinglocation = "Citadel")
	send "q szh* l " & $planet~planet & "* c "
else
	send "szh* "
end
setslinetrigger checkforholo :continuecheckholo "Select (H)olo Scan or (D)ensity Scan or (Q)uit?"
settextlinetrigger checkfordens :photonedhtorp "Relative Density Scan"
pause

:continuecheckholo
settexttrigger htorpsector :continuehtorpsector "[" & $player~current_sector & "]"
pause

:continuehtorpsector
if ($player~photons <= 0)
	echo ansi_14 & "*No Photons on hand.**" & ansi_7
	halt
end
setvar $i 1
while (sector.warps[$player~current_sector][$i] > 0)
	setvar $adj_sec sector.warps[$player~current_sector][$i]
	if (sector.tradercount[$adj_sec] > 0)
		setvar $targetinsector false
		setvar $player~corpmemberinsector false
		setvar $j 1
		while (sector.traders[$adj_sec][$j] <> 0)
			setvar $temptarget sector.traders[$adj_sec][$j]
			getlength $temptarget $targetlength
			if ($targetlength >= 4)
				cuttext $temptarget $targetcorp ($targetlength-4) 999
				gettext $targetcorp $targetcorp "[" "]"
				if ($targetcorp <> $player~corp)
					setvar $targetinsector true
				end
				if ($targetcorp = $player~corp)
					setvar $player~corpmemberinsector true
				end
			end
			add $j 1
		end
		if (($targetinsector = true) and ($player~corpmemberinsector = false) and ($adj_sec > 10) and ($adj_sec <> $map~stardock))
			send "c p y " $adj_sec "* *q"
			setvar $switchboard~message "Photon fired into sector " & $adj_sec & "!*"
			gosub :switchboard~switchboard
			halt
		end
	end
	add $i 1
end
if ($player~startinglocation = "Citadel")
	setstrigger waitforcit :continuewaitforcit "Citadel command (?=help)"
	pause

	:continuewaitforcit
end
echo ansi_14 & "*No valid targets**" & ansi_7
halt

:photonedhtorp
setvar $switchboard~message "You have no holographic scanner, perhaps you were photoned?*"
gosub :switchboard~switchboard
halt
#========================== END HTORP SUB ==============================================

#INCLUDES:
include "source\include\planet"
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
