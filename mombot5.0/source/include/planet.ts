#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:planet~countplanets
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
setvar $planet~planetcount 0
killtrigger planetgrabber
killtrigger bedone
send "/"
waiton "Creds"
settextlinetrigger planetgrabber :planetline "   <"
settextlinetrigger bedone :countdone "Land on which planet "
send "|lq*|"
pause

:planet~planetline
killtrigger getend
killtrigger getline2
killtrigger planetgrabber
killtrigger bedone
getwordpos currentline $planet~pos "<<<< SHIELDED"
if ($planet~pos <= 0)
	setvar $planet~line currentline
	replacetext $planet~line "<" " "
	replacetext $planet~line ">" " "
	striptext $planet~line ","
	add $planet~planetcount 1
	getword $planet~line $planet~planets[$planet~planetcount] 1
end
settextlinetrigger getline2 :planetline "   <"
settextlinetrigger getend :countdone "Land on which planet "
pause

:planet~countdone
killtrigger getend
killtrigger getline2
killtrigger planetgrabber
killtrigger bedone
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:planet~planetcheck
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
setvar $planet~planetcheck_i 1
setvar $planet~planetcheck_ignorecount 0

:planet~planetcheck_loadignore
getword $planet~planetcheck_ignorelist $planet~planetcheck_ignore[$planet~planetcheck_i] $planet~planetcheck_i
if ($planet~planetcheck_ignore[$planet~planetcheck_i] <> 0)
	add $planet~planetcheck_i 1
	add $planet~planetcheck_ignorecount 1
	goto :planet~planetcheck_loadignore
end

setvar $planet~planetcheck_ignorelist ""
setvar $planet~planetcheck_found 0
send "l"

settextlinetrigger planetcheck_noplanet :planet~planetcheck_noplanet "There isn't a planet in this sector."
settextlinetrigger planetcheck_multipleplanets :planet~planetcheck_multipleplanets "Registry# and Planet Name"
settextlinetrigger planetcheck_singleplanet :planet~planetcheck_singleplanet "Landing sequence engaged..."
pause

:planet~planetcheck_noplanet
killtrigger planetcheck_multipleplanets
killtrigger planetcheck_singleplanet
return

:planet~planetcheck_multipleplanets
killtrigger planetcheck_singleplanet
killtrigger planetcheck_noplanet
setvar $planet~planetcheck_lastid 0

:planet~planetcheck_nextplanet
settexttrigger planetcheck_planetschecked :planet~planetcheck_planetschecked "Land on which planet <Q to abort>"
settextlinetrigger planetcheck_getid :planet~planetcheck_getid "<"
pause

:planet~planetcheck_getid
getword currentline $planet~planetcheck_word 1
if ($planet~planetcheck_word = "Owned")
	settextlinetrigger planetcheck_getid :planet~planetcheck_getid "<"
	pause
end

killtrigger planetcheck_planetschecked
setvar $planet~planetcheck_line currentline
striptext $planet~planetcheck_line "<"
striptext $planet~planetcheck_line ">"
getword $planet~planetcheck_line $planet~planetcheck_id 1
if ($planet~planetcheck_id = "Land")
	goto :planet~planetcheck_planetschecked
end

gosub :planet~planetcheck_sub_checkignore

if (($planet~planetcheck_id > $planet~planetcheck_lastid) and ($planet~planetcheck_ignore = 0))
	send $planet~planetcheck_id "*"
	setvar $planet~planetcheck_lastid $planet~planetcheck_id
	gosub :planet~planetcheck_sub_check

	if ($planet~planetcheck_found <> 0)
		return
	end

	send "ql"
	waitfor "Registry# and Planet Name"
end
goto :planet~planetcheck_nextplanet

:planet~planetcheck_planetschecked
killtrigger planetcheck_getid
send "q*"
return

:planet~planetcheck_singleplanet
killtrigger planetcheck_multipleplanets
killtrigger planetcheck_noplanet
gosub :planet~planetcheck_sub_check
if ($planet~planetcheck_found = 0)
	send "q"
