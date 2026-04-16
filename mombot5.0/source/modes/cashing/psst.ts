logging "OFF"
goto :START_SCRIPT
:FINDSSTPORTS


if ($SHIP1NEEDSPORT)
  if ($INSHIP1 <> TRUE)
    gosub :TRANSPORT
  end
  getnearestwarps $NEAREST $SHIP1SECTOR
  setvar $I 1
  if ($I <= $NEAREST)
    setvar $FOCUS $NEAREST[$I]
    getsectorparameter $FOCUS "BUSTED" $ISBUSTED
    getsectorparameter $FOCUS "FIGSEC" $ISFIGGED
    if (($ISFIGGED = TRUE) and (($ISBUSTED <> TRUE) and (((PORT.EXISTS[$FOCUS] = TRUE) and ((PORT.EQUIP[$FOCUS] > 0) and (PORT.BUYEQUIP[$FOCUS] = TRUE))) and (($FOCUS <> $SHIP2SECTOR) and ($FOCUS <> $SHIP1SECTOR)))))

      getdistance $DISTANCETHERE $SHIP2SECTOR $FOCUS
      getdistance $DISTANCEBACK $FOCUS $SHIP2SECTOR
      if ($DISTANCETHERE < 0)
        send "^f"&$SHIP2SECTOR&"*"&$FOCUS&"*q"
        waiton "ENDINTERROG"
        getdistance $DISTANCETHERE $SHIP2SECTOR $FOCUS
      end
      if ($DISTANCEBACK < 0)
        send "^f"&$FOCUS&"*"&$SHIP2SECTOR&"*q"
        waiton "ENDINTERROG"
        getdistance $DISTANCEBACK $FOCUS $SHIP2SECTOR
      end
      if ($DISTANCETHERE > $TRANSPORTRANGE)
        setvar $NEARFIG 0
        echo ANSI_15 "*No Ports Within Transport Range" ANSI_7
        goto :CONTINUEONSHIP1
      elseif ($DISTANCEBACK > $TRANSPORTRANGE)
        goto :CANTTRANSPORTSHIP1
      else
        killalltriggers
        send "l "&$PSST_PLANET1&"* c p "&$FOCUS&"*y"
        settextlinetrigger PWARPNOSHIP1 :PWARPNOSHIP1 "You do not have any fighters in Sector "
        settextlinetrigger PWARPYESSHIP1 :PWARPYESSHIP1 " Planetary TransWarp Drive Engaged! "
        settextlinetrigger PWARPNOFUEL1 :PWARPNOFUEL1 "You do not have enough Fuel Ore on this planet to make the jump."
        pause
        :PWARPNOFUEL1
        send "'{" $BOT_NAME "} Not enough fuel on planet "&$PSST_PLANET1&". Halting Script.*"
        goto :ENDSST
        :PWARPYESSHIP1
        killalltriggers
        gosub :QUIKSTATS
        setvar $SHIP1NEEDSPORT FALSE
        setvar $SHIP1SECTOR $FOCUS
        gosub :GETSSTPORTINFO
        setvar $SHIP1TOTALHOLDS $TOTAL_HOLDS
        setvar $SHIP1EQUIPMENT $EQUIPMENT_HOLDS
        gosub :DISPLAYCREDITS
        send "q *q *"
        if ($P1CHK = 1)
          setvar $P1CHK 2
        elseif ($P1CHK = 2)
          setvar $P1CHK 3
        elseif ($P1CHK = 3)
          setvar $P1CHK 1
        end
        waiton "Fuel Ore"
        getword CURRENTLINE $PLANET1FUEL[$P1CHK] 6
        striptext $PLANET1FUEL[$P1CHK] ","
        goto :CONTINUEONSHIP1
        :PWARPNOSHIP1
        killalltriggers
        gosub :DISPLAYCREDITS
        send "q q "
      end
    :CANTTRANSPORTSHIP1

    add $I 1
  end
  :CONTINUEONSHIP1


