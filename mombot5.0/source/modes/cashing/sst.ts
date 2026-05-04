:LOAD_VARIABLES


loadvar $switchboard~bot_name
loadvar $bot~user_command_line
loadvar $player~unlimitedgame
loadvar $bot~subspace
loadvar $bot~bot_turn_limit

gosub :LOADVARS~LOADVARS
gosub :HELP~INITIALIZE
loadvar $bot~subspace

loadvar $bot~bot_turn_limit
loadvar $game~steal_factor

setvar $HELP~HELP[1] $HELP~TAB&" sst {resetlra} [ship1] [ship2] {jet} {resetlra}"
setvar $HELP~HELP[2] $HELP~TAB&"  - Do NOT need to start in Ship 1 or Ship 2."
setvar $HELP~HELP[3] $HELP~TAB&"  - First Steal will be from Ship 1."
setvar $HELP~HELP[4] $HELP~TAB&"  - Checks last rob and busts from Sec Params"
setvar $HELP~HELP[5] $HELP~TAB&"  - {jet} will mega jet product for extra experience "
setvar $HELP~HELP[6] $HELP~TAB&"          but will stop at mulitplier of 300 holds. "
setvar $HELP~HELP[7] $HELP~TAB&"  - {resetlra} will reset last rob sector and exit"
setvar $HELP~HELP[8] $HELP~TAB&"  - Will use EP Haggle if running in bot"
setvar $HELP~HELP[9] $HELP~TAB&"  - Created by Cherokee"
gosub :HELP~HELPFILE

setvar $SWITCHBOARD~MESSAGE "SST and JET starting up!*"
gosub :SWITCHBOARD~SWITCHBOARD

if ($bot~parm1 = "resetlra")
  setsectorparameter 1 "LRA" 1
  send "'Last rob sector reset*"
  halt
end

isnumber $TEST $bot~parm1
if ($TEST)
else
  setvar $switchboard~message "Ship 1 Must Be a Number.*"
  gosub :switchboard~switchboard
  halt
end
isnumber $TEST $bot~parm2
if ($TEST)
else
  setvar $switchboard~message "Ship 2 Must Be a Number.*"
  gosub :switchboard~switchboard
  halt
end
setvar $SHIP_1 $bot~parm1
setvar $SHIP_2 $bot~parm2
setvar $STEAL_DIVISOR $game~steal_factor


if ($bot~parm3 = "jet")
  setvar $JET "y"
end

if ($bot~parm4 = "jet")
  setvar $JET "y"
end

if ($STEAL_DIVISOR = 0)
  setvar $STEAL_DIVISOR 21
  send "'No Steal divisor, assuming 21. Bot needs to refresh perhaps?*"
end


getsectorparameter 1 "LRA" $LAST_ROB_ATTEMPT
:VERIFYPROMPT




gosub :player~quikstats

setvar $LOCATION $player~current_prompt
if ($LOCATION <> "Command")
  send "'{" $switchboard~bot_name "} - Must start at Command Prompt for SST*"
  halt
end

send "czq"
waiton "-----------------------------------------------------------------------------"
settextlinetrigger SHIPNUMBER :GETSHIPNUMBER "Corp"
settextlinetrigger DONESHIPS :DONESHIPS "Computer command ["
pause
:GETSHIPNUMBER

getword CURRENTLINE $SHIPTEST 1
getword CURRENTLINE $SHIPLOCATION 2
isnumber $IS_A_NUMBER $SHIPLOCATION
if ($IS_A_NUMBER)
  if ($SHIP_1 = $SHIPTEST)
    if ($SHIPLOCATION = $LAST_ROB_ATTEMPT)
      setvar $TEMP $SHIP_1
      setvar $SHIP_1 $SHIP_2
      setvar $SHIP_2 $TEMP
      goto :DONESHIPS
    end
  end
end
settextlinetrigger SHIPNUMBER :GETSHIPNUMBER "Corp"
pause
:DONESHIPS
killalltriggers
:VERIFYSHIP

if ($player~ship_number <> $SHIP_1)
  send "x " $SHIP_1 "* q z n"
end
gosub :player~quikstats
if ($player~ship_number <> $SHIP_1)
  send "'{" $switchboard~bot_name "} - Cannot Xport to Ship 1.  Check Xport Range.  Halting.*"
  halt
end
logging "OFF"

gosub :STARTCNSETTINGS

send "CZQ"
waitfor "Command [TL="
setdelaytrigger SHIPDISPWAIT :SHIPDISPWAIT 750
pause
pause
:SHIPDISPWAIT


setvar $JETHOLDS 10
setvar $JETHOLDSORE 10
setvar $JETHOLDSORG 5
setvar $JETBONUS 0
setvar $JETCOST 0
setvar $CURRENT_SHIP $SHIP_1
setvar $LOW_TURNS "NO"
setvar $SKIP_SHIPS "NO"

setvar $DEBUGDELAY 0
setvar $SEC1VOID 0
setvar $SEC2VOID 0
:INIT



gosub :GETINFO
setvar $INIT_CREDITS $player~credits
setvar $INIT_EXP $EXP
setvar $INIT_TURNS $player~turns
send "'{" $switchboard~bot_name "} - Starting SST"



if ($JET = "y")
  send "+JET"
end
send " with "&$INIT_CREDITS&" credits and "&$INIT_EXP&" experience.*"
gosub :player~quikstats



send "'{" $switchboard~bot_name "} - last rob attempt: "&$LAST_ROB_ATTEMPT&"*"
if ($LAST_ROB_ATTEMPT = $player~current_sector)
  send "'{" $switchboard~bot_name "} - last rob attempt is this sector! HAlting*"
  gosub :ENDCNSETTINGS
  gosub :CLEARADJACENT
  halt
end
gosub :VOIDADJACENT

getsectorparameter $player~current_sector "BUSTED" $BUSTTHISSEC
if ($BUSTTHISSEC = TRUE)
  send "'{" $switchboard~bot_name "} - According to my data i've busted here - ending*"
  gosub :CLEARADJACENT
  gosub :ENDCNSETTINGS
  halt
end

gosub :CHECKPORT
gosub :CLEANSHIP
gosub :STEAL
gosub :XPORT


gosub :GETINFO
gosub :VOIDADJACENT
setvar $SEC2VOID 1
getsectorparameter $player~current_sector "BUSTED" $BUSTTHISSEC
if ($BUSTTHISSEC = TRUE)
  send "'{" $switchboard~bot_name "} - According to my data i've busted here - ending*"
  gosub :ENDCNSETTINGS
  gosub :CLEARADJACENT
  halt
