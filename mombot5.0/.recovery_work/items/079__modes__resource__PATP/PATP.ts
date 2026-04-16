logging "OFF"
gosub :BOT~LOADVARS
loadvar $PLAYER~UNLIMITEDGAME


setvar $BOT~HELP[1] $BOT~TAB&"              PATP - Pay At The Pump               "
setvar $BOT~HELP[2] $BOT~TAB&"  patp [min port fuel] {upgrade} {buyhalf} {docim} {destroyports}"
setvar $BOT~HELP[3] $BOT~TAB&"       "
setvar $BOT~HELP[4] $BOT~TAB&"        "
setvar $BOT~HELP[5] $BOT~TAB&"Options:"
setvar $BOT~HELP[6] $BOT~TAB&"    [min port fuel]  minimum fuel a port must have to visit it"
setvar $BOT~HELP[7] $BOT~TAB&"    [upgrade]        upgrades fuel in each port"
setvar $BOT~HELP[8] $BOT~TAB&"    [buyhalf]        empties ports halfway"
setvar $BOT~HELP[9] $BOT~TAB&"    [docim]          does cim check before patp"
setvar $BOT~HELP[10] $BOT~TAB&"    [destroyports]   destroys every port it drains if you "
setvar $BOT~HELP[11] $BOT~TAB&"    [bubble]         only visits bubble sectors  "
setvar $BOT~HELP[12] $BOT~TAB&"                     have enough fighters"
gosub :BOT~HELPFILE

setvar $BOT~SCRIPT_TITLE "Pay At The Pump"
gosub :BOT~BANNER



setvar $SWITCHBOARD~BOT_NAME $SWITCHBOARD~BOT_NAME
window "PATP_SCRIPT" 560 170 "PATP - "&GAMENAME "ONTOP"

gosub :PLAYER~QUIKSTATS
setvar $STARTINGLOCATION $PLAYER~CURRENT_PROMPT
if ($STARTINGLOCATION <> "Citadel")
  setvar $SWITCHBOARD~MESSAGE "You must run Pay At The Pump command from a Citadel prompt.*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end
send "q"
waiton "Planet command (?"
gosub :PLANET~GETPLANETINFO
gosub :SETWINDOW
send "c"
if ($PLANET~CITADEL < 4)
  setvar $SWITCHBOARD~MESSAGE "You must run Pay At The Pump from at least a level 4 planet.*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end
if (($PLANET~CITADEL_CREDITS + $PLAYER~CREDITS) < 5000000)
  setvar $SWITCHBOARD~MESSAGE "You must have at least 5 million credits in the citadel or on hand for patp.*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end
lowercase $BOT~PARM1
setvar $MINIMUMFUEL $BOT~PARM1
isnumber $NUMBER $MINIMUMFUEL
if ($NUMBER <> 1)
  setvar $SWITCHBOARD~MESSAGE "Minimum Port Fuel entered is not a number!*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end
if ($MINIMUMFUEL < 0)
  setvar $SWITCHBOARD~MESSAGE "Minimum Port Fuel must be greater than or equal to 0.*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end
getwordpos $BOT~USER_COMMAND_LINE $POS "destroyports"
if ($POS > 0)
  setvar $DESTROYPORTS TRUE
else
  setvar $DESTROYPORTS FALSE
end
getwordpos $BOT~USER_COMMAND_LINE $POS "upgrade"
if ($POS > 0)
  setvar $UPGRADE TRUE
else
  setvar $UPGRADE FALSE
end
getwordpos $BOT~USER_COMMAND_LINE $POS "half"
if ($POS > 0)
  setvar $BUYHALF TRUE
else
  setvar $BUYHALF FALSE
end
getwordpos $BOT~USER_COMMAND_LINE $POS "docim"
if ($POS > 0)
  setvar $DOCIM TRUE
else
  setvar $DOCIM FALSE
end
getwordpos $BOT~USER_COMMAND_LINE $POS "bubble"
if ($POS > 0)
  setvar $BUBBLE TRUE