end
return

:planet~planetcheck_sub_check
settextlinetrigger planetcheck_check_getplanet :planet~planetcheck_check_getplanet "Planet #"
pause

:planet~planetcheck_check_getplanet
getword currentline $planet~planetcheck_check_planet 2
striptext $planet~planetcheck_check_planet "#"

setvar $planet~planetcheck_id $planet~planetcheck_check_planet
gosub :planet~planetcheck_sub_checkignore

if ($planet~planetcheck_ignore = 0)
	gosub $planet~planetchecksub

	if ($planet~planetcheck_found = 1)
		setvar $planet~planetcheck_found $planet~planetcheck_check_planet
	end
end

return

:planet~planetcheck_sub_checkignore
setvar $planet~planetcheck_j 1
setvar $planet~planetcheck_ignore 0

:planet~planetcheck_checkignore_loop
if ($planet~planetcheck_j <= $planet~planetcheck_ignorecount)
	if ($planet~planetcheck_ignore[$planet~planetcheck_j] = $planet~planetcheck_id)
		setvar $planet~planetcheck_ignore 1
	else
		add $planet~planetcheck_j 1
		goto :planet~planetcheck_checkignore_loop
	end
end

return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:planet~getplanetinfo
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
setvar $planet~noheader 0

:planet~planetinfo
setvar $planet~planet 0
setvar $planet~current_sector 0
setvar $planet~planet_fuel 0
setvar $planet~planet_fuel_max 0
setvar $planet~planet_organics 0
setvar $planet~planet_organics_max 0
setvar $planet~planet_equipment 0
setvar $planet~planet_equipment_max 0
setvar $planet~planet_fighters 0
setvar $planet~planet_fighters_rate 0
setvar $planet~planet_fighters_prod 0
setvar $planet~planet_transport 0
setvar $planet~planet_fighters_max 0
setvar $planet~citadel 0
setvar $planet~citadel_credits 0
setvar $planet~atmosphere_cannon 0
setvar $planet~sector_cannon 0
setvar $planet~buildtime 0
setvar $planet~militaryreaction 0
setvar $planet~creator ""
setvar $planet~owner ""
setvar $planet~planet_class_name "undefined"
setvar $planet~planet_name "undefined"
setvar $planet~under_construction false
setvar $planet~maxed_level false
setvar $planet~colo[1] 0
setvar $planet~colo[2] 0
setvar $planet~colo[3] 0
setvar $planet~rate[1] 0
setvar $planet~rate[2] 0
setvar $planet~rate[3] 0
setvar $planet~rate[4] 0
setvar $planet~prod[1] 0
setvar $planet~prod[2] 0
setvar $planet~prod[3] 0
setvar $planet~prod[4] 0
setvar $planet~amount[1] 0
setvar $planet~amount[2] 0
setvar $planet~amount[3] 0
setvar $planet~amount[4] 0
setvar $planet~max[1] 0
setvar $planet~max[2] 0
setvar $planet~max[3] 0
setvar $planet~max[4] 0

if ($planet~noheader = 0)
	send "*"
	killtrigger planetinfo2
	settextlinetrigger planetinfo2 :planetinfo2 "Planet #"
	pause
end

goto :planetinfostart

:planet~planetinfo2
setvar $planet~citadel 0
setvar $planet~sector_cannon 0
setvar $planet~atmosphere_cannon 0
setvar $planet~citadel_credits 0
getword currentline $planet~planet 2
striptext $planet~planet "#"
isnumber $planet~tst $planet~planet
if ($planet~tst <> true)
	settextlinetrigger planetinfo2 :planetinfo2 "Planet #"
	pause
end
getword currentline $player~current_sector 5
striptext $player~current_sector ":"
getwordpos currentline $planet~pos ": "
cuttext currentline $planet~planet_name ($planet~pos + 2) 999
savevar $planet~planet
savevar $player~current_sector
setsectorparameter $planet~planet "PSECTOR" $player~current_sector

