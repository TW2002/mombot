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
goto :FIGMOVE
include "source\include\planet"
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
goto :QUIKSTATS_PLAYER_INCLUDE
include "source\include\player"
:QUIKSTATS_PLAYER_INCLUDE
:QUIKSTATS
gosub :PLAYER~QUIKSTATS
setvar $CURRENT_PROMPT $PLAYER~CURRENT_PROMPT
setvar $CURRENT_SECTOR $PLAYER~CURRENT_SECTOR
setvar $TURNS $PLAYER~TURNS
setvar $CREDITS $PLAYER~CREDITS
setvar $FIGHTERS $PLAYER~FIGHTERS
setvar $SHIELDS $PLAYER~SHIELDS
setvar $TOTAL_HOLDS $PLAYER~TOTAL_HOLDS
setvar $ORE_HOLDS $PLAYER~ORE_HOLDS
setvar $ORGANIC_HOLDS $PLAYER~ORGANIC_HOLDS
setvar $EQUIPMENT_HOLDS $PLAYER~EQUIPMENT_HOLDS
setvar $COLONIST_HOLDS $PLAYER~COLONIST_HOLDS
setvar $PHOTONS $PLAYER~PHOTONS
setvar $ARMIDS $PLAYER~ARMIDS
setvar $LIMPETS $PLAYER~LIMPETS
setvar $GENESIS $PLAYER~GENESIS
setvar $TWARP_TYPE $PLAYER~TWARP_TYPE
setvar $CLOAKS $PLAYER~CLOAKS
setvar $BEACONS $PLAYER~BEACONS
setvar $ATOMIC $PLAYER~ATOMIC
setvar $CORBO $PLAYER~CORBO
setvar $EPROBES $PLAYER~EPROBES
setvar $MINE_DISRUPTORS $PLAYER~MINE_DISRUPTORS
setvar $PSYCHIC_PROBE $PLAYER~PSYCHIC_PROBE
setvar $PLANET_SCANNER $PLAYER~PLANET_SCANNER
setvar $SCAN_TYPE $PLAYER~SCAN_TYPE
setvar $ALIGNMENT $PLAYER~ALIGNMENT
setvar $EXPERIENCE $PLAYER~EXPERIENCE
setvar $CORP $PLAYER~CORP
setvar $CORPNUMBER $PLAYER~CORPNUMBER
setvar $SHIP_NUMBER $PLAYER~SHIP_NUMBER
setvar $SHIP_TYPE $PLAYER~SHIP_TYPE
setvar $FULL_CURRENT_PROMPT $PLAYER~FULL_CURRENT_PROMPT
setvar $FEDSPACE $PLAYER~FEDSPACE
setvar $SELF_DESTRUCT_PROMPT $PLAYER~SELF_DESTRUCT_PROMPT
return
:GETPLANETINFO
gosub :PLANET~GETPLANETINFO
setvar $PLANET $PLANET~PLANET
setvar $CURRENT_SECTOR $PLANET~CURRENT_SECTOR
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
