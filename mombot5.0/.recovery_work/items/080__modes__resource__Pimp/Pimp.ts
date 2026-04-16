reqrecording
gosub :BOT~LOADVARS
loadvar $MAP~BACKDOOR


setvar $BOT~HELP[1] $BOT~TAB&"PIMP - Makes planets and strips them of product "
setvar $BOT~HELP[2] $BOT~TAB&"   "
setvar $BOT~HELP[3] $BOT~TAB&"pimp {"&#34&"planet name"&#34&"} {f} {o} {e}"
setvar $BOT~HELP[4] $BOT~TAB&"      "
setvar $BOT~HELP[5] $BOT~TAB&"[planet name] - creates planet with this name (default"
setvar $BOT~HELP[6] $BOT~TAB&"                is random name)"
setvar $BOT~HELP[7] $BOT~TAB&"          [f] - fuel"
setvar $BOT~HELP[8] $BOT~TAB&"          [o] - organics"
setvar $BOT~HELP[9] $BOT~TAB&"          [e] - equipment"
gosub :BOT~HELPFILE

setvar $BOT~SCRIPT_TITLE "product pimp"
gosub :BOT~BANNER
:PIMP




window "PRODPIMP" 400 150 "product pimp stats" "ONTOP"
gosub :PLAYER~QUIKSTATS
setvar $STARTING_LOCATION $PLAYER~CURRENT_PROMPT
getrnd $RANDOM 1 100000
if (($STARTING_LOCATION <> "Citadel") and ($STARTING_LOCATION <> "Planet"))
  setvar $SWITCHBOARD~MESSAGE "You must run product pimp from a Citadel prompt.*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end
setvar $BOT~USER_COMMAND_LINE $BOT~USER_COMMAND_LINE&" "
isnumber $TEST $BOT~PARM1

getwordpos $BOT~USER_COMMAND_LINE $POS #34
if ($POS > 0)
  gettext " "&$BOT~USER_COMMAND_LINE&" " $TARGETPLANET " "&#34 #34&" "
  if ($TARGETPLANET <> "")
    setvar $PIMP_PLANET_NAME $TARGETPLANET
    striptext $BOT~USER_COMMAND_LINE " "&#34&$TARGETPLANET&#34&" "
  else
    setvar $PIMP_PLANET_NAME "M()M Pimp "&$RANDOM
  end
else
  setvar $PIMP_PLANET_NAME "M()M Pimp "&$RANDOM
end

setvar $BOT~USER_COMMAND_LINE " "&$BOT~USER_COMMAND_LINE&" "
getwordpos $BOT~USER_COMMAND_LINE $POS " f "
if ($POS > 0)
  setvar $EMPTYFUEL TRUE
else
  setvar $EMPTYFUEL FALSE
end
getwordpos $BOT~USER_COMMAND_LINE $POS " o "
if ($POS > 0)
  setvar $EMPTYORGANICS TRUE
else
  setvar $EMPTYORGANICS FALSE
end
getwordpos $BOT~USER_COMMAND_LINE $POS " e "
if ($POS > 0)
  setvar $EMPTYEQUIPMENT TRUE
else
  setvar $EMPTYEQUIPMENT FALSE
end
if (($EMPTYORGANICS = FALSE) and (($EMPTYEQUIPMENT = FALSE) and ($EMPTYFUEL = FALSE)))
  setvar $SWITCHBOARD~MESSAGE "Please pick [f]uel, [o]rganics and/or [e]quipment to harvest.  pimp {"&#34&"planet name"&#34&"} {f} {o} {e} *"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end


setvar $OM_SDLOC $MAP~STARDOCK
setvar $TOTALPLANETS 0
setvar $STRIPABLES 0

gosub :PLAYER~QUIKSTATS
setvar $STARTING_LOCATION $PLAYER~CURRENT_PROMPT

if ($STARTING_LOCATION = "Citadel")
  send "q"
  gosub :PLANET~GETPLANETINFO
  send "c"
  waitfor "Citadel command"
elseif ($STARTING_LOCATION = "Planet")
  gosub :PLANET~GETPLANETINFO
  send " q l " $PLANET~PLANET "* "
end

