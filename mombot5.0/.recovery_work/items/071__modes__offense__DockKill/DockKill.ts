logging "OFF"
gosub :BOT~LOADVARS


setvar $BOT~HELP[1] $BOT~TAB&"Scans for targets and autokills in sector."
setvar $BOT~HELP[2] $BOT~TAB&"         "
setvar $BOT~HELP[3] $BOT~TAB&"  Options: "
setvar $BOT~HELP[4] $BOT~TAB&"      {off} - Turns off script "
setvar $BOT~HELP[5] $BOT~TAB&"      {pod} - Only shoots pods"
setvar $BOT~HELP[6] $BOT~TAB&"     {meat} - meatgrinder mode"
setvar $BOT~HELP[7] $BOT~TAB&"      {cap} - capture instead of kill"
setvar $BOT~HELP[8] $BOT~TAB&"       {dt} - doubletap mode"
setvar $BOT~HELP[9] $BOT~TAB&"       {sg} - shotgun mode"
setvar $BOT~HELP[10] $BOT~TAB&" {defender} - pops a planet before attacking"
gosub :BOT~HELPFILE

setvar $BOT~SCRIPT_TITLE "Dock Killer"
gosub :BOT~BANNER
gosub :COMBAT~INIT
setvar $SWITCHBOARD~SELF_COMMAND TRUE


gosub :PLAYER~QUIKSTATS
setvar $STARTINGLOCATION $PLAYER~CURRENT_PROMPT

getwordpos $BOT~USER_COMMAND_LINE $POS "pod"
if ($POS > 0)
  setvar $PODS TRUE
else
  setvar $PODS FALSE
end

getwordpos $BOT~USER_COMMAND_LINE $POS "cap"
if ($POS > 0)
  setvar $CAP TRUE
else
  setvar $CAP FALSE
end

getwordpos $BOT~USER_COMMAND_LINE $POS "meat"
if ($POS > 0)
  setvar $MEATGRIND TRUE
else
  setvar $MEATGRIND FALSE
end

getwordpos $BOT~USER_COMMAND_LINE $POS "def"
if ($POS > 0)
  setvar $COMBAT~DEFENDER TRUE
  if ($PLAYER~GENESIS <= 0)
    setvar $SWITCHBOARD~MESSAGE "You have to have genesis torps to run defender mode.*"
    gosub :SWITCHBOARD~SWITCHBOARD
    halt
  end
else
  setvar $COMBAT~DEFENDER FALSE
end

setvar $PLAYER~TARGETINGPERSON FALSE
if ($PODS)
  setvar $PLAYER~TARGETINGSHIP "Escape Pod"
else
  setvar $PLAYER~TARGETINGSHIP FALSE
end
setvar $PLAYER~TARGETINGCORP FALSE
setvar $PLAYER~TARGET ""
loadvar $SHIP~SHIP_FIGHTERS_MAX
loadvar $SHIP~SHIP_MAX_ATTACK
loadvar $SHIP~MAX_SHIELDS


loadvar $SHIP~CAP_FILE
fileexists $CAP_FILE_CHK $SHIP~CAP_FILE
if ($CAP_FILE_CHK)
  gosub :SHIP~LOADSHIPINFO
else
  gosub :SHIP~GETSHIPCAPSTATS
  gosub :SHIP~LOADSHIPINFO
end

if ($BOT~PARM1 = "off")
  send "'{" $SWITCHBOARD~BOT_NAME "} - Shutting down dockkill..*"
  if ($PLAYER~CURRENT_SECTOR = STARDOCK)
    send "p ss ys *p"
    send "'{" $SWITCHBOARD~BOT_NAME "} - Should be on dock.*"
  end
  if ($PLAYER~CURRENT_SECTOR = 1)
    send "p ty"
    send "'{" $SWITCHBOARD~BOT_NAME "} - Should be on port.*"
  end
  halt
