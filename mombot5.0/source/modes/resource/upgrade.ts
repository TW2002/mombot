gosub :LOADVARS~LOADVARS
gosub :HELP~INITIALIZE
setVar $HELP~HELP[1]  $HELP~TAB&"Upgrades planets using products and colonists in sector."
setVar $HELP~HELP[2]  $HELP~TAB&"Products and Colos must on a port or planet in sector"
setVar $HELP~HELP[3]  $HELP~TAB&" "
setVar $HELP~HELP[4]  $HELP~TAB&"   Usage:   "
setVar $HELP~HELP[5]  $HELP~TAB&" "
setVar $HELP~HELP[6]  $HELP~TAB&"   >upgrade   "
setVar $HELP~HELP[7]  $HELP~TAB&"   >upgrade 4 6 10"
setVar $HELP~HELP[8]  $HELP~TAB&"   >upgrade ignore 3 7 11"
setVar $HELP~HELP[9]  $HELP~TAB&" "
setVar $HELP~HELP[10]  $HELP~TAB&"   Upgrades all planets in sector by default. "
setVar $HELP~HELP[11]  $HELP~TAB&"   {planets} will only upgradethe specified planets"
setVar $HELP~HELP[12]  $HELP~TAB&"   {ignore [planets]} will skip the specified planets"
gosub :HELP~HELPFILE

gosub :player~quikstats
setvar $startingprompt $player~current_prompt
if ($startingprompt = "Citadel")
  send "q"
  gosub :planet~getplanetinfo
  setvar $startingplanet $planet~planet
  send "q"
elseif ($startingprompt = "Planet")
  gosub :planet~getplanetinfo
  setvar $startingplanet $planet~planet
  send "q"
elseif ($startingprompt <> "Command")
  setvar $switchboard~message "Upgrade must be run from Command, Planet, or Citadel prompt.*"
  gosub :switchboard~switchboard
  halt
end

getWordPos $user_command_line $pos "ignore" 
if ($pos > 0)
	setVar $ignore 1
else
	setVar $ignore 0
end

if ($ignore = 1)
  setvar $startarg 1
else
  setvar $startarg 0
end

setarray $planetloop~ignorelist 8

setvar $index $startarg
while ($index < 8)
  add $index 1
  getword $user_command_line $tmp $index
  isnumber $isnumber $tmp
  if ($isnumber = 0)
    goto :end_ignoreloop
  end
  if ($tmp < 2)
    goto :end_ignoreloop
  end
  setvar $planetloop~ignorelist[$index] $tmp
  add $index 1
  setvar $isnumber 0
end
:end_ignoreloop

#loadvar $MASSUPGRADESAVED

setvar $gameprefs~bank "MassUpgrade"
setvar $gameprefs~animation[$gameprefs~bank] "OFF"
setvar $gameprefs~abortdisplayall[$gameprefs~bank] "OFF"
setvar $gameprefs~screenpauses[$gameprefs~bank] "OFF"
gosub :gameprefs~setgameprefs

if ($sector = 0)
  send "d"
  settextlinetrigger GETSECTOR :GETSECTOR "Sector  : "
  pause
  :getsector
  getword CURRENTLINE $sector 3
  waiton "Command [TL="
end

if (SECTOR.PLANETCOUNT[$sector] = 0)
  return
end

send "jy"
gosub :PLAYER~QUIKSTATS
setvar $holds $PLAYER~TOTAL_HOLDS

setvar $planetloop~loopsub ":CHECKPLANET"
setvar $planetloop~ignorelist $ignorelist
setvar $planetupgrade~failed 0

logging off
gosub :sector~voidadjacent
gosub :PLANETLOOP
gosub :sector~clearvoidadjacent
logging on

if ($planetupgrade~failed = 0)
  setvar $switchboard~message "Successfully upgraded all planets in sector " $sector ".*"
  gosub :switchboard~switchboard
