gosub :QUIKSTATS
setvar $VERSION "1.1a"
setvar $MOM GAMENAME&".nego"
setarray $PORT SECTORS
setvar $CNT 0
setvar $BUYER 0
setvar $B 0
setvar $SELLER 0
setvar $S 0
loadvar $PORT_MAX
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


if ($PORT_MAX = 0)
  send "'{"&$BOT_NAME&"} Unable To Determine Port Max From CFG File*"
  waitfor "Message sent on sub-space channel"
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

send "'{"&$BOT_NAME&"} GETNEAR "&$VERSION&" - Searching For Ports BUYERS & SELLERS ...*"
waitfor "Message sent on sub-space channel"

getnearestwarps $LOOKUP $CURRENT_SECTOR
setvar $IDX 1
while ($IDX <= $LOOKUP)
  setvar $FOCUS $LOOKUP[$IDX]
  if (PORT.EXISTS[$FOCUS])
    if ((PORT.CLASS[$FOCUS] = 2) or (PORT.CLASS[$FOCUS] = 3) or (PORT.CLASS[$FOCUS] = 4) or (PORT.CLASS[$FOCUS] = 8))
      if (PORT.EQUIP[$FOCUS] >= $PARM1)
        getsectorparameter $FOCUS "FIGSEC" $FIG
        if ($FIG <> 0)
          getdistance $DIST $CURRENT_SECTOR $FOCUS
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
          getdistance $DIST $CURRENT_SECTOR $FOCUS
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
:QUIKSTATS

setvar $CURRENT_PROMPT "Undefined"
killtrigger NOPROMPT
killtrigger PROMPT1
killtrigger PROMPT2
killtrigger PROMPT3
killtrigger PROMPT4
killtrigger STATLINETRIG
killtrigger GETLINE2
settexttrigger PROMPT1 :ALLPROMPTS "(?="
settextlinetrigger PROMPT2 :SECONDARYPROMPTS "(?)"
settextlinetrigger STATLINETRIG :STATSTART #179
settexttrigger PROMPT3 :TERRAPROMPTS "Do you wish to (L)eave or (T)ake Colonists?"
settexttrigger PROMPT4 :TERRAPROMPTS "How many groups of Colonists do you want to take ("
send "^Q/"
pause
:ALLPROMPTS

getword CURRENTANSILINE $CHECKPROMPT 1
getword CURRENTLINE $TEMPPROMPT 1
getwordpos $CHECKPROMPT $POS "[35m"
if ($POS > 0)
  setvar $CURRENT_PROMPT $TEMPPROMPT
end
settextlinetrigger PROMPT1 :ALLPROMPTS "(?="
pause
:SECONDARYPROMPTS
getword CURRENTANSILINE $CHECKPROMPT 1
getword CURRENTLINE $TEMPPROMPT 1
getwordpos $CHECKPROMPT $POS "[35m"
if ($POS > 0)
  setvar $CURRENT_PROMPT $TEMPPROMPT
end
settextlinetrigger PROMPT2 :SECONDARYPROMPTS "(?)"
pause
:TERRAPROMPTS
killtrigger PROMPT3
killtrigger PROMPT4
getword CURRENTANSILINE $CHECKPROMPT 1
getwordpos $CHECKPROMPT $POS "[35m"
if ($POS > 0)
  setvar $CURRENT_PROMPT "Terra"
end
settexttrigger PROMPT3 :TERRAPROMPTS "Do you wish to (L)eave or (T)ake Colonists?"
settexttrigger PROMPT4 :TERRAPROMPTS "How many groups of Colonists do you want to take ("
pause
:STATSTART

killtrigger PROMPT1
killtrigger PROMPT2
killtrigger PROMPT3
killtrigger PROMPT4
killtrigger NOPROMPT
setvar $STATS ""
setvar $WORDY ""
:STATSLINE

killtrigger STATLINETRIG
killtrigger GETLINE2
setvar $LINE2 CURRENTLINE
replacetext $LINE2 #179 " "
striptext $LINE2 ","
setvar $STATS $STATS&$LINE2
getwordpos $LINE2 $POS "Ship"
if ($POS > 0)
  goto :GOTSTATS
else
  settextlinetrigger GETLINE2 :STATSLINE
  pause
