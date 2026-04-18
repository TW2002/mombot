:player~addfigtodata

































if (($player~target > 0) and ($player~target <= SECTORS))
  setsectorparameter $player~target "FIGSEC" TRUE
end
return
:player~buy









setvar $player~overhagglemultiple 147
setvar $player~cyclebuffer 1
setvar $player~cyclebufferlimit 20
setvar $player~buydown_restore_haggle 0
setvar $player~buydown_usenativehaggle 0

if (HAGGLE)
  if ($player~buytype = "s")
    setvar $player~buydown_restore_haggle 1
    autohaggle "OFF"
  else
    setvar $player~buydown_usenativehaggle 1
  end
end

if ($player~buydown_usenativehaggle = 0)
  send "@"
  waiton "Average Interval Lag:"
end
gosub :QUIKSTATS
setvar $player~startinglocation $player~current_prompt

setvar $player~output ""
setvar $player~equiprounds 0
setvar $player~orgrounds 0
setvar $player~fuelrounds 0
if ($player~buydownroundsfromparam <= 0)
  setvar $player~buydownroundsfromparam 999999
end
if ($player~buytype = "w")
  setvar $player~buydown_mode 3
elseif ($player~buytype = "b")
  setvar $player~buydown_mode 2
else
  setvar $player~buydown_mode 1
end
if ($player~buyobject = "e")
  setvar $player~buydown_equiprounds $player~buydownroundsfromparam
  setvar $player~buydown_orgrounds 0
  setvar $player~buydown_fuelrounds 0
elseif ($player~buyobject = "o")
  setvar $player~buydown_equiprounds 0
  setvar $player~buydown_orgrounds $player~buydownroundsfromparam
  setvar $player~buydown_fuelrounds 0
elseif ($player~buyobject = "f")
  setvar $player~buydown_equiprounds 0
  setvar $player~buydown_orgrounds 0
  setvar $player~buydown_fuelrounds $player~buydownroundsfromparam
else
  setvar $player~exit_message "Please use format buy [type] {speed} {#cycles} {override}*"
  return
end

if ($player~startinglocation = "Citadel")
  send "Q"
end
send "t n l 1* t n l 2* t n l 3* s n l1*"
waiton "How many groups of Colonists do you want to leave"
gosub :planet~getplanetinfo
if ($player~startinglocation = "Citadel")
  send "C s* "
else
  send "Q D"
end
gosub :GETINFO
if ($player~total_holds <> $player~empty_holds)
  if ($player~startinglocation <> "Citadel")
    gosub :planet~landingsub
  end
  setvar $switchboard~message "Planet full, cannot empty ship holds*"
  gosub :switchboard~switchboard
  goto :BUYDOWNEXIT
end
gosub :VOIDADJACENT
gosub :GETPORTINFO
if ($player~validportfound <> TRUE)
  echo "*No valid port found*"
  if ($player~startinglocation <> "Citadel")
    gosub :planet~landingsub
  end
  gosub :CLEARADJACENT
  goto :BUYDOWNEXIT
end
if ($player~startinglocation = "Citadel")
  send "Q"
else
  send "L "&$planet~planet&"* "
end
setdelaytrigger INITPAUSE :INITPAUSE 500
pause
:player~initpause
:player~getinputs


setvar $player~turns_needed 0
setvar $player~turns_allowed $player~turns
subtract $player~turns_allowed 1


if ($player~buydown_fuelrounds > 0)
  setvar $player~fuelrounds 0
  setvar $player~planetfuelroom $planet~planet_fuel_max
  subtract $player~planetfuelroom $planet~planet_fuel
  setvar $player~maxfueltobuy $player~fuelselling
  if ($player~fuelselling > $player~planetfuelroom)
    setvar $player~maxfueltobuy $player~planetfuelroom
  end
  setvar $player~maxfuelrounds $player~maxfueltobuy
  divide $player~maxfuelrounds $player~total_holds
  if ($player~maxfuelrounds > $player~turns_allowed)
    setvar $player~maxfuelrounds $player~turns_allowed
  end
  if ($player~maxfuelrounds > $player~buydown_fuelrounds)
    setvar $player~maxfuelrounds $player~buydown_fuelrounds
  end
  if ($player~maxfuelrounds > 0)
    setvar $player~fuelrounds $player~maxfuelrounds
  end
  add $player~turns_needed $player~fuelrounds
  subtract $player~turns_allowed $player~fuelrounds
end

if ($player~buydown_orgrounds > 0)
  setvar $player~orgrounds 0
  setvar $player~planetorgroom $planet~planet_organics_max
  subtract $player~planetorgroom $planet~planet_organics
  setvar $player~maxorgtobuy $player~orgselling
  if ($player~orgselling > $player~planetorgroom)
    setvar $player~maxorgtobuy $player~planetorgroom
  end
  setvar $player~maxorgrounds $player~maxorgtobuy
  divide $player~maxorgrounds $player~total_holds
  if ($player~maxorgrounds > $player~turns_allowed)
    setvar $player~maxorgrounds $player~turns_allowed
  end
  if ($player~maxorgrounds > $player~buydown_orgrounds)
    setvar $player~maxorgrounds $player~buydown_orgrounds
  end
  if ($player~maxorgrounds > 0)
    setvar $player~orgrounds $player~maxorgrounds
  end
  add $player~turns_needed $player~orgrounds
  subtract $player~turns_allowed $player~orgrounds
end

if ($player~buydown_equiprounds > 0)
  setvar $player~equiprounds 0
  setvar $player~planetequiproom $planet~planet_equipment_max
  subtract $player~planetequiproom $planet~planet_equipment
  setvar $player~maxequiptobuy $player~equipselling
  if ($player~equipselling > $player~planetequiproom)
    setvar $player~maxequiptobuy $player~planetequiproom
  end
  setvar $player~maxequiprounds $player~maxequiptobuy
  divide $player~maxequiprounds $player~total_holds
  if ($player~maxequiprounds > $player~turns_allowed)
    setvar $player~maxequiprounds $player~turns_allowed
  end
  if ($player~maxequiprounds > $player~buydown_equiprounds)
    setvar $player~maxequiprounds $player~buydown_equiprounds
  end
  if ($player~maxequiprounds > 0)
    setvar $player~equiprounds $player~maxequiprounds
  end
  add $player~turns_needed $player~equiprounds
  subtract $player~turns_allowed $player~equiprounds
end
if (($player~fuelrounds = 0) and (($player~orgrounds = 0) and ($player~equiprounds = 0)))
  if ($player~startinglocation = "Citadel")
    send "C "
  else
    send "q "
  end
  echo "*Nothing to buy*"
  gosub :CLEARADJACENT
  goto :BUYDOWNEXIT
end
:player~getmode

if ($player~buydown_mode = 1)
  setvar $player~buydown_mode "Speedbuy"
elseif ($player~buydown_mode = 2)
  setvar $player~buydown_mode "Best Price"
elseif ($player~buydown_mode = 3)
  setvar $player~buydown_mode "Worst Price"
end
setvar $player~fuelroundsleft $player~fuelrounds
setvar $player~orgroundsleft $player~orgrounds
setvar $player~equiproundsleft $player~equiprounds
setvar $player~fuel_creds_needed 0
setvar $player~org_creds_needed 0
setvar $player~equip_creds_needed 0


if ($player~fuelrounds > 0)
  setvar $player~fuel_creds_needed $player~fuelrounds
  multiply $player~fuel_creds_needed $player~total_holds
  multiply $player~fuel_creds_needed 30
  if ($player~buydown_mode = "Worst Price")
    multiply $player~fuel_creds_needed 3
    divide $player~fuel_creds_needed 2
  end
end
if ($player~orgrounds > 0)
  setvar $player~org_creds_needed $player~orgrounds
  multiply $player~org_creds_needed $player~total_holds
  multiply $player~org_creds_needed 60
  if ($player~buydown_mode = "Worst Price")
    multiply $player~org_creds_needed 3
    divide $player~org_creds_needed 2
  end
end
if ($player~equiprounds > 0)
  setvar $player~equip_creds_needed $player~equiprounds
  multiply $player~equip_creds_needed $player~total_holds
  multiply $player~equip_creds_needed 100
  if ($player~buydown_mode = "Worst Price")
    multiply $player~equip_creds_needed 3
    divide $player~equip_creds_needed 2
  end
end
setvar $player~total_creds_needed 0
add $player~total_creds_needed $player~fuel_creds_needed
add $player~total_creds_needed $player~org_creds_needed
add $player~total_creds_needed $player~equip_creds_needed
setvar $player~startingcredits $player~credits
if ($player~total_creds_needed > $player~credits)
  setvar $player~cashonhand $planet~citadel_credits
  add $player~cashonhand $player~credits
  if ($player~cashonhand > $player~total_creds_needed)
    send "C"
    send "T T "&$player~credits&"* "
    send "T F "&$player~total_creds_needed&"* "
    setvar $player~credits $player~total_creds_needed
    send "Q"
  else
    if ($player~startinglocation = "Citadel")
      send "C "
    else
      send "q "
    end
    setvar $player~exit_message "Not enough cash onhand"
    gosub :CLEARADJACENT
    goto :BUYDOWNEXIT
  end
end
setvar $player~init_credits $player~credits
:player~buydownequip

if ($player~equiproundsleft > 0)
  send "Q P T  "
  if ($player~fuelselling > 0)
    send "0* "
  end
  if ($player~orgselling > 0)
    send "0*"
  end
  gosub :CHOOSEHAGGLE
  send "L "&$planet~planet&"* t n l 3* "
  subtract $player~equiproundsleft 1
  goto :BUYDOWNEQUIP
end
if ($player~equiprounds > 0)
  if ($player~buydown_mode = "Worst Price")
    setvar $player~output $player~output&" - Equipment overhaggled at "&$player~overhagglemultiple&"*"
  end
end
:player~buydownorg

if ($player~orgroundsleft > 0)
  send "Q P T  "
  if ($player~fuelselling > 0)
    send "0*"
  end
  gosub :CHOOSEHAGGLE
  send "0* L "&$planet~planet&"* t n l 2* "
  subtract $player~orgroundsleft 1
  goto :BUYDOWNORG
end
if ($player~orgrounds > 0)
  if ($player~buydown_mode = "Worst Price")
    setvar $player~output $player~output&" - Organics overhaggled at "&$player~overhagglemultiple&"*"
  end
end
:player~buydownfuel

if ($player~fuelroundsleft > 0)
  send "Q P T "
  gosub :CHOOSEHAGGLE
  send "0* 0* L "&$planet~planet&"* t n l 1* "
  subtract $player~fuelroundsleft 1
  goto :BUYDOWNFUEL
end
if ($player~fuelrounds > 0)
  if ($player~buydown_mode = "Worst Price")
    setvar $player~output $player~output&" - Fuel Ore overhaggled at "&$player~overhagglemultiple&"*"
  end
end
:player~buydownfinish

if ($player~startinglocation = "Citadel")
  send "C "
end
gosub :GETINFO
setvar $player~credits_spent $player~init_credits
subtract $player~credits_spent $player~credits
gosub :CLEARADJACENT
if ($player~startinglocation = "Planet")
  send "L "&$planet~planet&"* "
