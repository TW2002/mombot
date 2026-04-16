logging "OFF"
gosub :BOT~LOADVARS
loadvar $GAME~PORT_MAX

setvar $MAX_BOTS 15
setvar $MIN_RED_EXP 0
setvar $MIN_RED_ALIGNMENT "-100"

setarray $BOTS $MAX_BOTS 3
setarray $CURRENT_SHIP $MAX_BOTS
setarray $ORIGINAL_SHIP $MAX_BOTS


setvar $BOT~HELP[1] $BOT~TAB&"Buydown and mega with multiple bots"
setvar $BOT~HELP[2] $BOT~TAB&""
setvar $BOT~HELP[3] $BOT~TAB&"teammega {minproduct}"
setvar $BOT~HELP[4] $BOT~TAB&""
setvar $BOT~HELP[5] $BOT~TAB&"minproduct - default: 30000"
setvar $BOT~HELP[6] $BOT~TAB&""
setvar $BOT~HELP[7] $BOT~TAB&"Bots Buying: callin megabuy1 megabuy2"
setvar $BOT~HELP[8] $BOT~TAB&"Bots Robbing: callin megarob1"
setvar $BOT~HELP[9] $BOT~TAB&""
setvar $BOT~HELP[10] $BOT~TAB&"Buying bots can be any alignment"
gosub :BOT~HELPFILE



gosub :PLAYER~QUIKSTATS
setvar $STARTINGLOCATION $PLAYER~CURRENT_PROMPT
if ($STARTINGLOCATION <> "Citadel")
  setvar $SWITCHBOARD~MESSAGE "Team Mega must be run from Citadel prompt.*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end

setvar $BOT~SCRIPT_TITLE "Team Mega"
gosub :BOT~BANNER


isnumber $TEST $BOT~PARM1
if ($TEST)
  if ($TEST > 0)
    setvar $MINIMUMPRODUCT $BOT~PARM1
  else
    setvar $MINIMUMPRODUCT 30000
  end
else
  setvar $MINIMUMPRODUCT 30000
end

send "'"&$SWITCHBOARD~BOT_NAME&" login*"
waiton "Corporate command "

setvar $SWITCHBOARD~MESSAGE "This script assumes all bots are placed correctly before this script is run.*"
gosub :SWITCHBOARD~SWITCHBOARD


send "q"
waiton "Planet command (?"
gosub :PLANET~GETPLANETINFO
send "c"
if ($PLANET~CITADEL < 4)
  setvar $SWITCHBOARD~MESSAGE "You must run Team Mega from at least a level 4 planet.*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end
if (($PLANET~CITADEL_CREDITS + $PLAYER~CREDITS) < 5000000)
  setvar $SWITCHBOARD~MESSAGE "You must have at least 5 million credits in the citadel or on hand for Team Mega.*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end


setvar $SWITCHBOARD~MESSAGE "Logging into all bots.*"
gosub :SWITCHBOARD~SWITCHBOARD
send "xtlogin**q "


setvar $SWITCHBOARD~MESSAGE "Doing roll call.*"
gosub :SWITCHBOARD~SWITCHBOARD

