gosub :BOT~loadVars
loadVar $game~MULTIPLE_PHOTONS
loadvar $bot~mombot_directory

loadVar $MULTIPLE_PHOTONS
fileExists $doesHelpFileExist "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt"
if ($doesHelpFileExist <> TRUE)
	write "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt" "- "&$command&" [on/off] {a/d/p/s} {return}    "
	write "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt" "      {a}djacent - photons adjacent sector when fig/limp/armid hit "
	write "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt" "      {d}ensity  - constant density scan, photons on density change"
	write "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt" "      {p}lanet   - standard planet warp photon script"
	write "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt" "      {s}urround - attempts to foton retreat sector"
	write "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt" "                                                "
	write "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt" "      {holo}     - Holoscan after firing"
	write "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt" "      {return}   - Returns Planet Home after Pwarp"
	write "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt" "                                                "
	write "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt" "      Authors: Mind Dagger and The Bounty Hunter "

	send "'{" $bot~bot_name "} - Writing help file for "&$command&" in Help directory.*"
end

	getSectorParameter SECTORS "FIGSEC" $isFigged
	if ($isFigged = "")
		send "'{" $bot~bot_name "} - It appears no grid data is available.  Run a fighter grid checker that uses the sector parameter FIGSEC. (Try figs command)*"
		halt
	end

getWord $bot~user_command_line $bot~parm1 1
getWord $bot~user_command_line $bot~parm2 2
getWord $bot~user_command_line $bot~parm3 3
getWord $bot~user_command_line $bot~parm4 4
getWord $bot~user_command_line $bot~parm5 5
getWord $bot~user_command_line $bot~parm6 6
getWord $bot~user_command_line $bot~parm7 7
getWord $bot~user_command_line $bot~parm8 8
getWordPos " "&$bot~user_command_line&" " $pos " return "
if ($pos > 0)
	setVar $auto_return TRUE
else
	setVar $auto_return FALSE
end

getWordPos " "&$bot~user_command_line&" " $pos " holo "
if ($pos > 0)
	setVar $holo 1
else
	setVar $holo 0
end
# ============================== START FOTON CHECK SUB ==============================
:foton_check
	gosub :quikstats
	setVar $startingLocation $CURRENT_PROMPT
	if ($bot~parm2 = "d")
                goto :start_dtorp
        elseif ($bot~parm2 = "a")
                goto :adjphoton
        elseif ($bot~parm2 = "s")
                goto :surround_foton
        elseif (($bot~parm2 = "p") or ($bot~parm2 = ""))
                goto :foton
        elseif ($isnum = 1)
		if (($bot~parm2 > 10) and ($bot~parm2 <= SECTORS) and ($bot~parm2 <> STARDOCK))
			gosub :quikstats
                        goto :foton_launch
		elseif (($bot~parm2 < 10) or ($bot~parm2 >= SECTORS) or ($bot~parm2 = STARDOCK))
			send "'{" $bot~bot_name "} - Not a Valid FOTON Sector*"
			halt
		end
	else
        	send "'{" $bot~bot_name "} - Please use foton [on/off] {a/d/p/s} {return} format*"
        	halt
        end
# ============================== END FOTON CHECK SUB ==============================


:planetPhotonTriggers

	killalltriggers
	setTextLineTrigger 1 :foton_pwplimp "Limpet mine in "
	setTextLineTrigger 2 :foton_pwparmid "Your mines in "
	setTextLineTrigger 3 :foton_fighit "Deployed Fighters Report Sector "
	setTextLineTrigger 4 :foton_pwpdisrupt "disrupted all of your mines in "
	pause

:surroundPhotonTriggers

	killalltriggers
	#setTextLineTrigger 1 :foton_pwplimp "Limpet mine in "
	#setTextLineTrigger 2 :foton_pwparmid "Your mines in "
	setTextLineTrigger 3 :surround_foton_fighit "Deployed Fighters Report Sector "
	setTextLineTrigger 4 :foton_pwpdisrupt "disrupted all of your mines in "
	pause

:setAdjacentTriggers
	killalltriggers
	setVar $warpies 1
	setDelayTrigger 1 :load_photon 300000
	While ($warpies <= $pwarps)
		setTextTrigger phot&$warpies :shoot&$warpies "Deployed Fighters Report Sector "&SECTOR.WARPS[$psec][$warpies]&":"
		setTextTrigger limp&$warpies :shoot&$warpies "Limpet mine in "&SECTOR.WARPS[$psec][$warpies]&" activated"
		add $warpies 1
	end
	pause




# ============================== ADJACENT PHOTON (ADJPHOTON) ==============================
:adjphoton

	gosub :quikstats
	setVar $startingLocation $CURRENT_PROMPT
	if ($startingLocation <> "Citadel") and ($startingLocation <> "Command")
		send "'{" $bot~bot_name "} - Must start at Citadel or Command prompt*"
		halt
	end
	if ($bot~parm1 <> "on") and ($bot~parm1 <> "off") and ($bot~parm1 <> "reset")
		send "'{" $bot~bot_name "} - Please use - foton [on/off/reset] format*"
		halt
	end
	if ($bot~parm1 = "on")
		goto :load_photon
	elseif ($bot~parm1 = "reset")
		send "'{" $bot~bot_name "} - Adjacent Foton - Resetting Sector*"
		goto :load_photon
	else
		send "'{" $bot~bot_name "} - Please use - foton [on/off/reset] {a/d/s/p} format*"
		halt
	end



:load_photon
	if ($startingLocation <> "Citadel") and ($startingLocation <> "Command")
		send "'{" $bot~bot_name "} - Must start at Citadel or Command prompt*"
		halt
	end
	if ($startingLocation = "Citadel")
		send "s*"
		waitFor "<Scan Sector>"
		waitFor "(?="
	elseif ($startingLocation = "Command")
		send "*zn"
		waitFor "<Re-Display>"
		waitFor "Command [TL"
	end
	gosub :quikstats
	if ($PHOTONS = 0)
		send "'{" $bot~bot_name "} - Out of Fotons - Adjacent Foton Deactivated*"
		setVar $mode "General"
		halt
	end
	if ($CURRENT_SECTOR <> $psec) and ($psec <> 0)
		send "'{" $bot~bot_name "} - Resetting Adjacent Photon to Sector " $CURRENT_SECTOR "*"
		setVar $psec $CURRENT_SECTOR
	end
	setVar $psec $CURRENT_SECTOR
		send "'{" $bot~bot_name "} - Adjacent Foton Running in Sector " $psec " - " $PHOTONS " Photon(s) Aboard!*"
	setVar $pwarps SECTOR.WARPCOUNT[$psec]
	goto :setAdjacentTriggers

:shoot1
	send "c  p  y  " SECTOR.WARPS[$psec][1] "**  q*"
	killtrigger shot
	killtrigger missed
	setTextTrigger shot :shot1 "Photon Missile launched into sector "&SECTOR.WARPS[$psec][1]
	setTextTrigger missed :missed1 "<Computer deactivated>"
	pause

:missed1
	killtrigger shot
	goto :setAdjacentTriggers

