:planet~countplanets














setvar $planet~planetcount 0
killtrigger PLANETGRABBER
killtrigger BEDONE
send "/"
waiton "Creds"
settextlinetrigger PLANETGRABBER :PLANETLINE "   <"
settextlinetrigger BEDONE :DONE "Land on which planet "
send "|lq*|"
pause
:planet~planetline
killtrigger GETEND
killtrigger GETLINE2
killtrigger PLANETGRABBER
killtrigger BEDONE
getwordpos CURRENTLINE $planet~pos "<<<< SHIELDED"
if ($planet~pos <= 0)
  setvar $planet~line CURRENTLINE
  replacetext $planet~line "<" " "
  replacetext $planet~line ">" " "
  striptext $planet~line ","
  add $planet~planetcount 1
  getword $planet~line $planet~planets[$planet~planetcount] 1
end
settextlinetrigger GETLINE2 :PLANETLINE "   <"
settextlinetrigger GETEND :DONE "Land on which planet "
pause
:planet~done
killtrigger GETEND
killtrigger GETLINE2
killtrigger PLANETGRABBER
killtrigger BEDONE

return
:planet~getplanetinfo




setvar $planet~planet 0
setvar $planet~planet_fuel 0
setvar $planet~planet_fuel_max 0
setvar $planet~planet_organics 0
setvar $planet~planet_organics_max 0
setvar $planet~planet_equipment 0
setvar $planet~planet_equipment_max 0
setvar $planet~planet_fighters 0
setvar $planet~planet_transport 0
setvar $planet~planet_fighters_max 0
setvar $planet~citadel 0
setvar $planet~citadel_credits 0
setvar $planet~atmosphere_cannon 0
setvar $planet~sector_cannon 0
setvar $planet~planet_class_name "undefined"
setvar $planet~planet_name "undefined"
setvar $planet~under_construction FALSE
setvar $planet~maxed_level FALSE


send "*"
killtrigger PLANETINFO2
settextlinetrigger PLANETINFO2 :PLANETINFO2 "Planet #"
pause
:planet~planetinfo2


setvar $planet~citadel 0
setvar $planet~sector_cannon 0
setvar $planet~atmosphere_cannon 0
setvar $planet~citadel_credits 0
getword CURRENTLINE $planet~planet 2
striptext $planet~planet "#"
isnumber $planet~tst $planet~planet
if ($planet~tst <> TRUE)
  settextlinetrigger PLANETINFO2 :PLANETINFO2 "Planet #"
  pause
end
getword CURRENTLINE $player~current_sector 5
striptext $player~current_sector ":"
getwordpos CURRENTLINE $planet~pos ": "
cuttext CURRENTLINE $planet~planet_name ($planet~pos + 2) 999
savevar $planet~planet
savevar $player~current_sector
setsectorparameter $planet~planet "PSECTOR" $player~current_sector

settextlinetrigger CLASS :GETCLASS "Class "
pause
:planet~getclass
setvar $planet~planet_class_name CURRENTLINE
waitfor "2 Build 1   Product    Amount     Amount     Maximum"

gosub :KILLPLANETTRIGGERS
:planet~getplanetstuff

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
:planet~underconst

setvar $planet~under_construction TRUE
pause
:planet~maxedig

setvar $planet~maxed_level TRUE
pause
:planet~planettport

gettext CURRENTLINE $planet~planet_tpad "power =" "hops -"
striptext $planet~planet_tpad ","
striptext $planet~planet_tpad " "
isnumber $planet~tst $planet~planet_tpad
if ($planet~tst = 0)
  setvar $planet~planet_tpad 0
end
setvar $planet~planet_transport $planet~planet_tpad
pause
:planet~planetshields

getword CURRENTLINE $planet~planet_shields 8
striptext $planet~planet_shields ","
isnumber $planet~tst $planet~planet_shields
if ($planet~tst = 0)
  setvar $planet~planet_shields 0
end
pause
:planet~fuelstart

getword CURRENTLINE $planet~planet_fuel_colonists 3
getword CURRENTLINE $planet~planet_fuel 6
getword CURRENTLINE $planet~planet_fuel_max 8
getword CURRENTLINE $planet~planetfuel 6
getword CURRENTLINE $planet~planetfuelmax 8
striptext $planet~planetfuel ","
striptext $planet~planetfuelmax ","
striptext $planet~planet_fuel ","
striptext $planet~planet_fuel_max ","
striptext $planet~planet_fuel_colonists ","
pause
:planet~orgstart

getword CURRENTLINE $planet~planet_organics_colonists 2
getword CURRENTLINE $planet~planet_organics 5
getword CURRENTLINE $planet~planet_organics_max 7
getword CURRENTLINE $planet~planetorg 5
getword CURRENTLINE $planet~planetorgmax 7
striptext $planet~planetorg ","
striptext $planet~planetorgmax ","
striptext $planet~planet_organics ","
striptext $planet~planet_organics_max ","
striptext $planet~planet_organics_colonists ","
pause
:planet~equipstart

getword CURRENTLINE $planet~planet_equipment_colonists 2
getword CURRENTLINE $planet~planet_equipment 5
getword CURRENTLINE $planet~planet_equipment_max 7
getword CURRENTLINE $planet~planetequip 5
getword CURRENTLINE $planet~planetequipmax 7
striptext $planet~planetequip ","
striptext $planet~planetequipmax ","
striptext $planet~planet_equipment ","
striptext $planet~planet_equipment_max ","
striptext $planet~planet_equipment_colonists ","
pause
:planet~figstart

getword CURRENTLINE $planet~planet_fighters 5
getword CURRENTLINE $planet~planet_fighters_max 7
striptext $planet~planet_fighters ","
striptext $planet~planet_fighters_max ","
pause
:planet~citadelstart

getword CURRENTLINE $planet~citadel 5
getword CURRENTLINE $planet~citadel_credits 9
striptext $planet~citadel_credits ","
pause
:planet~cannonstart

getword CURRENTLINE $planet~militaryreaction 2
getword CURRENTLINE $planet~atmosphere_cannon 5
getword CURRENTLINE $planet~sector_cannon 6
striptext $planet~militaryreaction "reaction="
striptext $planet~militaryreaction "%"
striptext $planet~sector_cannon "SectLvl="
striptext $planet~sector_cannon "%"
striptext $planet~atmosphere_cannon "AtmosLvl="
striptext $planet~atmosphere_cannon "%"
striptext $planet~atmosphere_cannon ","
pause
:planet~planetinfodone
gosub :KILLPLANETTRIGGERS

setvar $planet~currentbotplanet $planet~planet
savevar $planet~currentbotplanet
savevar $planet~planet_fighters
savevar $player~current_sector
savevar $planet~planet
savevar $planet~planet_fuel
savevar $planet~planet_fuel_max
savevar $planet~planet_organics
savevar $planet~planet_organics_max
savevar $planet~planet_equipment
savevar $planet~planet_equipment_max
savevar $planet~planet_fighters
savevar $planet~planet_shields
savevar $planet~planet_transport
savevar $planet~planet_fighters_max
savevar $planet~citadel
savevar $planet~citadel_credits
savevar $planet~atmosphere_cannon
savevar $planet~sector_cannon
savevar $planet~planet_class_name
savevar $planet~planet_name
savevar $planet~under_construction
savevar $planet~maxed_level

return
:planet~killplanettriggers


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
:planet~getplanetnumber


send "*"
settextlinetrigger PLANETINFO3 :GETJUSTTHENUMBER "Planet #"
pause
:planet~getjustthenumber

send "  "
getword CURRENTLINE $planet~planet 2
striptext $planet~planet "#"
getword CURRENTLINE $player~current_sector 5
striptext $player~current_sector ":"
savevar $planet~planet
savevar $player~current_sector
setsectorparameter $planet~planet "PSECTOR" $player~current_sector

return
:planet~getplanetstats


send "cn"
waiton "(2) Animation display"
getword CURRENTLINE $planet~ansi_onoff 5
if ($planet~ansi_onoff = "On")
  send "2qq"
else
  send "qq"
end
setarray $planet~alpha 20
delete $planet~planet_file
setvar $planet~alpha[1] "A"
setvar $planet~alpha[2] "B"
setvar $planet~alpha[3] "C"
setvar $planet~alpha[4] "D"
setvar $planet~alpha[5] "E"
setvar $planet~alpha[6] "F"
setvar $planet~alpha[7] "G"
setvar $planet~alpha[8] "H"
setvar $planet~alpha[9] "I"
setvar $planet~alpha[10] "J"
setvar $planet~alpha[11] "K"
setvar $planet~alpha[12] "L"
setvar $planet~alpha[13] "M"
setvar $planet~alpha[14] "N"
setvar $planet~alpha[15] "O"
setvar $planet~alpha[16] "P"
setvar $planet~alpha[17] "R"
setvar $planet~alphaloop 0
setvar $planet~totalplanets 0
setvar $planet~firstplanetname ""

setvar $planet~nextpage 1
send "CJ@?"
waiton "Average Interval Lag"
waiton "Which planet type are you interested in (?=List)"
:planet~shp_loop


settextlinetrigger GRAB_PLANET :SHP_PLANETNAMES "> "
pause
:planet~shp_planetnames
if (CURRENTLINE = "")
  goto :SHP_LOOP
end
getword CURRENTLINE $planet~stopper 1
if ($planet~stopper = "<+>")
  send "+"
  waiton "(?=List) ?"
  setvar $planet~nextpage 1
  goto :SHP_LOOP
elseif ($planet~stopper = "<Q>")
  goto :SHP_GETPLANETSTATS
end
if ($planet~nextpage = 1)
  setvar $planet~planetname CURRENTLINE
  striptext $planet~planetname "<A> "
  if ($planet~planetname = $planet~firstplanetname)
    goto :SHP_GETPLANETSTATS
  end
  setvar $planet~nextpage 0
end
add $planet~totalplanets 1
if ($planet~totalplanets = 1)
  setvar $planet~firstplanetname CURRENTLINE
  striptext $planet~firstplanetname "<A> "
end
goto :SHP_LOOP
:planet~shp_getplanetstats
setvar $planet~planetstatloop 0
:planet~shp_planetstats
while ($planet~planetstatloop < $planet~totalplanets)
  add $planet~planetstatloop 1
  add $planet~alphaloop 1
  if ($planet~alphaloop > 17)
    send "+"
    setvar $planet~alphaloop 1
  end
  send $planet~alpha[$planet~alphaloop]
  settextlinetrigger SN :SN "Planet Category #"
  pause
  :planet~sn
  setvar $planet~line CURRENTLINE
  getwordpos $planet~line $planet~pos "Class"

  cuttext $planet~line $planet~planet_name $planet~pos 999
  write $planet~planet_file "50000 50000 50000 50000 50000 50000 0  "&$planet~planet_name
end
send "qq"
return
:planet~landingsub


gosub :KILLLANDINGTRIGGERS
send "lz" #8 $planet~planet "*"
setvar $planet~sucessfulcitadel FALSE
setvar $planet~sucessfulplanet FALSE
settextlinetrigger NOPLANET :NOPLANET "There isn't a planet in this sector."
settextlinetrigger NO_LAND :NO_LAND "since it couldn't possibly stand"
settextlinetrigger PLANET :PLANET "Planet #"
settextlinetrigger WRONGONE :WRONG_NUM "That planet is not in this sector."
settextlinetrigger NOPLANETSCANNER :DISPLAYPLANET "<Destroy Planet>"
pause
:planet~noplanet

gosub :KILLLANDINGTRIGGERS
setvar $switchboard~message "No Planet in Sector!*"
gosub :switchboard~switchboard
return
:planet~no_land

gosub :KILLLANDINGTRIGGERS
setvar $switchboard~message "This ship cannot land!*"
gosub :switchboard~switchboard
return
:planet~displayplanet

send "*"
waiton "Planet #"
:planet~planet

getword CURRENTLINE $planet~pnum_ck 2
striptext $planet~pnum_ck "#"
gosub :KILLLANDINGTRIGGERS
if ($planet~pnum_ck <> $planet~planet)
  send "q"
  goto :WRONG_NUM
end
settexttrigger WRONG_NUM :WRONG_NUM "That planet is not in this sector."
settexttrigger PLANET :PLANET_PROMPT "Planet command"
pause
:planet~wrong_num

killtrigger PLANET
send "**"
setvar $switchboard~message "Incorrect Planet Number*"
gosub :switchboard~switchboard
return
:planet~planet_prompt

killtrigger WRONG_NUM
setvar $planet~currentbotplanet $planet~planet
savevar $planet~currentbotplanet
savevar $planet~planet
setvar $planet~sucessfulplanet TRUE
if ($planet~land_and_lift = TRUE)
  send "m* * * q  "
  return
end
send "m* * * c*"
settexttrigger BUILD_CIT :BUILD_CIT "Do you wish to construct one?"
settexttrigger IN_CIT :IN_CIT "Citadel command"
settexttrigger NOCITALLOWED :BUILD_CIT "Citadels are not allowed in FedSpace."
settexttrigger CITNOTBUILTYET :BUILD_CIT "Be patient, your Citadel is not yet finished."
pause
:planet~build_cit

gosub :KILLLANDINGTRIGGERS
setvar $planet~sucessfulplanet TRUE
setvar $planet~startinglocation "Planet"
return
:planet~in_cit

gosub :KILLLANDINGTRIGGERS
setvar $planet~sucessfulcitadel TRUE
setvar $planet~startinglocation "Citadel"
return
:planet~killlandingtriggers

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
:planet~landonplanetentercitadel


send "l "&$planet~planet&"*tnl1*tnl2*tnl3*snl1*snl2*snl3*c "
waiton "Fuel Ore"
getword CURRENTLINE $planet~planetfuel 6
striptext $planet~planetfuel ","
getword CURRENTLINE $planet~planet_fuel 6
striptext $planet~planet_fuel ","
send "/"
waiton "Creds"
getword CURRENTLINE $player~credits 4
striptext $player~credits "³Figs"
striptext $player~credits ","
return
:planet~loadplanetinfo


setvar $planet~planetcounter 1
loadvar $planet~planet_file
fileexists $planet~exists $planet~planet_file
:planet~count_the_planets
if ($planet~exists)
  setvar $planet~i 1
  readtoarray $planet~planet_file $planet~planet_array
  setarray $planet~planetlist $planet~planet_array 7
  while ($planet~i <= $planet~planet_array)
    setvar $planet~planetinf $planet~planet_array[$planet~i]
    gosub :PROCESS_PLANET_LINE
    setvar $planet~planetlist[$planet~i] $planet~planetname
    setvar $planet~planetlist[$planet~i][1] $planet~planet_fuel_colonists_min
    setvar $planet~planetlist[$planet~i][2] $planet~planet_fuel_colonists_max
    setvar $planet~planetlist[$planet~i][3] $planet~planet_org_colonists_min
    setvar $planet~planetlist[$planet~i][4] $planet~planet_org_colonists_max
    setvar $planet~planetlist[$planet~i][5] $planet~planet_equip_colonists_min
    setvar $planet~planetlist[$planet~i][6] $planet~planet_equip_colonists_max
    setvar $planet~planetlist[$planet~i][7] $planet~planet_is_keeper
    add $planet~i 1
  end
  setvar $planet~planetcounter $planet~planet_array
  setvar $planet~planetstats TRUE
else
  echo "*No Planet File Found!*"
end
return
:planet~process_planet_line

