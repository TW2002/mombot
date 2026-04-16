gosub :BOT~LOADVARS

setvar $BOT~HELP[1] $BOT~TAB&"mines - place corporate armids and limpets in sector "
gosub :BOT~HELPFILE
:MINES



gosub :PLAYER~QUIKSTATS

if (($PLAYER~CURRENT_SECTOR = $MAP~STARDOCK) or ($PLAYER~CURRENT_SECTOR <= 10))
  setvar $SWITCHBOARD~MESSAGE "Can't deploy into Fed Space!*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end
setvar $BOT~STARTINGLOCATION $PLAYER~CURRENT_PROMPT
getword $BOT~USER_COMMAND_LINE $BOT~PARM1 1 "NONE"
if ($BOT~PARM1 = "NONE")
  setvar $BOT~PARM1 3
end
setvar $BOT~VALIDPROMPTS "Command Citadel"
gosub :BOT~CHECKSTARTINGPROMPT
if ($BOT~STARTINGLOCATION = "Citadel")
  send "q "
  gosub :PLANET~GETPLANETINFO
  send "c "
end
setvar $PREDEPLOYARMIDS $PLAYER~ARMIDS
setvar $PREDEPLOYLIMPETS $PLAYER~LIMPETS
if ($BOT~STARTINGLOCATION = "Citadel")
  send "s* "
  setvar $START_MAC "q q "
  setvar $END_MAC "l "&$PLANET~PLANET&"* c "
else
  send "** "
  setvar $START_MAC ""
  setvar $END_MAC ""
end
waiton "Warps to Sector(s) :"
setvar $LIMPETOWNER SECTOR.LIMPETS.OWNER[$PLAYER~CURRENT_SECTOR]
setvar $ARMIDOWNER SECTOR.MINES.OWNER[$PLAYER~CURRENT_SECTOR]
if (($PLAYER~ARMIDS <= 0) and (($ARMIDOWNER <> "belong to your Corp") and ($ARMIDOWNER <> "yours")))
  setvar $SWITCHBOARD~MESSAGE "Out of armids!*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
elseif ($BOT~PARM1 > $PLAYER~ARMIDS)
  setvar $BOT~PARM1 $PLAYER~ARMIDS
end
if (($PLAYER~LIMPETS <= 0) and (($LIMPETOWNER <> "belong to your Corp") and ($LIMPETOWNER <> "yours")))
  setvar $SWITCHBOARD~MESSAGE "Out of limpets!*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
elseif ($BOT~PARM1 > $PLAYER~LIMPETS)
  setvar $BOT~PARM1 $PLAYER~LIMPETS
end
send $START_MAC "z n h 2 z " $BOT~PARM1 "*  zc * * h 1 z " $BOT~PARM1 "*  z c * * * " $END_MAC
gosub :PLAYER~QUIKSTATS


if (($PREDEPLOYARMIDS > $PLAYER~ARMIDS) and ($PREDEPLOYLIMPETS > $PLAYER~LIMPETS)) or (($PREDEPLOYLIMPETS = $PLAYER~LIMPETS) and (((($LIMPETOWNER = "belong to your Corp") or ($LIMPETOWNER = "yours")) and ((($PREDEPLOYARMIDS = $PLAYER~ARMIDS) and (($ARMIDOWNER = "belong to your Corp") or ($ARMIDOWNER = "yours")))))))
  setvar $SWITCHBOARD~MESSAGE $BOT~PARM1&" Armid and Limpet mines deployed into the sector!*"
  gosub :SWITCHBOARD~SWITCHBOARD
  setsectorparameter $PLAYER~CURRENT_SECTOR "LIMPSEC" TRUE
  setsectorparameter $PLAYER~CURRENT_SECTOR "MINESEC" TRUE
elseif ($PREDEPLOYARMIDS > $PLAYER~ARMIDS)
  setvar $SWITCHBOARD~MESSAGE $BOT~PARM1&" Armid mine(s) deployed into the sector!*"
  gosub :SWITCHBOARD~SWITCHBOARD
  setsectorparameter $PLAYER~CURRENT_SECTOR "MINESEC" TRUE
elseif ($PREDEPLOYLIMPETS > $PLAYER~LIMPETS)
  setvar $SWITCHBOARD~MESSAGE $BOT~PARM1&" Limpet mine(s) deployed into the sector!*"
  gosub :SWITCHBOARD~SWITCHBOARD
  setsectorparameter $PLAYER~CURRENT_SECTOR "LIMPSEC" TRUE
end
if ($PREDEPLOYARMIDS < $PLAYER~ARMIDS)
  setvar $SWITCHBOARD~MESSAGE ($PLAYER~ARMIDS - $PREDEPLOYARMIDS)&" Armid mines picked up from sector!*"
  gosub :SWITCHBOARD~SWITCHBOARD
elseif (($PREDEPLOYARMIDS = $PLAYER~ARMIDS) and (($ARMIDOWNER <> "belong to your Corp") and ($ARMIDOWNER <> "yours")))
  setvar $SWITCHBOARD~MESSAGE "Enemy armid(s) present in sector, cannot deploy!*"
  gosub :SWITCHBOARD~SWITCHBOARD
end
if ($PREDEPLOYLIMPETS < $PLAYER~LIMPETS)
  setvar $SWITCHBOARD~MESSAGE ($PLAYER~LIMPETS - $PREDEPLOYLIMPETS)&" Limpet mines picked up from sector!*"
  gosub :SWITCHBOARD~SWITCHBOARD
elseif (($PREDEPLOYLIMPETS = $PLAYER~LIMPETS) and (($LIMPETOWNER <> "belong to your Corp") and ($LIMPETOWNER <> "yours")))
  setvar $SWITCHBOARD~MESSAGE "Enemy limpet(s) present in sector, cannot deploy!*"
  gosub :SWITCHBOARD~SWITCHBOARD
end
halt

# includes:
include "source\include\bot"
include "source\include\player"
include "source\include\planet"