setvar $TARGET $PLANET~PLANET
setvar $TARGET_CASH $PLANET~CITADELCREDITS
setvar $TOTALFUEL $PLANET~PLANETFUEL
setvar $TOTALORG $PLANET~PLANETORG
setvar $TOTALEQU $PLANET~PLANETEQUIP
setvar $TOTALFUELMAX $PLANET~PLANETFUELMAX
setvar $TOTALORGMAX $PLANET~PLANETORGMAX
setvar $TOTALEQUMAX $PLANET~PLANETEQUIPMAX
setvar $OM_REDSECTOR $MAP~BACKDOOR


if ($PLAYER~PHOTONS > 0)
  setvar $SWITCHBOARD~MESSAGE "You can't have photons while running pimp.  That doesn't make any sense at all.*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end
:INAC
killalltriggers
:MYINFO
if ($PLAYER~UNLIMITEDGAME = FALSE)
  if ($PLAYER~TURNS < $BOT~BOT_TURN_LIMIT)
    setvar $SWITCHBOARD~MESSAGE "I have too few turns to pimp product, script halting.*"
    gosub :SWITCHBOARD~SWITCHBOARD
    halt
  end
end
if (($PLAYER~CREDITS + $TARGET_CASH) < 1000000)
  setvar $SWITCHBOARD~MESSAGE "I have too little cash on hand, script halting.*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end
:MYPLANETINFO

if ($STARTING_LOCATION = "Citadel")
  send "q"
  gosub :PLANET~GETPLANETINFO
  send "c"
  waitfor "Citadel command"
elseif ($STARTING_LOCATION = "Planet")
  gosub :PLANET~GETPLANETINFO
end

setvar $TOTALFUEL $PLANET~PLANETFUEL
setvar $TOTALORG $PLANET~PLANETORG
setvar $TOTALEQU $PLANET~PLANETEQUIP
if ($STARTING_LOCATION = "Citadel")
  send "q"
end


send "m * * * T * L 1*T*L2*T*L3*S*L1*Q j y"

seteventtrigger DISCOD1 :DISCOD "CONNECTION LOST"
seteventtrigger DISCOD2 :DISCOD "Connections have been temporarily disabled."
waitfor "Command [TL"
:MAKEPLANET



killalltriggers
gosub :SET_WINDOWS
gosub :PLAYER~QUIKSTATS
if (($PLAYER~CREDITS < 1000000) and (($PLAYER~GENESIS <= 0) or ($PLAYER~ATOMIC <= 0)))
  setvar $CASHONHAND $TARGET_CASH
  add $CASHONHAND $PLAYER~CREDITS
  send "l j" #8 $TARGET "* c "
  if ($CASHONHAND > 5000000)
    send "T T " $PLAYER~CREDITS "* "
    send "T F " 5000000 "* "
    setvar $PLAYER~CREDITS 5000000
  elseif ($CASHONHAND > 1000000)
    send "T T " $PLAYER~CREDITS "* "
    send "T F " $CASHONHAND "* "
    setvar $PLAYER~CREDITS $CASHONHAND
  else
    setvar $SWITCHBOARD~MESSAGE "I have too little cash on hand, script halting.*"
    gosub :SWITCHBOARD~SWITCHBOARD
    halt
  end
  seteventtrigger DISCOD1 :DISCOD "CONNECTION LOST"
  seteventtrigger DISCOD2 :DISCOD "Connections have been temporarily disabled."
  settextlinetrigger GETCASH :GOTCASH "credits, and the Treasury has "
  pause
  :GOTCASH
  getword CURRENTLINE $TARGET_CASH 9
  striptext $TARGET_CASH ","
  send "qqq* * "
  gosub :PLAYER~QUIKSTATS
end
if ($PLAYER~FIGHTERS < 1000)
  setvar $SWITCHBOARD~MESSAGE "I have too few fighters on hand, less than 1000. Script halting.*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end
if ($PLAYER~UNLIMITEDGAME = FALSE)
  if ($PLAYER~TURNS < $BOT~BOT_TURN_LIMIT)
    setvar $SWITCHBOARD~MESSAGE "I have too few turns to pimp product. Script halting.*"
    gosub :SWITCHBOARD~SWITCHBOARD
    halt
  end
end
if (($PLAYER~GENESIS > 0) and ($PLAYER~ATOMIC > 0))
  send "u y * " #8 #8 $PIMP_PLANET_NAME "* p q * "
  gosub :SET_WINDOWS
  add $TOTALPLANETS 1
  killalltriggers
  seteventtrigger DISCOD1 :DISCOD "CONNECTION LOST"
  seteventtrigger DISCOD2 :DISCOD "Connections have been temporarily disabled."
  settexttrigger BUILTPLANET :FINDPLANET "For building this planet"
  pause
