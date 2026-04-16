logging "OFF"
gosub :BOT~LOADVARS
loadvar $BOT~ARMID_COUNT_FILE

setvar $BOT~HELP[1] $BOT~TAB&"Refreshes Deployed Armid List"
setvar $BOT~HELP[2] $BOT~TAB&"  - Will show difference since last command was run."
gosub :BOT~HELPFILE

setvar $BOT~SCRIPT_TITLE "Armid Report"
gosub :BOT~BANNER

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



setarray $PMINES SECTORS
:READARMIDLIST
setvar $COUNT 0
setvar $PERSONALCOUNT 0
send "k1"
setvar $I 1
setvar $LIMPETOUTPUT ""
setvar $PERSONALOUTPUT " "
setvar $OUTPUT " "
:KEEPCOUNTINGARMIDS
killtrigger CORPORATE
killtrigger PERSONAL
killtrigger DONECOUNTINGFIGS
killtrigger DONENOFIGS
settextlinetrigger CORPORATE :CORPCOUNTARMIDS " Corp"
settextlinetrigger PERSONAL :PERSONALCOUNTARMIDS "Personal "
settextlinetrigger DONECOUNTINGFIGS :DONECOUNTINGARMIDS "Total"
settextlinetrigger DONENOFIGS :DONECOUNTINGARMIDS "No mines deployed"
pause
:PERSONALCOUNTARMIDS
add $COUNT 1
add $PERSONALCOUNT 1
getword CURRENTLINE $SECTOR 1
getword CURRENTLINE $NUMMINES 2
setvar $PERSONALOUTPUT $PERSONALOUTPUT&$SECTOR&"  "
setvar $PMINES[$SECTOR] $NUMMINES
settextlinetrigger PERSONAL :PERSONALCOUNTARMIDS "Personal "
pause
:CORPCOUNTARMIDS
add $COUNT 1
add $PLAYER~CORPCOUNT 1
getword CURRENTLINE $SECTOR 1
getword CURRENTLINE $NUMMINES 2
while ($I <= $SECTOR)
  getwordpos $PERSONALOUTPUT $POS " "&$I&" "
  if (($SECTOR = $I) or ($POS > 0))
    if ($POS > 0)
      setvar $OUTPUT $OUTPUT&$PMINES[$I]&"*"
    else
      setvar $OUTPUT $OUTPUT&$NUMMINES&"*"
    end
    setsectorparameter $I "MINESEC" TRUE
  else
    setvar $OUTPUT $OUTPUT&"0*"
    setsectorparameter $I "MINESEC" FALSE
  end
  add $I 1
end
settextlinetrigger CORPORATE :CORPCOUNTARMIDS " Corp"
pause
:DONECOUNTINGARMIDS

killtrigger CORPORATE
killtrigger PERSONAL
killtrigger DONECOUNTINGFIGS
killtrigger DONENOFIGS

while ($I <= SECTORS)
  getwordpos $PERSONALOUTPUT $POS " "&$I&" "
  if ($POS > 0)
    setvar $OUTPUT $OUTPUT&$NUMMINES&"*"
    setsectorparameter $I "MINESEC" TRUE
  else
    setvar $OUTPUT $OUTPUT&"0*"
    setsectorparameter $I "MINESEC" FALSE
  end
  add $I 1
end
delete $BOT~ARMID_FILE
write $BOT~ARMID_FILE $OUTPUT
delete $BOT~ARMID_COUNT_FILE
write $BOT~ARMID_COUNT_FILE $COUNT
return

# includes:
include "include/BOT.ts"
include "include/BOT_2/BOT.ts"
include "include/BOT_3/BOT.ts"
include "include/BOT_4/BOT.ts"
include "include/SWITCHBOARD.ts"
include "include/BOT_5/BOT.ts"
include "include/BOT_6/BOT.ts"
include "include/PLAYER.ts"
include "include/PLANET.ts"
include "include/PLAYER_2/PLAYER.ts"
include "include/PLAYER_3/PLAYER.ts"
include "include/PLANET_2/PLANET.ts"