getword $planet~planetinf $planet~planet_fuel_colonists_min 1
getlength $planet~planet_fuel_colonists_min $planet~length1
getword $planet~planetinf $planet~planet_fuel_colonists_max 2
getlength $planet~planet_fuel_colonists_max $planet~length2
getword $planet~planetinf $planet~planet_org_colonists_min 3
getlength $planet~planet_org_colonists_min $planet~length3
getword $planet~planetinf $planet~planet_org_colonists_max 4
getlength $planet~planet_org_colonists_max $planet~length4
getword $planet~planetinf $planet~planet_equip_colonists_min 5
getlength $planet~planet_equip_colonists_min $planet~length5
getword $planet~planetinf $planet~planet_equip_colonists_max 6
getlength $planet~planet_equip_colonists_max $planet~length6
getword $planet~planetinf $planet~planet_is_keeper 7
getlength $planet~planet_is_keeper $planet~length7
setvar $planet~startlen ($planet~length1 + ($planet~length2 + ($planet~length3 + ($planet~length4 + ($planet~length5 + ($planet~length6 + ($planet~length7 + 7)))))))
getlength $planet~planetinf $planet~length_planet_name
if ($planet~startlen < $planet~length_planet_name)
  cuttext $planet~planetinf $planet~planetname $planet~startlen 999
else
  echo "*"&$planet~planetinf&" error during processing planets.*"
end
return
:planet~make_planet_array


