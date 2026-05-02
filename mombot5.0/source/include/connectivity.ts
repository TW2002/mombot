:CONNECTIVITY~KEEPALIVE

send #27
setvar $CONNECTIVITY~RELOG_MESSAGE ""
savevar $CONNECTIVITY~RELOG_MESSAGE
add $CONNECTIVITY~ALIVE_COUNT 1
if ($CONNECTIVITY~ALIVE_COUNT >= ($BOT~ECHOINTERVAL * 2))
  setvar $CONNECTIVITY~ALIVE_COUNT 0
  gosub :PLAYER~CURRENTPROMPT
  getsectorparameter 2 "FIG_COUNT" $BOT~FIGCOUNT
  echo ANSI_14 "*-= Time: " ANSI_15 TIME ANSI_14 " Fig Grid: " ANSI_15 $BOT~FIGCOUNT ANSI_14 " =-*" ANSI_7
  echo CURRENTANSILINE
end
if ((CONNECTED <> TRUE) and ($BOT~DORELOG = TRUE))
  if ($CONNECTIVITY~RELOGGING <> TRUE)
    setvar $CONNECTIVITY~RELOGGING TRUE
    savevar $CONNECTIVITY~RELOGGING
    goto :INTERNAL_COMMANDS~RELOG_ATTEMPT
  end
end


if ($CONNECTIVITY~LAST_PROMPT_SEEN = CURRENTLINE)

  if ((CURRENTLINE = $GAME~GAME_MENU_PROMPT) or (CURRENTLINE = "[Pause] - [Press Space or Enter to continue]") or (CURRENTLINE = "Enter your choice: ") or (CURRENTLINE = "Selection (? for menu): "))
    if ($CONNECTIVITY~RELOGGING <> TRUE)
      setvar $CONNECTIVITY~RELOG_MESSAGE "Stuck on baffling prompt: ["&CURRENTLINE&"], so I relogged.*"
      savevar $CONNECTIVITY~RELOG_MESSAGE
      disconnect
      setvar $CONNECTIVITY~RELOGGING TRUE
      savevar $CONNECTIVITY~RELOGGING
      goto :INTERNAL_COMMANDS~RELOG_ATTEMPT
    end
  end
end

setvar $CONNECTIVITY~LAST_PROMPT_SEEN CURRENTLINE
send #27
killtrigger KEEPALIVE
setdelaytrigger KEEPALIVE :KEEPALIVE 30000
pause
:CONNECTIVITY~ONLINE_WATCH





if ((CONNECTED <> TRUE) and ($BOT~DORELOG = TRUE))
  if ($CONNECTIVITY~RELOGGING <> TRUE)
    setvar $CONNECTIVITY~RELOGGING TRUE
    savevar $CONNECTIVITY~RELOGGING
    goto :INTERNAL_COMMANDS~RELOG_ATTEMPT
  end
end
killtrigger KEEPALIVE
killtrigger ONLINE_WATCH
settexttrigger ONLINE_WATCH :ONLINE_WATCH "Your session will be terminated in "
setdelaytrigger KEEPALIVE :KEEPALIVE 20000
send #27
pause
:CONNECTIVITY~DO_RELOG
:CONNECTIVITY~THEDELAY



gosub :KILLRELOGTRIGGERS
seteventtrigger CONTINUELOGIN :CONTINUELOGIN "CONNECTION ACCEPTED"
if (CONNECTED <> TRUE)
  echo "*"&ANSI_15&"["&ANSI_3&"ATTEMPTING TO CONNECT"&ANSI_15&"]*"
  connect
else
  goto :CONTINUERELOG3
end
pause
:CONNECTIVITY~CONTINUELOGIN
gosub :KILLRELOGTRIGGERS
settexttrigger RELOG3 :CONTINUERELOG3 "Please enter your name"
pause
:CONNECTIVITY~CONTINUERELOG3
gosub :KILLRELOGTRIGGERS


settexttrigger LOGINSUCCESSFUL :CONTINUERELOG4V1 "Trade Wars 2002 Game Server v1"
settexttrigger LOGINSUCCESSFUL2 :CONTINUERELOG4V2 "TWGS v2"
send $BOT~SERVERNAME&"*"
pause
:CONNECTIVITY~CONTINUERELOG4V1

