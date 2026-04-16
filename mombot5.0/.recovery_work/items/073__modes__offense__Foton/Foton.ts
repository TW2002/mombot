logging "OFF"
gosub :BOT~LOADVARS
loadvar $GAME~MULTIPLE_PHOTONS


setvar $BOT~HELP[1] $BOT~TAB&"- foton [on|off|sec] {a|d|p|s|d|t} {towship} {sector} "
setvar $BOT~HELP[2] $BOT~TAB&"                     {return} {den40}"
setvar $BOT~HELP[3] $BOT~TAB&"  Multiple use photon script.  "
setvar $BOT~HELP[4] $BOT~TAB&"  "
setvar $BOT~HELP[5] $BOT~TAB&"  Options: "
setvar $BOT~HELP[6] $BOT~TAB&"    {a}djacent - photons adjacent sector when"
setvar $BOT~HELP[7] $BOT~TAB&"                 fig/limp/armid hit"
setvar $BOT~HELP[8] $BOT~TAB&"    {d}ensity  - constant density scan, photons"
setvar $BOT~HELP[9] $BOT~TAB&"                 on density change"
setvar $BOT~HELP[10] $BOT~TAB&"    {p}lanet   - standard planet warp photon script"
setvar $BOT~HELP[11] $BOT~TAB&"    {s}urround - attempts to foton retreat sector"
setvar $BOT~HELP[12] $BOT~TAB&"    d{o}ck     - sits on dock and attempts to foton"
setvar $BOT~HELP[13] $BOT~TAB&"                 on adjacent fig hit"
setvar $BOT~HELP[14] $BOT~TAB&"    {t}ow      - twarp tow a photon in a second ship"
setvar $BOT~HELP[15] $BOT~TAB&"       "
setvar $BOT~HELP[16] $BOT~TAB&"    {towship}  - Ship in sector with photon you will tow"
setvar $BOT~HELP[17] $BOT~TAB&"    {sector}   - Apply the mode from/to that sector"
setvar $BOT~HELP[18] $BOT~TAB&"    {return}   - Returns Planet Home after Pwarp"
setvar $BOT~HELP[19] $BOT~TAB&"     {den40}   - Only shoots on 40 to 499 Density Change"
setvar $BOT~HELP[20] $BOT~TAB&"      {holo}   - does holo command after firing"
setvar $BOT~HELP[21] $BOT~TAB&"   {dockexp}   - Will pop planet to get to 1k"
setvar $BOT~HELP[22] $BOT~TAB&"                 for dock photon"
setvar $BOT~HELP[23] $BOT~TAB&"      {self}   - Will pwarp out, photon your current "
setvar $BOT~HELP[24] $BOT~TAB&"                 sector, and pwarp back in. "
setvar $BOT~HELP[25] $BOT~TAB&"      {cont}   - Will continue shooting if in density mode."
setvar $BOT~HELP[26] $BOT~TAB&" {delwalk:n}   - Delay walk will delay the shot for this many MS."
setvar $BOT~HELP[27] $BOT~TAB&"                 Then add another 100ms to subsequent hit."
setvar $BOT~HELP[28] $BOT~TAB&"      "
setvar $BOT~HELP[29] $BOT~TAB&"       Authors: Mind Dagger and The Bounty Hunter "
gosub :BOT~HELPFILE

setvar $BOT~SCRIPT_TITLE "Fast Foton"
gosub :BOT~BANNER


getsectorparameter SECTORS "FIGSEC" $ISFIGGED
if ($ISFIGGED = "")
  send "'{" $BOT~BOT_NAME "} - It appears no grid data is available.  Run a fighter grid checker that uses the sector parameter FIGSEC. (Try figs command)*"
  halt
end

getword $BOT~USER_COMMAND_LINE $BOT~PARM1 1
getword $BOT~USER_COMMAND_LINE $BOT~PARM2 2
getword $BOT~USER_COMMAND_LINE $BOT~PARM3 3
getword $BOT~USER_COMMAND_LINE $BOT~PARM4 4
getword $BOT~USER_COMMAND_LINE $BOT~PARM5 5
getword $BOT~USER_COMMAND_LINE $BOT~PARM6 6
getword $BOT~USER_COMMAND_LINE $BOT~PARM7 7
getword $BOT~USER_COMMAND_LINE $BOT~PARM8 8
getwordpos " "&$BOT~USER_COMMAND_LINE&" " $POS " return "
if ($POS > 0)
  setvar $AUTO_RETURN TRUE
else
  setvar $AUTO_RETURN FALSE
end

getwordpos " "&$BOT~USER_COMMAND_LINE&" " $POS " den40 "
if ($POS > 0)
  setvar $SHIPCHANGE 1
else
  setvar $SHIPCHANGE 0
end

getwordpos " "&$BOT~USER_COMMAND_LINE&" " $POS " cont "
if ($POS > 0)
  setvar $DENCONTINUE 1
else
  setvar $DENCONTINUE 0
end

getwordpos " "&$BOT~USER_COMMAND_LINE&" " $POS " holo "
if ($POS > 0)
  setvar $HOLO 1
else
  setvar $HOLO 0
end

getwordpos " "&$BOT~USER_COMMAND_LINE&" " $POS " dockexp "
if ($POS > 0)
  setvar $DOCKEXP 1
else
  setvar $DOCKEXP 0
end

getwordpos " "&$BOT~USER_COMMAND_LINE&" " $POS " self "
if ($POS > 0)
  setvar $SELF 1
else
  setvar $SELF 0
end

setvar $DELAYWALK 0
getwordpos $BOT~USER_COMMAND_LINE $POS "delwalk:"
if ($POS > 0)

  setvar $CLINE $BOT~USER_COMMAND_LINE&" "
  gettext $CLINE $DELAYWALK "delwalk:" " "
else
  setvar $DELAYWALK 0
end
:FOTON_CHECK


gosub :PLAYER~QUIKSTATS
setvar $STARTINGLOCATION $PLAYER~CURRENT_PROMPT
isnumber $ISNUM $BOT~PARM1

if ($BOT~PARM2 = "d")
  goto :START_DTORP
elseif ($BOT~PARM2 = "a")
  goto :ADJPHOTON
elseif ($BOT~PARM2 = "s")
  goto :SURROUND_FOTON
elseif ($BOT~PARM2 = "r")
  goto :TRAP_FOTON
elseif ($BOT~PARM2 = "o")
  goto :DOCKPHOTON
elseif ($BOT~PARM2 = "t")
  goto :PHOTONTOW
elseif (($BOT~PARM2 = "p") or ($BOT~PARM2 = ""))
  goto :FOTON
elseif (($ISNUM = 1) or ($SELF = TRUE))
  if ($SELF)
    setvar $BOT~PARM1 $PLAYER~CURRENT_SECTOR
    setvar $AUTO_RETURN TRUE
  end
  if (($BOT~PARM1 > 10) and (($BOT~PARM1 <= SECTORS) and ($BOT~PARM1 <> STARDOCK)))
    gosub :PLAYER~QUIKSTATS
    goto :PHOTONSECTOR
  elseif (($BOT~PARM1 < 10) or ($BOT~PARM1 >= SECTORS) or ($BOT~PARM1 = STARDOCK))
    send "'{" $BOT~BOT_NAME "} - Not a Valid FOTON Sector*"
    halt
  end
else
  send "'{" $BOT~BOT_NAME "} - Please use foton [on/off/sector] {a/d/p/s} {return} format*"
  halt
end
:PLANETPHOTONTRIGGERS




killalltriggers
settextlinetrigger 1 :FOTON_PWPLIMP "Limpet mine in "
settextlinetrigger 2 :FOTON_PWPARMID "Your mines in "
settextlinetrigger 3 :FOTON_FIGHIT "Deployed Fighters Report Sector "
pause
:TOWPHOTONTRIGGERS


killalltriggers
settextlinetrigger 1 :TOW_PWPLIMP "Limpet mine in "
settextlinetrigger 2 :TOW_PWPARMID "Your mines in "
settextlinetrigger 3 :TOW_FIGHIT "Deployed Fighters Report Sector "
pause
:SURROUNDPHOTONTRIGGERS


killalltriggers


settextlinetrigger 3 :SURROUND_FOTON_FIGHIT "Deployed Fighters Report Sector "
pause
:TRAPPHOTONTRIGGERS


killalltriggers


settextlinetrigger 3 :TRAP_FOTON_FIGHIT "Deployed Fighters Report Sector "
pause
:SETADJACENTTRIGGERS



killalltriggers
setvar $WARPIES 1
setdelaytrigger 1 :LOAD_PHOTON 300000
while ($WARPIES <= $PWARPS)
  settexttrigger "PHOT"&$WARPIES :":SHOOT"&$WARPIES "Deployed Fighters Report Sector "&SECTOR.WARPS[$PSEC][$WARPIES]&":"
  settexttrigger "LIMP"&$WARPIES :":SHOOT"&$WARPIES "Limpet mine in "&SECTOR.WARPS[$PSEC][$WARPIES]&" activated"
  add $WARPIES 1
end
pause
:SETDOCKTRIGGERS

killalltriggers
setvar $WARPIES 1