end
end
if ($SHIP2NEEDSPORT)
  if ($INSHIP1)
    gosub :TRANSPORT
  end
  getnearestwarps $NEAREST $SHIP2SECTOR
  setvar $I 1
  if ($I <= $NEAREST)
    setvar $FOCUS $NEAREST[$I]
    getsectorparameter $FOCUS "BUSTED" $ISBUSTED
    getsectorparameter $FOCUS "FIGSEC" $ISFIGGED
    if (($ISFIGGED = TRUE) and (($ISBUSTED <> TRUE) and (((PORT.EXISTS[$FOCUS] = TRUE) and ((PORT.EQUIP[$FOCUS] > 0) and (PORT.BUYEQUIP[$FOCUS] = TRUE))) and (($FOCUS <> $SHIP1SECTOR) and ($FOCUS <> $SHIP2SECTOR)))))
      getdistance $DISTANCETHERE $SHIP1SECTOR $FOCUS
      getdistance $DISTANCEBACK $FOCUS $SHIP1SECTOR
      if ($DISTANCETHERE < 0)
        send "^f"&$SHIP1SECTOR&"*"&$FOCUS&"*q"
        waiton "ENDINTERROG"
        getdistance $DISTANCETHERE $SHIP1SECTOR $FOCUS
      end
      if ($DISTANCEBACK < 0)
        send "^f"&$FOCUS&"*"&$SHIP1SECTOR&"*q"
        waiton "ENDINTERROG"
        getdistance $DISTANCEBACK $FOCUS $SHIP1SECTOR
      end
      if ($DISTANCETHERE > $TRANSPORTRANGE)
        setvar $NEARFIG 0
        send "'{" $BOT_NAME "} No Ports Within Transport Range*"
        goto :ENDSST
      elseif ($DISTANCEBACK > $TRANSPORTRANGE)
        goto :CANTTRANSPORT
      else
        killalltriggers
        send "l "&$PSST_PLANET2&"* c p "&$FOCUS&"*y"
        settextlinetrigger PWARPNOSHIP2 :PWARPNOSHIP2 "You do not have any fighters in Sector "
        settextlinetrigger PWARPYESSHIP2 :PWARPYESSHIP2 " Planetary TransWarp Drive Engaged! "
        settextlinetrigger PWARPNOFUEL2 :PWARPNOFUEL2 "You do not have enough Fuel Ore on this planet to make the jump."
        pause
        :PWARPNOFUEL2
        send "'{" $BOT_NAME "} Not enough fuel on planet "&$PSST_PLANET2&". Halting Script.*"
        goto :ENDSST
        :PWARPYESSHIP2
        killalltriggers
        gosub :QUIKSTATS
        setvar $SHIP2NEEDSPORT FALSE
        setvar $SHIP2SECTOR $FOCUS
        gosub :GETSSTPORTINFO
        setvar $SHIP2TOTALHOLDS $TOTAL_HOLDS
        setvar $SHIP2EQUIPMENT $EQUIPMENT_HOLDS
        gosub :DISPLAYCREDITS
        send "q *q *"
        if ($P2CHK = 1)
          setvar $P2CHK 2
        elseif ($P2CHK = 2)
          setvar $P2CHK 3
        elseif ($P2CHK = 3)
          setvar $P2CHK 1
        end
        waiton "Fuel Ore"
        getword CURRENTLINE $PLANET2FUEL[$P2CHK] 6
        striptext $PLANET2FUEL[$P2CHK] ","
        goto :CONTINUEONSHIP2
        :PWARPNOSHIP2
        killalltriggers
        gosub :DISPLAYCREDITS
        send "q q "
      end
    :CANTTRANSPORT

    add $I 1
  end
  :CONTINUEONSHIP2



end
end
return
:STEAL

