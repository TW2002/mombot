reqrecording
logging "OFF"
loadvar $BOT_NAME
loadvar $UNLIMITEDGAME
loadvar $PTRADESETTING
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
loadvar $COMMAND
goto :FARM_START
include "source\include\planetinfo"
:FARM_START

fileexists $DOESHELPFILEEXIST "scripts\MOMBot\Help\"&$COMMAND&".txt"
if ($DOESHELPFILEEXIST <> TRUE)
  write "scripts\MOMBot\Help\"&$COMMAND&".txt" "- farm {set} {clear} {list}                                 "
  write "scripts\MOMBot\Help\"&$COMMAND&".txt" "    Visits sectors in list and farms the planets there.     "
  write "scripts\MOMBot\Help\"&$COMMAND&".txt" "       - default will visit all planets on the tl list       "
  write "scripts\MOMBot\Help\"&$COMMAND&".txt" "                                                            "
  write "scripts\MOMBot\Help\"&$COMMAND&".txt" "    [set] {sector1} {sector2} {...} {sectorx}               "
  write "scripts\MOMBot\Help\"&$COMMAND&".txt" "       - set puts sectors in the order you enter into a file"
  write "scripts\MOMBot\Help\"&$COMMAND&".txt" "    [clear]                                                 "
  write "scripts\MOMBot\Help\"&$COMMAND&".txt" "       - clear deletes the farm file                        "
  write "scripts\MOMBot\Help\"&$COMMAND&".txt" "    [list]                                                  "
  write "scripts\MOMBot\Help\"&$COMMAND&".txt" "       - show lists of all sectors in the farm file in order"
  send "'{" $BOT_NAME "} - Writing help file for this command in Help directory.*"
end
setvar $FARMER_FILE "_"&GAMENAME&"_FARMER.list"

getwordpos $USER_COMMAND_LINE $POS "silent"
if ($POS > 0)
  setvar $SILENT TRUE
else
  setvar $SILENT FALSE
end
getwordpos $PARM1 $POS "clear"
if ($POS > 0)
  delete $FARMER_FILE
  send "'{" $BOT_NAME "} - Bot Farming File has been deleted.*"
  halt
end
getwordpos $PARM1 $POS "list"
if ($POS > 0)
  fileexists $TEST $FARMER_FILE
  if ($TEST)
    readtoarray $FARMER_FILE $SECTOR
    setvar $I 1
    setvar $LIST_OUTPUT ""
    while ($I < $SECTOR)
      setvar $LIST_OUTPUT $LIST_OUTPUT&$SECTOR[$I]&","
      add $I 1
    end
    setvar $LIST_OUTPUT $LIST_OUTPUT&$SECTOR[$I]
    send "'*{" $BOT_NAME "} - Farming List (In traveling order) *"&$LIST_OUTPUT&"**"
  else
    send "'{" $BOT_NAME "} - No Farming File to list from.*"
  end
  halt
end
getwordpos $PARM1 $POS "set"
if ($POS > 0)
  setvar $I 2
  getword $USER_COMMAND_LINE $CHECK $I "%%%"
  while ($CHECK <> "%%%")
    isnumber $TEST $CHECK
    if ($TEST)
      if (($CHECK > 0) and ($CHECK <= SECTORS))
        write $FARMER_FILE $CHECK
      end
    end
    add $I 1
    getword $USER_COMMAND_LINE $CHECK $I "%%%"
  end
  send "'{" $BOT_NAME "} - "&($I - 2)&" Sectors added to Bot Farming File.*"
  halt
end
setvar $I 1
setarray $PLANETS 3000
quikstats
if (CURRENTPLANETSCANNER = "No")
  send "'{" $BOT_NAME "} - Planet Farmer must be run with a planet scanner.*"
  halt
end
if (CURRENTPROMPT <> "Citadel")
  send "'{" $BOT_NAME "} - Planet Farmer must be run from the Citadel Prompt.*"
  halt
end
fileexists $TEST $FARMER_FILE
if ($TEST)
  send "'{" $BOT_NAME "} - Loading Planet List From Farming File...*"
  readtoarray $FARMER_FILE $SECTOR
else
  setvar $SECTOR SECTORS
  setarray $SECTOR SECTORS
  send "'{" $BOT_NAME "} - No Farming File, Loading Planet List...*"
  gosub :GET_TL_LIST
end

send "'{" $BOT_NAME "} - Planet List Loaded, starting the farming!*"
quikstats
setvar $HOME CURRENTSECTOR
gosub :PLANET_INFO
:START

killalltriggers
goto :MOVE_THE_PLANET
:GET_TL_LIST

setvar $SECTORCOUNT 0
killalltriggers
gosub :SETCONNECTIONTRIGGERS
settextlinetrigger SECTORGRABBER :SECTOR_PLANET_LINE "Class "
settextlinetrigger SECTORBEDONE :SECTOR_DONE "======   ============"
send "xlq"
pause
:SECTOR_PLANET_LINE
killalltriggers
add $SECTORCOUNT 1
getword CURRENTLINE $TESTSECTOR 1
setvar $SECTOR[$SECTORCOUNT] $TESTSECTOR
gosub :SETCONNECTIONTRIGGERS
settextlinetrigger GETLINE2 :SECTOR_PLANET_LINE "Class"
settextlinetrigger GETEND :SECTOR_DONE "======   ============"
pause
:SECTOR_DONE
send "@"
setvar $SECTOR $SECTORCOUNT
gosub :SETCONNECTIONTRIGGERS
waiton "Average Interval Lag:"

