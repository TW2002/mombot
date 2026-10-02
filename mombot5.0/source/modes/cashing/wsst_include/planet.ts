:planet~countplanets













killalltriggers
setvar $planet~planetcount 0

gosub :player~msgs_off
send "lq*"
waiton "Registry"
settextlinetrigger PLANETGRABBER :PLANETLINE "   <"
settextlinetrigger BEDONE :COUNTDONE "Land on which planet "
pause
:planet~planetline

killalltriggers
getwordpos CURRENTLINE $planet~pos "<<<< SHIELDED"
if ($planet~pos > 0)
  goto :COUNTDONE
end
setvar $planet~line CURRENTLINE
replacetext $planet~line "<" " "
replacetext $planet~line ">" " "
striptext $planet~line ","
add $planet~planetcount 1
getword $planet~line $planet~planets[$planet~planetcount] 1
getwordpos $planet~line $planet~pos "Level"
if ($planet~pos > 0)
  cuttext $planet~line $planet~tmp_line $planet~pos 999
  setarray $planet~planets[$planet~planetcount] 6
  getword $planet~tmp_line $planet~planets[$planet~planetcount][1] 2
  getword $planet~tmp_line $planet~tmp 3
  striptext $planet~tmp "%"
  setvar $planet~planets[$planet~planetcount][2] $planet~tmp
  getword $planet~tmp_line $planet~tmpqcan 5
  striptext $planet~tmpqcan "%"
  setvar $planet~planets[$planet~planetcount][4] $planet~tmpqcan
  getword $planet~tmp_line $planet~tmpclass 6
  setvar $planet~planets[$planet~planetcount][5] $planet~tmpclass
  getword $planet~tmp_line $planet~tmpfig 4
  getlength $planet~tmpfig $planet~len
  cuttext $planet~tmpfig $planet~multiplier $planet~len 999
  if ($planet~multiplier <> "")
    cuttext $planet~tmpfig $planet~tmpfig2 0 ($planet~len - 1)
    if ($planet~multiplier = "M")
      setvar $planet~planets[$planet~planetcount][3] ($planet~tmpfig2 * 1000000)
    elseif ($planet~multiplier = "T")
      setvar $planet~planets[$planet~planetcount][3] ($planet~tmpfig2 * 1000)
    end
  end
end
settextlinetrigger OWNEDBY :OWNEDBY "Owned by: "
settextlinetrigger PLANETGRABBER :PLANETLINE "   <"
settextlinetrigger GETEND :COUNTDONE "Land on which planet "
pause
:planet~ownedby

killalltriggers
setvar $planet~line CURRENTLINE
gettext $planet~line $planet~owner "Owned by: " ""
getwordpos $planet~owner $planet~pos "["
if ($planet~pos > 0)
  cuttext $planet~owner $planet~corp $planet~pos 999
  striptext $planet~corp "["
  striptext $planet~corp "]"
  setvar $planet~planets[$planet~planetcount][6] "Corp "&$planet~corp
else
  setvar $planet~planets[$planet~planetcount][6] $planet~owner
end
settextlinetrigger PLANETGRABBER :PLANETLINE "   <"
settextlinetrigger GETEND :COUNTDONE "Land on which planet "
pause
:planet~countdone

killalltriggers
gosub :player~msgs_on
return
:planet~getplanets




















gosub :player~currentprompt
setvar $planet~startingprompt $player~current_prompt
if ($planet~startingprompt = "Citadel")
  send "q "
end
if (($planet~startingprompt = "Planet") or ($planet~startingprompt = "Citadel"))
  gosub :GETPLANETINFO
  setvar $planet~startingplanet $planet~planet
  send "q "
end
gosub :player~currentprompt
if ($player~current_prompt <> "Command")
  setvar $switchboard~message "Error - unknown prompt! :planet~getplanets exiting.*"
  gosub :switchboard~switchboard
  return
end

setarray $planet~planetlist 2000 13
setvar $planet~planetlistcount 0
setvar $planet~pers FALSE
send "tl"
:planet~buildplanetlist

waitfor "========="
settextlinetrigger GOTPLANET :GOTPLANET "Class"
settextlinetrigger ENDTL :ENDTL "======   ============"
settextlinetrigger ENDTL2 :ENDTL "No Planets claimed"
settextlinetrigger ENDTL3 :ENDTL "Computer command"
pause
:planet~gotplanet

setvar $planet~line CURRENTLINE
getword $planet~line $planet~sector 1
getword $planet~line $planet~pnum 2
cuttext $planet~pnum $planet~pnum_first_char 1 1
if ($planet~pnum_first_char <> "#")
  getword $planet~line $planet~pnum 3
end
striptext $planet~pnum "#"
getwordpos $planet~line $planet~pos "Class "
cuttext $planet~line $planet~tmpclass $planet~pos 999
getwordpos $planet~tmpclass $planet~pos2 "   "
cuttext $planet~tmpclass $planet~class 1 ($planet~pos2 - 1)
getwordpos $planet~tmpclass $planet~pos "Level "
if ($planet~pos > 0)
  cuttext $planet~tmpclass $planet~lvl $planet~pos 999
  getword $planet~lvl $planet~level 2
else
  setvar $planet~level 0
end
add $planet~planetlistcount 1
setvar $planet~planetlist[$planet~planetlistcount] $planet~pnum
setvar $planet~planetlist[$planet~planetlistcount][1] $planet~sector
setvar $planet~planetlist[$planet~planetlistcount][2] $planet~class
setvar $planet~planetlist[$planet~planetlistcount][3] $planet~level
settextlinetrigger GOTPLANET2 :GOTPLANET2 "  "
pause
:planet~gotplanet2
setvar $planet~line CURRENTLINE

getword $planet~line $planet~num 1
gosub :CONVERTNUM
setvar $planet~planetlist[$planet~planetlistcount][4] $planet~num

getword $planet~line $planet~num 3
gosub :CONVERTNUM
setvar $planet~planetlist[$planet~planetlistcount][5] $planet~num

getword $planet~line $planet~num 4
gosub :CONVERTNUM
setvar $planet~planetlist[$planet~planetlistcount][6] $planet~num

getword $planet~line $planet~num 5
gosub :CONVERTNUM
setvar $planet~planetlist[$planet~planetlistcount][7] $planet~num

getword $planet~line $planet~num 6
gosub :CONVERTNUM
setvar $planet~planetlist[$planet~planetlistcount][8] $planet~num

getword $planet~line $planet~num 7
gosub :CONVERTNUM
setvar $planet~planetlist[$planet~planetlistcount][9] $planet~num

getword $planet~line $planet~num 8
gosub :CONVERTNUM
setvar $planet~planetlist[$planet~planetlistcount][10] $planet~num

getword $planet~line $planet~num 9
gosub :CONVERTNUM
setvar $planet~planetlist[$planet~planetlistcount][11] $planet~num

getword $planet~line $planet~num 10
gosub :CONVERTNUM
setvar $planet~planetlist[$planet~planetlistcount][12] $planet~num
if ($planet~pers = TRUE)
  setvar $planet~planetlist[$planet~planetlistcount][13] "pers"
else
  setvar $planet~planetlist[$planet~planetlistcount][13] "corp"
end
settextlinetrigger GOTPLANET :GOTPLANET "Class"
pause
:planet~endtl

killalltriggers
if ($planet~pers = FALSE)
  setvar $planet~pers TRUE
  send "qcy"
  goto :BUILDPLANETLIST
end
setvar $planet~pers FALSE

