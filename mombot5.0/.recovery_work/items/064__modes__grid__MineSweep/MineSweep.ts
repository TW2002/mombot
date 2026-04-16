reqrecording
logging "OFF"
loadvar $BOT_NAME
loadvar $UNLIMITEDGAME
loadvar $BOT_TURN_LIMIT
loadvar $USER_COMMAND_LINE
loadvar $PARM1
loadvar $PARM2
loadvar $PARM3
loadvar $PARM4
loadvar $PARM5
loadvar $PARM6
loadvar $PARM7
loadvar $PARM8
loadvar $STARDOCK
loadvar $BACKDOOR
loadvar $LIMPET_COST
loadvar $ARMID_COST
loadvar $LIMPET_REMOVAL_COST
loadvar $PASSWORD
setvar $GRID_LIMPETS 1
setvar $GRID_ARMIDS 4
setvar $REFURB FALSE
setvar $LONGJUMPLIMIT 5
setvar $VERSION "1.0.5"
getsectorparameter SECTORS "FIGSEC" $ISFIGGED
getsectorparameter SECTORS "MINESEC" $ISARMIDED
getsectorparameter SECTORS "LIMPSEC" $ISLIMPED
if (($STARDOCK = 0) or ($STARDOCK = ""))
  send "'{"&$BOT_NAME&"} - Stardock is not defined.  Please define stardock variable in the bot.*"
  halt
end
if ($ISFIGGED = "")
  send "'{"&$BOT_NAME&"} - It appears no grid data is available.  Run a fighter grid checker that uses the sector parameter FIGSEC. (Try figs command)*"
  halt
end
if ($ISARMIDED = "")
  send "'{"&$BOT_NAME&"} - It appears no armid data is available.  Run an armid grid checker that uses the sector parameter MINESEC. (Try armids command)*"
  halt
end
if ($ISLIMPED = "")
  send "'{"&$BOT_NAME&"} - It appears no limpet data is available.  Run a limpet grid checker that uses the sector parameter LIMPSEC. (Try limps command)*"
  halt
end

gosub :QUIKSTATS
if ($CURRENT_PROMPT <> "Citadel")
  send "'{"&$BOT_NAME&"} - Must must start mine sweeper from citadel prompt.*"
  halt
end

if ($PHOTONS <> 0)
  send "'{"&$BOT_NAME&"} - Cannot Have Fotons!*"
  halt
end

setvar $TEMP " "&$USER_COMMAND_LINE&" "
lowercase $TEMP

getwordpos $TEMP $POS " furb "
if ($POS = 0)
  setvar $REFURB FALSE
else
  setvar $REFURB TRUE
end

getwordpos $TEMP $POS " disr "
if ($POS = 0)
  setvar $DISR FALSE
else
  setvar $DISR TRUE
end

getwordpos $TEMP $POS " fast "
if ($POS = 0)
  setvar $FAST FALSE
else
  setvar $FAST TRUE
end

getwordpos $TEMP $POS " nonsafe "
if ($POS = 0)
  setvar $NONSAFE FALSE
else
  if ($FAST)
    setvar $NONSAFE FALSE
  else
    setvar $NONSAFE TRUE
  end
end

getwordpos $TEMP $POS " border "
if ($POS = 0)
  setvar $BORDER FALSE
else
  setvar $BORDER TRUE
end

getwordpos $TEMP $POS " l:"
if ($POS = 0)
  setvar $GRID_LIMPETS 1
else
  gettext $TEMP $GRID_LIMPETS " l:" " "
  isnumber $TST $GRID_LIMPETS
  if ($TST = 0)
    setvar $GRID_LIMPETS 1
  else
    if ($GRID_LIMPETS > 250)
      setvar $GRID_LIMPETS 250
    elseif ($GRID_LIMPETS < 1)
      setvar $GRID_LIMPETS 1
    end
  end
end

getwordpos $TEMP $POS " a:"
if ($POS = 0)
  setvar $GRID_ARMIDS 0
else
  gettext $TEMP $GRID_ARMIDS " a:" " "
  isnumber $TST $GRID_ARMIDS
  if ($TST = 0)
    setvar $GRID_ARMIDS 0
  else
    if ($GRID_ARMIDS > 250)
      setvar $GRID_ARMIDS 250
    elseif ($GRID_ARMIDS < 0)
      setvar $GRID_ARMIDS 0
    end
  end
end

gosub :GETINFO
setvar $HOMESECTOR $CURRENT_SECTOR

killalltriggers
gosub :CHECKAVOIDEDSECTORS
send "q"
gosub :GETPLANETINFO

if (($GRID_LIMPETS = 0) and ($GRID_ARMIDS = 0))
  send "'{" $BOT_NAME "} - Nothing To Do!*"
  halt
end

if (($ORGANIC_HOLDS + ($EQUIPMENT_HOLDS + $COLONIST_HOLDS)) <> 0)
  setvar $MAC ""
  if ($ORGANIC_HOLDS <> 0)
    setvar $MAC $MAC&" T  N  L 2* "
  end
  if ($EQUIPMENT_HOLDS <> 0)
    setvar $MAC $MAC&" T  N  L 3* "
  end
  if ($COLONIST_HOLDS <> 0)
    setvar $MAC $MAC&" S  N  L 1* "
  end
  if ($MAC <> "")
    send $MAC&" t  n  t  1*  m  n t *  c"
    gosub :QUIKSTATS
    if (($ORGANIC_HOLDS + ($EQUIPMENT_HOLDS + $COLONIST_HOLDS)) <> 0)
      send "'{"&$BOT_NAME&"} - Holds Not Empty*"
      halt
    end
  end
else
  send $MAC&" t  n  t  1*  m  n t *  c"
end

gosub :CHECKSHIP

setvar $TEMP "{"&$BOT_NAME&"}"
getlength $TEMP $LEN
setvar $S ""
setvar $I 1
while ($I <= $LEN)
  setvar $S $S&" "
  add $I 1
end
send "'*"
waitfor "Type sub-space message"
send "{" $BOT_NAME "} - Mind ()ver Matter MineSweeper v"&$VERSION&" Loading*"
if ($REFURB)
  send $S&" - Furbing Mines/Disruptors*"
end
if ($DISR)
  send $S&" - Disrupting Enemy Mines*"
end
if ($FAST)
  send $S&" - FAST Sector-Clear Technology!*"
end
if ($NONSAFE)
  send $S&" - SAFE Sector-Clear Technology!*"
end
if ($BORDER)
  send $S&" - Targeting Hostile Sectors!*"
else
  send $S&" - Targeting Safe Sectors!*"
end
send $S&" - Deploying: "&$GRID_ARMIDS&" Armids, "&$GRID_LIMPETS&" Limpets*"
send "*"