:planetinfostart
setvar $planet~current_sector $player~current_sector
settextlinetrigger class :getclass "Class "
settextlinetrigger creator :creator "Created by: "
settextlinetrigger owner :owner "Claimed by: "
pause

:planet~getclass
getword currentline $planet~code 2
striptext $planet~code ","
getlength $planet~code $len
cuttext currentline $planet~planet_class_name ($len + 9) 999
setvar $planet~class_name $planet~planet_class_name
pause

:planet~creator
getword currentline $test 3
if ($test = 0)
	setvar $planet~creator ""
else
	cuttext currentline $planet~creator 13 999
end
pause

:planet~owner
getword currentline $planet~owner 3
if ($planet~owner = 0)
	setvar $planet~owner ""
else
	cuttext currentline $planet~owner 13 999
end

waitfor "2 Build 1   Product    Amount     Amount     Maximum"
gosub :killplanettriggers

:planet~getplanetstuff
settextlinetrigger fuelstart :fuelstart "Fuel Ore"
settextlinetrigger orgstart :orgstart "Organics"
settextlinetrigger equipstart :equipstart "Equipment"
settextlinetrigger figstart :figstart "Fighters        N/A"
settextlinetrigger tport :planettport "-=-=-=-=-=- TransPort power ="
settextlinetrigger shields :planetshields "Planetary Defense Shielding Power Level ="
settextlinetrigger citadelstart :citadelstart "Planet has a level"
settextlinetrigger cannon :cannonstart ", AtmosLvl="
settexttrigger maxedig :maxedig "Planetary Interdictor Generator ="
settexttrigger underconst :underconst "under construction,"
settexttrigger planetinfodone :planetinfodone "Planet command (?=help)"
pause

:planet~underconst
setvar $planet~under_construction true
getwordpos currentline $pos " under construction, "
cuttext currentline $line $pos 999
getword $line $planet~buildtime 3
pause

:planet~maxedig
setvar $planet~maxed_level true
pause

:planet~planettport
gettext currentline $planet~planet_tpad "power =" "hops -"
striptext $planet~planet_tpad ","
striptext $planet~planet_tpad " "
isnumber $planet~tst $planet~planet_tpad
if ($planet~tst = 0)
	setvar $planet~planet_tpad 0
end
setvar $planet~planet_transport $planet~planet_tpad
pause

:planet~planetshields
getword currentline $planet~planet_shields 8
striptext $planet~planet_shields ","
isnumber $planet~tst $planet~planet_shields
if ($planet~tst = 0)
	setvar $planet~planet_shields 0
end
pause

:planet~fuelstart
getword currentline $planet~planet_fuel_colonists 3
getword currentline $planet~planet_fuel_rate 4
getword currentline $planet~planet_fuel_prod 5
getword currentline $planet~planet_fuel 6
getword currentline $player~ore_holds 7
getword currentline $planet~planet_fuel_max 8
getword currentline $planet~planetfuel 6
getword currentline $planet~planetfuelmax 8
striptext $planet~planetfuel ","
striptext $planet~planetfuelmax ","
striptext $planet~planet_fuel ","
striptext $planet~planet_fuel_max ","
striptext $planet~planet_fuel_colonists ","
striptext $planet~planet_fuel_prod ","
striptext $planet~planet_fuel_rate ","
pause

:planet~orgstart
getword currentline $planet~planet_organics_colonists 2
getword currentline $planet~planet_organics_rate 3
getword currentline $planet~planet_organics_prod 4
getword currentline $planet~planet_organics 5
getword currentline $player~organic_holds 6
getword currentline $planet~planet_organics_max 7
getword currentline $planet~planetorg 5
getword currentline $planet~planetorgmax 7
striptext $planet~planetorg ","
striptext $planet~planetorgmax ","
striptext $planet~planet_organics ","
striptext $planet~planet_organics_max ","
striptext $planet~planet_organics_colonists ","
striptext $planet~planet_organics_prod ","
striptext $planet~planet_organics_rate ","
pause