setarray $planet~planet_names 1000
setvar $planet~planet_names[1] "LoneStar's Circle"
setvar $planet~planet_names[2] "Manton Outpost"
setvar $planet~planet_names[3] "Triax Annex"
setvar $planet~planet_names[4] "New Ovid"
setvar $planet~planet_names[5] "Napier Minor"
setvar $planet~planet_names[6] "New Barite"
setvar $planet~planet_names[7] "Agamotto II"
setvar $planet~planet_names[8] "Poincare Thunder"
setvar $planet~planet_names[9] "Camelopardus"
setvar $planet~planet_names[10] "Ticonderoga Annex"
setvar $planet~planet_names[11] "Cana Annex"
setvar $planet~planet_names[12] "Rifts II"
setvar $planet~planet_names[13] "Arago Annex"
setvar $planet~planet_names[14] "Grosseteste Primus"
setvar $planet~planet_names[15] "Lablon Minor"
setvar $planet~planet_names[16] "Ampilean Minor"
setvar $planet~planet_names[17] "Pappus II"
setvar $planet~planet_names[18] "Buddha Gaya II"
setvar $planet~planet_names[19] "Phlogiston Major"
setvar $planet~planet_names[20] "Pilar Dawn"
setvar $planet~planet_names[21] "Vergil"
setvar $planet~planet_names[22] "Zennor Primus"
setvar $planet~planet_names[23] "Vigara Outpost"
setvar $planet~planet_names[24] "l'Hopital"
setvar $planet~planet_names[25] "Axe-Gonne Annex"
setvar $planet~planet_names[26] "New Plaskett"
setvar $planet~planet_names[27] "Quadrono Fury"
setvar $planet~planet_names[28] "Cuirass Annex"
setvar $planet~planet_names[29] "Bendor II"
setvar $planet~planet_names[30] "Catuz II"
setvar $planet~planet_names[31] "New Barazole"
setvar $planet~planet_names[32] "Burgundy Outpost"
setvar $planet~planet_names[33] "Tibanna Annex"
setvar $planet~planet_names[34] "New Vesta"
setvar $planet~planet_names[35] "Aerobe Minor"
setvar $planet~planet_names[36] "Cornu Primus"
setvar $planet~planet_names[37] "Heguz Outpost"
setvar $planet~planet_names[38] "Khrytarrm II"
setvar $planet~planet_names[39] "Zodiac"
setvar $planet~planet_names[40] "Bevey Primus"
setvar $planet~planet_names[41] "Pauli Stars"
setvar $planet~planet_names[42] "Axanar Outpost"
setvar $planet~planet_names[43] "Veialstroum"
setvar $planet~planet_names[44] "Dedendum"
setvar $planet~planet_names[45] "Parthenon Outpost"
setvar $planet~planet_names[46] "Ahzdar Primus"
setvar $planet~planet_names[47] "Tionale Minor"
setvar $planet~planet_names[48] "Fomalhaut Minor"
setvar $planet~planet_names[49] "Calandra Index"
setvar $planet~planet_names[50] "New Drude"
setvar $planet~planet_names[51] "Troi Primus"
setvar $planet~planet_names[52] "Tourmaline Primus"
setvar $planet~planet_names[53] "Adurol"
setvar $planet~planet_names[54] "Zaibon Outpost"
setvar $planet~planet_names[55] "Cipango Annex"
setvar $planet~planet_names[56] "Saxbury Annex"
setvar $planet~planet_names[57] "New Oomaru"
setvar $planet~planet_names[58] "Weiland Minor"
setvar $planet~planet_names[59] "Bertian II"
setvar $planet~planet_names[60] "Strahd Outpost"
setvar $planet~planet_names[61] "Hallwachs Primus"
setvar $planet~planet_names[62] "Fabrina Primus"
setvar $planet~planet_names[63] "Ovid"
setvar $planet~planet_names[64] "Campell II"
setvar $planet~planet_names[65] "Osnabruck Major"
setvar $planet~planet_names[66] "Merrimac Minor"
setvar $planet~planet_names[67] "Toscanelli Major"
setvar $planet~planet_names[68] "Hoover Minor"
setvar $planet~planet_names[69] "Pangelinan Outpost"
setvar $planet~planet_names[70] "Bethune Minor"
setvar $planet~planet_names[71] "Fafnir"
setvar $planet~planet_names[72] "Gideon Outpost"
setvar $planet~planet_names[73] "Tajarhi Primus"
setvar $planet~planet_names[74] "Catoblepas Major"
setvar $planet~planet_names[75] "Steel Major"
setvar $planet~planet_names[76] "Grey Mist"
setvar $planet~planet_names[77] "Boreas Minor"
setvar $planet~planet_names[78] "New Entrailia"
setvar $planet~planet_names[79] "Saturn Primus"
setvar $planet~planet_names[80] "Aerolone Major"
setvar $planet~planet_names[81] "Camelot Primus"
setvar $planet~planet_names[82] "Copus Outpost"
setvar $planet~planet_names[83] "Bedoz Whispers"
setvar $planet~planet_names[84] "Czar'ak II"
setvar $planet~planet_names[85] "Mastro"
setvar $planet~planet_names[86] "Venus Outpost"
setvar $planet~planet_names[87] "New Io"
setvar $planet~planet_names[88] "Tsox II"
setvar $planet~planet_names[89] "Acropolis II"
setvar $planet~planet_names[90] "CSM-101 Annex"
setvar $planet~planet_names[91] "Apian II"
setvar $planet~planet_names[92] "New Brodie"
setvar $planet~planet_names[93] "Clone Annex"
setvar $planet~planet_names[94] "K'hotan Major"
setvar $planet~planet_names[95] "Indusium Primus"
setvar $planet~planet_names[96] "Javelle Minor"
setvar $planet~planet_names[97] "Gold Major"
setvar $planet~planet_names[98] "New Poincare"
setvar $planet~planet_names[99] "New Ohm"
setvar $planet~planet_names[100] "Jeeves"
setvar $planet~planet_names[101] "Ahriman Primus"
setvar $planet~planet_names[102] "Bajor II"
setvar $planet~planet_names[103] "Pickering Primus"
setvar $planet~planet_names[104] "Pagoda Outpost"
setvar $planet~planet_names[105] "Midgard"
setvar $planet~planet_names[106] "New Lutum"
setvar $planet~planet_names[107] "Curie Primus"
setvar $planet~planet_names[108] "New Kerogen"
setvar $planet~planet_names[109] "Brevico Outpost"
setvar $planet~planet_names[110] "Cleisthenes Annex"
setvar $planet~planet_names[111] "Banalg Primus"
setvar $planet~planet_names[112] "Hiruko Primus"
setvar $planet~planet_names[113] "New Canis Staz"
setvar $planet~planet_names[114] "Herschel Prime"
setvar $planet~planet_names[115] "Feesu Annex"
setvar $planet~planet_names[116] "Sluagh Minor"
setvar $planet~planet_names[117] "Acacia Primus"
setvar $planet~planet_names[118] "Zagreus Minor"
setvar $planet~planet_names[119] "Aud Outpost"
setvar $planet~planet_names[120] "Leo Annex"
setvar $planet~planet_names[121] "Inx Primus"
setvar $planet~planet_names[122] "Plugh Major"
setvar $planet~planet_names[123] "Keltcher II"
setvar $planet~planet_names[124] "El Nath Major"
setvar $planet~planet_names[125] "Thalim Outpost"
setvar $planet~planet_names[126] "Achilles Annex"
setvar $planet~planet_names[127] "New Janvier"
setvar $planet~planet_names[128] "New Mare"
setvar $planet~planet_names[129] "Osnabruck Minor"
setvar $planet~planet_names[130] "New Atropine"
setvar $planet~planet_names[131] "Hyksos Outpost"
setvar $planet~planet_names[132] "Ionicus Annex"
setvar $planet~planet_names[133] "Atwood Annex"
setvar $planet~planet_names[134] "Ektron II"
setvar $planet~planet_names[135] "New Debarre"
setvar $planet~planet_names[136] "New Hubble"
setvar $planet~planet_names[137] "Acridine Annex"
setvar $planet~planet_names[138] "Atchison Annex"
setvar $planet~planet_names[139] "Aeschylus Annex"
setvar $planet~planet_names[140] "Triceratops II"
setvar $planet~planet_names[141] "Ovid 962 Outpost"
setvar $planet~planet_names[142] "Laon Annex"
setvar $planet~planet_names[143] "Feesu II"
setvar $planet~planet_names[144] "Pysadi Outpost"
setvar $planet~planet_names[145] "Bansin II"
setvar $planet~planet_names[146] "Grimaldi Outpost"
setvar $planet~planet_names[147] "Kashyyyk Annex"
setvar $planet~planet_names[148] "New Pickering"
setvar $planet~planet_names[149] "Sardaukar"
setvar $planet~planet_names[150] "Poritrin Annex"
setvar $planet~planet_names[151] "Biela Minor"
setvar $planet~planet_names[152] "Autun Minor"
setvar $planet~planet_names[153] "Akira Primus"
setvar $planet~planet_names[154] "Bohemia III"
setvar $planet~planet_names[155] "Caspan Primus"
setvar $planet~planet_names[156] "Barite Minor"
setvar $planet~planet_names[157] "Loki Outpost"
setvar $planet~planet_names[158] "Argos Primus"
setvar $planet~planet_names[159] "Drake Annex"
setvar $planet~planet_names[160] "Jaspilate Outpost"
setvar $planet~planet_names[161] "New Tacaxeb"
setvar $planet~planet_names[162] "Brevico Primus"
setvar $planet~planet_names[163] "Bolivar Minor"
setvar $planet~planet_names[164] "Trennen Major"
setvar $planet~planet_names[165] "Bainite Annex"
setvar $planet~planet_names[166] "Amber Primus"
setvar $planet~planet_names[167] "Remorhaz"
setvar $planet~planet_names[168] "Politzer"
setvar $planet~planet_names[169] "Thisbe"
setvar $planet~planet_names[170] "Ekinus"
setvar $planet~planet_names[171] "Agamotto Annex"
setvar $planet~planet_names[172] "Ixzotz"
setvar $planet~planet_names[173] "Coliar"
setvar $planet~planet_names[174] "Dragon Major"
setvar $planet~planet_names[175] "Minimi Outpost"
setvar $planet~planet_names[176] "Comani II"
setvar $planet~planet_names[177] "Saladin Major"
setvar $planet~planet_names[178] "New CSM-101"
setvar $planet~planet_names[179] "Winston"
setvar $planet~planet_names[180] "Putman Outpost"
setvar $planet~planet_names[181] "Zarathrustra"
setvar $planet~planet_names[182] "Bacchus Outpost"
setvar $planet~planet_names[183] "Demantoid Annex"
setvar $planet~planet_names[184] "Aarite Outpost"
setvar $planet~planet_names[185] "Langres Primus"
setvar $planet~planet_names[186] "New Myk"
setvar $planet~planet_names[187] "Castalia Minor"
setvar $planet~planet_names[188] "Feyd Major"
setvar $planet~planet_names[189] "Gauss"
setvar $planet~planet_names[190] "Adurol Primus"
setvar $planet~planet_names[191] "Pingos Annex"
setvar $planet~planet_names[192] "Shih Hwang-ti Major"
setvar $planet~planet_names[193] "Homonculous Annex"
setvar $planet~planet_names[194] "Calandra Annex"
setvar $planet~planet_names[195] "Tartarus Minor"
setvar $planet~planet_names[196] "Njord Major"
setvar $planet~planet_names[197] "Melusine II"
setvar $planet~planet_names[198] "Cepheus"
setvar $planet~planet_names[199] "Huggins Primus"
setvar $planet~planet_names[200] "Buchanan"
setvar $planet~planet_names[201] "Bleigh Outpost"
setvar $planet~planet_names[202] "Abohm Annex"
setvar $planet~planet_names[203] "Freaque Primus"
setvar $planet~planet_names[204] "Bespin Outpost"
setvar $planet~planet_names[205] "Shklovsky"
setvar $planet~planet_names[206] "Heimdall Minor"
setvar $planet~planet_names[207] "New Bentylol"
setvar $planet~planet_names[208] "Lebeau"
setvar $planet~planet_names[209] "New Siva"
setvar $planet~planet_names[210] "Biggs Outpost"
setvar $planet~planet_names[211] "Auroran Major"
setvar $planet~planet_names[212] "Phoenix"
setvar $planet~planet_names[213] "Chaeta Major"
setvar $planet~planet_names[214] "Anacel Minor"
setvar $planet~planet_names[215] "Zeycude Minor"
setvar $planet~planet_names[216] "Akarso Major"
setvar $planet~planet_names[217] "Bifrost Primus"
setvar $planet~planet_names[218] "Jolotre Outpost"
setvar $planet~planet_names[219] "New Tutankhamen"
setvar $planet~planet_names[220] "Adams Outpost"
setvar $planet~planet_names[221] "Feynman Minor"
setvar $planet~planet_names[222] "Grant Primus"
setvar $planet~planet_names[223] "Aeon Primus"
setvar $planet~planet_names[224] "Sacajawea Minor"
setvar $planet~planet_names[225] "Thor Outpost"
setvar $planet~planet_names[226] "New Kashyyyk"
setvar $planet~planet_names[227] "Underwood Minor"
setvar $planet~planet_names[228] "Yukawa Major"
setvar $planet~planet_names[229] "Feesu Minor"
setvar $planet~planet_names[230] "Accurbron Major"
setvar $planet~planet_names[231] "Parthenon Major"
setvar $planet~planet_names[232] "Calan Outpost"
setvar $planet~planet_names[233] "Tali Annex"
setvar $planet~planet_names[234] "Cogri Outpost"
setvar $planet~planet_names[235] "Atwood Minor"
setvar $planet~planet_names[236] "Aldebaran"
setvar $planet~planet_names[237] "New Atreides"
setvar $planet~planet_names[238] "Abae Annex"
setvar $planet~planet_names[239] "Aurva Primus"
setvar $planet~planet_names[240] "Pogson Primus"
setvar $planet~planet_names[241] "Degtyarev Major"
setvar $planet~planet_names[242] "Wollaston"
setvar $planet~planet_names[243] "Eagle Annex"
setvar $planet~planet_names[244] "Atacon Annex"
setvar $planet~planet_names[245] "Lanth Major"
setvar $planet~planet_names[246] "Reber Primus"
setvar $planet~planet_names[247] "Aleph Minor"
setvar $planet~planet_names[248] "Dollond"
setvar $planet~planet_names[249] "H'Catha Minor"
setvar $planet~planet_names[250] "New Bacta"
setvar $planet~planet_names[251] "Galina Annex"
setvar $planet~planet_names[252] "New Nadrin"
setvar $planet~planet_names[253] "Ajacs Primus"
setvar $planet~planet_names[254] "Holland Annex"
setvar $planet~planet_names[255] "New Baraka"
setvar $planet~planet_names[256] "Alencika Minor"
setvar $planet~planet_names[257] "Wypoc"
setvar $planet~planet_names[258] "Mytus Major"
setvar $planet~planet_names[259] "Garuda Outpost"
setvar $planet~planet_names[260] "Nog Outpost"
setvar $planet~planet_names[261] "Arcturus Annex"
setvar $planet~planet_names[262] "El Cid II"
setvar $planet~planet_names[263] "Autun"
setvar $planet~planet_names[264] "Omega Major"
setvar $planet~planet_names[265] "Antike Outpost"
setvar $planet~planet_names[266] "Triceratops Primus"
setvar $planet~planet_names[267] "Caladan II"
setvar $planet~planet_names[268] "Gnosis II"
setvar $planet~planet_names[269] "Freedom"
setvar $planet~planet_names[270] "Solomon Primus"
setvar $planet~planet_names[271] "Flamarion Major"
setvar $planet~planet_names[272] "Massassi Minor"
setvar $planet~planet_names[273] "Baclofin Major"
setvar $planet~planet_names[274] "New Berubigen"
setvar $planet~planet_names[275] "Hydra"
setvar $planet~planet_names[276] "Ylaven Annex"
setvar $planet~planet_names[277] "Shcawbe"
setvar $planet~planet_names[278] "Dallia Primus"
setvar $planet~planet_names[279] "New FerNics"
setvar $planet~planet_names[280] "Cyzicus Outpost"
setvar $planet~planet_names[281] "Belenus"
setvar $planet~planet_names[282] "Kudu Minor"
setvar $planet~planet_names[283] "Shadout"
setvar $planet~planet_names[284] "Tetanus Major"
setvar $planet~planet_names[285] "Mecha Major"
setvar $planet~planet_names[286] "Blunderbuss Outpost"
setvar $planet~planet_names[287] "Castile"
setvar $planet~planet_names[288] "Dollond Annex"
setvar $planet~planet_names[289] "Condyole II"
setvar $planet~planet_names[290] "Benemid Outpost"
setvar $planet~planet_names[291] "New Kether"
setvar $planet~planet_names[292] "Scarabaeus"
setvar $planet~planet_names[293] "Spector Major"
setvar $planet~planet_names[294] "Nambu Annex"
setvar $planet~planet_names[295] "Yamoto II"
setvar $planet~planet_names[296] "Lockyer Major"
setvar $planet~planet_names[297] "New Huggins"
setvar $planet~planet_names[298] "Gorram"
setvar $planet~planet_names[299] "Minimi Minor"
setvar $planet~planet_names[300] "Sorel Major"
setvar $planet~planet_names[301] "El Nath Primus"
setvar $planet~planet_names[302] "Lumineaux Outpost"
setvar $planet~planet_names[303] "Richter Primus"
setvar $planet~planet_names[304] "Ilianeou"
setvar $planet~planet_names[305] "Xyvitix Annex"
setvar $planet~planet_names[306] "Benisone Minor"
setvar $planet~planet_names[307] "Fanning"
setvar $planet~planet_names[308] "Flamsteed"
setvar $planet~planet_names[309] "Shklovsky Primus"
setvar $planet~planet_names[310] "Toshi Annex"
setvar $planet~planet_names[311] "New Bumex"
setvar $planet~planet_names[312] "Noirmoutier"
setvar $planet~planet_names[313] "Macross"
setvar $planet~planet_names[314] "Du Fay Major"
setvar $planet~planet_names[315] "Ross Outpost"
setvar $planet~planet_names[316] "Xi Primus"
setvar $planet~planet_names[317] "Leyline II"
setvar $planet~planet_names[318] "Vergil Minor"
setvar $planet~planet_names[319] "Diocletian Outpost"
setvar $planet~planet_names[320] "Eisenhower Minor"
setvar $planet~planet_names[321] "Cithaeron Annex"
setvar $planet~planet_names[322] "Pockels Major"
setvar $planet~planet_names[323] "Rangent Major"
setvar $planet~planet_names[324] "Pascal Annex"
setvar $planet~planet_names[325] "Avitene Primus"
setvar $planet~planet_names[326] "Fantasia Primus"
setvar $planet~planet_names[327] "Baridium II"
setvar $planet~planet_names[328] "Von Zacjh II"
setvar $planet~planet_names[329] "Jasmine Annex"
setvar $planet~planet_names[330] "Bagasse II"
setvar $planet~planet_names[331] "Wern"
setvar $planet~planet_names[332] "Tenelphi Primus"
setvar $planet~planet_names[333] "Elmarin Major"
setvar $planet~planet_names[334] "New Rech"
setvar $planet~planet_names[335] "Massassi Major"
setvar $planet~planet_names[336] "Tintao"
setvar $planet~planet_names[337] "Engadine II"
setvar $planet~planet_names[338] "New Ektron"
setvar $planet~planet_names[339] "Ochecate"
setvar $planet~planet_names[340] "Peleus Minor"
setvar $planet~planet_names[341] "Balboa Minor"
setvar $planet~planet_names[342] "New Phobos"
setvar $planet~planet_names[343] "Elmarin II"
setvar $planet~planet_names[344] "Garion Primus"
setvar $planet~planet_names[345] "Sharrip Major"
setvar $planet~planet_names[346] "Breughel"
setvar $planet~planet_names[347] "Eisenhower II"
setvar $planet~planet_names[348] "Cusa II"
setvar $planet~planet_names[349] "Bralgu Annex"
setvar $planet~planet_names[350] "Copernicus II"
setvar $planet~planet_names[351] "Putman Annex"
setvar $planet~planet_names[352] "Pylus Minor"
setvar $planet~planet_names[353] "Alkaid"
setvar $planet~planet_names[354] "Proudelxak Primus"
setvar $planet~planet_names[355] "Putman II"
setvar $planet~planet_names[356] "Ganymede Major"
setvar $planet~planet_names[357] "Hotchkiss II"
setvar $planet~planet_names[358] "Eikonal Primus"
setvar $planet~planet_names[359] "New Nelson"
setvar $planet~planet_names[360] "Behemoth Annex"
setvar $planet~planet_names[361] "Daleth"
setvar $planet~planet_names[362] "Circe Primus"
setvar $planet~planet_names[363] "Ueilerm Annex"
setvar $planet~planet_names[364] "Winston Primus"
setvar $planet~planet_names[365] "Roentgen II"
setvar $planet~planet_names[366] "New Bentyl"
setvar $planet~planet_names[367] "Bainite Primus"
setvar $planet~planet_names[368] "Uranus Minor"
setvar $planet~planet_names[369] "Triumviri Outpost"
setvar $planet~planet_names[370] "Dearth Minor"
setvar $planet~planet_names[371] "Quare Minor"
setvar $planet~planet_names[372] "Ariel II"
setvar $planet~planet_names[373] "Agamotto"
setvar $planet~planet_names[374] "Mithras II"
setvar $planet~planet_names[375] "Agena II"
setvar $planet~planet_names[376] "Anchorhead Minor"
setvar $planet~planet_names[377] "Atarax Major"
setvar $planet~planet_names[378] "T'xe"
setvar $planet~planet_names[379] "Fedaykin Major"
setvar $planet~planet_names[380] "Kai Outpost"
setvar $planet~planet_names[381] "Pompey Major"
setvar $planet~planet_names[382] "Jarsone Major"
setvar $planet~planet_names[383] "Percy 1640 Major"
setvar $planet~planet_names[384] "Kraken Outpost"
setvar $planet~planet_names[385] "Tiree"
setvar $planet~planet_names[386] "New Corbiet"
setvar $planet~planet_names[387] "Celepina Minor"
setvar $planet~planet_names[388] "Augustus Annex"
setvar $planet~planet_names[389] "New H'Catha"
setvar $planet~planet_names[390] "New Aldrin"
setvar $planet~planet_names[391] "Bacarate II"
setvar $planet~planet_names[392] "Drude II"
setvar $planet~planet_names[393] "Millennium"
setvar $planet~planet_names[394] "Kwisatz"
setvar $planet~planet_names[395] "Rebka"
setvar $planet~planet_names[396] "Rebka II"
setvar $planet~planet_names[397] "Flamsteed Outpost"
setvar $planet~planet_names[398] "Garibaldi Minor"
setvar $planet~planet_names[399] "Hounstyr Annex"
setvar $planet~planet_names[400] "Flinte"
setvar $planet~planet_names[401] "Dodonna Major"
setvar $planet~planet_names[402] "Ueilerm Minor"
setvar $planet~planet_names[403] "Kaula"
setvar $planet~planet_names[404] "Orkney Outpost"
setvar $planet~planet_names[405] "Appollyon Primus"
setvar $planet~planet_names[406] "New Natoko"
setvar $planet~planet_names[407] "Heroni Major"
setvar $planet~planet_names[408] "Haderach Primus"
setvar $planet~planet_names[409] "Dinom Major"
setvar $planet~planet_names[410] "Darion Minor"
setvar $planet~planet_names[411] "Medusa II"
setvar $planet~planet_names[412] "Kaladan Outpost"
setvar $planet~planet_names[413] "Kep Salu Annex"
setvar $planet~planet_names[414] "New Minos"
setvar $planet~planet_names[415] "Jeeves Major"
setvar $planet~planet_names[416] "Exodus"
setvar $planet~planet_names[417] "Euler Annex"
setvar $planet~planet_names[418] "Capricornus II"
setvar $planet~planet_names[419] "Milan Primus"
setvar $planet~planet_names[420] "Beben Outpost"
setvar $planet~planet_names[421] "New Kohlrausch"
setvar $planet~planet_names[422] "Brombay"
setvar $planet~planet_names[423] "Alvarado Minor"
setvar $planet~planet_names[424] "New Franchi"
setvar $planet~planet_names[425] "Melior"
setvar $planet~planet_names[426] "Atrivis"
setvar $planet~planet_names[427] "Lepton II"
setvar $planet~planet_names[428] "Dyson Outpost"
setvar $planet~planet_names[429] "Feyd Outpost"
setvar $planet~planet_names[430] "Wypoc II"
setvar $planet~planet_names[431] "Peridot Primus"
setvar $planet~planet_names[432] "Yona II"
setvar $planet~planet_names[433] "Caduceus Major"
setvar $planet~planet_names[434] "Kruhious II"
setvar $planet~planet_names[435] "Melior Outpost"
setvar $planet~planet_names[436] "Ryloth Major"
setvar $planet~planet_names[437] "Becquerel Annex"
setvar $planet~planet_names[438] "Intrepid"
setvar $planet~planet_names[439] "Gascogne Annex"
setvar $planet~planet_names[440] "Free State II"
setvar $planet~planet_names[441] "Ozawa Minor"
setvar $planet~planet_names[442] "Mewey Primus"
setvar $planet~planet_names[443] "Xylene Outpost"
setvar $planet~planet_names[444] "Pohl Annex"
setvar $planet~planet_names[445] "Absarokite"
setvar $planet~planet_names[446] "Phardos Annex"
setvar $planet~planet_names[447] "Axolotl Minor"
setvar $planet~planet_names[448] "van der Waals Primus"
setvar $planet~planet_names[449] "Hydropon"
setvar $planet~planet_names[450] "Tesla Minor"
setvar $planet~planet_names[451] "Kender Annex"
setvar $planet~planet_names[452] "Aphrodite Primus"
setvar $planet~planet_names[453] "New Addax"
setvar $planet~planet_names[454] "New Castile"
setvar $planet~planet_names[455] "Atlas Major"
setvar $planet~planet_names[456] "Van de Graaff II"
setvar $planet~planet_names[457] "Chrysa II"
setvar $planet~planet_names[458] "Dirac Outpost"
setvar $planet~planet_names[459] "Aachen Annex"
setvar $planet~planet_names[460] "Skinfaxi II"
setvar $planet~planet_names[461] "Carthage Primus"
setvar $planet~planet_names[462] "Elmarin Outpost"
setvar $planet~planet_names[463] "Mikado Primus"
setvar $planet~planet_names[464] "Rydberg Minor"
setvar $planet~planet_names[465] "Hallwachs Major"
setvar $planet~planet_names[466] "Banderlog Major"
setvar $planet~planet_names[467] "New Grosseteste"
setvar $planet~planet_names[468] "Caliver II"
setvar $planet~planet_names[469] "Jokwa Primus"
setvar $planet~planet_names[470] "New Auxerre"
setvar $planet~planet_names[471] "Demilich"
setvar $planet~planet_names[472] "New Karelia"
setvar $planet~planet_names[473] "Rueschhoff"
setvar $planet~planet_names[474] "Taro Minor"
setvar $planet~planet_names[475] "Dianoga Annex"
setvar $planet~planet_names[476] "Quevedo Major"
setvar $planet~planet_names[477] "New Leviathan"
setvar $planet~planet_names[478] "Raydrad Primus"
setvar $planet~planet_names[479] "New Daleth"
setvar $planet~planet_names[480] "Metztla'Xym"
setvar $planet~planet_names[481] "Aix-la-Chapelle Annex"
setvar $planet~planet_names[482] "Spume Outpost"
setvar $planet~planet_names[483] "Lysander II"
setvar $planet~planet_names[484] "Simorg Minor"
setvar $planet~planet_names[485] "Van Maanen Outpost"
setvar $planet~planet_names[486] "Alexander II"
setvar $planet~planet_names[487] "Istar Annex"
setvar $planet~planet_names[488] "Crecy Major"
setvar $planet~planet_names[489] "Bethune Outpost"
setvar $planet~planet_names[490] "Cittert Major"
setvar $planet~planet_names[491] "Edinina II"
setvar $planet~planet_names[492] "Imbrium"
setvar $planet~planet_names[493] "New Tycho"
setvar $planet~planet_names[494] "Nordenfelt Annex"
setvar $planet~planet_names[495] "Dixon Primus"
setvar $planet~planet_names[496] "Biggs Major"
setvar $planet~planet_names[497] "Far Station II"
setvar $planet~planet_names[498] "Puparkin II"
setvar $planet~planet_names[499] "New Duras"
setvar $planet~planet_names[500] "Freedom II"
setvar $planet~planet_names[501] "Ardonyx Major"
setvar $planet~planet_names[502] "Focaline Major"
setvar $planet~planet_names[503] "Jacent II"
setvar $planet~planet_names[504] "Jimson Primus"
setvar $planet~planet_names[505] "Andromeda Primus"
setvar $planet~planet_names[506] "Adenine Outpost"
setvar $planet~planet_names[507] "Ampere Major"
setvar $planet~planet_names[508] "Cordoba Major"
setvar $planet~planet_names[509] "Garion Major"
setvar $planet~planet_names[510] "Gormenghast Primus"
setvar $planet~planet_names[511] "Roxana II"
setvar $planet~planet_names[512] "New Duriron"
setvar $planet~planet_names[513] "Islip Annex"
setvar $planet~planet_names[514] "New Powaza"
setvar $planet~planet_names[515] "Thisbe II"
setvar $planet~planet_names[516] "Ney Annex"
setvar $planet~planet_names[517] "Phlogiston Annex"
setvar $planet~planet_names[518] "Ganymede II"
setvar $planet~planet_names[519] "Joshi Major"
setvar $planet~planet_names[520] "Hajj Annex"
setvar $planet~planet_names[521] "Aceta Major"
setvar $planet~planet_names[522] "Idris II"
setvar $planet~planet_names[523] "New Gelugon"
setvar $planet~planet_names[524] "Shai-Hulud II"
setvar $planet~planet_names[525] "Towers Major"
setvar $planet~planet_names[526] "Tulan Primus"
setvar $planet~planet_names[527] "Massassi Primus"
setvar $planet~planet_names[528] "Taaug Annex"
setvar $planet~planet_names[529] "Baruch Outpost"
setvar $planet~planet_names[530] "Castalia"
setvar $planet~planet_names[531] "Penkwhar Outpost"
setvar $planet~planet_names[532] "Baugi Outpost"
setvar $planet~planet_names[533] "Draconis Outpost"
setvar $planet~planet_names[534] "Crimson II"
setvar $planet~planet_names[535] "Smoug Major"
setvar $planet~planet_names[536] "Asmussen Primus"
setvar $planet~planet_names[537] "Oort"
setvar $planet~planet_names[538] "Rousseau Major"
setvar $planet~planet_names[539] "Lahara Outpost"
setvar $planet~planet_names[540] "Belemmite Primus"
setvar $planet~planet_names[541] "Mainz Outpost"
setvar $planet~planet_names[542] "Corbino Outpost"
setvar $planet~planet_names[543] "Tanar'ri Major"
setvar $planet~planet_names[544] "Conway"
setvar $planet~planet_names[545] "Raweh II"
setvar $planet~planet_names[546] "New Hefry"
setvar $planet~planet_names[547] "Pinus Nigra Annex"
setvar $planet~planet_names[548] "Celepina Primus"
setvar $planet~planet_names[549] "Zaire Outpost"
setvar $planet~planet_names[550] "Medusa Annex"
setvar $planet~planet_names[551] "Tyrfing Outpost"
setvar $planet~planet_names[552] "Gormenghast Minor"
setvar $planet~planet_names[553] "Iliopoulos Annex"
setvar $planet~planet_names[554] "New Sacha"
setvar $planet~planet_names[555] "Tulan Outpost"
setvar $planet~planet_names[556] "Chaucer Primus"
setvar $planet~planet_names[557] "Carbonara Major"
setvar $planet~planet_names[558] "Zivije Minor"
setvar $planet~planet_names[559] "New Grant"
setvar $planet~planet_names[560] "Hadron Annex"
setvar $planet~planet_names[561] "New Chattur"
setvar $planet~planet_names[562] "Simeon Outpost"
setvar $planet~planet_names[563] "Moriarity Major"
setvar $planet~planet_names[564] "Heisenberg Outpost"
setvar $planet~planet_names[565] "Vingolf Major"
setvar $planet~planet_names[566] "Mammon Outpost"
setvar $planet~planet_names[567] "Ceres Outpost"
setvar $planet~planet_names[568] "Mantene"
setvar $planet~planet_names[569] "Capon Annex"
setvar $planet~planet_names[570] "Pockels Outpost"
setvar $planet~planet_names[571] "New Valiant"
setvar $planet~planet_names[572] "Buchanan II"
setvar $planet~planet_names[573] "Bevey Minor"
setvar $planet~planet_names[574] "New DarGer"
setvar $planet~planet_names[575] "Tatooine Primus"
setvar $planet~planet_names[576] "Rabwhar Primus"
setvar $planet~planet_names[577] "Trin Minor"
setvar $planet~planet_names[578] "Tyr Annex"
setvar $planet~planet_names[579] "Klystron"
setvar $planet~planet_names[580] "Zamine"
setvar $planet~planet_names[581] "Canis Staz II"
setvar $planet~planet_names[582] "Gungnir Minor"
setvar $planet~planet_names[583] "Alupent Major"
setvar $planet~planet_names[584] "Gideon Minor"
setvar $planet~planet_names[585] "Raweh Annex"
setvar $planet~planet_names[586] "Kamerlingh Annex"
setvar $planet~planet_names[587] "Camazotz Minor"
setvar $planet~planet_names[588] "Aeolus II"
setvar $planet~planet_names[589] "Grant Annex"
setvar $planet~planet_names[590] "Betelgeuse"
setvar $planet~planet_names[591] "New Dammar"
setvar $planet~planet_names[592] "Ursula"
setvar $planet~planet_names[593] "Fermi Minor"
setvar $planet~planet_names[594] "New Mewey"
setvar $planet~planet_names[595] "Elixabeth Outpost"
setvar $planet~planet_names[596] "Glashow II"
setvar $planet~planet_names[597] "Inchin"
setvar $planet~planet_names[598] "Antike"
setvar $planet~planet_names[599] "Iliopoulos Primus"
setvar $planet~planet_names[600] "Sigma Annex"
setvar $planet~planet_names[601] "Tetanus II"
setvar $planet~planet_names[602] "New Laika"
setvar $planet~planet_names[603] "Lorentz"
setvar $planet~planet_names[604] "Hefry"
setvar $planet~planet_names[605] "Smoug Annex"
setvar $planet~planet_names[606] "New Rutledge"
setvar $planet~planet_names[607] "Knossos"
setvar $planet~planet_names[608] "Cyclone II"
setvar $planet~planet_names[609] "New Milan"
setvar $planet~planet_names[610] "Mammon Major"
setvar $planet~planet_names[611] "Indium II"
setvar $planet~planet_names[612] "Tleilaxu Annex"
setvar $planet~planet_names[613] "Krosec II"
setvar $planet~planet_names[614] "New Surplus"
setvar $planet~planet_names[615] "Aerolone Primus"
setvar $planet~planet_names[616] "Nerewhon Outpost"
setvar $planet~planet_names[617] "Trexalon Primus"
setvar $planet~planet_names[618] "Spider Primus"
setvar $planet~planet_names[619] "Ontalak"
setvar $planet~planet_names[620] "Benemid Minor"
setvar $planet~planet_names[621] "Belenus Primus"
setvar $planet~planet_names[622] "Bismarck"
setvar $planet~planet_names[623] "New Carson"
setvar $planet~planet_names[624] "Rayl Major"
setvar $planet~planet_names[625] "New Fedaykin"
setvar $planet~planet_names[626] "Ent II"
setvar $planet~planet_names[627] "Cetacean II"
setvar $planet~planet_names[628] "Artemis"
setvar $planet~planet_names[629] "Shakespeare Major"
setvar $planet~planet_names[630] "Pepin Minor"
setvar $planet~planet_names[631] "Priedo Annex"
setvar $planet~planet_names[632] "Ryloth Annex"
setvar $planet~planet_names[633] "Pangelinan Annex"
setvar $planet~planet_names[634] "Arels II"
setvar $planet~planet_names[635] "Epsilon Major"
setvar $planet~planet_names[636] "Bayer Primus"
setvar $planet~planet_names[637] "Kruger Outpost"
setvar $planet~planet_names[638] "Chandrasekher Outpost"
setvar $planet~planet_names[639] "Imbrium Major"
setvar $planet~planet_names[640] "New Jolotre"
setvar $planet~planet_names[641] "Dearth II"
setvar $planet~planet_names[642] "New Hallwachs"
setvar $planet~planet_names[643] "Hounstyr II"
setvar $planet~planet_names[644] "Niepce Primus"
setvar $planet~planet_names[645] "Minddagger's Throne"
setvar $planet~planet_names[646] "Carnot Outpost"
setvar $planet~planet_names[647] "Diancecht Outpost"
setvar $planet~planet_names[648] "Gormenghast Annex"
setvar $planet~planet_names[649] "Adansonia Primus"
setvar $planet~planet_names[650] "Tolchock Primus"
setvar $planet~planet_names[651] "Cordwainer"
setvar $planet~planet_names[652] "Rahman Primus"
setvar $planet~planet_names[653] "Amicar Outpost"
setvar $planet~planet_names[654] "Galahad II"
setvar $planet~planet_names[655] "New Khancuhn"
setvar $planet~planet_names[656] "Glyth Major"
setvar $planet~planet_names[657] "Dolldus Major"
setvar $planet~planet_names[658] "Reigar Outpost"
setvar $planet~planet_names[659] "Aristophanes"
setvar $planet~planet_names[660] "Foelen"
setvar $planet~planet_names[661] "Gagarin Annex"
setvar $planet~planet_names[662] "Yucca"
setvar $planet~planet_names[663] "Earwig"
setvar $planet~planet_names[664] "Ithaca Primus"
setvar $planet~planet_names[665] "El Cid Annex"
setvar $planet~planet_names[666] "Geronimo Outpost"
setvar $planet~planet_names[667] "Couatl Minor"
setvar $planet~planet_names[668] "New Kahn"
setvar $planet~planet_names[669] "New Acetylene"
setvar $planet~planet_names[670] "Nebuchadnezzar Annex"
setvar $planet~planet_names[671] "Jimson Minor"
setvar $planet~planet_names[672] "Iota Outpost"
setvar $planet~planet_names[673] "Carse II"
setvar $planet~planet_names[674] "Opus Outpost"
setvar $planet~planet_names[675] "Smekal"
setvar $planet~planet_names[676] "Ypsilon Primus"
setvar $planet~planet_names[677] "New Auralgan"
setvar $planet~planet_names[678] "Nin'arth Minor"
setvar $planet~planet_names[679] "Hohenstaufen II"
setvar $planet~planet_names[680] "Hefry Major"
setvar $planet~planet_names[681] "Faust Outpost"
setvar $planet~planet_names[682] "New Hagal"
setvar $planet~planet_names[683] "IronWollobick Annex"
setvar $planet~planet_names[684] "Sisko Minor"
setvar $planet~planet_names[685] "Piazzi Minor"
setvar $planet~planet_names[686] "Mirazh II"
setvar $planet~planet_names[687] "Myk Outpost"
setvar $planet~planet_names[688] "Bumex Minor"
setvar $planet~planet_names[689] "Feyd II"
setvar $planet~planet_names[690] "Hadron Major"
setvar $planet~planet_names[691] "Cyberdyne Outpost"
setvar $planet~planet_names[692] "D'Alembert Primus"
setvar $planet~planet_names[693] "Brigantia Annex"
setvar $planet~planet_names[694] "Miaplacidas Primus"
setvar $planet~planet_names[695] "Schwarzlose Annex"
setvar $planet~planet_names[696] "Datolite Annex"
setvar $planet~planet_names[697] "Gormenghast Outpost"
setvar $planet~planet_names[698] "Ithaca II"
setvar $planet~planet_names[699] "Condaria Primus"
setvar $planet~planet_names[700] "Draconis"
setvar $planet~planet_names[701] "Praxis"
setvar $planet~planet_names[702] "Brodie Primus"
setvar $planet~planet_names[703] "Katana Outpost"
setvar $planet~planet_names[704] "New Zoptica"
setvar $planet~planet_names[705] "New Bonta"
setvar $planet~planet_names[706] "Deschuner Primus"
setvar $planet~planet_names[707] "Hecate II"
setvar $planet~planet_names[708] "Siembieda Primus"
setvar $planet~planet_names[709] "Edinina Annex"
setvar $planet~planet_names[710] "Saxe Outpost"
setvar $planet~planet_names[711] "Fractine Annex"
setvar $planet~planet_names[712] "Schrodinger Primus"
setvar $planet~planet_names[713] "Gautier"
setvar $planet~planet_names[714] "Akkad Outpost"
setvar $planet~planet_names[715] "Polk Minor"
setvar $planet~planet_names[716] "New Brae Taera"
setvar $planet~planet_names[717] "DeGleash Outpost"
setvar $planet~planet_names[718] "Breon Annex"
setvar $planet~planet_names[719] "Adjutant"
setvar $planet~planet_names[720] "Bridger"
setvar $planet~planet_names[721] "New Dinomn"
setvar $planet~planet_names[722] "Sinmora"
setvar $planet~planet_names[723] "Wein Major"
setvar $planet~planet_names[724] "Skuld Major"
setvar $planet~planet_names[725] "Tau Major"
setvar $planet~planet_names[726] "Eocene Primus"
setvar $planet~planet_names[727] "Russel"
setvar $planet~planet_names[728] "Samson"
setvar $planet~planet_names[729] "Ponsby Primus"
setvar $planet~planet_names[730] "Koenig Minor"
setvar $planet~planet_names[731] "Constellate"
setvar $planet~planet_names[732] "New Verdun"
setvar $planet~planet_names[733] "New Heroni"
setvar $planet~planet_names[734] "New Dopp"
setvar $planet~planet_names[735] "Adhara Primus"
setvar $planet~planet_names[736] "Van Maanen II"
setvar $planet~planet_names[737] "Prokhorov II"
setvar $planet~planet_names[738] "Fabrina II"
setvar $planet~planet_names[739] "Ambartsumian Major"
setvar $planet~planet_names[740] "New Toro"
setvar $planet~planet_names[741] "New Sirius"
setvar $planet~planet_names[742] "Poisson II"
setvar $planet~planet_names[743] "New Deris"
setvar $planet~planet_names[744] "Nadrin Primus"
setvar $planet~planet_names[745] "Riyal Primus"
setvar $planet~planet_names[746] "New Hippocrates"
setvar $planet~planet_names[747] "Bainite Major"
setvar $planet~planet_names[748] "Hertz Annex"
setvar $planet~planet_names[749] "Athach"
setvar $planet~planet_names[750] "Torment Primus"
setvar $planet~planet_names[751] "Bohr Outpost"
setvar $planet~planet_names[752] "Copalite Outpost"
setvar $planet~planet_names[753] "Vero"
setvar $planet~planet_names[754] "Alfa Primus"
setvar $planet~planet_names[755] "Wolf II"
setvar $planet~planet_names[756] "Banalg"
setvar $planet~planet_names[757] "Lepton"
setvar $planet~planet_names[758] "Bardeleben II"
setvar $planet~planet_names[759] "Boyle Minor"
setvar $planet~planet_names[760] "Aston Annex"
setvar $planet~planet_names[761] "Proxima Centauri Major"
setvar $planet~planet_names[762] "Bielids Primus"
setvar $planet~planet_names[763] "Amber Major"
setvar $planet~planet_names[764] "Gorgimera II"
setvar $planet~planet_names[765] "Mortai Minor"
setvar $planet~planet_names[766] "Hecate Primus"
setvar $planet~planet_names[767] "Sabine"
setvar $planet~planet_names[768] "Kintaro Annex"
setvar $planet~planet_names[769] "Knorbes"
setvar $planet~planet_names[770] "Sirion Primus"
setvar $planet~planet_names[771] "New Priedo"
setvar $planet~planet_names[772] "Deris"
setvar $planet~planet_names[773] "Sakai II"
setvar $planet~planet_names[774] "Jefferson II"
setvar $planet~planet_names[775] "Flinte Minor"
setvar $planet~planet_names[776] "New Gaillot"
setvar $planet~planet_names[777] "New Ozawa"
setvar $planet~planet_names[778] "Valkyrie Major"
setvar $planet~planet_names[779] "Helios Primus"
setvar $planet~planet_names[780] "Castor Annex"
setvar $planet~planet_names[781] "Lysander Outpost"
setvar $planet~planet_names[782] "Engrange Major"
setvar $planet~planet_names[783] "Hektor Outpost"
setvar $planet~planet_names[784] "Quasi Primus"
setvar $planet~planet_names[785] "Minimi Annex"
setvar $planet~planet_names[786] "Cetacean Primus"
setvar $planet~planet_names[787] "Mondoloy"
setvar $planet~planet_names[788] "Hadozee II"
setvar $planet~planet_names[789] "Giedi Staz Primus"
setvar $planet~planet_names[790] "Sarnoff Primus"
setvar $planet~planet_names[791] "Symbiont Annex"
setvar $planet~planet_names[792] "New Atrivis"
setvar $planet~planet_names[793] "Adurol Outpost"
setvar $planet~planet_names[794] "Agamar Minor"
setvar $planet~planet_names[795] "de Tocqueville II"
setvar $planet~planet_names[796] "Kentaurus"
setvar $planet~planet_names[797] "Nebecula"
setvar $planet~planet_names[798] "Mach Primus"
setvar $planet~planet_names[799] "New Marconi"
setvar $planet~planet_names[800] "Pixie Outpost"
setvar $planet~planet_names[801] "Scorpio II"
setvar $planet~planet_names[802] "Greyhawk Outpost"
setvar $planet~planet_names[803] "New Bernoulli"
setvar $planet~planet_names[804] "Myk"
setvar $planet~planet_names[805] "New Snell"
setvar $planet~planet_names[806] "Buccal II"
setvar $planet~planet_names[807] "Surplus Outpost"
setvar $planet~planet_names[808] "Agathinon"
setvar $planet~planet_names[809] "Esabl Major"
setvar $planet~planet_names[810] "l'Hopital Primus"
setvar $planet~planet_names[811] "New Farquahar"
setvar $planet~planet_names[812] "Calit Annex"
setvar $planet~planet_names[813] "Forni-Copus Primus"
setvar $planet~planet_names[814] "Dreath Annex"
setvar $planet~planet_names[815] "Messier II"
setvar $planet~planet_names[816] "New Bethune"
setvar $planet~planet_names[817] "Avauld Major"
setvar $planet~planet_names[818] "New Brassica"
setvar $planet~planet_names[819] "Scheiner Minor"
setvar $planet~planet_names[820] "Focaline II"
setvar $planet~planet_names[821] "Xructocex Minor"
setvar $planet~planet_names[822] "Atozine II"
setvar $planet~planet_names[823] "Alupent Annex"
setvar $planet~planet_names[824] "Moran II"
setvar $planet~planet_names[825] "Bularia II"
setvar $planet~planet_names[826] "Natoko Major"
setvar $planet~planet_names[827] "Jenghe"
setvar $planet~planet_names[828] "Thanber II"
setvar $planet~planet_names[829] "Aeacus Major"
setvar $planet~planet_names[830] "New Avignon"
setvar $planet~planet_names[831] "Annobon Primus"
setvar $planet~planet_names[832] "Majorana"
setvar $planet~planet_names[833] "Alarm Major"
setvar $planet~planet_names[834] "Messier"
setvar $planet~planet_names[835] "Steele Minor"
setvar $planet~planet_names[836] "Njord II"
setvar $planet~planet_names[837] "Diabase Primus"
setvar $planet~planet_names[838] "Pagaton Minor"
setvar $planet~planet_names[839] "Aston Major"
setvar $planet~planet_names[840] "Rashomon Outpost"
setvar $planet~planet_names[841] "Yiktor"
setvar $planet~planet_names[842] "Azactam II"
setvar $planet~planet_names[843] "Anastasya II"
setvar $planet~planet_names[844] "Cogri"
setvar $planet~planet_names[845] "Macross Minor"
setvar $planet~planet_names[846] "Asteres Major"
setvar $planet~planet_names[847] "Bernoulli II"
setvar $planet~planet_names[848] "New Pagoda"
setvar $planet~planet_names[849] "Einherjar Primus"
setvar $planet~planet_names[850] "Palpatine"
setvar $planet~planet_names[851] "New Ghanima"
setvar $planet~planet_names[852] "Poitiers II"
setvar $planet~planet_names[853] "Nautiloid II"
setvar $planet~planet_names[854] "Zoptica Minor"
setvar $planet~planet_names[855] "Wern II"
setvar $planet~planet_names[856] "Cascara Annex"
setvar $planet~planet_names[857] "Yurst Outpost"
setvar $planet~planet_names[858] "Breughel Major"
setvar $planet~planet_names[859] "Anchorhead Outpost"
setvar $planet~planet_names[860] "Woden Annex"
setvar $planet~planet_names[861] "Gaia"
setvar $planet~planet_names[862] "New Orwell"
setvar $planet~planet_names[863] "Diocletian Primus"
setvar $planet~planet_names[864] "New Exedore"
setvar $planet~planet_names[865] "Jupura Major"
setvar $planet~planet_names[866] "Kerogen"
setvar $planet~planet_names[867] "Krono Major"
setvar $planet~planet_names[868] "Marmoutier Major"
setvar $planet~planet_names[869] "Stokes Annex"
setvar $planet~planet_names[870] "New Pluto"
setvar $planet~planet_names[871] "Hornet II"
setvar $planet~planet_names[872] "Telegraph Major"
setvar $planet~planet_names[873] "Bolivar Outpost"
setvar $planet~planet_names[874] "Iolcus II"
setvar $planet~planet_names[875] "Noegi Major"
setvar $planet~planet_names[876] "New Saladin"
setvar $planet~planet_names[877] "Cambridge Annex"
setvar $planet~planet_names[878] "Gelugon"
setvar $planet~planet_names[879] "Lazarus II"
setvar $planet~planet_names[880] "Achernar Primus"
setvar $planet~planet_names[881] "Langmuir"
setvar $planet~planet_names[882] "Buie Annex"
setvar $planet~planet_names[883] "Spica"
setvar $planet~planet_names[884] "Puparkin Outpost"
setvar $planet~planet_names[885] "Maya Major"
setvar $planet~planet_names[886] "New Polk"
setvar $planet~planet_names[887] "Solon Minor"
setvar $planet~planet_names[888] "Flamarion Primus"
setvar $planet~planet_names[889] "Jupura Minor"
setvar $planet~planet_names[890] "New Lahara"
setvar $planet~planet_names[891] "New Hermes"
setvar $planet~planet_names[892] "New Krono"
setvar $planet~planet_names[893] "Starling Primus"
setvar $planet~planet_names[894] "Vanant"
setvar $planet~planet_names[895] "New Rebka"
setvar $planet~planet_names[896] "Julian Major"
setvar $planet~planet_names[897] "Faeroes"
setvar $planet~planet_names[898] "Kongo"
setvar $planet~planet_names[899] "Lorraine Annex"
setvar $planet~planet_names[900] "Gautier Outpost"
setvar $planet~planet_names[901] "New Hadar"
setvar $planet~planet_names[902] "Nexine II"
setvar $planet~planet_names[903] "Lindbergh Annex"
setvar $planet~planet_names[904] "Ranger"
setvar $planet~planet_names[905] "Strad Primus"
setvar $planet~planet_names[906] "Yuro Minor"
setvar $planet~planet_names[907] "New Ilium"
setvar $planet~planet_names[908] "Peale"
setvar $planet~planet_names[909] "Faisal Primus"
setvar $planet~planet_names[910] "Skinfaxi Major"
setvar $planet~planet_names[911] "Gaea Primus"
setvar $planet~planet_names[912] "Ayat Major"
setvar $planet~planet_names[913] "Charlemagne Minor"
setvar $planet~planet_names[914] "Dixon II"
setvar $planet~planet_names[915] "Pequan Annex"
setvar $planet~planet_names[916] "Arden Annex"
setvar $planet~planet_names[917] "Palitzsch II"
setvar $planet~planet_names[918] "Seneca Annex"
setvar $planet~planet_names[919] "Bozarth Annex"
setvar $planet~planet_names[920] "Bicornn Outpost"
setvar $planet~planet_names[921] "Djinn Primus"
setvar $planet~planet_names[922] "Nabopolassar II"
setvar $planet~planet_names[923] "Adhara Major"
setvar $planet~planet_names[924] "New Nagant"
setvar $planet~planet_names[925] "Julian"
setvar $planet~planet_names[926] "Upatnieks Annex"
setvar $planet~planet_names[927] "New Guatama"
setvar $planet~planet_names[928] "Isolux Outpost"
setvar $planet~planet_names[929] "Archon Annex"
setvar $planet~planet_names[930] "Planitia Major"
setvar $planet~planet_names[931] "Li Kao Minor"
setvar $planet~planet_names[932] "Cogri Minor"
setvar $planet~planet_names[933] "New Shcawbe"
setvar $planet~planet_names[934] "Kruhious Outpost"
setvar $planet~planet_names[935] "Castor Hideout"
setvar $planet~planet_names[936] "Clastic Outpost"
setvar $planet~planet_names[937] "New Capybara"
setvar $planet~planet_names[938] "Durer"
setvar $planet~planet_names[939] "New Durendal"
setvar $planet~planet_names[940] "Tivid"
setvar $planet~planet_names[941] "New Vreibefger"
setvar $planet~planet_names[942] "Baugi Major"
setvar $planet~planet_names[943] "Lorraine Minor"
setvar $planet~planet_names[944] "Chalcedony Major"
setvar $planet~planet_names[945] "Rousseau Annex"
setvar $planet~planet_names[946] "Palique Outpost"
setvar $planet~planet_names[947] "Valence Annex"
setvar $planet~planet_names[948] "Ralhe Minor"
setvar $planet~planet_names[949] "Kruxas Ruz Annex"
setvar $planet~planet_names[950] "Pyris Primus"
setvar $planet~planet_names[951] "New Earwig"
setvar $planet~planet_names[952] "New Wintjen"
setvar $planet~planet_names[953] "Pennington"
setvar $planet~planet_names[954] "Koalinth"
setvar $planet~planet_names[955] "Antike Annex"
setvar $planet~planet_names[956] "Bach Major"
setvar $planet~planet_names[957] "Kikusui"
setvar $planet~planet_names[958] "Guatama Minor"
setvar $planet~planet_names[959] "Gaderffii"
setvar $planet~planet_names[960] "Kender"
setvar $planet~planet_names[961] "Mithra Minor"
setvar $planet~planet_names[962] "Osnabruck Primus"
setvar $planet~planet_names[963] "Pedase II"
setvar $planet~planet_names[964] "Murchison Primus"
setvar $planet~planet_names[965] "Lafaayette Outpost"
setvar $planet~planet_names[966] "Dawnworld"
setvar $planet~planet_names[967] "Ajacs"
setvar $planet~planet_names[968] "Raven Outpost"
setvar $planet~planet_names[969] "Bravera II"
setvar $planet~planet_names[970] "Edenelt Primus"
setvar $planet~planet_names[971] "New Nicholson"
setvar $planet~planet_names[972] "Suleiman Outpost"
setvar $planet~planet_names[973] "Alva"
setvar $planet~planet_names[974] "Amertet Annex"
setvar $planet~planet_names[975] "Guellan Minor"
setvar $planet~planet_names[976] "Thagar"
setvar $planet~planet_names[977] "Kegena"
setvar $planet~planet_names[978] "Ari Outpost"
setvar $planet~planet_names[979] "Hawk Primus"
setvar $planet~planet_names[980] "Abraxas Minor"
setvar $planet~planet_names[981] "Columbus"
setvar $planet~planet_names[982] "Rutledge Major"
setvar $planet~planet_names[983] "Efate Major"
setvar $planet~planet_names[984] "Xylem Primus"
setvar $planet~planet_names[985] "Anaspaz Major"
setvar $planet~planet_names[986] "Garoo Minor"
setvar $planet~planet_names[987] "Kruhious Minor"
setvar $planet~planet_names[988] "Camelot Major"
setvar $planet~planet_names[989] "Singer Minor"
setvar $planet~planet_names[990] "Aegospotami Primus"
setvar $planet~planet_names[991] "Modelei Annex"
setvar $planet~planet_names[992] "Skuld Outpost"
setvar $planet~planet_names[993] "Oisin Outpost"
setvar $planet~planet_names[994] "Baruch Major"
setvar $planet~planet_names[995] "Pyramus II"
setvar $planet~planet_names[996] "Thornastor Outpost"
setvar $planet~planet_names[997] "Suleiman"
setvar $planet~planet_names[998] "Pompey Primus"
setvar $planet~planet_names[999] "New Aeschylus"
setvar $planet~planet_names[1000] "Bounty's Horizon"
return
:planet~planetneg







