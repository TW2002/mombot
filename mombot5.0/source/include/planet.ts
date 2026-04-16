:PLANET~COUNTPLANETS














setvar $PLANET~PLANETCOUNT 0
killtrigger PLANETGRABBER
killtrigger BEDONE
send "/"
waiton "Creds"
settextlinetrigger PLANETGRABBER :PLANETLINE "   <"
settextlinetrigger BEDONE :DONE "Land on which planet "
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
settextlinetrigger GETEND :DONE "Land on which planet "
pause
:PLANET~DONE
killtrigger GETEND
killtrigger GETLINE2
killtrigger PLANETGRABBER
killtrigger BEDONE

return
:PLANET~GETPLANETINFO




setvar $PLANET~PLANET 0
setvar $PLANET~PLANET_FUEL 0
setvar $PLANET~PLANET_FUEL_MAX 0
setvar $PLANET~PLANET_ORGANICS 0
setvar $PLANET~PLANET_ORGANICS_MAX 0
setvar $PLANET~PLANET_EQUIPMENT 0
setvar $PLANET~PLANET_EQUIPMENT_MAX 0
setvar $PLANET~PLANET_FIGHTERS 0
setvar $PLANET~PLANET_TRANSPORT 0
setvar $PLANET~PLANET_FIGHTERS_MAX 0
setvar $PLANET~CITADEL 0
setvar $PLANET~CITADEL_CREDITS 0
setvar $PLANET~ATMOSPHERE_CANNON 0
setvar $PLANET~SECTOR_CANNON 0
setvar $PLANET~PLANET_CLASS_NAME "undefined"
setvar $PLANET~PLANET_NAME "undefined"
setvar $PLANET~UNDER_CONSTRUCTION FALSE
setvar $PLANET~MAXED_LEVEL FALSE


send "*"
killtrigger PLANETINFO2
settextlinetrigger PLANETINFO2 :PLANETINFO2 "Planet #"
pause
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

settextlinetrigger CLASS :GETCLASS "Class "
pause
:PLANET~GETCLASS
setvar $PLANET~PLANET_CLASS_NAME CURRENTLINE
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
getword CURRENTLINE $PLANET~PLANET_FUEL 6
getword CURRENTLINE $PLANET~PLANET_FUEL_MAX 8
getword CURRENTLINE $PLANET~PLANETFUEL 6
getword CURRENTLINE $PLANET~PLANETFUELMAX 8
striptext $PLANET~PLANETFUEL ","
striptext $PLANET~PLANETFUELMAX ","
striptext $PLANET~PLANET_FUEL ","
striptext $PLANET~PLANET_FUEL_MAX ","
striptext $PLANET~PLANET_FUEL_COLONISTS ","
pause
:PLANET~ORGSTART

getword CURRENTLINE $PLANET~PLANET_ORGANICS_COLONISTS 2
getword CURRENTLINE $PLANET~PLANET_ORGANICS 5
getword CURRENTLINE $PLANET~PLANET_ORGANICS_MAX 7
getword CURRENTLINE $PLANET~PLANETORG 5
getword CURRENTLINE $PLANET~PLANETORGMAX 7
striptext $PLANET~PLANETORG ","
striptext $PLANET~PLANETORGMAX ","
striptext $PLANET~PLANET_ORGANICS ","
striptext $PLANET~PLANET_ORGANICS_MAX ","
striptext $PLANET~PLANET_ORGANICS_COLONISTS ","
pause
:PLANET~EQUIPSTART

getword CURRENTLINE $PLANET~PLANET_EQUIPMENT_COLONISTS 2
getword CURRENTLINE $PLANET~PLANET_EQUIPMENT 5
getword CURRENTLINE $PLANET~PLANET_EQUIPMENT_MAX 7
getword CURRENTLINE $PLANET~PLANETEQUIP 5
getword CURRENTLINE $PLANET~PLANETEQUIPMAX 7
striptext $PLANET~PLANETEQUIP ","
striptext $PLANET~PLANETEQUIPMAX ","
striptext $PLANET~PLANET_EQUIPMENT ","
striptext $PLANET~PLANET_EQUIPMENT_MAX ","
striptext $PLANET~PLANET_EQUIPMENT_COLONISTS ","
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
:PLANET~KILLPLANETTRIGGERS


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
:PLANET~GETPLANETNUMBER


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
:PLANET~GETPLANETSTATS


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


settextlinetrigger GRAB_PLANET :SHP_PLANETNAMES "> "
pause
:PLANET~SHP_PLANETNAMES
if (CURRENTLINE = "")
  goto :SHP_LOOP
end
getword CURRENTLINE $PLANET~STOPPER 1
if ($PLANET~STOPPER = "<+>")
  send "+"
  waiton "(?=List) ?"
  setvar $PLANET~NEXTPAGE 1
  goto :SHP_LOOP
elseif ($PLANET~STOPPER = "<Q>")
  goto :SHP_GETPLANETSTATS
end
if ($PLANET~NEXTPAGE = 1)
  setvar $PLANET~PLANETNAME CURRENTLINE
  striptext $PLANET~PLANETNAME "<A> "
  if ($PLANET~PLANETNAME = $PLANET~FIRSTPLANETNAME)
    goto :SHP_GETPLANETSTATS
  end
  setvar $PLANET~NEXTPAGE 0
end
add $PLANET~TOTALPLANETS 1
if ($PLANET~TOTALPLANETS = 1)
  setvar $PLANET~FIRSTPLANETNAME CURRENTLINE
  striptext $PLANET~FIRSTPLANETNAME "<A> "
end
goto :SHP_LOOP
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
  settextlinetrigger SN :SN "Planet Category #"
  pause
  :PLANET~SN
  setvar $PLANET~LINE CURRENTLINE
  getwordpos $PLANET~LINE $PLANET~POS "Class"

  cuttext $PLANET~LINE $PLANET~PLANET_NAME $PLANET~POS 999
  write $PLANET~PLANET_FILE "50000 50000 50000 50000 50000 50000 0  "&$PLANET~PLANET_NAME
end
send "qq"
return
:PLANET~LANDINGSUB


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
:PLANET~KILLLANDINGTRIGGERS

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
:PLANET~LANDONPLANETENTERCITADEL


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
:PLANET~LOADPLANETINFO


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
    gosub :PROCESS_PLANET_LINE
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
:PLANET~PROCESS_PLANET_LINE

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
return
:PLANET~MAKE_PLANET_ARRAY