end
if ($player~credits > $player~startingcredits)
  if ($player~startinglocation = "Citadel")
    send "T T "&($player~credits - $player~startingcredits)&"* "
  end
end
setvar $player~exit_message "Normal Exit"
:player~buydownexit

if ($player~buydown_restore_haggle = 1)
  autohaggle "ON"
  setvar $player~buydown_restore_haggle 0
end
return
:player~choosehaggle






if ($player~buydown_usenativehaggle = 1)
  gosub :BUYNATIVEHAGGLE
elseif ($player~buydown_mode = "Speedbuy")
  gosub :BUYNOHAGGLE
else
  gosub :BUYHAGGLE
end
return
:player~buynativehaggle

setvar $player~empty $player~total_holds
send "*"
settextlinetrigger BUYEMPTY :BUYEMPTY "empty cargo holds"
settextlinetrigger BUYNOTINTERESTED :BUYNOTINTERESTED "We're not interested."
settexttrigger BUYNATIVEDONE :BUYHAGGLESUCCEEDED "Command [TL="
pause
:player~buyhaggle



killtrigger BUYFIRSTOFFER

setvar $player~empty $player~total_holds
send "*"
settextlinetrigger BUYFIRSTOFFER :BUYFIRSTOFFER "We'll sell them for"
pause
:player~buyfirstoffer

gosub :KILLBUYTRIGGERS
getword CURRENTLINE $player~offer 5
striptext $player~offer ","

gosub :SWATHOFF
if ($player~swathoff = 0)
  send "L "&$planet~planet&"* "
  if ($player~startinglocation = "Citadel")
    send "C "
  end
  setvar $player~exit_message $player~swathoffmessage
  goto :BUYDOWNEXIT
end

setvar $player~counter $player~offer
if ($player~buydown_mode = "Best Price")
  multiply $player~counter 92
  divide $player~counter 100
elseif ($player~buydown_mode = "Worst Price")
  multiply $player~counter $player~overhagglemultiple
  divide $player~counter 100
end
send $player~counter&"*"
:player~buyofferloop
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
:player~buyscrewup
gosub :KILLBUYTRIGGERS
if ($player~buydown_mode = "Best Price")
  multiply $player~counter 102
  divide $player~counter 100
elseif ($player~buydown_mode = "Worst Price")
  subtract $player~overhagglemultiple 1
  setvar $player~counter $player~offer
  multiply $player~counter $player~overhagglemultiple
  divide $player~counter 100
end
send $player~counter&"*"
goto :BUYOFFERLOOP
:player~buyprice
gosub :KILLBUYTRIGGERS
setvar $player~old_offer $player~offer
setvar $player~old_counter $player~counter
getword CURRENTLINE $player~offer 5
striptext $player~offer ","
setvar $player~offer_pct $player~offer
multiply $player~offer_pct 1000
divide $player~offer_pct $player~old_offer
if ($player~offer_pct > 990)
  setvar $player~offer_pct 990
end
multiply $player~counter 1000
divide $player~counter $player~offer_pct
if ($player~counter <= $player~old_counter)
  add $player~counter 1
end
send $player~counter&"*"
goto :BUYOFFERLOOP
:player~buyfinaloffer
gosub :KILLBUYTRIGGERS
setvar $player~old_offer $player~offer
setvar $player~old_counter $player~counter
getword CURRENTLINE $player~offer 5
striptext $player~offer ","
setvar $player~offer_change $player~offer
subtract $player~offer_change $player~old_offer
subtract $player~offer_change 1
multiply $player~offer_change 25
divide $player~offer_change 10
subtract $player~counter $player~offer_change
if ($player~counter = $player~old_counter)
  add $player~counter 1
end
add $player~counter 1
send $player~counter&"*"
goto :BUYOFFERLOOP
:player~buynotinterested
gosub :KILLBUYTRIGGERS
send "0* "
send "0* "
goto :BUYHAGGLEFAILED
:player~buyexperience
gosub :KILLBUYTRIGGERS
getword CURRENTLINE $player~exp_bonus 7
add $player~exp $player~exp_bonus
add $player~jetbonus $player~exp_bonus
goto :BUYOFFERLOOP
:player~buyempty
gosub :KILLBUYTRIGGERS
getword CURRENTLINE $player~credits 3
striptext $player~credits ","
setvar $player~oldempty $player~empty
getword CURRENTLINE $player~empty 6
if ($player~oldempty = $player~empty)
  goto :BUYHAGGLEFAILED
else
  goto :BUYHAGGLESUCCEEDED
end
:player~buyhagglefailed
setvar $player~buyhaggle 0
return
:player~buyhagglesucceeded
setvar $player~buyhaggle 1
return
:player~buynohaggle



if ($player~swathoff = 0)

  waiton "How many holds of"
  send "*"
  gosub :SWATHOFF
  send "*"
else
  send "**"
end
setvar $player~cyclebufferlimit 20
add $player~cyclebuffer 1
if ($player~cyclebuffer = $player~cyclebufferlimit)
  setvar $player~cyclebuffer 1
  send "/"
  waiton " Sect "
end
return
:player~killbuytriggers

killtrigger BUYPRICE
killtrigger BUYFINALOFFER
killtrigger BUYNOTINTERESTED
killtrigger BUYEXPERIENCE
killtrigger BUYEMPTY
killtrigger BUYNATIVEDONE
killtrigger BUYSCREWUP1
killtrigger BUYSCREWUP2
killtrigger BUYSCREWUP3
killtrigger BUYSCREWUP4
killtrigger BUYSCREWUP5
killtrigger BUYSCREWUP6
killtrigger BUYSCREWUP7
killtrigger BUYSCREWUP8
killtrigger BUYSCREWUP9
killtrigger BUYSCREWUP10
return
:player~bwarp


send "b"
settexttrigger NOBWARP :NOBWARP "Would you like to place a subspace order for one? "
settexttrigger YESBWARP :YESBWARP "Beam to what sector? (U="
settexttrigger IGBWARP :BWARPPHOTONED "Your ship was hit by a Photon and has been disabled"
pause
:player~nobwarp
gosub :KILLBWARPTRIGGERS
send "*"
setvar $switchboard~message "No Bwarp installed on this planet*"
gosub :switchboard~switchboard
return
:player~yesbwarp
gosub :KILLBWARPTRIGGERS
send $player~warpto&"*"
settexttrigger BWARP_LOCK :BWARP_NO_RANGE "This planetary transporter does not have the range."
settexttrigger NO_BWRP_LOCK :NO_BWARP_LOCK "Do you want to make this transport blind?"
settexttrigger BWARP_READY :BWARP_LOCK "All Systems Ready, shall we engage?"
settextlinetrigger NO_BWARPFUEL :BWARPNOFUEL "This planet does not have enough Fuel Ore to transport you."
pause
:player~bwarp_no_range
gosub :KILLBWARPTRIGGERS
setvar $switchboard~message "Not enough range on this planet's transporter.*"
gosub :switchboard~switchboard
return
:player~no_bwarp_lock
gosub :KILLBWARPTRIGGERS
send "* "
setvar $player~target $player~warpto
setsectorparameter $player~target "FIGSEC" FALSE
setvar $switchboard~message "No fighter down at that destination, aborting*"
gosub :switchboard~switchboard
return
:player~bwarp_lock
gosub :KILLBWARPTRIGGERS
send "y     * "
setvar $player~target $player~warpto
setsectorparameter $player~target "FIGSEC" TRUE
setvar $switchboard~message "B-warp completed.*"
gosub :switchboard~switchboard
return
:player~bwarpnofuel
gosub :KILLBWARPTRIGGERS
setvar $switchboard~message "Not enough fuel on the planet to make the transport!*"
gosub :switchboard~switchboard
return
:player~bwarpphotoned
gosub :KILLBWARPTRIGGERS
setvar $switchboard~message "I have been photoned and can not B-warp!*"
gosub :switchboard~switchboard
return
:player~killbwarptriggers

killtrigger YESBWARP
killtrigger IGBWARP
killtrigger NOBWARP
killtrigger BWARP_LOCK
killtrigger NO_BWRP_LOCK
killtrigger BWARP_READY
killtrigger NO_BWARPFUEL
return
:player~checkcorp


setarray $player~corp_members 10 1
setvar $player~corp_count 0
gosub :QUIKSTATS
if ($player~current_prompt = "Citadel")
  send "xa"
else
  send "ta"
end
waiton "    Corp Member Name                   Sector  Fighters Shields Mines  Credits"
waiton "------------------------------------------------------------------------------"
:player~ta_again

settextlinetrigger TALINE :TA_CHECK
pause
:player~ta_check

getwordpos CURRENTLINE $player~pos "P indicates Trader is on a planet in that sector"
getwordpos CURRENTLINE $player~pos2 "Corporate command ["
if (($player~pos > 0) or ($player~pos2 > 0))
  goto :DONE_TA
end
setvar $player~line CURRENTLINE
trim $player~line
if ($player~line <> "")
  cuttext $player~line $player~name 1 30
  replacetext $player~line $player~name ""
  trim $player~name
  add $player~corp_count 1
  setvar $player~corp_members[$player~corp_count] $player~name
  getword $player~line $player~corp_members[$player~corp_count][1] 1
  replacetext $player~corp_members[$player~corp_count][1] "P" ""
end
goto :TA_AGAIN
:player~done_ta

send "q"
return
:player~checkfortravelname


if ($bot~parm1 = "me")
  if ($bot~command_caller = "self")
    setvar $switchboard~message "I don't think you need to travel to yourself.*"
    gosub :switchboard~switchboard
    halt
  end
  setvar $player~who_called_me $bot~command_caller
  gosub :CHECKCORP
  setvar $player~i 1
  while ($player~i <= $player~corp_count)
    lowercase $player~corp_members[$player~i]
    lowercase $player~who_called_me
    getwordpos $player~corp_members[$player~i] $player~pos $player~who_called_me
    if ($player~pos > 0)
      setvar $bot~parm1 $player~corp_members[$player~i][1]
      goto :GO_AFTER_ME
    end
    add $player~i 1
  end
end
isnumber $player~test $bot~parm1
if ($player~test <> TRUE)
  getwordpos $bot~user_command_line $player~pos "sector:"
  if ($player~pos > 0)
    setvar $player~cline $bot~user_command_line&" "
    gettext $player~cline $bot~parm1 "sector:" " "
    goto :GO_AFTER_ME
  end
  getwordpos $bot~user_command_line $player~pos #34
  if ($player~pos > 0)
    gettext $bot~user_command_line $player~trader #34 #34
    if ($player~trader = FALSE)
      setvar $player~trader $bot~parm1
    end
  else
    setvar $player~trader $bot~parm1
  end


  gosub :CHECKCORP
  setvar $player~i 1
  while ($player~i <= $player~corp_count)
    lowercase $player~corp_members[$player~i]
    lowercase $player~trader
    getwordpos $player~corp_members[$player~i] $player~pos $player~trader
    if ($player~pos > 0)
      setvar $bot~parm1 $player~corp_members[$player~i][1]
      goto :GO_AFTER_ME
    end
    add $player~i 1
  end