else
  setvar $switchboard~message "Unable to upgrade all planets in sector " $sector ".*"
  gosub :switchboard~switchboard
end
halt

:CHECKPLANET
setvar $planetupgrade~planetid $planetloop~id
setvar $planetupgrade~sector $sector
setvar $planetupgrade~seek $seek
gosub :PLANETUPGRADE
return

:PLANETLOOP

setvar $planetloop~i 1
setvar $planetloop~ignorecount 0

:PLANETLOOP_I
getword $planetloop~ignorelist $planetloop~ignore[$planetloop~i] $planetloop~i
if ($planetloop~ignore[$planetloop~i] <> 0)
  add $planetloop~i 1
  add $planetloop~ignorecount 1
  goto :PLANETLOOP_I
end
setvar $planetloop~ignorelist ""

setvar $planetloop~found 0
send "l"

settextlinetrigger NOPLANET :PLANETLOOP_NOPLANET "There isn't a planet in this sector."
settextlinetrigger MULTIPLEPLANETS :PLANETLOOP_MULTIPLEPLANETS "Registry# and Planet Name"
settextlinetrigger SINGLEPLANET :PLANETLOOP_SINGLEPLANET "Landing sequence engaged..."
pause

:PLANETLOOP_NOPLANET
killtrigger MULTIPLEPLANETS
killtrigger SINGLEPLANET
return

:PLANETLOOP_MULTIPLEPLANETS
killtrigger SINGLEPLANET
killtrigger NOPLANET
setvar $planetloop~lastid 0

:PLANETLOOP_NEXTPLANET
settexttrigger PLANETSCHECKED :PLANETLOOP_PLANETSCHECKED "Land on which planet <Q to abort>"
settextlinetrigger GETID :PLANETLOOP_GETID "<"
pause

:PLANETLOOP_GETID
getword CURRENTLINE $planetloop~word 1
if ($planetloop~word = "Owned")
  settextlinetrigger GETID :PLANETLOOP_GETID "<"
  pause
end

killtrigger PLANETSCHECKED
setvar $planetloop~line CURRENTLINE
striptext $planetloop~line "<"
striptext $planetloop~line ">"
getword $planetloop~line $planetloop~id 1
if ($planetloop~id = "Land")
  goto :PLANETLOOP_PLANETSCHECKED
end

gosub :PLANETLOOP_SUB_CHECKIGNORE

if (($planetloop~id > $planetloop~lastid) and ($planetloop~ignore = 0))
  send $planetloop~id "*"
  setvar $planetloop~lastid $planetloop~id
  gosub :PLANETLOOP_SUB_CHECK

  if ($planetloop~found <> 0)
    return
  end

  send "ql"
  waitfor "Registry# and Planet Name"
end
goto :PLANETLOOP_NEXTPLANET

:PLANETLOOP_PLANETSCHECKED
killtrigger GETID
send "q*"
return

:PLANETLOOP_SINGLEPLANET
killtrigger MULTIPLEPLANETS
killtrigger NOPLANET
gosub :PLANETLOOP_SUB_CHECK
if ($planetloop~found = 0)
  send "q"
end
return

:PLANETLOOP_SUB_CHECK
settextlinetrigger CHECK_GETPLANET :PLANETLOOP_CHECK_GETPLANET "Planet #"
pause

:PLANETLOOP_CHECK_GETPLANET
getword CURRENTLINE $planetloop~check_planet 2
striptext $planetloop~check_planet "#"

setvar $planetloop~id $planetloop~check_planet
gosub :PLANETLOOP_SUB_CHECKIGNORE

if ($planetloop~ignore = 0)
  gosub $planetloop~loopsub
end

return

:PLANETLOOP_SUB_CHECKIGNORE
setvar $planetloop~j 1
setvar $planetloop~ignore 0

:PLANETLOOP_J
if ($planetloop~j <= $planetloop~ignorecount)
  if ($planetloop~ignore[$planetloop~j] = $planetloop~id)
    setvar $planetloop~ignore 1
  else
    add $planetloop~j 1
    goto :PLANETLOOP_J
  end
