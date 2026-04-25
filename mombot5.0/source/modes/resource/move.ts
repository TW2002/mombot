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
    goto :STARTMOVER
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
include "source\include\player"
:GETINFO


setvar $PLAYER~PHOTONS 0
setvar $PLAYER~SCAN_TYPE "None"
setvar $PLAYER~TWARP_TYPE 0
setvar $CORPSTRING "[0]"
setvar $IGSTAT 0
send "I"
waiton "<Info>"

settextlinetrigger GETTRADERNAME :GETTRADERNAME "Trader Name    :"
settextlinetrigger GETEXPANDALIGN :GETEXPANDALIGN "Rank and Exp"
settextlinetrigger GETCORP :GETCORP "Corp           #"
settextlinetrigger GETSHIPTYPE :GETSHIPTYPE "Ship Info      :"
settextlinetrigger GETTPW :GETTPW "Turns to Warp  :"
settextlinetrigger GETSECT :GETSECT "Current Sector :"
settextlinetrigger GETTURNS :GETTURNS "Turns left"
settextlinetrigger GETHOLDS :GETHOLDS "Total Holds"
settextlinetrigger GETFIGHTERS :GETFIGHTERS "Fighters       :"
settextlinetrigger GETSHIELDS :GETSHIELDS "Shield points  :"
settextlinetrigger GETPHOTONS :GETPHOTONS "Photon Missiles:"
settextlinetrigger GETSCANTYPE :GETSCANTYPE "LongRange Scan :"
settextlinetrigger GETTWARPTYPE1 :GETTWARPTYPE1 "  (Type 1 Jump):"
settextlinetrigger GETTWARPTYPE2 :GETTWARPTYPE2 "  (Type 2 Jump):"
settextlinetrigger GETCREDITS :GETCREDITS "Credits"
settextlinetrigger CHECKIG :CHECKIG "Interdictor ON :"
settexttrigger GETINFODONE :GETINFODONE "Command [TL="
settexttrigger GETINFODONE2 :GETINFODONE "Citadel command"
pause
:GETTRADERNAME
setvar $TRADER_NAME CURRENTLINE
striptext $TRADER_NAME "Trader Name    : "
striptext $TRADER_NAME "3rd Class "
striptext $TRADER_NAME "2nd Class "
striptext $TRADER_NAME "1st Class "
striptext $TRADER_NAME "Nuisance "
striptext $TRADER_NAME "Menace "
striptext $TRADER_NAME "Smuggler Savant "
striptext $TRADER_NAME "Smuggler "
striptext $TRADER_NAME "Robber "
striptext $TRADER_NAME "Private "
striptext $TRADER_NAME "Lance Corporal "
striptext $TRADER_NAME "Corporal "
striptext $TRADER_NAME "Staff Sergeant "
striptext $TRADER_NAME "Gunnery Sergeant "
striptext $TRADER_NAME "1st Sergeant "
striptext $TRADER_NAME "Sergeant Major "
striptext $TRADER_NAME "Sergeant "
striptext $TRADER_NAME "Chief Warrant Officer "
striptext $TRADER_NAME "Warrant Officer "
striptext $TRADER_NAME "Terrorist "
striptext $TRADER_NAME "Infamous Pirate "
striptext $TRADER_NAME "Notorious Pirate "
striptext $TRADER_NAME "Dread Pirate "
striptext $TRADER_NAME "Pirate "
striptext $TRADER_NAME "Galactic Scourge "
striptext $TRADER_NAME "Enemy of the State "
striptext $TRADER_NAME "Enemy of the People "
striptext $TRADER_NAME "Enemy of Humankind "
striptext $TRADER_NAME "Heinous Overlord "
striptext $TRADER_NAME "Prime Evil "
striptext $TRADER_NAME "Ensign "
striptext $TRADER_NAME "Lieutenant J.G. "
striptext $TRADER_NAME "Lieutenant Commander "
striptext $TRADER_NAME "Lieutenant "
striptext $TRADER_NAME "Commander "
striptext $TRADER_NAME "Captain "
striptext $TRADER_NAME "Commodore "
striptext $TRADER_NAME "Rear Admiral "
striptext $TRADER_NAME "Vice Admiral "
striptext $TRADER_NAME "Fleet Admiral "
striptext $TRADER_NAME "Admiral "
striptext $TRADER_NAME "Civilian "
striptext $TRADER_NAME "Annoyance "



