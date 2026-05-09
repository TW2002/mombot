logging "OFF"
gosub :LOADVARS~LOADVARS
gosub :HELP~INITIALIZE
loadvar $PLAYER~UNLIMITEDGAME
loadvar $GAME~PTRADESETTING
loadvar $BOT~BOT_TURN_LIMIT
loadvar $GAME~PORT_MAX
loadvar $GAME~PTRADESETTING
loadvar $BOT~MCIC_FILE


setvar $HELP~HELP[1] $HELP~TAB&"     Computer Interrogation Mode: Port Report     "
setvar $HELP~HELP[2] $HELP~TAB&"           "
setvar $HELP~HELP[3] $HELP~TAB&"    cim {upgrade level} {warps}   "
setvar $HELP~HELP[4] $HELP~TAB&"                             "
setvar $HELP~HELP[5] $HELP~TAB&"Options:"
setvar $HELP~HELP[6] $HELP~TAB&"    {upgrade level} - Amount on port to be considered "
setvar $HELP~HELP[7] $HELP~TAB&"                      upgraded"
setvar $HELP~HELP[8] $HELP~TAB&"                                            "
setvar $HELP~HELP[9] $HELP~TAB&"    {warps}         - Perform warp data instead of "
setvar $HELP~HELP[10] $HELP~TAB&"                      port CIM"
gosub :HELP~HELPFILE

setvar $SWITCHBOARD~MESSAGE "CIM starting up!*"
gosub :SWITCHBOARD~SWITCHBOARD

setvar $PLAYER~SAVE TRUE
:CIM





gosub :PLAYER~QUIKSTATS
setvar $STARTINGLOCATION $PLAYER~CURRENT_PROMPT
isnumber $TEST $BOT~PARM1
if ($TEST)
  if ($BOT~PARM1 > 0)
    setvar $UPGRADELIMIT $BOT~PARM1
  else
    setvar $UPGRADELIMIT 10000
  end
else
  setvar $UPGRADELIMIT 10000
end
setvar $SWITCHBOARD~MESSAGE "Stand By - CIMMING . . .*"
gosub :SWITCHBOARD~SWITCHBOARD
if (($BOT~PARM1 = "warps") or ($BOT~PARM1 = "warp"))
  send "^iq"
  setvar $SWITCHBOARD~MESSAGE "Warp Data CIM Complete*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
else
  send "^rq"
end
waitfor ": ENDINTERROG"
setarray $UPDATE~MCIC SECTORS
setvar $UPDATE~STARTINGLOCATION $STARTINGLOCATION
setvar $UPDATE~UPGRADELIMIT $UPGRADELIMIT
gosub :UPDATE~MCIC_LOOPER
halt

# includes:
include "source\include\update"
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