setvar $planet~output_file ""
setvar $planet~selldelay 0
setvar $planet~oremcic "-90"
setvar $planet~orgmcic "-75"
setvar $planet~equmcic "-65"
setvar $planet~version "3.0.0"

setvar $planet~startinglocation $player~current_prompt
:planet~verifyprompt

if (($planet~startinglocation <> "Citadel") and ($planet~startinglocation <> "Planet"))
  setvar $planet~exit_message "Must start at Citadel or Planet Prompt for Planet Nego"
  goto :EXITNEG
end


setvar $planet~_ck_ptradesetting $game~ptradesetting
setvar $planet~quantityunknown 0

if ($planet~startinglocation = "Citadel")
  send "Q"
elseif ($planet~startinglocation = "Planet ")
  setvar $planet~startinglocation "Planet"
end
gosub :GETPLANETINFO
send "Q"
gosub :player~getinfo
send "*"

send "|CR"&$player~current_sector&"*"

settextlinetrigger FOUNDPORT :FOUNDPORT "Items     Status  Trading % of max OnBoard"
settextlinetrigger NOPORT :NOPORT "I have no information about a port in that sector."
settextlinetrigger NOPORT2 :NOPORT "You have never visted sector"
settextlinetrigger NOPORT3 :NOPORT "credits / next hold"
pause
:planet~noport