end
:GOTSTATS

setvar $STATS $STATS&" @@@"
setvar $CURRENT_WORD 0
if ($WORDY <> "@@@")
  if ($WORDY = "Sect")
    getword $STATS $CURRENT_SECTOR ($CURRENT_WORD + 1)
  elseif ($WORDY = "Turns")
    getword $STATS $TURNS ($CURRENT_WORD + 1)
    if ($UNLIM)
      setvar $TURNS 65536
    end
  elseif ($WORDY = "Creds")
    getword $STATS $CREDITS ($CURRENT_WORD + 1)
  elseif ($WORDY = "Figs")
    getword $STATS $FIGHTERS ($CURRENT_WORD + 1)
  elseif ($WORDY = "Shlds")
    getword $STATS $SHIELDS ($CURRENT_WORD + 1)
  elseif ($WORDY = "Hlds")
    getword $STATS $TOTAL_HOLDS ($CURRENT_WORD + 1)
  elseif ($WORDY = "Ore")
    getword $STATS $ORE_HOLDS ($CURRENT_WORD + 1)
  elseif ($WORDY = "Org")
    getword $STATS $ORGANIC_HOLDS ($CURRENT_WORD + 1)
  elseif ($WORDY = "Equ")
    getword $STATS $EQUIPMENT_HOLDS ($CURRENT_WORD + 1)
  elseif ($WORDY = "Col")
    getword $STATS $COLONIST_HOLDS ($CURRENT_WORD + 1)
  elseif ($WORDY = "Phot")
    getword $STATS $PHOTONS ($CURRENT_WORD + 1)
  elseif ($WORDY = "Armd")
    getword $STATS $ARMIDS ($CURRENT_WORD + 1)
  elseif ($WORDY = "Lmpt")
    getword $STATS $LIMPETS ($CURRENT_WORD + 1)
  elseif ($WORDY = "GTorp")
    getword $STATS $GENESIS ($CURRENT_WORD + 1)
  elseif ($WORDY = "TWarp")
    getword $STATS $TWARP_TYPE ($CURRENT_WORD + 1)
  elseif ($WORDY = "Clks")
    getword $STATS $CLOAKS ($CURRENT_WORD + 1)
  elseif ($WORDY = "Beacns")
    getword $STATS $BEACONS ($CURRENT_WORD + 1)
  elseif ($WORDY = "AtmDt")
    getword $STATS $ATOMIC ($CURRENT_WORD + 1)
  elseif ($WORDY = "Corbo")
    getword $STATS $CORBO ($CURRENT_WORD + 1)
  elseif ($WORDY = "EPrb")
    getword $STATS $EPROBES ($CURRENT_WORD + 1)
  elseif ($WORDY = "MDis")
    getword $STATS $MINE_DISRUPTORS ($CURRENT_WORD + 1)
  elseif ($WORDY = "PsPrb")
    getword $STATS $PSYCHIC_PROBE ($CURRENT_WORD + 1)
  elseif ($WORDY = "PlScn")
    getword $STATS $PLANET_SCANNER ($CURRENT_WORD + 1)
  elseif ($WORDY = "LRS")
    getword $STATS $SCAN_TYPE ($CURRENT_WORD + 1)
  elseif ($WORDY = "Aln")
    getword $STATS $ALIGNMENT ($CURRENT_WORD + 1)
  elseif ($WORDY = "Exp")
    getword $STATS $EXPERIENCE ($CURRENT_WORD + 1)
  elseif ($WORDY = "Corp")
    getword $STATS $CORP ($CURRENT_WORD + 1)
  elseif ($WORDY = "Ship")
    getword $STATS $SHIP_NUMBER ($CURRENT_WORD + 1)
  end
  add $CURRENT_WORD 1
  getword $STATS $WORDY $CURRENT_WORD
end
:DONEQUIKSTATS
killtrigger PROMPT1
killtrigger PROMPT2
killtrigger PROMPT3
killtrigger PROMPT4
killtrigger STATLINETRIG
killtrigger GETLINE2
return
:PAD


setvar $PAD ""
getlength $NUM $LEN
setvar $PAD_I 1
while ($PAD_I <= (5 - $LEN))
  setvar $PAD $PAD&" "
  add $PAD_I 1
end
return