send "q "
while (($planet~startingprompt = "Citadel") or ($planet~startingprompt = "Planet"))
  send "l "&$planet~startingplanet&"* "
end
if ($planet~startingprompt = "Citadel")
  send "c "
end
return
:planet~convertnum

if ($planet~num = 0)
  return
end
if ($planet~num = "---")
  setvar $planet~num 0
  return
end
getlength $planet~num $planet~len
cuttext $planet~num $planet~multiplier $planet~len $planet~len
if ($planet~multiplier = "M")
  cuttext $planet~num $planet~num2 1 ($planet~len - 1)
  setvar $planet~num ($planet~num2 * 1000000)
elseif ($planet~multiplier = "T")
  cuttext $planet~num $planet~num2 1 ($planet~len - 1)
  setvar $planet~num ($planet~num2 * 1000)
end
return
:planet~planetcheck



setvar $planet~planetcheck_i 1
setvar $planet~planetcheck_ignorecount 0
:planet~planetcheck_loadignore

getword $planet~planetcheck_ignorelist $planet~planetcheck_ignore[$planet~planetcheck_i] $planet~planetcheck_i
if ($planet~planetcheck_ignore[$planet~planetcheck_i] <> 0)
  add $planet~planetcheck_i 1
  add $planet~planetcheck_ignorecount 1
  goto :PLANETCHECK_LOADIGNORE
end

setvar $planet~planetcheck_ignorelist ""
setvar $planet~planetcheck_found 0
send "l"

settextlinetrigger PLANETCHECK_NOPLANET :PLANETCHECK_NOPLANET "There isn't a planet in this sector."
settextlinetrigger PLANETCHECK_MULTIPLEPLANETS :PLANETCHECK_MULTIPLEPLANETS "Registry# and Planet Name"
settextlinetrigger PLANETCHECK_SINGLEPLANET :PLANETCHECK_SINGLEPLANET "Landing sequence engaged..."
pause
:planet~planetcheck_noplanet

killtrigger PLANETCHECK_MULTIPLEPLANETS
killtrigger PLANETCHECK_SINGLEPLANET
return
:planet~planetcheck_multipleplanets

killtrigger PLANETCHECK_SINGLEPLANET
killtrigger PLANETCHECK_NOPLANET
setvar $planet~planetcheck_lastid 0
:planet~planetcheck_nextplanet

settexttrigger PLANETCHECK_PLANETSCHECKED :PLANETCHECK_PLANETSCHECKED "Land on which planet <Q to abort>"
settextlinetrigger PLANETCHECK_GETID :PLANETCHECK_GETID "<"
pause
:planet~planetcheck_getid

getword CURRENTLINE $planet~planetcheck_word 1
if ($planet~planetcheck_word = "Owned")
  settextlinetrigger PLANETCHECK_GETID :PLANETCHECK_GETID "<"
  pause
end

killtrigger PLANETCHECK_PLANETSCHECKED
setvar $planet~planetcheck_line CURRENTLINE
striptext $planet~planetcheck_line "<"
striptext $planet~planetcheck_line ">"
getword $planet~planetcheck_line $planet~planetcheck_id 1
if ($planet~planetcheck_id = "Land")
  goto :PLANETCHECK_PLANETSCHECKED
end

gosub :PLANETCHECK_SUB_CHECKIGNORE

if (($planet~planetcheck_id > $planet~planetcheck_lastid) and ($planet~planetcheck_ignore = 0))
  send $planet~planetcheck_id "*"
  setvar $planet~planetcheck_lastid $planet~planetcheck_id
  gosub :PLANETCHECK_SUB_CHECK

  if ($planet~planetcheck_found <> 0)
    return
  end

  send "ql"
  waitfor "Registry# and Planet Name"
end
goto :PLANETCHECK_NEXTPLANET
:planet~planetcheck_planetschecked

killtrigger PLANETCHECK_GETID
send "q*"
return
:planet~planetcheck_singleplanet

killtrigger PLANETCHECK_MULTIPLEPLANETS
killtrigger PLANETCHECK_NOPLANET
gosub :PLANETCHECK_SUB_CHECK
if ($planet~planetcheck_found = 0)
  send "q"
end
return
:planet~planetcheck_sub_check

settextlinetrigger PLANETCHECK_CHECK_GETPLANET :PLANETCHECK_CHECK_GETPLANET "Planet #"
pause
:planet~planetcheck_check_getplanet

getword CURRENTLINE $planet~planetcheck_check_planet 2
striptext $planet~planetcheck_check_planet "#"

setvar $planet~planetcheck_id $planet~planetcheck_check_planet
gosub :PLANETCHECK_SUB_CHECKIGNORE

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
    goto :PLANETCHECK_CHECKIGNORE_LOOP
  end
end

return
:planet~updateplanetprods



setvar $planet~prods_line $planet~planetfuel&" "&$planet~planetorg&" "&$planet~planetequip&" "&$planet~planet_class&"*"
loadvar $planet~planet_prods_file
fileexists $planet~exists $planet~planet_prods_file
if ($planet~exists)
  if ($planet~skip_prods_read = 0)
    readtoarray $planet~planet_prods_file $planet~prods_file_array
    setvar $planet~skip_prods_read 0
  end
  setvar $planet~prods_count $planet~prods_file_array
  setvar $planet~foundit 0
  setvar $planet~i 1
  while ($planet~i <= $planet~prods_count)
    setvar $planet~planetinf $planet~prods_file_array[$planet~i]
    getwordpos $planet~planetinf $planet~pos "Class "
    if ($planet~pos > 0)
      cuttext $planet~planetinf $planet~class $planet~pos 999
      if ($planet~class = $planet~planet_class)
        if ($planet~planetinf = $planet~prods_line)
          return
        end
        setvar $planet~prods_file_array[$planet~i] $planet~prods_line
        setvar $planet~foundit 1
      end
    end

    add $planet~i 1
  end
end
if (($planet~exists = FALSE) or ($planet~foundit = 0))
  write $planet~planet_prods_file $planet~prods_line
else
  delete $planet~planet_prods_file
  setvar $planet~i 1
  while ($planet~i <= $planet~prods_count)
    write $planet~planet_prods_file $planet~prods_file_array[$planet~i]
    add $planet~i 1
  end
end
return
:planet~updateplanetcolos



if (($planet~fuelcolos = 0) and (($planet~orgcolos = 0) and ($planet~equcolos = 0)))
  return
end
setvar $planet~planet_colos_line $planet~fuelcolos&" "&$planet~orgcolos&" "&$planet~equcolos&" "&$planet~planet_class&"*"
loadvar $planet~planet_colos_file