setarray $PLANET~PLANET_NAMES 1000
setvar $PLANET~PLANET_NAMES[1] "LoneStar's Circle"
setvar $PLANET~PLANET_NAMES[2] "Manton Outpost"
setvar $PLANET~PLANET_NAMES[3] "Triax Annex"
setvar $PLANET~PLANET_NAMES[4] "New Ovid"
setvar $PLANET~PLANET_NAMES[5] "Napier Minor"
setvar $PLANET~PLANET_NAMES[6] "New Barite"
setvar $PLANET~PLANET_NAMES[7] "Agamotto II"
setvar $PLANET~PLANET_NAMES[8] "Poincare Thunder"
setvar $PLANET~PLANET_NAMES[9] "Camelopardus"
setvar $PLANET~PLANET_NAMES[10] "Ticonderoga Annex"
setvar $PLANET~PLANET_NAMES[11] "Cana Annex"
setvar $PLANET~PLANET_NAMES[12] "Rifts II"
setvar $PLANET~PLANET_NAMES[13] "Arago Annex"
setvar $PLANET~PLANET_NAMES[14] "Grosseteste Primus"
setvar $PLANET~PLANET_NAMES[15] "Lablon Minor"
setvar $PLANET~PLANET_NAMES[16] "Ampilean Minor"
setvar $PLANET~PLANET_NAMES[17] "Pappus II"
setvar $PLANET~PLANET_NAMES[18] "Buddha Gaya II"
setvar $PLANET~PLANET_NAMES[19] "Phlogiston Major"
setvar $PLANET~PLANET_NAMES[20] "Pilar Dawn"
setvar $PLANET~PLANET_NAMES[21] "Vergil"
setvar $PLANET~PLANET_NAMES[22] "Zennor Primus"
setvar $PLANET~PLANET_NAMES[23] "Vigara Outpost"
setvar $PLANET~PLANET_NAMES[24] "l'Hopital"
setvar $PLANET~PLANET_NAMES[25] "Axe-Gonne Annex"
setvar $PLANET~PLANET_NAMES[26] "New Plaskett"
setvar $PLANET~PLANET_NAMES[27] "Quadrono Fury"
setvar $PLANET~PLANET_NAMES[28] "Cuirass Annex"
setvar $PLANET~PLANET_NAMES[29] "Bendor II"
setvar $PLANET~PLANET_NAMES[30] "Catuz II"
setvar $PLANET~PLANET_NAMES[31] "New Barazole"
setvar $PLANET~PLANET_NAMES[32] "Burgundy Outpost"
setvar $PLANET~PLANET_NAMES[33] "Tibanna Annex"
setvar $PLANET~PLANET_NAMES[34] "New Vesta"
setvar $PLANET~PLANET_NAMES[35] "Aerobe Minor"
setvar $PLANET~PLANET_NAMES[36] "Cornu Primus"
setvar $PLANET~PLANET_NAMES[37] "Heguz Outpost"
setvar $PLANET~PLANET_NAMES[38] "Khrytarrm II"
setvar $PLANET~PLANET_NAMES[39] "Zodiac"
setvar $PLANET~PLANET_NAMES[40] "Bevey Primus"
setvar $PLANET~PLANET_NAMES[41] "Pauli Stars"
setvar $PLANET~PLANET_NAMES[42] "Axanar Outpost"
setvar $PLANET~PLANET_NAMES[43] "Veialstroum"
setvar $PLANET~PLANET_NAMES[44] "Dedendum"
setvar $PLANET~PLANET_NAMES[45] "Parthenon Outpost"
setvar $PLANET~PLANET_NAMES[46] "Ahzdar Primus"
setvar $PLANET~PLANET_NAMES[47] "Tionale Minor"
setvar $PLANET~PLANET_NAMES[48] "Fomalhaut Minor"
setvar $PLANET~PLANET_NAMES[49] "Calandra Index"
setvar $PLANET~PLANET_NAMES[50] "New Drude"
setvar $PLANET~PLANET_NAMES[51] "Troi Primus"
setvar $PLANET~PLANET_NAMES[52] "Tourmaline Primus"
setvar $PLANET~PLANET_NAMES[53] "Adurol"
setvar $PLANET~PLANET_NAMES[54] "Zaibon Outpost"
setvar $PLANET~PLANET_NAMES[55] "Cipango Annex"
setvar $PLANET~PLANET_NAMES[56] "Saxbury Annex"
setvar $PLANET~PLANET_NAMES[57] "New Oomaru"
setvar $PLANET~PLANET_NAMES[58] "Weiland Minor"
setvar $PLANET~PLANET_NAMES[59] "Bertian II"
setvar $PLANET~PLANET_NAMES[60] "Strahd Outpost"
setvar $PLANET~PLANET_NAMES[61] "Hallwachs Primus"
setvar $PLANET~PLANET_NAMES[62] "Fabrina Primus"
setvar $PLANET~PLANET_NAMES[63] "Ovid"
setvar $PLANET~PLANET_NAMES[64] "Campell II"
setvar $PLANET~PLANET_NAMES[65] "Osnabruck Major"
setvar $PLANET~PLANET_NAMES[66] "Merrimac Minor"
setvar $PLANET~PLANET_NAMES[67] "Toscanelli Major"
setvar $PLANET~PLANET_NAMES[68] "Hoover Minor"
setvar $PLANET~PLANET_NAMES[69] "Pangelinan Outpost"
setvar $PLANET~PLANET_NAMES[70] "Bethune Minor"
setvar $PLANET~PLANET_NAMES[71] "Fafnir"
setvar $PLANET~PLANET_NAMES[72] "Gideon Outpost"
setvar $PLANET~PLANET_NAMES[73] "Tajarhi Primus"
setvar $PLANET~PLANET_NAMES[74] "Catoblepas Major"
setvar $PLANET~PLANET_NAMES[75] "Steel Major"
setvar $PLANET~PLANET_NAMES[76] "Grey Mist"
setvar $PLANET~PLANET_NAMES[77] "Boreas Minor"
setvar $PLANET~PLANET_NAMES[78] "New Entrailia"
setvar $PLANET~PLANET_NAMES[79] "Saturn Primus"
setvar $PLANET~PLANET_NAMES[80] "Aerolone Major"
setvar $PLANET~PLANET_NAMES[81] "Camelot Primus"
setvar $PLANET~PLANET_NAMES[82] "Copus Outpost"
setvar $PLANET~PLANET_NAMES[83] "Bedoz Whispers"
setvar $PLANET~PLANET_NAMES[84] "Czar'ak II"
setvar $PLANET~PLANET_NAMES[85] "Mastro"
setvar $PLANET~PLANET_NAMES[86] "Venus Outpost"
setvar $PLANET~PLANET_NAMES[87] "New Io"
setvar $PLANET~PLANET_NAMES[88] "Tsox II"
setvar $PLANET~PLANET_NAMES[89] "Acropolis II"
setvar $PLANET~PLANET_NAMES[90] "CSM-101 Annex"
setvar $PLANET~PLANET_NAMES[91] "Apian II"
setvar $PLANET~PLANET_NAMES[92] "New Brodie"
setvar $PLANET~PLANET_NAMES[93] "Clone Annex"
setvar $PLANET~PLANET_NAMES[94] "K'hotan Major"
setvar $PLANET~PLANET_NAMES[95] "Indusium Primus"
setvar $PLANET~PLANET_NAMES[96] "Javelle Minor"
setvar $PLANET~PLANET_NAMES[97] "Gold Major"
setvar $PLANET~PLANET_NAMES[98] "New Poincare"
setvar $PLANET~PLANET_NAMES[99] "New Ohm"
setvar $PLANET~PLANET_NAMES[100] "Jeeves"
setvar $PLANET~PLANET_NAMES[101] "Ahriman Primus"
setvar $PLANET~PLANET_NAMES[102] "Bajor II"
setvar $PLANET~PLANET_NAMES[103] "Pickering Primus"
setvar $PLANET~PLANET_NAMES[104] "Pagoda Outpost"
setvar $PLANET~PLANET_NAMES[105] "Midgard"
setvar $PLANET~PLANET_NAMES[106] "New Lutum"
setvar $PLANET~PLANET_NAMES[107] "Curie Primus"
setvar $PLANET~PLANET_NAMES[108] "New Kerogen"
setvar $PLANET~PLANET_NAMES[109] "Brevico Outpost"
setvar $PLANET~PLANET_NAMES[110] "Cleisthenes Annex"
setvar $PLANET~PLANET_NAMES[111] "Banalg Primus"
setvar $PLANET~PLANET_NAMES[112] "Hiruko Primus"
setvar $PLANET~PLANET_NAMES[113] "New Canis Staz"
setvar $PLANET~PLANET_NAMES[114] "Herschel Prime"
setvar $PLANET~PLANET_NAMES[115] "Feesu Annex"
setvar $PLANET~PLANET_NAMES[116] "Sluagh Minor"
setvar $PLANET~PLANET_NAMES[117] "Acacia Primus"
setvar $PLANET~PLANET_NAMES[118] "Zagreus Minor"
setvar $PLANET~PLANET_NAMES[119] "Aud Outpost"
setvar $PLANET~PLANET_NAMES[120] "Leo Annex"
setvar $PLANET~PLANET_NAMES[121] "Inx Primus"
setvar $PLANET~PLANET_NAMES[122] "Plugh Major"
setvar $PLANET~PLANET_NAMES[123] "Keltcher II"
setvar $PLANET~PLANET_NAMES[124] "El Nath Major"
setvar $PLANET~PLANET_NAMES[125] "Thalim Outpost"
setvar $PLANET~PLANET_NAMES[126] "Achilles Annex"
setvar $PLANET~PLANET_NAMES[127] "New Janvier"
setvar $PLANET~PLANET_NAMES[128] "New Mare"
setvar $PLANET~PLANET_NAMES[129] "Osnabruck Minor"
setvar $PLANET~PLANET_NAMES[130] "New Atropine"
setvar $PLANET~PLANET_NAMES[131] "Hyksos Outpost"
setvar $PLANET~PLANET_NAMES[132] "Ionicus Annex"
setvar $PLANET~PLANET_NAMES[133] "Atwood Annex"
setvar $PLANET~PLANET_NAMES[134] "Ektron II"
setvar $PLANET~PLANET_NAMES[135] "New Debarre"
setvar $PLANET~PLANET_NAMES[136] "New Hubble"
setvar $PLANET~PLANET_NAMES[137] "Acridine Annex"
setvar $PLANET~PLANET_NAMES[138] "Atchison Annex"
setvar $PLANET~PLANET_NAMES[139] "Aeschylus Annex"
setvar $PLANET~PLANET_NAMES[140] "Triceratops II"
setvar $PLANET~PLANET_NAMES[141] "Ovid 962 Outpost"
setvar $PLANET~PLANET_NAMES[142] "Laon Annex"
setvar $PLANET~PLANET_NAMES[143] "Feesu II"
setvar $PLANET~PLANET_NAMES[144] "Pysadi Outpost"
setvar $PLANET~PLANET_NAMES[145] "Bansin II"
setvar $PLANET~PLANET_NAMES[146] "Grimaldi Outpost"
setvar $PLANET~PLANET_NAMES[147] "Kashyyyk Annex"
setvar $PLANET~PLANET_NAMES[148] "New Pickering"
setvar $PLANET~PLANET_NAMES[149] "Sardaukar"
setvar $PLANET~PLANET_NAMES[150] "Poritrin Annex"
setvar $PLANET~PLANET_NAMES[151] "Biela Minor"
setvar $PLANET~PLANET_NAMES[152] "Autun Minor"
setvar $PLANET~PLANET_NAMES[153] "Akira Primus"
setvar $PLANET~PLANET_NAMES[154] "Bohemia III"
setvar $PLANET~PLANET_NAMES[155] "Caspan Primus"
setvar $PLANET~PLANET_NAMES[156] "Barite Minor"
setvar $PLANET~PLANET_NAMES[157] "Loki Outpost"
setvar $PLANET~PLANET_NAMES[158] "Argos Primus"
setvar $PLANET~PLANET_NAMES[159] "Drake Annex"
setvar $PLANET~PLANET_NAMES[160] "Jaspilate Outpost"
setvar $PLANET~PLANET_NAMES[161] "New Tacaxeb"
setvar $PLANET~PLANET_NAMES[162] "Brevico Primus"
setvar $PLANET~PLANET_NAMES[163] "Bolivar Minor"
setvar $PLANET~PLANET_NAMES[164] "Trennen Major"
setvar $PLANET~PLANET_NAMES[165] "Bainite Annex"
setvar $PLANET~PLANET_NAMES[166] "Amber Primus"
setvar $PLANET~PLANET_NAMES[167] "Remorhaz"
setvar $PLANET~PLANET_NAMES[168] "Politzer"
setvar $PLANET~PLANET_NAMES[169] "Thisbe"
setvar $PLANET~PLANET_NAMES[170] "Ekinus"
setvar $PLANET~PLANET_NAMES[171] "Agamotto Annex"
setvar $PLANET~PLANET_NAMES[172] "Ixzotz"
setvar $PLANET~PLANET_NAMES[173] "Coliar"
setvar $PLANET~PLANET_NAMES[174] "Dragon Major"
setvar $PLANET~PLANET_NAMES[175] "Minimi Outpost"
setvar $PLANET~PLANET_NAMES[176] "Comani II"
setvar $PLANET~PLANET_NAMES[177] "Saladin Major"
setvar $PLANET~PLANET_NAMES[178] "New CSM-101"
setvar $PLANET~PLANET_NAMES[179] "Winston"
setvar $PLANET~PLANET_NAMES[180] "Putman Outpost"
setvar $PLANET~PLANET_NAMES[181] "Zarathrustra"
setvar $PLANET~PLANET_NAMES[182] "Bacchus Outpost"
setvar $PLANET~PLANET_NAMES[183] "Demantoid Annex"
setvar $PLANET~PLANET_NAMES[184] "Aarite Outpost"
setvar $PLANET~PLANET_NAMES[185] "Langres Primus"
setvar $PLANET~PLANET_NAMES[186] "New Myk"
setvar $PLANET~PLANET_NAMES[187] "Castalia Minor"
setvar $PLANET~PLANET_NAMES[188] "Feyd Major"
setvar $PLANET~PLANET_NAMES[189] "Gauss"
setvar $PLANET~PLANET_NAMES[190] "Adurol Primus"
setvar $PLANET~PLANET_NAMES[191] "Pingos Annex"
setvar $PLANET~PLANET_NAMES[192] "Shih Hwang-ti Major"
setvar $PLANET~PLANET_NAMES[193] "Homonculous Annex"
setvar $PLANET~PLANET_NAMES[194] "Calandra Annex"
setvar $PLANET~PLANET_NAMES[195] "Tartarus Minor"
setvar $PLANET~PLANET_NAMES[196] "Njord Major"
setvar $PLANET~PLANET_NAMES[197] "Melusine II"
setvar $PLANET~PLANET_NAMES[198] "Cepheus"
setvar $PLANET~PLANET_NAMES[199] "Huggins Primus"
setvar $PLANET~PLANET_NAMES[200] "Buchanan"
setvar $PLANET~PLANET_NAMES[201] "Bleigh Outpost"
setvar $PLANET~PLANET_NAMES[202] "Abohm Annex"
setvar $PLANET~PLANET_NAMES[203] "Freaque Primus"
setvar $PLANET~PLANET_NAMES[204] "Bespin Outpost"
setvar $PLANET~PLANET_NAMES[205] "Shklovsky"
setvar $PLANET~PLANET_NAMES[206] "Heimdall Minor"
setvar $PLANET~PLANET_NAMES[207] "New Bentylol"
setvar $PLANET~PLANET_NAMES[208] "Lebeau"
setvar $PLANET~PLANET_NAMES[209] "New Siva"
setvar $PLANET~PLANET_NAMES[210] "Biggs Outpost"
setvar $PLANET~PLANET_NAMES[211] "Auroran Major"
setvar $PLANET~PLANET_NAMES[212] "Phoenix"
setvar $PLANET~PLANET_NAMES[213] "Chaeta Major"
setvar $PLANET~PLANET_NAMES[214] "Anacel Minor"
setvar $PLANET~PLANET_NAMES[215] "Zeycude Minor"
setvar $PLANET~PLANET_NAMES[216] "Akarso Major"
setvar $PLANET~PLANET_NAMES[217] "Bifrost Primus"
setvar $PLANET~PLANET_NAMES[218] "Jolotre Outpost"
setvar $PLANET~PLANET_NAMES[219] "New Tutankhamen"
setvar $PLANET~PLANET_NAMES[220] "Adams Outpost"
setvar $PLANET~PLANET_NAMES[221] "Feynman Minor"
setvar $PLANET~PLANET_NAMES[222] "Grant Primus"
setvar $PLANET~PLANET_NAMES[223] "Aeon Primus"
setvar $PLANET~PLANET_NAMES[224] "Sacajawea Minor"
setvar $PLANET~PLANET_NAMES[225] "Thor Outpost"
setvar $PLANET~PLANET_NAMES[226] "New Kashyyyk"
setvar $PLANET~PLANET_NAMES[227] "Underwood Minor"
setvar $PLANET~PLANET_NAMES[228] "Yukawa Major"
setvar $PLANET~PLANET_NAMES[229] "Feesu Minor"
setvar $PLANET~PLANET_NAMES[230] "Accurbron Major"
setvar $PLANET~PLANET_NAMES[231] "Parthenon Major"
setvar $PLANET~PLANET_NAMES[232] "Calan Outpost"
setvar $PLANET~PLANET_NAMES[233] "Tali Annex"
setvar $PLANET~PLANET_NAMES[234] "Cogri Outpost"
setvar $PLANET~PLANET_NAMES[235] "Atwood Minor"
setvar $PLANET~PLANET_NAMES[236] "Aldebaran"
setvar $PLANET~PLANET_NAMES[237] "New Atreides"
setvar $PLANET~PLANET_NAMES[238] "Abae Annex"
setvar $PLANET~PLANET_NAMES[239] "Aurva Primus"
setvar $PLANET~PLANET_NAMES[240] "Pogson Primus"
setvar $PLANET~PLANET_NAMES[241] "Degtyarev Major"
setvar $PLANET~PLANET_NAMES[242] "Wollaston"
setvar $PLANET~PLANET_NAMES[243] "Eagle Annex"
setvar $PLANET~PLANET_NAMES[244] "Atacon Annex"
setvar $PLANET~PLANET_NAMES[245] "Lanth Major"
setvar $PLANET~PLANET_NAMES[246] "Reber Primus"
setvar $PLANET~PLANET_NAMES[247] "Aleph Minor"
setvar $PLANET~PLANET_NAMES[248] "Dollond"
setvar $PLANET~PLANET_NAMES[249] "H'Catha Minor"
setvar $PLANET~PLANET_NAMES[250] "New Bacta"
setvar $PLANET~PLANET_NAMES[251] "Galina Annex"
setvar $PLANET~PLANET_NAMES[252] "New Nadrin"
setvar $PLANET~PLANET_NAMES[253] "Ajacs Primus"
setvar $PLANET~PLANET_NAMES[254] "Holland Annex"
setvar $PLANET~PLANET_NAMES[255] "New Baraka"
setvar $PLANET~PLANET_NAMES[256] "Alencika Minor"
setvar $PLANET~PLANET_NAMES[257] "Wypoc"
setvar $PLANET~PLANET_NAMES[258] "Mytus Major"
setvar $PLANET~PLANET_NAMES[259] "Garuda Outpost"
setvar $PLANET~PLANET_NAMES[260] "Nog Outpost"
setvar $PLANET~PLANET_NAMES[261] "Arcturus Annex"
setvar $PLANET~PLANET_NAMES[262] "El Cid II"
setvar $PLANET~PLANET_NAMES[263] "Autun"
setvar $PLANET~PLANET_NAMES[264] "Omega Major"
setvar $PLANET~PLANET_NAMES[265] "Antike Outpost"
setvar $PLANET~PLANET_NAMES[266] "Triceratops Primus"
setvar $PLANET~PLANET_NAMES[267] "Caladan II"
setvar $PLANET~PLANET_NAMES[268] "Gnosis II"
setvar $PLANET~PLANET_NAMES[269] "Freedom"
setvar $PLANET~PLANET_NAMES[270] "Solomon Primus"
setvar $PLANET~PLANET_NAMES[271] "Flamarion Major"
setvar $PLANET~PLANET_NAMES[272] "Massassi Minor"
setvar $PLANET~PLANET_NAMES[273] "Baclofin Major"
setvar $PLANET~PLANET_NAMES[274] "New Berubigen"
setvar $PLANET~PLANET_NAMES[275] "Hydra"
setvar $PLANET~PLANET_NAMES[276] "Ylaven Annex"
setvar $PLANET~PLANET_NAMES[277] "Shcawbe"
setvar $PLANET~PLANET_NAMES[278] "Dallia Primus"
setvar $PLANET~PLANET_NAMES[279] "New FerNics"
setvar $PLANET~PLANET_NAMES[280] "Cyzicus Outpost"
setvar $PLANET~PLANET_NAMES[281] "Belenus"
setvar $PLANET~PLANET_NAMES[282] "Kudu Minor"
setvar $PLANET~PLANET_NAMES[283] "Shadout"
setvar $PLANET~PLANET_NAMES[284] "Tetanus Major"
setvar $PLANET~PLANET_NAMES[285] "Mecha Major"
setvar $PLANET~PLANET_NAMES[286] "Blunderbuss Outpost"
setvar $PLANET~PLANET_NAMES[287] "Castile"
setvar $PLANET~PLANET_NAMES[288] "Dollond Annex"
setvar $PLANET~PLANET_NAMES[289] "Condyole II"
setvar $PLANET~PLANET_NAMES[290] "Benemid Outpost"
setvar $PLANET~PLANET_NAMES[291] "New Kether"
setvar $PLANET~PLANET_NAMES[292] "Scarabaeus"
setvar $PLANET~PLANET_NAMES[293] "Spector Major"
setvar $PLANET~PLANET_NAMES[294] "Nambu Annex"
setvar $PLANET~PLANET_NAMES[295] "Yamoto II"
setvar $PLANET~PLANET_NAMES[296] "Lockyer Major"
setvar $PLANET~PLANET_NAMES[297] "New Huggins"
setvar $PLANET~PLANET_NAMES[298] "Gorram"
setvar $PLANET~PLANET_NAMES[299] "Minimi Minor"
setvar $PLANET~PLANET_NAMES[300] "Sorel Major"
setvar $PLANET~PLANET_NAMES[301] "El Nath Primus"
setvar $PLANET~PLANET_NAMES[302] "Lumineaux Outpost"
setvar $PLANET~PLANET_NAMES[303] "Richter Primus"
setvar $PLANET~PLANET_NAMES[304] "Ilianeou"
setvar $PLANET~PLANET_NAMES[305] "Xyvitix Annex"
setvar $PLANET~PLANET_NAMES[306] "Benisone Minor"
setvar $PLANET~PLANET_NAMES[307] "Fanning"
setvar $PLANET~PLANET_NAMES[308] "Flamsteed"
setvar $PLANET~PLANET_NAMES[309] "Shklovsky Primus"
setvar $PLANET~PLANET_NAMES[310] "Toshi Annex"
setvar $PLANET~PLANET_NAMES[311] "New Bumex"
setvar $PLANET~PLANET_NAMES[312] "Noirmoutier"
setvar $PLANET~PLANET_NAMES[313] "Macross"
setvar $PLANET~PLANET_NAMES[314] "Du Fay Major"
setvar $PLANET~PLANET_NAMES[315] "Ross Outpost"
setvar $PLANET~PLANET_NAMES[316] "Xi Primus"
setvar $PLANET~PLANET_NAMES[317] "Leyline II"
setvar $PLANET~PLANET_NAMES[318] "Vergil Minor"
setvar $PLANET~PLANET_NAMES[319] "Diocletian Outpost"
setvar $PLANET~PLANET_NAMES[320] "Eisenhower Minor"
setvar $PLANET~PLANET_NAMES[321] "Cithaeron Annex"
setvar $PLANET~PLANET_NAMES[322] "Pockels Major"
setvar $PLANET~PLANET_NAMES[323] "Rangent Major"
setvar $PLANET~PLANET_NAMES[324] "Pascal Annex"
setvar $PLANET~PLANET_NAMES[325] "Avitene Primus"
setvar $PLANET~PLANET_NAMES[326] "Fantasia Primus"
setvar $PLANET~PLANET_NAMES[327] "Baridium II"
setvar $PLANET~PLANET_NAMES[328] "Von Zacjh II"
setvar $PLANET~PLANET_NAMES[329] "Jasmine Annex"
setvar $PLANET~PLANET_NAMES[330] "Bagasse II"
setvar $PLANET~PLANET_NAMES[331] "Wern"
setvar $PLANET~PLANET_NAMES[332] "Tenelphi Primus"
setvar $PLANET~PLANET_NAMES[333] "Elmarin Major"
setvar $PLANET~PLANET_NAMES[334] "New Rech"
setvar $PLANET~PLANET_NAMES[335] "Massassi Major"
setvar $PLANET~PLANET_NAMES[336] "Tintao"
setvar $PLANET~PLANET_NAMES[337] "Engadine II"
setvar $PLANET~PLANET_NAMES[338] "New Ektron"
setvar $PLANET~PLANET_NAMES[339] "Ochecate"
setvar $PLANET~PLANET_NAMES[340] "Peleus Minor"
setvar $PLANET~PLANET_NAMES[341] "Balboa Minor"
setvar $PLANET~PLANET_NAMES[342] "New Phobos"
setvar $PLANET~PLANET_NAMES[343] "Elmarin II"
setvar $PLANET~PLANET_NAMES[344] "Garion Primus"
setvar $PLANET~PLANET_NAMES[345] "Sharrip Major"
setvar $PLANET~PLANET_NAMES[346] "Breughel"
setvar $PLANET~PLANET_NAMES[347] "Eisenhower II"
setvar $PLANET~PLANET_NAMES[348] "Cusa II"
setvar $PLANET~PLANET_NAMES[349] "Bralgu Annex"
setvar $PLANET~PLANET_NAMES[350] "Copernicus II"
setvar $PLANET~PLANET_NAMES[351] "Putman Annex"
setvar $PLANET~PLANET_NAMES[352] "Pylus Minor"
setvar $PLANET~PLANET_NAMES[353] "Alkaid"
setvar $PLANET~PLANET_NAMES[354] "Proudelxak Primus"
setvar $PLANET~PLANET_NAMES[355] "Putman II"
setvar $PLANET~PLANET_NAMES[356] "Ganymede Major"
setvar $PLANET~PLANET_NAMES[357] "Hotchkiss II"
setvar $PLANET~PLANET_NAMES[358] "Eikonal Primus"
setvar $PLANET~PLANET_NAMES[359] "New Nelson"
setvar $PLANET~PLANET_NAMES[360] "Behemoth Annex"
setvar $PLANET~PLANET_NAMES[361] "Daleth"
setvar $PLANET~PLANET_NAMES[362] "Circe Primus"
setvar $PLANET~PLANET_NAMES[363] "Ueilerm Annex"
setvar $PLANET~PLANET_NAMES[364] "Winston Primus"
setvar $PLANET~PLANET_NAMES[365] "Roentgen II"
setvar $PLANET~PLANET_NAMES[366] "New Bentyl"
setvar $PLANET~PLANET_NAMES[367] "Bainite Primus"
setvar $PLANET~PLANET_NAMES[368] "Uranus Minor"
setvar $PLANET~PLANET_NAMES[369] "Triumviri Outpost"
setvar $PLANET~PLANET_NAMES[370] "Dearth Minor"
setvar $PLANET~PLANET_NAMES[371] "Quare Minor"
setvar $PLANET~PLANET_NAMES[372] "Ariel II"
setvar $PLANET~PLANET_NAMES[373] "Agamotto"
setvar $PLANET~PLANET_NAMES[374] "Mithras II"
setvar $PLANET~PLANET_NAMES[375] "Agena II"
setvar $PLANET~PLANET_NAMES[376] "Anchorhead Minor"
setvar $PLANET~PLANET_NAMES[377] "Atarax Major"
setvar $PLANET~PLANET_NAMES[378] "T'xe"
setvar $PLANET~PLANET_NAMES[379] "Fedaykin Major"
setvar $PLANET~PLANET_NAMES[380] "Kai Outpost"
setvar $PLANET~PLANET_NAMES[381] "Pompey Major"
setvar $PLANET~PLANET_NAMES[382] "Jarsone Major"
setvar $PLANET~PLANET_NAMES[383] "Percy 1640 Major"
setvar $PLANET~PLANET_NAMES[384] "Kraken Outpost"
setvar $PLANET~PLANET_NAMES[385] "Tiree"
setvar $PLANET~PLANET_NAMES[386] "New Corbiet"
setvar $PLANET~PLANET_NAMES[387] "Celepina Minor"
setvar $PLANET~PLANET_NAMES[388] "Augustus Annex"
setvar $PLANET~PLANET_NAMES[389] "New H'Catha"
setvar $PLANET~PLANET_NAMES[390] "New Aldrin"
setvar $PLANET~PLANET_NAMES[391] "Bacarate II"
setvar $PLANET~PLANET_NAMES[392] "Drude II"
setvar $PLANET~PLANET_NAMES[393] "Millennium"
setvar $PLANET~PLANET_NAMES[394] "Kwisatz"
setvar $PLANET~PLANET_NAMES[395] "Rebka"
setvar $PLANET~PLANET_NAMES[396] "Rebka II"
setvar $PLANET~PLANET_NAMES[397] "Flamsteed Outpost"
setvar $PLANET~PLANET_NAMES[398] "Garibaldi Minor"
setvar $PLANET~PLANET_NAMES[399] "Hounstyr Annex"
setvar $PLANET~PLANET_NAMES[400] "Flinte"
setvar $PLANET~PLANET_NAMES[401] "Dodonna Major"
setvar $PLANET~PLANET_NAMES[402] "Ueilerm Minor"
setvar $PLANET~PLANET_NAMES[403] "Kaula"
setvar $PLANET~PLANET_NAMES[404] "Orkney Outpost"
setvar $PLANET~PLANET_NAMES[405] "Appollyon Primus"
setvar $PLANET~PLANET_NAMES[406] "New Natoko"
setvar $PLANET~PLANET_NAMES[407] "Heroni Major"
setvar $PLANET~PLANET_NAMES[408] "Haderach Primus"
setvar $PLANET~PLANET_NAMES[409] "Dinom Major"
setvar $PLANET~PLANET_NAMES[410] "Darion Minor"
setvar $PLANET~PLANET_NAMES[411] "Medusa II"
setvar $PLANET~PLANET_NAMES[412] "Kaladan Outpost"
setvar $PLANET~PLANET_NAMES[413] "Kep Salu Annex"
setvar $PLANET~PLANET_NAMES[414] "New Minos"
setvar $PLANET~PLANET_NAMES[415] "Jeeves Major"
setvar $PLANET~PLANET_NAMES[416] "Exodus"
setvar $PLANET~PLANET_NAMES[417] "Euler Annex"
setvar $PLANET~PLANET_NAMES[418] "Capricornus II"
setvar $PLANET~PLANET_NAMES[419] "Milan Primus"
setvar $PLANET~PLANET_NAMES[420] "Beben Outpost"
setvar $PLANET~PLANET_NAMES[421] "New Kohlrausch"
setvar $PLANET~PLANET_NAMES[422] "Brombay"
setvar $PLANET~PLANET_NAMES[423] "Alvarado Minor"
setvar $PLANET~PLANET_NAMES[424] "New Franchi"
setvar $PLANET~PLANET_NAMES[425] "Melior"
setvar $PLANET~PLANET_NAMES[426] "Atrivis"
setvar $PLANET~PLANET_NAMES[427] "Lepton II"
setvar $PLANET~PLANET_NAMES[428] "Dyson Outpost"
setvar $PLANET~PLANET_NAMES[429] "Feyd Outpost"
setvar $PLANET~PLANET_NAMES[430] "Wypoc II"
setvar $PLANET~PLANET_NAMES[431] "Peridot Primus"
setvar $PLANET~PLANET_NAMES[432] "Yona II"
setvar $PLANET~PLANET_NAMES[433] "Caduceus Major"
setvar $PLANET~PLANET_NAMES[434] "Kruhious II"
setvar $PLANET~PLANET_NAMES[435] "Melior Outpost"
setvar $PLANET~PLANET_NAMES[436] "Ryloth Major"
setvar $PLANET~PLANET_NAMES[437] "Becquerel Annex"
setvar $PLANET~PLANET_NAMES[438] "Intrepid"
setvar $PLANET~PLANET_NAMES[439] "Gascogne Annex"
setvar $PLANET~PLANET_NAMES[440] "Free State II"
setvar $PLANET~PLANET_NAMES[441] "Ozawa Minor"
setvar $PLANET~PLANET_NAMES[442] "Mewey Primus"
setvar $PLANET~PLANET_NAMES[443] "Xylene Outpost"
setvar $PLANET~PLANET_NAMES[444] "Pohl Annex"
setvar $PLANET~PLANET_NAMES[445] "Absarokite"
setvar $PLANET~PLANET_NAMES[446] "Phardos Annex"
setvar $PLANET~PLANET_NAMES[447] "Axolotl Minor"
setvar $PLANET~PLANET_NAMES[448] "van der Waals Primus"
setvar $PLANET~PLANET_NAMES[449] "Hydropon"
setvar $PLANET~PLANET_NAMES[450] "Tesla Minor"
setvar $PLANET~PLANET_NAMES[451] "Kender Annex"
setvar $PLANET~PLANET_NAMES[452] "Aphrodite Primus"
setvar $PLANET~PLANET_NAMES[453] "New Addax"
setvar $PLANET~PLANET_NAMES[454] "New Castile"
setvar $PLANET~PLANET_NAMES[455] "Atlas Major"
setvar $PLANET~PLANET_NAMES[456] "Van de Graaff II"
setvar $PLANET~PLANET_NAMES[457] "Chrysa II"
setvar $PLANET~PLANET_NAMES[458] "Dirac Outpost"
setvar $PLANET~PLANET_NAMES[459] "Aachen Annex"
setvar $PLANET~PLANET_NAMES[460] "Skinfaxi II"
setvar $PLANET~PLANET_NAMES[461] "Carthage Primus"
setvar $PLANET~PLANET_NAMES[462] "Elmarin Outpost"
setvar $PLANET~PLANET_NAMES[463] "Mikado Primus"
setvar $PLANET~PLANET_NAMES[464] "Rydberg Minor"
setvar $PLANET~PLANET_NAMES[465] "Hallwachs Major"
setvar $PLANET~PLANET_NAMES[466] "Banderlog Major"
setvar $PLANET~PLANET_NAMES[467] "New Grosseteste"
setvar $PLANET~PLANET_NAMES[468] "Caliver II"
setvar $PLANET~PLANET_NAMES[469] "Jokwa Primus"
setvar $PLANET~PLANET_NAMES[470] "New Auxerre"
setvar $PLANET~PLANET_NAMES[471] "Demilich"
setvar $PLANET~PLANET_NAMES[472] "New Karelia"
setvar $PLANET~PLANET_NAMES[473] "Rueschhoff"
setvar $PLANET~PLANET_NAMES[474] "Taro Minor"
setvar $PLANET~PLANET_NAMES[475] "Dianoga Annex"
setvar $PLANET~PLANET_NAMES[476] "Quevedo Major"
setvar $PLANET~PLANET_NAMES[477] "New Leviathan"
setvar $PLANET~PLANET_NAMES[478] "Raydrad Primus"
setvar $PLANET~PLANET_NAMES[479] "New Daleth"
setvar $PLANET~PLANET_NAMES[480] "Metztla'Xym"
setvar $PLANET~PLANET_NAMES[481] "Aix-la-Chapelle Annex"
setvar $PLANET~PLANET_NAMES[482] "Spume Outpost"
setvar $PLANET~PLANET_NAMES[483] "Lysander II"
setvar $PLANET~PLANET_NAMES[484] "Simorg Minor"
setvar $PLANET~PLANET_NAMES[485] "Van Maanen Outpost"
setvar $PLANET~PLANET_NAMES[486] "Alexander II"
setvar $PLANET~PLANET_NAMES[487] "Istar Annex"
setvar $PLANET~PLANET_NAMES[488] "Crecy Major"
setvar $PLANET~PLANET_NAMES[489] "Bethune Outpost"
setvar $PLANET~PLANET_NAMES[490] "Cittert Major"
setvar $PLANET~PLANET_NAMES[491] "Edinina II"
setvar $PLANET~PLANET_NAMES[492] "Imbrium"
setvar $PLANET~PLANET_NAMES[493] "New Tycho"
setvar $PLANET~PLANET_NAMES[494] "Nordenfelt Annex"
setvar $PLANET~PLANET_NAMES[495] "Dixon Primus"
setvar $PLANET~PLANET_NAMES[496] "Biggs Major"
setvar $PLANET~PLANET_NAMES[497] "Far Station II"
setvar $PLANET~PLANET_NAMES[498] "Puparkin II"
setvar $PLANET~PLANET_NAMES[499] "New Duras"
setvar $PLANET~PLANET_NAMES[500] "Freedom II"
setvar $PLANET~PLANET_NAMES[501] "Ardonyx Major"
setvar $PLANET~PLANET_NAMES[502] "Focaline Major"
setvar $PLANET~PLANET_NAMES[503] "Jacent II"
setvar $PLANET~PLANET_NAMES[504] "Jimson Primus"
setvar $PLANET~PLANET_NAMES[505] "Andromeda Primus"
setvar $PLANET~PLANET_NAMES[506] "Adenine Outpost"
setvar $PLANET~PLANET_NAMES[507] "Ampere Major"
setvar $PLANET~PLANET_NAMES[508] "Cordoba Major"
setvar $PLANET~PLANET_NAMES[509] "Garion Major"
setvar $PLANET~PLANET_NAMES[510] "Gormenghast Primus"
setvar $PLANET~PLANET_NAMES[511] "Roxana II"
setvar $PLANET~PLANET_NAMES[512] "New Duriron"
setvar $PLANET~PLANET_NAMES[513] "Islip Annex"
setvar $PLANET~PLANET_NAMES[514] "New Powaza"
setvar $PLANET~PLANET_NAMES[515] "Thisbe II"
setvar $PLANET~PLANET_NAMES[516] "Ney Annex"
setvar $PLANET~PLANET_NAMES[517] "Phlogiston Annex"
setvar $PLANET~PLANET_NAMES[518] "Ganymede II"
setvar $PLANET~PLANET_NAMES[519] "Joshi Major"
setvar $PLANET~PLANET_NAMES[520] "Hajj Annex"
setvar $PLANET~PLANET_NAMES[521] "Aceta Major"
setvar $PLANET~PLANET_NAMES[522] "Idris II"
setvar $PLANET~PLANET_NAMES[523] "New Gelugon"
setvar $PLANET~PLANET_NAMES[524] "Shai-Hulud II"
setvar $PLANET~PLANET_NAMES[525] "Towers Major"
setvar $PLANET~PLANET_NAMES[526] "Tulan Primus"
setvar $PLANET~PLANET_NAMES[527] "Massassi Primus"
setvar $PLANET~PLANET_NAMES[528] "Taaug Annex"
setvar $PLANET~PLANET_NAMES[529] "Baruch Outpost"
setvar $PLANET~PLANET_NAMES[530] "Castalia"
setvar $PLANET~PLANET_NAMES[531] "Penkwhar Outpost"
setvar $PLANET~PLANET_NAMES[532] "Baugi Outpost"
setvar $PLANET~PLANET_NAMES[533] "Draconis Outpost"
setvar $PLANET~PLANET_NAMES[534] "Crimson II"
setvar $PLANET~PLANET_NAMES[535] "Smoug Major"
setvar $PLANET~PLANET_NAMES[536] "Asmussen Primus"
setvar $PLANET~PLANET_NAMES[537] "Oort"
setvar $PLANET~PLANET_NAMES[538] "Rousseau Major"
setvar $PLANET~PLANET_NAMES[539] "Lahara Outpost"
setvar $PLANET~PLANET_NAMES[540] "Belemmite Primus"
setvar $PLANET~PLANET_NAMES[541] "Mainz Outpost"
setvar $PLANET~PLANET_NAMES[542] "Corbino Outpost"
setvar $PLANET~PLANET_NAMES[543] "Tanar'ri Major"
setvar $PLANET~PLANET_NAMES[544] "Conway"
setvar $PLANET~PLANET_NAMES[545] "Raweh II"
setvar $PLANET~PLANET_NAMES[546] "New Hefry"
setvar $PLANET~PLANET_NAMES[547] "Pinus Nigra Annex"
setvar $PLANET~PLANET_NAMES[548] "Celepina Primus"
setvar $PLANET~PLANET_NAMES[549] "Zaire Outpost"
setvar $PLANET~PLANET_NAMES[550] "Medusa Annex"
setvar $PLANET~PLANET_NAMES[551] "Tyrfing Outpost"
setvar $PLANET~PLANET_NAMES[552] "Gormenghast Minor"
setvar $PLANET~PLANET_NAMES[553] "Iliopoulos Annex"
setvar $PLANET~PLANET_NAMES[554] "New Sacha"
setvar $PLANET~PLANET_NAMES[555] "Tulan Outpost"
setvar $PLANET~PLANET_NAMES[556] "Chaucer Primus"
setvar $PLANET~PLANET_NAMES[557] "Carbonara Major"
setvar $PLANET~PLANET_NAMES[558] "Zivije Minor"
setvar $PLANET~PLANET_NAMES[559] "New Grant"
setvar $PLANET~PLANET_NAMES[560] "Hadron Annex"
setvar $PLANET~PLANET_NAMES[561] "New Chattur"
setvar $PLANET~PLANET_NAMES[562] "Simeon Outpost"
setvar $PLANET~PLANET_NAMES[563] "Moriarity Major"
setvar $PLANET~PLANET_NAMES[564] "Heisenberg Outpost"
setvar $PLANET~PLANET_NAMES[565] "Vingolf Major"
setvar $PLANET~PLANET_NAMES[566] "Mammon Outpost"
setvar $PLANET~PLANET_NAMES[567] "Ceres Outpost"
setvar $PLANET~PLANET_NAMES[568] "Mantene"
setvar $PLANET~PLANET_NAMES[569] "Capon Annex"
setvar $PLANET~PLANET_NAMES[570] "Pockels Outpost"
setvar $PLANET~PLANET_NAMES[571] "New Valiant"
setvar $PLANET~PLANET_NAMES[572] "Buchanan II"
setvar $PLANET~PLANET_NAMES[573] "Bevey Minor"
setvar $PLANET~PLANET_NAMES[574] "New DarGer"
setvar $PLANET~PLANET_NAMES[575] "Tatooine Primus"
setvar $PLANET~PLANET_NAMES[576] "Rabwhar Primus"
setvar $PLANET~PLANET_NAMES[577] "Trin Minor"
setvar $PLANET~PLANET_NAMES[578] "Tyr Annex"
setvar $PLANET~PLANET_NAMES[579] "Klystron"
setvar $PLANET~PLANET_NAMES[580] "Zamine"
setvar $PLANET~PLANET_NAMES[581] "Canis Staz II"
setvar $PLANET~PLANET_NAMES[582] "Gungnir Minor"
setvar $PLANET~PLANET_NAMES[583] "Alupent Major"
setvar $PLANET~PLANET_NAMES[584] "Gideon Minor"
setvar $PLANET~PLANET_NAMES[585] "Raweh Annex"
setvar $PLANET~PLANET_NAMES[586] "Kamerlingh Annex"
setvar $PLANET~PLANET_NAMES[587] "Camazotz Minor"
setvar $PLANET~PLANET_NAMES[588] "Aeolus II"
setvar $PLANET~PLANET_NAMES[589] "Grant Annex"
setvar $PLANET~PLANET_NAMES[590] "Betelgeuse"
setvar $PLANET~PLANET_NAMES[591] "New Dammar"
setvar $PLANET~PLANET_NAMES[592] "Ursula"
setvar $PLANET~PLANET_NAMES[593] "Fermi Minor"
setvar $PLANET~PLANET_NAMES[594] "New Mewey"
setvar $PLANET~PLANET_NAMES[595] "Elixabeth Outpost"
setvar $PLANET~PLANET_NAMES[596] "Glashow II"
setvar $PLANET~PLANET_NAMES[597] "Inchin"
setvar $PLANET~PLANET_NAMES[598] "Antike"
setvar $PLANET~PLANET_NAMES[599] "Iliopoulos Primus"
setvar $PLANET~PLANET_NAMES[600] "Sigma Annex"
setvar $PLANET~PLANET_NAMES[601] "Tetanus II"
setvar $PLANET~PLANET_NAMES[602] "New Laika"
setvar $PLANET~PLANET_NAMES[603] "Lorentz"
setvar $PLANET~PLANET_NAMES[604] "Hefry"
setvar $PLANET~PLANET_NAMES[605] "Smoug Annex"
setvar $PLANET~PLANET_NAMES[606] "New Rutledge"
setvar $PLANET~PLANET_NAMES[607] "Knossos"
setvar $PLANET~PLANET_NAMES[608] "Cyclone II"
setvar $PLANET~PLANET_NAMES[609] "New Milan"
setvar $PLANET~PLANET_NAMES[610] "Mammon Major"
setvar $PLANET~PLANET_NAMES[611] "Indium II"
setvar $PLANET~PLANET_NAMES[612] "Tleilaxu Annex"
setvar $PLANET~PLANET_NAMES[613] "Krosec II"
setvar $PLANET~PLANET_NAMES[614] "New Surplus"
setvar $PLANET~PLANET_NAMES[615] "Aerolone Primus"
setvar $PLANET~PLANET_NAMES[616] "Nerewhon Outpost"
setvar $PLANET~PLANET_NAMES[617] "Trexalon Primus"
setvar $PLANET~PLANET_NAMES[618] "Spider Primus"
setvar $PLANET~PLANET_NAMES[619] "Ontalak"
setvar $PLANET~PLANET_NAMES[620] "Benemid Minor"
setvar $PLANET~PLANET_NAMES[621] "Belenus Primus"
setvar $PLANET~PLANET_NAMES[622] "Bismarck"
setvar $PLANET~PLANET_NAMES[623] "New Carson"
setvar $PLANET~PLANET_NAMES[624] "Rayl Major"
setvar $PLANET~PLANET_NAMES[625] "New Fedaykin"
setvar $PLANET~PLANET_NAMES[626] "Ent II"
setvar $PLANET~PLANET_NAMES[627] "Cetacean II"
setvar $PLANET~PLANET_NAMES[628] "Artemis"
setvar $PLANET~PLANET_NAMES[629] "Shakespeare Major"
setvar $PLANET~PLANET_NAMES[630] "Pepin Minor"
setvar $PLANET~PLANET_NAMES[631] "Priedo Annex"
setvar $PLANET~PLANET_NAMES[632] "Ryloth Annex"
setvar $PLANET~PLANET_NAMES[633] "Pangelinan Annex"
setvar $PLANET~PLANET_NAMES[634] "Arels II"
setvar $PLANET~PLANET_NAMES[635] "Epsilon Major"
setvar $PLANET~PLANET_NAMES[636] "Bayer Primus"
setvar $PLANET~PLANET_NAMES[637] "Kruger Outpost"
setvar $PLANET~PLANET_NAMES[638] "Chandrasekher Outpost"
setvar $PLANET~PLANET_NAMES[639] "Imbrium Major"
setvar $PLANET~PLANET_NAMES[640] "New Jolotre"
setvar $PLANET~PLANET_NAMES[641] "Dearth II"
setvar $PLANET~PLANET_NAMES[642] "New Hallwachs"
setvar $PLANET~PLANET_NAMES[643] "Hounstyr II"
setvar $PLANET~PLANET_NAMES[644] "Niepce Primus"
setvar $PLANET~PLANET_NAMES[645] "Minddagger's Throne"
setvar $PLANET~PLANET_NAMES[646] "Carnot Outpost"
setvar $PLANET~PLANET_NAMES[647] "Diancecht Outpost"
setvar $PLANET~PLANET_NAMES[648] "Gormenghast Annex"
setvar $PLANET~PLANET_NAMES[649] "Adansonia Primus"
setvar $PLANET~PLANET_NAMES[650] "Tolchock Primus"
setvar $PLANET~PLANET_NAMES[651] "Cordwainer"
setvar $PLANET~PLANET_NAMES[652] "Rahman Primus"
setvar $PLANET~PLANET_NAMES[653] "Amicar Outpost"
setvar $PLANET~PLANET_NAMES[654] "Galahad II"
setvar $PLANET~PLANET_NAMES[655] "New Khancuhn"
setvar $PLANET~PLANET_NAMES[656] "Glyth Major"
setvar $PLANET~PLANET_NAMES[657] "Dolldus Major"
setvar $PLANET~PLANET_NAMES[658] "Reigar Outpost"
setvar $PLANET~PLANET_NAMES[659] "Aristophanes"
setvar $PLANET~PLANET_NAMES[660] "Foelen"
setvar $PLANET~PLANET_NAMES[661] "Gagarin Annex"
setvar $PLANET~PLANET_NAMES[662] "Yucca"
setvar $PLANET~PLANET_NAMES[663] "Earwig"
setvar $PLANET~PLANET_NAMES[664] "Ithaca Primus"
setvar $PLANET~PLANET_NAMES[665] "El Cid Annex"
setvar $PLANET~PLANET_NAMES[666] "Geronimo Outpost"
setvar $PLANET~PLANET_NAMES[667] "Couatl Minor"
setvar $PLANET~PLANET_NAMES[668] "New Kahn"
setvar $PLANET~PLANET_NAMES[669] "New Acetylene"
setvar $PLANET~PLANET_NAMES[670] "Nebuchadnezzar Annex"
setvar $PLANET~PLANET_NAMES[671] "Jimson Minor"
setvar $PLANET~PLANET_NAMES[672] "Iota Outpost"
setvar $PLANET~PLANET_NAMES[673] "Carse II"
setvar $PLANET~PLANET_NAMES[674] "Opus Outpost"
setvar $PLANET~PLANET_NAMES[675] "Smekal"
setvar $PLANET~PLANET_NAMES[676] "Ypsilon Primus"
setvar $PLANET~PLANET_NAMES[677] "New Auralgan"
setvar $PLANET~PLANET_NAMES[678] "Nin'arth Minor"
setvar $PLANET~PLANET_NAMES[679] "Hohenstaufen II"
setvar $PLANET~PLANET_NAMES[680] "Hefry Major"
setvar $PLANET~PLANET_NAMES[681] "Faust Outpost"
setvar $PLANET~PLANET_NAMES[682] "New Hagal"
setvar $PLANET~PLANET_NAMES[683] "IronWollobick Annex"
setvar $PLANET~PLANET_NAMES[684] "Sisko Minor"
setvar $PLANET~PLANET_NAMES[685] "Piazzi Minor"
setvar $PLANET~PLANET_NAMES[686] "Mirazh II"
setvar $PLANET~PLANET_NAMES[687] "Myk Outpost"
setvar $PLANET~PLANET_NAMES[688] "Bumex Minor"
setvar $PLANET~PLANET_NAMES[689] "Feyd II"
setvar $PLANET~PLANET_NAMES[690] "Hadron Major"
setvar $PLANET~PLANET_NAMES[691] "Cyberdyne Outpost"
setvar $PLANET~PLANET_NAMES[692] "D'Alembert Primus"
setvar $PLANET~PLANET_NAMES[693] "Brigantia Annex"
setvar $PLANET~PLANET_NAMES[694] "Miaplacidas Primus"
setvar $PLANET~PLANET_NAMES[695] "Schwarzlose Annex"
setvar $PLANET~PLANET_NAMES[696] "Datolite Annex"
setvar $PLANET~PLANET_NAMES[697] "Gormenghast Outpost"
setvar $PLANET~PLANET_NAMES[698] "Ithaca II"
setvar $PLANET~PLANET_NAMES[699] "Condaria Primus"
setvar $PLANET~PLANET_NAMES[700] "Draconis"
setvar $PLANET~PLANET_NAMES[701] "Praxis"
setvar $PLANET~PLANET_NAMES[702] "Brodie Primus"
setvar $PLANET~PLANET_NAMES[703] "Katana Outpost"
setvar $PLANET~PLANET_NAMES[704] "New Zoptica"
setvar $PLANET~PLANET_NAMES[705] "New Bonta"
setvar $PLANET~PLANET_NAMES[706] "Deschuner Primus"
setvar $PLANET~PLANET_NAMES[707] "Hecate II"
setvar $PLANET~PLANET_NAMES[708] "Siembieda Primus"
setvar $PLANET~PLANET_NAMES[709] "Edinina Annex"
setvar $PLANET~PLANET_NAMES[710] "Saxe Outpost"
setvar $PLANET~PLANET_NAMES[711] "Fractine Annex"
setvar $PLANET~PLANET_NAMES[712] "Schrodinger Primus"
setvar $PLANET~PLANET_NAMES[713] "Gautier"
setvar $PLANET~PLANET_NAMES[714] "Akkad Outpost"
setvar $PLANET~PLANET_NAMES[715] "Polk Minor"
setvar $PLANET~PLANET_NAMES[716] "New Brae Taera"
setvar $PLANET~PLANET_NAMES[717] "DeGleash Outpost"
setvar $PLANET~PLANET_NAMES[718] "Breon Annex"
setvar $PLANET~PLANET_NAMES[719] "Adjutant"
setvar $PLANET~PLANET_NAMES[720] "Bridger"
setvar $PLANET~PLANET_NAMES[721] "New Dinomn"
setvar $PLANET~PLANET_NAMES[722] "Sinmora"
setvar $PLANET~PLANET_NAMES[723] "Wein Major"
setvar $PLANET~PLANET_NAMES[724] "Skuld Major"
setvar $PLANET~PLANET_NAMES[725] "Tau Major"
setvar $PLANET~PLANET_NAMES[726] "Eocene Primus"
setvar $PLANET~PLANET_NAMES[727] "Russel"
setvar $PLANET~PLANET_NAMES[728] "Samson"
setvar $PLANET~PLANET_NAMES[729] "Ponsby Primus"
setvar $PLANET~PLANET_NAMES[730] "Koenig Minor"
setvar $PLANET~PLANET_NAMES[731] "Constellate"
setvar $PLANET~PLANET_NAMES[732] "New Verdun"
setvar $PLANET~PLANET_NAMES[733] "New Heroni"
setvar $PLANET~PLANET_NAMES[734] "New Dopp"
setvar $PLANET~PLANET_NAMES[735] "Adhara Primus"
setvar $PLANET~PLANET_NAMES[736] "Van Maanen II"
setvar $PLANET~PLANET_NAMES[737] "Prokhorov II"
setvar $PLANET~PLANET_NAMES[738] "Fabrina II"
setvar $PLANET~PLANET_NAMES[739] "Ambartsumian Major"
setvar $PLANET~PLANET_NAMES[740] "New Toro"
setvar $PLANET~PLANET_NAMES[741] "New Sirius"
setvar $PLANET~PLANET_NAMES[742] "Poisson II"
setvar $PLANET~PLANET_NAMES[743] "New Deris"
setvar $PLANET~PLANET_NAMES[744] "Nadrin Primus"
setvar $PLANET~PLANET_NAMES[745] "Riyal Primus"
setvar $PLANET~PLANET_NAMES[746] "New Hippocrates"
setvar $PLANET~PLANET_NAMES[747] "Bainite Major"
setvar $PLANET~PLANET_NAMES[748] "Hertz Annex"
setvar $PLANET~PLANET_NAMES[749] "Athach"
setvar $PLANET~PLANET_NAMES[750] "Torment Primus"
setvar $PLANET~PLANET_NAMES[751] "Bohr Outpost"
setvar $PLANET~PLANET_NAMES[752] "Copalite Outpost"
setvar $PLANET~PLANET_NAMES[753] "Vero"
setvar $PLANET~PLANET_NAMES[754] "Alfa Primus"
setvar $PLANET~PLANET_NAMES[755] "Wolf II"
setvar $PLANET~PLANET_NAMES[756] "Banalg"
setvar $PLANET~PLANET_NAMES[757] "Lepton"
setvar $PLANET~PLANET_NAMES[758] "Bardeleben II"
setvar $PLANET~PLANET_NAMES[759] "Boyle Minor"
setvar $PLANET~PLANET_NAMES[760] "Aston Annex"
setvar $PLANET~PLANET_NAMES[761] "Proxima Centauri Major"
setvar $PLANET~PLANET_NAMES[762] "Bielids Primus"
setvar $PLANET~PLANET_NAMES[763] "Amber Major"
setvar $PLANET~PLANET_NAMES[764] "Gorgimera II"
setvar $PLANET~PLANET_NAMES[765] "Mortai Minor"
setvar $PLANET~PLANET_NAMES[766] "Hecate Primus"
setvar $PLANET~PLANET_NAMES[767] "Sabine"
setvar $PLANET~PLANET_NAMES[768] "Kintaro Annex"
setvar $PLANET~PLANET_NAMES[769] "Knorbes"
setvar $PLANET~PLANET_NAMES[770] "Sirion Primus"
setvar $PLANET~PLANET_NAMES[771] "New Priedo"
setvar $PLANET~PLANET_NAMES[772] "Deris"
setvar $PLANET~PLANET_NAMES[773] "Sakai II"
setvar $PLANET~PLANET_NAMES[774] "Jefferson II"
setvar $PLANET~PLANET_NAMES[775] "Flinte Minor"
setvar $PLANET~PLANET_NAMES[776] "New Gaillot"
setvar $PLANET~PLANET_NAMES[777] "New Ozawa"
setvar $PLANET~PLANET_NAMES[778] "Valkyrie Major"
setvar $PLANET~PLANET_NAMES[779] "Helios Primus"
setvar $PLANET~PLANET_NAMES[780] "Castor Annex"
setvar $PLANET~PLANET_NAMES[781] "Lysander Outpost"
setvar $PLANET~PLANET_NAMES[782] "Engrange Major"
setvar $PLANET~PLANET_NAMES[783] "Hektor Outpost"
setvar $PLANET~PLANET_NAMES[784] "Quasi Primus"
setvar $PLANET~PLANET_NAMES[785] "Minimi Annex"
setvar $PLANET~PLANET_NAMES[786] "Cetacean Primus"
setvar $PLANET~PLANET_NAMES[787] "Mondoloy"
setvar $PLANET~PLANET_NAMES[788] "Hadozee II"
setvar $PLANET~PLANET_NAMES[789] "Giedi Staz Primus"
setvar $PLANET~PLANET_NAMES[790] "Sarnoff Primus"
setvar $PLANET~PLANET_NAMES[791] "Symbiont Annex"
setvar $PLANET~PLANET_NAMES[792] "New Atrivis"
setvar $PLANET~PLANET_NAMES[793] "Adurol Outpost"
setvar $PLANET~PLANET_NAMES[794] "Agamar Minor"
setvar $PLANET~PLANET_NAMES[795] "de Tocqueville II"
setvar $PLANET~PLANET_NAMES[796] "Kentaurus"
setvar $PLANET~PLANET_NAMES[797] "Nebecula"
setvar $PLANET~PLANET_NAMES[798] "Mach Primus"
setvar $PLANET~PLANET_NAMES[799] "New Marconi"
setvar $PLANET~PLANET_NAMES[800] "Pixie Outpost"
setvar $PLANET~PLANET_NAMES[801] "Scorpio II"
setvar $PLANET~PLANET_NAMES[802] "Greyhawk Outpost"
setvar $PLANET~PLANET_NAMES[803] "New Bernoulli"
setvar $PLANET~PLANET_NAMES[804] "Myk"
setvar $PLANET~PLANET_NAMES[805] "New Snell"
setvar $PLANET~PLANET_NAMES[806] "Buccal II"
setvar $PLANET~PLANET_NAMES[807] "Surplus Outpost"
setvar $PLANET~PLANET_NAMES[808] "Agathinon"
setvar $PLANET~PLANET_NAMES[809] "Esabl Major"
setvar $PLANET~PLANET_NAMES[810] "l'Hopital Primus"
setvar $PLANET~PLANET_NAMES[811] "New Farquahar"
setvar $PLANET~PLANET_NAMES[812] "Calit Annex"
setvar $PLANET~PLANET_NAMES[813] "Forni-Copus Primus"
setvar $PLANET~PLANET_NAMES[814] "Dreath Annex"
setvar $PLANET~PLANET_NAMES[815] "Messier II"
setvar $PLANET~PLANET_NAMES[816] "New Bethune"
setvar $PLANET~PLANET_NAMES[817] "Avauld Major"
setvar $PLANET~PLANET_NAMES[818] "New Brassica"
setvar $PLANET~PLANET_NAMES[819] "Scheiner Minor"
setvar $PLANET~PLANET_NAMES[820] "Focaline II"
setvar $PLANET~PLANET_NAMES[821] "Xructocex Minor"
setvar $PLANET~PLANET_NAMES[822] "Atozine II"
setvar $PLANET~PLANET_NAMES[823] "Alupent Annex"
setvar $PLANET~PLANET_NAMES[824] "Moran II"
setvar $PLANET~PLANET_NAMES[825] "Bularia II"
setvar $PLANET~PLANET_NAMES[826] "Natoko Major"
setvar $PLANET~PLANET_NAMES[827] "Jenghe"
setvar $PLANET~PLANET_NAMES[828] "Thanber II"
setvar $PLANET~PLANET_NAMES[829] "Aeacus Major"
setvar $PLANET~PLANET_NAMES[830] "New Avignon"
setvar $PLANET~PLANET_NAMES[831] "Annobon Primus"
setvar $PLANET~PLANET_NAMES[832] "Majorana"
setvar $PLANET~PLANET_NAMES[833] "Alarm Major"
setvar $PLANET~PLANET_NAMES[834] "Messier"
setvar $PLANET~PLANET_NAMES[835] "Steele Minor"
setvar $PLANET~PLANET_NAMES[836] "Njord II"
setvar $PLANET~PLANET_NAMES[837] "Diabase Primus"
setvar $PLANET~PLANET_NAMES[838] "Pagaton Minor"
setvar $PLANET~PLANET_NAMES[839] "Aston Major"
setvar $PLANET~PLANET_NAMES[840] "Rashomon Outpost"
setvar $PLANET~PLANET_NAMES[841] "Yiktor"
setvar $PLANET~PLANET_NAMES[842] "Azactam II"
setvar $PLANET~PLANET_NAMES[843] "Anastasya II"
setvar $PLANET~PLANET_NAMES[844] "Cogri"
setvar $PLANET~PLANET_NAMES[845] "Macross Minor"
setvar $PLANET~PLANET_NAMES[846] "Asteres Major"
setvar $PLANET~PLANET_NAMES[847] "Bernoulli II"
setvar $PLANET~PLANET_NAMES[848] "New Pagoda"
setvar $PLANET~PLANET_NAMES[849] "Einherjar Primus"
setvar $PLANET~PLANET_NAMES[850] "Palpatine"
setvar $PLANET~PLANET_NAMES[851] "New Ghanima"
setvar $PLANET~PLANET_NAMES[852] "Poitiers II"
setvar $PLANET~PLANET_NAMES[853] "Nautiloid II"
setvar $PLANET~PLANET_NAMES[854] "Zoptica Minor"
setvar $PLANET~PLANET_NAMES[855] "Wern II"
setvar $PLANET~PLANET_NAMES[856] "Cascara Annex"
setvar $PLANET~PLANET_NAMES[857] "Yurst Outpost"
setvar $PLANET~PLANET_NAMES[858] "Breughel Major"
setvar $PLANET~PLANET_NAMES[859] "Anchorhead Outpost"
setvar $PLANET~PLANET_NAMES[860] "Woden Annex"
setvar $PLANET~PLANET_NAMES[861] "Gaia"
setvar $PLANET~PLANET_NAMES[862] "New Orwell"
setvar $PLANET~PLANET_NAMES[863] "Diocletian Primus"
setvar $PLANET~PLANET_NAMES[864] "New Exedore"
setvar $PLANET~PLANET_NAMES[865] "Jupura Major"
setvar $PLANET~PLANET_NAMES[866] "Kerogen"
setvar $PLANET~PLANET_NAMES[867] "Krono Major"
setvar $PLANET~PLANET_NAMES[868] "Marmoutier Major"
setvar $PLANET~PLANET_NAMES[869] "Stokes Annex"
setvar $PLANET~PLANET_NAMES[870] "New Pluto"
setvar $PLANET~PLANET_NAMES[871] "Hornet II"
setvar $PLANET~PLANET_NAMES[872] "Telegraph Major"
setvar $PLANET~PLANET_NAMES[873] "Bolivar Outpost"
setvar $PLANET~PLANET_NAMES[874] "Iolcus II"
setvar $PLANET~PLANET_NAMES[875] "Noegi Major"
setvar $PLANET~PLANET_NAMES[876] "New Saladin"
setvar $PLANET~PLANET_NAMES[877] "Cambridge Annex"
setvar $PLANET~PLANET_NAMES[878] "Gelugon"
setvar $PLANET~PLANET_NAMES[879] "Lazarus II"
setvar $PLANET~PLANET_NAMES[880] "Achernar Primus"
setvar $PLANET~PLANET_NAMES[881] "Langmuir"
setvar $PLANET~PLANET_NAMES[882] "Buie Annex"
setvar $PLANET~PLANET_NAMES[883] "Spica"
setvar $PLANET~PLANET_NAMES[884] "Puparkin Outpost"
setvar $PLANET~PLANET_NAMES[885] "Maya Major"
setvar $PLANET~PLANET_NAMES[886] "New Polk"
setvar $PLANET~PLANET_NAMES[887] "Solon Minor"
setvar $PLANET~PLANET_NAMES[888] "Flamarion Primus"
setvar $PLANET~PLANET_NAMES[889] "Jupura Minor"
setvar $PLANET~PLANET_NAMES[890] "New Lahara"
setvar $PLANET~PLANET_NAMES[891] "New Hermes"
setvar $PLANET~PLANET_NAMES[892] "New Krono"
setvar $PLANET~PLANET_NAMES[893] "Starling Primus"
setvar $PLANET~PLANET_NAMES[894] "Vanant"
setvar $PLANET~PLANET_NAMES[895] "New Rebka"
setvar $PLANET~PLANET_NAMES[896] "Julian Major"
setvar $PLANET~PLANET_NAMES[897] "Faeroes"
setvar $PLANET~PLANET_NAMES[898] "Kongo"
setvar $PLANET~PLANET_NAMES[899] "Lorraine Annex"
setvar $PLANET~PLANET_NAMES[900] "Gautier Outpost"
setvar $PLANET~PLANET_NAMES[901] "New Hadar"
setvar $PLANET~PLANET_NAMES[902] "Nexine II"
setvar $PLANET~PLANET_NAMES[903] "Lindbergh Annex"
setvar $PLANET~PLANET_NAMES[904] "Ranger"
setvar $PLANET~PLANET_NAMES[905] "Strad Primus"
setvar $PLANET~PLANET_NAMES[906] "Yuro Minor"
setvar $PLANET~PLANET_NAMES[907] "New Ilium"
setvar $PLANET~PLANET_NAMES[908] "Peale"
setvar $PLANET~PLANET_NAMES[909] "Faisal Primus"
setvar $PLANET~PLANET_NAMES[910] "Skinfaxi Major"
setvar $PLANET~PLANET_NAMES[911] "Gaea Primus"
setvar $PLANET~PLANET_NAMES[912] "Ayat Major"
setvar $PLANET~PLANET_NAMES[913] "Charlemagne Minor"
setvar $PLANET~PLANET_NAMES[914] "Dixon II"
setvar $PLANET~PLANET_NAMES[915] "Pequan Annex"
setvar $PLANET~PLANET_NAMES[916] "Arden Annex"
setvar $PLANET~PLANET_NAMES[917] "Palitzsch II"
setvar $PLANET~PLANET_NAMES[918] "Seneca Annex"
setvar $PLANET~PLANET_NAMES[919] "Bozarth Annex"
setvar $PLANET~PLANET_NAMES[920] "Bicornn Outpost"
setvar $PLANET~PLANET_NAMES[921] "Djinn Primus"
setvar $PLANET~PLANET_NAMES[922] "Nabopolassar II"
setvar $PLANET~PLANET_NAMES[923] "Adhara Major"
setvar $PLANET~PLANET_NAMES[924] "New Nagant"
setvar $PLANET~PLANET_NAMES[925] "Julian"
setvar $PLANET~PLANET_NAMES[926] "Upatnieks Annex"
setvar $PLANET~PLANET_NAMES[927] "New Guatama"
setvar $PLANET~PLANET_NAMES[928] "Isolux Outpost"
setvar $PLANET~PLANET_NAMES[929] "Archon Annex"
setvar $PLANET~PLANET_NAMES[930] "Planitia Major"
setvar $PLANET~PLANET_NAMES[931] "Li Kao Minor"
setvar $PLANET~PLANET_NAMES[932] "Cogri Minor"
setvar $PLANET~PLANET_NAMES[933] "New Shcawbe"
setvar $PLANET~PLANET_NAMES[934] "Kruhious Outpost"
setvar $PLANET~PLANET_NAMES[935] "Castor Hideout"
setvar $PLANET~PLANET_NAMES[936] "Clastic Outpost"
setvar $PLANET~PLANET_NAMES[937] "New Capybara"
setvar $PLANET~PLANET_NAMES[938] "Durer"
setvar $PLANET~PLANET_NAMES[939] "New Durendal"
setvar $PLANET~PLANET_NAMES[940] "Tivid"
setvar $PLANET~PLANET_NAMES[941] "New Vreibefger"
setvar $PLANET~PLANET_NAMES[942] "Baugi Major"
setvar $PLANET~PLANET_NAMES[943] "Lorraine Minor"
setvar $PLANET~PLANET_NAMES[944] "Chalcedony Major"
setvar $PLANET~PLANET_NAMES[945] "Rousseau Annex"
setvar $PLANET~PLANET_NAMES[946] "Palique Outpost"
setvar $PLANET~PLANET_NAMES[947] "Valence Annex"
setvar $PLANET~PLANET_NAMES[948] "Ralhe Minor"
setvar $PLANET~PLANET_NAMES[949] "Kruxas Ruz Annex"
setvar $PLANET~PLANET_NAMES[950] "Pyris Primus"
setvar $PLANET~PLANET_NAMES[951] "New Earwig"
setvar $PLANET~PLANET_NAMES[952] "New Wintjen"
setvar $PLANET~PLANET_NAMES[953] "Pennington"
setvar $PLANET~PLANET_NAMES[954] "Koalinth"
setvar $PLANET~PLANET_NAMES[955] "Antike Annex"
setvar $PLANET~PLANET_NAMES[956] "Bach Major"
setvar $PLANET~PLANET_NAMES[957] "Kikusui"
setvar $PLANET~PLANET_NAMES[958] "Guatama Minor"
setvar $PLANET~PLANET_NAMES[959] "Gaderffii"
setvar $PLANET~PLANET_NAMES[960] "Kender"
setvar $PLANET~PLANET_NAMES[961] "Mithra Minor"
setvar $PLANET~PLANET_NAMES[962] "Osnabruck Primus"
setvar $PLANET~PLANET_NAMES[963] "Pedase II"
setvar $PLANET~PLANET_NAMES[964] "Murchison Primus"
setvar $PLANET~PLANET_NAMES[965] "Lafaayette Outpost"
setvar $PLANET~PLANET_NAMES[966] "Dawnworld"
setvar $PLANET~PLANET_NAMES[967] "Ajacs"
setvar $PLANET~PLANET_NAMES[968] "Raven Outpost"
setvar $PLANET~PLANET_NAMES[969] "Bravera II"
setvar $PLANET~PLANET_NAMES[970] "Edenelt Primus"
setvar $PLANET~PLANET_NAMES[971] "New Nicholson"
setvar $PLANET~PLANET_NAMES[972] "Suleiman Outpost"
setvar $PLANET~PLANET_NAMES[973] "Alva"
setvar $PLANET~PLANET_NAMES[974] "Amertet Annex"
setvar $PLANET~PLANET_NAMES[975] "Guellan Minor"
setvar $PLANET~PLANET_NAMES[976] "Thagar"
setvar $PLANET~PLANET_NAMES[977] "Kegena"
setvar $PLANET~PLANET_NAMES[978] "Ari Outpost"
setvar $PLANET~PLANET_NAMES[979] "Hawk Primus"
setvar $PLANET~PLANET_NAMES[980] "Abraxas Minor"
setvar $PLANET~PLANET_NAMES[981] "Columbus"
setvar $PLANET~PLANET_NAMES[982] "Rutledge Major"
setvar $PLANET~PLANET_NAMES[983] "Efate Major"
setvar $PLANET~PLANET_NAMES[984] "Xylem Primus"
setvar $PLANET~PLANET_NAMES[985] "Anaspaz Major"
setvar $PLANET~PLANET_NAMES[986] "Garoo Minor"
setvar $PLANET~PLANET_NAMES[987] "Kruhious Minor"
setvar $PLANET~PLANET_NAMES[988] "Camelot Major"
setvar $PLANET~PLANET_NAMES[989] "Singer Minor"
setvar $PLANET~PLANET_NAMES[990] "Aegospotami Primus"
setvar $PLANET~PLANET_NAMES[991] "Modelei Annex"
setvar $PLANET~PLANET_NAMES[992] "Skuld Outpost"
setvar $PLANET~PLANET_NAMES[993] "Oisin Outpost"
setvar $PLANET~PLANET_NAMES[994] "Baruch Major"
setvar $PLANET~PLANET_NAMES[995] "Pyramus II"
setvar $PLANET~PLANET_NAMES[996] "Thornastor Outpost"
setvar $PLANET~PLANET_NAMES[997] "Suleiman"
setvar $PLANET~PLANET_NAMES[998] "Pompey Primus"
setvar $PLANET~PLANET_NAMES[999] "New Aeschylus"
setvar $PLANET~PLANET_NAMES[1000] "Bounty's Horizon"
return
:PLANET~PLANETNEG







