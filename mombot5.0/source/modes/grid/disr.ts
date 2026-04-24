






















loadvar $BOT_NAME
loadvar $PARM1
loadvar $PARM2
loadvar $PARM3
setvar $TAGLINE "{"&$BOT_NAME&"} DisR"
setvar $ERRMSG "'{"&$BOT_NAME&"} - DisR Syntax Error"
setvar $PLANET 0
setvar $SCANIT TRUE
setvar $BURSTING FALSE
setvar $START_PROMPT ""
setvar $TOTAL_MINES_POOFED 0
setarray $ADJ2HIT 6 1


if ($PARM1 = "help")
  send "'*"&$TAGLINE&" {Sector} {NScan} {Burst}*"
  send "   *"
  send "      {Sector}  Disrupt Mines in Adj Sector*"
  send "      {Burst}   Sends only 1 Disruptor into each Sector*"
  send "      {NScan}   Do Not Perform Holo Scan --otherwise it*"
  send "                Auto Detect enemy Armids*"
  send "   *"
  send "         Start Prompts:*"
  send "                         Command Prompt*"
  send "                         Planet/Citadel Prompt(S)*"
  send "                         Computer Prompt*"
  send "                         StarDock Prompt*"
  send "                         Port Prompt*"
  send "   *"
  send "      Default Action: Disrupt All Adjs, With Holo Scan.**"
  halt
end

if ($PARM1 = "")
  setvar $PARM1 0
end

isnumber $TST $PARM1
if ($TST = 0)
  lowercase $PARM1
  if ($PARM1 = "nscan")
    setvar $SCANIT FALSE
    setvar $PARM1 0
  elseif ($PARM1 = "burst")
    setvar $PARM1 0
    setvar $BURSTING TRUE
  else
    send $ERRMSG&"*"
    halt
  end

end
if (($PARM1 < 11) and ($PARM1 <> 0)) or ($PARM1 = STARDOCK)
  send $ERRMSG&" - Invalid Target!*"
  halt
elseif (($PARM1 = 0) and ($SCANIT = 0))
  setvar $IDX 1
  while (SECTOR.WARPS[CURRENTSECTOR][$IDX] > 0)
    setvar $ADJ SECTOR.WARPS[CURRENTSECTOR][$IDX]
    setvar $ADJ2HIT[$IDX] $ADJ
    setvar $ADJ2HIT[$IDX][1] 1
    add $IDX 1
  end
elseif ($PARM1 > 0)
  setvar $ADJ2HIT[1] $PARM1
  setvar $ADJ2HIT[1][1] 1
  setvar $SCANIT FALSE

end
isnumber $TST $PARM2
if ($TST = 0)
  lowercase $PARM2
  if ($PARM2 = "nscan")
    setvar $SCANIT FALSE
  elseif ($PARM2 = "burst")
    setvar $SCANIT FALSE
    setvar $BURSTING TRUE
  end
end

isnumber $TST $PARM3
if ($TST = 0)
  lowercase $PARM3
  if ($PARM3 = "nscan")
    setvar $SCANIT FALSE
  elseif ($PARM3 = "burst")
    setvar $SCANIT FALSE
    setvar $BURSTING TRUE
  end
end
:PROMPT_CHECKING

gosub :LOAD_QUIKSTATS
if ($SCANIT and ($SCAN_TYPE <> "Holo"))
  send "'"&$TAGLINE&" - Ship Does Not Have A Long Range Scanner!*"
  halt
end
if ($MINE_DISRUPTORS = 0)
  send "'"&$TAGLINE&" - No Disruptors On Board!*"
  halt
end

if ($CURRENT_PROMPT = "Planet")
  gosub :PLANET_INFO
  if ($PLANET = 0)
    send "'"&$TAGLINE&" - Unable To Obtain Planet Number!*"
    halt
  end
  send "  Q  "
