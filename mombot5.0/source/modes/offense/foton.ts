logging off
gosub :loadvars~loadvars
gosub :help~initialize
loadvar $game~multiple_photons

setvar $help~help[1]  $help~tab&"- foton [on|off|sec] {a|d|p|s|d|t} {towship} {sector} "
setvar $help~help[2]  $help~tab&"                     {return} {den40}"
setvar $help~help[3]  $help~tab&"  Multiple use photon script.  "
setvar $help~help[4]  $help~tab&"  "
setvar $help~help[5]  $help~tab&"  Options: "
setvar $help~help[6]  $help~tab&"    {a}djacent - photons adjacent sector when"
setvar $help~help[7]  $help~tab&"                 fig/limp/armid hit"
setvar $help~help[8]  $help~tab&"    {d}ensity  - constant density scan, photons"
setvar $help~help[9]  $help~tab&"                 on density change"
setvar $help~help[10] $help~tab&"    {p}lanet   - standard planet warp photon script"
setvar $help~help[11] $help~tab&"    {s}urround - attempts to foton retreat sector"
setvar $help~help[12] $help~tab&"    d{o}ck     - sits on dock and attempts to foton"
setvar $help~help[13] $help~tab&"                 on adjacent fig hit"
setvar $help~help[14] $help~tab&"    {t}ow      - twarp tow a photon in a second ship"
setvar $help~help[15] $help~tab&"       "
setvar $help~help[16] $help~tab&"    {towship}  - Ship in sector with photon you will tow"
setvar $help~help[17] $help~tab&"    {sector}   - Apply the mode from/to that sector"
setvar $help~help[18] $help~tab&"    {return}   - Returns Planet Home after Pwarp"
setvar $help~help[19] $help~tab&"     {den40}   - Only shoots on 40 to 499 Density Change"
setvar $help~help[20] $help~tab&"      {holo}   - does holo command after firing"
setvar $help~help[21] $help~tab&"   {dockexp}   - Will pop planet to get to 1k"
setvar $help~help[22] $help~tab&"                 for dock photon"
setvar $help~help[23] $help~tab&"      {self}   - Will pwarp out, photon your current "
setvar $help~help[24] $help~tab&"                 sector, and pwarp back in. "
setvar $help~help[25] $help~tab&"      {cont}   - Will continue shooting if in density mode."
setvar $help~help[26] $help~tab&" {delwalk:n}   - Delay walk will delay the shot for this many MS."
setvar $help~help[27] $help~tab&"                 Then add another 100ms to subsequent hit."
setvar $help~help[28] $help~tab&"      "
setvar $help~help[28] $help~tab&"      Examples:   "
setvar $help~help[28] $help~tab&"           >foton 1922 "
setvar $help~help[28] $help~tab&"           >foton on d "
setvar $help~help[28] $help~tab&"           >foton p holo return"
setvar $help~help[28] $help~tab&"      "
setvar $help~help[29] $help~tab&"       Authors: Mind Dagger and The Bounty Hunter "
gosub :help~helpfile

setvar $switchboard~message "Fast Foton starting up!*"
gosub :switchboard~switchboard

getsectorparameter sectors "FIGSEC" $isfigged
if ($isfigged = "")
	setvar $switchboard~message "It appears no grid data is available.  Run a fighter grid checker that uses the sector parameter FIGSEC. (Try figs command)*"
	gosub :switchboard~switchboard
	halt
end

getword $bot~user_command_line $bot~parm1 1
getword $bot~user_command_line $bot~parm2 2
getword $bot~user_command_line $bot~parm3 3
getword $bot~user_command_line $bot~parm4 4
getword $bot~user_command_line $bot~parm5 5
getword $bot~user_command_line $bot~parm6 6
getword $bot~user_command_line $bot~parm7 7
getword $bot~user_command_line $bot~parm8 8
getwordpos " "&$bot~user_command_line&" " $pos " return "
if ($pos > 0)
	setvar $auto_return true
else
	setvar $auto_return false
end

getwordpos " "&$bot~user_command_line&" " $pos " den40 "
if ($pos > 0)
	setvar $shipchange 1
else
	setvar $shipchange 0
end

getwordpos " "&$bot~user_command_line&" " $pos " cont "
if ($pos > 0)
	setvar $dencontinue 1
else
	setvar $dencontinue 0
end

getwordpos " "&$bot~user_command_line&" " $pos " holo "
if ($pos > 0)
	setvar $holo 1
else
	setvar $holo 0
end

getwordpos " "&$bot~user_command_line&" " $pos " dockexp "
if ($pos > 0)
	setvar $dockexp 1
else
	setvar $dockexp 0
end

getwordpos " "&$bot~user_command_line&" " $pos " self "
if ($pos > 0)
	setvar $self 1
else
	setvar $self 0
end

setvar $delaywalk 0
getwordpos $bot~user_command_line $pos "delwalk:"
if ($pos > 0)

	setvar $cline $bot~user_command_line & " "
	gettext $cline $delaywalk "delwalk:" " "
else
	setvar $delaywalk 0
end

# ============================== START FOTON CHECK SUB ==============================
:foton_check
gosub :player~quikstats
setvar $startinglocation $player~current_prompt
isnumber $isnum $bot~parm1

if ($bot~parm2 = "d")
	goto :start_dtorp
elseif ($bot~parm2 = "a")
	goto :adjphoton
elseif ($bot~parm2 = "s")
	goto :surround_foton
elseif ($bot~parm2 = "r")
	goto :trap_foton
elseif ($bot~parm2 = "o")
	goto :dockphoton
elseif ($bot~parm2 = "t")
	goto :photontow
elseif (($bot~parm2 = "p") or ($bot~parm2 = ""))
	goto :foton
elseif (($isnum = 1) or ($self = true))
	if ($self)
		setvar $bot~parm1 $player~current_sector
		setvar $auto_return true
	end
	if (($bot~parm1 > 10) and ($bot~parm1 <= sectors) and ($bot~parm1 <> stardock))
		gosub :player~quikstats
		goto :photonsector
	elseif (($bot~parm1 < 10) or ($bot~parm1 >= sectors) or ($bot~parm1 = stardock))
		setvar $switchboard~message "Not a Valid FOTON Sector*"
		gosub :switchboard~switchboard
		halt
	end
else
	setvar $switchboard~message "Please use foton [on/off/sector] {a/d/p/s} {return} format*"
	gosub :switchboard~switchboard
	halt
end
# ============================== END FOTON CHECK SUB ==============================
:planetphotontriggers
killalltriggers
settextlinetrigger 1 :foton_pwplimp "Limpet mine in "
settextlinetrigger 2 :foton_pwparmid "Your mines in "
settextlinetrigger 3 :foton_fighit "Deployed Fighters Report Sector "
pause

:towphotontriggers
killalltriggers
settextlinetrigger 1 :tow_pwplimp "Limpet mine in "
settextlinetrigger 2 :tow_pwparmid "Your mines in "
settextlinetrigger 3 :tow_fighit "Deployed Fighters Report Sector "
pause

:surroundphotontriggers
killalltriggers
#setTextLineTrigger 1 :foton_pwplimp "Limpet mine in "
#setTextLineTrigger 2 :foton_pwparmid "Your mines in "
settextlinetrigger 3 :surround_foton_fighit "Deployed Fighters Report Sector "
pause

:trapphotontriggers
killalltriggers
#setTextLineTrigger 1 :foton_pwplimp "Limpet mine in "
#setTextLineTrigger 2 :foton_pwparmid "Your mines in "
settextlinetrigger 3 :trap_foton_fighit "Deployed Fighters Report Sector "
pause