return
:PLANET_INFO

send "qd"
gosub :SETCONNECTIONTRIGGERS
waiton "Planet #"
getword CURRENTLINE $PLANETTOFILL 2
striptext $PLANETTOFILL "#"
send "snl1*snl2*snl3*tnl1*tnl2*tnl3*  q  j  y  l " $PLANETTOFILL "*  c"
return
:MOVE_THE_PLANET

setvar $I 1
:INAC
:TRYAGAIN

while ($I <= $SECTOR)
  while (($SECTOR[$I] <= 0) and ($I <= $SECTOR))
    add $I 1
    if ($I > $SECTOR)
      goto :END
    end
  end

  send "p "&$SECTOR[$I]&"  *ys* "
  gosub :SETCONNECTIONTRIGGERS
  settextlinetrigger WARP_IT :WARP_IT "All Systems Ready, shall we engage?"
  settextlinetrigger NO_WARP :NO_WARP "You do not have any fighters in Sector"
  settextlinetrigger ALREADYTHERE :WARP_IT "You are already in that sector!"
  pause
  :NO_WARP
  killalltriggers
  add $I 1
  goto :TRYAGAIN
  :WARP_IT
  killalltriggers
  gosub :COUNT_PLANETS
  gosub :STRIPALLPLANETS
  if ($SILENT <> TRUE)
    send "'{" $BOT_NAME "} - Done farming sector " $SECTOR[$I] ".*"
  end
  send "q"
  gosub :GETPLANETINFO
  send "c"
  add $I 1
  if (($PLANETORG > ($PLANETORGMAX - 1000)) and ($PLANETEQUIP > ($PLANETEQUIPMAX - 1000)))
    setvar $PLANETISFULL TRUE
    goto :END
  end
end
goto :END
:COUNT_PLANETS
send "q  q  q  z  n  *|l"
gosub :SETCONNECTIONTRIGGERS
waiton "Registry# and Planet Name"
setvar $PLANETCOUNT 0
killalltriggers
gosub :SETCONNECTIONTRIGGERS
settextlinetrigger PLANETGRABBER :PLANETLINE "   <"
settextlinetrigger BEDONE :DONE "Land on which planet "
settextlinetrigger NOPLANETS :DONE "You can create one with a Genesis Torpedo."
send "q* |"
pause
:PLANETLINE
killalltriggers
setvar $LINE CURRENTLINE
replacetext $LINE "<" " "
replacetext $LINE ">" " "
striptext $LINE ","
add $PLANETCOUNT 1
getword $LINE $PLANETS[$PLANETCOUNT] 1
gosub :SETCONNECTIONTRIGGERS
settextlinetrigger GETLINE2 :PLANETLINE "   <"
settextlinetrigger GETEND :DONE "Land on which planet "
pause
:DONE
killalltriggers
return
:STRIPALLPLANETS