while (TRUE)
  gosub :QUIKSTATS
  if ($LIMPETS < $GRID_LIMPETS) or ($ARMIDS < $GRID_ARMIDS) or (($MINE_DISRUPTORS = 0) and $DISR)
    if ($REFURB)
      gosub :ATTEMPTREFURB
    else
      send "'{"&$BOT_NAME&"} -  Need to buy more mines before this script can continue.*"
      halt
    end
  end
  gosub :FINDNEXTTARGET
  send "  sz*    "
  waiton "Warps to Sector(s) :"
  setvar $HAZ_BEFORE SECTOR.NAVHAZ[$CURRENT_SECTOR]
  setvar $PLANETS_BEFORE SECTOR.PLANETCOUNT[$CURRENT_SECTOR]
  if (SECTOR.TRADERCOUNT[$CURRENT_SECTOR] <> 0)
    send "'{"&$BOT_NAME&"} -  Trader Is In Sector. Halting!*"
    waiton "Message sent on sub-space channel"
    send "'"&$BOT_NAME&" pwarp "&$HOMESECTOR&"*"
    waiton "Message sent on sub-space channel"
    halt
  end
  if ($DISR)
    gosub :DISRUPT
  end
  gosub :CLEARSECTOR
  send "  sz*    "
  waiton "Warps to Sector(s) :"
  setvar $HAZ_AFTER SECTOR.NAVHAZ[$CURRENT_SECTOR]
  setvar $PLANETS_AFTER SECTOR.PLANETCOUNT[$CURRENT_SECTOR]
  if (SECTOR.TRADERCOUNT[$CURRENT_SECTOR] <> 0)
    send "'{"&$BOT_NAME&"} -  Trader Is In Sector. Halting!*"
    waiton "Message sent on sub-space channel"
    send "'"&$BOT_NAME&" pwarp "&$HOMESECTOR&"*"
    waiton "Message sent on sub-space channel"
    halt
  end
  if ($HAZ_BEFORE <> $HAZ_AFTER)
    send "'{"&$BOT_NAME&"} -  NavHAZ Changed. Halting!*"
    waiton "Message sent on sub-space channel"
    send "'"&$BOT_NAME&" holo*"
    waiton "Sub-space comm-link terminated"
    send "'"&$BOT_NAME&" pwarp "&$HOMESECTOR&"*"
    waiton "Message sent on sub-space channel"
    halt
  end
  if ($PLANETS_AFTER <> $PLANETS_BEFORE)
    send "'{"&$BOT_NAME&"} -  New Planet in Sector. Halting!*"
    waiton "Message sent on sub-space channel"
    send "'"&$BOT_NAME&" pwarp "&$HOMESECTOR&"*"
    waiton "Message sent on sub-space channel"
    halt
  end
end
halt
:CHECKSHIP
killalltriggers
send "c;q"
waitfor "Offensive Odds:"
getwordpos CURRENTLINE $POS "Offensive"
cuttext CURRENTLINE $ODDLINE $POS 99
gettext $ODDLINE $OFFODD "Odds:" ":1"
striptext $OFFODD " "
striptext $OFFODD "."
waitfor "Mine Max:"
gettext CURRENTLINE $MAXMINES "Mine Max:" "B"
striptext $MAXMINES " "
waitfor "Figs Per Attack:"
getword CURRENTLINE $FIGS 5
multiply $OFFODD $FIGS
divide $OFFODD 12
gosub :QUIKSTATS
return
:ATTEMPTREFURB


setvar $LIMPETCASHNEEDED ((($MAXMINES - $LIMPETS) * $LIMPET_COST) + $LIMPET_REMOVAL_COST)
setvar $ARMIDCASHNEEDED (($MAXMINES - $ARMIDS) * $ARMID_COST)
setvar $CASHNEEDED ($LIMPETCASHNEEDED + $ARMIDCASHNEEDED)
if ($CASHNEEDED > $CREDITS)
  send "D"
  waiton "Citadel treasury contains "
  getword CURRENTLINE $CITADELCASH 4
  striptext $CITADELCASH ","
  if ($CITADELCASH < $CASHNEEDED)
    send "'{"&$BOT_NAME&"} - Not enough cash for mine refurbs in treasury or on hand.*"
    halt
  end
  send "t f "&($CASHNEEDED - $CREDITS)&"* "
end

setvar $I 1
setvar $START_SECTOR $CURRENT_SECTOR
setvar $WEAREADJDOCK FALSE
while ($I <= SECTOR.WARPCOUNT[$START_SECTOR])
  setvar $ADJ_START SECTOR.WARPS[$START_SECTOR][$I]
  if ($ADJ_START = $STARDOCK)
    setvar $WEAREADJDOCK TRUE
  end
  add $I 1
end

if (($ALIGNMENT < 1000) and ($WEAREADJDOCK = FALSE))
  setvar $RED_ADJ 0
  gosub :FINDJUMPSECTOR
  if ($RED_ADJ <> 0)
    send "'{"&$BOT_NAME&"} - Jump Sector Found - Using Sector "&$RED_ADJ&"**"
  else
    waitfor "Command [TL="
    send "'{"&$BOT_NAME&"} - Cannot Find Jump Sector Adjacent Dock**"
    halt
  end
end

if ($ALIGNMENT >= 1000)
  if ($WEAREADJDOCK)
    send "^F"&$STARDOCK&"*"&$START_SECTOR&"*Q/ "
  else
    send "^F"&$START_SECTOR&"*"&$STARDOCK&"*F"&$STARDOCK&"*"&$START_SECTOR&"*Q/ "
  end
else
  if ($WEAREADJDOCK)
    send "^F"&$STARDOCK&"*"&$START_SECTOR&"*Q/ "
  else
    send "^F"&$START_SECTOR&"*"&$RED_ADJ&"*F"&$STARDOCK&"*"&$START_SECTOR&"*Q/ "
  end
end
settextlinetrigger NOJOY :NOJOY "*** Error - No route within"
settexttrigger CONT :CONT "(?="
pause
:NOJOY

killalltriggers
send "'{" $BOT_NAME "} - Cannot Find Path to StarDock!**"
halt
:CONT
killalltriggers
setdelaytrigger LATENCY_DELAY :LATENCY_DELAY 500
pause
:LATENCY_DELAY


echo "**"&ANSI_14&"Please Stand By"&ANSI_15&" - Calculating Distances...**"
if (($ALIGNMENT >= 1000) or $WEAREADJDOCK)
  getdistance $DIST1 $START_SECTOR $STARDOCK
else
  getdistance $DIST1 $START_SECTOR $RED_ADJ
end

if ($DIST1 <= 0)
  send "'{" $BOT_NAME "} "&$TAGLINEB&" - Insufficient Warp Data Plotting Course to Dock**"
  halt
end

getdistance $DIST2 $STARDOCK $START_SECTOR
if ($DIST2 <= 0)
  send "'{" $BOT_NAME "} "&$TAGLINEB&" - Insufficient Warp Data Plotting Return Course From Dock**"
  halt
end

setvar $ORE_REQ (($DIST1 + $DIST2) * 3)

if ($ORE_HOLDS < $ORE_REQ)
  send "'{"&$BOT_NAME&"} - Not Enough ORE In Holds To Make Round Trip**"
  halt
end

if ($TWARP_TYPE = "No")
  send "'{"&$BOT_NAME&"} - Must Have Twarp 1 or 2**"
  halt
end

if ($UNLIMITEDGAME = 0)
  gosub :TURNSREQUIRED
  if ($TURNSREQUIRED > $TURNS)
    send "'{"&$BOT_NAME&"} - Not Enough Turns. "&ANSI_12&$TURNSREQUIRED&ANSI_15&", Required**"
    halt
  elseif ($TURNSREQUIRED <= $TURNS)
    setvar $TMP ($TURNS - $TURNSREQUIRED)
    if ($TMP <= $BOT_TURN_LIMIT)
      send "'{" $BOT_NAME "} - Proceeding Will Leave Fewer Than "&$BOT_TURN_LIMIT&" Turns!**"
      halt
    end
  end
end