setvar $planet~planet_colos_file $bot~folder&"/planetcolos.cfg"
savevar $planet~planet_colos_file
fileexists $planet~exists $planet~planet_colos_file
if ($planet~exists)
  if ($planet~skip_colos_read = 0)
    readtoarray $planet~planet_colos_file $planet~colos_file_array
    setvar $planet~skip_colos_read 0
  end
  setvar $planet~colos_count $planet~colos_file_array
  setvar $planet~foundit 0
  setvar $planet~changed 0
  setvar $planet~i 1
  while ($planet~i <= $planet~colos_count)
    setvar $planet~planetinf $planet~colos_file_array[$planet~i]
    getwordpos $planet~planetinf $planet~pos "Class "
    if ($planet~pos > 0)
      cuttext $planet~planetinf $planet~class $planet~pos 999
      if ($planet~class = $planet~planet_class)
        if ($planet~planetinf = $planet~planet_colos_line)
          return
        end
        setvar $planet~changed 1
        getword $planet~planetinf $planet~fuelcolos_tmp 1
        getword $planet~planetinf $planet~orgcolos_tmp 2
        getword $planet~planetinf $planet~equcolos_tmp 3
        if ($planet~fuelcolos > 0)
          setvar $planet~tmpline $planet~fuelcolos&" "
        else
          setvar $planet~tmpline $planet~fuelcolos_tmp&" "
        end
        if ($planet~orgcolos > 0)
          setvar $planet~tmpline $planet~tmpline&$planet~orgcolos&" "
        else
          setvar $planet~tmpline $planet~tmpline&$planet~orgcolos_tmp&" "
        end
        if ($planet~equcolos > 0)
          setvar $planet~tmpline $planet~tmpline&$planet~equcolos&" "
        else
          setvar $planet~tmpline $planet~tmpline&$planet~equcolos_tmp&" "
        end
        setvar $planet~tmpline $planet~tmpline&$planet~planet_class&"*"
        setvar $planet~colos_file_array[$planet~i] $planet~tmpline
        setvar $planet~foundit 1
      end
    end

    add $planet~i 1
  end
end
if (($planet~exists = FALSE) or ($planet~foundit = 0))
  write $planet~planet_colos_file $planet~planet_colos_line
elseif ($planet~changed = 1)
  delete $planet~planet_colos_file
  setvar $planet~i 1
  while ($planet~i <= $planet~colos_count)
    write $planet~planet_colos_file $planet~colos_file_array[$planet~i]
    add $planet~i 1
  end
end
return
:planet~getplanetinfo



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
setvar $planet~planet_class "undefined"
setvar $planet~planet_class_name "undefined"
setvar $planet~planet_name "undefined"
setvar $planet~under_construction FALSE
setvar $planet~maxed_level FALSE
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
  killtrigger PLANETINFO2
  settextlinetrigger PLANETINFO2 :PLANETINFO2 "Planet #"
  pause
else
  setvar $planet~noheader 0
end

goto :PLANETINFOSTART
:planet~planetinfo2

setvar $planet~citadel 0
setvar $planet~sector_cannon 0
setvar $planet~atmosphere_cannon 0
setvar $planet~citadel_credits 0
getword CURRENTLINE $planet~planet 2
striptext $planet~planet "#"
isnumber $planet~tst $planet~planet
if ($planet~tst <> TRUE)
  killtrigger PLANETINFO2
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
:planet~planetinfostart

setvar $planet~current_sector $player~current_sector
settextlinetrigger CLASS :GETCLASS "Class "
settextlinetrigger CREATOR :CREATOR "Created by: "
settextlinetrigger OWNER :OWNER "Claimed by: "
pause
:planet~getclass

setvar $planet~planet_class CURRENTLINE
getword $planet~planet_class $planet~code 2
striptext $planet~code ","
getlength $planet~code $planet~len
cuttext $planet~planet_class $planet~planet_class_name ($planet~len + 9) 999
setvar $planet~class_name $planet~planet_class_name
pause
:planet~creator

getword CURRENTLINE $planet~test 3
if ($planet~test = 0)
  setvar $planet~creator ""
else
  cuttext CURRENTLINE $planet~creator 13 999
end
pause
:planet~owner

getword CURRENTLINE $planet~owner 3
if ($planet~owner = 0)
  setvar $planet~owner ""
else
  cuttext CURRENTLINE $planet~owner 13 999
end

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
getwordpos CURRENTLINE $planet~pos " under construction, "
cuttext CURRENTLINE $planet~line $planet~pos 999
getword $planet~line $planet~buildtime 3
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
getword CURRENTLINE $planet~planet_fuel_rate 4
getword CURRENTLINE $planet~planet_fuel_prod 5
getword CURRENTLINE $planet~planet_fuel 6
getword CURRENTLINE $player~ore_holds 7
getword CURRENTLINE $planet~planet_fuel_max 8
getword CURRENTLINE $planet~planetfuel 6
getword CURRENTLINE $planet~planetfuelmax 8
striptext $planet~planetfuel ","
striptext $planet~planetfuelmax ","
striptext $planet~planet_fuel ","
striptext $planet~planet_fuel_max ","
striptext $planet~planet_fuel_colonists ","
striptext $planet~planet_fuel_prod ","
striptext $planet~planet_fuel_rate ","
pause
:planet~orgstart

getword CURRENTLINE $planet~planet_organics_colonists 2
getword CURRENTLINE $planet~planet_organics_rate 3
getword CURRENTLINE $planet~planet_organics_prod 4
getword CURRENTLINE $planet~planet_organics 5
getword CURRENTLINE $player~organic_holds 6
getword CURRENTLINE $planet~planet_organics_max 7
getword CURRENTLINE $planet~planetorg 5
getword CURRENTLINE $planet~planetorgmax 7
striptext $planet~planetorg ","
striptext $planet~planetorgmax ","
striptext $planet~planet_organics ","
striptext $planet~planet_organics_max ","
striptext $planet~planet_organics_colonists ","
striptext $planet~planet_organics_prod ","
striptext $planet~planet_organics_rate ","
pause
:planet~equipstart

getword CURRENTLINE $planet~planet_equipment_colonists 2
getword CURRENTLINE $planet~planet_equipment_rate 3
getword CURRENTLINE $planet~planet_equipment_prod 4
getword CURRENTLINE $planet~planet_equipment 5
getword CURRENTLINE $player~equipment_holds 6
getword CURRENTLINE $planet~planet_equipment_max 7
getword CURRENTLINE $planet~planetequip 5
getword CURRENTLINE $planet~planetequipmax 7
striptext $planet~planetequip ","
striptext $planet~planetequipmax ","
striptext $planet~planet_equipment ","
striptext $planet~planet_equipment_max ","
striptext $planet~planet_equipment_colonists ","
striptext $planet~planet_equipment_prod ","
striptext $planet~planet_equipment_rate ","
pause
:planet~figstart

getword CURRENTLINE $planet~planet_fighters_rate 3
getword CURRENTLINE $planet~planet_fighters_prod 4
getword CURRENTLINE $planet~planet_fighters 5
getword CURRENTLINE $planet~planet_fighters_max 7
striptext $planet~planet_fighters_rate ","
striptext $planet~planet_fighters_prod ","
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
end
if ($planet~stopper = "<Q>")
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

delete $planet~planet_file
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

  setvar $planet~planet_fuel_colonists_max 0
  setvar $planet~planet_fuel_colonists_rate 0
  setvar $planet~planet_org_colonists_max 0
  setvar $planet~planet_org_colonists_rate 0
  setvar $planet~planet_equip_colonists_max 0
  setvar $planet~planet_equip_colonists_rate 0
  gosub :READPLANETTYPESTATS
  write $planet~planet_file $planet~planet_fuel_colonists_max&" "&$planet~planet_fuel_colonists_rate&" "&$planet~planet_org_colonists_max&" "&$planet~planet_org_colonists_rate&" "&$planet~planet_equip_colonists_max&" "&$planet~planet_equip_colonists_rate&" "&$planet~planet_name
end
send "qq"
return
:planet~readplanettypestats
:planet~readplanettypestats_wait



settextlinetrigger PLANETSTAT_COLS :READPLANETTYPESTATS_COLS "Cols -"
settextlinetrigger PLANETSTATS_ORE :READSTATSPROD "Fuel Ore"
settextlinetrigger PLANETSTATS_ORG :READSTATSPROD "Organics"
settextlinetrigger PLANETSTATS_EQU :READSTATSPROD "Equipment"
settexttrigger PLANETSTAT_DONE :READPLANETTYPESTATS_DONE "Which planet type are you interested in (?=List)"
pause
:planet~readplanettypestats_cols