:setadjacenttriggers
killalltriggers
setvar $warpies 1
setdelaytrigger 1 :load_photon 300000
while ($warpies <= $pwarps)
	settexttrigger phot&$warpies :shoot&$warpies "Deployed Fighters Report Sector "&sector.warps[$psec][$warpies]&":"
	settexttrigger limp&$warpies :shoot&$warpies "Limpet mine in "&sector.warps[$psec][$warpies]&" activated"
	add $warpies 1
end
pause

:setdocktriggers
killalltriggers
setvar $warpies 1

while ($warpies <= $pwarps)
	settexttrigger dphot&$warpies :dshoot&$warpies "Deployed Fighters Report Sector "&sector.warps[$psec][$warpies]&":"
	settexttrigger dlimp&$warpies :dshoot&$warpies "Limpet mine in "&sector.warps[$psec][$warpies]&" activated"
	add $warpies 1
end
pause

# ============================== DOCK PHOTON ==============================================
:dockphoton
setvar $startinglocation $player~current_prompt

if ($startinglocation <> "<StarDock>") and ($startinglocation <> "Command") and ($startinglocation <> "<Hardware")
	setvar $switchboard~message "Must start at Command, Stardock or Hardware*"
	gosub :switchboard~switchboard
	halt
end
if ($bot~parm1 <> "on") and ($bot~parm1 <> "off") and ($bot~parm1 <> "reset")
	setvar $switchboard~message "Please use - foton [on/off/reset] format*"
	gosub :switchboard~switchboard
	halt
end
if ($bot~parm1 = "on")
	setvar $cooloff ($game~photon_duration * 1000)

	if ($player~photons = 0)
		setvar $switchboard~message "Out of Fotons - Dock Foton Deactivated*"
		gosub :switchboard~switchboard
		setvar $mode "General"
		halt
	end
	if ($player~turns < 3)
		setvar $switchboard~message "Need a couple of turns..*"
		gosub :switchboard~switchboard
		setvar $mode "General"
		halt

	end
	if ($dockexp = 1)

		if (($player~experience < 976) and ($player~alignment >= 0))
			if ($player~fedspacephotons <> true)
				setvar $switchboard~message "Need 976 exp + for this mode.*"
				gosub :switchboard~switchboard
				setvar $mode "General"
				halt
			end
		end

		if ($player~genesis < 1)
			setvar $switchboard~message "Please buy one genesis torp*"
			gosub :switchboard~switchboard
			setvar $mode "General"
			halt
		end
		setvar $makemacro " u y n . * z c * "
	else
		if (($player~experience < 1000) and ($player~alignment >= 0))
			if ($player~fedspacephotons <> true)
				setvar $switchboard~message "Fed safe people can't shoot photons from fed..*"
				gosub :switchboard~switchboard
				setvar $mode "General"
				halt
			end
		end
		setvar $makemacro ""
	end
	setvar $switchboard~message "Dock Foton Running - Shooting from the dock at adjacent sectors!*"
	gosub :switchboard~switchboard
	setvar $psec $player~current_sector
	if ($startinglocation = "Command")
		send "psh"
	elseif ($startinglocation = "<StarDock>")
		send "h"
	end
	setvar $pwarps sector.warpcount[$psec]
	goto :setdocktriggers
else
	setvar $switchboard~message "Please use - foton [on/off/reset] {a/d/s/p/o} format*"
	gosub :switchboard~switchboard
	halt
end

:dshoot1
killalltriggers
echo "#" "Photon Missile launched into sector "&sector.warps[$psec][1] "#"
send "q q " $makemacro "  c  p  y  " sector.warps[$psec][1] "**   * q p sh"
setvar $makemacro ""
killtrigger dshot
killtrigger dmissed
settexttrigger dshot :dshot1 "Photon Missile launched into sector "&sector.warps[$psec][1]
settexttrigger dmissed :dmissed1 "<Computer deactivated>"
pause

:dmissed1
killtrigger dshot
goto :setdocktriggers

:dshot1
killtrigger dmissed
getword currentline $spoof 1
if ($spoof <> "Photon")
	goto :setdocktriggers
end
setvar $switchboard~message "Dock Foton Fired -> Sector " sector.warps[$psec][1] "*"
gosub :switchboard~switchboard

subtract $player~photons 1
if ($player~photons = 0)
	setvar $switchboard~message "Out of Fotons - Dock Foton Deactivated*"
	gosub :switchboard~switchboard
	setvar $mode "General"
	halt
end
setdelaytrigger cool :setdocktriggers $cooloff
pause
goto :setdocktriggers

:dshoot2
send "q q " $makemacro "  c  p  y  " sector.warps[$psec][2] "**   * q p sh"
setvar $makemacro ""
killtrigger dshot
killtrigger dmissed
settexttrigger dshot :dshot2 "Photon Missile launched into sector "&sector.warps[$psec][2]
settexttrigger dmissed :dmissed2 "<Computer deactivated>"
pause

:dmissed2
killtrigger dshot
goto :setdocktriggers

:dshot2
killtrigger dmissed
getword currentline $spoof 1
if ($spoof <> "Photon")
	goto :setdocktriggers
end
setvar $switchboard~message "Dock Foton Fired -> Sector " sector.warps[$psec][2] "*"
gosub :switchboard~switchboard

subtract $player~photons 1
if ($player~photons = 0)
	setvar $switchboard~message "Out of Fotons - Dock Foton Deactivated*"
	gosub :switchboard~switchboard
	setvar $mode "General"
	halt
end
setdelaytrigger cool :setdocktriggers $cooloff
pause
goto :setdocktriggers

:dshoot3
send "q q " $makemacro "  c  p  y  " sector.warps[$psec][3] "**   * q p sh"
setvar $makemacro ""
killtrigger dshot
killtrigger dmissed
settexttrigger dshot :dshot3 "Photon Missile launched into sector "&sector.warps[$psec][3]
settexttrigger dmissed :dmissed3 "<Computer deactivated>"
pause

:dmissed3
killtrigger dshot
goto :setdocktriggers

:dshot3
killtrigger dmissed
getword currentline $spoof 1
if ($spoof <> "Photon")
	goto :setdocktriggers
end
setvar $switchboard~message "Dock Foton Fired -> Sector " sector.warps[$psec][3] "*"
gosub :switchboard~switchboard

subtract $player~photons 1
if ($player~photons = 0)
	setvar $switchboard~message "Out of Fotons - Dock Foton Deactivated*"
	gosub :switchboard~switchboard
	setvar $mode "General"
	halt
end
setdelaytrigger cool :setdocktriggers $cooloff
pause
goto :setdocktriggers

:dshoot4
send "q q " $makemacro "  c  p  y  " sector.warps[$psec][4] "**   * q p sh"
setvar $makemacro ""
killtrigger dshot
killtrigger dmissed
settexttrigger dshot :dshot4 "Photon Missile launched into sector "&sector.warps[$psec][4]
settexttrigger dmissed :dmissed4 "<Computer deactivated>"
pause

:dmissed4
killtrigger dshot
goto :setdocktriggers

:dshot4
killtrigger dmissed
getword currentline $spoof 1
if ($spoof <> "Photon")
	goto :setdocktriggers
end
setvar $switchboard~message "Dock Foton Fired -> Sector " sector.warps[$psec][4] "*"
gosub :switchboard~switchboard

subtract $player~photons 1
if ($player~photons = 0)
	setvar $switchboard~message "Out of Fotons - Dock Foton Deactivated*"
	gosub :switchboard~switchboard
	setvar $mode "General"
	halt
end
setdelaytrigger cool :setdocktriggers $cooloff
pause
goto :setdocktriggers

:dshoot5
send "q q " $makemacro "  c  p  y  " sector.warps[$psec][5] "**   * q p sh"
setvar $makemacro ""
killtrigger dshot
killtrigger dmissed
settexttrigger dshot :dshot5 "Photon Missile launched into sector "&sector.warps[$psec][5]
settexttrigger dmissed :dmissed5 "<Computer deactivated>"
pause