:shot1
	killtrigger missed
	getWord CURRENTLINE $spoof 1
	if ($spoof <> "Deployed") and ($spoof <> "Limpet")
		goto :setAdjacentTriggers
	end
	send "'{" $bot~bot_name "} - Adjacent Foton Fired -> Sector " SECTOR.WARPS[$psec][1] "*"
    if ($holo)
    	gosub :doholo
    end
	subtract $photons 1
	if ($photons = 0)
		send "'{" $bot~bot_name "} - Out of Fotons - Adjacent Foton Deactivated*"
		setVar $mode "General"
		halt
	end
	setDelayTrigger cool :setAdjacentTriggers 500
	pause
	goto :setAdjacentTriggers

:shoot2
	getWord CURRENTLINE $spoof 1
	if ($spoof <> "Deployed") and ($spoof <> "Limpet")
		goto :setAdjacentTriggers
	end
	send "c  p  y  " SECTOR.WARPS[$psec][2] "**  q*"
	killtrigger shot
	killtrigger missed
	setTextTrigger shot :shot2 "Photon Missile launched into sector "&SECTOR.WARPS[$psec][2]
	setTextTrigger missed :missed2 "<Computer deactivated>"
	pause

:missed2
	killtrigger shot
	goto :setAdjacentTriggers

:shot2
	killtrigger missed
	send "'{" $bot~bot_name "} - Adjacent Foton Fired -> Sector " SECTOR.WARPS[$psec][2] "*"
    if ($holo)
    	gosub :doholo
    end
	subtract $photons 1
	if ($photons = 0)
		send "'{" $bot~bot_name "} - Out of Fotons - Adjacent Foton Deactivated*"
		halt
	end
	goto :setAdjacentTriggers

:shoot3
	getWord CURRENTLINE $spoof 1
	if ($spoof <> "Deployed") and ($spoof <> "Limpet")
		goto :setAdjacentTriggers
	end
	send "c  p  y  " SECTOR.WARPS[$psec][3] "**  q*"
	killtrigger shot
	killtrigger missed
	setTextTrigger shot :shot3 "Photon Missile launched into sector "&SECTOR.WARPS[$psec][3]
	setTextTrigger missed :missed3 "<Computer deactivated>"
	pause

:missed3
	killtrigger shot
	goto :setAdjacentTriggers

:shot3
	killtrigger missed
        send "'{" $bot~bot_name "} - Adjacent Foton Fired -> Sector " SECTOR.WARPS[$psec][3] "*"
    if ($holo)
    	gosub :doholo
    end
	subtract $photons 1
	if ($photons = 0)
		send "'{" $bot~bot_name "} - Out of Fotons - Adjacent Foton Deactivated*"
		halt
	end
	goto :setAdjacentTriggers

:shoot4
	getWord CURRENTLINE $spoof 1
	if ($spoof <> "Deployed") and ($spoof <> "Limpet")
		goto :setAdjacentTriggers
	end
	send "c  p  y  " SECTOR.WARPS[$psec][4] "**  q*"
	killtrigger shot
	killtrigger missed
	setTextTrigger shot :shot4 "Photon Missile launched into sector "&SECTOR.WARPS[$psec][4]
	setTextTrigger missed :missed4 "<Computer deactivated>"
	pause

:missed4
	killtrigger shot
	goto :setAdjacentTriggers

:shot4
	killtrigger missed
	send "'{" $bot~bot_name "} - Adjacent Foton Fired -> Sector " SECTOR.WARPS[$psec][4] "*"
    if ($holo)
    	gosub :doholo
    end
	subtract $photons 1
	if ($photons = 0)
		send "'{" $bot~bot_name "} - Out of Fotons - Adjacent Foton Deactivated*"
		halt
	end
	goto :setAdjacentTriggers
	
:shoot5
	getWord CURRENTLINE $spoof 1
	if ($spoof <> "Deployed") and ($spoof <> "Limpet")
		goto :setAdjacentTriggers
	end
	send "c  p  y  " SECTOR.WARPS[$psec][5] "**  q*"
	killtrigger shot
	killtrigger missed
	setTextTrigger shot :shot5 "Photon Missile launched into sector "&SECTOR.WARPS[$psec][5]
	setTextTrigger missed :missed5 "<Computer deactivated>"
	pause

:missed5
	killtrigger shot
	goto :setAdjacentTriggers

:shot5
	killtrigger missed
	send "'{" $bot~bot_name "} - Adjacent Foton Fired -> Sector " SECTOR.WARPS[$psec][5] "*"
    if ($holo)
    	gosub :doholo
    end
	subtract $photons 1
	if ($photons = 0)
		send "'{" $bot~bot_name "} - Out of Fotons - Adjacent Foton Deactivated*"
		halt
	end
	goto :setAdjacentTriggers

:shoot6
	getWord CURRENTLINE $spoof 1
	if ($spoof <> "Deployed") and ($spoof <> "Limpet")
		goto :setAdjacentTriggers
	end
	send "c  p  y  " SECTOR.WARPS[$psec][6] "**  q*"
	killtrigger shot
	killtrigger missed
	setTextTrigger shot :shot6 "Photon Missile launched into sector "&SECTOR.WARPS[$psec][6]
	setTextTrigger missed :missed6 "<Computer deactivated>"
	pause

:missed6
	killtrigger shot
	goto :setAdjacentTriggers

:shot6
	killtrigger missed
	send "'{" $bot~bot_name "} - Adjacent Foton Fired -> Sector " SECTOR.WARPS[$psec][6] "*"
    if ($holo)
    	gosub :doholo
    end
	subtract $photons 1
	if ($photons = 0)
		send "'{" $bot~bot_name "} - Out of Fotons - Adjacent Foton Deactivated*"
		halt
	end
	goto :setAdjacentTriggers
# ============================== END ADJ PHOTON (PHOTON) SUB ==============================


# ======================     START DENSITY PHOTON (DTORP) SUBROUTINE    ==========================
:start_dtorp
	gosub :quikstats
	setVar $startingLocation $CURRENT_PROMPT
	setArray $adj 7
	setArray $dens 7
	setArray $adjsec 7
	setArray $density 7
	if ($startingLocation = "Command")
		goto :checkndtorps
	elseif ($startingLocation = "Planet")
		gosub :getPlanetInfo
		send "q"
		goto :checkndtorps
	elseif ($startingLocation = "Citadel")
		send "q"
		gosub :getPlanetInfo
		send "q"
		goto :checkndtorps
	elseif ($startingLocation = "<StarDock>")
		send "q"
		goto :checkndtorps
	else
		send "'{" $bot~bot_name "} - Must be run from Command, Planet, Citadel, or Stardock Prompt.*"
		halt
	end

:checkndtorps
	send "cp*q"
	waitFor "Command [TL="
	setTextTrigger anyphots :anyphots "Photon Missiles left."
	setTextTrigger hmmtorps :hmmtorps "You do not have any Photon Missiles!"
	setTextTrigger fed :feds "The Feds do not permit protected"
	pause

:anyphots
	killTrigger fed
	killTrigger hmmtorps
	gosub :turnOffAnsi
	goto :check_dens

