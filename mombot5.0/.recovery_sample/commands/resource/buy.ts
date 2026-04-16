goto :_START_
:SWATHOFF



if ($SWATHOFF = FALSE)
  settexttrigger SWATHISON :SWATHISON "Command [TL="
  setdelaytrigger SWATHISOFF :SWATHISOFF 2000
  pause
  :SWATHISON

  killalltriggers
  setvar $SWATHOFFMESSAGE "Detected SWATH Autohaggle"
  setvar $SWATHOFF FALSE
  return
  :SWATHISOFF

  killalltriggers
  setvar $SWATHOFF TRUE
end
return
:CHOOSEHAGGLE



if ($BUYDOWN_MODE = "Speedbuy")
  gosub :BUYNOHAGGLE
else
  gosub :PLAYER~ISEPHAGGLE
  if ($PLAYER~ISEPHAGGLE)
    killalltriggers
    if ($BUYDOWN_MODE = "Worst Price")

      loadvar $BOT~WORSTPRICE
      setvar $ORIGINAL_WORSTPRICE_VALUE $BOT~WORSTPRICE
      setvar $BOT~WORSTPRICE TRUE
      savevar $BOT~WORSTPRICE
    end
    send "*"
    waitfor "Agreed,"
    settextlinetrigger TRADEFIN :TRADEFIN "empty cargo holds"
    pause
    :TRADEFIN
    killalltriggers
    getword CURRENTLINE $NCREDITS 3
    striptext $NCREDITS ","

    if ($NCREDITS = $CCREDITS)
      setvar $REPORT 1
    else
      setvar $CCREDITS $NCREDITS
    end
  else
    gosub :BUYHAGGLE
  end
end


return
:BUYHAGGLE


setvar $EMPTY $PLAYER~TOTAL_HOLDS
send "*"
settextlinetrigger BUYFIRSTOFFER :BUYFIRSTOFFER "We'll sell them for"
pause
:BUYFIRSTOFFER

getword CURRENTLINE $OFFER 5
striptext $OFFER ","

gosub :SWATHOFF
if ($SWATHOFF = 0)
  send "L "&$PLANET~PLANET&"* "
  if ($STARTINGLOCATION = "Citadel")
    send "C "
  end
  setvar $EXIT_MESSAGE $SWATHOFFMESSAGE
  goto :BUYDOWNEXIT
end

setvar $COUNTER $OFFER
if ($BUYDOWN_MODE = "Best Price")
  multiply $COUNTER 92
  divide $COUNTER 100
elseif ($BUYDOWN_MODE = "Worst Price")
  multiply $COUNTER $OVERHAGGLEMULTIPLE
  divide $COUNTER 100
end
send $COUNTER&"*"
:BUYOFFERLOOP
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
:BUYSCREWUP
killalltriggers
if ($BUYDOWN_MODE = "Best Price")
  multiply $COUNTER 102
  divide $COUNTER 100
elseif ($BUYDOWN_MODE = "Worst Price")
  subtract $OVERHAGGLEMULTIPLE 1
  setvar $COUNTER $OFFER
  multiply $COUNTER $OVERHAGGLEMULTIPLE
  divide $COUNTER 100
end
send $COUNTER&"*"
goto :BUYOFFERLOOP
:BUYPRICE
killalltriggers
setvar $OLD_OFFER $OFFER
setvar $OLD_COUNTER $COUNTER
getword CURRENTLINE $OFFER 5
striptext $OFFER ","
setvar $OFFER_PCT $OFFER
multiply $OFFER_PCT 1000
divide $OFFER_PCT $OLD_OFFER
if ($OFFER_PCT > 990)
  setvar $OFFER_PCT 990
end
multiply $COUNTER 1000
divide $COUNTER $OFFER_PCT
if ($COUNTER <= $OLD_COUNTER)
  add $COUNTER 1
end
send $COUNTER&"*"
goto :BUYOFFERLOOP
:BUYFINALOFFER
killalltriggers
setvar $OLD_OFFER $OFFER
setvar $OLD_COUNTER $COUNTER
getword CURRENTLINE $OFFER 5
striptext $OFFER ","
setvar $OFFER_CHANGE $OFFER
subtract $OFFER_CHANGE $OLD_OFFER
subtract $OFFER_CHANGE 1
multiply $OFFER_CHANGE 25
divide $OFFER_CHANGE 10
subtract $COUNTER $OFFER_CHANGE
if ($COUNTER = $OLD_COUNTER)
  add $COUNTER 1
end
add $COUNTER 1
send $COUNTER&"*"
goto :BUYOFFERLOOP
:BUYNOTINTERESTED
killalltriggers
send "0* "
send "0* "
goto :BUYHAGGLEFAILED
:BUYEXPERIENCE
killalltriggers
getword CURRENTLINE $EXP_BONUS 7
add $EXP $EXP_BONUS
add $JETBONUS $EXP_BONUS
goto :BUYOFFERLOOP
:BUYEMPTY
killalltriggers
getword CURRENTLINE $PLAYER~CREDITS 3
striptext $PLAYER~CREDITS ","
setvar $OLDEMPTY $EMPTY
getword CURRENTLINE $EMPTY 6
if ($OLDEMPTY = $EMPTY)
  goto :BUYHAGGLEFAILED
else
  goto :BUYHAGGLESUCCEEDED
end
:BUYHAGGLEFAILED
setvar $BUYHAGGLE 0
return
:BUYHAGGLESUCCEEDED
setvar $BUYHAGGLE 1
return
:BUYNOHAGGLE


