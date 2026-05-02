loadvar $BOT_NAME
loadvar $PARM1
loadvar $USER_COMMAND_LINE
loadvar $BOT_TURN_LIMIT
loadvar $PARM2
loadvar $PARM3
loadvar $PARM4
loadvar $PARM5
goto :MOVER
include "source\include\planet"
:MOVER

killalltriggers
setvar $STUFFMOVED ""
setvar $ROUNDS 0
setvar $moveextra 0
gosub :PLAYER~QUIKSTATS
echo "total_holds: " $PLAYER~TOTAL_HOLDS "*"
setvar $STARTLOCATION $PLAYER~CURRENT_PROMPT
if (($STARTLOCATION <> "Citadel") and ($STARTLOCATION <> "Planet"))
  send "'{" $BOT_NAME "} - Mover must be run from Citadel or Planet prompt.*"
  halt
end
if ($PARM1 = "f")
  setvar $STUFFMOVED "Fuel"
elseif ($PARM1 = "o")
  setvar $STUFFMOVED "Organics"
elseif ($PARM1 = "e")
  setvar $STUFFMOVED "Equipment"
elseif ($PARM1 = "fc")
  setvar $STUFFMOVED "Fuel Colonists"
elseif ($PARM1 = "oc")
  setvar $STUFFMOVED "Organic Colonists"
elseif ($PARM1 = "ec")
  setvar $STUFFMOVED "Equipment Colonists"
else
  send "'{" $BOT_NAME "} - Please use move [f/o/e/fc/oc/ec/] [planet] {[rounds]|[amount]} format*"
  halt
end
isnumber $TEST $PARM2
if ($TEST = FALSE)
  send "'{" $BOT_NAME "} - Mover Planet Parameter in-valid*"
  halt
end
setvar $moveall FALSE
isnumber $TEST $PARM3
if ($TEST = FALSE)
  if ($PARM3 = "")
    setvar $moveall TRUE
  else
    send "'{" $BOT_NAME "} - Mover Rounds Parameter in-valid*"
    halt
  end
elseif ($PARM3 <= 0)
  send "'{" $BOT_NAME "} - Must choose more than 0 rounds to move*"
  halt
elseif ($PARM3 > 1000)
  gosub :PLAYER~QUIKSTATS
  if ($PLAYER~TOTAL_HOLDS <= 0)
    send "'{" $BOT_NAME "} - Unable to determine ship holds from stats.*"
    halt
  end
  setvar $MOVEHOLDS ($PARM3 / $PLAYER~TOTAL_HOLDS)
  setvar $moveextra ($PARM3 - ($PLAYER~TOTAL_HOLDS * $MOVEHOLDS))
  setvar $movetrips $MOVEHOLDS
  if ($moveextra > 0)
    add $movetrips 1
  end
  send "'{" $BOT_NAME "} - Moving " & $movetrips & " holds (" & $PARM3 & " total).*"
else
   setvar $MOVEHOLDS $PARM3
   setvar $moveextra 0
end
if ($STARTLOCATION = "Citadel")
  send "q"
end

:STARTMOVER

gosub :GETPLANETINFO
if (($moveall = TRUE) and (($STUFFMOVED = "Fuel Colonists") or ($STUFFMOVED = "Organic Colonists") or ($STUFFMOVED = "Equipment Colonists")))
  gosub :GETPLANETCOLONISTINFO
end
if ($STUFFMOVED = "Fighters")
  goto :MOVEFIGHTERS
elseif (($STUFFMOVED = "Fuel") or ($STUFFMOVED = "Fuel Colonists"))
  setvar $STUFF 1
  if ($moveall = TRUE)
    if ($STUFFMOVED = "Fuel Colonists")
      setvar $MOVEHOLDS ($PLANET_FUEL_COLONISTS / $PLAYER~TOTAL_HOLDS)
      setvar $moveextra $PLANET_FUEL_COLONISTS - ($MOVEHOLDS * $PLAYER~TOTAL_HOLDS)
    else
      setvar $MOVEHOLDS ($PLANET_FUEL / $PLAYER~TOTAL_HOLDS)
      setvar $moveextra $PLANET_FUEL - ($MOVEHOLDS * $PLAYER~TOTAL_HOLDS)
    end
  end