end

gosub :CHECKPORT
gosub :CLEANSHIP
gosub :STEAL
gosub :XPORT

setvar $SKIP_SHIPS "YES"
:SSTLOOP


gosub :SELL
gosub :STEAL
gosub :XPORT
if (($player~unlimitedgame) or ($player~turns > $bot~bot_turn_limit))
  goto :SSTLOOP
else
  send "'{" $switchboard~bot_name "} - Low Turns, Halting Script*"
  setvar $LOW_TURNS "YES"
  goto :FINISH
end
:FINISH




gosub :CLEARADJACENT

setvar $player~turns_used $INIT_TURNS
subtract $player~turns_used $player~turns
gosub :player~quikstats

setvar $CASH_MADE ($player~credits - $INIT_CREDITS)
setvar $EXP_MADE $player~experience
subtract $EXP_MADE $INIT_EXP
gosub :ENDCNSETTINGS
send "'*{" $switchboard~bot_name "} -*"
if ($player~unlimitedgame)
  send "I made "&$CASH_MADE&" credits and "&$EXP_MADE&" experience.*"
else
  send "I made "&$CASH_MADE&" credits and "&$EXP_MADE&" experience.*"
end
if ($JET = "y")
  send "I made an extra "&$JETBONUS&" experience at a cost of "&$JETCOST&" credits.*"
end
send "Ship "&$SHIP_1&"'s equip multiple was "&$PORT.MULTIPLE[$SHIP_1]&".*"
send "Ship "&$SHIP_2&"'s equip multiple was "&$PORT.MULTIPLE[$SHIP_2]&".*"
gosub :player~quikstats
if ($LOW_TURNS <> "YES")

  send "Busted in ship "&$CURRENT_SHIP&", FURB please, I still have "&$player~turns&" turns to run.**"
end

halt
:GETINFO




send "I"
waitfor "<Info>"
:WAITFORINFO
settextlinetrigger GETEXPANDALIGN :GETEXPANDALIGN "Rank and Exp"
settextlinetrigger GETTURNS :GETTURNS "Turns left"
settextlinetrigger GETHOLDS :GETHOLDS "Total Holds"
settextlinetrigger GETCREDITS :GETCREDITS "Credits"
settexttrigger GETINFODONE :GETINFODONE "Command [TL="
pause
pause
:GETEXPANDALIGN
killalltriggers
getword CURRENTLINE $EXP 5
getword CURRENTLINE $ALIGN 7
striptext $EXP ","
striptext $ALIGN ","
striptext $ALIGN "Alignment="
goto :WAITFORINFO
:GETTURNS
killalltriggers
getword CURRENTLINE $player~turns 4
if ($player~turns = "Unlimited")
  setvar $player~turns 65535
end
goto :WAITFORINFO
:GETHOLDS
killalltriggers
setvar $LINE CURRENTLINE
getword $LINE $HOLDS[$CURRENT_SHIP] 4
getwordpos $LINE $TEXTPOS "Ore="
if ($TEXTPOS <> 0)
  cuttext CURRENTLINE $TEMP $TEXTPOS 100
  getword $TEMP $ORE[$CURRENT_SHIP] 1
  striptext $ORE[$CURRENT_SHIP] "Ore="
else
  setvar $ORE[$CURRENT_SHIP] 0
end
getwordpos $LINE $TEXTPOS "Organics="
if ($TEXTPOS <> 0)
  cuttext CURRENTLINE $TEMP $TEXTPOS 100
  getword $TEMP $ORG[$CURRENT_SHIP] 1
  striptext $ORG[$CURRENT_SHIP] "Organics="
else
  setvar $ORG[$CURRENT_SHIP] 0
end
getwordpos $LINE $TEXTPOS "Equipment="
if ($TEXTPOS <> 0)
  cuttext CURRENTLINE $TEMP $TEXTPOS 100
  getword $TEMP $EQU[$CURRENT_SHIP] 1
  striptext $EQU[$CURRENT_SHIP] "Equipment="
else
  setvar $EQU[$CURRENT_SHIP] 0
end
getwordpos $LINE $TEXTPOS "Colonists="
if ($TEXTPOS <> 0)
  cuttext CURRENTLINE $TEMP $TEXTPOS 100
  getword $TEMP $COL[$CURRENT_SHIP] 1
  striptext $COL[$CURRENT_SHIP] "Colonists="
else
  setvar $COL[$CURRENT_SHIP] 0
end
getwordpos $LINE $TEXTPOS "Empty="
if ($TEXTPOS <> 0)
  cuttext CURRENTLINE $TEMP $TEXTPOS 100
  getword $TEMP $EMP[$CURRENT_SHIP] 1
  striptext $EMP[$CURRENT_SHIP] "Empty="
else
  setvar $EMP[$CURRENT_SHIP] 0
end
goto :WAITFORINFO
:GETCREDITS
killalltriggers
getword CURRENTLINE $player~credits 3
striptext $player~credits ","
goto :WAITFORINFO
:GETINFODONE
killalltriggers
return
:CHECKPORT



send "D"
waitfor "<Re-Display>"
settextlinetrigger GETPORT :GETPORT "Ports   :"
settextlinetrigger NOPORT :NOPORT "Command [TL="
pause
pause
:GETPORT
killalltriggers
gettext CURRENTLINE $PORT[$CURRENT_SHIP] ", Class " " ("
if (($PORT[$CURRENT_SHIP] <> 2) and (($PORT[$CURRENT_SHIP] <> 3) and (($PORT[$CURRENT_SHIP] <> 4) and ($PORT[$CURRENT_SHIP] <> 8))))
  setvar $BAD_PORT_NAME PORT.NAME[$player~current_sector]
  send "'{" $switchboard~bot_name "} - Ship " $CURRENT_SHIP " is in sector " $player~current_sector " at " $BAD_PORT_NAME ", class " $PORT[$CURRENT_SHIP] ". SST needs an equipment-buying port (class 2, 3, 4, or 8). Halting.*"
  gosub :ENDCNSETTINGS
  gosub :CLEARADJACENT
  halt