setvar $J 1
send "q q * * jy * "
while ($J <= $PLANETCOUNT)
  if ($PLANETTOFILL <> $PLANETS[$J])
    :TRYFUEL
    killalltriggers

    send "l j "&#8&#8&$PLANETS[$J]&"* * "
    settexttrigger NOPLANET :DONEWITHTHISPLANET "That planet is not in this sector."
    settexttrigger PLANETHERE :CONTINUEFUEL "Planet command (?=help)"
    pause
    :CONTINUEFUEL
    killalltriggers
    send "tnt1*q l "&$PLANETTOFILL&"* tnl1*q "
    gosub :SETCONNECTIONTRIGGERS
    settexttrigger FUELSUCCESS :TRYFUEL "You load the "
    settexttrigger FUELEMPTY :EMPTYFUEL "There aren't that many "
    settexttrigger FUELFULL :EMPTYFUEL "They don't have room for that many "
    pause
    :EMPTYFUEL

    send "l "&$PLANETS[$J]&"* tnl1*q jy "
    send "@"
    waiton "Average Interval Lag:"
    :TRYORGANICS
    killalltriggers

    send "l "&$PLANETS[$J]&"* tnt2*q l "&$PLANETTOFILL&"* tnl2*q "
    gosub :SETCONNECTIONTRIGGERS
    settexttrigger SUCCESS :TRYORGANICS "You load the "
    settexttrigger EMPTYEMPTY :EMPTYORGANICS "There aren't that many "
    settexttrigger FULLFILL :EMPTYORGANICS "They don't have room for that many "
    pause
    :EMPTYORGANICS

    send "l "&$PLANETS[$J]&"* tnl2*q jy "
    send "@"
    waiton "Average Interval Lag:"
    :TRYEQUIPMENT
    killalltriggers

    send "l "&$PLANETS[$J]&"* tnt3*q l "&$PLANETTOFILL&"* tnl3*q "
    gosub :SETCONNECTIONTRIGGERS
    settexttrigger SUCCESS :TRYEQUIPMENT "You load the "
    settexttrigger EMPTYEMPTY :EMPTYEQUIPMENT "There aren't that many "
    settexttrigger FULLFILL :EMPTYEQUIPMENT "They don't have room for that many "
    pause
    :EMPTYEQUIPMENT

    send "l "&$PLANETS[$J]&"* tnl3*q jy "
    send "@"
    waiton "Average Interval Lag:"
    :TRYFUELCOLONISTS

    killalltriggers
    if ($EMPTYFUELCOLONISTS)
      send "l "&$PLANETS[$J]&"* snt1*q l "&$PLANETTOFILL&"* snl"&$COLOTYPE&"*q "
      gosub :SETCONNECTIONTRIGGERS
      settexttrigger SUCCESS :TRYFUELCOLONISTS "The Colonists disembark to "
      settexttrigger EMPTYEMPTY :SWITCHFUEL "There isn't room on the planet"
      settexttrigger FULLFILL :TRYORGANICCOLONISTS "They don't have room for that many "
      settexttrigger EMPTY :TRYORGANICCOLONISTS "There aren't that many on the planet!"
      pause
      :SWITCHFUEL
      killalltriggers
      add $COLOTYPE 1
      if ($COLOTYPE >= 4)
        goto :DONEWITHTHISPLANET
      end
      goto :TRYFUELCOLONISTS
    end
    :TRYORGANICCOLONISTS
    killalltriggers
    if ($EMPTYORGANICCOLONISTS)
      send "l "&$PLANETS[$J]&"* snt2*q l "&$PLANETTOFILL&"* snl"&$COLOTYPE&"*q "
      gosub :SETCONNECTIONTRIGGERS
      settexttrigger SUCCESS :TRYORGANICCOLONISTS "The Colonists disembark to "
      settexttrigger EMPTYEMPTY :SWITCHORGANICS "There isn't room on the planet"
      settexttrigger FULLFILL :TRYEQUIPMENTCOLONISTS "They don't have room for that many "
      settexttrigger EMPTY :TRYEQUIPMENTCOLONISTS "There aren't that many on the planet!"
      pause
      :SWITCHORGANICS
      killalltriggers
      add $COLOTYPE 1
      if ($COLOTYPE >= 4)
        goto :DONEWITHTHISPLANET
      end
      goto :TRYORGANICCOLONISTS
    end
    :TRYEQUIPMENTCOLONISTS
    killalltriggers
    if ($EMPTYEQUIPMENTCOLONISTS)
      send "l "&$PLANETS[$J]&"* snt3*q l "&$PLANETTOFILL&"* snl"&$COLOTYPE&"*q "
      gosub :SETCONNECTIONTRIGGERS
      settexttrigger SUCCESS :TRYEQUIPMENTCOLONISTS "The Colonists disembark to "
      settexttrigger EMPTYEMPTY :SWITCHEQUIPMENT "There isn't room on the planet"
      settexttrigger FULLFILL :TRYFIGHTERS "They don't have room for that many "
      settexttrigger EMPTY :TRYFIGHTERS "There aren't that many on the planet!"
      pause
      :SWITCHEQUIPMENT
      killalltriggers
      add $COLOTYPE 1
      if ($COLOTYPE >= 4)
        goto :DONEWITHTHISPLANET
      end
      goto :TRYFIGHTERS
    end
    :TRYFIGHTERS

    killalltriggers
    send "l "&$PLANETS[$J]&"* m***q l "&$PLANETTOFILL&"* m*l* q "
    gosub :SETCONNECTIONTRIGGERS
    waiton "Do you wish to (L)eave or (T)ake Fighters? [T]"
    waiton " Max) ["
    getword CURRENTLINE $FIGSTOGRAB 9
    striptext $FIGSTOGRAB "("
    if ($FIGSTOGRAB < 100)
      goto :DONEWITHTHISPLANET
    end
    goto :TRYFIGHTERS
    :DONEWITHTHISPLANET
    killalltriggers
  end

  add $J 1
end
send "l "&$PLANETTOFILL&"* c"
return
:END
killalltriggers
send "p "&$HOME&"  *ys* "
if ($PLANETISFULL)
  send "'{" $BOT_NAME "} - Farming Planet is full.  Ready to sell off the product!*"
else
  send "'{" $BOT_NAME "} - Farming run is complete.*"
end
quikstats
if (CURRENTSECTOR <> $HOME)
  send "'{" $BOT_NAME "} - Could not make it back to starting sector!*"
end
halt
:BUY


killalltriggers
:VERIFYPROMPT


setvar $OUTPUT ""
setvar $EQUIPROUNDS 0
setvar $ORGROUNDS 0
setvar $FUELROUNDS 0
setvar $BUYDOWNROUNDSFROMPARAM 999999
setvar $BUYDOWN_MODE 1
setvar $BUYDOWN_EQUIPROUNDS 0
setvar $BUYDOWN_ORGROUNDS 0
setvar $BUYDOWN_FUELROUNDS $BUYDOWNROUNDSFROMPARAM
send "Q"
send "t n l 1* t n l 2* t n l 3* s n l1*"
gosub :SETCONNECTIONTRIGGERS
waitfor "How many groups of Colonists do you want to leave"
gosub :GETPLANETINFO
send "C s* "
gosub :GETINFO
if ($TOTAL_HOLDS <> $EMPTY_HOLDS)

  if ($LOCATION <> "Citadel")
    send "L "&$PLANETTOFILL&"* "
  end
  setvar $EXIT_MESSAGE "Planet full, cannot empty ship holds"
  goto :BUYDOWNEXIT
end
gosub :GETPORTINFO
if ($LOCATION = "Citadel")
  send "Q"
else
  send "L "&$PLANETTOFILL&"* "
end
setdelaytrigger INITPAUSE :INITPAUSE 500
gosub :SETCONNECTIONTRIGGERS
pause
:INITPAUSE
:GETINPUTS



setvar $TURNS_NEEDED 0
setvar $TURNS_ALLOWED $TURNS
subtract $TURNS_ALLOWED 1