while ($WARPIES <= $PWARPS)
  settexttrigger "DPHOT"&$WARPIES :":DSHOOT"&$WARPIES "Deployed Fighters Report Sector "&SECTOR.WARPS[$PSEC][$WARPIES]&":"
  settexttrigger "DLIMP"&$WARPIES :":DSHOOT"&$WARPIES "Limpet mine in "&SECTOR.WARPS[$PSEC][$WARPIES]&" activated"
  add $WARPIES 1
end
pause
:DOCKPHOTON





setvar $STARTINGLOCATION $PLAYER~CURRENT_PROMPT

if (($STARTINGLOCATION <> "<StarDock>") and (($STARTINGLOCATION <> "Command") and ($STARTINGLOCATION <> "<Hardware")))
  send "'{" $BOT~BOT_NAME "} - Must start at Command, Stardock or Hardware*"
  halt
end
if (($BOT~PARM1 <> "on") and (($BOT~PARM1 <> "off") and ($BOT~PARM1 <> "reset")))
  send "'{" $BOT~BOT_NAME "} - Please use - foton [on/off/reset] format*"
  halt
end
if ($BOT~PARM1 = "on")
  setvar $COOLOFF ($GAME~PHOTON_DURATION * 1000)

  if ($PLAYER~PHOTONS = 0)
    send "'{" $BOT~BOT_NAME "} - Out of Fotons - Dock Foton Deactivated*"
    setvar $MODE "General"
    halt
  end
  if ($PLAYER~TURNS < 3)
    send "'{" $BOT~BOT_NAME "} - Need a couple of turns..*"
    setvar $MODE "General"
    halt
  end

  if ($DOCKEXP = 1)

    if (($PLAYER~EXPERIENCE < 976) and ($PLAYER~ALIGNMENT >= 0))
      if ($PLAYER~FEDSPACEPHOTONS <> TRUE)
        send "'{" $BOT~BOT_NAME "} - Need 976 exp + for this mode.*"
        setvar $MODE "General"
        halt
      end
    end

    if ($PLAYER~GENESIS < 1)
      send "'{" $BOT~BOT_NAME "} - Please buy one genesis torp*"
      setvar $MODE "General"
      halt
    end
    setvar $MAKEMACRO " u y n . * z c * "
  else
    if (($PLAYER~EXPERIENCE < 1000) and ($PLAYER~ALIGNMENT >= 0))
      if ($PLAYER~FEDSPACEPHOTONS <> TRUE)
        send "'{" $BOT~BOT_NAME "} - Fed safe people can't shoot photons from fed..*"
        setvar $MODE "General"
        halt
      end
    end
    setvar $MAKEMACRO ""
  end
  send "'{" $BOT~BOT_NAME "} - Dock Foton Running - Shooting from the dock at adjacent sectors!*"
  setvar $PSEC $PLAYER~CURRENT_SECTOR
  if ($STARTINGLOCATION = "Command")
    send "psh"
  elseif ($STARTINGLOCATION = "<StarDock>")
    send "h"
  end
  setvar $PWARPS SECTOR.WARPCOUNT[$PSEC]
  goto :SETDOCKTRIGGERS
else
  send "'{" $BOT~BOT_NAME "} - Please use - foton [on/off/reset] {a/d/s/p/o} format*"
  halt
end
:DSHOOT1

killalltriggers
echo "#" "Photon Missile launched into sector "&SECTOR.WARPS[$PSEC][1] "#"
send "q q " $MAKEMACRO "  c  p  y  " SECTOR.WARPS[$PSEC][1] "**   * q p sh"
setvar $MAKEMACRO ""
killtrigger DSHOT
killtrigger DMISSED
settexttrigger DSHOT :DSHOT1 "Photon Missile launched into sector "&SECTOR.WARPS[$PSEC][1]
settexttrigger DMISSED :DMISSED1 "<Computer deactivated>"
pause
:DMISSED1

killtrigger DSHOT
goto :SETDOCKTRIGGERS
:DSHOT1

killtrigger DMISSED
getword CURRENTLINE $SPOOF 1
if ($SPOOF <> "Photon")
  goto :SETDOCKTRIGGERS
end
send "'{" $BOT~BOT_NAME "} - Dock Foton Fired -> Sector " SECTOR.WARPS[$PSEC][1] "*"

subtract $PLAYER~PHOTONS 1
if ($PLAYER~PHOTONS = 0)
  send "'{" $BOT~BOT_NAME "} - Out of Fotons - Dock Foton Deactivated*"
  setvar $MODE "General"
  halt
end
setdelaytrigger COOL :SETDOCKTRIGGERS $COOLOFF
pause
goto :SETDOCKTRIGGERS
:DSHOOT2

send "q q " $MAKEMACRO "  c  p  y  " SECTOR.WARPS[$PSEC][2] "**   * q p sh"
setvar $MAKEMACRO ""
killtrigger DSHOT
killtrigger DMISSED
settexttrigger DSHOT :DSHOT2 "Photon Missile launched into sector "&SECTOR.WARPS[$PSEC][2]
settexttrigger DMISSED :DMISSED2 "<Computer deactivated>"
pause
:DMISSED2

killtrigger DSHOT
goto :SETDOCKTRIGGERS
:DSHOT2

killtrigger DMISSED
getword CURRENTLINE $SPOOF 1
if ($SPOOF <> "Photon")
  goto :SETDOCKTRIGGERS
end
send "'{" $BOT~BOT_NAME "} - Dock Foton Fired -> Sector " SECTOR.WARPS[$PSEC][2] "*"

subtract $PLAYER~PHOTONS 1
if ($PLAYER~PHOTONS = 0)
  send "'{" $BOT~BOT_NAME "} - Out of Fotons - Dock Foton Deactivated*"
  setvar $MODE "General"
  halt
end
setdelaytrigger COOL :SETDOCKTRIGGERS $COOLOFF
pause
goto :SETDOCKTRIGGERS
:DSHOOT3


send "q q " $MAKEMACRO "  c  p  y  " SECTOR.WARPS[$PSEC][3] "**   * q p sh"
setvar $MAKEMACRO ""
killtrigger DSHOT
killtrigger DMISSED
settexttrigger DSHOT :DSHOT3 "Photon Missile launched into sector "&SECTOR.WARPS[$PSEC][3]
settexttrigger DMISSED :DMISSED3 "<Computer deactivated>"
pause
:DMISSED3

killtrigger DSHOT
goto :SETDOCKTRIGGERS
:DSHOT3

killtrigger DMISSED
getword CURRENTLINE $SPOOF 1
if ($SPOOF <> "Photon")
  goto :SETDOCKTRIGGERS
end
send "'{" $BOT~BOT_NAME "} - Dock Foton Fired -> Sector " SECTOR.WARPS[$PSEC][3] "*"

subtract $PLAYER~PHOTONS 1
if ($PLAYER~PHOTONS = 0)
  send "'{" $BOT~BOT_NAME "} - Out of Fotons - Dock Foton Deactivated*"
  setvar $MODE "General"
  halt
end
setdelaytrigger COOL :SETDOCKTRIGGERS $COOLOFF
pause
goto :SETDOCKTRIGGERS
:DSHOOT4

send "q q " $MAKEMACRO "  c  p  y  " SECTOR.WARPS[$PSEC][4] "**   * q p sh"
setvar $MAKEMACRO ""
killtrigger DSHOT
killtrigger DMISSED
settexttrigger DSHOT :DSHOT4 "Photon Missile launched into sector "&SECTOR.WARPS[$PSEC][4]
settexttrigger DMISSED :DMISSED4 "<Computer deactivated>"
pause
:DMISSED4

killtrigger DSHOT
goto :SETDOCKTRIGGERS
:DSHOT4

killtrigger DMISSED
getword CURRENTLINE $SPOOF 1
if ($SPOOF <> "Photon")
  goto :SETDOCKTRIGGERS
end
send "'{" $BOT~BOT_NAME "} - Dock Foton Fired -> Sector " SECTOR.WARPS[$PSEC][4] "*"

subtract $PLAYER~PHOTONS 1
if ($PLAYER~PHOTONS = 0)
  send "'{" $BOT~BOT_NAME "} - Out of Fotons - Dock Foton Deactivated*"
  setvar $MODE "General"
  halt
end
setdelaytrigger COOL :SETDOCKTRIGGERS $COOLOFF
pause
goto :SETDOCKTRIGGERS
:DSHOOT5
send "q q " $MAKEMACRO "  c  p  y  " SECTOR.WARPS[$PSEC][5] "**   * q p sh"
setvar $MAKEMACRO ""
killtrigger DSHOT
killtrigger DMISSED
settexttrigger DSHOT :DSHOT5 "Photon Missile launched into sector "&SECTOR.WARPS[$PSEC][5]
settexttrigger DMISSED :DMISSED5 "<Computer deactivated>"
pause
:DMISSED5

killtrigger DSHOT
goto :SETDOCKTRIGGERS
:DSHOT5

killtrigger DMISSED
getword CURRENTLINE $SPOOF 1
if ($SPOOF <> "Photon")
  goto :SETDOCKTRIGGERS
end
send "'{" $BOT~BOT_NAME "} - Dock Foton Fired -> Sector " SECTOR.WARPS[$PSEC][5] "*"

subtract $PLAYER~PHOTONS 1
if ($PLAYER~PHOTONS = 0)
  send "'{" $BOT~BOT_NAME "} - Out of Fotons - Dock Foton Deactivated*"
  setvar $MODE "General"
  halt
end
setdelaytrigger COOL :SETDOCKTRIGGERS $COOLOFF
pause
goto :SETDOCKTRIGGERS
:DSHOOT6