else
  setvar $BUBBLE FALSE
end
gosub :PLAYER~QUIKSTATS
send "qsnl1*tnl1*tnl2*tnl3*"
waiton "Planet command (?"
gosub :PLANET~GETPLANETINFO
setvar $STARTINGSECTOR $PLAYER~CURRENT_SECTOR
gosub :SETWINDOW
send "qjy l "&$PLANET~PLANET&"* c"
gosub :SHIP~GETSHIPSTATS

setvar $TOTALHOLDS 0
setvar $SPENTCREDITS 0

setarray $CHECKEDPORTS SECTORS
setarray $QUE SECTORS
setarray $CHECKED SECTORS

if ($DOCIM = TRUE)
  setvar $SWITCHBOARD~MESSAGE "PATP Downloading Current Port CIM Data - Comms Off*"
  gosub :SWITCHBOARD~SWITCHBOARD
  send "^rq"
  killalltriggers
  waitfor ": ENDINTERROG"
  setvar $SWITCHBOARD~MESSAGE "PATP CIM Port Data Complete - Comms Back On*"
  gosub :SWITCHBOARD~SWITCHBOARD
end
setvar $ISDONE FALSE
setvar $PLAYER~TURNSTOOLOW FALSE
:INAC
killalltriggers
while ($ISDONE <> TRUE)
  loadvar $BOT~BOTISDEAF
  loadvar $BOT~SILENT_RUNNING
  :INAC
  if (($PLAYER~UNLIMITEDGAME = FALSE) and ($PLAYER~TURNS <= $BOT~BOT_TURN_LIMIT))
    setvar $SWITCHBOARD~MESSAGE "Turns too low to continue.*"
    gosub :SWITCHBOARD~SWITCHBOARD
    goto :DONEPATP
  end
  setvar $BOTTOM 1
  setvar $TOP 1
  setarray $CHECKED SECTORS
  setvar $QUE[1] $PLAYER~CURRENT_SECTOR
  setvar $CHECKED[$PLAYER~CURRENT_SECTOR] 1
  :TRYAGAIN2
  while ($BOTTOM <= $TOP)

    setvar $FOCUS $QUE[$BOTTOM]
    getsectorparameter $FOCUS "BUSTED" $ISBUSTED

    if ($BUBBLE)
      getsectorparameter $FOCUS "BUBBLE" $ISBUBBLE
    else
      setvar $ISBUBBLE TRUE
    end
    if ($DOCIM = FALSE)
      if (($CHECKEDPORTS[$FOCUS] <> TRUE) and ((PORT.EXISTS[$FOCUS] = TRUE) and ((PORT.CLASS[$FOCUS] > 0) and ((SECTOR.EXPLORED[$FOCUS] = "YES") and (((PORT.FUEL[$FOCUS] >= $MINIMUMFUEL) and (PORT.BUYFUEL[$FOCUS] = FALSE)) and (($ISBUSTED <> TRUE) and ($ISBUBBLE = TRUE)))))))
        send "cr"&$FOCUS&"*q"
        gosub :PLAYER~QUIKSTATS
      end
    end
    if (($CHECKEDPORTS[$FOCUS] <> TRUE) and ((PORT.EXISTS[$FOCUS] = TRUE) and ((PORT.CLASS[$FOCUS] > 0) and (((PORT.FUEL[$FOCUS] >= $MINIMUMFUEL) and (PORT.BUYFUEL[$FOCUS] = FALSE)) and (($ISBUSTED <> TRUE) and ($ISBUBBLE = TRUE))))))

      setvar $NEARFIG $FOCUS
      setvar $CHECKEDPORTS[$NEARFIG] TRUE
      setvar $TOTALPORTFUEL PORT.FUEL[$FOCUS]
      goto :CONTINUEON2
    else
      setvar $NEARFIG 0
    end

    setvar $A 1
    while (SECTOR.WARPS[$FOCUS][$A] > 0)
      setvar $ADJACENT SECTOR.WARPS[$FOCUS][$A]

      if ($CHECKED[$ADJACENT] = 0)

        setvar $CHECKED[$ADJACENT] 1
        add $TOP 1
        setvar $QUE[$TOP] $ADJACENT
      end
      add $A 1
    end

    add $BOTTOM 1
  end
  setvar $SWITCHBOARD~MESSAGE "Can't find a route to any other ports.*"
  gosub :SWITCHBOARD~SWITCHBOARD
  goto :DONEPATP
  :CONTINUEON2
  if ($NEARFIG > 0)
    killalltriggers
    send "p"&$NEARFIG&"*"
    settextlinetrigger WARPED :EMPTYPORT2 "Locating beam pinpointed, TransWarp Locked."
    settextlinetrigger SAME :EMPTYPORT2 "You are already in that sector!"
    settextlinetrigger DIDNOTWARP :NOFIGATLOCATION "Your own fighters must be in the destination to make a safe jump."
    settextlinetrigger NOTENOUGHFUEL :DONENOFUEL2 "You do not have enough Fuel Ore on this planet to make the jump."
    pause
    :EMPTYPORT2
    send "y "
    setsectorparameter $NEARFIG "FIGSEC" TRUE


    killalltriggers

    if ($UPGRADE)
      gosub :PLAYER~QUIKSTATS
      send "q"
      waiton "Planet command (?"
      gosub :PLANET~GETPLANETINFO
      gosub :SETWINDOW
      send "c"
      setvar $TOTAL_CREDS_NEEDED (300 * 7000)
      if ($TOTAL_CREDS_NEEDED > $PLAYER~CREDITS)
        setvar $CASHONHAND $PLANET~CITADEL_CREDITS
        add $CASHONHAND $PLAYER~CREDITS
        if ($CASHONHAND > $TOTAL_CREDS_NEEDED)
          send "T T "&$PLAYER~CREDITS&"* "
          send "T F "&$TOTAL_CREDS_NEEDED&"* "
          setvar $PLAYER~CREDITS $TOTAL_CREDS_NEEDED
        end
      end
      send "q q *O 1"
      waiton ", 0 to quit)"
      getword CURRENTLINE $UPGRADEAMOUNT 9
      striptext $UPGRADEAMOUNT "("
      send $UPGRADEAMOUNT&"* * *CR*Q"
      waiton "What sector is the port in? ["&$PLAYER~CURRENT_SECTOR&"]"
      settextlinetrigger GETFUEL2 :FUELDURING "Fuel Ore"
      pause
      :FUELDURING
      killalltriggers
      getword CURRENTLINE $TOTALPORTFUEL 4
      waiton "<Computer deactivated>"
      gosub :PLAYER~QUIKSTATS
      gosub :PLANET~LANDONPLANETENTERCITADEL
    end
    if ($BUYHALF)
      divide $TOTALPORTFUEL 2
    end
    if (($PLANET~PLANET_FUEL_MAX - $PLANET~PLANET_FUEL) < $TOTALPORTFUEL)
      setvar $PLAYER~TURNSTOEMPTY (($PLANET~PLANET_FUEL_MAX - $PLANET~PLANET_FUEL) / $PLAYER~TOTAL_HOLDS)
      add $TOTALHOLDS ($PLANET~PLANET_FUEL_MAX - $PLANET~PLANET_FUEL)
      setvar $ISDONE TRUE
    else
      setvar $PLAYER~TURNSTOEMPTY ($TOTALPORTFUEL / $PLAYER~TOTAL_HOLDS)
      add $TOTALHOLDS $TOTALPORTFUEL
    end
    setvar $PLAYER~BUYOBJECT "f"
    setvar $PLAYER~BUYTYPE "s"
    setvar $PLAYER~BUYDOWNROUNDSFROMPARAM $PLAYER~TURNSTOEMPTY
    gosub :PLAYER~BUY
    gosub :PLAYER~QUIKSTATS
    send "q"
    gosub :PLANET~GETPLANETINFO
    send "c"
    gosub :SETWINDOW
    send "c r*"
    waiton "Computer command ["
    send "q "

    if ($PLAYER~EXIT_MESSAGE <> "Normal Exit")
      setvar $SWITCHBOARD~MESSAGE $PLAYER~EXIT_MESSAGE&"*"
      gosub :SWITCHBOARD~SWITCHBOARD
      goto :DONEPATP
    end
    if (($PLAYER~UNLIMITEDGAME = FALSE) and (($PLAYER~TURNS - $PLAYER~TURNSTOEMPTY) <= $BOT~BOT_TURN_LIMIT))
      setvar $PLAYER~TURNSTOOLOW TRUE
      goto :DONEPATP
    end

    if ($BUYHALF)
      setvar $SWITCHBOARD~MESSAGE "Port half emptied in sector "&$NEARFIG&".*"
      gosub :SWITCHBOARD~SWITCHBOARD
    else
      setvar $SWITCHBOARD~MESSAGE "Port emptied in sector "&$NEARFIG&".*"
      gosub :SWITCHBOARD~SWITCHBOARD
    end
    gosub :PLAYER~QUIKSTATS
    if (($PLAYER~TURNS < 50) and ($PLAYER~UNLIMITEDGAME = FALSE))
      goto :DONEPATP
    end
    add $SPENTCREDITS $PLAYER~CREDITS_SPENT
    if ($DESTROYPORTS)
      send "q q "
      :KEEPDESTROYING
      killalltriggers
      gosub :PLAYER~QUIKSTATS
      if ($PLAYER~FIGHTERS > $SHIP~MAXFIGATTACK)
        send "p"
        settexttrigger PORTALREADYGONE :DONEDESTROYING "Captain! Are you sure you want to port here?"
        settexttrigger PORTHERE :CONTINUEDESTROY "<A> Attack this Port"
        pause
        :CONTINUEDESTROY
        killalltriggers
        send " a y "&$SHIP~MAXFIGATTACK&"*l "&$PLANET~PLANET&"* m * * * q "
        settexttrigger NOTDESTROYED :KEEPDESTROYING "Incoming laser barrage from"
        settexttrigger DESTORYEDPORT :DONEDESTROYING "You destroyed the Star Port!"
        pause
        :DONEDESTROYING
        killalltriggers
        send "*"
        setvar $SWITCHBOARD~MESSAGE "Port destroyed in sector "&$SECTORCOUNT&".*"
        gosub :SWITCHBOARD~SWITCHBOARD
        gosub :PLAYER~QUIKSTATS
      end
      gosub :PLANET~GETPLANETINFO
      gosub :SETWINDOW
      send "c r*"
      waiton "Computer command ["
      send "q "
      gosub :LANDONPLANETENTERCITADEL
    end
  end
  if (($PLAYER~CREDITS + $PLANET~CITADEL_CREDITS) < 1000000)
    setvar $ISDONE TRUE
  end
  :TRYAGAIN
  if (($PLAYER~TURNS < 50) and ($PLAYER~UNLIMITEDGAME <> TRUE))
    setvar $ISDONE TRUE
  end