if ($BUYDOWN_FUELROUNDS > 0)
  setvar $FUELROUNDS 0
  setvar $PLANETFUELROOM $PLANETFUELMAX
  subtract $PLANETFUELROOM $PLANETFUEL
  setvar $MAXFUELTOBUY $FUELSELLING
  if ($FUELSELLING > $PLANETFUELROOM)
    setvar $MAXFUELTOBUY $PLANETFUELROOM
  end
  setvar $MAXFUELROUNDS $MAXFUELTOBUY
  divide $MAXFUELROUNDS $TOTAL_HOLDS
  if ($MAXFUELROUNDS > $TURNS_ALLOWED)
    setvar $MAXFUELROUNDS $TURNS_ALLOWED
  end
  if ($MAXFUELROUNDS > $BUYDOWN_FUELROUNDS)
    setvar $MAXFUELROUNDS $BUYDOWN_FUELROUNDS
  end
  if ($MAXFUELROUNDS > 0)
    setvar $FUELROUNDS $MAXFUELROUNDS
  end
  add $TURNS_NEEDED $FUELROUNDS
  subtract $TURNS_ALLOWED $FUELROUNDS
end

if ($BUYDOWN_ORGROUNDS > 0)
  setvar $ORGROUNDS 0
  setvar $PLANETORGROOM $PLANETORGMAX
  subtract $PLANETORGROOM $PLANETORG
  setvar $MAXORGTOBUY $ORGSELLING
  if ($ORGSELLING > $PLANETORGROOM)
    setvar $MAXORGTOBUY $PLANETORGROOM
  end
  setvar $MAXORGROUNDS $MAXORGTOBUY
  divide $MAXORGROUNDS $TOTAL_HOLDS
  if ($MAXORGROUNDS > $TURNS_ALLOWED)
    setvar $MAXORGROUNDS $TURNS_ALLOWED
  end
  if ($MAXORGROUNDS > $BUYDOWN_ORGROUNDS)
    setvar $MAXORGROUNDS $BUYDOWN_ORGROUNDS
  end
  if ($MAXORGROUNDS > 0)
    setvar $ORGROUNDS $MAXORGROUNDS
  end

  add $TURNS_NEEDED $ORGROUNDS
  subtract $TURNS_ALLOWED $ORGROUNDS
end

if ($BUYDOWN_EQUIPROUNDS > 0)
  setvar $EQUIPROUNDS 0
  setvar $PLANETEQUIPROOM $PLANETEQUIPMAX
  subtract $PLANETEQUIPROOM $PLANETEQUIP
  setvar $MAXEQUIPTOBUY $EQUIPSELLING
  if ($EQUIPSELLING > $PLANETEQUIPROOM)
    setvar $MAXEQUIPTOBUY $PLANETEQUIPROOM
  end
  setvar $MAXEQUIPROUNDS $MAXEQUIPTOBUY
  divide $MAXEQUIPROUNDS $TOTAL_HOLDS
  if ($MAXEQUIPROUNDS > $TURNS_ALLOWED)
    setvar $MAXEQUIPROUNDS $TURNS_ALLOWED
  end
  if ($MAXEQUIPROUNDS > $BUYDOWN_EQUIPROUNDS)
    setvar $MAXEQUIPROUNDS $BUYDOWN_EQUIPROUNDS
  end
  if ($MAXEQUIPROUNDS > 0)
    setvar $EQUIPROUNDS $MAXEQUIPROUNDS
  end

  add $TURNS_NEEDED $EQUIPROUNDS
  subtract $TURNS_ALLOWED $EQUIPROUNDS
end
if (($FUELROUNDS = 0) and (($ORGROUNDS = 0) and ($EQUIPROUNDS = 0)))
  if ($LOCATION = "Citadel")
    send "C "
  else
    send "q "
  end
  setvar $EXIT_MESSAGE "Nothing to buy"
  goto :BUYDOWNEXIT
end
:GETMODE

if ($BUYDOWN_MODE = 1)
  setvar $BUYDOWN_MODE "Speedbuy"
elseif ($BUYDOWN_MODE = 2)
  setvar $BUYDOWN_MODE "Best Price"
elseif ($BUYDOWN_MODE = 3)
  setvar $BUYDOWN_MODE "Worst Price"

end
setvar $FUELROUNDSLEFT $FUELROUNDS
setvar $ORGROUNDSLEFT $ORGROUNDS
setvar $EQUIPROUNDSLEFT $EQUIPROUNDS
setvar $FUEL_CREDS_NEEDED 0
setvar $ORG_CREDS_NEEDED 0
setvar $EQUIP_CREDS_NEEDED 0


if ($FUELROUNDS > 0)
  setvar $FUEL_CREDS_NEEDED $FUELROUNDS
  multiply $FUEL_CREDS_NEEDED $TOTAL_HOLDS
  multiply $FUEL_CREDS_NEEDED 30
  if ($BUYDOWN_MODE = "Worst Price")
    multiply $FUEL_CREDS_NEEDED 3
    divide $FUEL_CREDS_NEEDED 2
  end
end
if ($ORGROUNDS > 0)
  setvar $ORG_CREDS_NEEDED $ORGROUNDS
  multiply $ORG_CREDS_NEEDED $TOTAL_HOLDS
  multiply $ORG_CREDS_NEEDED 60
  if ($BUYDOWN_MODE = "Worst Price")
    multiply $ORG_CREDS_NEEDED 3
    divide $ORG_CREDS_NEEDED 2
  end
