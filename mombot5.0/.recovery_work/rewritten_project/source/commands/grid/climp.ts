gosub :BOT~LOADVARS

setvar $BOT~HELP[1] $BOT~TAB&"climp - place corporate limpets in sector "
gosub :BOT~HELPFILE
:CLIMP


setvar $LIMP "c"
:_LIMP

gosub :MINEPROTECTIONS
if ($BOT~PARM1 > $PLAYER~LIMPETS)
  setvar $BOT~PARM1 $PLAYER~LIMPETS
end
:PLIMP1
killalltriggers
if ($PLAYER~LIMPETS <= 0)
  setvar $SWITCHBOARD~MESSAGE "Out of limpets!*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end
if ($PLAYER~STARTINGLOCATION = "Citadel")
  send "q q z* h2z" $BOT~PARM1 "* z " $LIMP " z * * *l " $PLANET~PLANET "* c"
elseif ($PLAYER~STARTINGLOCATION = "Command")
  send "z* h2z" $BOT~PARM1 "* z " $LIMP " z * *"
end
settextlinetrigger TOOMANYPL :TOOMANY_LIMP "!  You are limited to "
settextlinetrigger PLCLEAR :PLCLEAR_LIMP "Done. You have "
settextlinetrigger ENEMYPL :NOPERDOWN_LIMP "These mines are not under your control."
settextlinetrigger NOTENOUGH :TOOMANY_LIMP "You don't have that many mines available."
pause
:PLCLEAR_LIMP
killalltriggers
setvar $ISLIMPED TRUE

if ($PLAYER~STARTINGLOCATION = "Citadel")
  waiton "Citadel command (?=help)"
  send "s* "
elseif ($PLAYER~STARTINGLOCATION = "Command")
  send "d* "
end
settextlinetrigger PERDOWN :PERDOWN_LIMP "(Type 2 Limpet) (yours)"
settextlinetrigger CORDOWN :CORDOWN_LIMP "(Type 2 Limpet) (belong to your Corp)"
settextlinetrigger NOPERDOWN :NOPERDOWN_LIMP "Warps to Sector(s) :"
pause
:CORDOWN_LIMP
killalltriggers
setvar $SWITCHBOARD~MESSAGE $BOT~PARM1&" Corporate Limpets Deployed!*"
gosub :SWITCHBOARD~SWITCHBOARD
goto :DONE_LIMP
:PERDOWN_LIMP
killalltriggers
setvar $SWITCHBOARD~MESSAGE $BOT~PARM1&" Personal Limpet Deployed!*"
gosub :SWITCHBOARD~SWITCHBOARD
goto :DONE_LIMP
:NOPERDOWN_LIMP
killalltriggers
setvar $SWITCHBOARD~MESSAGE "Sector already has enemy limpets present!*"
gosub :SWITCHBOARD~SWITCHBOARD
setvar $ISLIMPED FALSE
goto :DONE_LIMP
:TOOMANY_LIMP
setvar $SWITCHBOARD~MESSAGE "Too many mines in the sector!*"
gosub :SWITCHBOARD~SWITCHBOARD
:DONE_LIMP
if ($ISLIMPED)
  setsectorparameter $PLAYER~CURRENT_SECTOR "LIMPSEC" TRUE
else
  setsectorparameter $PLAYER~CURRENT_SECTOR "LIMPSEC" FALSE
end
halt
:MINEPROTECTIONS


killalltriggers
gosub :PLAYER~QUIKSTATS
if (($PLAYER~CURRENT_SECTOR < 10) or ($PLAYER~CURRENT_SECTOR = $MAP~STARDOCK))
  setvar $SWITCHBOARD~MESSAGE "Cannot deploy in FedSpace!*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end
setvar $PLAYER~STARTINGLOCATION $PLAYER~CURRENT_PROMPT
isnumber $TEST $BOT~PARM1
if (($TEST = FALSE) or ($BOT~PARM1 = 0))
  setvar $BOT~PARM1 1
end
setvar $BOT~STARTINGLOCATION $PLAYER~CURRENT_PROMPT
setvar $BOT~VALIDPROMPTS "Command Citadel"
gosub :BOT~CHECKSTARTINGPROMPT
if ($PLAYER~STARTINGLOCATION = "Citadel")
  send "q"
  gosub :PLANET~GETPLANETINFO
  send "c"
end
return

# includes:
include "source\include\BOT"
include "source\include\SWITCHBOARD"
include "source\include\PLAYER"
include "source\include\PLANET"
