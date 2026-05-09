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
goto :MINESWEEP_START
include "source\include\mines"
:MINESWEEP_START
setvar $GRID_LIMPETS 1
setvar $GRID_ARMIDS 4
setvar $REFURB FALSE
setvar $LONGJUMPLIMIT 5
setvar $VERSION "1.0.5"
getsectorparameter SECTORS "FIGSEC" $ISFIGGED
getsectorparameter SECTORS "MINESEC" $ISARMIDED
getsectorparameter SECTORS "LIMPSEC" $ISLIMPED
if (($STARDOCK = 0) or ($STARDOCK = ""))
  setvar $switchboard~message "Stardock is not defined.  Please define stardock variable in the bot.*"
  gosub :switchboard~switchboard
  halt
end
if ($ISFIGGED = "")
  setvar $switchboard~message "It appears no grid data is available.  Run a fighter grid checker that uses the sector parameter FIGSEC. (Try figs command)*"
  gosub :switchboard~switchboard
  halt
end
if ($ISARMIDED = "")
  setvar $switchboard~message "It appears no armid data is available.  Run an armid grid checker that uses the sector parameter MINESEC. (Try armids command)*"
  gosub :switchboard~switchboard
  halt
end
if ($ISLIMPED = "")
  setvar $switchboard~message "It appears no limpet data is available.  Run a limpet grid checker that uses the sector parameter LIMPSEC. (Try limps command)*"
  gosub :switchboard~switchboard
  halt
end

gosub :PLAYER~QUIKSTATS
if ($PLAYER~CURRENT_PROMPT <> "Citadel")
  setvar $switchboard~message "Must must start mine sweeper from citadel prompt.*"
  gosub :switchboard~switchboard
  halt
end

if ($PLAYER~PHOTONS <> 0)
  setvar $switchboard~message "Cannot Have Fotons!*"
  gosub :switchboard~switchboard
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
setvar $HOMESECTOR $PLAYER~CURRENT_SECTOR

killalltriggers
gosub :CHECKAVOIDEDSECTORS
send "q"
gosub :GETPLANETINFO

if (($GRID_LIMPETS = 0) and ($GRID_ARMIDS = 0))
  setvar $switchboard~message "Nothing To Do!*"
  gosub :switchboard~switchboard
  halt
end

if (($PLAYER~ORGANIC_HOLDS + ($PLAYER~EQUIPMENT_HOLDS + $PLAYER~COLONIST_HOLDS)) <> 0)
  setvar $MAC ""
  if ($PLAYER~ORGANIC_HOLDS <> 0)
    setvar $MAC $MAC&" T  N  L 2* "
  end
  if ($PLAYER~EQUIPMENT_HOLDS <> 0)
    setvar $MAC $MAC&" T  N  L 3* "
  end
  if ($PLAYER~COLONIST_HOLDS <> 0)
    setvar $MAC $MAC&" S  N  L 1* "
  end
  if ($MAC <> "")
    send $MAC&" t  n  t  1*  m  n t *  c"
    gosub :PLAYER~QUIKSTATS
    if (($PLAYER~ORGANIC_HOLDS + ($PLAYER~EQUIPMENT_HOLDS + $PLAYER~COLONIST_HOLDS)) <> 0)
      setvar $switchboard~message "Holds Not Empty*"
      gosub :switchboard~switchboard
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
  gosub :PLAYER~QUIKSTATS
  if ($PLAYER~LIMPETS < $GRID_LIMPETS) or ($PLAYER~ARMIDS < $GRID_ARMIDS) or (($PLAYER~MINE_DISRUPTORS = 0) and $DISR)
    if ($REFURB)
      gosub :ATTEMPTREFURB
    else
      setvar $switchboard~message " Need to buy more mines before this script can continue.*"
      gosub :switchboard~switchboard
      halt
    end
  end
  gosub :FINDNEXTTARGET
  send "  sz*    "
  waiton "Warps to Sector(s) :"
  setvar $HAZ_BEFORE SECTOR.NAVHAZ[$PLAYER~CURRENT_SECTOR]
  setvar $PLANETS_BEFORE SECTOR.PLANETCOUNT[$PLAYER~CURRENT_SECTOR]
  if (SECTOR.TRADERCOUNT[$PLAYER~CURRENT_SECTOR] <> 0)
    setvar $switchboard~message " Trader Is In Sector. Halting!*"
    gosub :switchboard~switchboard
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
  setvar $HAZ_AFTER SECTOR.NAVHAZ[$PLAYER~CURRENT_SECTOR]
  setvar $PLANETS_AFTER SECTOR.PLANETCOUNT[$PLAYER~CURRENT_SECTOR]
  if (SECTOR.TRADERCOUNT[$PLAYER~CURRENT_SECTOR] <> 0)
    setvar $switchboard~message " Trader Is In Sector. Halting!*"
    gosub :switchboard~switchboard
    waiton "Message sent on sub-space channel"
    send "'"&$BOT_NAME&" pwarp "&$HOMESECTOR&"*"
    waiton "Message sent on sub-space channel"
    halt
  end
  if ($HAZ_BEFORE <> $HAZ_AFTER)
    setvar $switchboard~message " NavHAZ Changed. Halting!*"
    gosub :switchboard~switchboard
    waiton "Message sent on sub-space channel"
    send "'"&$BOT_NAME&" holo*"
    waiton "Sub-space comm-link terminated"
    send "'"&$BOT_NAME&" pwarp "&$HOMESECTOR&"*"
    waiton "Message sent on sub-space channel"
    halt
  end
  if ($PLANETS_AFTER <> $PLANETS_BEFORE)
    setvar $switchboard~message " New Planet in Sector. Halting!*"
    gosub :switchboard~switchboard
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
gosub :PLAYER~QUIKSTATS
return
:ATTEMPTREFURB