end
if ($EQUIPROUNDS > 0)
  setvar $EQUIP_CREDS_NEEDED $EQUIPROUNDS
  multiply $EQUIP_CREDS_NEEDED $TOTAL_HOLDS
  multiply $EQUIP_CREDS_NEEDED 100
  if ($BUYDOWN_MODE = "Worst Price")
    multiply $EQUIP_CREDS_NEEDED 3
    divide $EQUIP_CREDS_NEEDED 2
  end
end
setvar $TOTAL_CREDS_NEEDED 0
add $TOTAL_CREDS_NEEDED $FUEL_CREDS_NEEDED
add $TOTAL_CREDS_NEEDED $ORG_CREDS_NEEDED
add $TOTAL_CREDS_NEEDED $EQUIP_CREDS_NEEDED
setvar $STARTINGCREDITS $CREDITS
if ($TOTAL_CREDS_NEEDED > $CREDITS)
  setvar $CASHONHAND $CITADELCREDITS
  add $CASHONHAND $CREDITS
  if ($CASHONHAND > $TOTAL_CREDS_NEEDED)
    send "C"
    send "T T "&$CREDITS&"* "
    send "T F "&$TOTAL_CREDS_NEEDED&"* "
    setvar $CREDITS $TOTAL_CREDS_NEEDED
    send "Q"
  else
    if ($LOCATION = "Citadel")
      send "C "
    else
      send "q "
    end
    setvar $EXIT_MESSAGE "Not enough cash onhand"
    goto :BUYDOWNEXIT
  end
end

setvar $INIT_CREDITS $CREDITS
:BUYDOWNEQUIP

if ($EQUIPROUNDSLEFT > 0)
  send "Q P T  "
  if ($FUELSELLING > 0)
    send "0* "
  end
  if ($ORGSELLING > 0)
    send "0*"
  end
  gosub :CHOOSEHAGGLE
  send "L "&$PLANETTOFILL&"* t n l 3* "
  subtract $EQUIPROUNDSLEFT 1
  goto :BUYDOWNEQUIP
end
if ($EQUIPROUNDS > 0)
  if ($BUYDOWN_MODE = "Worst Price")
    setvar $OUTPUT $OUTPUT&" - Equipment overhaggled at "&$OVERHAGGLEMULTIPLE&"*"
  end
end
:BUYDOWNORG

if ($ORGROUNDSLEFT > 0)
  send "Q P T  "
  if ($FUELSELLING > 0)
    send "0*"
  end
  gosub :CHOOSEHAGGLE
  send "0* L "&$PLANETTOFILL&"* t n l 2* "
  subtract $ORGROUNDSLEFT 1
  goto :BUYDOWNORG
end
if ($ORGROUNDS > 0)
  if ($BUYDOWN_MODE = "Worst Price")
    setvar $OUTPUT $OUTPUT&" - Organics overhaggled at "&$OVERHAGGLEMULTIPLE&"*"
  end
end
:BUYDOWNFUEL

if ($FUELROUNDSLEFT > 0)
  send "Q P T "
  gosub :CHOOSEHAGGLE
  send "0* 0* L "&$PLANETTOFILL&"* t n l 1* "
  subtract $FUELROUNDSLEFT 1
  goto :BUYDOWNFUEL
end
if ($FUELROUNDS > 0)
  if ($BUYDOWN_MODE = "Worst Price")
    setvar $OUTPUT $OUTPUT&" - Fuel Ore overhaggled at "&$OVERHAGGLEMULTIPLE&"*"
  end
end
:BUYDOWNFINISH

if ($LOCATION = "Citadel")
  send "C "
else
  send "Q "
end
gosub :GETINFO
setvar $CREDITS_SPENT $INIT_CREDITS
subtract $CREDITS_SPENT $CREDITS
if ($LOCATION = "Planet")
  send "L "&$PLANETTOFILL&"* "
end
if ($CREDITS > $STARTINGCASH)
  if ($LOCATION = "Citadel")
    send "T T "&($CREDITS - $STARTINGCREDITS)&"* "
  end

  if ($LOCATION = "Planet")
    send "Q"
  end
end
:BUYDOWNEXIT


return
:GETPORTINFO






send "S*CR*Q"
gosub :SETCONNECTIONTRIGGERS
settextlinetrigger FOUNDPORT :FOUNDPORT2 "Items     Status  Trading % of max OnBoard"
settextlinetrigger NOPORT :NOPORT2 "I have no information about a port in that sector."
settextlinetrigger NOPORT2 :NOPORT2 "You have never visted sector"
settextlinetrigger NOPORT3 :NOPORT2 "credits / next hold"
pause
:NOPORT2

killalltriggers
if ($LOCATION <> "Citadel")
  send "L "&$PLANETTOFILL&"* "
end
setvar $EXIT_MESSAGE "No port found"
goto :BUYDOWNEXIT
:FOUNDPORT2

killalltriggers
setvar $FUELSELLING 0
setvar $ORGSELLING 0
setvar $EQUIPSELLING 0
:GETSELLING

settextlinetrigger PORTFUELINFO :PORTFUELINFO2 "Fuel Ore   Selling"
gosub :SETCONNECTIONTRIGGERS
settextlinetrigger PORTORGINFO :PORTORGINFO2 "Organics   Selling"
settextlinetrigger PORTEQUIPINFO :PORTEQUIPINFO2 "Equipment  Selling"
settextlinetrigger GOTALLPORTINFO :GOTALLPORTINFO2 "<Computer deactivated>"
pause
:PORTFUELINFO2