else
  setvar $PORT.MULTIPLE[$CURRENT_SHIP] 110
  setvar $PORT.MAXMULTIPLE[$CURRENT_SHIP] 0
  send "CR*Q"
  :GETSELLING
  if (($PORT[$CURRENT_SHIP] = 3) or ($PORT[$CURRENT_SHIP] = 4))
    settextlinetrigger GETORESELLING :GETORESELLING "Fuel Ore   Selling"
  else
    setvar $PORT.ORE_SELLING[$CURRENT_SHIP] 0
  end

  if (($PORT[$CURRENT_SHIP] = 2) or ($PORT[$CURRENT_SHIP] = 4))
    settextlinetrigger GETORGSELLING :GETORGSELLING "Organics   Selling"
  else
    setvar $PORT.ORG_SELLING[$CURRENT_SHIP] 0
  end

  settextlinetrigger GETEQUONPORT :GETEQUONPORT "Equipment  Buying"
  pause
  pause
  :GETORESELLING
  killalltriggers
  getword CURRENTLINE $PORT.ORE_SELLING[$CURRENT_SHIP] 4
  if ($PORT.ORE_SELLING[$CURRENT_SHIP] = 0)
    send "o 1 1 * q"
    setvar $PORT.ORE_SELLING[$CURRENT_SHIP] 10
  end
  goto :GETSELLING
  :GETORGSELLING
  killalltriggers
  getword CURRENTLINE $PORT.ORG_SELLING[$CURRENT_SHIP] 3
  if ($PORT.ORG_SELLING[$CURRENT_SHIP] = 0)
    send "o 2 1 * q"
    setvar $PORT.ORG_SELLING[$CURRENT_SHIP] 10
  end
  goto :GETSELLING
  :GETEQUONPORT
  killalltriggers
  getword CURRENTLINE $PORT.EQU_AMOUNT[$CURRENT_SHIP] 3
  getword CURRENTLINE $PORT.EQU_PCT[$CURRENT_SHIP] 4
  striptext $PORT.EQU_PCT[$CURRENT_SHIP] "%"
  setvar $PORT.EQU_MAX[$CURRENT_SHIP] $PORT.EQU_AMOUNT[$CURRENT_SHIP]
  multiply $PORT.EQU_MAX[$CURRENT_SHIP] 100
  divide $PORT.EQU_MAX[$CURRENT_SHIP] $PORT.EQU_PCT[$CURRENT_SHIP]
  setvar $PORT.EQU_ON_DOCK[$CURRENT_SHIP] $PORT.EQU_MAX[$CURRENT_SHIP]
  subtract $PORT.EQU_ON_DOCK[$CURRENT_SHIP] $PORT.EQU_AMOUNT[$CURRENT_SHIP]

  setvar $STEAL_HOLDS $EXP
  divide $STEAL_HOLDS $STEAL_DIVISOR
  if ($STEAL_HOLDS < 10)
    send "'{" $switchboard~bot_name "} - You need more experience to SST!!!*"
    gosub :ENDCNSETTINGS
    gosub :CLEARADJACENT
    halt
  elseif ($HOLDS[$CURRENT_SHIP] < 10)
    send "'{" $switchboard~bot_name "} - You need more cargo holds to SST!!!*"
    gosub :ENDCNSETTINGS
    gosub :CLEARADJACENT
    halt
  end
  if ($STEAL_HOLDS > $HOLDS[$CURRENT_SHIP])
    setvar $STEAL_HOLDS $HOLDS[$CURRENT_SHIP]
  end

  setvar $TEMP $EQU["CURRENT_SHIP"]
  add $TEMP $PORT.EQU_ON_DOCK[$CURRENT_SHIP]
  if ($STEAL_HOLDS > $TEMP)
    setvar $UPGRADE_AMOUNT $STEAL_HOLDS
    subtract $UPGRADE_AMOUNT $PORT.EQU_ON_DOCK[$CURRENT_SHIP]
    subtract $UPGRADE_AMOUNT $EQU[$CURRENT_SHIP]
    divide $UPGRADE_AMOUNT 10
    add $UPGRADE_AMOUNT 1
    setvar $CASH_NEEDED $UPGRADE_AMOUNT
    multiply $CASH_NEEDED 900
    if ($player~credits >= $CASH_NEEDED)
      send "o  3"&$UPGRADE_AMOUNT&"**"
    else
      send "'{" $switchboard~bot_name "} - Not enough credits on hand to upgrade the port.*"
      gosub :ENDCNSETTINGS
      gosub :CLEARADJACENT
      halt
    end
    setvar $UPGRADE_AMOUNT 0
  end

  return
end
:NOPORT
killalltriggers
send "'{" $switchboard~bot_name "} - There is no port, you can't SST here!*"
gosub :ENDCNSETTINGS
gosub :CLEARADJACENT
halt
:CLEANSHIP





if ($PORT[$CURRENT_SHIP] = 2)
  if (($ORE[$CURRENT_SHIP] <> 0) or ($EQU[$CURRENT_SHIP] <> 0))
    subtract $player~turns 1
    if (HAGGLE)
      setVar $nativeSellOre $ORE[$CURRENT_SHIP]
      setVar $nativeSellOrg 0
      setVar $nativeSellEqu $EQU[$CURRENT_SHIP]
      setVar $nativeBuyOre 0
      setVar $nativeBuyOrg 0
      setVar $nativeBuyEqu 0
      gosub :NATIVEPORTTRADE
      gosub :GETINFO
      if (($ORE[$CURRENT_SHIP] <> 0) or ($EQU[$CURRENT_SHIP] <> 0))
        send "'{" $switchboard~bot_name "} - I couldn't clean the ship cargo with native haggle on. Script Halting*"
        gosub :ENDCNSETTINGS
        gosub :CLEARADJACENT
        halt
      end
    else
      send "PT"
      if ($ORE[$CURRENT_SHIP] <> 0)
        gosub :CLEANSELL
      end
      if ($EQU[$CURRENT_SHIP] <> 0)
        gosub :CLEANSELL
      end
      send "0*"
    end
  else
    echo "**no need to port**"
  end


elseif ($PORT[$CURRENT_SHIP] = 3)
  if (($ORG[$CURRENT_SHIP] <> 0) or ($EQU[$CURRENT_SHIP] <> 0))
    subtract $player~turns 1
    if (HAGGLE)
      setVar $nativeSellOre 0
      setVar $nativeSellOrg $ORG[$CURRENT_SHIP]
      setVar $nativeSellEqu $EQU[$CURRENT_SHIP]
      setVar $nativeBuyOre 0
      setVar $nativeBuyOrg 0
      setVar $nativeBuyEqu 0
      gosub :NATIVEPORTTRADE
      gosub :GETINFO
      if (($ORG[$CURRENT_SHIP] <> 0) or ($EQU[$CURRENT_SHIP] <> 0))
        send "'{" $switchboard~bot_name "} - I couldn't clean the ship cargo with native haggle on. Script Halting*"
        gosub :ENDCNSETTINGS
        gosub :CLEARADJACENT
        halt
      end
    else
      send "PT"
      if ($ORG[$CURRENT_SHIP] <> 0)
        gosub :CLEANSELL
      end
      if ($EQU[$CURRENT_SHIP] <> 0)
        gosub :CLEANSELL
      end
      send "0*"
    end
  end