end

return

:PLANETUPGRADE

setvar $planetupgrade~failed 0

setvar $planet~noheader 1
gosub :planet~planetinfo
setvar $planetupgrade~level $planet~citadel

setvar $best 0
setvar $bestscore 500000

if ($planet~planet_fuel_rate <> "N/A")
  if (($planet~planet_fuel_colonists / $planet~planet_fuel_rate) <= ($planet~planet_fuel_prod + 1))
    if ($planet~planet_fuel_rate < $bestscore)
      setvar $best 1
      setvar $bestscore $planet~planet_fuel_rate
    end
  end
end

if ($planet~planet_organics_rate <> "N/A")
  if (($planet~planet_organics_colonists / $planet~planet_organics_rate) <= ($planet~planet_organics_prod + 1))
    if ($planet~planet_organics_rate < $bestscore)
      setvar $best 2
      setvar $bestscore $planet~planet_organics_rate
    end
  end
end

if ($planet~planet_equipment_rate <> "N/A")
  if (($planet~planet_equipment_colonists / $planet~planet_equipment_rate) <= ($planet~planet_equipment_prod + 1))
    if ($planet~planet_equipment_rate < $bestscore)
      setvar $best 3
      setvar $bestscore $planet~planet_equipment_rate
    end
  end
end

if ($best = 0)
  setvar $dropcategory 1
else
  setvar $dropcategory $best
end

setvar $planetupgrade~destcategory $dropcategory

if (($planet~buildtime > 0) or ($planetupgrade~level = 6))
  return
end

if ($planetupgrade~level = 0)
  send "cy"
else
  send "cuyq"
end

settextlinetrigger CANTUPGRADE :PLANETUPGRADE_CANTUPGRADE "This Citadel cannot be upgraded further."
settextlinetrigger CANUPGRADE :PLANETUPGRADE_CANUPGRADE "the following:"
pause

:PLANETUPGRADE_CANTUPGRADE
killtrigger CANUPGRADE
return

:PLANETUPGRADE_CANUPGRADE
killtrigger CANTUPGRADE
settextlinetrigger GETCOLOS :PLANETUPGRADE_GETCOLOS "Colonists to support the construction,"
settextlinetrigger GETFUEL :PLANETUPGRADE_GETFUEL "units of Fuel Ore,"
settextlinetrigger GETORG :PLANETUPGRADE_GETORG "units of Organics,"
settextlinetrigger GETEQUIP :PLANETUPGRADE_GETEQUIP "units of Equipment and"
settextlinetrigger GETDAYS :PLANETUPGRADE_GETDAYS "days to construct."
pause

:PLANETUPGRADE_GETCOLOS
getword CURRENTLINE $planetupgrade~colosneeded 1
pause

:PLANETUPGRADE_GETFUEL
getword CURRENTLINE $planetupgrade~fuelneeded 1
pause

:PLANETUPGRADE_GETORG
getword CURRENTLINE $planetupgrade~orgneeded 1
pause

:PLANETUPGRADE_GETEQUIP
getword CURRENTLINE $planetupgrade~equipneeded 1
pause

:PLANETUPGRADE_GETDAYS
getword CURRENTLINE $planetupgrade~daysneeded 1
striptext $planetupgrade~colosneeded ","
striptext $planetupgrade~fuelneeded ","
striptext $planetupgrade~orgneeded ","
striptext $planetupgrade~equipneeded ","
divide $planetupgrade~colosneeded 1000

setvar $planetupgrade~totalcolos ($planet~colo[1] + ($planet~colo[2] + $planet~colo[3]))
subtract $planetupgrade~colosneeded $planetupgrade~totalcolos
subtract $planetupgrade~fuelneeded $planet~amount[1]
subtract $planetupgrade~orgneeded $planet~amount[2]
subtract $planetupgrade~equipneeded $planet~amount[3]