end
:player~go_after_me
return
:player~clearadjacent


getsector $player~current_sector $player~sectorinfo
if ($player~sectorinfo.warp[1] = 0)
  setvar $switchboard~message "This sector has no warps, try to scan it first!*"
  gosub :switchboard~switchboard
  return
else
  setvar $player~voidsect 0
  :player~clearvoids
  add $player~voidsect 1
  if ($player~voidsect < 7)
    if ($player~sectorinfo.warp[$player~voidsect] <> 0)
      send "CV0*YN"&$player~sectorinfo.warp[$player~voidsect]&"*Q"
    end
    goto :CLEARVOIDS
  end

  send "/"
  waiton " Sect "
end
return
:player~commasize


format $player~value $player~value "NUMBER"
return
:player~currentprompt


settexttrigger PROMPT :ALLPROMPTSCATCH #145&#8
setdelaytrigger PROMPT_DELAY :CURRENT_PROMPT_DELAY 5000
send #145
pause
:player~current_prompt_delay
settextouttrigger ATKEYS :CURRENT_PROMPT_AT_KEYS
setdelaytrigger PROMPT_DELAY :VERIFYDELAY 30000
pause
:player~current_prompt_at_keys
getouttext $player~out
send $player~out
killtrigger PROMPT_DELAY
return
:player~allpromptscatch
setvar $player~ansiline CURRENTANSILINE
setvar $player~self_destruct_prompt FALSE
getwordpos $player~ansiline $player~pos "ARE YOU SURE CAPTAIN? (Y/N) [N]"
if ($player~pos > 0)
  setvar $player~self_destruct_prompt TRUE
end
killtrigger PROMPT_DELAY
getword CURRENTLINE $player~current_prompt 1
if ($player~current_prompt = 0)
  getword CURRENTANSILINE $player~current_prompt 1
end
striptext $player~current_prompt #145
striptext $player~current_prompt #8
setvar $player~startinglocation $player~current_prompt
return
:player~verifydelay

killalltriggers
disconnect
:player~findjumpsector


setvar $player~red_adj 0
if ($player~startinglocation = "Citadel")
  send "qt*t1*q* "
else
  send "qq* "
end

setvar $player~k 1
while (SECTOR.BACKDOORS[$player~target][$player~k] > 0)
  setvar $player~red_adj SECTOR.BACKDOORS[$player~target][$player~k]
  gosub :TEST_RED_SECTOR
  if ($player~foundsector = TRUE)
    goto :SECTORLOCKED
  end
  add $player~k 1
end

setvar $player~i 1
while (SECTOR.WARPSIN[$player~target][$player~i] > 0)
  setvar $player~red_adj SECTOR.WARPSIN[$player~target][$player~i]
  gosub :TEST_RED_SECTOR
  if ($player~foundsector = TRUE)
    goto :SECTORLOCKED
  end
  add $player~i 1
end
:player~noadjsfound

setvar $player~red_adj 0
return
:player~sectorlocked

if ($player~target = $map~stardock)
  setvar $map~backdoor $player~red_adj
  savevar $map~backdoor
end
return
:player~test_red_sector

setvar $player~foundsector FALSE
send "m "&$player~red_adj&"* y"
settexttrigger TWARPBLIND :TWARPBLIND "Do you want to make this jump blind? "
settexttrigger TWARPLOCKED :TWARPLOCKED "All Systems Ready, shall we engage? "
settextlinetrigger TWARPVOIDED :TWARPVOIDED "Danger Warning Overridden"
settextlinetrigger TWARPADJ :TWARPADJ "<Set NavPoint>"
pause
:player~twarpadj
gosub :KILLFINDJUMPSECTORS
send " * "
return
:player~twarpvoided

gosub :KILLFINDJUMPSECTORS
send " N N "
return
:player~twarplocked

gosub :KILLFINDJUMPSECTORS
send " * "
setvar $player~foundsector TRUE
return
:player~twarpblind

gosub :KILLFINDJUMPSECTORS
send " N "
return
:player~killfindjumpsectors

killtrigger TWARPBLIND
killtrigger TWARPLOCKED
killtrigger TWARPVOIDED
killtrigger TWARPADJ
return
:player~formatnumberforspaces


if ($player~inputvariable < 10)
  setvar $player~outputvariable "    "&$player~inputvariable
elseif ($player~inputvariable < 100)
  setvar $player~outputvariable "   "&$player~inputvariable
elseif ($player~inputvariable < 1000)
  setvar $player~outputvariable "  "&$player~inputvariable
elseif ($player~inputvariable < 10000)
  setvar $player~outputvariable " "&$player~inputvariable
else
  setvar $player~outputvariable $player~inputvariable
end
return
:player~formatpercentagesforspaces


if ($player~inputvariable < 10)
  setvar $player~outputvariable "  ("&$player~inputvariable&"%)"
elseif ($player~inputvariable < 100)
  setvar $player~outputvariable " ("&$player~inputvariable&"%)"
elseif ($player~inputvariable < 1000)
  setvar $player~outputvariable "("&$player~inputvariable&"%)"
else
  setvar $player~outputvariable $player~inputvariable
end
return
:player~getinfo


setvar $player~noflip TRUE
setvar $player~photons 0
setvar $player~towed ""
setvar $player~scan_type "None"
setvar $player~twarp_type 0
setvar $player~corpstring "[0]"
setvar $player~igstat 0
:player~waitoninfo
send "?"
waiton "<!>"
settextlinetrigger GETINFO_CN9_CHECK_1 :GETINFO_CN9_CHECK "<N> Interdictor Control"
settextlinetrigger GETINFO_CN9_CHECK_2 :GETINFO_CN9_CHECK "<N> Move to NavPoint"
settextlinetrigger GETTRADERNAME :GETTRADERNAME "Trader Name    :"
settextlinetrigger GETEXPANDALIGN :GETEXPANDALIGN "Rank and Exp"
settextlinetrigger GETCORP :GETCORP "Corp           #"
settextlinetrigger GETSHIPTYPE :GETSHIPTYPE "Ship Info      :"
settextlinetrigger GETTPW :GETTPW "Turns to Warp  :"
settextlinetrigger GETSECT :GETSECT "Current Sector :"
settextlinetrigger GETTURNS :GETTURNS "Turns left"
settextlinetrigger GETTOW :GETTOW "Tractor Beam   : ON, towing "
settextlinetrigger GETHOLDS :GETHOLDS "Total Holds"
settextlinetrigger GETFIGHTERS :GETFIGHTERS "Fighters       :"
settextlinetrigger GETSHIELDS :GETSHIELDS "Shield points  :"
settextlinetrigger GETPHOTONS :GETPHOTONS "Photon Missiles:"
settextlinetrigger GETSCANTYPE :GETSCANTYPE "LongRange Scan :"
settextlinetrigger GETTWARPTYPE1 :GETTWARPTYPE1 "  (Type 1 Jump):"
settextlinetrigger GETTWARPTYPE2 :GETTWARPTYPE2 "  (Type 2 Jump):"
settextlinetrigger GETCREDITS :GETCREDITS "Credits"
settextlinetrigger CHECKIG :CHECKIG "Interdictor ON :"
send "i"
pause
:player~getinfo_cn9_check
setvar $player~noflip TRUE
pause
:player~gettradername
killtrigger GETINFO_CN9_CHECK_1
killtrigger GETINFO_CN9_CHECK_2
setvar $player~trader_name CURRENTLINE
striptext $player~trader_name "Trader Name    : "
setvar $player~i 1
while ($player~i <= $player~rankslength)
  setvar $player~temp $player~ranks[$player~i]
  striptext $player~temp "31m"
  striptext $player~temp "36m"
  striptext $player~trader_name $player~temp&" "
  add $player~i 1
end
pause
:player~gettow
setvar $player~line CURRENTLINE&"<<|END|>>"
gettext $player~line $player~towed "Tractor Beam   : ON, towing " "<<|END|>>"
pause
:player~getexpandalign
getword CURRENTLINE $player~experience 5
getword CURRENTLINE $player~alignment 7
striptext $player~experience ","
striptext $player~alignment ","
striptext $player~alignment "Alignment="
pause
:player~getcorp
getword CURRENTLINE $player~corp 3
striptext $player~corp ","
setvar $player~corpstring "["&$player~corp&"]"
pause
:player~getshiptype
getwordpos CURRENTLINE $player~shiptypeend "Ported="
subtract $player~shiptypeend 18
cuttext CURRENTLINE $player~ship_type_long 18 $player~shiptypeend
pause
:player~gettpw
getword CURRENTLINE $player~turns_per_warp 5
pause
:player~getsect
getword CURRENTLINE $player~current_sector 4
pause
:player~getturns
getword CURRENTLINE $player~turns 4
if ($player~turns = "Unlimited")
  setvar $player~turns 65000
  setvar $player~unlimitedgame TRUE
end
savevar $player~unlimitedgame
pause
:player~getholds
setvar $player~temp CURRENTLINE&" "
gettext $player~temp $player~ore_holds "Ore=" " "
if ($player~ore_holds = "")
  setvar $player~ore_holds 0
end
gettext $player~temp $player~organic_holds "Organics=" " "
if ($player~organic_holds = "")
  setvar $player~organic_holds 0
end
gettext $player~temp $player~equipment_holds "Equipment=" " "
if ($player~equipment_holds = "")
  setvar $player~equipment_holds 0
end
gettext $player~temp $player~colonist_holds "Colonists=" " "
if ($player~colonist_holds = "")
  setvar $player~colonist_holds 0
end
gettext $player~temp $player~empty_holds "Empty=" " "
if ($player~empty_holds = "")
  setvar $player~empty_holds 0
end
pause
:player~getfighters
getword CURRENTLINE $player~fighters 3
striptext $player~fighters ","
pause
:player~getshields
getword CURRENTLINE $player~shields 4
striptext $player~shields ","
pause
:player~getphotons
getword CURRENTLINE $player~photons 3
pause
:player~getscantype
getword CURRENTLINE $player~scan_type 4
pause
:player~gettwarptype1
getword CURRENTLINE $player~twarp_1_range 4
setvar $player~twarp_type 1
pause
:player~gettwarptype2
getword CURRENTLINE $player~twarp_2_range 4
setvar $player~twarp_type 2
pause
:player~checkig
getword CURRENTLINE $player~igstat 4
pause
:player~getcredits
getword CURRENTLINE $player~credits 3
striptext $player~credits ","
if ($player~igstat = 0)
  setvar $player~igstat "NO IG"
end
:player~getinfodone
killtrigger GETEXPANDALIGN
killtrigger GETCORP
killtrigger GETSHIPTYPE
killtrigger GETTPW
killtrigger GETTOW
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
killtrigger GETINFODONE
killtrigger GETINFODONE2
killtrigger GETINFO_CN9_CHECK_1
killtrigger GETINFO_CN9_CHECK_2

savevar $player~unlimitedgame