send " C R "&$STARDOCK&"*Q "
settextlinetrigger ITSALIVE :ITSALIVE "Items     Status  Trading % of max OnBoard"
settextlinetrigger NOSOUPFORME :NOSOUPFORME "I have no information about a port in that sector"
pause
:NOSOUPFORME
killalltriggers
send "'{" $BOT_NAME "} "&$TAGLINEB&" - StarDock appears to have been Blown Up!**"
halt
:ITSALIVE
killalltriggers
waitfor "(?="
setvar $MSG ""
if (($ALIGNMENT >= 1000) and ($WEAREADJDOCK = FALSE))
  setvar $TWARPTO $STARDOCK
  gosub :DOTWARP
elseif (($WEAREADJDOCK = FALSE) and ($RED_ADJ <> 0))
  setvar $TWARPTO $RED_ADJ
  gosub :DOTWARP
else
  send " m "&$STARDOCK&"*  *  P  S G Y G Q "
end
if ($MSG = "")
  waitfor "You leave the Galactic Bank."
else
  send "'{" $BOT_NAME "} - Unknown Problem Detected. Check TA!**"
  halt
end
gosub :QUIKSTATS

setvar $_LIMPS "Max"
setvar $_MINES "Max"
gosub :DOPURCHASES
send "Q Q Q Q Z N M "&$START_SECTOR&"* Y  Y  Y  * L Z"&#8&$PLANET&"* p  s  s * * c *"
gosub :QUIKSTATS
if ($CURRENT_SECTOR = $STARDOCK)
  send "'{" $BOT_NAME "} - Twarp Error, Should be Hiding on Dock!**"
  halt
end
send "q tnt1* c "


return
:CHECKAVOIDEDSECTORS

setvar $AVOIDEDSECTORS ""
:READAVOIDEDLIST
settextlinetrigger GETLINE1 :GETAVOIDS
send "cxq"
pause
:KEEPCOUNTINGAVOIDS
killalltriggers
settextlinetrigger GETLINE :GETAVOIDS
pause
:GETAVOIDS
killalltriggers
setvar $WORKINGTEXT CURRENTLINE
getwordpos $WORKINGTEXT $POS "<Computer deactivated>"
if ($POS > 0)
  goto :DONEAVOIDS
end
getwordpos $WORKINGTEXT $POS "Computer"
if ($POS > 0)
  goto :KEEPCOUNTINGAVOIDS
end
if (CURRENTLINE = "")
  goto :KEEPCOUNTINGAVOIDS
end
getwordpos $WORKINGTEXT $POS "<List Avoided Sectors>"
if ($POS > 0)
  goto :KEEPCOUNTINGAVOIDS
end
getwordpos $WORKINGTEXT $POS "No Sectors are currently being avoided."
if ($POS > 0)
  goto :DONEAVOIDS
end
getwordpos $WORKINGTEXT $POS "Citadel"
if ($POS > 0)
  goto :KEEPCOUNTINGAVOIDS
end
setvar $WORKINGTEXT $WORKINGTEXT&" +++"
getword $WORKINGTEXT $AVOID 1
getwordpos $WORKINGTEXT $POS $AVOID

while ($AVOID <> "+++")
  setvar $AVOIDEDSECTORS $AVOIDEDSECTORS&" "&$AVOID&" "
  getlength $AVOID $LENGTH
  getlength $WORKINGTEXT $CHECKLENGTH
  cuttext $WORKINGTEXT $WORKINGTEXT ($POS + $LENGTH) 9999
  getword $WORKINGTEXT $AVOID 1
  getwordpos $WORKINGTEXT $POS $AVOID
end

goto :KEEPCOUNTINGAVOIDS
:DONEAVOIDS

return
:DELAYTRIGGER


setdelaytrigger DELAYUNTILSAVEME :CALLSAVEME 1000
return
:CALLSAVEME

killalltriggers
send "*"
waitfor "(?="
getword CURRENTLINE $PROMPT 1
if ($PROMPT = "Citadel")
  echo "**Had to halt script, check ship to see if it is valid.**"
  goto :PAUSEGRIDDER
end
if (($PROMPT = "Computer") or ($PROMPT = "Corporate") or ($PROMPT = "NavPoint"))
  send "q"
  waitfor "Command [TL"
end
gosub :QUIKSTATS
setvar $FIGSTODEPLOY 1
gosub :DEPLOYFIGS
setvar $SAVETARGET $CURRENT_SECTOR
if ($SAVETARGET < 10)
  setvar $SAVETARGET 0000&$SAVETARGET
elseif ($SAVETARGET < 100)
  setvar $SAVETARGET 000&$SAVETARGET
elseif ($SAVETARGET < 1000)
  setvar $SAVETARGET 00&$SAVETARGET
elseif ($SAVETARGET < 10000)
  setvar $SAVETARGET 0&$SAVETARGET

end
send "'"&$SAVETARGET&"=saveme*"
send "'pickup "&$CURRENT_SECTOR&" ::*"
:WAITFORHELP


settextlinetrigger FRIENDLYTWARP :FRIENDLYTWARP "appears in a brilliant flash of warp energies!"
settextlinetrigger FRIENDLYPLANET :FRIENDLYPLANET "Saveme script activated - Planet "
settextlinetrigger TOWLOCKED :TOWLOCKED "locks a tractor beam on your ship."
setdelaytrigger TIMEOUT :TIMEOUT 30000
pause
:TIMEOUT

killalltriggers
send "'30 seconds after save call, script halted.*"
goto :PAUSEGRIDDER
:FRIENDLYTWARP

killalltriggers
setvar $FIGSTODEPLOY "ALL"
gosub :DEPLOYFIGS
goto :WAITFORHELP
:FRIENDLYPLANET

killalltriggers
gettext CURRENTLINE $PLANET "Saveme script activated - Planet " " to "
send "L "&$PLANET&"* C 'I landed on planet "&$PLANET&"*"
goto :PAUSEGRIDDER
:TOWLOCKED

killalltriggers
setvar $FIGSTODEPLOY 1
gosub :DEPLOYFIGS
send "'Tow locked, get us out of here!*"
goto :PAUSEGRIDDER
:DEPLOYFIGS


if ($FIGSTODEPLOY = 0)
  setvar $FIGSTODEPLOY 1
end
if (($CURRENT_SECTOR < 11) or ($CURRENT_SECTOR = $STARDOCK))
  send "'Can't deploy figs in fed*"
  return
end
send "F"
settextlinetrigger NOCONTROL :NOCONTROL "These fighters are not under your control."
settextlinetrigger ABLETODEPLOY :ABLETODEPLOY "fighters available."
pause
:NOCONTROL

killalltriggers
send "'We don't control the figs in this sector!*"
goto :PAUSEGRIDDER
:ABLETODEPLOY

killalltriggers
getword CURRENTLINE $FIGSAVAILABLE 3
striptext $FIGSAVAILABLE ","
if ($FIGSTODEPLOY = "ALL")
  setvar $FIGSTODEPLOY $FIGSAVAILABLE
end
if ($FIGSAVAILABLE = 0)
  send "0* ZC D* 'I have no figs to deploy!*"
else
  send $FIGSTODEPLOY&"* ZC D* '"&$FIGSTODEPLOY&" figs deployed*"
end
return
:DISRUPT

if ($MINE_DISRUPTORS = 0)
  return