if (($planetupgrade~colosneeded <= 0) and (($planetupgrade~fuelneeded <= 0) and (($planetupgrade~orgneeded <= 0) and ($planetupgrade~equipneeded <= 0))))
  if ($planetupgrade~daysneeded = 0)
    setdelaytrigger UPGRADEPAUSE :PLANETUPGRADE_UPGRADEPAUSE 1000
    pause

    :PLANETUPGRADE_UPGRADEPAUSE
    send "d"
    goto :PLANETUPGRADE
  end

  return
end

send "q"

if ($planetupgrade~fuelneeded > 0)
  setvar $gather~sector $planetupgrade~sector
  setvar $gather~product 1
  setvar $gather~stayonplanet 0
  setvar $gather~ignorelist $planetupgrade~planetid
  setvar $gather~planetid $planetupgrade~planetid
  setvar $gather~quantity $planetupgrade~fuelneeded
  setvar $gather~seek $planetupgrade~seek
  gosub :GATHER

  if ($gather~failed)
    setvar $planetupgrade~failed 1
    return
  end
end

if ($planetupgrade~orgneeded > 0)
  setvar $gather~sector $planetupgrade~sector
  setvar $gather~product 2
  setvar $gather~stayonplanet 0
  setvar $gather~ignorelist $planetupgrade~planetid
  setvar $gather~planetid $planetupgrade~planetid
  setvar $gather~quantity $planetupgrade~orgneeded
  setvar $gather~seek $planetupgrade~seek
  gosub :GATHER

  if ($gather~failed)
    setvar $planetupgrade~failed 1
    return
  end
end

if ($planetupgrade~equipneeded > 0)
  setvar $gather~sector $planetupgrade~sector
  setvar $gather~product 3
  setvar $gather~stayonplanet 0
  setvar $gather~ignorelist $planetupgrade~planetid
  setvar $gather~planetid $planetupgrade~planetid
  setvar $gather~quantity $planetupgrade~equipneeded
  setvar $gather~seek $planetupgrade~seek
  gosub :GATHER

  if ($gather~failed)
    setvar $planetupgrade~failed 1
    return
  end
end

if ($planetupgrade~colosneeded > 0)
  setvar $gather~sector $planetupgrade~sector
  setvar $gather~product "C"
  setvar $gather~stayonplanet 0
  setvar $gather~ignorelist $planetupgrade~planetid
  setvar $gather~quantity $planetupgrade~colosneeded
  setvar $gather~planetid $planetupgrade~planetid
  setvar $gather~destcategory $planetupgrade~destcategory
  setvar $gather~seek $planetupgrade~seek
  gosub :GATHER

  if ($gather~failed)
    setvar $planetupgrade~failed 1
    return
  end
end

send "l" $planetupgrade~planetid "*"
goto :PLANETUPGRADE

:GATHER

setvar $gather~gathered 0
setvar $gather~failed 0

if ($gather~holds = 0)
  gosub :PLAYER~QUIKSTATS
  setvar $gather~holds $PLAYER~TOTAL_HOLDS
end

:GATHER_GOGATHER
if (($gather~quantity - $gather~gathered) < $gather~holds)
  setvar $gather~get ($gather~quantity - $gather~gathered)
else
  setvar $gather~get $gather~holds
end

if ($gather~seek)
  setvar $move~checksub ":GATHER_CHECKSECTOR"
  send "d"
  gosub :move~move
else
  setvar $findproduct~quantity $gather~get
  setvar $findproduct~product $gather~product
  setvar $findproduct~ignorelist $gather~ignorelist
  setvar $findproduct~stayonplanet 1
  setvar $findproduct~sector $gather~sector

  gosub :findproduct~findproduct

  setvar $gather~ignorelist $findproduct~ignorelist

  if ($findproduct~location = 0)
    setvar $gather~failed 1
    send "t"
    return
  end

  setvar $gather~sourcesector $gather~sector
  setvar $gather~found $findproduct~location