:dmissed5
killtrigger dshot
goto :setdocktriggers

:dshot5
killtrigger dmissed
getword currentline $spoof 1
if ($spoof <> "Photon")
	goto :setdocktriggers
end
setvar $switchboard~message "Dock Foton Fired -> Sector " sector.warps[$psec][5] "*"
gosub :switchboard~switchboard

subtract $player~photons 1
if ($player~photons = 0)
	setvar $switchboard~message "Out of Fotons - Dock Foton Deactivated*"
	gosub :switchboard~switchboard
	setvar $mode "General"
	halt
end
setdelaytrigger cool :setdocktriggers $cooloff
pause
goto :setdocktriggers

:dshoot6
send "q q " $makemacro "  c  p  y  " sector.warps[$psec][6] "**   * q p sh"
setvar $makemacro ""
killtrigger dshot
killtrigger dmissed
settexttrigger dshot :dshot6 "Photon Missile launched into sector "&sector.warps[$psec][6]
settexttrigger dmissed :dmissed6 "<Computer deactivated>"
pause

:dmissed6
killtrigger dshot
goto :setdocktriggers

:dshot6
killtrigger dmissed
getword currentline $spoof 1
if ($spoof <> "Photon")
	goto :setdocktriggers
end
setvar $switchboard~message "Dock Foton Fired -> Sector " sector.warps[$psec][6] "*"
gosub :switchboard~switchboard

subtract $player~photons 1
if ($player~photons = 0)
	setvar $switchboard~message "Out of Fotons - Dock Foton Deactivated*"
	gosub :switchboard~switchboard
	setvar $mode "General"
	halt
end
setdelaytrigger cool :setdocktriggers $cooloff
pause
goto :setdocktriggers

# ============================== ADJACENT PHOTON (ADJPHOTON) ==============================
:adjphoton
gosub :player~quikstats
setvar $startinglocation $player~current_prompt
if ($startinglocation <> "Citadel") and ($startinglocation <> "Command")
	setvar $switchboard~message "Must start at Citadel or Command prompt*"
	gosub :switchboard~switchboard
	halt
end
if ($bot~parm1 <> "on") and ($bot~parm1 <> "off") and ($bot~parm1 <> "reset")
	setvar $switchboard~message "Please use - foton [on/off/reset] format*"
	gosub :switchboard~switchboard
	halt
end
if ($bot~parm1 = "on")
	goto :load_photon
elseif ($bot~parm1 = "reset")
	setvar $switchboard~message "Adjacent Foton - Resetting Sector*"
	gosub :switchboard~switchboard
	goto :load_photon
else
	setvar $switchboard~message "Please use - foton [on/off/reset] {a/d/s/p} format*"
	gosub :switchboard~switchboard
	halt
end

:load_photon
if ($startinglocation <> "Citadel") and ($startinglocation <> "Command")
	setvar $switchboard~message "Must start at Citadel or Command prompt*"
	gosub :switchboard~switchboard
	halt
end
if ($startinglocation = "Citadel")
	send "s*"
	waitfor "<Scan Sector>"
	waitfor "(?="
elseif ($startinglocation = "Command")
	send "*zn"
	waitfor "<Re-Display>"
	waitfor "Command [TL"
end
gosub :player~quikstats
if ($player~photons = 0)
	setvar $switchboard~message "Out of Fotons - Adjacent Foton Deactivated*"
	gosub :switchboard~switchboard
	setvar $mode "General"
	halt
end
if ($player~current_sector <> $psec) and ($psec <> 0)
	setvar $switchboard~message "Resetting Adjacent Photon to Sector " $player~current_sector "*"
	gosub :switchboard~switchboard
	setvar $psec $player~current_sector
end
setvar $psec $player~current_sector
setvar $switchboard~message "Adjacent Foton Running in Sector " $psec " - " $player~photons " Photon(s) Aboard!*"
gosub :switchboard~switchboard
setvar $pwarps sector.warpcount[$psec]
goto :setadjacenttriggers

:shoot1
send "c  p  y  " sector.warps[$psec][1] "**  q*"
killtrigger shot
killtrigger missed
settexttrigger shot :shot1 "Photon Missile launched into sector "&sector.warps[$psec][1]
settexttrigger missed :missed1 "<Computer deactivated>"
pause

:missed1
killtrigger shot
goto :setadjacenttriggers

:shot1
killtrigger missed
getword currentline $spoof 1
if ($spoof <> "Deployed") and ($spoof <> "Limpet")
	goto :setadjacenttriggers
end
setvar $switchboard~message "Adjacent Foton Fired -> Sector " sector.warps[$psec][1] "*"
gosub :switchboard~switchboard
if ($holo)
	gosub :doholo
end
subtract $player~photons 1
if ($player~photons = 0)
	setvar $switchboard~message "Out of Fotons - Adjacent Foton Deactivated*"
	gosub :switchboard~switchboard
	setvar $mode "General"
	halt
end
setdelaytrigger cool :setadjacenttriggers 500
pause
goto :setadjacenttriggers

:shoot2
getword currentline $spoof 1
if ($spoof <> "Deployed") and ($spoof <> "Limpet")
	goto :setadjacenttriggers
end
send "c  p  y  " sector.warps[$psec][2] "**  q*"
killtrigger shot
killtrigger missed
settexttrigger shot :shot2 "Photon Missile launched into sector "&sector.warps[$psec][2]
settexttrigger missed :missed2 "<Computer deactivated>"
pause

:missed2
killtrigger shot
goto :setadjacenttriggers

:shot2
killtrigger missed
setvar $switchboard~message "Adjacent Foton Fired -> Sector " sector.warps[$psec][2] "*"
gosub :switchboard~switchboard
subtract $player~photons 1
if ($holo)
	gosub :doholo
end
if ($player~photons = 0)
	setvar $switchboard~message "Out of Fotons - Adjacent Foton Deactivated*"
	gosub :switchboard~switchboard
	halt
end
goto :setadjacenttriggers

:shoot3
getword currentline $spoof 1
if ($spoof <> "Deployed") and ($spoof <> "Limpet")
	goto :setadjacenttriggers
end
send "c  p  y  " sector.warps[$psec][3] "**  q*"
killtrigger shot
killtrigger missed
settexttrigger shot :shot3 "Photon Missile launched into sector "&sector.warps[$psec][3]
settexttrigger missed :missed3 "<Computer deactivated>"
pause

:missed3
killtrigger shot
goto :setadjacenttriggers

:shot3
killtrigger missed
setvar $switchboard~message "Adjacent Foton Fired -> Sector " sector.warps[$psec][3] "*"
gosub :switchboard~switchboard
subtract $player~photons 1
if ($holo)
	gosub :doholo
end
if ($player~photons = 0)
	setvar $switchboard~message "Out of Fotons - Adjacent Foton Deactivated*"
	gosub :switchboard~switchboard
	halt
end
goto :setadjacenttriggers

:shoot4
getword currentline $spoof 1
if ($spoof <> "Deployed") and ($spoof <> "Limpet")
	goto :setadjacenttriggers
end
send "c  p  y  " sector.warps[$psec][4] "**  q*"
killtrigger shot
killtrigger missed
settexttrigger shot :shot4 "Photon Missile launched into sector "&sector.warps[$psec][4]
settexttrigger missed :missed4 "<Computer deactivated>"
pause

:missed4
killtrigger shot
goto :setadjacenttriggers

:shot4
killtrigger missed
setvar $switchboard~message "Adjacent Foton Fired -> Sector " sector.warps[$psec][4] "*"
gosub :switchboard~switchboard
subtract $player~photons 1
if ($holo)
	gosub :doholo
end
if ($player~photons = 0)
	setvar $switchboard~message "Out of Fotons - Adjacent Foton Deactivated*"
	gosub :switchboard~switchboard
	halt
end
goto :setadjacenttriggers