pause
:GETEXPANDALIGN
getword CURRENTLINE $PLAYER~EXPERIENCE 5
getword CURRENTLINE $PLAYER~ALIGNMENT 7
striptext $PLAYER~EXPERIENCE ","
striptext $PLAYER~ALIGNMENT ","
striptext $PLAYER~ALIGNMENT "Alignment="
pause
:GETCORP
getword CURRENTLINE $PLAYER~CORP 3
striptext $PLAYER~CORP ","
setvar $CORPSTRING "["&$PLAYER~CORP&"]"
pause
:GETSHIPTYPE
getwordpos CURRENTLINE $SHIPTYPEEND "Ported="
subtract $SHIPTYPEEND 18
cuttext CURRENTLINE $PLAYER~SHIP_TYPE 18 $SHIPTYPEEND
pause
:GETTPW
getword CURRENTLINE $TURNS_PER_WARP 5
pause
:GETSECT
getword CURRENTLINE $PLAYER~CURRENT_SECTOR 4
pause
:GETTURNS
getword CURRENTLINE $PLAYER~TURNS 4
if ($PLAYER~TURNS = "Unlimited")
  setvar $PLAYER~TURNS 65000
  setvar $UNLIMITEDGAME TRUE
end
savevar $UNLIMITEDGAME
pause
:GETHOLDS
setvar $LINE CURRENTLINE
getword $LINE $PLAYER~TOTAL_HOLDS 4
getwordpos $LINE $TEXTPOS "Ore="
if ($TEXTPOS <> 0)
  cuttext CURRENTLINE $TEMP $TEXTPOS 100
  getword $TEMP $PLAYER~ORE_HOLDS 1
  striptext $PLAYER~ORE_HOLDS "Ore="
else
  setvar $PLAYER~ORE_HOLDS 0
end
getwordpos $LINE $TEXTPOS "Organics="
if ($TEXTPOS <> 0)
  cuttext CURRENTLINE $TEMP $TEXTPOS 100
  getword $TEMP $PLAYER~ORGANIC_HOLDS 1
  striptext $PLAYER~ORGANIC_HOLDS "Organics="
else
  setvar $PLAYER~ORGANIC_HOLDS 0
end
getwordpos $LINE $TEXTPOS "Equipment="
if ($TEXTPOS <> 0)
  cuttext CURRENTLINE $TEMP $TEXTPOS 100
  getword $TEMP $PLAYER~EQUIPMENT_HOLDS 1
  striptext $PLAYER~EQUIPMENT_HOLDS "Equipment="
else
  setvar $PLAYER~EQUIPMENT_HOLDS 0
end
getwordpos $LINE $TEXTPOS "Colonists="
if ($TEXTPOS <> 0)
  cuttext CURRENTLINE $TEMP $TEXTPOS 100
  getword $TEMP $PLAYER~COLONIST_HOLDS 1
  striptext $PLAYER~COLONIST_HOLDS "Colonists="
else
  setvar $PLAYER~COLONIST_HOLDS 0
end
getwordpos $LINE $TEXTPOS "Empty="
if ($TEXTPOS <> 0)
  cuttext CURRENTLINE $TEMP $TEXTPOS 100
  getword $TEMP $EMPTY_HOLDS 1
  striptext $EMPTY_HOLDS "Empty="
else
  setvar $EMPTY_HOLDS 0
end
pause
:GETFIGHTERS
getword CURRENTLINE $PLAYER~FIGHTERS 3
striptext $PLAYER~FIGHTERS ","
pause
:GETSHIELDS
getword CURRENTLINE $PLAYER~SHIELDS 4
striptext $PLAYER~SHIELDS ","
pause
:GETPHOTONS
getword CURRENTLINE $PLAYER~PHOTONS 3
pause
:GETSCANTYPE
getword CURRENTLINE $PLAYER~SCAN_TYPE 4
pause
:GETTWARPTYPE1
getword CURRENTLINE $TWARP_1_RANGE 4
setvar $PLAYER~TWARP_TYPE 1
pause
:GETTWARPTYPE2
getword CURRENTLINE $TWARP_2_RANGE 4
setvar $PLAYER~TWARP_TYPE 2
pause
:GETCREDITS
getword CURRENTLINE $PLAYER~CREDITS 3
striptext $PLAYER~CREDITS ","
if ($IGSTAT = 0)
  setvar $IGSTAT "NO IG"
end
pause
:CHECKIG
getword CURRENTLINE $IGSTAT 4
pause
:GETINFODONE

killtrigger GETINFODONE
killtrigger GETINFODONE2
killtrigger GETTRADERNAME
killtrigger GETEXPANDALIGN
killtrigger GETCORP
killtrigger GETSHIPTYPE
killtrigger GETTPW
killtrigger GETSECT
killtrigger GETTURNS
killtrigger GETHOLDS
killtrigger GETFIGHTERS
killtrigger GETSHIELDS
killtrigger GETPHOTONS
killtrigger GETSCANTYPE
killtrigger GETTWARPTYPE1
killtrigger GETTWARPTYPE2
killtrigger GETCREDITS
killtrigger CHECKIG
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
