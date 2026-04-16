:PLANETINFO~GETPLANETINFO
setvar $planetinfo~noheader 0
send "*"
gosub :planetinfo~planetinfo
return

:planetinfo~planetinfo

setvar $PLANETINFO~CURRENT_SECTOR 0
setvar $PLANETINFO~PLANET 0
setvar $PLANETINFO~PLANET_FUEL 0
setvar $PLANETINFO~PLANET_FUEL_MAX 0
setvar $PLANETINFO~PLANET_ORGANICS 0
setvar $PLANETINFO~PLANET_ORGANICS_MAX 0
setvar $PLANETINFO~PLANET_EQUIPMENT 0
setvar $PLANETINFO~PLANET_EQUIPMENT_MAX 0
setvar $PLANETINFO~PLANET_FIGHTERS 0
setvar $PLANETINFO~PLANET_FIGHTERS_MAX 0
setvar $PLANETINFO~CITADEL 0
setvar $PLANETINFO~CITADEL_CREDITS 0
setvar $PLANETINFO~ATMOSPHERE_CANNON 0
setvar $PLANETINFO~SECTOR_CANNON 0
setvar $PLANETINFO~CURRENTBOTPLANET 0

if ($planetinfo~noheader = 0)
  settextlinetrigger HEADER :HEADER "Planet #"
else
  setvar $planetinfo~id 0
  setvar $planetinfo~sector 0
  setvar $planetinfo~name ""
end

setvar $planetinfo~buildtime 0
setvar $planetinfo~citadellevel 0
setvar $planetinfo~treasury 0

settextlinetrigger CLASS :CLASS "Class "
settextlinetrigger CREATOR :CREATOR "Created by: "
settextlinetrigger OWNER :OWNER "Claimed by: "
pause
:planetinfo~header

getword CURRENTLINE $planetinfo~id 2

striptext $planetinfo~id "#"
getword CURRENTLINE $planetinfo~sector 5
striptext $planetinfo~sector ":"
getword CURRENTLINE $planetinfo~test 6

if ($planetinfo~test <> 0)
  getwordpos CURRENTLINE $planetinfo~pos ": "
  cuttext CURRENTLINE $planetinfo~name ($planetinfo~pos + 2) 999
else
  setvar $planetinfo~name $planetinfo~test
end

pause
:planetinfo~class

getword CURRENTLINE $planetinfo~code 2
striptext $planetinfo~code ","
getlength $planetinfo~code $planetinfo~len
cuttext CURRENTLINE $planetinfo~class ($planetinfo~len + 9) 999
pause
:planetinfo~creator

getword CURRENTLINE $planetinfo~test 3
if ($planetinfo~test = 0)
  setvar $planetinfo~creator ""
else
  cuttext CURRENTLINE $planetinfo~creator 13 999
end
pause
:planetinfo~owner

getword CURRENTLINE $planetinfo~test 3
if ($planetinfo~test = 0)
  setvar $planetinfo~owner ""
else
  cuttext CURRENTLINE $planetinfo~owner 13 999
end

waiton "-------  ---------  ---------"
settextlinetrigger FUELORE :FUELORE "Fuel Ore   "
settextlinetrigger ORGANICS :ORGANICS "Organics   "
settextlinetrigger EQUIPMENT :EQUIPMENT "Equipment  "
settextlinetrigger FIGHTERS :FIGHTERS "Fighters    "
settextlinetrigger CITADELLEVEL :CITADELLEVEL "Planet has a level "
settextlinetrigger CANNON :CANNONSTART ", AtmosLvl="
settextlinetrigger BUILDTIME :BUILDTIME " under construction, "
settexttrigger INFODONE :INFODONE "Planet command (?=help) [D]"
pause
:planetinfo~fuelore

getword CURRENTLINE $planetinfo~colo[1] 3
striptext $planetinfo~colo[1] ","
getword CURRENTLINE $planetinfo~rate[1] 4
striptext $planetinfo~rate[1] ","
getword CURRENTLINE $planetinfo~prod[1] 5
striptext $planetinfo~prod[1] ","
getword CURRENTLINE $planetinfo~amount[1] 6
striptext $planetinfo~amount[1] ","
getword CURRENTLINE $planetinfo~max[1] 8
striptext $planetinfo~max[1] ","
pause
:planetinfo~organics

getword CURRENTLINE $planetinfo~colo[2] 2
striptext $planetinfo~colo[2] ","
getword CURRENTLINE $planetinfo~rate[2] 3
striptext $planetinfo~rate[2] ","
getword CURRENTLINE $planetinfo~prod[2] 4
striptext $planetinfo~prod[2] ","
getword CURRENTLINE $planetinfo~amount[2] 5
striptext $planetinfo~amount[2] ","
getword CURRENTLINE $planetinfo~max[2] 7
striptext $planetinfo~max[2] ","
pause
:planetinfo~equipment

getword CURRENTLINE $planetinfo~colo[3] 2
striptext $planetinfo~colo[3] ","
getword CURRENTLINE $planetinfo~rate[3] 3
striptext $planetinfo~rate[3] ","
getword CURRENTLINE $planetinfo~prod[3] 4
striptext $planetinfo~prod[3] ","
getword CURRENTLINE $planetinfo~amount[3] 5
striptext $planetinfo~amount[3] ","
getword CURRENTLINE $planetinfo~max[3] 7
striptext $planetinfo~max[3] ","
pause
:planetinfo~fighters