setvar $CONNECTIVITY~TWGSVERSION 1
goto :CONTINUERELOG4
:CONNECTIVITY~CONTINUERELOG4V2
setvar $CONNECTIVITY~TWGSVERSION 2
goto :CONTINUERELOG4
:CONNECTIVITY~CONTINUERELOG4

gosub :KILLRELOGTRIGGERS
if ($CONNECTIVITY~FIRST_TIME)
  setvar $CONNECTIVITY~FIRST_TIME FALSE
  disconnect
  goto :DO_RELOG
end
settexttrigger RELOG69 :CONTINUERELOG5 "Make a Selection:"
settexttrigger RELOG3 :CONTINUERELOG5 "Selection (? for menu):"
send "#"&#8
pause
:CONNECTIVITY~CONTINUERELOG5
gosub :KILLRELOGTRIGGERS

if ($CONNECTIVITY~NEWGAME)
  if ($CONNECTIVITY~TWGSVERSION = 1)
    settexttrigger FIRSTPAUSE :FIRSTPAUSE "[Pause]"
    settexttrigger ENTER :DONE_DO_RELOG "Would you like to start a new character in this game?"
    settexttrigger V1ENTER :V1ENTER "Enter your choice"
    settextlinetrigger NOTOPEN :GAME_NOT_OPEN "but this is a closed game."
    send $BOT~LETTER&"                                           * "
    pause
  else
    settexttrigger FIRSTPAUSE :FIRSTPAUSE "[Pause]"
    settexttrigger ENTER :DONE_DO_RELOG "Enter your choice"
    settexttrigger NOTOPEN :GAME_NOT_OPEN "This game will open"
    send $BOT~LETTER
    pause
  end


else
  settexttrigger FIRSTPAUSE :FIRSTPAUSE "[Pause]"
  settexttrigger ENTER :DONE_DO_RELOG "Enter your choice"
  settexttrigger NOTOPEN :GAME_NOT_OPEN "This game will open"
  send $BOT~LETTER
  pause
end
:CONNECTIVITY~FIRSTPAUSE


send "*"
settexttrigger FIRSTPAUSE :FIRSTPAUSE "[Pause]"
pause
:CONNECTIVITY~V1ENTER
killtrigger FIRSTPAUSE
send "* T ***"
pause
:CONNECTIVITY~DONE_DO_RELOG
killalltriggers
if ($CONNECTIVITY~NEWGAME and ($CONNECTIVITY~TWGSVERSION = 2)) or ($CONNECTIVITY~NEWGAME = FALSE)
  send "T***"
end
return
:CONNECTIVITY~GAME_NOT_OPEN
killalltriggers
if (CONNECTED <> TRUE)
  goto :THEDELAY
end

if ($CONNECTIVITY~NEWGAME)
  if ($CONNECTIVITY~TWGSVERSION = 1)

    add $CONNECTIVITY~NEWGAMECOUNTER 1
    if ($CONNECTIVITY~NEWGAMECOUNTER > 20)
      killalltriggers
      disconnect
      setdelaytrigger WAITAMOMENT :WAITAMOMENT 5000
      pause
      :CONNECTIVITY~WAITAMOMENT
      killalltriggers
      goto :THEDELAY
    end

    settexttrigger V1PAUSE :V1PAUSE "[Pause]"
    settexttrigger V1ENTER2 :V1ENTER2 "Enter your choice"
    setdelaytrigger 2 :NEW_GAME_DELAY2 1000
    settexttrigger 3 :TRYAGAINNEWGAMEDAY1 "Would you like to start a new character in this game?"
    settextlinetrigger 4 :TRYAGAINENTERGAME "but this is a closed game."
    send $BOT~LETTER&"                                           * "
    pause


  else

    setdelaytrigger 2 :NEW_GAME_DELAY2 5000
    settexttrigger 3 :TRYAGAINNEWGAMEDAY1 "Enter your choice:"
    settextlinetrigger 4 :TRYAGAINENTERGAME "This game will open"
    send $BOT~LETTER&" * "
    pause
  end


else

  setdelaytrigger 2 :NEW_GAME_DELAY2 5000
  settexttrigger 3 :TRYAGAINNEWGAMEDAY1 "Enter your choice:"
  settextlinetrigger 4 :TRYAGAINENTERGAME "This game will open"
  send $BOT~LETTER&" * "
  pause