elseif ($CURRENT_PROMPT = "Citadel")
  send "  Q  "
  gosub :PLANET_INFO
  send "  Q  "
  if ($PLANET = 0)
    send "'"&$TAGLINE&" - Unable To Obtain Planet Number!*"
    halt
  end
elseif ($CURRENT_PROMPT = "Command")

elseif ($CURRENT_PROMPT = "Computer")
  send "  Q  "
  goto :PROMPT_CHECKING
elseif (($CURRENT_PROMPT = "StarDock") or ($CURRENT_PROMPT = "Stardock"))
  send "Q  "
elseif ($CURRENT_PROMPT = "Port")
  send " 0*  0*  0*  0*  "
else
  send "'"&$TAGLINE&" - At Unkown Prompt!*"
  halt

end
setvar $START_PROMPT $CURRENT_PROMPT

if ($SCANIT)
  gosub :DO_SCAN
  setvar $IDX 1


  while (SECTOR.WARPS[CURRENTSECTOR][$IDX] > 0)
    setvar $ADJ SECTOR.WARPS[CURRENTSECTOR][$IDX]
    if (SECTOR.MINES.QUANTITY[$ADJ] <> 0)
      if ((SECTOR.MINES.OWNER[$ADJ] <> "belong to your Corp") and (SECTOR.MINES.OWNER[$ADJ] <> "yours"))
        setvar $ADJ2HIT[$IDX] $ADJ
        setvar $ADJ2HIT[$IDX][1] SECTOR.MINES.QUANTITY[$ADJ]
      else
        setvar $ADJ2HIT[$IDX][1] 0
      end
    end
    add $IDX 1
  end
end


gosub :STAR_BURST


if ($PLANET <> 0)
  if ($START_PROMPT = "Citadel")
    send " Q Q Q Z N L Z"&#8&$PLANET&"*  *  J  C  *  * "
  else
    send " Q Q Q Z N L Z"&#8&$PLANET&"*  *  "
  end
elseif (($START_PROMPT = "StarDock") or ($START_PROMPT = "Stardock"))
  settextlinetrigger LIMPET_FOUND :LIMPET_FOUND "A port official runs up to you as you dock and informs you that"
  settexttrigger ON_DOCK :ON_DOCK "<StarDock> Where to?"
  send " P  S"
  pause
  :LIMPET_FOUND
  send " Y "
  pause
  :ON_DOCK
  killalltriggers
elseif ($START_PROMPT = "Port")
  send " P  T  "

end
setvar $IDX 1
setvar $STR ""
while ($IDX <= 6)
  if ($ADJ2HIT[$IDX][1] <> 0)
    setvar $STR $STR&"        Sector "&$ADJ2HIT[$IDX]&", "&$ADJ2HIT[$IDX][1]&" Mines Remain*"
  end
  add $IDX 1
end

if ($STR = "")
  send "'"&$TAGLINE&" - Disrupted "&$TOTAL_MINES_POOFED&" Mines!*"
else
  send "'*"&$TAGLINE&" - Status Report:*"
  send " *"&$STR
  send "        Disrupted: "&$TOTAL_MINES_POOFED&"**"
end

halt
:DO_SCAN















setdelaytrigger WHOA_WUZUP :WHOA_WUZUP 4000
settextlinetrigger SCAN_COMPLETE :SCAN_COMPLETE "Warps to Sector(s)"
if ($START_PROMPT = "Citadel")
  send " S  H"
elseif ($START_PROMPT = "Planet")
  send " S  H"
elseif (($START_PROMPT = "StarDock") or ($START_PROMPT = "Stardock"))
  send "  S  H"
elseif ($START_PROMPT = "Command")
  send "  S  H"
elseif ($START_PROMPT = "Port")
  send " S   H"
else
  gosub :LOAD_QUIKSTATS
  send "'"&$TAGLINE&" - Unknown Problem Occured, at '"&$CURRENT_PROMPT&"' Prompt!*"
  halt
