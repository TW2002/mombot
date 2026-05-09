
logging off
gosub :LOADVARS~LOADVARS

gosub :HELP~INITIALIZE
setVar $HELP~HELP[1]  $HELP~TAB&"MOVE - Product Mover"
setVar $HELP~HELP[2]  $HELP~TAB&" "
setVar $HELP~HELP[3]  $HELP~TAB&"    move [type] [planet] [rounds]"
setVar $HELP~HELP[4]  $HELP~TAB&" "
setVar $HELP~HELP[5]  $HELP~TAB&"    [type] - use [f]uel, [o]rg, [e]quip"
setVar $HELP~HELP[6]  $HELP~TAB&"    [type] - use [fc] fuel colo, [oc] org colo, [ec] equip colo"
setVar $HELP~HELP[7]  $HELP~TAB&"    [planet] planet to move to"
setVar $HELP~HELP[8]  $HELP~TAB&"    [rounds] number of rounds to move product / colonists"
gosub :HELP~HELPFILE

killalltriggers
setvar $STUFFMOVED ""
setvar $ROUNDS 0
setvar $moveextra 0
gosub :PLAYER~QUIKSTATS
setvar $STARTLOCATION $PLAYER~CURRENT_PROMPT
if (($STARTLOCATION <> "Citadel") and ($STARTLOCATION <> "Planet"))
  setvar $switchboard~message "Mover must be run from Citadel or Planet prompt.*"
  gosub :switchboard~switchboard
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
  setvar $switchboard~message "Please use move [f/o/e/fc/oc/ec/] [planet] {[rounds]|[amount]} format*"
  gosub :switchboard~switchboard
  halt
end
isnumber $TEST $PARM2
if ($TEST = FALSE)
  setvar $switchboard~message "Mover Planet Parameter in-valid*"
  gosub :switchboard~switchboard
  halt
end
setvar $moveall FALSE
isnumber $TEST $PARM3
if ($TEST = FALSE)
  if ($PARM3 = "")
    setvar $moveall TRUE
  else
    setvar $switchboard~message "Mover Rounds Parameter in-valid*"
    gosub :switchboard~switchboard
    halt
  end
elseif ($PARM3 <= 0)
  setvar $switchboard~message "Must choose more than 0 rounds to move*"
  gosub :switchboard~switchboard
  halt
elseif ($PARM3 > 1000)
  gosub :PLAYER~QUIKSTATS
  if ($PLAYER~TOTAL_HOLDS <= 0)
    setvar $switchboard~message "Unable to determine ship holds from stats.*"
    gosub :switchboard~switchboard
    halt
  end
  setvar $MOVEHOLDS ($PARM3 / $PLAYER~TOTAL_HOLDS)
  setvar $moveextra ($PARM3 - ($PLAYER~TOTAL_HOLDS * $MOVEHOLDS))
  setvar $movetrips $MOVEHOLDS
  if ($moveextra > 0)
    add $movetrips 1
  end
  setvar $switchboard~message "Moving " & $movetrips & " holds (" & $PARM3 & " total).*"
  gosub :switchboard~switchboard
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
getwordpos $BOT~USER_COMMAND_LINE $POS "c"
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
  setvar $switchboard~message "Moved all "&$STUFFMOVED&" from "&$PLANET&" to "&$PARM2&".*"
  gosub :switchboard~switchboard
elseif ($PARM3 > 1000)
  setvar $switchboard~message "Moved "&$PARM3&" total "&$STUFFMOVED&" from "&$PLANET&" to "&$PARM2&".*"
  gosub :switchboard~switchboard
else
  setvar $switchboard~message "Moved "&$PARM3&" loads of "&$STUFFMOVED&" from "&$PLANET&" to "&$PARM2&".*"
  gosub :switchboard~switchboard
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

include "source\include\planet"
include "source\include\loadvars.ts"
include "source\include\help.ts"
include "source\include\switchboard.ts"