:feds
	send "'{" $bot~bot_name "} - Can't launch from fedspace*"
	halt

:hmmtorps
	send "'{" $bot~bot_name "} - No Fotons*"
	halt

:check_dens
	setVar $mm 0
	setVar $i 0
	send "s d"
	waitFor "Relative Density Scan"

:dtorp_Start
	killTrigger alldone
	setTextLineTrigger getSec :getSec "Sector"
	setTextTrigger allDone :allDone "Command [TL="
	pause

:getSec
	add $i 1
	getText CURRENTLINE $Adj[$i] "Sector" "==>"
	stripText $adj[$i] "("
	stripText $adj[$i] ")"
	stripText $adj[$i] " "
	getText CURRENTLINE $Dens[$i] "==>" "Warps :"
	stripText $dens[$i] ","
	stripText $dens[$i] " "
	goto :dtorp_Start

:allDone
	killTrigger getSec
	gosub :firechk

:letslook
	setVar $w 0

:sublooky
	add $w 1
	if ($w > $i)
		goto :alldone
	elseif ($density[$w] <> $dens[$w])
		send "c p y " $adj[$w] "*  Q  "
		send "'{" $bot~bot_name "} - Foton Missle Fired into sector => " $adj[$w] "*"
		gosub :turnOnAnsi
		goto :dtorp_end
	else
		goto :sublooky
	end

:firechk
	add $mm 1
	if ($mm = 150)
		send "'{" $bot~bot_name "} - WARNING  Density Foton Running at My TA!!!*"
		setVar $mm 0
	end
	setVar $y 0
	send "s d"
	waitFor "Relative Density Scan"

:looky
	killtrigger manual_stop
	killtrigger dtop_dtorp
	killtrigger getsec
	killtrigger alldone
	setTextOutTrigger manual_stop :manual_stop "-"
	setTextLineTrigger dtop_dtorp :manual_stop $bot~bot_name & " foton off"
	setTextLineTrigger getSec :looksec "Sector"
	setTextTrigger allDone :donelook "Command [TL="
	pause

:looksec
	add $y 1
	getText CURRENTLINE $Adjsec[$y] "Sector" "==>"
	stripText $adjsec[$y] "("
	stripText $adjsec[$y] ")"
	stripText $adjsec[$y] " "
	getText CURRENTLINE $Density[$y] "==>" "Warps :"
	stripText $density[$y] ","
	stripText $density[$y] " "
	killtrigger dtop_dtorp
	killtrigger manual_Stop
	killtrigger alldone
	goto :looky

:donelook
	killtrigger getSec
	return

:manual_stop
	killtrigger manual_stop
	killtrigger dtop_dtorp
	killtrigger getSec
	killtrigger allDone
	send "'{" $bot~bot_name "} - Density Foton Stoped . . *"
	gosub :turnOnAnsi

:dtorp_end
	if (($startingLocation = "Planet") OR ($startingLocation = "Citadel"))
		gosub :landingSub
		halt
	else
		halt
	end
# ======================     END DENSITY PHOTON (DTORP) SUBROUTINE    ==========================


:foton
	gosub :quikstats
	setVar $startingLocation $CURRENT_PROMPT
	if ($startingLocation = "Citadel")
		goto :foton_start
	else
		send "'{" $bot~bot_name "} - Must Start at Citadel.*"
		halt
	end

:foton_start
	setVar $home_sector2 $CURRENT_SECTOR
	if ($PHOTONS <= 0)
		goto :foton_out_of_fotons
	end
	send "q"

	gosub :getPlanetInfo
	send "c"

:foton_get_figs
	send "*"
	waitFor "Citadel command (?="


:foton_go
	if ($auto_return)
		send "'{" $bot~bot_name "} - Foton Running From Planet " & $PLANET & " w/ Return Home enabled. " & $PHOTONS &" Photons armed and ready.*"
	else
		send "'{" $bot~bot_name "} - Foton Running From Planet " & $PLANET & ", " & $PHOTONS &" Photons armed and ready.*"
	end
	goto :planetPhotonTriggers




:foton_pwplimp
	gosub :foton_limphit
	goto :foton_pwp_go

:foton_pwparmid
	gosub :foton_minehit
	goto :foton_pwp_go


:foton_pwpdisrupt
	gosub :foton_disrupt
	killalltriggers
	setVar $i 1
	setVar $checkSector SECTOR.WARPS[$sector][$i]
	setVar $isFound FALSE
	while (($checkSector > 0) AND ($isFound = FALSE))
		getSectorParameter $checkSector "FIGSEC" $isFigged
		if ($isFigged <> TRUE)
			setVar $adjsec $checkSector
			setVar $isFound TRUE
		else
			add $i 1
			setVar $checkSector SECTOR.WARPS[$sector][$i]
		end
	end
	if ($isFound)
		setVar $i 2

		setVar $checkSector SECTOR.WARPS[$retreatSector][$i]
		setVar $isFound FALSE
		setVar $targets ""
		setVar $targetCount 0
		while ($checkSector > 0)
			getSectorParameter $checkSector "FIGSEC" $isFigged
			if (($isFigged = TRUE) AND ($checkSector <> $sector))
				setVar $targets $targets&" "&$checkSector&" "
				add $targetCount 1
			end
			setVar $checkSector SECTOR.WARPS[$retreatSector][$i]
			add $i 1
		end
		if ($targetCount > 0)
			:tryDisruptFotonAgain
				killalltriggers
				getWord $targets $sector $targetCount
				setVar $targetCount ($targetCount-1)
				send "p" $sector "*y c p y " $adjsec "**q"
				setTextLineTrigger	wrong	:foton_wrong	"That is not an adjacent sector"
				setTextLineTrigger	gotem	:foton_gotem	"Photon Missile launched into sector"
				setTextLineTrigger	wrong2	:foton_wrong2	"The Feds do not permit Photon Torpedos"
				pause
		else
			echo "** No Adjacent Fig Next To Possible Retreat Sector **"
		end
	else
		echo "** No Possible Disrupt Sector **"
	end



:foton_pwpfig
	#gosub :foton_fighit

:foton_pwp_go
	killalltriggers
	gosub :foton_get_adj
	send "p" $adjsec "*y c p y " $sector "**q"
	setTextLineTrigger	wrong	:foton_wrong	"That is not an adjacent sector"
	setTextLineTrigger	gotem	:foton_gotem	"Photon Missile launched into sector"
	setTextLineTrigger	wrong2	:foton_wrong2	"The Feds do not permit Photon Torpedos"
	pause

:foton_wrong2
	killtrigger gotem
	send "'{" $bot~bot_name "} - Foton Missed! Resetting!*"
	if ($auto_return)
		gosub :foton_go_home
	end
	goto :planetPhotonTriggers

:foton_wrong
	killtrigger gotem
	send "'{" $bot~bot_name "} - Foton Missed! Resetting!*"
	setSectorParameter $adjsec "FIGSEC" FALSE
	if ($auto_return)
		gosub :foton_go_home
	end
	goto :planetPhotonTriggers