:planet~equipstart
getword currentline $planet~planet_equipment_colonists 2
getword currentline $planet~planet_equipment_rate 3
getword currentline $planet~planet_equipment_prod 4
getword currentline $planet~planet_equipment 5
getword currentline $player~equipment_holds 6
getword currentline $planet~planet_equipment_max 7
getword currentline $planet~planetequip 5
getword currentline $planet~planetequipmax 7
striptext $planet~planetequip ","
striptext $planet~planetequipmax ","
striptext $planet~planet_equipment ","
striptext $planet~planet_equipment_max ","
striptext $planet~planet_equipment_colonists ","
striptext $planet~planet_equipment_prod ","
striptext $planet~planet_equipment_rate ","
pause

:planet~figstart
getword currentline $planet~planet_fighters_rate 3
getword currentline $planet~planet_fighters_prod 4
getword currentline $planet~planet_fighters 5
getword currentline $planet~planet_fighters_max 7
striptext $planet~planet_fighters_rate ","
striptext $planet~planet_fighters_prod ","
striptext $planet~planet_fighters ","
striptext $planet~planet_fighters_max ","
pause

:planet~citadelstart
getword currentline $planet~citadel 5
getword currentline $planet~citadel_credits 9
striptext $planet~citadel_credits ","
pause

:planet~cannonstart
getword currentline $planet~militaryreaction 2
getword currentline $planet~atmosphere_cannon 5
getword currentline $planet~sector_cannon 6
striptext $planet~militaryreaction "reaction="
striptext $planet~militaryreaction "%"
striptext $planet~sector_cannon "SectLvl="
striptext $planet~sector_cannon "%"
striptext $planet~atmosphere_cannon "AtmosLvl="
striptext $planet~atmosphere_cannon "%"
striptext $planet~atmosphere_cannon ","
pause

:planet~planetinfodone
gosub :killplanettriggers
setvar $planet~colo[1] $planet~planet_fuel_colonists
setvar $planet~colo[2] $planet~planet_organics_colonists
setvar $planet~colo[3] $planet~planet_equipment_colonists
setvar $planet~rate[1] $planet~planet_fuel_rate
setvar $planet~rate[2] $planet~planet_organics_rate
setvar $planet~rate[3] $planet~planet_equipment_rate
setvar $planet~rate[4] $planet~planet_fighters_rate
setvar $planet~prod[1] $planet~planet_fuel_prod
setvar $planet~prod[2] $planet~planet_organics_prod
setvar $planet~prod[3] $planet~planet_equipment_prod
setvar $planet~prod[4] $planet~planet_fighters_prod
setvar $planet~amount[1] $planet~planet_fuel
setvar $planet~amount[2] $planet~planet_organics
setvar $planet~amount[3] $planet~planet_equipment
setvar $planet~amount[4] $planet~planet_fighters
setvar $planet~max[1] $planet~planet_fuel_max
setvar $planet~max[2] $planet~planet_organics_max
setvar $planet~max[3] $planet~planet_equipment_max
setvar $planet~max[4] $planet~planet_fighters_max
setvar $planet~noheader 0
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

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:planet~killplanettriggers
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
killtrigger fuelstart
killtrigger orgstart
killtrigger equipstart
killtrigger figstart
killtrigger tport
killtrigger shields
killtrigger citadelstart
killtrigger cannon
killtrigger citexists
killtrigger maxedig
killtrigger underconst
killtrigger planetinfodone
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:planet~getplanetnumber
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
send "*"
settextlinetrigger planetinfo3 :getjustthenumber "Planet #"
pause

:planet~getjustthenumber
send "  "
getword currentline $planet~planet 2
striptext $planet~planet "#"
getword currentline $player~current_sector 5
striptext $player~current_sector ":"
savevar $planet~planet
savevar $player~current_sector
setsectorparameter $planet~planet "PSECTOR" $player~current_sector
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:planet~getplanetstats
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
send "cn"
waiton "(2) Animation display"
getword currentline $planet~ansi_onoff 5
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
settextlinetrigger grab_planet :planet~shp_planetnames "> "
pause

