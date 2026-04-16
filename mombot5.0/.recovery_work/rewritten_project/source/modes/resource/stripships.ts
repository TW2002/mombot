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
gosub :QUIKSTATS
setvar $STARTSHIP $SHIP_NUMBER
setvar $STARTINGLOCATION $CURRENT_PROMPT
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
    gosub :QUIKSTATS
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
:QUIKSTATS



setvar $CURRENT_PROMPT "Undefined"
killtrigger NOPROMPT
killtrigger PROMPT
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
:TWARPTO



setvar $TWARPSUCCESS FALSE
setvar $ORIGINAL 1
if ($CURRENT_SECTOR = $WARPTO)
  setvar $MSG "Already in that sector!"
  goto :TWARPDONE
elseif (($WARPTO <= 0) or ($WARPTO > SECTORS))
  setvar $MSG "Destination sector is out of range!"
  goto :TWARPDONE
end
if (($ALIGNMENT < 1000) and (($WARPTO = $STARDOCK) and (($BACKDOOR > 10) and ($BACKDOOR <> $CURRENT_SECTOR))))
  setvar $ORIGINAL $WARPTO
  setvar $WARPTO $BACKDOOR
end
if ($TWARP_TYPE = "No")
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