killalltriggers
setvar $planet~stat_line CURRENTLINE
setvar $planet~parsed_cols 0
gettext $planet~stat_line $planet~parsed_cols "Cols -" "/"
striptext $planet~parsed_cols " "
striptext $planet~parsed_cols ","
isnumber $planet~isnumber $planet~parsed_cols
if ($planet~isnumber <> TRUE)
  setvar $planet~parsed_cols 0
end

if ($planet~parsed_cols > 0)
  getwordpos $planet~stat_line $planet~pos "Ore"
  if ($planet~pos > 0)
    setvar $planet~planet_fuel_colonists_max $planet~parsed_cols
  end
  getwordpos $planet~stat_line $planet~pos "Org"
  if ($planet~pos > 0)
    setvar $planet~planet_org_colonists_max $planet~parsed_cols
  end
  getwordpos $planet~stat_line $planet~pos "Eq"
  if ($planet~pos > 0)
    setvar $planet~planet_equip_colonists_max $planet~parsed_cols
  end
end
goto :READPLANETTYPESTATS_WAIT
:planet~readstatsprod

killalltriggers
setvar $planet~stat_line CURRENTLINE
getwordpos $planet~stat_line $planet~pos ":1"
cuttext $planet~stat_line $planet~parsed_num ($planet~pos - 4) 4
striptext $planet~parsed_num " "
striptext $planet~parsed_num "│"

isnumber $planet~isnumber $planet~parsed_num
if ($planet~isnumber <> TRUE)
  setvar $planet~parsed_num 0
end
getwordpos $planet~stat_line $planet~pos "Fuel Ore"
if ($planet~pos > 0)
  setvar $planet~planet_fuel_colonists_rate $planet~parsed_num
end
getwordpos $planet~stat_line $planet~pos "Organics"
if ($planet~pos > 0)
  setvar $planet~planet_org_colonists_rate $planet~parsed_num
end
getwordpos $planet~stat_line $planet~pos "Equipment"
if ($planet~pos > 0)
  setvar $planet~planet_equip_colonists_rate $planet~parsed_num
end
goto :READPLANETTYPESTATS_WAIT
:planet~readplanettypestats_done

killalltriggers
return
:planet~landingsub



gosub :KILLLANDINGTRIGGERS
send "lz" #8 $planet~planet "*"
setvar $planet~successfulcitadel FALSE
setvar $planet~successfulplanet FALSE

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

killtrigger PLANETPROMPT
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
setvar $planet~successfulplanet TRUE
setvar $planet~sucessfulplanet TRUE

if ($planet~land_and_lift = TRUE)
  send "m* * * q  "
  return
end

if ($planet~notakefigs <> TRUE)
  send "m* * * "
else
  setvar $planet~notakefigs FALSE
end

if ($planet~nocit = TRUE)
  setvar $planet~nocit FALSE
  return
end

send "c"

settexttrigger BUILD_CIT :BUILD_CIT "Do you wish to construct one?"
settexttrigger IN_CIT :IN_CIT "Citadel command"
settexttrigger NOCITALLOWED :BUILD_CIT "Citadels are not allowed in FedSpace."
settexttrigger CITNOTBUILTYET :BUILD_CIT "Be patient, your Citadel is not yet finished."
pause
:planet~build_cit

gosub :KILLLANDINGTRIGGERS
setvar $planet~startinglocation "Planet"
send "n"
return
:planet~in_cit

gosub :KILLLANDINGTRIGGERS
setvar $planet~successfulcitadel TRUE
setvar $planet~sucessfulcitadel TRUE
setvar $planet~startinglocation "Citadel"
return
:planet~pwarp



setvar $planet~do_scan FALSE
setvar $planet~pwarpsuccess FALSE
setvar $planet~msg ""
if ($planet~pwarp_scan = TRUE)
  setvar $planet~do_scan TRUE
end
setvar $planet~pwarp_scan FALSE
send "q *"
waiton "Planet #"
getword CURRENTLINE $planet~planet 2
striptext $planet~planet "#"
savevar $planet~planet

send "c p" $planet~warpto "*"

settextlinetrigger PWARP_LOCK :PWARP_LOCK "Locating beam pinpointed"
settextlinetrigger NO_PWARP_LOCK :NO_PWARP_LOCK "Your own fighters must be"
settextlinetrigger ALREADY :ALREADY "You are already in that sector!"
settextlinetrigger NO_ORE :NO_ORE "You do not have enough Fuel Ore"
settextlinetrigger NO_PWARP :NOPWARP "This Citadel does not have a Planetary TransWarp"
settextlinetrigger WRONG_NUMBER :WRONG_NUMBER "Invalid Sector number,"
pause
:planet~wrong_number

killalltriggers
setvar $planet~msg "Not a valid sector to pwarp to!"
setvar $switchboard~message "Not a valid sector to pwarp to!*"
gosub :switchboard~switchboard
return
:planet~nopwarp

killalltriggers
setvar $planet~msg "Planet Does Not Have A Planetary TransWarp Drive!"
setvar $switchboard~message "Planet Does Not Have A Planetary TransWarp Drive!*"
gosub :switchboard~switchboard
return
:planet~no_pwarp_lock

killalltriggers
setvar $planet~target $planet~warpto
setvar $player~target $planet~target
setvar $planet~msg "No fighter down at that location!"
gosub :player~removefigfromdata
setvar $switchboard~message "No fighter down at that location!*"
gosub :switchboard~switchboard
return
:planet~no_ore

killalltriggers
setvar $planet~msg "Not enough fuel for that pwarp."
setvar $switchboard~message "Not enough fuel for that pwarp.*"
gosub :switchboard~switchboard
return
:planet~pwarp_lock

killalltriggers
send "y"

settextlinetrigger PWARP_SUCCESS :PWARP_SUCCESS "-=-=-=- Planetary TransWarp Drive Engaged! -=-=-=-"
pause
:planet~pwarp_success
killalltriggers
setvar $planet~pwarpsuccess TRUE
setvar $planet~msg "Planet #"&$planet~planet&" moved to sector "&$planet~warpto&"."
setvar $switchboard~message $planet~msg&"*"
gosub :switchboard~switchboard
setvar $planet~target $planet~warpto
setvar $player~target $planet~target
loadvar $planet~planet
isnumber $planet~test $planet~planet
if ($planet~test)
  if (($planet~planet <> ".") and ($planet~planet > 0))
    setsectorparameter $planet~planet "PSECTOR" $planet~target
  end
end

if ($planet~do_scan = TRUE)
  send "s"
  waiton "Warps to Sector(s) :"
  send "* "
end
return
:planet~already

killalltriggers
setvar $planet~pwarpsuccess TRUE
setvar $planet~msg "Planet already in that sector!."
setvar $switchboard~message "Planet already in that sector!.*"
gosub :switchboard~switchboard
return
:planet~killlandingtriggers



killtrigger NOPLANET
killtrigger NO_LAND
killtrigger PLANET
killtrigger PLANETPROMPT
killtrigger WRONGONE
killtrigger IN_CIT
killtrigger NOCITALLOWED
killtrigger BUILD_CIT
killtrigger CITNOTBUILTYET
killtrigger NOPLANETSCANNER
return
:planet~landonplanetentercitadel




send "l "&$planet~planet&"*c* "
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
  setvar $planet~planetstats TRUE