else
  gosub :RESTOCK
  goto :MAKEPLANET
end
:FINDPLANET


killalltriggers

send "L"
seteventtrigger DISCOD1 :DISCOD "CONNECTION LOST"
seteventtrigger DISCOD2 :DISCOD "Connections have been temporarily disabled."
settextlinetrigger GETPLANETNUM :GET_PLANET_NUM "> "&$PIMP_PLANET_NAME
pause
pause
:GET_PLANET_NUM

setvar $LINE CURRENTLINE
striptext $LINE "<"
getword $LINE $PLANET~PLANETNUM 1
striptext $PLANET~PLANETNUM ">"
send $PLANET~PLANETNUM "*"


gosub :PLANET~GETPLANETINFO

if ((($PLANET~PLANETFUEL < $PLAYER~TOTAL_HOLDS) or ($EMPTYFUEL = FALSE)) and (((($PLANET~PLANETORG < $PLAYER~TOTAL_HOLDS) or ($EMPTYORGANICS = FALSE)) and (($PLANET~PLANETEQUIP < $PLAYER~TOTAL_HOLDS) or ($EMPTYEQUIPMENT = FALSE)))))

  if (($FUELCOLOS = 0) and (($ORGCOLOS = 0) and ($EQUIPCOLOS = 0)))
    killalltriggers
    send "z d y "
    seteventtrigger DISCOD1 :DISCOD "CONNECTION LOST"
    seteventtrigger DISCOD2 :DISCOD "Connections have been temporarily disabled."
    settexttrigger 6 :NODETS "You do not have any Atomic Detonators!"
    settexttrigger 7 :MAKEPLANET "Command [TL="
    pause
  end
end
add $STRIPABLES 1
send "* "
killalltriggers
seteventtrigger DISCOD1 :DISCOD "CONNECTION LOST"
seteventtrigger DISCOD2 :DISCOD "Connections have been temporarily disabled."
waitfor "Planet command"
:TRYFUEL
killalltriggers
seteventtrigger DISCOD1 :DISCOD "CONNECTION LOST"
seteventtrigger DISCOD2 :DISCOD "Connections have been temporarily disabled."
if ($EMPTYFUEL)
  send "t*t1*q l j" #8 $TARGET "* t*l1*q l j" #8 $PLANET~PLANETNUM "* "
  settexttrigger FUELSUCCESS :FUELSUCCESS "You load the "
  settexttrigger FUELEMPTY :FUELEMPTY "There aren't that many "
  settexttrigger FUELFULL :FULLPLANET "They don't have room for that many "
  pause
else
  goto :FUELEMPTY
end
:FUELSUCCESS

add $TOTALFUEL $PLAYER~TOTAL_HOLDS
gosub :SET_WINDOWS
goto :TRYFUEL
:FUELEMPTY
killalltriggers
:TRYORGANICS
killalltriggers
if ($EMPTYORGANICS)
  send "t*t2*q l j" #8 $TARGET "* t*l2*q l j" #8 $PLANET~PLANETNUM "* "
  seteventtrigger DISCOD1 :DISCOD "CONNECTION LOST"
  seteventtrigger DISCOD2 :DISCOD "Connections have been temporarily disabled."
  settexttrigger SUCCESS :ORGSUCCESS "You load the "
  settexttrigger ORGEMPTY :TRYEQUIPMENT "There aren't that many "
  settexttrigger FULLFILL :FULLPLANET "They don't have room for that many "
  pause
else
  goto :ORGEMPTY
end
:ORGSUCCESS

add $TOTALORG $PLAYER~TOTAL_HOLDS
gosub :SET_WINDOWS
goto :TRYORGANICS
:ORGEMPTY
killalltriggers
:TRYEQUIPMENT
killalltriggers
if ($EMPTYEQUIPMENT)
  seteventtrigger DISCOD1 :DISCOD "CONNECTION LOST"
  seteventtrigger DISCOD2 :DISCOD "Connections have been temporarily disabled."
  send "t*t3*q l j" #8 $TARGET "* t*l3*q l j" #8 $PLANET~PLANETNUM "* "
  settexttrigger SUCCESS :EQUSUCCESS "You load the "
  settexttrigger EMPTYEMPTY :EMPTYPLANET "There aren't that many "
  settexttrigger FULLFILL :FULLPLANET "They don't have room for that many "
  pause