:shoot5
getword currentline $spoof 1
if ($spoof <> "Deployed") and ($spoof <> "Limpet")
	goto :setadjacenttriggers
end
send "c  p  y  " sector.warps[$psec][5] "**  q*"
killtrigger shot
killtrigger missed
settexttrigger shot :shot5 "Photon Missile launched into sector "&sector.warps[$psec][5]
settexttrigger missed :missed5 "<Computer deactivated>"
pause

:missed5
killtrigger shot
goto :setadjacenttriggers

:shot5
killtrigger missed
setvar $switchboard~message "Adjacent Foton Fired -> Sector " sector.warps[$psec][5] "*"
gosub :switchboard~switchboard
subtract $player~photons 1
if ($holo)
	gosub :doholo
end
if ($player~photons = 0)
	setvar $switchboard~message "Out of Fotons - Adjacent Foton Deactivated*"
	gosub :switchboard~switchboard
	halt
end
goto :setadjacenttriggers

:shoot6
getword currentline $spoof 1
if ($spoof <> "Deployed") and ($spoof <> "Limpet")
	goto :setadjacenttriggers
end
send "c  p  y  " sector.warps[$psec][6] "**  q*"
killtrigger shot
killtrigger missed
settexttrigger shot :shot6 "Photon Missile launched into sector "&sector.warps[$psec][6]
settexttrigger missed :missed6 "<Computer deactivated>"
pause

:missed6
killtrigger shot
goto :setadjacenttriggers

:shot6
killtrigger missed
setvar $switchboard~message "Adjacent Foton Fired -> Sector " sector.warps[$psec][6] "*"
gosub :switchboard~switchboard
subtract $player~photons 1
if ($holo)
	gosub :doholo
end
if ($player~photons = 0)
	setvar $switchboard~message "Out of Fotons - Adjacent Foton Deactivated*"
	gosub :switchboard~switchboard
	halt
end
goto :setadjacenttriggers
# ============================== END ADJ PHOTON (PHOTON) SUB ==============================

# ======================     START DENSITY PHOTON (DTORP) SUBROUTINE    ==========================
:start_dtorp
gosub :player~quikstats
setvar $startinglocation $player~current_prompt
setarray $adj 7
setarray $dens 7
setarray $adjsec 7
setarray $density 7
if ($startinglocation = "Command")
	goto :checkndtorps
elseif ($startinglocation = "Planet")
	gosub :planet~getplanetinfo
	send "q"
	goto :checkndtorps
elseif ($startinglocation = "Citadel")
	send "q"
	gosub :planet~getplanetinfo
	send "q"
	goto :checkndtorps
elseif ($startinglocation = "<StarDock>")
	send "q"
	goto :checkndtorps
else
	setvar $switchboard~message "Must be run from Command, Planet, Citadel, or Stardock Prompt.*"
	gosub :switchboard~switchboard
	halt
end

:checkndtorps
send "cp*q"
waitfor "Command [TL="
settexttrigger anyphots :anyphots "Photon Missiles left."
settexttrigger hmmtorps :hmmtorps "You do not have any Photon Missiles!"
settexttrigger fed :feds "The Feds do not permit protected"
pause

:anyphots
killtrigger fed
killtrigger hmmtorps
gosub :player~turnoffansi
goto :check_dens

:feds
setvar $switchboard~message "Can't launch from fedspace*"
gosub :switchboard~switchboard
halt

:hmmtorps
setvar $switchboard~message "No Fotons*"
gosub :switchboard~switchboard
halt

:check_dens
setvar $mm 0
setvar $i 0
send "sz*"
waiton "Relative Density Scan"

:dtorp_start
killtrigger alldone
settextlinetrigger getsec :getsec "Sector"
settexttrigger alldone :alldone "Command [TL="
pause

:getsec
add $i 1
gettext currentline $adj[$i] "Sector" "==>"
striptext $adj[$i] "("
striptext $adj[$i] ")"
striptext $adj[$i] " "
gettext currentline $dens[$i] "==>" "Warps :"
striptext $dens[$i] ","
striptext $dens[$i] " "
goto :dtorp_start

:alldone
killtrigger getsec
gosub :firechk

:letslook
setvar $w 0

:sublooky
add $w 1
if ($w > $i)
	goto :alldone
elseif ($density[$w] <> $dens[$w])
	if ($shipchange = 1)
		setvar $diff ($density[$w] - $dens[$w])
		if (($diff > 39) and ($diff < 495))
			send "c p y " $adj[$w] "*  Q  "
			setvar $switchboard~message "Foton Missle Fired into sector => " $adj[$w] "*"
			gosub :switchboard~switchboard
			subtract $player~photons 1
			if ($dencontinue = 1) and ($player~photons > 0)
				setvar $switchboard~message "" $player~photons " left continuing scanning..*"
				gosub :switchboard~switchboard
				setvar $dens[$w] $density[$w]
				goto :sublooky
			else
				gosub :player~turnonansi
				goto :dtorp_end
			end
		else
			goto :sublooky
		end

	else
		send "c p y " $adj[$w] "*  Q  "
		setvar $switchboard~message "Foton Missle Fired into sector => " $adj[$w] "*"
		gosub :switchboard~switchboard
		subtract $player~photons 1
		if ($dencontinue = 1) and ($player~photons > 0)
			setvar $switchboard~message "" $player~photons " left continuing scanning..*"
			gosub :switchboard~switchboard
			setvar $dens[$w] $density[$w]
			goto :sublooky
		else
			gosub :player~turnonansi
			goto :dtorp_end
		end
	end
else
	goto :sublooky
end

:firechk
add $mm 1
if ($mm = 150)
	setvar $switchboard~message "WARNING  Density Foton Running at My TA!!!*"
	gosub :switchboard~switchboard
	setvar $mm 0
end
setvar $y 0
send "sz*"
waiton "Relative Density Scan"

:looky
killtrigger manual_stop
killtrigger dtop_dtorp
killtrigger getsec
killtrigger alldone
settextouttrigger manual_stop :manual_stop "-"
settextlinetrigger dtop_dtorp :manual_stop $bot~bot_name & " foton off"
settextlinetrigger getsec :looksec "Sector"
settexttrigger alldone :donelook "Command [TL="
pause

:looksec
add $y 1
gettext currentline $adjsec[$y] "Sector" "==>"
striptext $adjsec[$y] "("
striptext $adjsec[$y] ")"
striptext $adjsec[$y] " "
gettext currentline $density[$y] "==>" "Warps :"
striptext $density[$y] ","
striptext $density[$y] " "
killtrigger dtop_dtorp
killtrigger manual_stop
killtrigger alldone
goto :looky

:donelook
killtrigger getsec
return

:manual_stop
killtrigger manual_stop
killtrigger dtop_dtorp
killtrigger getsec
killtrigger alldone
setvar $switchboard~message "Density Foton Stoped . . *"
gosub :switchboard~switchboard
gosub :player~turnonansi

:dtorp_end
if (($startinglocation = "Planet") or ($startinglocation = "Citadel"))
	gosub :planet~landingsub
	halt
else
	halt
end
# ======================     END DENSITY PHOTON (DTORP) SUBROUTINE    ==========================
:foton
gosub :player~quikstats
setvar $startinglocation $player~current_prompt
if ($startinglocation = "Citadel")
	goto :foton_start
else
	setvar $switchboard~message "Must Start at Citadel.*"
	gosub :switchboard~switchboard
	halt
end

:foton_start
setvar $home_sector2 $player~current_sector
if ($player~photons <= 0)
	goto :foton_out_of_fotons
end
send "q"

gosub :planet~getplanetinfo
send "c"

:foton_get_figs
send "*"
waitfor "Citadel command (?="

:foton_go
if ($auto_return)
	setvar $switchboard~message "Foton Running From Planet " & $planet~planet & " w/ Return Home enabled. " & $player~photons &" Photons armed and ready.*"
	gosub :switchboard~switchboard