if ($SWATHOFF = 0)
  waiton "How many holds of"
  send "*"
  gosub :SWATHOFF
  send "*"
else
  send "**"
end
add $CYCLEBUFFER 1
if ($CYCLEBUFFER = $CYCLEBUFFERLIMIT)
  setvar $CYCLEBUFFER 1
  send "/"
  waiton " Sect "
end
return
:INITIATE_BUY_DOWN

setvar $PLAYER~TURNS_NEEDED 0
setvar $PLAYER~TURNS_ALLOWED $PLAYER~TURNS
subtract $PLAYER~TURNS_ALLOWED 1


if ($BUYDOWN_FUELROUNDS > 0)
  setvar $FUELROUNDS 0
  setvar $PLANET~PLANETFUELROOM $PLANET~PLANET_FUEL_MAX
  subtract $PLANET~PLANETFUELROOM $PLANET~PLANET_FUEL
  setvar $MAXFUELTOBUY $FUELSELLING
  if ($FUELSELLING > $PLANET~PLANETFUELROOM)
    setvar $MAXFUELTOBUY $PLANET~PLANETFUELROOM
  end
  setvar $MAXFUELROUNDS $MAXFUELTOBUY
  divide $MAXFUELROUNDS $PLAYER~TOTAL_HOLDS
  if ($MAXFUELROUNDS > $PLAYER~TURNS_ALLOWED)
    setvar $MAXFUELROUNDS $PLAYER~TURNS_ALLOWED
  end
  if ($MAXFUELROUNDS > $BUYDOWN_FUELROUNDS)
    setvar $MAXFUELROUNDS $BUYDOWN_FUELROUNDS
  end
  if ($MAXFUELROUNDS > 0)
    setvar $FUELROUNDS $MAXFUELROUNDS
  end
  add $PLAYER~TURNS_NEEDED $FUELROUNDS
  subtract $PLAYER~TURNS_ALLOWED $FUELROUNDS
end

if ($BUYDOWN_ORGROUNDS > 0)
  setvar $ORGROUNDS 0
  setvar $PLANET~PLANETORGROOM $PLANET~PLANET_ORGANICS_MAX
  subtract $PLANET~PLANETORGROOM $PLANET~PLANET_ORGANICS
  setvar $MAXORGTOBUY $ORGSELLING
  if ($ORGSELLING > $PLANET~PLANETORGROOM)
    setvar $MAXORGTOBUY $PLANET~PLANETORGROOM
  end
  setvar $MAXORGROUNDS $MAXORGTOBUY
  divide $MAXORGROUNDS $PLAYER~TOTAL_HOLDS
  if ($MAXORGROUNDS > $PLAYER~TURNS_ALLOWED)
    setvar $MAXORGROUNDS $PLAYER~TURNS_ALLOWED
  end
  if ($MAXORGROUNDS > $BUYDOWN_ORGROUNDS)
    setvar $MAXORGROUNDS $BUYDOWN_ORGROUNDS
  end
  if ($MAXORGROUNDS > 0)
    setvar $ORGROUNDS $MAXORGROUNDS
  end
  add $PLAYER~TURNS_NEEDED $ORGROUNDS
  subtract $PLAYER~TURNS_ALLOWED $ORGROUNDS
end

if ($BUYDOWN_EQUIPROUNDS > 0)
  setvar $EQUIPROUNDS 0
  setvar $PLANET~PLANETEQUIPROOM $PLANET~PLANET_EQUIPMENT_MAX
  subtract $PLANET~PLANETEQUIPROOM $PLANET~PLANET_EQUIPMENT
  setvar $MAXEQUIPTOBUY $EQUIPSELLING
  if ($EQUIPSELLING > $PLANET~PLANETEQUIPROOM)
    setvar $MAXEQUIPTOBUY $PLANET~PLANETEQUIPROOM
  end
  setvar $MAXEQUIPROUNDS $MAXEQUIPTOBUY
  divide $MAXEQUIPROUNDS $PLAYER~TOTAL_HOLDS
  if ($MAXEQUIPROUNDS > $PLAYER~TURNS_ALLOWED)
    setvar $MAXEQUIPROUNDS $PLAYER~TURNS_ALLOWED
  end
  if ($MAXEQUIPROUNDS > $BUYDOWN_EQUIPROUNDS)
    setvar $MAXEQUIPROUNDS $BUYDOWN_EQUIPROUNDS
  end
  if ($MAXEQUIPROUNDS > 0)
    setvar $EQUIPROUNDS $MAXEQUIPROUNDS
  end
  add $PLAYER~TURNS_NEEDED $EQUIPROUNDS
  subtract $PLAYER~TURNS_ALLOWED $EQUIPROUNDS
end
if (($FUELROUNDS = 0) and (($ORGROUNDS = 0) and ($EQUIPROUNDS = 0)))
  if ($STARTINGLOCATION = "Citadel")
    send "C "
  else
    send "q "
  end
  setvar $EXIT_MESSAGE "Nothing to buy"
  gosub :CLEARADJACENT
  goto :BUYDOWNEXIT
end
:GETMODE

if ($BUYDOWN_MODE = 1)
  setvar $BUYDOWN_MODE "Speedbuy"
elseif ($BUYDOWN_MODE = 2)
  setvar $BUYDOWN_MODE "Best Price"
  setvar $BOT~WORSTPRICE FALSE
  savevar $BOT~WORSTPRICE
