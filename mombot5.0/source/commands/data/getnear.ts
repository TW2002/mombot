gosub :PLAYER~QUIKSTATS
setvar $VERSION "1.1a"
setvar $MOM GAMENAME&".nego"
setarray $PORT SECTORS
setvar $CNT 0
setvar $BUYER 0
setvar $B 0
setvar $SELLER 0
setvar $S 0
loadvar $PORT_MAX
loadvar $GAME~PORT_MAX
loadvar $BOT_NAME
loadvar $PARM1

fileexists $MOM_TST $MOM
if ($MOM_TST)
  readtoarray $MOM $PORTS
  setvar $IDX 1
  while ($IDX <= $PORTS)
    setvar $SS $PORTS[$IDX]
    getwordpos $SS $POS "Sector"
    if ($POS <> 0)
      getword $SS $SECT 2
    end
    getwordpos $SS $POS "equ for"
    if (($POS <> 0) and ($SECT <> 0))
      getword $SS $SS 13


      setvar $PORT[$SECT] $SS
    end
    add $IDX 1
  end
end


if (($PORT_MAX = 0) and ($GAME~PORT_MAX > 0))
  setvar $PORT_MAX $GAME~PORT_MAX
  savevar $PORT_MAX
end

if (($PORT_MAX = 0) and (($PLAYER~CURRENT_PROMPT = "Command") or ($PLAYER~CURRENT_PROMPT = "Citadel")))
  setvar $PLAYER~STARTINGLOCATION $PLAYER~CURRENT_PROMPT
  gosub :GAME~GAMESTATS
  loadvar $GAME~PORT_MAX
  if ($GAME~PORT_MAX > 0)
    setvar $PORT_MAX $GAME~PORT_MAX
    savevar $PORT_MAX
  end
end

if ($PORT_MAX = 0)
  setvar $switchboard~message "Unable To Determine Port Max From CFG File*"
  gosub :switchboard~switchboard
  halt
end

isnumber $TST $PARM1
if ($TST = 0)
  setvar $PARM1 $PORT_MAX
else
  if ($PARM1 > $PORT_MAX)
    setvar $PARM1 $PORT_MAX
  end
  if ($PARM1 < 1)
    setvar $PARM1 $PORT_MAX
  end
end

setvar $switchboard~message "GETNEAR "&$VERSION&" - Searching For Ports BUYERS & SELLERS ...*"
gosub :switchboard~switchboard

getnearestwarps $LOOKUP $PLAYER~CURRENT_SECTOR
setvar $IDX 1
while ($IDX <= $LOOKUP)
  setvar $FOCUS $LOOKUP[$IDX]
  if (PORT.EXISTS[$FOCUS])
    if ((PORT.CLASS[$FOCUS] = 2) or (PORT.CLASS[$FOCUS] = 3) or (PORT.CLASS[$FOCUS] = 4) or (PORT.CLASS[$FOCUS] = 8))
      if (PORT.EQUIP[$FOCUS] >= $PARM1)
        getsectorparameter $FOCUS "FIGSEC" $FIG
        if ($FIG <> 0)
          getdistance $DIST $PLAYER~CURRENT_SECTOR $FOCUS
          if ($DIST = "-1")
            setvar $DIST 0
          end
          if ($DIST < 10)
            setvar $DIST " "&$DIST
          end
          add $B 1
          gosub :FORMAT
          if ($MOM_TST)
            if ($PORT[$FOCUS] <> 0)
              setvar $STR $STR&" "&$PORT[$FOCUS]
            end
          end

          setvar $BUYER[$B] $STR
          add $CNT 1
        end
      end
    end
    if ((PORT.CLASS[$FOCUS] = 1) or (PORT.CLASS[$FOCUS] = 5) or (PORT.CLASS[$FOCUS] = 6) or (PORT.CLASS[$FOCUS] = 7))
      if (PORT.EQUIP[$FOCUS] >= $PARM1)
        getsectorparameter $FOCUS "FIGSEC" $FIG
        if ($FIG <> 0)
          getdistance $DIST $PLAYER~CURRENT_SECTOR $FOCUS
          if ($DIST = "-1")
            setvar $DIST 0
          end
          if ($DIST < 10)
            setvar $DIST " "&$DIST
          end
          add $S 1
          gosub :FORMAT

          if ($MOM_TST)
            if ($PORT[$FOCUS] <> 0)
              setvar $STR $STR&" "&$PORT[$FOCUS]
            end
          end
          setvar $SELLER[$S] $STR
          add $CNT 1
        end
      end
    end
  end
  if ($CNT >= 100)
    goto :_END_
  end
  add $IDX 1