elseif ($PORT[$CURRENT_SHIP] = 4)
  if ($EQU[$CURRENT_SHIP] <> 0)
    subtract $player~turns 1
    if (HAGGLE)
      setVar $nativeSellOre 0
      setVar $nativeSellOrg 0
      setVar $nativeSellEqu $EQU[$CURRENT_SHIP]
      setVar $nativeBuyOre 0
      setVar $nativeBuyOrg 0
      setVar $nativeBuyEqu 0
      gosub :NATIVEPORTTRADE
      gosub :GETINFO
      if ($EQU[$CURRENT_SHIP] <> 0)
        send "'{" $switchboard~bot_name "} - I couldn't clean the ship cargo with native haggle on. Script Halting*"
        gosub :ENDCNSETTINGS
        gosub :CLEARADJACENT
        halt
      end
    else
      send "PT"
      if ($EQU[$CURRENT_SHIP] <> 0)
        gosub :CLEANSELL
      end
      send "0*0*"
    end
  end


elseif ($PORT[$CURRENT_SHIP] = 8)
  if (($ORE[$CURRENT_SHIP] <> 0) or ($ORG[$CURRENT_SHIP] <> 0) or ($EQU[$CURRENT_SHIP] <> 0))
    subtract $player~turns 1
    if (HAGGLE)
      setVar $nativeSellOre $ORE[$CURRENT_SHIP]
      setVar $nativeSellOrg $ORG[$CURRENT_SHIP]
      setVar $nativeSellEqu $EQU[$CURRENT_SHIP]
      setVar $nativeBuyOre 0
      setVar $nativeBuyOrg 0
      setVar $nativeBuyEqu 0
      gosub :NATIVEPORTTRADE
      gosub :GETINFO
      if (($ORE[$CURRENT_SHIP] <> 0) or ($ORG[$CURRENT_SHIP] <> 0) or ($EQU[$CURRENT_SHIP] <> 0))
        send "'{" $switchboard~bot_name "} - I couldn't clean the ship cargo with native haggle on. Script Halting*"
        gosub :ENDCNSETTINGS
        gosub :CLEARADJACENT
        halt
      end
    else
      send "PT"
      if ($ORE[$CURRENT_SHIP] <> 0)
        gosub :CLEANSELL
      end
      if ($ORG[$CURRENT_SHIP] <> 0)
        gosub :CLEANSELL
      end
      if ($EQU[$CURRENT_SHIP] <> 0)
        gosub :CLEANSELL
      end
    end
  end


else
  echo "**badport**"
  gosub :ENDCNSETTINGS
  gosub :CLEARADJACENT
  halt
end

send "JY"
setvar $EMP[$CURRENT_SHIP] $HOLDS[$CURRENT_SHIP]
setvar $ORE[$CURRENT_SHIP] 0
setvar $ORG[$CURRENT_SHIP] 0
setvar $EQU[$CURRENT_SHIP] 0
setvar $COL[$CURRENT_SHIP] 0
setvar $SELL_FAILURES[$CURRENT_SHIP] 0
waitfor "Are you sure you want to jettison"
return
:CLEANSELL
send "**"
return
:SELL