getword CURRENTLINE $planetinfo~rate[4] 3
striptext $planetinfo~rate[4] ","
getword CURRENTLINE $planetinfo~prod[4] 4
striptext $planetinfo~prod[4] ","
getword CURRENTLINE $planetinfo~amount[4] 5
striptext $planetinfo~amount[4] ","
getword CURRENTLINE $planetinfo~max[4] 7
striptext $planetinfo~max[4] ","


setvar $planetinfo~i 1
:planetinfo~i
setvar $planetinfo~full[$planetinfo~i] 0

if ($planetinfo~i <= 3)
  if ($planetinfo~rate[$planetinfo~i] <> "N/A")
    if (($planetinfo~colo[$planetinfo~i] / $planetinfo~rate[$planetinfo~i]) > ($planetinfo~prod[$planetinfo~i] + 1))
      setvar $planetinfo~full[$planetinfo~i] 1
    end
  end

  add $planetinfo~i 1
  goto :I
end

pause
:planetinfo~citadellevel

getword CURRENTLINE $planetinfo~citadellevel 5
getword CURRENTLINE $planetinfo~treasury 9
pause

:planetinfo~CANNONSTART
getword CURRENTLINE $PLANETINFO~ATMOSPHERE_CANNON 5
getword CURRENTLINE $PLANETINFO~SECTOR_CANNON 6
striptext $PLANETINFO~SECTOR_CANNON "SectLvl="
striptext $PLANETINFO~SECTOR_CANNON "%"
striptext $PLANETINFO~ATMOSPHERE_CANNON "AtmosLvl="
striptext $PLANETINFO~ATMOSPHERE_CANNON "%"
striptext $PLANETINFO~ATMOSPHERE_CANNON ","
pause

:planetinfo~buildtime

getwordpos CURRENTLINE $planetinfo~pos " under construction, "
cuttext CURRENTLINE $planetinfo~line $planetinfo~pos 999
getword $planetinfo~line $planetinfo~buildtime 3
pause
:planetinfo~infodone



setvar $planetinfo~best 0
setvar $planetinfo~bestscore 500000
setvar $planetinfo~i 1

while ($planetinfo~i <= 3)
  if (($planetinfo~rate[$planetinfo~i] <> "N/A") and ($planetinfo~full[$planetinfo~i] = 0))
    if ($planetinfo~rate[$planetinfo~i] < $planetinfo~bestscore)
      setvar $planetinfo~best $planetinfo~i
      setvar $planetinfo~bestscore $planetinfo~rate[$planetinfo~i]
    end
  end

  add $planetinfo~i 1
end

if ($planetinfo~best = 0)

  setvar $planetinfo~dropcategory 1
else
  setvar $planetinfo~dropcategory $planetinfo~best
end

killtrigger BUILDTIME
killtrigger CITADELLEVEL

setvar $planetinfo~noheader 0

setvar $PLANETINFO~PLANET $planetinfo~id
setvar $PLANETINFO~CURRENT_SECTOR $planetinfo~sector
setvar $PLANETINFO~PLANET_FUEL $planetinfo~amount[1]
setvar $PLANETINFO~PLANET_FUEL_MAX $planetinfo~max[1]
setvar $PLANETINFO~PLANET_ORGANICS $planetinfo~amount[2]
setvar $PLANETINFO~PLANET_ORGANICS_MAX $planetinfo~max[2]
setvar $PLANETINFO~PLANET_EQUIPMENT $planetinfo~amount[3]
setvar $PLANETINFO~PLANET_EQUIPMENT_MAX $planetinfo~max[3]
setvar $PLANETINFO~PLANET_FIGHTERS $planetinfo~amount[4]
setvar $PLANETINFO~PLANET_FIGHTERS_MAX $planetinfo~max[4]
setvar $PLANETINFO~CITADEL $planetinfo~citadellevel
setvar $PLANETINFO~CITADEL_CREDITS $planetinfo~treasury
setvar $PLANETINFO~COLO[1] $planetinfo~colo[1]
setvar $PLANETINFO~COLO[2] $planetinfo~colo[2]
setvar $PLANETINFO~COLO[3] $planetinfo~colo[3]
setvar $PLANETINFO~RATE[1] $planetinfo~rate[1]
setvar $PLANETINFO~RATE[2] $planetinfo~rate[2]
setvar $PLANETINFO~RATE[3] $planetinfo~rate[3]
setvar $PLANETINFO~RATE[4] $planetinfo~rate[4]
setvar $PLANETINFO~PROD[1] $planetinfo~prod[1]
setvar $PLANETINFO~PROD[2] $planetinfo~prod[2]
setvar $PLANETINFO~PROD[3] $planetinfo~prod[3]
setvar $PLANETINFO~PROD[4] $planetinfo~prod[4]
setvar $PLANETINFO~AMOUNT[1] $planetinfo~amount[1]
setvar $PLANETINFO~AMOUNT[2] $planetinfo~amount[2]
setvar $PLANETINFO~AMOUNT[3] $planetinfo~amount[3]
setvar $PLANETINFO~AMOUNT[4] $planetinfo~amount[4]
setvar $PLANETINFO~MAX[1] $planetinfo~max[1]
setvar $PLANETINFO~MAX[2] $planetinfo~max[2]
setvar $PLANETINFO~MAX[3] $planetinfo~max[3]
setvar $PLANETINFO~MAX[4] $planetinfo~max[4]
setvar $PLANETINFO~CURRENTBOTPLANET $planetinfo~id
savevar $PLANETINFO~CURRENTBOTPLANET
return
