loadvar $BOT_NAME
loadvar $PARM1
loadvar $USER_COMMAND_LINE
loadvar $BOT_TURN_LIMIT
loadvar $PARM2
loadvar $PARM3
loadvar $PARM4
loadvar $PARM5
:MOVER

killalltriggers
setvar $STUFFMOVED ""
setvar $ROUNDS 0
gosub :QUIKSTATS
setvar $STARTLOCATION $CURRENT_PROMPT
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
  send "'{" $BOT_NAME "} - Please use move [f/o/e/fc/oc/ec/] [planet] [rounds] format*"
  halt
end
isnumber $TEST $PARM2
if ($TEST = FALSE)
  send "'{" $BOT_NAME "} - Mover Planet Parameter in-valid*"
  halt
end
isnumber $TEST $PARM3
if ($TEST = FALSE)
  send "'{" $BOT_NAME "} - Mover Rounds Parameter in-valid*"
  halt
elseif ($PARM3 <= 0)
  send "'{" $BOT_NAME "} - Must choose more than 0 rounds to move*"
  halt
end
if ($STARTLOCATION = "Citadel")
  send "q"
end
gosub :GETPLANETINFO
:STARTMOVER

if ($STUFFMOVED = "Fighters")
  goto :MOVEFIGHTERS
elseif (($STUFFMOVED = "Fuel") or ($STUFFMOVED = "Fuel Colonists"))
  setvar $STUFF 1
elseif (($STUFFMOVED = "Organics") or ($STUFFMOVED = "Organic Colonists"))
  setvar $STUFF 2
elseif (($STUFFMOVED = "Equipment") or ($STUFFMOVED = "Equipment Colonists"))
  setvar $STUFF 3
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

if ($ROUNDS <= $PARM3)
  send "t  n  t  "&$STUFF&"*  q  l "&$PARM2&"*  t  n  l "&$STUFF&"*  q  l "&$PLANET&"*  "
  add $ROUNDS 1
  goto :MOVEPRODUCT
elseif ($ROUNDS < 1)
  goto :MOVEDONE
end
:MOVECOLONISTS

if ($ROUNDS <= $PARM3)
  send "s  n  t  "&$STUFF&"*  q  l "&$PARM2&"*  s  n  l "&$STUFF&"*  q  l "&$PLANET&"*  "
  add $ROUNDS 1
  goto :MOVECOLONISTS
elseif ($ROUNDS < 1)
  goto :MOVEDONE
end
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
send "'{" $BOT_NAME "} - Moved "&$PARM3&" loads of "&$STUFFMOVED&" from "&$PLANET&" to "&$PARM2&".*"
halt
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
:GETINFO


setvar $PHOTONS 0
setvar $SCAN_TYPE "None"
setvar $TWARP_TYPE 0
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
getword CURRENTLINE $EXPERIENCE 5
getword CURRENTLINE $ALIGNMENT 7
striptext $EXPERIENCE ","
striptext $ALIGNMENT ","
striptext $ALIGNMENT "Alignment="
pause
:GETCORP
getword CURRENTLINE $CORP 3
striptext $CORP ","
setvar $CORPSTRING "["&$CORP&"]"
pause
:GETSHIPTYPE
getwordpos CURRENTLINE $SHIPTYPEEND "Ported="
subtract $SHIPTYPEEND 18
cuttext CURRENTLINE $SHIP_TYPE 18 $SHIPTYPEEND
pause
:GETTPW
getword CURRENTLINE $TURNS_PER_WARP 5
pause
:GETSECT
getword CURRENTLINE $CURRENT_SECTOR 4
pause
:GETTURNS
getword CURRENTLINE $TURNS 4
if ($TURNS = "Unlimited")
  setvar $TURNS 65000
  setvar $UNLIMITEDGAME TRUE
end
savevar $UNLIMITEDGAME
pause
:GETHOLDS
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
pause
:GETFIGHTERS
getword CURRENTLINE $FIGHTERS 3
striptext $FIGHTERS ","
pause
:GETSHIELDS
getword CURRENTLINE $SHIELDS 4
striptext $SHIELDS ","
pause
:GETPHOTONS
getword CURRENTLINE $PHOTONS 3
pause
:GETSCANTYPE
getword CURRENTLINE $SCAN_TYPE 4
pause
:GETTWARPTYPE1
getword CURRENTLINE $TWARP_1_RANGE 4
setvar $TWARP_TYPE 1
pause
:GETTWARPTYPE2
getword CURRENTLINE $TWARP_2_RANGE 4
setvar $TWARP_TYPE 2
pause
:GETCREDITS
getword CURRENTLINE $CREDITS 3
striptext $CREDITS ","
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