send "Q|"
killtrigger FOUNDPORT
killtrigger NOPORT
killtrigger NOPORT2
killtrigger NOPORT3
gosub :NEGOTIATELAND
setvar $planet~exit_message "No port to sell to"
goto :EXITNEG
:planet~foundport

killtrigger FOUNDPORT
killtrigger NOPORT
killtrigger NOPORT2
killtrigger NOPORT3
settextlinetrigger PORTINFO1 :PORTINFO1 "Fuel Ore "
settextlinetrigger PORTINFO2 :PORTINFO2 "Organics"
settextlinetrigger PORTINFO3 :PORTINFO3 "Equipment"
settextlinetrigger GOTCR :GOTCR "Computer command [TL="
pause
:planet~portinfo1

getword CURRENTLINE $player~current_sector.orebuying 3
getword CURRENTLINE $player~current_sector.oretrading 4
getword CURRENTLINE $player~current_sector.orepercent 5
striptext $player~current_sector.orepercent "%"
pause
:planet~portinfo2
getword CURRENTLINE $player~current_sector.orgbuying 2
getword CURRENTLINE $player~current_sector.orgtrading 3
getword CURRENTLINE $player~current_sector.orgpercent 4
striptext $player~current_sector.orgpercent "%"
pause
:planet~portinfo3
getword CURRENTLINE $player~current_sector.equbuying 2
getword CURRENTLINE $player~current_sector.equtrading 3
getword CURRENTLINE $player~current_sector.equpercent 4
striptext $player~current_sector.equpercent "%"
send "Q|"
pause
:planet~gotcr
killtrigger PORTINFO1
killtrigger PORTINFO2
killtrigger PORTINFO3
killtrigger GOTCR

setdelaytrigger JUSTASEC :JUSTASEC 200
pause
:planet~justasec
:planet~initinfo


if ($player~turns <= 0)
  gosub :NEGOTIATELAND
  setvar $planet~exit_message "I have no turns to negotiate this planet"
  goto :EXITNEG
end
if ($player~credits > 900000000)
  gosub :NEGOTIATELAND
  setvar $planet~exit_message "I have too much cash on hand"
  goto :EXITNEG
end

if ($planet~_ck_pnego_fueltosell = "-1")
  setvar $planet~fueltosell 0
elseif ($planet~_ck_pnego_fueltosell = "max")
  setvar $planet~fueltosell $planet~planetfuel
else
  setvar $planet~fueltosell $planet~_ck_pnego_fueltosell
end

if ($planet~fueltosell > $planet~planetfuel)
  setvar $planet~fueltosell $planet~planetfuel
