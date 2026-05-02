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
include "source\include\ship"
:FIGMOVE
:MOVEFIG


killalltriggers
gosub :PLAYER~QUIKSTATS
setvar $STARTINGLOCATION $PLAYER~CURRENT_PROMPT
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
gosub :PLAYER~QUIKSTATS
gosub :PLANET~GETPLANETINFO
setvar $PLANET $PLANET~PLANET
setvar $SECTOR_FIGS 0
send "q  q  z  n  **   "
waiton "Warps to Sector(s) :"
waiton "Command [TL"
gosub :PLAYER~QUIKSTATS

if ($ALLPLANETS)
  gosub :COUNTPLANETS
else
  setvar $PLANETCOUNT 1
  setvar $PLANETS[1] $PLANET
end
setvar $FIGOWNER SECTOR.FIGS.OWNER[$PLAYER~CURRENT_SECTOR]
setvar $FIGQUANT SECTOR.FIGS.QUANTITY[$PLAYER~CURRENT_SECTOR]

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

setvar $PLANET_FIGS_ROOM $PLANET~PLANET_FIGHTERS_MAX
subtract $PLANET_FIGS_ROOM $PLANET~PLANET_FIGHTERS

gosub :GETSHIPSTATS

setvar $I 1
while ($I <= $PLANETCOUNT)

  if ($ALLPLANETS)
    setvar $MOVE 0
  end
  send "l " $PLANETS[$I] "*"
  waiton "Planet command (?=help) [D]"
  gosub :PLANET~GETPLANETINFO
  setvar $PLANET $PLANET~PLANET
  :START

  killalltriggers
  if ($MOVETOSECTOR = "s")
    if ($MOVE = 0)
      setvar $MOVE $PLANET~PLANET_FIGHTERS
      setvar $TOTAL_MOVED 0
    end
    setvar $END_FIGS $SECTOR_FIGS
    add $END_FIGS $MOVE
    if ($MOVE > $PLANET~PLANET_FIGHTERS)
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
gosub :PLAYER~QUIKSTATS
if ($PLAYER~CURRENT_PROMPT = "Planet")
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
:GETSHIPSTATS
gosub :SHIP~GETSHIPSTATS
setvar $SHIP_OFFENSIVE_ODDS $SHIP~SHIP_OFFENSIVE_ODDS
setvar $SHIP_FIGHTERS_MAX $SHIP~SHIP_FIGHTERS_MAX
setvar $SHIP_MINES_MAX $SHIP~SHIP_MINES_MAX
setvar $SHIP_MAX_ATTACK $SHIP~SHIP_MAX_ATTACK
return