end

if ($gather~product = "C")
  setvar $sourcecategory $findproduct~category
  setvar $destcategory $gather~destcategory
end

setvar $source $gather~found
setvar $sourcesector $gather~sourcesector
setvar $dest $gather~planetid
setvar $destsector $gather~sector
setvar $product $gather~product
setvar $quantity ($gather~quantity - $gather~gathered)
setvar $safe 0
gosub :moveproduct

add $gather~gathered $moved

if ($gather~gathered < $gather~quantity)
  send "q"
  goto :GATHER_GOGATHER
end

if ($gather~stayonplanet = 0)
  send "q"
end
return

:GATHER_CHECKSECTOR
setvar $findproduct~quantity $gather~get
setvar $findproduct~product $gather~product
setvar $findproduct~ignorelist $gather~ignorelist
setvar $findproduct~stayonplanet 1
setvar $findproduct~sector $move~cursector

gosub :findproduct~findproduct

setvar $gather~ignorelist $findproduct~ignorelist

if ($findproduct~location <> 0)
  setvar $move~found 1
  setvar $gather~sourcesector $move~cursector
  setvar $gather~found $findproduct~location
end

return

:seekproduct
if ($seek_holds = 0)
  gosub :PLAYER~QUIKSTATS
  setvar $seek_holds $PLAYER~TOTAL_HOLDS
end

:seek_gogather
setvar $MOVE~CHECKSUB ":seek_checksector"
send "d"
gosub :MOVE~MOVE

if ($seek_found = "P")
:seek_buyproduct
if ($seek_product = 1)
setvar $HAGGLE~BUYPROD "Fuel"
elseif ($seek_product = 2)
setvar $HAGGLE~BUYPROD "Organics"
else
setvar $HAGGLE~BUYPROD "Equipment"
end

setvar $HAGGLE~QUANTITY 0
setvar $HAGGLE~SECTOR $seek_source_sector
send "pt"
gosub :HAGGLE~HAGGLE

if ($HAGGLE~ABORT)
goto :seek_buyproduct
end
else
send "tnt"&$seek_product "*q"
end
return

:seek_checksector
setvar $FINDPRODUCT~QUANTITY $seek_holds
setvar $FINDPRODUCT~PRODUCT $seek_product
setvar $FINDPRODUCT~IGNORELIST $seek_ignorelist
setvar $FINDPRODUCT~STAYONPLANET 1
setvar $FINDPRODUCT~SECTOR $MOVE~CURSECTOR

gosub :FINDPRODUCT~FINDPRODUCT

setvar $seek_ignorelist $FINDPRODUCT~IGNORELIST

if ($FINDPRODUCT~LOCATION <> 0)
  setvar $MOVE~FOUND 1
  setvar $seek_source_sector $MOVE~CURSECTOR
  setvar $seek_found $FINDPRODUCT~LOCATION
end

return

:moveproduct
gosub :PLAYER~QUIKSTATS

if ($PLAYER~PLANET_SCANNER = "Yes")
  setvar $pscan 1
else
  setvar $pscan 0
end
setvar $credits $PLAYER~CREDITS
setvar $moved 0
setvar $restore_haggle 0

if (($source = "P") and HAGGLE)
  setvar $restore_haggle 1
  autohaggle off
end

if ($product = 4)
  send "qc;ql " $source "* "
  settextlinetrigger GETMAXFIGS :getmaxfigs "Max Fighters:"
  pause

:getmaxfigs
cuttext CURRENTLINE $product_holds 48 7
striptext $product_holds ","
striptext $product_holds " "
else
setvar $product_holds $PLAYER~TOTAL_HOLDS
end

if ($sourcesector <> $destsector)
setvar $safe 1
end