end

if ($planet~_ck_pnego_orgtosell = "-1")
  setvar $planet~orgtosell 0
elseif ($planet~_ck_pnego_orgtosell = "max")
  setvar $planet~orgtosell $planet~planetorg
else
  setvar $planet~orgtosell $planet~_ck_pnego_orgtosell
end

if ($planet~orgtosell > $planet~planetorg)
  setvar $planet~orgtosell $planet~planetorg
end

if ($planet~_ck_pnego_equiptosell = "-1")
  setvar $planet~equiptosell 0
elseif ($planet~_ck_pnego_equiptosell = "max")
  setvar $planet~equiptosell $planet~planetequip
else
  setvar $planet~equiptosell $planet~_ck_pnego_equiptosell
end

if ($planet~equiptosell > $planet~planetequip)
  setvar $planet~equiptosell $planet~planetequip
end


if (($player~current_sector.orebuying <> "Buying") or ($player~current_sector.orepercent < 15))
  setvar $planet~fueltosell 0
end
if (($player~current_sector.orgbuying <> "Buying") or ($player~current_sector.orgpercent < 15))
  setvar $planet~orgtosell 0
end
if (($player~current_sector.equbuying <> "Buying") or ($player~current_sector.equpercent < 15))
  setvar $planet~equiptosell 0
end
:planet~selloff

if (($planet~fueltosell <> 0) or ($planet~orgtosell <> 0) or ($planet~equiptosell <> 0))
  setvar $planet~ore_sell_failures 0
  setvar $planet~org_sell_failures 0
  setvar $planet~equ_sell_failures 0
  setvar $planet~oreselloutput ""
  setvar $planet~orgselloutput ""
  setvar $planet~equselloutput ""
  setvar $planet~oreprofit 0
  setvar $planet~orgprofit 0
  setvar $planet~equprofit 0

  send "|"
  gosub :SELL
  gosub :NEGOTIATELAND
  if ($planet~startinglocation = "Citadel")

    if ($planet~oreprofit <> 0)
      send "TT"&$planet~oreprofit&"*"
      subtract $player~credits $planet~oreprofit
    end
    if ($planet~orgprofit <> 0)
      send "TT"&$planet~orgprofit&"*"
      subtract $player~credits $planet~orgprofit
    end
    if ($planet~equprofit <> 0)
      send "TT"&$planet~equprofit&"*"
      subtract $player~credits $planet~equprofit
    end
  end


  send "|"



  setvar $planet~generaloutput "*Sector "&$player~current_sector&"*"
  if ($planet~output_file <> "")
    write $planet~output_file $planet~generaloutput
  end

  if ($planet~oreselloutput <> "")

    setvar $switchboard~message "  *"&$planet~oreselloutput
    if ($switchboard~self_command <> TRUE)
      setvar $switchboard~self_command 2
    end


    if ($planet~output_file <> "")
      write $planet~output_file $planet~oreselloutput
    end
  end
  if ($planet~orgselloutput <> "")

    setvar $switchboard~message "  *"&$planet~orgselloutput
    if ($switchboard~self_command <> TRUE)
      setvar $switchboard~self_command 2
    end

    if ($planet~output_file <> "")
      write $planet~output_file $planet~orgselloutput
    end
  end
  if ($planet~equselloutput <> "")

    setvar $switchboard~message "  *"&$planet~equselloutput
    if ($switchboard~self_command <> TRUE)
      setvar $switchboard~self_command 2
    end

    if ($planet~output_file <> "")
      write $planet~output_file $planet~equselloutput
    end
  end
  setvar $planet~exit_message "Done with port"
  goto :EXITNEG
else
  gosub :NEGOTIATELAND
  setvar $planet~exit_message "Nothing to sell"
  goto :EXITNEG
end
:planet~sell
:planet~resell


if ($player~turns <= 0)
  send "'I'm out of turns*"
  return
end
setvar $planet~thisorefailed 0
setvar $planet~thisorgfailed 0
setvar $planet~thisequfailed 0
if ($planet~fueltosell > 0)
  setvar $planet~attemptore 1
  setvar $planet~attemptoreconfirmed 0
end
if ($planet~orgtosell > 0)
  setvar $planet~attemptorg 1
  setvar $planet~attemptorgconfirmed 0
end
if ($planet~equiptosell > 0)
  setvar $planet~attemptequ 1
  setvar $planet~attemptequconfirmed 0
end
isnumber $planet~number $planet~planet
setvar $planet~findplanet 0
if ($planet~number = 0)
  send "PN"
  setvar $planet~findplanet 1
else
  send "PN"
end

subtract $player~turns 1
:planet~getpercts
settextlinetrigger OREPCT :OREPCT "Fuel Ore   Buying"
settextlinetrigger ORGPCT :ORGPCT "Organics   Buying"
settextlinetrigger EQUPCT :EQUPCT "Equipment  Buying"
settextlinetrigger GOTPERCTS :GOTPERCTS "Registry# and Planet Name"
pause
:planet~orepct

killtrigger OREPCT
killtrigger ORGPCT
killtrigger EQUPCT
killtrigger GOTPERCTS
getword CURRENTLINE $player~current_sector.oretrading 4
getword CURRENTLINE $player~current_sector.orepercent 5
striptext $player~current_sector.orepercent "%"
if ($player~current_sector.orepercent < 100)
  add $player~current_sector.orepercent 1
end
goto :GETPERCTS
:planet~orgpct

killtrigger OREPCT
killtrigger ORGPCT
killtrigger EQUPCT
killtrigger GOTPERCTS
getword CURRENTLINE $player~current_sector.orgtrading 3
getword CURRENTLINE $player~current_sector.orgpercent 4
striptext $player~current_sector.orgpercent "%"
if ($player~current_sector.orgpercent < 100)
  add $player~current_sector.orgpercent 1
end
goto :GETPERCTS
:planet~equpct

killtrigger OREPCT
killtrigger ORGPCT
killtrigger EQUPCT
killtrigger GOTPERCTS
getword CURRENTLINE $player~current_sector.equtrading 3
getword CURRENTLINE $player~current_sector.equpercent 4
striptext $player~current_sector.equpercent "%"
if ($player~current_sector.equpercent < 100)
  add $player~current_sector.equpercent 1
end
goto :GETPERCTS
:planet~gotpercts


isnumber $planet~test1 $player~current_sector.oretrading
isnumber $planet~test2 $player~current_sector.orepercent
if (($planet~test1 = 0) or ($planet~test2 = 0))
  send "'DEBUG: NAN on oretrading:"&$planet~test1&" orepercent:" $planet~test2 "*"
  setvar $player~current_sector.orepercent 1
  setvar $player~current_sector.oretrading 1
end
isnumber $planet~test3 $player~current_sector.orgtrading
isnumber $planet~test4 $player~current_sector.orgpercent
if (($planet~test3 = 0) or ($planet~test2 = 0))
  send "'DEBUG: NAN on orgtrading:"&$planet~test3&" orgpercent:" $planet~test4 "*"
  setvar $player~current_sector.orgpercent 1
  setvar $player~current_sector.orgtrading 1
end

isnumber $planet~test5 $player~current_sector.equtrading
isnumber $planet~test6 $player~current_sector.equpercent
if (($planet~test5 = 0) or ($planet~test6 = 0))
  send "'DEBUG: NAN on equtrading:"&$planet~test5&" equpercent:" $planet~test6 "*"
  setvar $player~current_sector.equpercent 1
  setvar $player~current_sector.equtrading 1
end
killtrigger OREPCT
killtrigger ORGPCT
killtrigger EQUPCT
killtrigger GOTPERCTS
if ($planet~findplanet = 1)
  settextlinetrigger PLANETNUM :PLANETNUM "> "&$planet~planet
  setdelaytrigger NOPLANETNUM :NOPLANETNUM 3000
  pause
  :planet~noplanetnum
  killalltriggers
  setvar $planet~exit_message "Could not determine port number!"
  send "q*"
  goto :EXITNEG
  :planet~planetnum
  killtrigger PLANETNUM
  killtrigger NOPLANETNUM
  getword CURRENTLINE $planet~planet 1
  striptext $planet~planet ">"
  send $planet~planet "*"
else
  send $planet~planet "*"
end
:planet~sellproduct


settexttrigger SELLFUEL :SELLFUEL "How many units of Fuel Ore"
settexttrigger SELLORG :SELLORG "How many units of Organics"
settexttrigger SELLEQU :SELLEQU "How many units of Equipment"
settexttrigger DONEWITHPORT :DONEWITHPORT "Command [TL="
killtrigger NOTOURS
settexttrigger NOTOURS :NOTOURS "You don't own that planet!  Were you expecting us to invade it?"
pause
:planet~notours

send "*"
setvar $planet~exit_message "We don't own this planet!"
pause
:planet~sellfuel
killtrigger SELLFUEL
killtrigger SELLORG
killtrigger SELLEQU
killtrigger DONEWITHPORT
if ($planet~quantityunknown = 1)
  getword CURRENTLINE $planet~fueltosell 12
  striptext $planet~fueltosell "["
  striptext $planet~fueltosell "]"
  striptext $planet~fueltosell "?"
end


isnumber $planet~test $planet~fueltosell
if ($planet~test = 0)
  send "'DEBUG: NAN on fueltosell:"&$planet~fueltosell "*"
  setvar $planet~fueltosell 0
end
if (($player~current_sector.orepercent >= 15) and ($planet~fueltosell > 0))
  if ($planet~fueltosell > $player~current_sector.oretrading)
    setvar $planet~fueltosell $player~current_sector.oretrading
  end
  setvar $planet~attemptoreconfirmed 1
  setvar $planet~prodtosell "ore"
  setvar $planet~portbuying $planet~fueltosell
  gosub :SELLHAGGLE
  if ($planet~currenthaggle = "succeeded")
    setvar $planet~orehaggle "succeeded"
    setvar $planet~fueltosell 0
  else
    setvar $planet~orehaggle "failed"
  end
else
  send "az0*"
  setvar $planet~fueltosell 0
end
goto :SELLPRODUCT
:planet~sellorg

killtrigger SELLFUEL
killtrigger SELLORG
killtrigger SELLEQU
killtrigger DONEWITHPORT
if ($planet~quantityunknown = 1)
  getword CURRENTLINE $planet~orgtosell 11
  striptext $planet~orgtosell "["
  striptext $planet~orgtosell "]"
  striptext $planet~orgtosell "?"
end

isnumber $planet~test $planet~orgtosell
if ($planet~test = 0)
  send "'DEBUG: NAN on orgtosell:"&$planet~orgtosell "*"
  setvar $planet~orgtosell 0
end
if (($player~current_sector.orgpercent >= 15) and ($planet~orgtosell > 0))
  if ($planet~orgtosell > $player~current_sector.orgtrading)
    setvar $planet~orgtosell $player~current_sector.orgtrading
  end
  setvar $planet~attemptorgconfirmed 1
  setvar $planet~prodtosell "org"
  setvar $planet~portbuying $planet~orgtosell
  gosub :SELLHAGGLE
  if ($planet~currenthaggle = "succeeded")
    setvar $planet~orghaggle "succeeded"
    setvar $planet~orgtosell 0
  else
    setvar $planet~orghaggle "failed"
  end
else
  send "az0*"
  setvar $planet~orgtosell 0
end
goto :SELLPRODUCT
:planet~sellequ


killtrigger SELLFUEL
killtrigger SELLORG
killtrigger SELLEQU
killtrigger DONEWITHPORT
if ($planet~quantityunknown = 1)
  getword CURRENTLINE $planet~equiptosell 11
  striptext $planet~equiptosell "["
  striptext $planet~equiptosell "]"
  striptext $planet~equiptosell "?"
end

isnumber $planet~test $planet~equiptosell
if ($planet~test = 0)
  send "'DEBUG: NAN on equiptosell:"&$planet~equiptosell "*"
  setvar $planet~equiptosell 0
end
if (($player~current_sector.equpercent >= 15) and ($planet~equiptosell > 0))
  if ($planet~equiptosell > $player~current_sector.equtrading)
    setvar $planet~equiptosell $player~current_sector.equtrading
  end
  setvar $planet~attemptequconfirmed 1
  setvar $planet~prodtosell "equ"
  setvar $planet~portbuying $planet~equiptosell
  gosub :SELLHAGGLE
  if ($planet~currenthaggle = "succeeded")
    setvar $planet~equhaggle "succeeded"
    setvar $planet~equiptosell 0
  else
    setvar $planet~equhaggle "failed"
  end
else
  send "az0*"
  setvar $planet~equiptosell 0
end
goto :SELLPRODUCT
:planet~donewithport

killtrigger SELLFUEL
killtrigger SELLORG
killtrigger SELLEQU
killtrigger DONEWITHPORT

if (($planet~attemptore = 1) and ($planet~attemptoreconfirmed = 0))

  setvar $planet~fueltosell 0
end
if (($planet~attemptorg = 1) and ($planet~attemptorgconfirmed = 0))
  setvar $planet~orgtosell 0
end
if (($planet~attemptequ = 1) and ($planet~attemptequconfirmed = 0))
  setvar $planet~equiptosell 0
end

if (($planet~ore_sell_failures > 1) or ($planet~org_sell_failures > 4) or ($planet~equ_sell_failures > 4))
  setvar $planet~selloutput $planet~selloutput&"Multiple Haggle Failures - Please cut and paste this haggling session and email to Cherokee*"
  return
elseif (($planet~fueltosell = 0) and (($planet~orgtosell = 0) and ($planet~equiptosell = 0)))
  if (($planet~attemptoreconfirmed = 0) and (($planet~attemptorgconfirmed = 0) and ($planet~attemptequconfirmed = 0)))
    setvar $planet~exit_message "Nothing to sell here!"
  end
  return
else
  goto :RESELL
end
:planet~sellhaggle

goto :SELLHAGGLENATIVE
:planet~sellhagglenative

setvar $planet~currenthaggle "pending"
setvar $planet~oldcredits $player~credits
setvar $planet~mcic ""
send $planet~portbuying&"*"
:planet~sellhagglenativewait

killalltriggers
settextlinetrigger NATIVESELLEXPERIENCE :NATIVESELLEXPERIENCE "experience point(s)"
settextlinetrigger NATIVESELLYOUHAVE :NATIVESELLYOUHAVE "You have"
settextlinetrigger NATIVESELLNOTINTERESTED :NATIVESELLNOTINTERESTED "We're not interested."
settextlinetrigger NATIVESELLPROMPT :NATIVESELLPROMPT "Command [TL="
pause
:planet~nativesellexperience

killalltriggers
getword CURRENTLINE $planet~exp_bonus 7
isnumber $planet~testexp $planet~exp_bonus
if ($planet~testexp <> 0)
  add $planet~experience $planet~exp_bonus
end
goto :SELLHAGGLENATIVEWAIT
:planet~nativesellyouhave

killalltriggers
getword CURRENTLINE $planet~credits 3
striptext $planet~credits ","
isnumber $planet~testcredits $planet~credits
if ($planet~testcredits = 0)
  goto :SELLHAGGLENATIVEWAIT
end
getword CURRENTLINE $planet~creditlabel 4
if ($planet~creditlabel <> "credits.")
  goto :SELLHAGGLENATIVEWAIT
end
setvar $planet~counter $planet~credits
subtract $planet~counter $planet~oldcredits
setvar $player~credits $planet~credits
if ($planet~counter <= 0)
  setvar $planet~currenthaggle "failed"
  goto :SELLHAGGLEFAILED
end
setvar $planet~currenthaggle "succeeded"
gosub :LOADNATIVEMCIC
goto :SELLHAGGLESUCCEEDED
:planet~nativesellnotinterested

