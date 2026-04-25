logging "OFF"
reqrecording
goto :LOAD_SCRIPT
include "source\include\planet"
include "source\include\player"
:LOAD_SCRIPT


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
loadvar $HOME_SECTOR
loadvar $BACKDOOR
loadvar $LIMPET_COST
loadvar $ARMID_COST
loadvar $LIMPET_REMOVAL_COST
loadvar $PASSWORD
setvar $GRID_LIMPETS 3
setvar $GRID_ARMIDS 3
setvar $REFURB TRUE
loadvar $FIG_FILE
loadvar $LIMP_FILE
loadvar $ARMID_FILE
loadvar $COMMAND
setvar $GRIDDER_FILE "_MOM"&GAMENAME&"_GRIDDER_TARGETS.txt"
setvar $MASTER_EDGE_FILE "_MOM_"&GAMENAME&"_EdgeMasterList.sectors"
setvar $UNEXPLORED_FILE "_MOM_UNEXPLORED_"&GAMENAME&".sectors"
setvar $IMLIMPED FALSE
setvar $AVOIDEDSECTORS ""
setarray $MOVE SECTORS
setvar $CHECKEDFORINFO ""
setvar $GRID_FIGS 1
setvar $ATTACK_RETREAT FALSE

getsectorparameter SECTORS "FIGSEC" $ISFIGGED
getsectorparameter SECTORS "MINESEC" $ISARMIDED
getsectorparameter SECTORS "LIMPSEC" $ISLIMPED
fileexists $DOESHELPFILEEXIST "scripts\MOMBot\Help\"&$COMMAND&".txt"
if ($DOESHELPFILEEXIST <> TRUE)
  write "scripts\MOMBot\Help\"&$COMMAND&".txt" "- limpshovel {bwarp}                                                     "
  write "scripts\MOMBot\Help\"&$COMMAND&".txt" "  Limpet reorganizer. Dumps limpets to borders of grid or near base if no border available. "
  write "scripts\MOMBot\Help\"&$COMMAND&".txt" "                                                            "
  write "scripts\MOMBot\Help\"&$COMMAND&".txt" "    [bwarp] - Will use planetary transporter to hit sectors. Default is twarp.                                                          "
  send "'{" $BOT_NAME "} - Writing help file for this command in Help directory.*"
end

setvar $MAX_SECTORS $PARM1
isnumber $NUMBER $MAX_SECTORS
if ($NUMBER <> 1)
  send "'{" $BOT_NAME "} - Amount of sectors to shovel not a number!*"
  halt
end
if ($MAX_SECTORS <= 0)
  send "'{" $BOT_NAME "} - Amount of sectors to shovel must be greater than 0.*"
  halt
end

getwordpos $USER_COMMAND_LINE $POS "norefurb"
getwordpos $USER_COMMAND_LINE $POS "bwarp"
if ($POS > 0)
  setvar $GRID_WARP "bwarp"
else
  setvar $GRID_WARP "twarp"
end

if ($ISFIGGED = "")
  send "'{" $BOT_NAME "} - It appears no grid data is available.  Run a fighter grid checker that uses the sector parameter FIGSEC. (Try figs command)*"
  halt
end
if ($ISLIMPED = "")
  send "'{" $BOT_NAME "} - It appears no limpet data is available.  Run a limpet grid checker that uses the sector parameter LIMPSEC. (Try limps command)*"
  halt
end
if ($PLAYER~PHOTONS > 0)
  send "'Can not run with photons on your ship.*"
  halt
end

gosub :PLAYER~QUIKSTATS
if ($PLAYER~CURRENT_PROMPT <> "Citadel")
  send "'{" $BOT_NAME "} - Must start limpet shovel from citadel prompt.*"
  halt
end

killalltriggers
setvar $HOMESEC $PLAYER~CURRENT_SECTOR
gosub :CHECKAVOIDEDSECTORS
:CHECKFORTARGETS

