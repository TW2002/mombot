gosub :LOADVARS~LOADVARS
gosub :HELP~INITIALIZE

	setVar $HELP~HELP[1]   $HELP~TAB&"  invader is a wrapper for the following commands:"
	setVar $HELP~HELP[2]   $HELP~TAB&"  pe, ped, pel, pelk, pex, pxe, pxed, pxedx, pxel, pxelk, pxex"
	setVar $HELP~HELP[3]   $HELP~TAB&"     "
  setVar $HELP~HELP[4]   $HELP~TAB&"  usage:"
	setVar $HELP~HELP[5]   $HELP~TAB&"     "
	setVar $HELP~HELP[6]   $HELP~TAB&"  pe [Sector] - Launch photon into adjacent sector and immediately enter "
	setVar $HELP~HELP[7]   $HELP~TAB&"  ped [Sector] - Launch photon, enter and launch genesis torpedo "
  setVar $HELP~HELP[8]   $HELP~TAB&"  pel [Sector] [Planet#] - Photon, enter and land on planet "
  setVar $HELP~HELP[9]   $HELP~TAB&"  pelk [Sector] [Planet#] - Photon, enter, land and send one wave of fighters "
  setVar $HELP~HELP[10]   $HELP~TAB&"  pex [Sector] [Ship#] - Photon, enter and export to another ship "
  setVar $HELP~HELP[11]   $HELP~TAB&"  pxe [Sector] [Ship#] - Photon, export to another ship and enter "
  setVar $HELP~HELP[12]   $HELP~TAB&"  pxed [Sector] [Ship#] - Photon, export, enter and launch genesis torpedo "
  setVar $HELP~HELP[13]   $HELP~TAB&"  pxel [Sector] [Ship#] [Planet#] - Photon, export, enter and land on planet "
  setVar $HELP~HELP[14]   $HELP~TAB&"  pxelk [Sector] [Ship#] [Planet#] - Photon, export, enter, land and send wave "
  setVar $HELP~HELP[15]   $HELP~TAB&"  pxex [Sector] [Ship#] - Photon, export, enter and export back "
	setVar $HELP~HELP[16]  $HELP~TAB&"     "
	setVar $HELP~HELP[17]   $HELP~TAB&"  Examples:"
	setVar $HELP~HELP[18]  $HELP~TAB&"     "
  setVar $HELP~HELP[19]  $HELP~TAB&"  >pe 24902 "
  setVar $HELP~HELP[20]  $HELP~TAB&"  >pel 24902 15"
  setVar $HELP~HELP[21]  $HELP~TAB&"  >pxel 24902 3 15"
	gosub :HELP~HELPFILE

setvar $INVADER~COMMAND $BOT~COMMAND_TYPED
if (($INVADER~COMMAND = "") or ($INVADER~COMMAND = 0))
  setvar $INVADER~COMMAND $BOT~COMMAND
end
lowercase $INVADER~COMMAND

setvar $INVADER~VALID_COMMANDS " pe ped pel pelk pex pxe pxed pxedx pxel pxelk pxex "
getwordpos $INVADER~VALID_COMMANDS $INVADER~POS " "&$INVADER~COMMAND&" "
if ($INVADER~POS <= 0)
  setvar $SWITCHBOARD~MESSAGE "Invader must be called through one of: pe ped pel pelk pex pxe pxed pxedx pxel pxelk pxex.*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end

killalltriggers
if (($INVADER~COMMAND = "") or ($INVADER~COMMAND = 0))
  setvar $INVADER~COMMAND $BOT~COMMAND_TYPED
  if (($INVADER~COMMAND = "") or ($INVADER~COMMAND = 0))
    setvar $INVADER~COMMAND $BOT~COMMAND
  end
  lowercase $INVADER~COMMAND
end
setarray $INVADER~SCAN_ARRAY 1000
gosub :PLAYER~QUIKSTATS
setvar $BOT~STARTINGLOCATION $PLAYER~CURRENT_PROMPT
setvar $BOT~VALIDPROMPTS "Citadel Command"
gosub :PLAYER~CHECKSTARTINGPROMPT
setvar $PLAYER~STARTINGLOCATION $PLAYER~CURRENT_PROMPT
setvar $INVADER~STARTING_SHIP $PLAYER~SHIP_NUMBER