if ($product = "C")
setvar $pickuptext "snt"&$sourcecategory
setvar $dropofftext "snl"&$destcategory
setvar $waittext "Which production group are you changing?"
elseif ($product = 4)
setvar $pickuptext "mnt"
setvar $dropofftext "mnl"
setvar $waittext "There are currently "
else
setvar $pickuptext "tnt"&$product
setvar $dropofftext "tnl"&$product
setvar $waittext "Which product are you leaving?"
end

if (($source = "P") and ($portquantity = 0))
send "cr*q"
waiton "Commerce report for "

if ($product = 1)
settextlinetrigger GETPRODUCT :getproduct "Fuel Ore   "
elseif ($product = 2)
settextlinetrigger GETPRODUCT :getproduct "Organics   "
else
settextlinetrigger GETPRODUCT :getproduct "Equipment  "
end
pause

:getproduct
if ($product = 1)
getword CURRENTLINE $portquantity 4
else
getword CURRENTLINE $portquantity 3
end
end

if ($source = "P")
if ($portquantity < $quantity)
setvar $quantity $portquantity
end
else
send "d"
setvar $PLANET~NOHEADER 1
gosub :PLANET~PLANETINFO

if ($product = "C")
if ($PLANET~COLO[$sourcecategory] < $quantity)
 setvar $quantity $PLANET~COLO[$sourcecategory]
end
else
if ($PLANET~AMOUNT[$product] < $quantity)
 setvar $quantity $PLANET~AMOUNT[$product]
end
end
end

if ($safe)
setvar $firstrun 1
setvar $finished 0

if ($product = "C")
setvar $planetamount $PLANET~COLO[$sourcecategory]
else
setvar $planetamount $PLANET~AMOUNT[$product]
end

:safecycle
if ($quantity < $product_holds)
setvar $pickup $quantity
else
setvar $pickup $product_holds
end

if ($source = "P")
if ($pickup = 0)
 gosub :sub_landdest
 waiton "Planet #"&$dest
 waiton "Planet command (?=help)"
 gosub :restorehaggle
 return
end

if ($product = 1)
 setvar $buyprod "Fuel"
elseif ($product = 2)
 setvar $buyprod "Organics"
else
 setvar $buyprod "Equipment"
end

:retryhaggle
send "pt"
setvar $trade_sector $sourcesector

if ($pickup < $product_holds)
  setvar $quantity $pickup
end

waiton "Docking..."
settextlinetrigger BUY :buy "We are selling up to "
settextlinetrigger SELL :sell "We are buying up to "
pause

:buy
killtrigger GETCREDITS
killtrigger DONE
settexttrigger ONHAND :buyonhand "]?"
pause

:sell
goto :buy

:buyonhand
getword CURRENTLINE $product 5
if ($product <> $buyprod)
  send "0*"
  settexttrigger GETCREDITS :getcredits "empty cargo holds."
  pause
end
send "*"

settexttrigger GETCREDITS :getcredits "empty cargo holds."
pause

:getcredits
killtrigger CLASS0
killtrigger BUY
killtrigger SELL
getword CURRENTLINE $credits 3
striptext $credits ","
settextlinetrigger BUY :buy "We are selling up to "
settextlinetrigger SELL :sell "We are buying up to "
settexttrigger HAGGLEDONE :haggledone "Command [TL="
pause

:haggledone
killtrigger BUY
killtrigger SELL

if ($abort)
  goto :retryhaggle
end

if ($credits < 10000)
  setvar $finished 1
end
 else
if ($firstrun = 0)
  setvar $PLANET~NOHEADER 1
  gosub :PLANET~PLANETINFO

  if ($product = "C")
    setvar $planetamount $PLANET~COLO[$sourcecategory]
  else
    setvar $planetamount $PLANET~AMOUNT[$product]
  end
end

if ($planetamount < $pickup)
  setvar $pickup $planetamount
end

if ($pickup = 0)
  setvar $finished 1
  send "q"
else
  if ($pickup = $product_holds)
    send $pickuptext "*q"
  else
    send $pickuptext $pickup "*q"
  end
