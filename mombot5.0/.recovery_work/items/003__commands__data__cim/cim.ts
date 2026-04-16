logging "OFF"
gosub :BOT~LOADVARS
loadvar $PLAYER~UNLIMITEDGAME
loadvar $GAME~PTRADESETTING
loadvar $BOT~BOT_TURN_LIMIT
loadvar $GAME~PORT_MAX
loadvar $GAME~PTRADESETTING
loadvar $BOT~MCIC_FILE


setvar $BOT~HELP[1] $BOT~TAB&"     Computer Interrogation Mode: Port Report     "
setvar $BOT~HELP[2] $BOT~TAB&"           "
setvar $BOT~HELP[3] $BOT~TAB&"    cim {upgrade level} {warps}   "
setvar $BOT~HELP[4] $BOT~TAB&"                             "
setvar $BOT~HELP[5] $BOT~TAB&"Options:"
setvar $BOT~HELP[6] $BOT~TAB&"    {upgrade level} - Amount on port to be considered "
setvar $BOT~HELP[7] $BOT~TAB&"                      upgraded"
setvar $BOT~HELP[8] $BOT~TAB&"                                            "
setvar $BOT~HELP[9] $BOT~TAB&"    {warps}         - Perform warp data instead of "
setvar $BOT~HELP[10] $BOT~TAB&"                      port CIM"
gosub :BOT~HELPFILE

setvar $BOT~SCRIPT_TITLE "CIM"
gosub :BOT~BANNER

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
setarray $MCIC SECTORS
:MCIC_LOOPER
fileexists $MCIC_CK $BOT~MCIC_FILE
if ($MCIC_CK = 0)
  goto :DONE_MCIC_READ
end
setvar $MCIC_COUNT 1
:MCIC_READ_LOOP

read $BOT~MCIC_FILE $MCICLINE $MCIC_COUNT
if ($MCICLINE = "EOF")
  goto :DONE_MCIC_READ
end
if ($MCICLINE = "")
  add $MCIC_COUNT 1
  goto :MCIC_READ_LOOP
end
getword $MCICLINE $MCIC_SEC 2
isnumber $NUMBER $MCIC_SEC
if ($NUMBER = 0)
  add $MCIC_COUNT 1
  goto :MCIC_READ_LOOP
end
if (($MCIC_SEC <> "equ") or ($MCIC_SEC <> "org"))
  add $MCIC_COUNT 1
  :MCIC_COUNT_IN

  read $BOT~MCIC_FILE $MCICLINE $MCIC_COUNT
  getword $MCICLINE $MCIC_LINE_CK 5
  if ($MCIC_LINE_CK <> "cr")
    add $MCIC_COUNT 1
    goto :MCIC_COUNT_IN
  end
  getword $MCICLINE $MCIC_ORG 2
  if ($MCIC_ORG = "org")
    add $MCIC_COUNT 2
    goto :MCIC_READ_LOOP
  end
  getword $MCICLINE $ACTUAL_MCIC 13
  striptext $ACTUAL_MCIC "/-65"
  if (($ACTUAL_MCIC = "-65") or ($ACTUAL_MCIC = "-64") or ($ACTUAL_MCIC = "-63") or ($ACTUAL_MCIC = "-62") or ($ACTUAL_MCIC = "-61") or ($ACTUAL_MCIC = "-60"))
    setvar $MCIC[$MCIC_SEC] $ACTUAL_MCIC
    setsectorparameter $MCIC_SEC "MCIC" $ACTUAL_MCIC
    setsectorparameter $MCIC_SEC "GOODPORT" TRUE
  end
  add $MCIC_COUNT 1
else
  add $MCIC_COUNT 2
end
goto :MCIC_READ_LOOP
:DONE_MCIC_READ

setvar $CIM_COUNT 1
:CIM_LOOPER