setvar $I 1
setvar $ROLL_CALL_DONE FALSE
setvar $BLUE_COUNT 0
setvar $CURRENT_ROBBER 0
setvar $BACKUP_ROBBER 0
while (($I <= $MAX_BOTS) and ($ROLL_CALL_DONE = FALSE))
  send "'megabuy"&$I&" callout*"
  setdelaytrigger 3 :DONEBLUE 3000
  settextlinetrigger 2 :FOUNDBLUE "Team: megabuy"&$I&" "
  pause
  :TOOMANYBLUE

  setvar $SWITCHBOARD~MESSAGE "Too many bots responding to megabuy"&$I&".  Please fix bot teams so each blue is unique.*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
  :FOUNDBLUE

  getwordpos CURRENTLINE $POS "Team: "
  cuttext CURRENTLINE $LINE $POS 9999
  getword $LINE $SECTOR 4
  getword $LINE $EXP 6
  getword $LINE $ALIGN 8
  getword $LINE $CREDITS 10
  getword $LINE $SHIP 12
  getword $LINE $TURNS 14

  if (($TURNS < 100) and ($PLAYER~UNLIMITED_GAME <> TRUE))
    setvar $SWITCHBOARD~MESSAGE "megabuy"&$I&" does not have enough turns for buydowns.  Replace them with someone with turns.*"
    gosub :SWITCHBOARD~SWITCHBOARD
    halt
  end
  getwordpos $ALIGN $POS "-"
  setvar $BOTS[$I] $I

  add $BLUE_COUNT 1

  setvar $BOTS[$I][1] $TURNS
  setvar $CURRENT_SHIP[$I] $SHIP
  setvar $ORIGINAL_SHIP[$I] $SHIP
  killtrigger 1
  settextlinetrigger 1 :TOOMANYBLUE "} - Team: megabuy"&$I&" "
  pause
  :DONEBLUE
  killtrigger 1
  if ($BOTS[$I] = 0)
    setvar $ROLL_CALL_DONE TRUE
  else
    send "'megabuy"&$I&"*"
    waiton "} - You are logged into this bot. "

    gettext CURRENTLINE $BOTS[$I][3] "{" "} - You are logged into this bot."
    setvar $SWITCHBOARD~MESSAGE "Bot name captured as: "&$BOTS[$I][3]&"*"
    gosub :SWITCHBOARD~SWITCHBOARD
  end
  add $I 1
end

gosub :KILLTHETRIGGERS

subtract $I 1
setvar $ROLL_CALL_DONE FALSE
setvar $RED_COUNT 0
setvar $CURRENT_ROBBER 0
setvar $BACKUP_ROBBER 0
while (($I <= $MAX_BOTS) and ($ROLL_CALL_DONE = FALSE))
  setvar $CALLOUTID ($I - $BLUE_COUNT)
  send "'megarob"&$CALLOUTID&" callout*"
  setdelaytrigger 3 :DONERED 3000
  settextlinetrigger 2 :FOUNDRED "Team: megarob"&$CALLOUTID&" "
  pause
  :TOOMANYRED

  setvar $SWITCHBOARD~MESSAGE "Too many bots responding to megarob"&$CALLOUTID&".  Please fix bot teams so each red is unique.*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
  :FOUNDRED

  getwordpos CURRENTLINE $POS "Team: "
  cuttext CURRENTLINE $LINE $POS 9999
  getword $LINE $SECTOR 4
  getword $LINE $EXP 6
  getword $LINE $ALIGN 8
  getword $LINE $CREDITS 10
  getword $LINE $SHIP 12
  getword $LINE $TURNS 14

  if (($TURNS < 10) and ($PLAYER~UNLIMITED_GAME <> TRUE))
    setvar $SWITCHBOARD~MESSAGE "megarob"&$CALLOUTID&" does not have enough turns for stealing.  Replace them with someone with turns.*"
    gosub :SWITCHBOARD~SWITCHBOARD
    halt
  end
  getwordpos $ALIGN $POS "-"
  setvar $BOTS[$I] $I
  if ($POS > 0)
    add $RED_COUNT 1

    setvar $BOTS[$I][2] TRUE
    if ($CURRENT_ROBBER <> 0)
      setvar $BACKUP_ROBBER $CURRENT_ROBBER
    end
    setvar $CURRENT_ROBBER $BOTS[$I]
    if ($ALIGN > $MIN_RED_ALIGNMENT)
      setvar $SWITCHBOARD~MESSAGE "megarob"&$CALLOUTID&" needs alignment lower then "&$MIN_RED_ALIGNMENT&".*"
      gosub :SWITCHBOARD~SWITCHBOARD
      halt
    else
      setvar $SWITCHBOARD~MESSAGE "Found potential megarob robber!*"
      gosub :SWITCHBOARD~SWITCHBOARD
    end
  else
    setvar $SWITCHBOARD~MESSAGE "megarob"&$CALLOUTID&" has wrong alignment for megarob.*"
    gosub :SWITCHBOARD~SWITCHBOARD
    halt
  end
  setvar $BOTS[$I][1] $TURNS
  setvar $CURRENT_SHIP[$I] $SHIP
  setvar $ORIGINAL_SHIP[$I] $SHIP
  killtrigger 1
  settextlinetrigger 1 :TOOMANYRED "} - Team: megarob"&$CALLOUTID&" "
  pause
  :DONERED
  killtrigger 1
  if ($BOTS[$I] = 0)
    setvar $ROLL_CALL_DONE TRUE
  else
    send "'megarob"&$CALLOUTID&"*"
    waiton "} - You are logged into this bot. "

    gettext CURRENTLINE $BOTS[$I][3] "{" "} - You are logged into this bot."
    setvar $SWITCHBOARD~MESSAGE "Bot name captured as: "&$BOTS[$I][3]&"*"
    gosub :SWITCHBOARD~SWITCHBOARD
  end
  add $I 1