if (($ISBUSTED1 <> TRUE) and ($ISBUSTED2 <> TRUE))
  setvar $MAXSTEAL (($EXPERIENCE / $STEAL_FACTOR) - 1)
  setvar $SEND ""
  if ($INSHIP1)
    if ($SHIP1EQUIPMENT > 0)

      setvar $SEND $SEND&"p t * * 0* 0* "
      setvar $SHIP1EQUIPMENT 0
      add $EQUIPATPORT[$SHIP1SECTOR] $SHIP1EQUIPMENT
    end

    if ($SHIP1TOTALHOLDS < $MAXSTEAL)
      setvar $STEAL $SHIP1TOTALHOLDS
    else
      setvar $STEAL $MAXSTEAL
    end

    while ($EQUIPATPORT[$SHIP1SECTOR] < ($STEAL + 20))
      setvar $UPGRADE ($STEAL - $EQUIPATPORT[$SHIP1SECTOR])
      divide $UPGRADE 10
      add $UPGRADE 4
      setvar $SEND $SEND&"o 3"&$UPGRADE&"* * "
      add $EQUIPATPORT[$SHIP1SECTOR] ($UPGRADE * 10)
    end

    setvar $SEND $SEND&"p r* s   z3  "&$STEAL&"*  x    "
    setvar $SHIP1EQUIPMENT $STEAL
    send $SEND&$PSST_SHIP2&"*  * "
    setvar $INSHIP1 FALSE
    setvar $LASTSTEAL $SHIP1SECTOR
  else
    if ($SHIP2EQUIPMENT > 0)

      setvar $SEND $SEND&"p t * * 0* 0* "
      setvar $SHIP2EQUIPMENT 0
      add $EQUIPATPORT[$SHIP2SECTOR] $SHIP2EQUIPMENT
    end

    if ($SHIP2TOTALHOLDS < $MAXSTEAL)
      setvar $STEAL $SHIP2TOTALHOLDS
    else
      setvar $STEAL $MAXSTEAL
    end

    while ($EQUIPATPORT[$SHIP2SECTOR] < ($STEAL + 20))
      setvar $UPGRADE ($STEAL - $EQUIPATPORT[$SHIP2SECTOR])
      divide $UPGRADE 10
      add $UPGRADE 4
      setvar $SEND $SEND&"o 3"&$UPGRADE&"* * "
      add $EQUIPATPORT[$SHIP2SECTOR] ($UPGRADE * 10)
    end
    setvar $SEND $SEND&"p r* s   z3  "&$STEAL&"*  x    "
    setvar $SHIP2EQUIPMENT $STEAL
    send $SEND&$PSST_SHIP1&"*  * "
    setvar $INSHIP1 TRUE
    setvar $LASTSTEAL $SHIP2SECTOR
  end
end



setvar $STAKE (($STEAL - 1) / 11)

waiton "(R)ob this port, (S)teal product"
settextlinetrigger SUCCESS :SUCCESS "Success!"
settextlinetrigger BUSTED :BUSTED "Suddenly you're Busted!"
settextlinetrigger PORTMAXXED :BUSTED "There aren't that many holds of Equipment at this port!"
settextlinetrigger FAKEBUST :BUSTED "Do you want instructions (Y/N) [N]?"
pause
:SUCCESS

add $EXPERIENCE $STAKE
if ($INSHIP1)
  setvar $SHIP2EQUIPMENT 1
else
  setvar $SHIP1EQUIPMENT 1
end
killalltriggers
return
:BUSTED


if ($INSHIP1)
  subtract $SHIP2TOTALHOLDS $STAKE
  setvar $LASTBUSTSECTOR $SHIP2SECTOR
  setvar $SHIP2EQUIPMENT 0
else
  subtract $SHIP1TOTALHOLDS $STAKE
  setvar $LASTBUSTSECTOR $SHIP1SECTOR
  setvar $SHIP1EQUIPMENT 0
end
add $NUMBERBUSTED 1
setvar $BUSTED 1
gosub :TRANSPORT
if ($INSHIP1)
  setvar $SHIP1NEEDSPORT TRUE
else
  setvar $SHIP2NEEDSPORT TRUE
end
send "'<"&$SUBSPACE&">[Busted:"&$LASTBUSTSECTOR&"]<"&$SUBSPACE&">* c"
setsectorparameter $LASTBUSTSECTOR "BUSTED" TRUE
savevar $LASTBUSTSECTOR
waiton "<Computer activated>"
send "tq"
settextlinetrigger AM :GETBUSTSTAMP " AM "
settextlinetrigger PM :GETBUSTSTAMP " PM "
pause
:GETBUSTSTAMP
killalltriggers
if ($INSHIP1)
  if (($BUST_FILE <> "") and ($BUST_FILE <> 0))
    write $BUST_FILE $SHIP1SECTOR&"  "&CURRENTLINE
  end
else
  if (($BUST_FILE <> "") and ($BUST_FILE <> 0))
    write $BUST_FILE $SHIP2SECTOR&"  "&CURRENTLINE
  end
end

waiton "<Computer deactivated>"