send "q"
gosub :GETPLANETINFO
send "tnl1*tnl2*tnl3*snl1*snl2*snl3*tnt1*mnt*q"
gosub :LANDONPLANETENTERCITADEL
send "'{" $BOT_NAME "} - M()M Limpet Shovel Powering Up!*"
waitfor "(?="
:CHECKSHIP



killalltriggers
gosub :PLAYER~QUIKSTATS
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
:RESTART
send "q"
gosub :GETPLANETINFO
send "c "
gosub :FINDALLTARGETSECTORS
gosub :ASSEMBLE_MAC
gosub :ASSEMBLE_RETURN_MAC
gosub :ASSEMBLE_ATTACK_MAC
gosub :ASSEMBLE_LAND_MAC
:SELECT_BOOMSEC
killalltriggers
gosub :PLAYER~QUIKSTATS
if ($PLAYER~FIGHTERS < ($FIGS + 5))
  echo ANSI_12 "*Not enough fighters to safely continue.*" ANSI_7
  halt
end
if ($PLAYER~LIMPETS >= ($MAXMINES - 20))

  getword $UNLOAD_SECTORS $WARPTO 1
  replacetext $UNLOAD_SECTORS " "&$WARPTO&" " " "
  if ($WARPTO = 0)
    getnearestwarps $NEAREST $HOMESEC
    setvar $I 1
    while (($I <= $NEAREST) and ($WARPTO = 0))
      setvar $FOCUS $NEAREST[$I]
      getwordpos $AVOIDEDSECTORS $POS " "&$FOCUS&" "
      getsectorparameter $FOCUS "FIGSEC" $ISFIGGED
      getsectorparameter $FOCUS "LIMPSEC" $ISLIMPED
      if ($ISFIGGED = "")
        setvar $ISFIGGED FALSE
      end
      if ($ISLIMPED = "")
        setvar $ISLIMPED FALSE
      end
      if (($ISLIMPED = TRUE) and (($ISFIGGED = TRUE) and ($POS <= 0)))
        setvar $WARPTO $FOCUS
        setvar $AVOIDEDSECTORS $AVOIDEDSECTORS&" "&$FOCUS&" "
      end
      add $I 1
    end
    if ($WARPTO = 0)
      echo ANSI_12 "*No Limpet Dump Sectors Able to be Found.*" ANSI_7
      halt
    end
  end

  if ($GRID_WARP = "twarp")
    gosub :DOTWARP
  elseif ($GRID_WARP = "bwarp")
    gosub :BWARP
  else
    halt
  end
  killalltriggers
  setvar $JUSTCHECKINGIFALIVE FALSE
  gosub :PLAYER~QUIKSTATS
  if (($TWARP = "No") or ($PLAYER~CURRENT_SECTOR <> $WARPTO))
    goto :CALLSAVEME
  end
  send "h2 z"&$PLAYER~LIMPETS&"*zc*"&$RETURN_MAC
  setvar $JUSTCHECKINGIFALIVE TRUE
  gosub :PLAYER~QUIKSTATS
  if (($TWARP = "No") or ($PLAYER~CURRENT_SECTOR <> $HOMESEC))
    goto :CALLSAVEME
  end
  send $LAND_MAC
  goto :SELECT_BOOMSEC
end
if ($TWARP = "No")
  goto :CALLSAVEME
end
:CONTINUEON

getrnd $RANDOM 1 $DATABASECOUNT
getword $DATABASE $WARPTO $RANDOM
if ($WARPTO = 0)
  send "'{" $BOT_NAME "} - Reorganized limpets in all sectors possible.*"
  halt
end
getdistance $DISTANCE $HOMESEC $WARPTO
if ($DISTANCE <= 0)
  send "^f"&$HOMESEC&"*"&$WARPTO&"*q"
  waiton "ENDINTERROG"
  getdistance $DISTANCE $HOMESEC $WARPTO
end
:CLEARIT

