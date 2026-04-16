gosub :BOT~LOADVARS

setvar $BOT~HELP[1] $BOT~TAB&"HAZKILL - Remove NavHaz Command"
setvar $BOT~HELP[2] $BOT~TAB&"          Scans Current-Sector and launches Genesis Torpedos"
setvar $BOT~HELP[3] $BOT~TAB&"          to removes any NavHaz"
gosub :BOT~HELPFILE
:HAZKILL




setvar $PNAME "M()M - NAV HAZ KiLLA!"
gosub :PLAYER~QUIKSTATS
setvar $STARTINGLOCATION $PLAYER~CURRENT_PROMPT
if (($STARTINGLOCATION <> "Command") and ($STARTINGLOCATION <> "Citadel"))
  setvar $SWITCHBOARD~MESSAGE "Please Start from Command or Citadel Prompts!*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end
if ($PLAYER~GENESIS <= 0)
  setvar $SWITCHBOARD~MESSAGE "No Genesis Torps On Hand.*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end
if ($STARTINGLOCATION = "Citadel")
  send "Q"
  gosub :PLANET~GETPLANETINFO
  send "  Q  "
  waitfor "Command [TL="
end
send "*"
waitfor "(?="
setvar $HAZ SECTOR.NAVHAZ[$PLAYER~CURRENT_SECTOR]
if ($HAZ <= 10)
  setvar $2BPOPPED 1
elseif ($HAZ <= 20)
  setvar $2BPOPPED 2
elseif ($HAZ <= 30)
  setvar $2BPOPPED 3
elseif ($HAZ <= 40)
  setvar $2BPOPPED 4
elseif ($HAZ <= 50)
  setvar $2BPOPPED 5
elseif ($HAZ <= 60)
  setvar $2BPOPPED 6
elseif ($HAZ <= 70)
  setvar $2BPOPPED 7
elseif ($HAZ <= 80)
  setvar $2BPOPPED 8
elseif ($HAZ <= 90)
  setvar $2BPOPPED 9
else
  setvar $2BPOPPED 10
end
if ($2BPOPPED > $PLAYER~GENESIS)
  setvar $SWITCHBOARD~MESSAGE "Short "&($2BPOPPED - $PLAYER~GENESIS)&" Genesis Torps.*"
  gosub :SWITCHBOARD~SWITCHBOARD
  setvar $2BPOPPED $PLAYER~GENESIS
  waitfor "Message sent on sub-space"
end
while ($2BPOPPED > 0)
  send "U Y "
  settextlinetrigger PLANETNAME :PLANETNAME "What do you want to name this planet?"
  settexttrigger OVERRIDE :OVERRIDE "Do you wish to abort?"
  pause
  :OVERRIDE
  send "N "
  pause
  :PLANETNAME
  killtrigger PLANETNAME
  killtrigger OVERRIDE
  send $PNAME&"* Z  C * "
  subtract $2BPOPPED 1
end
if ($STARTINGLOCATION = "Citadel")
  send " L "&$PLANET~PLANET&"* C "
end
setvar $SWITCHBOARD~MESSAGE "Nav Haz Killa Complete!*"
gosub :SWITCHBOARD~SWITCHBOARD

halt

# includes:
include "include/BOT.ts"
include "include/PLAYER.ts"
include "include/PLANET.ts"
