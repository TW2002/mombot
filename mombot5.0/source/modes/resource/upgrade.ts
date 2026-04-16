loadvar $PARM1
loadvar $PARM2
loadvar $PARM3
loadvar $PARM4
loadvar $PARM5
loadvar $PARM6
loadvar $PARM7
loadvar $PARM8
:SCRIPTCHECK

listactivescripts $SCRIPTS
listactivescripts $SCRIPTSX
:DUPLICATES
setvar $A 1
:DUPLICATES0
while ($A <= $SCRIPTS)
  setvar $B 1
  lowercase $SCRIPTS[$A]
  lowercase $SCRIPTSX[$A]
  while ($B <= $SCRIPTS)
    if (($A <> $B) and ($SCRIPTS[$A] = $SCRIPTSX[$B]))
      stop $SCRIPTS[$A]
      goto :SCRIPTCHECK
    end
    add $B 1
  end
  add $A 1
end

if ($PARM1 = "help")
  :HELP
  send "'*"
  send "  - upgrade {off/help} {planets to ignores} syntax*"
  send "                                              *"
  send "  - (ex) upgrade on 11 14 15*"
  send "  - Products and Colos must be in sector**"
  waitfor "Sub-space comm-link terminated"
  halt
end
:OFF

if ($PARM1 = "off")
  send "'Upgrade OFF!*"
  halt
end
setdelaytrigger OFF :OFF 1000
send " q q q q r*"
waiton "Command"



cuttext CURRENTLINE $LOCATION 1 12
if ($LOCATION <> "Command [TL=")
  send "'Run Upgrade from Command Prompt!*"
  halt
end

reqrecording
logging "OFF"
loadvar $MASSUPGRADESAVED

setvar $ignorelist $PARM1&$PARM2&" "&$PARM3&" "&$PARM4&" "&$PARM5&" "&$PARM6&" "&$PARM7&" "&$PARM8
setvar $seek 0
gosub :VOIDADJ

setvar $gameprefs~bank "MassUpgrade"
setvar $gameprefs~animation[$gameprefs~bank] "OFF"
setvar $gameprefs~abortdisplayall[$gameprefs~bank] "OFF"
setvar $gameprefs~screenpauses[$gameprefs~bank] "OFF"
gosub :gameprefs~setgameprefs

if ($sector = 0)
  send "d"
  settextlinetrigger GETSECTOR :GETSECTOR "Sector  : "
  pause
  :getsector
  getword CURRENTLINE $sector 3
  waiton "Command [TL="
end

if (SECTOR.PLANETCOUNT[$sector] = 0)
  return
end

send "jy"
gosub :playerinfo~infoquick
setvar $holds $playerinfo~holds

setvar $planetloop~loopsub ":UPGRADE~CHECKPLANET"
setvar $planetloop~ignorelist $ignorelist
gosub :planetloop~planetloop
gosub :VOIDADJUN
halt

:upgrade~checkplanet
setvar $planetupgrade~planetid $planetloop~id
setvar $planetupgrade~sector $sector
setvar $planetupgrade~seek $seek
gosub :planetupgrade~planetupgrade
return

:VOIDADJ


killalltriggers
setvar $I 1
setvar $WARPS SECTOR.WARPCOUNT[CURRENTSECTOR]
isnumber $NUM $WARPS
if ($NUM = 1)
  send "^"
  waitfor ":"
  while ($I <= $WARPS)
    send "s "&SECTOR.WARPS[CURRENTSECTOR][$I]&"* "
    add $I 1
  end
  send "q"
  waitfor ": ENDINTERROG"
end
return
:VOIDADJUN

setvar $I 1
setvar $WARPS SECTOR.WARPCOUNT[CURRENTSECTOR]
isnumber $NUM $WARPS
if ($NUM = 1)
  send "^"
  waitfor ":"
  while ($I <= $WARPS)
    send "c "&SECTOR.WARPS[CURRENTSECTOR][$I]&"* "
    add $I 1
  end
  send "q"
  waitfor ": ENDINTERROG"
end
return

# includes:
include "source\include\planetupgrade"
include "source\include\planetinfo"
include "source\include\gather"
include "source\include\move"
include "source\include\findproduct"
include "source\include\seekproduct"
include "source\include\planetcheck"
include "source\include\moveproduct"
include "source\include\warp"
include "source\include\nearfig"
include "source\include\haggle"
include "source\include\planetloop"
include "source\include\playerinfo"
include "source\include\gameprefs"
