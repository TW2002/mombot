#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:PLANET~COUNTPLANETS
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
setvar $PLANET~PLANETCOUNT 0
killtrigger PLANETGRABBER
killtrigger BEDONE
send "/"
waiton "Creds"
settextlinetrigger PLANETGRABBER :PLANETLINE "   <"
settextlinetrigger BEDONE :COUNTDONE "Land on which planet "
send "|lq*|"
pause
:PLANET~PLANETLINE
killtrigger GETEND
killtrigger GETLINE2
killtrigger PLANETGRABBER
killtrigger BEDONE
getwordpos CURRENTLINE $PLANET~POS "<<<< SHIELDED"
if ($PLANET~POS <= 0)
  setvar $PLANET~LINE CURRENTLINE
  replacetext $PLANET~LINE "<" " "
  replacetext $PLANET~LINE ">" " "
  striptext $PLANET~LINE ","
  add $PLANET~PLANETCOUNT 1
  getword $PLANET~LINE $PLANET~PLANETS[$PLANET~PLANETCOUNT] 1
end
settextlinetrigger GETLINE2 :PLANETLINE "   <"
settextlinetrigger GETEND :COUNTDONE "Land on which planet "
pause

:PLANET~COUNTDONE
killtrigger GETEND
killtrigger GETLINE2
killtrigger PLANETGRABBER
killtrigger BEDONE
return


#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:PLANET~PLANETCHECK
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
setvar $PLANET~PLANETCHECK_I 1
setvar $PLANET~PLANETCHECK_IGNORECOUNT 0

:PLANET~PLANETCHECK_LOADIGNORE
getword $PLANET~PLANETCHECK_IGNORELIST $PLANET~PLANETCHECK_IGNORE[$PLANET~PLANETCHECK_I] $PLANET~PLANETCHECK_I
if ($PLANET~PLANETCHECK_IGNORE[$PLANET~PLANETCHECK_I] <> 0)
  add $PLANET~PLANETCHECK_I 1
  add $PLANET~PLANETCHECK_IGNORECOUNT 1
  goto :PLANET~PLANETCHECK_LOADIGNORE
end

setvar $PLANET~PLANETCHECK_IGNORELIST ""
setvar $PLANET~PLANETCHECK_FOUND 0
send "l"

settextlinetrigger PLANETCHECK_NOPLANET :PLANET~PLANETCHECK_NOPLANET "There isn't a planet in this sector."
settextlinetrigger PLANETCHECK_MULTIPLEPLANETS :PLANET~PLANETCHECK_MULTIPLEPLANETS "Registry# and Planet Name"
settextlinetrigger PLANETCHECK_SINGLEPLANET :PLANET~PLANETCHECK_SINGLEPLANET "Landing sequence engaged..."
pause

:PLANET~PLANETCHECK_NOPLANET
killtrigger PLANETCHECK_MULTIPLEPLANETS
killtrigger PLANETCHECK_SINGLEPLANET
return

:PLANET~PLANETCHECK_MULTIPLEPLANETS
killtrigger PLANETCHECK_SINGLEPLANET
killtrigger PLANETCHECK_NOPLANET
setvar $PLANET~PLANETCHECK_LASTID 0

:PLANET~PLANETCHECK_NEXTPLANET
settexttrigger PLANETCHECK_PLANETSCHECKED :PLANET~PLANETCHECK_PLANETSCHECKED "Land on which planet <Q to abort>"
settextlinetrigger PLANETCHECK_GETID :PLANET~PLANETCHECK_GETID "<"
pause

:PLANET~PLANETCHECK_GETID
getword CURRENTLINE $PLANET~PLANETCHECK_WORD 1
if ($PLANET~PLANETCHECK_WORD = "Owned")
  settextlinetrigger PLANETCHECK_GETID :PLANET~PLANETCHECK_GETID "<"
  pause
end

killtrigger PLANETCHECK_PLANETSCHECKED
setvar $PLANET~PLANETCHECK_LINE CURRENTLINE
striptext $PLANET~PLANETCHECK_LINE "<"
striptext $PLANET~PLANETCHECK_LINE ">"
getword $PLANET~PLANETCHECK_LINE $PLANET~PLANETCHECK_ID 1
if ($PLANET~PLANETCHECK_ID = "Land")
  goto :PLANET~PLANETCHECK_PLANETSCHECKED
end

gosub :PLANET~PLANETCHECK_SUB_CHECKIGNORE

if (($PLANET~PLANETCHECK_ID > $PLANET~PLANETCHECK_LASTID) and ($PLANET~PLANETCHECK_IGNORE = 0))
  send $PLANET~PLANETCHECK_ID "*"
  setvar $PLANET~PLANETCHECK_LASTID $PLANET~PLANETCHECK_ID
  gosub :PLANET~PLANETCHECK_SUB_CHECK

  if ($PLANET~PLANETCHECK_FOUND <> 0)
    return
  end

  send "ql"
  waitfor "Registry# and Planet Name"
end
goto :PLANET~PLANETCHECK_NEXTPLANET

:PLANET~PLANETCHECK_PLANETSCHECKED
killtrigger PLANETCHECK_GETID
send "q*"
return

:PLANET~PLANETCHECK_SINGLEPLANET
killtrigger PLANETCHECK_MULTIPLEPLANETS
killtrigger PLANETCHECK_NOPLANET
gosub :PLANET~PLANETCHECK_SUB_CHECK
if ($PLANET~PLANETCHECK_FOUND = 0)
  send "q"
end
return

:PLANET~PLANETCHECK_SUB_CHECK
settextlinetrigger PLANETCHECK_CHECK_GETPLANET :PLANET~PLANETCHECK_CHECK_GETPLANET "Planet #"
pause

:PLANET~PLANETCHECK_CHECK_GETPLANET
getword CURRENTLINE $PLANET~PLANETCHECK_CHECK_PLANET 2
striptext $PLANET~PLANETCHECK_CHECK_PLANET "#"