setvar $PLANET~OUTPUT_FILE ""
setvar $PLANET~SELLDELAY 0
setvar $PLANET~OREMCIC "-90"
setvar $PLANET~ORGMCIC "-75"
setvar $PLANET~EQUMCIC "-65"
setvar $PLANET~VERSION "3.0.0"

setvar $PLANET~STARTINGLOCATION $PLAYER~CURRENT_PROMPT
:PLANET~VERIFYPROMPT

if (($PLANET~STARTINGLOCATION <> "Citadel") and ($PLANET~STARTINGLOCATION <> "Planet"))
  setvar $PLANET~EXIT_MESSAGE "Must start at Citadel or Planet Prompt for Planet Nego"
  goto :EXITNEG
end


setvar $PLANET~_CK_PTRADESETTING $GAME~PTRADESETTING
setvar $PLANET~QUANTITYUNKNOWN 0

if ($PLANET~STARTINGLOCATION = "Citadel")
  send "Q"
elseif ($PLANET~STARTINGLOCATION = "Planet ")
  setvar $PLANET~STARTINGLOCATION "Planet"
end
gosub :GETPLANETINFO
send "Q"
gosub :PLAYER~GETINFO
send "*"

send "|CR"&$PLAYER~CURRENT_SECTOR&"*"

