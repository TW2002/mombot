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
loadvar $RYLOS
loadvar $ALPHA_CENTAURI
loadvar $COMMAND
goto :STRIPSHIPS_START
include "source\include\planet"
:STRIPSHIPS_START

fileexists $DOESHELPFILEEXIST "scripts\MOMBot\Help\"&$COMMAND&".txt"
if ($DOESHELPFILEEXIST <> TRUE)
  write "scripts\MOMBot\Help\"&$COMMAND&".txt" "- stripship                                                 "
  write "scripts\MOMBot\Help\"&$COMMAND&".txt" "                                                            "
  write "scripts\MOMBot\Help\"&$COMMAND&".txt" "    Strips fighters from all empty ships and deploys them   "
  write "scripts\MOMBot\Help\"&$COMMAND&".txt" "    into the sector.                                        "

  send "'{" $BOT_NAME "} - Writing help file for this command in Help directory.*"
end
:EMPTYSHIPS

killalltriggers
gosub :PLAYER~QUIKSTATS
setvar $STARTSHIP $PLAYER~SHIP_NUMBER
setvar $STARTINGLOCATION $PLAYER~CURRENT_PROMPT
setvar $TOTAL_FIGS 0
send "** "
setvar $FUELINSECTOR FALSE
if (($STARTINGLOCATION <> "Citadel") and (($STARTINGSECTOR <> "Planet") and ($STARTINGLOCATION <> "Command")))
  send "'{" $BOT_NAME "} - Must be in Command, Citadel or Planet prompt to run*"
  halt
end

if ($STARTINGLOCATION = "Citadel")
  send "q "
end
setvar $SHIPCOUNT 0
if (($STARTINGLOCATION = "Planet") or ($STARTINGLOCATION = "Citadel"))
  gosub :GETPLANETINFO
  send "q "
end
send "'{" $BOT_NAME "} - Ship Stripper starting up!  Starting ship scan..*"
:TRYSHIPSCAN
send "wnq*@"
settextlinetrigger STATLINETRIG :SHIPLINE "-----------------------------------------------------------------------------"
settextlinetrigger TOWALREADYON :CONTINUETOWON "You shut off your Tractor Beam."
pause
:CONTINUETOWON
killtrigger STATLINETRIG
goto :TRYSHIPSCAN
:SHIPLINE

killtrigger TOWALREADYON
setvar $LINE CURRENTLINE
getwordpos $LINE $POS "Average Interval Lag:"
getword $LINE $TEMP 1
isnumber $RESULT $TEMP
if ($RESULT = TRUE)
  if ($TEMP > 0)
    add $SHIPCOUNT 1
    setvar $THESHIPS[$SHIPCOUNT] $TEMP
  end
end
if ($POS > 0)
  goto :GOTSHIPS
else
  settextlinetrigger GETLINE :SHIPLINE
  pause
end
:GOTSHIPS


send "'{" $BOT_NAME "} - Found "&$SHIPCOUNT&" empty ships to strip.*"
setvar $I 1
while ($I <= $SHIPCOUNT)
  if ($THESHIPS[$I] > 0)
    send "x "&$THESHIPS[$I]&"*   *   "
    gosub :PLAYER~QUIKSTATS
    send " F"
    waiton " fighters available."
    getword CURRENTLINE $FTRS_TO_LEAVE 3
    striptext $FTRS_TO_LEAVE ","
    striptext $FTRS_TO_LEAVE " "
    if ($FTRS_TO_LEAVE > 0)
      send " "&$FTRS_TO_LEAVE&" * C D"
      add $TOTAL_FIGS $FTRS_TO_LEAVE
    end
  end
  add $I 1
end
send "x "&$STARTSHIP&"*  *   "
if (($STARTINGLOCATION = "Planet") or ($STARTINGLOCATION = "Citadel"))
  gosub :LANDINGSUB
end
send "'{" $BOT_NAME "} - Done stripping empty ships.*"

halt
:LANDINGSUB



send "l" $PLANET "*z  n  z  n  *  "
setvar $SUCESSFULCITADEL FALSE
setvar $SUCESSFULPLANET FALSE
settextlinetrigger NOPLANET :NOPLANET "There isn't a planet in this sector."
settextlinetrigger NO_LAND :NO_LAND "since it couldn't possibly stand"
settextlinetrigger PLANET :PLANET "Planet #"
settextlinetrigger WRONGONE :WRONG_NUM "That planet is not in this sector."
pause
:NOPLANET