setvar $PLANET~PLANETCHECK_ID $PLANET~PLANETCHECK_CHECK_PLANET
gosub :PLANET~PLANETCHECK_SUB_CHECKIGNORE

if ($PLANET~PLANETCHECK_IGNORE = 0)
  gosub $PLANET~PLANETCHECKSUB

  if ($PLANET~PLANETCHECK_FOUND = 1)
    setvar $PLANET~PLANETCHECK_FOUND $PLANET~PLANETCHECK_CHECK_PLANET
  end
end

return

:PLANET~PLANETCHECK_SUB_CHECKIGNORE
setvar $PLANET~PLANETCHECK_J 1
setvar $PLANET~PLANETCHECK_IGNORE 0

:PLANET~PLANETCHECK_CHECKIGNORE_LOOP
if ($PLANET~PLANETCHECK_J <= $PLANET~PLANETCHECK_IGNORECOUNT)
  if ($PLANET~PLANETCHECK_IGNORE[$PLANET~PLANETCHECK_J] = $PLANET~PLANETCHECK_ID)
    setvar $PLANET~PLANETCHECK_IGNORE 1
  else
    add $PLANET~PLANETCHECK_J 1
    goto :PLANET~PLANETCHECK_CHECKIGNORE_LOOP
  end
end

return


#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:PLANET~GETPLANETINFO
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
setvar $PLANET~NOHEADER 0
:PLANET~PLANETINFO
setvar $PLANET~PLANET 0
setvar $PLANET~CURRENT_SECTOR 0
setvar $PLANET~PLANET_FUEL 0
setvar $PLANET~PLANET_FUEL_MAX 0
setvar $PLANET~PLANET_ORGANICS 0
setvar $PLANET~PLANET_ORGANICS_MAX 0
setvar $PLANET~PLANET_EQUIPMENT 0
setvar $PLANET~PLANET_EQUIPMENT_MAX 0
setvar $PLANET~PLANET_FIGHTERS 0
setvar $PLANET~PLANET_FIGHTERS_RATE 0
setvar $PLANET~PLANET_FIGHTERS_PROD 0
setvar $PLANET~PLANET_TRANSPORT 0
setvar $PLANET~PLANET_FIGHTERS_MAX 0
setvar $PLANET~CITADEL 0
setvar $PLANET~CITADEL_CREDITS 0
setvar $PLANET~ATMOSPHERE_CANNON 0
setvar $PLANET~SECTOR_CANNON 0
setvar $PLANET~BUILDTIME 0
setvar $PLANET~MILITARYREACTION 0
setvar $PLANET~CREATOR ""
setvar $PLANET~OWNER ""
setvar $PLANET~PLANET_CLASS_NAME "undefined"
setvar $PLANET~PLANET_NAME "undefined"
setvar $PLANET~UNDER_CONSTRUCTION FALSE
setvar $PLANET~MAXED_LEVEL FALSE
setvar $PLANET~COLO[1] 0
setvar $PLANET~COLO[2] 0
setvar $PLANET~COLO[3] 0
setvar $PLANET~RATE[1] 0
setvar $PLANET~RATE[2] 0
setvar $PLANET~RATE[3] 0
setvar $PLANET~RATE[4] 0
setvar $PLANET~PROD[1] 0
setvar $PLANET~PROD[2] 0
setvar $PLANET~PROD[3] 0
setvar $PLANET~PROD[4] 0
setvar $PLANET~AMOUNT[1] 0
setvar $PLANET~AMOUNT[2] 0
setvar $PLANET~AMOUNT[3] 0
setvar $PLANET~AMOUNT[4] 0
setvar $PLANET~MAX[1] 0
setvar $PLANET~MAX[2] 0
setvar $PLANET~MAX[3] 0
setvar $PLANET~MAX[4] 0

if ($PLANET~NOHEADER = 0)
  send "*"
  killtrigger PLANETINFO2
  settextlinetrigger PLANETINFO2 :PLANETINFO2 "Planet #"
  pause
end

goto :PLANETINFOSTART

:PLANET~PLANETINFO2
setvar $PLANET~CITADEL 0
setvar $PLANET~SECTOR_CANNON 0
setvar $PLANET~ATMOSPHERE_CANNON 0
setvar $PLANET~CITADEL_CREDITS 0
getword CURRENTLINE $PLANET~PLANET 2
striptext $PLANET~PLANET "#"
isnumber $PLANET~TST $PLANET~PLANET
if ($PLANET~TST <> TRUE)
  settextlinetrigger PLANETINFO2 :PLANETINFO2 "Planet #"
  pause
end
getword CURRENTLINE $PLAYER~CURRENT_SECTOR 5
striptext $PLAYER~CURRENT_SECTOR ":"
getwordpos CURRENTLINE $PLANET~POS ": "
cuttext CURRENTLINE $PLANET~PLANET_NAME ($PLANET~POS + 2) 999
savevar $PLANET~PLANET
savevar $PLAYER~CURRENT_SECTOR
setsectorparameter $PLANET~PLANET "PSECTOR" $PLAYER~CURRENT_SECTOR
:PLANETINFOSTART
setvar $PLANET~CURRENT_SECTOR $PLAYER~CURRENT_SECTOR
settextlinetrigger CLASS :GETCLASS "Class "
settextlinetrigger CREATOR :CREATOR "Created by: "
settextlinetrigger OWNER :OWNER "Claimed by: "
pause

:PLANET~GETCLASS
getword CURRENTLINE $PLANET~CODE 2
striptext $PLANET~CODE ","
getlength $PLANET~CODE $len
cuttext CURRENTLINE $PLANET~PLANET_CLASS_NAME ($len + 9) 999
setvar $PLANET~CLASS_NAME $PLANET~PLANET_CLASS_NAME
pause

:PLANET~CREATOR
getword CURRENTLINE $test 3
if ($test = 0)
  setvar $PLANET~CREATOR ""
