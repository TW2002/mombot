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
loadvar $COMMAND
:FIGMOVE
:MOVEFIG


killalltriggers
gosub :QUIKSTATS
setvar $STARTINGLOCATION $CURRENT_PROMPT
setvar $TOTAL_MOVED 0
getword $USER_COMMAND_LINE $PARM1 1
getword $USER_COMMAND_LINE $PARM2 2

if (($PARM2 = "p") or ($PARM2 = "s"))
  setvar $MOVETOSECTOR $PARM2
  isnumber $TEST $PARM1
  if ($TEST or ($PARM1 = "all"))
    if ($TEST)
      setvar $MOVE $PARM1
    end
  else
    send "'{" $BOT_NAME "} - Please use movefig [p/s] [fighter amount]*"
    halt
  end
elseif (($PARM1 = "p") or ($PARM1 = "s"))
  setvar $MOVETOSECTOR $PARM1
  isnumber $TEST $PARM2
  if ($TEST or ($PARM2 = "all"))
    if ($TEST)
      setvar $MOVE $PARM2
    end
  else
    send "'{" $BOT_NAME "} - Please use movefig [p/s] [fighter amount]*"
    halt
  end
else
  send "'{" $BOT_NAME "} - Please use movefig [p/s] [fighter amount]*"
  halt
end
getwordpos $USER_COMMAND_LINE $POS " all"
setvar $ALLPLANETS FALSE
if (($POS > 0) and ($MOVETOSECTOR = "s"))
  setvar $ALLPLANETS TRUE
end
if ($STARTINGLOCATION = "Citadel")
  send "q"
elseif ($STARTINGLOCATION <> "Planet")
  send "'{" $BOT_NAME "} - You must start this script from a planet!* "
  halt
end
send "mnl*"
gosub :QUIKSTATS
gosub :GETPLANETINFO
setvar $SECTOR_FIGS 0
send "q  q  z  n  **   "
waiton "Warps to Sector(s) :"
waiton "Command [TL"
gosub :QUIKSTATS

if ($ALLPLANETS)
  gosub :COUNTPLANETS
else
  setvar $PLANETCOUNT 1
  setvar $PLANETS[1] $PLANET
end
setvar $FIGOWNER SECTOR.FIGS.OWNER[$CURRENT_SECTOR]
setvar $FIGQUANT SECTOR.FIGS.QUANTITY[$CURRENT_SECTOR]

setvar $SECTOR_FIGS $FIGQUANT
setvar $STARTING_PLANET $PLANET

if (($FIGQUANT <> 0) and (($FIGOWNER <> "belong to your Corp") and ($FIGOWNER <> "yours")))
  send "l "&$PLANET&"*"
  waiton "Planet command (?=help) [D]"
  if ($STARTINGLOCATION = "Citadel")
    send "c"
    waiton "Citadel command"
  end
  send "'{" $BOT_NAME "} - Friendly Fighters Not Present!*"
  halt
end

setvar $PLANET_FIGS_ROOM $PLANET_FIGHTERS_MAX
subtract $PLANET_FIGS_ROOM $PLANET_FIGHTERS

gosub :GETSHIPSTATS