setvar $LIMPETCASHNEEDED ((($MAXMINES - $PLAYER~LIMPETS) * $LIMPET_COST) + $LIMPET_REMOVAL_COST)
setvar $ARMIDCASHNEEDED (($MAXMINES - $PLAYER~ARMIDS) * $ARMID_COST)
setvar $CASHNEEDED ($LIMPETCASHNEEDED + $ARMIDCASHNEEDED)
if ($CASHNEEDED > $PLAYER~CREDITS)
  send "D"
  waiton "Citadel treasury contains "
  getword CURRENTLINE $CITADELCASH 4
  striptext $CITADELCASH ","
  if ($CITADELCASH < $CASHNEEDED)
    setvar $switchboard~message "Not enough cash for mine refurbs in treasury or on hand.*"
    gosub :switchboard~switchboard
    halt
  end
  send "t f "&($CASHNEEDED - $PLAYER~CREDITS)&"* "
end

setvar $I 1
setvar $START_SECTOR $PLAYER~CURRENT_SECTOR
setvar $WEAREADJDOCK FALSE
while ($I <= SECTOR.WARPCOUNT[$START_SECTOR])
  setvar $ADJ_START SECTOR.WARPS[$START_SECTOR][$I]
  if ($ADJ_START = $STARDOCK)
    setvar $WEAREADJDOCK TRUE
  end
  add $I 1
end

if (($PLAYER~ALIGNMENT < 1000) and ($WEAREADJDOCK = FALSE))
  setvar $RED_ADJ 0
  gosub :FINDJUMPSECTOR
  if ($RED_ADJ <> 0)
    setvar $switchboard~message "Jump Sector Found - Using Sector "&$RED_ADJ&"**"
    gosub :switchboard~switchboard
  else
    waitfor "Command [TL="
    setvar $switchboard~message "Cannot Find Jump Sector Adjacent Dock**"
    gosub :switchboard~switchboard
    halt
  end
end

if ($PLAYER~ALIGNMENT >= 1000)
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
setvar $switchboard~message "Cannot Find Path to StarDock!**"
gosub :switchboard~switchboard
halt
:CONT
killalltriggers
setdelaytrigger LATENCY_DELAY :LATENCY_DELAY 500
pause
:LATENCY_DELAY


echo "**"&ANSI_14&"Please Stand By"&ANSI_15&" - Calculating Distances...**"
if (($PLAYER~ALIGNMENT >= 1000) or $WEAREADJDOCK)
  getdistance $DIST1 $START_SECTOR $STARDOCK
else
  getdistance $DIST1 $START_SECTOR $RED_ADJ
end

if ($DIST1 <= 0)
  setvar $switchboard~message $TAGLINEB&" - Insufficient Warp Data Plotting Course to Dock**"
  gosub :switchboard~switchboard
  halt
end

getdistance $DIST2 $STARDOCK $START_SECTOR
if ($DIST2 <= 0)
  setvar $switchboard~message $TAGLINEB&" - Insufficient Warp Data Plotting Return Course From Dock**"
  gosub :switchboard~switchboard
  halt
end

setvar $ORE_REQ (($DIST1 + $DIST2) * 3)