:foton_gotem
	killtrigger wrong
	send "'{" $bot~bot_name "} - Foton Fired - Sector => " $sector "!*"
	if ($auto_return)
		gosub :foton_go_home
	end
	gosub :quikstats
	if ($PHOTONS = 0)
		goto :foton_out_of_fotons
	end
	if ($MULTIPLE_PHOTONS <> TRUE)
		setTextLineTrigger waitingforcooldown :exitcooldown "Photon Wave Duration has ended in sector "&$sector
		pause
		:exitcooldown
	end
	goto :planetPhotonTriggers

:foton_go_home
	send "p" $home_sector2 "*y"
	SetTextLineTrigger homelock :foton_home_lock "Locating beam pinpointed"
	setTextLineTrigger nohomelock :foton_no_home_lock "Your own fighters must be"
	setTextLineTrigger home_now :foton_home_lock "You are already in that sector!"
	pause

	:foton_no_home_lock
		killtrigger homelock
		killtrigger nohomelock
		killtrigger home_now
		send "'{" $bot~bot_name "} - PWarp Lock To Home Failed.*"

        :foton_home_lock
		killtrigger homelock
		killtrigger nohomelock
		killtrigger home_now
	return
:foton_get_adj
	setVar $adjsec 0
	setVar $i 1
	while (SECTOR.WARPS[$Sector][$i] > 0)
		getSectorParameter SECTOR.WARPS[$Sector][$i] "FIGSEC" $isFigged
		if ($isFigged)
			setVar $adjsec SECTOR.WARPS[$Sector][$i]
			return
		end
		add $i 1
	end
	if ($adjsec <= 0)
		echo ANSI_12 "No Adjacent fig found*" ANSI_7
		goto :planetPhotonTriggers
	end
	return

:foton_disrupt
	getText CURRENTLINE&"[][]" $sector " disrupted all of your mines in " "[][]"
	isNumber $result $sector
	if ($result < 1)
		goto :planetPhotonTriggers
	end				
return

:foton_limphit
	cutText CURRENTLINE&"      " $ck 1 6
	if ($ck <> "Limpet")
		goto :planetPhotonTriggers
	end
	getWord CURRENTLINE $sector 4
	return

:foton_minehit
	cutText CURRENTLINE&"    " $ck 1 4
	if ($ck <> "Your")
		goto :planetPhotonTriggers
	end
	getWord CURRENTLINE $sector 4
	return

:foton_fighit
	# Check for spoofs
	
	getWord CURRENTLINE $spoof_test 1
	getWord CURRENTANSILINE $ansi_spoof_test 1
	getWordPos $ansi_spoof_test $ansi_spoof_pos #27 & "[1;33m"
	if ($spoof_test <> "Deployed") OR ($ansi_spoof_pos <= 0)
	     goto :planetPhotonTriggers
	end

	# Torp only on sector entry
	getWordPos CURRENTLINE $pos "entered sector."
	if ($pos < 1)
		goto :planetPhotonTriggers
	end

	# Check for alien hits
	getText CURRENTANSILINE $alien_check ": " "'s"
	getWordPos $alien_check $pos #27 & "[1;36m" & #27 & "["
	if ($pos > 0)
		goto :planetPhotonTriggers
	end

	# Get the sector number
	getWord CURRENTLINE $sector 5
	stripText $sector ":"
	isNumber $result $sector
	if ($result < 1)
		goto :planetPhotonTriggers
	end
	if (($sector > SECTORS) OR ($sector <= 10))
		 goto :planetPhotonTriggers
	end
	goto :foton_pwp_go
	#getText CURRENTANSILINE $sector #27&"[K"&#27&"[1A"&#27&"[1;33mDeployed Fighters "&#27&"[0;32mReport Sector "&#27&"[1;33m" #27&"[0;32m: "&#27&"[1;36m"
	#if ((($radio = "R") OR ($radio = "F") OR ($sector = "") OR ($sector = "0")))
	#	goto :planetPhotonTriggers
	#end
	#getText CURRENTANSILINE $alien_check $START_FIG_HIT_OWNER $END_FIG_HIT_OWNER
	#getWordPos CURRENTLINE $pos $START_FIG_HIT_OWNER
	#getWordPos $alien_check $apos $ALIEN_ANSI
	#if (($apos > 0) OR ($pos <= 0))
	#	goto :planetPhotonTriggers
	#end
#return

:foton_out_of_fotons
	send "'{" $bot~bot_name "} - No photon missles, Foton mode shutting down.*"
	halt

:surround_foton
	gosub :quikstats
	setVar $startingLocation $CURRENT_PROMPT
	if ($startingLocation = "Citadel")
		goto :surround_foton_start
	else
		send "'{" $bot~bot_name "} - Must Start at Citadel.*"
		halt
	end

:surround_foton_start
	setVar $home_sector2 $CURRENT_SECTOR
	if ($PHOTONS <= 0)
		goto :foton_out_of_fotons
	end
	send "q"

	gosub :getPlanetInfo
	send "c"

:surround_foton_get_figs
	send "*"
	waitFor "Citadel command (?="


:surround_foton_go
	if ($auto_return)
		send "'{" $bot~bot_name "} - Surround Foton Running From Planet " & $PLANET & " w/ Return Home enabled. " & $PHOTONS &" Photons armed and ready.*"
	else
		send "'{" $bot~bot_name "} - Surround Foton Running From Planet " & $PLANET & ", " & $PHOTONS &" Photons armed and ready.*"
	end
	goto :surroundPhotonTriggers

:surround_foton_fighit
	# Check for spoofs

	getWord CURRENTLINE $spoof_test 1
	getWord CURRENTANSILINE $ansi_spoof_test 1
	getWordPos $ansi_spoof_test $ansi_spoof_pos #27 & "[1;33m"
	if ($spoof_test <> "Deployed") OR ($ansi_spoof_pos <= 0)
	     goto :surroundPhotonTriggers
	end

	# Torp only on sector entry
	getWordPos CURRENTLINE $pos "entered sector."
	if ($pos < 1)
		goto :surroundPhotonTriggers
	end

	# Check for alien hits
	getText CURRENTANSILINE $alien_check ": " "'s"
	getWordPos $alien_check $pos #27 & "[1;36m" & #27 & "["
	if ($pos > 0)
	     goto :surroundPhotonTriggers
	end

	# Get the sector number
	getWord CURRENTLINE $sector 5
	stripText $sector ":"
	isNumber $result $sector
	if ($result < 1)
		goto :surroundPhotonTriggers
	end
	if (($sector > SECTORS) OR ($sector <= 10))
		 goto :surroundPhotonTriggers
	end