else
	setvar $switchboard~message "Foton Running From Planet " & $planet~planet & ", " & $player~photons &" Photons armed and ready.*"
	gosub :switchboard~switchboard
end
goto :planetphotontriggers

:foton_pwplimp
gosub :foton_limphit
goto :foton_pwp_go

:foton_pwparmid
gosub :foton_minehit
goto :foton_pwp_go

:foton_pwpfig
#gosub :foton_fighit
:foton_pwp_go
killalltriggers
gosub :foton_get_adj
if ($delaywalk > 0)
	setdelaytrigger delaywalktrigger :delaywalktrigger $delaywalk
	pause

	:delaywalktrigger
	add $delaywalk 100
end
send "p" $adjsec "*y c p y " $sector "**q"
settextlinetrigger	wrong	:foton_wrong	"That is not an adjacent sector"
settextlinetrigger	gotem	:foton_gotem	"Photon Missile launched into sector"
settextlinetrigger	wrong2	:foton_wrong2	"The Feds do not permit Photon Torpedos"
pause

:foton_wrong2
killtrigger gotem
setvar $switchboard~message "Foton Missed! Resetting!*"
gosub :switchboard~switchboard
if ($auto_return)
	gosub :foton_go_home
end
goto :planetphotontriggers

:foton_wrong
killtrigger gotem
setvar $switchboard~message "Foton Missed! Resetting!*"
gosub :switchboard~switchboard
setsectorparameter $adjsec "FIGSEC" false
if ($auto_return)
	gosub :foton_go_home
end
goto :planetphotontriggers

:foton_gotem
killtrigger wrong
setvar $switchboard~message "Foton Fired - Sector => " $sector "!*"
gosub :switchboard~switchboard
if ($holo)
	gosub :doholo
end
if ($auto_return)
	gosub :foton_go_home
end
gosub :player~quikstats
if ($player~photons = 0)
	goto :foton_out_of_fotons
end
if ($game~multiple_photons <> true)
	settextlinetrigger waitingforcooldown :exitcooldown "Photon Wave Duration has ended in sector "&$sector
	pause

	:exitcooldown
end
goto :planetphotontriggers

:foton_go_home
send "p" $home_sector2 "*y"
settextlinetrigger homelock :foton_home_lock "Locating beam pinpointed"
settextlinetrigger nohomelock :foton_no_home_lock "Your own fighters must be"
settextlinetrigger home_now :foton_home_lock "You are already in that sector!"
pause

:foton_no_home_lock
killtrigger homelock
killtrigger nohomelock
killtrigger home_now
setvar $switchboard~message "PWarp Lock To Home Failed.*"
gosub :switchboard~switchboard

:foton_home_lock
killtrigger homelock
killtrigger nohomelock
killtrigger home_now
return

:foton_get_adj
setvar $adjsec 0
setvar $i 1
while (sector.warps[$sector][$i] > 0)
	setvar $tempadj sector.warps[$sector][$i]
	getsectorparameter $tempadj "FIGSEC" $isfigged
	if ($isfigged)
		setvar $adjsec $tempadj
		return
	end
	add $i 1
end
if ($adjsec <= 0)
	echo ansi_12 "No Adjacent fig found*" ansi_7
	goto :planetphotontriggers
end
return

:foton_limphit
cuttext currentline&"      " $ck 1 6
if ($ck <> "Limpet")
	goto :planetphotontriggers
end
getword currentline $sector 4
return

:foton_minehit
cuttext currentline&"    " $ck 1 4
if ($ck <> "Your")
	goto :planetphotontriggers
end

# Check for alien hits

gettext currentansiline $alien_check "damage to" ""
getwordpos $alien_check $pos #27 & "[1;36m" & #27 & "["
if ($pos > 0)
	goto :planetphotontriggers
end

getword currentline $sector 4
return

:foton_fighit
# Check for spoofs

getword currentline $spoof_test 1
getword currentansiline $ansi_spoof_test 1
getwordpos $ansi_spoof_test $ansi_spoof_pos #27 & "[1;33m"
if ($spoof_test <> "Deployed") or ($ansi_spoof_pos <= 0)
	goto :planetphotontriggers
end

# Torp only on sector entry
getwordpos currentline $pos "entered sector."
if ($pos < 1)
	goto :planetphotontriggers
end

# Check for alien hits
gettext currentansiline $alien_check ": " "'s"
getwordpos $alien_check $pos #27 & "[1;36m" & #27 & "["
if ($pos > 0)
	goto :planetphotontriggers
end

# Get the sector number
getword currentline $sector 5
striptext $sector ":"
isnumber $result $sector
if ($result < 1)
	goto :planetphotontriggers
end
if (($sector > sectors) or ($sector <= 10))
	goto :planetphotontriggers
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
setvar $switchboard~message "No photon missles, Foton mode shutting down.*"
gosub :switchboard~switchboard
halt

:surround_foton
gosub :player~quikstats
setvar $startinglocation $player~current_prompt
if ($startinglocation = "Citadel")
	goto :surround_foton_start
else
	setvar $switchboard~message "Must Start at Citadel.*"
	gosub :switchboard~switchboard
	halt
end

:surround_foton_start
setvar $home_sector2 $player~current_sector
if ($player~photons <= 0)
	goto :foton_out_of_fotons
end
send "q"

gosub :planet~getplanetinfo
send "c"

:surround_foton_get_figs
send "*"
waitfor "Citadel command (?="

:surround_foton_go
if ($auto_return)
	setvar $switchboard~message "Surround Foton Running From Planet " & $planet~planet & " w/ Return Home enabled. " & $player~photons &" Photons armed and ready.*"
	gosub :switchboard~switchboard
else
	setvar $switchboard~message "Surround Foton Running From Planet " & $planet~planet & ", " & $player~photons &" Photons armed and ready.*"
	gosub :switchboard~switchboard
end
goto :surroundphotontriggers

:surround_foton_fighit
# Check for spoofs

getword currentline $spoof_test 1
getword currentansiline $ansi_spoof_test 1
getwordpos $ansi_spoof_test $ansi_spoof_pos #27 & "[1;33m"
if ($spoof_test <> "Deployed") or ($ansi_spoof_pos <= 0)
	goto :surroundphotontriggers
end

# Torp only on sector entry
getwordpos currentline $pos "entered sector."
if ($pos < 1)
	goto :surroundphotontriggers
end

# Check for alien hits
gettext currentansiline $alien_check ": " "'s"
getwordpos $alien_check $pos #27 & "[1;36m" & #27 & "["
if ($pos > 0)
	goto :surroundphotontriggers
end

# Get the sector number
getword currentline $sector 5
striptext $sector ":"
isnumber $result $sector
if ($result < 1)
	goto :surroundphotontriggers
end
if (($sector > sectors) or ($sector <= 10))
	goto :surroundphotontriggers
end

:attemptsurrounddrop
setvar $i 1
setvar $checksector sector.warps[$sector][$i]
setvar $isfound false
while (($checksector > 0) and ($isfound = false))
	getsectorparameter $checksector "FIGSEC" $isfigged
	if ($isfigged <> true)
		setvar $retreatsector $checksector
		setvar $isfound true
	else
		add $i 1
		setvar $checksector sector.warps[$sector][$i]
	end
end