send "q q " $MAKEMACRO "  c  p  y  " SECTOR.WARPS[$PSEC][6] "**   * q p sh"
setvar $MAKEMACRO ""
killtrigger DSHOT
killtrigger DMISSED
settexttrigger DSHOT :DSHOT6 "Photon Missile launched into sector "&SECTOR.WARPS[$PSEC][6]
settexttrigger DMISSED :DMISSED6 "<Computer deactivated>"
pause
:DMISSED6

killtrigger DSHOT
goto :SETDOCKTRIGGERS
:DSHOT6

killtrigger DMISSED
getword CURRENTLINE $SPOOF 1
if ($SPOOF <> "Photon")
  goto :SETDOCKTRIGGERS
end
send "'{" $BOT~BOT_NAME "} - Dock Foton Fired -> Sector " SECTOR.WARPS[$PSEC][6] "*"

subtract $PLAYER~PHOTONS 1
if ($PLAYER~PHOTONS = 0)
  send "'{" $BOT~BOT_NAME "} - Out of Fotons - Dock Foton Deactivated*"
  setvar $MODE "General"
  halt
end
setdelaytrigger COOL :SETDOCKTRIGGERS $COOLOFF
pause
goto :SETDOCKTRIGGERS
:ADJPHOTON



gosub :PLAYER~QUIKSTATS
setvar $STARTINGLOCATION $PLAYER~CURRENT_PROMPT
if (($STARTINGLOCATION <> "Citadel") and ($STARTINGLOCATION <> "Command"))
  send "'{" $BOT~BOT_NAME "} - Must start at Citadel or Command prompt*"
  halt
end
if (($BOT~PARM1 <> "on") and (($BOT~PARM1 <> "off") and ($BOT~PARM1 <> "reset")))
  send "'{" $BOT~BOT_NAME "} - Please use - foton [on/off/reset] format*"
  halt
end
if ($BOT~PARM1 = "on")
  goto :LOAD_PHOTON
elseif ($BOT~PARM1 = "reset")
  send "'{" $BOT~BOT_NAME "} - Adjacent Foton - Resetting Sector*"
  goto :LOAD_PHOTON
else
  send "'{" $BOT~BOT_NAME "} - Please use - foton [on/off/reset] {a/d/s/p} format*"
  halt
end
:LOAD_PHOTON



if (($STARTINGLOCATION <> "Citadel") and ($STARTINGLOCATION <> "Command"))
  send "'{" $BOT~BOT_NAME "} - Must start at Citadel or Command prompt*"
  halt
end
if ($STARTINGLOCATION = "Citadel")
  send "s*"
  waitfor "<Scan Sector>"
  waitfor "(?="
elseif ($STARTINGLOCATION = "Command")
  send "*zn"
  waitfor "<Re-Display>"
  waitfor "Command [TL"
end
gosub :PLAYER~QUIKSTATS
if ($PLAYER~PHOTONS = 0)
  send "'{" $BOT~BOT_NAME "} - Out of Fotons - Adjacent Foton Deactivated*"
  setvar $MODE "General"
  halt
end
if (($PLAYER~CURRENT_SECTOR <> $PSEC) and ($PSEC <> 0))
  send "'{" $BOT~BOT_NAME "} - Resetting Adjacent Photon to Sector " $PLAYER~CURRENT_SECTOR "*"
  setvar $PSEC $PLAYER~CURRENT_SECTOR
end
setvar $PSEC $PLAYER~CURRENT_SECTOR
send "'{" $BOT~BOT_NAME "} - Adjacent Foton Running in Sector " $PSEC " - " $PLAYER~PHOTONS " Photon(s) Aboard!*"
setvar $PWARPS SECTOR.WARPCOUNT[$PSEC]
goto :SETADJACENTTRIGGERS
:SHOOT1

send "c  p  y  " SECTOR.WARPS[$PSEC][1] "**  q*"
killtrigger SHOT
killtrigger MISSED
settexttrigger SHOT :SHOT1 "Photon Missile launched into sector "&SECTOR.WARPS[$PSEC][1]
settexttrigger MISSED :MISSED1 "<Computer deactivated>"
pause
:MISSED1

killtrigger SHOT
goto :SETADJACENTTRIGGERS
:SHOT1

killtrigger MISSED
getword CURRENTLINE $SPOOF 1
if (($SPOOF <> "Deployed") and ($SPOOF <> "Limpet"))
  goto :SETADJACENTTRIGGERS
end
send "'{" $BOT~BOT_NAME "} - Adjacent Foton Fired -> Sector " SECTOR.WARPS[$PSEC][1] "*"
if ($HOLO)
  gosub :DOHOLO
end
subtract $PLAYER~PHOTONS 1
if ($PLAYER~PHOTONS = 0)
  send "'{" $BOT~BOT_NAME "} - Out of Fotons - Adjacent Foton Deactivated*"
  setvar $MODE "General"
  halt
end
setdelaytrigger COOL :SETADJACENTTRIGGERS 500
pause
goto :SETADJACENTTRIGGERS
:SHOOT2

getword CURRENTLINE $SPOOF 1
if (($SPOOF <> "Deployed") and ($SPOOF <> "Limpet"))
  goto :SETADJACENTTRIGGERS
end
send "c  p  y  " SECTOR.WARPS[$PSEC][2] "**  q*"
killtrigger SHOT
killtrigger MISSED
settexttrigger SHOT :SHOT2 "Photon Missile launched into sector "&SECTOR.WARPS[$PSEC][2]
settexttrigger MISSED :MISSED2 "<Computer deactivated>"
pause
:MISSED2

killtrigger SHOT
goto :SETADJACENTTRIGGERS
:SHOT2

killtrigger MISSED
send "'{" $BOT~BOT_NAME "} - Adjacent Foton Fired -> Sector " SECTOR.WARPS[$PSEC][2] "*"
subtract $PLAYER~PHOTONS 1
if ($HOLO)
  gosub :DOHOLO
end
if ($PLAYER~PHOTONS = 0)
  send "'{" $BOT~BOT_NAME "} - Out of Fotons - Adjacent Foton Deactivated*"
  halt
end
goto :SETADJACENTTRIGGERS
:SHOOT3

getword CURRENTLINE $SPOOF 1
if (($SPOOF <> "Deployed") and ($SPOOF <> "Limpet"))
  goto :SETADJACENTTRIGGERS
end
send "c  p  y  " SECTOR.WARPS[$PSEC][3] "**  q*"
killtrigger SHOT
killtrigger MISSED
settexttrigger SHOT :SHOT3 "Photon Missile launched into sector "&SECTOR.WARPS[$PSEC][3]
settexttrigger MISSED :MISSED3 "<Computer deactivated>"
pause
:MISSED3

killtrigger SHOT
goto :SETADJACENTTRIGGERS
:SHOT3

killtrigger MISSED
send "'{" $BOT~BOT_NAME "} - Adjacent Foton Fired -> Sector " SECTOR.WARPS[$PSEC][3] "*"
subtract $PLAYER~PHOTONS 1
if ($HOLO)
  gosub :DOHOLO
end
if ($PLAYER~PHOTONS = 0)
  send "'{" $BOT~BOT_NAME "} - Out of Fotons - Adjacent Foton Deactivated*"
  halt
end
goto :SETADJACENTTRIGGERS
:SHOOT4

getword CURRENTLINE $SPOOF 1
if (($SPOOF <> "Deployed") and ($SPOOF <> "Limpet"))
  goto :SETADJACENTTRIGGERS
end
send "c  p  y  " SECTOR.WARPS[$PSEC][4] "**  q*"
killtrigger SHOT
killtrigger MISSED
settexttrigger SHOT :SHOT4 "Photon Missile launched into sector "&SECTOR.WARPS[$PSEC][4]
settexttrigger MISSED :MISSED4 "<Computer deactivated>"
pause
:MISSED4

killtrigger SHOT
goto :SETADJACENTTRIGGERS
:SHOT4

killtrigger MISSED
send "'{" $BOT~BOT_NAME "} - Adjacent Foton Fired -> Sector " SECTOR.WARPS[$PSEC][4] "*"
subtract $PLAYER~PHOTONS 1
if ($HOLO)
  gosub :DOHOLO
end
if ($PLAYER~PHOTONS = 0)
  send "'{" $BOT~BOT_NAME "} - Out of Fotons - Adjacent Foton Deactivated*"
  halt
end
goto :SETADJACENTTRIGGERS
:SHOOT5

getword CURRENTLINE $SPOOF 1
if (($SPOOF <> "Deployed") and ($SPOOF <> "Limpet"))
  goto :SETADJACENTTRIGGERS
end
send "c  p  y  " SECTOR.WARPS[$PSEC][5] "**  q*"
killtrigger SHOT
killtrigger MISSED
settexttrigger SHOT :SHOT5 "Photon Missile launched into sector "&SECTOR.WARPS[$PSEC][5]
settexttrigger MISSED :MISSED5 "<Computer deactivated>"
pause
:MISSED5

killtrigger SHOT
goto :SETADJACENTTRIGGERS
:SHOT5

killtrigger MISSED
send "'{" $BOT~BOT_NAME "} - Adjacent Foton Fired -> Sector " SECTOR.WARPS[$PSEC][5] "*"
subtract $PLAYER~PHOTONS 1
if ($HOLO)
  gosub :DOHOLO