if ($EQU[$CURRENT_SHIP] > 0)
  subtract $player~turns 1

  if (HAGGLE)
    setVar $nativeSellOre 0
    setVar $nativeSellOrg 0
    setVar $nativeSellEqu $EQU[$CURRENT_SHIP]
    setVar $nativeBuyOre 0
    setVar $nativeBuyOrg 0
    setVar $nativeBuyEqu 0
    gosub :NATIVEPORTTRADE
    gosub :GETINFO
    if ($EQU[$CURRENT_SHIP] > 0)
      send "'{" $switchboard~bot_name "} - I'm having problems selling my equipment to the port with native haggle. Script Halting*"
      gosub :ENDCNSETTINGS
      gosub :CLEARADJACENT
      halt
    end
    goto :AFTERSELLSUCCESS
  end

  killalltriggers
  send "PT"
  :SELLHAGGLE
  send "*"
  settextlinetrigger SELLFIRSTOFFER :SELLFIRSTOFFER "We'll buy them for"
  pause
  pause
  :SELLFIRSTOFFER
  killalltriggers
  getword CURRENTLINE $OFFER 5
  striptext $OFFER ","
  setvar $COUNTER $OFFER
  multiply $COUNTER $PORT.MULTIPLE[$CURRENT_SHIP]
  divide $COUNTER 100
  send $COUNTER&"*"
  :SELLOFFERLOOP
  settextlinetrigger SELLPRICE :SELLPRICE "We'll buy them for"
  settextlinetrigger SELLFINALOFFER :SELLFINALOFFER "Our final offer"
  settextlinetrigger SELLNOTINTERESTED :SELLNOTINTERESTED "We're not interested."
  settextlinetrigger SELLEXPERIENCE :SELLEXPERIENCE "experience point(s)"
  settextlinetrigger SELLEMPTY :SELLEMPTY "empty cargo holds"

  settextlinetrigger SELLSCREWUP1 :SELLSCREWUP "Get real ion-brain, make me a real offer."
  settextlinetrigger SELLSCREWUP2 :SELLSCREWUP "This is the big leagues Jr.  Make a real offer."
  settextlinetrigger SELLSCREWUP3 :SELLSCREWUP "My patience grows short with you."
  settextlinetrigger SELLSCREWUP4 :SELLSCREWUP "I have much better things to do than waste my time.  Try again."
  settextlinetrigger SELLSCREWUP5 :SELLSCREWUP "HA! HA, ha hahahhah hehehe hhhohhohohohh!  You choke me up!"
  settextlinetrigger SELLSCREWUP6 :SELLSCREWUP "Quit playing around, you're wasting my time!"
  settextlinetrigger SELLSCREWUP7 :SELLSCREWUP "Make a real offer or get the h*ll out of here!"
  settextlinetrigger SELLSCREWUP8 :SELLSCREWUP "WHAT?!@!? you must be crazy!"
  settextlinetrigger SELLSCREWUP9 :SELLSCREWUP "So, you think I'm as stupid as you look? Make a real offer."
  settextlinetrigger SELLSCREWUP10 :SELLSCREWUP "What do you take me for, a fool?  Make a real offer!"
  pause
  pause
  :SELLSCREWUP
  killalltriggers
  multiply $COUNTER 98
  divide $COUNTER 100
  send $COUNTER&"*"
  goto :SELLOFFERLOOP
  :SELLPRICE
  killalltriggers
  setvar $OLD_OFFER $OFFER
  setvar $OLD_COUNTER $COUNTER
  getword CURRENTLINE $OFFER 5
  striptext $OFFER ","
  setvar $OFFER_PCT $OFFER
  multiply $OFFER_PCT 1000
  divide $OFFER_PCT $OLD_OFFER
  if ($OFFER_PCT < 1003)
    setvar $OFFER_PCT 1003
  end
  multiply $COUNTER 1000
  divide $COUNTER $OFFER_PCT
  if ($COUNTER >= $OLD_COUNTER)
    subtract $COUNTER 1
  end
  send $COUNTER&"*"
  goto :SELLOFFERLOOP
  :SELLFINALOFFER
  killalltriggers
  setvar $OLD_OFFER $OFFER
  setvar $OLD_COUNTER $COUNTER
  getword CURRENTLINE $OFFER 5
  striptext $OFFER ","
  setvar $OFFER_CHANGE $OFFER
  subtract $OFFER_CHANGE $OLD_OFFER
  multiply $OFFER_CHANGE 25
  divide $OFFER_CHANGE 10
  subtract $COUNTER $OFFER_CHANGE
  subtract $COUNTER 3
  send $COUNTER&"*"
  goto :SELLOFFERLOOP
  :SELLNOTINTERESTED
  killalltriggers
  goto :SELLHAGGLEFAILED
  :SELLEXPERIENCE
  killalltriggers
  getword CURRENTLINE $EXP_BONUS 7
  add $EXP $EXP_BONUS
  goto :SELLOFFERLOOP
  :SELLEMPTY
  killalltriggers
  getword CURRENTLINE $player~credits 3
  striptext $player~credits ","
  setvar $OLDEMP[$CURRENT_SHIP] $EMP[$CURRENT_SHIP]
  getword CURRENTLINE $EMP[$CURRENT_SHIP] 6
  if ($OLDEMP[$CURRENT_SHIP] = $EMP[$CURRENT_SHIP])
    goto :SELLHAGGLEFAILED
  else
    goto :SELLHAGGLESUCCEEDED
  end
  :SELLHAGGLEFAILED
  if (($PORT[$CURRENT_SHIP] = 2) or ($PORT[$CURRENT_SHIP] = 3))
    send "0*"
  elseif ($PORT[$CURRENT_SHIP] = 4)
    send "0*0*"
  end

  add $SELL_FAILURES[$CURRENT_SHIP] 1
  subtract $PORT.MULTIPLE[$CURRENT_SHIP] 1
  setvar $PORT.MAXMULTIPLE[$CURRENT_SHIP] $PORT.MULTIPLE[$CURRENT_SHIP]


  if ($SELL_FAILURES[$CURRENT_SHIP] > 5)
    send "'{" $switchboard~bot_name "} - I'm having problems selling my equipment to the port. Script Halting*"
    gosub :ENDCNSETTINGS
    gosub :CLEARADJACENT
    halt
  end
  goto :SELL
  :SELLHAGGLESUCCEEDED
  if ($PORT.MAXMULTIPLE[$CURRENT_SHIP] = 0)
    add $PORT.MULTIPLE[$CURRENT_SHIP] 2
  end

  :AFTERSELLSUCCESS

  if ($JET = "y")
    setvar $DOOREUPGRADE 0
    setvar $DOORGUPGRADE 0

    if (($PORT[$CURRENT_SHIP] = 3) or ($PORT[$CURRENT_SHIP] = 4))
      if ($PORT.ORE_SELLING[$CURRENT_SHIP] > $JETHOLDSORE)
        if ($EMP[$CURRENT_SHIP] >= $JETHOLDSORE)

          send $JETHOLDSORE
          gosub :BUYHAGGLE
          if ($BUYHAGGLE = 1)
            subtract $PORT.ORE_SELLING[$CURRENT_SHIP] $JETHOLDSORE
          end
        else
          send "0*"
        end
      elseif ($PORT.ORE_SELLING[$CURRENT_SHIP] > 0)
        send "'{" $switchboard~bot_name "} - This port is selling little ore, I will upgrade a small amount.*"
        add $PORT.ORE_SELLING[$CURRENT_SHIP] 500
        setvar $DOOREUPGRADE 1
        send "0*"
      else
        send "'{" $switchboard~bot_name "} - This port is selling 0 ore, I will upgrade a small amount.*"
        add $PORT.ORE_SELLING[$CURRENT_SHIP] 500
        setvar $DOOREUPGRADE 1
      end
    end

    if (($PORT[$CURRENT_SHIP] = 2) or ($PORT[$CURRENT_SHIP] = 4))
      if ($PORT.ORG_SELLING[$CURRENT_SHIP] > $JETHOLDSORG)
        if ($EMP[$CURRENT_SHIP] >= $JETHOLDSORG)
          send $JETHOLDSORG
          gosub :BUYHAGGLE
          if ($BUYHAGGLE = 1)
            subtract $PORT.ORG_SELLING[$CURRENT_SHIP] $JETHOLDSORG
          end
        else
          send "0*"
        end
      elseif ($PORT.ORG_SELLING[$CURRENT_SHIP] > 0)
        send "'{" $switchboard~bot_name "} - This port is selling little org, I will upgrade a small amount.*"
        add $PORT.ORG_SELLING[$CURRENT_SHIP] 500
        setvar $DOORGUPGRADE 1
        send "0*"
      else
        send "'{" $switchboard~bot_name "} - This port is selling 0 org, I will upgrade a small amount.*"
        add $PORT.ORG_SELLING[$CURRENT_SHIP] 500
        setvar $DOORGUPGRADE 1
      end
    end
    if ($DOOREUPGRADE = 1)
      setvar $DOOREUPGRADE 0
      send "o 1 10 *  1 10 *  1 10 *  1 10 *  1 10 * q"
    end
    if ($DOORGUPGRADE = 1)
      setvar $DOORGUPGRADE 0
      send "o 2 5 *  2 5 *  2 5 *  2 5 *  2 5 *  2 5 *  2 5 *  2 5 *  2 5 *  2 5 * q"
    end
    send "JY"
    setvar $EMP[$CURRENT_SHIP] $HOLDS[$CURRENT_SHIP]
    setvar $ORE[$CURRENT_SHIP] 0
    setvar $ORG[$CURRENT_SHIP] 0
    setvar $EQU[$CURRENT_SHIP] 0
    setvar $COL[$CURRENT_SHIP] 0
  else

    if (($PORT[$CURRENT_SHIP] = 3) or ($PORT[$CURRENT_SHIP] = 4))
      if ($PORT.ORE_SELLING[$CURRENT_SHIP] > 0)
        send "0*"
      else
        send "'{" $switchboard~bot_name "} - This port is selling 0 ore, I will upgrade a small amount.*"
        setvar $DOOREUPGRADE 1
        add $PORT.ORE_SELLING[$CURRENT_SHIP] 10
      end
    end
    if (($PORT[$CURRENT_SHIP] = 2) or ($PORT[$CURRENT_SHIP] = 4))
      if ($PORT.ORG_SELLING[$CURRENT_SHIP] > 0)
        send "0*"
      else
        send "'{" $switchboard~bot_name "} - This port is selling 0 org, I will upgrade a small amount.*"
        setvar $DOORGUPGRADE 1
        add $PORT.ORG_SELLING[$CURRENT_SHIP] 10
      end
    end
    if ($DOOREUPGRADE = 1)
      setvar $DOOREUPGRADE 0
      send "o 1 1 * q"
    end
    if ($DOORGUPGRADE = 1)
      setvar $DOORGUPGRADE 0
      send "o 2 1 * q"
    end
    send "JY"
    setvar $EMP[$CURRENT_SHIP] $HOLDS[$CURRENT_SHIP]
    setvar $ORE[$CURRENT_SHIP] 0
    setvar $ORG[$CURRENT_SHIP] 0
    setvar $EQU[$CURRENT_SHIP] 0
    setvar $COL[$CURRENT_SHIP] 0
  end
  return