elseif ($BUYDOWN_MODE = 3)
  setvar $BUYDOWN_MODE "Worst Price"
end
send "'*{" $BOT~BOT_NAME "}*Buying down using "&$BUYDOWN_MODE&"*" $FUELROUNDS&" rounds of fuel*" $ORGROUNDS&" rounds of org*" $EQUIPROUNDS&" rounds of equip**"
setvar $FUELROUNDSLEFT $FUELROUNDS
setvar $ORGROUNDSLEFT $ORGROUNDS
setvar $EQUIPROUNDSLEFT $EQUIPROUNDS
setvar $FUEL_CREDS_NEEDED 0
setvar $ORG_CREDS_NEEDED 0
setvar $EQUIP_CREDS_NEEDED 0


if ($FUELROUNDS > 0)
  setvar $FUEL_CREDS_NEEDED $FUELROUNDS
  multiply $FUEL_CREDS_NEEDED $PLAYER~TOTAL_HOLDS
  multiply $FUEL_CREDS_NEEDED 30
  if ($BUYDOWN_MODE = "Worst Price")
    multiply $FUEL_CREDS_NEEDED 3
    divide $FUEL_CREDS_NEEDED 2
  end
end
if ($ORGROUNDS > 0)
  setvar $ORG_CREDS_NEEDED $ORGROUNDS
  multiply $ORG_CREDS_NEEDED $PLAYER~TOTAL_HOLDS
  multiply $ORG_CREDS_NEEDED 60
  if ($BUYDOWN_MODE = "Worst Price")
    multiply $ORG_CREDS_NEEDED 3
    divide $ORG_CREDS_NEEDED 2
  end
end
if ($EQUIPROUNDS > 0)
  setvar $EQUIP_CREDS_NEEDED $EQUIPROUNDS
  multiply $EQUIP_CREDS_NEEDED $PLAYER~TOTAL_HOLDS
  multiply $EQUIP_CREDS_NEEDED 100
  if ($BUYDOWN_MODE = "Worst Price")
    multiply $EQUIP_CREDS_NEEDED 3
    divide $EQUIP_CREDS_NEEDED 2
  end
end
setvar $TOTAL_CREDS_NEEDED 0
add $TOTAL_CREDS_NEEDED $FUEL_CREDS_NEEDED
add $TOTAL_CREDS_NEEDED $ORG_CREDS_NEEDED
add $TOTAL_CREDS_NEEDED $EQUIP_CREDS_NEEDED
setvar $STARTINGCREDITS $PLAYER~CREDITS
if ($TOTAL_CREDS_NEEDED > $PLAYER~CREDITS)
  setvar $CASHONHAND $PLANET~CITADEL_CREDITS
  add $CASHONHAND $PLAYER~CREDITS
  if ($CASHONHAND > $TOTAL_CREDS_NEEDED)
    send "C"
    send "T T "&$PLAYER~CREDITS&"* "
    send "T F "&$TOTAL_CREDS_NEEDED&"* "
    setvar $PLAYER~CREDITS $TOTAL_CREDS_NEEDED
    setvar $SWITCHBOARD~MESSAGE "Withdrew funds from the Treasury to complete the buydown*"
    gosub :SWITCHBOARD~SWITCHBOARD
    send "Q"
  else
    if ($STARTINGLOCATION = "Citadel")
      send "C "
    else
      send "q "
    end
    setvar $EXIT_MESSAGE "Not enough cash onhand"
    gosub :CLEARADJACENT
    goto :BUYDOWNEXIT
  end
end
setvar $INIT_CREDITS $PLAYER~CREDITS
:BUYDOWNEQUIP

if ($EQUIPROUNDSLEFT > 0)
  if ($BUYDOWN_MODE = "Speedbuy")
    send "Q P T  "
  else
    send "Q P T"
  end
  if ($FUELSELLING > 0)
    send "0* "
  end
  if ($ORGSELLING > 0)
    send "0*"
  end
  gosub :CHOOSEHAGGLE
  send "L "&$PLANET~PLANET&"* t n l 3* "
  subtract $EQUIPROUNDSLEFT 1
  goto :BUYDOWNEQUIP
end
if ($EQUIPROUNDS > 0)
  if ($BUYDOWN_MODE = "Worst Price")
    setvar $OUTPUT $OUTPUT&" - Equipment overhaggled at "&$OVERHAGGLEMULTIPLE&"*"
  end
end
:BUYDOWNORG

if ($ORGROUNDSLEFT > 0)
  if ($BUYDOWN_MODE = "Speedbuy")
    send "Q P T  "
  else
    send "Q P T"
  end
  if ($FUELSELLING > 0)
    send "0*"
  end
  gosub :CHOOSEHAGGLE
  send "0* L "&$PLANET~PLANET&"* t n l 2* "
  subtract $ORGROUNDSLEFT 1
  goto :BUYDOWNORG
end
if ($ORGROUNDS > 0)
  if ($BUYDOWN_MODE = "Worst Price")
    setvar $OUTPUT $OUTPUT&" - Organics overhaggled at "&$OVERHAGGLEMULTIPLE&"*"
  end
end
:BUYDOWNFUEL

if ($FUELROUNDSLEFT > 0)
  if ($BUYDOWN_MODE = "Speedbuy")
    send "Q P T  "
  else
    send "Q P T"
  end
  gosub :CHOOSEHAGGLE
  send "0* 0* L "&$PLANET~PLANET&"* t n l 1* "
  subtract $FUELROUNDSLEFT 1
  goto :BUYDOWNFUEL