if ($SHIP~SHIP_MAX_ATTACK <= 0)
  gosub :SHIP~GETSHIPSTATS
end

if ($PLAYER~PHOTONS <= 0)
  setvar $SWITCHBOARD~MESSAGE "This command requires a photon*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end

isnumber $INVADER~TEST $BOT~PARM2
if ((($INVADER~TEST = FALSE) or ($BOT~PARM2 = 0)) and (($INVADER~COMMAND <> "pe") and ($INVADER~COMMAND <> "ped")))
  setvar $SWITCHBOARD~MESSAGE "Parameter 2 invalid*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end

isnumber $INVADER~TEST $BOT~PARM3
if (($INVADER~TEST = FALSE) or ($BOT~PARM3 = 0))
  if ($INVADER~COMMAND = "pxex")
    setvar $BOT~PARM3 $PLAYER~SHIP_NUMBER
  elseif (($INVADER~COMMAND = "pxel") or ($INVADER~COMMAND = "pxelk"))
    setvar $SWITCHBOARD~MESSAGE "Planet Parameter in-valid*"
    gosub :SWITCHBOARD~SWITCHBOARD
    halt
  end
end

isnumber $INVADER~TEST $BOT~PARM1
if ($INVADER~TEST = FALSE)
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

setvar $INVADER~I 1
setvar $INVADER~ISFOUND FALSE
while (SECTOR.WARPS[$PLAYER~CURRENT_SECTOR][$INVADER~I] > 0)
  if (SECTOR.WARPS[$PLAYER~CURRENT_SECTOR][$INVADER~I] = $BOT~PARM1)
    setvar $INVADER~ISFOUND TRUE
  end
  add $INVADER~I 1
end
if ($INVADER~ISFOUND = FALSE)
  setvar $SWITCHBOARD~MESSAGE "Cannot continue.  Sector not Adjacent, aborting..*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end
getwordpos " "&$BOT~USER_COMMAND_LINE&" " $INVADER~POS "speed"
if ($INVADER~POS > 0)
  setvar $INVADER~SPEED TRUE
else
  setvar $INVADER~SPEED FALSE
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
setvar $INVADER~ENTER "m  "&$BOT~PARM1&"*"
setvar $INVADER~XPORT "x   "&$BOT~PARM2&"*  q  z  n  "
setvar $INVADER~XPORT_BACK "x   "&$INVADER~STARTING_SHIP&"*  q  z  n  "
setvar $INVADER~PHOTON "  p y"&$BOT~PARM1&"*  q  "

setvar $INVADER~XPORT_COMMANDS " pxe pxed pxedx pxel pxelk pxex "
getwordpos $INVADER~XPORT_COMMANDS $INVADER~POS " "&$INVADER~COMMAND&" "
if ($INVADER~POS > 0)
  setvar $INVADER~SPEED_INVADE_MACRO $INVADER~XPORT&$INVADER~ENTER&"       * "
  setvar $INVADER~NORMAL_INVADE_MACRO $INVADER~XPORT&$INVADER~ENTER&"** "
else
  setvar $INVADER~SPEED_INVADE_MACRO $INVADER~ENTER&"     *  "
  setvar $INVADER~NORMAL_INVADE_MACRO $INVADER~ENTER&"*            "
end

if ($PLAYER~STARTINGLOCATION = "Citadel")
  setvar $INVADER~MAC_STARTING $INVADER~PHOTON&"q  q  "
else
  setvar $INVADER~MAC_STARTING $INVADER~PHOTON&"  "
end
if ($INVADER~COMMAND = "pxex")
  setvar $INVADER~MAC_ENDING "x   "&$BOT~PARM3&"*  q  q  z  n"
  setvar $INVADER~ENDS_IN_SECTOR TRUE
elseif ($INVADER~COMMAND = "pex")
  setvar $INVADER~MAC_ENDING "x    "&$BOT~PARM2&"*  q  q  *  z  n  *  "
  setvar $INVADER~ENDS_IN_SECTOR TRUE
elseif ($INVADER~COMMAND = "pel")
  setvar $INVADER~MAC_ENDING "l "&$BOT~PARM2&"*  *"
  setvar $INVADER~ENDS_IN_SECTOR FALSE