else
  send "'{" $switchboard~bot_name "} - There is no equ to sell, something is wrong*"
  gosub :ENDCNSETTINGS
  gosub :CLEARADJACENT
  halt
end

:NATIVEPORTTRADE
setVar $nativePortActive 0
send "PT"
:NATIVEPORTTRADEWAIT
setTextLineTrigger NATIVEPORTSTART1 :NATIVEPORTTRADEPROGRESS "<Port>"
setTextLineTrigger NATIVEPORTSTART2 :NATIVEPORTTRADEPROGRESS "Docking..."
setTextTrigger NATIVEPORTSTART3 :NATIVEPORTTRADEPROGRESS "Your offer ["
setTextTrigger NATIVEPORTSTART4 :NATIVEPORTTRADEPROGRESS "Our final offer"
setTextTrigger NATIVEPORTSTART5 :NATIVEPORTTRADEPROGRESS "Agreed,"
setTextTrigger NATIVEPORTQTY :NATIVEPORTTRADEQTY "How many holds of "
if ($nativePortActive = 1)
  setTextTrigger NATIVEPORTDONE1 :NATIVEPORTTRADEDONE "Command [TL="
  setTextTrigger NATIVEPORTDONE2 :NATIVEPORTTRADEDONE "Citadel command"
end
pause

:NATIVEPORTTRADEPROGRESS
killalltriggers
setVar $nativePortActive 1
goto :NATIVEPORTTRADEWAIT

:NATIVEPORTTRADEQTY
killalltriggers
setVar $nativePortActive 1
setVar $nativeLine CURRENTLINE
gosub :HANDLENATIVEPORTQTY
goto :NATIVEPORTTRADEWAIT

:NATIVEPORTTRADEDONE
killalltriggers
return

:HANDLENATIVEPORTQTY
setVar $nativeTradeProduct "None"
setVar $nativeIsBuy 0
setVar $nativeIsSell 0

getWordPos $nativeLine $nativeX " do you want to buy "
if ($nativeX > 0)
  setVar $nativeIsBuy 1
else
  setVar $nativeIsSell 1
end

getWordPos $nativeLine $nativeX "Fuel"
if ($nativeX > 0)
  setVar $nativeTradeProduct "Fuel"
else
  getWordPos $nativeLine $nativeX "Organics"
  if ($nativeX > 0)
    setVar $nativeTradeProduct "Organics"
  else
    getWordPos $nativeLine $nativeX "Equipment"
    if ($nativeX > 0)
      setVar $nativeTradeProduct "Equipment"
    end
  end
end

if ($nativeIsSell = 1)
  if (($nativeTradeProduct = "Fuel") and ($nativeSellOre > 0))
    send "*"
    setVar $nativeSellOre 0
  elseif (($nativeTradeProduct = "Organics") and ($nativeSellOrg > 0))
    send "*"
    setVar $nativeSellOrg 0
  elseif (($nativeTradeProduct = "Equipment") and ($nativeSellEqu > 0))
    send "*"
    setVar $nativeSellEqu 0
  else
    send "0*"
  end
  return
end

if (($nativeTradeProduct = "Fuel") and ($nativeBuyOre > 0))
  send $nativeBuyOre & "*"
  setVar $nativeBuyOre 0
elseif (($nativeTradeProduct = "Organics") and ($nativeBuyOrg > 0))
  send $nativeBuyOrg & "*"
  setVar $nativeBuyOrg 0
elseif (($nativeTradeProduct = "Equipment") and ($nativeBuyEqu > 0))
  send $nativeBuyEqu & "*"
  setVar $nativeBuyEqu 0
else
  send "0*"
end
return

:BUYHAGGLE
send "*"
settextlinetrigger BUYFIRSTOFFER :BUYFIRSTOFFER "We'll sell them for"
pause
pause
:BUYFIRSTOFFER
killalltriggers
getword CURRENTLINE $OFFER 5
striptext $OFFER ","
setvar $COUNTER $OFFER
multiply $COUNTER 92
divide $COUNTER 100
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
settextlinetrigger BUYSCREWUP7 :BUYSCREWUP "Make a real offer or get the h*ll out of here!"
settextlinetrigger BUYSCREWUP8 :BUYSCREWUP "WHAT?!@!? you must be crazy!"
settextlinetrigger BUYSCREWUP9 :BUYSCREWUP "So, you think I'm as stupid as you look? Make a real offer."
settextlinetrigger BUYSCREWUP10 :BUYSCREWUP "What do you take me for, a fool?  Make a real offer!"
pause
pause
:BUYSCREWUP
killalltriggers

multiply $COUNTER 102
divide $COUNTER 100
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
goto :BUYHAGGLEFAILED
:BUYEXPERIENCE
killalltriggers
getword CURRENTLINE $EXP_BONUS 7
add $EXP $EXP_BONUS
add $JETBONUS $EXP_BONUS