else
  goto :EQUEMPTY
end
:EQUSUCCESS
add $TOTALEQU $PLAYER~TOTAL_HOLDS
gosub :SET_WINDOWS
goto :TRYEQUIPMENT
:EQUEMPTY
killalltriggers
goto :EMPTYPLANET
:FULLPLANET

killalltriggers
send "qqqqqq* l j"&#8&$TARGET&"* "
if ($STARTING_LOCATION = "Citadel")
  send "c "
end
setvar $SWITCHBOARD~MESSAGE " Planet "&$TARGET&" is full, stopping.*"
gosub :SWITCHBOARD~SWITCHBOARD
halt
:EMPTYPLANET

killalltriggers
send "@"
seteventtrigger DISCOD1 :DISCOD "CONNECTION LOST"
seteventtrigger DISCOD2 :DISCOD "Connections have been temporarily disabled."
waitfor "Average Interval Lag:"
send "Q"
waitfor "Command [TL"
goto :FINDPLANET
:NODETS

send "QQ"
if ($PLAYER~ALIGNMENT < 1000)
  setvar $SWITCHBOARD~MESSAGE "Alignment less than 1000, can't refurb genesis torps and atomic dets*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end

gosub :RESTOCK
goto :FINDPLANET
:RESTOCK

killalltriggers
send "d"
settextlinetrigger FIGPROMPT :FIGPROMPT "Fighters:"
settextlinetrigger NOFIGPROMPT :NOFIGPROMPT "Warps to Sector(s) :"
pause
:NOFIGPROMPT
killalltriggers
setvar $SWITCHBOARD~MESSAGE "No fighters here to twarp back to.*"
gosub :SWITCHBOARD~SWITCHBOARD
halt
:FIGPROMPT
killalltriggers
getword CURRENTLINE $CHKPERS 3
if ($CHKPERS <> "(yours)")
  getword CURRENTLINE $WHICHCORP 6
  if ("($WHICHCORPÌ"CORP)")")
    setvar $SWITCHBOARD~MESSAGE "No fighters here to twarp back to.*"
    gosub :SWITCHBOARD~SWITCHBOARD
    halt
  end
end

seteventtrigger DISCOD1 :DISCOD "CONNECTION LOST"
seteventtrigger DISCOD2 :DISCOD "Connections have been temporarily disabled."
settextlinetrigger SDYES :SDYES "Commerce report for Stargate Alpha I:"
settextlinetrigger SDNO1 :SDNO "You have never visted sector"
settextlinetrigger SDNO2 :SDNO "I have no information about a port in that sector."
setdelaytrigger SDNO3 :SDNO 10000

send "C"
waitfor "<Computer activated>"
send "R"
waitfor "What sector is the port"
send $OM_SDLOC "*"
pause
pause
:SDNO

send "q"
setvar $SWITCHBOARD~MESSAGE "SD is not in that sector, or never been visited!! product pimp shutting down in starting sector.*"
gosub :SWITCHBOARD~SWITCHBOARD
halt
:SDYES

send "QL "&$TARGET&"* T * T 1 * M * * * Q"
waitfor "Command [TL"
send "** "
gosub :PLAYER~QUIKSTATS
if (($PLAYER~ORE_HOLDS < $PLAYER~TOTAL_HOLDS) and ((PORT.BUYFUEL[$PLAYER~CURRENT_SECTOR] <> TRUE) and (PORT.EXISTS[$PLAYER~CURRENT_SECTOR] = TRUE)))
  send "P T * * * "
  setvar $SWITCHBOARD~MESSAGE "Didn't have full fuel for restocking pimp. Buying fuel from port and trying again!*"
  gosub :SWITCHBOARD~SWITCHBOARD
end
if (($OM_REDSECTOR <> 0) and ($PLAYER~ALIGNMENT < 1000))
  if ($PLAYER~UNLIMITEDGAME)
    setvar $SWITCHBOARD~MESSAGE "Running product pimp with unlimited turns and "&$PLAYER~CREDITS&" credits left*"
    gosub :SWITCHBOARD~SWITCHBOARD
  else
    setvar $SWITCHBOARD~MESSAGE "Running product pimp with "&$PLAYER~TURNS&" turns and "&$PLAYER~CREDITS&" credits left*"
    gosub :SWITCHBOARD~SWITCHBOARD
  end
  killalltriggers
  seteventtrigger DISCOD1 :DISCOD "CONNECTION LOST"
  seteventtrigger DISCOD2 :DISCOD "Connections have been temporarily disabled."
  settexttrigger NOFIG :NOFIG "Do you want to make this jump blind?"
  settexttrigger READY1 :READY1 "Locating beam pinpointed,"
  settexttrigger NOFUEL2 :NOFUEL "You do not have enough Fuel Ore to make the jump"
  send "m" $OM_REDSECTOR "*y"
  pause
  pause
