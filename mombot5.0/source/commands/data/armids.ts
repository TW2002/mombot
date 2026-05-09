logging "OFF"
gosub :LOADVARS~LOADVARS
gosub :HELP~INITIALIZE
loadvar $BOT~ARMID_COUNT_FILE

setvar $HELP~HELP[1] $HELP~TAB&"Refreshes Deployed Armid List"
setvar $HELP~HELP[2] $HELP~TAB&"  - Will show difference since last command was run."
gosub :HELP~HELPFILE

setvar $SWITCHBOARD~MESSAGE "Armid Report starting up!*"
gosub :SWITCHBOARD~SWITCHBOARD

loadvar $ARMID_COUNT_FILE
loadvar $BOT~ARMID_FILE
:ARMIDS



gosub :PLAYER~CURRENTPROMPT
setvar $STARTINGLOCATION $PLAYER~CURRENT_PROMPT
if ($STARTINGLOCATION = "Command")
  goto :START_ARMIDS
elseif ($STARTINGLOCATION = "Citadel")
  send "q"
  gosub :PLANET~GETPLANETINFO
  send "q"
elseif ($STARTINGLOCATION = "Planet")
  gosub :PLANET~GETPLANETINFO
  send "q"
else
  setvar $SWITCHBOARD~MESSAGE "Unknown Prompt*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end
:START_ARMIDS

gosub :PLAYER~TURNOFFANSI
setvar $SWITCHBOARD~MESSAGE "Loading current armid locations. . .*"
gosub :SWITCHBOARD~SWITCHBOARD
fileexists $GFILE_CHK $BOT~ARMID_COUNT_FILE
if ($GFILE_CHK = 1)
  read $BOT~ARMID_COUNT_FILE $PREVIOUSCOUNT 1
else
  setvar $PREVIOUSCOUNT 0
end
gosub :REFRESHARMIDS
gosub :PLAYER~TURNONANSI
setvar $PERCENT (($COUNT * 100) / SECTORS)
setvar $GRIDCHANGE ($COUNT - $PREVIOUSCOUNT)
if ($GRIDCHANGE > 0)
  setvar $GRIDCHANGE "+"&$GRIDCHANGE
end


setvar $PLAYER~LIMPETSGRIDDED TRUE
if (($STARTINGLOCATION = "Citadel") or ($STARTINGLOCATION = "Planet"))
  gosub :PLANET~LANDINGSUB
end
if ($SWITCHBOARD~SELF_COMMAND = FALSE)
  setvar $SWITCHBOARD~SELF_COMMAND 2
end
setvar $SWITCHBOARD~MESSAGE "          - Armid Grid Report -*          - "&$COUNT&" sectors, "&$PERSONALCOUNT&" personal. ("&$PERCENT&"%) ("&$GRIDCHANGE&" Change)**"
gosub :SWITCHBOARD~SWITCHBOARD

halt
:REFRESHARMIDS
gosub :MINES~READARMIDLIST
setvar $COUNT $MINES~COUNT
setvar $PERSONALCOUNT $MINES~PERSONALCOUNT
return

# includes:
include "source\include\mines"
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