:attemptSurroundDrop
	setVar $i 1
	setVar $checkSector SECTOR.WARPS[$sector][$i]
	setVar $isFound FALSE
	while (($checkSector > 0) AND ($isFound = FALSE))
		getSectorParameter $checkSector "FIGSEC" $isFigged
		if ($isFigged <> TRUE)
			setVar $retreatSector $checkSector
			setVar $isFound TRUE
		else
			add $i 1
			setVar $checkSector SECTOR.WARPS[$sector][$i]
		end
	end

	if ($isFound)
		setVar $i 2

		setVar $checkSector SECTOR.WARPS[$retreatSector][$i]
		setVar $isFound FALSE
		setVar $targets ""
		setVar $targetCount 0
		while ($checkSector > 0)
			getSectorParameter $checkSector "FIGSEC" $isFigged
			if (($isFigged = TRUE) AND ($checkSector <> $sector))
				setVar $targets $targets&" "&$checkSector&" "
				add $targetCount 1
			end
			setVar $checkSector SECTOR.WARPS[$retreatSector][$i]
			add $i 1
		end
		if ($targetCount > 0)
			:trySurroundFotonAgain
				killalltriggers
				getWord $targets $gotoSector $targetCount
				setVar $targetCount ($targetCount-1)
				send "p" $gotoSector "*y c p y " $retreatSector "**q"
				setTextLineTrigger s_wrong	:surround_foton_wrong	"That is not an adjacent sector"
				setTextLineTrigger s_gotem	:surround_foton_gotem	"Photon Missile launched into sector"
				setTextLineTrigger s_fed	:surround_foton_fed		"The Feds do not permit Photon Torpedos"
				pause
		else
			echo "** No Adjacent Fig Next To Possible Retreat Sector **"
		end
	else
		echo "** No Possible Retreat Sector **"
	end
goto :surroundPhotonTriggers

:surround_foton_wrong
	killtrigger s_gotem
	killtrigger s_wrong
	if ($targetCount > 0)
		goto :trySurroundFotonAgain
	end
	send "'{" $bot~bot_name "} - Foton Missed! Resetting!*"
	setSectorParameter $gotoSector "FIGSEC" FALSE
	if ($auto_return)
		gosub :foton_go_home
	end
	goto :surroundPhotonTriggers

:surround_foton_wrong
	killtrigger s_gotem
	killtrigger s_fed
	if ($targetCount > 0)
		goto :trySurroundFotonAgain
	end
	send "'{" $bot~bot_name "} - Foton Missed! Resetting!*"
	if ($auto_return)
		gosub :foton_go_home
	end
	goto :surroundPhotonTriggers

:surround_foton_gotem
	killtrigger s_wrong
	killtrigger s_fed
	send "'{" $bot~bot_name "} - Foton Fired - Sector => " $retreatSector "!*"
	if ($auto_return)
		gosub :foton_go_home
	end
	gosub :quikstats
	if ($PHOTONS = 0)
		goto :foton_out_of_fotons
	end
	if ($MULTIPLE_PHOTONS <> TRUE)
		setTextLineTrigger waitingforcooldown :exitcooldownsurround "Photon Wave Duration has ended in sector "&$retreatSector
		pause
		:exitcooldownsurround
	end
	goto :surroundPhotonTriggers


:foton_launch
	killalltriggers
	send "p" $adjsec "*y c p y " $sector "**q"
	setTextLineTrigger launch_wrong :foton_launch_wrong "That is not an adjacent sector"
	setTextLineTrigger launch_gotem :foton_launch_gotem "Photon Missile launched into sector"
	setTextLineTrigger launch_wrong2 :foton_launch_wrong "The Feds do not permit Photon Torpedos to be launched into FedSpace"
	pause

:foton_launch_wrong
	killtrigger launch_gotem
	send "'{" $bot~bot_name "} - That is not an adjacent sector!*"
        HALT

:foton_launch_gotem
	killtrigger wrong
	send "'{" $bot~bot_name "} - Foton Fired - Sector => " $bot~parm2 "!*"
    if ($holo)
    	gosub :doholo
    end
        HALT



#Author: Mind Dagger
#Gets all planet information from planet prompt.
#Needs: Start from Planet prompt



# ==============================  START PLANET INFO SUBROUTINE  =================
:getPlanetInfo

	# ============================ START PLANET VARIABLES ==========================
        	setVar $CURRENT_SECTOR		0
        	setVar $PLANET			0
		setVar $PLANET_FUEL		0
		setVar $PLANET_FUEL_MAX		0
		setVar $PLANET_ORGANICS		0	
		setVar $PLANET_ORGANICS_MAX	0
		setVar $PLANET_EQUIPMENT	0
		setVar $PLANET_EQUIPMENT_MAX	0
		setVar $PLANET_FIGHTERS		0
		setVar $PLANET_FIGHTERS_MAX	0
		setVar $CITADEL			0
		setVar $CITADEL_CREDITS		0
		setVar $ATMOSPHERE_CANNON	0
		setVar $SECTOR_CANNON		0
	# ============================  END PLANET VARIABLES ==========================


	send "*"
	setTextLineTrigger planetInfo2 :planetInfo2 "Planet #"
	pause

	:planetinfo2
		setVar $CITADEL 0
		setVar $SECTOR_CANNON 0
		setVar $ATMOSPHERE_CANNON 0
		setVar $CITADEL_CREDITS 0
		getWord CURRENTLINE $PLANET 2
		stripText $PLANET "#"
		getWord CURRENTLINE $CURRENT_SECTOR 5
		stripText $CURRENT_SECTOR ":"
		waitfor "2 Build 1   Product    Amount     Amount     Maximum"

        :getPlanetStuff
		setTextLineTrigger fuelstart :fuelstart "Fuel Ore"
		setTextLineTrigger orgstart :orgstart "Organics"
		setTextLineTrigger equipstart :equipstart "Equipment"
		setTextLineTrigger figstart :figstart "Fighters        N/A"
		setTextLineTrigger citadelstart :citadelstart "Planet has a level"
		setTextLineTrigger cannon :cannonstart ", AtmosLvl="
		setTextTrigger planetInfoDone :planetInfoDone "Planet command (?=help)"
		pause

        :fuelstart
		getWord CURRENTLINE $PLANET_FUEL 6
		getWord CURRENTLINE $PLANET_FUEL_MAX 8
		stripText $PLANET_FUEL ","
		stripText $PLANET_FUEL_MAX ","
		pause

        :orgstart
		getWord CURRENTLINE $PLANET_ORGANICS 5
		getWord CURRENTLINE $PLANET_ORGANICS_MAX 7
		stripText $PLANET_ORGANICS ","
		stripText $PLANET_ORGANICS_MAX ","
		pause

        :equipstart
		getWord CURRENTLINE $PLANET_EQUIPMENT 5
		getWord CURRENTLINE $PLANET_EQUIPMENT_MAX 7
		stripText $PLANET_EQUIPMENT ","
		stripText $PLANET_EQUIPMENT_MAX ","
		pause

        :figstart
		getWord CURRENTLINE $PLANET_FIGHTERS 5
		getWord CURRENTLINE $PLANET_FIGHTERS_MAX 7
		stripText $PLANET_FIGHTERS ","
		stripText $PLANET_FIGHTERS_MAX ","
		pause

        :citadelstart
		getWord CURRENTLINE $CITADEL 5
		getWord CURRENTLINE $CITADEL_CREDITS 9
		striptext $CITADEL_CREDITS ","
		pause

	:cannonstart
		getWord CURRENTLINE $ATMOSPHERE_CANNON 5
		getWord CURRENTLINE $SECTOR_CANNON 6
		stripText $SECTOR_CANNON "SectLvl="
		striptext $SECTOR_CANNON "%"
		stripText $ATMOSPHERE_CANNON "AtmosLvl="
		striptext $ATMOSPHERE_CANNON "%"
		striptext $ATMOSPHERE_CANNON ","
		pause
	:planetInfoDone
		killtrigger citadelstart
		killtrigger cannon
	
