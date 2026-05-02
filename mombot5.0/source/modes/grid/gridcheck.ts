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
goto :GRIDCHECK_START
include "source\include\planet"
:GRIDCHECK_START

getsectorparameter SECTORS "FIGSEC" $ISFIGGED
if ($ISFIGGED = "")
  send "'{" $BOT_NAME "} - It appears no grid data is available.  Run a fighter grid checker that uses the sector parameter FIGSEC. (Try figs command)*"
  halt
end

getwordpos " "&$USER_COMMAND_LINE&" " $POS " b "
if ($POS > 0)
  setvar $BWARP TRUE
else
  setvar $BWARP FALSE
end
:GET_INFO


gosub :PLAYER~QUIKSTATS
if ($PLAYER~CURRENT_PROMPT <> "Citadel")
  send "'{" $BOT_NAME "} - Must must start grid check from citadel prompt.*"
  halt
end
setvar $HOMESEC $PLAYER~CURRENT_SECTOR
:CHECKSHIP



killalltriggers
send "c;q"
waitfor "Mine Max:"
getword CURRENTLINE $MAXLIMPETS 6
:START
gosub :RANDOMIZER

killalltriggers
send "qm***tnt1*"
gosub :PLAYER~QUIKSTATS
gosub :GETPLANETINFO
send "q"
gosub :ASSEMBLE_MAC
:SELECT_BOOMSEC

gosub :PLAYER~QUIKSTATS
if ($PLAYER~TOTAL_HOLDS > $PLAYER~ORE_HOLDS)
  goto :NO_ORE
end
if ($PLAYER~TWARP_TYPE = "No")
  send "'{" $BOT_NAME "} - Must have T-warp to run this script.*"
  halt
end
:GETSECTOR

getrnd $RANDOM 1 $DATABASE_COUNT
getword $DATABASE $WARPTO $RANDOM
if ($WARPTO = 0)

  send "'{" $BOT_NAME "} - Entire Grid Checked.*"
  halt
end
:CLEARIT


killalltriggers
setvar $TEMP " "&$WARPTO&" "
replacetext $DATABASE $TEMP " "
subtract $DATABASE_COUNT 1
if (SECTOR.EXPLORED[$WARPTO] = "YES")
  setvar $TEMP " "&$WARPTO&" "
  replacetext $DATABASE $TEMP " "
  subtract $DATABASE_COUNT 1
  goto :GETSECTOR
end
if ($BWARP = FALSE)
  send "q q * "
  gosub :TWARP
else
  gosub :BWARP
end
:HITTINGSEC



killalltriggers
send $MAC
goto :SELECT_BOOMSEC
:TWARP




killalltriggers
send "m" $WARPTO "*"
settexttrigger THERE :ADJ_WARP "You are already in that sector!"
settextlinetrigger ADJ_WARP :ADJ_WARP "Sector  : "&$WARPTO
settextlinetrigger LOCKING :LOCKING "That Warp Lane is not adjacent"
pause
:ADJ_WARP

killalltriggers
send "zn"
goto :TWARP_ADJ
:LOCKING
killalltriggers
send "y"
settextlinetrigger TWARP_LOCK :TWARP_LOCK "TransWarp Locked"
settextlinetrigger NO_TWRP_LOCK :NO_TWARP_LOCK "No locating beam found"
settextlinetrigger TWARP_ADJ :TWARP_ADJ "<Set NavPoint>"
settextlinetrigger NO_ORE :NO_ORE "You do not have enough Fuel Ore"
pause
:NO_ORE


killalltriggers
send "'{" $BOT_NAME "} - Planet is out of fuel.  Please refill before running again.*"
halt
:TWARP_ADJ

killalltriggers
send "zn"
return
:TWARP_LOCK

killalltriggers
send "y*zn"
return
:NO_TWARP_LOCK

killalltriggers
send "n*zn"
send "l "&#8&$PLANET "*c"
setsectorparameter $WARPTO "FIGSEC" FALSE
setvar $TEMP " "&$WARPTO&" "
replacetext $DATABASE $TEMP " "
subtract $DATABASE_COUNT 1
goto :SELECT_BOOMSEC
:BWARP




killalltriggers
send "b" $WARPTO "*"
settexttrigger GO :GO5 "TransWarp Locked"
settexttrigger NO :NO5 "No locating beam found"
settexttrigger OUTTA_ORE :NO_ORE "This planet does not have enough Fuel Ore to transport you."
pause
:NO5

killalltriggers
send "n"
waitfor "Transporter shutting down."
setsectorparameter $WARPTO "FIGSEC" FALSE
setvar $TEMP " "&$WARPTO&" "
replacetext $DATABASE $TEMP " "
subtract $DATABASE_COUNT 1
goto :SELECT_BOOMSEC
:GO5

killalltriggers
send "yzn"
return
:ENDING




halt
:RANDOMIZER




setvar $RND_COUNT 0
setvar $DATABASE_COUNT 0
setvar $DATABASE ""
:RND_LOOP

send "'{" $BOT_NAME "} - Calculating unexplored sectors..*"
setvar $PERCFIGS 0
while ($RND_COUNT < SECTORS)
  add $RND_COUNT 1
  getsectorparameter $RND_COUNT "FIGSEC" $ISFIGGED
  if (($AVOIDEDSECTORS[$RND_COUNT] = FALSE) and (($ISFIGGED = TRUE) and (SECTOR.EXPLORED[$RND_COUNT] <> "YES")))
    setvar $DATABASE $DATABASE&" "&$RND_COUNT
    add $DATABASE_COUNT 1
  end
  setvar $PERCTEST (($RND_COUNT * 100) / SECTORS)
  if ($PERCTEST > $PERCFIGS)
    setvar $PERCFIGS (($RND_COUNT * 100) / SECTORS)
    echo "*"
    echo #27 "["&($PERCFIGS / 2)&"C"
    echo ANSI_15 "" ANSI_9 " " $PERCFIGS "%" #27&"[1A   "
  end