end
setdelaytrigger WHOA_WUZUP :WHOA_WUZUP 4000
settextlinetrigger SCAN_COMPLETE :SCAN_COMPLETE "Warps to Sector(s)"
send " Q Q S  H* "
pause
:WHOA_WUZUP
killalltriggers
send "'Unknown Problem Occured, Attempting to reach Command Prompt!*  P D 0* 0* 0* * *** * C  Q  Q  Q  Q  Q  Z  2  2  C  Q  *  Z  *  ***  *  *  ^Q"
waitfor ": ENDINTERROG"
gosub :QUIKSTATS
send "'Unknown Problem Occured, at '"&$CURRENT_PROMPT&"' Prompt!*"
halt
:SCAN_COMPLETE
killalltriggers
setarray $ADJ2HIT 6 1
setvar $IDX 1

while (SECTOR.WARPS[$CURRENT_SECTOR][$IDX] > 0)
  setvar $ADJ SECTOR.WARPS[$CURRENT_SECTOR][$IDX]
  if (SECTOR.MINES.QUANTITY[$ADJ] <> 0)
    if ((SECTOR.MINES.OWNER[$ADJ] <> "belong to your Corp") and (SECTOR.MINES.OWNER[$ADJ] <> "yours"))
      setvar $ADJ2HIT[$IDX] $ADJ
      setvar $ADJ2HIT[$IDX][1] SECTOR.MINES.QUANTITY[$ADJ]
    else
      setvar $ADJ2HIT[$IDX][1] 0
    end
  end
  add $IDX 1
end

setvar $DISRUPTORS $MINE_DISRUPTORS
send " C "
:LETS_GO_AGAIN
setvar $IDX 1
setvar $ADJ_HITS 0
while ($IDX <= 6)
  if ($ADJ2HIT[$IDX][1] <> 0)
    settextlinetrigger NOMINES :NOMINES "There were no mines in sector "&$ADJ2HIT[$IDX]
    settextlinetrigger MINESGONE :MINESGONE "of the mines in sector "&$ADJ2HIT[$IDX]&"!"
    settextlinetrigger NOTADJ :NOTADJ "That is not an adjacent sector"
    send " W Y "&$ADJ2HIT[$IDX]&"*"
    pause
    :NOMINES
    killalltriggers
    setvar $DISRUPTORS ($DISRUPTORS - 1)
    setvar $ADJ2HIT[$IDX][1] 0
    goto :LOOP_D_LOU
    :NOTADJ
    killalltriggers
    send " Q"
    setvar $ADJ2HIT[$IDX][1] 0
    goto :LOOP_D_LOU
    :MINESGONE
    killalltriggers
    setvar $TEMP CURRENTLINE
    getwordpos $TEMP $POS "remain)"
    setvar $DISRUPTORS ($DISRUPTORS - 1)
    if ($POS = 0)
      getword $TEMP $TEMP 4
      isnumber $TST $TEMP
      if ($TST)
        setvar $TOTAL_MINES_POOFED ($TOTAL_MINES_POOFED + $TEMP)
      end
      setvar $ADJ2HIT[$IDX][1] 0
    else
      getword $TEMP $TEMP2 3
      isnumber $TST $TEMP2
      if ($TST)
        setvar $TOTAL_MINES_POOFED ($TOTAL_MINES_POOFED + $TEMP2)
      end
      gettext $TEMP $TEMP $ADJ2HIT[$IDX]&"! (" " remain)"
      isnumber $TST $TEMP
      if ($TST = 0)
        setvar $TEMP 0
      end
      setvar $ADJ2HIT[$IDX][1] $TEMP
      setvar $ADJ_HITS ($ADJ_HITS + 1)
    end
    :LOOP_D_LOU
    if ($DISRUPTORS < 1)
      setvar $IDX 6
    end
  end
  add $IDX 1
end
if (($ADJ_HITS <> 0) and (($DISRUPTORS > 0) and ($BURSTING = 0)))
  goto :LETS_GO_AGAIN
end
send " Q "
send " Q Q Q Z N L Z"&#8&$PLANET&"*  *  J  C  *  * "
settexttrigger LANDED :LANDED "Citadel command (?"
settextlinetrigger NOTLANDED :NOTLANDED "Are you sure you want to jettison all cargo"
pause
:NOLANDED
killalltriggers
send "'Unknown Problem Occured after StarBurst!*"
halt
:LANDED
killalltriggers
return
:FINDNEXTTARGET


getnearestwarps $NEAREST $CURRENT_SECTOR
setvar $CHECKED ""
setvar $I 1
while ($I <= $NEAREST)
  setvar $FOCUS $NEAREST[$I]
  setvar $CHECKED $CHECKED&" "&$CURRENT_SECTOR&" "

  getwordpos $AVOIDEDSECTORS $POS " "&$FOCUS&" "
  getsectorparameter $FOCUS "FIGSEC" $ISFIGGED
  getsectorparameter $FOCUS "MINESEC" $ISARMIDED
  getsectorparameter $FOCUS "LIMPSEC" $ISLIMPED
  isnumber $TST $ISFIGGED
  if ($TST = 0)
    setvar $ISFIGGED FALSE
  end
  isnumber $TST $ISLIMPED
  if ($TST = 0)
    setvar $ISLIMPED FALSE
  end
  isnumber $TST $ISARMIDED
  if ($TST = 0)
    setvar $ISARMIDED FALSE
  end

  if ($BORDER = TRUE)
    setvar $P 1
    while (SECTOR.WARPS[$FOCUS][$P] > 0)
      setvar $TEMP SECTOR.WARPS[$FOCUS][$P]
      getsectorparameter $TEMP "FIGSEC" $ISFIGADJACENT
      if ($ISFIGADJACENT <> TRUE)
        goto :WE_GOT_GAME
      end
      add $P 1
    end
    goto :NEXT_POSS_TARG
  else
    setvar $P 1
    while (SECTOR.WARPS[$FOCUS][$P] > 0)
      setvar $TEMP SECTOR.WARPS[$FOCUS][$P]
      getsectorparameter $TEMP "FIGSEC" $ISFIGADJACENT
      if ($ISFIGADJACENT <> TRUE)
        goto :NEXT_POSS_TARG
      end
      add $P 1
    end
  end
  :WE_GOT_GAME

  if ((($ISLIMPED <= 0) or ($ISARMIDED <= 0)) and (($ISFIGGED > 0) and ($POS <= 0)))
    getdistance $DISTANCETHERE $CURRENT_SECTOR $FOCUS
    getdistance $DISTANCEBACK $FOCUS $CURRENT_SECTOR
    if ($DISTANCETHERE < 0)
      send "^f"&$CURRENT_SECTOR&"*"&$FOCUS&"*q"
      waiton "ENDINTERROG"
      getdistance $DISTANCETHERE $CURRENT_SECTOR $FOCUS
    end
    if ($DISTANCEBACK < 0)
      send "^f"&$FOCUS&"*"&$CURRENT_SECTOR&"*q"
      waiton "ENDINTERROG"
      getdistance $DISTANCEBACK $FOCUS $CURRENT_SECTOR
    end
    if (($DISTANCETHERE > 30) and ($LONGJUMPLIMIT <> 0))
      send "'{" $BOT_NAME "} - Next fighter is over 30 hops away, stopping mine sweeper.*"
      gosub :GOHOME
      halt
    else
      subtract $LONGJUMPLIMIT 1
    end
    killalltriggers
    send "p "&$FOCUS&"*y"
    settextlinetrigger PWARPNOSHIP1 :PWARPNOSHIP1 "You do not have any fighters in Sector "
    settextlinetrigger PWARPYESSHIP1 :PWARPYESSHIP1 " Planetary TransWarp Drive Engaged! "
    settextlinetrigger PWARPNOFUEL1 :PWARPNOFUEL1 "You do not have enough Fuel Ore on this planet to make the jump."
    settextlinetrigger PWARPYESSHIP2 :PWARPYESSHIP1 "You are already in that sector!"
    pause
    :PWARPNOFUEL1
    killalltriggers
    send "'{" $BOT_NAME "} - Not enough fuel on planet "&$PLANET&". Stopping mine sweeper.*"
    halt
    :PWARPYESSHIP1
    killalltriggers
    setvar $AVOIDEDSECTORS $AVOIDEDSECTORS&" "&$FOCUS&" "
    gosub :QUIKSTATS
    return
    :PWARPNOSHIP1
    killalltriggers
  end
  :NEXT_POSS_TARG
  add $I 1