end

if ($RED_COUNT < 1)
  setvar $SWITCHBOARD~MESSAGE "Found "&$RED_COUNT&" reds. Need at least one red.  Make sure all bots callin as megarob1, megarob2, etc.*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end

if ($BLUE_COUNT < 1)
  setvar $SWITCHBOARD~MESSAGE "Found "&$BLUE_COUNT&" buying bots. Need at least one megabuy.  Make sure all bots callin as megabuy1, megabuy2, etc.*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end



if ($RED_COUNT > 1)
  setvar $SWITCHBOARD~MESSAGE "Found "&$RED_COUNT&" red bots.*"
else
  setvar $SWITCHBOARD~MESSAGE "Found "&$RED_COUNT&" red bot.*"
end
gosub :SWITCHBOARD~SWITCHBOARD

if ($BLUE_COUNT > 1)
  setvar $SWITCHBOARD~MESSAGE "Found "&$BLUE_COUNT&" blue bots.*"
else
  setvar $SWITCHBOARD~MESSAGE "Found "&$BLUE_COUNT&" blue bot.*"
end
gosub :SWITCHBOARD~SWITCHBOARD

setarray $CHECKEDPORTS SECTORS
setarray $QUE SECTORS


while (TRUE)
  gosub :PLAYER~QUIKSTATS
  gosub :GRABPLANETSTATS
  gosub :FINDPORTS
  gosub :PWARPTOPORT
  if ($GO_TO_NEXT_PORT = FALSE)
    if ($ISGOODBUYER = TRUE)
      gosub :FINDBESTCANDIDATES
      gosub :SELLOFFPRODUCT
      setvar $CHECK $CURRENT_TRADER
      gosub :CHECKIN

      if (PORT.BUYFUEL[$PLAYER~CURRENT_SECTOR] = 0)
        gosub :FINDBESTCANDIDATES
        gosub :STARTBUYDOWNFUEL
        setvar $CHECK $CURRENT_TRADER
        gosub :CHECKIN
      end
    end
    if ($ISGOODSELLER = TRUE)
      gosub :FINDBESTCANDIDATES
      gosub :STARTBUYDOWNEQUIP
      setvar $CHECK $CURRENT_TRADER
      gosub :CHECKIN

      gosub :FINDBESTCANDIDATES
      if (PORT.BUYFUEL[$PLAYER~CURRENT_SECTOR] = 0)
        gosub :STARTBUYDOWNFUEL
      end
      setvar $CHECK $CURRENT_TRADER
      gosub :CHECKIN

      gosub :FINDBESTCANDIDATES
      gosub :DOMEGA
      if (($DO_BACKUP_ROBBER = TRUE) and ($BACKUP_ROBBER <> 0))
        setvar $SAVE_CURRENT_ROBBER $CURRENT_ROBBER
        setvar $CURRENT_ROBBER $BACKUP_ROBBER
        gosub :DOMEGA
        setvar $CURRENT_ROBBER $SAVE_CURRENT_ROBBER
      end
      setvar $CHECK $CURRENT_ROBBER
      gosub :CHECKIN
    end
  end
end



halt
:CHECKIN

killtrigger 1
if ($BOTS[$CHECK][2] = TRUE)
  setvar $E_ID ($CHECK - $BLUE_COUNT)
  send "'megarob"&$E_ID&" callout*"
  settextlinetrigger 1 :FOUNDTRADER "Team: megarob"&$E_ID&" "