killalltriggers
replacetext $DATABASE " "&$WARPTO&" " " "
subtract $DATABASECOUNT 1
if ($DISTANCE <= 2)
  goto :SELECT_BOOMSEC
end
if ($GRID_WARP = "twarp")
  gosub :DOTWARP
elseif ($GRID_WARP = "bwarp")
  gosub :BWARP
else
  halt
end
:HITTINGSEC


killalltriggers
setvar $JUSTCHECKINGIFALIVE FALSE
gosub :PLAYER~QUIKSTATS
if (($TWARP = "No") or ($PLAYER~CURRENT_SECTOR <> $WARPTO))
  goto :CALLSAVEME
end
send $MAC&$RETURN_MAC
setvar $JUSTCHECKINGIFALIVE TRUE
gosub :PLAYER~QUIKSTATS
if (($TWARP = "No") or ($PLAYER~CURRENT_SECTOR <> $HOMESEC))
  goto :CALLSAVEME
end
send $LAND_MAC
goto :SELECT_BOOMSEC
:FINDALLTARGETSECTORS




setvar $TARGETSECTORCOUNT 1
setvar $DATABASECOUNT 0
setvar $DATABASE ""
setvar $ADJACENTDATABASE ""
setvar $UNLOAD_SECTORS " "

echo ANSI_14 "* Loading target sectors..*" ANSI_7
setvar $PERC 0

getnearestwarps $NEAREST $PLAYER~CURRENT_SECTOR
setvar $I 1
if ($NEAREST < $MAX_SECTORS)
  setvar $MAX_SECTORS $NEAREST
end
while (($I <= $NEAREST) and ($DATABASECOUNT < $MAX_SECTORS))
  setvar $FOCUS $NEAREST[$I]
  getwordpos $AVOIDEDSECTORS $POS " "&$FOCUS&" "
  getsectorparameter $FOCUS "FIGSEC" $ISFIGGED
  getsectorparameter $FOCUS "MINESEC" $ISARMIDED
  getsectorparameter $FOCUS "LIMPSEC" $ISLIMPED
  if ($ISFIGGED = "")
    setvar $ISFIGGED FALSE
  end
  if ($ISLIMPED = "")
    setvar $ISLIMPED FALSE
  end
  if ($ISARMIDED = "")
    setvar $ISARMIDED FALSE
  end
  setvar $ISFOUND FALSE
  setvar $ISFIGADJACENT FALSE
  setvar $P 1
  while (SECTOR.WARPS[$FOCUS][$P] > 0)
    setvar $TEMP SECTOR.WARPS[$FOCUS][$P]
    getsectorparameter $TEMP "FIGSEC" $ISFIGADJACENT
    if ($ISFIGADJACENT <> TRUE)
      if (($ISLIMPED = TRUE) and (($ISFIGGED = TRUE) and ($POS <= 0)))
        setvar $UNLOAD_SECTORS $UNLOAD_SECTORS&"  "&$FOCUS&"  "
        setvar $ISFOUND TRUE
      end
    end
    add $P 1
  end
  if ($ISFOUND = FALSE)
    if (($ISLIMPED = TRUE) and (($ISFIGGED = TRUE) and ($POS <= 0)))
      setvar $DATABASE $DATABASE&" "&$FOCUS&" "
      add $DATABASECOUNT 1
    end
  end
  add $I 1

  setvar $PERCTEST (($I * 100) / $MAX_SECTORS)
  if ($PERCTEST > $PERC)
    setvar $PERC (($I * 100) / $MAX_SECTORS)
    echo "*"
    echo #27 "["&($PERC / 2)&"C"
    echo ANSI_14 "" ANSI_15 " " $PERC "%" #27&"[1A   "
  end
end

send "'{" $BOT_NAME "} - "&$DATABASECOUNT&" limpet sectors found.*"
return
:ASSEMBLE_MAC



setvar $MAC ""







setvar $MAC $MAC&"h2 z0*zc*"