killalltriggers
setvar $planet~currenthaggle "failed"
goto :SELLHAGGLEFAILED
:planet~nativesellprompt

killalltriggers
if ($planet~currenthaggle <> "succeeded")
  setvar $planet~currenthaggle "failed"
  goto :SELLHAGGLEFAILED
end
return
:planet~loadnativemcic

setvar $planet~mcic $haggle~mcic
isnumber $planet~mcicvalid $planet~mcic
if ($planet~mcicvalid = 0)
  if ($planet~prodtosell = "ore")
    getsectorparameter $player~current_sector "OREMCIC" $planet~mcic
  elseif ($planet~prodtosell = "org")
    getsectorparameter $player~current_sector "ORGMCIC" $planet~mcic
  elseif ($planet~prodtosell = "equ")
    getsectorparameter $player~current_sector "EQUMCIC" $planet~mcic
  end
  isnumber $planet~mcicvalid $planet~mcic
end
if ($planet~mcicvalid = 0)
  if ($planet~prodtosell = "ore")
    setvar $planet~mcic $planet~oremcic
  elseif ($planet~prodtosell = "org")
    setvar $planet~mcic $planet~orgmcic
  elseif ($planet~prodtosell = "equ")
    setvar $planet~mcic $planet~equmcic
  end
  isnumber $planet~mcicvalid $planet~mcic
end
if ($planet~mcicvalid <> 0)
  if ($planet~prodtosell = "ore")
    setvar $planet~oremcic $planet~mcic
    setsectorparameter $player~current_sector "OREMCIC" $planet~mcic
  elseif ($planet~prodtosell = "org")
    setvar $planet~orgmcic $planet~mcic
    setsectorparameter $player~current_sector "ORGMCIC" $planet~mcic
  elseif ($planet~prodtosell = "equ")
    setvar $planet~equmcic $planet~mcic
    setsectorparameter $player~current_sector "EQUMCIC" $planet~mcic
  end
end
return

settextlinetrigger SELLFIRSTOFFER :SELLFIRSTOFFER "We'll buy them for"
send "az"&$planet~portbuying&"*"
pause
:planet~sellfirstoffer

killtrigger SELLFIRSTOFFER
getword CURRENTLINE $planet~offer 5
striptext $planet~offer ","

gosub :player~swathoff
if ($player~swathoff = FALSE)
  gosub :NEGOTIATELAND
  setvar $planet~exit_message $planet~swathoffmessage
  goto :EXITNEG
end


setvar $planet~perunitinitoffer $planet~offer


multiply $planet~perunitinitoffer 100
divide $planet~perunitinitoffer $planet~_ck_ptradesetting


multiply $planet~perunitinitoffer 100


divide $planet~perunitinitoffer $planet~portbuying


setvar $planet~portmaxinit $planet~perunitinitoffer


divide $planet~perunitinitoffer 10

if ($planet~prodtosell = "ore")

  setvar $planet~basevalue 256055800
  setvar $planet~basepercent 11725
  setvar $planet~basepercentinverse 88275
  setvar $planet~percentfrombase $player~current_sector.orepercent
elseif ($planet~prodtosell = "org")

  setvar $planet~basevalue 506276400
  setvar $planet~basepercent 11287
  setvar $planet~basepercentinverse 88713
  setvar $planet~percentfrombase $player~current_sector.orgpercent
elseif ($planet~prodtosell = "equ")

  setvar $planet~basevalue 906281000
  setvar $planet~basepercent 10989
  setvar $planet~basepercentinverse 89010
  setvar $planet~percentfrombase $player~current_sector.equpercent
end

if ($planet~percentfrombase = 100)


  divide $planet~portmaxinit 10

elseif ($planet~percentfrombase >= 15)

  multiply $planet~portmaxinit 100000


  subtract $planet~portmaxinit $planet~basevalue


  multiply $planet~percentfrombase 1000


  subtract $planet~percentfrombase $planet~basepercent


  divide $planet~portmaxinit $planet~percentfrombase


  multiply $planet~portmaxinit $planet~basepercentinverse


  add $planet~portmaxinit $planet~basevalue


  divide $planet~portmaxinit 1000000

elseif ($planet~prodtosell = "ore")
  setvar $planet~portmaxinit 340

elseif ($planet~prodtosell = "org")
  setvar $planet~portmaxinit 635

elseif ($planet~prodtosell = "equ")
  setvar $planet~portmaxinit 1063
end



if ($planet~prodtosell = "ore")

  if ($planet~portmaxinit >= 436)
    setvar $planet~mcic "-90"
    setvar $planet~multiple 1494

  elseif ($planet~portmaxinit >= 434)
    setvar $planet~mcic "-89"
    setvar $planet~multiple 1488

  elseif ($planet~portmaxinit >= 433)
    setvar $planet~mcic "-88"
    setvar $planet~multiple 1482

  elseif ($planet~portmaxinit >= 431)
    setvar $planet~mcic "-87"
    setvar $planet~multiple 1476

  elseif ($planet~portmaxinit >= 429)
    setvar $planet~mcic "-86"
    setvar $planet~multiple 1470

  elseif ($planet~portmaxinit >= 427)
    setvar $planet~mcic "-85"
    setvar $planet~multiple 1464

  elseif ($planet~portmaxinit >= 425)
    setvar $planet~mcic "-84"
    setvar $planet~multiple 1458

  elseif ($planet~portmaxinit >= 424)
    setvar $planet~mcic "-83"
    setvar $planet~multiple 1452

  elseif ($planet~portmaxinit >= 422)
    setvar $planet~mcic "-82"
    setvar $planet~multiple 1446

  elseif ($planet~portmaxinit >= 420)
    setvar $planet~mcic "-81"
    setvar $planet~multiple 1440

  elseif ($planet~portmaxinit >= 418)
    setvar $planet~mcic "-80"
    setvar $planet~multiple 1434

  elseif ($planet~portmaxinit >= 416)
    setvar $planet~mcic "-79"
    setvar $planet~multiple 1428

  elseif ($planet~portmaxinit >= 414)
    setvar $planet~mcic "-78"
    setvar $planet~multiple 1423

  elseif ($planet~portmaxinit >= 412)
    setvar $planet~mcic "-77"
    setvar $planet~multiple 1417

  elseif ($planet~portmaxinit >= 411)
    setvar $planet~mcic "-76"
    setvar $planet~multiple 1411

  elseif ($planet~portmaxinit >= 409)
    setvar $planet~mcic "-75"
    setvar $planet~multiple 1405

  elseif ($planet~portmaxinit >= 407)
    setvar $planet~mcic "-74"
    setvar $planet~multiple 1399

  elseif ($planet~portmaxinit >= 405)
    setvar $planet~mcic "-73"
    setvar $planet~multiple 1393

  elseif ($planet~portmaxinit >= 403)
    setvar $planet~mcic "-72"
    setvar $planet~multiple 1387

  elseif ($planet~portmaxinit >= 401)
    setvar $planet~mcic "-71"
    setvar $planet~multiple 1381

  elseif ($planet~portmaxinit >= 399)
    setvar $planet~mcic "-70"
    setvar $planet~multiple 1375

  elseif ($planet~portmaxinit >= 397)
    setvar $planet~mcic "-69"
    setvar $planet~multiple 1369

  elseif ($planet~portmaxinit >= 396)
    setvar $planet~mcic "-68"
    setvar $planet~multiple 1363

  elseif ($planet~portmaxinit >= 394)
    setvar $planet~mcic "-67"
    setvar $planet~multiple 1357

  elseif ($planet~portmaxinit >= 392)
    setvar $planet~mcic "-66"
    setvar $planet~multiple 1351

  elseif ($planet~portmaxinit >= 390)
    setvar $planet~mcic "-65"
    setvar $planet~multiple 1345

  elseif ($planet~portmaxinit >= 388)
    setvar $planet~mcic "-64"
    setvar $planet~multiple 1341

  elseif ($planet~portmaxinit >= 386)
    setvar $planet~mcic "-63"
    setvar $planet~multiple 1336

  elseif ($planet~portmaxinit >= 384)
    setvar $planet~mcic "-62"
    setvar $planet~multiple 1330

  elseif ($planet~portmaxinit >= 382)
    setvar $planet~mcic "-61"
    setvar $planet~multiple 1324

  elseif ($planet~portmaxinit >= 380)
    setvar $planet~mcic "-60"
    setvar $planet~multiple 1318

  elseif ($planet~portmaxinit >= 378)
    setvar $planet~mcic "-59"
    setvar $planet~multiple 1312

  elseif ($planet~portmaxinit >= 376)
    setvar $planet~mcic "-58"
    setvar $planet~multiple 1306

  elseif ($planet~portmaxinit >= 374)
    setvar $planet~mcic "-57"
    setvar $planet~multiple 1300

  elseif ($planet~portmaxinit >= 372)
    setvar $planet~mcic "-56"
    setvar $planet~multiple 1294

  elseif ($planet~portmaxinit >= 370)
    setvar $planet~mcic "-55"
    setvar $planet~multiple 1291

  elseif ($planet~portmaxinit >= 368)
    setvar $planet~mcic "-54"
    setvar $planet~multiple 1285

  elseif ($planet~portmaxinit >= 366)
    setvar $planet~mcic "-53"
    setvar $planet~multiple 1279

  elseif ($planet~portmaxinit >= 364)
    setvar $planet~mcic "-52"
    setvar $planet~multiple 1273

  elseif ($planet~portmaxinit >= 362)
    setvar $planet~mcic "-51"
    setvar $planet~multiple 1267

  elseif ($planet~portmaxinit >= 360)
    setvar $planet~mcic "-50"
    setvar $planet~multiple 1261

  elseif ($planet~portmaxinit >= 358)
    setvar $planet~mcic "-49"
    setvar $planet~multiple 1255

  elseif ($planet~portmaxinit >= 356)
    setvar $planet~mcic "-48"
    setvar $planet~multiple 1249

  elseif ($planet~portmaxinit >= 354)
    setvar $planet~mcic "-46"
    setvar $planet~multiple 1246

  elseif ($planet~portmaxinit >= 352)
    setvar $planet~mcic "-46"
    setvar $planet~multiple 1240

  elseif ($planet~portmaxinit >= 350)
    setvar $planet~mcic "-45"
    setvar $planet~multiple 1234

  elseif ($planet~portmaxinit >= 348)
    setvar $planet~mcic "-44"
    setvar $planet~multiple 1228

  elseif ($planet~portmaxinit >= 346)
    setvar $planet~mcic "-43"
    setvar $planet~multiple 1222

  elseif ($planet~portmaxinit >= 344)
    setvar $planet~mcic "-42"
    setvar $planet~multiple 1219

  elseif ($planet~portmaxinit >= 342)
    setvar $planet~mcic "-41"
    setvar $planet~multiple 1209

  elseif ($planet~portmaxinit >= 340)
    setvar $planet~mcic "-40"
    setvar $planet~multiple 1208

  else
    setvar $planet~mcic 0
    setvar $planet~multiple 1208
  end

elseif ($planet~prodtosell = "org")
  if ($planet~portmaxinit >= 813)
    setvar $planet~mcic "-75"
    setvar $planet~multiple 1405

  elseif ($planet~portmaxinit >= 810)
    setvar $planet~mcic "-74"
    setvar $planet~multiple 1399

  elseif ($planet~portmaxinit >= 806)
    setvar $planet~mcic "-73"
    setvar $planet~multiple 1393

  elseif ($planet~portmaxinit >= 802)
    setvar $planet~mcic "-72"
    setvar $planet~multiple 1387

  elseif ($planet~portmaxinit >= 798)
    setvar $planet~mcic "-71"
    setvar $planet~multiple 1381

  elseif ($planet~portmaxinit >= 795)
    setvar $planet~mcic "-70"
    setvar $planet~multiple 1375

  elseif ($planet~portmaxinit >= 791)
    setvar $planet~mcic "-69"
    setvar $planet~multiple 1369

  elseif ($planet~portmaxinit >= 787)
    setvar $planet~mcic "-68"
    setvar $planet~multiple 1363

  elseif ($planet~portmaxinit >= 783)
    setvar $planet~mcic "-67"
    setvar $planet~multiple 1357

  elseif ($planet~portmaxinit >= 779)
    setvar $planet~mcic "-66"
    setvar $planet~multiple 1351

  elseif ($planet~portmaxinit >= 775)
    setvar $planet~mcic "-65"
    setvar $planet~multiple 1345

  elseif ($planet~portmaxinit >= 772)
    setvar $planet~mcic "-64"
    setvar $planet~multiple 1339

  elseif ($planet~portmaxinit >= 768)
    setvar $planet~mcic "-63"
    setvar $planet~multiple 1336

  elseif ($planet~portmaxinit >= 764)
    setvar $planet~mcic "-62"
    setvar $planet~multiple 1330

  elseif ($planet~portmaxinit >= 760)
    setvar $planet~mcic "-61"
    setvar $planet~multiple 1324

  elseif ($planet~portmaxinit >= 756)
    setvar $planet~mcic "-60"
    setvar $planet~multiple 1318

  elseif ($planet~portmaxinit >= 752)
    setvar $planet~mcic "-59"
    setvar $planet~multiple 1312

  elseif ($planet~portmaxinit >= 748)
    setvar $planet~mcic "-58"
    setvar $planet~multiple 1306

  elseif ($planet~portmaxinit >= 744)
    setvar $planet~mcic "-57"
    setvar $planet~multiple 1300

  elseif ($planet~portmaxinit >= 740)
    setvar $planet~mcic "-56"
    setvar $planet~multiple 1294

  elseif ($planet~portmaxinit >= 737)
    setvar $planet~mcic "-55"
    setvar $planet~multiple 1291

  elseif ($planet~portmaxinit >= 733)
    setvar $planet~mcic "-54"
    setvar $planet~multiple 1285

  elseif ($planet~portmaxinit >= 729)
    setvar $planet~mcic "-53"
    setvar $planet~multiple 1279

  elseif ($planet~portmaxinit >= 725)
    setvar $planet~mcic "-52"
    setvar $planet~multiple 1273

  elseif ($planet~portmaxinit >= 721)
    setvar $planet~mcic "-51"
    setvar $planet~multiple 1267

  elseif ($planet~portmaxinit >= 717)
    setvar $planet~mcic "-50"
    setvar $planet~multiple 1261

  elseif ($planet~portmaxinit >= 713)
    setvar $planet~mcic "-49"
    setvar $planet~multiple 1255

  elseif ($planet~portmaxinit >= 709)
    setvar $planet~mcic "-48"
    setvar $planet~multiple 1252

  elseif ($planet~portmaxinit >= 705)
    setvar $planet~mcic "-47"
    setvar $planet~multiple 1246

  elseif ($planet~portmaxinit >= 701)
    setvar $planet~mcic "-46"
    setvar $planet~multiple 1236

  elseif ($planet~portmaxinit >= 697)
    setvar $planet~mcic "-45"
    setvar $planet~multiple 1233

  elseif ($planet~portmaxinit >= 693)
    setvar $planet~mcic "-44"
    setvar $planet~multiple 1227

  elseif ($planet~portmaxinit >= 688)
    setvar $planet~mcic "-43"
    setvar $planet~multiple 1224

  elseif ($planet~portmaxinit >= 684)
    setvar $planet~mcic "-42"
    setvar $planet~multiple 1214

  elseif ($planet~portmaxinit >= 680)
    setvar $planet~mcic "-41"
    setvar $planet~multiple 1213

  elseif ($planet~portmaxinit >= 676)
    setvar $planet~mcic "-40"
    setvar $planet~multiple 1203

  elseif ($planet~portmaxinit >= 672)
    setvar $planet~mcic "-39"
    setvar $planet~multiple 1200

  elseif ($planet~portmaxinit >= 668)
    setvar $planet~mcic "-38"
    setvar $planet~multiple 1194

  elseif ($planet~portmaxinit >= 664)
    setvar $planet~mcic "-37"
    setvar $planet~multiple 1191

  elseif ($planet~portmaxinit >= 660)
    setvar $planet~mcic "-36"
    setvar $planet~multiple 1181

  elseif ($planet~portmaxinit >= 656)
    setvar $planet~mcic "-35"
    setvar $planet~multiple 1178

  elseif ($planet~portmaxinit >= 651)
    setvar $planet~mcic "-34"
    setvar $planet~multiple 1172

  elseif ($planet~portmaxinit >= 647)
    setvar $planet~mcic "-33"
    setvar $planet~multiple 1166

  elseif ($planet~portmaxinit >= 643)
    setvar $planet~mcic "-32"
    setvar $planet~multiple 1160

  elseif ($planet~portmaxinit >= 639)
    setvar $planet~mcic "-31"
    setvar $planet~multiple 1157

  elseif ($planet~portmaxinit >= 635)
    setvar $planet~mcic "-30"
    setvar $planet~multiple 1154

  else
    setvar $planet~mcic 0
    setvar $planet~multiple 1154
  end