end
:CONNECTIVITY~NEW_GAME_DELAY2


goto :GAME_NOT_OPEN
:CONNECTIVITY~TRYAGAINENTERGAME
goto :GAME_NOT_OPEN
:CONNECTIVITY~TRYAGAINNEWGAMEDAY1

if ($CONNECTIVITY~NEWGAME and ($CONNECTIVITY~TWGSVERSION = 2)) or ($CONNECTIVITY~NEWGAME = FALSE)

  send "T ***"
end
killalltriggers
return
:CONNECTIVITY~V1PAUSE
send "*"
setvar $CONNECTIVITY~NEWGAMECOUNTER 0
settexttrigger V1PAUSE :V1PAUSE "[Pause]"

pause
:CONNECTIVITY~V1ENTER2
killtrigger V1PAUSE
killtrigger FIRSTPAUSE
setvar $CONNECTIVITY~NEWGAMECOUNTER 0
send "T ***"
pause
return
:CONNECTIVITY~KILLRELOGTRIGGERS

killtrigger CONTINUELOGIN
killtrigger THEDELAY
killtrigger THEDELAY2
killtrigger RELOG
killtrigger RELOG2
killtrigger RELOG3
killtrigger RELOG69
killtrigger RELOG89
killtrigger LOGINSUCCESSFUL
killtrigger LOGINSUCCESSFUL2
killtrigger FIRSTPAUSE
killtrigger ENTER
killtrigger NOTOPEN
killtrigger V1ENTER
killtrigger V1ENTER2
killtrigger V1PAUSE
setdelaytrigger THEDELAY2 :THEDELAY 5000
return
:CONNECTIVITY~ENTER_NEW_GAME

setvar $CONNECTIVITY~TWGSVERSION ""
:CONNECTIVITY~TRY_AGAIN
gosub :DO_RELOG
:CONNECTIVITY~GAMECLOSED
killalltriggers
settextlinetrigger 1 :CLOSED "I'm sorry, but this is a closed game."
settextlinetrigger 2 :CLOSED "www.tradewars.com                                   Epic Interactive Strategy"
settextlinetrigger 3 :CLOSED " day(s) to get back in."
setdelaytrigger 4 :CLOSED 5000
settextlinetrigger 5 :ON_PLANET "What do you want to name your home planet?"
settexttrigger 6 :WRONG_NAME "Sorry, you cannot use the name "
settexttrigger 7 :BACK_IN_GAME "Command [TL"


if ($CONNECTIVITY~NEWGAME)
  send "Y"&$BOT~PASSWORD&"*"&$BOT~PASSWORD&"*"
  settexttrigger 8 :WHOSPLAY "Who's Playing"
  settexttrigger 9 :NEWNAME "Use (N)ew Name or (B)BS Name"
  settexttrigger 10 :NOALIAS "Choose a name carefully as you will have it for a while!"
else
  send $BOT~PASSWORD&"* * ************"
  waiton "What do you want to name your ship? (30 letters)"
  if ($MENUS~LANDONTERRA = TRUE)
    send $BOT~STARTSHIPNAME&"*Y l "
    return
  else
    send $BOT~STARTSHIPNAME&"*Y "
  end
end
pause
:CONNECTIVITY~WHOSPLAY
killtrigger 8
killtrigger 9
killtrigger 10
send "*N"&$BOT~USERNAME&"*Y"&$BOT~STARTSHIPNAME&"*Y * "
pause
:CONNECTIVITY~NEWNAME
killtrigger 8
killtrigger 9
killtrigger 10
send "N"&$BOT~USERNAME&"*Y"&$BOT~STARTSHIPNAME&"*Y"
pause
:CONNECTIVITY~NOALIAS
killtrigger 8
killtrigger 9
killtrigger 10
send $BOT~STARTSHIPNAME&"*Y * "
pause
:CONNECTIVITY~WRONG_NAME
killalltriggers
echo "[[  {"&$SWITCHBOARD~BOT_NAME&"} - Character name not allowed!  Start over and pick a new name!  ]]*"
halt
:CONNECTIVITY~CLOSED
killalltriggers
if (CONNECTED <> TRUE)
  load "scripts\"&$BOT~MOMBOT_DIRECTORY&"\commands\general\relog.cts"
  seteventtrigger 1 :RELOGENDED "SCRIPT STOPPED" "scripts\"&$BOT~MOMBOT_DIRECTORY&"\commands\general\relog.cts"
  pause
  :CONNECTIVITY~RELOGENDED
  goto :TRY_AGAIN