end
if ($PLAYER~PHOTONS = 0)
  send "'{" $BOT~BOT_NAME "} - Out of Fotons - Adjacent Foton Deactivated*"
  halt
end
goto :SETADJACENTTRIGGERS
:SHOOT6

getword CURRENTLINE $SPOOF 1
if (($SPOOF <> "Deployed") and ($SPOOF <> "Limpet"))
  goto :SETADJACENTTRIGGERS
end
send "c  p  y  " SECTOR.WARPS[$PSEC][6] "**  q*"
killtrigger SHOT
killtrigger MISSED
settexttrigger SHOT :SHOT6 "Photon Missile launched into sector "&SECTOR.WARPS[$PSEC][6]
settexttrigger MISSED :MISSED6 "<Computer deactivated>"
pause
:MISSED6

killtrigger SHOT
goto :SETADJACENTTRIGGERS
:SHOT6

killtrigger MISSED
send "'{" $BOT~BOT_NAME "} - Adjacent Foton Fired -> Sector " SECTOR.WARPS[$PSEC][6] "*"
subtract $PLAYER~PHOTONS 1
if ($HOLO)
  gosub :DOHOLO
end
if ($PLAYER~PHOTONS = 0)
  send "'{" $BOT~BOT_NAME "} - Out of Fotons - Adjacent Foton Deactivated*"
  halt
end
goto :SETADJACENTTRIGGERS
:START_DTORP




gosub :PLAYER~QUIKSTATS
setvar $STARTINGLOCATION $PLAYER~CURRENT_PROMPT
setarray $ADJ 7
setarray $DENS 7
setarray $ADJSEC 7
setarray $DENSITY 7
if ($STARTINGLOCATION = "Command")
  goto :CHECKNDTORPS
elseif ($STARTINGLOCATION = "Planet")
  gosub :PLANET~GETPLANETINFO
  send "q"
  goto :CHECKNDTORPS
elseif ($STARTINGLOCATION = "Citadel")
  send "q"
  gosub :PLANET~GETPLANETINFO
  send "q"
  goto :CHECKNDTORPS
elseif ($STARTINGLOCATION = "<StarDock>")
  send "q"
  goto :CHECKNDTORPS
else
  send "'{" $BOT~BOT_NAME "} - Must be run from Command, Planet, Citadel, or Stardock Prompt.*"
  halt
end
:CHECKNDTORPS

send "cp*q"
waitfor "Command [TL="
settexttrigger ANYPHOTS :ANYPHOTS "Photon Missiles left."
settexttrigger HMMTORPS :HMMTORPS "You do not have any Photon Missiles!"
settexttrigger FED :FEDS "The Feds do not permit protected"
pause
:ANYPHOTS

killtrigger FED
killtrigger HMMTORPS
gosub :PLAYER~TURNOFFANSI
goto :CHECK_DENS
:FEDS

send "'{" $BOT~BOT_NAME "} - Can't launch from fedspace*"
halt
:HMMTORPS

send "'{" $BOT~BOT_NAME "} - No Fotons*"
halt
:CHECK_DENS

setvar $MM 0
setvar $I 0
send "sz*"
waiton "Relative Density Scan"
:DTORP_START

killtrigger ALLDONE
settextlinetrigger GETSEC :GETSEC "Sector"
settexttrigger ALLDONE :ALLDONE "Command [TL="
pause
:GETSEC

add $I 1
gettext CURRENTLINE $ADJ[$I] "Sector" "==>"
striptext $ADJ[$I] "("
striptext $ADJ[$I] ")"
striptext $ADJ[$I] " "
gettext CURRENTLINE $DENS[$I] "==>" "Warps :"
striptext $DENS[$I] ","
striptext $DENS[$I] " "
goto :DTORP_START
:ALLDONE

killtrigger GETSEC
gosub :FIRECHK
:LETSLOOK

setvar $W 0
:SUBLOOKY

add $W 1
if ($W > $I)
  goto :ALLDONE
elseif ($DENSITY[$W] <> $DENS[$W])
  if ($SHIPCHANGE = 1)
    setvar $DIFF ($DENSITY[$W] - $DENS[$W])
    if (($DIFF > 39) and ($DIFF < 495))
      send "c p y " $ADJ[$W] "*  Q  "
      send "'{" $BOT~BOT_NAME "} - Foton Missle Fired into sector => " $ADJ[$W] "*"
      subtract $PLAYER~PHOTONS 1
      if (($DENCONTINUE = 1) and ($PLAYER~PHOTONS > 0))
        send "'{" $BOT~BOT_NAME "} - " $PLAYER~PHOTONS " left continuing scanning..*"
        setvar $DENS[$W] $DENSITY[$W]
        goto :SUBLOOKY
      else
        gosub :PLAYER~TURNONANSI
        goto :DTORP_END
      end
    else
      goto :SUBLOOKY
    end

  else
    send "c p y " $ADJ[$W] "*  Q  "
    send "'{" $BOT~BOT_NAME "} - Foton Missle Fired into sector => " $ADJ[$W] "*"
    subtract $PLAYER~PHOTONS 1
    if (($DENCONTINUE = 1) and ($PLAYER~PHOTONS > 0))
      send "'{" $BOT~BOT_NAME "} - " $PLAYER~PHOTONS " left continuing scanning..*"
      setvar $DENS[$W] $DENSITY[$W]
      goto :SUBLOOKY
    else
      gosub :PLAYER~TURNONANSI
      goto :DTORP_END
    end
  end
else
  goto :SUBLOOKY
end
:FIRECHK

add $MM 1
if ($MM = 150)
  send "'{" $BOT~BOT_NAME "} - WARNING  Density Foton Running at My TA!!!*"
  setvar $MM 0
end
setvar $Y 0
send "sz*"
waiton "Relative Density Scan"
:LOOKY

killtrigger MANUAL_STOP
killtrigger DTOP_DTORP
killtrigger GETSEC
killtrigger ALLDONE
settextouttrigger MANUAL_STOP :MANUAL_STOP "-"
settextlinetrigger DTOP_DTORP :MANUAL_STOP $BOT~BOT_NAME&" foton off"
settextlinetrigger GETSEC :LOOKSEC "Sector"
settexttrigger ALLDONE :DONELOOK "Command [TL="
pause
:LOOKSEC

add $Y 1
gettext CURRENTLINE $ADJSEC[$Y] "Sector" "==>"
striptext $ADJSEC[$Y] "("
striptext $ADJSEC[$Y] ")"
striptext $ADJSEC[$Y] " "
gettext CURRENTLINE $DENSITY[$Y] "==>" "Warps :"
striptext $DENSITY[$Y] ","
striptext $DENSITY[$Y] " "
killtrigger DTOP_DTORP
killtrigger MANUAL_STOP
killtrigger ALLDONE
goto :LOOKY
:DONELOOK

killtrigger GETSEC
return
:MANUAL_STOP

killtrigger MANUAL_STOP
killtrigger DTOP_DTORP
killtrigger GETSEC
killtrigger ALLDONE
send "'{" $BOT~BOT_NAME "} - Density Foton Stoped . . *"
gosub :PLAYER~TURNONANSI
:DTORP_END

if (($STARTINGLOCATION = "Planet") or ($STARTINGLOCATION = "Citadel"))
  gosub :PLANET~LANDINGSUB
  halt
else
  halt
end
:FOTON



gosub :PLAYER~QUIKSTATS
setvar $STARTINGLOCATION $PLAYER~CURRENT_PROMPT
if ($STARTINGLOCATION = "Citadel")
  goto :FOTON_START
else
  send "'{" $BOT~BOT_NAME "} - Must Start at Citadel.*"
  halt
end
:FOTON_START

setvar $HOME_SECTOR2 $PLAYER~CURRENT_SECTOR
if ($PLAYER~PHOTONS <= 0)
  goto :FOTON_OUT_OF_FOTONS
end
send "q"

gosub :PLANET~GETPLANETINFO
send "c"
:FOTON_GET_FIGS

send "*"
waitfor "Citadel command (?="
:FOTON_GO


if ($AUTO_RETURN)
  send "'{" $BOT~BOT_NAME "} - Foton Running From Planet "&$PLANET~PLANET&" w/ Return Home enabled. "&$PLAYER~PHOTONS&" Photons armed and ready.*"
else
  send "'{" $BOT~BOT_NAME "} - Foton Running From Planet "&$PLANET~PLANET&", "&$PLAYER~PHOTONS&" Photons armed and ready.*"
end
goto :PLANETPHOTONTRIGGERS
:FOTON_PWPLIMP




gosub :FOTON_LIMPHIT
goto :FOTON_PWP_GO
:FOTON_PWPARMID

gosub :FOTON_MINEHIT
goto :FOTON_PWP_GO
:FOTON_PWPFIG
:FOTON_PWP_GO



killalltriggers
gosub :FOTON_GET_ADJ
if ($DELAYWALK > 0)
  setdelaytrigger DELAYWALKTRIGGER :DELAYWALKTRIGGER $DELAYWALK
  pause
  :DELAYWALKTRIGGER
  add $DELAYWALK 100
end
send "p" $ADJSEC "*y c p y " $SECTOR "**q"
settextlinetrigger WRONG :FOTON_WRONG "That is not an adjacent sector"
settextlinetrigger GOTEM :FOTON_GOTEM "Photon Missile launched into sector"
settextlinetrigger WRONG2 :FOTON_WRONG2 "The Feds do not permit Photon Torpedos"
pause
:FOTON_WRONG2