end
send "'{" $BOT_NAME "} - All sectors possible swept. Halting mine sweeper.*"
gosub :GOHOME
return
:GOHOME

gosub :QUIKSTATS
if ($CURRENT_PROMPT = "Citadel")
  send "p"&$HOMESECTOR&"* y"
  settextlinetrigger PWARP_LOCK :PWARP_LOCK "Locating beam pinpointed"
  settextlinetrigger NO_PWARP_LOCK :NO_PWARP_LOCK "Your own fighters must be"
  settextlinetrigger ALREADY :ALREADY "You are already in that sector!"
  settextlinetrigger NO_ORE :NO_ORE "You do not have enough Fuel Ore"
  pause
  :NO_PWARP_LOCK
  killalltriggers
  send "'{" $BOT_NAME "} - No fighter down at that location!*"
  return
  :NO_ORE
  killalltriggers
  send "'{" $BOT_NAME "} - Not enough fuel for that pwarp.*"
  return
  :PWARP_LOCK
  killalltriggers
  waiton "Planet is now in sector"
  send "'{" $BOT_NAME "} - Planet returned Home*"
  return
  :ALREADY
  killalltriggers
  send "'{" $BOT_NAME "} - Planet already in that sector!.*"
  return
else
  send "'{" $BOT_NAME "} - Cannot Pwarp Home. Wrong Prompt!*"
  halt
end
return
:QUIKSTATS


setvar $CURRENT_PROMPT "Undefined"
killtrigger NOPROMPT
killtrigger PROMPT1
killtrigger PROMPT2
killtrigger PROMPT3
killtrigger PROMPT4
killtrigger STATLINETRIG
killtrigger GETLINE2
settextlinetrigger PROMPT :ALLPROMPTS #145&#8
settextlinetrigger STATLINETRIG :STATSTART #179
send #145&"/"
pause
:ALLPROMPTS

getword CURRENTLINE $CURRENT_PROMPT 1
striptext $CURRENT_PROMPT #145
striptext $CURRENT_PROMPT #8






settextlinetrigger PROMPT :ALLPROMPTS #145&#8
pause
:STATSTART

killtrigger PROMPT
killtrigger PROMPT2
killtrigger PROMPT3
killtrigger PROMPT4
killtrigger NOPROMPT
setvar $STATS ""
setvar $WORDY ""
:STATSLINE


killtrigger STATLINETRIG
killtrigger GETLINE2
setvar $LINE2 CURRENTLINE
replacetext $LINE2 #179 " "
striptext $LINE2 ","
setvar $STATS $STATS&$LINE2
getwordpos $LINE2 $POS "Ship"
if ($POS > 0)
  goto :GOTSTATS
else
  settextlinetrigger GETLINE2 :STATSLINE
  pause
end
:GOTSTATS

setvar $STATS $STATS&" @@@"

setvar $CURRENT_WORD 0
if ($WORDY <> "@@@")
  if ($WORDY = "Sect")
    getword $STATS $CURRENT_SECTOR ($CURRENT_WORD + 1)
  elseif ($WORDY = "Turns")
    getword $STATS $TURNS ($CURRENT_WORD + 1)
  elseif ($WORDY = "Creds")
    getword $STATS $CREDITS ($CURRENT_WORD + 1)
  elseif ($WORDY = "Figs")
    getword $STATS $FIGHTERS ($CURRENT_WORD + 1)
  elseif ($WORDY = "Shlds")
    getword $STATS $SHIELDS ($CURRENT_WORD + 1)
  elseif ($WORDY = "Hlds")
    getword $STATS $TOTAL_HOLDS ($CURRENT_WORD + 1)
  elseif ($WORDY = "Ore")
    getword $STATS $ORE_HOLDS ($CURRENT_WORD + 1)
  elseif ($WORDY = "Org")
    getword $STATS $ORGANIC_HOLDS ($CURRENT_WORD + 1)
  elseif ($WORDY = "Equ")
    getword $STATS $EQUIPMENT_HOLDS ($CURRENT_WORD + 1)
  elseif ($WORDY = "Col")
    getword $STATS $COLONIST_HOLDS ($CURRENT_WORD + 1)
  elseif ($WORDY = "Phot")
    getword $STATS $PHOTONS ($CURRENT_WORD + 1)
  elseif ($WORDY = "Armd")
    getword $STATS $ARMIDS ($CURRENT_WORD + 1)
  elseif ($WORDY = "Lmpt")
    getword $STATS $LIMPETS ($CURRENT_WORD + 1)
  elseif ($WORDY = "GTorp")
    getword $STATS $GENESIS ($CURRENT_WORD + 1)
  elseif ($WORDY = "TWarp")
    getword $STATS $TWARP_TYPE ($CURRENT_WORD + 1)
  elseif ($WORDY = "Clks")
    getword $STATS $CLOAKS ($CURRENT_WORD + 1)
  elseif ($WORDY = "Beacns")
    getword $STATS $BEACONS ($CURRENT_WORD + 1)
  elseif ($WORDY = "AtmDt")
    getword $STATS $ATOMIC ($CURRENT_WORD + 1)
  elseif ($WORDY = "Corbo")
    getword $STATS $CORBO ($CURRENT_WORD + 1)
  elseif ($WORDY = "EPrb")
    getword $STATS $EPROBES ($CURRENT_WORD + 1)
  elseif ($WORDY = "MDis")
    getword $STATS $MINE_DISRUPTORS ($CURRENT_WORD + 1)
  elseif ($WORDY = "PsPrb")
    getword $STATS $PSYCHIC_PROBE ($CURRENT_WORD + 1)
  elseif ($WORDY = "PlScn")
    getword $STATS $PLANET_SCANNER ($CURRENT_WORD + 1)
  elseif ($WORDY = "LRS")
    getword $STATS $SCAN_TYPE ($CURRENT_WORD + 1)
  elseif ($WORDY = "Aln")
    getword $STATS $ALIGNMENT ($CURRENT_WORD + 1)
  elseif ($WORDY = "Exp")
    getword $STATS $EXPERIENCE ($CURRENT_WORD + 1)
  elseif ($WORDY = "Corp")
    getword $STATS $CORP ($CURRENT_WORD + 1)
  elseif ($WORDY = "Ship")
    getword $STATS $SHIP_NUMBER ($CURRENT_WORD + 1)
  end
  add $CURRENT_WORD 1
  getword $STATS $WORDY $CURRENT_WORD
end
:DONEQUIKSTATS
killtrigger PROMPT1
killtrigger PROMPT2
killtrigger PROMPT3
killtrigger PROMPT4
killtrigger STATLINETRIG
killtrigger GETLINE2

return
:CLEARSECTOR