end
setdelaytrigger 2 :NEW_GAME_DELAY 300
settextlinetrigger 3 :TRYAGAINNEWGAMEDAY1 "T - Play Trade Wars 2002"
pause
:CONNECTIVITY~NEW_GAME_DELAY
send $BOT~LETTER&" * "
goto :GAMECLOSED
:CONNECTIVITY~ON_PLANET
send ".*  Q  "
pause
:CONNECTIVITY~BACK_IN_GAME
killalltriggers

if ($CONNECTIVITY~NEWGAME)
  gosub :CONNECTIVITY~PROMOTENEWGAMESTATE
end

if (($CONNECTIVITY~NEWGAME = TRUE) and (($BOT~ISCEO = TRUE) and (($BOT~CORPNAME <> "") and ($BOT~CORPPASSWORD <> ""))))
  gosub :BOT~KILLTHETRIGGERS
  send "tm" $BOT~CORPNAME "*y" $BOT~CORPPASSWORD "*yq"
  send "co*cq"
  setvar $CONNECTIVITY~SKIPJOIN TRUE
  goto :RESUMESTARTAFTERCORPJOIN
end
if ($CONNECTIVITY~NEWGAME and (($BOT~ISCEO = FALSE) and (($BOT~CORPNAME <> "") and ($BOT~CORPPASSWORD <> ""))))
  setvar $CONNECTIVITY~SKIPJOIN 0
  setvar $CONNECTIVITY~ATTEMPS 0
  gosub :BOT~KILLTHETRIGGERS
  :CONNECTIVITY~CHECKFORCORP2
  add $CONNECTIVITY~ATTEMPS 1
  if ($CONNECTIVITY~ATTEMPS >= 5)
    gosub :BOT~KILLTHETRIGGERS
    send "q"
    goto :RESUMESTARTAFTERCORPJOIN
  end
  send "*TD"
  gosub :PLAYER~QUIKSTATS
  settextlinetrigger 1 :THEREISMYCORP2 "    "&$BOT~CORPNAME
  settexttrigger 2 :NOCORPTHATNAME2 "Corporate command ["
  send "L"
  pause
  :CONNECTIVITY~NOCORPTHATNAME2
  gosub :BOT~KILLTHETRIGGERS
  echo "[[ Waiting 3 seconds to check for corp again, press [Spacebar] to cancel. ]]*"
  setdelaytrigger 3 :CHECKFORCORP2 200
  settextouttrigger 4 :ALREADYCORPED2 #32
  pause
  :CONNECTIVITY~THEREISMYCORP2
  gosub :BOT~KILLTHETRIGGERS
  getword CURRENTLINE $CONNECTIVITY~CORPNUMBER 1
  :CONNECTIVITY~CONTINUECORPCREATION2
  gosub :BOT~KILLTHETRIGGERS
  send "J"&$CONNECTIVITY~CORPNUMBER&"*"&$BOT~CORPPASSWORD&"* * "
  setvar $CONNECTIVITY~SKIPJOIN 1
end
:CONNECTIVITY~RESUMESTARTAFTERCORPJOIN


if (($MENUS~MOWDESTINATION = 0) or ($MENUS~MOWDESTINATION = "0"))
  setvar $MENUS~MOWDESTINATION ""
end


if ($MENUS~MOWDESTINATION <> "")
  gosub :MOVING
end