:planet~shp_planetnames
if (currentline = "")
	goto :planet~shp_loop
end
getword currentline $planet~stopper 1
if ($planet~stopper = "<+>")
	send "+"
	waiton "(?=List) ?"
	setvar $planet~nextpage 1
	goto :planet~shp_loop
elseif ($planet~stopper = "<Q>")
	goto :planet~shp_getplanetstats
end
if ($planet~nextpage = 1)
	setvar $planet~planetname currentline
	striptext $planet~planetname "<A> "
	if ($planet~planetname = $planet~firstplanetname)
		goto :planet~shp_getplanetstats
	end
	setvar $planet~nextpage 0
end
add $planet~totalplanets 1
if ($planet~totalplanets = 1)
	setvar $planet~firstplanetname currentline
	striptext $planet~firstplanetname "<A> "
end
goto :planet~shp_loop

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
	settextlinetrigger sn :planet~sn "Planet Category #"
	pause

	:planet~sn
	setvar $planet~line currentline
	getwordpos $planet~line $planet~pos "Class"

	cuttext $planet~line $planet~planet_name $planet~pos 999
	setvar $planet~planet_fuel_colonists_min 50000
	setvar $planet~planet_fuel_colonists_max 50000
	setvar $planet~planet_org_colonists_min 50000
	setvar $planet~planet_org_colonists_max 50000
	setvar $planet~planet_equip_colonists_min 50000
	setvar $planet~planet_equip_colonists_max 50000
	gosub :planet~readplanettypestats
	write $planet~planet_file $planet~planet_fuel_colonists_min&" "&$planet~planet_fuel_colonists_max&" "&$planet~planet_org_colonists_min&" "&$planet~planet_org_colonists_max&" "&$planet~planet_equip_colonists_min&" "&$planet~planet_equip_colonists_max&" 0  "&$planet~planet_name
end
send "qq"
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:planet~readplanettypestats
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:planet~readplanettypestats_wait
settextlinetrigger planetstat_cols :planet~readplanettypestats_cols "Cols -"
settexttrigger planetstat_done :planet~readplanettypestats_done "Which planet type are you interested in (?=List)"
pause

:planet~readplanettypestats_cols
killalltriggers
setvar $planet~stat_line currentline
gosub :planet~getplanettypecols
if ($planet~parsed_cols > 0)
	getwordpos $planet~stat_line $planet~pos "Ore"
	if ($planet~pos > 0)
		setvar $planet~planet_fuel_colonists_min $planet~parsed_cols
		setvar $planet~planet_fuel_colonists_max $planet~parsed_cols
	end
	getwordpos $planet~stat_line $planet~pos "Org"
	if ($planet~pos > 0)
		setvar $planet~planet_org_colonists_min $planet~parsed_cols
		setvar $planet~planet_org_colonists_max $planet~parsed_cols
	end
	getwordpos $planet~stat_line $planet~pos "Eq"
	if ($planet~pos > 0)
		setvar $planet~planet_equip_colonists_min $planet~parsed_cols
		setvar $planet~planet_equip_colonists_max $planet~parsed_cols
	end
end
goto :planet~readplanettypestats_wait

:planet~readplanettypestats_done
killalltriggers
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:planet~getplanettypecols
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
setvar $planet~parsed_cols 0
gettext $planet~stat_line $planet~parsed_cols "Cols -" "/"
striptext $planet~parsed_cols " "
striptext $planet~parsed_cols ","
isnumber $planet~isnumber $planet~parsed_cols
if ($planet~isnumber <> true)
	setvar $planet~parsed_cols 0