else
  cuttext CURRENTLINE $PLANET~CREATOR 13 999
end
pause

:PLANET~OWNER
getword CURRENTLINE $PLANET~OWNER 3
if ($PLANET~OWNER = 0)
  setvar $PLANET~OWNER ""
else
  cuttext CURRENTLINE $PLANET~OWNER 13 999
end

waitfor "2 Build 1   Product    Amount     Amount     Maximum"
gosub :KILLPLANETTRIGGERS

:PLANET~GETPLANETSTUFF
settextlinetrigger FUELSTART :FUELSTART "Fuel Ore"
settextlinetrigger ORGSTART :ORGSTART "Organics"
settextlinetrigger EQUIPSTART :EQUIPSTART "Equipment"
settextlinetrigger FIGSTART :FIGSTART "Fighters        N/A"
settextlinetrigger TPORT :PLANETTPORT "-=-=-=-=-=- TransPort power ="
settextlinetrigger SHIELDS :PLANETSHIELDS "Planetary Defense Shielding Power Level ="
settextlinetrigger CITADELSTART :CITADELSTART "Planet has a level"
settextlinetrigger CANNON :CANNONSTART ", AtmosLvl="
settexttrigger MAXEDIG :MAXEDIG "Planetary Interdictor Generator ="
settexttrigger UNDERCONST :UNDERCONST "under construction,"
settexttrigger PLANETINFODONE :PLANETINFODONE "Planet command (?=help)"
pause

:PLANET~UNDERCONST
setvar $PLANET~UNDER_CONSTRUCTION TRUE
getwordpos CURRENTLINE $pos " under construction, "
cuttext CURRENTLINE $line $pos 999
getword $line $PLANET~BUILDTIME 3
pause

:PLANET~MAXEDIG
setvar $PLANET~MAXED_LEVEL TRUE
pause

:PLANET~PLANETTPORT
gettext CURRENTLINE $PLANET~PLANET_TPAD "power =" "hops -"
striptext $PLANET~PLANET_TPAD ","
striptext $PLANET~PLANET_TPAD " "
isnumber $PLANET~TST $PLANET~PLANET_TPAD
if ($PLANET~TST = 0)
  setvar $PLANET~PLANET_TPAD 0
end
setvar $PLANET~PLANET_TRANSPORT $PLANET~PLANET_TPAD
pause

:PLANET~PLANETSHIELDS
getword CURRENTLINE $PLANET~PLANET_SHIELDS 8
striptext $PLANET~PLANET_SHIELDS ","
isnumber $PLANET~TST $PLANET~PLANET_SHIELDS
if ($PLANET~TST = 0)
  setvar $PLANET~PLANET_SHIELDS 0
end
pause

:PLANET~FUELSTART
getword CURRENTLINE $PLANET~PLANET_FUEL_COLONISTS 3
getword CURRENTLINE $PLANET~PLANET_FUEL_RATE 4
getword CURRENTLINE $PLANET~PLANET_FUEL_PROD 5
getword CURRENTLINE $PLANET~PLANET_FUEL 6
getword CURRENTLINE $PLAYER~ORE_HOLDS 7
getword CURRENTLINE $PLANET~PLANET_FUEL_MAX 8
getword CURRENTLINE $PLANET~PLANETFUEL 6
getword CURRENTLINE $PLANET~PLANETFUELMAX 8
striptext $PLANET~PLANETFUEL ","
striptext $PLANET~PLANETFUELMAX ","
striptext $PLANET~PLANET_FUEL ","
striptext $PLANET~PLANET_FUEL_MAX ","
striptext $PLANET~PLANET_FUEL_COLONISTS ","
striptext $PLANET~PLANET_FUEL_PROD ","
striptext $PLANET~PLANET_FUEL_RATE ","
pause

:PLANET~ORGSTART
getword CURRENTLINE $PLANET~PLANET_ORGANICS_COLONISTS 2
getword CURRENTLINE $PLANET~PLANET_ORGANICS_RATE 3
getword CURRENTLINE $PLANET~PLANET_ORGANICS_PROD 4
getword CURRENTLINE $PLANET~PLANET_ORGANICS 5
getword CURRENTLINE $PLAYER~ORGANIC_HOLDS 6
getword CURRENTLINE $PLANET~PLANET_ORGANICS_MAX 7
getword CURRENTLINE $PLANET~PLANETORG 5
getword CURRENTLINE $PLANET~PLANETORGMAX 7
striptext $PLANET~PLANETORG ","
striptext $PLANET~PLANETORGMAX ","
striptext $PLANET~PLANET_ORGANICS ","
striptext $PLANET~PLANET_ORGANICS_MAX ","
striptext $PLANET~PLANET_ORGANICS_COLONISTS ","
striptext $PLANET~PLANET_ORGANICS_PROD ","
striptext $PLANET~PLANET_ORGANICS_RATE ","
pause

:PLANET~EQUIPSTART
getword CURRENTLINE $PLANET~PLANET_EQUIPMENT_COLONISTS 2
getword CURRENTLINE $PLANET~PLANET_EQUIPMENT_RATE 3
getword CURRENTLINE $PLANET~PLANET_EQUIPMENT_PROD 4
getword CURRENTLINE $PLANET~PLANET_EQUIPMENT 5
getword CURRENTLINE $PLAYER~EQUIPMENT_HOLDS 6
getword CURRENTLINE $PLANET~PLANET_EQUIPMENT_MAX 7
getword CURRENTLINE $PLANET~PLANETEQUIP 5
getword CURRENTLINE $PLANET~PLANETEQUIPMAX 7
striptext $PLANET~PLANETEQUIP ","
striptext $PLANET~PLANETEQUIPMAX ","
striptext $PLANET~PLANET_EQUIPMENT ","
striptext $PLANET~PLANET_EQUIPMENT_MAX ","
striptext $PLANET~PLANET_EQUIPMENT_COLONISTS ","
striptext $PLANET~PLANET_EQUIPMENT_PROD ","
striptext $PLANET~PLANET_EQUIPMENT_RATE ","
pause