if ($CONNECTIVITY~NEWGAME)
  gosub :BOT~KILLTHETRIGGERS
  setvar $CONNECTIVITY~WAIT_FOR_INTERROG FALSE
  if (($BOT~ISCEO = TRUE) and (($BOT~CORPNAME <> "") and ($BOT~CORPPASSWORD <> "")))
    if ($CONNECTIVITY~SKIPJOIN <> TRUE)
      settextlinetrigger 1 :ALREADYCORPED "You may only be on one Corp at a time."
      settexttrigger 2 :CONTINUECORPCREATION "<Create New Corporation>"
      send "*TM"
      pause
      :CONNECTIVITY~CONTINUECORPCREATION
      gosub :BOT~KILLTHETRIGGERS
      send $BOT~CORPNAME&"*Y"&$BOT~CORPPASSWORD&"*Y"
      setvar $CONNECTIVITY~WAIT_FOR_INTERROG TRUE
    else
      goto :ALLDONE
    end
  elseif (($BOT~ISCEO = FALSE) and (($BOT~CORPNAME <> "") and ($BOT~CORPPASSWORD <> "")))
    if ($CONNECTIVITY~SKIPJOIN <> TRUE)
      :CONNECTIVITY~CHECKFORCORP
      send "*TD"
      gosub :PLAYER~QUIKSTATS
      settextlinetrigger 1 :THEREISMYCORP "    "&$BOT~CORPNAME
      settexttrigger 2 :NOCORPTHATNAME "Corporate command ["
      send "L"
      pause
      :CONNECTIVITY~NOCORPTHATNAME
      gosub :BOT~KILLTHETRIGGERS
      echo "[[ Waiting 3 seconds to check for corp again, press [Spacebar] to cancel. ]]*"
      setdelaytrigger 3 :CHECKFORCORP 3000
      settextouttrigger 4 :ALREADYCORPED #32
      pause
      :CONNECTIVITY~THEREISMYCORP
      gosub :BOT~KILLTHETRIGGERS
      getword CURRENTLINE $CONNECTIVITY~CORPNUMBER 1
      :CONNECTIVITY~CONTINUECORPCREATION
      gosub :BOT~KILLTHETRIGGERS
      send "J"&$CONNECTIVITY~CORPNUMBER&"*"&$BOT~CORPPASSWORD&"* * "
      setvar $CONNECTIVITY~WAIT_FOR_INTERROG TRUE
    else
      goto :ALLDONE
    end
  else
    :CONNECTIVITY~ALREADYCORPED
    gosub :BOT~KILLTHETRIGGERS
  end
  if ($CONNECTIVITY~WAIT_FOR_INTERROG = TRUE)
    settextlinetrigger ALLDONE :ALLDONE ": ENDINTERROG"
    pause
  end
  :CONNECTIVITY~ALLDONE
  gosub :BOT~KILLTHETRIGGERS
  gosub :CONNECTIVITY~APPLYPOSTLOGINPREFS



end
if ($MENUS~MOWDESTINATION = "")
  gosub :MOVING
end


return
:CONNECTIVITY~PROMOTENEWGAMESTATE
if ($BOT~NEWGAMEDAY1 = TRUE)
  setvar $BOT~NEWGAMEDAY1 FALSE
  savevar $BOT~NEWGAMEDAY1
  setvar $BOT~NEWGAMEOLDER TRUE
  savevar $BOT~NEWGAMEOLDER
end
return
:CONNECTIVITY~APPLYPOSTLOGINPREFS
setvar $GAMEPREFS~BANK "CONNECTIVITY"
setvar $GAMEPREFS~ANIMATION[$GAMEPREFS~BANK] "OFF"
if (($BOT~SUBSPACE <> 0) and ($BOT~SUBSPACE <> ""))
  setvar $GAMEPREFS~SUBSPACE[$GAMEPREFS~BANK] $BOT~SUBSPACE
end
gosub :GAMEPREFS~SETGAMEPREFS
return
:CONNECTIVITY~MOVING