settextlinetrigger FOUNDPORT :FOUNDPORT "Items     Status  Trading % of max OnBoard"
settextlinetrigger NOPORT :NOPORT "I have no information about a port in that sector."
settextlinetrigger NOPORT2 :NOPORT "You have never visted sector"
settextlinetrigger NOPORT3 :NOPORT "credits / next hold"
pause
:PLANET~NOPORT

send "Q|"
killtrigger FOUNDPORT
killtrigger NOPORT
killtrigger NOPORT2
killtrigger NOPORT3
gosub :NEGOTIATELAND
setvar $PLANET~EXIT_MESSAGE "No port to sell to"
goto :EXITNEG
:PLANET~FOUNDPORT

killtrigger FOUNDPORT
killtrigger NOPORT
killtrigger NOPORT2
killtrigger NOPORT3
settextlinetrigger PORTINFO1 :PORTINFO1 "Fuel Ore "
settextlinetrigger PORTINFO2 :PORTINFO2 "Organics"
settextlinetrigger PORTINFO3 :PORTINFO3 "Equipment"
settextlinetrigger GOTCR :GOTCR "Computer command [TL="
pause
:PLANET~PORTINFO1

getword CURRENTLINE $PLAYER~CURRENT_SECTOR.OREBUYING 3
getword CURRENTLINE $PLAYER~CURRENT_SECTOR.ORETRADING 4
getword CURRENTLINE $PLAYER~CURRENT_SECTOR.OREPERCENT 5
striptext $PLAYER~CURRENT_SECTOR.OREPERCENT "%"
pause
:PLANET~PORTINFO2
getword CURRENTLINE $PLAYER~CURRENT_SECTOR.ORGBUYING 2
getword CURRENTLINE $PLAYER~CURRENT_SECTOR.ORGTRADING 3
getword CURRENTLINE $PLAYER~CURRENT_SECTOR.ORGPERCENT 4
striptext $PLAYER~CURRENT_SECTOR.ORGPERCENT "%"
pause
:PLANET~PORTINFO3
getword CURRENTLINE $PLAYER~CURRENT_SECTOR.EQUBUYING 2
getword CURRENTLINE $PLAYER~CURRENT_SECTOR.EQUTRADING 3
getword CURRENTLINE $PLAYER~CURRENT_SECTOR.EQUPERCENT 4
striptext $PLAYER~CURRENT_SECTOR.EQUPERCENT "%"
send "Q|"
pause
:PLANET~GOTCR
killtrigger PORTINFO1
killtrigger PORTINFO2
killtrigger PORTINFO3
killtrigger GOTCR