return
# ==============================  END PLANET INFO SUBROUTINE  =================

#Author: Mind Dagger
#Gets player stats from the hitting the / key.  Also grabs the current prompt that you are at.
#The only prompt this will stall on is in the middle of chatting
#gotStats routine by Dynarri/Singularity



:quikstats

        # ============================ START QUIKSTAT VARIABLES ==========================
                setVar $CURRENT_PROMPT          "Undefined"
                setVar $PSYCHIC_PROBE           "NO"
                setVar $PLANET_SCANNER          "NO"
                setVar $SCAN_TYPE               "NONE"
                setVar $CURRENT_SECTOR          0
                setVar $TURNS                   0
                setVar $CREDITS                 0
                setVar $FIGHTERS                0
                setVar $SHIELDS                 0
                setVar $TOTAL_HOLDS             0
                setVar $ORE_HOLDS               0
                setVar $ORGANIC_HOLDS           0
                setVar $EQUIPMENT_HOLDS         0
                setVar $COLONIST_HOLDS          0
                setVar $PHOTONS                 0
                setVar $ARMIDS                  0
                setVar $LIMPETS                 0
                setVar $GENESIS                 0
                setVar $TWARP_TYPE              0
                setVar $CLOAKS                  0
                setVar $BEACONS                 0
                setVar $ATOMIC                  0
                setVar $CORBO                   0
                setVar $EPROBES                 0
                setVar $MINE_DISRUPTORS         0
                setVar $ALIGNMENT               0
                setVar $EXPERIENCE              0
                setVar $CORP                    0
                setVar $SHIP_NUMBER             0
                setVar $TURNS_PER_WARP          0
                setVar $COMMAND_PROMPT          "Command"
                setVar $COMPUTER_PROMPT         "Computer"
                setVar $CITADEL_PROMPT          "Citadel"
                setVar $PLANET_PROMPT           "Planet"
                setVar $CORPORATE_PROMPT        "Corporate"
                setVar $STARDOCK_PROMPT         "<Stardock>"
                setVar $HARDWARE_PROMPT         "<Hardware"
                setVar $SHIPYARD_PROMPT         "<Shipyard>"
                setVar $TERRA_PROMPT            "Terra"
        # ============================ END QUIKSTAT VARIABLES ==========================

        setVar $CURRENT_PROMPT          "Undefined"
        killtrigger noprompt
        killtrigger prompt1
        killtrigger prompt2
        killtrigger prompt3
        killtrigger prompt4
        killtrigger statlinetrig
        killtrigger getLine2
        setTextTrigger          prompt1         :primaryPrompts                 "(?="
        setTextLineTrigger      prompt2         :secondaryPrompts       "(?)"
        setTextLineTrigger      statlinetrig    :statStart              #179
        setTextTrigger          prompt3         :terraPrompts           "Do you wish to (L)eave or (T)ake Colonists?"
        setTextTrigger          prompt4         :terraPrompts           "How many groups of Colonists do you want to take ("
        send "^Q/"
        pause

        :primaryPrompts
                getWord currentansiline $checkPrompt 1
                getWord currentline $tempPrompt 1
                getWordPos $checkPrompt $pos #27&"[35m"
                if ($pos > 0)
                        setVar $CURRENT_PROMPT $tempPrompt
                end
                setTextLineTrigger prompt1 :primaryPrompts "(?="
                pause
        :secondaryPrompts
                getWord currentansiline $checkPrompt 1
                getWord currentline $tempPrompt 1
                getWordPos $checkPrompt $pos #27&"[35m"
                if ($pos > 0)
                        setVar $CURRENT_PROMPT $tempPrompt
                end
                setTextLineTrigger prompt2 :secondaryPrompts "(?)"
                pause
        :terraPrompts
                killtrigger prompt3
                killtrigger prompt4
                getWord currentansiline $checkPrompt 1
                getWordPos $checkPrompt $pos #27&"[35m"
                if ($pos > 0)
                        setVar $CURRENT_PROMPT "Terra"
                end
                setTextTrigger          prompt3         :terraPrompts           "Do you wish to (L)eave or (T)ake Colonists?"
                setTextTrigger          prompt4         :terraPrompts           "How many groups of Colonists do you want to take ("
                pause

        :statStart
                killtrigger prompt1
                killtrigger prompt2
                killtrigger prompt3
                killtrigger prompt4
                killtrigger noprompt
                setVar $stats ""
                setVar $wordy ""


        :statsline
                killtrigger statlinetrig
                killtrigger getLine2
                setVar $line2 CURRENTLINE
                replacetext $line2 #179 " "
                striptext $line2 ","
                setVar $stats $stats & $line2
                getWordPos $line2 $pos "Ship"
                if ($pos > 0)
                        goto :gotStats
                else
                        setTextLineTrigger getLine2 :statsline
                        pause
                end


        :gotStats
                setVar $stats $stats & " @@@"

                setVar $current_word 0
                while ($wordy <> "@@@")
                        if ($wordy = "Sect")
                                getWord $stats $CURRENT_SECTOR          ($current_word + 1)
                        elseif ($wordy = "Turns")
                                getWord $stats $TURNS                   ($current_word + 1)
                        elseif ($wordy = "Creds")
                                getWord $stats $CREDITS                 ($current_word + 1)
                        elseif ($wordy = "Figs")
                                getWord $stats $FIGHTERS                ($current_word + 1)
                        elseif ($wordy = "Shlds")
                                getWord $stats $SHIELDS                 ($current_word + 1)
                        elseif ($wordy = "Hlds")
                                getWord $stats $TOTAL_HOLDS             ($current_word + 1)
                        elseif ($wordy = "Ore")
                                getWord $stats $ORE_HOLDS               ($current_word + 1)
                        elseif ($wordy = "Org")
                                getWord $stats $ORGANIC_HOLDS           ($current_word + 1)
                        elseif ($wordy = "Equ")
                                getWord $stats $EQUIPMENT_HOLDS         ($current_word + 1)
                        elseif ($wordy = "Col")
                                getWord $stats $COLONIST_HOLDS          ($current_word + 1)
                        elseif ($wordy = "Phot")
                                getWord $stats $PHOTONS                 ($current_word + 1)
                        elseif ($wordy = "Armd")
                                getWord $stats $ARMIDS                  ($current_word + 1)
                        elseif ($wordy = "Lmpt")
                                getWord $stats $LIMPETS                 ($current_word + 1)
                        elseif ($wordy = "GTorp")
                                getWord $stats $GENESIS                 ($current_word + 1)
                        elseif ($wordy = "TWarp")
                                getWord $stats $TWARP_TYPE              ($current_word + 1)
                        elseif ($wordy = "Clks")
                                getWord $stats $CLOAKS                  ($current_word + 1)
                        elseif ($wordy = "Beacns")
                                getWord $stats $BEACONS                 ($current_word + 1)
                        elseif ($wordy = "AtmDt")
                                getWord $stats $ATOMIC                  ($current_word + 1)
                        elseif ($wordy = "Corbo")
                                getWord $stats $CORBO                   ($current_word + 1)
                        elseif ($wordy = "EPrb")
                                getWord $stats $EPROBES                 ($current_word + 1)
                        elseif ($wordy = "MDis")
                                getWord $stats $MINE_DISRUPTORS         ($current_word + 1)
                        elseif ($wordy = "PsPrb")
                                getWord $stats $PSYCHIC_PROBE           ($current_word + 1)
                        elseif ($wordy = "PlScn")
                                getWord $stats $PLANET_SCANNER          ($current_word + 1)
                        elseif ($wordy = "LRS")
                                getWord $stats $SCAN_TYPE               ($current_word + 1)
                        elseif ($wordy = "Aln")
                                getWord $stats $ALIGNMENT               ($current_word + 1)
                        elseif ($wordy = "Exp")
                                getWord $stats $EXPERIENCE              ($current_word + 1)
                        elseif ($wordy = "Corp")
                                getWord $stats $CORP                    ($current_word + 1)
                        elseif ($wordy = "Ship")
                                getWord $stats $SHIP_NUMBER             ($current_word + 1)
                        end
                        add $current_word 1
                        getWord $stats $wordy $current_word
                end
        :doneQuikstats
                killtrigger prompt1
                killtrigger prompt2
                killtrigger prompt3
                killtrigger prompt4
                killtrigger statlinetrig
                killtrigger getLine2