return
goto :QUIKSTATS_PLAYER_INCLUDE
include "source\include\player"
:QUIKSTATS_PLAYER_INCLUDE
:QUIKSTATS
gosub :PLAYER~QUIKSTATS
setvar $CURRENT_PROMPT $PLAYER~CURRENT_PROMPT
setvar $CURRENT_SECTOR $PLAYER~CURRENT_SECTOR
setvar $TURNS $PLAYER~TURNS
setvar $CREDITS $PLAYER~CREDITS
setvar $FIGHTERS $PLAYER~FIGHTERS
setvar $SHIELDS $PLAYER~SHIELDS
setvar $TOTAL_HOLDS $PLAYER~TOTAL_HOLDS
setvar $ORE_HOLDS $PLAYER~ORE_HOLDS
setvar $ORGANIC_HOLDS $PLAYER~ORGANIC_HOLDS
setvar $EQUIPMENT_HOLDS $PLAYER~EQUIPMENT_HOLDS
setvar $COLONIST_HOLDS $PLAYER~COLONIST_HOLDS
setvar $PHOTONS $PLAYER~PHOTONS
setvar $ARMIDS $PLAYER~ARMIDS
setvar $LIMPETS $PLAYER~LIMPETS
setvar $GENESIS $PLAYER~GENESIS
setvar $TWARP_TYPE $PLAYER~TWARP_TYPE
setvar $CLOAKS $PLAYER~CLOAKS
setvar $BEACONS $PLAYER~BEACONS
setvar $ATOMIC $PLAYER~ATOMIC
setvar $CORBO $PLAYER~CORBO
setvar $EPROBES $PLAYER~EPROBES
setvar $MINE_DISRUPTORS $PLAYER~MINE_DISRUPTORS
setvar $PSYCHIC_PROBE $PLAYER~PSYCHIC_PROBE
setvar $PLANET_SCANNER $PLAYER~PLANET_SCANNER
setvar $SCAN_TYPE $PLAYER~SCAN_TYPE
setvar $ALIGNMENT $PLAYER~ALIGNMENT
setvar $EXPERIENCE $PLAYER~EXPERIENCE
setvar $CORP $PLAYER~CORP
setvar $CORPNUMBER $PLAYER~CORPNUMBER
setvar $SHIP_NUMBER $PLAYER~SHIP_NUMBER
setvar $SHIP_TYPE $PLAYER~SHIP_TYPE
setvar $FULL_CURRENT_PROMPT $PLAYER~FULL_CURRENT_PROMPT
setvar $FEDSPACE $PLAYER~FEDSPACE
setvar $SELF_DESTRUCT_PROMPT $PLAYER~SELF_DESTRUCT_PROMPT
return
:START_SCRIPT




setvar $BUST_FILE "MOM_"&GAMENAME&"_Busts.txt"
setvar $FIG_FILE "MOM_"&GAMENAME&"_Fighter_Grid.txt"
setvar $FIG_COUNT_FILE "MOM_"&GAMENAME&"_Fighter_Grid_Count.cnt"
loadvar $STEAL_FACTOR
loadvar $UNLIMITEDGAME
loadvar $BOT_TURN_LIMIT
loadvar $USER_COMMAND_LINE
loadvar $PARM1
loadvar $PARM2
loadvar $PARM3
loadvar $PARM4
loadvar $PARM5
loadvar $PARM6
loadvar $PARM7
loadvar $PARM8
loadvar $BOT_NAME
loadvar $RYLOS
loadvar $ALPHA_CENTAURI
loadvar $STARDOCK
loadvar $SUBSPACE

gosub :QUIKSTATS
setvar $STARTINGLOCATION $CURRENT_PROMPT
isnumber $ISPARAMONENUMBER $PARM1
isnumber $ISPARAMTWONUMBER $PARM2
isnumber $ISPARAMTHREENUMBER $PARM3

if ($STARTINGLOCATION <> "Command")
  send "'{" $BOT_NAME "} - Planet SST must be run from command prompt*"
  halt
end
lowercase $PARM1
if ($PARM1 = "clear_busts")
  delete $BUST_FILE
  setvar $I 1
  while ($I <= SECTORS)
    setsectorparameter $I "BUSTED" FALSE
    add $I 1
  end
  send "'{" $BOT_NAME "} - Bust file for this bot has been cleared.*"
  halt