:PLANET~FIGSTART
getword CURRENTLINE $PLANET~PLANET_FIGHTERS_RATE 3
getword CURRENTLINE $PLANET~PLANET_FIGHTERS_PROD 4
getword CURRENTLINE $PLANET~PLANET_FIGHTERS 5
getword CURRENTLINE $PLANET~PLANET_FIGHTERS_MAX 7
striptext $PLANET~PLANET_FIGHTERS_RATE ","
striptext $PLANET~PLANET_FIGHTERS_PROD ","
striptext $PLANET~PLANET_FIGHTERS ","
striptext $PLANET~PLANET_FIGHTERS_MAX ","
pause

:PLANET~CITADELSTART
getword CURRENTLINE $PLANET~CITADEL 5
getword CURRENTLINE $PLANET~CITADEL_CREDITS 9
striptext $PLANET~CITADEL_CREDITS ","
pause

:PLANET~CANNONSTART
getword CURRENTLINE $PLANET~MILITARYREACTION 2
getword CURRENTLINE $PLANET~ATMOSPHERE_CANNON 5
getword CURRENTLINE $PLANET~SECTOR_CANNON 6
striptext $PLANET~MILITARYREACTION "reaction="
striptext $PLANET~MILITARYREACTION "%"
striptext $PLANET~SECTOR_CANNON "SectLvl="
striptext $PLANET~SECTOR_CANNON "%"
striptext $PLANET~ATMOSPHERE_CANNON "AtmosLvl="
striptext $PLANET~ATMOSPHERE_CANNON "%"
striptext $PLANET~ATMOSPHERE_CANNON ","
pause

:PLANET~PLANETINFODONE
gosub :KILLPLANETTRIGGERS
setvar $PLANET~COLO[1] $PLANET~PLANET_FUEL_COLONISTS
setvar $PLANET~COLO[2] $PLANET~PLANET_ORGANICS_COLONISTS
setvar $PLANET~COLO[3] $PLANET~PLANET_EQUIPMENT_COLONISTS
setvar $PLANET~RATE[1] $PLANET~PLANET_FUEL_RATE
setvar $PLANET~RATE[2] $PLANET~PLANET_ORGANICS_RATE
setvar $PLANET~RATE[3] $PLANET~PLANET_EQUIPMENT_RATE
setvar $PLANET~RATE[4] $PLANET~PLANET_FIGHTERS_RATE
setvar $PLANET~PROD[1] $PLANET~PLANET_FUEL_PROD
setvar $PLANET~PROD[2] $PLANET~PLANET_ORGANICS_PROD
setvar $PLANET~PROD[3] $PLANET~PLANET_EQUIPMENT_PROD
setvar $PLANET~PROD[4] $PLANET~PLANET_FIGHTERS_PROD
setvar $PLANET~AMOUNT[1] $PLANET~PLANET_FUEL
setvar $PLANET~AMOUNT[2] $PLANET~PLANET_ORGANICS
setvar $PLANET~AMOUNT[3] $PLANET~PLANET_EQUIPMENT
setvar $PLANET~AMOUNT[4] $PLANET~PLANET_FIGHTERS
setvar $PLANET~MAX[1] $PLANET~PLANET_FUEL_MAX
setvar $PLANET~MAX[2] $PLANET~PLANET_ORGANICS_MAX
setvar $PLANET~MAX[3] $PLANET~PLANET_EQUIPMENT_MAX
setvar $PLANET~MAX[4] $PLANET~PLANET_FIGHTERS_MAX
setvar $PLANET~NOHEADER 0
setvar $PLANET~CURRENTBOTPLANET $PLANET~PLANET
savevar $PLANET~CURRENTBOTPLANET
savevar $PLANET~PLANET_FIGHTERS
savevar $PLAYER~CURRENT_SECTOR
savevar $PLANET~PLANET
savevar $PLANET~PLANET_FUEL
savevar $PLANET~PLANET_FUEL_MAX
savevar $PLANET~PLANET_ORGANICS
savevar $PLANET~PLANET_ORGANICS_MAX
savevar $PLANET~PLANET_EQUIPMENT
savevar $PLANET~PLANET_EQUIPMENT_MAX
savevar $PLANET~PLANET_FIGHTERS
savevar $PLANET~PLANET_SHIELDS
savevar $PLANET~PLANET_TRANSPORT
savevar $PLANET~PLANET_FIGHTERS_MAX
savevar $PLANET~CITADEL
savevar $PLANET~CITADEL_CREDITS
savevar $PLANET~ATMOSPHERE_CANNON
savevar $PLANET~SECTOR_CANNON
savevar $PLANET~PLANET_CLASS_NAME
savevar $PLANET~PLANET_NAME
savevar $PLANET~UNDER_CONSTRUCTION
savevar $PLANET~MAXED_LEVEL
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:PLANET~GETPLANETPRODS
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
gosub :PLAYER~CURRENTPROMPT
if ($PLAYER~CURRENT_PROMPT <> "Command") and ($PLAYER~CURRENT_PROMPT <> "Citadel")
  setvar $switchboard~message "Must be at planet or citadel prompt*"
  gosub :switchboard~switchboard
  return
end

send "|CR*"

settextlinetrigger FOUNDPORT :FOUNDPORT "Items     Status  Trading % of max OnBoard"
settextlinetrigger NOPORT :NOPORT "I have no information about a port in that sector."
settextlinetrigger NOPORT2 :NOPORT "You have never visted sector"
settextlinetrigger NOPORT3 :NOPORT "credits / next hold"
pause

:NOPORT
send "Q|"
killtrigger FOUNDPORT
killtrigger NOPORT
killtrigger NOPORT2
killtrigger NOPORT3
setvar $PLANET~FOUNDPORT FALSE