if ($PLAYER~ORE_HOLDS < $ORE_REQ)
  setvar $switchboard~message "Not Enough ORE In Holds To Make Round Trip**"
  gosub :switchboard~switchboard
  halt
end

if ($PLAYER~TWARP_TYPE = "No")
  setvar $switchboard~message "Must Have Twarp 1 or 2**"
  gosub :switchboard~switchboard
  halt
end

if ($UNLIMITEDGAME = 0)
  gosub :TURNSREQUIRED
  if ($TURNSREQUIRED > $PLAYER~TURNS)
    setvar $switchboard~message "Not Enough Turns. "&ANSI_12&$TURNSREQUIRED&ANSI_15&", Required**"
    gosub :switchboard~switchboard
    halt
  elseif ($TURNSREQUIRED <= $PLAYER~TURNS)
    setvar $TMP ($PLAYER~TURNS - $TURNSREQUIRED)
    if ($TMP <= $BOT_TURN_LIMIT)
      setvar $switchboard~message "Proceeding Will Leave Fewer Than "&$BOT_TURN_LIMIT&" Turns!**"
      gosub :switchboard~switchboard
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
setvar $switchboard~message $TAGLINEB&" - StarDock appears to have been Blown Up!**"
gosub :switchboard~switchboard
halt
:ITSALIVE
killalltriggers
waitfor "(?="
setvar $MSG ""
if (($PLAYER~ALIGNMENT >= 1000) and ($WEAREADJDOCK = FALSE))
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
  setvar $switchboard~message "Unknown Problem Detected. Check TA!**"
  gosub :switchboard~switchboard
  halt
end
gosub :PLAYER~QUIKSTATS

setvar $_LIMPS "Max"
setvar $_MINES "Max"
gosub :DOPURCHASES
send "Q Q Q Q Z N M "&$START_SECTOR&"* Y  Y  Y  * L Z"&#8&$PLANET&"* p  s  s * * c *"
gosub :PLAYER~QUIKSTATS
if ($PLAYER~CURRENT_SECTOR = $STARDOCK)
  setvar $switchboard~message "Twarp Error, Should be Hiding on Dock!**"
  gosub :switchboard~switchboard
  halt
end
send "q tnt1* c "


return
:CHECKAVOIDEDSECTORS

setvar $AVOIDEDSECTORS ""
gosub :SECTOR~GETAVOIDS
setvar $AVOID_I 0
while ($AVOID_I < $SECTOR~AVOIDCOUNT)
  add $AVOID_I 1
  setvar $AVOIDEDSECTORS $AVOIDEDSECTORS&" "&$SECTOR~AVOIDS[$AVOID_I]&" "
end

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
gosub :PLAYER~QUIKSTATS
setvar $FIGSTODEPLOY 1
gosub :DEPLOYFIGS
setvar $SAVETARGET $PLAYER~CURRENT_SECTOR
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
send "'pickup "&$PLAYER~CURRENT_SECTOR&" ::*"
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
if (($PLAYER~CURRENT_SECTOR < 11) or ($PLAYER~CURRENT_SECTOR = $STARDOCK))
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

if ($PLAYER~MINE_DISRUPTORS = 0)
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
gosub :PLAYER~QUIKSTATS
send "'Unknown Problem Occured, at '"&$PLAYER~CURRENT_PROMPT&"' Prompt!*"
halt
:SCAN_COMPLETE
killalltriggers
setarray $ADJ2HIT 6 1
setarray $MINES~ADJ2HIT 6 1
setvar $IDX 1

while (SECTOR.WARPS[$PLAYER~CURRENT_SECTOR][$IDX] > 0)
  setvar $ADJ SECTOR.WARPS[$PLAYER~CURRENT_SECTOR][$IDX]
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

setvar $IDX 1
while ($IDX <= 6)
  setvar $MINES~ADJ2HIT[$IDX] $ADJ2HIT[$IDX]
  setvar $MINES~ADJ2HIT[$IDX][1] $ADJ2HIT[$IDX][1]
  add $IDX 1
end
setvar $MINES~BURSTING $BURSTING
setvar $MINES~TOTAL_MINES_POOFED $TOTAL_MINES_POOFED
gosub :MINES~STAR_BURST
setvar $TOTAL_MINES_POOFED $MINES~TOTAL_MINES_POOFED
send " Q Q Q Z N L Z"&#8&$PLANET&"*  *  J  C  *  * "
settexttrigger LANDED :LANDED "Citadel command (?"
settextlinetrigger NOTLANDED :NOTLANDED "Are you sure you want to jettison all cargo"
pause
:NOTLANDED
:NOLANDED
killalltriggers
send "'Unknown Problem Occured after StarBurst!*"
halt
:LANDED
killalltriggers
return
:FINDNEXTTARGET