killtrigger NO_LAND
killtrigger PLANET
killtrigger WRONGONE
send "'{" $BOT_NAME "} - No Planet in Sector!*"
return
:NO_LAND

killtrigger NOPLANET
killtrigger PLANET
killtrigger WRONGONE
send "'{" $BOT_NAME "} - This ship cannot land!*"
return
:PLANET

getword CURRENTLINE $PNUM_CK 2
striptext $PNUM_CK "#"
if ($PNUM_CK <> $PLANET)
  killtrigger NO_LAND
  killtrigger WRONGONE
  killtrigger NO_PLANET
  send "q"
  goto :WRONG_NUM
end
killtrigger NOPLANET
killtrigger NO_LAND
killtrigger WRONGONE
settexttrigger WRONG_NUM :WRONG_NUM "That planet is not in this sector."
settexttrigger PLANET :PLANET_PROMPT "Planet command"
pause
:WRONG_NUM

killtrigger PLANET
send "**'{" $BOT_NAME "} - Incorrect Planet Number*"
return
:PLANET_PROMPT

killtrigger WRONG_NUM
setvar $CURRENTBOTPLANET $PLANET
savevar $CURRENTBOTPLANET
send "c"
settexttrigger BUILD_CIT :BUILD_CIT "Do you wish to construct one?"
settexttrigger IN_CIT :IN_CIT "Citadel command"
settexttrigger NOCITALLOWED :BUILD_CIT "Citadels are not allowed in FedSpace."
settexttrigger CITNOTBUILTYET :BUILD_CIT "Be patient, your Citadel is not yet finished."
pause
:BUILD_CIT

killtrigger IN_CIT
killtrigger NOCITALLOWED
killtrigger BUILD_CIT
killtrigger CITNOTBUILTYET
setvar $SUCESSFULPLANET TRUE
send "n*"
setvar $STARTINGLOCATION "Planet"
return
:IN_CIT

killtrigger IN_CIT
killtrigger NOCITALLOWED
killtrigger BUILD_CIT
killtrigger CITNOTBUILTYET
setvar $SUCESSFULCITADEL TRUE
setvar $STARTINGLOCATION "Citadel"
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
:TWARPTO



setvar $TWARPSUCCESS FALSE
setvar $ORIGINAL 1
if ($PLAYER~CURRENT_SECTOR = $WARPTO)
  setvar $MSG "Already in that sector!"
  goto :TWARPDONE
elseif (($WARPTO <= 0) or ($WARPTO > SECTORS))
  setvar $MSG "Destination sector is out of range!"
  goto :TWARPDONE
end
if (($PLAYER~ALIGNMENT < 1000) and (($WARPTO = $STARDOCK) and (($BACKDOOR > 10) and ($BACKDOOR <> $PLAYER~CURRENT_SECTOR))))
  setvar $ORIGINAL $WARPTO
  setvar $WARPTO $BACKDOOR
end
if ($PLAYER~TWARP_TYPE = "No")
  setvar $MSG "No T-warp drive on this ship!"
  goto :TWARPDONE
end
if ($STARTINGLOCATION = "Citadel")
  send "q t*t1* q q * c u y q mz" $WARPTO "*"
elseif ($STARTINGLOCATION = "Planet")
  send "t*t1* q q * c u y q mz" $WARPTO "*"
else
  send "q q q * c u y q mz" $WARPTO "*"
end
settexttrigger THERE :ADJ_WARP "You are already in that sector!"
settextlinetrigger ADJ_WARP :ADJ_WARP "Sector  : "&$WARPTO&" "
settexttrigger LOCKING :LOCKING "Do you want to engage the TransWarp drive?"
settexttrigger IGD :TWARPIGD "An Interdictor Generator in this sector holds you fast!"
settexttrigger NOTURNS :TWARPPHOTONED "Your ship was hit by a Photon and has been disabled"
settexttrigger NOROUTE :TWARPNOROUTE "Do you really want to warp there? (Y/N)"
pause
:ADJ_WARP

