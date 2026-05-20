#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:invader~invader
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
gosub :loadvars~loadvars

setvar $VALID_COMMANDS " pe ped pel pelk pex pxe pxed pxedx pxel pxelk pxex "
getwordpos $VALID_COMMANDS $POS " "&$COMMAND&" "
if ($POS <= 0)
  setvar $SWITCHBOARD~MESSAGE "Invader must be called through one of: pe ped pel pelk pex pxe pxed pxedx pxel pxelk pxex.*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end

killalltriggers
if (($COMMAND = "") or ($COMMAND = 0))
  setvar $COMMAND $BOT~COMMAND_TYPED
  if (($COMMAND = "") or ($COMMAND = 0))
    setvar $COMMAND $BOT~COMMAND
  end
  lowercase $COMMAND
end

setarray $SCAN_ARRAY 1000
gosub :PLAYER~QUIKSTATS
setvar $BOT~STARTINGLOCATION $PLAYER~CURRENT_PROMPT
setvar $BOT~VALIDPROMPTS "Citadel Command"
gosub :PLAYER~CHECKSTARTINGPROMPT
setvar $PLAYER~STARTINGLOCATION $PLAYER~CURRENT_PROMPT
setvar $STARTING_SHIP $PLAYER~SHIP_NUMBER

if ($SHIP~SHIP_MAX_ATTACK <= 0)
  gosub :SHIP~GETSHIPSTATS
end

if ($PLAYER~PHOTONS <= 0)
  setvar $SWITCHBOARD~MESSAGE "This command requires a photon*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end

isnumber $TEST $BOT~PARM2
if ((($TEST = FALSE) or ($BOT~PARM2 = 0)) and (($COMMAND <> "pe") and ($COMMAND <> "ped")))
  setvar $SWITCHBOARD~MESSAGE "Parameter 2 invalid*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end

isnumber $TEST $BOT~PARM3
if (($TEST = FALSE) or ($BOT~PARM3 = 0))
  if ($COMMAND = "pxex")
    setvar $BOT~PARM3 $PLAYER~SHIP_NUMBER
  elseif (($COMMAND = "pxel") or ($COMMAND = "pxelk"))
    setvar $SWITCHBOARD~MESSAGE "Planet Parameter in-valid*"
    gosub :SWITCHBOARD~SWITCHBOARD
    halt
  end
end

isnumber $TEST $BOT~PARM1
if ($TEST = FALSE)
  setvar $SWITCHBOARD~MESSAGE "Sector Parameter invalid*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end
if (($BOT~PARM1 > 10) and (($BOT~PARM1 <= SECTORS) and ($BOT~PARM1 <> $MAP~STARDOCK)))
else
  setvar $SWITCHBOARD~MESSAGE "Invalid attack sector entered*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end

setvar $I 1
setvar $ISFOUND FALSE
while (SECTOR.WARPS[$PLAYER~CURRENT_SECTOR][$I] > 0)
  if (SECTOR.WARPS[$PLAYER~CURRENT_SECTOR][$I] = $BOT~PARM1)
    setvar $ISFOUND TRUE
  end
  add $I 1
end
if ($ISFOUND = FALSE)
  setvar $SWITCHBOARD~MESSAGE "Cannot continue.  Sector not Adjacent, aborting..*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end
getwordpos " "&$BOT~USER_COMMAND_LINE&" " $POS "speed"
if ($POS > 0)
  setvar $SPEED TRUE
else
  setvar $SPEED FALSE
end

send " c v * y * "&$BOT~PARM1&"*  "

if ($PLAYER~STARTINGLOCATION = "Citadel")
  if ($PLAYER~CREDITS > 0)
    send "t t"&$PLAYER~CREDITS&"* "
  end
  send " q  q"
  gosub :PLANET~GETPLANETINFO
  send "  C C  "
end
setvar $ENTER "m  "&$BOT~PARM1&"*"
setvar $XPORT "x   "&$BOT~PARM2&"*  q  z  n  "
setvar $XPORT_BACK "x   "&$STARTING_SHIP&"*  q  z  n  "
setvar $PHOTON "  p y"&$BOT~PARM1&"*  q  "

setvar $XPORT_COMMANDS " pxe pxed pxedx pxel pxelk pxex "
getwordpos $XPORT_COMMANDS $POS " "&$COMMAND&" "
if ($POS > 0)
  setvar $SPEED_INVADE_MACRO $XPORT&$ENTER&"       * "
  setvar $NORMAL_INVADE_MACRO $XPORT&$ENTER&"** "
else
  setvar $SPEED_INVADE_MACRO $ENTER&"     *  "
  setvar $NORMAL_INVADE_MACRO $ENTER&"*            "
end