end
setvar $SWITCHBOARD~MESSAGE "Running product pimp with "&$PLAYER~TURNS&" turns and "&$PLAYER~CREDITS&" credits left*"
gosub :SWITCHBOARD~SWITCHBOARD
settexttrigger NOFIG :NOFIG "Do you want to make this jump blind?"
settexttrigger READY2 :READY2 "All Systems Ready, shall we engage?"
settexttrigger NOFUEL1 :NOFUEL "You do not have enough Fuel Ore to make the jump"
send "nsy"
pause
pause
:NOFIG

killalltriggers
send "n"
setvar $SWITCHBOARD~MESSAGE "No fig at target sector. Shutting Down*"
gosub :SWITCHBOARD~SWITCHBOARD
halt
:NOFUEL

killalltriggers
setvar $SWITCHBOARD~MESSAGE "No fuel for twarp. Shutting Down*"
gosub :SWITCHBOARD~SWITCHBOARD
halt
:READY1

killalltriggers
seteventtrigger DISCOD1 :DISCOD "CONNECTION LOST"
seteventtrigger DISCOD2 :DISCOD "Connections have been temporarily disabled."
settexttrigger LIMPET :LIMPET "ort official runs up"
settexttrigger BUYTORPS :BUYTORPS "<StarDock> Where to?"
send "YNS P S"
pause
pause
:READY2

killalltriggers
seteventtrigger DISCOD1 :DISCOD "CONNECTION LOST"
seteventtrigger DISCOD2 :DISCOD "Connections have been temporarily disabled."
settexttrigger LIMPET :LIMPET "ort official runs up"
settexttrigger BUYTORPS :BUYTORPS "<StarDock> Where to?"
send "Y PS"
pause
pause
:LIMPET

send "Y"
pause
:BUYTORPS

killalltriggers
seteventtrigger DISCOD1 :DISCOD "CONNECTION LOST"
seteventtrigger DISCOD2 :DISCOD "Connections have been temporarily disabled."
settexttrigger TORPS :TORPS "How many Genesis Torpedoes do you want"
settexttrigger DETS :DETS "How many Atomic Detonators do you want"
send "HT"
pause
pause
:TORPS

getword CURRENTLINE $NUMTORPS 9
striptext $NUMTORPS ")"
send $NUMTORPS&"*"
send "A"
pause
:DETS

getword CURRENTLINE $NUMDETS 9
striptext $NUMDETS ")"
send $NUMDETS&"*"
send "Q Q M "&$PLAYER~CURRENT_SECTOR&" * Y Y "
settexttrigger NOFIG :NOFIG "Do you want to make this jump blind?"
settexttrigger READY3 :READY3 "All Systems Ready, shall we engage?"
settexttrigger NOFUEL :NOFUEL "You do not have enough Fuel Ore to make the jump"
pause
pause
:READY3


waitfor "Command [TL"
send "l "&$TARGET&"* t n l 1* q q * j y * "
return
:PLANETFULL


setvar $SWITCHBOARD~MESSAGE "Planet is full. script halting.*"
gosub :SWITCHBOARD~SWITCHBOARD
send "QQ*"
:FINISH


halt
:SET_WINDOWS







if ($PLAYER~UNLIMITEDGAME)
  setvar $WINDOW_CONTENT "Planet fuel:  "&$TOTALFUEL&" out of "&$TOTALFUELMAX&"*Planet Org:   "&$TOTALORG&" out of "&$TOTALORGMAX&"*Planet Equip: "&$TOTALEQU&" out of "&$TOTALEQUMAX&"*Cash:         "&$PLAYER~CREDITS&"   Genesis Torps:  "&$PLAYER~GENESIS&"*Fighters:     "&$PLAYER~FIGHTERS&"   Atomic Dets:    "&$PLAYER~ATOMIC&"*Turns:     Unlimited*"&$STRIPABLES&" out of "&$TOTALPLANETS&" planets have had product on them.*"