setvar $LAID_ARMID FALSE
setvar $LAID_LIMP FALSE
setvar $BEFORESECTOR $CURRENT_SECTOR
setvar $BEFORELIMPETS $LIMPETS
setvar $BEFOREARMIDS $ARMIDS
setvar $PLACEDLIMPET FALSE
setvar $PLACEDARMID FALSE

send "   sz*    "

waiton "Warps to Sector(s) :"
setvar $LIMPETOWNER SECTOR.LIMPETS.OWNER[$CURRENT_SECTOR]
setvar $ARMIDOWNER SECTOR.MINES.OWNER[$CURRENT_SECTOR]
gosub :DEPLOYEQUIPMENT

if ($FAST or $NONSAFE)
  while (($PLACEDLIMPET = FALSE) or ($PLACEDARMID = FALSE))
    gosub :ATTEMPTCLEARINGMINES
  end
  setsectorparameter $CURRENT_SECTOR "MINESEC" TRUE
  setsectorparameter $CURRENT_SECTOR "LIMPSEC" TRUE
else
  if ($PLACEDARMID)
    setsectorparameter $CURRENT_SECTOR "MINESEC" TRUE
  end
  if ($PLACEDLIMPET)
    setsectorparameter $CURRENT_SECTOR "LIMPSEC" TRUE
  end
end

return
:XENTER

send "q y * t* * *" PASSWORD "*    *    *       za9999*   z*   "
return
:ATTEMPTCLEARINGMINES

killalltriggers
setvar $LAID_ARMID FALSE
setvar $LAID_LIMP FALSE

if ($FAST)
  setvar $I 0
  send "q  q  q  z   n  *   "
  while ($I <= 3)
    gosub :XENTER
    add $I 1
  end
  if ($GRID_ARMIDS = 0)
    setvar $_ARMIDS_ " "
  else
    setvar $_ARMIDS_ " h 1 z "&$GRID_ARMIDS&"* z c * "
  end
  if ($GRID_LIMPETS = 0)
    setvar $_LIMPS_ " "
  else
    setvar $_LIMPS_ "h 2 z "&$GRID_LIMPETS&"* z c * "
  end

  send $_ARMIDS_&$_LIMPS_&" l "&$PLANET&"*  c  "
  settextlinetrigger LAID_LIMP :LAID_LIMP "Limpet mine(s) on board."
  settextlinetrigger LAID_ARMID :LAID_ARMID "Armid mine(s) on board."
  waiton "Citadel command"
else
  send "r y y "
  waiton "Epic Interactive Strategy"
  send GAME
  waiton "[Pause]"
  send "   *    "
  waiton "Enter your choice:"
  settextlinetrigger LAID_LIMP :LAID_LIMP "Limpet mine(s) on board."
  settextlinetrigger LAID_ARMID :LAID_ARMID "Armid mine(s) on board."
  send "t*   *    *"&PASSWORD&"*    *    *   q  *  *  h 1 z "&$GRID_ARMIDS&"* z c * h 2 z "&$GRID_LIMPETS&"* z c * l "&$PLANET&"*  c  "
  waiton "Citadel command"
end
if (($LAID_ARMID <> TRUE) or ($LAID_LIMP <> TRUE))
  goto :ATTEMPTCLEARINGMINES
end
setvar $PLACEDLIMPET TRUE
setvar $PLACEDARMID TRUE
return
:LAID_ARMID
setvar $LAID_ARMID TRUE
pause
:LAID_LIMP
setvar $LAID_LIMP TRUE
pause
:DEPLOYEQUIPMENT


send "q  q  h  1  z "&$GRID_ARMIDS&"*  z c  *  h  2  z "&$GRID_LIMPETS&"*  z c  *   l "&$PLANET&"*  c "
gosub :QUIKSTATS
if ($BEFORESECTOR <> $CURRENT_SECTOR)
  gosub :CALLSAVEME
end
if ($CURRENT_PROMPT <> "Citadel")
  echo "**Unexpected Problem.. Halting**"
  halt
end
if (($BEFORELIMPETS > $LIMPETS) or ($LIMPETS < 3) or ($LIMPETOWNER = "belong to your Corp") or ($LIMPETOWNER = "yours"))
  setvar $PLACEDLIMPET TRUE
end
if (($BEFOREARMIDS > $ARMIDS) or ($ARMIDS < 3) or ($ARMIDOWNER = "belong to your Corp") or ($ARMIDOWNER = "yours"))
  setvar $PLACEDARMID TRUE
end
return
:DOTWARP

setvar $MSG ""
if ($TWARPTO > 0)
  send "q q* mz"&$TWARPTO " * "
  settexttrigger THERE :ADJ_WARP "You are already in that sector!"
  settextlinetrigger ADJ_WARP :ADJ_WARP "Sector  : "&$TWARPTO&" "
  settexttrigger LOCKING :LOCKING "Do you want to engage the TransWarp drive?"
  settexttrigger IGD :TWARPIGD "An Interdictor Generator in this sector holds you fast!"
  settexttrigger NOTURNS :TWARPPHOTONED "Your ship was hit by a Photon and has been disabled"
  settexttrigger NOROUTE :TWARPNOROUTE "Do you really want to warp there? (Y/N)"
  pause
  :ADJ_WARP
  killalltriggers
  send "z*"
  goto :TWARP_ADJ
  :LOCKING
  killalltriggers
  send "y"
  settextlinetrigger TWARP_LOCK :TWARP_LOCK "TransWarp Locked"
  settextlinetrigger NO_TWRP_LOCK :NO_TWARP_LOCK "No locating beam found"
  settextlinetrigger TWARP_ADJ :TWARP_ADJ "<Set NavPoint>"
  settextlinetrigger NO_FUEL :TWARPNOFUEL "You do not have enough Fuel Ore"
  pause
  :TWARPNOFUEL
  killalltriggers
  setvar $MSG "Not enough fuel for T-warp."
  goto :TWARPDONE
  :TWARP_ADJ

  killalltriggers
  send " * p s"
  goto :TWARPDONE
  :TWARPNOROUTE

  killalltriggers
  send "n* z* "
  setvar $MSG "No route available!"
  goto :TWARPDONE
  :NO_TWARP_LOCK

  killalltriggers
  send "n* z* "
  setvar $MSG "No fighter Deployed, cannot Twarp"
  goto :TWARPDONE
  :TWARPIGD

  killalltriggers
  setvar $MSG "My ship is being held by Interdictor!"
  goto :TWARPDONE
  :TWARPPHOTONED

  killalltriggers
  setvar $MSG "I have been photoned and can not T-warp!"
  goto :TWARPDONE
  :TWARP_LOCK

  killalltriggers
  if ($ALIGNMENT >= 1000)
    send "y * * p s g y g q "
  else
    send "y  *  *  m "&$STARDOCK&" *  *  p s g y g q "
  end
  :TWARPDONE
  if ($MSG <> "")
    send "'{" $BOT_NAME "} Twarp Error - "&$MSG&"**"
  end
end
return
:GETINFO