end
:DONEPATP
send "p"&$STARTINGSECTOR&"*y"
setvar $FORMATTEDSPENTCREDITS ""
getlength $SPENTCREDITS $LENGTH
while ($LENGTH > 3)
  cuttext $SPENTCREDITS $SNIPPET ($LENGTH - 2) 9999
  cuttext $SPENTCREDITS $SPENTCREDITS 1 ($LENGTH - 3)
  getlength $SPENTCREDITS $LENGTH
  setvar $FORMATTEDSPENTCREDITS ","&$SNIPPET&$FORMATTEDSPENTCREDITS
end
setvar $FORMATTEDSPENTCREDITS $SPENTCREDITS&$FORMATTEDSPENTCREDITS

setvar $FORMATTEDHOLDS ""
getlength $TOTALHOLDS $LENGTH
while ($LENGTH > 3)
  cuttext $TOTALHOLDS $SNIPPET ($LENGTH - 2) 9999
  cuttext $TOTALHOLDS $TOTALHOLDS 1 ($LENGTH - 3)
  getlength $TOTALHOLDS $LENGTH
  setvar $FORMATTEDHOLDS ","&$SNIPPET&$FORMATTEDHOLDS
end
setvar $FORMATTEDHOLDS $TOTALHOLDS&$FORMATTEDHOLDS