elseif (($ISPARAMONENUMBER = TRUE) and (($ISPARAMTWONUMBER = TRUE) and ($ISPARAMTHREENUMBER = TRUE)))
  setvar $PSST_SHIP2 $PARM1
  setvar $PSST_PLANET1 $PARM2
  setvar $PSST_PLANET2 $PARM3
else
  send "'{" $BOT_NAME "} - Please use psst [ship2#] [planet1#] [planet2#] format.*"
  halt

end
setvar $PORTAVERAGE 1
send "jy*"
setvar $CASHDEPOSITED 0
gosub :QUIKSTATS
setvar $STARTCASH $CREDITS
setarray $PLANET1FUEL 3
setarray $PLANET2FUEL 3
setvar $PSST_SHIP1 $SHIP_NUMBER

if (($PSST_SHIP2 <= 0) or ($PSST_PLANET1 <= 0) or ($PSST_PLANET2 <= 0) or ($STEAL_FACTOR <= 0))
  send "'This module should be run from the MOM Bot.*"
  setvar $MODE "General"
  savevar $MODE
  halt
end
setvar $STARTINGSECTOR $CURRENT_SECTOR
setvar $INSHIP1 TRUE
setvar $P1CHK 3
setvar $P2CHK 3
if ($RYLOS > 10)
  setvar $REFURBPORT $RYLOS
elseif ($ALPHA_CENTAURI > 10)
  setvar $REFURBPORT $ALPHA_CENTAURI
else
  send "'{" $BOT_NAME "} - This bot has no locations of Class 0 ports in its database.  Cannot continue with Planet SST.*"
  setvar $MODE "General"
  savevar $MODE
  halt
end
if (SECTOR.PLANETCOUNT[$STARTINGSECTOR] <= 1)
  send "'{" $BOT_NAME "} - Planet SST must be run with at least two movable planets in the sector*"
  setvar $MODE "General"
  savevar $MODE
  halt
end
if (SECTOR.SHIPCOUNT[$STARTINGSECTOR] < 1)
  send "'{" $BOT_NAME "} - Planet SST must be run with at least one empty ship in the sector*"
  setvar $MODE "General"
  savevar $MODE
  halt
end
gosub :CHECKSSTPLANETS
gosub :CHECKSSTSHIPS
if ($FOUNDPLANET1 <> TRUE)
  send "'{" $BOT_NAME "} - Planet #1 entered for Planet SST was not valid for this sector.*"
  setvar $MODE "General"
  savevar $MODE
  halt
end
if ($FOUNDPLANET2 <> TRUE)
  send "'{" $BOT_NAME "} - Planet #2 entered for Planet SST was not valid for this sector.*"
  setvar $MODE "General"
  savevar $MODE
  halt
end
if ($FOUNDSHIP2 <> TRUE)
  send "'{" $BOT_NAME "} - Ship #2 entered for Planet SST was not valid for this sector.*"
  setvar $MODE "General"
  savevar $MODE
  halt
end
send "'{" $BOT_NAME "} Planet SST Powering Up!*"
send "c;q"
waiton "Transport Range:"
getword CURRENTLINE $TRANSPORTRANGE1 6
getword CURRENTLINE $MAXHOLDS1 3
gosub :TRANSPORT
send "c;q"
waiton "Transport Range:"
getword CURRENTLINE $TRANSPORTRANGE2 6
getword CURRENTLINE $MAXHOLDS2 3
gosub :TRANSPORT
if ($TRANSPORTRANGE1 <= $TRANSPORTRANGE2)
  setvar $TRANSPORTRANGE $TRANSPORTRANGE1
else
  setvar $TRANSPORTRANGE $TRANSPORTRANGE2
end
if ($MAXHOLDS1 >= $MAXHOLDS2)
  setvar $MINREFURB (($MAXHOLDS1 * 75) / 100)
else
  setvar $MINREFURB (($MAXHOLDS2 * 75) / 100)
end
send "'{" $BOT_NAME "} Minimum transport range of these two ships is "&$TRANSPORTRANGE&".*"