else
  if (($STARTINGLOCATION <> "Command") and ($STARTINGLOCATION <> "<StarDock>"))
    send "'{" $SWITCHBOARD~BOT_NAME "} - Stardock Killer must be run from the Command or StarDock Prompt*"
    halt
  end
  isnumber $TEST $BOT~PARM2
  if ($TEST)
    if ($BOT~PARM2 > 0)
      setvar $TARGETINGCORP TRUE
      setvar $TARGET $BOT~PARM2
    end
  else
    getwordpos $BOT~PARM2 $POS #34
    if ($POS > 0)
      setvar $BOT~USER_COMMAND_LINE $BOT~USER_COMMAND_LINE&" "
      gettext $BOT~USER_COMMAND_LINE $PLAYER~TARGET " "&#34 #34&" "
      if ($PLAYER~TARGET <> "")
        setvar $PLAYER~TARGETINGPERSON TRUE
        lowercase $PLAYER~TARGET
        striptext $BOT~USER_COMMAND_LINE " "&#34&$PLAYER~TARGET&#34&" "
      else
        setvar $PLAYER~TARGETINGPERSON FALSE
      end
    end
  end
  getwordpos $BOT~USER_COMMAND_LINE $POS "dt"
  if ($POS > 0)
    setvar $PLAYER~DOUBLETAP TRUE
  else
    setvar $PLAYER~DOUBLETAP FALSE
  end
  getwordpos $BOT~USER_COMMAND_LINE $POS "sg"
  if ($POS > 0)
    setvar $PLAYER~SHOTGUN TRUE
  else
    setvar $PLAYER~SHOTGUN FALSE
  end
end

if ($SHIP~SHIP_MAX_ATTACK <= 0)
  gosub :SHIP~GETSHIPSTATS
  savevar $SHIP~SHIP_FIGHTERS_MAX
  savevar $SHIP~SHIP_MAX_ATTACK
  savevar $SHIP~MAX_SHIELDS
end

if ($PLAYER~TARGETINGPERSON)
  setvar $SWITCHBOARD~MESSAGE "StarDock Killer Targeting "&$PLAYER~TARGET&" running in sector "&$PLAYER~CURRENT_SECTOR&".*"
elseif ($PLAYER~TARGETINGCORP)
  setvar $SWITCHBOARD~MESSAGE "StarDock Killer Targeting Corp "&$PLAYER~TARGET&" running in sector "&$PLAYER~CURRENT_SECTOR&".*"
else
  setvar $SWITCHBOARD~MESSAGE "StarDock Killer running in sector "&$PLAYER~CURRENT_SECTOR&".*"
end
if ($PLAYER~SHOTGUN)
  setvar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&"    -  Shotgun mode enabled.*"
elseif ($PLAYER~DOUBLETAP)
  setvar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&"    -  Doubletap mode enabled.*"
end
gosub :SWITCHBOARD~SWITCHBOARD

if (($PLAYER~CURRENT_SECTOR = 1) or (PORT.CLASS[$PLAYER~CURRENT_SECTOR] = 0) or ($PLAYER~CURRENT_SECTOR = $MAP~STARDOCK))
  if ($PLAYER~CURRENT_SECTOR = STARDOCK)
    setvar $PLAYER~REFURBSTRING "P  S G Y G Q s p  b  "&$SHIP~SHIP_MAX_ATTACK&"*  b  "&$SHIP~SHIP_MAX_ATTACK&"*  c  "&$SHIP~MAX_SHIELDS&"*  q q q "
    if ($STARTINGLOCATION = "<StarDock>")
      send "s p"
    else
      send "P  S G Y G Q s p"
    end
  else
    setvar $PLAYER~REFURBSTRING "p  t  b "&$SHIP~SHIP_MAX_ATTACK&"* b "&$SHIP~SHIP_MAX_ATTACK&"* c "&$SHIP~MAX_SHIELDS&"* q "
    send "p ty"
  end
  waiton "B  Fighters        :"
  getword CURRENTLINE $FIGSTOBUY 8
  waiton "C  Shield Points   :"
  getword CURRENTLINE $SHIELDSTOBUY 9
  if (($FIGSTOBUY > 0) or ($SHIELDSTOBUY > 0))
    send "b " $FIGSTOBUY "* c " $SHIELDSTOBUY "* "
  end
  gosub :PLAYER~QUIKSTATS
  if ($PLAYER~CURRENT_SECTOR = STARDOCK)
    send "q q q "
  else
    send "q "
  end
  goto :EXECUTE
end
:INAC