getnearestwarps $NEAREST $PLAYER~CURRENT_SECTOR
setvar $CHECKED ""
setvar $I 1
while ($I <= $NEAREST)
  setvar $FOCUS $NEAREST[$I]
  setvar $CHECKED $CHECKED&" "&$PLAYER~CURRENT_SECTOR&" "

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
    getdistance $DISTANCETHERE $PLAYER~CURRENT_SECTOR $FOCUS
    getdistance $DISTANCEBACK $FOCUS $PLAYER~CURRENT_SECTOR
    if ($DISTANCETHERE < 0)
      send "^f"&$PLAYER~CURRENT_SECTOR&"*"&$FOCUS&"*q"
      waiton "ENDINTERROG"
      getdistance $DISTANCETHERE $PLAYER~CURRENT_SECTOR $FOCUS
    end
    if ($DISTANCEBACK < 0)
      send "^f"&$FOCUS&"*"&$PLAYER~CURRENT_SECTOR&"*q"
      waiton "ENDINTERROG"
      getdistance $DISTANCEBACK $FOCUS $PLAYER~CURRENT_SECTOR
    end
    if (($DISTANCETHERE > 30) and ($LONGJUMPLIMIT <> 0))
      setvar $switchboard~message "Next fighter is over 30 hops away, stopping mine sweeper.*"
      gosub :switchboard~switchboard
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
    setvar $switchboard~message "Not enough fuel on planet "&$PLANET&". Stopping mine sweeper.*"
    gosub :switchboard~switchboard
    halt
    :PWARPYESSHIP1
    killalltriggers
    setvar $AVOIDEDSECTORS $AVOIDEDSECTORS&" "&$FOCUS&" "
    gosub :PLAYER~QUIKSTATS
    return
    :PWARPNOSHIP1
    killalltriggers
  end
  :NEXT_POSS_TARG
  add $I 1
end
setvar $switchboard~message "All sectors possible swept. Halting mine sweeper.*"
gosub :switchboard~switchboard
gosub :GOHOME
return
:GOHOME

gosub :PLAYER~QUIKSTATS
if ($PLAYER~CURRENT_PROMPT = "Citadel")
  send "p"&$HOMESECTOR&"* y"
  settextlinetrigger PWARP_LOCK :PWARP_LOCK "Locating beam pinpointed"
  settextlinetrigger NO_PWARP_LOCK :NO_PWARP_LOCK "Your own fighters must be"
  settextlinetrigger ALREADY :ALREADY "You are already in that sector!"
  settextlinetrigger NO_ORE :NO_ORE "You do not have enough Fuel Ore"
  pause
  :NO_PWARP_LOCK
  killalltriggers
  setvar $switchboard~message "No fighter down at that location!*"
  gosub :switchboard~switchboard
  return
  :NO_ORE
  killalltriggers
  setvar $switchboard~message "Not enough fuel for that pwarp.*"
  gosub :switchboard~switchboard
  return
  :PWARP_LOCK
  killalltriggers
  waiton "Planet is now in sector"
  setvar $switchboard~message "Planet returned Home*"
  gosub :switchboard~switchboard
  return
  :ALREADY
  killalltriggers
  setvar $switchboard~message "Planet already in that sector!.*"
  gosub :switchboard~switchboard
  return
else
  setvar $switchboard~message "Cannot Pwarp Home. Wrong Prompt!*"
  gosub :switchboard~switchboard
  halt
end
return
:CLEARSECTOR


setvar $LAID_ARMID FALSE
setvar $LAID_LIMP FALSE
setvar $BEFORESECTOR $PLAYER~CURRENT_SECTOR
setvar $BEFORELIMPETS $PLAYER~LIMPETS
setvar $BEFOREARMIDS $PLAYER~ARMIDS
setvar $PLACEDLIMPET FALSE
setvar $PLACEDARMID FALSE

send "   sz*    "

waiton "Warps to Sector(s) :"
setvar $LIMPETOWNER SECTOR.LIMPETS.OWNER[$PLAYER~CURRENT_SECTOR]
setvar $ARMIDOWNER SECTOR.MINES.OWNER[$PLAYER~CURRENT_SECTOR]
gosub :DEPLOYEQUIPMENT