:FOUNDPORT
killtrigger FOUNDPORT
killtrigger NOPORT
killtrigger NOPORT2
killtrigger NOPORT3
setvar $PLANET~FOUNDPORT TRUE
settextlinetrigger PORTINFO1 :PORTINFO1 "Fuel Ore "
settextlinetrigger PORTINFO2 :PORTINFO2 "Organics"
settextlinetrigger PORTINFO3 :PORTINFO3 "Equipment"
settextlinetrigger GOTCR :GOTCR "Computer command [TL="
pause

:PORTINFO1
getword CURRENTLINE $PLAYER~CURRENT_SECTOR.OREBUYING 3
getword CURRENTLINE $PLAYER~CURRENT_SECTOR.ORETRADING 4
getword CURRENTLINE $PLAYER~CURRENT_SECTOR.OREPERCENT 5
striptext $PLAYER~CURRENT_SECTOR.OREPERCENT "%"
pause

:PORTINFO2
getword CURRENTLINE $PLAYER~CURRENT_SECTOR.ORGBUYING 2
getword CURRENTLINE $PLAYER~CURRENT_SECTOR.ORGTRADING 3
getword CURRENTLINE $PLAYER~CURRENT_SECTOR.ORGPERCENT 4
striptext $PLAYER~CURRENT_SECTOR.ORGPERCENT "%"
pause

:PORTINFO3
getword CURRENTLINE $PLAYER~CURRENT_SECTOR.EQUBUYING 2
getword CURRENTLINE $PLAYER~CURRENT_SECTOR.EQUTRADING 3
getword CURRENTLINE $PLAYER~CURRENT_SECTOR.EQUPERCENT 4
striptext $PLAYER~CURRENT_SECTOR.EQUPERCENT "%"
send "Q|"
pause

:GOTCR
killtrigger PORTINFO1
killtrigger PORTINFO2
killtrigger PORTINFO3
killtrigger GOTCR

return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:PLANET~KILLPLANETTRIGGERS
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
killtrigger FUELSTART
killtrigger ORGSTART
killtrigger EQUIPSTART
killtrigger FIGSTART
killtrigger TPORT
killtrigger SHIELDS
killtrigger CITADELSTART
killtrigger CANNON
killtrigger CITEXISTS
killtrigger MAXEDIG
killtrigger UNDERCONST
killtrigger PLANETINFODONE
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:PLANET~GETPLANETNUMBER
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
send "*"
settextlinetrigger PLANETINFO3 :GETJUSTTHENUMBER "Planet #"
pause

:PLANET~GETJUSTTHENUMBER
send "  "
getword CURRENTLINE $PLANET~PLANET 2
striptext $PLANET~PLANET "#"
getword CURRENTLINE $PLAYER~CURRENT_SECTOR 5
striptext $PLAYER~CURRENT_SECTOR ":"
savevar $PLANET~PLANET
savevar $PLAYER~CURRENT_SECTOR
setsectorparameter $PLANET~PLANET "PSECTOR" $PLAYER~CURRENT_SECTOR
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:PLANET~GETPLANETSTATS
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
send "cn"
waiton "(2) Animation display"
getword CURRENTLINE $PLANET~ANSI_ONOFF 5
if ($PLANET~ANSI_ONOFF = "On")
  send "2qq"
else
  send "qq"
end
setarray $PLANET~ALPHA 20
delete $PLANET~PLANET_FILE
setvar $PLANET~ALPHA[1] "A"
setvar $PLANET~ALPHA[2] "B"
setvar $PLANET~ALPHA[3] "C"
setvar $PLANET~ALPHA[4] "D"
setvar $PLANET~ALPHA[5] "E"
setvar $PLANET~ALPHA[6] "F"
setvar $PLANET~ALPHA[7] "G"
setvar $PLANET~ALPHA[8] "H"
setvar $PLANET~ALPHA[9] "I"
setvar $PLANET~ALPHA[10] "J"
setvar $PLANET~ALPHA[11] "K"
setvar $PLANET~ALPHA[12] "L"
setvar $PLANET~ALPHA[13] "M"
setvar $PLANET~ALPHA[14] "N"
setvar $PLANET~ALPHA[15] "O"
setvar $PLANET~ALPHA[16] "P"
setvar $PLANET~ALPHA[17] "R"
setvar $PLANET~ALPHALOOP 0
setvar $PLANET~TOTALPLANETS 0
setvar $PLANET~FIRSTPLANETNAME ""

setvar $PLANET~NEXTPAGE 1
send "CJ@?"
waiton "Average Interval Lag"
waiton "Which planet type are you interested in (?=List)"

:PLANET~SHP_LOOP
settextlinetrigger GRAB_PLANET :PLANET~SHP_PLANETNAMES "> "
pause
:PLANET~SHP_PLANETNAMES
if (CURRENTLINE = "")
  goto :PLANET~SHP_LOOP
end
getword CURRENTLINE $PLANET~STOPPER 1
if ($PLANET~STOPPER = "<+>")
  send "+"
  waiton "(?=List) ?"
  setvar $PLANET~NEXTPAGE 1
  goto :PLANET~SHP_LOOP
elseif ($PLANET~STOPPER = "<Q>")
  goto :PLANET~SHP_GETPLANETSTATS
end
if ($PLANET~NEXTPAGE = 1)
  setvar $PLANET~PLANETNAME CURRENTLINE
  striptext $PLANET~PLANETNAME "<A> "
  if ($PLANET~PLANETNAME = $PLANET~FIRSTPLANETNAME)
    goto :PLANET~SHP_GETPLANETSTATS
  end
  setvar $PLANET~NEXTPAGE 0
end
add $PLANET~TOTALPLANETS 1
if ($PLANET~TOTALPLANETS = 1)
  setvar $PLANET~FIRSTPLANETNAME CURRENTLINE
  striptext $PLANET~FIRSTPLANETNAME "<A> "