if ($player~save)

  savevar $player~credits
  savevar $player~fighters
  savevar $player~shields
  savevar $player~total_holds
  savevar $player~ore_holds
  savevar $player~organic_holds
  savevar $player~equipment_holds
  savevar $player~colonist_holds
  savevar $player~photons
  savevar $player~armids
  savevar $player~limpets
  savevar $player~genesis
  savevar $player~twarp_type
  savevar $player~cloaks
  savevar $player~beacons
  savevar $player~atomic
  savevar $player~corbo
  savevar $player~eprobes
  savevar $player~mine_disruptors
  savevar $player~psychic_probe
  savevar $player~planet_scanner
  savevar $player~scan_type
  savevar $player~alignment
  savevar $player~experience
  savevar $player~ship_number
  savevar $player~trader_name
end
return
:player~getportinfo



if ($player~startinglocation = "Citadel")
  send "S*CR*"
else
  send "*CR*"
end
setvar $player~validportfound FALSE
settextlinetrigger FOUNDPORT :FOUNDPORT2 "Items     Status  Trading % of max OnBoard"
settextlinetrigger NOPORT :NOPORT2 "I have no information about a port in that sector."
settextlinetrigger NOPORT2 :NOPORT2 "You have never visted sector"
settextlinetrigger NOPORT3 :NOPORT2 "credits / next hold"
settextlinetrigger NOPORT4 :NOPORT2 "A  Cargo holds     :"
pause
:player~noport2

gosub :PORTKILLINGTRIGGERS
send "q"
return
:player~foundport2

gosub :PORTKILLINGTRIGGERS
send "q"
setvar $player~fuelselling 0
setvar $player~orgselling 0
setvar $player~equipselling 0
setvar $player~validportfound TRUE
:player~getselling
settextlinetrigger PORTFUELINFO :PORTFUELINFO2 "Fuel Ore   Selling"
settextlinetrigger PORTORGINFO :PORTORGINFO2 "Organics   Selling"
settextlinetrigger PORTEQUIPINFO :PORTEQUIPINFO2 "Equipment  Selling"
settextlinetrigger GOTALLPORTINFO :GOTALLPORTINFO2 "<Computer deactivated>"
pause
:player~portfuelinfo2

getword CURRENTLINE $player~fuelselling 4
settextlinetrigger PORTFUELINFO :PORTFUELINFO2 "Fuel Ore   Selling"
pause
:player~portorginfo2

getword CURRENTLINE $player~orgselling 3
settextlinetrigger PORTORGINFO :PORTORGINFO2 "Organics   Selling"
pause
:player~portequipinfo2

getword CURRENTLINE $player~equipselling 3
settextlinetrigger PORTEQUIPINFO :PORTEQUIPINFO2 "Equipment  Selling"
pause
:player~gotallportinfo2

killtrigger PORTFUELINFO
killtrigger PORTORGINFO
killtrigger PORTEQUIPINFO
killtrigger GOTALLPORTINFO
return
:player~portkillingtriggers

killtrigger FOUNDPORT
killtrigger NOPORT
killtrigger NOPORT2
killtrigger NOPORT3
killtrigger NOPORT4
return
:player~moveintosector


setvar $player~result ""
setvar $player~dropfigs TRUE
setvar $player~result $player~result&"m "&$player~moveintosector&"*"
if (($player~moveintosector > 10) and ($player~moveintosector <> $map~stardock))
  if ($player~fighters > $ship~ship_max_attack)
    setvar $player~result $player~result&"za"&$ship~ship_max_attack&"* * "
  else
    setvar $player~result $player~result&"za"&$player~fighters&"* * "
  end
end
if ($player~surroundfigs <= 0)
  setvar $player~surroundfigs 1
end
if (($player~moveintosector > 10) and ($player~moveintosector <> $map~stardock))
  if ($player~surroundfigs > 0)
    setvar $player~result $player~result&"f  z  "&$player~surroundfigs&"* z  c  d  *  "
  end
  if ($player~surroundlimp > 0)
    setvar $player~result $player~result&"  H  2  Z  "&$player~surroundlimp&"*  Z C  *  "
  end
  if ($player~surroundmine > 0)
    setvar $player~result $player~result&"  H  1  Z  "&$player~surroundmine&"*  Z C  *  "
  end
end
send $player~result
setvar $player~current_sector $player~moveintosector
return
:player~pwarpto
:player~pwarp



setvar $player~pwarpsuccess FALSE
if ($player~scan)
  send "q *c p" $player~warpto "*ys"
else
  send "q *c p" $player~warpto "*y"
end
waiton "Planet #"
getword CURRENTLINE $planet~planet 2
striptext $planet~planet "#"
savevar $planet~planet

settextlinetrigger PWARP_LOCK :PWARP_LOCK "Locating beam pinpointed"
settextlinetrigger NO_PWARP_LOCK :NO_PWARP_LOCK "Your own fighters must be"
settextlinetrigger ALREADY :ALREADY "You are already in that sector!"
settextlinetrigger NO_ORE :NO_ORE "You do not have enough Fuel Ore"
settextlinetrigger NO_PWARP :NOPWARP "This Citadel does not have a Planetary TransWarp"
settextlinetrigger WRONG_NUMBER :WRONG_NUMBER "Invalid Sector number,"
pause
:player~wrong_number
setvar $player~pwarpsuccess FALSE
gosub :KILLPWARPTRIGGERS
setvar $player~msg "Not a valid sector to pwarp to!*"
return
:player~nopwarp

setvar $player~pwarpsuccess FALSE
gosub :KILLPWARPTRIGGERS
setvar $player~msg "Planet Does Not Have A Planetary TransWarp Drive!*"
return
:player~no_pwarp_lock
setvar $player~pwarpsuccess FALSE
gosub :KILLPWARPTRIGGERS
setvar $bot~target $player~warpto
gosub :bot~removefigfromdata
setvar $player~msg "No fighter down at that location!*"
return
:player~no_ore
setvar $player~pwarpsuccess FALSE
gosub :KILLPWARPTRIGGERS
setvar $player~msg "Not enough fuel for that pwarp.*"
return
:player~pwarp_lock
setvar $player~pwarpsuccess TRUE
gosub :KILLPWARPTRIGGERS
waiton "Planet is now in sector"
setvar $player~msg "Planet #"&$planet~planet&" moved to sector "&$player~warpto&".*"
gosub :switchboard~switchboard
setvar $bot~target $player~warpto
loadvar $planet~planet
isnumber $player~test $planet~planet
if ($player~test)
  if (($planet~planet <> ".") and ($planet~planet > 0))
    setsectorparameter $planet~planet "PSECTOR" $bot~target
  end
end
gosub :bot~addfigtodata
return
:player~already
setvar $player~pwarpsuccess TRUE
gosub :KILLPWARPTRIGGERS
setvar $player~msg "Planet already in that sector!.*"
return
:player~killpwarptriggers

killtrigger PWARP_LOCK
killtrigger NO_PWARP_LOCK
killtrigger ALREADY
killtrigger NO_ORE
killtrigger NO_PWARP
killtrigger WRONG_NUMBER
return
:player~quikstats


setvar $player~current_prompt "Undefined"
setvar $player~quikstats_retry 0
if ($player~towed = 0)
  setvar $player~towed ""
end
loadvar $player~unlimitedgame
:player~trypromptagain
killtrigger TOOLONGPROMPT
killtrigger NOPROMPT
killtrigger PROMPT
killtrigger STATLINETRIG
killtrigger GETLINE2
settextlinetrigger PROMPT :ALLPROMPTS #145&#8
settextlinetrigger STATLINETRIG :STATSTART #179
setdelaytrigger TOOLONGPROMPT :TRYPROMPTAGAIN 10000
send #145&"/"
pause
:player~allprompts
setvar $player~ansiline CURRENTANSILINE
setvar $player~self_destruct_prompt FALSE
getwordpos $player~ansiline $player~pos "ARE YOU SURE CAPTAIN? (Y/N) [N]"
if ($player~pos > 0)
  setvar $player~self_destruct_prompt TRUE
end

getword CURRENTLINE $player~current_prompt 1
setvar $player~full_current_prompt CURRENTLINE
striptext $player~full_current_prompt #145
striptext $player~full_current_prompt #8
striptext $player~current_prompt #145
striptext $player~current_prompt #8
settextlinetrigger PROMPT :ALLPROMPTS #145&#8
pause
:player~statstart
killtrigger PROMPT
setvar $player~stats ""
setvar $player~wordy ""
:player~statsline
killtrigger STATLINETRIG
killtrigger GETLINE2
setvar $player~line2 CURRENTLINE
replacetext $player~line2 #179 " "
striptext $player~line2 ","
setvar $player~stats $player~stats&$player~line2
getwordpos $player~line2 $player~pos "Ship"
if ($player~pos > 0)
  goto :GOTSTATS
else
  settextlinetrigger GETLINE2 :STATSLINE
  pause
end
:player~gotstats
killtrigger TOOLONGPROMPT
killtrigger GETLINE2
setvar $player~stats $player~stats&" @@@"
getwordpos $player~stats $player~pos "Sect "
if ($player~pos = 0)
  add $player~quikstats_retry 1
  if ($player~quikstats_retry <= 3)
    goto :TRYPROMPTAGAIN
  end
end
getwordpos $player~stats $player~pos "Figs "
if ($player~pos = 0)
  add $player~quikstats_retry 1
  if ($player~quikstats_retry <= 3)
    goto :TRYPROMPTAGAIN
  end
end
setvar $player~current_word 1
getword $player~stats $player~wordy $player~current_word
:player~parsestats
if ($player~wordy <> "@@@")
  if ($player~wordy = "Sect")
    getword $player~stats $player~current_sector ($player~current_word + 1)
  elseif ($player~wordy = "Turns")
    getword $player~stats $player~turns ($player~current_word + 1)
    if ($player~unlimitedgame = TRUE)
      setvar $player~turns 65000
    end
  elseif ($player~wordy = "Creds")
    getword $player~stats $player~credits ($player~current_word + 1)
  elseif ($player~wordy = "Figs")
    getword $player~stats $player~fighters ($player~current_word + 1)
    savevar $player~fighters
  elseif ($player~wordy = "Shlds")
    getword $player~stats $player~shields ($player~current_word + 1)
    savevar $player~shields
  elseif ($player~wordy = "Hlds")
    getword $player~stats $player~total_holds ($player~current_word + 1)
  elseif ($player~wordy = "Ore")
    getword $player~stats $player~ore_holds ($player~current_word + 1)
  elseif ($player~wordy = "Org")
    getword $player~stats $player~organic_holds ($player~current_word + 1)
  elseif ($player~wordy = "Equ")
    getword $player~stats $player~equipment_holds ($player~current_word + 1)
  elseif ($player~wordy = "Col")
    getword $player~stats $player~colonist_holds ($player~current_word + 1)
  elseif ($player~wordy = "Phot")
    getword $player~stats $player~photons ($player~current_word + 1)
  elseif ($player~wordy = "Armd")
    getword $player~stats $player~armids ($player~current_word + 1)
  elseif ($player~wordy = "Lmpt")
    getword $player~stats $player~limpets ($player~current_word + 1)
  elseif ($player~wordy = "GTorp")
    getword $player~stats $player~genesis ($player~current_word + 1)
  elseif ($player~wordy = "TWarp")
    getword $player~stats $player~twarp_type ($player~current_word + 1)
  elseif ($player~wordy = "Clks")
    getword $player~stats $player~cloaks ($player~current_word + 1)
  elseif ($player~wordy = "Beacns")
    getword $player~stats $player~beacons ($player~current_word + 1)
  elseif ($player~wordy = "AtmDt")
    getword $player~stats $player~atomic ($player~current_word + 1)
  elseif ($player~wordy = "Corbo")
    getword $player~stats $player~corbo ($player~current_word + 1)
  elseif ($player~wordy = "EPrb")
    getword $player~stats $player~eprobes ($player~current_word + 1)
  elseif ($player~wordy = "MDis")
    getword $player~stats $player~mine_disruptors ($player~current_word + 1)
  elseif ($player~wordy = "PsPrb")
    getword $player~stats $player~psychic_probe ($player~current_word + 1)
  elseif ($player~wordy = "PlScn")
    getword $player~stats $player~planet_scanner ($player~current_word + 1)
  elseif ($player~wordy = "LRS")
    getword $player~stats $player~scan_type ($player~current_word + 1)
  elseif ($player~wordy = "Aln")
    getword $player~stats $player~alignment ($player~current_word + 1)
  elseif ($player~wordy = "Exp")
    getword $player~stats $player~experience ($player~current_word + 1)
  elseif ($player~wordy = "Corp")
    getword $player~stats $player~corp ($player~current_word + 1)
    setvar $player~corpnumber $player~corp
    savevar $player~corpnumber
  elseif ($player~wordy = "Ship")
    getword $player~stats $player~ship_number ($player~current_word + 1)
    getword $player~stats $player~ship_type ($player~current_word + 2)
  end
  add $player~current_word 1
  getword $player~stats $player~wordy $player~current_word
  goto :PARSESTATS