if ($isfound)
	setvar $i 2

	setvar $checksector sector.warps[$retreatsector][$i]
	setvar $isfound false
	setvar $targets ""
	setvar $targetcount 0
	while ($checksector > 0)
		getsectorparameter $checksector "FIGSEC" $isfigged
		if (($isfigged = true) and ($checksector <> $sector))
			setvar $targets $targets&" "&$checksector&" "
			add $targetcount 1
		end
		setvar $checksector sector.warps[$retreatsector][$i]
		add $i 1
	end
	if ($targetcount > 0)

		:trysurroundfotonagain
		killalltriggers
		getword $targets $gotosector $targetcount
		setvar $targetcount ($targetcount-1)
		send "p" $gotosector "*y c p y " $retreatsector "**q"
		settextlinetrigger s_wrong	:surround_foton_wrong	"That is not an adjacent sector"
		settextlinetrigger s_gotem	:surround_foton_gotem	"Photon Missile launched into sector"
		settextlinetrigger s_fed	:surround_foton_fed		"The Feds do not permit Photon Torpedos"
		pause
	else
		echo "** No Adjacent Fig Next To Possible Retreat Sector **"
	end
else
	echo "** No Possible Retreat Sector **"
end
goto :surroundphotontriggers

:surround_foton_fed
killtrigger s_gotem
killtrigger s_wrong
if ($targetcount > 0)
	goto :trysurroundfotonagain
end
setvar $switchboard~message "Foton Missed! Resetting!*"
gosub :switchboard~switchboard
setsectorparameter $gotosector "FIGSEC" false
if ($auto_return)
	gosub :foton_go_home
end
goto :surroundphotontriggers

:surround_foton_wrong
killtrigger s_gotem
killtrigger s_fed
if ($targetcount > 0)
	goto :trysurroundfotonagain
end
setvar $switchboard~message "Foton Missed! Resetting!*"
gosub :switchboard~switchboard
if ($auto_return)
	gosub :foton_go_home
end
goto :surroundphotontriggers

:surround_foton_gotem
killtrigger s_wrong
killtrigger s_fed
setvar $switchboard~message "Foton Fired - Sector => " $retreatsector "!*"
gosub :switchboard~switchboard
if ($holo)
	gosub :doholo
end
if ($auto_return)
	gosub :foton_go_home
end
gosub :player~quikstats
if ($player~photons = 0)
	goto :foton_out_of_fotons
end
if ($game~multiple_photons <> true)
	settextlinetrigger waitingforcooldown :exitcooldownsurround "Photon Wave Duration has ended in sector "&$retreatsector
	pause

	:exitcooldownsurround
end
goto :surroundphotontriggers

:trap_foton
gosub :player~quikstats
setvar $startinglocation $player~current_prompt
if ($startinglocation = "Citadel")
	goto :trap_foton_start
else
	setvar $switchboard~message "Must Start at Citadel.*"
	gosub :switchboard~switchboard
	halt
end

:trap_foton_start
setvar $home_sector2 $player~current_sector
if ($player~photons <= 0)
	goto :foton_out_of_fotons
end
send "q"

gosub :planet~getplanetinfo
send "c"

:trap_foton_get_figs
send "*"
waitfor "Citadel command (?="

:trap_foton_go
if ($auto_return)
	setvar $switchboard~message "Trap Foton Running From Planet " & $planet~planet & " w/ Return Home enabled. " & $player~photons &" Photons armed and ready.*"
	gosub :switchboard~switchboard
else
	setvar $switchboard~message "Trap Foton Running From Planet " & $planet~planet & ", " & $player~photons &" Photons armed and ready.*"
	gosub :switchboard~switchboard
end
goto :trapphotontriggers

:trap_foton_fighit
# Check for spoofs

getword currentline $spoof_test 1
getword currentansiline $ansi_spoof_test 1
getwordpos $ansi_spoof_test $ansi_spoof_pos #27 & "[1;33m"
if ($spoof_test <> "Deployed") or ($ansi_spoof_pos <= 0)
	goto :trapphotontriggers
end

# Torp only on sector entry
getwordpos currentline $pos "entered sector."
if ($pos < 1)
	goto :trapphotontriggers
end

# Check for alien hits
gettext currentansiline $alien_check ": " "'s"
getwordpos $alien_check $pos #27 & "[1;36m" & #27 & "["
if ($pos > 0)
	goto :trapphotontriggers
end

# Get the sector number
getword currentline $sector 5
striptext $sector ":"
isnumber $result $sector
if ($result < 1)
	goto :trapphotontriggers
end

:testtrapenterhere
if (($sector > sectors) or ($sector <= 10))
	goto :trapphotontriggers
end

:attempttrapdrop
setvar $i 1
setvar $checksector sector.warps[$sector][$i]
setvar $fadj 0
setvar $fadji 0
setvar $isfound false
while ($checksector > 0)
	getsectorparameter $checksector "FIGSEC" $isfigged
	getsectorparameter $checksector "LIMPSEC" $islimp
	# Can't hide in a sector with limpets
	if (($isfigged = true) and ($islimp <> true))
		add $fadji 1
		setvar $fadj[$fadji] $checksector
		setvar $isfound true
	end
	add $i 1
	setvar $checksector sector.warps[$sector][$i]
end

if ($isfound)
	setvar $trapsecland 0
	setvar $trapsecfireto 0
	setvar $trapseci 0
	setvar $isfound false
	setvar $i 1
	while ($i <= $fadji)
		setvar $testsector $fadj[$i]
		setvar $y 1
		while ($y <= sector.warpincount[$testsector])
			getsectorparameter sector.warpsin[$testsector][$y] "FIGSEC" $isfigged
			if (($isfigged = true) and (sector.warpsin[$testsector][$y] <> $sector))
				setvar $isfound true
				add $trapseci 1
				setvar $trapsecland[$trapseci] sector.warpsin[$testsector][$y]
				setvar $trapsecfireto[$trapseci] $testsector
				# we only need one trap drop sector per adjacent ($i) hit sector
				setvar $y 99
			end
			add $y 1
		end
		add $i 1
	end

	if ($isfound = true)
		getrnd $whichtrap 1 $trapseci
		killalltriggers
		send "p" $trapsecland[$whichtrap] "*y c p y " $trapsecfireto[$whichtrap] "**q"

		settextlinetrigger s_wrong	:trap_foton_wrong	"That is not an adjacent sector"
		settextlinetrigger s_gotem	:trap_foton_gotem	"Photon Missile launched into sector"
		settextlinetrigger s_fed	:trap_foton_fed		"The Feds do not permit Photon Torpedos"
		pause
	else
		echo "** No Adjacent Fig Next To Possible Adjacent Sector **"
	end
else
	echo "** No Possible Trap Sector **"
end
goto :trapphotontriggers

:trap_foton_fed
killtrigger s_gotem
killtrigger s_wrong

setvar $switchboard~message "Foton Missed! Resetting!*"
gosub :switchboard~switchboard
setsectorparameter $gotosector "FIGSEC" false
if ($auto_return)
	gosub :foton_go_home
end
goto :trapphotontriggers

:trap_foton_wrong
killtrigger s_gotem
killtrigger s_fed

setvar $switchboard~message "Foton Missed! Resetting!*"
gosub :switchboard~switchboard
if ($auto_return)
	gosub :foton_go_home
end
goto :trapphotontriggers

:trap_foton_gotem
killtrigger s_wrong
killtrigger s_fed
setvar $switchboard~message "Foton Fired - Sector => " $trapsecfireto[$whichtrap] "!*"
gosub :switchboard~switchboard
if ($holo)
	gosub :doholo
end
if ($auto_return)
	gosub :foton_go_home
end
gosub :player~quikstats
if ($player~photons = 0)
	goto :foton_out_of_fotons
end
if ($game~multiple_photons <> true)
	settextlinetrigger waitingforcooldown :exitcooldowntrap "Photon Wave Duration has ended in sector "& $trapsecfireto[$whichtrap]
	pause

	:exitcooldowntrap
end
goto :trapphotontriggers

:foton_launch
killalltriggers
send "p" $adjsec "*y c p y " $sector "**q"
settextlinetrigger launch_wrong :foton_launch_wrong "That is not an adjacent sector"
settextlinetrigger launch_gotem :foton_launch_gotem "Photon Missile launched into sector"
settextlinetrigger launch_wrong2 :foton_launch_wrong "The Feds do not permit Photon Torpedos to be launched into FedSpace"
pause

