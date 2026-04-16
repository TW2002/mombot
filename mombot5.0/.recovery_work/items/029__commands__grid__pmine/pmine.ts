gosub :BOT~LOADVARS

setvar $BOT~HELP[1] $BOT~TAB&"pmine - place personal armids in sector"
gosub :BOT~HELPFILE
:PMINE


setvar $ARMID "p"
goto :_MINE
:CMINE
:MINE
setvar $ARMID "c"
goto :_MINE
:_MINE
gosub :MINEPROTECTIONS
if ($BOT~PARM1 > $PLAYER~ARMIDS)
  setvar $BOT~PARM1 $PLAYER~ARMIDS
end
:_CMINE
killalltriggers
if ($PLAYER~ARMIDS <= 0)
  setvar $SWITCHBOARD~MESSAGE "Out of Armid Mines!*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end
if ($PLAYER~STARTINGLOCATION = "Citadel")
  send "q q z n h1 z " $BOT~PARM1 "*  z" $ARMID " z n n  *l " $PLANET~PLANET "* c"
else
  send "z n h1 z " $BOT~PARM1 "*  z" $ARMID " z n"
end
settextlinetrigger TOOMANYPL :TOOMANY_MINE "!  You are limited to "
settextlinetrigger PLCLEAR :PLCLEAR_MINE "Done. You have "
settextlinetrigger ENEMYPL :NOPERDOWN_MINE "These mines are not under your control."
settextlinetrigger NOTENOUGH :TOOMANY_MINE "You don't have that many mines available."
pause
:PLCLEAR_MINE
killalltriggers
setvar $ISMINED TRUE
if ($PLAYER~STARTINGLOCATION = "Citadel")
  waiton "Citadel command (?=help)"
  send "s*"
else
  waiton "Command [TL="
  send "d*"
end
settextlinetrigger PERDOWN :PERDOWN_MINE "(Type 1 Armid) (yours)"
settextlinetrigger CORDOWN :CORDOWN_MINE "(Type 1 Armid) (belong to your Corp)"
settextlinetrigger NOPERDOWN :NOPERDOWN_MINE "Citadel treasury contains"
pause
:CORDOWN_MINE
setvar $SWITCHBOARD~MESSAGE $BOT~PARM1&" Corporate Mines Deployed!*"
gosub :SWITCHBOARD~SWITCHBOARD
goto :DONE_ARMID
:PERDOWN_MINE
setvar $SWITCHBOARD~MESSAGE $BOT~PARM1&" Personal Mines Deployed!*"
gosub :SWITCHBOARD~SWITCHBOARD
goto :DONE_ARMID
:NOPERDOWN_MINE
setvar $SWITCHBOARD~MESSAGE "Sector already has enemy Armid Mines present!*"
gosub :SWITCHBOARD~SWITCHBOARD
setvar $ISMINED FALSE
goto :DONE_ARMID
:TOOMANY_MINE
setvar $SWITCHBOARD~MESSAGE "Too many mines in the sector!*"
gosub :SWITCHBOARD~SWITCHBOARD
:DONE_ARMID
if ($ISMINED)
  setsectorparameter $PLAYER~CURRENT_SECTOR "MINESEC" TRUE
else
  setsectorparameter $PLAYER~CURRENT_SECTOR "MINESEC" FALSE
end
halt
:MINEPROTECTIONS


killalltriggers
gosub :PLAYER~QUIKSTATS
if (($PLAYER~CURRENT_SECTOR < 10) or ($PLAYER~CURRENT_SECTOR = $MAP~STARDOCK))
  setvar $SWITCHBOARD~MESSAGE $BOT~PARM1&" Cannot deploy in FedSpace!*"
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
include "include/BOT.ts"
include "include/BOT_2/BOT.ts"
include "include/BOT_3/BOT.ts"
include "include/BOT_4/BOT.ts"
include "include/SWITCHBOARD.ts"
include "include/BOT_5/BOT.ts"
include "include/PLAYER.ts"
include "include/BOT_6/BOT.ts"
include "include/PLAYER_2/PLAYER.ts"
include "include/PLANET.ts"