end
if ($player~current_prompt = "Undefined")
  settextlinetrigger PROMPTAFTERSTATS :PROMPTAFTERSTATS #145&#8
  setdelaytrigger NOPROMPT :NOPROMPT 1000
  pause
end
goto :DONEQUIKSTATS
:player~promptafterstats
killtrigger NOPROMPT
setvar $player~ansiline CURRENTANSILINE
setvar $player~self_destruct_prompt FALSE
getwordpos $player~ansiline $player~pos "ARE YOU SURE CAPTAIN? (Y/N) [N]"
if ($player~pos > 0)
  setvar $player~self_destruct_prompt TRUE
end
getword CURRENTLINE $player~current_prompt 1
setvar $player~full_current_prompt CURRENTLINE
striptext $player~full_current_prompt #145
striptext $player~full_current_prompt #8
striptext $player~current_prompt #145
striptext $player~current_prompt #8
goto :DONEQUIKSTATS
:player~noprompt
killtrigger PROMPTAFTERSTATS
goto :DONEQUIKSTATS
:player~donequikstats
killtrigger STATLINETRIG
killtrigger GETLINE2
killtrigger PROMPT
savevar $player~unlimitedgame
if ($player~save)
  savevar $player~corp
  savevar $player~credits
  savevar $player~current_sector
  savevar $player~turns
  savevar $player~fighters
  savevar $player~shields
  savevar $player~total_holds
  savevar $player~ore_holds
  savevar $player~organic_holds
  savevar $player~equipment_holds
  savevar $player~colonist_holds
  savevar $player~photons
  savevar $player~armids
  savevar $player~limpets
  savevar $player~genesis
  savevar $player~twarp_type
  savevar $player~cloaks
  savevar $player~beacons
  savevar $player~atomic
  savevar $player~corbo
  savevar $player~eprobes
  savevar $player~mine_disruptors
  savevar $player~psychic_probe
  savevar $player~planet_scanner
  savevar $player~scan_type
  savevar $player~alignment
  savevar $player~experience
  savevar $player~ship_number
  savevar $player~trader_name
end
return
:player~removefigfromdata



getsectorparameter $player~target "FIGSEC" $player~check
if ($player~check = TRUE)
  getsectorparameter 2 "FIG_COUNT" $player~figcount
  setsectorparameter 2 "FIG_COUNT" ($player~figcount - 1)
end
setsectorparameter $player~target "FIGSEC" FALSE
return
:player~discod


setvar $player~tagline "["&$bot~command&"]"
setvar $player~taglineb "["&$bot~command&"]"
killalltriggers
echo "**"&ANSI_14&$player~taglineb&ANSI_15&" Disconnected **"
:player~disco_test
if (CONNECTED <> TRUE)
  setdelaytrigger EMANCIPATE_CPU :EMANCIPATE_CPU 3000
  echo "**"&ANSI_14&$player~taglineb&ANSI_15&" Auto Resume Initiated - Awaiting Connection!**"
  pause
  :player~emancipate_cpu
  goto :DISCO_TEST
end
waitfor "(?="
setdelaytrigger WAITINGABIT :WAITINGABIT 3000
echo "**"&ANSI_14&$player~taglineb&ANSI_15&" Connected - Waiting For Command Prompt!**"
pause
:player~waitingabit
killalltriggers
gosub :QUIKSTATS
if ($player~current_prompt = "Command")
  send "'{"&$switchboard~bot_name&"} "&$player~taglineb&" - Restarting!**"
  waitfor "Message sent on sub-space channel"
  goto :INAC
elseif ($player~current_prompt = "Citadel")
  send "'{"&$switchboard~bot_name&"} "&$player~taglineb&" - Restarting!**"
  waitfor "Message sent on sub-space channel"
  send "qqqq**"
  goto :INAC
else
  send " p d 0* 0* 0* * *** * c q q q q q z 2 2 c q * z * *** * * '"&$player~taglineb&"Attempting to Reach Correct Prompt...*"
  settextlinetrigger EMQ_COMPLETE :EMQ_DELAY "Attempting to Reach Correct Prompt..."
  setdelaytrigger EMQ_DELAY :EMQ_DELAY 3000
  pause
  :player~emq_delay
  killalltriggers
  goto :DISCO_TEST
end
:player~setconnectiontriggers

killtrigger DISCOD1
killtrigger DISCOD2
seteventtrigger DISCOD1 :DISCOD "CONNECTION LOST"
seteventtrigger DISCOD2 :DISCOD "Connections have been temporarily disabled."
return
:player~startcnsettings


send "CN"
settextlinetrigger ANSI1 :CNCHECK "(1) ANSI graphics            - Off"
settextlinetrigger ANIM1 :CNCHECK "(2) Animation display        - On"
settextlinetrigger PAGE1 :CNCHECK "(3) Page on messages         - On"
settextlinetrigger SETSSCHN :SETSSCHN "(4) Sub-space radio channel"
settextlinetrigger SILENCE1 :CNCHECK "(7) Silence ALL messages     - Yes"
settextlinetrigger ABORTDISPLAY1 :CNCHECK "(9) Abort display on keys    - ALL KEYS"
settextlinetrigger MESSAGEDISPLAY1 :CNCHECK "(A) Message Display Mode     - Long"
settextlinetrigger SCREENPAUSES1 :CNCHECK "(B) Screen Pauses            - Yes"
settextlinetrigger ONLINEAUTOFLEE0 :CNCDONE "(C) Online Auto Flee         - Off"
settextlinetrigger ONLINEAUTOFLEE1 :CNCALMOSTDONE "(C) Online Auto Flee         - On"
pause
:player~cncheck
gosub :GETCNC
pause
:player~setsschn
getword CURRENTLINE $bot~subspace 6
if ($bot~subspace = 0)
  getrnd $bot~subspace 101 60000
  send 4&$bot~subspace&"*"
end
savevar $bot~subspace
pause
:player~cncalmostdone
gosub :GETCNC
:player~cncdone
send "QQ"
killtrigger 1
killtrigger 2
settexttrigger 1 :SUBSTARTCNCONTINUE "Command [TL="
settexttrigger 2 :SUBSTARTCNCONTINUE "Citadel command (?=help)"
pause
:player~substartcncontinue
killtrigger 1
killtrigger 2
return
:player~getcnc

getword CURRENTLINE $player~cnc 1
striptext $player~cnc "("
striptext $player~cnc ")"
send $player~cnc&"  "
return
:player~starthaggle



setvar $player~hfactor 5
:player~units
killtrigger PTRADE
killtrigger STRADE
killtrigger GO
killtrigger DONE
gosub :SETCONNECTIONTRIGGERS
settexttrigger PTRADE :BUNITS "do you want to buy ["
settexttrigger STRADE :SUNITS "do you want to sell ["
settextlinetrigger GO :FINISHHAGGLE "Agreed, "
settextlinetrigger DONE :DONEHAGGLE "empty cargo holds."
pause
:player~finishhaggle

killtrigger DONE
gosub :HAGGLE
:player~donehaggle



return
:player~bunits

setvar $player~multiplier (100 - $player~hfactor)
goto :UNITS
:player~sunits

setvar $player~multiplier (100 + $player~hfactor)
goto :UNITS
:player~haggle

setvar $player~ni 0
setvar $player~midhag "-1"
setvar $player~nocred 0
killtrigger 1
killtrigger 0
killtrigger DONEHAGGLING
killtrigger DONHAG
killtrigger OFFERME
gosub :SETCONNECTIONTRIGGERS
settexttrigger DONEHAG :DONE_HAGGLE "Command [TL="
settexttrigger DONEHAGGLING :DONE_HAGGLE "empty cargo holds."
settexttrigger OFFERME :OFFERME "] ?"
pause
:player~offerme

getword CURRENTLINE $player~offer 3
striptext $player~offer "["
striptext $player~offer "]"
striptext $player~offer ","
striptext $player~offer "?"
setvar $player~orig_offer $player~offer
:player~rehaggle

killtrigger 1
killtrigger 0
killtrigger 2
killtrigger 3
setvar $player~offer (($player~orig_offer * $player~multiplier) / 100)
send $player~offer "*"
add $player~midhag 1
waitfor $player~offer
if ($player~multiplier > 100)
  subtract $player~multiplier 1
else
  add $player~multiplier 1
end
gosub :SETCONNECTIONTRIGGERS
send "@"
waiton "Average Interval Lag:"
settexttrigger 0 :DONE_HAGGLE "How many holds of"
settexttrigger 1 :REHAGGLE "Your offer"
settexttrigger 2 :DONEHAG "We're not interested."
settexttrigger 3 :NOCREDS "You only have"
pause
:player~nocreds

setvar $player~nocred 1
send "0*0*"
goto :DONE_HAGGLE
:player~donehag

setvar $player~ni 1
:player~done_haggle

killtrigger DONEHAG
killtrigger 0
killtrigger 1
killtrigger 2
killtrigger 3
killtrigger REHAGGLE
killtrigger DONEHAGGLING
killtrigger OFFERME
killalltriggers
return
:player~swathoff