else
  echo "*No Planet File Found!*"
end
return
:planet~loadplanetprods



setvar $planet~planetcounter 0
setvar $planet~planetstats FALSE
loadvar $planet~planet_prods_file
fileexists $planet~exists $planet~planet_prods_file
if ($planet~exists)
  readtoarray $planet~planet_prods_file $planet~planet_prods_array
  setvar $planet~planet_prods_capacity $planet~planet_prods_array
  add $planet~planet_prods_capacity 100
  if ($planet~planet_prods_capacity < 100)
    setvar $planet~planet_prods_capacity 100
  end
  setarray $planet~planetprods $planet~planet_prods_capacity 3
  setvar $planet~i 1
  while ($planet~i <= $planet~planet_prods_array)
    setvar $planet~planetinf $planet~planet_prods_array[$planet~i]
    getword $planet~planetinf $planet~planet_starting_ore 1
    getlength $planet~planet_starting_ore $planet~len1
    getword $planet~planetinf $planet~planet_starting_org 2
    getlength $planet~planet_starting_org $planet~len2
    getword $planet~planetinf $planet~planet_starting_equ 3
    getlength $planet~planet_starting_equ $planet~len3
    setvar $planet~len ($planet~len1 + ($planet~len2 + ($planet~len3 + 3)))
    getlength $planet~planetinf $planet~pname_len
    if ($planet~len < $planet~pname_len)
      cuttext $planet~planetinf $planet~pname ($planet~len + 1) 999
      trim $planet~pname
      if (($planet~pname <> 0) and ($planet~pname <> ""))
        add $planet~planetcounter 1
        setvar $planet~planetprods[$planet~planetcounter] $planet~pname
        setvar $planet~planetprods[$planet~planetcounter][1] $planet~planet_starting_ore
        setvar $planet~planetprods[$planet~planetcounter][2] $planet~planet_starting_org
        setvar $planet~planetprods[$planet~planetcounter][3] $planet~planet_starting_equ
      end
    else
      echo "*"&$planet~planetinf&" error during processing planets.*"
    end
    add $planet~i 1
  end
else
  setarray $planet~planetprods 100 3
end
setvar $planet~i $planet~planetcounter
add $planet~i 1
setvar $planet~planetprods[$planet~i] 0
setvar $planet~planetstats TRUE
return
:planet~loadplanetcolos



loadvar $planet~planet_colos_file
if ($planet~planet_colos_file = 0)
  setvar $planet~planet_colos_file $bot~folder&"/planetcolos.cfg"
  savevar $planet~planet_colos_file
end
fileexists $planet~exists $planet~planet_colos_file
if ($planet~exists)
  readtoarray $planet~planet_colos_file $planet~colos_file_array
  setvar $planet~planet_colos_count $planet~colos_file_array
  setvar $planet~planet_colos_capacity $planet~planet_colos_count
  add $planet~planet_colos_capacity 100
  if ($planet~planet_colos_capacity < 100)
    setvar $planet~planet_colos_capacity 100
  end
  setarray $planet~planet_colos $planet~planet_colos_capacity 3
  setvar $planet~i 1
  setvar $planet~j 1
  while ($planet~i <= $planet~planet_colos_count)
    setvar $planet~planetinf $planet~colos_file_array[$planet~i]
    getwordpos $planet~planetinf $planet~pos "Class "
    if ($planet~pos > 0)
      cuttext $planet~planetinf $planet~planet_colos[$planet~j] $planet~pos 999
      getword $planet~planetinf $planet~planet_colos[$planet~j][1] 1
      getword $planet~planetinf $planet~planet_colos[$planet~j][2] 2
      getword $planet~planetinf $planet~planet_colos[$planet~j][3] 3
      add $planet~j 1
    end
    add $planet~i 1
  end
  setvar $planet~planet_colos_count ($planet~j - 1)
else
  setvar $planet~planet_colos_count 0
  setarray $planet~planet_colos 100 3
end
return
:planet~moveproduct
:planet~movefighters



loadvar $map~stardock
setvar $planet~movesuccess FALSE
setvar $planet~movesuccess FALSE
setvar $planet~movefailed FALSE
gosub :player~currentprompt
setvar $planet~startingprompt $player~current_prompt
if ($player~current_prompt = "Citadel")
  send "q"
elseif ($player~current_prompt <> "Planet")
  setvar $switchboard~message "You must start from the Citadel or Planet prompt!*"
  gosub :switchboard~switchboard
  return
end
if ($player~turns <= $bot~bot_turn_limit)
  return
end




gosub :GETPLANETINFO
setvar $planet~startingplanet $planet~planet




if ($planet~planettofill = 0)
  return
end

if ($planet~category = 6)
  goto :MOVECREDS
end

if (($planet~type <> "t") and (($planet~type <> "s") and ($planet~type <> "m")))
  return
end
if (($planet~moveholds = 0) and (($planet~moveamount = 0) and ($planet~moveextra = 0)))
  return
end
if (($planet~category < 1) or ($planet~category > 6))
  return
end
if ($planet~category = 4)
  loadvar $ship~ship_fighters_max
  isnumber $planet~test $ship~ship_fighters_max
  if (($planet~test = FALSE) or ($ship~ship_fighters_max <= 0))
    setvar $switchboard~message "Unable to determine ship fighter capacity.*"
    gosub :switchboard~switchboard
    return
  end
  send "m n l*"
end

if ($planet~current_sector = $map~stardock)
  send "t n l1* t n l2* t n l3* s n l1* s n l2* s n l3* "
else
  send "q j y l "&$planet~startingplanet&"*"
end

gosub :player~quikstats
setvar $player~turns ($player~turns - 1)
setvar $planet~count 0
if ($planet~burstsize <= 0)
  setvar $planet~burstsize 1000
end
:planet~moveproductloop

killtrigger SUCCESS
killtrigger EMPTY
killtrigger FULL
killtrigger SUCCESS_COLOS
killtrigger EMPTY_COLOS

if ($player~turns <= $bot~bot_turn_limit)
  goto :MOVE_DONE
end
if ($player~total_holds <= 0)
  goto :MOVE_DONE
end
if (($planet~moveamount <= 0) and (($planet~moveholds <= 0) and ($planet~moveextra <= 0)))
  goto :MOVE_DONE
end

settexttrigger EMPTY :MOVE_DONE "There aren't that many "
settexttrigger FULL :MOVE_FAILED "They don't have room for that many "
settexttrigger EMPTY_COLOS :MOVE_FAILED "There isn't room on the planet"

if ($planet~moveamount > 0)
  goto :MOVEAMOUNTLOOP
end

setvar $planet~loop 0
:planet~moveholdsloop

setvar $planet~i 0
while ($planet~i < $planet~burstsize)
  add $planet~i 1
  if ($planet~loop >= $planet~moveholds)
    goto :MOVEEXTRA
  end
  if ($planet~category = 4)
    setvar $planet~get $ship~ship_fighters_max
    gosub :SENDMOVEFIGHTERS
  else
    setvar $planet~get $player~total_holds
    gosub :SENDMOVEPRODUCT
  end
  add $planet~count $planet~get
  add $planet~loop 1
end
send "@"
waiton "Average Interval Lag"
goto :MOVEHOLDSLOOP
:planet~moveextra

if ($planet~moveextra > 0)
  setvar $planet~get $planet~moveextra
  if ($planet~category = 4)
    gosub :SENDMOVEFIGHTERS
  else
    gosub :SENDMOVEPRODUCT
  end
  add $planet~count $planet~get