else
  setvar $WINDOW_CONTENT "Planet fuel:  "&$TOTALFUEL&" out of "&$TOTALFUELMAX&"*Planet Org:   "&$TOTALORG&" out of "&$TOTALORGMAX&"*Planet Equip: "&$TOTALEQU&" out of "&$TOTALEQUMAX&"*Cash:         "&$PLAYER~CREDITS&"   Genesis Torps:  "&$PLAYER~GENESIS&"*Fighters:     "&$PLAYER~FIGHTERS&"   Atomic Dets:    "&$PLAYER~ATOMIC&"*Turns:        "&$PLAYER~TURNS&"*"&$STRIPABLES&" out of "&$TOTALPLANETS&" planets have had product on them.*"
end
setwindowcontents "PRODPIMP" $WINDOW_CONTENT
replacetext $WINDOW_CONTENT "*" "[][]"
savevar $WINDOW_CONTENT
return
:DISCOD


setvar $TAGLINE "[product pimp]"
setvar $TAGLINEB "[product pimp]"
killalltriggers
echo "**"&ANSI_14&$TAGLINEB&ANSI_15&" Disconnected **"
:DISCO_TEST
if (CONNECTED <> TRUE)
  setdelaytrigger EMANCIPATE_CPU :EMANCIPATE_CPU 3000
  echo "**"&ANSI_14&$TAGLINEB&ANSI_15&" Auto Land & Resume Initiated - Awaiting Connection!**"
  pause
  :EMANCIPATE_CPU
  goto :DISCO_TEST
end
waitfor "(?="
setdelaytrigger WAITINGABIT :WAITINGABIT 3000
echo "**"&ANSI_14&$TAGLINEB&ANSI_15&" Connected - Waiting For Command Prompt!**"
pause
:WAITINGABIT
killalltriggers
gosub :PLAYER~QUIKSTATS
if ($PLAYER~CURRENT_PROMPT = "Command")
  send " L Z"&#8&$TARGET&"*  *  J  C  *  "
  settextlinetrigger NOTLANDED :NOTLANDED "Are you sure you want to jettison all cargo?"
  settextlinetrigger LANDED :LANDED "<Enter Citadel>"
  setdelaytrigger TESTCONN :TESTCONN 3000
  pause
  :TESTCONN
  killalltriggers
  if (CONNECTED = FALSE)
    goto :DISCO_TEST
  else
    send "'{"&$SWITCHBOARD~BOT_NAME&"} - "&$TAGLINEB&" Problem Detected Unable to Land!*"
    halt
  end
  :NOTLANDED
  killalltriggers
  send "'{"&$SWITCHBOARD~BOT_NAME&"} - Boton Unable To Land, Check my TA.*"
  send "'{"&$SWITCHBOARD~BOT_NAME&"} "&$TAGLINEB&" - Unable To Land After Reconnect,Check My TA!**"
  halt
  :LANDED
  killalltriggers
  send "'{"&$SWITCHBOARD~BOT_NAME&"} "&$TAGLINEB&" - Restarting!**"
  waitfor "Message sent on sub-space channel"
  goto :INAC
elseif ($PLAYER~CURRENT_PROMPT = "Planet")
  send "  q q q q q  * * '"&$TAGLINEB&" Attempting to Reach Correct Prompt...*"
  settextlinetrigger EMQ_COMPLETE :EMQ_DELAY "Attempting to Reach Correct Prompt..."
  setdelaytrigger EMQ_DELAY :EMQ_DELAY 3000
  pause
elseif ($PLAYER~CURRENT_PROMPT = "Citadel")
  send "'{"&$SWITCHBOARD~BOT_NAME&"} "&$TAGLINEB&" - Restarting!**"
  waitfor "Message sent on sub-space channel"
  goto :INAC
else
  send " p d 0* 0* 0* * *** * c q q q q q z 2 2 c q * z * *** * * '"&$TAGLINEB&" Attempting to Reach Correct Prompt...*"
  settextlinetrigger EMQ_COMPLETE :EMQ_DELAY "Attempting to Reach Correct Prompt..."
  setdelaytrigger EMQ_DELAY :EMQ_DELAY 3000
  pause
  :EMQ_DELAY
  killalltriggers
  goto :DISCO_TEST

end
# includes:
include "include/BOT.ts"
include "include/PLAYER.ts"
include "include/PLANET.ts"
