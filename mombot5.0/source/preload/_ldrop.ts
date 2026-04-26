loadvar $BOT_NAME
loadvar $USER_COMMAND_LINE
loadvar $PARM1
loadvar $PARM2
loadvar $PARM3
loadvar $PARM4
loadvar $PARM5
loadvar $PARM6
loadvar $PARM7
loadvar $PARM8
setarray $DROPSECTOR 1000



getwordpos $USER_COMMAND_LINE $POS "direct"
if ($POS > 0)
  setvar $DIRECT TRUE
else
  setvar $DIRECT FALSE
end
:LDROP_START


isnumber $TEST $PARM1
if ($TEST = TRUE)
  setvar $DELAY $PARM1
else
  setvar $DELAY 0
end
gosub :PLAYER~QUIKSTATS
setvar $STARTINGLOCATION $PLAYER~CURRENT_PROMPT
if ($STARTINGLOCATION <> "Citadel")
  send "'{" $BOT_NAME "} - Must start from Citadel*"
  halt
end
send "q"
gosub :PLANET~GETPLANETINFO
send "q"
getwordpos $USER_COMMAND_LINE $POS "kill"
if ($POS > 0)
  setvar $KILL TRUE
  gosub :COMBAT~INIT
else
  setvar $KILL FALSE
end

setvar $HOME $PLAYER~CURRENT_SECTOR
:LDROP_RE_SCAN

setvar $I 0
setvar $R 0
:LDROP_SCAN

killalltriggers
send "q q q * k2"
waitfor "Activated  Limpet  Scan"
settextlinetrigger CORP_LIMP :LDROP_CORP_LIMP "Corporate"
settextlinetrigger PERS_LIMP :LDROP_PERS_LIMP "Personal "
settextlinetrigger NO_LIMP :LDROP_NO_LIMP "No Active Limpet"
settexttrigger LETS_MOVE :LDROP_RE_SCAN "Command [TL="
pause
:LDROP_CORP_LIMP

add $I 1
setvar $TEMP $DROPSECTOR[$I]
getword CURRENTLINE $DROPSECTOR[$I] 1
if ($TEMP <> 0)
  if ($DROPSECTOR[$I] <> $TEMP)
    getsectorparameter $DROPSECTOR[$I] "FIGSEC" $ISFIGGED
    if ($ISFIGGED)
      if ($DIRECT)
        setvar $ADJSEC $DROPSECTOR[$I]
        goto :DROPTOSECTOR
      else
        goto :LDROP_RE_SCAN
      end
    end
    goto :LDROP_LETS_MOVE
  end
end
settextlinetrigger CORP_LIMP :LDROP_CORP_LIMP "Corporate"
pause
:LDROP_PERS_LIMP

add $I 1
setvar $TEMP $DROPSECTOR[$I]
getword CURRENTLINE $DROPSECTOR[$I] 1
if ($TEMP <> 0)
  if ($DROPSECTOR[$I] <> $TEMP)
    getsectorparameter $DROPSECTOR[$I] "FIGSEC" $ISFIGGED
    if ($ISFIGGED)
      if ($DIRECT)
        setvar $ADJSEC $DROPSECTOR[$I]
        goto :DROPTOSECTOR
      else
        goto :LDROP_RE_SCAN
      end
    end
    goto :LDROP_LETS_MOVE
  end
end
settextlinetrigger PERS_LIMP :LDROP_PERS_LIMP "Personal"
pause
:LDROP_NO_LIMP

killalltriggers
goto :LDROP_SCAN
:LDROP_LETS_MOVE

killalltriggers

gosub :LDROP_GET_ADJ
:DROPTOSECTOR
killalltriggers
if ($DELAY > 0)
  setdelaytrigger DELAY_DROP :GO_GO_GO $DELAY
  pause
end
:GO_GO_GO
send "l "&$PLANET~PLANET&"* cp "&$ADJSEC&"*y"
settextlinetrigger NO_FIG :LDROP_NO_FIG "Your own fighters must be in the destination"
settextlinetrigger IN_SECTOR :LDROP_IN_SECTOR "-=-=-=- Planetary TransWarp Drive Engaged! -=-=-=-"
pause
:LDROP_NO_FIG

killtrigger IN_SECTOR
send "'{" $BOT_NAME "} - No Adjacent fig in drop sector*"
goto :LDROP_SCAN
:LDROP_IN_SECTOR

killalltriggers
if ($KILL)
  gosub :SCANITCITKILL
else
  send "s* "
end
halt
:LDROP_RETURN_HOME

send "p "&$HOME&"* "
goto :LDROP_SCAN
:LDROP_GET_ADJ

setvar $ADJSEC 0
setvar $S 1
while (SECTOR.WARPS[$DROPSECTOR[$I]][$S] > 0)
  setvar $CHECKSECTOR SECTOR.WARPS[$DROPSECTOR[$I]][$S]
  getsectorparameter $CHECKSECTOR "FIGSEC" $ISFIGGED
  if ($ISFIGGED)
    setvar $ADJSEC $CHECKSECTOR
    return
  end
  add $S 1
end
goto :LDROP_RE_SCAN

return

:SCANITCITKILL
gosub :PLAYER~QUIKSTATS
setvar $PLAYER~STARTINGLOCATION $PLAYER~CURRENT_PROMPT
gosub :SECTOR~GETSECTORDATA
if ($SECTOR~CORPIECOUNT < $SECTOR~REALTRADERCOUNT)
  gosub :COMBAT~FASTCITADELATTACK
  goto :SCANITCITKILL
end
echo ANSI_12 "*NO Targets*"
return

# includes:
include "source\include\bot"
include "source\include\combat"
include "source\include\player"
include "source\include\ship"
include "source\include\validation"
include "source\include\planet"
include "source\include\sector"
