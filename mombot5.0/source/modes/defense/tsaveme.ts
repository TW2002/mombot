loadvar $USER_COMMAND_LINE
loadvar $PARM1
loadvar $PARM2
loadvar $PARM3
loadvar $PARM4
loadvar $PARM5
loadvar $PARM6
loadvar $PARM7
loadvar $PARM8
loadvar $BOT_NAME
:START


gosub :PLAYER~QUIKSTATS
setvar $LOCATION $PLAYER~CURRENT_PROMPT
if (($LOCATION <> "Command") and ($LOCATION <> "Citadel"))
  setvar $switchboard~message "T-warp Saveme must be run from the Command or Citadel Prompt*"
  gosub :switchboard~switchboard
  halt
end
:TYPE
if ($LOCATION = "Command")
  setvar $TYPE "TWarp"
  setvar $SECTOR $PLAYER~CURRENT_SECTOR
elseif ($LOCATION = "Citadel")
  setvar $TYPE "BWarp"
  send "qd"
  waitfor "Planet #"
  getword CURRENTLINE $PLANET 2
  striptext $PLANET "#"
  send " t n l 1* t n l 2* t n l 3* s n l 1* s n l 2* s n l 3* t n t 1* c s* "
  setvar $SECTOR $PLAYER~CURRENT_SECTOR
end


setvar $TSAVEME_SCRUB $PARM1


isnumber $NUMBER $TSAVEME_SCRUB
if (($NUMBER < 1) or ($TSAVEME_SCRUB = "") or ($TSAVEME_SCRUB = 0))
  setvar $SCRUB $SECTOR
else
  setvar $SCRUB $TSAVEME_SCRUB
end

setvar $switchboard~message "" $TYPE " Saveme Active - Awaiting Distress Call. Returns to: "&$SCRUB&"*"
gosub :switchboard~switchboard
:MAIN

settextlinetrigger TRIGGER :TRIGGER "=saveme"
pause
:TRIGGER

cuttext CURRENTLINE $SPOOF 1 1
if ($SPOOF <> "R")
  goto :MAIN
end
gettext CURRENTLINE $LINE "R" "=saveme"
cuttext $LINE $CORPY 2 6
striptext $LINE $CORPY
striptext $LINE "R"
striptext $LINE "=saveme"
striptext $LINE " "
setvar $SAVESEC $LINE
setvar $POS1 5
:POS_LOOP
cuttext $CORPY $BLANK_CK $POS1 1
if ($BLANK_CK = " ")
  cuttext $CORPY $CORPY 1 $POS1
  subtract $POS1 1
  setvar $CHECK2 1
  goto :POS_LOOP
end
if ($CHECK2 = 1)
  cuttext $CORPY $CORPY 1 $POS1
end
:CUT_ZERO

striptext $SAVESEC " "
cuttext $SAVESEC $ZERO_CK 1 1
if ($ZERO_CK = 0)
  cuttext $SAVESEC $SAVESEC 2 5
  goto :CUT_ZERO
end
:SAVE_EM

if ($TYPE = "TWarp")
  setvar $TWARP_SECTOR $SAVESEC
  setvar $GO 1
  goto :TWARP
elseif ($TYPE = "BWarp")
  setvar $BWARP_SECTOR $SAVESEC
  setvar $GO 1
  goto :BWARP
end
:GO1
send "f"
settextlinetrigger TOTAL_FIGS :TOTAL_FIGS "fighters available."
settextlinetrigger SEC_FIGS :SEC_FIGS "Your ship can support up to"
pause
:TOTAL_FIGS

getword CURRENTLINE $TOTAL_FIGS 3
striptext $TOTAL_FIGS ","
pause
:SEC_FIGS

getword CURRENTLINE $SEC_FIGS 10
striptext $SEC_FIGS ","
if ($TOTAL_FIGS <= 50000)
  send $TOTAL_FIGS "*cdzn"
else
  send "50000*cd*"
end
send "tfyf"
settextlinetrigger CORPY_FIGS :CORPY_FIGS "fighters, and"
pause
:CORPY_FIGS

setvar $CURRENT_LINE CURRENTLINE

setvar $KEY_IDX 1
while ($KEY_IDX <= 20)
  getword $CURRENT_LINE $WORDY $KEY_IDX
  if ($WORDY = "has")
    setvar $FTR_WORD ($KEY_IDX + 1)
    goto :GOT_WORD_NUM
  end
  add $KEY_IDX 1