end
:_END_
setvar $IDX 1
send "'*"
waiton "Type sub-space message"
send "{"&$BOT_NAME&"} GETNEAREST CASHING PORT : "&$CNT&" Found >= "&$PARM1&" units*"
getlength "{"&$BOT_NAME&"}" $LEN
setvar $PAD ""
setvar $I 1
while ($I <= $LEN)
  setvar $PAD $PAD&"-"
  add $I 1
end
send $PAD&"-----------------------------------*"

if ($B <> 0)
  send "BUYERS*"
  while ($IDX <= $B)
    send $BUYER[$IDX]&"*"
    add $IDX 1
  end
end
send "    *"
if ($S <> 0)
  setvar $IDX 1
  send "SELLERS*"
  while ($IDX <= $S)
    send $SELLER[$IDX]&"*"
    add $IDX 1
  end
end
send "*"
waiton "Sub-space comm-link terminated"

halt
:FORMAT

setvar $NUM $FOCUS
gosub :PAD
setvar $STR $PAD&$FOCUS&", "&$DIST&" hops"
if (PORT.CLASS[$FOCUS] = 1)
  setvar $STR $STR&" BBS"
elseif (PORT.CLASS[$FOCUS] = 2)
  setvar $STR $STR&" BSB"
elseif (PORT.CLASS[$FOCUS] = 3)
  setvar $STR $STR&" SBB"
elseif (PORT.CLASS[$FOCUS] = 4)
  setvar $STR $STR&" SSB"
elseif (PORT.CLASS[$FOCUS] = 5)
  setvar $STR $STR&" SBS"
elseif (PORT.CLASS[$FOCUS] = 6)
  setvar $STR $STR&" BSS"
elseif (PORT.CLASS[$FOCUS] = 7)
  setvar $STR $STR&" SSS"
elseif (PORT.CLASS[$FOCUS] = 8)
  setvar $STR $STR&" BBB"

end
setvar $NUM PORT.FUEL[$FOCUS]
gosub :PAD
setvar $STR $STR&" "&$PAD&$NUM&" ("&PORT.PERCENTFUEL[$FOCUS]&"%)"
if (PORT.PERCENTFUEL[$FOCUS] < 10)
  setvar $STR $STR&"  "
elseif (PORT.PERCENTFUEL[$FOCUS] < 100)
  setvar $STR $STR&" "
end

setvar $NUM PORT.ORG[$FOCUS]
gosub :PAD
setvar $STR $STR&$PAD&$NUM&" ("&PORT.PERCENTORG[$FOCUS]&"%)"
if (PORT.PERCENTORG[$FOCUS] < 10)
  setvar $STR $STR&"  "
elseif (PORT.PERCENTORG[$FOCUS] < 100)
  setvar $STR $STR&" "
end

setvar $NUM PORT.EQUIP[$FOCUS]
gosub :PAD
setvar $STR $STR&" "&$PAD&$NUM&" ("&PORT.PERCENTEQUIP[$FOCUS]&"%)"
return

# includes:
include "source\include\game"
include "source\include\switchboard.ts"
:PAD


setvar $PAD ""
getlength $NUM $LEN
setvar $PAD_I 1
while ($PAD_I <= (5 - $LEN))
  setvar $PAD $PAD&" "
  add $PAD_I 1
end
return