:foton_launch_wrong
killtrigger launch_gotem
setvar $switchboard~message "That is not an adjacent sector!*"
gosub :switchboard~switchboard
halt

:foton_launch_gotem
killtrigger wrong
setvar $switchboard~message "Foton Fired - Sector => " $bot~parm2 "!*"
gosub :switchboard~switchboard
if ($holo)
	gosub :doholo
end
halt

:doholo
setvar $bot~command "holo"
setvar $bot~user_command_line " holo"

savevar $bot~command
savevar $bot~user_command_line
load "scripts\"&$bot~mombot_directory&"\commands\data\holo.cts"
seteventtrigger        holoend1        :holoend1 "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\commands\data\holo.cts"
pause

:holoend1
killalltriggers
return

:photonsector
setvar $startinglocation $player~current_prompt

if ($startinglocation <> "Planet") and ($startinglocation <> "Command") and ($startinglocation <> "Citadel")
	setvar $switchboard~message "Must start at Command, Planet or Citadel*"
	gosub :switchboard~switchboard
	halt
end

if ($player~photons = 0)
	setvar $switchboard~message "Out of Fotons - Dock Foton Deactivated*"
	gosub :switchboard~switchboard
	setvar $mode "General"
	halt
end

//if ($player~current_sector = stardock)
//	if (($player~experience < 1000) and ($player~alignment >= 0))
//		if ($player~fedspacephotons <> true)
//			send "'{" $bot~bot_name "} - Fed safe people can't shoot photons from fed..*"
//			setvar $mode "General"
//			halt
//		end
//	end
//end

setvar $returnsector 0
setvar $adjsec 0
setvar $psec $bot~parm1
setvar $psecadj 0
setvar $i 1
while ($i <= sector.warpcount[$player~current_sector])
	if ($psec = sector.warps[$player~current_sector][$i])
		setvar $psecadj 1
	end
	add $i 1
end

if ($psecadj = 0)
	if ($startinglocation = "Command")
		# TWARP PHOTON
		# At this stage, not plotting courses, just going for it. Let player worry about that.
		if (($player~twarp_type = 1) or ($player~twarp_type = 2))
			if ($player~ore_holds < 2)
				setvar $switchboard~message "No fuel ore onboard.*"
				gosub :switchboard~switchboard
				halt
			end
		else
			setvar $switchboard~message "Photoning non adjacent sectors via TWarp not currently implemented*"
			gosub :switchboard~switchboard
			halt
		end

	end

	// hb: we could technically allow someone to shoot from fed if they are firing come command prompt
	//     however, i think sending a non-fed safe person in by mistake to high a risk.
	setvar $i 1
	while ($i <= sector.warpincount[$psec])

		getsectorparameter sector.warpsin[$psec][$i] "FIGSEC" $isfigged
		if ($isfigged)
			setvar $adjsec sector.warpsin[$psec][$i]
			setvar $i 7
		end
		add $i 1
	end

	if ($auto_return = true)
		setvar $returnsector $player~current_sector
	end

	if ($adjsec = 0)
		setvar $switchboard~message "No sector adjacent with a fighter.*"
		gosub :switchboard~switchboard
		halt
	end
	if ($startinglocation = "Planet")
		send "c p" $adjsec "*y "
	elseif ($startinglocation = "Citadel")
		send "p" $adjsec "*y "
	elseif ($startinglocation = "Command")

		setvar $warpto $adjsec
		gosub :fotontwarp
		if ($twarpsuccess = false)
			setvar $switchboard~message "We did not make the twarp to the location.*"
			gosub :switchboard~switchboard
			halt
		end

	end

	send "c p y " $psec "* * q"
else
	send "c p y " $psec "* * q"

end

settextlinetrigger launch_wrong :foton_launch_wrong2 "That is not an adjacent sector"
settextlinetrigger launch_gotem :foton_launch_gotem2 "Photon Missile launched into sector"
settextlinetrigger launch_wrong2 :foton_launch_wrong2 "The Feds do not permit Photon Torpedos to be launched into FedSpace"
pause

:foton_launch_wrong2
killalltriggers

setvar $switchboard~message "That is not an adjacent sector!*"
gosub :switchboard~switchboard
gosub :photoncheckreturn
halt

:foton_launch_gotem2
killalltriggers

setvar $switchboard~message "Foton Fired - Sector => " & $bot~parm1 & "!*"
gosub :switchboard~switchboard
if ($holo)
	gosub :doholo
end
gosub :photoncheckreturn

halt

:photontow
setvar $towship $bot~parm3
isnumber $number $towship

if ($number <> 1)
	setvar $switchboard~message "Please user Foton on t [ship_number] for tow xport foton.*"
	gosub :switchboard~switchboard
	halt
else
	if ($towship = 0)
		setvar $switchboard~message "Please user Foton on t [ship_number] for tow xport foton.*"
		gosub :switchboard~switchboard
		halt
	end
end
gosub :preptow

setvar $home_sector2 $player~current_sector
setvar $ourship $player~ship_number

if ($auto_return)
	setvar $switchboard~message "TWarp Tow Foton Running, Towing " & $towship & " w/ Return Home enabled. Firing one shot.*"
	gosub :switchboard~switchboard
else
	setvar $switchboard~message "TWarp Tow Foton Running, Towing " & $towship & ", Firing one shot.*"
	gosub :switchboard~switchboard
end
goto :towphotontriggers

:tow_pwplimp
gosub :tow_limphit
goto :tow_pwp_go

:tow_pwparmid
gosub :tow_minehit
goto :tow_pwp_go

:tow_pwpfig
#gosub :tow_fighit
:tow_pwp_go
killalltriggers
gosub :tow_get_adj
if ($adjsec <> $player~current_sector)
	setvar $warpto $adjsec
	gosub :fotontwarp
	if ($twarpsuccess = false)
		setvar $switchboard~message "We did not make the twarp to the launch sector.. Shutting Down*"
		gosub :switchboard~switchboard
		halt
	end
end
send "x " $towship "* * "
send "c p y " $sector "**q"
send "x " $ourship "* * "
send "w n " $towship "*"

settextlinetrigger	wrong	:tow_wrong	"That is not an adjacent sector"
settextlinetrigger	gotem	:tow_gotem	"Photon Missile launched into sector"
settextlinetrigger	wrong2	:tow_wrong2	"The Feds do not permit Photon Torpedos"
pause

:tow_wrong2
killtrigger gotem
setvar $switchboard~message "Foton Missed! Resetting!*"
gosub :switchboard~switchboard
if ($auto_return and ($adjsec <> $player~current_sector))
	gosub :tow_go_home
end
goto :towphotontriggers

:tow_wrong
killtrigger gotem
setvar $switchboard~message "Foton Missed! Resetting!*"
gosub :switchboard~switchboard
setsectorparameter $adjsec "FIGSEC" false
if ($auto_return and ($adjsec <> $player~current_sector))
	gosub :tow_go_home
end
goto :towphotontriggers

:tow_gotem
killtrigger wrong
setvar $switchboard~message "Foton Fired - Sector => " $sector "!*"
gosub :switchboard~switchboard
if ($holo)
	gosub :doholo
end
if ($auto_return and ($adjsec <> $player~current_sector))
	gosub :tow_go_home
end
gosub :player~quikstats
send "w"
setvar $switchboard~message "T-warp foton complete - reload ore/fotons and run again.*"
gosub :switchboard~switchboard
halt

:tow_go_home
setvar $warpto $home_sector2
gosub :fotontwarp
if ($twarpsuccess = false)
	setvar $switchboard~message "Failed to twarp back with tow, attemping without!*"
	gosub :switchboard~switchboard
	gosub :fotontwarp
	if ($twarpsuccess = false)
		setvar $switchboard~message "Failed to make twarp back without ship. Exiting and then Panicking.*"
		gosub :switchboard~switchboard
		halt
	end