killtrigger THERE
killtrigger ADJ_WARP
killtrigger LOCKING
killtrigger IGD
killtrigger NOTURNS
killtrigger NOROUTE
send "z*"
goto :TWARP_ADJ
:LOCKING
killtrigger THERE
killtrigger ADJ_WARP
killtrigger LOCKING
killtrigger IGD
killtrigger NOTURNS
killtrigger NOROUTE
send "y"
settextlinetrigger TWARP_LOCK :TWARP_LOCK "TransWarp Locked"
settextlinetrigger NO_TWRP_LOCK :NO_TWARP_LOCK "No locating beam found"
settextlinetrigger TWARP_ADJ :TWARP_ADJ "<Set NavPoint>"
settextlinetrigger NO_FUEL :TWARPNOFUEL "You do not have enough Fuel Ore"
pause
:TWARPNOFUEL

killtrigger THERE
killtrigger ADJ_WARP
killtrigger LOCKING
killtrigger IGD
killtrigger NOTURNS
killtrigger NOROUTE
killtrigger TWARP_LOCK
killtrigger NO_TWRP_LOCK
killtrigger TWARP_ADJ
killtrigger NO_FUEL
setvar $MSG "Not enough fuel for T-warp."
goto :TWARPDONE
:TWARP_ADJ

killtrigger THERE
killtrigger ADJ_WARP
killtrigger LOCKING
killtrigger IGD
killtrigger NOTURNS
killtrigger NOROUTE
killtrigger TWARP_LOCK
killtrigger NO_TWRP_LOCK
killtrigger TWARP_ADJ
killtrigger NO_FUEL
send "z* "
setvar $MSG "That sector is next door, just plain warping."
setvar $TWARPSUCCESS TRUE
goto :TWARPDONE
:TWARPNOROUTE

killtrigger THERE
killtrigger ADJ_WARP
killtrigger LOCKING
killtrigger IGD
killtrigger NOTURNS
killtrigger NOROUTE
killtrigger TWARP_LOCK
killtrigger NO_TWRP_LOCK
killtrigger TWARP_ADJ
killtrigger NO_FUEL
send "n* z* "
setvar $MSG "No route available to that sector!"
goto :TWARPDONE
:NO_TWARP_LOCK

killtrigger THERE
killtrigger ADJ_WARP
killtrigger LOCKING
killtrigger IGD
killtrigger NOTURNS
killtrigger NOROUTE
killtrigger TWARP_LOCK
killtrigger NO_TWRP_LOCK
killtrigger TWARP_ADJ
killtrigger NO_FUEL
send "n* z* "
setsectorparameter $WARPTO "FIGSEC" FALSE
setvar $MSG "No fighters at T-warp point!"
goto :TWARPDONE
:TWARPIGD

killtrigger THERE
killtrigger ADJ_WARP
killtrigger LOCKING
killtrigger IGD
killtrigger NOTURNS
killtrigger NOROUTE
killtrigger TWARP_LOCK
killtrigger NO_TWRP_LOCK
killtrigger TWARP_ADJ
killtrigger NO_FUEL
setvar $MSG "My ship is being held by Interdictor!"
goto :TWARPDONE
:TWARPPHOTONED

killtrigger THERE
killtrigger ADJ_WARP
killtrigger LOCKING
killtrigger IGD
killtrigger NOTURNS
killtrigger NOROUTE
killtrigger TWARP_LOCK
killtrigger NO_TWRP_LOCK
killtrigger TWARP_ADJ
killtrigger NO_FUEL
setvar $MSG "I have been photoned and can not T-warp!"
goto :TWARPDONE
:TWARP_LOCK

killtrigger THERE
killtrigger ADJ_WARP
killtrigger LOCKING
killtrigger IGD
killtrigger NOTURNS
killtrigger NOROUTE
killtrigger TWARP_LOCK
killtrigger NO_TWRP_LOCK
killtrigger TWARP_ADJ
killtrigger NO_FUEL
setsectorparameter $WARPTO "FIGSEC" TRUE
send "y* "

setvar $MSG "T-warp completed."
setvar $TWARPSUCCESS TRUE
:TWARPDONE
if (($TWARPSUCCESS = TRUE) and (($WARPTO = $BACKDOOR) and ($ORIGINAL = $STARDOCK)))
  send "* m "&$STARDOCK&"*  za9999* * "
end

return