setvar $SHIP1SECTOR $CURRENT_SECTOR
setvar $SHIP2SECTOR $CURRENT_SECTOR
setvar $SHIP1NEEDSPORT TRUE
setvar $SHIP2NEEDSPORT TRUE
setvar $I 1
setvar $YES TRUE
setvar $BUSTED FALSE
setarray $EQUIPATPORT SECTORS
setarray $FUELATPORT SECTORS
window "CASH" 300 150 "Planet SST" "ONTOP"
gosub :DISPLAYCREDITS
while (TRUE)
  gosub :FINDSSTPORTS
  setvar $BUSTED FALSE
  getsectorparameter $SHIP1SECTOR "BUSTED" $ISBUSTED1
  getsectorparameter $SHIP2SECTOR "BUSTED" $ISBUSTED2
  while ($BUSTED = FALSE)
    if (($UNLIMITEDGAME = FALSE) and ($TURNS <= $BOT_TURN_LIMIT))
      goto :ENDSST
    end
    gosub :STEAL
  end
  if (($SHIP1TOTALHOLDS < $MINREFURB) or ($SHIP2TOTALHOLDS < $MINREFURB))
    gosub :REFURB
  end
  if (($PLANET1FUEL[1] < 100000) and (($PLANET1FUEL[2] < 100000) and ($PLANET1FUEL[3] < 100000)))
    goto :ENDSST
  elseif (($PLANET2FUEL[1] < 100000) and (($PLANET2FUEL[2] < 100000) and ($PLANET2FUEL[3] < 100000)))
    goto :ENDSST
  end
end
goto :ENDSST
:CHECKSSTPLANETS

setvar $FOUNDPLANET1 FALSE
setvar $FOUNDPLANET2 FALSE
killalltriggers
:NUMBERINGPLANETS

killalltriggers
settextlinetrigger PLANETGRABBER :PLANETLINE "   <"
settextlinetrigger BEDONE :DONE "Land on which planet "
send "lq*"
pause
:PLANETLINE
killalltriggers
setvar $LINE CURRENTLINE
replacetext $LINE "<" " "
replacetext $LINE ">" " "
striptext $LINE ","
getword $LINE $TEMP 1
if ($TEMP = $PSST_PLANET1)
  setvar $FOUNDPLANET1 TRUE
elseif ($TEMP = $PSST_PLANET2)
  setvar $FOUNDPLANET2 TRUE
end
settextlinetrigger GETLINE2 :PLANETLINE "   <"
settextlinetrigger GETEND :DONE "Land on which planet "
pause
:DONE
return
:CHECKSSTSHIPS


setvar $FOUNDSHIP2 FALSE
killalltriggers
send "wn*"
settextlinetrigger OTHER :SHIPLINE " "&$CURRENT_SECTOR&" "
settextlinetrigger NOSHIPS :SHIPDONE "You do not own any other ships in this sector!"
pause
:SHIPLINE

killalltriggers
add $SHIPCOUNT 1
getword CURRENTLINE $TEMPID 1
if ($TEMPID = $PSST_SHIP2)
  setvar $FOUNDSHIP2 TRUE
end
settextlinetrigger OTHER :SHIPLINE " "&$CURRENT_SECTOR&" "
settextlinetrigger NOMORE :SHIPDONE "Choose which ship to tow "
pause
:SHIPDONE
killalltriggers


return
:GETSSTPORTINFO




send "s* cr*q"
waiton "What sector is the port in? ["
:PORTINFO
settextlinetrigger GETPORTEQUIP :GETPORTEQUIP "Equipment  Buying"
settextlinetrigger NOPORTEQUIP :NOEQUIPHERE "I have no information about a port in that sector."
pause
:NOEQUIPHERE

killalltriggers
setvar $EQUIPBUY 0
setvar $EQUIPPERC 0
goto :GOTALLPORTINFO
:GETPORTEQUIP

killalltriggers
getword CURRENTLINE $EQUIPBUY 3
getword CURRENTLINE $EQUIPPERC 4
striptext $EQUIPPERC "%"
setvar $X 10000
if ($EQUIPPERC = 0)
  setvar $EQUIPATPORT[$FOCUS] ($TOTAL_HOLDS + 50)
else
  divide $X $EQUIPPERC
  multiply $X $EQUIPBUY
  divide $X 100
  subtract $X 1
  subtract $X $EQUIPBUY

  if ($X < 0)
    setvar $EQUIPATPORT[$FOCUS] 0
  else
    setvar $EQUIPATPORT[$FOCUS] $X
  end
end
:GOTALLPORTINFO
killalltriggers

return
:REFURB


if ($INSHIP1)
  send "l "&$PSST_PLANET1&"* c p "&$REFURBPORT&"*y"