killtrigger GOTEM
send "'{" $BOT~BOT_NAME "} - Foton Missed! Resetting!*"
if ($AUTO_RETURN)
  gosub :FOTON_GO_HOME
end
goto :PLANETPHOTONTRIGGERS
:FOTON_WRONG

killtrigger GOTEM
send "'{" $BOT~BOT_NAME "} - Foton Missed! Resetting!*"
setsectorparameter $ADJSEC "FIGSEC" FALSE
if ($AUTO_RETURN)
  gosub :FOTON_GO_HOME
end
goto :PLANETPHOTONTRIGGERS
:FOTON_GOTEM

killtrigger WRONG
send "'{" $BOT~BOT_NAME "} - Foton Fired - Sector => " $SECTOR "!*"
if ($HOLO)
  gosub :DOHOLO
end
if ($AUTO_RETURN)
  gosub :FOTON_GO_HOME
end
gosub :PLAYER~QUIKSTATS
if ($PLAYER~PHOTONS = 0)
  goto :FOTON_OUT_OF_FOTONS
end
if ($GAME~MULTIPLE_PHOTONS <> TRUE)
  settextlinetrigger WAITINGFORCOOLDOWN :EXITCOOLDOWN "Photon Wave Duration has ended in sector "&$SECTOR
  pause
  :EXITCOOLDOWN
end
goto :PLANETPHOTONTRIGGERS
:FOTON_GO_HOME

send "p" $HOME_SECTOR2 "*y"
settextlinetrigger HOMELOCK :FOTON_HOME_LOCK "Locating beam pinpointed"
settextlinetrigger NOHOMELOCK :FOTON_NO_HOME_LOCK "Your own fighters must be"
settextlinetrigger HOME_NOW :FOTON_HOME_LOCK "You are already in that sector!"
pause
:FOTON_NO_HOME_LOCK

killtrigger HOMELOCK
killtrigger NOHOMELOCK
killtrigger HOME_NOW
send "'{" $BOT~BOT_NAME "} - PWarp Lock To Home Failed.*"
:FOTON_HOME_LOCK

killtrigger HOMELOCK
killtrigger NOHOMELOCK
killtrigger HOME_NOW
return
:FOTON_GET_ADJ
setvar $ADJSEC 0
setvar $I 1
while (SECTOR.WARPS[$SECTOR][$I] > 0)
  setvar $TEMPADJ SECTOR.WARPS[$SECTOR][$I]
  getsectorparameter $TEMPADJ "FIGSEC" $ISFIGGED
  if ($ISFIGGED)
    setvar $ADJSEC $TEMPADJ
    return
  end
  add $I 1
end
if ($ADJSEC <= 0)
  echo ANSI_12 "No Adjacent fig found*" ANSI_7
  goto :PLANETPHOTONTRIGGERS
end
return
:FOTON_LIMPHIT

cuttext CURRENTLINE&"      " $CK 1 6
if ($CK <> "Limpet")
  goto :PLANETPHOTONTRIGGERS
end
getword CURRENTLINE $SECTOR 4
return
:FOTON_MINEHIT

cuttext CURRENTLINE&"    " $CK 1 4
if ($CK <> "Your")
  goto :PLANETPHOTONTRIGGERS
end



gettext CURRENTANSILINE $ALIEN_CHECK "damage to" ""
getwordpos $ALIEN_CHECK $POS #27&"[1;36m"&#27&"["
if ($POS > 0)
  goto :PLANETPHOTONTRIGGERS
end

getword CURRENTLINE $SECTOR 4
return
:FOTON_FIGHIT



getword CURRENTLINE $SPOOF_TEST 1
getword CURRENTANSILINE $ANSI_SPOOF_TEST 1
getwordpos $ANSI_SPOOF_TEST $ANSI_SPOOF_POS #27&"[1;33m"
if (($SPOOF_TEST <> "Deployed") or ($ANSI_SPOOF_POS <= 0))
  goto :PLANETPHOTONTRIGGERS
end


getwordpos CURRENTLINE $POS "entered sector."
if ($POS < 1)
  goto :PLANETPHOTONTRIGGERS
end


gettext CURRENTANSILINE $ALIEN_CHECK ": " "'s"
getwordpos $ALIEN_CHECK $POS #27&"[1;36m"&#27&"["
if ($POS > 0)
  goto :PLANETPHOTONTRIGGERS
end


getword CURRENTLINE $SECTOR 5
striptext $SECTOR ":"
isnumber $RESULT $SECTOR
if ($RESULT < 1)
  goto :PLANETPHOTONTRIGGERS
end
if (($SECTOR > SECTORS) or ($SECTOR <= 10))
  goto :PLANETPHOTONTRIGGERS
end
goto :FOTON_PWP_GO
:FOTON_OUT_OF_FOTONS












send "'{" $BOT~BOT_NAME "} - No photon missles, Foton mode shutting down.*"
halt
:SURROUND_FOTON

gosub :PLAYER~QUIKSTATS
setvar $STARTINGLOCATION $PLAYER~CURRENT_PROMPT
if ($STARTINGLOCATION = "Citadel")
  goto :SURROUND_FOTON_START
else
  send "'{" $BOT~BOT_NAME "} - Must Start at Citadel.*"
  halt
end
:SURROUND_FOTON_START

setvar $HOME_SECTOR2 $PLAYER~CURRENT_SECTOR
if ($PLAYER~PHOTONS <= 0)
  goto :FOTON_OUT_OF_FOTONS
end
send "q"

gosub :PLANET~GETPLANETINFO
send "c"
:SURROUND_FOTON_GET_FIGS

send "*"
waitfor "Citadel command (?="
:SURROUND_FOTON_GO


if ($AUTO_RETURN)
  send "'{" $BOT~BOT_NAME "} - Surround Foton Running From Planet "&$PLANET~PLANET&" w/ Return Home enabled. "&$PLAYER~PHOTONS&" Photons armed and ready.*"
else
  send "'{" $BOT~BOT_NAME "} - Surround Foton Running From Planet "&$PLANET~PLANET&", "&$PLAYER~PHOTONS&" Photons armed and ready.*"
end
goto :SURROUNDPHOTONTRIGGERS
:SURROUND_FOTON_FIGHIT



getword CURRENTLINE $SPOOF_TEST 1
getword CURRENTANSILINE $ANSI_SPOOF_TEST 1
getwordpos $ANSI_SPOOF_TEST $ANSI_SPOOF_POS #27&"[1;33m"
if (($SPOOF_TEST <> "Deployed") or ($ANSI_SPOOF_POS <= 0))
  goto :SURROUNDPHOTONTRIGGERS
end


getwordpos CURRENTLINE $POS "entered sector."
if ($POS < 1)
  goto :SURROUNDPHOTONTRIGGERS
end


gettext CURRENTANSILINE $ALIEN_CHECK ": " "'s"
getwordpos $ALIEN_CHECK $POS #27&"[1;36m"&#27&"["
if ($POS > 0)
  goto :SURROUNDPHOTONTRIGGERS
end


getword CURRENTLINE $SECTOR 5
striptext $SECTOR ":"
isnumber $RESULT $SECTOR
if ($RESULT < 1)
  goto :SURROUNDPHOTONTRIGGERS
end
if (($SECTOR > SECTORS) or ($SECTOR <= 10))
  goto :SURROUNDPHOTONTRIGGERS
end
:ATTEMPTSURROUNDDROP
setvar $I 1
setvar $CHECKSECTOR SECTOR.WARPS[$SECTOR][$I]
setvar $ISFOUND FALSE
while (($CHECKSECTOR > 0) and ($ISFOUND = FALSE))
  getsectorparameter $CHECKSECTOR "FIGSEC" $ISFIGGED
  if ($ISFIGGED <> TRUE)
    setvar $RETREATSECTOR $CHECKSECTOR
    setvar $ISFOUND TRUE
  else
    add $I 1
    setvar $CHECKSECTOR SECTOR.WARPS[$SECTOR][$I]
  end
end

if ($ISFOUND)
  setvar $I 2

  setvar $CHECKSECTOR SECTOR.WARPS[$RETREATSECTOR][$I]
  setvar $ISFOUND FALSE
  setvar $TARGETS ""
  setvar $TARGETCOUNT 0
  while ($CHECKSECTOR > 0)
    getsectorparameter $CHECKSECTOR "FIGSEC" $ISFIGGED
    if (($ISFIGGED = TRUE) and ($CHECKSECTOR <> $SECTOR))
      setvar $TARGETS $TARGETS&" "&$CHECKSECTOR&" "
      add $TARGETCOUNT 1
    end
    setvar $CHECKSECTOR SECTOR.WARPS[$RETREATSECTOR][$I]
    add $I 1
  end
  if ($TARGETCOUNT > 0)
    :TRYSURROUNDFOTONAGAIN
    killalltriggers
    getword $TARGETS $GOTOSECTOR $TARGETCOUNT
    setvar $TARGETCOUNT ($TARGETCOUNT - 1)
    send "p" $GOTOSECTOR "*y c p y " $RETREATSECTOR "**q"
    settextlinetrigger S_WRONG :SURROUND_FOTON_WRONG "That is not an adjacent sector"
    settextlinetrigger S_GOTEM :SURROUND_FOTON_GOTEM "Photon Missile launched into sector"
    settextlinetrigger S_FED :SURROUND_FOTON_FED "The Feds do not permit Photon Torpedos"
    pause
  else
    echo "** No Adjacent Fig Next To Possible Retreat Sector **"
  end