setdelaytrigger JUSTASEC :JUSTASEC 200
pause
:PLANET~JUSTASEC
:PLANET~INITINFO


if ($PLAYER~TURNS <= 0)
  gosub :NEGOTIATELAND
  setvar $PLANET~EXIT_MESSAGE "I have no turns to negotiate this planet"
  goto :EXITNEG
end
if ($PLAYER~CREDITS > 900000000)
  gosub :NEGOTIATELAND
  setvar $PLANET~EXIT_MESSAGE "I have too much cash on hand"
  goto :EXITNEG
end

if ($PLANET~_CK_PNEGO_FUELTOSELL = "-1")
  setvar $PLANET~FUELTOSELL 0
elseif ($PLANET~_CK_PNEGO_FUELTOSELL = "max")
  setvar $PLANET~FUELTOSELL $PLANET~PLANETFUEL
else
  setvar $PLANET~FUELTOSELL $PLANET~_CK_PNEGO_FUELTOSELL

end
if ($PLANET~FUELTOSELL > $PLANET~PLANETFUEL)
  setvar $PLANET~FUELTOSELL $PLANET~PLANETFUEL
end

if ($PLANET~_CK_PNEGO_ORGTOSELL = "-1")
  setvar $PLANET~ORGTOSELL 0
elseif ($PLANET~_CK_PNEGO_ORGTOSELL = "max")
  setvar $PLANET~ORGTOSELL $PLANET~PLANETORG
else
  setvar $PLANET~ORGTOSELL $PLANET~_CK_PNEGO_ORGTOSELL

end
if ($PLANET~ORGTOSELL > $PLANET~PLANETORG)
  setvar $PLANET~ORGTOSELL $PLANET~PLANETORG
end

if ($PLANET~_CK_PNEGO_EQUIPTOSELL = "-1")
  setvar $PLANET~EQUIPTOSELL 0
elseif ($PLANET~_CK_PNEGO_EQUIPTOSELL = "max")
  setvar $PLANET~EQUIPTOSELL $PLANET~PLANETEQUIP
else
  setvar $PLANET~EQUIPTOSELL $PLANET~_CK_PNEGO_EQUIPTOSELL

end
if ($PLANET~EQUIPTOSELL > $PLANET~PLANETEQUIP)
  setvar $PLANET~EQUIPTOSELL $PLANET~PLANETEQUIP
end


if (($PLAYER~CURRENT_SECTOR.OREBUYING <> "Buying") or ($PLAYER~CURRENT_SECTOR.OREPERCENT < 15))
  setvar $PLANET~FUELTOSELL 0
end
if (($PLAYER~CURRENT_SECTOR.ORGBUYING <> "Buying") or ($PLAYER~CURRENT_SECTOR.ORGPERCENT < 15))
  setvar $PLANET~ORGTOSELL 0
end
if (($PLAYER~CURRENT_SECTOR.EQUBUYING <> "Buying") or ($PLAYER~CURRENT_SECTOR.EQUPERCENT < 15))
  setvar $PLANET~EQUIPTOSELL 0
end
:PLANET~SELLOFF

if (($PLANET~FUELTOSELL <> 0) or ($PLANET~ORGTOSELL <> 0) or ($PLANET~EQUIPTOSELL <> 0))
  setvar $PLANET~ORE_SELL_FAILURES 0
  setvar $PLANET~ORG_SELL_FAILURES 0
  setvar $PLANET~EQU_SELL_FAILURES 0
  setvar $PLANET~ORESELLOUTPUT ""
  setvar $PLANET~ORGSELLOUTPUT ""
  setvar $PLANET~EQUSELLOUTPUT ""
  setvar $PLANET~OREPROFIT 0
  setvar $PLANET~ORGPROFIT 0
  setvar $PLANET~EQUPROFIT 0

  send "|"
  gosub :SELL
  gosub :NEGOTIATELAND
  if ($PLANET~STARTINGLOCATION = "Citadel")

    if ($PLANET~OREPROFIT <> 0)
      send "TT"&$PLANET~OREPROFIT&"*"
      subtract $PLAYER~CREDITS $PLANET~OREPROFIT
    end
    if ($PLANET~ORGPROFIT <> 0)
      send "TT"&$PLANET~ORGPROFIT&"*"
      subtract $PLAYER~CREDITS $PLANET~ORGPROFIT
    end
    if ($PLANET~EQUPROFIT <> 0)
      send "TT"&$PLANET~EQUPROFIT&"*"
      subtract $PLAYER~CREDITS $PLANET~EQUPROFIT
    end
  end


  send "|"



  setvar $PLANET~GENERALOUTPUT "*Sector "&$PLAYER~CURRENT_SECTOR&"*"
  if ($PLANET~OUTPUT_FILE <> "")
    write $PLANET~OUTPUT_FILE $PLANET~GENERALOUTPUT
  end

  if ($PLANET~ORESELLOUTPUT <> "")

    setvar $SWITCHBOARD~MESSAGE "  *"&$PLANET~ORESELLOUTPUT
    if ($SWITCHBOARD~SELF_COMMAND <> TRUE)
      setvar $SWITCHBOARD~SELF_COMMAND 2
    end


    if ($PLANET~OUTPUT_FILE <> "")
      write $PLANET~OUTPUT_FILE $PLANET~ORESELLOUTPUT
    end
  end
  if ($PLANET~ORGSELLOUTPUT <> "")

    setvar $SWITCHBOARD~MESSAGE "  *"&$PLANET~ORGSELLOUTPUT
    if ($SWITCHBOARD~SELF_COMMAND <> TRUE)
      setvar $SWITCHBOARD~SELF_COMMAND 2
    end

    if ($PLANET~OUTPUT_FILE <> "")
      write $PLANET~OUTPUT_FILE $PLANET~ORGSELLOUTPUT
    end
  end
  if ($PLANET~EQUSELLOUTPUT <> "")

    setvar $SWITCHBOARD~MESSAGE "  *"&$PLANET~EQUSELLOUTPUT
    if ($SWITCHBOARD~SELF_COMMAND <> TRUE)
      setvar $SWITCHBOARD~SELF_COMMAND 2
    end

    if ($PLANET~OUTPUT_FILE <> "")
      write $PLANET~OUTPUT_FILE $PLANET~EQUSELLOUTPUT
    end
  end
  setvar $PLANET~EXIT_MESSAGE "Done with port"
  goto :EXITNEG
else
  gosub :NEGOTIATELAND
  setvar $PLANET~EXIT_MESSAGE "Nothing to sell"
  goto :EXITNEG
end
:PLANET~SELL
:PLANET~RESELL


if ($PLAYER~TURNS <= 0)
  send "'I'm out of turns*"
  return
end
setvar $PLANET~THISOREFAILED 0
setvar $PLANET~THISORGFAILED 0
setvar $PLANET~THISEQUFAILED 0
if ($PLANET~FUELTOSELL > 0)
  setvar $PLANET~ATTEMPTORE 1
  setvar $PLANET~ATTEMPTORECONFIRMED 0
end
if ($PLANET~ORGTOSELL > 0)
  setvar $PLANET~ATTEMPTORG 1
  setvar $PLANET~ATTEMPTORGCONFIRMED 0
end
if ($PLANET~EQUIPTOSELL > 0)
  setvar $PLANET~ATTEMPTEQU 1
  setvar $PLANET~ATTEMPTEQUCONFIRMED 0
end
isnumber $PLANET~NUMBER $PLANET~PLANET
setvar $PLANET~FINDPLANET 0
if ($PLANET~NUMBER = 0)
  send "PN"
  setvar $PLANET~FINDPLANET 1
else
  send "PN"
end

subtract $PLAYER~TURNS 1
:PLANET~GETPERCTS
settextlinetrigger OREPCT :OREPCT "Fuel Ore   Buying"
settextlinetrigger ORGPCT :ORGPCT "Organics   Buying"
settextlinetrigger EQUPCT :EQUPCT "Equipment  Buying"
settextlinetrigger GOTPERCTS :GOTPERCTS "Registry# and Planet Name"
pause
:PLANET~OREPCT

killtrigger OREPCT
killtrigger ORGPCT
killtrigger EQUPCT
killtrigger GOTPERCTS
getword CURRENTLINE $PLAYER~CURRENT_SECTOR.ORETRADING 4
getword CURRENTLINE $PLAYER~CURRENT_SECTOR.OREPERCENT 5
striptext $PLAYER~CURRENT_SECTOR.OREPERCENT "%"
if ($PLAYER~CURRENT_SECTOR.OREPERCENT < 100)
  add $PLAYER~CURRENT_SECTOR.OREPERCENT 1
end
goto :GETPERCTS
:PLANET~ORGPCT

killtrigger OREPCT
killtrigger ORGPCT
killtrigger EQUPCT
killtrigger GOTPERCTS
getword CURRENTLINE $PLAYER~CURRENT_SECTOR.ORGTRADING 3
getword CURRENTLINE $PLAYER~CURRENT_SECTOR.ORGPERCENT 4
striptext $PLAYER~CURRENT_SECTOR.ORGPERCENT "%"
if ($PLAYER~CURRENT_SECTOR.ORGPERCENT < 100)
  add $PLAYER~CURRENT_SECTOR.ORGPERCENT 1
end
goto :GETPERCTS
:PLANET~EQUPCT

killtrigger OREPCT
killtrigger ORGPCT
killtrigger EQUPCT
killtrigger GOTPERCTS
getword CURRENTLINE $PLAYER~CURRENT_SECTOR.EQUTRADING 3
getword CURRENTLINE $PLAYER~CURRENT_SECTOR.EQUPERCENT 4
striptext $PLAYER~CURRENT_SECTOR.EQUPERCENT "%"
if ($PLAYER~CURRENT_SECTOR.EQUPERCENT < 100)
  add $PLAYER~CURRENT_SECTOR.EQUPERCENT 1
end
goto :GETPERCTS
:PLANET~GOTPERCTS


isnumber $PLANET~TEST1 $PLAYER~CURRENT_SECTOR.ORETRADING
isnumber $PLANET~TEST2 $PLAYER~CURRENT_SECTOR.OREPERCENT
if (($PLANET~TEST1 = 0) or ($PLANET~TEST2 = 0))
  send "'DEBUG: NAN on oretrading:"&$PLANET~TEST1&" orepercent:" $PLANET~TEST2 "*"
  setvar $PLAYER~CURRENT_SECTOR.OREPERCENT 1
  setvar $PLAYER~CURRENT_SECTOR.ORETRADING 1
end
isnumber $PLANET~TEST3 $PLAYER~CURRENT_SECTOR.ORGTRADING
isnumber $PLANET~TEST4 $PLAYER~CURRENT_SECTOR.ORGPERCENT
if (($PLANET~TEST3 = 0) or ($PLANET~TEST2 = 0))
  send "'DEBUG: NAN on orgtrading:"&$PLANET~TEST3&" orgpercent:" $PLANET~TEST4 "*"
  setvar $PLAYER~CURRENT_SECTOR.ORGPERCENT 1
  setvar $PLAYER~CURRENT_SECTOR.ORGTRADING 1
end

isnumber $PLANET~TEST5 $PLAYER~CURRENT_SECTOR.EQUTRADING
isnumber $PLANET~TEST6 $PLAYER~CURRENT_SECTOR.EQUPERCENT
if (($PLANET~TEST5 = 0) or ($PLANET~TEST6 = 0))
  send "'DEBUG: NAN on equtrading:"&$PLANET~TEST5&" equpercent:" $PLANET~TEST6 "*"
  setvar $PLAYER~CURRENT_SECTOR.EQUPERCENT 1
  setvar $PLAYER~CURRENT_SECTOR.EQUTRADING 1