send "'*{" $SWITCHBOARD~BOT_NAME "} Pay At The Pump - Completion Report {" $SWITCHBOARD~BOT_NAME "}*  "&$FORMATTEDHOLDS&" total holds of fuel ore purchased.*  Credits spent: "&$FORMATTEDSPENTCREDITS&" credits*"
if (($PLAYER~CREDITS + $PLANET~CITADEL_CREDITS) < 1000000)
  send "  Credits are below 1,000,000.*"
end
if ($PLAYER~TURNSTOOLOW)
  send "  Low on turns! (Turns: "&$PLAYER~TURNS&")*"
end
if ($PLANET~PLANET_FUEL >= ($PLANET~PLANET_FUEL_MAX - 2000))
  send "  Planet "&$PLANET~PLANET&" is full.*"
end
send "{" $SWITCHBOARD~BOT_NAME "} Pay At The Pump - Completion Report {" $SWITCHBOARD~BOT_NAME "}**"
halt
:GETFUELCASH

send "l " $PLANET~PLANET "*   c t f"&$TOTAL_CREDS_NEEDED&"*qq"
gosub :PLAYER~QUIKSTATS
return
:NOFIGATLOCATION




setsectorparameter $NEARFIG "FIGSEC" FALSE
goto :TRYAGAIN2
:SETWINDOW