killalltriggers
getword CURRENTLINE $FUELSELLING 4
goto :GETSELLING
:PORTORGINFO2

killalltriggers
getword CURRENTLINE $ORGSELLING 3
goto :GETSELLING
:PORTEQUIPINFO2

killalltriggers
getword CURRENTLINE $EQUIPSELLING 3
goto :GETSELLING
:GOTALLPORTINFO2

killalltriggers
return
:GETPLANETINFO
gosub :SETCONNECTIONTRIGGERS
gosub :PLANETINFO~GETPLANETINFO
setvar $PLANETTOFILL $PLANETINFO~PLANET
setvar $CURRENT_SECTOR $PLANETINFO~CURRENT_SECTOR
setvar $PLANETFUEL $PLANETINFO~PLANET_FUEL
setvar $PLANETFUELMAX $PLANETINFO~PLANET_FUEL_MAX
setvar $PLANETORG $PLANETINFO~PLANET_ORGANICS
setvar $PLANETORGMAX $PLANETINFO~PLANET_ORGANICS_MAX
setvar $PLANETEQUIP $PLANETINFO~PLANET_EQUIPMENT
setvar $PLANETEQUIPMAX $PLANETINFO~PLANET_EQUIPMENT_MAX
setvar $PLANETFIG $PLANETINFO~PLANET_FIGHTERS
setvar $PLANETFIGMAX $PLANETINFO~PLANET_FIGHTERS_MAX
setvar $CITADEL $PLANETINFO~CITADEL
setvar $CITADELCREDITS $PLANETINFO~CITADEL_CREDITS
setvar $ACANNON $PLANETINFO~ATMOSPHERE_CANNON
setvar $SCANNON $PLANETINFO~SECTOR_CANNON
return
:GETINFO



setvar $PHOTONS 0
setvar $SCAN_TYPE "None"
setvar $TWARP_TYPE 0
setvar $CORPSTRING "[0]"
send "I"
waitfor "<Info>"
:WAITFORINFO
gosub :SETCONNECTIONTRIGGERS
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
settexttrigger GETINFODONE :GETINFODONE "Command [TL="
settexttrigger GETINFODONE2 :GETINFODONE "Citadel command"
pause
pause
:GETTRADERNAME
killalltriggers
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
goto :WAITFORINFO
:GETEXPANDALIGN
killalltriggers
getword CURRENTLINE $EXPERIENCE 5
getword CURRENTLINE $ALIGNMENT 7
striptext $EXPERIENCE ","
striptext $ALIGNMENT ","
striptext $ALIGNMENT "Alignment="
goto :WAITFORINFO
:GETCORP
killalltriggers
getword CURRENTLINE $CORP 3
striptext $CORP ","
setvar $CORPSTRING "["&$CORP&"]"
goto :WAITFORINFO
:GETSHIPTYPE
killalltriggers
getwordpos CURRENTLINE $SHIPTYPEEND "Ported="
subtract $SHIPTYPEEND 18
cuttext CURRENTLINE $SHIP_TYPE 18 $SHIPTYPEEND
goto :WAITFORINFO
:GETTPW
killalltriggers
getword CURRENTLINE $TURNS_PER_WARP 5
goto :WAITFORINFO
:GETSECT
killalltriggers
getword CURRENTLINE $CURRENT_SECTOR 4
goto :WAITFORINFO
:GETTURNS
killalltriggers
getword CURRENTLINE $TURNS 4
if ($TURNS = "Unlimited")
  setvar $TURNS 65000
  setvar $UNLIMITEDGAME TRUE
end
savevar $UNLIMITEDGAME
goto :WAITFORINFO
:GETHOLDS
killalltriggers
setvar $LINE CURRENTLINE
getword $LINE $TOTAL_HOLDS 4
getwordpos $LINE $TEXTPOS "Ore="
if ($TEXTPOS <> 0)
  cuttext CURRENTLINE $TEMP $TEXTPOS 100
  getword $TEMP $ORE_HOLDS 1
  striptext $ORE_HOLDS "Ore="
else
  setvar $ORE_HOLDS 0
end
getwordpos $LINE $TEXTPOS "Organics="
if ($TEXTPOS <> 0)
  cuttext CURRENTLINE $TEMP $TEXTPOS 100
  getword $TEMP $ORGANIC_HOLDS 1
  striptext $ORGANIC_HOLDS "Organics="
else
  setvar $ORGANIC_HOLDS 0
end
getwordpos $LINE $TEXTPOS "Equipment="
if ($TEXTPOS <> 0)
  cuttext CURRENTLINE $TEMP $TEXTPOS 100
  getword $TEMP $EQUIPMENT_HOLDS 1
  striptext $EQUIPMENT_HOLDS "Equipment="
else
  setvar $EQUIPMENT_HOLDS 0
end
getwordpos $LINE $TEXTPOS "Colonists="
if ($TEXTPOS <> 0)
  cuttext CURRENTLINE $TEMP $TEXTPOS 100
  getword $TEMP $COLONIST_HOLDS 1
  striptext $COLONIST_HOLDS "Colonists="
else
  setvar $COLONIST_HOLDS 0
end
getwordpos $LINE $TEXTPOS "Empty="
if ($TEXTPOS <> 0)
  cuttext CURRENTLINE $TEMP $TEXTPOS 100
  getword $TEMP $EMPTY_HOLDS 1
  striptext $EMPTY_HOLDS "Empty="