end
goto :PLANET~SHP_LOOP
:PLANET~SHP_GETPLANETSTATS
setvar $PLANET~PLANETSTATLOOP 0
:PLANET~SHP_PLANETSTATS
while ($PLANET~PLANETSTATLOOP < $PLANET~TOTALPLANETS)
  add $PLANET~PLANETSTATLOOP 1
  add $PLANET~ALPHALOOP 1
  if ($PLANET~ALPHALOOP > 17)
    send "+"
    setvar $PLANET~ALPHALOOP 1
  end
  send $PLANET~ALPHA[$PLANET~ALPHALOOP]
  settextlinetrigger SN :PLANET~SN "Planet Category #"
  pause
  :PLANET~SN
  setvar $PLANET~LINE CURRENTLINE
  getwordpos $PLANET~LINE $PLANET~POS "Class"

  cuttext $PLANET~LINE $PLANET~PLANET_NAME $PLANET~POS 999
  setvar $PLANET~PLANET_FUEL_COLONISTS_MIN 50000
  setvar $PLANET~PLANET_FUEL_COLONISTS_MAX 50000
  setvar $PLANET~PLANET_ORG_COLONISTS_MIN 50000
  setvar $PLANET~PLANET_ORG_COLONISTS_MAX 50000
  setvar $PLANET~PLANET_EQUIP_COLONISTS_MIN 50000
  setvar $PLANET~PLANET_EQUIP_COLONISTS_MAX 50000
  gosub :PLANET~READPLANETTYPESTATS
  write $PLANET~PLANET_FILE $PLANET~PLANET_FUEL_COLONISTS_MIN&" "&$PLANET~PLANET_FUEL_COLONISTS_MAX&" "&$PLANET~PLANET_ORG_COLONISTS_MIN&" "&$PLANET~PLANET_ORG_COLONISTS_MAX&" "&$PLANET~PLANET_EQUIP_COLONISTS_MIN&" "&$PLANET~PLANET_EQUIP_COLONISTS_MAX&" 0  "&$PLANET~PLANET_NAME
end
send "qq"
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:PLANET~READPLANETTYPESTATS
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:PLANET~READPLANETTYPESTATS_WAIT
settextlinetrigger PLANETSTAT_COLS :PLANET~READPLANETTYPESTATS_COLS "Cols -"
settexttrigger PLANETSTAT_DONE :PLANET~READPLANETTYPESTATS_DONE "Which planet type are you interested in (?=List)"
pause

:PLANET~READPLANETTYPESTATS_COLS
killalltriggers
setvar $PLANET~STAT_LINE CURRENTLINE
gosub :PLANET~GETPLANETTYPECOLS
if ($PLANET~PARSED_COLS > 0)
  getwordpos $PLANET~STAT_LINE $PLANET~POS "Ore"
  if ($PLANET~POS > 0)
    setvar $PLANET~PLANET_FUEL_COLONISTS_MIN $PLANET~PARSED_COLS
    setvar $PLANET~PLANET_FUEL_COLONISTS_MAX $PLANET~PARSED_COLS
  end
  getwordpos $PLANET~STAT_LINE $PLANET~POS "Org"
  if ($PLANET~POS > 0)
    setvar $PLANET~PLANET_ORG_COLONISTS_MIN $PLANET~PARSED_COLS
    setvar $PLANET~PLANET_ORG_COLONISTS_MAX $PLANET~PARSED_COLS
  end
  getwordpos $PLANET~STAT_LINE $PLANET~POS "Eq"
  if ($PLANET~POS > 0)
    setvar $PLANET~PLANET_EQUIP_COLONISTS_MIN $PLANET~PARSED_COLS
    setvar $PLANET~PLANET_EQUIP_COLONISTS_MAX $PLANET~PARSED_COLS
  end
end
goto :PLANET~READPLANETTYPESTATS_WAIT

:PLANET~READPLANETTYPESTATS_DONE
killalltriggers
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:PLANET~GETPLANETTYPECOLS
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
setvar $PLANET~PARSED_COLS 0
gettext $PLANET~STAT_LINE $PLANET~PARSED_COLS "Cols -" "/"
striptext $PLANET~PARSED_COLS " "
striptext $PLANET~PARSED_COLS ","
isnumber $PLANET~ISNUMBER $PLANET~PARSED_COLS
if ($PLANET~ISNUMBER <> TRUE)
  setvar $PLANET~PARSED_COLS 0
end
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:PLANET~LANDINGSUB
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
gosub :KILLLANDINGTRIGGERS
send "lz" #8 $PLANET~PLANET "*"
setvar $PLANET~SUCESSFULCITADEL FALSE
setvar $PLANET~SUCESSFULPLANET FALSE
settextlinetrigger NOPLANET :NOPLANET "There isn't a planet in this sector."
settextlinetrigger NO_LAND :NO_LAND "since it couldn't possibly stand"
settextlinetrigger PLANET :PLANET "Planet #"
settextlinetrigger WRONGONE :WRONG_NUM "That planet is not in this sector."
settextlinetrigger NOPLANETSCANNER :DISPLAYPLANET "<Destroy Planet>"
pause

:PLANET~NOPLANET
gosub :KILLLANDINGTRIGGERS
setvar $SWITCHBOARD~MESSAGE "No Planet in Sector!*"
gosub :SWITCHBOARD~SWITCHBOARD
return

:PLANET~NO_LAND
gosub :KILLLANDINGTRIGGERS
setvar $SWITCHBOARD~MESSAGE "This ship cannot land!*"
gosub :SWITCHBOARD~SWITCHBOARD
return

:PLANET~DISPLAYPLANET
send "*"
waiton "Planet #"

:PLANET~PLANET
getword CURRENTLINE $PLANET~PNUM_CK 2
striptext $PLANET~PNUM_CK "#"
gosub :KILLLANDINGTRIGGERS
if ($PLANET~PNUM_CK <> $PLANET~PLANET)
  send "q"
  goto :WRONG_NUM