if ($player~swathoff = FALSE)
  settexttrigger SWATHISON :SWATHISON "Command [TL="
  setdelaytrigger SWATHISOFF :SWATHISOFF 2000
  pause
  :player~swathison

  killtrigger SWATHISOFF
  killtrigger SWATHISON
  setvar $player~swathoffmessage "Detected SWATH Autohaggle"
  setvar $player~swathoff FALSE
  saveglobal $player~swathoff
  return
  :player~swathisoff

  killtrigger SWATHISOFF
  killtrigger SWATHISON
  setvar $player~swathoff TRUE
  saveglobal $player~swathoff
end
return
:player~topoff
:player~do_topoff_again



killtrigger TOPOFF_SUCCESS
killtrigger TOPOFF_FAILURE1
killtrigger TOPOFF_FAILURE2
send " F"
waiton "Your ship can support up to"
getword CURRENTLINE $player~ftrs_to_leave 10
striptext $player~ftrs_to_leave ","
striptext $player~ftrs_to_leave " "
if ($player~ftrs_to_leave < 1)
  setvar $player~ftrs_to_leave 1
end
send " "&$player~ftrs_to_leave&" * c d"
settextlinetrigger TOPOFF_SUCCESS :TOPOFF_SUCCESS "Done. You have "
settextlinetrigger TOPOFF_FAILURE1 :DO_TOPOFF_AGAIN "You don't have that many fighters available."
settextlinetrigger TOPOFF_FAILURE2 :DO_TOPOFF_AGAIN "Too many fighters in your fleet!  You are limited to"
pause
:player~topoff_success
killtrigger TOPOFF_FAILURE1
killtrigger TOPOFF_FAILURE2
return
:player~turnoffansi


send "c n"
killalltriggers
waiton "(1) ANSI graphics"
getword CURRENTLINE $player~ansistatus 5
waiton "(2) Animation display"
getword CURRENTLINE $player~animationstatus 5
if ($player~animationstatus = "On")
  send 2
end
if ($player~ansistatus = "On")
  send "1 q q"
else
  send "q q"
end
waiton "<Computer deactivated>"
return
:player~turnonansi


send "c n"
killalltriggers
waiton "(1) ANSI graphics"
getword CURRENTLINE $player~ansistatus 5
if ($player~ansistatus = "Off")
  send "1 q q"
else
  send "q q"
end
waiton "<Computer deactivated>"
return
:player~twarp


setvar $player~twarpsuccess FALSE
setvar $player~original 9999999
setvar $player~target 0
if ($player~current_sector = $player~warpto)
  setvar $player~msg "Already in that sector!"
  goto :TWARPDONE
elseif (($player~warpto <= 0) or ($player~warpto > SECTORS))
  setvar $player~msg "Destination sector is out of range!"
  goto :TWARPDONE
end
if ($player~twarp_type = "No")
  setvar $player~msg "No T-warp drive on this ship!"
  goto :TWARPDONE
end
if (($player~photons > 0) and ($settings~override <> TRUE))
  setvar $switchboard~message "You can't twarp with photons without override!*"
  gosub :switchboard~switchboard
  setvar $player~msg "You can't twarp with photons without override!"
  goto :TWARPDONE
end
loadvar $ship~ship_max_attack
if ($ship~ship_max_attack = 0)
  setvar $ship~ship_max_attack 9999
end
if (($player~fighters > 0) and ($player~fighters < $ship~ship_max_attack))
  setvar $ship~ship_max_attack $player~fighters
end

setvar $player~weareadjdock FALSE
if (($player~warpto = $map~stardock) or ($player~warpto <= 10))
  setvar $player~target $player~warpto
  setvar $player~a 1
  setvar $player~start_sector $player~current_sector
  while ($player~a <= SECTOR.WARPCOUNT[$player~start_sector])
    setvar $player~adj_start SECTOR.WARPS[$player~start_sector][$player~a]
    if ($player~adj_start = $player~target)
      setvar $player~weareadjdock TRUE
    end
    add $player~a 1
  end
end
setvar $player~red_adj 0
if (($player~alignment < 1000) and ((($player~weareadjdock = FALSE) and (($player~warpto = $map~stardock) or ($player~warpto <= 10)))))
  setvar $player~target $player~warpto
  gosub :FINDJUMPSECTOR
  if ($player~red_adj <> 0)
    setvar $player~original $player~warpto
    setvar $player~warpto $player~red_adj
  else
    waitfor "Command [TL="
    setvar $player~msg "Cannot Find Jump Sector Adjacent Sector "&$player~target&"."
    goto :TWARPDONE
  end
end
if ($player~red_adj <> 0)
  send "* mz" $player~warpto "*"
else
  if ($player~startinglocation = "Citadel")
    send "q t*t1* q q * c u y q mz" $player~warpto "*"
  elseif ($player~startinglocation = "Planet")
    send "t*t1* q q * c u y q mz" $player~warpto "*"
  else
    if ($player~fasttwarp)
      send "mz" $player~warpto "*"
    else
      send "q q q n n 0 * c u y q mz" $player~warpto "*"
    end
  end
end
settexttrigger THERE :ADJ_WARP "You are already in that sector!"
settextlinetrigger ADJ_WARP :ADJ_WARP "Sector  : "&$player~warpto&" "
settexttrigger LOCKING :LOCKING "Do you want to engage the TransWarp drive?"
settexttrigger IGD :TWARPIGD "An Interdictor Generator in this sector holds you fast!"
settexttrigger NOTURNS :TWARPPHOTONED "Your ship was hit by a Photon and has been disabled"
settexttrigger NOROUTE :TWARPNOROUTE "Do you really want to warp there? (Y/N)"
settextlinetrigger NO_FUEL :TWARPNOFUEL "You do not have enough Fuel Ore"
pause
:player~adj_warp
gosub :KILLTWARPTRIGGERS
send "z*"
goto :TWARP_ADJ
:player~locking
gosub :KILLTWARPTRIGGERS
send "y"
settextlinetrigger TWARP_LOCK :TWARP_LOCK "TransWarp Locked"
settextlinetrigger NO_TWRP_LOCK :NO_TWARP_LOCK "No locating beam found"
settextlinetrigger TWARP_ADJ :TWARP_ADJ "<Set NavPoint>"
settextlinetrigger NO_FUEL :TWARPNOFUEL "You do not have enough Fuel Ore"
pause
:player~twarpnofuel
gosub :KILLTWARPTRIGGERS
setvar $player~msg "Not enough fuel for T-warp."
goto :TWARPDONE
:player~twarp_adj
gosub :KILLTWARPTRIGGERS
send "za  "&$ship~ship_max_attack&"* * r * "
setvar $player~msg "That sector is next door, just plain warping."
setvar $player~twarpsuccess TRUE
goto :TWARPDONE
:player~twarpnoroute
gosub :KILLTWARPTRIGGERS
send "n* z* "
setvar $player~msg "No route available to that sector!"
goto :TWARPDONE
:player~no_twarp_lock
gosub :KILLTWARPTRIGGERS
send "n* z* "
setvar $player~target $player~warpto
setsectorparameter $player~target "FIGSEC" FALSE
setvar $player~msg "No fighters at T-warp point!"
goto :TWARPDONE
:player~twarpigd
gosub :KILLTWARPTRIGGERS
setvar $player~msg "My ship is being held by Interdictor!"
goto :TWARPDONE
:player~twarpphotoned
gosub :KILLTWARPTRIGGERS
setvar $player~msg "I have been photoned and can not T-warp!"
goto :TWARPDONE
:player~twarp_lock
gosub :KILLTWARPTRIGGERS
setvar $player~target $player~warpto
setsectorparameter $player~target "FIGSEC" TRUE
send "y   *     "
setvar $player~msg "T-warp completed."
setvar $player~twarpsuccess TRUE
:player~twarpdone
if (($player~twarpsuccess = TRUE) and (($player~original = $map~stardock) or ($player~original <= 10)))
  send "* m "&$player~original&"*  za"&$ship~ship_max_attack&"* * "
end
if ($player~twarpsuccess = TRUE)
  setvar $player~current_sector $player~warpto
end
return
:player~killtwarptriggers

killtrigger THERE
killtrigger ADJ_WARP
killtrigger LOCKING
killtrigger IGD
killtrigger NOTURNS
killtrigger NOROUTE
killtrigger TWARP_LOCK
killtrigger NO_TWRP_LOCK
killtrigger TWARP_ADJ
killtrigger NO_FUEL
return
:player~voidadjacent



getsector $player~current_sector $player~sectorinfo
if ($player~sectorinfo.warp[1] = 0)
  send "'This sector has no warps, maybe you need to scan it first*"
  halt
else
  setvar $player~voidsect 0
  :player~voids
  add $player~voidsect 1
  if ($player~voidsect < 7)
    if ($player~sectorinfo.warp[$player~voidsect] <> 0)
      send "CV"&$player~sectorinfo.warp[$player~voidsect]&"*Q"
    end
    goto :VOIDS
  end

  send "/"
  waiton " Sect "
end
return
:player~init



setarray $player~traders 50
setarray $player~faketraders 50
setarray $player~emptyships 100
setvar $player~rankslength 46
setarray $player~ranks $player~rankslength
setvar $player~ranks[1] "36mCivilian"
setvar $player~ranks[2] "36mPrivate 1st Class"
setvar $player~ranks[3] "36mPrivate"
setvar $player~ranks[4] "36mLance Corporal"
setvar $player~ranks[5] "36mCorporal"
setvar $player~ranks[6] "36mStaff Sergeant"
setvar $player~ranks[7] "36mGunnery Sergeant"
setvar $player~ranks[8] "36m1st Sergeant"
setvar $player~ranks[9] "36mSergeant Major"
setvar $player~ranks[10] "36mSergeant"
setvar $player~ranks[11] "31mAnnoyance"
setvar $player~ranks[12] "31mNuisance 3rd Class"
setvar $player~ranks[13] "31mNuisance 2nd Class"
setvar $player~ranks[14] "31mNuisance 1st Class"
setvar $player~ranks[15] "31mMenace 3rd Class"
setvar $player~ranks[16] "31mMenace 2nd Class"
setvar $player~ranks[17] "31mMenace 1st Class"
setvar $player~ranks[18] "31mSmuggler 3rd Class"
setvar $player~ranks[19] "31mSmuggler 2nd Class"
setvar $player~ranks[20] "31mSmuggler 1st Class"
setvar $player~ranks[21] "31mSmuggler Savant"
setvar $player~ranks[22] "31mRobber"
setvar $player~ranks[23] "31mTerrorist"
setvar $player~ranks[24] "31mInfamous Pirate"
setvar $player~ranks[25] "31mNotorious Pirate"
setvar $player~ranks[26] "31mDread Pirate"
setvar $player~ranks[27] "31mPirate"
setvar $player~ranks[28] "31mGalactic Scourge"
setvar $player~ranks[29] "31mEnemy of the State"
setvar $player~ranks[30] "31mEnemy of the People"
setvar $player~ranks[31] "31mEnemy of Humankind"
setvar $player~ranks[32] "31mHeinous Overlord"
setvar $player~ranks[33] "31mPrime Evil"
setvar $player~ranks[34] "36mChief Warrant Officer"
setvar $player~ranks[35] "36mWarrant Officer"
setvar $player~ranks[36] "36mEnsign"
setvar $player~ranks[37] "36mLieutenant J.G."
setvar $player~ranks[38] "36mLieutenant Commander"
setvar $player~ranks[39] "36mLieutenant"
setvar $player~ranks[40] "36mCommander"
setvar $player~ranks[41] "36mCaptain"
setvar $player~ranks[42] "36mCommodore"
setvar $player~ranks[43] "36mRear Admiral"
setvar $player~ranks[44] "36mVice Admiral"
setvar $player~ranks[45] "36mFleet Admiral"
setvar $player~ranks[46] "36mAdmiral"
setvar $player~lasttarget ""