setvar $PHOTONS 0
setvar $SCAN_TYPE "None"
setvar $TWARP_TYPE 0
setvar $CORPSTRING "[0]"
send "I"
waitfor "<Info>"
:WAITFORINFO
settextlinetrigger GETTRADERNAME :GETTRADERNAME "Trader Name    :"
settextlinetrigger GETEXPANDALIGN :GETEXPANDALIGN "Rank and Exp"
settextlinetrigger GETCORP :GETCORP "Corp           #"
settextlinetrigger GETSHIPTYPE :GETSHIPTYPE "Ship Info      :"
settextlinetrigger GETTPW :GETTPW "Turns to Warp  :"
settextlinetrigger GETSECT :GETSECT "Current Sector :"
settextlinetrigger GETTURNS :GETTURNS "Turns left"
settextlinetrigger GETHOLDS :GETHOLDS "Total Holds"
settextlinetrigger GETFIGHTERS :GETFIGHTERS "Fighters       :"
settextlinetrigger GETSHIELDS :GETSHIELDS "Shield points  :"
settextlinetrigger GETPHOTONS :GETPHOTONS "Photon Missiles:"
settextlinetrigger GETSCANTYPE :GETSCANTYPE "LongRange Scan :"
settextlinetrigger GETTWARPTYPE1 :GETTWARPTYPE1 "  (Type 1 Jump):"
settextlinetrigger GETTWARPTYPE2 :GETTWARPTYPE2 "  (Type 2 Jump):"
settextlinetrigger GETCREDITS :GETCREDITS "Credits"
settexttrigger GETINFODONE :GETINFODONE "Command [TL="
settexttrigger GETINFODONE2 :GETINFODONE "Citadel command"
pause
:GETTRADERNAME
setvar $TRADER_NAME CURRENTLINE
striptext $TRADER_NAME "Trader Name    : "
striptext $TRADER_NAME "3rd Class "
striptext $TRADER_NAME "2nd Class "
striptext $TRADER_NAME "1st Class "
striptext $TRADER_NAME "Nuisance "
striptext $TRADER_NAME "Menace "
striptext $TRADER_NAME "Smuggler Savant "
striptext $TRADER_NAME "Smuggler "
striptext $TRADER_NAME "Robber "
striptext $TRADER_NAME "Private "
striptext $TRADER_NAME "Lance Corporal "
striptext $TRADER_NAME "Corporal "
striptext $TRADER_NAME "Staff Sergeant "
striptext $TRADER_NAME "Gunnery Sergeant "
striptext $TRADER_NAME "1st Sergeant "
striptext $TRADER_NAME "Sergeant Major "
striptext $TRADER_NAME "Sergeant "
striptext $TRADER_NAME "Chief Warrant Officer "
striptext $TRADER_NAME "Warrant Officer "
striptext $TRADER_NAME "Terrorist "
striptext $TRADER_NAME "Infamous Pirate "
striptext $TRADER_NAME "Notorious Pirate "
striptext $TRADER_NAME "Dread Pirate "
striptext $TRADER_NAME "Pirate "
striptext $TRADER_NAME "Galactic Scourge "
striptext $TRADER_NAME "Enemy of the State "
striptext $TRADER_NAME "Enemy of the People "
striptext $TRADER_NAME "Enemy of Humankind "
striptext $TRADER_NAME "Heinous Overlord "
striptext $TRADER_NAME "Prime Evil "
striptext $TRADER_NAME "Ensign "
striptext $TRADER_NAME "Lieutenant J.G. "
striptext $TRADER_NAME "Lieutenant Commander "
striptext $TRADER_NAME "Lieutenant "
striptext $TRADER_NAME "Commander "
striptext $TRADER_NAME "Captain "
striptext $TRADER_NAME "Commodore "
striptext $TRADER_NAME "Rear Admiral "
striptext $TRADER_NAME "Vice Admiral "
striptext $TRADER_NAME "Fleet Admiral "
striptext $TRADER_NAME "Admiral "
striptext $TRADER_NAME "Civilian "
striptext $TRADER_NAME "Annoyance "
pause
:GETEXPANDALIGN
getword CURRENTLINE $EXPERIENCE 5
getword CURRENTLINE $ALIGNMENT 7
striptext $EXPERIENCE ","
striptext $ALIGNMENT ","
striptext $ALIGNMENT "Alignment="
pause
:GETCORP
getword CURRENTLINE $CORP 3
striptext $CORP ","
setvar $CORPSTRING "["&$CORP&"]"
pause
:GETSHIPTYPE
getwordpos CURRENTLINE $SHIPTYPEEND "Ported="
subtract $SHIPTYPEEND 18
cuttext CURRENTLINE $SHIP_TYPE 18 $SHIPTYPEEND
pause
:GETTPW
getword CURRENTLINE $TURNS_PER_WARP 5
pause
:GETSECT
getword CURRENTLINE $CURRENT_SECTOR 4
pause
:GETTURNS
getword CURRENTLINE $TURNS 4
if ($TURNS = "Unlimited")
  setvar $TURNS 65000
  setvar $UNLIMITEDGAME TRUE
end
savevar $UNLIMITEDGAME
pause
:GETHOLDS
setvar $LINE CURRENTLINE
getword $LINE $TOTAL_HOLDS 4
getwordpos $LINE $TEXTPOS "Ore="
if ($TEXTPOS <> 0)
  cuttext CURRENTLINE $TEMP $TEXTPOS 100
  getword $TEMP $ORE_HOLDS 1
  striptext $ORE_HOLDS "Ore="
else
  setvar $ORE_HOLDS 0
end
getwordpos $LINE $TEXTPOS "Organics="
if ($TEXTPOS <> 0)
  cuttext CURRENTLINE $TEMP $TEXTPOS 100
  getword $TEMP $ORGANIC_HOLDS 1
  striptext $ORGANIC_HOLDS "Organics="
else
  setvar $ORGANIC_HOLDS 0
end
getwordpos $LINE $TEXTPOS "Equipment="
if ($TEXTPOS <> 0)
  cuttext CURRENTLINE $TEMP $TEXTPOS 100
  getword $TEMP $EQUIPMENT_HOLDS 1
  striptext $EQUIPMENT_HOLDS "Equipment="
else
  setvar $EQUIPMENT_HOLDS 0
end
getwordpos $LINE $TEXTPOS "Colonists="
if ($TEXTPOS <> 0)
  cuttext CURRENTLINE $TEMP $TEXTPOS 100
  getword $TEMP $COLONIST_HOLDS 1
  striptext $COLONIST_HOLDS "Colonists="
else
  setvar $COLONIST_HOLDS 0
end
getwordpos $LINE $TEXTPOS "Empty="
if ($TEXTPOS <> 0)
  cuttext CURRENTLINE $TEMP $TEXTPOS 100
  getword $TEMP $EMPTY_HOLDS 1
  striptext $EMPTY_HOLDS "Empty="
else
  setvar $EMPTY_HOLDS 0
end
pause
:GETFIGHTERS
getword CURRENTLINE $FIGHTERS 3
striptext $FIGHTERS ","
pause
:GETSHIELDS
getword CURRENTLINE $SHIELDS 4
striptext $SHIELDS ","
pause
:GETPHOTONS
getword CURRENTLINE $PHOTONS 3
pause
:GETSCANTYPE
getword CURRENTLINE $SCAN_TYPE 4
pause
:GETTWARPTYPE1
getword CURRENTLINE $TWARP_1_RANGE 4
setvar $TWARP_TYPE 1
pause
:GETTWARPTYPE2
getword CURRENTLINE $TWARP_2_RANGE 4
setvar $TWARP_TYPE 2
pause
:GETCREDITS
getword CURRENTLINE $CREDITS 3
striptext $CREDITS ","
pause
:GETINFODONE
killtrigger GETINFODONE
killtrigger GETINFODONE2
killtrigger GETTRADERNAME
killtrigger GETEXPANDALIGN
killtrigger GETCORP
killtrigger GETSHIPTYPE
killtrigger GETTPW
killtrigger GETSECT
killtrigger GETTURNS
killtrigger GETHOLDS
killtrigger GETFIGHTERS
killtrigger GETSHIELDS
killtrigger GETPHOTONS
killtrigger GETSCANTYPE
killtrigger GETTWARPTYPE1
killtrigger GETTWARPTYPE2
killtrigger GETCREDITS