goto :BUYOFFERLOOP
:BUYEMPTY
killalltriggers
getword CURRENTLINE $player~credits 3
striptext $player~credits ","
setvar $OLDEMP[$CURRENT_SHIP] $EMP[$CURRENT_SHIP]
getword CURRENTLINE $EMP[$CURRENT_SHIP] 6
if ($OLDEMP[$CURRENT_SHIP] = $EMP[$CURRENT_SHIP])
  goto :BUYHAGGLEFAILED
else
  goto :BUYHAGGLESUCCEEDED
end
:BUYHAGGLEFAILED

setvar $BUYHAGGLE 0
return
:BUYHAGGLESUCCEEDED
add $JETCOST $COUNTER
setvar $BUYHAGGLE 1
return
:STEAL





setvar $STEAL_HOLDS $EXP
divide $STEAL_HOLDS $STEAL_DIVISOR
if ($STEAL_HOLDS < 10)
  send "'{" $switchboard~bot_name "} - You need more experience to SST!!!*"
  gosub :ENDCNSETTINGS
  gosub :CLEARADJACENT
  halt
elseif ($HOLDS[$CURRENT_SHIP] < 10)
  send "'{" $switchboard~bot_name "} - You need more cargo holds to SST!!!*"
  gosub :ENDCNSETTINGS
  gosub :CLEARADJACENT
  halt
end
if (($STEAL_HOLDS > 300) and ($JET = "y"))
  send "'{" $switchboard~bot_name "} - We are at " $STEAL_HOLDS " holds of experience, stopping JET*"
  setvar $JET ""
end
if ($STEAL_HOLDS > $EMP[$CURRENT_SHIP])
  setvar $STEAL_HOLDS $EMP[$CURRENT_SHIP]
end

setvar $DESIRED_HOLDS_ON_PORT $STEAL_HOLDS
add $DESIRED_HOLDS_ON_PORT 2

subtract $player~turns 1
send "PR*SZ3"
waitfor "furtively about"
settextlinetrigger EQUONPORT :EQUONPORT "Equipment  Buying"
settextlinetrigger FAKE :FAKE "Suddenly you're Busted!"
pause
pause
:EQUONPORT
killalltriggers
getword CURRENTLINE $HOLDS_ON_PORT 4
if ($HOLDS_ON_PORT < $DESIRED_HOLDS_ON_PORT)
  setvar $UPGRADE_AMOUNT $DESIRED_HOLDS_ON_PORT
  subtract $UPGRADE_AMOUNT $HOLDS_ON_PORT
  divide $UPGRADE_AMOUNT 10
  add $UPGRADE_AMOUNT 1
else
  setvar $UPGRADE_AMOUNT 0
end
if ($HOLDS_ON_PORT < 10)
  setvar $STEAL_HOLDS 0
  goto :DOTHEDEED
elseif ($HOLDS_ON_PORT < $STEAL_HOLDS)
  setvar $TEMP $STEAL_HOLDS
  multiply $TEMP 10
  divide $TEMP $HOLDS_ON_PORT
  if ($TEMP <= 20)
    setvar $STEAL_HOLDS $HOLDS_ON_PORT
  else
    setvar $STEAL_HOLDS 0
  end
end
:DOTHEDEED
if ($DEBUGDELAY <> 0)
  setdelaytrigger TESTING :TESTING $DEBUGDELAY
  pause
  pause
end
:TESTING
send $STEAL_HOLDS&"*"
settextlinetrigger BUST :BUST "For getting caught"
settextlinetrigger NOSTEAL :NOSTEAL "You leave the port"
settextlinetrigger GOOD :GOOD "and you receive"
pause
pause
:BUST
killalltriggers


setsectorparameter 1 "LRA" CURRENTSECTOR
setvar $CKLRA CURRENTSECTOR
savevar $CKLRA
setsectorparameter CURRENTSECTOR "BUSTED" TRUE
send "'<"&$bot~subspace&">[Busted:"&CURRENTSECTOR "]<"&$bot~subspace&">*"
gosub :GETINFO
goto :FINISH
:FAKE
killalltriggers
gosub :player~quikstats
setsectorparameter $player~current_sector "FAKEBUST" TRUE
send "  "
send "N  N  *  *"
send "'{" $switchboard~bot_name "} - FAKE Busted in Ship "&$CURRENT_SHIP&", need a super furb*"
gosub :ENDCNSETTINGS
gosub :CLEARADJACENT
halt
:GOOD
killalltriggers

getword CURRENTLINE $EXP_BONUS 4
add $EXP $EXP_BONUS
add $EQU[$CURRENT_SHIP] $STEAL_HOLDS
subtract $EMP[$CURRENT_SHIP] $STEAL_HOLDS
if ($UPGRADE_AMOUNT <> 0)
  send "o  3"&$UPGRADE_AMOUNT&"**"
end
setsectorparameter 1 "LRA" CURRENTSECTOR
setvar $CKLRA CURRENTSECTOR
savevar $CKLRA

return
:NOSTEAL
killalltriggers
if ($UPGRADE_AMOUNT <> 0)
  send "o  3"&$UPGRADE_AMOUNT&"**"
end
goto :STEAL
:XPORT



if ($SHIP_1 = $CURRENT_SHIP)
  setvar $CURRENT_SHIP $SHIP_2
else
  setvar $CURRENT_SHIP $SHIP_1
end
subtract $player~turns 1
if ($SKIP_SHIPS = "YES")
  setvar $XPORTSTRING "X  "&$CURRENT_SHIP&"*  Q"
  send $XPORTSTRING
  return
else
  setvar $XPORTSTRING "X  "&$CURRENT_SHIP&"*Q"
  send $XPORTSTRING
  settextlinetrigger NOXPORTSHIP :NOXPORTSHIP "That is not an available ship"
  settextlinetrigger NOXPORTRANGE :NOXPORTRANGE "only has a transport range"
  settextlinetrigger NOXPORTPASSWORD :NOXPORTPASSWORD "Enter the password for"
  settextlinetrigger XPORTSUCCESS :XPORTSUCCESS "Security code accepted"
  pause
  pause
  :NOXPORTSHIP
  killalltriggers
  send "'{" $switchboard~bot_name "} - That is not an available ship, Script Halting.*"
  gosub :ENDCNSETTINGS
  gosub :CLEARADJACENT
  halt
  :NOXPORTRANGE
  killalltriggers
  send "'{" $switchboard~bot_name "} - Not enough transport range, Script Halting.*"
  gosub :ENDCNSETTINGS
  gosub :CLEARADJACENT
  halt
  :NOXPORTPASSWORD
  killalltriggers
  send "'{" $switchboard~bot_name "} - Transport ship requires a password, Script Halting.*"
  gosub :ENDCNSETTINGS
  gosub :CLEARADJACENT
  halt
  :XPORTSUCCESS
  killalltriggers
  return