else
  send "'megabuy"&$CHECK&" callout*"
  settextlinetrigger 1 :FOUNDTRADER "Team: megabuy"&$CHECK&" "
end

pause
:FOUNDTRADER

getwordpos CURRENTLINE $POS "Team: "
cuttext CURRENTLINE $LINE $POS 9999
getword $LINE $SECTOR 4
getword $LINE $EXP 6
getword $LINE $ALIGN 8
getword $LINE $CREDITS 10
getword $LINE $SHIP 12
getword $LINE $TURNS 14

setvar $BOTS[$CHECK][1] $TURNS
return
:DOMEGA
setvar $ONCE 0
setvar $DO_BACKUP_ROBBER FALSE
:MEGAAGAIN
setvar $EVILBOT $BOTS[$CURRENT_ROBBER][3]
send "'"&$EVILBOT&" mega*"

settextlinetrigger 1 :MRBUSTED "[Busted"
settextlinetrigger 2 :MRBUSTED2 "Fake Busted"
settextlinetrigger 3 :MRSHORT "Port is short"
settextlinetrigger 4 :MRROBBED "] {"&$EVILBOT&"} - Success! - "
settextlinetrigger 5 :MRSECOND "credits left for a second mega"
pause
:MRSHORT
return
:MRROBBED
gosub :KILLTHETRIGGERS
settextlinetrigger 1 :MRSECOND "credits left for a second mega"
setdelaytrigger 2 :MRDELAYOVER 2000
pause
:MRDELAYOVER
gosub :KILLTHETRIGGERS
return
:MRSECOND
setvar $DO_BACKUP_ROBBER TRUE
gosub :KILLTHETRIGGERS
return
:MRBUSTED
:MRBUSTED2
setvar $DO_BACKUP_ROBBER TRUE
gosub :KILLTHETRIGGERS
return

return
:WAITFOR200E
:AGAINE



send "cr*q"
waitfor "Commerce report for"
waitfor "Equipment"
getword CURRENTLINE $EONHAND 3
if ($EONHAND > $BUYDOWNHOLDS)
  return

else
  goto :AGAINE
end

return
:STARTBUYDOWNEQUIP

setvar $NEXTBOT $BOTS[$CURRENT_TRADER][3]
send "'"&$NEXTBOT&" buy e w *"

settextlinetrigger 1 :STARTDOCK1 " docks at"
settextlinetrigger 2 :STARTDOCK2 "Commerce report for"
setdelaytrigger 3 :STARTDOCKDELAY 5000
pause
:STARTDOCKDELAY
gosub :KILLTHETRIGGERS
send "'" $NEXTBOT " stopall*"
waitfor " non-system scripts and modules killed, and mode"

send "'" $NEXTBOT " land*"
waitfor "] {"&$NEXTBOT&"} - In Cit - Plane"
send "'" $NEXTBOT " cn*"
waitfor "] {"&$NEXTBOT&"} - CN Settings are reset for this bo"
send "'"&$NEXTBOT&" buy e w *"
:STARTDOCK1
:STARTDOCK2
gosub :KILLTHETRIGGERS


settextlinetrigger 1 :BDCOMPLETE1 "] {"&$NEXTBOT&"} - Buy down exiting --- Nothing to buy"
settextlinetrigger 2 :BDCOMPLETE1 "] {"&$NEXTBOT&"} - Buy down exiting --- Normal Exit"
settextlinetrigger 3 :BDCASH1 "] {"&$NEXTBOT&"} - Buy down exiting --- Not enough cash onhand"

pause
:BDCASH1
gosub :KILLTHETRIGGERS
send "'" $NEXTBOT " w 4000000*"
waitfor "] {"&$NEXTBOT&"} - 4,000,000 credits taken from citadel."
goto :BDAGAIN1
:BDCOMPLETE1
gosub :KILLTHETRIGGERS
send "cr*q"
waitfor "Commerce report for"
waitfor "Equipment"
getword CURRENTLINE $EONHAND 3
return
:STARTBUYDOWNFUEL

setvar $NEXTBOT $BOTS[$CURRENT_TRADER][3]
send "'"&$NEXTBOT&" buy f s *"