return
# ============================== END QUICKSTATS SUB==============================


# ============================  START PLAYER INFO SUBROUTINE  =================
:getInfo
	setVar $PHOTONS 0
	setVar $SCAN_TYPE "None"
	setVar $TWARP_TYPE 0
	setVar $corpstring "[0]"
	setVar $igstat 0
	send "I"
	waitfor "<Info>"
	:waitForInfo
		setTextLineTrigger getTraderName :getTraderName "Trader Name    :"
        	setTextLineTrigger getExpAndAlign :getExpAndAlign "Rank and Exp"
        	setTextLineTrigger getCorp :getCorp "Corp           #"
        	setTextLineTrigger getShipType :getShipType "Ship Info      :"
        	setTextLineTrigger getTPW :getTPW "Turns to Warp  :"
        	setTextLineTrigger getSect :getSect "Current Sector :"
        	setTextLineTrigger getTurns :getTurns "Turns left"
        	setTextLineTrigger getHolds :getHolds "Total Holds"
        	setTextLineTrigger getFighters :getFighters "Fighters       :"
        	setTextLineTrigger getShields :getShields "Shield points  :"
        	setTextLineTrigger getPhotons :getPhotons "Photon Missiles:"
        	setTextLineTrigger getScanType :getScanType "LongRange Scan :"
        	setTextLineTrigger getTwarpType1 :getTwarpType1 "  (Type 1 Jump):"
        	setTextLineTrigger getTwarpType2 :getTwarpType2 "  (Type 2 Jump):"
        	setTextLineTrigger getCredits :getCredits "Credits"
        	setTextLineTrigger checkig :checkig "Interdictor ON :"
		setTextTrigger getInfoDone :getInfoDone "Command [TL="
        	setTextTrigger getInfoDone2 :getInfoDone "Citadel command"
        	pause
	:getTraderName
	        setVar $TRADER_NAME CURRENTLINE
	        stripText $TRADER_NAME "Trader Name    : "
	        stripText $TRADER_NAME "3rd Class "
	        stripText $TRADER_NAME "2nd Class "
	        stripText $TRADER_NAME "1st Class "
	        stripText $TRADER_NAME "Nuisance "
	        stripText $TRADER_NAME "Menace "
	        stripText $TRADER_NAME "Smuggler Savant "
	        stripText $TRADER_NAME "Smuggler "
	        stripText $TRADER_NAME "Robber "
	        stripText $TRADER_NAME "Private "
	        stripText $TRADER_NAME "Lance Corporal "
	        stripText $TRADER_NAME "Corporal "
	        stripText $TRADER_NAME "Staff Sergeant "
	        stripText $TRADER_NAME "Gunnery Sergeant "
	        stripText $TRADER_NAME "1st Sergeant "
	        stripText $TRADER_NAME "Sergeant Major "
	        stripText $TRADER_NAME "Sergeant "
	        stripText $TRADER_NAME "Chief Warrant Officer "
	        stripText $TRADER_NAME "Warrant Officer "
	        stripText $TRADER_NAME "Terrorist "
	        stripText $TRADER_NAME "Infamous Pirate "
	        stripText $TRADER_NAME "Notorious Pirate "
	        stripText $TRADER_NAME "Dread Pirate "
	        stripText $TRADER_NAME "Pirate "
	        stripText $TRADER_NAME "Galactic Scourge "
	        stripText $TRADER_NAME "Enemy of the State "
	        stripText $TRADER_NAME "Enemy of the People "
	        stripText $TRADER_NAME "Enemy of Humankind "
	        stripText $TRADER_NAME "Heinous Overlord "
	        stripText $TRADER_NAME "Prime Evil "
	        stripText $TRADER_NAME "Ensign "
	        stripText $TRADER_NAME "Lieutenant J.G. "
	        stripText $TRADER_NAME "Lieutenant Commander "
	        stripText $TRADER_NAME "Lieutenant "
	        stripText $TRADER_NAME "Commander "
	        stripText $TRADER_NAME "Captain "
	        stripText $TRADER_NAME "Commodore "
	        stripText $TRADER_NAME "Rear Admiral "
	        stripText $TRADER_NAME "Vice Admiral "
	        stripText $TRADER_NAME "Fleet Admiral "
	        stripText $TRADER_NAME "Admiral "
	        stripText $TRADER_NAME "Civilian "
	        stripText $TRADER_NAME "Annoyance "