end
:STARTCNSETTINGS


send "CN"

settextlinetrigger ANSI0 :ANSI0 "(1) ANSI graphics            - Off"
settextlinetrigger ANSI1 :ANSI1 "(1) ANSI graphics            - On"
pause
:ANSI0

killalltriggers
setvar $CN1 0
goto :CN1DONE
:ANSI1
killalltriggers
setvar $CN1 1
:CN1DONE

settextlinetrigger ANIM0 :ANIM0 "(2) Animation display        - Off"
settextlinetrigger ANIM1 :ANIM1 "(2) Animation display        - On"
pause
:ANIM0

killalltriggers
setvar $CN2 0
goto :CN2DONE
:ANIM1
killalltriggers
setvar $CN2 1
:CN2DONE

settextlinetrigger PAGE0 :PAGE0 "(3) Page on messages         - Off"
settextlinetrigger PAGE1 :PAGE1 "(3) Page on messages         - On"
pause
:PAGE0

killalltriggers
setvar $CN3 0
goto :CN3DONE
:PAGE1
killalltriggers
setvar $CN3 1
:CN3DONE

settextlinetrigger SILENCE0 :SILENCE0 "(7) Silence ALL messages     - No"
settextlinetrigger SILENCE1 :SILENCE1 "(7) Silence ALL messages     - Yes"
pause
:SILENCE0

killalltriggers
setvar $CN7 0
goto :CN7DONE
:SILENCE1
killalltriggers
setvar $CN7 1
:CN7DONE

settextlinetrigger ABORTDISPLAY0 :ABORTDISPLAY0 "(9) Abort display on keys    - SPACE"
settextlinetrigger ABORTDISPLAY1 :ABORTDISPLAY1 "(9) Abort display on keys    - ALL KEYS"
pause
:ABORTDISPLAY0

killalltriggers
setvar $CN9 0
goto :CN9DONE
:ABORTDISPLAY1
killalltriggers
setvar $CN9 1
:CN9DONE

settextlinetrigger MESSAGEDISPLAY0 :MESSAGEDISPLAY0 "(A) Message Display Mode     - Compact"
settextlinetrigger MESSAGEDISPLAY1 :MESSAGEDISPLAY1 "(A) Message Display Mode     - Long"
pause
:MESSAGEDISPLAY0

killalltriggers
setvar $CNA 0
goto :CNADONE
:MESSAGEDISPLAY1
killalltriggers
setvar $CNA 1
:CNADONE

settextlinetrigger SCREENPAUSES0 :SCREENPAUSES0 "(B) Screen Pauses            - No"
settextlinetrigger SCREENPAUSES1 :SCREENPAUSES1 "(B) Screen Pauses            - Yes"
pause
:SCREENPAUSES0

killalltriggers
setvar $CNB 0
goto :CNBDONE
:SCREENPAUSES1
killalltriggers
setvar $CNB 1
:CNBDONE

waitfor "Settings command (?=Help)"
gosub :SENDCNSTRING
send "?"
waitfor "Settings command (?=Help)"
send "QQ"
settexttrigger SUBSTARTCNCONTINUE1 :SUBSTARTCNCONTINUE "Command [TL="
settexttrigger SUBSTARTCNCONTINUE2 :SUBSTARTCNCONTINUE "Citadel command (?=help)"
pause
:SUBSTARTCNCONTINUE
killalltriggers
return
:ENDCNSETTINGS




send "CN"
waitfor "Settings command (?=Help)"
gosub :SENDCNSTRING
send "?"
waitfor "Settings command (?=Help)"
send "QQ"
settexttrigger SUBENDCNCONTINUE1 :SUBENDCNCONTINUE "Command [TL="
settexttrigger SUBENDCNCONTINUE2 :SUBENDCNCONTINUE "Citadel command (?=help)"
pause
:SUBENDCNCONTINUE
killalltriggers
return
:SENDCNSTRING



if ($CN1 = 0)
  send "1  "
end
if ($CN2 = 1)
  send "2  "
end
if ($CN3 = 1)
  send "3  "
end
if ($CN7 = 1)
  send "7  "
end
if ($CN9 = 1)
  send "9  "
end
if ($CNA = 1)
  send "A  "
end
if ($CNB = 1)
  send "B  "
end
return
:VOIDADJACENT


send "*"
gosub :player~quikstats

if ($SEC1VOID = 0)
  setvar $SEC1VOID $player~current_sector
else
  setvar $SEC2VOID $player~current_sector
end
if (SECTOR.WARPS[$player~current_sector][1] = 0)
  send "'{" $switchboard~bot_name "} - This sector has no warps, maybe you need to scan it first*"
  gosub :ENDCNSETTINGS
  gosub :CLEARADJACENT
  halt
else
  setvar $VOIDSECT 0
  :VOIDS
  add $VOIDSECT 1
  if ($VOIDSECT < 7)
    if (SECTOR.WARPS[$player~current_sector][$VOIDSECT] <> 0)
      send "CV"&SECTOR.WARPS[$player~current_sector][$VOIDSECT]&"*Q"
    end
    goto :VOIDS
  end

  send "'{" $switchboard~bot_name "} - Avoids set on all adjacent sectors*"
  send "/"
  waitfor " Sect "
  return
end
:CLEARADJACENT





setvar $VOIDSECT 0
:CLEARVOIDS
if ($SEC1VOID > 0)
  add $VOIDSECT 1
  if ($VOIDSECT < 7)
    if (SECTOR.WARPS[$SEC1VOID][$VOIDSECT] <> 0)
      send "CV0*YN"&SECTOR.WARPS[$SEC1VOID][$VOIDSECT]&"*Q"
    end
    goto :CLEARVOIDS
  end
end

send "'{" $switchboard~bot_name "} - Avoids cleared on all adjacent sectors*"
send "/"
waitfor " Sect "

if ($SEC2VOID > 0)
  setvar $VOIDSECT 0
  :CLEARVOIDS2
  add $VOIDSECT 1
  if ($VOIDSECT < 7)
    if (SECTOR.WARPS[$SEC2VOID][$VOIDSECT] <> 0)
      send "CV0*YN"&SECTOR.WARPS[$SEC2VOID][$VOIDSECT]&"*Q"
    end
    goto :CLEARVOIDS2
  end

  send "'{" $switchboard~bot_name "} - Avoids cleared on all adjacent sectors*"
  send "/"
  waitfor " Sect "
end

return

# includes:
include "source\include\loadvars"
include "source\include\help"
include "source\include\player"