return
:player~current_prompt



settexttrigger PROMPT :ALLPROMPTSCATCH #145&#8
setdelaytrigger PROMPT_DELAY :CURRENT_PROMPT_DELAY 5000
send #145
pause
:player~current_prompt_delay
settextouttrigger ATKEYS :CURRENT_PROMPT_AT_KEYS
setdelaytrigger PROMPT_DELAY :VERIFYDELAY 30000
pause
:player~current_prompt_at_keys
getouttext $player~out
send $player~out
killtrigger PROMPT_DELAY
return
:player~allpromptscatch
killtrigger PROMPT_DELAY
getword CURRENTLINE $player~current_prompt 1
if ($player~current_prompt = 0)
  getword CURRENTANSILINE $player~current_prompt 1
end
striptext $player~current_prompt #145
striptext $player~current_prompt #8
setvar $player~startinglocation $player~current_prompt
return
:player~verifydelay

killalltriggers
disconnect
:player~mow


if ($bot~startinglocation = "Citadel")
  send "q"
  gosub :planet~getplanetinfo
  send "c "
end
if ($bot~startinglocation = "Command")
  gosub :ship~getshipstats
  setvar $player~mow_ship_max_attack $ship~ship_max_attack
elseif ($ship~ship_max_attack <= 0)
  setvar $player~mow_ship_max_attack 99991111
else
  setvar $player~mow_ship_max_attack $ship~ship_max_attack
end
setvar $player~destination $bot~parm1
isnumber $player~number $player~destination
if ($player~number <> 1)
  send "'{" $switchboard~bot_name "} - Sector entered is not a number, cannot mow!*"
  return
elseif (($player~destination <= 0) or ($player~destination > SECTORS))
  send "'{" $switchboard~bot_name "} - Sector entered is not valid, cannot mow!*"
  return
end
setvar $player~destination ($bot~parm1 + 0)
getwordpos " "&$bot~user_command_line&" " $player~pos "kill"
if ($player~pos > 0)
  setvar $player~mow_kill TRUE
else
  setvar $player~mow_kill FALSE
end
getwordpos " "&$bot~user_command_line&" " $player~pos "saveme"
if ($player~pos > 0)
  setvar $player~mow_saveme TRUE
else
  setvar $player~mow_saveme FALSE
end
getwordpos " "&$bot~user_command_line&" " $player~pos " p "
if ($player~pos > 0)
  setvar $player~are_we_docking TRUE
else
  setvar $player~are_we_docking FALSE
end
setvar $player~figstodrop $bot~parm2
isnumber $player~number $player~figstodrop
if ($player~number <> TRUE)
  setvar $player~figstodrop 0
else
  if ($player~figstodrop > 50000)
    send "'{" $switchboard~bot_name "} - Cannot drop more than 50,000 fighters per sector!*"
    return
  elseif ($player~figstodrop > $player~fighters)
    send "'{" $switchboard~bot_name "} - Fighters to drop cannot exceed total ship fighters.*"
    return
  end
end
if ($player~mow_ship_max_attack > $player~fighters)
  setvar $player~mow_ship_max_attack 9999
end
if ($player~current_sector <> CURRENTSECTOR)
  setvar $player~current_sector 0
end
gosub :GETCOURSE
setvar $player~j 2
setvar $player~result "q q q * "
while ($player~j <= $player~courselength)
  if ($player~mowcourse[$player~j] <> $player~current_sector)
    setvar $player~result $player~result&"m  "&$player~mowcourse[$player~j]&"*   "
    if (($player~mowcourse[$player~j] > 10) and ($player~mowcourse[$player~j] <> $map~stardock))
      setvar $player~result $player~result&"za  "&$player~mow_ship_max_attack&"* *  "
    end
    if (($player~figstodrop > 0) and (($player~mowcourse[$player~j] > 10) and (($player~mowcourse[$player~j] <> $map~stardock) and ($player~j > 2))))
      setvar $player~result $player~result&"f "&$player~figstodrop&" * c "&$player~fighter_deploy_type&" "
      setvar $player~target $player~mowcourse[$player~j]
      gosub :ADDFIGTODATA
    end
    if (($player~j >= $player~courselength) and (($player~mow_saveme = TRUE) and ($player~figstodrop = 0)))
      setvar $player~result $player~result&"f 1 * c "&$player~fighter_deploy_type&" "
      setvar $player~target $player~mowcourse[$player~j]
      gosub :ADDFIGTODATA
    end
    if (($player~called = FALSE) and (($player~mow_saveme = TRUE) and ($player~j >= ($player~courselength - 2))))
      setvar $player~result $player~result&"'"&$player~destination&"=saveme*  "
      setvar $player~called TRUE
    end
  end
  add $player~j 1
end
setvar $player~docking_instructions ""
if ($player~are_we_docking)
  setvar $player~docking_instructions " p z t *"
  if ($player~destination = $map~stardock)
    setvar $player~docking_instructions " p z s g y g q h *"
  end
  setvar $player~result $player~result&$player~docking_instructions
elseif (($player~mow_saveme = TRUE) and ($player~startinglocation = "Citadel"))
  setvar $player~i 0
  while ($player~i < 8)
    add $player~i 1

    setvar $player~result $player~result&"l j"&#8&$planet~planet&"*  *  j  c  *  *  "
  end
end
send $player~result
gosub :QUIKSTATS
if ($player~are_we_docking = FALSE)
  send "*"
end
return
:player~units


killtrigger PTRADE
killtrigger STRADE
killtrigger GO
killtrigger DONE
gosub :SETCONNECTIONTRIGGERS
settexttrigger PTRADE :BUNITS "do you want to buy ["
settexttrigger STRADE :SUNITS "do you want to sell ["
settextlinetrigger GO :FINISHHAGGLE "Agreed, "
settextlinetrigger DONE :DONEHAGGLE "empty cargo holds."
pause
:player~finishhaggle

killtrigger DONE
gosub :HAGGLE
:player~donehaggle


return
:player~formatpercentageforspaces

if ($player~inputvariable < 10)
  setvar $player~outputvariable "  ("&$player~inputvariable&"%)"
elseif ($player~inputvariable < 100)
  setvar $player~outputvariable " ("&$player~inputvariable&"%)"
elseif ($player~inputvariable < 1000)
  setvar $player~outputvariable "("&$player~inputvariable&"%)"
else
  setvar $player~outputvariable $player~inputvariable
end
return
:player~capstoppingpoint

return
:player~checkingfigs


if ($player~fighters <= 0)
  gosub :QUIKSTATS
  if ($player~fighters <= 0)
    echo ANSI_12 "*You have no fighters.*" ANSI_7
    goto :STOPPINGPOINT
  end
end
if ((($player~current_sector > 10) and ($player~current_sector <> $map~stardock)) and ($player~beaconpos > 0))
  setvar $player~targetstring $player~targetstring&"*"
end
if (($sector~emptyshipcount + ($sector~faketradercount + $sector~realtradercount)) > 0)
  setvar $player~i 0
  while ($player~i < ($sector~emptyshipcount + $sector~faketradercount))
    setvar $player~targetstring $player~targetstring&"* "
    add $player~i 1
  end
  setvar $player~c 1
  while (($player~c <= $sector~realtradercount) and ($player~isfound = FALSE))

    if ($player~traders[$player~c][1] = $player~corp)
      setvar $player~targetstring $player~targetstring&"* "
    elseif ((($player~current_sector <= 10) or ($player~current_sector = $map~stardock)) and ($player~traders[$player~c][2] = TRUE))
      setvar $player~targetstring $player~targetstring&"* "
    else
      setvar $player~isfound TRUE
      setvar $player~targetstring $player~targetstring&"zy z"
    end
    add $player~c 1
  end
else
  setvar $switchboard~message "You have no targets.*"
  gosub :switchboard~switchboard
  goto :STOPPINGPOINT
end
if ($player~isfound = TRUE)
  setvar $player~attackstring ""
  while ($player~fighters > 0)
    if ($player~fighters < $ship~ship_max_attack)
      setvar $player~attackstring $player~attackstring&$player~targetstring&$player~fighters&"* * "
      setvar $player~fighters 0
    else
      setvar $player~attackstring $player~attackstring&$player~targetstring&$ship~ship_max_attack&"* * "
      setvar $player~fighters ($player~fighters - $ship~ship_max_attack)
    end
  end
else
  setvar $switchboard~message "You have no valid targets.*"
  gosub :switchboard~switchboard
  goto :STOPPINGPOINT
end
send $player~attackstring&"* "
gosub :QUIKSTATS
:player~continuesurroundsector


if ($player~already_checked_ship <> TRUE)
  gosub :ship~getshipstats
end
if ($ship~ship_max_attack > $player~fighters)
  setvar $ship~ship_max_attack ($player~fighters / 2)
end