#	        if (($TRADER_NAME <> "bob") and ($TRADER_NAME <> "Bob") and ($TRADER_NAME <> "BOB"))
#                    setVar $OkayToUse FALSE
#               end
		pause
	:getExpAndAlign
        	getWord CURRENTLINE $EXPERIENCE 5
        	getWord CURRENTLINE $ALIGNMENT 7
        	stripText $EXPERIENCE ","
        	stripText $ALIGNMENT ","
        	stripText $ALIGNMENT "Alignment="
        	pause
	:getCorp
        	getWord CURRENTLINE $CORP 3
	        stripText $CORP ","
	        setVar $corpstring "[" & $CORP & "]"
	        pause
	:getShipType
	        getWordPos CURRENTLINE $shiptypeend "Ported="
	        subtract $shiptypeend 18
	        cutText CURRENTLINE $SHIP_TYPE 18 $shiptypeend
	        pause
	:getTPW
	        getWord CURRENTLINE $TURNS_PER_WARP 5
	        pause
	:getSect
	        getWord CURRENTLINE $CURRENT_SECTOR 4
	        pause
	:getTurns
	        getWord CURRENTLINE $TURNS 4
	        if ($TURNS = "Unlimited")
	            setVar $TURNS 65000
		    setVar $unlimitedGame TRUE
	        end
		saveVar $unlimitedGame
	        pause
	:getHolds
	        setVar $line CURRENTLINE
	        getWord $line $TOTAL_HOLDS 4
	        getWordPos $line $textpos "Ore="
	        if ($textpos <> 0)
	            cutText CURRENTLINE $temp $textpos 100
	            getWord $temp $ORE_HOLDS 1
	            stripText $ORE_HOLDS "Ore="
	        else
	            setVar $ORE_HOLDS 0
	        end
	        getWordPos $line $textpos "Organics="
	        if ($textpos <> 0)
	            cutText CURRENTLINE $temp $textpos 100
	            getWord $temp $ORGANIC_HOLDS 1
	            stripText $ORGANIC_HOLDS "Organics="
	        else
	            setVar $ORGANIC_HOLDS 0
	        end
	        getWordPos $line $textpos "Equipment="
	        if ($textpos <> 0)
	            cutText CURRENTLINE $temp $textpos 100
	            getWord $temp $EQUIPMENT_HOLDS 1
	            stripText $EQUIPMENT_HOLDS "Equipment="
	        else
	            setVar $EQUIPMENT_HOLDS 0
	        end
		getWordPos $line $textpos "Colonists="
		if ($textpos <> 0)
			cutText CURRENTLINE $temp $textpos 100
			getWord $temp $COLONIST_HOLDS 1
        		stripText $COLONIST_HOLDS "Colonists="
        	else
        		setVar $COLONIST_HOLDS 0
        	end
	        getWordPos $line $textpos "Empty="
	        if ($textpos <> 0)
	            cutText CURRENTLINE $temp $textpos 100
	            getWord $temp $EMPTY_HOLDS 1
	            stripText $EMPTY_HOLDS "Empty="
	        else
	            setVar $EMPTY_HOLDS 0
	        end
	        pause
	:getFighters
	        getWord CURRENTLINE $FIGHTERS 3
	        stripText $FIGHTERS ","
	        pause
	:getShields
	        getWord CURRENTLINE $SHIELDS 4
	        stripText $SHIELDS ","
	        pause
	:getPhotons
	        getWord CURRENTLINE $PHOTONS 3
	        pause
	:getScanType
	        getWord CURRENTLINE $SCAN_TYPE 4
	        pause
	:getTwarpType1
	        getWord CURRENTLINE $TWARP_1_RANGE 4
	        setVar $twarp_type 1
	        pause
	:getTwarpType2
	        getWord CURRENTLINE $TWARP_2_RANGE 4
	        setVar $twarp_type 2
	        pause
	:getCredits
	        getWord CURRENTLINE $CREDITS 3
	        stripText $CREDITS ","
	        if ($igstat = 0)
	                setVar $igstat "NO IG"
	        end
	        pause
	:checkig
		getWord CURRENTLINE $igstat 4
		pause

	:getInfoDone
	        killtrigger getInfoDone
	        killtrigger getInfoDone2
		killtrigger getTraderName
        	killtrigger getExpAndAlign
        	killtrigger getCorp
        	killtrigger getShipType
        	killtrigger getTPW
        	killtrigger getSect
        	killtrigger getTurns
        	killtrigger getHolds
        	killtrigger getFighters
        	killtrigger getShields
        	killtrigger getPhotons
        	killtrigger getScanType
        	killtrigger getTwarpType1
        	killtrigger getTwarpType2
        	killtrigger getCredits
        	killtrigger checkig
		
return
# ==============================  END PLAYER INFO SUBROUTINE  =================

:landingSub
        send "l" $PLANET "*z  n  z  n  *  "
	setVar $sucessfulCitadel FALSE
	setVar $sucessfulPlanet FALSE
	setTextLineTrigger noplanet :noplanet "There isn't a planet in this sector."
	setTextLineTrigger no_land :no_land "since it couldn't possibly stand"
	setTextLineTrigger planet :planet "Planet #"
	setTextLineTrigger wrongone :wrong_num "That planet is not in this sector."
	pause

:noplanet
	killtrigger no_land
	killtrigger planet
	killtrigger wrongone
	send "'{" $bot~bot_name "} - No Planet in Sector!*"
	return

:no_land
	killtrigger noplanet
	killtrigger planet
	killtrigger wrongone
	send "'{" $bot~bot_name "} - This ship cannot land!*"
	return

:planet
	getWord CURRENTLINE $pnum_ck 2
	stripText $pnum_ck "#"
	if ($pnum_ck <> $PLANET)
		killtrigger no_land
		killtrigger wrongone
		killtrigger no_planet
		send "q"
		goto :wrong_num
	end
	killtrigger noplanet
	killtrigger no_land
	killtrigger wrongone
	setTextTrigger wrong_num :wrong_num "That planet is not in this sector."
	setTextTrigger planet :planet_prompt "Planet command"
	pause

:wrong_num
	killtrigger planet
	send "**'{" $bot~bot_name "} - Incorrect Planet Number*"
	return

:planet_prompt
	killtrigger wrong_num
	setVar $currentBotPlanet $planet
	saveVar $currentBotPlanet 
	send "c"
	setTextTrigger build_cit :build_cit "Do you wish to construct one?"
	setTextTrigger in_cit :in_cit "Citadel command"
	pause

:build_cit
	killtrigger in_cit
	setVar $sucessfulPlanet TRUE
	send "n*"
	setVar $startingLocation "Planet"
	return

:in_cit
	killtrigger build_cit
	setVar $sucessfulCitadel TRUE
	setVar $startingLocation "Citadel"
return

:turnOffAnsi
	send "c n"
	killAllTriggers
	waitOn "(1) ANSI graphics"
	getWord CURRENTLINE $ansiStatus 5
	waitOn "(2) Animation display"
	getWord CURRENTLINE $animationStatus 5
	if ($animationStatus = "On")
		send "2"
	end
	if ($ansiStatus = "On")
		send "1 q q"
	else
		send "q q"
	end
	waitOn "<Computer deactivated>"
	return

:turnOnAnsi
	send "c n"
	killAllTriggers
	waitfor "(1) ANSI graphics"
	getWord CURRENTLINE $ansiStatus 5
	if ($ansiStatus = "Off")
		send "1 q q"
	else
		send "q q"
	end
	waitOn "<Computer deactivated>"
	return

:doHolo
	setVar $BOT~command "holo"
	setVar $BOT~user_command_line " holo"
	
	saveVar $BOT~command
	saveVar $BOT~user_command_line
	load "scripts\"&$bot~mombot_directory&"\commands\data\holo.cts"
	setEventTrigger        holoend1        :holoend1 "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\commands\data\holo.cts"
	pause
	:holoend1
		killalltriggers
return

#INCLUDES:
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\module_includes\bot\banner\bot"
include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\planet\getplanetinfo\planet"
include "source\bot_includes\player\turnoffansi\player"
include "source\bot_includes\player\turnonansi\player"
include "source\bot_includes\planet\landingsub\planet"
include "source\bot_includes\player\twarp\player"