end
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:planet~landingsub
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
gosub :killlandingtriggers
send "lz" #8 $planet~planet "*"
setvar $planet~sucessfulcitadel false
setvar $planet~sucessfulplanet false
settextlinetrigger noplanet :noplanet "There isn't a planet in this sector."
settextlinetrigger no_land :no_land "since it couldn't possibly stand"
settextlinetrigger planet :planet "Planet #"
settextlinetrigger wrongone :wrong_num "That planet is not in this sector."
settextlinetrigger noplanetscanner :displayplanet "<Destroy Planet>"
pause

:planet~noplanet
gosub :killlandingtriggers
setvar $switchboard~message "No Planet in Sector!*"
gosub :switchboard~switchboard
return

:planet~no_land
gosub :killlandingtriggers
setvar $switchboard~message "This ship cannot land!*"
gosub :switchboard~switchboard
return

:planet~displayplanet
send "*"
waiton "Planet #"

:planet~planet
getword currentline $planet~pnum_ck 2
striptext $planet~pnum_ck "#"
gosub :killlandingtriggers
if ($planet~pnum_ck <> $planet~planet)
	send "q"
	goto :wrong_num
end
settexttrigger wrong_num :wrong_num "That planet is not in this sector."
settexttrigger planet :planet_prompt "Planet command"
pause

:planet~wrong_num
killtrigger planet
send "**"
setvar $switchboard~message "Incorrect Planet Number*"
gosub :switchboard~switchboard
return

:planet~planet_prompt
killtrigger wrong_num
setvar $planet~currentbotplanet $planet~planet
savevar $planet~currentbotplanet
savevar $planet~planet
setvar $planet~sucessfulplanet true
if ($planet~land_and_lift = true)
	send "m* * * q  "
	return
end
send "m* * * c*"
settexttrigger build_cit :build_cit "Do you wish to construct one?"
settexttrigger in_cit :in_cit "Citadel command"
settexttrigger nocitallowed :build_cit "Citadels are not allowed in FedSpace."
settexttrigger citnotbuiltyet :build_cit "Be patient, your Citadel is not yet finished."
pause

:planet~build_cit
gosub :killlandingtriggers
setvar $planet~sucessfulplanet true
setvar $planet~startinglocation "Planet"
return

:planet~in_cit
gosub :killlandingtriggers
setvar $planet~sucessfulcitadel true
setvar $planet~startinglocation "Citadel"
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:planet~pwarp
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
setvar $planet~do_scan false
setvar $planet~pwarpsuccess false
setvar $planet~msg ""
if ($planet~pwarp_scan = true)
	setvar $planet~do_scan true
end
setvar $planet~pwarp_scan false
send "q *"
waiton "Planet #"
getword currentline $planet~planet 2
striptext $planet~planet "#"
savevar $planet~planet

send "c p" $planet~warpto "*"

settextlinetrigger pwarp_lock       :pwarp_lock     "Locating beam pinpointed"
settextlinetrigger no_pwarp_lock    :no_pwarp_lock  "Your own fighters must be"
settextlinetrigger already      :already    "You are already in that sector!"
settextlinetrigger no_ore       :no_ore     "You do not have enough Fuel Ore"
settextlinetrigger no_pwarp     :nopwarp    "This Citadel does not have a Planetary TransWarp"
settextlinetrigger wrong_number     :wrong_number   "Invalid Sector number,"
pause

:wrong_number
killalltriggers
setvar $planet~msg "Not a valid sector to pwarp to!"
setvar $switchboard~message "Not a valid sector to pwarp to!*"
gosub :switchboard~switchboard
return

:nopwarp
killalltriggers
setvar $planet~msg "Planet Does Not Have A Planetary TransWarp Drive!"
setvar $switchboard~message "Planet Does Not Have A Planetary TransWarp Drive!*"
gosub :switchboard~switchboard
return

:no_pwarp_lock
killalltriggers
setvar $planet~target $planet~warpto
setvar $player~target $planet~target
setvar $planet~msg "No fighter down at that location!"
gosub :player~removefigfromdata
setvar $switchboard~message "No fighter down at that location!*"
gosub :switchboard~switchboard
return