elseif (($STUFFMOVED = "Organics") or ($STUFFMOVED = "Organic Colonists"))
  setvar $STUFF 2
  if ($moveall = TRUE)
    if ($STUFFMOVED = "Organic Colonists")
      setvar $MOVEHOLDS ($PLANET_ORGANICS_COLONISTS / $PLAYER~TOTAL_HOLDS)
      setvar $moveextra $PLANET_ORGANICS_COLONISTS - ($MOVEHOLDS * $PLAYER~TOTAL_HOLDS)
    else
      setvar $MOVEHOLDS ($PLANET_ORGANICS / $PLAYER~TOTAL_HOLDS)
      setvar $moveextra $PLANET_ORGANICS - ($MOVEHOLDS * $PLAYER~TOTAL_HOLDS)
    end
  end
elseif (($STUFFMOVED = "Equipment") or ($STUFFMOVED = "Equipment Colonists"))
  setvar $STUFF 3
  if ($moveall = TRUE)
    if ($STUFFMOVED = "Equipment Colonists")
      setvar $MOVEHOLDS ($PLANET_EQUIPMENT_COLONISTS / $PLAYER~TOTAL_HOLDS)
      setvar $moveextra $PLANET_EQUIPMENT_COLONISTS - ($MOVEHOLDS * $PLAYER~TOTAL_HOLDS)
    else
      setvar $MOVEHOLDS ($PLANET_EQUIPMENT / $PLAYER~TOTAL_HOLDS)
      setvar $moveextra $PLANET_EQUIPMENT - ($MOVEHOLDS * $PLAYER~TOTAL_HOLDS)
    end
  end
end
getwordpos $USER_COMMAND_LINE $POS "c"
if ($POS > 0)
  send "q  j  y l "&$PLANET&" *  "
  goto :MOVECOLONISTS
else
  send "q  j  y l "&$PLANET&" *  "
  goto :MOVEPRODUCT
end

:MOVEPRODUCT
#echo "moveholds " $MOVEHOLDS " rounds " $ROUNDS "*"
if ($ROUNDS >= $MOVEHOLDS)
  goto :MOVEPRODUCTEXTRA
end
send "t  n  t  "&$STUFF&"*  q  l "&$PARM2&"*  t  n  l "&$STUFF&"*  q  l "&$PLANET&"*  "
add $ROUNDS 1
goto :MOVEPRODUCT

:MOVEPRODUCTEXTRA
if ($moveextra <= 0)
  goto :MOVEDONE
end
send "t  n  t  "&$STUFF&" "&$moveextra&"*  q  l "&$PARM2&"*  t  n  l "&$STUFF&"*  q  l "&$PLANET&"*  "
goto :MOVEDONE

:MOVECOLONISTS
if ($ROUNDS >= $MOVEHOLDS)
  goto :MOVECOLONISTSEXTRA
end
send "s  n  t  "&$STUFF&"*  q  l "&$PARM2&"*  s  n  l "&$STUFF&"*  q  l "&$PLANET&"*  "
add $ROUNDS 1
goto :MOVECOLONISTS

:MOVECOLONISTSEXTRA
if ($moveextra <= 0)
  goto :MOVEDONE
end
send "s  n  t  "&$STUFF&" "&$moveextra&"*  q  l "&$PARM2&"*  s  n  l "&$STUFF&"*  q  l "&$PLANET&"*  "
goto :MOVEDONE