gosub :PLAYER~QUIKSTATS
:EXECUTE
setdelaytrigger JUSTWAIT :OKAYGO 50
pause
:OKAYGO
gosub :SECTOR~GETSECTORDATA
if (($PLAYER~CURRENT_SECTOR <= 10) or ($PLAYER~CURRENT_SECTOR = $MAP~STARDOCK))
  setvar $I 1
  while ($I <= $SECTOR~REALTRADERCOUNT)
    setvar $ENEMY_FIGHTERS $PLAYER~TRADERS[$I][4]
    setvar $ENEMY_CORP $PLAYER~TRADERS[$I][2]
    if (($PLAYER~TRADERS[$I][2] = TRUE) and (((($PLAYER~EXPERIENCE > 1000) or ($PLAYER~ALIGNMENT < 0)) and (($ENEMY_FIGHTERS > ($PLAYER~FIGHTERS / 3)) and ($ENEMY_CORP <> $PLAYER~CORP)))))
      setvar $HIDE TRUE
      setvar $SWITCHBOARD~MESSAGE "Hiding on port, because "&$PLAYER~TRADERS[$I]&" is in sector, and I can't touch them. Halting.*"
    end
    add $I 1
  end
end
if ($PLAYER~FIGHTERS < $SHIP~SHIP_FIGHTERS_MAX)
  setvar $HIDE TRUE
  setvar $SWITCHBOARD~MESSAGE "Can't refurb fighters, so I'm halting.*"
end
if ($HIDE = TRUE)
  if ($PLAYER~CURRENT_SECTOR = STARDOCK)
    send "P  S G Y G Q s p"
  else
    send "p ty"
  end
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end

if ($CAP)
  gosub :COMBAT~FASTCAPTURE
else
  gosub :COMBAT~FASTATTACK
end
if (($PLAYER~ISFOUND = TRUE) and ($MEATGRIND = TRUE))
  send $COMBAT~ATTACKSTRING "* " $COMBAT~ATTACKSTRING "* " $COMBAT~ATTACKSTRING "* " $COMBAT~ATTACKSTRING "* " $COMBAT~ATTACKSTRING "* " $COMBAT~ATTACKSTRING "* " $COMBAT~ATTACKSTRING "* " $COMBAT~ATTACKSTRING "* " $COMBAT~ATTACKSTRING "* " $COMBAT~ATTACKSTRING "* " $COMBAT~ATTACKSTRING "* " $COMBAT~ATTACKSTRING "* " $COMBAT~ATTACKSTRING "* " $COMBAT~ATTACKSTRING "* " $COMBAT~ATTACKSTRING "* " $COMBAT~ATTACKSTRING "* "
end
goto :EXECUTE
:DISCOD






setvar $TAGLINE "[Stardock Killer]"
setvar $TAGLINEB "[Stardock Killer]"
killalltriggers
echo "**"&ANSI_14&$TAGLINEB&ANSI_15&" Disconnected **"
:DISCO_TEST
if (CONNECTED <> TRUE)
  setdelaytrigger EMANCIPATE_CPU :EMANCIPATE_CPU 3000
  echo "**"&ANSI_14&$TAGLINEB&ANSI_15&" Auto Resume Initiated - Awaiting Connection!**"
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
  send "'{"&$SWITCHBOARD~BOT_NAME&"} "&$TAGLINEB&" - Restarting!**"
  waitfor "Message sent on sub-space channel"
  goto :INAC
elseif ($PLAYER~CURRENT_PROMPT = "Citadel")
  send "'{"&$SWITCHBOARD~BOT_NAME&"} "&$TAGLINEB&" - Restarting!**"
  waitfor "Message sent on sub-space channel"
  send "qqqq**"
  goto :INAC
else
  send " p d 0* 0* 0* * *** * c q q q q q z 2 2 c q * z * *** * * '"&$TAGLINEB&"Attempting to Reach Correct Prompt...*"
  settextlinetrigger EMQ_COMPLETE :EMQ_DELAY "Attempting to Reach Correct Prompt..."
  setdelaytrigger EMQ_DELAY :EMQ_DELAY 3000
  pause
  :EMQ_DELAY
  killalltriggers
  goto :DISCO_TEST


end
killtrigger DISCOD1
killtrigger DISCOD2
seteventtrigger DISCOD1 :DISCOD "CONNECTION LOST"
seteventtrigger DISCOD2 :DISCOD "Connections have been temporarily disabled."

return

# includes:
include "include/BOT.ts"
include "include/COMBAT.ts"
include "include/PLAYER.ts"
include "include/SECTOR.ts"
include "include/SHIP.ts"