end
 end

 if ($sourcesector <> $destsector)
setvar $warpdest $destsector
gosub :warpto
 end

 if ($finished)
gosub :sub_landdest
waiton "<Preparing ship to land"
 else
if ($pscan or (SECTOR.PLANETCOUNT[$destsector] > 1))
  send "l " $dest "*" $dropofftext "*"
else
  send "l " $dropofftext "*"
end
waiton $waittext
 end

 waiton "Planet command (?=help)"
 subtract $quantity $pickup
 add $moved $pickup

 if (($quantity <= 0) or $finished)
gosub :restorehaggle
return
 end

 send "q"

 if ($sourcesector <> $destsector)
setvar $warpdest $sourcesector
gosub :warpto
 end

 if ($source <> "P")
gosub :sub_landsource
 end

 setvar $firstrun 0
 goto :safecycle
else
 setvar $cycles ($quantity / $product_holds)
 setvar $remainder ($quantity - ($cycles * $product_holds))

 if ($remainder > 0)
add $cycles 1
 end

 if ($source <> "P")
send "q"
 end

 if ($cycles <= 0)
gosub :sub_landdest
gosub :restorehaggle
return
 end

 setvar $GAMEPREFS~BANK "MOVEPRODUCT"
 setvar $GAMEPREFS~ABORTDISPLAYALL[$GAMEPREFS~BANK] "ON"
 setvar $GAMEPREFS~ANSI[$GAMEPREFS~BANK] "ON"
 gosub :GAMEPREFS~SETGAMEPREFS

 setvar $clock 3

:cycle
setvar $send ""

if ($source = "P")
setvar $send "pt"

if ((($product = 2) or ($product = 3)) and (PORT.BUYFUEL[$sourcesector] = 0))
 setvar $send $send&"0*"
end
if (($product = 3) and (PORT.BUYORG[$sourcesector] = 0))
 setvar $send $send&"0*"
end

if (($cycles = 1) and ($remainder > 0))
 setvar $send $send&$remainder&"**"
else
 setvar $send $send&"**"
end

if ((($product = 1) or ($product = 2)) and (PORT.BUYEQUIP[$sourcesector] = 0))
 setvar $send $send&"0*"
end
if (($product = 1) and (PORT.BUYORG[$sourcesector] = 0))
 setvar $send $send&"0*"
end
else
if ($pscan or (SECTOR.PLANETCOUNT[$sourcesector] > 1))
 setvar $send $send&"l"&$source&"*"
else
 setvar $send $send&"l"
end

if (($cycles = 1) and ($remainder > 0))
 setvar $send $send&$pickuptext&$remainder&"*q"
else
 setvar $send $send&$pickuptext&"*q"
end
end

setvar $send $send&"l"&$dest&"*"&$dropofftext&"*q"

send $send
subtract $cycles 1

if (($cycles = 1) and ($remainder > 0))
add $moved $remainder
else
add $moved $product_holds
end

if ($cycles <= 0)
while ($clock < 4)
 waiton $waittext
 add $clock 1
end

setvar $GAMEPREFS~BANK "MOVEPRODUCT"
gosub :GAMEPREFS~SETGAMEPREFS

send "l" $dest "*"
waiton "Planet command (?=help)"
gosub :restorehaggle
return
end

if ($clock > 0)
subtract $clock 1
else
if ($source = "P")
 settextlinetrigger GETCREDITS :cyclegetcredits "Your offer ["
 pause

:cyclegetcredits
getword CURRENTLINE $offer 3
striptext $offer ","
striptext $offer "["
striptext $offer "]"
subtract $credits $offer

if ($credits < 10000)
setvar $cycles 0
end
end
waiton $waittext
end

goto :cycle
end

:warpto
if ((SECTORS > 5000) or ($warpdest < 600))
  send $warpdest "*"
else
  send $warpdest
end