settextlinetrigger 1 :STARTDOCK3 " docks at"
settextlinetrigger 2 :STARTDOCK4 "Commerce report for"
setdelaytrigger 3 :STARTDOCKDELAY2 5000
pause
:STARTDOCKDELAY2
gosub :KILLTHETRIGGERS
send "'" $NEXTBOT " stopall*"
waitfor " non-system scripts and modules killed, and mode"

send "'" $NEXTBOT " land*"
waitfor "] {"&$NEXTBOT&"} - In Cit - Plane"
send "'" $NEXTBOT " cn*"
waitfor "] {"&$NEXTBOT&"} - CN Settings are reset for this bo"
send "'"&$NEXTBOT&" buy f s *"
:STARTDOCK3
:STARTDOCK4
gosub :KILLTHETRIGGERS

settextlinetrigger 1 :COMPLETE1 "] {"&$NEXTBOT&"} - Buy down exiting --- Nothing to buy"
settextlinetrigger 2 :COMPLETE1 "] {"&$NEXTBOT&"} - Buy down exiting --- Normal Exit"
settextlinetrigger 3 :CASH1 "] {"&$NEXTBOT&"} - Buy down exiting --- Not enough cash onhand"

pause
:CASH1
gosub :KILLTHETRIGGERS
send "'" $NEXTBOT " w 4000000*"
waitfor "] {"&$NEXTBOT&"} - 4,000,000 credits taken from citadel."
goto :BDAGAIN1
:COMPLETE1
gosub :KILLTHETRIGGERS
send "cr*q"
waitfor "Commerce report for"
waitfor "Equipment"
getword CURRENTLINE $EONHAND 3
return
:SELLOFFPRODUCT
:STARTSELL

send "'"&$BOTS[$CURRENT_TRADER][3]&" neg o e*"
settextlinetrigger 1 :GOOD "] {"&$BOTS[$CURRENT_TRADER][3]&"} - Done with port"
settextlinetrigger 2 :BAD "] {"&$BOTS[$CURRENT_TRADER][3]&"} - Nothing to sell"
pause
:GOOD

killtrigger 2
send "cr*q"
waitfor "Commerce report for"
waitfor "Equipment"
getword CURRENTLINE $EONHAND 3
if ($EONHAND > 5000)
  setvar $SWITCHBOARD~MESSAGE "Neg fail detected! trying again*"
  gosub :SWITCHBOARD~SWITCHBOARD
  goto :STARTSELL
end
:BAD
killtrigger 1
return
:FINDBESTCANDIDATES


setvar $I 1
setvar $HIGHEST_TURNS 0
setvar $CURRENT_TRADER 0
while ($I <= $MAX_BOTS)

  if (($BOTS[$I][1] > $HIGHEST_TURNS) and (($CURRENT_ROBBER <> $BOTS[$I]) and ($BOTS[$I][2] = FALSE)))
    setvar $CURRENT_TRADER $BOTS[$I]
    setvar $HIGHEST_TURNS $BOTS[$I][1]
  end
  add $I 1
end
if ($CURRENT_TRADER = 0)
  setvar $SWITCHBOARD~MESSAGE "Well, that shouldn't have happened.  I can't find a trader to go next!  Halting.*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end
return
:GRABPLANETSTATS




send "q"
waiton "Planet command (?"
gosub :PLANET~GETPLANETINFO
send "c"
return
:FINDPORTS

setvar $BOTTOM 1
setvar $TOP 1
setvar $NEARFIG 0
setvar $QUE[1] $PLAYER~CURRENT_SECTOR
setarray $CHECKED SECTORS
setvar $CHECKED[$PLAYER~CURRENT_SECTOR] 1
:TRYAGAIN2