else
  setvar $EMPTY_HOLDS 0
end
goto :WAITFORINFO
:GETFIGHTERS
killalltriggers
getword CURRENTLINE $FIGHTERS 3
striptext $FIGHTERS ","
goto :WAITFORINFO
:GETSHIELDS
killalltriggers
getword CURRENTLINE $SHIELDS 4
striptext $SHIELDS ","
goto :WAITFORINFO
:GETPHOTONS
killalltriggers
getword CURRENTLINE $PHOTONS 3
goto :WAITFORINFO
:GETSCANTYPE
killalltriggers
getword CURRENTLINE $SCAN_TYPE 4
goto :WAITFORINFO
:GETTWARPTYPE1
killalltriggers
getword CURRENTLINE $TWARP_1_RANGE 4
setvar $TWARP_TYPE 1
goto :WAITFORINFO
:GETTWARPTYPE2
killalltriggers
getword CURRENTLINE $TWARP_2_RANGE 4
setvar $TWARP_TYPE 2
goto :WAITFORINFO
:GETCREDITS
killalltriggers
getword CURRENTLINE $CREDITS 3
striptext $CREDITS ","
goto :WAITFORINFO
:GETINFODONE
killalltriggers
return
:CHOOSEHAGGLE




if ($BUYDOWN_MODE = "Speedbuy")
  gosub :BUYNOHAGGLE
else
  gosub :BUYHAGGLE
end
return
:BUYHAGGLE



setvar $EMPTY $TOTAL_HOLDS
send "*"
gosub :SETCONNECTIONTRIGGERS
settextlinetrigger BUYFIRSTOFFER :BUYFIRSTOFFER "We'll sell them for"
pause
:BUYFIRSTOFFER

killalltriggers
getword CURRENTLINE $OFFER 5
striptext $OFFER ","

gosub :SWATHOFF
if ($SWATHOFF = 0)
  send "L "&$PLANET&"* "
  if ($LOCATION = "Citadel")
    send "C "
  end
  setvar $EXIT_MESSAGE $SWATHOFFMESSAGE
  goto :BUYDOWNEXIT
end


setvar $COUNTER $OFFER
if ($BUYDOWN_MODE = "Best Price")
  multiply $COUNTER 92
  divide $COUNTER 100
elseif ($BUYDOWN_MODE = "Worst Price")
  multiply $COUNTER $OVERHAGGLEMULTIPLE
  divide $COUNTER 100
end
send $COUNTER&"*"
:BUYOFFERLOOP
gosub :SETCONNECTIONTRIGGERS
settextlinetrigger BUYPRICE :BUYPRICE "We'll sell them for"
settextlinetrigger BUYFINALOFFER :BUYFINALOFFER "Our final offer"
settextlinetrigger BUYNOTINTERESTED :BUYNOTINTERESTED "We're not interested."
settextlinetrigger BUYEXPERIENCE :BUYEXPERIENCE "experience point(s)"
settextlinetrigger BUYEMPTY :BUYEMPTY "empty cargo holds"
settextlinetrigger BUYSCREWUP1 :BUYSCREWUP "Get real ion-brain, make me a real offer."
settextlinetrigger BUYSCREWUP2 :BUYSCREWUP "This is the big leagues Jr.  Make a real offer."
settextlinetrigger BUYSCREWUP3 :BUYSCREWUP "My patience grows short with you."
settextlinetrigger BUYSCREWUP4 :BUYSCREWUP "I have much better things to do than waste my time.  Try again."
settextlinetrigger BUYSCREWUP5 :BUYSCREWUP "HA! HA, ha hahahhah hehehe hhhohhohohohh!  You choke me up!"
settextlinetrigger BUYSCREWUP6 :BUYSCREWUP "Quit playing around, you're wasting my time!"
settextlinetrigger BUYSCREWUP7 :BUYSCREWUP "Make a real offer or get the "
settextlinetrigger BUYSCREWUP8 :BUYSCREWUP "WHAT?!@!? you must be crazy!"
settextlinetrigger BUYSCREWUP9 :BUYSCREWUP "So, you think I'm as stupid as you look? Make a real offer."
settextlinetrigger BUYSCREWUP10 :BUYSCREWUP "What do you take me for, a fool?  Make a real offer!"
pause
pause
:BUYSCREWUP
killalltriggers
if ($BUYDOWN_MODE = "Best Price")
  multiply $COUNTER 102
  divide $COUNTER 100
elseif ($BUYDOWN_MODE = "Worst Price")
  subtract $OVERHAGGLEMULTIPLE 1
  setvar $COUNTER $OFFER
  multiply $COUNTER $OVERHAGGLEMULTIPLE
  divide $COUNTER 100
end
send $COUNTER&"*"
goto :BUYOFFERLOOP
:BUYPRICE
killalltriggers
setvar $OLD_OFFER $OFFER
setvar $OLD_COUNTER $COUNTER
getword CURRENTLINE $OFFER 5
striptext $OFFER ","
setvar $OFFER_PCT $OFFER
multiply $OFFER_PCT 1000
divide $OFFER_PCT $OLD_OFFER
if ($OFFER_PCT > 990)
  setvar $OFFER_PCT 990
end
multiply $COUNTER 1000
divide $COUNTER $OFFER_PCT
if ($COUNTER <= $OLD_COUNTER)
  add $COUNTER 1