end
killtrigger OREPCT
killtrigger ORGPCT
killtrigger EQUPCT
killtrigger GOTPERCTS
if ($PLANET~FINDPLANET = 1)
  settextlinetrigger PLANETNUM :PLANETNUM "> "&$PLANET~PLANET
  setdelaytrigger NOPLANETNUM :NOPLANETNUM 3000
  pause
  :PLANET~NOPLANETNUM
  killalltriggers
  setvar $PLANET~EXIT_MESSAGE "Could not determine port number!"
  send "q*"
  goto :EXITNEG
  :PLANET~PLANETNUM
  killtrigger PLANETNUM
  killtrigger NOPLANETNUM
  getword CURRENTLINE $PLANET~PLANET 1
  striptext $PLANET~PLANET ">"
  send $PLANET~PLANET "*"
else
  send $PLANET~PLANET "*"
end
:PLANET~SELLPRODUCT


settexttrigger SELLFUEL :SELLFUEL "How many units of Fuel Ore"
settexttrigger SELLORG :SELLORG "How many units of Organics"
settexttrigger SELLEQU :SELLEQU "How many units of Equipment"
settexttrigger DONEWITHPORT :DONEWITHPORT "Command [TL="
killtrigger NOTOURS
settexttrigger NOTOURS :NOTOURS "You don't own that planet!  Were you expecting us to invade it?"
pause
:PLANET~NOTOURS

send "*"
setvar $PLANET~EXIT_MESSAGE "We don't own this planet!"
pause
:PLANET~SELLFUEL
killtrigger SELLFUEL
killtrigger SELLORG
killtrigger SELLEQU
killtrigger DONEWITHPORT
if ($PLANET~QUANTITYUNKNOWN = 1)
  getword CURRENTLINE $PLANET~FUELTOSELL 12
  striptext $PLANET~FUELTOSELL "["
  striptext $PLANET~FUELTOSELL "]"
  striptext $PLANET~FUELTOSELL "?"
end


isnumber $PLANET~TEST $PLANET~FUELTOSELL
if ($PLANET~TEST = 0)
  send "'DEBUG: NAN on fueltosell:"&$PLANET~FUELTOSELL "*"
  setvar $PLANET~FUELTOSELL 0
end
if (($PLAYER~CURRENT_SECTOR.OREPERCENT >= 15) and ($PLANET~FUELTOSELL > 0))
  if ($PLANET~FUELTOSELL > $PLAYER~CURRENT_SECTOR.ORETRADING)
    setvar $PLANET~FUELTOSELL $PLAYER~CURRENT_SECTOR.ORETRADING
  end
  setvar $PLANET~ATTEMPTORECONFIRMED 1
  setvar $PLANET~PRODTOSELL "ore"
  setvar $PLANET~PORTBUYING $PLANET~FUELTOSELL
  gosub :SELLHAGGLE
  if ($PLANET~CURRENTHAGGLE = "succeeded")
    setvar $PLANET~OREHAGGLE "succeeded"
    setvar $PLANET~FUELTOSELL 0
  else
    setvar $PLANET~OREHAGGLE "failed"
  end
else
  send "az0*"
  setvar $PLANET~FUELTOSELL 0
end
goto :SELLPRODUCT
:PLANET~SELLORG

killtrigger SELLFUEL
killtrigger SELLORG
killtrigger SELLEQU
killtrigger DONEWITHPORT
if ($PLANET~QUANTITYUNKNOWN = 1)
  getword CURRENTLINE $PLANET~ORGTOSELL 11
  striptext $PLANET~ORGTOSELL "["
  striptext $PLANET~ORGTOSELL "]"
  striptext $PLANET~ORGTOSELL "?"
end

isnumber $PLANET~TEST $PLANET~ORGTOSELL
if ($PLANET~TEST = 0)
  send "'DEBUG: NAN on orgtosell:"&$PLANET~ORGTOSELL "*"
  setvar $PLANET~ORGTOSELL 0
end
if (($PLAYER~CURRENT_SECTOR.ORGPERCENT >= 15) and ($PLANET~ORGTOSELL > 0))
  if ($PLANET~ORGTOSELL > $PLAYER~CURRENT_SECTOR.ORGTRADING)
    setvar $PLANET~ORGTOSELL $PLAYER~CURRENT_SECTOR.ORGTRADING
  end
  setvar $PLANET~ATTEMPTORGCONFIRMED 1
  setvar $PLANET~PRODTOSELL "org"
  setvar $PLANET~PORTBUYING $PLANET~ORGTOSELL
  gosub :SELLHAGGLE
  if ($PLANET~CURRENTHAGGLE = "succeeded")
    setvar $PLANET~ORGHAGGLE "succeeded"
    setvar $PLANET~ORGTOSELL 0
  else
    setvar $PLANET~ORGHAGGLE "failed"
  end
else
  send "az0*"
  setvar $PLANET~ORGTOSELL 0
end
goto :SELLPRODUCT
:PLANET~SELLEQU


killtrigger SELLFUEL
killtrigger SELLORG
killtrigger SELLEQU
killtrigger DONEWITHPORT
if ($PLANET~QUANTITYUNKNOWN = 1)
  getword CURRENTLINE $PLANET~EQUIPTOSELL 11
  striptext $PLANET~EQUIPTOSELL "["
  striptext $PLANET~EQUIPTOSELL "]"
  striptext $PLANET~EQUIPTOSELL "?"
end

isnumber $PLANET~TEST $PLANET~EQUIPTOSELL
if ($PLANET~TEST = 0)
  send "'DEBUG: NAN on equiptosell:"&$PLANET~EQUIPTOSELL "*"
  setvar $PLANET~EQUIPTOSELL 0
end
if (($PLAYER~CURRENT_SECTOR.EQUPERCENT >= 15) and ($PLANET~EQUIPTOSELL > 0))
  if ($PLANET~EQUIPTOSELL > $PLAYER~CURRENT_SECTOR.EQUTRADING)
    setvar $PLANET~EQUIPTOSELL $PLAYER~CURRENT_SECTOR.EQUTRADING
  end
  setvar $PLANET~ATTEMPTEQUCONFIRMED 1
  setvar $PLANET~PRODTOSELL "equ"
  setvar $PLANET~PORTBUYING $PLANET~EQUIPTOSELL
  gosub :SELLHAGGLE
  if ($PLANET~CURRENTHAGGLE = "succeeded")
    setvar $PLANET~EQUHAGGLE "succeeded"
    setvar $PLANET~EQUIPTOSELL 0
  else
    setvar $PLANET~EQUHAGGLE "failed"
  end
else
  send "az0*"
  setvar $PLANET~EQUIPTOSELL 0
end
goto :SELLPRODUCT
:PLANET~DONEWITHPORT

killtrigger SELLFUEL
killtrigger SELLORG
killtrigger SELLEQU
killtrigger DONEWITHPORT

if (($PLANET~ATTEMPTORE = 1) and ($PLANET~ATTEMPTORECONFIRMED = 0))

  setvar $PLANET~FUELTOSELL 0
end
if (($PLANET~ATTEMPTORG = 1) and ($PLANET~ATTEMPTORGCONFIRMED = 0))
  setvar $PLANET~ORGTOSELL 0
end
if (($PLANET~ATTEMPTEQU = 1) and ($PLANET~ATTEMPTEQUCONFIRMED = 0))
  setvar $PLANET~EQUIPTOSELL 0
end

if (($PLANET~ORE_SELL_FAILURES > 1) or ($PLANET~ORG_SELL_FAILURES > 4) or ($PLANET~EQU_SELL_FAILURES > 4))
  setvar $PLANET~SELLOUTPUT $PLANET~SELLOUTPUT&"Multiple Haggle Failures - Please cut and paste this haggling session and email to Cherokee*"
  return
elseif (($PLANET~FUELTOSELL = 0) and (($PLANET~ORGTOSELL = 0) and ($PLANET~EQUIPTOSELL = 0)))
  if (($PLANET~ATTEMPTORECONFIRMED = 0) and (($PLANET~ATTEMPTORGCONFIRMED = 0) and ($PLANET~ATTEMPTEQUCONFIRMED = 0)))
    setvar $PLANET~EXIT_MESSAGE "Nothing to sell here!"
  end
  return
else
  goto :RESELL
end
:PLANET~SELLHAGGLE

goto :PLANET~SELLHAGGLENATIVE

:PLANET~SELLHAGGLENATIVE
setvar $PLANET~CURRENTHAGGLE "pending"
setvar $PLANET~OLDCREDITS $PLAYER~CREDITS
setvar $PLANET~MCIC ""
send $PLANET~PORTBUYING&"*"

:PLANET~SELLHAGGLENATIVEWAIT
killalltriggers
settextlinetrigger NATIVESELLEXPERIENCE :PLANET~NATIVESELLEXPERIENCE "experience point(s)"
settextlinetrigger NATIVESELLYOUHAVE :PLANET~NATIVESELLYOUHAVE "You have"
settextlinetrigger NATIVESELLNOTINTERESTED :PLANET~NATIVESELLNOTINTERESTED "We're not interested."
settextlinetrigger NATIVESELLPROMPT :PLANET~NATIVESELLPROMPT "Command [TL="
pause

:PLANET~NATIVESELLEXPERIENCE
killalltriggers
getword CURRENTLINE $PLANET~EXP_BONUS 7
isnumber $PLANET~TESTEXP $PLANET~EXP_BONUS
if ($PLANET~TESTEXP <> 0)
  add $PLANET~EXPERIENCE $PLANET~EXP_BONUS
end
goto :PLANET~SELLHAGGLENATIVEWAIT

:PLANET~NATIVESELLYOUHAVE
killalltriggers
getword CURRENTLINE $PLANET~CREDITS 3
striptext $PLANET~CREDITS ","
isnumber $PLANET~TESTCREDITS $PLANET~CREDITS
if ($PLANET~TESTCREDITS = 0)
  goto :PLANET~SELLHAGGLENATIVEWAIT
end
getword CURRENTLINE $PLANET~CREDITLABEL 4
if ($PLANET~CREDITLABEL <> "credits.")
  goto :PLANET~SELLHAGGLENATIVEWAIT
end
setvar $PLANET~COUNTER $PLANET~CREDITS
subtract $PLANET~COUNTER $PLANET~OLDCREDITS
setvar $PLAYER~CREDITS $PLANET~CREDITS
if ($PLANET~COUNTER <= 0)
  setvar $PLANET~CURRENTHAGGLE "failed"
  goto :SELLHAGGLEFAILED
end
setvar $PLANET~CURRENTHAGGLE "succeeded"
gosub :PLANET~LOADNATIVEMCIC
goto :SELLHAGGLESUCCEEDED

:PLANET~NATIVESELLNOTINTERESTED
killalltriggers
setvar $PLANET~CURRENTHAGGLE "failed"
goto :SELLHAGGLEFAILED

:PLANET~NATIVESELLPROMPT
killalltriggers
if ($PLANET~CURRENTHAGGLE <> "succeeded")
  setvar $PLANET~CURRENTHAGGLE "failed"
  goto :SELLHAGGLEFAILED
end
return

:PLANET~LOADNATIVEMCIC
setvar $PLANET~MCIC $HAGGLE~MCIC
isnumber $PLANET~MCICVALID $PLANET~MCIC
if ($PLANET~MCICVALID = 0)
  if ($PLANET~PRODTOSELL = "ore")
    getsectorparameter $PLAYER~CURRENT_SECTOR "OREMCIC" $PLANET~MCIC
  elseif ($PLANET~PRODTOSELL = "org")
    getsectorparameter $PLAYER~CURRENT_SECTOR "ORGMCIC" $PLANET~MCIC
  elseif ($PLANET~PRODTOSELL = "equ")
    getsectorparameter $PLAYER~CURRENT_SECTOR "EQUMCIC" $PLANET~MCIC
  end
  isnumber $PLANET~MCICVALID $PLANET~MCIC
end
if ($PLANET~MCICVALID = 0)
  if ($PLANET~PRODTOSELL = "ore")
    setvar $PLANET~MCIC $PLANET~OREMCIC
  elseif ($PLANET~PRODTOSELL = "org")
    setvar $PLANET~MCIC $PLANET~ORGMCIC
  elseif ($PLANET~PRODTOSELL = "equ")
    setvar $PLANET~MCIC $PLANET~EQUMCIC
  end
  isnumber $PLANET~MCICVALID $PLANET~MCIC
end
if ($PLANET~MCICVALID <> 0)
  if ($PLANET~PRODTOSELL = "ore")
    setvar $PLANET~OREMCIC $PLANET~MCIC
    setsectorparameter $PLAYER~CURRENT_SECTOR "OREMCIC" $PLANET~MCIC
  elseif ($PLANET~PRODTOSELL = "org")
    setvar $PLANET~ORGMCIC $PLANET~MCIC
    setsectorparameter $PLAYER~CURRENT_SECTOR "ORGMCIC" $PLANET~MCIC
  elseif ($PLANET~PRODTOSELL = "equ")
    setvar $PLANET~EQUMCIC $PLANET~MCIC
    setsectorparameter $PLAYER~CURRENT_SECTOR "EQUMCIC" $PLANET~MCIC
  end
end
return

settextlinetrigger SELLFIRSTOFFER :SELLFIRSTOFFER "We'll buy them for"
send "az"&$PLANET~PORTBUYING&"*"
pause
:PLANET~SELLFIRSTOFFER

killtrigger SELLFIRSTOFFER
getword CURRENTLINE $PLANET~OFFER 5
striptext $PLANET~OFFER ","

gosub :PLAYER~SWATHOFF
if ($PLAYER~SWATHOFF = FALSE)
  gosub :NEGOTIATELAND
  setvar $PLANET~EXIT_MESSAGE $PLANET~SWATHOFFMESSAGE
  goto :EXITNEG
end


setvar $PLANET~PERUNITINITOFFER $PLANET~OFFER


multiply $PLANET~PERUNITINITOFFER 100
divide $PLANET~PERUNITINITOFFER $PLANET~_CK_PTRADESETTING


multiply $PLANET~PERUNITINITOFFER 100


divide $PLANET~PERUNITINITOFFER $PLANET~PORTBUYING


setvar $PLANET~PORTMAXINIT $PLANET~PERUNITINITOFFER


divide $PLANET~PERUNITINITOFFER 10

if ($PLANET~PRODTOSELL = "ore")

  setvar $PLANET~BASEVALUE 256055800
  setvar $PLANET~BASEPERCENT 11725
  setvar $PLANET~BASEPERCENTINVERSE 88275
  setvar $PLANET~PERCENTFROMBASE $PLAYER~CURRENT_SECTOR.OREPERCENT
elseif ($PLANET~PRODTOSELL = "org")

  setvar $PLANET~BASEVALUE 506276400
  setvar $PLANET~BASEPERCENT 11287
  setvar $PLANET~BASEPERCENTINVERSE 88713
  setvar $PLANET~PERCENTFROMBASE $PLAYER~CURRENT_SECTOR.ORGPERCENT
elseif ($PLANET~PRODTOSELL = "equ")

  setvar $PLANET~BASEVALUE 906281000
  setvar $PLANET~BASEPERCENT 10989
  setvar $PLANET~BASEPERCENTINVERSE 89010
  setvar $PLANET~PERCENTFROMBASE $PLAYER~CURRENT_SECTOR.EQUPERCENT

end
if ($PLANET~PERCENTFROMBASE = 100)


  divide $PLANET~PORTMAXINIT 10

elseif ($PLANET~PERCENTFROMBASE >= 15)

  multiply $PLANET~PORTMAXINIT 100000


  subtract $PLANET~PORTMAXINIT $PLANET~BASEVALUE


  multiply $PLANET~PERCENTFROMBASE 1000


  subtract $PLANET~PERCENTFROMBASE $PLANET~BASEPERCENT


  divide $PLANET~PORTMAXINIT $PLANET~PERCENTFROMBASE


  multiply $PLANET~PORTMAXINIT $PLANET~BASEPERCENTINVERSE


  add $PLANET~PORTMAXINIT $PLANET~BASEVALUE


  divide $PLANET~PORTMAXINIT 1000000

elseif ($PLANET~PRODTOSELL = "ore")
  setvar $PLANET~PORTMAXINIT 340

elseif ($PLANET~PRODTOSELL = "org")
  setvar $PLANET~PORTMAXINIT 635

elseif ($PLANET~PRODTOSELL = "equ")
  setvar $PLANET~PORTMAXINIT 1063