end
pause
:WHOA_WUZUP
killalltriggers
send "'"&$TAGLINE&" - Unknown Problem Occured, Attempting to reach Command Prompt!*  P D 0* 0* 0* * *** * C  Q  Q  Q  Q  Q  Z  2  2  C  Q  *  Z  *  ***  *  *  ^Q"
waitfor ": ENDINTERROG"
gosub :LOAD_QUIKSTATS
send "'"&$TAGLINE&" - Unknown Problem Occured, at '"&$CURRENT_PROMPT&"' Prompt!*"
halt
:SCAN_COMPLETE
killalltriggers
return
:PLANET_INFO

settextlinetrigger PLANET :PLANET "Planet #"
send "D"
pause
:PLANET
killtrigger PLANET
getword CURRENTLINE $PLANET 2
striptext $PLANET "#"
isnumber $TST $PLANET
if ($TST = 0)
  setvar $PLANET 0
end
return
:LOAD_QUIKSTATS
gosub :PLAYER~QUIKSTATS
setvar $CURRENT_PROMPT $PLAYER~CURRENT_PROMPT
setvar $SCAN_TYPE $PLAYER~SCAN_TYPE
setvar $MINE_DISRUPTORS $PLAYER~MINE_DISRUPTORS
striptext $CURRENT_PROMPT "<"
striptext $CURRENT_PROMPT ">"
return
:STAR_BURST


setvar $DISRUPTORS $MINE_DISRUPTORS
send " C "
:LETS_GO_AGAIN
setvar $IDX 1
setvar $ADJ_HITS 0
while ($IDX <= 6)
  if ($ADJ2HIT[$IDX][1] <> 0)
    settextlinetrigger NOMINES :NOMINES "There were no mines in sector "&$ADJ2HIT[$IDX]
    settextlinetrigger MINESGONE :MINESGONE "of the mines in sector "&$ADJ2HIT[$IDX]&"!"
    settextlinetrigger NOTADJ :NOTADJ "That is not an adjacent sector"
    send " W Y "&$ADJ2HIT[$IDX]&"*"
    pause
    :NOMINES
    killalltriggers
    setvar $DISRUPTORS ($DISRUPTORS - 1)
    setvar $ADJ2HIT[$IDX][1] 0
    goto :LOOP_D_LOU
    :NOTADJ
    killalltriggers
    send " Q"
    setvar $ADJ2HIT[$IDX][1] 0
    goto :LOOP_D_LOU
    :MINESGONE
    killalltriggers
    setvar $TEMP CURRENTLINE
    getwordpos $TEMP $POS "remain)"
    setvar $DISRUPTORS ($DISRUPTORS - 1)
    if ($POS = 0)
      getword $TEMP $TEMP 4
      isnumber $TST $TEMP
      if ($TST)
        setvar $TOTAL_MINES_POOFED ($TOTAL_MINES_POOFED + $TEMP)
      end
      setvar $ADJ2HIT[$IDX][1] 0
    else
      getword $TEMP $TEMP2 3
      isnumber $TST $TEMP2
      if ($TST)
        setvar $TOTAL_MINES_POOFED ($TOTAL_MINES_POOFED + $TEMP2)
      end
      gettext $TEMP $TEMP $ADJ2HIT[$IDX]&"! (" " remain)"
      isnumber $TST $TEMP
      if ($TST = 0)
        setvar $TEMP 0
      end
      setvar $ADJ2HIT[$IDX][1] $TEMP
      setvar $ADJ_HITS ($ADJ_HITS + 1)
    end
    :LOOP_D_LOU
    if ($DISRUPTORS < 1)
      setvar $IDX 6
    end
  end
  add $IDX 1
end
if (($ADJ_HITS <> 0) and (($DISRUPTORS > 0) and ($BURSTING = 0)))
  goto :LETS_GO_AGAIN
end
send " Q "
return

include "source\include\player"