return
:ASSEMBLE_ATTACK_MAC

setvar $ATTACK_MAC "* za"&$FIGS&"* jr * "
return
:ASSEMBLE_RETURN_MAC

setvar $RETURN_MAC $HOMESEC&"* yy * * "
return
:ASSEMBLE_LAND_MAC

setvar $LAND_MAC "l j"&#8&#8&#8&#8&#8&$PLANET&"*  * j m  * * *  t * t 1* c * "

return
:RETURN_TRIGGERS


settexttrigger INCIT :INCIT "To which Sector"
settexttrigger IGD :IGD "An Interdictor Generator in this sector holds you fast!"
settexttrigger NOTURNS :IGD "Your ship was hit by a Photon and has been disabled"
gosub :DELAYTRIGGER
pause
:INCIT
killalltriggers
return
:IGD
goto :CALLSAVEME
:LANDONPLANETENTERCITADEL


send "l " $PLANET "* c"
waiton "<Enter Citadel>"
return
:LEAVECITADELANDPLANET
send "q q"
waiton "Blasting off from"
waiton "Command [TL"
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

setvar $AVOIDEDSECTORS $AVOIDEDSECTORS&" "&$HOMESEC&" "
setvar $P 1
while (SECTOR.WARPS[$HOMESEC][$P] > 0)
  setvar $AVOIDEDSECTORS $AVOIDEDSECTORS&" "&SECTOR.WARPS[$HOMESEC][$P]&" "
  add $P 1
end
return
:DELAYTRIGGER


setdelaytrigger DELAYUNTILSAVEME :CALLSAVEME 5000
return
:XENTER

send "q y * t* * *" $PASSWORD "*    *    *       za"&$FIGS&"*   z*   f z 1*  z c d *  "
return
:GETCOURSES




killalltriggers
setvar $ORIGINALDESTINATION $DESTINATION
send "f*"&$DESTINATION&"*"
getcoursedijkstra $COURSE $PLAYER~CURRENT_SECTOR $DESTINATION
setvar $INDEX 1
while ($INDEX <= $COURSE)
  if (($FIGHTER_GRID[$COURSE[$INDEX]] <= 0) and ($COURSE[$INDEX] <> $ORIGINALDESTINATION))
    setvar $DESTINATION $COURSE[$INDEX]
  elseif ($COURSE[$INDEX] <> $ORIGINALDESTINATION)
    setvar $DESTINATION $ORIGINALDESTINATION
  end
  add $INDEX 1
end
:NOPATH



killalltriggers
return
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
:ATTEMPTREFURB
:ATTEMPT_REFURB



setvar $LIMPETCASHNEEDED ((($MAXMINES - $PLAYER~LIMPETS) * $LIMPET_COST) + $LIMPET_REMOVAL_COST)
setvar $ARMIDCASHNEEDED (($MAXMINES - $PLAYER~ARMIDS) * $ARMID_COST)
setvar $CASHNEEDED ($LIMPETCASHNEEDED + $ARMIDCASHNEEDED)
setvar $FURBING TRUE
if ($CASHNEEDED > $PLAYER~CREDITS)
  send "D"
  waiton "Citadel treasury contains "
  getword CURRENTLINE $CITADELCASH 4
  striptext $CITADELCASH ","
  if ($CITADELCASH < $CASHNEEDED)
    send "'{"&$BOT_NAME&"} - Not enough cash for mine refurbs in treasury or on hand.*"
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
    send "'{"&$BOT_NAME&"} - Jump Sector Found - Using Sector "&$RED_ADJ&"**"
  else
    waitfor "Command [TL="
    send "'{"&$BOT_NAME&"} - Cannot Find Jump Sector Adjacent Dock**"
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
send "'{" $BOT_NAME "} - Cannot Find Path to StarDock!**"
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
  send "'{" $BOT_NAME "} "&$TAGLINEB&" - Insufficient Warp Data Plotting Course to Dock**"
  halt