end
goto :MOVE_DONE
:planet~moveamountloop

if ($planet~moveamount <= 0)
  goto :MOVE_DONE
end
setvar $planet~j 0
while ($planet~j < $planet~burstsize)
  add $planet~j 1
  if ($planet~moveamount <= 0)
    goto :MOVE_DONE
  end

  if ($planet~category = 4)
    setvar $planet~get $ship~ship_fighters_max
    if ($planet~moveamount >= $ship~ship_fighters_max)
      setvar $planet~get $ship~ship_fighters_max
    else
      setvar $planet~get $planet~moveamount
    end
  else
    if ($planet~moveamount >= $player~total_holds)
      setvar $planet~get $player~total_holds
    else
      setvar $planet~get $planet~moveamount
    end
  end
  if ($planet~category = 4)
    gosub :SENDMOVEFIGHTERS
  else
    gosub :SENDMOVEPRODUCT
  end
  add $planet~count $planet~get
  setvar $planet~moveamount ($planet~moveamount - $planet~get)
end
send "@"
waiton "Average Interval Lag"
goto :MOVEAMOUNTLOOP
:planet~sendmoveproduct

setvar $planet~move_dest_category $planet~category
if (($planet~type = "s") and ($planet~destcategory > 0))
  setvar $planet~move_dest_category $planet~destcategory
end
send "l j"&#8&$planet~startingplanet&"* j"&$planet~type&"* jt"&$planet~category&$planet~get&"* x q l j"&#8&$planet~planettofill&"* j"&$planet~type&"* jl"&$planet~move_dest_category&"* x q "
return
:planet~sendmovefighters

send "l j"&#8&$planet~startingplanet&"* j"&$planet~type&"* jt"&$planet~get&"* x q l j"&#8&$planet~planettofill&"* j"&$planet~type&"* jl"&$planet~get&"* x q "
return
:planet~move_failed

killalltriggers
setvar $planet~movefailed TRUE
setvar $planet~moveerror CURRENTLINE
if ($planet~current_sector <> $map~stardock)
  send "q q * * j y "
end
:planet~move_done

killalltriggers
setvar $planet~moveamount 0
setvar $planet~moveholds 0
setvar $planet~moveextra 0
setvar $planet~destcategory 0
if ($planet~movefailed = TRUE)
  setvar $planet~movesuccess FALSE
else
  setvar $planet~movesuccess TRUE
end
setvar $planet~macro "l "&$planet~startingplanet
if ($planet~category = 4)
  setvar $planet~macro $planet~macro&"* m n t*"
end

if ($planet~startingprompt = "Citadel")
  send $planet~macro&"* c"
  waiton "Citadel command"
else
  send $planet~macro&"*"
  waiton "Planet command"
end
if ($planet~movefailed = TRUE)
  setvar $planet~movesuccess FALSE
else
  setvar $planet~movesuccess TRUE
end
return
:planet~movecreds

gosub :player~quikstats
setvar $planet~startingcredits $player~credits

send "c"
waiton "Citadel treasury contains"
getword CURRENTLINE $planet~citadel_credits 4
striptext $planet~citadel_credits ","

if (($planet~moveamount = 0) or ($planet~moveamount = ""))
  setvar $planet~moveamount $planet~citadel_credits
end

gosub :MOVECREDSVERIFYDESTINATION
if ($planet~movefailed = TRUE)
  setvar $planet~movesuccess FALSE
  return
end

if ($player~credits >= $planet~moveamount)
  send "q q l "&$planet~planettofill&"* ctt"&$planet~moveamount&"* q q l "&$planet~startingplanet&"* ctf"&$planet~moveamount&"* q q "
  setvar $planet~movesuccess TRUE
  return
end

while ($planet~moveamount > 0)
  setvar $planet~credstoget ($planet~moveamount - $player~credits)
  if ($planet~credstoget > 999999999)
    setvar $planet~credstoget (999999999 - $player~credits)
  end
  send "tf"&$planet~credstoget&"* "
  add $player~credits $planet~credstoget
  subtract $planet~moveamount $player~credits
  send "q q l "&$planet~planettofill&"* ctt"&$player~credits&"* q q l "&$planet~startingplanet&"* c"
  setvar $player~credits 0
end

send "tf"&$planet~startingcredits&"*"
waiton "You have "
getword CURRENTLINE $player~credits 3
striptext $player~credits ","
send "q q l "&$planet~startingplanet&"* "
goto :MOVE_DONE
:planet~movecredsverifydestination

killalltriggers
send "q q l "&$planet~planettofill&"*"
settexttrigger MOVECREDSDESTINATIONOK :MOVECREDSDESTINATIONOK "Planet command"
settextlinetrigger MOVECREDSDESTINATIONMISSING :MOVECREDSDESTINATIONMISSING "That planet is not in this sector."
settextlinetrigger MOVECREDSDESTINATIONINVALID :MOVECREDSDESTINATIONINVALID "Invalid registry number, landing aborted."
pause
:planet~movecredsdestinationok

killalltriggers
send "c"
settexttrigger MOVECREDSDESTINATIONCITADEL :MOVECREDSDESTINATIONCITADEL "Citadel command"
settexttrigger MOVECREDSDESTINATIONBUILD :MOVECREDSDESTINATIONBUILD "Do you wish to construct one?"
settexttrigger MOVECREDSDESTINATIONNOCITADEL :MOVECREDSDESTINATIONNOCITADEL "Citadels are not allowed in FedSpace."
settexttrigger MOVECREDSDESTINATIONNOCITADEL2 :MOVECREDSDESTINATIONNOCITADEL "Be patient, your Citadel is not yet finished."
pause
:planet~movecredsdestinationcitadel

killalltriggers
send "q q l "&$planet~startingplanet&"* c"
waiton "Citadel command"
return
:planet~movecredsdestinationmissing

killalltriggers
setvar $planet~movefailed TRUE
setvar $planet~moveerror "Destination planet "&$planet~planettofill&" is not in this sector."
send "q l "&$planet~startingplanet&"*"
waiton "Planet command"
return
:planet~movecredsdestinationinvalid

killalltriggers
setvar $planet~movefailed TRUE
setvar $planet~moveerror "Destination planet "&$planet~planettofill&" is invalid."
send "l "&$planet~startingplanet&"*"
waiton "Planet command"
return
:planet~movecredsdestinationbuild

killalltriggers
setvar $planet~movefailed TRUE
setvar $planet~moveerror "Destination planet "&$planet~planettofill&" does not have an accessible citadel."
send "n q l "&$planet~startingplanet&"*"
waiton "Planet command"
return
:planet~movecredsdestinationnocitadel

killalltriggers
setvar $planet~movefailed TRUE
setvar $planet~moveerror "Destination planet "&$planet~planettofill&" does not have an accessible citadel."
send "q l "&$planet~startingplanet&"*"
waiton "Planet command"
return
:planet~stripplanet



gosub :player~currentprompt
setvar $planet~strip_startingplanet 0
setvar $planet~strip_restore_ship_fighters FALSE
gosub :player~currentprompt
setvar $planet~strip_startingprompt $player~current_prompt
if ($planet~strip_startingprompt = "Citadel")
  send "q"
elseif ($planet~strip_startingprompt = "Command")
  if ($planet~planettofill = 0)
    setvar $switchboard~message "No destination planet selected to fill!*"
    gosub :switchboard~switchboard
    return
  end
  setvar $planet~nocit TRUE
  setvar $planet~planet $planet~planettofill
  gosub :LANDINGSUB