end
if ($FUELROUNDS > 0)
  if ($BUYDOWN_MODE = "Worst Price")
    setvar $OUTPUT $OUTPUT&" - Fuel Ore overhaggled at "&$OVERHAGGLEMULTIPLE&"*"
  end
end
:BUYDOWNFINISH


if ($STARTINGLOCATION = "Citadel")
  send "C "
  waitfor "<Enter Citadel>"
else
  send "Q "
  waitfor "Command [TL="
end

gosub :PLAYER~QUIKSTATS

setvar $PLAYER~CREDITS_SPENT ($INIT_CREDITS - $PLAYER~CREDITS)

gosub :CLEARADJACENT

if ($STARTINGLOCATION = "Planet")
  send "L  Z"&#8&#8&$PLANET~PLANET&"*  "
end

if (($PLAYER~CREDITS > $STARTINGCREDITS) and ($STARTINGLOCATION = "Citadel"))
  send "T T "&($PLAYER~CREDITS - $STARTINGCREDITS)&"* "
  setvar $SWITCHBOARD~MESSAGE "I put back extra funds taken for buydown.*"
  gosub :SWITCHBOARD~SWITCHBOARD
end


setvar $SWITCHBOARD~MESSAGE $OUTPUT&"   *"
if ($PLAYER~UNLIMITEDGAME)
  setvar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&" - spent "&$PLAYER~CREDITS_SPENT&" credits - unlimited turns left.*"
else
  setvar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&" - spent "&$PLAYER~CREDITS_SPENT&" credits - "&$PLAYER~TURNS&" turns left.*"
end
if ($SWITCHBOARD~SELF_COMMAND <> TRUE)
  setvar $SWITCHBOARD~SELF_COMMAND 2
end
gosub :SWITCHBOARD~SWITCHBOARD
setvar $EXIT_MESSAGE "Normal Exit"

setvar $BOT~WORSTPRICE $ORIGINAL_WORSTPRICE_VALUE
savevar $BOT~WORSTPRICE

goto :BUYDOWNEXIT
:_START_


gosub :BOT~LOADVARS

setvar $BOT~HELP[1] $BOT~TAB&"BUY - Buy Product from port in Sector or Fighters and/or"
setvar $BOT~HELP[2] $BOT~TAB&"      shields from Rylos or Alpha"
setvar $BOT~HELP[3] $BOT~TAB&"      "
setvar $BOT~HELP[4] $BOT~TAB&"  - buy [product] {mode} {cycles}"
setvar $BOT~HELP[5] $BOT~TAB&"  - [product] = [f]uel or [o]rg or [e]quip"
setvar $BOT~HELP[6] $BOT~TAB&"  - [mode]    = [b]est or [s]peed or [w]orst - default is speed"
setvar $BOT~HELP[7] $BOT~TAB&"  - [cycles]  = number of cycles             - default is max"
setvar $BOT~HELP[8] $BOT~TAB&"  - [override] = allows product buydowns with less than 200 holds"
setvar $BOT~HELP[9] $BOT~TAB&"     "
setvar $BOT~HELP[10] $BOT~TAB&"  - buy [hardware] {amount}"
setvar $BOT~HELP[11] $BOT~TAB&"  - [hardware]= [fig]hters or [sh]ields or [m]ines"
setvar $BOT~HELP[12] $BOT~TAB&"  - [amount]  = number to purchase, default is maximum"
setvar $BOT~HELP[13] $BOT~TAB&"      "
setvar $BOT~HELP[14] $BOT~TAB&"  - Originally written by Cherokee.     "
setvar $BOT~HELP[15] $BOT~TAB&"  - Now integrated with EP Haggle if it is running "
gosub :BOT~HELPFILE


loadvar $GAME~PORT_MAX

setvar $OVERHAGGLEMULTIPLE 147
setvar $CYCLEBUFFER 1
setvar $CYCLEBUFFERLIMIT 20

gosub :PLAYER~QUIKSTATS
setvar $STARTINGLOCATION $PLAYER~CURRENT_PROMPT
if (($STARTINGLOCATION <> "Citadel") and ($STARTINGLOCATION <> "Planet"))
  setvar $SWITCHBOARD~MESSAGE "Must start at Citadel or Planet Prompt for Buy Down*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end

if ($BOT~PARM1 = "sh")
  if ($STARTINGLOCATION <> "Citadel")
    setvar $SWITCHBOARD~MESSAGE "Shield Buyer must be run from the Citadel"
    gosub :SWITCHBOARD~SWITCHBOARD
    halt
  end
  goto :SHIELD_START
end
if ($BOT~PARM1 = "fig")
  if ($STARTINGLOCATION <> "Citadel")
    setvar $SWITCHBOARD~MESSAGE "Fighter Buyer must be run from the Citadel"
    gosub :SWITCHBOARD~SWITCHBOARD
    halt
  end
  goto :FIGHTER_START
end

if ($PLAYER~TOTAL_HOLDS < 200)
  getwordpos $BOT~USER_COMMAND_LINE $POS "override"
  if ($POS = 0)
    setvar $EXIT_MESSAGE "This ship has less than 200 holds, cannot buydown without override.*"
    goto :BUYDOWNEXIT
  end
end

setvar $OUTPUT ""
setvar $EQUIPROUNDS 0
setvar $ORGROUNDS 0
setvar $FUELROUNDS 0
isnumber $ISNUMBER2 $BOT~PARM2
isnumber $ISNUMBER3 $BOT~PARM3
if ($ISNUMBER2)
  if ($BOT~PARM2 > 0)
    setvar $BUYDOWNROUNDSFROMPARAM $BOT~PARM2
  else
    setvar $BUYDOWNROUNDSFROMPARAM 999999
  end