setvar $SECTIONA SECTORS
divide $SECTIONA 78
setvar $ECHO_COUNT 1
setvar $UPPED "  "
setvar $SWITCHBOARD~MESSAGE "Processing CIM...*"
gosub :SWITCHBOARD~SWITCHBOARD
gosub :PLAYER~QUIKSTATS
while ($CIM_COUNT <= SECTORS)
  if (PORT.EXISTS[$CIM_COUNT] = 1)
    setvar $ISUPPED FALSE
    setvar $CURRENTFUEL PORT.FUEL[$CIM_COUNT]
    multiply $CURRENTFUEL 100
    if (PORT.PERCENTFUEL[$CIM_COUNT] <> 0)
      divide $CURRENTFUEL PORT.PERCENTFUEL[$CIM_COUNT]
    end
    if ($CURRENTFUEL > $UPGRADELIMIT)
      setvar $ISUPPED TRUE
    end
    setvar $CURRENTORG PORT.ORG[$CIM_COUNT]
    multiply $CURRENTORG 100
    if (PORT.PERCENTORG[$CIM_COUNT] <> 0)
      divide $CURRENTORG PORT.PERCENTORG[$CIM_COUNT]
    end
    if ($CURRENTORG > $UPGRADELIMIT)
      setvar $ISUPPED TRUE
    end
    setvar $CURRENTEQUIP PORT.EQUIP[$CIM_COUNT]
    multiply $CURRENTEQUIP 100
    if (PORT.PERCENTEQUIP[$CIM_COUNT] <> 0)
      divide $CURRENTEQUIP PORT.PERCENTEQUIP[$CIM_COUNT]
    end
    if ($CURRENTEQUIP > $UPGRADELIMIT)
      setvar $ISUPPED TRUE
    end
    if ($ISUPPED = TRUE)
      setvar $UPPED $UPPED&" "&$CIM_COUNT&" "
    end
  end
  add $CIM_COUNT 1
  if ($ECHO_COUNT = $SECTIONA)
    echo ANSI_13 #178
    setvar $ECHO_COUNT 1
  else
    add $ECHO_COUNT 1
  end
end

if ($STARTINGLOCATION = "Command")
  send "tt"
elseif ($STARTINGLOCATION = "Citadel")
  send "xt"
else
  halt
end
send "-----" $BOT~BOT_NAME "-----*"
send "Upped Ports: (At least "&$UPGRADELIMIT&" product level)*"
setvar $CIMOUT_COUNT 1
while ($CIMOUT_COUNT <= SECTORS)
  getwordpos $UPPED $POS " "&$CIMOUT_COUNT&" "
  if ($POS > 0)
    setvar $CIMTEMP $CIMOUT_COUNT&"("

    if (PORT.BUYFUEL[$CIMOUT_COUNT] = 1)
      setvar $CIMTEMP $CIMTEMP&"B"
    else
      setvar $CIMTEMP $CIMTEMP&"S"
    end
    if (PORT.BUYORG[$CIMOUT_COUNT] = 1)
      setvar $CIMTEMP $CIMTEMP&"B"
    else
      setvar $CIMTEMP $CIMTEMP&"S"
    end
    if (PORT.BUYEQUIP[$CIMOUT_COUNT] = 1)
      setvar $CIMTEMP $CIMTEMP&"B"
    else
      setvar $CIMTEMP $CIMTEMP&"S"
    end
    setvar $CIMTEMP $CIMTEMP&") "
    send $CIMTEMP
  end
  add $CIMOUT_COUNT 1
end
send "***"
setvar $UPPED ""
if ($MCIC_CK = 1)
  if ($STARTINGLOCATION = "Command")
    send "tt"
  elseif ($STARTINGLOCATION = "Citadel")
    send "xt"
  else
    halt
  end
else
  halt

end
send "Ports with MCIC at least -60/-65 :*"
:MCIC_SEND_LOOP

setvar $MCIC_SEND_COUNT 1
while ($MCIC_SEND_COUNT <= SECTORS)
  if ($MCIC[$MCIC_SEND_COUNT] <> 0)
    setvar $CIMTEMP $MCIC_SEND_COUNT&"("

    if (PORT.BUYFUEL[$MCIC_SEND_COUNT] = 1)
      setvar $CIMTEMP $CIMTEMP&"B"
    else
      setvar $CIMTEMP $CIMTEMP&"S"
    end
    if (PORT.BUYORG[$MCIC_SEND_COUNT] = 1)
      setvar $CIMTEMP $CIMTEMP&"B"
    else
      setvar $CIMTEMP $CIMTEMP&"S"
    end
    if (PORT.BUYEQUIP[$MCIC_SEND_COUNT] = 1)
      setvar $CIMTEMP $CIMTEMP&"B"
    else
      setvar $CIMTEMP $CIMTEMP&"S"
    end
    setvar $CIMTEMP $CIMTEMP&") "
    send $CIMTEMP&" MCIC = "&$MCIC[$MCIC_SEND_COUNT]&"*"
  end
  add $MCIC_SEND_COUNT 1
end
send "***"
setvar $SWITCHBOARD~MESSAGE "CIM Processing Complete!*"
gosub :SWITCHBOARD~SWITCHBOARD
setarray $MCIC 10
halt

# includes:
include "include/BOT.ts"
include "include/BOT_2/BOT.ts"
include "include/BOT_3/BOT.ts"
include "include/BOT_4/BOT.ts"
include "include/SWITCHBOARD.ts"
include "include/BOT_5/BOT.ts"
include "include/BOT_6/BOT.ts"
include "include/PLAYER.ts"