:no_ore
killalltriggers
setvar $planet~msg "Not enough fuel for that pwarp."
setvar $switchboard~message "Not enough fuel for that pwarp.*"
gosub :switchboard~switchboard
return

:pwarp_lock
killalltriggers
send "y"
waiton "Planet is now in sector"
setvar $planet~pwarpsuccess true
setvar $planet~msg "Planet #"&$planet~planet&" moved to sector "&$planet~warpto&"."
setvar $switchboard~message $planet~msg&"*"
gosub :switchboard~switchboard
setvar $planet~target $planet~warpto
setvar $player~target $planet~target
loadvar $planet~planet
isnumber $test $planet~planet
if ($test)
	if (($planet~planet <> ".") and ($planet~planet > 0))
		setsectorparameter $planet~planet "PSECTOR" $planet~target
	end
end
#gosub :player~addfigtodata
if ($planet~do_scan = true)
	send "s"
	waiton "Warps to Sector(s) :"
	send "* "
end
return

:already
killalltriggers
setvar $planet~pwarpsuccess true
setvar $planet~msg "Planet already in that sector!."
setvar $switchboard~message "Planet already in that sector!.*"
gosub :switchboard~switchboard
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:planet~killlandingtriggers
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
killtrigger noplanet
killtrigger no_land
killtrigger planet
killtrigger wrongone
killtrigger in_cit
killtrigger nocitallowed
killtrigger build_cit
killtrigger citnotbuiltyet
killtrigger noplanetscanner
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:planet~landonplanetentercitadel
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
send "l "&$planet~planet&"*tnl1*tnl2*tnl3*snl1*snl2*snl3*c "
waiton "Fuel Ore"
getword currentline $planet~planetfuel 6
striptext $planet~planetfuel ","
getword currentline $planet~planet_fuel 6
striptext $planet~planet_fuel ","
send "/"
waiton "Creds"
getword currentline $player~credits 4
striptext $player~credits "³Figs"
striptext $player~credits ","
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:planet~loadplanetinfo
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
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
	setvar $planet~planetstats true
else
	echo "*No Planet File Found!*"
end
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:planet~loadplanetprods
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
setvar $planet~planetcounter 0
setvar $planet~planetstats false
loadvar $planet~planet_prods_file
fileexists $exists $planet~planet_prods_file
if ($exists)
	readtoarray $planet~planet_prods_file $planet~planet_prods_array
	setvar $planet~planet_prods_capacity $planet~planet_prods_array
	add $planet~planet_prods_capacity 100
	if ($planet~planet_prods_capacity < 100)
		setvar $planet~planet_prods_capacity 100
	end
	setarray $planet~planetprods $planet~planet_prods_capacity 3
	setvar $i 1
	while ($i <= $planet~planet_prods_array)
		setvar $planetinf $planet~planet_prods_array[$i]
		getword $planetinf $planet_starting_ore 1
		getlength $planet_starting_ore $len1
		getword $planetinf $planet_starting_org 2
		getlength $planet_starting_org $len2
		getword $planetinf $planet_starting_equ 3
		getlength $planet_starting_equ $len3
		setvar $len ($len1 + $len2 + $len3 + 3)
		getlength $planetinf $pname_len
		if ($len < $pname_len)
			cuttext $planetinf $pname ($len + 1) 999
			trim $pname
			if ($pname <> "0") and ($pname <> "")
				add $planet~planetcounter 1
				setvar $planet~planetprods[$planet~planetcounter] $pname
				setvar $planet~planetprods[$planet~planetcounter][1] $planet_starting_ore
				setvar $planet~planetprods[$planet~planetcounter][2] $planet_starting_org
				setvar $planet~planetprods[$planet~planetcounter][3] $planet_starting_equ
			end
		else
			echo "*"&$planetinf&" error during processing planets.*"
		end
		add $i 1
	end
else
	setarray $planet~planetprods 100 3
end
setvar $i $planet~planetcounter
add $i 1
setvar $planet~planetprods[$i] "0"
setvar $planet~planetstats true
return

include "source\include\player"