return
:PAUSEGRIDDER


killalltriggers
echo ANSI_6 "*[" ANSI_14 "M()M Limpet Gridder Options" ANSI_6 "]*" ANSI_7
echo ANSI_6 "  [" ANSI_14 "-" ANSI_6 "]" ANSI_15 " Change Gridder Settings*"
echo ANSI_6 "  [" ANSI_14 "+" ANSI_6 "]" ANSI_15 " Continue Gridding*"
echo ANSI_6 "[" ANSI_14 "M()M Limpet Gridder paused..." ANSI_6 "]*" ANSI_7
settextouttrigger PAUSEGRIDDER :RESTARTINGPAUSE "+"
settextouttrigger PAUSEGRIDDER2 :START_MENU "-"
pause
:RESTARTINGPAUSE
killalltriggers
send "* "
waitfor "(?="
getword CURRENTLINE $LOCATION 1
if ($LOCATION = "Citadel")
  echo ANSI_6 "*[" ANSI_14 "M()M Unlimited Gridder restarted" ANSI_6 "]*" ANSI_7
  goto :RESTART
else
  echo ANSI_6 "*[" ANSI_14 "M()M Unlimited Gridder not at citadel prompt, cannot restart" ANSI_6 "]*" ANSI_7
  goto :PAUSEGRIDDER
end
:GETPLANETINFO



send "*"
settextlinetrigger PLANETINFO :PLANETINFO "Planet #"
pause
:PLANETINFO

setvar $CITADEL 0
setvar $SECTOR_CANNON 0
setvar $ATMOSPHERE_CANNON 0
setvar $CITADEL_CREDITS 0
getword CURRENTLINE $PLANET 2
striptext $PLANET "#"


getword CURRENTLINE $CURRENT_SECTOR 5
striptext $CURRENT_SECTOR ":"
waiton "2 Build 1   Product    Amount     Amount     Maximum"
:GETPLANETSTUFF

settextlinetrigger FUELSTART :FUELSTART "Fuel Ore"
settextlinetrigger ORGSTART :ORGSTART "Organics"
settextlinetrigger EQUIPSTART :EQUIPSTART "Equipment"
settextlinetrigger FIGSTART :FIGSTART "Fighters        N/A"
settextlinetrigger CITADELSTART :CITADELSTART "Planet has a level"
settextlinetrigger CANNON :CANNONSTART ", AtmosLvl="
settexttrigger PLANETINFODONE :PLANETINFODONE "Planet command (?=help)"
pause
:FUELSTART

getword CURRENTLINE $PLANET_FUEL 6
getword CURRENTLINE $PLANET_FUEL_MAX 8
striptext $PLANET_FUEL ","
striptext $PLANET_FUEL_MAX ","
pause
:ORGSTART

getword CURRENTLINE $PLANET_ORGANICS 5
getword CURRENTLINE $PLANET_ORGANICS_MAX 7
striptext $PLANET_ORGANICS ","
striptext $PLANET_ORGANICS_MAX ","
pause
:EQUIPSTART

getword CURRENTLINE $PLANET_EQUIPMENT 5
getword CURRENTLINE $PLANET_EQUIPMENT_MAX 7
striptext $PLANET_EQUIPMENT ","
striptext $PLANET_EQUIPMENT_MAX ","
pause
:FIGSTART

getword CURRENTLINE $PLANET_FIGHTERS 5
getword CURRENTLINE $PLANET_FIGHTERS_MAX 7
striptext $PLANET_FIGHTERS ","
striptext $PLANET_FIGHTERS_MAX ","
pause
:CITADELSTART

getword CURRENTLINE $CITADEL 5
getword CURRENTLINE $CITADEL_CREDITS 9
striptext $CITADEL_CREDITS ","
pause
:CANNONSTART

getword CURRENTLINE $ATMOSPHERE_CANNON 5
getword CURRENTLINE $SECTOR_CANNON 6
striptext $SECTOR_CANNON "SectLvl="
striptext $SECTOR_CANNON "%"
striptext $ATMOSPHERE_CANNON "AtmosLvl="
striptext $ATMOSPHERE_CANNON "%"
striptext $ATMOSPHERE_CANNON ","
pause
:PLANETINFODONE
killtrigger CITADELSTART
killtrigger CANNON

return
:FINDJUMPSECTOR



setvar $I 1
setvar $RED_ADJ 0
send "qq*"
while (SECTOR.WARPSIN[$STARDOCK][$I] > 0)
  setvar $RED_ADJ SECTOR.WARPSIN[$STARDOCK][$I]
  send "m "&$RED_ADJ&"* y"
  settexttrigger TWARPBLIND :TWARPBLIND "Do you want to make this jump blind? "
  settexttrigger TWARPLOCKED :TWARPLOCKED "All Systems Ready, shall we engage? "
  settextlinetrigger TWARPVOIDED :TWARPVOIDED "Danger Warning Overridden"
  settextlinetrigger TWARPADJ :TWARPADJ "<Set NavPoint>"
  pause
  :TWARPADJ
  killalltriggers
  send " * "
  return
  :TWARPVOIDED

  killalltriggers
  send " N N "
  goto :TRYINGNEXTADJ
  :TWARPLOCKED

  killalltriggers
  send " N "

  goto :SECTORLOCKED
  :TWARPBLIND

  killalltriggers
  send " N "
  :TRYINGNEXTADJ

  add $I 1
end
:NOADJSFOUND

setvar $RED_ADJ 0
return
:SECTORLOCKED

return
:TURNSREQUIRED


send "i"
settextlinetrigger TURNSREQUIRED_TPW :TURNSREQUIRED_TPW "Turns to Warp  : "
pause
:TURNSREQUIRED_TPW

killalltriggers
getword CURRENTLINE $TURNSREQUIRED_TPW 5

if ($RED_ADJ > 0)

  setvar $TURNSREQUIRED_TEMP ($TURNSREQUIRED_TPW * 3)
  if ($_TOW > 0)

    add $TURNSREQUIRED_TEMP 2


    add $TURNSREQUIRED_TEMP 3
  else
    add $TURNSREQUIRED_TEMP 1
  end
else
  setvar $TURNSREQUIRED_TEMP ($TURNSREQUIRED_TPW * 2)

  add $TURNSREQUIRED_TEMP 1
end

setvar $TURNSREQUIRED $TURNSREQUIRED_TEMP
return
:DOPURCHASES


send "h "
waitfor "<Hardware Emporium>"

if ($_LIMPS <> "")
  send "L "
  waitfor "How many mines do you want"
  if ($_LIMPS = "Max")
    gettext CURRENTLINE $BUY "(Max" ")"
    send $BUY&"* "
  else
    send $BUY $_LIMPS&"* "
  end
  waitfor "<Hardware Emporium>"
end

if ($_MINES <> "")
  send "M "
  setvar $BUY 0
  waitfor "How many mines do you"
  if ($_MINES = "Max")
    gettext CURRENTLINE $BUY "(Max" ")"
    send $BUY&"* "
  else
    send $_MINES&"* "
  end
  waitfor "<Hardware Emporium>"
end

send "s"
waitfor "How many Mine Disruptors"
gettext CURRENTLINE $BUY "(Max" ")"
send $BUY&"* "
waitfor "<Hardware Emporium>"
return