end
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
setvar $PLANET~SUCESSFULPLANET TRUE
if ($PLANET~LAND_AND_LIFT = TRUE)
  send "m* * * q  "
  return
end
send "m* * * c*"
settexttrigger BUILD_CIT :BUILD_CIT "Do you wish to construct one?"
settexttrigger IN_CIT :IN_CIT "Citadel command"
settexttrigger NOCITALLOWED :BUILD_CIT "Citadels are not allowed in FedSpace."
settexttrigger CITNOTBUILTYET :BUILD_CIT "Be patient, your Citadel is not yet finished."
pause

:PLANET~BUILD_CIT
gosub :KILLLANDINGTRIGGERS
setvar $PLANET~SUCESSFULPLANET TRUE
setvar $PLANET~STARTINGLOCATION "Planet"
return

:PLANET~IN_CIT
gosub :KILLLANDINGTRIGGERS
setvar $PLANET~SUCESSFULCITADEL TRUE
setvar $PLANET~STARTINGLOCATION "Citadel"
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:PLANET~PWARP
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
	setvar $PLANET~DO_SCAN FALSE
	setvar $PLANET~PWARPSUCCESS FALSE
	setvar $PLANET~MSG ""
	if ($PLANET~PWARP_SCAN = TRUE)
		setvar $PLANET~DO_SCAN TRUE
	end
	setvar $PLANET~PWARP_SCAN FALSE
	send "q *"
	waitOn "Planet #"
	getWord CURRENTLINE $planet~planet 2
	stripText $planet~planet "#"
	saveVar $planet~planet

	send "c p" $PLANET~warpto "*"

	setTextLineTrigger pwarp_lock       :pwarp_lock     "Locating beam pinpointed"
	setTextLineTrigger no_pwarp_lock    :no_pwarp_lock  "Your own fighters must be"
	setTextLineTrigger already      :already    "You are already in that sector!"
	setTextLineTrigger no_ore       :no_ore     "You do not have enough Fuel Ore"
	setTextLineTrigger No_pwarp     :noPwarp    "This Citadel does not have a Planetary TransWarp"
	setTextLineTrigger wrong_number     :wrong_number   "Invalid Sector number,"
	pause

	:wrong_number
		killalltriggers
		setvar $PLANET~MSG "Not a valid sector to pwarp to!"
		setVar $SWITCHBOARD~message "Not a valid sector to pwarp to!*"
		gosub :SWITCHBOARD~switchboard
		return		
	:noPwarp
		killalltriggers
		setvar $PLANET~MSG "Planet Does Not Have A Planetary TransWarp Drive!"
		setVar $SWITCHBOARD~message "Planet Does Not Have A Planetary TransWarp Drive!*"
		gosub :SWITCHBOARD~switchboard
		return
	:no_pwarp_lock
		killalltriggers
		setVar $PLANET~target $PLANET~warpto
		setVar $PLAYER~target $PLANET~target
		setvar $PLANET~MSG "No fighter down at that location!"
		gosub :player~removefigfromdata
		setVar $SWITCHBOARD~message "No fighter down at that location!*"
		gosub :SWITCHBOARD~switchboard
		return
	:no_ore
		killalltriggers
		setvar $PLANET~MSG "Not enough fuel for that pwarp."
		setVar $SWITCHBOARD~message "Not enough fuel for that pwarp.*"
		gosub :SWITCHBOARD~switchboard
		return
	:pwarp_lock
		killalltriggers
		send "y"
		waitOn "Planet is now in sector"
		setvar $PLANET~PWARPSUCCESS TRUE
		setvar $PLANET~MSG "Planet #"&$planet~planet&" moved to sector "&$PLANET~warpto&"."
		setVar $SWITCHBOARD~message $PLANET~MSG&"*"
		gosub :SWITCHBOARD~switchboard
		setVar $PLANET~target $PLANET~warpto
		setVar $PLAYER~target $PLANET~target
		loadVar $planet~planet
		isNumber $test $planet~planet
		if ($test)
			if (($planet~planet <> ".") and ($planet~planet > 0))
				setSectorParameter $planet~planet "PSECTOR" $PLANET~target
			end
		end
		#gosub :player~addfigtodata
		if ($PLANET~DO_SCAN = TRUE)
			send "s"
			waiton "Warps to Sector(s) :"
			send "* "
		end
		return
	:already
		killalltriggers
		setvar $PLANET~PWARPSUCCESS TRUE
		setvar $PLANET~MSG "Planet already in that sector!."
		setVar $SWITCHBOARD~message "Planet already in that sector!.*"
		gosub :SWITCHBOARD~switchboard
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:PLANET~KILLLANDINGTRIGGERS
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
killtrigger NOPLANET
killtrigger NO_LAND
killtrigger PLANET
killtrigger WRONGONE
killtrigger IN_CIT
killtrigger NOCITALLOWED
killtrigger BUILD_CIT
killtrigger CITNOTBUILTYET
killtrigger NOPLANETSCANNER
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:PLANET~LANDONPLANETENTERCITADEL
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
send "l "&$PLANET~PLANET&"*tnl1*tnl2*tnl3*snl1*snl2*snl3*c "
waiton "Fuel Ore"
getword CURRENTLINE $PLANET~PLANETFUEL 6
striptext $PLANET~PLANETFUEL ","
getword CURRENTLINE $PLANET~PLANET_FUEL 6
striptext $PLANET~PLANET_FUEL ","
send "/"
waiton "Creds"
getword CURRENTLINE $PLAYER~CREDITS 4
striptext $PLAYER~CREDITS "³Figs"
striptext $PLAYER~CREDITS ","
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:PLANET~LOADPLANETINFO
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
setvar $PLANET~PLANETCOUNTER 1
loadvar $PLANET~PLANET_FILE
fileexists $PLANET~EXISTS $PLANET~PLANET_FILE
:PLANET~COUNT_THE_PLANETS
if ($PLANET~EXISTS)
  setvar $PLANET~I 1
  readtoarray $PLANET~PLANET_FILE $PLANET~PLANET_ARRAY
  setarray $PLANET~PLANETLIST $PLANET~PLANET_ARRAY 7
  while ($PLANET~I <= $PLANET~PLANET_ARRAY)
    setvar $PLANET~PLANETINF $PLANET~PLANET_ARRAY[$PLANET~I]
    getword $PLANET~PLANETINF $PLANET~PLANET_FUEL_COLONISTS_MIN 1
    getlength $PLANET~PLANET_FUEL_COLONISTS_MIN $PLANET~LENGTH1
    getword $PLANET~PLANETINF $PLANET~PLANET_FUEL_COLONISTS_MAX 2
    getlength $PLANET~PLANET_FUEL_COLONISTS_MAX $PLANET~LENGTH2
    getword $PLANET~PLANETINF $PLANET~PLANET_ORG_COLONISTS_MIN 3
    getlength $PLANET~PLANET_ORG_COLONISTS_MIN $PLANET~LENGTH3
    getword $PLANET~PLANETINF $PLANET~PLANET_ORG_COLONISTS_MAX 4
    getlength $PLANET~PLANET_ORG_COLONISTS_MAX $PLANET~LENGTH4
    getword $PLANET~PLANETINF $PLANET~PLANET_EQUIP_COLONISTS_MIN 5
    getlength $PLANET~PLANET_EQUIP_COLONISTS_MIN $PLANET~LENGTH5
    getword $PLANET~PLANETINF $PLANET~PLANET_EQUIP_COLONISTS_MAX 6
    getlength $PLANET~PLANET_EQUIP_COLONISTS_MAX $PLANET~LENGTH6
    getword $PLANET~PLANETINF $PLANET~PLANET_IS_KEEPER 7
    getlength $PLANET~PLANET_IS_KEEPER $PLANET~LENGTH7
    setvar $PLANET~STARTLEN ($PLANET~LENGTH1 + ($PLANET~LENGTH2 + ($PLANET~LENGTH3 + ($PLANET~LENGTH4 + ($PLANET~LENGTH5 + ($PLANET~LENGTH6 + ($PLANET~LENGTH7 + 7)))))))
    getlength $PLANET~PLANETINF $PLANET~LENGTH_PLANET_NAME
    if ($PLANET~STARTLEN < $PLANET~LENGTH_PLANET_NAME)
      cuttext $PLANET~PLANETINF $PLANET~PLANETNAME $PLANET~STARTLEN 999
    else
      echo "*"&$PLANET~PLANETINF&" error during processing planets.*"
    end
    setvar $PLANET~PLANETLIST[$PLANET~I] $PLANET~PLANETNAME
    setvar $PLANET~PLANETLIST[$PLANET~I][1] $PLANET~PLANET_FUEL_COLONISTS_MIN
    setvar $PLANET~PLANETLIST[$PLANET~I][2] $PLANET~PLANET_FUEL_COLONISTS_MAX
    setvar $PLANET~PLANETLIST[$PLANET~I][3] $PLANET~PLANET_ORG_COLONISTS_MIN
    setvar $PLANET~PLANETLIST[$PLANET~I][4] $PLANET~PLANET_ORG_COLONISTS_MAX
    setvar $PLANET~PLANETLIST[$PLANET~I][5] $PLANET~PLANET_EQUIP_COLONISTS_MIN
    setvar $PLANET~PLANETLIST[$PLANET~I][6] $PLANET~PLANET_EQUIP_COLONISTS_MAX
    setvar $PLANET~PLANETLIST[$PLANET~I][7] $PLANET~PLANET_IS_KEEPER
    add $PLANET~I 1
  end
  setvar $PLANET~PLANETCOUNTER $PLANET~PLANET_ARRAY
  setvar $PLANET~PLANETSTATS TRUE