setvar $I 1
while ($I <= $PLANETCOUNT)

  if ($ALLPLANETS)
    setvar $MOVE 0
  end
  send "l " $PLANETS[$I] "*"
  waiton "Planet command (?=help) [D]"
  gosub :GETPLANETINFO
  :START

  killalltriggers
  if ($MOVETOSECTOR = "s")
    if ($MOVE = 0)
      setvar $MOVE $PLANET_FIGHTERS
      setvar $TOTAL_MOVED 0
    end
    setvar $END_FIGS $SECTOR_FIGS
    add $END_FIGS $MOVE
    if ($MOVE > $PLANET_FIGHTERS)
      send "'{" $BOT_NAME "} - Not Enough Figs on Planet*"
      if ($STARTINGLOCATION = "Citadel")
        send "c "
      end
      halt
    end
    while ($TOTAL_MOVED < $MOVE)
      add $SECTOR_FIGS $SHIP_FIGHTERS_MAX
      if ($SECTOR_FIGS > $END_FIGS)
        setvar $SECTOR_FIGS $END_FIGS
      end
      send "m  n  t  *  q  f z " $SECTOR_FIGS "*  z c d  *  l " $PLANETS[$I] "*  "
      add $TOTAL_MOVED $SHIP_FIGHTERS_MAX
    end
    send "q q * "
  end
  if ($MOVETOSECTOR = "p")
    if ($MOVE = 0)
      setvar $MOVE $SECTOR_FIGS
      subtract $MOVE 500
    end
    setvar $END_FIGS $MOVE
    if ($PLANET_FIGS_ROOM < $MOVE)
      setvar $MOVE $PLANET_FIGS_ROOM
    end
    send "m n l * "
    while ($MOVE > $SHIP_FIGHTERS_MAX)
      subtract $SECTOR_FIGS $SHIP_FIGHTERS_MAX
      send "q f z " $SECTOR_FIGS "* z c d  *  l " $PLANETS[$I] "* m n l * "
      subtract $MOVE $SHIP_FIGHTERS_MAX
    end
    subtract $SECTOR_FIGS $MOVE
    if ($SECTOR_FIGS <> 0)
      send "q  f  z " $SECTOR_FIGS "*  z  c  d  * l " $PLANETS[$I] "*  m  n  l  * "
    else
      send "q  f  z * l " $PLANETS[$I] "*  m  n  l * "
    end
  end

  add $I 1
end
gosub :QUIKSTATS
if ($CURRENT_PROMPT = "Planet")
  send "m*  *  **  q q * * "
end
setvar $PLANET $STARTING_PLANET
gosub :LANDINGSUB

send "'{" $BOT_NAME "} - fighters moved*"
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
send "m* * * c"
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
:COUNTPLANETS



setvar $PLANETCOUNT 0
killalltriggers
settextlinetrigger PLANETGRABBER :PLANETLINE "   <"
settextlinetrigger BEDONE :DONE "Land on which planet "
send "lq*"
pause
:PLANETLINE
killalltriggers
getwordpos CURRENTLINE $POS "<<<< ("
if ($POS <= 0)
  setvar $LINE CURRENTLINE
  replacetext $LINE "<" " "
  replacetext $LINE ">" " "
  striptext $LINE ","
  add $PLANETCOUNT 1
  getword $LINE $PLANETS[$PLANETCOUNT] 1
end
settextlinetrigger GETLINE2 :PLANETLINE "   <"
settextlinetrigger GETEND :DONE "Land on which planet "
pause
:DONE
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
:GETSHIPSTATS


send "c;q"
settextlinetrigger GETSHIPOFFENSE :SHIPOFFENSEODDS "Offensive Odds: "
settextlinetrigger GETSHIPFIGHTERS :SHIPMAXFIGSPERATTACK " TransWarp Drive:   "
settextlinetrigger GETSHIPMINES :SHIPMAXMINES " Mine Max:  "
pause
:SHIPOFFENSEODDS

getwordpos CURRENTANSILINE $POS "[0;31m:[1;36m1"
if ($POS > 0)
  gettext CURRENTANSILINE $SHIP_OFFENSIVE_ODDS "Offensive Odds[1;33m:[36m " "[0;31m:[1;36m1"
  striptext $SHIP_OFFENSIVE_ODDS "."
  striptext $SHIP_OFFENSIVE_ODDS " "
  gettext CURRENTANSILINE $SHIP_FIGHTERS_MAX "Max Fighters[1;33m:[36m" "[0;32m Offensive Odds"
  striptext $SHIP_FIGHTERS_MAX ","
  striptext $SHIP_FIGHTERS_MAX " "
end
pause
:SHIPMAXMINES
gettext CURRENTLINE $SHIP_MINES_MAX "Mine Max:" "Beacon Max:"
striptext $SHIP_MINES_MAX " "
pause
:SHIPMAXFIGSPERATTACK

getwordpos CURRENTANSILINE $POS "[0m[32m Max Figs Per Attack[1;33m:[36m"
if ($POS > 0)
  gettext CURRENTANSILINE $SHIP_MAX_ATTACK "[0m[32m Max Figs Per Attack[1;33m:[36m" "[0;32mTransWarp"
  striptext $SHIP_MAX_ATTACK " "
end
killtrigger GETSHIPOFFENCE
killtrigger GETSHIPFIGHTERS
killtrigger GETSHIPMINES
return