elseif ($planet~prodtosell = "equ")
  if ($planet~portmaxinit >= 1393)
    setvar $planet~mcic "-65"
    setvar $planet~multiple 1347

  elseif ($planet~portmaxinit >= 1386)
    setvar $planet~mcic "-64"
    setvar $planet~multiple 1341

  elseif ($planet~portmaxinit >= 1379)
    setvar $planet~mcic "-63"
    setvar $planet~multiple 1336

  elseif ($planet~portmaxinit >= 1372)
    setvar $planet~mcic "-62"
    setvar $planet~multiple 1330

  elseif ($planet~portmaxinit >= 1365)
    setvar $planet~mcic "-61"
    setvar $planet~multiple 1324

  elseif ($planet~portmaxinit >= 1358)
    setvar $planet~mcic "-60"
    setvar $planet~multiple 1319

  elseif ($planet~portmaxinit >= 1351)
    setvar $planet~mcic "-59"
    setvar $planet~multiple 1313

  elseif ($planet~portmaxinit >= 1344)
    setvar $planet~mcic "-58"
    setvar $planet~multiple 1307

  elseif ($planet~portmaxinit >= 1337)
    setvar $planet~mcic "-57"
    setvar $planet~multiple 1302

  elseif ($planet~portmaxinit >= 1329)
    setvar $planet~mcic "-56"
    setvar $planet~multiple 1296

  elseif ($planet~portmaxinit >= 1323)
    setvar $planet~mcic "-55"
    setvar $planet~multiple 1291

  elseif ($planet~portmaxinit >= 1315)
    setvar $planet~mcic "-54"
    setvar $planet~multiple 1285

  elseif ($planet~portmaxinit >= 1308)
    setvar $planet~mcic "-53"
    setvar $planet~multiple 1279

  elseif ($planet~portmaxinit >= 1301)
    setvar $planet~mcic "-52"
    setvar $planet~multiple 1274

  elseif ($planet~portmaxinit >= 1294)
    setvar $planet~mcic "-51"
    setvar $planet~multiple 1268

  elseif ($planet~portmaxinit >= 1287)
    setvar $planet~mcic "-50"
    setvar $planet~multiple 1262

  elseif ($planet~portmaxinit >= 1279)
    setvar $planet~mcic "-49"
    setvar $planet~multiple 1254

  elseif ($planet~portmaxinit >= 1272)
    setvar $planet~mcic "-48"
    setvar $planet~multiple 1247

  elseif ($planet~portmaxinit >= 1265)
    setvar $planet~mcic "-47"
    setvar $planet~multiple 1246

  elseif ($planet~portmaxinit >= 1258)
    setvar $planet~mcic "-46"
    setvar $planet~multiple 1241

  elseif ($planet~portmaxinit >= 1251)
    setvar $planet~mcic "-45"
    setvar $planet~multiple 1235

  elseif ($planet~portmaxinit >= 1243)
    setvar $planet~mcic "-44"
    setvar $planet~multiple 1229

  elseif ($planet~portmaxinit >= 1236)
    setvar $planet~mcic "-43"
    setvar $planet~multiple 1224

  elseif ($planet~portmaxinit >= 1229)
    setvar $planet~mcic "-42"
    setvar $planet~multiple 1218

  elseif ($planet~portmaxinit >= 1221)
    setvar $planet~mcic "-41"
    setvar $planet~multiple 1213

  elseif ($planet~portmaxinit >= 1214)
    setvar $planet~mcic "-40"
    setvar $planet~multiple 1208

  elseif ($planet~portmaxinit >= 1206)
    setvar $planet~mcic "-39"
    setvar $planet~multiple 1201

  elseif ($planet~portmaxinit >= 1199)
    setvar $planet~mcic "-38"
    setvar $planet~multiple 1196

  elseif ($planet~portmaxinit >= 1192)
    setvar $planet~mcic "-37"
    setvar $planet~multiple 1190

  elseif ($planet~portmaxinit >= 1184)
    setvar $planet~mcic "-36"
    setvar $planet~multiple 1185

  elseif ($planet~portmaxinit >= 1177)
    setvar $planet~mcic "-35"
    setvar $planet~multiple 1180

  elseif ($planet~portmaxinit >= 1169)
    setvar $planet~mcic "-34"
    setvar $planet~multiple 1174

  elseif ($planet~portmaxinit >= 1162)
    setvar $planet~mcic "-33"
    setvar $planet~multiple 1169

  elseif ($planet~portmaxinit >= 1154)
    setvar $planet~mcic "-32"
    setvar $planet~multiple 1164

  elseif ($planet~portmaxinit >= 1147)
    setvar $planet~mcic "-31"
    setvar $planet~multiple 1158

  elseif ($planet~portmaxinit >= 1139)
    setvar $planet~mcic "-30"
    setvar $planet~multiple 1152

  elseif ($planet~portmaxinit >= 1132)
    setvar $planet~mcic "-29"
    setvar $planet~multiple 1149

  elseif ($planet~portmaxinit >= 1124)
    setvar $planet~mcic "-28"
    setvar $planet~multiple 1144

  elseif ($planet~portmaxinit >= 1116)
    setvar $planet~mcic "-27"
    setvar $planet~multiple 1136

  elseif ($planet~portmaxinit >= 1109)
    setvar $planet~mcic "-26"
    setvar $planet~multiple 1132

  elseif ($planet~portmaxinit >= 1101)
    setvar $planet~mcic "-25"
    setvar $planet~multiple 1126

  elseif ($planet~portmaxinit >= 1093)
    setvar $planet~mcic "-24"
    setvar $planet~multiple 1122

  elseif ($planet~portmaxinit >= 1086)
    setvar $planet~mcic "-23"
    setvar $planet~multiple 1117

  elseif ($planet~portmaxinit >= 1078)
    setvar $planet~mcic "-22"
    setvar $planet~multiple 1110

  elseif ($planet~portmaxinit >= 1071)
    setvar $planet~mcic "-21"
    setvar $planet~multiple 1105

  elseif ($planet~portmaxinit >= 1063)
    setvar $planet~mcic "-20"
    setvar $planet~multiple 1102

  else
    setvar $planet~mcic 0
    setvar $planet~multiple 1102
  end
end



setvar $planet~counter $planet~offer
divide $planet~counter 10
multiply $planet~counter $planet~multiple
divide $planet~counter 100
send "az"&$planet~counter&"*"
setvar $planet~midhaggles 0
:planet~sellofferloop
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
:planet~sellscrewup
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


multiply $planet~counter 98
divide $planet~counter 100
send "az"&$planet~counter&"*"
goto :SELLOFFERLOOP
:planet~sellprice
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
add $planet~midhaggles 1
setvar $planet~old_offer $planet~offer
setvar $planet~old_counter $planet~counter
getword CURRENTLINE $planet~offer 5
striptext $planet~offer ","


setvar $planet~offer_change $planet~offer
subtract $planet~offer_change $planet~old_offer
if ($planet~mcic > "-35")
  multiply $planet~offer_change 75
  divide $planet~offer_change 100
  subtract $planet~counter $planet~offer_change
  subtract $planet~counter 25
elseif ($planet~mcic > "-55")
  multiply $planet~offer_change 65
  divide $planet~offer_change 100
  subtract $planet~counter $planet~offer_change
  subtract $planet~counter 25
else
  multiply $planet~offer_change 60
  divide $planet~offer_change 100
  subtract $planet~counter $planet~offer_change
  subtract $planet~counter 10
end
send "az"&$planet~counter&"*"
goto :SELLOFFERLOOP
:planet~sellfinaloffer
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




if (($planet~prodtosell = "ore") and (($planet~mcic <= "-75") and (($planet~portbuying >= 25000) and (($planet~midhaggles < 1) and ($planet~ore_sell_failures < 2)))))
  setvar $planet~forcefail 1
  setvar $planet~thisorefailed 1
elseif (($planet~prodtosell = "org") and ((($planet~mcic <= "-60") and ((($planet~portbuying >= 25000) and ((($planet~midhaggles < 2) and (($planet~thisorefailed = 1) or ($planet~org_sell_failures < 4)))))))))
  setvar $planet~forcefail 1
  setvar $planet~thisorgfailed 1
elseif (($planet~prodtosell = "org") and ((($planet~mcic <= "-60") and ((($planet~portbuying >= 15000) and ((($planet~midhaggles < 1) and (($planet~thisorefailed = 1) or ($planet~org_sell_failures < 2)))))))))
  setvar $planet~forcefail 1
  setvar $planet~thisorgfailed 1
elseif (($planet~prodtosell = "equ") and ((($planet~mcic <= "-55") and ((($planet~portbuying >= 20000) and ((($planet~midhaggles < 2) and (($planet~thisorefailed = 1) or ($planet~thisorgfailed = 1) or ($planet~equ_sell_failures < 4)))))))))
  setvar $planet~forcefail 1
  setvar $planet~thisequfailed 1
elseif (($planet~prodtosell = "equ") and ((($planet~mcic <= "-55") and ((($planet~portbuying >= 12000) and ((($planet~midhaggles < 1) and (($planet~thisorefailed = 1) or ($planet~thisorgfailed = 1) or ($planet~equ_sell_failures < 2)))))))))
  setvar $planet~forcefail 1
  setvar $planet~thisequfailed 1
else
  setvar $planet~forcefail 0
end
if ($planet~prodtosell = "ore")
  setsectorparameter $player~current_sector "OREMCIC" $planet~mcic
elseif ($planet~prodtosell = "org")
  setsectorparameter $player~current_sector "ORGMCIC" $planet~mcic
elseif ($planet~prodtosell = "equ")
  setsectorparameter $player~current_sector "EQUMCIC" $planet~mcic
end

if ($planet~forcefail = 0)
  setvar $planet~old_offer $planet~offer
  setvar $planet~old_counter $planet~counter
  getword CURRENTLINE $planet~offer 5
  striptext $planet~offer ","
  setvar $planet~offer_change $planet~offer
  subtract $planet~offer_change $planet~old_offer
  if ($planet~prodtosell = "ore")
    multiply $planet~offer_change 30
  elseif ($planet~prodtosell = "org")
    multiply $planet~offer_change 27
  elseif ($planet~prodtosell = "equ")
    multiply $planet~offer_change 25
  end
  divide $planet~offer_change 10
  subtract $planet~counter $planet~offer_change
  subtract $planet~counter 10
  send "az"&$planet~counter&"*"
else

  send "az"&$planet~counter&"*"
end
goto :SELLOFFERLOOP
:planet~sellnotinterested
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
:planet~sellexperience
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

getword CURRENTLINE $planet~exp_bonus 7
add $planet~experience $planet~exp_bonus
goto :SELLOFFERLOOP
:planet~sellyouhave
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
setvar $planet~oldcredits $player~credits
getword CURRENTLINE $planet~credits 3
striptext $planet~credits ","

if ($planet~oldcredits = $planet~credits)
  setvar $planet~currenthaggle "failed"
  goto :SELLHAGGLEFAILED
else
  setvar $planet~currenthaggle "succeeded"
  goto :SELLHAGGLESUCCEEDED
end
:planet~sellhagglefailed
if ($planet~prodtosell = "ore")
  add $planet~ore_sell_failures 1
elseif ($planet~prodtosell = "org")
  add $planet~org_sell_failures 1
elseif ($planet~prodtosell = "equ")
  add $planet~equ_sell_failures 1
end
if ($planet~selldelay > 99)
  setdelaytrigger SELLDELAY :SELLDELAY $planet~selldelay
  pause
  :planet~selldelay
end
return
:planet~sellhagglesucceeded

setvar $planet~perunit $planet~counter
divide $planet~perunit $planet~portbuying


setvar $planet~selloutput ""
setvar $planet~selloutput $planet~selloutput&$planet~portbuying&" "&$planet~prodtosell&" for "&$planet~counter&" cr"
setvar $planet~selloutput $planet~selloutput&" - "
if ($planet~prodtosell = "ore")
  setvar $planet~selloutput $planet~selloutput&$planet~ore_sell_failures
elseif ($planet~prodtosell = "org")
  setvar $planet~selloutput $planet~selloutput&$planet~org_sell_failures
elseif ($planet~prodtosell = "equ")
  setvar $planet~selloutput $planet~selloutput&$planet~equ_sell_failures
end
setvar $planet~selloutput $planet~selloutput&" fails"
setvar $planet~selloutput $planet~selloutput&" - "&$planet~perunit&"/unit"


setvar $planet~selloutput $planet~selloutput&" - MCIC "&$planet~mcic
if ($planet~prodtosell = "ore")
  setvar $planet~selloutput $planet~selloutput&"/-90*"
  setvar $planet~oreselloutput $planet~selloutput
  setvar $planet~oreprofit $planet~counter
elseif ($planet~prodtosell = "org")
  setvar $planet~selloutput $planet~selloutput&"/-75*"
  setvar $planet~orgselloutput $planet~selloutput
  setvar $planet~orgprofit $planet~counter
elseif ($planet~prodtosell = "equ")
  setvar $planet~selloutput $planet~selloutput&"/-65*"
  setvar $planet~equselloutput $planet~selloutput
  setvar $planet~equprofit $planet~counter
end

if ($planet~selldelay > 99)
  setdelaytrigger SELLDELAY :SELLDELAY2 $planet~selldelay
  pause
  pause
  :planet~selldelay2
end
return
:planet~negotiateland

if ($planet~startinglocation = "Citadel")
  send "L "&$planet~planet&"* "
  gosub :GETPLANETINFO
  send "c "
elseif ($planet~startinglocation = "Planet")
  send "L "&$planet~planet&"* "
  gosub :GETPLANETINFO
end
return
:planet~exitneg

return
:planet~readplanetlist

read $planet~planet_file $planet~planetinf $planet~planetcounter
if ($planet~planetinf <> "EOF")
  gosub :PROCESS_PLANET_LINE
  setvar $planet~planetlist[$planet~planetcounter] $planet~planetname
  setvar $planet~planetlist[$planet~planetcounter][1] $planet~planet_fuel_colonists_max
  setvar $planet~planetlist[$planet~planetcounter][2] $planet~planet_org_colonists_max
  setvar $planet~planetlist[$planet~planetcounter][3] $planet~planet_equip_colonists_max
  setvar $planet~planetlist[$planet~planetcounter][4] $planet~planet_is_keeper
  add $planet~planetcounter 1
  goto :READPLANETLIST
end
setvar $planet~planetstats TRUE
return