end

getdistance $DIST2 $STARDOCK $START_SECTOR
if ($DIST2 <= 0)
  send "'{" $BOT_NAME "} "&$TAGLINEB&" - Insufficient Warp Data Plotting Return Course From Dock**"
  halt
end

setvar $ORE_REQ (($DIST1 + $DIST2) * 3)

if ($PLAYER~ORE_HOLDS < $ORE_REQ)
  send "'{" $BOT_NAME "} - Not Enough ORE In Holds To Make Round Trip**"
  halt
end

if ($PLAYER~TWARP_TYPE = "No")
  send "'{" $BOT_NAME "} - Must Have Twarp 1 or 2**"
  halt
end

if ($UNLIMITEDGAME = 0)
  gosub :TURNSREQUIRED
  if ($TURNSREQUIRED > $PLAYER~TURNS)
    send "'{" $BOT_NAME "} - Not Enough Turns. "&ANSI_12&$TURNSREQUIRED&ANSI_15&", Required**"
    halt
  elseif ($TURNSREQUIRED <= $PLAYER~TURNS)
    setvar $TMP ($PLAYER~TURNS - $TURNSREQUIRED)
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
if (($PLAYER~ALIGNMENT >= 1000) and ($WEAREADJDOCK = FALSE))
  setvar $WARPTO $STARDOCK
  gosub :DOTWARP
elseif (($WEAREADJDOCK = FALSE) and ($RED_ADJ <> 0))
  setvar $WARPTO $RED_ADJ
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
gosub :PLAYER~QUIKSTATS

setvar $_LIMPS "Max"
setvar $_MINES "Max"
gosub :DOPURCHASES
send "Q Q Q Q Z N M "&$START_SECTOR&"* Y  Y  Y  * L Z"&#8&$PLANET&"* p  s  s * * c *"
gosub :PLAYER~QUIKSTATS
if ($PLAYER~CURRENT_SECTOR = $STARDOCK)
  send "'{" $BOT_NAME "} - Twarp Error, Should be Hiding on Dock!**"
  halt
end
send "q tnt1* c "


return
:DOTWARP

setvar $MSG ""
if ($WARPTO > 0)
  send "q q mz"&$WARPTO " * "
  settexttrigger THERE :ADJ_WARP "You are already in that sector!"
  settextlinetrigger ADJ_WARP :ADJ_WARP "Sector  : "&$WARPTO&" "
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
  settextlinetrigger NO_FUEL :ITWARPNOFUEL "You do not have enough Fuel Ore"
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
  send "n*zn"
  send "l "&#8&$PLANET "*c"
  setsectorparameter $WARPTO "FIGSEC" FALSE
  setvar $TEMP " "&$WARPTO&" "
  replacetext $DATABASE $TEMP " "
  subtract $DATABASE_COUNT 1
  goto :SELECT_BOOMSEC
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
    if ($FURBING)
      setvar $STR "y * * p s g y g q "
    else
      setvar $STR "y * *  "
    end
    send $STR
  else
    if ($FURBING)
      setvar $STR "y  *  *  m "&$STARDOCK&" *  *  p s g y g q "
    else
      setvar $STR "y * *  "
    end
    send $STR
  end
  :TWARPDONE
  if ($MSG <> "")
    send "'{" $BOT_NAME "} Twarp Error - "&$MSG&"**"
  end
end
return
:BWARP


killalltriggers
send "b" $WARPTO "*"
settexttrigger GO :GO5 "TransWarp Locked"
settexttrigger NO :NO5 "No locating beam found"
gosub :DELAYTRIGGER
pause
:NO5

killalltriggers
send "n "
waitfor "Transporter shutting down."
setvar $FIGHTER_GRID[$WARPTO] 0
goto :SELECT_BOOMSEC
:GO5

killalltriggers
send "y z * "
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
:CALLSAVEME


send "q q q q * '"&$BOT_NAME&" call*"
halt
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
return