setvar $player~i 1
setvar $player~surroundstring "c v 0* y* "&$player~current_sector&"* q "
setvar $player~surroundoutput ""
setvar $player~yourowncount 0
while (SECTOR.WARPS[$player~current_sector][$player~i] > 0)
  setvar $player~adj_sec SECTOR.WARPS[$player~current_sector][$player~i]
  getdistance $player~distance $player~adj_sec $player~current_sector
  if ($player~distance <= 0)
    send "^f"&$player~adj_sec&"*"&$player~current_sector&"*q"
    waiton "ENDINTERROG"
    getdistance $player~distance $player~adj_sec $player~current_sector
  end
  setvar $player~containsshieldedplanet FALSE
  setvar $player~p 1
  while ($player~p <= SECTOR.PLANETCOUNT[$player~adj_sec])
    getword SECTOR.PLANETS[$player~adj_sec][$player~p] $player~test 1
    if ($player~test = "<<<<")
      setvar $player~containsshieldedplanet TRUE
    end
    add $player~p 1
  end
  setvar $player~tempoffodd $ship~ship_offensive_odds
  multiply $player~tempoffodd $ship~ship_max_attack
  divide $player~tempoffodd 12
  setvar $player~figowner SECTOR.FIGS.OWNER[$player~adj_sec]
  setvar $player~mineowner SECTOR.MINES.OWNER[$player~adj_sec]
  setvar $player~limpowner SECTOR.LIMPETS.OWNER[$player~adj_sec]
  if (($player~surroundoverwrite = FALSE) and (($player~figowner = "belong to your Corp") or ($player~figowner = "yours")))
    add $player~yourowncount 1
    if ($player~yourowncount = $player~totalwarps)
      setvar $player~surroundoutput $player~surroundoutput&"(Surround) All sectors around are friendly fighters.*"
    end
  elseif (SECTOR.FIGS.QUANTITY[$player~adj_sec] >= $player~tempoffodd)
    setvar $player~surroundoutput $player~surroundoutput&"(Surround) Too many fighters in sector "&$player~adj_sec&".*"
  elseif (($player~adj_sec <= 10) or ($player~adj_sec = $map~stardock))
    setvar $player~surroundoutput $player~surroundoutput&"(Surround) Avoided Fed Space, sector "&$player~adj_sec&".*"
  elseif ((SECTOR.PLANETCOUNT[$player~adj_sec] > 0) and $player~surroundavoidallplanets)
    setvar $player~surroundoutput $player~surroundoutput&"(Surround) Avoided planet in sector "&$player~adj_sec&".*"
  elseif (($player~containsshieldedplanet = TRUE) and ($player~surroundavoidshieldedonly = TRUE))
    setvar $player~surroundoutput $player~surroundoutput&"(Surround) Avoided shielded planet in sector "&$player~adj_sec&".*"
  elseif ($player~distance > 1)
    setvar $player~surroundoutput $player~surroundoutput&"(Surround) Avoided one way in sector "&$player~adj_sec&".*"
  elseif (($player~surroundpassive = TRUE) and (((SECTOR.ANOMOLY[$player~adj_sec] = TRUE) and (($player~limpowner <> "belong to your Corp") and ($player~limpowner <> "yours"))) or (SECTOR.FIGS.QUANTITY[$player~adj_sec] > 0) or ((SECTOR.MINES.QUANTITY[$player~adj_sec] > 0) and (($player~mineowner <> "belong to your Corp") and ($player~mineowner <> "yours")))))
    setvar $player~surroundoutput $player~surroundoutput&"(Surround) Avoided non-passive situation in sector "&$player~adj_sec&".*"
  else
    if ($player~dropoffensive = TRUE)
      setvar $player~deployfig "o"
    elseif ($player~droptoll = TRUE)
      setvar $player~deployfig "t"
    else
      setvar $player~deployfig "d"
    end
    setvar $player~surroundstring $player~surroundstring&" m z "&$player~adj_sec&"* z a "&$ship~ship_max_attack&"* * "
    if (($player~surroundfigs > 0) and ($player~fighters > $player~surroundfigs))
      setvar $player~surroundstring $player~surroundstring&"f z"&$player~surroundfigs&"*zc"&$player~deployfig&"*  "
      subtract $player~fighters $player~surroundfigs
      setvar $player~target $player~adj_sec
      setsectorparameter $player~target "FIGSEC" TRUE
    end
    if (($player~surroundlimp > 0) and (($player~limpets > $player~surroundlimp) and ($player~limpets > 0)))
      setvar $player~surroundstring $player~surroundstring&"h2 z"&$player~surroundlimp&"*zc* "
      subtract $player~limpets $player~surroundlimp
    end

    if (($player~surroundmine > 0) and (($player~armids > $player~surroundmine) and ($player~armids > 0)))
      setvar $player~surroundstring $player~surroundstring&"h1 z"&$player~surroundmine&"*zc* "
      subtract $player~armids $player~surroundmine
    end

    setvar $player~surroundstring $player~surroundstring&"m z"&$player~current_sector&"* "
    setvar $player~surroundstring $player~surroundstring&"za "&$ship~ship_max_attack&"* * "
  end
  add $player~i 1
end
send $player~surroundstring
return
:player~fastattack



setvar $player~targetstring "a"
setvar $player~isfound FALSE
getwordpos $sector~sectordata $player~beaconpos "[0m[35mBeacon  [1;33m:"
:player~fastcapture



setvar $player~isfound FALSE
setvar $player~targetisalien FALSE
setvar $player~stillshields FALSE
getwordpos $sector~sectordata $player~beaconpos "[0m[35mBeacon  [1;33m:"
:player~getcourse






setarray $player~mowcourse 80
setvar $player~sectors ""
if (($player~starting_point <= 0) and ($player~starting_point <> ""))
  setvar $player~starting_point ""
end
settextlinetrigger SECTORLINETRIG :SECTORSLINE " > "
send "^f"&$player~starting_point&"*"&$player~destination&"*"
pause
:player~gotsectors


setvar $player~sectors $player~sectors&" :::"
setvar $player~courselength 0
setvar $player~index 1
goto :KEEPGOING
:player~holo_kill
:player~holo_kill_get_current_sector





setvar $player~hkill_start_sector $player~current_sector
setvar $player~killsector 0
setvar $player~idx 1
while ($player~idx <= SECTOR.WARPCOUNT[$player~current_sector])
  setvar $player~test_sector SECTOR.WARPS[$player~current_sector][$player~idx]
  setvar $player~safeplanets TRUE
  setvar $player~containsshieldedplanet FALSE
  if (SECTOR.PLANETCOUNT[$player~test_sector] > 0)
    setvar $player~p 1
    while ($player~p <= SECTOR.PLANETCOUNT[$player~test_sector])
      getword SECTOR.PLANETS[$player~test_sector][$player~p] $player~test 1
      if ($player~test = "<<<<")
        setvar $player~containsshieldedplanet TRUE
      end
      add $player~p 1
    end
    if ($player~surroundavoidallplanets)
      setvar $player~safeplanets FALSE
    elseif ($player~containsshieldedplanet and $player~surroundavoidshieldedonly)
      setvar $player~safeplanets FALSE
    end
  end
  if (($player~test_sector <> $map~stardock) and (($player~test_sector > 10) and ((SECTOR.TRADERCOUNT[$player~test_sector] > 0) and ($player~safeplanets = TRUE))))
    setvar $player~killsector $player~test_sector
    goto :HOLO_KILL_KILLEM
  end
  add $player~idx 1
end
goto :HOLO_KILL_NO_TARGETS
:player~holo_kill_get_prompt
:player~holo_kill_killem





send "'{" $switchboard~bot_name "} - HoloKill - Attacking sector "&$player~test_sector&".*"
setvar $player~no_str ""
setvar $player~no_cnt SECTOR.SHIPCOUNT[$player~killsector]
setvar $player~no_idx 1
while ($player~no_idx <= $player~no_cnt)
  setvar $player~no_str $player~no_str&"n"
  add $player~no_idx 1
end
send " c v 0 * y n "&$player~test_sector&" * q "
if ($player~startinglocation = "Citadel")
  send " qmnt*qqz* "
end
send " m z "&$player~test_sector&" *  *  z  a  99999  *  z  a  99999  *  R  *  f  z  1  *  z  c  d  *   "
setvar $player~kill_idx 1
if ($player~surround_before_hkill = TRUE)
  gosub :QUIKSTATS
  gosub :SURROUND
  setvar $player~insurround_before_hkill FALSE
  gosub :QUIKSTATS
end

gosub :CURRENT_PROMPT
if ($player~current_prompt <> "Command")
  setvar $switchboard~message "Wrong prompt for holokill kill.*"
  return
end
gosub :sector~getsectordata
gosub :FASTATTACK

send "m "&$player~hkill_start_sector&" *  *  z  a  99999  *  z  a  99999  *  R  *  f  z  1  *  z  c  d  *   "
if ($player~cit = TRUE)
  send " l "&$planet~planet&" * n n * j m * * * j c  *  "
end
gosub :QUIKSTATS
if ($player~current_sector <> $player~hkill_start_sector)
  send "'"&$switchboard~bot_name " call*"
else
  setvar $switchboard~message "Attack made and back in original sector!*"
end
return
:player~holo_kill_kill_check




settextlinetrigger NOSCAN1 :HOLO_KILL_NOSCANNER "Handle which mine type, 1 Armid or 2 Limpet"
settextlinetrigger NOSCAN2 :HOLO_KILL_NOSCANNER "You don't have a long range scanner."
settextlinetrigger SCANNED :HOLO_KILL_SCANDONE "Select (H)olo Scan or (D)ensity Scan or (Q)uit? [D] H"
if ($player~current_prompt = "Citadel")
  send " qqqz* sh*  l "&$planet~planet&" * j c * "
  setvar $player~cit TRUE
else
  send " sh*"
end
pause
:player~holo_kill_noscanner


killalltriggers
setvar $switchboard~message "You don't have a HoloScanner!*"
send " *  "
return
:player~holo_kill_no_targets


setvar $switchboard~self_command TRUE
setvar $switchboard~message "No Enemies found adjacent!*"
return
:player~holo_kill_scandone


killalltriggers
gosub :ship~getshipstats
:player~keepgoing


getword $player~sectors $player~mowcourse[$player~index] $player~index
while ($player~mowcourse[$player~index] <> ":::")
  add $player~courselength 1
  add $player~index 1
  getword $player~sectors $player~mowcourse[$player~index] $player~index
end
return
:player~movein_nope


killtrigger MOVEIN_THERE
send "R"
:player~movein_there


killtrigger MOVEIN_NOPE
return
:player~nocappingtargets


killtrigger NOCTARGET
killtrigger FOUNDCAPTARGET
send "* "
:player~nopath



send "q '{" $switchboard~bot_name "} - No path to that sector, cannot mow!*"
setvar $player~mowcourse 0
setvar $player~courselength 0
return
:player~sectorsline


killtrigger SECTORLINETRIG
killtrigger SECTORLINETRIG2
killtrigger SECTORLINETRIG3
killtrigger SECTORLINETRIG4
killtrigger DONEPATH
killtrigger DONEPATH2
setvar $player~line CURRENTLINE
replacetext $player~line ">" " "
striptext $player~line "("
striptext $player~line ")"
setvar $player~line $player~line&" "
getwordpos $player~line $player~pos "So what's the point?"
getwordpos $player~line $player~pos2 ": ENDINTERROG"
getwordpos $player~line $player~pos3 " No route within "
if (($player~pos > 0) or ($player~pos2 > 0) or ($player~pos3 > 0))
  goto :NOPATH
end
getwordpos $player~line $player~pos " sector "
getwordpos $player~line $player~pos2 "TO"
if (($player~pos <= 0) and ($player~pos2 <= 0))
  setvar $player~sectors $player~sectors&" "&$player~line
end
getwordpos $player~line $player~pos " "&$player~destination&" "
getwordpos $player~line $player~pos2 "("&$player~destination&")"
getwordpos $player~line $player~pos3 "TO"
if ((($player~pos > 0) or ($player~pos2 > 0)) and ($player~pos3 <= 0))
  send "* q "
  goto :GOTSECTORS
else
  settextlinetrigger SECTORLINETRIG :SECTORSLINE " > "
  settextlinetrigger SECTORLINETRIG2 :SECTORSLINE " "&$player~destination&" "
  settextlinetrigger SECTORLINETRIG3 :SECTORSLINE " "&$player~destination
  settextlinetrigger SECTORLINETRIG4 :SECTORSLINE "("&$player~destination&")"
  settextlinetrigger DONEPATH :SECTORSLINE "So what's the point?"
  settextlinetrigger DONEPATH2 :SECTORSLINE ": ENDINTERROG"
end
pause
:player~startsurround




send "szh* "
killtrigger SURROUNDSECTOR
settexttrigger SURROUNDSECTOR :CONTINUESURROUNDSECTOR "["&$player~current_sector&"]"
pause
:player~stoppingpoint


return