if ($PLAYER~STARTINGLOCATION = "Citadel")
  setvar $MAC_STARTING $PHOTON&"q  q  "
else
  setvar $MAC_STARTING $PHOTON&"  "
end
if ($COMMAND = "pxex")
  setvar $MAC_ENDING "x   "&$BOT~PARM3&"*  q  q  z  n"
  setvar $ENDS_IN_SECTOR TRUE
elseif ($COMMAND = "pex")
  setvar $MAC_ENDING "x    "&$BOT~PARM2&"*  q  q  *  z  n  *  "
  setvar $ENDS_IN_SECTOR TRUE
elseif ($COMMAND = "pel")
  setvar $MAC_ENDING "l "&$BOT~PARM2&"*  *"
  setvar $ENDS_IN_SECTOR FALSE
elseif ($COMMAND = "pxel")
  setvar $MAC_ENDING "l "&$BOT~PARM3&"*  *  "
  setvar $ENDS_IN_SECTOR FALSE
elseif ($COMMAND = "pxelk")
  setvar $MAC_ENDING "l "&$BOT~PARM3&"*  *  a"&$SHIP~SHIP_MAX_ATTACK&"*"
  setvar $ENDS_IN_SECTOR FALSE
elseif ($COMMAND = "pelk")
  setvar $MAC_ENDING "l "&$BOT~PARM2&"*  *  a"&$SHIP~SHIP_MAX_ATTACK&"*"
  setvar $ENDS_IN_SECTOR FALSE
elseif (($COMMAND = "pxed") or ($COMMAND = "ped"))
  setvar $MAC_ENDING "u  y  n  . *  j  c  *  "
  setvar $ENDS_IN_SECTOR FALSE
elseif (($COMMAND = "pxedx") or ($COMMAND = "pedx"))
  setvar $MAC_ENDING "u  y  n  . *  j  c  *  "&$XPORT_BACK
  setvar $ENDS_IN_SECTOR TRUE
else
  setvar $MAC_ENDING ""
  setvar $ENDS_IN_SECTOR FALSE
end
if (($PLAYER~STARTINGLOCATION = "Citadel") and ($ENDS_IN_SECTOR = TRUE))
  setvar $MAC_ENDING $MAC_ENDING&"l "&$PLANET~PLANET&" * c"
end
setvar $MAC_ENDING $MAC_ENDING&"@"

send "  t"
waitfor ", 2"
getword CURRENTLINE $INITTIME 1
:PHOTON_ATTACK_TIMER
send "  t"
waitfor ", 2"
getword CURRENTLINE $CURRENTTIME 1
waitfor "Computer"
if ($INITTIME <> $CURRENTTIME)
  if ($SPEED = TRUE)
    send $MAC_STARTING&$SPEED_INVADE_MACRO&$MAC_ENDING
  else
    send $MAC_STARTING&$NORMAL_INVADE_MACRO&$MAC_ENDING
  end
else
  goto :PHOTON_ATTACK_TIMER
end

if ($SPEED = FALSE)
  setvar $I 1
  settextlinetrigger DAMAGE :INVADER~COLLECT_DAMAGE "The console reports damages of "
  settextlinetrigger DAMAGE_DONE :INVADER~DAMAGE_DONE "Average Interval Lag:"
  settextlinetrigger DAMAGE_POD :INVADER~COLLECT_POD "You rush to an escape pod and abandon"
  settextlinetrigger DEATH :INVADER~COLLECT_DEATH "You will have to start"
  pause
  :INVADER~COLLECT_DAMAGE
  setvar $SCAN_ARRAY[$I] CURRENTLINE
  add $I 1
  settextlinetrigger DAMAGE :INVADER~COLLECT_DAMAGE "The console reports damages of "
  pause
  :INVADER~COLLECT_POD
  setvar $SCAN_ARRAY[$I] CURRENTLINE
  add $I 1
  :INVADER~DAMAGE_DONE
  killalltriggers
  if ($I > 1)
    setvar $J 1
    send "'*"
    settextlinetrigger COMM :INVADER~CONTINUEDAMAGE "Comm-link open on sub-space band"
    pause
    :INVADER~CONTINUEDAMAGE
    while ($J < $I)
      send $SCAN_ARRAY[$J]&"*"
      add $J 1
    end
    send "*"
    settextlinetrigger COMM2 :INVADER~CONTINUEDAMAGE2 "Sub-space comm-link terminated"
    pause
    :INVADER~CONTINUEDAMAGE2
  end
  :INVADER~COLLECT_DEATH
  killalltriggers
  halt
end
halt

# includes:
include "source\include\planet"
include "source\include\ship"
include "source\include\loadvars"
include "source\include\switchboard.ts"