else
  echo "** No Possible Retreat Sector **"
end
goto :SURROUNDPHOTONTRIGGERS
:SURROUND_FOTON_FED

killtrigger S_GOTEM
killtrigger S_WRONG
if ($TARGETCOUNT > 0)
  goto :TRYSURROUNDFOTONAGAIN
end
send "'{" $BOT~BOT_NAME "} - Foton Missed! Resetting!*"
setsectorparameter $GOTOSECTOR "FIGSEC" FALSE
if ($AUTO_RETURN)
  gosub :FOTON_GO_HOME
end
goto :SURROUNDPHOTONTRIGGERS
:SURROUND_FOTON_WRONG

killtrigger S_GOTEM
killtrigger S_FED
if ($TARGETCOUNT > 0)
  goto :TRYSURROUNDFOTONAGAIN
end
send "'{" $BOT~BOT_NAME "} - Foton Missed! Resetting!*"
if ($AUTO_RETURN)
  gosub :FOTON_GO_HOME
end
goto :SURROUNDPHOTONTRIGGERS
:SURROUND_FOTON_GOTEM

killtrigger S_WRONG
killtrigger S_FED
send "'{" $BOT~BOT_NAME "} - Foton Fired - Sector => " $RETREATSECTOR "!*"
if ($HOLO)
  gosub :DOHOLO
end
if ($AUTO_RETURN)
  gosub :FOTON_GO_HOME
end
gosub :PLAYER~QUIKSTATS
if ($PLAYER~PHOTONS = 0)
  goto :FOTON_OUT_OF_FOTONS
end
if ($GAME~MULTIPLE_PHOTONS <> TRUE)
  settextlinetrigger WAITINGFORCOOLDOWN :EXITCOOLDOWNSURROUND "Photon Wave Duration has ended in sector "&$RETREATSECTOR
  pause
  :EXITCOOLDOWNSURROUND
end
goto :SURROUNDPHOTONTRIGGERS
:TRAP_FOTON


gosub :PLAYER~QUIKSTATS
setvar $STARTINGLOCATION $PLAYER~CURRENT_PROMPT
if ($STARTINGLOCATION = "Citadel")
  goto :TRAP_FOTON_START
else
  send "'{" $BOT~BOT_NAME "} - Must Start at Citadel.*"
  halt
end
:TRAP_FOTON_START

setvar $HOME_SECTOR2 $PLAYER~CURRENT_SECTOR
if ($PLAYER~PHOTONS <= 0)
  goto :FOTON_OUT_OF_FOTONS
end
send "q"

gosub :PLANET~GETPLANETINFO
send "c"
:TRAP_FOTON_GET_FIGS

send "*"
waitfor "Citadel command (?="
:TRAP_FOTON_GO


if ($AUTO_RETURN)
  send "'{" $BOT~BOT_NAME "} - Trap Foton Running From Planet "&$PLANET~PLANET&" w/ Return Home enabled. "&$PLAYER~PHOTONS&" Photons armed and ready.*"
else
  send "'{" $BOT~BOT_NAME "} - Trap Foton Running From Planet "&$PLANET~PLANET&", "&$PLAYER~PHOTONS&" Photons armed and ready.*"
end
goto :TRAPPHOTONTRIGGERS
:TRAP_FOTON_FIGHIT



getword CURRENTLINE $SPOOF_TEST 1
getword CURRENTANSILINE $ANSI_SPOOF_TEST 1
getwordpos $ANSI_SPOOF_TEST $ANSI_SPOOF_POS #27&"[1;33m"
if (($SPOOF_TEST <> "Deployed") or ($ANSI_SPOOF_POS <= 0))
  goto :TRAPPHOTONTRIGGERS
end


getwordpos CURRENTLINE $POS "entered sector."
if ($POS < 1)
  goto :TRAPPHOTONTRIGGERS
end


gettext CURRENTANSILINE $ALIEN_CHECK ": " "'s"
getwordpos $ALIEN_CHECK $POS #27&"[1;36m"&#27&"["
if ($POS > 0)
  goto :TRAPPHOTONTRIGGERS
end


getword CURRENTLINE $SECTOR 5
striptext $SECTOR ":"
isnumber $RESULT $SECTOR
if ($RESULT < 1)
  goto :TRAPPHOTONTRIGGERS
end
:TESTTRAPENTERHERE
if (($SECTOR > SECTORS) or ($SECTOR <= 10))
  goto :TRAPPHOTONTRIGGERS
end
:ATTEMPTTRAPDROP
setvar $I 1
setvar $CHECKSECTOR SECTOR.WARPS[$SECTOR][$I]
setvar $FADJ 0
setvar $FADJI 0
setvar $ISFOUND FALSE
while ($CHECKSECTOR > 0)
  getsectorparameter $CHECKSECTOR "FIGSEC" $ISFIGGED
  getsectorparameter $CHECKSECTOR "LIMPSEC" $ISLIMP

  if (($ISFIGGED = TRUE) and ($ISLIMP <> TRUE))
    add $FADJI 1
    setvar $FADJ[$FADJI] $CHECKSECTOR
    setvar $ISFOUND TRUE
  end
  add $I 1
  setvar $CHECKSECTOR SECTOR.WARPS[$SECTOR][$I]
end

if ($ISFOUND)
  setvar $TRAPSECLAND 0
  setvar $TRAPSECFIRETO 0
  setvar $TRAPSECI 0
  setvar $ISFOUND FALSE
  setvar $I 1
  while ($I <= $FADJI)
    setvar $TESTSECTOR $FADJ[$I]
    setvar $Y 1
    while ($Y <= SECTOR.WARPINCOUNT[$TESTSECTOR])
      getsectorparameter SECTOR.WARPSIN[$TESTSECTOR][$Y] "FIGSEC" $ISFIGGED
      if (($ISFIGGED = TRUE) and (SECTOR.WARPSIN[$TESTSECTOR][$Y] <> $SECTOR))
        setvar $ISFOUND TRUE
        add $TRAPSECI 1
        setvar $TRAPSECLAND[$TRAPSECI] SECTOR.WARPSIN[$TESTSECTOR][$Y]
        setvar $TRAPSECFIRETO[$TRAPSECI] $TESTSECTOR

        setvar $Y 99
      end
      add $Y 1
    end
    add $I 1
  end

  if ($ISFOUND = TRUE)
    getrnd $WHICHTRAP 1 $TRAPSECI
    killalltriggers
    send "p" $TRAPSECLAND[$WHICHTRAP] "*y c p y " $TRAPSECFIRETO[$WHICHTRAP] "**q"

    settextlinetrigger S_WRONG :TRAP_FOTON_WRONG "That is not an adjacent sector"
    settextlinetrigger S_GOTEM :TRAP_FOTON_GOTEM "Photon Missile launched into sector"
    settextlinetrigger S_FED :TRAP_FOTON_FED "The Feds do not permit Photon Torpedos"
    pause
  else
    echo "** No Adjacent Fig Next To Possible Adjacent Sector **"
  end
else
  echo "** No Possible Trap Sector **"
end
goto :TRAPPHOTONTRIGGERS
:TRAP_FOTON_FED

killtrigger S_GOTEM
killtrigger S_WRONG

send "'{" $BOT~BOT_NAME "} - Foton Missed! Resetting!*"
setsectorparameter $GOTOSECTOR "FIGSEC" FALSE
if ($AUTO_RETURN)
  gosub :FOTON_GO_HOME
end
goto :TRAPPHOTONTRIGGERS
:TRAP_FOTON_WRONG

killtrigger S_GOTEM
killtrigger S_FED

send "'{" $BOT~BOT_NAME "} - Foton Missed! Resetting!*"
if ($AUTO_RETURN)
  gosub :FOTON_GO_HOME
end
goto :TRAPPHOTONTRIGGERS
:TRAP_FOTON_GOTEM

killtrigger S_WRONG
killtrigger S_FED
send "'{" $BOT~BOT_NAME "} - Foton Fired - Sector => " $TRAPSECFIRETO[$WHICHTRAP] "!*"
if ($HOLO)
  gosub :DOHOLO
end
if ($AUTO_RETURN)
  gosub :FOTON_GO_HOME
end
gosub :PLAYER~QUIKSTATS
if ($PLAYER~PHOTONS = 0)
  goto :FOTON_OUT_OF_FOTONS
end
if ($GAME~MULTIPLE_PHOTONS <> TRUE)
  settextlinetrigger WAITINGFORCOOLDOWN :EXITCOOLDOWNTRAP "Photon Wave Duration has ended in sector "&$TRAPSECFIRETO[$WHICHTRAP]
  pause
  :EXITCOOLDOWNTRAP
end
goto :TRAPPHOTONTRIGGERS
:FOTON_LAUNCH


killalltriggers
send "p" $ADJSEC "*y c p y " $SECTOR "**q"
settextlinetrigger LAUNCH_WRONG :FOTON_LAUNCH_WRONG "That is not an adjacent sector"
settextlinetrigger LAUNCH_GOTEM :FOTON_LAUNCH_GOTEM "Photon Missile launched into sector"
settextlinetrigger LAUNCH_WRONG2 :FOTON_LAUNCH_WRONG "The Feds do not permit Photon Torpedos to be launched into FedSpace"
pause
:FOTON_LAUNCH_WRONG