end
:GOT_WORD_NUM

getword $CURRENT_LINE $CORPY_FIGS $FTR_WORD
striptext $CORPY_FIGS "."
striptext $CORPY_FIGS ","

send $CORPY_FIGS "*qzn"
send "wy" $CORPY "*y*zn"
send "tfyt" $CORPY_FIGS "*qzn"
send "f"
if ($SEC_FIGS > 1)
  send $SEC_FIGS
else
  send 1
end
send "*c d z n "
:GO_SCRUB

setvar $TWARP_SECTOR $SCRUB
setvar $GO 2
goto :TWARP
:TWARP



send "m" $TWARP_SECTOR "*y"
waitfor "To which Sector"
settextlinetrigger TWARP_LOCK :TWARP_LOCK "TransWarp Locked"
settextlinetrigger NO_TWRP_LOCK :NO_TWARP_LOCK "No locating beam found"
settextlinetrigger TWARP_ADJ :TWARP_ADJ "<Set NavPoint>"
settextlinetrigger NO_ORE :NO_ORE "You do not have enough Fuel Ore"
pause
:NO_ORE


send "'OZ " $TYPE " Saveme - No ore!!*"
halt
:TWARP_ADJ


send "**"
killalltriggers
if ($GO = 1)
  goto :GO1
elseif ($GO = 2)
  goto :GO2
end
:TWARP_LOCK

killalltriggers
send "y*"
waitfor "Warps to Sector(s)"
if ($GO = 1)
  goto :GO1
elseif ($GO = 2)
  goto :GO2
end
:NO_TWARP_LOCK

killalltriggers
send "n*"
send "'OZ " $TYPE " Saveme - Can't Get Lock! - Fig and Call Save!*"
goto :MAIN
:BWARP


send "b" $BWARP_SECTOR "*"
settextlinetrigger BEAM_LOCK :BEAM_LOCK "TransWarp Locked"
settextlinetrigger NO_BEAM_LOCK :NO_BEAM_LOCK "No locating beam found"
pause
:BEAM_LOCK
killalltriggers
send "y*"
waitfor "Warps to Sector(s)"
if ($GO = 1)
  goto :GO1
elseif ($GO = 2)
  goto :GO2
end
:NO_BEAM_LOCK

killalltriggers
send "n*"
setvar $switchboard~message "" $TYPE " Saveme - Can't Get Lock! - Fig and Call Save!*"
gosub :switchboard~switchboard
goto :MAIN
:GO2


send " w * * z q n z q n "
gosub :PLAYER~QUIKSTATS
if ($TYPE = "BWarp")
  settextlinetrigger NOT_AT_HOME :EXIT_COMPLETELY "That planet is not in this sector."
  send " l "&$PLANET&"*"
  waitfor "Landing sequence engaged..."
  send " t n l 1* t n l 2* t n l 3* s n l 1* s n l 2* s n l 3* t n t 1* c s* "
  if ($PLAYER~CURRENT_SECTOR = $SECTOR)
    setvar $switchboard~message "" $TYPE " Saveme - Arrived at Return Sector. Ready for another save.*"
    gosub :switchboard~switchboard
  end
  goto :MAIN
else
  if ($TSAVEME_SCRUB = $PLAYER~CURRENT_SECTOR)
    setvar $switchboard~message "" $TYPE " Saveme - Arrived at Scrub Sector.*"
    gosub :switchboard~switchboard
    setvar $switchboard~message "" $TYPE " Saveme - Please Exit/Enter to Remove Limpet.*"
    gosub :switchboard~switchboard
  end
  setvar $switchboard~message "" $TYPE " Saveme - Powering Down...*"
  gosub :switchboard~switchboard
  send "**"
  halt
end
halt
:EXIT_COMPLETELY

setvar $switchboard~message "" $TYPE " Saveme - Arrived at Scrub Sector.*"
gosub :switchboard~switchboard
setvar $switchboard~message "" $TYPE " Saveme - Please Exit/Enter to Remove Limpet.*"
gosub :switchboard~switchboard
setvar $switchboard~message "Saveme - Powering Down...*"
gosub :switchboard~switchboard
send "**"
halt
include "source\include\player"
include "source\include\switchboard.ts"