elseif ($INVADER~COMMAND = "pxel")
  setvar $INVADER~MAC_ENDING "l "&$BOT~PARM3&"*  *  "
  setvar $INVADER~ENDS_IN_SECTOR FALSE
elseif ($INVADER~COMMAND = "pxelk")
  setvar $INVADER~MAC_ENDING "l "&$BOT~PARM3&"*  *  a"&$SHIP~SHIP_MAX_ATTACK&"*"
  setvar $INVADER~ENDS_IN_SECTOR FALSE
elseif ($INVADER~COMMAND = "pelk")
  setvar $INVADER~MAC_ENDING "l "&$BOT~PARM2&"*  *  a"&$SHIP~SHIP_MAX_ATTACK&"*"
  setvar $INVADER~ENDS_IN_SECTOR FALSE
elseif (($INVADER~COMMAND = "pxed") or ($INVADER~COMMAND = "ped"))
  setvar $INVADER~MAC_ENDING "u  y  n  . *  j  c  *  "
  setvar $INVADER~ENDS_IN_SECTOR FALSE
elseif (($INVADER~COMMAND = "pxedx") or ($INVADER~COMMAND = "pedx"))
  setvar $INVADER~MAC_ENDING "u  y  n  . *  j  c  *  "&$INVADER~XPORT_BACK
  setvar $INVADER~ENDS_IN_SECTOR TRUE
else
  setvar $INVADER~MAC_ENDING ""
  setvar $INVADER~ENDS_IN_SECTOR FALSE
end
if (($PLAYER~STARTINGLOCATION = "Citadel") and ($INVADER~ENDS_IN_SECTOR = TRUE))
  setvar $INVADER~MAC_ENDING $INVADER~MAC_ENDING&"l "&$PLANET~PLANET&" * c"
end
setvar $INVADER~MAC_ENDING $INVADER~MAC_ENDING&"@"

send "  t"
waitfor ", 2"
getword CURRENTLINE $INVADER~INITTIME 1
:PHOTON_ATTACK_TIMER
send "  t"
waitfor ", 2"
getword CURRENTLINE $INVADER~CURRENTTIME 1
waitfor "Computer"
if ($INVADER~INITTIME <> $INVADER~CURRENTTIME)
  if ($INVADER~SPEED = TRUE)
    send $INVADER~MAC_STARTING&$INVADER~SPEED_INVADE_MACRO&$INVADER~MAC_ENDING
  else
    send $INVADER~MAC_STARTING&$INVADER~NORMAL_INVADE_MACRO&$INVADER~MAC_ENDING
  end
else
  goto :PHOTON_ATTACK_TIMER
end

if ($INVADER~SPEED = FALSE)
  setvar $INVADER~I 1
  settextlinetrigger DAMAGE :INVADER~COLLECT_DAMAGE "The console reports damages of "
  settextlinetrigger DAMAGE_DONE :INVADER~DAMAGE_DONE "Average Interval Lag:"
  settextlinetrigger DAMAGE_POD :INVADER~COLLECT_POD "You rush to an escape pod and abandon"
  settextlinetrigger DEATH :INVADER~COLLECT_DEATH "You will have to start"
  pause
  :INVADER~COLLECT_DAMAGE
  setvar $INVADER~SCAN_ARRAY[$INVADER~I] CURRENTLINE
  add $INVADER~I 1
  settextlinetrigger DAMAGE :INVADER~COLLECT_DAMAGE "The console reports damages of "
  pause
  :INVADER~COLLECT_POD
  setvar $INVADER~SCAN_ARRAY[$INVADER~I] CURRENTLINE
  add $INVADER~I 1
  :INVADER~DAMAGE_DONE
  killalltriggers
  if ($INVADER~I > 1)
    setvar $INVADER~J 1
    send "'*"
    settextlinetrigger COMM :INVADER~CONTINUEDAMAGE "Comm-link open on sub-space band"
    pause
    :INVADER~CONTINUEDAMAGE
    while ($INVADER~J < $INVADER~I)
      send $INVADER~SCAN_ARRAY[$INVADER~J]&"*"
      add $INVADER~J 1
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
include "source\include\help"
include "source\include\switchboard.ts"