end
send $COUNTER&"*"
goto :BUYOFFERLOOP
:BUYFINALOFFER
killalltriggers
setvar $OLD_OFFER $OFFER
setvar $OLD_COUNTER $COUNTER
getword CURRENTLINE $OFFER 5
striptext $OFFER ","
setvar $OFFER_CHANGE $OFFER
subtract $OFFER_CHANGE $OLD_OFFER
subtract $OFFER_CHANGE 1
multiply $OFFER_CHANGE 25
divide $OFFER_CHANGE 10
subtract $COUNTER $OFFER_CHANGE
if ($COUNTER = $OLD_COUNTER)
  add $COUNTER 1
end
add $COUNTER 1
send $COUNTER&"*"
goto :BUYOFFERLOOP
:BUYNOTINTERESTED
killalltriggers
send "0* "
send "0* "
goto :BUYHAGGLEFAILED
:BUYEXPERIENCE
killalltriggers
getword CURRENTLINE $EXP_BONUS 7
add $EXP $EXP_BONUS
add $JETBONUS $EXP_BONUS
goto :BUYOFFERLOOP
:BUYEMPTY
killalltriggers
getword CURRENTLINE $CREDITS 3
striptext $CREDITS ","
setvar $OLDEMPTY $EMPTY
getword CURRENTLINE $EMPTY 6
if ($OLDEMPTY = $EMPTY)
  goto :BUYHAGGLEFAILED
else
  goto :BUYHAGGLESUCCEEDED
end
:BUYHAGGLEFAILED
setvar $BUYHAGGLE 0
return
:BUYHAGGLESUCCEEDED
setvar $BUYHAGGLE 1
return
:BUYNOHAGGLE




if ($SWATHOFF = 0)

  waitfor "How many holds of"
  send "*"
  gosub :SWATHOFF
  send "*"
else
  send "**"
end
add $CYCLEBUFFER 1
if ($CYCLEBUFFER = $CYCLEBUFFERLIMIT)
  setvar $CYCLEBUFFER 1
  send "/"
  waitfor " Sect "
end
return
:SWATHOFF

if ($SWATHOFF = FALSE)
  gosub :SETCONNECTIONTRIGGERS
  settexttrigger SWATHISON :SWATHISON "Command [TL="
  setdelaytrigger SWATHISOFF :SWATHISOFF 2000
  pause
  :SWATHISON

  killalltriggers
  setvar $SWATHOFFMESSAGE "Detected SWATH Autohaggle"
  setvar $SWATHOFF FALSE
  return
  :SWATHISOFF

  killalltriggers
  setvar $SWATHOFF TRUE
end
return
:DISCOD



setvar $TAGLINE "[Farmer]"
setvar $TAGLINEB "[Farmer]"
killalltriggers
echo "**"&ANSI_14&$TAGLINEB&ANSI_15&" Disconnected **"
:DISCO_TEST
if (CONNECTED <> TRUE)
  setdelaytrigger EMANCIPATE_CPU :EMANCIPATE_CPU 3000
  echo "**"&ANSI_14&$TAGLINEB&ANSI_15&" Auto Land & Resume Initiated - Awaiting Connection!**"
  pause
  :EMANCIPATE_CPU
  goto :DISCO_TEST
end
waitfor "(?="
setdelaytrigger WAITINGABIT :WAITINGABIT 3000
echo "**"&ANSI_14&$TAGLINEB&ANSI_15&" Connected - Waiting For Command Prompt!**"
pause
:WAITINGABIT
killalltriggers
quikstats
if (CURRENTPROMPT = "Command")
  send " L Z"&#8&$PLANETTOFILL&"*  *  J  C  *  "
  settextlinetrigger NOTLANDED :NOTLANDED "Are you sure you want to jettison all cargo?"
  settextlinetrigger LANDED :LANDED "<Enter Citadel>"
  setdelaytrigger TESTCONN :TESTCONN 3000
  pause
  :TESTCONN
  killalltriggers
  if (CONNECTED = FALSE)
    goto :DISCO_TEST
  else
    send "'{"&$BOT_NAME&"} - "&$TAGLINEB&" Problem Detected Unable to Land!*"
    halt
  end
  :NOTLANDED
  killalltriggers
  send "'{"&$BOT_NAME&"} - Boton Unable To Land, Check my TA.*"
  send "'{"&$BOT_NAME&"} "&$TAGLINEB&" - Unable To Land After Reconnect,Check My TA!**"
  halt
  :LANDED
  killalltriggers
  send "'{"&$BOT_NAME&"} "&$TAGLINEB&" - Restarting!**"
  waitfor "Message sent on sub-space channel"
  goto :INAC
elseif (CURRENTPROMPT = "Citadel")
  send "'{"&$BOT_NAME&"} "&$TAGLINEB&" - Restarting!**"
  waitfor "Message sent on sub-space channel"
  goto :INAC
else
  send " p d 0* 0* 0* * *** * c q q q q q z 2 2 c q * z * *** * * '"&$TAGLINEB&"Attempting to Reach Correct Prompt...*"
  settextlinetrigger EMQ_COMPLETE :EMQ_DELAY "Attempting to Reach Correct Prompt..."
  setdelaytrigger EMQ_DELAY :EMQ_DELAY 3000
  pause
  :EMQ_DELAY
  killalltriggers
  goto :DISCO_TEST
end
:SETCONNECTIONTRIGGERS

killtrigger DISCOD1
killtrigger DISCOD2
seteventtrigger DISCOD1 :DISCOD "CONNECTION LOST"
seteventtrigger DISCOD2 :DISCOD "Connections have been temporarily disabled."

return
