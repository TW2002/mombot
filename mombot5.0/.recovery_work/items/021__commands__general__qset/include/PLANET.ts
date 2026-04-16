:PLANET~GETPLANETINFO









setvar $PLANET~CURRENT_SECTOR 0
setvar $PLANET~PLANET 0
setvar $PLANET~PLANET_FUEL 0
setvar $PLANET~PLANET_FUEL_MAX 0
setvar $PLANET~PLANET_ORGANICS 0
setvar $PLANET~PLANET_ORGANICS_MAX 0
setvar $PLANET~PLANET_EQUIPMENT 0
setvar $PLANET~PLANET_EQUIPMENT_MAX 0
setvar $PLANET~PLANET_FIGHTERS 0
setvar $PLANET~PLANET_FIGHTERS_MAX 0
setvar $PLANET~CITADEL 0
setvar $PLANET~CITADEL_CREDITS 0
setvar $PLANET~ATMOSPHERE_CANNON 0
setvar $PLANET~SECTOR_CANNON 0



send "*"
settextlinetrigger PLANETINFO2 :PLANETINFO2 "Planet #"
pause
:PLANET~PLANETINFO2

setvar $PLANET~CITADEL 0
setvar $PLANET~SECTOR_CANNON 0
setvar $PLANET~ATMOSPHERE_CANNON 0
setvar $PLANET~CITADEL_CREDITS 0
getword CURRENTLINE $PLANET~PLANET 2
striptext $PLANET~PLANET "#"
getword CURRENTLINE $PLANET~CURRENT_SECTOR 5
striptext $PLANET~CURRENT_SECTOR ":"
waitfor "2 Build 1   Product    Amount     Amount     Maximum"
:PLANET~GETPLANETSTUFF

settextlinetrigger FUELSTART :FUELSTART "Fuel Ore"
settextlinetrigger ORGSTART :ORGSTART "Organics"
settextlinetrigger EQUIPSTART :EQUIPSTART "Equipment"
settextlinetrigger FIGSTART :FIGSTART "Fighters        N/A"
settextlinetrigger CITADELSTART :CITADELSTART "Planet has a level"
settextlinetrigger CANNON :CANNONSTART ", AtmosLvl="
settexttrigger PLANETINFODONE :PLANETINFODONE "Planet command (?=help)"
pause
:PLANET~FUELSTART

getword CURRENTLINE $PLANET~PLANET_FUEL 6
getword CURRENTLINE $PLANET~PLANET_FUEL_MAX 8
striptext $PLANET~PLANET_FUEL ","
striptext $PLANET~PLANET_FUEL_MAX ","
pause
:PLANET~ORGSTART

getword CURRENTLINE $PLANET~PLANET_ORGANICS 5
getword CURRENTLINE $PLANET~PLANET_ORGANICS_MAX 7
striptext $PLANET~PLANET_ORGANICS ","
striptext $PLANET~PLANET_ORGANICS_MAX ","
pause
:PLANET~EQUIPSTART

getword CURRENTLINE $PLANET~PLANET_EQUIPMENT 5
getword CURRENTLINE $PLANET~PLANET_EQUIPMENT_MAX 7
striptext $PLANET~PLANET_EQUIPMENT ","
striptext $PLANET~PLANET_EQUIPMENT_MAX ","
pause
:PLANET~FIGSTART

getword CURRENTLINE $PLANET~PLANET_FIGHTERS 5
getword CURRENTLINE $PLANET~PLANET_FIGHTERS_MAX 7
striptext $PLANET~PLANET_FIGHTERS ","
striptext $PLANET~PLANET_FIGHTERS_MAX ","
pause
:PLANET~CITADELSTART

getword CURRENTLINE $PLANET~CITADEL 5
getword CURRENTLINE $PLANET~CITADEL_CREDITS 9
striptext $PLANET~CITADEL_CREDITS ","
pause
:PLANET~CANNONSTART

getword CURRENTLINE $PLANET~ATMOSPHERE_CANNON 5
getword CURRENTLINE $PLANET~SECTOR_CANNON 6
striptext $PLANET~SECTOR_CANNON "SectLvl="
striptext $PLANET~SECTOR_CANNON "%"
striptext $PLANET~ATMOSPHERE_CANNON "AtmosLvl="
striptext $PLANET~ATMOSPHERE_CANNON "%"
striptext $PLANET~ATMOSPHERE_CANNON ","
pause
:PLANET~PLANETINFODONE
killtrigger CITADELSTART
killtrigger CANNON

setvar $PLANET~CURRENTBOTPLANET $PLANET~PLANET
savevar $PLANET~CURRENTBOTPLANET
return
:PLANET~LANDINGSUB







send "l" $PLANET~PLANET "*z  n  z  n  *  "
setvar $PLANET~SUCESSFULCITADEL FALSE
setvar $PLANET~SUCESSFULPLANET FALSE
settextlinetrigger NOPLANET :NOPLANET "There isn't a planet in this sector."
settextlinetrigger NO_LAND :NO_LAND "since it couldn't possibly stand"
settextlinetrigger PLANET :PLANET "Planet #"
settextlinetrigger WRONGONE :WRONG_NUM "That planet is not in this sector."
pause
:PLANET~NOPLANET
killtrigger NO_LAND
killtrigger PLANET
killtrigger WRONGONE
setvar $SWITCHBOARD~MESSAGE "No Planet in Sector!*"
gosub :SWITCHBOARD~SWITCHBOARD
return
:PLANET~NO_LAND
killtrigger NOPLANET
killtrigger PLANET
killtrigger WRONGONE
setvar $SWITCHBOARD~MESSAGE "This ship cannot land!*"
gosub :SWITCHBOARD~SWITCHBOARD
return
:PLANET~PLANET
getword CURRENTLINE $PLANET~PNUM_CK 2
striptext $PLANET~PNUM_CK "#"
if ($PLANET~PNUM_CK <> $PLANET~PLANET)
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
:PLANET~WRONG_NUM
killtrigger PLANET
send "**"
setvar $SWITCHBOARD~MESSAGE "Incorrect Planet Number*"
gosub :SWITCHBOARD~SWITCHBOARD
return
:PLANET~PLANET_PROMPT
killtrigger WRONG_NUM
setvar $PLANET~CURRENTBOTPLANET $PLANET~PLANET
savevar $PLANET~CURRENTBOTPLANET
savevar $PLANET~PLANET
send "c*"
settexttrigger BUILD_CIT :BUILD_CIT "Do you wish to construct one?"
settexttrigger IN_CIT :IN_CIT "Citadel command"
settexttrigger NOCITALLOWED :BUILD_CIT "Citadels are not allowed in FedSpace."
settexttrigger CITNOTBUILTYET :BUILD_CIT "Be patient, your Citadel is not yet finished."
pause
:PLANET~BUILD_CIT
killtrigger IN_CIT
killtrigger NOCITALLOWED
killtrigger BUILD_CIT
killtrigger CITNOTBUILTYET
setvar $PLANET~SUCESSFULPLANET TRUE
setvar $PLANET~STARTINGLOCATION "Planet"
return
:PLANET~IN_CIT
killtrigger IN_CIT
killtrigger NOCITALLOWED
killtrigger BUILD_CIT
killtrigger CITNOTBUILTYET
setvar $PLANET~SUCESSFULCITADEL TRUE
setvar $PLANET~STARTINGLOCATION "Citadel"
return