while ($BOTTOM <= $TOP)

  setvar $FOCUS $QUE[$BOTTOM]

  getsectorparameter $FOCUS "MEGABUY" $ISGOODBUYER
  getsectorparameter $FOCUS "MEGASELL" $ISGOODSELLER
  getsectorparameter $FOCUS "FIGSEC" $ISFIGGED




  if ($CHECKEDPORTS[$FOCUS] <> TRUE)
    if (SECTOR.EXPLORED[$FOCUS] = "YES")
      if (((PORT.EXISTS[$FOCUS] = TRUE) and (PORT.CLASS[$FOCUS] > 0)) and ((($ISGOODBUYER = TRUE) and ($PLANET~PLANET_EQUIPMENT > $MINIMUMPRODUCT)) or (($ISGOODSELLER = TRUE) and (($PLANET~PLANET_EQUIPMENT_MAX - $PLANET~PLANET_EQUIPMENT) >= $GAME~PORT_MAX))))
        send "cr"&$FOCUS&"*q"
        gosub :PLAYER~QUIKSTATS
        if (PORT.EQUIP[$FOCUS] >= $MINIMUMPRODUCT)

          setvar $NEARFIG $FOCUS
          setvar $CHECKEDPORTS[$NEARFIG] TRUE
          setvar $TOTALPORTFUEL PORT.FUEL[$FOCUS]
          return
        else
          setvar $NEARFIG 0
        end
      else
        setvar $NEARFIG 0
      end
    else
      if (($ISGOODBUYER = TRUE) and ($PLANET~PLANET_EQUIPMENT > $MINIMUMPRODUCT)) or (($ISGOODSELLER = TRUE) and (($PLANET~PLANET_EQUIPMENT_MAX - $PLANET~PLANET_EQUIPMENT) > $GAME~PORT_MAX))

        setvar $NEARFIG $FOCUS
        setvar $CHECKEDPORTS[$NEARFIG] TRUE
        setvar $TOTALPORTFUEL PORT.FUEL[$FOCUS]
        return
      else
        setvar $NEARFIG 0
      end
    end
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
setvar $SWITCHBOARD~MESSAGE "Can't find a route to any other MEGABUY OR MEGASELL ports.*"
gosub :SWITCHBOARD~SWITCHBOARD
halt
return
:PWARPTOPORT

if ($NEARFIG > 0)
  gosub :KILLTHETRIGGERS
  send "p"&$NEARFIG&"*ys** "
  settextlinetrigger 1 :EMPTYPORT "-=-=-=- Planetary TransWarp Drive Engaged! -=-=-=-"
  settextlinetrigger 2 :EMPTYPORT "You are already in that sector!"
  settextlinetrigger 3 :NOFIGATLOCATION "Your own fighters must be in the destination to make a safe jump."
  settextlinetrigger 4 :DONENOFUEL "You do not have enough Fuel Ore on this planet to make the jump."
  pause
  :EMPTYPORT
  gosub :KILLTHETRIGGERS
  send "cr"&$NEARFIG&"*q"
  gosub :PLAYER~QUIKSTATS
  setsectorparameter $NEARFIG "FIGSEC" TRUE
  if ((PORT.EXISTS[$NEARFIG] = TRUE) and ((PORT.CLASS[$NEARFIG] > 0) and ((SECTOR.EXPLORED[$NEARFIG] = "YES") and (PORT.EQUIP[$NEARFIG] >= $MINIMUMPRODUCT))))
    setvar $GO_TO_NEXT_PORT FALSE
  else
    setvar $GO_TO_NEXT_PORT TRUE
  end

  return
  :NOFIGATLOCATION
  gosub :KILLTHETRIGGERS
  setsectorparameter $NEARFIG "FIGSEC" FALSE
  setvar $GO_TO_NEXT_PORT TRUE
  return
  :DONENOFUEL
  gosub :KILLTHETRIGGERS
  setvar $SWITCHBOARD~MESSAGE "Your planet doesn't have enough fuel to jump to the next closest port.  Halting.*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
else
  setvar $SWITCHBOARD~MESSAGE "Couldn't find a way to another port.  Weird.*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end
:KILLTHETRIGGERS

killtrigger 1
killtrigger 2
killtrigger 3
killtrigger 4
killtrigger 5
killtrigger 6
return

# includes:
include "include/BOT.ts"
include "include/BOT_2/BOT.ts"
include "include/BOT_3/BOT.ts"
include "include/BOT_4/BOT.ts"
include "include/SWITCHBOARD.ts"
include "include/PLAYER.ts"
include "include/BOT_5/BOT.ts"
include "include/PLANET.ts"