else
  echo "*No Planet File Found!*"
end
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:PLANET~LOADPLANETPRODS
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
setvar $PLANET~PLANETCOUNTER 0
setvar $PLANET~PLANETSTATS FALSE
loadvar $PLANET~PLANET_PRODS_FILE
fileexists $EXISTS $PLANET~PLANET_PRODS_FILE
if ($EXISTS)
  setvar $I 1
  setvar $PLANET~PLANETCOUNTER 1
  readtoarray $PLANET~PLANET_PRODS_FILE $PLANET~PLANET_PRODS_ARRAY
  setarray $PLANET~PLANETPRODS $PLANET~PLANET_PRODS_ARRAY 3
  while ($I <= $PLANET~PLANET_PRODS_ARRAY)
    setvar $planetinf $PLANET~PLANET_PRODS_ARRAY[$I]
    getword $planetinf $planet_starting_ore 1
    getlength $planet_starting_ore $len1
    getword $planetinf $planet_starting_org 2
    getlength $planet_starting_org $len2
    getword $planetinf $planet_starting_equ 3
    getlength $planet_starting_equ $len3
    setvar $len ($len1 + $len2 + $len3 + 3)
    getlength $planetinf $pname_len
    if ($len < $pname_len)
      cuttext $planetinf $pname $len 999
    else
      echo "*"&$planetinf&" error during processing planets.*"
    end
    setvar $PLANET~PLANETPRODS[$PLANET~I] $PLANET~PLANETNAME
    setvar $PLANET~PLANETPRODS[$PLANET~I][1] $PLANET~PLANET_FUEL_COLONISTS_MIN
    setvar $PLANET~PLANETPRODS[$PLANET~I][2] $PLANET~PLANET_FUEL_COLONISTS_MAX
    setvar $PLANET~PLANETPRODS[$PLANET~I][3] $PLANET~PLANET_ORG_COLONISTS_MIN
    add $I 1
  end
  setvar $PLANET~PLANETCOUNTER $PLANET~PLANET_PRODS_ARRAY
  setvar $PLANET~PLANETSTATS TRUE
end
return

include "source\include\player"