killtrigger LAUNCH_GOTEM
send "'{" $BOT~BOT_NAME "} - That is not an adjacent sector!*"
halt
:FOTON_LAUNCH_GOTEM

killtrigger WRONG
send "'{" $BOT~BOT_NAME "} - Foton Fired - Sector => " $BOT~PARM2 "!*"
if ($HOLO)
  gosub :DOHOLO
end
halt
:DOHOLO


setvar $BOT~COMMAND "holo"
setvar $BOT~USER_COMMAND_LINE " holo"

savevar $BOT~COMMAND
savevar $BOT~USER_COMMAND_LINE
load "scripts\"&$BOT~MOMBOT_DIRECTORY&"\commands\data\holo.cts"
seteventtrigger HOLOEND1 :HOLOEND1 "SCRIPT STOPPED" "scripts\"&$BOT~MOMBOT_DIRECTORY&"\commands\data\holo.cts"
pause
:HOLOEND1
killalltriggers
return
:PHOTONSECTOR



setvar $STARTINGLOCATION $PLAYER~CURRENT_PROMPT

if (($STARTINGLOCATION <> "Planet") and (($STARTINGLOCATION <> "Command") and ($STARTINGLOCATION <> "Citadel")))
  send "'{" $BOT~BOT_NAME "} - Must start at Command, Planet or Citadel*"
  halt
end

if ($PLAYER~PHOTONS = 0)
  send "'{" $BOT~BOT_NAME "} - Out of Fotons - Dock Foton Deactivated*"
  setvar $MODE "General"
  halt
end











setvar $RETURNSECTOR 0
setvar $ADJSEC 0
setvar $PSEC $BOT~PARM1
setvar $PSECADJ 0
setvar $I 1
while ($I <= SECTOR.WARPCOUNT[$PLAYER~CURRENT_SECTOR])
  if ($PSEC = SECTOR.WARPS[$PLAYER~CURRENT_SECTOR][$I])
    setvar $PSECADJ 1
  end
  add $I 1
end



if ($PSECADJ = 0)
  if ($STARTINGLOCATION = "Command")


    if (($PLAYER~TWARP_TYPE = 1) or ($PLAYER~TWARP_TYPE = 2))
      if ($PLAYER~ORE_HOLDS < 2)
        setvar $SWITCHBOARD~MESSAGE "No fuel ore onboard.*"
        gosub :SWITCHBOARD~SWITCHBOARD
        halt
      end
    else
      setvar $SWITCHBOARD~MESSAGE "Photoning non adjacent sectors via TWarp not currently implemented*"
      gosub :SWITCHBOARD~SWITCHBOARD
      halt
    end
  end




  setvar $I 1
  while ($I <= SECTOR.WARPINCOUNT[$PSEC])

    getsectorparameter SECTOR.WARPSIN[$PSEC][$I] "FIGSEC" $ISFIGGED
    if ($ISFIGGED)
      setvar $ADJSEC SECTOR.WARPSIN[$PSEC][$I]
      setvar $I 7
    end
    add $I 1
  end

  if ($AUTO_RETURN = TRUE)
    setvar $RETURNSECTOR $PLAYER~CURRENT_SECTOR
  end

  if ($ADJSEC = 0)
    setvar $SWITCHBOARD~MESSAGE "No sector adjacent with a fighter.*"
    gosub :SWITCHBOARD~SWITCHBOARD
    halt
  end
  if ($STARTINGLOCATION = "Planet")
    send "c p" $ADJSEC "*y "
  elseif ($STARTINGLOCATION = "Citadel")
    send "p" $ADJSEC "*y "
  elseif ($STARTINGLOCATION = "Command")

    setvar $WARPTO $ADJSEC
    gosub :FOTONTWARP
    if ($TWARPSUCCESS = FALSE)
      setvar $SWITCHBOARD~MESSAGE "We did not make the twarp to the location.*"
      gosub :SWITCHBOARD~SWITCHBOARD
      halt
    end
  end


  send "c p y " $PSEC "* * q"
else
  send "c p y " $PSEC "* * q"


end
settextlinetrigger LAUNCH_WRONG :FOTON_LAUNCH_WRONG2 "That is not an adjacent sector"
settextlinetrigger LAUNCH_GOTEM :FOTON_LAUNCH_GOTEM2 "Photon Missile launched into sector"
settextlinetrigger LAUNCH_WRONG2 :FOTON_LAUNCH_WRONG2 "The Feds do not permit Photon Torpedos to be launched into FedSpace"
pause
:FOTON_LAUNCH_WRONG2
killalltriggers

setvar $SWITCHBOARD~MESSAGE "That is not an adjacent sector!*"
gosub :SWITCHBOARD~SWITCHBOARD
gosub :PHOTONCHECKRETURN
halt
:FOTON_LAUNCH_GOTEM2

killalltriggers

setvar $SWITCHBOARD~MESSAGE "Foton Fired - Sector => "&$BOT~PARM1&"!*"
gosub :SWITCHBOARD~SWITCHBOARD
if ($HOLO)
  gosub :DOHOLO
end
gosub :PHOTONCHECKRETURN

halt
:PHOTONTOW


setvar $TOWSHIP $BOT~PARM3
isnumber $NUMBER $TOWSHIP

if ($NUMBER <> 1)
  setvar $SWITCHBOARD~MESSAGE "Please user Foton on t [ship_number] for tow xport foton.*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
else
  if ($TOWSHIP = 0)
    setvar $SWITCHBOARD~MESSAGE "Please user Foton on t [ship_number] for tow xport foton.*"
    gosub :SWITCHBOARD~SWITCHBOARD
    halt
  end
end
gosub :PREPTOW

setvar $HOME_SECTOR2 $PLAYER~CURRENT_SECTOR
setvar $OURSHIP $PLAYER~SHIP_NUMBER

if ($AUTO_RETURN)
  send "'{" $BOT~BOT_NAME "} - TWarp Tow Foton Running, Towing "&$TOWSHIP&" w/ Return Home enabled. Firing one shot.*"
else
  send "'{" $BOT~BOT_NAME "} - TWarp Tow Foton Running, Towing "&$TOWSHIP&", Firing one shot.*"
end
goto :TOWPHOTONTRIGGERS
:TOW_PWPLIMP


gosub :TOW_LIMPHIT
goto :TOW_PWP_GO
:TOW_PWPARMID

gosub :TOW_MINEHIT
goto :TOW_PWP_GO
:TOW_PWPFIG
:TOW_PWP_GO



killalltriggers
gosub :TOW_GET_ADJ
if ($ADJSEC <> $PLAYER~CURRENT_SECTOR)
  setvar $WARPTO $ADJSEC
  gosub :FOTONTWARP
  if ($TWARPSUCCESS = FALSE)
    setvar $SWITCHBOARD~MESSAGE "We did not make the twarp to the launch sector.. Shutting Down*"
    gosub :SWITCHBOARD~SWITCHBOARD
    halt
  end
end
send "x " $TOWSHIP "* * "
send "c p y " $SECTOR "**q"
send "x " $OURSHIP "* * "
send "w n " $TOWSHIP "*"

settextlinetrigger WRONG :TOW_WRONG "That is not an adjacent sector"
settextlinetrigger GOTEM :TOW_GOTEM "Photon Missile launched into sector"
settextlinetrigger WRONG2 :TOW_WRONG2 "The Feds do not permit Photon Torpedos"
pause
:TOW_WRONG2

killtrigger GOTEM
send "'{" $BOT~BOT_NAME "} - Foton Missed! Resetting!*"
if ($AUTO_RETURN and ($ADJSEC <> $PLAYER~CURRENT_SECTOR))
  gosub :TOW_GO_HOME
end
goto :TOWPHOTONTRIGGERS
:TOW_WRONG

killtrigger GOTEM
send "'{" $BOT~BOT_NAME "} - Foton Missed! Resetting!*"
setsectorparameter $ADJSEC "FIGSEC" FALSE
if ($AUTO_RETURN and ($ADJSEC <> $PLAYER~CURRENT_SECTOR))
  gosub :TOW_GO_HOME
end
goto :TOWPHOTONTRIGGERS
:TOW_GOTEM

killtrigger WRONG
send "'{" $BOT~BOT_NAME "} - Foton Fired - Sector => " $SECTOR "!*"
if ($HOLO)
  gosub :DOHOLO
end
if ($AUTO_RETURN and ($ADJSEC <> $PLAYER~CURRENT_SECTOR))
  gosub :TOW_GO_HOME
end
gosub :PLAYER~QUIKSTATS
send "w"
setvar $SWITCHBOARD~MESSAGE "T-warp foton complete - reload ore/fotons and run again.*"
gosub :SWITCHBOARD~SWITCHBOARD
halt
:TOW_GO_HOME

setvar $WARPTO $HOME_SECTOR2
gosub :FOTONTWARP
if ($TWARPSUCCESS = FALSE)
  send "'{" $BOT~BOT_NAME "} - Failed to twarp back with tow, attemping without!*"
  gosub :FOTONTWARP
  if ($TWARPSUCCESS = FALSE)
    setvar $SWITCHBOARD~MESSAGE "Failed to make twarp back without ship. Exiting and then Panicking.*"
    gosub :SWITCHBOARD~SWITCHBOARD
    halt
  end