else
  send "l "&$PSST_PLANET2&"* c p "&$REFURBPORT&"*y"
end
settextlinetrigger PWARPNOREFURB :PWARPNOREFURBFIG "You do not have any fighters in Sector "
settextlinetrigger PWARPYESREFURB :PWARPYESREFURB " Planetary TransWarp Drive Engaged! "
settextlinetrigger PWARPNOREFURBFUEL :PWARPNOREFURB "You do not have enough Fuel Ore on this planet to make the jump."
pause
:PWARPNOREFURB
killalltriggers
send "'{" $BOT_NAME "} Not enough fuel on planet. Halting Script.*"
setvar $MODE "General"
savevar $MODE
halt
:PWARPNOREFURBFIG

killalltriggers
send "'{" $BOT_NAME "} No fighter down at refurb port in sector "&$REFURBPORT&".*"
if ($REFURBPORT = $RYLOS)
  if ($ALPHA_CENTAURI > 10)
    setvar $REFURBPORT $ALPHA_CENTAURI
    send "qq"
    goto :REFURB
  end
end
goto :ENDSST
:PWARPYESREFURB
killalltriggers
send "q q p ty"
waiton "You have "
getword CURRENTLINE $CREDITS 3
striptext $CREDITS ","
waiton "A  Cargo holds     :"
getword CURRENTLINE $HOLDSTOBUY 10
send "a "&$HOLDSTOBUY&"* y q q q * "
if ($INSHIP1)
  if ($CREDITS > 5000000)
    send "l "&$PSST_PLANET1&"* c t t "&($CREDITS - 5000000)&"* p "&$SHIP1SECTOR&"*y"
    add $CASHDEPOSITED ($CREDITS - 5000000)
    setvar $CREDITS 5000000
  else
    send "l "&$PSST_PLANET1&"* c p "&$SHIP1SECTOR&"*y"
  end
else
  if ($CREDITS > 5000000)
    send "l "&$PSST_PLANET2&"* c t t "&($CREDITS - 5000000)&"* p "&$SHIP2SECTOR&"*y"
    add $CASHDEPOSITED ($CREDITS - 5000000)
    setvar $CREDITS 5000000
  else
    send "l "&$PSST_PLANET2&"* c p "&$SHIP2SECTOR&"*y"
  end
end
gosub :DISPLAYCREDITS
settextlinetrigger PWARPNOREFURB :PWARPBACKNOREFURBFIG "You do not have any fighters in Sector "
settextlinetrigger PWARPYESBACK :PWARPYESBACK " Planetary TransWarp Drive Engaged! "
settextlinetrigger PWARPNOREFURBFUEL :PWARPBACKNOREFURBFUEL "You do not have enough Fuel Ore on this planet to make the jump."
pause
:PWARPBACKNOREFURBFUEL
killalltriggers
send "'{" $BOT_NAME "} Not enough fuel on planet. Can't make it back home. Resuming bot control.*"
setvar $MODE "General"
savevar $MODE
halt
:PWARPBACKNOREFURBFIG

killalltriggers
send "'{" $BOT_NAME "} No fighter down coming back from refurb port, halting.*"
goto :ENDSST
:PWARPYESBACK

killalltriggers
send "q q "
return
:DISPLAYCREDITS


setvar $FORMATTEDDEPOSITEDCREDITS ""
setvar $SPENTCREDITS $CASHDEPOSITED
getlength $SPENTCREDITS $LENGTH
while ($LENGTH > 3)
  cuttext $SPENTCREDITS $SNIPPET ($LENGTH - 2) 9999
  cuttext $SPENTCREDITS $SPENTCREDITS 1 ($LENGTH - 3)
  getlength $SPENTCREDITS $LENGTH
  setvar $FORMATTEDDEPOSITEDCREDITS ","&$SNIPPET&$FORMATTEDDEPOSITEDCREDITS
end
setvar $FORMATTEDDEPOSITEDCREDITS $SPENTCREDITS&$FORMATTEDDEPOSITEDCREDITS