elseif ($ISNUMBER3)
  if ($BOT~PARM3 > 0)
    setvar $BUYDOWNROUNDSFROMPARAM $BOT~PARM3
  else
    setvar $BUYDOWNROUNDSFROMPARAM 999999
  end
else
  setvar $BUYDOWNROUNDSFROMPARAM 999999
end
getwordpos " "&$BOT~USER_COMMAND_LINE&" " $ISWORST " w "
getwordpos " "&$BOT~USER_COMMAND_LINE&" " $ISBEST " b "
if ($ISWORST > 0)
  setvar $BUYDOWN_MODE 3
elseif ($ISBEST > 0)
  setvar $BUYDOWN_MODE 2
else
  setvar $BUYDOWN_MODE 1
end
if ($BOT~PARM1 = "e")
  setvar $BUYDOWN_EQUIPROUNDS $BUYDOWNROUNDSFROMPARAM
  setvar $BUYDOWN_ORGROUNDS 0
  setvar $BUYDOWN_FUELROUNDS 0
elseif ($BOT~PARM1 = "o")
  setvar $BUYDOWN_EQUIPROUNDS 0
  setvar $BUYDOWN_ORGROUNDS $BUYDOWNROUNDSFROMPARAM
  setvar $BUYDOWN_FUELROUNDS 0
elseif ($BOT~PARM1 = "f")
  setvar $BUYDOWN_EQUIPROUNDS 0
  setvar $BUYDOWN_ORGROUNDS 0
  setvar $BUYDOWN_FUELROUNDS $BUYDOWNROUNDSFROMPARAM
else
  setvar $SWITCHBOARD~MESSAGE "Please use format buy [type] {speed} {#cycles} {override}*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt

end
if ($STARTINGLOCATION = "Citadel")
  send "Q  "
end

if (($PLAYER~ORE_HOLDS + ($PLAYER~ORGANIC_HOLDS + ($PLAYER~EQUIPMENT_HOLDS + $PLAYER~COLONIST_HOLDS))) <> 0)
  setvar $MAC ""
  if ($PLAYER~ORE_HOLDS <> 0)
    setvar $MAC "  T N L 1* "
  end
  if ($PLAYER~ORGANIC_HOLDS <> 0)
    setvar $MAC $MAC&" T N L 2* "
  end
  if ($PLAYER~EQUIPMENT_HOLDS <> 0)
    setvar $MAC $MAC&" T N L 3* "
  end
  if ($PLAYER~COLONIST_HOLDS <> 0)
    setvar $MAC $MAC&" S N L 1* "
  end
  if ($MAC <> "")
    send $MAC
    gosub :PLAYER~QUIKSTATS
    if (($PLAYER~ORE_HOLDS + ($PLAYER~ORGANIC_HOLDS + ($PLAYER~EQUIPMENT_HOLDS + $PLAYER~COLONIST_HOLDS))) <> 0)
      setvar $SWITCHBOARD~MESSAGE "Holds Not Empty*"
      gosub :SWITCHBOARD~SWITCHBOARD
      halt
    end
  end
end

gosub :PLANET~GETPLANETINFO

if ($STARTINGLOCATION = "Citadel")
  send "C s* "
else
  send "Q D"
end
waiton "Warps to Sector(s) :"

gosub :PLAYER~GETINFO
gosub :VOIDADJACENT
gosub :GETPORTINFO

if ($VALIDPORTFOUND <> TRUE)
  setvar $EXIT_MESSAGE "No valid port found"
  if ($STARTINGLOCATION <> "Citadel")
    gosub :PLANET~LANDINGSUB
  end
  gosub :CLEARADJACENT
  goto :BUYDOWNEXIT
end

if ($STARTINGLOCATION = "Citadel")
  send "Q"
else
  send "L "&$PLANET~PLANET&"* "
end

waiton "Planet command (?="
goto :INITIATE_BUY_DOWN
:BUYDOWNEXIT

setvar $SWITCHBOARD~MESSAGE "Buy down exiting --- "&$EXIT_MESSAGE&"*"
gosub :SWITCHBOARD~SWITCHBOARD
halt
:VOIDADJACENT


setvar $I 1
send "  C  "
while (SECTOR.WARPS[$PLAYER~CURRENT_SECTOR][$I] <> 0)
  setvar $FOCUS SECTOR.WARPS[$PLAYER~CURRENT_SECTOR][$I]
  if ($FOCUS <> 0)
    send "V"&$FOCUS&"*"
  end
  add $I 1
end
send "  Q"
waiton "<Computer deactivated>"
return
:CLEARADJACENT
setvar $I 1
send "  C  "
while (SECTOR.WARPS[$PLAYER~CURRENT_SECTOR][$I] <> 0)
  setvar $FOCUS SECTOR.WARPS[$PLAYER~CURRENT_SECTOR][$I]
  if ($FOCUS <> 0)
    send "V0*YN"&$FOCUS&"*"
  end
  add $I 1
end
send "   Q"
waiton "<Computer deactivated>"
return
:FIGHTER_START

setvar $BUYS FALSE
setvar $CANBUY 0
if ($BOT~PARM2 = "")
  setvar $BOT~PARM2 0