elseif ($planet~strip_startingprompt <> "Planet")
  setvar $switchboard~message "You must start from the Citadel, Planet or Command prompt!*"
  gosub :switchboard~switchboard
  return
end
if ($planet~planettostrip <= 0)
  setvar $switchboard~message "No planet selected to strip!*"
  gosub :switchboard~switchboard
  return
end
if ($planet~planettostrip = $planet~planettofill)
  setvar $switchboard~message "Source and destination planets are the same; skipping strip.*"
  gosub :switchboard~switchboard
  return
end
gosub :GETPLANETINFO
isnumber $planet~test $planet~planet
if ($planet~test = FALSE)
  setvar $switchboard~message "Could not read source planet info, halting strip.*"
  gosub :switchboard~switchboard
  halt
end
if ($planet~planet <= 0)
  setvar $switchboard~message "Could not read source planet info, halting strip.*"
  gosub :switchboard~switchboard
  halt
end
if ($planet~strip_startingprompt <> "Command")
  setvar $planet~strip_startingplanet $planet~planet
end
setvar $planet~countfuel 0
setvar $planet~countorganics 0
setvar $planet~countequipment 0
setvar $planet~countcolonists 0
setvar $planet~oretofill ($planet~planet_fuel_max - $planet~planet_fuel)
setvar $planet~orgtofill ($planet~planet_organics_max - $planet~planet_organics)
setvar $planet~equtofill ($planet~planet_equipment_max - $planet~planet_equipment)
setvar $planet~figstofill ($planet~planet_fighters_max - $planet~planet_fighters)
setvar $planet~fuelcolstofill 999999999
setvar $planet~orgcolstofill 999999999
setvar $planet~equcolstofill 999999999
if ($planet~skip_over_99)
  if (($planet~planet_fuel_max > 0) and (($planet~planet_fuel * 100) > ($planet~planet_fuel_max * 99)))
    setvar $planet~oretofill 0
  end
  if (($planet~planet_organics_max > 0) and (($planet~planet_organics * 100) > ($planet~planet_organics_max * 99)))
    setvar $planet~orgtofill 0
  end
  if (($planet~planet_equipment_max > 0) and (($planet~planet_equipment * 100) > ($planet~planet_equipment_max * 99)))
    setvar $planet~equtofill 0
  end
  if (($planet~planet_fighters_max > 0) and (($planet~planet_fighters * 100) > ($planet~planet_fighters_max * 99)))
    setvar $planet~figstofill 0
  end
  if ($planet~planet_fuel_colonists_max > 0)
    setvar $planet~fuelcolstofill ($planet~planet_fuel_colonists_max - $planet~planet_fuel_colonists)
    if (($planet~planet_fuel_colonists * 100) > ($planet~planet_fuel_colonists_max * 99))
      setvar $planet~fuelcolstofill 0
    end
  end
  if ($planet~planet_organics_colonists_max > 0)
    setvar $planet~orgcolstofill ($planet~planet_organics_colonists_max - $planet~planet_organics_colonists)
    if (($planet~planet_organics_colonists * 100) > ($planet~planet_organics_colonists_max * 99))
      setvar $planet~orgcolstofill 0
    end
  end
  if ($planet~planet_equipment_colonists_max > 0)
    setvar $planet~equcolstofill ($planet~planet_equipment_colonists_max - $planet~planet_equipment_colonists)
    if (($planet~planet_equipment_colonists * 100) > ($planet~planet_equipment_colonists_max * 99))
      setvar $planet~equcolstofill 0
    end
  end
end
setvar $planet~spacebuffer $player~total_holds
if ($planet~spacebuffer <= 0)
  setvar $planet~spacebuffer 1
end
if ($planet~oretofill <= $planet~spacebuffer)
  setvar $planet~oretofill 0
else
  subtract $planet~oretofill $planet~spacebuffer
end
if ($planet~orgtofill <= $planet~spacebuffer)
  setvar $planet~orgtofill 0
else
  subtract $planet~orgtofill $planet~spacebuffer
end
if ($planet~equtofill <= $planet~spacebuffer)
  setvar $planet~equtofill 0
else
  subtract $planet~equtofill $planet~spacebuffer
end
send "q"
if ($ship~ship_fighters_max <= 0)
  gosub :ship~getshipstats
end
if ($planet~figstofill < $ship~ship_fighters_max)
  setvar $planet~figstofill 0
end
if (($planet~oretofill <= 0) and (($planet~orgtofill <= 0) and (($planet~equtofill <= 0) and ($planet~figstofill <= 0))))
  goto :STRIP_DONEWITHTHISPLANET
end
send "l "&$planet~planettostrip&"*   "
gosub :GETPLANETINFO
if ($planet~emptyfuel)
  if ($planet~oretofill <= 0)
    setvar $planet~amount_to_strip 0
  else
    setvar $planet~amount_to_strip $planet~planet_fuel
    if ($planet~amount_to_strip > $planet~oretofill)
      setvar $planet~amount_to_strip $planet~oretofill
    end
  end
  if ($planet~amount_to_strip > 0)
    setvar $planet~category 1
    setvar $planet~type "t"
    setvar $planet~moveholds 0
    setvar $planet~moveextra 0
    setvar $planet~moveamount $planet~amount_to_strip
    gosub :MOVEPRODUCT
    if ($planet~movesuccess = FALSE)
      goto :STRIP_MOVE_FAILED
    end
    add $planet~countfuel $planet~count
  end
end
if ($planet~emptyorganics)
  if ($planet~orgtofill <= 0)
    setvar $planet~amount_to_strip 0
  else
    setvar $planet~amount_to_strip $planet~planet_organics
    if ($planet~amount_to_strip > $planet~orgtofill)
      setvar $planet~amount_to_strip $planet~orgtofill
    end
  end
  if ($planet~amount_to_strip > 0)
    setvar $planet~category 2
    setvar $planet~type "t"
    setvar $planet~moveholds 0
    setvar $planet~moveextra 0
    setvar $planet~moveamount $planet~amount_to_strip
    gosub :MOVEPRODUCT
    if ($planet~movesuccess = FALSE)
      goto :STRIP_MOVE_FAILED
    end
    add $planet~countorganics $planet~count
  end
end
if ($planet~emptyequipment)
  if ($planet~equtofill <= 0)
    setvar $planet~amount_to_strip 0
  else
    setvar $planet~amount_to_strip $planet~planet_equipment
    if ($planet~amount_to_strip > $planet~equtofill)
      setvar $planet~amount_to_strip $planet~equtofill
    end
  end
  if ($planet~amount_to_strip > 0)
    setvar $planet~category 3
    setvar $planet~type "t"
    setvar $planet~moveholds 0
    setvar $planet~moveextra 0
    setvar $planet~moveamount $planet~amount_to_strip
    gosub :MOVEPRODUCT
    if ($planet~movesuccess = FALSE)
      goto :STRIP_MOVE_FAILED
    end
    add $planet~countequipment $planet~count
  end
end
if ($planet~emptyfuelcolos)
  setvar $planet~amount_to_strip $planet~planet_fuel_colonists
  if ($planet~skip_over_99)
    if ($planet~fuelcolstofill <= 0)
      setvar $planet~amount_to_strip 0
    elseif ($planet~amount_to_strip > $planet~fuelcolstofill)
      setvar $planet~amount_to_strip $planet~fuelcolstofill
    end
  end
  if ($planet~amount_to_strip > 0)
    setvar $planet~category 1
    setvar $planet~type "s"
    setvar $planet~moveholds 0
    setvar $planet~moveextra 0
    setvar $planet~moveamount $planet~amount_to_strip
    gosub :MOVEPRODUCT
    if ($planet~movesuccess = FALSE)
      goto :STRIP_MOVE_FAILED
    end
    add $planet~countcolonists $planet~count
  end