setvar $FORMATTEDONHANDCREDITS ""
setvar $SPENTCREDITS $CREDITS
getlength $SPENTCREDITS $LENGTH
while ($LENGTH > 3)
  cuttext $SPENTCREDITS $SNIPPET ($LENGTH - 2) 9999
  cuttext $SPENTCREDITS $SPENTCREDITS 1 ($LENGTH - 3)
  getlength $SPENTCREDITS $LENGTH
  setvar $FORMATTEDONHANDCREDITS ","&$SNIPPET&$FORMATTEDONHANDCREDITS
end
setvar $FORMATTEDONHANDCREDITS $SPENTCREDITS&$FORMATTEDONHANDCREDITS
add $PORTAVERAGE $CASHDEPOSITED
add $PORTAVERAGE $CREDITS
subtract $PORTAVERAGE $STARTCASH
if ($NUMBERBUSTED = 0)
  setvar $NUMBERBUSTED 1
end
divide $PORTAVERAGE $NUMBERBUSTED
setwindowcontents "CASH" "    Cash Deposited: "&$FORMATTEDDEPOSITEDCREDITS&"*      Cash On Hand: "&$FORMATTEDONHANDCREDITS&"*  Busted xxB Ports: "&$NUMBERBUSTED&"*     Planet 1 Fuel: "&$PLANET1FUEL[1]&"*     Planet 2 Fuel: "&$PLANET2FUEL[1]&"*  Credits per Port: "&$PORTAVERAGE&"*        Experience: "&$EXPERIENCE&"*"


return
:TRANSPORT

if ($INSHIP1)
  send "x     "&$PSST_SHIP2&"* q * "
else
  send "x     "&$PSST_SHIP1&"* q * "
end
killalltriggers
settextlinetrigger SUCCESS :TRANSPORTED "Security code accepted"
settextlinetrigger NOSHIP :NONEAVAILABLE "That is not an available ship."
settextlinetrigger RANGE :OUTOFRANGE "only has a transport range of"
pause
:NONEAVAILABLE
if ($INSHIP1)
  send "'{" $BOT_NAME "} Ship #" $PSST_SHIP2 " is in use or not owned by you.*"
else
  send "'{" $BOT_NAME "} Ship #" $PSST_SHIP1 " is in use or not owned by you.*"
end
goto :ENDSST
halt
:OUTOFRANGE
if ($INSHIP1)
  send "'{" $BOT_NAME "} Ship #" $PSST_SHIP2 " is out of transporter range.*"
else
  send "'{" $BOT_NAME "} Ship #" $PSST_SHIP1 " is out of transporter range.*"
end
goto :ENDSST
halt
:TRANSPORTED
if ($INSHIP1)
  setvar $INSHIP1 FALSE
else
  setvar $INSHIP1 TRUE
end
killalltriggers

return
:ENDSST

send "q q q q  * * * "
if ($INSHIP1)
  send "l "&$PSST_PLANET1&"* c p "&$STARTINGSECTOR&"*y q q q *"
else
  send "l "&$PSST_PLANET2&"* c p "&$STARTINGSECTOR&"*y q q q *"
end

gosub :TRANSPORT

if ($INSHIP1)
  send "l "&$PSST_PLANET1&"* c p "&$STARTINGSECTOR&"*y"
else
  send "l "&$PSST_PLANET2&"* c p "&$STARTINGSECTOR&"*y"
end

if (($PLANET1FUEL[1] < 100000) and (($PLANET1FUEL[2] < 100000) and ($PLANET1FUEL[3] < 100000)))
  send "'{" $BOT_NAME "} - Planet(s) low on fuel, stopping script.  Put total of "&$FORMATTEDDEPOSITEDCREDITS&" credits in treasury.*"
elseif (($PLANET2FUEL[1] < 100000) and (($PLANET2FUEL[2] < 100000) and ($PLANET2FUEL[3] < 100000)))
  send "'{" $BOT_NAME "} - Planet(s) low on fuel, stopping script.  Put total of "&$FORMATTEDDEPOSITEDCREDITS&" credits in treasury.*"
elseif (($UNLIMITEDGAME = FALSE) and ($TURNS <= $BOT_TURN_LIMIT))
  send "'{" $BOT_NAME "} - Too low turns to continue Planet SST.*"
else
  send "'{" $BOT_NAME "} - All known xxB ports in the grid are used up.  Put total of "&$FORMATTEDDEPOSITEDCREDITS&" credits in treasury.*"
end
send "'{" $BOT_NAME "} - Check to make sure both planets and ships made it back to safe sector.*"
halt