end
setvar $AMOUNTTOBUY $BOT~PARM2
setvar $BUYALL FALSE
setvar $TOTALFIGSPURCHASED 0
isnumber $TEST $AMOUNTTOBUY
if ($TEST <> TRUE)
  setvar $BUYALL TRUE
else
  if ($AMOUNTTOBUY <= 0)
    setvar $BUYALL TRUE
  end
end
send " q "
gosub :PLANET~GETPLANETINFO
send " c "
gosub :SHIP~GETSHIPSTATS
setvar $HOME $PLAYER~CURRENT_SECTOR
if (($PLAYER~CURRENT_SECTOR = $MAP~ALPHA_CENTAURI) or ($PLAYER~CURRENT_SECTOR = $MAP~RYLOS))
  if (PORT.CLASS[$PLAYER~CURRENT_SECTOR] = 0)
    goto :FIGHTER_ALREADY
  end
end
:FIGHTER_SUB_FIGHTERBUY

if ($MAP~ALPHA_CENTAURI > 0)
  setvar $SWITCHBOARD~MESSAGE "Warping Planet to Alpha Centauri*"
  gosub :SWITCHBOARD~SWITCHBOARD
  send "p"&$MAP~ALPHA_CENTAURI&"*y"
  settextlinetrigger WARPIT :FIGHTER_WARPIT "All Systems Ready, shall we engage?"
  settextlinetrigger NOWARP :FIGHTER_NOWARP "You do not have any fighters in Sector"
  settextlinetrigger NOWARP2 :FIGHTER_ALREADY "You are already in that sector!"
  pause
else
  setvar $SWITCHBOARD~MESSAGE "Alpha Centauri is not defined for this bot*"
  gosub :SWITCHBOARD~SWITCHBOARD
  goto :FIGHTER_NOWARP
end
:FIGHTER_WARPIT

send "y "
:FIGHTER_ALREADY
killalltriggers
send " s* "
gosub :PLAYER~QUIKSTATS
if (PORT.CLASS[$PLAYER~CURRENT_SECTOR] = 0)
  setvar $BUYS TRUE
  send "q m*l* q z* "
  goto :FIGHTER_ARRIVED
else
  setvar $SWITCHBOARD~MESSAGE "Sector "&$MAP~ALPHA_CENTAURI&" has no class 0 port in it!*"
  gosub :SWITCHBOARD~SWITCHBOARD
  goto :FIGHTER_NOWARP
end
:FIGHTER_NOFIG
setvar $SWITCHBOARD~MESSAGE "No Fighter at Alpha Centauri*"
gosub :SWITCHBOARD~SWITCHBOARD
:FIGHTER_NOWARP
if ($MAP~ALPHA_CENTAURI > 0)
  setsectorparameter $MAP~ALPHA_CENTAURI "FIGSEC" FALSE
end
killalltriggers
setvar $SWITCHBOARD~MESSAGE "Trying Rylos*"
gosub :SWITCHBOARD~SWITCHBOARD
if ($MAP~RYLOS > 0)
  send "p"&$MAP~RYLOS&"*y"
  settextlinetrigger WARPIT :FIGHTER_WARPIT "All Systems Ready, shall we engage?"
  settextlinetrigger NOWARP :FIGHTER_NOWARP2 "You do not have any fighters in Sector"
  settextlinetrigger NOWARP2 :FIGHTER_ALREADY "You are already in that sector!"
  pause
else
  setvar $SWITCHBOARD~MESSAGE "Rylos is not defined for this bot.*"
  gosub :SWITCHBOARD~SWITCHBOARD
  goto :FIGHTER_END
end
:FIGHTER_CHECKIT
killalltriggers
send "s* "
gosub :PLAYER~QUIKSTATS
if (PORT.CLASS[$PLAYER~CURRENT_SECTOR] = 0)
  goto :FIGHTER_ARRIVED
else
  setvar $SWITCHBOARD~MESSAGE "Sector "&$MAP~RYLOS&" has no class 0 port in it!*"
  gosub :SWITCHBOARD~SWITCHBOARD
  goto :FIGHTER_END
end
:FIGHTER_NOWARP2
killalltriggers
if ($MAP~RYLOS > 0)
  setsectorparameter $MAP~RYLOS "FIGSEC" FALSE
end
setvar $SWITCHBOARD~MESSAGE "No fighter at either class 0!*"
gosub :SWITCHBOARD~SWITCHBOARD
setvar $BUYS FALSE
goto :FIGHTER_END
:FIGHTER_ARRIVED

killalltriggers
send "q q* p t"
settexttrigger BUYFIGLIMP :REMOVELIMP "removal? : (Y/N)"
settexttrigger BUYFIGNOLIMP :BUYTHEFIGS "credits per fighter"
pause
:REMOVELIMP

send "y"
pause
:BUYTHEFIGS
killtrigger BUYFIGLIMP
getword CURRENTLINE $CANBUY 8
if (($CANBUY > 0) and ((($BUYALL = FALSE) and ($AMOUNTTOBUY > 0)) or ($BUYALL = TRUE)))
  setvar $BUYS TRUE
  if (($BUYALL = FALSE) and ($AMOUNTTOBUY < $CANBUY))
    send "b "&$AMOUNTTOBUY&"* q"
    add $TOTALFIGSPURCHASED $AMOUNTTOBUY
    setvar $AMOUNTTOBUY 0
  else
    send "b "&$CANBUY&"* q"
    add $TOTALFIGSPURCHASED $CANBUY
    setvar $AMOUNTTOBUY ($AMOUNTTOBUY - $CANBUY)
  end