end

return
:TOW_GET_ADJ

setvar $ADJSEC 0
setvar $I 1
while (SECTOR.WARPS[$SECTOR][$I] > 0)
  setvar $TEMPADJ SECTOR.WARPS[$SECTOR][$I]
  getsectorparameter $TEMPADJ "FIGSEC" $ISFIGGED
  if ($TEMPADJ = $PLAYER~CURRENT_SECTOR)
    setvar $ADJSEC $TEMPADJ
    return
  end
  if ($ISFIGGED)
    setvar $ADJSEC $TEMPADJ
  end



  add $I 1
end
if ($ADJSEC <= 0)
  echo ANSI_12 "No Adjacent fig found*" ANSI_7
  goto :TOWPHOTONTRIGGERS
end
return

halt
:PREPTOW

if ($STARTINGLOCATION <> "Command")
  setvar $SWITCHBOARD~MESSAGE "Foton two needs to be from command prompt*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end
if ($PLAYER~TWARP_TYPE = 2)
  if ($PLAYER~ORE_HOLDS <> $PLAYER~TOTAL_HOLDS)
    setvar $SWITCHBOARD~MESSAGE "Make sure holds are full of fuel.*"
    gosub :SWITCHBOARD~SWITCHBOARD
    halt
  end
else
  setvar $SWITCHBOARD~MESSAGE "You need a type two twarp.*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end

setvar $XPORTSECTOROK 0
setvar $XPORTPHOTONSOK 0

send "x"
:XPORTWAIT
settextlinetrigger XPORTTESTFED :XPORTTESTFED "Any unmanned ships in FedSpace will be automatically"
settextlinetrigger XPORTTEST :XPORTTEST "--<  Available Ship Scan  >--"
settextlinetrigger XPORTFAIL :XPORTFAIL "You do not own any other ships!"
pause
:XPORTFAIL
killalltriggers
setvar $SWITCHBOARD~MESSAGE "You don't own any ships to tow.*"
gosub :SWITCHBOARD~SWITCHBOARD
halt
:XPORTTESTFED
send "*"
killalltriggers
goto :XPORTWAIT
:XPORTTEST
killalltriggers
send "i"
send $TOWSHIP "*q"
settextlinetrigger XPORTSHIPNA :XPORTSHIPNA "That is not an available ship."
settextlinetrigger XPORTSHIP :XPORTSHIP "Ship Name      :"
pause
:XPORTSHIPNA
killalltriggers

setvar $SWITCHBOARD~MESSAGE "Ship is not available.*"
gosub :SWITCHBOARD~SWITCHBOARD
halt
:XPORTSHIP
settextlinetrigger XPORTSHIPSEC :XPORTSHIPSEC "Current Sector :"
settextlinetrigger XPORTSHIPPHOTON :XPORTSHIPPHOTON "Photon Missiles:"
settexttrigger XPORTSHIPPAUSE :XPORTSHIPPAUSE "[Pause]"
pause
:XPORTSHIPSEC
killalltriggers
getword CURRENTLINE $TESTSECTOR 4
if ($TESTSECTOR = $PLAYER~CURRENT_SECTOR)
  setvar $XPORTSECTOROK 1
end
goto :XPORTSHIP
:XPORTSHIPPHOTON
killalltriggers
setvar $XPORTPHOTONSOK 1
:XPORTSHIPPAUSE

killalltriggers
send "*q"



if ($XPORTSECTOROK = 0)
  setvar $SWITCHBOARD~MESSAGE "Tow ship is not in same sector.*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end
if ($XPORTPHOTONSOK = 0)
  setvar $SWITCHBOARD~MESSAGE "Tow ship has no photons.*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end
:XPORTRESTARTGO

send "w"
settextlinetrigger XPORTRESTART :XPORTRESTART "You shut off your Tractor Beam."
settexttrigger XPORTSTART :XPORTSTART "Do you wish to tow a manned ship?"
pause
:XPORTRESTART
killalltriggers
goto :XPORTRESTARTGO
:XPORTSTART
send "n" $TOWSHIP "*"



return
:PHOTONCHECKRETURN


if ($RETURNSECTOR > 0)
  gosub :PLAYER~QUIKSTATS
  if ($PLAYER~CURRENT_SECTOR <> $RETURNSECTOR)
    if ($STARTINGLOCATION = "Command")
      setvar $WARPTO $RETURNSECTOR
      gosub :FOTONTWARP
      if ($TWARPSUCCESS = FALSE)
        setvar $SWITCHBOARD~MESSAGE "Twarp return failed post foton.*"
        gosub :SWITCHBOARD~SWITCHBOARD
        halt
      end
    else
      send "p" $RETURNSECTOR "*y"
    end
  end
end


return
:KILLTWARPTRIGGERS

killtrigger LOCKING
killtrigger IGD
killtrigger NOTURNS
killtrigger NOROUTE
killtrigger TWARP_LOCK
killtrigger NO_TWRP_LOCK
killtrigger TWARP_ADJ
killtrigger NO_FUEL
killtrigger TWARPDELAY
return
:FOTONTWARP



setvar $TWARPSUCCESS FALSE
send "mz" $WARPTO "*y"


settextlinetrigger TWARP_LOCK :TWARP_LOCK "TransWarp Locked"
settextlinetrigger NO_TWRP_LOCK :NO_TWARP_LOCK "No locating beam found"
settextlinetrigger TWARP_ADJ :TWARP_ADJ "<Set NavPoint>"
settextlinetrigger NO_FUEL :TWARPNOFUEL "You do not have enough Fuel Ore"
settexttrigger IGD :TWARPIGD "An Interdictor Generator in this sector holds you fast!"
settexttrigger NOTURNS :TWARPPHOTONED "Your ship was hit by a Photon and has been disabled"
setdelaytrigger TWARPDELAY :TWARPDELAY 2000
pause
:TWARPNOFUEL
gosub :KILLTWARPTRIGGERS

goto :TWARPDONE
:TWARP_ADJ
gosub :KILLTWARPTRIGGERS
send "q za  "&$SHIP~SHIP_MAX_ATTACK&"* * r * "
setvar $TWARPSUCCESS TRUE
setvar $MSG "Sector was nextdoor so just warped!"
goto :TWARPDONE
:NO_TWARP_LOCK
gosub :KILLTWARPTRIGGERS
send "n* z* "
setvar $TARGET $WARPTO
setsectorparameter $TARGET "FIGSEC" FALSE
setvar $MSG "No fighters at T-warp point!"
goto :TWARPDONE
:TWARPIGD
gosub :KILLTWARPTRIGGERS
setvar $MSG "My ship is being held by Interdictor!"
goto :TWARPDONE
:TWARPPHOTONED
gosub :KILLTWARPTRIGGERS
setvar $MSG "I have been photoned and can not T-warp!"
goto :TWARPDONE
:TWARPDELAY
gosub :KILLTWARPTRIGGERS
setvar $MSG "T-Warp timed out - Something went wrong!"
goto :TWARPDONE
:TWARP_LOCK
gosub :KILLTWARPTRIGGERS
setvar $TARGET $WARPTO
setsectorparameter $TARGET "FIGSEC" TRUE
send "y   *     "
setvar $MSG "T-warp completed."
setvar $TWARPSUCCESS TRUE
:TWARPDONE

send "'" $MSG "*"
return
:TOW_LIMPHIT




cuttext CURRENTLINE&"      " $CK 1 6
if ($CK <> "Limpet")
  goto :TOWPHOTONTRIGGERS
end
getword CURRENTLINE $SECTOR 4
return
:TOW_MINEHIT

cuttext CURRENTLINE&"    " $CK 1 4
if ($CK <> "Your")
  goto :TOWPHOTONTRIGGERS
end



gettext CURRENTANSILINE $ALIEN_CHECK "damage to" ""
getwordpos $ALIEN_CHECK $POS #27&"[1;36m"&#27&"["
if ($POS > 0)
  goto :TOWPHOTONTRIGGERS
end

getword CURRENTLINE $SECTOR 4
return
:TOW_FIGHIT



getword CURRENTLINE $SPOOF_TEST 1
getword CURRENTANSILINE $ANSI_SPOOF_TEST 1
getwordpos $ANSI_SPOOF_TEST $ANSI_SPOOF_POS #27&"[1;33m"
if (($SPOOF_TEST <> "Deployed") or ($ANSI_SPOOF_POS <= 0))
  goto :TOWPHOTONTRIGGERS
end


getwordpos CURRENTLINE $POS "entered sector."
if ($POS < 1)
  goto :TOWPHOTONTRIGGERS
end


gettext CURRENTANSILINE $ALIEN_CHECK ": " "'s"
getwordpos $ALIEN_CHECK $POS #27&"[1;36m"&#27&"["
if ($POS > 0)
  goto :TOWPHOTONTRIGGERS
end


getword CURRENTLINE $SECTOR 5
striptext $SECTOR ":"
isnumber $RESULT $SECTOR
if ($RESULT < 1)
  goto :TOWPHOTONTRIGGERS
end
if (($SECTOR > SECTORS) or ($SECTOR <= 10))
  goto :TOWPHOTONTRIGGERS
end
goto :TOW_PWP_GO

# includes:
include "include/BOT.ts"
include "include/PLAYER.ts"
include "include/PLANET.ts"