:MOVEFIGHTERS
if ($ROUNDS <= $PARM3)
  send "m  n  *  *  q  l  "&$PARM2&"*  m  n  l  *  q  l  "&$PLANET&"*  "
  add $ROUNDS 1
  goto :MOVEFIGHTERS
elseif ($ROUNDS < 1)
  goto :MOVEDONE
end
:MOVEDONE

if ($STARTLOCATION = "Citadel")
  send "c"
end
if ($moveall = TRUE)
  send "'{" $BOT_NAME "} - Moved all "&$STUFFMOVED&" from "&$PLANET&" to "&$PARM2&".*"
elseif ($PARM3 > 1000)
  send "'{" $BOT_NAME "} - Moved "&$PARM3&" total "&$STUFFMOVED&" from "&$PLANET&" to "&$PARM2&".*"
else
  send "'{" $BOT_NAME "} - Moved "&$PARM3&" loads of "&$STUFFMOVED&" from "&$PLANET&" to "&$PARM2&".*"
end
halt
:GETINFO
gosub :PLAYER~GETINFO
setvar $TRADER_NAME $PLAYER~TRADER_NAME
setvar $CORPSTRING $PLAYER~CORPSTRING
setvar $IGSTAT $PLAYER~IGSTAT
setvar $TURNS_PER_WARP $PLAYER~TURNS_PER_WARP
setvar $TWARP_1_RANGE $PLAYER~TWARP_1_RANGE
setvar $TWARP_2_RANGE $PLAYER~TWARP_2_RANGE
setvar $EMPTY_HOLDS $PLAYER~EMPTY_HOLDS
gosub :VALIDATION

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
:GETPLANETCOLONISTINFO
gosub :PLANET~GETPLANETINFO
setvar $PLANET_FUEL_COLONISTS $PLANET~PLANET_FUEL_COLONISTS
setvar $PLANET_ORGANICS_COLONISTS $PLANET~PLANET_ORGANICS_COLONISTS
setvar $PLANET_EQUIPMENT_COLONISTS $PLANET~PLANET_EQUIPMENT_COLONISTS
return
killtrigger CITADELSTART
killtrigger CANNON

return
:SETPLANETNUMBER




getwordpos RAWPACKET $POS "Planet "&#27&"[1;33m#"&#27&"[36m"
if ($POS > 0)
  gettext RAWPACKET $PLANET "Planet "&#27&"[1;33m#"&#27&"[36m" #27&"[0;32m in sector "
end
settextlinetrigger GETPLANETNUMBER :SETPLANETNUMBER " in sector "
pause
:SETSHIPOFFENSIVEODDS





getwordpos CURRENTANSILINE $POS "[0;31m:[1;36m1"
if ($POS > 0)
  gettext CURRENTANSILINE $SHIP_OFFENSIVE_ODDS "Offensive Odds[1;33m:[36m " "[0;31m:[1;36m1"
  striptext $SHIP_OFFENSIVE_ODDS "."
  striptext $SHIP_OFFENSIVE_ODDS " "
  gettext CURRENTANSILINE $SHIP_FIGHTERS_MAX "Max Fighters[1;33m:[36m" "[0;32m Offensive Odds"
  striptext $SHIP_FIGHTERS_MAX ","
  striptext $SHIP_FIGHTERS_MAX " "
end
settextlinetrigger GETSHIPSTATS :SETSHIPOFFENSIVEODDS "Offensive Odds: "
pause
:SETSHIPMAXFIGATTACK


getwordpos CURRENTANSILINE $POS "[0m[32m Max Figs Per Attack[1;33m:[36m"
if ($POS > 0)
  gettext CURRENTANSILINE $SHIP_MAX_ATTACK "[0m[32m Max Figs Per Attack[1;33m:[36m" "[0;32mTransWarp"
  striptext $SHIP_MAX_ATTACK " "
end
settextlinetrigger GETSHIPMAXFIGHTERS :SETSHIPMAXFIGATTACK " TransWarp Drive:   "
pause