else
  send "q  z* * l "&$PLANET~PLANET&"* c"
  setvar $SWITCHBOARD~MESSAGE ""&$TOTALFIGSPURCHASED&" Fighters added on planet "&$PLANET~PLANET&".*"
  gosub :SWITCHBOARD~SWITCHBOARD
  goto :FIGHTER_END
end
:FIGHTER_ARRIVED2

send "l " $PLANET~PLANET "*  mnl*"
settexttrigger MAXPFIGHTERS :FIGHTER_MAXPFIGHTERS "You can't put more than"
settexttrigger FIGHTERSUCCESS :FIGHTER_ARRIVED "Done!"
pause
:FIGHTER_MAXPFIGHTERS

killalltriggers
send "c"
setvar $BUYS TRUE
setvar $SWITCHBOARD~MESSAGE "Fighters maxxed out on planet "&$PLANET~PLANET&".*"
gosub :SWITCHBOARD~SWITCHBOARD
:FIGHTER_END

if ($BUYS = FALSE)
  setvar $SWITCHBOARD~MESSAGE "No fighters able to be purchased*"
  gosub :SWITCHBOARD~SWITCHBOARD
else
  gosub :PLAYER~QUIKSTATS
  if ($HOME <> $PLAYER~CURRENT_SECTOR)
    setvar $SWITCHBOARD~MESSAGE "Buy down exiting.  Heading Back to Start Sector*"
    gosub :SWITCHBOARD~SWITCHBOARD
    send "p " $HOME "* y q m * * * c "
  else
    send "q m* * * c '{" $BOT~BOT_NAME "} - Buy down exiting.*"
  end
end
halt
:SHIELD_START



setvar $BUYS FALSE
send "gt"
waiton "and the Shield System"
getword CURRENTLINE $CURRENT_SHIELDS 3
divide $CURRENT_SHIELDS 10
send $CURRENT_SHIELDS&"*"
send "q"
gosub :PLANET~GETPLANETINFO
send "c"
setvar $HOME $PLAYER~CURRENT_SECTOR
if ($PLAYER~CURRENT_SECTOR = $MAP~ALPHA_CENTAURI)
  if (PORT.CLASS[$PLAYER~CURRENT_SECTOR] = 0)
    goto :SHIELD_ARRIVED
  else
    setvar $SWITCHBOARD~MESSAGE "Sector "&$MAP~ALPHA_CENTAURI&" has no class 0 port in it!*"
    gosub :SWITCHBOARD~SWITCHBOARD
    goto :SHIELD_NOWARP
  end
end
killalltriggers
:SHIELD_SUB_SHIELDBUY
if ($PLAYER~CURRENT_SECTOR = $MAP~ALPHA_CENTAURI)
  if (PORT.CLASS[$PLAYER~CURRENT_SECTOR] = 0)
    goto :SHIELD_ARRIVED
  end
elseif ($MAP~ALPHA_CENTAURI > 0)
  setvar $SWITCHBOARD~MESSAGE "Warping Planet to ALPHA*"
  gosub :SWITCHBOARD~SWITCHBOARD
  send "p"&$MAP~ALPHA_CENTAURI&"*y"
  settextlinetrigger WARPIT :SHIELD_WARPIT "All Systems Ready, shall we engage?"
  settextlinetrigger NOWARP :SHIELD_NOFIG "You do not have any fighters in Sector"
  pause
else
  setvar $SWITCHBOARD~MESSAGE "Alpha Centauri is not defined for this bot*"
  gosub :SWITCHBOARD~SWITCHBOARD
  goto :SHIELD_NOWARP
end
:SHIELD_WARPIT

killalltriggers
send "y  s*"
gosub :PLAYER~QUIKSTATS
if (PORT.CLASS[$PLAYER~CURRENT_SECTOR] = 0)
  setvar $BUYS TRUE
  send "q q* "
  goto :SHIELD_ARRIVED
else
  setvar $SWITCHBOARD~MESSAGE "Sector "&$MAP~ALPHA_CENTAURI&" has no class 0 port in it!*"
  gosub :SWITCHBOARD~SWITCHBOARD
end
:SHIELD_NOFIG

killalltriggers
if ($MAP~ALPHA_CENTAURI > 0)
  setsectorparameter $MAP~ALPHA_CENTAURI "FIGSEC" FALSE
end
setvar $SWITCHBOARD~MESSAGE "No Fighter at Alpha Centauri*"
gosub :SWITCHBOARD~SWITCHBOARD
:SHIELD_NOWARP
killtrigger WARPIT
setvar $SWITCHBOARD~MESSAGE "Trying Rylos*"
gosub :SWITCHBOARD~SWITCHBOARD
if ($MAP~RYLOS > 0)
  send "p"&$MAP~RYLOS&"*y"
  settextlinetrigger WARPIT :SHIELD_WARPIT "All Systems Ready, shall we engage?"
  settextlinetrigger NOWARP :SHIELD_NOWARP2 "You do not have any fighters in Sector"
  settextlinetrigger NOWARP2 :SHIELD_CHECKIT "You are already in that sector!"
  pause
else
  setvar $SWITCHBOARD~MESSAGE "Rylos is not defined for this bot*"
  gosub :SWITCHBOARD~SWITCHBOARD
  goto :SHIELD_END
end
:SHIELD_CHECKIT
killalltriggers
send "s* "
gosub :PLAYER~QUIKSTATS
if (PORT.CLASS[$PLAYER~CURRENT_SECTOR] = 0)
  goto :SHIELD_ARRIVED
