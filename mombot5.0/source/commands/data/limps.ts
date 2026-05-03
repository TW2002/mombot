logging "OFF"
gosub :LOADVARS~LOADVARS
gosub :HELP~INITIALIZE
loadvar $BOT~LIMP_COUNT_FILE

setvar $HELP~HELP[1] $HELP~TAB&"Refreshes Deployed Limpet List"
setvar $HELP~HELP[2] $HELP~TAB&"  - Will show difference since last command was run."
gosub :HELP~HELPFILE

setvar $SWITCHBOARD~MESSAGE "Limpet Report starting up!*"
gosub :SWITCHBOARD~SWITCHBOARD

loadvar $LIMP_COUNT_FILE
loadvar $BOT~LIMP_FILE
:LIMPS



gosub :PLAYER~CURRENTPROMPT
setvar $STARTINGLOCATION $PLAYER~CURRENT_PROMPT
if ($STARTINGLOCATION = "Command")
  goto :START_LIMPS
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
:START_LIMPS

gosub :PLAYER~TURNOFFANSI
setvar $SWITCHBOARD~MESSAGE "Loading current limpet locations. . .*"
gosub :SWITCHBOARD~SWITCHBOARD
fileexists $GFILE_CHK $BOT~LIMP_COUNT_FILE
if ($GFILE_CHK = 1)
  read $BOT~LIMP_COUNT_FILE $PREVIOUSCOUNT 1
else
  setvar $PREVIOUSCOUNT 0
end
gosub :REFRESHLIMPS
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
setvar $SWITCHBOARD~MESSAGE "          - Limpet Grid Report -*          - "&$COUNT&" sectors, "&$PERSONALCOUNT&" personal. ("&$PERCENT&"%) ("&$GRIDCHANGE&" Change)*          - Activated  Limpet  Scan*            *             Sector    Personal/Corp*            ========================*"&$LIMPETOUTPUT&"*"
gosub :SWITCHBOARD~SWITCHBOARD

halt
:REFRESHLIMPS



setarray $PLIMPS SECTORS
:READLIMPLIST

setvar $COUNT 0
setvar $PERSONALCOUNT 0
send "k2"
setvar $I 1
setvar $LIMPETOUTPUT ""
setvar $PERSONALOUTPUT " "
setvar $OUTPUT " "
:KEEPCOUNTINGLIMPS
killtrigger CORPORATE
killtrigger PERSONAL
killtrigger DONECOUNTINGFIGS
killtrigger DONENOFIGS
settextlinetrigger CORPORATE :CORPCOUNTLIMPS " Corp"
settextlinetrigger PERSONAL :PERSONALCOUNTLIMPS "Personal "
settextlinetrigger DONECOUNTINGFIGS :DONECOUNTINGLIMPS "Total"
settextlinetrigger DONENOFIGS :DONECOUNTINGLIMPS "No Limpet mines deployed"
pause
:PERSONALCOUNTLIMPS
add $COUNT 1
add $PERSONALCOUNT 1
getword CURRENTLINE $SECTOR 1
getword CURRENTLINE $NUMMINES 2
setvar $PERSONALOUTPUT $PERSONALOUTPUT&$SECTOR&"  "
setvar $PLIMPS[$SECTOR] $NUMMINES
settextlinetrigger PERSONAL :PERSONALCOUNTLIMPS "Personal "
pause
:CORPCOUNTLIMPS
add $COUNT 1
add $PLAYER~CORPCOUNT 1
getword CURRENTLINE $SECTOR 1
getword CURRENTLINE $NUMMINES 2
while ($I <= $SECTOR)
  getwordpos $PERSONALOUTPUT $POS " "&$I&" "
  if (($SECTOR = $I) or ($POS > 0))
    if ($POS > 0)
      setvar $OUTPUT $OUTPUT&$PLIMPS[$I]&"*"
    else
      setvar $OUTPUT $OUTPUT&$NUMMINES&"*"
    end
    setsectorparameter $I "LIMPSEC" TRUE
  else
    setvar $OUTPUT $OUTPUT&"0*"
    setsectorparameter $I "LIMPSEC" FALSE
  end
  add $I 1
end
settextlinetrigger CORPORATE :CORPCOUNTLIMPS " Corp"
pause
:DONECOUNTINGLIMPS

killtrigger CORPORATE
killtrigger PERSONAL
killtrigger DONECOUNTINGFIGS
killtrigger DONENOFIGS
settexttrigger CHECKLIMPS :CHECKMARKEDLIMPS "Activated  Limpet  Scan"
pause
:CHECKMARKEDLIMPS
settextlinetrigger DONECHECKING :DONECHECKINGLIMPS "Total"
settextlinetrigger DONECHECKINGTOO :DONECHECKINGLIMPS "No Active Limpet mines detected"
settextlinetrigger CORPORATE :MARKLIMPET " Corp"
settextlinetrigger PERSONAL :MARKLIMPET "Personal "
pause
:MARKLIMPET

killtrigger CORPORATE
killtrigger PERSONAL
setvar $TEMP CURRENTLINE
striptext $TEMP #42
setvar $LIMPETOUTPUT $LIMPETOUTPUT&"             "&$TEMP&"*"
killtrigger UNFREEZINGTRIGGER
setdelaytrigger UNFREEZINGTRIGGER :UNFREEZEBOT 10000
settextlinetrigger CORPORATE :MARKLIMPET " Corp"
settextlinetrigger PERSONAL :MARKLIMPET "Personal "
pause
:DONECHECKINGLIMPS
killtrigger DONECHECKING
killtrigger DONECHECKINGTOO
while ($I <= SECTORS)
  getwordpos $PERSONALOUTPUT $POS " "&$I&" "
  if ($POS > 0)
    setvar $OUTPUT $OUTPUT&$NUMMINES&"*"
    setsectorparameter $I "LIMPSEC" TRUE
  else
    setvar $OUTPUT $OUTPUT&"0*"
    setsectorparameter $I "LIMPSEC" FALSE
  end
  add $I 1
end
delete $BOT~LIMP_FILE
write $BOT~LIMP_FILE $OUTPUT
delete $BOT~LIMP_COUNT_FILE
write $BOT~LIMP_COUNT_FILE $COUNT
return

:unfreezebot
echo "*Bot timed out, unfreezing..*"
setDeafClients false
setvar $switchboard~message "Bot frozen for over 100 seconds, resetting...*"
gosub :switchboard~switchboard
halt

# includes:
include "source\include\planet"
include "source\include\player"
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard"