end
if ($planet~emptyorgcolos)
  setvar $planet~amount_to_strip $planet~planet_organics_colonists
  if ($planet~skip_over_99)
    if ($planet~orgcolstofill <= 0)
      setvar $planet~amount_to_strip 0
    elseif ($planet~amount_to_strip > $planet~orgcolstofill)
      setvar $planet~amount_to_strip $planet~orgcolstofill
    end
  end
  if ($planet~amount_to_strip > 0)
    setvar $planet~category 2
    setvar $planet~type "s"
    setvar $planet~moveholds 0
    setvar $planet~moveextra 0
    setvar $planet~moveamount $planet~amount_to_strip
    gosub :MOVEPRODUCT
    if ($planet~movesuccess = FALSE)
      goto :STRIP_MOVE_FAILED
    end
    add $planet~countcolonists $planet~count
  end
end
if ($planet~emptyequcolos)
  setvar $planet~amount_to_strip $planet~planet_equipment_colonists
  if ($planet~skip_over_99)
    if ($planet~equcolstofill <= 0)
      setvar $planet~amount_to_strip 0
    elseif ($planet~amount_to_strip > $planet~equcolstofill)
      setvar $planet~amount_to_strip $planet~equcolstofill
    end
  end
  if ($planet~amount_to_strip > 0)
    setvar $planet~category 3
    setvar $planet~type "s"
    setvar $planet~moveholds 0
    setvar $planet~moveextra 0
    setvar $planet~moveamount $planet~amount_to_strip
    gosub :MOVEPRODUCT
    if ($planet~movesuccess = FALSE)
      goto :STRIP_MOVE_FAILED
    end
    add $planet~countcolonists $planet~count
  end
end
send "q "

if ($planet~emptyfigs)
  if (($planet~figstofill <= 0) or ($planet~figstofill < $ship~ship_fighters_max))
    goto :STRIP_DONEWITHTHISPLANET
  end
  setvar $planet~amount_to_strip $planet~planet_fighters
  if ($planet~amount_to_strip > $planet~figstofill)
    setvar $planet~amount_to_strip $planet~figstofill
  end

  while ($planet~amount_to_strip > 0)
    setvar $planet~strip_restore_ship_fighters TRUE
    send "l "&$planet~planettofill&"* m n l* q "
    :planet~tryfighters
    killtrigger SUCCESS
    killtrigger EMPTYEMPTY
    killtrigger FULLFILL
    killtrigger FULLFILL2
    killtrigger EMPTY
    send "l j"&#8&$planet~planettostrip&"* jmnt*x q l j"&#8&$planet~planettofill&"* jmnl*x q "
    settexttrigger SUCCESS :TRYFIGHTERS "The Fighters join your battle force."
    settexttrigger EMPTYEMPTY :STRIP_DONEWITHTHISPLANET "There isn't room on the planet"
    settexttrigger FULLFILL :STRIP_DONEWITHTHISPLANET "They don't have room for that many "
    settexttrigger FULLFILL2 :STRIP_DONEWITHTHISPLANET "You can't put more than"
    settexttrigger EMPTY :STRIP_DONEWITHTHISPLANET "How many Fighters do you want to take (0 Max) [0]"
    pause
  end
end
:planet~strip_donewiththisplanet

killalltriggers
if ($planet~strip_startingplanet = 0)
  return
end
setvar $planet~planet $planet~strip_startingplanet
setvar $planet~nocit TRUE
gosub :LANDINGSUB
if ($planet~strip_restore_ship_fighters)
  send "m n t*"
  waiton "Planet command"
end



return
:planet~strip_move_failed

getwordpos $planet~moveerror $planet~strip_full_pos "They don't have room for that many"
getwordpos $planet~moveerror $planet~strip_empty_colos_pos "There isn't room on the planet"
if (($planet~strip_full_pos > 0) or ($planet~strip_empty_colos_pos > 0))
  goto :STRIP_DONEWITHTHISPLANET
end
setvar $switchboard~message "Failed to move product, halting.*"
gosub :switchboard~switchboard
halt
:planet~qset



if (($planet~qset_setting = 0) or ($planet~qset_setting = ""))
  setvar $switchboard~message "Quasar Cannon settings are not defined.*"
  gosub :switchboard~switchboard
  return
end
if (($planet~qset_type = 0) or ($planet~qset_type = ""))
  setvar $switchboard~message "Quasar Cannon type is not defined.*"
  gosub :switchboard~switchboard
  return
end

gosub :player~currentprompt
setvar $planet~startinglocation $player~current_prompt

setvar $planet~totaldamage 0
setvar $planet~cannontype $planet~qset_type
setvar $planet~qset_type 0
setvar $planet~cannondamage $planet~qset_setting
setvar $planet~qset_setting 0

if ($planet~startinglocation = "Citadel")
  send "q"
elseif ($planet~startinglocation <> "Planet")
  setvar $switchboard~message "Qset must start from the Citadel or Planet prompt!*"
  gosub :switchboard~switchboard
  return
end

gosub :GETPLANETINFO

if ($planet~citadel < 3)
  setvar $switchboard~message "Planet number " $planet~planet " does not have a quasar cannon.*"
  gosub :switchboard~switchboard
  if (($planet~citadel > 0) and ($planet~startinglocation = "Citadel"))
    send "c "
  end
end

send "c "
if ($planet~cannontype = "s")
  setvar $planet~percenttoset (((3 * $planet~cannondamage) * 100) / $planet~planet_fuel)
  if (((($planet~planet_fuel * $planet~percenttoset) / 100) / 3) < $planet~cannondamage)
    add $planet~percenttoset 1
  end
  if ($planet~percenttoset > 100)
    setvar $planet~percenttoset 100
  end
  add $planet~totaldamage ((($planet~planet_fuel * $planet~percenttoset) / 100) / 3)
  send "l s "&$planet~percenttoset&"* "
  setvar $planet~damagetype "Sector"
else
  if ($planet~mbbs)
    setvar $planet~percenttoset ((($planet~cannondamage / 2) * 100) / $planet~planet_fuel)
    if (((($planet~planet_fuel * $planet~percenttoset) / 100) * 2) < $planet~cannondamage)
      add $planet~percenttoset 1
    end
  else
    setvar $planet~percenttoset (((2 * $planet~cannondamage) * 100) / $planet~planet_fuel)
    if (((($planet~planet_fuel * $planet~percenttoset) / 100) / 2) < $planet~cannondamage)
      add $planet~percenttoset 1
    end
    if ($planet~percenttoset > 100)
      setvar $planet~percenttoset 100
    end
    if ($planet~mbbs)
      add $planet~totaldamage ((($planet~planet_fuel * $planet~percenttoset) / 100) * 2)
    else
      add $planet~totaldamage ((($planet~planet_fuel * $planet~percenttoset) / 100) / 2)
    end
    send "l a "&$planet~percenttoset&"* "
    setvar $planet~damagetype "Atmosphere"
  end
end
if ($planet~startinglocation = "Planet")
  send "q "
end
waiton "What level do you want"
setvar $switchboard~message "Quasar Cannon on planet "&$planet~planet&" is set to "&$planet~totaldamage&". ("&$planet~damagetype&")*"
gosub :switchboard~switchboard
return