setarray $WINDOW_LINES 8
setvar $WINDOW_LINES[1] "* PATP Planet: "&$PLANET~PLANET
setvar $WINDOW_LINES[2] "* ---------------------------------------------------------------"
setvar $WINDOW_LINES[3] "* Current Sector: "&$PLAYER~CURRENT_SECTOR&"                            "
cuttext $WINDOW_LINES[3] $WINDOW_LINES[3] 1 30
if ($PLAYER~UNLIMITEDGAME = TRUE)
  setvar $WINDOW_LINES[4] "   Turns: Unlimited"
else
  format $PLAYER~TURNS $PLAYER~VALUE "NUMBER"
  setvar $WINDOW_LINES[4] "   Turns: "&$PLAYER~VALUE
end
format $PLANET~PLANET_FUEL $PLAYER~VALUE "NUMBER"
setvar $WINDOW_LINES[5] "*    Planet Fuel: "&$PLAYER~VALUE&"                          "
cuttext $WINDOW_LINES[5] $WINDOW_LINES[5] 1 30
format $PLANET~PLANET_FIGHTERS $PLAYER~VALUE "NUMBER"
setvar $WINDOW_LINES[6] "   Planet Fighters: "&$PLAYER~VALUE
format $PLANET~PLANET_SHIELDS $PLAYER~VALUE "NUMBER"
setvar $WINDOW_LINES[7] "* Planet Shields: "&$PLAYER~VALUE&"                          "
cuttext $WINDOW_LINES[7] $WINDOW_LINES[7] 1 30
format $PLANET~CITADEL_CREDITS $PLAYER~VALUE "NUMBER"
setvar $WINDOW_LINES[8] "   Citadel Credits: "&$PLAYER~VALUE&"*"

setvar $I 1
setvar $MSG ""
while ($I <= 8)
  setvar $MSG $MSG&$WINDOW_LINES[$I]
  add $I 1
end
setwindowcontents "PATP_SCRIPT" $MSG
setvar $WINDOW_CONTENT $MSG
replacetext $WINDOW_CONTENT "*" "[][]"
savevar $WINDOW_CONTENT

return

# includes:
include "include/BOT.ts"
include "include/PLAYER.ts"
include "include/PLANET.ts"
include "include/SHIP.ts"