end

return

:tow_get_adj
# we are exluding fed for now. Could risk 2-10 ?
setvar $adjsec 0
setvar $i 1
while (sector.warps[$sector][$i] > 0)
	setvar $tempadj sector.warps[$sector][$i]
	getsectorparameter $tempadj "FIGSEC" $isfigged
	if ($tempadj = $player~current_sector)
		setvar $adjsec $tempadj
		return
	end
	if ($isfigged)
		setvar $adjsec $tempadj
		//return
		// this used to return - i'd rather it loops through all and checks for current sector
		// plus guessing first sector is more easy/predicatable and no real speed advantag
	end
	add $i 1
end
if ($adjsec <= 0)
	echo ansi_12 "No Adjacent fig found*" ansi_7
	goto :towphotontriggers
end
return

halt

:preptow
if ($startinglocation <> "Command")
	setvar $switchboard~message "Foton two needs to be from command prompt*"
	gosub :switchboard~switchboard
	halt
end
if ($player~twarp_type = 2)
	if ($player~ore_holds <> $player~total_holds)
		setvar $switchboard~message "Make sure holds are full of fuel.*"
		gosub :switchboard~switchboard
		halt
	end
else
	setvar $switchboard~message "You need a type two twarp.*"
	gosub :switchboard~switchboard
	halt
end

setvar $xportsectorok 0
setvar $xportphotonsok 0

send "x"

:xportwait
settextlinetrigger xporttestfed :xporttestfed "Any unmanned ships in FedSpace will be automatically"
settextlinetrigger xporttest :xporttest "--<  Available Ship Scan  >--"
settextlinetrigger xportfail :xportfail "You do not own any other ships!"
pause

:xportfail
killalltriggers
setvar $switchboard~message "You don't own any ships to tow.*"
gosub :switchboard~switchboard
halt

:xporttestfed
send "*"
killalltriggers
goto :xportwait

:xporttest
killalltriggers
send "i"
send $towship "*q"
settextlinetrigger xportshipna :xportshipna "That is not an available ship."
settextlinetrigger xportship :xportship "Ship Name      :"
pause

:xportshipna
killalltriggers

setvar $switchboard~message "Ship is not available.*"
gosub :switchboard~switchboard
halt

:xportship
settextlinetrigger xportshipsec :xportshipsec "Current Sector :"
settextlinetrigger xportshipphoton :xportshipphoton "Photon Missiles:"
settexttrigger xportshippause :xportshippause "[Pause]"
pause

:xportshipsec
killalltriggers
getword currentline $testsector 4
if ($testsector = $player~current_sector)
	setvar $xportsectorok 1
end
goto :xportship

:xportshipphoton
killalltriggers
setvar $xportphotonsok 1

:xportshippause
killalltriggers
send "*q"

if ($xportsectorok = 0)
	setvar $switchboard~message "Tow ship is not in same sector.*"
	gosub :switchboard~switchboard
	halt
end
if ($xportphotonsok = 0)
	setvar $switchboard~message "Tow ship has no photons.*"
	gosub :switchboard~switchboard
	halt
end

:xportrestartgo
send "w"
settextlinetrigger xportrestart :xportrestart "You shut off your Tractor Beam."
settexttrigger xportstart :xportstart "Do you wish to tow a manned ship?"
pause

:xportrestart
killalltriggers
goto :xportrestartgo

:xportstart
send "n" $towship "*"

return

:photoncheckreturn
if ($returnsector > 0)
	gosub :player~quikstats
	if ($player~current_sector <> $returnsector)
		if ($startinglocation = "Command")
			setvar $warpto $returnsector
			gosub :fotontwarp
			if ($twarpsuccess = false)
				setvar $switchboard~message "Twarp return failed post foton.*"
				gosub :switchboard~switchboard
				halt
			end
		else
			send "p" $returnsector "*y"
		end

	end
end

return

:killtwarptriggers
killtrigger locking
killtrigger igd
killtrigger noturns
killtrigger noroute
killtrigger twarp_lock
killtrigger no_twrp_lock
killtrigger twarp_adj
killtrigger no_fuel
killtrigger twarpdelay
return

:fotontwarp
# HB: INCOMING CALLS MUST cHECK - NOT ADJACENT - NOT CURRENT SECTOR
#     I've made this less safe to remove a pause for speed
setvar $twarpsuccess false
send "mz" $warpto "*y"

settextlinetrigger twarp_lock :twarp_lock "TransWarp Locked"
settextlinetrigger no_twrp_lock :no_twarp_lock "No locating beam found"
settextlinetrigger twarp_adj :twarp_adj "<Set NavPoint>"
settextlinetrigger no_fuel :twarpnofuel "You do not have enough Fuel Ore"
settexttrigger      igd        :twarpigd       "An Interdictor Generator in this sector holds you fast!"
settexttrigger      noturns    :twarpphotoned  "Your ship was hit by a Photon and has been disabled"
setdelaytrigger 	twarpdelay  :twarpdelay 2000
pause

:twarpnofuel
gosub :killtwarptriggers

goto :twarpdone

:twarp_adj
gosub :killtwarptriggers
send "q za  "&$ship~ship_max_attack&"* * r * "
setvar $twarpsuccess true
setvar $msg "Sector was nextdoor so just warped!"
goto :twarpdone

:no_twarp_lock
gosub :killtwarptriggers
send "n* z* "
setvar $target $warpto
setsectorparameter $target "FIGSEC" false
setvar $msg "No fighters at T-warp point!"
goto :twarpdone

:twarpigd
gosub :killtwarptriggers
setvar $msg "My ship is being held by Interdictor!"
goto :twarpdone

:twarpphotoned
gosub :killtwarptriggers
setvar $msg "I have been photoned and can not T-warp!"
goto :twarpdone

:twarpdelay
gosub :killtwarptriggers
setvar $msg "T-Warp timed out - Something went wrong!"
goto :twarpdone

:twarp_lock
gosub :killtwarptriggers
setvar $target $warpto
setsectorparameter $target "FIGSEC" true
send "y   *     "
setvar $msg "T-warp completed."
setvar $twarpsuccess true

:twarpdone
send "'" $msg "*"
return

:tow_limphit
cuttext currentline&"      " $ck 1 6
if ($ck <> "Limpet")
	goto :towphotontriggers
end
getword currentline $sector 4
return

:tow_minehit
cuttext currentline&"    " $ck 1 4
if ($ck <> "Your")
	goto :towphotontriggers
end

# Check for alien hits

gettext currentansiline $alien_check "damage to" ""
getwordpos $alien_check $pos #27 & "[1;36m" & #27 & "["
if ($pos > 0)
	goto :towphotontriggers
end

getword currentline $sector 4
return

:tow_fighit
# Check for spoofs

getword currentline $spoof_test 1
getword currentansiline $ansi_spoof_test 1
getwordpos $ansi_spoof_test $ansi_spoof_pos #27 & "[1;33m"
if ($spoof_test <> "Deployed") or ($ansi_spoof_pos <= 0)
	goto :towphotontriggers
end

# Torp only on sector entry
getwordpos currentline $pos "entered sector."
if ($pos < 1)
	goto :towphotontriggers
end

# Check for alien hits
gettext currentansiline $alien_check ": " "'s"
getwordpos $alien_check $pos #27 & "[1;36m" & #27 & "["
if ($pos > 0)
	goto :towphotontriggers
end

# Get the sector number
getword currentline $sector 5
striptext $sector ":"
isnumber $result $sector
if ($result < 1)
	goto :towphotontriggers
end
if (($sector > sectors) or ($sector <= 10))
	goto :towphotontriggers
end
goto :tow_pwp_go

#INCLUDES:
include "source\include\planet"
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