if ($FAST or $NONSAFE)
  while (($PLACEDLIMPET = FALSE) or ($PLACEDARMID = FALSE))
    gosub :ATTEMPTCLEARINGMINES
  end
  setsectorparameter $PLAYER~CURRENT_SECTOR "MINESEC" TRUE
  setsectorparameter $PLAYER~CURRENT_SECTOR "LIMPSEC" TRUE
else
  if ($PLACEDARMID)
    setsectorparameter $PLAYER~CURRENT_SECTOR "MINESEC" TRUE
  end
  if ($PLACEDLIMPET)
    setsectorparameter $PLAYER~CURRENT_SECTOR "LIMPSEC" TRUE
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
gosub :PLAYER~QUIKSTATS
if ($BEFORESECTOR <> $PLAYER~CURRENT_SECTOR)
  gosub :CALLSAVEME
end
if ($PLAYER~CURRENT_PROMPT <> "Citadel")
  echo "**Unexpected Problem.. Halting**"
  halt
end
if (($BEFORELIMPETS > $PLAYER~LIMPETS) or ($PLAYER~LIMPETS < 3) or ($LIMPETOWNER = "belong to your Corp") or ($LIMPETOWNER = "yours"))
  setvar $PLACEDLIMPET TRUE
end
if (($BEFOREARMIDS > $PLAYER~ARMIDS) or ($PLAYER~ARMIDS < 3) or ($ARMIDOWNER = "belong to your Corp") or ($ARMIDOWNER = "yours"))
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
  if ($PLAYER~ALIGNMENT >= 1000)
    send "y * * p s g y g q "
  else
    send "y  *  *  m "&$STARDOCK&" *  *  p s g y g q "
  end
  :TWARPDONE
  if ($MSG <> "")
    setvar $switchboard~message "Twarp Error - "&$MSG&"**"
    gosub :switchboard~switchboard
  end
end
return
:GETINFO
gosub :PLAYER~GETINFO
setvar $TRADER_NAME $PLAYER~TRADER_NAME
setvar $CORPSTRING $PLAYER~CORPSTRING
setvar $TURNS_PER_WARP $PLAYER~TURNS_PER_WARP
setvar $TWARP_1_RANGE $PLAYER~TWARP_1_RANGE
setvar $TWARP_2_RANGE $PLAYER~TWARP_2_RANGE
setvar $EMPTY_HOLDS $PLAYER~EMPTY_HOLDS
return
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
:START_MENU
goto :PAUSEGRIDDER
:RESTARTINGPAUSE
killalltriggers
send "* "
waitfor "(?="
getword CURRENTLINE $LOCATION 1
if ($LOCATION = "Citadel")
  echo ANSI_6 "*[" ANSI_14 "M()M Unlimited Gridder restarted" ANSI_6 "]*" ANSI_7
  goto :PAUSEGRIDDER
else
  echo ANSI_6 "*[" ANSI_14 "M()M Unlimited Gridder not at citadel prompt, cannot restart" ANSI_6 "]*" ANSI_7
  goto :PAUSEGRIDDER
end
:GETPLANETINFO
gosub :PLANET~GETPLANETINFO
setvar $PLANET $PLANET~PLANET
setvar $PLAYER~CURRENT_SECTOR $PLANET~CURRENT_SECTOR
setvar $PLANET_FUEL $PLANET~PLANET_FUEL
setvar $PLANET_FUEL_MAX $PLANET~PLANET_FUEL_MAX
setvar $PLANET_ORGANICS $PLANET~PLANET_ORGANICS
setvar $PLANET_ORGANICS_MAX $PLANET~PLANET_ORGANICS_MAX
setvar $PLANET_EQUIPMENT $PLANET~PLANET_EQUIPMENT
setvar $PLANET_EQUIPMENT_MAX $PLANET~PLANET_EQUIPMENT_MAX
setvar $PLANET_FIGHTERS $PLANET~PLANET_FIGHTERS
setvar $PLANET_FIGHTERS_MAX $PLANET~PLANET_FIGHTERS_MAX
setvar $CITADEL $PLANET~CITADEL
setvar $CITADEL_CREDITS $PLANET~CITADEL_CREDITS
setvar $ATMOSPHERE_CANNON $PLANET~ATMOSPHERE_CANNON
setvar $SECTOR_CANNON $PLANET~SECTOR_CANNON
return
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
include "source\include\switchboard.ts"
include "source\include\sector"