end
if ($PLANET~PRODTOSELL = "ore")

  if ($PLANET~PORTMAXINIT >= 436)
    setvar $PLANET~MCIC "-90"
    setvar $PLANET~MULTIPLE 1494

  elseif ($PLANET~PORTMAXINIT >= 434)
    setvar $PLANET~MCIC "-89"
    setvar $PLANET~MULTIPLE 1488

  elseif ($PLANET~PORTMAXINIT >= 433)
    setvar $PLANET~MCIC "-88"
    setvar $PLANET~MULTIPLE 1482

  elseif ($PLANET~PORTMAXINIT >= 431)
    setvar $PLANET~MCIC "-87"
    setvar $PLANET~MULTIPLE 1476

  elseif ($PLANET~PORTMAXINIT >= 429)
    setvar $PLANET~MCIC "-86"
    setvar $PLANET~MULTIPLE 1470

  elseif ($PLANET~PORTMAXINIT >= 427)
    setvar $PLANET~MCIC "-85"
    setvar $PLANET~MULTIPLE 1464

  elseif ($PLANET~PORTMAXINIT >= 425)
    setvar $PLANET~MCIC "-84"
    setvar $PLANET~MULTIPLE 1458

  elseif ($PLANET~PORTMAXINIT >= 424)
    setvar $PLANET~MCIC "-83"
    setvar $PLANET~MULTIPLE 1452

  elseif ($PLANET~PORTMAXINIT >= 422)
    setvar $PLANET~MCIC "-82"
    setvar $PLANET~MULTIPLE 1446

  elseif ($PLANET~PORTMAXINIT >= 420)
    setvar $PLANET~MCIC "-81"
    setvar $PLANET~MULTIPLE 1440

  elseif ($PLANET~PORTMAXINIT >= 418)
    setvar $PLANET~MCIC "-80"
    setvar $PLANET~MULTIPLE 1434

  elseif ($PLANET~PORTMAXINIT >= 416)
    setvar $PLANET~MCIC "-79"
    setvar $PLANET~MULTIPLE 1428

  elseif ($PLANET~PORTMAXINIT >= 414)
    setvar $PLANET~MCIC "-78"
    setvar $PLANET~MULTIPLE 1423

  elseif ($PLANET~PORTMAXINIT >= 412)
    setvar $PLANET~MCIC "-77"
    setvar $PLANET~MULTIPLE 1417

  elseif ($PLANET~PORTMAXINIT >= 411)
    setvar $PLANET~MCIC "-76"
    setvar $PLANET~MULTIPLE 1411

  elseif ($PLANET~PORTMAXINIT >= 409)
    setvar $PLANET~MCIC "-75"
    setvar $PLANET~MULTIPLE 1405

  elseif ($PLANET~PORTMAXINIT >= 407)
    setvar $PLANET~MCIC "-74"
    setvar $PLANET~MULTIPLE 1399

  elseif ($PLANET~PORTMAXINIT >= 405)
    setvar $PLANET~MCIC "-73"
    setvar $PLANET~MULTIPLE 1393

  elseif ($PLANET~PORTMAXINIT >= 403)
    setvar $PLANET~MCIC "-72"
    setvar $PLANET~MULTIPLE 1387

  elseif ($PLANET~PORTMAXINIT >= 401)
    setvar $PLANET~MCIC "-71"
    setvar $PLANET~MULTIPLE 1381

  elseif ($PLANET~PORTMAXINIT >= 399)
    setvar $PLANET~MCIC "-70"
    setvar $PLANET~MULTIPLE 1375

  elseif ($PLANET~PORTMAXINIT >= 397)
    setvar $PLANET~MCIC "-69"
    setvar $PLANET~MULTIPLE 1369

  elseif ($PLANET~PORTMAXINIT >= 396)
    setvar $PLANET~MCIC "-68"
    setvar $PLANET~MULTIPLE 1363

  elseif ($PLANET~PORTMAXINIT >= 394)
    setvar $PLANET~MCIC "-67"
    setvar $PLANET~MULTIPLE 1357

  elseif ($PLANET~PORTMAXINIT >= 392)
    setvar $PLANET~MCIC "-66"
    setvar $PLANET~MULTIPLE 1351

  elseif ($PLANET~PORTMAXINIT >= 390)
    setvar $PLANET~MCIC "-65"
    setvar $PLANET~MULTIPLE 1345

  elseif ($PLANET~PORTMAXINIT >= 388)
    setvar $PLANET~MCIC "-64"
    setvar $PLANET~MULTIPLE 1341

  elseif ($PLANET~PORTMAXINIT >= 386)
    setvar $PLANET~MCIC "-63"
    setvar $PLANET~MULTIPLE 1336

  elseif ($PLANET~PORTMAXINIT >= 384)
    setvar $PLANET~MCIC "-62"
    setvar $PLANET~MULTIPLE 1330

  elseif ($PLANET~PORTMAXINIT >= 382)
    setvar $PLANET~MCIC "-61"
    setvar $PLANET~MULTIPLE 1324

  elseif ($PLANET~PORTMAXINIT >= 380)
    setvar $PLANET~MCIC "-60"
    setvar $PLANET~MULTIPLE 1318

  elseif ($PLANET~PORTMAXINIT >= 378)
    setvar $PLANET~MCIC "-59"
    setvar $PLANET~MULTIPLE 1312

  elseif ($PLANET~PORTMAXINIT >= 376)
    setvar $PLANET~MCIC "-58"
    setvar $PLANET~MULTIPLE 1306

  elseif ($PLANET~PORTMAXINIT >= 374)
    setvar $PLANET~MCIC "-57"
    setvar $PLANET~MULTIPLE 1300

  elseif ($PLANET~PORTMAXINIT >= 372)
    setvar $PLANET~MCIC "-56"
    setvar $PLANET~MULTIPLE 1294

  elseif ($PLANET~PORTMAXINIT >= 370)
    setvar $PLANET~MCIC "-55"
    setvar $PLANET~MULTIPLE 1291

  elseif ($PLANET~PORTMAXINIT >= 368)
    setvar $PLANET~MCIC "-54"
    setvar $PLANET~MULTIPLE 1285

  elseif ($PLANET~PORTMAXINIT >= 366)
    setvar $PLANET~MCIC "-53"
    setvar $PLANET~MULTIPLE 1279

  elseif ($PLANET~PORTMAXINIT >= 364)
    setvar $PLANET~MCIC "-52"
    setvar $PLANET~MULTIPLE 1273

  elseif ($PLANET~PORTMAXINIT >= 362)
    setvar $PLANET~MCIC "-51"
    setvar $PLANET~MULTIPLE 1267

  elseif ($PLANET~PORTMAXINIT >= 360)
    setvar $PLANET~MCIC "-50"
    setvar $PLANET~MULTIPLE 1261

  elseif ($PLANET~PORTMAXINIT >= 358)
    setvar $PLANET~MCIC "-49"
    setvar $PLANET~MULTIPLE 1255

  elseif ($PLANET~PORTMAXINIT >= 356)
    setvar $PLANET~MCIC "-48"
    setvar $PLANET~MULTIPLE 1249

  elseif ($PLANET~PORTMAXINIT >= 354)
    setvar $PLANET~MCIC "-46"
    setvar $PLANET~MULTIPLE 1246

  elseif ($PLANET~PORTMAXINIT >= 352)
    setvar $PLANET~MCIC "-46"
    setvar $PLANET~MULTIPLE 1240

  elseif ($PLANET~PORTMAXINIT >= 350)
    setvar $PLANET~MCIC "-45"
    setvar $PLANET~MULTIPLE 1234

  elseif ($PLANET~PORTMAXINIT >= 348)
    setvar $PLANET~MCIC "-44"
    setvar $PLANET~MULTIPLE 1228

  elseif ($PLANET~PORTMAXINIT >= 346)
    setvar $PLANET~MCIC "-43"
    setvar $PLANET~MULTIPLE 1222

  elseif ($PLANET~PORTMAXINIT >= 344)
    setvar $PLANET~MCIC "-42"
    setvar $PLANET~MULTIPLE 1219

  elseif ($PLANET~PORTMAXINIT >= 342)
    setvar $PLANET~MCIC "-41"
    setvar $PLANET~MULTIPLE 1209

  elseif ($PLANET~PORTMAXINIT >= 340)
    setvar $PLANET~MCIC "-40"
    setvar $PLANET~MULTIPLE 1208

  else
    setvar $PLANET~MCIC 0
    setvar $PLANET~MULTIPLE 1208

  end
elseif ($PLANET~PRODTOSELL = "org")
  if ($PLANET~PORTMAXINIT >= 813)
    setvar $PLANET~MCIC "-75"
    setvar $PLANET~MULTIPLE 1405

  elseif ($PLANET~PORTMAXINIT >= 810)
    setvar $PLANET~MCIC "-74"
    setvar $PLANET~MULTIPLE 1399

  elseif ($PLANET~PORTMAXINIT >= 806)
    setvar $PLANET~MCIC "-73"
    setvar $PLANET~MULTIPLE 1393

  elseif ($PLANET~PORTMAXINIT >= 802)
    setvar $PLANET~MCIC "-72"
    setvar $PLANET~MULTIPLE 1387

  elseif ($PLANET~PORTMAXINIT >= 798)
    setvar $PLANET~MCIC "-71"
    setvar $PLANET~MULTIPLE 1381

  elseif ($PLANET~PORTMAXINIT >= 795)
    setvar $PLANET~MCIC "-70"
    setvar $PLANET~MULTIPLE 1375

  elseif ($PLANET~PORTMAXINIT >= 791)
    setvar $PLANET~MCIC "-69"
    setvar $PLANET~MULTIPLE 1369

  elseif ($PLANET~PORTMAXINIT >= 787)
    setvar $PLANET~MCIC "-68"
    setvar $PLANET~MULTIPLE 1363

  elseif ($PLANET~PORTMAXINIT >= 783)
    setvar $PLANET~MCIC "-67"
    setvar $PLANET~MULTIPLE 1357

  elseif ($PLANET~PORTMAXINIT >= 779)
    setvar $PLANET~MCIC "-66"
    setvar $PLANET~MULTIPLE 1351

  elseif ($PLANET~PORTMAXINIT >= 775)
    setvar $PLANET~MCIC "-65"
    setvar $PLANET~MULTIPLE 1345

  elseif ($PLANET~PORTMAXINIT >= 772)
    setvar $PLANET~MCIC "-64"
    setvar $PLANET~MULTIPLE 1339

  elseif ($PLANET~PORTMAXINIT >= 768)
    setvar $PLANET~MCIC "-63"
    setvar $PLANET~MULTIPLE 1336

  elseif ($PLANET~PORTMAXINIT >= 764)
    setvar $PLANET~MCIC "-62"
    setvar $PLANET~MULTIPLE 1330

  elseif ($PLANET~PORTMAXINIT >= 760)
    setvar $PLANET~MCIC "-61"
    setvar $PLANET~MULTIPLE 1324

  elseif ($PLANET~PORTMAXINIT >= 756)
    setvar $PLANET~MCIC "-60"
    setvar $PLANET~MULTIPLE 1318

  elseif ($PLANET~PORTMAXINIT >= 752)
    setvar $PLANET~MCIC "-59"
    setvar $PLANET~MULTIPLE 1312

  elseif ($PLANET~PORTMAXINIT >= 748)
    setvar $PLANET~MCIC "-58"
    setvar $PLANET~MULTIPLE 1306

  elseif ($PLANET~PORTMAXINIT >= 744)
    setvar $PLANET~MCIC "-57"
    setvar $PLANET~MULTIPLE 1300

  elseif ($PLANET~PORTMAXINIT >= 740)
    setvar $PLANET~MCIC "-56"
    setvar $PLANET~MULTIPLE 1294

  elseif ($PLANET~PORTMAXINIT >= 737)
    setvar $PLANET~MCIC "-55"
    setvar $PLANET~MULTIPLE 1291

  elseif ($PLANET~PORTMAXINIT >= 733)
    setvar $PLANET~MCIC "-54"
    setvar $PLANET~MULTIPLE 1285

  elseif ($PLANET~PORTMAXINIT >= 729)
    setvar $PLANET~MCIC "-53"
    setvar $PLANET~MULTIPLE 1279

  elseif ($PLANET~PORTMAXINIT >= 725)
    setvar $PLANET~MCIC "-52"
    setvar $PLANET~MULTIPLE 1273

  elseif ($PLANET~PORTMAXINIT >= 721)
    setvar $PLANET~MCIC "-51"
    setvar $PLANET~MULTIPLE 1267

  elseif ($PLANET~PORTMAXINIT >= 717)
    setvar $PLANET~MCIC "-50"
    setvar $PLANET~MULTIPLE 1261

  elseif ($PLANET~PORTMAXINIT >= 713)
    setvar $PLANET~MCIC "-49"
    setvar $PLANET~MULTIPLE 1255

  elseif ($PLANET~PORTMAXINIT >= 709)
    setvar $PLANET~MCIC "-48"
    setvar $PLANET~MULTIPLE 1252

  elseif ($PLANET~PORTMAXINIT >= 705)
    setvar $PLANET~MCIC "-47"
    setvar $PLANET~MULTIPLE 1246

  elseif ($PLANET~PORTMAXINIT >= 701)
    setvar $PLANET~MCIC "-46"
    setvar $PLANET~MULTIPLE 1236

  elseif ($PLANET~PORTMAXINIT >= 697)
    setvar $PLANET~MCIC "-45"
    setvar $PLANET~MULTIPLE 1233

  elseif ($PLANET~PORTMAXINIT >= 693)
    setvar $PLANET~MCIC "-44"
    setvar $PLANET~MULTIPLE 1227

  elseif ($PLANET~PORTMAXINIT >= 688)
    setvar $PLANET~MCIC "-43"
    setvar $PLANET~MULTIPLE 1224

  elseif ($PLANET~PORTMAXINIT >= 684)
    setvar $PLANET~MCIC "-42"
    setvar $PLANET~MULTIPLE 1214

  elseif ($PLANET~PORTMAXINIT >= 680)
    setvar $PLANET~MCIC "-41"
    setvar $PLANET~MULTIPLE 1213

  elseif ($PLANET~PORTMAXINIT >= 676)
    setvar $PLANET~MCIC "-40"
    setvar $PLANET~MULTIPLE 1203

  elseif ($PLANET~PORTMAXINIT >= 672)
    setvar $PLANET~MCIC "-39"
    setvar $PLANET~MULTIPLE 1200

  elseif ($PLANET~PORTMAXINIT >= 668)
    setvar $PLANET~MCIC "-38"
    setvar $PLANET~MULTIPLE 1194

  elseif ($PLANET~PORTMAXINIT >= 664)
    setvar $PLANET~MCIC "-37"
    setvar $PLANET~MULTIPLE 1191

  elseif ($PLANET~PORTMAXINIT >= 660)
    setvar $PLANET~MCIC "-36"
    setvar $PLANET~MULTIPLE 1181

  elseif ($PLANET~PORTMAXINIT >= 656)
    setvar $PLANET~MCIC "-35"
    setvar $PLANET~MULTIPLE 1178

  elseif ($PLANET~PORTMAXINIT >= 651)
    setvar $PLANET~MCIC "-34"
    setvar $PLANET~MULTIPLE 1172

  elseif ($PLANET~PORTMAXINIT >= 647)
    setvar $PLANET~MCIC "-33"
    setvar $PLANET~MULTIPLE 1166

  elseif ($PLANET~PORTMAXINIT >= 643)
    setvar $PLANET~MCIC "-32"
    setvar $PLANET~MULTIPLE 1160

  elseif ($PLANET~PORTMAXINIT >= 639)
    setvar $PLANET~MCIC "-31"
    setvar $PLANET~MULTIPLE 1157

  elseif ($PLANET~PORTMAXINIT >= 635)
    setvar $PLANET~MCIC "-30"
    setvar $PLANET~MULTIPLE 1154

  else
    setvar $PLANET~MCIC 0
    setvar $PLANET~MULTIPLE 1154

  end
elseif ($PLANET~PRODTOSELL = "equ")
  if ($PLANET~PORTMAXINIT >= 1393)
    setvar $PLANET~MCIC "-65"
    setvar $PLANET~MULTIPLE 1347

  elseif ($PLANET~PORTMAXINIT >= 1386)
    setvar $PLANET~MCIC "-64"
    setvar $PLANET~MULTIPLE 1341

  elseif ($PLANET~PORTMAXINIT >= 1379)
    setvar $PLANET~MCIC "-63"
    setvar $PLANET~MULTIPLE 1336

  elseif ($PLANET~PORTMAXINIT >= 1372)
    setvar $PLANET~MCIC "-62"
    setvar $PLANET~MULTIPLE 1330

  elseif ($PLANET~PORTMAXINIT >= 1365)
    setvar $PLANET~MCIC "-61"
    setvar $PLANET~MULTIPLE 1324

  elseif ($PLANET~PORTMAXINIT >= 1358)
    setvar $PLANET~MCIC "-60"
    setvar $PLANET~MULTIPLE 1319

  elseif ($PLANET~PORTMAXINIT >= 1351)
    setvar $PLANET~MCIC "-59"
    setvar $PLANET~MULTIPLE 1313

  elseif ($PLANET~PORTMAXINIT >= 1344)
    setvar $PLANET~MCIC "-58"
    setvar $PLANET~MULTIPLE 1307

  elseif ($PLANET~PORTMAXINIT >= 1337)
    setvar $PLANET~MCIC "-57"
    setvar $PLANET~MULTIPLE 1302

  elseif ($PLANET~PORTMAXINIT >= 1329)
    setvar $PLANET~MCIC "-56"
    setvar $PLANET~MULTIPLE 1296

  elseif ($PLANET~PORTMAXINIT >= 1323)
    setvar $PLANET~MCIC "-55"
    setvar $PLANET~MULTIPLE 1291

  elseif ($PLANET~PORTMAXINIT >= 1315)
    setvar $PLANET~MCIC "-54"
    setvar $PLANET~MULTIPLE 1285

  elseif ($PLANET~PORTMAXINIT >= 1308)
    setvar $PLANET~MCIC "-53"
    setvar $PLANET~MULTIPLE 1279

  elseif ($PLANET~PORTMAXINIT >= 1301)
    setvar $PLANET~MCIC "-52"
    setvar $PLANET~MULTIPLE 1274

  elseif ($PLANET~PORTMAXINIT >= 1294)
    setvar $PLANET~MCIC "-51"
    setvar $PLANET~MULTIPLE 1268

  elseif ($PLANET~PORTMAXINIT >= 1287)
    setvar $PLANET~MCIC "-50"
    setvar $PLANET~MULTIPLE 1262

  elseif ($PLANET~PORTMAXINIT >= 1279)
    setvar $PLANET~MCIC "-49"
    setvar $PLANET~MULTIPLE 1254

  elseif ($PLANET~PORTMAXINIT >= 1272)
    setvar $PLANET~MCIC "-48"
    setvar $PLANET~MULTIPLE 1247

  elseif ($PLANET~PORTMAXINIT >= 1265)
    setvar $PLANET~MCIC "-47"
    setvar $PLANET~MULTIPLE 1246

  elseif ($PLANET~PORTMAXINIT >= 1258)
    setvar $PLANET~MCIC "-46"
    setvar $PLANET~MULTIPLE 1241

  elseif ($PLANET~PORTMAXINIT >= 1251)
    setvar $PLANET~MCIC "-45"
    setvar $PLANET~MULTIPLE 1235

  elseif ($PLANET~PORTMAXINIT >= 1243)
    setvar $PLANET~MCIC "-44"
    setvar $PLANET~MULTIPLE 1229

  elseif ($PLANET~PORTMAXINIT >= 1236)
    setvar $PLANET~MCIC "-43"
    setvar $PLANET~MULTIPLE 1224

  elseif ($PLANET~PORTMAXINIT >= 1229)
    setvar $PLANET~MCIC "-42"
    setvar $PLANET~MULTIPLE 1218

  elseif ($PLANET~PORTMAXINIT >= 1221)
    setvar $PLANET~MCIC "-41"
    setvar $PLANET~MULTIPLE 1213

  elseif ($PLANET~PORTMAXINIT >= 1214)
    setvar $PLANET~MCIC "-40"
    setvar $PLANET~MULTIPLE 1208

  elseif ($PLANET~PORTMAXINIT >= 1206)
    setvar $PLANET~MCIC "-39"
    setvar $PLANET~MULTIPLE 1201

  elseif ($PLANET~PORTMAXINIT >= 1199)
    setvar $PLANET~MCIC "-38"
    setvar $PLANET~MULTIPLE 1196

  elseif ($PLANET~PORTMAXINIT >= 1192)
    setvar $PLANET~MCIC "-37"
    setvar $PLANET~MULTIPLE 1190

  elseif ($PLANET~PORTMAXINIT >= 1184)
    setvar $PLANET~MCIC "-36"
    setvar $PLANET~MULTIPLE 1185

  elseif ($PLANET~PORTMAXINIT >= 1177)
    setvar $PLANET~MCIC "-35"
    setvar $PLANET~MULTIPLE 1180

  elseif ($PLANET~PORTMAXINIT >= 1169)
    setvar $PLANET~MCIC "-34"
    setvar $PLANET~MULTIPLE 1174

  elseif ($PLANET~PORTMAXINIT >= 1162)
    setvar $PLANET~MCIC "-33"
    setvar $PLANET~MULTIPLE 1169

  elseif ($PLANET~PORTMAXINIT >= 1154)
    setvar $PLANET~MCIC "-32"
    setvar $PLANET~MULTIPLE 1164

  elseif ($PLANET~PORTMAXINIT >= 1147)
    setvar $PLANET~MCIC "-31"
    setvar $PLANET~MULTIPLE 1158

  elseif ($PLANET~PORTMAXINIT >= 1139)
    setvar $PLANET~MCIC "-30"
    setvar $PLANET~MULTIPLE 1152

  elseif ($PLANET~PORTMAXINIT >= 1132)
    setvar $PLANET~MCIC "-29"
    setvar $PLANET~MULTIPLE 1149

  elseif ($PLANET~PORTMAXINIT >= 1124)
    setvar $PLANET~MCIC "-28"
    setvar $PLANET~MULTIPLE 1144

  elseif ($PLANET~PORTMAXINIT >= 1116)
    setvar $PLANET~MCIC "-27"
    setvar $PLANET~MULTIPLE 1136

  elseif ($PLANET~PORTMAXINIT >= 1109)
    setvar $PLANET~MCIC "-26"
    setvar $PLANET~MULTIPLE 1132

  elseif ($PLANET~PORTMAXINIT >= 1101)
    setvar $PLANET~MCIC "-25"
    setvar $PLANET~MULTIPLE 1126

  elseif ($PLANET~PORTMAXINIT >= 1093)
    setvar $PLANET~MCIC "-24"
    setvar $PLANET~MULTIPLE 1122

  elseif ($PLANET~PORTMAXINIT >= 1086)
    setvar $PLANET~MCIC "-23"
    setvar $PLANET~MULTIPLE 1117

  elseif ($PLANET~PORTMAXINIT >= 1078)
    setvar $PLANET~MCIC "-22"
    setvar $PLANET~MULTIPLE 1110

  elseif ($PLANET~PORTMAXINIT >= 1071)
    setvar $PLANET~MCIC "-21"
    setvar $PLANET~MULTIPLE 1105

  elseif ($PLANET~PORTMAXINIT >= 1063)
    setvar $PLANET~MCIC "-20"
    setvar $PLANET~MULTIPLE 1102

  else
    setvar $PLANET~MCIC 0
    setvar $PLANET~MULTIPLE 1102



  end