echo #27 "[30D                        " #27 "[30D"
isnumber $CONNECTIVITY~ISNUMBER $MENUS~MOWDESTINATION
if ($CONNECTIVITY~ISNUMBER and ($BOT~MOWTODOCK or $MENUS~MOWTORYLOS or $MENUS~MOWTOALPHA or $MENUS~MOWTOOTHER or $MENUS~FMOWTODOCK))
  if ($BOT~MOWTODOCK or $MENUS~FMOWTODOCK)
    if (((STARDOCK = 0) or (STARDOCK = "")) and ($MAP~STARDOCK = 0))
      send "v"
      waiton "-=-=-=-  Current "
    end
    if (((STARDOCK = 0) or (STARDOCK = "")) and ($MAP~STARDOCK = 0))
      send "'{" $SWITCHBOARD~BOT_NAME "} - Stardock appears to be hidden in this game. Aborting mow.*"
    else
      if ((STARDOCK <> 0) and (STARDOCK <> ""))
        setvar $MAP~STARDOCK STARDOCK
        savevar $MAP~STARDOCK
      end
      setvar $MENUS~MOWDESTINATION $MAP~STARDOCK
    end
  end
  if ($MENUS~FMOWTODOCK = TRUE)
    setvar $BOT~USER_COMMAND_LINE "fmow "&$MENUS~MOWDESTINATION&" 1 "
  else
    setvar $BOT~USER_COMMAND_LINE "mow "&$MENUS~MOWDESTINATION&" 1 "
  end
  setvar $BOT~PARM1 $MENUS~MOWDESTINATION
  setvar $BOT~PARM2 1
  if ($MENUS~START_MOW_OPTION <> "")
    setvar $BOT~USER_COMMAND_LINE $BOT~USER_COMMAND_LINE&$MENUS~START_MOW_OPTION&" "
    setvar $BOT~PARM3 $MENUS~START_MOW_OPTION
  end
  savevar $BOT~USER_COMMAND_LINE
  savevar $BOT~PARM1
  savevar $BOT~PARM2
  if ($MENUS~START_MOW_OPTION <> "")
    savevar $BOT~PARM3
  end
  setvar $MENUS~START_MOW_OPTION ""
  savevar $MENUS~START_MOW_OPTION
  if ($MENUS~FMOWTODOCK = TRUE)
    load "scripts\"&$BOT~MOMBOT_DIRECTORY&"\modes\grid\fmow.cts"
    seteventtrigger 1 :FMOWENDED "SCRIPT STOPPED" "scripts\"&$BOT~MOMBOT_DIRECTORY&"\modes\grid\fmow.cts"
    pause
    :CONNECTIVITY~FMOWENDED
  else
    load "scripts\"&$BOT~MOMBOT_DIRECTORY&"\modes\grid\mow.cts"
    seteventtrigger 1 :MOWENDED "SCRIPT STOPPED" "scripts\"&$BOT~MOMBOT_DIRECTORY&"\modes\grid\mow.cts"
    pause
    :CONNECTIVITY~MOWENDED
    loadvar $MAP~BACKDOOR
  end
else
  if ($CONNECTIVITY~ISNUMBER and $MENUS~XPORTTOSHIP)
    send "x    "&$MENUS~MOWDESTINATION&"  "
  else
    if ($MENUS~LANDONTERRA = TRUE)
      settexttrigger 1 :LANDED_ON_TERRA "Do you wish to (L)eave or (T)ake Colonists?"
      setdelaytrigger 2 :LANDING_TIMEOUT 5000
      send "l "
      pause
      :CONNECTIVITY~LANDING_TIMEOUT
      killtrigger 2
      send "'{" $SWITCHBOARD~BOT_NAME "} - Could not land on Terra!  Probably not in sector 1.*"
      goto :DONE_LANDING_TERRA
      :CONNECTIVITY~LANDED_ON_TERRA
      killtrigger 1
      send "'{" $SWITCHBOARD~BOT_NAME "} - Safely on Terra.*"
      :CONNECTIVITY~DONE_LANDING_TERRA
    elseif ($MENUS~LANDONSTARDOCK = TRUE)
      settexttrigger 1 :LANDED_ON_STARDOCK "<Shipyards> Your option (?)"
      setdelaytrigger 2 :LANDING_TIMEOUT 5000
      send "pss "
      pause
      :CONNECTIVITY~LANDING_TIMEOUT
      killtrigger 2
      send "'{" $SWITCHBOARD~BOT_NAME "} - Could not land on Stardock!  Probably not in sector.*"
      goto :DONE_LANDING_STARDOCK
      :CONNECTIVITY~LANDED_ON_STARDOCK
      killtrigger 1
      send "'{" $SWITCHBOARD~BOT_NAME "} - Safely on Stardock.*"
      :CONNECTIVITY~DONE_LANDING_STARDOCK
    end
  end
end

if (($MENUS~COMMAND_TO_ISSUE <> "") and ($MENUS~COMMAND_TO_ISSUE <> 0))
  setvar $BOT~USER_COMMAND_LINE $MENUS~COMMAND_TO_ISSUE
  setvar $MENUS~COMMAND_TO_ISSUE ""
  savevar $MENUS~COMMAND_TO_ISSUE
  goto :USER_INTERFACE~RUNUSERCOMMANDLINE
end
return

include "source\include\gameprefs"
include "source\include\user_interface"
include "source\include\player"
include "source\include\bot"