settextlinetrigger MOVEPRODUCT_WARP_ARRIVED :warp_arrived "You are already in that sector!"
settextlinetrigger MOVEPRODUCT_WARP_BEGIN :warp_begin "<Move>"
pause

:warp_begin
killtrigger MOVEPRODUCT_WARP_ARRIVED
settexttrigger MOVEPRODUCT_WARP_START :warp_start "Engage the Autopilot?"
settexttrigger MOVEPRODUCT_WARP_TWARP :warp_twarp "Do you want to engage"
settextlinetrigger MOVEPRODUCT_WARP_SINGLE :warp_single "Sector  :"
pause

:warp_twarp
send "n"

:warp_start
send "e"

:warp_single
killtrigger MOVEPRODUCT_WARP_START
killtrigger MOVEPRODUCT_WARP_TWARP
killtrigger MOVEPRODUCT_WARP_SINGLE
killtrigger MOVEPRODUCT_WARP_ABORT

setvar $warp_stopprompt 1
setvar $warp_mineprompt 1

:warp_mid
killtrigger MOVEPRODUCT_WARP_TOLLFIGS
killtrigger MOVEPRODUCT_WARP_FIGS
killtrigger MOVEPRODUCT_WARP_STOPPROMPT
killtrigger MOVEPRODUCT_WARP_MINES
killtrigger MOVEPRODUCT_WARP_NEXTSECTOR
killtrigger MOVEPRODUCT_WARP_DONE

settextlinetrigger MOVEPRODUCT_WARP_NEXTSECTOR :warp_nextsector "Sector  :"
settextlinetrigger MOVEPRODUCT_WARP_TOLLFIGS :warp_tollfigs "You have to destroy the fighters or pay"
settextlinetrigger MOVEPRODUCT_WARP_FIGS :warp_figs "You have to destroy the fighters to remain"
settexttrigger MOVEPRODUCT_WARP_STOPPROMPT :warp_stopprompt "Stop in this sector"
settexttrigger MOVEPRODUCT_WARP_MINES :warp_minesprompt "Mined Sector:"
settexttrigger MOVEPRODUCT_WARP_DONE :warp_arrived "Command [TL="
pause

:warp_nextsector
setvar $warp_stopprompt 1
setvar $warp_mineprompt 1
goto :warp_mid

:warp_tollfigs
if ($MOVE~ATTACK = 3)
  send "py"
else
  send "a9999*"
end
goto :warp_mid

:warp_figs
send "a9999*"
goto :warp_mid

:warp_stopprompt
if ($warp_stopprompt)
  send "n"
  setvar $warp_stopprompt 0
end
goto :warp_mid

:warp_minesprompt
if ($warp_mineprompt)
  send "n"
  setvar $warp_mineprompt 0
end
goto :warp_mid

:warp_arrived
killtrigger MOVEPRODUCT_WARP_ARRIVED
killtrigger MOVEPRODUCT_WARP_NEXTSECTOR
killtrigger MOVEPRODUCT_WARP_TOLLFIGS
killtrigger MOVEPRODUCT_WARP_FIGS
killtrigger MOVEPRODUCT_WARP_STOPPROMPT
killtrigger MOVEPRODUCT_WARP_MINES
killtrigger MOVEPRODUCT_WARP_BEGIN
killtrigger MOVEPRODUCT_WARP_DONE
return

:restorehaggle
if ($restore_haggle = 1)
  autohaggle on
  setvar $restore_haggle 0
end
return

:sub_landdest
if ($pscan or (SECTOR.PLANETCOUNT[$destsector] > 1))
  send "l " $dest "*"
else
  send "l "
end
return

:sub_landsource
if ($pscan or (SECTOR.PLANETCOUNT[$sourcesector] > 1))
  send "l " $source "*"
else
  send "l"
end
return

# includes:
include "source\include\gameprefs"
include "source\include\findproduct"
include "source\include\haggle"
include "source\include\sector"
include "source\include\loadvars"
include "source\include\move"
include "source\include\help"
include "source\include\switchboard.ts"