end
setvar $PLANET~COUNTER $PLANET~OFFER
divide $PLANET~COUNTER 10
multiply $PLANET~COUNTER $PLANET~MULTIPLE
divide $PLANET~COUNTER 100
send "az"&$PLANET~COUNTER&"*"
setvar $PLANET~MIDHAGGLES 0
:PLANET~SELLOFFERLOOP
settextlinetrigger SELLPRICE :SELLPRICE "We'll buy them for"
settextlinetrigger SELLFINALOFFER :SELLFINALOFFER "Our final offer"

settextlinetrigger SELLEXPERIENCE :SELLEXPERIENCE "experience point(s)"
settextlinetrigger SELLYOUHAVE :SELLYOUHAVE "You have"

settextlinetrigger SELLSCREWUP1 :SELLSCREWUP "Get real ion-brain, make me a real offer."
settextlinetrigger SELLSCREWUP2 :SELLSCREWUP "This is the big leagues Jr.  Make a real offer."
settextlinetrigger SELLSCREWUP3 :SELLSCREWUP "My patience grows short with you."
settextlinetrigger SELLSCREWUP4 :SELLSCREWUP "I have much better things to do than waste my time.  Try again."
settextlinetrigger SELLSCREWUP5 :SELLSCREWUP "HA! HA, ha hahahhah hehehe hhhohhohohohh!  You choke me up!"
settextlinetrigger SELLSCREWUP6 :SELLSCREWUP "Quit playing around, you're wasting my time!"
settextlinetrigger SELLSCREWUP7 :SELLSCREWUP "Make a real offer or get the h"
settextlinetrigger SELLSCREWUP8 :SELLSCREWUP "WHAT?!@!? you must be crazy!"
settextlinetrigger SELLSCREWUP9 :SELLSCREWUP "So, you think I'm as stupid as you look? Make a real offer."
settextlinetrigger SELLSCREWUP10 :SELLSCREWUP "What do you take me for, a fool?  Make a real offer!"
settextlinetrigger SELLSCREWUP11 :SELLSCREWUP "Swine, go peddle your wares somewhere else, you make me sick."
settextlinetrigger SELLSCREWUP12 :SELLSCREWUP "I see you are as stupid as you look, get lost..."
settextlinetrigger SELLSCREWUP13 :SELLSCREWUP "HA!  You think me a fool?  Thats insane!  Get out of here!"
settextlinetrigger SELLSCREWUP14 :SELLSCREWUP "Get lost creep, that junk isn't worth half that much!"
settextlinetrigger SELLSCREWUP15 :SELLSCREWUP "I think you'd better leave if you value your life!"
pause
pause
:PLANET~SELLSCREWUP
killtrigger SELLPRICE
killtrigger SELLFINALOFFER
killtrigger SELLEXPERIENCE
killtrigger SELLYOUHAVE
killtrigger SELLSCREWUP1
killtrigger SELLSCREWUP2
killtrigger SELLSCREWUP3
killtrigger SELLSCREWUP4
killtrigger SELLSCREWUP5
killtrigger SELLSCREWUP6
killtrigger SELLSCREWUP7
killtrigger SELLSCREWUP8
killtrigger SELLSCREWUP9
killtrigger SELLSCREWUP10
killtrigger SELLSCREWUP11
killtrigger SELLSCREWUP12
killtrigger SELLSCREWUP13
killtrigger SELLSCREWUP14
killtrigger SELLSCREWUP15
echo "*## PICKUP up sell fail"
goto :SELLHAGGLEFAILED
echo "*### HSOULD NOT GET HERE NOW"


multiply $PLANET~COUNTER 98
divide $PLANET~COUNTER 100
send "az"&$PLANET~COUNTER&"*"
goto :SELLOFFERLOOP
:PLANET~SELLPRICE
killtrigger SELLPRICE
killtrigger SELLFINALOFFER
killtrigger SELLEXPERIENCE
killtrigger SELLYOUHAVE
killtrigger SELLSCREWUP1
killtrigger SELLSCREWUP2
killtrigger SELLSCREWUP3
killtrigger SELLSCREWUP4
killtrigger SELLSCREWUP5
killtrigger SELLSCREWUP6
killtrigger SELLSCREWUP7
killtrigger SELLSCREWUP8
killtrigger SELLSCREWUP9
killtrigger SELLSCREWUP10
killtrigger SELLSCREWUP11
killtrigger SELLSCREWUP12
killtrigger SELLSCREWUP13
killtrigger SELLSCREWUP14
killtrigger SELLSCREWUP15
add $PLANET~MIDHAGGLES 1
setvar $PLANET~OLD_OFFER $PLANET~OFFER
setvar $PLANET~OLD_COUNTER $PLANET~COUNTER
getword CURRENTLINE $PLANET~OFFER 5
striptext $PLANET~OFFER ","


setvar $PLANET~OFFER_CHANGE $PLANET~OFFER
subtract $PLANET~OFFER_CHANGE $PLANET~OLD_OFFER
if ($PLANET~MCIC > "-35")
  multiply $PLANET~OFFER_CHANGE 75
  divide $PLANET~OFFER_CHANGE 100
  subtract $PLANET~COUNTER $PLANET~OFFER_CHANGE
  subtract $PLANET~COUNTER 25
elseif ($PLANET~MCIC > "-55")
  multiply $PLANET~OFFER_CHANGE 65
  divide $PLANET~OFFER_CHANGE 100
  subtract $PLANET~COUNTER $PLANET~OFFER_CHANGE
  subtract $PLANET~COUNTER 25
else
  multiply $PLANET~OFFER_CHANGE 60
  divide $PLANET~OFFER_CHANGE 100
  subtract $PLANET~COUNTER $PLANET~OFFER_CHANGE
  subtract $PLANET~COUNTER 10
end
send "az"&$PLANET~COUNTER&"*"
goto :SELLOFFERLOOP
:PLANET~SELLFINALOFFER
killtrigger SELLPRICE
killtrigger SELLFINALOFFER
killtrigger SELLEXPERIENCE
killtrigger SELLYOUHAVE
killtrigger SELLSCREWUP1
killtrigger SELLSCREWUP2
killtrigger SELLSCREWUP3
killtrigger SELLSCREWUP4
killtrigger SELLSCREWUP5
killtrigger SELLSCREWUP6
killtrigger SELLSCREWUP7
killtrigger SELLSCREWUP8
killtrigger SELLSCREWUP9
killtrigger SELLSCREWUP10
killtrigger SELLSCREWUP11
killtrigger SELLSCREWUP12
killtrigger SELLSCREWUP13
killtrigger SELLSCREWUP14
killtrigger SELLSCREWUP15




if (($PLANET~PRODTOSELL = "ore") and (($PLANET~MCIC <= "-75") and (($PLANET~PORTBUYING >= 25000) and (($PLANET~MIDHAGGLES < 1) and ($PLANET~ORE_SELL_FAILURES < 2)))))
  setvar $PLANET~FORCEFAIL 1
  setvar $PLANET~THISOREFAILED 1
elseif (($PLANET~PRODTOSELL = "org") and ((($PLANET~MCIC <= "-60") and ((($PLANET~PORTBUYING >= 25000) and ((($PLANET~MIDHAGGLES < 2) and (($PLANET~THISOREFAILED = 1) or ($PLANET~ORG_SELL_FAILURES < 4)))))))))
  setvar $PLANET~FORCEFAIL 1
  setvar $PLANET~THISORGFAILED 1
elseif (($PLANET~PRODTOSELL = "org") and ((($PLANET~MCIC <= "-60") and ((($PLANET~PORTBUYING >= 15000) and ((($PLANET~MIDHAGGLES < 1) and (($PLANET~THISOREFAILED = 1) or ($PLANET~ORG_SELL_FAILURES < 2)))))))))
  setvar $PLANET~FORCEFAIL 1
  setvar $PLANET~THISORGFAILED 1
elseif (($PLANET~PRODTOSELL = "equ") and ((($PLANET~MCIC <= "-55") and ((($PLANET~PORTBUYING >= 20000) and ((($PLANET~MIDHAGGLES < 2) and (($PLANET~THISOREFAILED = 1) or ($PLANET~THISORGFAILED = 1) or ($PLANET~EQU_SELL_FAILURES < 4)))))))))
  setvar $PLANET~FORCEFAIL 1
  setvar $PLANET~THISEQUFAILED 1
elseif (($PLANET~PRODTOSELL = "equ") and ((($PLANET~MCIC <= "-55") and ((($PLANET~PORTBUYING >= 12000) and ((($PLANET~MIDHAGGLES < 1) and (($PLANET~THISOREFAILED = 1) or ($PLANET~THISORGFAILED = 1) or ($PLANET~EQU_SELL_FAILURES < 2)))))))))
  setvar $PLANET~FORCEFAIL 1
  setvar $PLANET~THISEQUFAILED 1
else
  setvar $PLANET~FORCEFAIL 0
end
if ($PLANET~PRODTOSELL = "ore")
  setsectorparameter $PLAYER~CURRENT_SECTOR "OREMCIC" $PLANET~MCIC
elseif ($PLANET~PRODTOSELL = "org")
  setsectorparameter $PLAYER~CURRENT_SECTOR "ORGMCIC" $PLANET~MCIC
elseif ($PLANET~PRODTOSELL = "equ")
  setsectorparameter $PLAYER~CURRENT_SECTOR "EQUMCIC" $PLANET~MCIC

end
if ($PLANET~FORCEFAIL = 0)
  setvar $PLANET~OLD_OFFER $PLANET~OFFER
  setvar $PLANET~OLD_COUNTER $PLANET~COUNTER
  getword CURRENTLINE $PLANET~OFFER 5
  striptext $PLANET~OFFER ","
  setvar $PLANET~OFFER_CHANGE $PLANET~OFFER
  subtract $PLANET~OFFER_CHANGE $PLANET~OLD_OFFER
  if ($PLANET~PRODTOSELL = "ore")
    multiply $PLANET~OFFER_CHANGE 30
  elseif ($PLANET~PRODTOSELL = "org")
    multiply $PLANET~OFFER_CHANGE 27
  elseif ($PLANET~PRODTOSELL = "equ")
    multiply $PLANET~OFFER_CHANGE 25
  end
  divide $PLANET~OFFER_CHANGE 10
  subtract $PLANET~COUNTER $PLANET~OFFER_CHANGE
  subtract $PLANET~COUNTER 10
  send "az"&$PLANET~COUNTER&"*"
else

  send "az"&$PLANET~COUNTER&"*"
end
goto :SELLOFFERLOOP
:PLANET~SELLNOTINTERESTED
killtrigger SELLPRICE
killtrigger SELLFINALOFFER
killtrigger SELLEXPERIENCE
killtrigger SELLYOUHAVE
killtrigger SELLSCREWUP1
killtrigger SELLSCREWUP2
killtrigger SELLSCREWUP3
killtrigger SELLSCREWUP4
killtrigger SELLSCREWUP5
killtrigger SELLSCREWUP6
killtrigger SELLSCREWUP7
killtrigger SELLSCREWUP8
killtrigger SELLSCREWUP9
killtrigger SELLSCREWUP10
killtrigger SELLSCREWUP11
killtrigger SELLSCREWUP12
killtrigger SELLSCREWUP13
killtrigger SELLSCREWUP14
killtrigger SELLSCREWUP15

goto :SELLHAGGLEFAILED
:PLANET~SELLEXPERIENCE
killtrigger SELLPRICE
killtrigger SELLFINALOFFER
killtrigger SELLEXPERIENCE
killtrigger SELLYOUHAVE
killtrigger SELLSCREWUP1
killtrigger SELLSCREWUP2
killtrigger SELLSCREWUP3
killtrigger SELLSCREWUP4
killtrigger SELLSCREWUP5
killtrigger SELLSCREWUP6
killtrigger SELLSCREWUP7
killtrigger SELLSCREWUP8
killtrigger SELLSCREWUP9
killtrigger SELLSCREWUP10
killtrigger SELLSCREWUP11
killtrigger SELLSCREWUP12
killtrigger SELLSCREWUP13
killtrigger SELLSCREWUP14

getword CURRENTLINE $PLANET~EXP_BONUS 7
add $PLANET~EXPERIENCE $PLANET~EXP_BONUS
goto :SELLOFFERLOOP
:PLANET~SELLYOUHAVE
killtrigger SELLPRICE
killtrigger SELLFINALOFFER
killtrigger SELLEXPERIENCE
killtrigger SELLYOUHAVE
killtrigger SELLSCREWUP1
killtrigger SELLSCREWUP2
killtrigger SELLSCREWUP3
killtrigger SELLSCREWUP4
killtrigger SELLSCREWUP5
killtrigger SELLSCREWUP6
killtrigger SELLSCREWUP7
killtrigger SELLSCREWUP8
killtrigger SELLSCREWUP9
killtrigger SELLSCREWUP10
killtrigger SELLSCREWUP11
killtrigger SELLSCREWUP12
killtrigger SELLSCREWUP13
killtrigger SELLSCREWUP14
killtrigger SELLSCREWUP15
setvar $PLANET~OLDCREDITS $PLAYER~CREDITS
getword CURRENTLINE $PLANET~CREDITS 3
striptext $PLANET~CREDITS ","

if ($PLANET~OLDCREDITS = $PLANET~CREDITS)
  setvar $PLANET~CURRENTHAGGLE "failed"
  goto :SELLHAGGLEFAILED
else
  setvar $PLANET~CURRENTHAGGLE "succeeded"
  goto :SELLHAGGLESUCCEEDED
end
:PLANET~SELLHAGGLEFAILED
if ($PLANET~PRODTOSELL = "ore")
  add $PLANET~ORE_SELL_FAILURES 1
elseif ($PLANET~PRODTOSELL = "org")
  add $PLANET~ORG_SELL_FAILURES 1
elseif ($PLANET~PRODTOSELL = "equ")
  add $PLANET~EQU_SELL_FAILURES 1
end
if ($PLANET~SELLDELAY > 99)
  setdelaytrigger SELLDELAY :SELLDELAY $PLANET~SELLDELAY
  pause
  :PLANET~SELLDELAY
end
return
:PLANET~SELLHAGGLESUCCEEDED

setvar $PLANET~PERUNIT $PLANET~COUNTER
divide $PLANET~PERUNIT $PLANET~PORTBUYING


setvar $PLANET~SELLOUTPUT ""
setvar $PLANET~SELLOUTPUT $PLANET~SELLOUTPUT&$PLANET~PORTBUYING&" "&$PLANET~PRODTOSELL&" for "&$PLANET~COUNTER&" cr"
setvar $PLANET~SELLOUTPUT $PLANET~SELLOUTPUT&" - "
if ($PLANET~PRODTOSELL = "ore")
  setvar $PLANET~SELLOUTPUT $PLANET~SELLOUTPUT&$PLANET~ORE_SELL_FAILURES
elseif ($PLANET~PRODTOSELL = "org")
  setvar $PLANET~SELLOUTPUT $PLANET~SELLOUTPUT&$PLANET~ORG_SELL_FAILURES
elseif ($PLANET~PRODTOSELL = "equ")
  setvar $PLANET~SELLOUTPUT $PLANET~SELLOUTPUT&$PLANET~EQU_SELL_FAILURES
end
setvar $PLANET~SELLOUTPUT $PLANET~SELLOUTPUT&" fails"
setvar $PLANET~SELLOUTPUT $PLANET~SELLOUTPUT&" - "&$PLANET~PERUNIT&"/unit"


setvar $PLANET~SELLOUTPUT $PLANET~SELLOUTPUT&" - MCIC "&$PLANET~MCIC
if ($PLANET~PRODTOSELL = "ore")
  setvar $PLANET~SELLOUTPUT $PLANET~SELLOUTPUT&"/-90*"
  setvar $PLANET~ORESELLOUTPUT $PLANET~SELLOUTPUT
  setvar $PLANET~OREPROFIT $PLANET~COUNTER
elseif ($PLANET~PRODTOSELL = "org")
  setvar $PLANET~SELLOUTPUT $PLANET~SELLOUTPUT&"/-75*"
  setvar $PLANET~ORGSELLOUTPUT $PLANET~SELLOUTPUT
  setvar $PLANET~ORGPROFIT $PLANET~COUNTER
elseif ($PLANET~PRODTOSELL = "equ")
  setvar $PLANET~SELLOUTPUT $PLANET~SELLOUTPUT&"/-65*"
  setvar $PLANET~EQUSELLOUTPUT $PLANET~SELLOUTPUT
  setvar $PLANET~EQUPROFIT $PLANET~COUNTER

end
if ($PLANET~SELLDELAY > 99)
  setdelaytrigger SELLDELAY :SELLDELAY2 $PLANET~SELLDELAY
  pause
  pause
  :PLANET~SELLDELAY2
end
return
:PLANET~NEGOTIATELAND

if ($PLANET~STARTINGLOCATION = "Citadel")
  send "L "&$PLANET~PLANET&"* "
  gosub :GETPLANETINFO
  send "c "
elseif ($PLANET~STARTINGLOCATION = "Planet")
  send "L "&$PLANET~PLANET&"* "
  gosub :GETPLANETINFO
end
return
:PLANET~EXITNEG

return

:PLANET~READPLANETLIST
read $PLANET~PLANET_FILE $PLANET~PLANETINF $PLANET~PLANETCOUNTER
if ($PLANET~PLANETINF <> "EOF")
  gosub :PROCESS_PLANET_LINE
  setvar $PLANET~PLANETLIST[$PLANET~PLANETCOUNTER] $PLANET~PLANETNAME
  setvar $PLANET~PLANETLIST[$PLANET~PLANETCOUNTER][1] $PLANET~PLANET_FUEL_COLONISTS_MAX
  setvar $PLANET~PLANETLIST[$PLANET~PLANETCOUNTER][2] $PLANET~PLANET_ORG_COLONISTS_MAX
  setvar $PLANET~PLANETLIST[$PLANET~PLANETCOUNTER][3] $PLANET~PLANET_EQUIP_COLONISTS_MAX
  setvar $PLANET~PLANETLIST[$PLANET~PLANETCOUNTER][4] $PLANET~PLANET_IS_KEEPER
  add $PLANET~PLANETCOUNTER 1
  goto :READPLANETLIST
end
setvar $PLANET~PLANETSTATS TRUE
return