end
send "'{" $BOT_NAME "} - " $DATABASE_COUNT " sectors in current grid need exploring.  Starting now.*"

return
:ASSEMBLE_MAC



setvar $MAC " *  z n  s z h* "
setvar $MAC $MAC&"m"&$HOMESEC&"*yy*  l "&#8&$PLANET&"*  z  n  z  n  *  mnt*  tnt1**  cr*  "
return
:RETURN_TRIGGERS


settexttrigger INCIT :INCIT "To which Sector"
settexttrigger IGD :IGD "An Interdictor Generator in this sector holds you fast!"
settexttrigger NOTURNS :IGD "Your ship was hit by a Photon and has been disabled"
pause
:INCIT
killalltriggers
return
:IGD
killalltriggers
gosub :PLAYER~QUIKSTATS
if ($PLAYER~CURRENT_PROMPT = "Citadel")
  halt
end
if (($PLAYER~CURRENT_PROMPT = "Computer") or ($PLAYER~CURRENT_PROMPT = "Corporate") or ($PLAYER~CURRENT_PROMPT = "NavPoint"))
  send "q"
  waitfor "Command [TL"
end
gosub :CALLSAVEME
halt
:CALLSAVEME

killalltriggers
send "q q q * * * * "
gosub :PLAYER~QUIKSTATS
setvar $FIGSTODEPLOY 1
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
gosub :DEPLOYFIGS
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
send "'{" $BOT_NAME "} - 30 seconds after save call, script halted.*"
goto :PAUSEGRIDDER
:FRIENDLYTWARP

killalltriggers
setvar $FIGSTODEPLOY "ALL"
gosub :DEPLOYFIGS
goto :WAITFORHELP
:FRIENDLYPLANET

killalltriggers
gettext CURRENTLINE $PLANET_SAVEME "Saveme script activated - Planet " " to "
send "L "&#8&$PLANET_SAVEME&"* C 'I landed on planet "&$PLANET_SAVEME&"*"
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
if (($PLAYER~CURRENT_SECTOR < 11) or ($PLAYER~CURRENT_SECTOR = STARDOCK))
  send "'Can't deploy figs in fed*"
  return
end
send "a y y 9999* F"
settextlinetrigger NOCONTROL :NOCONTROL "These fighters are not under your control."
settextlinetrigger ABLETODEPLOY :ABLETODEPLOY "fighters available."
pause
:NOCONTROL

killalltriggers
send "'{" $BOT_NAME "} - We don't control the figs in this sector!*"
return
:ABLETODEPLOY

killalltriggers
getword CURRENTLINE $FIGSAVAILABLE 3
striptext $FIGSAVAILABLE ","
if ($FIGSTODEPLOY = "ALL")
  setvar $FIGSTODEPLOY $FIGSAVAILABLE
end
if ($FIGSAVAILABLE = 0)
  send "0* ZC D* '{"&$BOT_NAME&"} - I have no figs to deploy!*"
else
  send $FIGSTODEPLOY&"* ZC D* '"&$FIGSTODEPLOY&" figs deployed*"
end
return
:GETLINE




killtrigger DONE
add $CNT 1
setvar $CULINE CURRENTLINE
replacetext $CULINE #179 " "&#179&" "
setvar $LINE[$CNT] $CULINE
getwordpos $CULINE $POS " Ship "
if ($POS > 0)
  goto :DONE_READ
end
goto :CHK


return
:CLEARSCREEN
echo #27&"[2J"
return
:TURNOFFANSI
send "c n"
killalltriggers
waiton "(1) ANSI graphics"
getword CURRENTLINE $ANSISTATUS 5
waiton "(2) Animation display"
getword CURRENTLINE $ANIMATIONSTATUS 5
if ($ANIMATIONSTATUS = "On")
  send 2
end
if ($ANSISTATUS = "On")
  send "1 q q"
else
  send "q q"
end
waiton "<Computer deactivated>"
return
:TURNONANSI
send "c n"
killalltriggers
waiton "(1) ANSI graphics"
getword CURRENTLINE $ANSISTATUS 5
if ($ANSISTATUS = "Off")
  send "1 q q"
else
  send "q q"
end
waiton "<Computer deactivated>"
return
:LANDONPLANETENTERCITADEL


send "l "&#8&$PLANET "* c"
waiton "<Enter Citadel>"
return
:LEAVECITADELANDPLANET
send "q q"
waiton "Blasting off from"
waiton "Command [TL"
return
:HEADER

return
:CLEARSCREEN

echo #27&"[2J"
return
:CHECKAVOIDEDSECTORS
:READAVOIDEDLIST

setarray $AVOIDEDSECTORS SECTORS
send "cxq"
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
  goto :DONEAVOIDS
end
setvar $WORKINGTEXT $WORKINGTEXT&" +++"
getword $WORKINGTEXT $AVOID 1
getwordpos $WORKINGTEXT $POS $AVOID


while ($AVOID <> "+++")
  setvar $AVOIDEDSECTORS[$AVOID] TRUE
  getlength $AVOID $LENGTH
  getlength $WORKINGTEXT $CHECKLENGTH
  cuttext $WORKINGTEXT $WORKINGTEXT ($POS + $LENGTH) 9999
  getword $WORKINGTEXT $AVOID 1
  getwordpos $WORKINGTEXT $POS $AVOID
end

goto :KEEPCOUNTINGAVOIDS
:DONEAVOIDS

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