else
  setvar $SWITCHBOARD~MESSAGE "Sector "&$MAP~RYLOS&" has no class 0 port in it!*"
  gosub :SWITCHBOARD~SWITCHBOARD
  goto :SHIELD_END
end
:SHIELD_NOWARP2

killalltriggers
if ($MAP~RYLOS > 0)
  setsectorparameter $MAP~RYLOS "FIGSEC" FALSE
end
setvar $SWITCHBOARD~MESSAGE "No Fighter at either Class 0!*"
gosub :SWITCHBOARD~SWITCHBOARD
setvar $BUYS FALSE
goto :SHIELD_END
:SHIELD_ARRIVED

killalltriggers
send "q  q  z  n  p  t  y"
waiton "C  Shield Points   :"
getword CURRENTLINE $CANBUY 9
if ($CANBUY > 0)
  send "c "&$CANBUY&"*  q"
elseif ($CANBUY = 0)
  setvar $BUYS TRUE
  send "q l "&$PLANET~PLANET&"* c"
  setvar $SWITCHBOARD~MESSAGE "Shields maxxed out on planet "&$PLANET~PLANET&".*"
  gosub :SWITCHBOARD~SWITCHBOARD
  goto :SHIELD_END
end
:SHIELD_ARRIVED2

send "L " $PLANET~PLANET "*  cgt"
waiton "and the Shield System"
getword CURRENTLINE $CURRENT_SHIELDS 3
divide $CURRENT_SHIELDS 10
send $CURRENT_SHIELDS "*"
settexttrigger MAXPSHIELDS :SHIELD_MAXPSHIELDS "The planet is limited to"
settexttrigger SHIELDSUCCESS :SHIELD_ARRIVED "Citadel command"
pause
:SHIELD_MAXPSHIELDS

killalltriggers
getword CURRENTLINE $MAXPSHIELDS 6
subtract $MAXPSHIELDS $CURPSHIELDS
send "gt" $MAXPSHIELDS "*"
setvar $BUYS TRUE
setvar $SWITCHBOARD~MESSAGE "Shields maxxed out on planet "&$PLANET~PLANET&".*"
gosub :SWITCHBOARD~SWITCHBOARD
goto :SHIELD_END
:SHIELD_END

if ($BUYS = FALSE)
  setvar $SWITCHBOARD~MESSAGE "No shields able to be purchased*"
  gosub :SWITCHBOARD~SWITCHBOARD
else
  gosub :PLAYER~QUIKSTATS
  if ($HOME <> $PLAYER~CURRENT_SECTOR)
    setvar $SWITCHBOARD~MESSAGE "Buy down exiting.  Heading Back to Start Sector*"
    gosub :SWITCHBOARD~SWITCHBOARD
    send "p " $HOME "*  y"
  else
    setvar $SWITCHBOARD~MESSAGE "Buy down exiting.*"
    gosub :SWITCHBOARD~SWITCHBOARD
  end
end
halt
:GETPORTINFO
:GETPORTINFO


send "C R*Q"
setvar $VALIDPORTFOUND FALSE
settextlinetrigger FOUNDPORT :FOUNDPORT2 "Items     Status  Trading % of max OnBoard"
settextlinetrigger NOPORT :NOPORT2 "I have no information about a port in that sector."
settextlinetrigger NOPORT2 :NOPORT2 "You have never visted sector"
settextlinetrigger NOPORT3 :NOPORT2 "credits / next hold"
settextlinetrigger NOPORT4 :NOPORT2 "A  Cargo holds     :"
pause
:NOPORT2

killalltriggers
return
:FOUNDPORT2

killtrigger FOUNDPORT
killtrigger NOPORT
killtrigger NOPORT2
killtrigger NOPORT3
setvar $FUELSELLING 0
setvar $ORGSELLING 0
setvar $EQUIPSELLING 0
setvar $VALIDPORTFOUND TRUE
:GETSELLING
settextlinetrigger PORTFUELINFO :PORTFUELINFO2 "Fuel Ore   Selling"
settextlinetrigger PORTORGINFO :PORTORGINFO2 "Organics   Selling"
settextlinetrigger PORTEQUIPINFO :PORTEQUIPINFO2 "Equipment  Selling"
settextlinetrigger GOTALLPORTINFO :GOTALLPORTINFO2 "<Computer deactivated>"
pause
:PORTFUELINFO2

getword CURRENTLINE $FUELSELLING 4
settextlinetrigger PORTFUELINFO :PORTFUELINFO2 "Fuel Ore   Selling"
pause
:PORTORGINFO2

getword CURRENTLINE $ORGSELLING 3
settextlinetrigger PORTORGINFO :PORTORGINFO2 "Organics   Selling"
pause
:PORTEQUIPINFO2

getword CURRENTLINE $EQUIPSELLING 3
settextlinetrigger PORTEQUIPINFO :PORTEQUIPINFO2 "Equipment  Selling"
pause
:GOTALLPORTINFO2

killalltriggers
return

# includes:
include "include/PLAYER.ts"
include "include/PLAYER_2/PLAYER.ts"
include "include/BOT.ts"
include "include/BOT_2/BOT.ts"
include "include/BOT_3/BOT.ts"
include "include/BOT_4/BOT.ts"
include "include/SWITCHBOARD.ts"
include "include/PLANET.ts"
include "include/PLAYER_3/PLAYER.ts"
include "include/PLANET_2/PLANET.ts"
include "include/SHIP.ts"
