loadvar $BOT_NAME
loadvar $USER_COMMAND_LINE
loadvar $BOT_TURN_LIMIT
loadvar $STEAL_FACTOR
loadvar $ROB_FACTOR
loadvar $UNLIMITEDGAME
loadvar $PTRADESETTING
setvar $CURRENT_PROMPT "Undefined"
setvar $PSYCHIC_PROBE "No"
setvar $PLANET_SCANNER "No"
setvar $SCAN_TYPE "None"
setvar $CURRENT_SECTOR 0
setvar $TURNS 0
setvar $CREDITS 0
setvar $FIGHTERS 0
setvar $SHIELDS 0
setvar $TOTAL_HOLDS 0
setvar $ORE_HOLDS 0
setvar $ORGANIC_HOLDS 0
setvar $EQUIPMENT_HOLDS 0
setvar $COLONIST_HOLDS 0
setvar $PHOTONS 0
setvar $ARMIDS 0
setvar $LIMPETS 0
setvar $GENESIS 0
setvar $TWARP_TYPE 0
setvar $CLOAKS 0
setvar $BEACONS 0
setvar $ATOMIC 0
setvar $CORBO 0
setvar $EPROBES 0
setvar $MINE_DISRUPTORS 0
setvar $ALIGNMENT 0
setvar $EXPERIENCE 0
setvar $CORP 0
setvar $SHIP_NUMBER 0
setvar $TURNS_PER_WARP 0
systemscript
reqrecording
setvar $FILE "_MOM_"&GAMENAME&"_QUIK.txt"
setvar $BUSTFILE "_MOM_"&GAMENAME&"_BUST.txt"
fileexists $CHK $FILE
if ($CHK = 1)
  gosub :READFILE
  gosub :SAVE
  delete $FILE
end
loadvar $QUIKSAVED
if ($QUIKSAVED)
  loadvar $QUIK_AHAGGLE
  loadvar $QUIK_HFACTOR
  loadvar $QUIK_SFACTOR
  loadvar $QUIK_RFACTOR
  loadvar $QUIK_FIGKILL
  loadvar $QUIK_PPTSTOP
  loadvar $QUIK_BWARN
  loadvar $QUIK_BWARP
  loadvar $QUIK_ASTEAL
  loadvar $QUIK_AROB
  loadvar $QUIK_LSTEAL
  loadvar $QUIK_LBUST
  loadvar $QUIK_SHOWSSM
  loadvar $QUIK_SHOWORE
  loadvar $QUIK_SHOWORG
  loadvar $QUIK_SHOWEQU
else
  setvar $QUIK_AHAGGLE "Off"
  setvar $QUIK_HFACTOR 5
  setvar $QUIK_SFACTOR 21
  setvar $QUIK_RFACTOR 6
  setvar $QUIK_PPTSTOP 25
  setvar $QUIK_FIGKILL "Off"
  setvar $QUIK_BWARN "Off"
  setvar $QUIK_BWARP "Off"
  setvar $QUIK_ASTEAL "Off"
  setvar $QUIK_AROB "Off"
  setvar $QUIK_LSTEAL 0
  setvar $QUIK_LBUST 0
  setvar $QUIK_SHOWSSM "Yes"
  setvar $QUIK_SHOWORE "Yes"
  setvar $QUIK_SHOWORG "Yes"
  setvar $QUIK_SHOWEQU "Yes"
end
setvar $AHAGGLE $QUIK_AHAGGLE
setvar $HFACTOR $QUIK_HFACTOR
setvar $SFACTOR $QUIK_SFACTOR
setvar $RFACTOR $QUIK_RFACTOR
setvar $FIGKILL $QUIK_FIGKILL
setvar $BWARN $QUIK_BWARN
setvar $BWARP $QUIK_BWARP
setvar $ASTEAL $QUIK_ASTEAL
setvar $AROB $QUIK_AROB
setvar $LSTEAL $QUIK_LSTEAL
setvar $LBUST $QUIK_LBUST
gosub :SAVE
if ($BWARN = "On")
  fileexists $CHK $BUSTFILE
  if ($CHK = 1)
    :ABUST
    echo ANSI_15 "**Would You like to clear your busts?**"
    getconsoleinput $CLEAR SINGLEKEY
    if (($CLEAR = "y") or ($CLEAR = "Y"))
      delete $BUSTFILE
    elseif (($CLEAR = "n") or ($CLEAR = "N"))
      setarray $BUSTS SECTORS
      setvar $READ 1
      :RBUST
      read $BUSTFILE $BUSTSEC $READ
      if ($BUSTSEC <> "EOF")
        setvar $BUSTS[$BUSTSEC] 1
        add $READ 1
        goto :RBUST
      end
    else
      goto :ABUST
    end
  end
end
:SETMENU

echo "[2J"
setvar $SCRIPTNAME "SupGQuikPanel"
:MENU

gosub :SIGNATURE
echo ANSI_15 "Settings for " GAMENAME "*"
echo ANSI_14 "1." ANSI_15 " Haggle Factor         " ANSI_10 "["
echo ANSI_6 $HFACTOR
echo ANSI_10 "]*"
echo ANSI_14 "2." ANSI_15 " Bust Warning          " ANSI_10 "["
echo ANSI_6 $BWARN
echo ANSI_10 "]*"
echo ANSI_14 "3." ANSI_15 " PPT Stop Percentage   " ANSI_10 "["
echo ANSI_6 $QUIK_PPTSTOP
echo ANSI_10 "]*"
echo ANSI_14 "D." ANSI_15 " Display Options*"
echo ANSI_5 "*Press the number of the option you*wish to change, or press" ANSI_14 " C" ANSI_5 " to continue.**"
getconsoleinput $CHOICE SINGLEKEY
lowercase $CHOICE
if ($CHOICE = 1)
  getinput $HFACTOR "Enter Haggle Factor (Setting to 0 will turn Haggle Off)"
  isnumber $CHK $HFACTOR
  if ($HFACTOR = 0)
    setvar $AHAGGLE "Off"
  end
  if ($CHK = 0)
    setvar $HFACTOR 5
  end
elseif ($CHOICE = 2)
  if ($BWARN = "Off")
    setvar $BWARN "On"
    fileexists $CHK $BUSTFILE
    if ($CHK = 1)
      :ASKBUST
      echo ANSI_15 "*Would You like to clear your busts?*"
      getconsoleinput $CLEAR SINGLEKEY
      if (($CLEAR = "y") or ($CLEAR = "Y"))
        delete $BUSTFILE
      elseif (($CLEAR = "n") or ($CLEAR = "N"))
        setarray $BUSTS SECTORS
        setvar $READ 1
        :READBUST
        read $BUSTFILE $BUSTSEC $READ
        if ($BUSTSEC <> "EOF")
          setvar $BUSTS[$BUSTSEC] 1
          add $READ 1
          goto :READBUST
        end
      else
        goto :ASKBUST
      end
    end
  else
    setvar $BWARN "Off"
  end
elseif ($CHOICE = 3)
  getinput $QUIK_PPTSTOP "PPT stop percentage"
  isnumber $CHK $QUIK_PPTSTOP
  if (($CHK = 0) or ($QUIK_PPTSTOP < 0) or ($QUIK_PPTSTOP > 100))
    setvar $QUIK_PPTSTOP 25
  end
elseif ($CHOICE = "d")
  gosub :DISPLAYOPTIONS
elseif ($CHOICE = "c")
  gosub :SAVE
  goto :WAIT
else
  goto :SETMENU
end
goto :SETMENU
:WAIT

killalltriggers
settexttrigger AUTOOFF :AUTOOFF "SUPGSCRIPT_AUTO_OFF"
settexttrigger BWARPOFF :BWARPOFF "SUPGSCRIPT_BWARP_OFF"
settexttrigger FIGKILLOFF :KILLOFF "SUPGSCRIPT_KILL_OFF"
if ($AHAGGLE = "On")
  settexttrigger PTRADE :BUNITS "do you want to buy"
  settexttrigger STRADE :SUNITS "do you want to sell"
  settexttrigger PLANETTRADE :PLNTTRADE "<Negotiate Planetary TradeAgreement>"
end
if ($ASTEAL = "On")
  settexttrigger STEAL :STEALS "to swipe? ["
end
if ($AROB = "On")
  settextlinetrigger ROB :ROB "has in excess of"
end
if ($FIGKILL = "On")
  settexttrigger MOVING :MOVING "You have to destroy the fighters"
  settexttrigger MINES :MOVING "<Re-Display>"
  settexttrigger CITMINE :MOVING "<Scan Sector>"
end
if ($BWARP = "On")
  settexttrigger BWARP :BWARP "Do you want to make this jump blind?"
  settexttrigger BBWAR :BWARP "Do you want to make this transport blind?"
end
settexttrigger BUSTED :BUSTED "Suddenly you're Busted"
settexttrigger NOBUST :SSTEAL "Success!"
settexttrigger CHKBUST :CHKBUST "] (?=Help)?"
settexttrigger INFO :GET_INFO "<Info>"
settextouttrigger SETS :OPTMENU "~"
pause
:GET_INFO

killalltriggers
settextlinetrigger ALNEXP :ALNEXP "Rank "
settexttrigger GOTINF :WAIT "(?=Help)?"
pause
:ALNEXP

gettext CURRENTLINE $KNOWNEXP ": " " points,"
striptext $KNOWNEXP ","
getword CURRENTLINE $KNOWNALIGN 7
striptext $KNOWNALIGN "Alignment="
striptext $KNOWNALIGN ","
pause
:PLNTTRADE

killalltriggers
gosub :PLANET_NEG
goto :WAIT
:BUNITS

setvar $MULTIPLIER (100 - $HFACTOR)
goto :UNITS
:SUNITS

setvar $MULTIPLIER (100 + $HFACTOR)
:UNITS

killtrigger PTRADE
killtrigger STRADE
killtrigger GO
killtrigger DONE
settexttrigger PTRADE :BUNITS "do you want to buy ["
settexttrigger STRADE :SUNITS "do you want to sell ["
settextlinetrigger GO :FINISHHAGGLE "Agreed, "
settextlinetrigger DONE :DONEHAGGLE "empty cargo holds."
pause
:FINISHHAGGLE

killtrigger DONE
gosub :HAGGLE
:DONEHAGGLE

goto :WAIT
:MOVING

setvar $SINGLESTEP 1
gosub :CLEAR_SECTOR
goto :WAIT
:STEALS

gettext CURRENTLINE $MAXHOLDS "[" "]"
setvar $STEALHOLDS ($KNOWNEXP / $STEAL_FACTOR)
if ($STEALHOLDS > $MAXHOLDS)
  send $MAXHOLDS "*"
else
  send $STEALHOLDS "*"
end
pause
:ROB

getword CURRENTLINE $COP 11
striptext $COP ","
if ($COP = 0)
  send "*"
else
  setvar $ROBAMOUNT ($KNOWNEXP * $ROB_FACTOR)
  if ($ROBAMOUNT > $COP)
    setvar $COP (($COP * 110) / 100)
    send $COP "*"
  else
    send $ROBAMOUNT "*"
  end
end
pause
:CHKBUST

gettext CURRENTLINE $CURSEC "]:[" "] ("
if ($BWARN = "On")
  if ($LBUST = $CURSEC)
    echo ANSI_5 "[" ANSI_12 "LAST BUST" ANSI_5 "] : "
  elseif ($BUSTS[$CURSEC] = 1)
    echo ANSI_5 "[" ANSI_12 "BUSTED" ANSI_5 "] : "
  elseif ($LSTEAL = $CURSEC)
    echo ANSI_5 "[" ANSI_14 "LAST STEAL" ANSI_5 "] : "
  end
end
goto :WAIT
:BUSTED

waitfor "(?=Help)? :"
gettext CURRENTLINE $CURSEC "]:[" "] ("
setvar $BUSTS[$CURSEC] 1
write $BUSTFILE $CURSEC
setvar $LBUST $CURSEC
gosub :SAVE
if ($BWARN = "On")
  echo ANSI_5 "[" ANSI_12 "LAST BUST" ANSI_5 "] : "
end
goto :WAIT
:SSTEAL

waitfor "(?=Help)? :"
gettext CURRENTLINE $CURSEC "]:[" "] ("
setvar $LSTEAL $CURSEC
gosub :SAVE
if ($BWARN = "On")
  echo ANSI_5 "[" ANSI_14 "LAST STEAL" ANSI_5 "] : "
end
goto :WAIT
:BWARP

send "n"
goto :WAIT
:OPTMENU

cuttext CURRENTLINE $LOCATION 1 7
if (($LOCATION = "Command") or ($LOCATION = "Citadel") or ($LOCATION = "Compute") or ($LOCATION = "Corpora") or ($LOCATION = "<StarDo") or ($LOCATION = "Planet ") or ($LOCATION = "Engage ") or ($LOCATION = "Option?") or ($LOCATION = "<Tavern"))
  gosub :QUIKSTATS
  setvar $CURSEC $CURRENT_SECTOR
  setvar $ALIGN $ALIGNMENT
else
  setvar $ALIGN $KNOWNALIGN
end
:ALNMENU

echo "[2J"
setvar $SCRIPTNAME "SupGQuikPanel"
gosub :SIGNATURE
echo ANSI_15 "*Option Menu *"
if (PORT.CLASS[$CURSEC] <> "-1")
  setvar $ROUND 0
  setvar $MENUITEM 0
  :ROUND
  if ($ROUND < SECTOR.WARPCOUNT[$CURSEC])
    add $ROUND 1
    setvar $ADJSEC SECTOR.WARPS[$CURSEC][$ROUND]
    if (PORT.CLASS[$ADJSEC] = "-1")
      goto :ROUND
    end
    if ((PORT.BUYEQUIP[$CURSEC] = 1) and ((PORT.BUYEQUIP[$ADJSEC] = 0) and ($QUIK_SHOWEQU = "Yes"))) or ((PORT.BUYORG[$CURSEC] = 0) and ((PORT.BUYORG[$ADJSEC] = 1) and ($QUIK_SHOWORG = "Yes"))) or ((PORT.BUYEQUIP[$CURSEC] = 0) and ((PORT.BUYEQUIP[$ADJSEC] = 1) and ($QUIK_SHOWEQU = "Yes"))) or ((PORT.BUYORG[$CURSEC] = 1) and ((PORT.BUYORG[$ADJSEC] = 0) and ($QUIK_SHOWORG = "Yes"))) or ((PORT.BUYFUEL[$CURSEC] = 1) and ((PORT.BUYFUEL[$ADJSEC] = 0) and ($QUIK_SHOWORE = "Yes"))) or ((PORT.BUYFUEL[$CURSEC] = 0) and ((PORT.BUYFUEL[$ADJSEC] = 1) and ($QUIK_SHOWORE = "Yes")))
      if ((PORT.CLASS[$CURSEC] <> 9) and ((PORT.CLASS[$ADJSEC] <> 9) and ((PORT.CLASS[$CURSEC] <> 0) and ((PORT.CLASS[$ADJSEC] <> 0) and ($LOCATION = "Command")))))
        add $MENUITEM 1
        setvar $CLASSCHK PORT.CLASS[$CURSEC]
        gosub :CHKCLASS
        setvar $CLASS1 $CLASS
        setvar $CLASSCHK PORT.CLASS[$ADJSEC]
        gosub :CHKCLASS
        setvar $CLASS2 $CLASS
        setvar $MAKEMENU[$MENUITEM] "PPT "&$CURSEC&" "&$ADJSEC
        echo ANSI_14 $MENUITEM ". " ANSI_15 "PPT - " $CURSEC&" ("&$CLASS1&")"
        if ($BUSTS[$CURSEC] = 1)
          echo ANSI_15 " (" ANSI_12 "Busted" ANSI_15 ") "
        end
        if ($LBUST = $CURSEC)
          echo ANSI_15 " (" ANSI_12 "Last Bust" ANSI_15 ") "
        end
        if ($LSTEAL = $CURSEC)
          echo ANSI_15 " (" ANSI_14 "Last Steal" ANSI_15 ") "
        end
        echo "and " $ADJSEC&" ("&$CLASS2&")"
        if ($BUSTS[$ADJSEC] = 1)
          echo ANSI_15 " (" ANSI_12 "Busted" ANSI_15 ") "
        end
        if ($LBUST = $ADJSEC)
          echo ANSI_15 " (" ANSI_12 "Last Bust" ANSI_15 ") "
        end
        if ($LSTEAL = $ADJSEC)
          echo ANSI_15 " (" ANSI_14 "Last Steal" ANSI_15 ") "
        end
        echo "*"
      end
    end
    if ((PORT.BUYEQUIP[$CURSEC] = 1) and ((PORT.BUYEQUIP[$ADJSEC] = 1) and (($ALIGN < "-100") and (($QUIK_SHOWSSM = "Yes") and ($LOCATION = "Command")))))
      add $MENUITEM 1
      setvar $MAKEMENU[$MENUITEM] "SSM "&$CURSEC&" "&$ADJSEC
      echo ANSI_14 $MENUITEM ". " ANSI_15 "SSM - " $CURSEC
      if ($BUSTS[$CURSEC] = 1)
        echo ANSI_15 " (" ANSI_12 "Busted" ANSI_15 ") "
      end
      if ($LBUST = $CURSEC)
        echo ANSI_15 " (" ANSI_12 "Last Bust" ANSI_15 ") "
      end
      if ($LSTEAL = $CURSEC)
        echo ANSI_15 " (" ANSI_14 "Last Steal" ANSI_15 ") "
      end
      echo " and " $ADJSEC
      if ($BUSTS[$ADJSEC] = 1)
        echo ANSI_15 " (" ANSI_12 "Busted" ANSI_15 ") "
      end
      if ($LBUST = $ADJSEC)
        echo ANSI_15 " (" ANSI_12 "Last Bust" ANSI_15 " )"
      end
      if ($LSTEAL = $ADJSEC)
        echo ANSI_15 " (" ANSI_14 "Last Steal" ANSI_15 ") "
      end
      echo "*"
    end
    goto :ROUND
  end
end
echo ANSI_14 "S. " ANSI_15 "Settings*"
echo ANSI_14 "Q. " ANSI_15 "Close Menu*"
if ($MENUITEM < 10)
  getconsoleinput $OPTCHOICE SINGLEKEY
else
  getconsoleinput $OPTCHOICE
end
lowercase $OPTCHOICE
isnumber $NUM $OPTCHOICE
if ($OPTCHOICE = "s")
  goto :SETMENU
elseif ($OPTCHOICE = "q")
  goto :WAIT
elseif ($NUM = 1)
  if (($OPTCHOICE <= $MENUITEM) and ($OPTCHOICE > 0))
    getword $MAKEMENU[$OPTCHOICE] $SUB 1
    getword $MAKEMENU[$OPTCHOICE] $PORT1 2
    getword $MAKEMENU[$OPTCHOICE] $PORT2 3
  else
    goto :ALNMENU
  end
  if ($SUB = "PPT")
    killalltriggers
    setvar $PORT1 $PORT1
    setvar $PORT2 $PORT2
    setvar $HAGGLE $HFACTOR
    setvar $STOPPERC $QUIK_PPTSTOP
    settextouttrigger ABORT :RETURN "~"
    gosub :PPT
  elseif ($SUB = "SSM")
    killalltriggers
    send "jy"
    setvar $PORT1 $PORT1
    setvar $PORT2 $PORT2
    setvar $HAGGLE $HFACTOR
    setvar $HAG 1
    settextouttrigger ABORT :RETURN "~"
    gosub :SSM
    killtrigger ABORT
    setvar $BUSTS[$BUSTED] 1
    write $BUSTFILE $BUSTED
    setvar $LBUST $BUSTED
    if ($PORT1 = $BUSTED)
      setvar $LSTEAL $PORT2
    else
      setvar $LSTEAL $PORT1
    end
    gosub :SAVE
  end
  goto :WAIT
else
  goto :ALNMENU
end
:RETURN

echo ANSI_15 "*Returning to Normal Operation*"
goto :WAIT
:SAVE

setvar $QUIK_AHAGGLE $AHAGGLE
setvar $QUIK_HFACTOR $HFACTOR
setvar $QUIK_SFACTOR $STEAL_FACTOR
setvar $QUIK_RFACTOR $ROB_FACTOR
setvar $QUIK_FIGKILL $FIGKILL
setvar $QUIK_BWARN $BWARN
setvar $QUIK_BWARP $BWARP
setvar $QUIK_ASTEAL $ASTEAL
setvar $QUIK_AROB $AROB
setvar $QUIK_LSTEAL $LSTEAL
setvar $QUIK_LBUST $LBUST
savevar $QUIK_AHAGGLE
savevar $QUIK_PPTSTOP
savevar $QUIK_HFACTOR
savevar $QUIK_SFACTOR
savevar $QUIK_RFACTOR
savevar $QUIK_FIGKILL
savevar $QUIK_BWARN
savevar $QUIK_BWARP
savevar $QUIK_ASTEAL
savevar $QUIK_AROB
savevar $QUIK_LSTEAL
savevar $QUIK_LBUST
savevar $QUIK_SHOWSSM
savevar $QUIK_SHOWORE
savevar $QUIK_SHOWORG
savevar $QUIK_SHOWEQU
setvar $QUIKSAVED 1
savevar $QUIKSAVED
return
:READFILE

read $FILE $AHAGGLE 1
read $FILE $HFACTOR 2
read $FILE $STEAL_FACTOR 3
read $FILE $ROB_FACTOR 4
read $FILE $FIGKILL 5
read $FILE $BWARN 6
read $FILE $BWARP 7
read $FILE $ASTEAL 8
read $FILE $AROB 9
read $FILE $LSTEAL 10
read $FILE $LBUST 11
return
:AUTOOFF

echo "*heh"
if (($AHAGGLE = "On") or ($ASTEAL = "On") or ($AROB = "On"))
  clientmessage "(SupGQuikPanel) - SupGCashing script started, turning off auto haggle, rob, steal."
  setvar $AHAGGLE "Off"
  setvar $ASTEAL "Off"
  setvar $AROB "Off"
end
goto :WAIT
:BWARPOFF

if ($BWARP = "On")
  clientmessage "(SupGQuikPanel) - SupGMove/Colo script started, turning off blind warp protection."
  setvar $BWARP "Off"
end
goto :WAIT
:KILLOFF

if ($FIGKILL = "On")
  clientmessage "(SupGQuikPanel) - SupGClearing script started, turning off auto fighter killing."
  setvar $FIGKILL "Off"
end
goto :WAIT
:DISPLAYOPTIONS
:SETDISPLAYMENU


echo "[2J"
setvar $SCRIPTNAME "SupGQuikPanel"
:DISPLAYMENU

gosub :SIGNATURE
echo ANSI_15 "Display Options*"
echo ANSI_14 "1." ANSI_15 " Display SSM Pairs      " ANSI_10 "["
echo ANSI_6 $QUIK_SHOWSSM
echo ANSI_10 "]*"
echo ANSI_14 "2." ANSI_15 " Display Fuel Pairs     " ANSI_10 "["
echo ANSI_6 $QUIK_SHOWORE
echo ANSI_10 "]*"
echo ANSI_14 "3." ANSI_15 " Display Organics Pairs " ANSI_10 "["
echo ANSI_6 $QUIK_SHOWORG
echo ANSI_10 "]*"
echo ANSI_14 "4." ANSI_15 " Display Equipment Pairs" ANSI_10 "["
echo ANSI_6 $QUIK_SHOWEQU
echo ANSI_10 "]*"
echo ANSI_14 "D." ANSI_15 " Done"
echo ANSI_5 "*Press the number of the option you*wish to change, or press" ANSI_14 " D" ANSI_5 " when you are done.**"
getconsoleinput $DISPLAYCHOICE SINGLEKEY
lowercase $DISPLAYCHOICE
if ($DISPLAYCHOICE = 1)
  if ($QUIK_SHOWSSM = "No")
    setvar $QUIK_SHOWSSM "Yes"
  else
    setvar $QUIK_SHOWSSM "No"
  end
elseif ($DISPLAYCHOICE = 2)
  if ($QUIK_SHOWORE = "No")
    setvar $QUIK_SHOWORE "Yes"
  else
    setvar $QUIK_SHOWORE "No"
  end
elseif ($DISPLAYCHOICE = 3)
  if ($QUIK_SHOWORG = "No")
    setvar $QUIK_SHOWORG "Yes"
  else
    setvar $QUIK_SHOWORG "No"
  end
elseif ($DISPLAYCHOICE = 4)
  if ($QUIK_SHOWEQU = "No")
    setvar $QUIK_SHOWEQU "Yes"
  else
    setvar $QUIK_SHOWEQU "No"
  end
elseif ($DISPLAYCHOICE = "d")
  return
else
  goto :SETDISPLAYMENU
end
goto :SETDISPLAYMENU
:SIGNATURE

echo ANSI_6 "**-" ANSI_5 "=" ANSI_6 "-" ANSI_5 "=" ANSI_10 "("
setvar $TEXT $SCRIPTNAME
gosub :ADDSPC
setvar $SCRIPTNAME $TEXT
echo ANSI_15 $SCRIPTNAME ANSI_10 ")" ANSI_5 "=" ANSI_6 "-" ANSI_5 "=" ANSI_6 "-*"
gosub :ADDSPC
return
:ADDSPC

getlength $TEXT $LEN
if ($LEN < $MAX)
  setvar $SPACES ($MAX - $LEN)
  if ($SPACES = 1)
    setvar $TEXT " "&$TEXT
  else
    setvar $SPACES ($SPACES / 2)
    setvar $CNT 0
    :ADDFRONT

    if ($CNT < $SPACES)
      add $CNT 1
      setvar $TEXT " "&$TEXT
      goto :ADDFRONT
    end
    setvar $CNT 0
    :ADDBACK

    if ($CNT < $SPACES)
      add $CNT 1
      setvar $TEXT $TEXT&" "
      goto :ADDBACK
    end
    getlength $TEXT $LEN
    if ($LEN < $MAX)
      setvar $TEXT " "&$TEXT
    end
  end
end
return
:CHECKMAX

if ($LEN > $MAX)
  setvar $MAX $LEN
end
return
:PLANET_NEG

setvar $NI 0
setvar $ORE 0
setvar $ORG 0
setvar $EQU 0
setvar $OREMCIC "-90"
setvar $ORGMCIC "-75"
setvar $EQUMCIC "-65"
if (($SDT = 1) or ($SELLOFF = 1))
  send "PN"
  waitfor "<Negotiate Planetary TradeAgreement>"
end
settextlinetrigger OREPCT :OREPCT "Fuel Ore   Buying"
settextlinetrigger ORGPCT :ORGPCT "Organics   Buying"
settextlinetrigger EQUPCT :EQUPCT "Equipment  Buying"
settexttrigger GOTPERCTS :GOTPERCTS "Registry# and Planet Name"
settexttrigger NOPLNINF :NOPLNINF "Negotiate agreement"
pause
:NOPLNINF

killtrigger OREPCT
killtrigger ORGPCT
killtrigger EQUPCT
killtrigger GOTPERCTS
killtrigger NOPLNINF
echo ANSI_15 "Could not obtain port information, unable to use Advanced Planet Trading."
return
:OREPCT

killtrigger NOPLNINF
getword CURRENTLINE $ORETRADING 4
getword CURRENTLINE $OREPERCENT 5
striptext $OREPERCENT "%"
if ($OREPERCENT < 100)
  add $OREPERCENT 1
end
pause
:ORGPCT

killtrigger NOPLNINF
getword CURRENTLINE $ORGTRADING 3
getword CURRENTLINE $ORGPERCENT 4
striptext $ORGPERCENT "%"
if ($ORGPERCENT < 100)
  add $ORGPERCENT 1
end
pause
:EQUPCT

killtrigger NOPLNINF
getword CURRENTLINE $EQUTRADING 3
getword CURRENTLINE $EQUPERCENT 4
striptext $EQUPERCENT "%"
if ($EQUPERCENT < 100)
  add $EQUPERCENT 1
end
pause
:GOTPERCTS

killtrigger OREPCT
killtrigger ORGPCT
killtrigger EQUPCT
if ($SDT = 1)
  if (($PNUM = "Auto") or ($PNUM = 0))
    :SDT_PNUM

    waitfor "-----------------"
    settextlinetrigger NUM :NUM "<"
    pause
    :NUM

    gettext CURRENTLINE $PNUM "<" ">"
    striptext $PNUM " "
    send $PNUM "*"
  else
    send $PNUM "*"
  end
end
if ($SELLOFF = 1)
  send $PNUM "*"
end
:SELLPRODUCT

echo "*Sell product*"
settexttrigger SELLFUEL :SELLFUEL "How many units of Fuel Ore"
settexttrigger SELLORG :SELLORG "How many units of Organics"
settexttrigger SELLEQU :SELLEQU "How many units of Equipment"
settextlinetrigger SELLING :AMNT_SELLING "Agreed, "
settexttrigger DONEWITHPORT :DONEWITHPORT "] (?=Help)"
pause
:SELLFUEL

killtrigger NI
setvar $PRODTOSELL "ore"
if (($SDT = 1) or ($SELLOFF = 1))
  send "0*"
end
pause
:SELLORG

killtrigger NI
setvar $PRODTOSELL "org"
if ($SDT = 1)
  send "0*"
end
if ($SELLOFF = 1)
  if (($SELLPROD = "Organics") or ($SELLPROD = "Both"))
    if ($ORGPERCENT < $MINPERC)
      send "0*"
    else
      send "*"
    end
  else
    send "0*"
  end
end
pause
:SELLEQU

killtrigger NI
if ($SDT = 1)
  send "*"
end
if ($SELLOFF = 1)
  if (($SELLPROD = "Equipment") or ($SELLPROD = "Both"))
    if ($EQUPERCENT < $MINPERC)
      send "0*"
    else
      send "*"
    end
  else
    send "0*"
  end
end
setvar $PRODTOSELL "equ"
pause
:AMNT_SELLING

echo "*Amount selling*"
killtrigger SELLFUEL
killtrigger SELLORG
killtrigger SELLEQU
killtrigger DONEWITHPORT
getword CURRENTLINE $AMNT_SELL 2
striptext $AMNT_SELL ","
:SELLHAGGLE

killalltriggers
echo "*Sell haggle*"
settexttrigger SELLFIRSTOFFER :SELLFIRSTOFFER "Your offer ["
pause
:SELLFIRSTOFFER

killtrigger SELLFIRSTOFFER
settextlinetrigger BAD_OFFER_1 :SELLHAGGLE "This is the big leagues Jr.  Make a real offer."
settextlinetrigger BAD_OFFER_2 :SELLHAGGLE "What do you take me for, a fool?  Make a real offer!"
settextlinetrigger BAD_OFFER_3 :SELLHAGGLE "WHAT?!@!? you must be crazy!"
gettext CURRENTLINE $OFFER "[" "]?"
striptext $OFFER ","
echo "*First offer*"
echo "*Offer: " $OFFER "*"
setvar $PERUNITINITOFFER $OFFER
multiply $PERUNITINITOFFER 100
divide $PERUNITINITOFFER $AMNT_SELL
setvar $PORTMAXINIT $PERUNITINITOFFER
divide $PERUNITINITOFFER 10
if ($PRODTOSELL = "ore")
  setvar $BASEVALUE 256055800
  setvar $BASEPERCENT 11725
  setvar $BASEPERCENTINVERSE 88275
  setvar $PERCENTFROMBASE $OREPERCENT
elseif ($PRODTOSELL = "org")
  setvar $BASEVALUE 506276400
  setvar $BASEPERCENT 11287
  setvar $BASEPERCENTINVERSE 88713
  setvar $PERCENTFROMBASE $ORGPERCENT
elseif ($PRODTOSELL = "equ")
  setvar $BASEVALUE 906281000
  setvar $BASEPERCENT 10989
  setvar $BASEPERCENTINVERSE 89010
  setvar $PERCENTFROMBASE $EQUPERCENT

end
if ($PERCENTFROMBASE >= 15)
  multiply $PORTMAXINIT 100000
  subtract $PORTMAXINIT $BASEVALUE
  multiply $PERCENTFROMBASE 1000
  subtract $PERCENTFROMBASE $BASEPERCENT
  divide $PORTMAXINIT $PERCENTFROMBASE
  multiply $PORTMAXINIT $BASEPERCENTINVERSE
  add $PORTMAXINIT $BASEVALUE
  divide $PORTMAXINIT 1000000
elseif ($PRODTOSELL = "ore")
  setvar $PORTMAXINIT 340
elseif ($PRODTOSELL = "org")
  setvar $PORTMAXINIT 635
elseif ($PRODTOSELL = "equ")
  setvar $PORTMAXINIT 1063
end
if ($PRODTOSELL = "ore")
  if ($PORTMAXINIT >= 436)
    setvar $MCIC "-90"
    setvar $MULTIPLE 1494
  elseif ($PORTMAXINIT >= 434)
    setvar $MCIC "-89"
    setvar $MULTIPLE 1488
  elseif ($PORTMAXINIT >= 433)
    setvar $MCIC "-88"
    setvar $MULTIPLE 1482
  elseif ($PORTMAXINIT >= 431)
    setvar $MCIC "-87"
    setvar $MULTIPLE 1476
  elseif ($PORTMAXINIT >= 429)
    setvar $MCIC "-86"
    setvar $MULTIPLE 1470
  elseif ($PORTMAXINIT >= 427)
    setvar $MCIC "-85"
    setvar $MULTIPLE 1464
  elseif ($PORTMAXINIT >= 425)
    setvar $MCIC "-84"
    setvar $MULTIPLE 1458
  elseif ($PORTMAXINIT >= 424)
    setvar $MCIC "-83"
    setvar $MULTIPLE 1452
  elseif ($PORTMAXINIT >= 422)
    setvar $MCIC "-82"
    setvar $MULTIPLE 1446
  elseif ($PORTMAXINIT >= 420)
    setvar $MCIC "-81"
    setvar $MULTIPLE 1440
  elseif ($PORTMAXINIT >= 418)
    setvar $MCIC "-80"
    setvar $MULTIPLE 1434
  elseif ($PORTMAXINIT >= 416)
    setvar $MCIC "-79"
    setvar $MULTIPLE 1429
  elseif ($PORTMAXINIT >= 414)
    setvar $MCIC "-78"
    setvar $MULTIPLE 1423
  elseif ($PORTMAXINIT >= 412)
    setvar $MCIC "-77"
    setvar $MULTIPLE 1417
  elseif ($PORTMAXINIT >= 411)
    setvar $MCIC "-76"
    setvar $MULTIPLE 1411
  elseif ($PORTMAXINIT >= 409)
    setvar $MCIC "-75"
    setvar $MULTIPLE 1405
  elseif ($PORTMAXINIT >= 407)
    setvar $MCIC "-74"
    setvar $MULTIPLE 1399
  elseif ($PORTMAXINIT >= 405)
    setvar $MCIC "-73"
    setvar $MULTIPLE 1393
  elseif ($PORTMAXINIT >= 403)
    setvar $MCIC "-72"
    setvar $MULTIPLE 1387
  elseif ($PORTMAXINIT >= 401)
    setvar $MCIC "-71"
    setvar $MULTIPLE 1381
  elseif ($PORTMAXINIT >= 399)
    setvar $MCIC "-70"
    setvar $MULTIPLE 1375
  elseif ($PORTMAXINIT >= 397)
    setvar $MCIC "-69"
    setvar $MULTIPLE 1369
  elseif ($PORTMAXINIT >= 396)
    setvar $MCIC "-68"
    setvar $MULTIPLE 1363
  elseif ($PORTMAXINIT >= 394)
    setvar $MCIC "-67"
    setvar $MULTIPLE 1357
  elseif ($PORTMAXINIT >= 392)
    setvar $MCIC "-66"
    setvar $MULTIPLE 1351
  elseif ($PORTMAXINIT >= 390)
    setvar $MCIC "-65"
    setvar $MULTIPLE 1345
  elseif ($PORTMAXINIT >= 388)
    setvar $MCIC "-64"
    setvar $MULTIPLE 1342
  elseif ($PORTMAXINIT >= 386)
    setvar $MCIC "-63"
    setvar $MULTIPLE 1336
  elseif ($PORTMAXINIT >= 384)
    setvar $MCIC "-62"
    setvar $MULTIPLE 1330
  elseif ($PORTMAXINIT >= 382)
    setvar $MCIC "-61"
    setvar $MULTIPLE 1324
  elseif ($PORTMAXINIT >= 380)
    setvar $MCIC "-60"
    setvar $MULTIPLE 1318
  elseif ($PORTMAXINIT >= 378)
    setvar $MCIC "-59"
    setvar $MULTIPLE 1312
  elseif ($PORTMAXINIT >= 376)
    setvar $MCIC "-58"
    setvar $MULTIPLE 1306
  elseif ($PORTMAXINIT >= 374)
    setvar $MCIC "-57"
    setvar $MULTIPLE 1300
  elseif ($PORTMAXINIT >= 372)
    setvar $MCIC "-56"
    setvar $MULTIPLE 1294
  elseif ($PORTMAXINIT >= 370)
    setvar $MCIC "-55"
    setvar $MULTIPLE 1291
  elseif ($PORTMAXINIT >= 368)
    setvar $MCIC "-54"
    setvar $MULTIPLE 1285
  elseif ($PORTMAXINIT >= 366)
    setvar $MCIC "-53"
    setvar $MULTIPLE 1279
  elseif ($PORTMAXINIT >= 364)
    setvar $MCIC "-52"
    setvar $MULTIPLE 1273
  elseif ($PORTMAXINIT >= 362)
    setvar $MCIC "-51"
    setvar $MULTIPLE 1267
  elseif ($PORTMAXINIT >= 360)
    setvar $MCIC "-50"
    setvar $MULTIPLE 1261
  elseif ($PORTMAXINIT >= 358)
    setvar $MCIC "-49"
    setvar $MULTIPLE 1255
  elseif ($PORTMAXINIT >= 356)
    setvar $MCIC "-48"
    setvar $MULTIPLE 1249
  elseif ($PORTMAXINIT >= 354)
    setvar $MCIC "-46"
    setvar $MULTIPLE 1246
  elseif ($PORTMAXINIT >= 352)
    setvar $MCIC "-46"
    setvar $MULTIPLE 1240
  elseif ($PORTMAXINIT >= 350)
    setvar $MCIC "-45"
    setvar $MULTIPLE 1234
  elseif ($PORTMAXINIT >= 348)
    setvar $MCIC "-44"
    setvar $MULTIPLE 1228
  elseif ($PORTMAXINIT >= 346)
    setvar $MCIC "-43"
    setvar $MULTIPLE 1222
  elseif ($PORTMAXINIT >= 344)
    setvar $MCIC "-42"
    setvar $MULTIPLE 1219
  elseif ($PORTMAXINIT >= 342)
    setvar $MCIC "-41"
    setvar $MULTIPLE 1209
  elseif ($PORTMAXINIT >= 340)
    setvar $MCIC "-40"
    setvar $MULTIPLE 1208
  else
    setvar $MCIC 0
    setvar $MULTIPLE 1208
  end
elseif ($PRODTOSELL = "org")
  if ($PORTMAXINIT >= 813)
    setvar $MCIC "-75"
    setvar $MULTIPLE 1405
  elseif ($PORTMAXINIT >= 810)
    setvar $MCIC "-74"
    setvar $MULTIPLE 1399
  elseif ($PORTMAXINIT >= 806)
    setvar $MCIC "-73"
    setvar $MULTIPLE 1393
  elseif ($PORTMAXINIT >= 802)
    setvar $MCIC "-72"
    setvar $MULTIPLE 1387
  elseif ($PORTMAXINIT >= 798)
    setvar $MCIC "-71"
    setvar $MULTIPLE 1381
  elseif ($PORTMAXINIT >= 795)
    setvar $MCIC "-70"
    setvar $MULTIPLE 1375
  elseif ($PORTMAXINIT >= 791)
    setvar $MCIC "-69"
    setvar $MULTIPLE 1369
  elseif ($PORTMAXINIT >= 787)
    setvar $MCIC "-68"
    setvar $MULTIPLE 1363
  elseif ($PORTMAXINIT >= 783)
    setvar $MCIC "-67"
    setvar $MULTIPLE 1357
  elseif ($PORTMAXINIT >= 779)
    setvar $MCIC "-66"
    setvar $MULTIPLE 1351
  elseif ($PORTMAXINIT >= 775)
    setvar $MCIC "-65"
    setvar $MULTIPLE 1345
  elseif ($PORTMAXINIT >= 772)
    setvar $MCIC "-64"
    setvar $MULTIPLE 1339
  elseif ($PORTMAXINIT >= 768)
    setvar $MCIC "-63"
    setvar $MULTIPLE 1336
  elseif ($PORTMAXINIT >= 764)
    setvar $MCIC "-62"
    setvar $MULTIPLE 1330
  elseif ($PORTMAXINIT >= 760)
    setvar $MCIC "-61"
    setvar $MULTIPLE 1324
  elseif ($PORTMAXINIT >= 756)
    setvar $MCIC "-60"
    setvar $MULTIPLE 1318
  elseif ($PORTMAXINIT >= 752)
    setvar $MCIC "-59"
    setvar $MULTIPLE 1312
  elseif ($PORTMAXINIT >= 748)
    setvar $MCIC "-58"
    setvar $MULTIPLE 1306
  elseif ($PORTMAXINIT >= 744)
    setvar $MCIC "-57"
    setvar $MULTIPLE 1300
  elseif ($PORTMAXINIT >= 740)
    setvar $MCIC "-56"
    setvar $MULTIPLE 1294
  elseif ($PORTMAXINIT >= 737)
    setvar $MCIC "-55"
    setvar $MULTIPLE 1291
  elseif ($PORTMAXINIT >= 733)
    setvar $MCIC "-54"
    setvar $MULTIPLE 1285
  elseif ($PORTMAXINIT >= 729)
    setvar $MCIC "-53"
    setvar $MULTIPLE 1279
  elseif ($PORTMAXINIT >= 725)
    setvar $MCIC "-52"
    setvar $MULTIPLE 1273
  elseif ($PORTMAXINIT >= 721)
    setvar $MCIC "-51"
    setvar $MULTIPLE 1267
  elseif ($PORTMAXINIT >= 717)
    setvar $MCIC "-50"
    setvar $MULTIPLE 1261
  elseif ($PORTMAXINIT >= 713)
    setvar $MCIC "-49"
    setvar $MULTIPLE 1255
  elseif ($PORTMAXINIT >= 709)
    setvar $MCIC "-48"
    setvar $MULTIPLE 1252
  elseif ($PORTMAXINIT >= 705)
    setvar $MCIC "-47"
    setvar $MULTIPLE 1246
  elseif ($PORTMAXINIT >= 701)
    setvar $MCIC "-46"
    setvar $MULTIPLE 1236
  elseif ($PORTMAXINIT >= 697)
    setvar $MCIC "-45"
    setvar $MULTIPLE 1233
  elseif ($PORTMAXINIT >= 693)
    setvar $MCIC "-44"
    setvar $MULTIPLE 1227
  elseif ($PORTMAXINIT >= 688)
    setvar $MCIC "-43"
    setvar $MULTIPLE 1224
  elseif ($PORTMAXINIT >= 684)
    setvar $MCIC "-42"
    setvar $MULTIPLE 1214
  elseif ($PORTMAXINIT >= 680)
    setvar $MCIC "-41"
    setvar $MULTIPLE 1213
  elseif ($PORTMAXINIT >= 676)
    setvar $MCIC "-40"
    setvar $MULTIPLE 1203
  elseif ($PORTMAXINIT >= 672)
    setvar $MCIC "-39"
    setvar $MULTIPLE 1200
  elseif ($PORTMAXINIT >= 668)
    setvar $MCIC "-38"
    setvar $MULTIPLE 1194
  elseif ($PORTMAXINIT >= 664)
    setvar $MCIC "-37"
    setvar $MULTIPLE 1191
  elseif ($PORTMAXINIT >= 660)
    setvar $MCIC "-36"
    setvar $MULTIPLE 1181
  elseif ($PORTMAXINIT >= 656)
    setvar $MCIC "-35"
    setvar $MULTIPLE 1178
  elseif ($PORTMAXINIT >= 651)
    setvar $MCIC "-34"
    setvar $MULTIPLE 1172
  elseif ($PORTMAXINIT >= 647)
    setvar $MCIC "-33"
    setvar $MULTIPLE 1166
  elseif ($PORTMAXINIT >= 643)
    setvar $MCIC "-32"
    setvar $MULTIPLE 1160
  elseif ($PORTMAXINIT >= 639)
    setvar $MCIC "-31"
    setvar $MULTIPLE 1157
  elseif ($PORTMAXINIT >= 635)
    setvar $MCIC "-30"
    setvar $MULTIPLE 1154
  else
    setvar $MCIC 0
    setvar $MULTIPLE 1154
  end
elseif ($PRODTOSELL = "equ")
  if ($PORTMAXINIT >= 1393)
    setvar $MCIC "-65"
    setvar $MULTIPLE 1347
  elseif ($PORTMAXINIT >= 1386)
    setvar $MCIC "-64"
    setvar $MULTIPLE 1341
  elseif ($PORTMAXINIT >= 1379)
    setvar $MCIC "-63"
    setvar $MULTIPLE 1336
  elseif ($PORTMAXINIT >= 1372)
    setvar $MCIC "-62"
    setvar $MULTIPLE 1330
  elseif ($PORTMAXINIT >= 1365)
    setvar $MCIC "-61"
    setvar $MULTIPLE 1324
  elseif ($PORTMAXINIT >= 1358)
    setvar $MCIC "-60"
    setvar $MULTIPLE 1319
  elseif ($PORTMAXINIT >= 1351)
    setvar $MCIC "-59"
    setvar $MULTIPLE 1313
  elseif ($PORTMAXINIT >= 1344)
    setvar $MCIC "-58"
    setvar $MULTIPLE 1307
  elseif ($PORTMAXINIT >= 1337)
    setvar $MCIC "-57"
    setvar $MULTIPLE 1302
  elseif ($PORTMAXINIT >= 1329)
    setvar $MCIC "-56"
    setvar $MULTIPLE 1296
  elseif ($PORTMAXINIT >= 1323)
    setvar $MCIC "-55"
    setvar $MULTIPLE 1291
  elseif ($PORTMAXINIT >= 1315)
    setvar $MCIC "-54"
    setvar $MULTIPLE 1285
  elseif ($PORTMAXINIT >= 1308)
    setvar $MCIC "-53"
    setvar $MULTIPLE 1279
  elseif ($PORTMAXINIT >= 1301)
    setvar $MCIC "-52"
    setvar $MULTIPLE 1274
  elseif ($PORTMAXINIT >= 1294)
    setvar $MCIC "-51"
    setvar $MULTIPLE 1268
  elseif ($PORTMAXINIT >= 1287)
    setvar $MCIC "-50"
    setvar $MULTIPLE 1262
  elseif ($PORTMAXINIT >= 1279)
    setvar $MCIC "-49"
    setvar $MULTIPLE 1254
  elseif ($PORTMAXINIT >= 1272)
    setvar $MCIC "-48"
    setvar $MULTIPLE 1247
  elseif ($PORTMAXINIT >= 1265)
    setvar $MCIC "-47"
    setvar $MULTIPLE 1246
  elseif ($PORTMAXINIT >= 1258)
    setvar $MCIC "-46"
    setvar $MULTIPLE 1241
  elseif ($PORTMAXINIT >= 1251)
    setvar $MCIC "-45"
    setvar $MULTIPLE 1235
  elseif ($PORTMAXINIT >= 1243)
    setvar $MCIC "-44"
    setvar $MULTIPLE 1229
  elseif ($PORTMAXINIT >= 1236)
    setvar $MCIC "-43"
    setvar $MULTIPLE 1224
  elseif ($PORTMAXINIT >= 1229)
    setvar $MCIC "-42"
    setvar $MULTIPLE 1218
  elseif ($PORTMAXINIT >= 1221)
    setvar $MCIC "-41"
    setvar $MULTIPLE 1213
  elseif ($PORTMAXINIT >= 1214)
    setvar $MCIC "-40"
    setvar $MULTIPLE 1208
  elseif ($PORTMAXINIT >= 1206)
    setvar $MCIC "-39"
    setvar $MULTIPLE 1201
  elseif ($PORTMAXINIT >= 1199)
    setvar $MCIC "-38"
    setvar $MULTIPLE 1196
  elseif ($PORTMAXINIT >= 1192)
    setvar $MCIC "-37"
    setvar $MULTIPLE 1190
  elseif ($PORTMAXINIT >= 1184)
    setvar $MCIC "-36"
    setvar $MULTIPLE 1185
  elseif ($PORTMAXINIT >= 1177)
    setvar $MCIC "-35"
    setvar $MULTIPLE 1180
  elseif ($PORTMAXINIT >= 1169)
    setvar $MCIC "-34"
    setvar $MULTIPLE 1174
  elseif ($PORTMAXINIT >= 1162)
    setvar $MCIC "-33"
    setvar $MULTIPLE 1169
  elseif ($PORTMAXINIT >= 1154)
    setvar $MCIC "-32"
    setvar $MULTIPLE 1164
  elseif ($PORTMAXINIT >= 1147)
    setvar $MCIC "-31"
    setvar $MULTIPLE 1158
  elseif ($PORTMAXINIT >= 1139)
    setvar $MCIC "-30"
    setvar $MULTIPLE 1152
  elseif ($PORTMAXINIT >= 1132)
    setvar $MCIC "-29"
    setvar $MULTIPLE 1149
  elseif ($PORTMAXINIT >= 1124)
    setvar $MCIC "-28"
    setvar $MULTIPLE 1144
  elseif ($PORTMAXINIT >= 1116)
    setvar $MCIC "-27"
    setvar $MULTIPLE 1136
  elseif ($PORTMAXINIT >= 1109)
    setvar $MCIC "-26"
    setvar $MULTIPLE 1132
  elseif ($PORTMAXINIT >= 1101)
    setvar $MCIC "-25"
    setvar $MULTIPLE 1126
  elseif ($PORTMAXINIT >= 1093)
    setvar $MCIC "-24"
    setvar $MULTIPLE 1122
  elseif ($PORTMAXINIT >= 1086)
    setvar $MCIC "-23"
    setvar $MULTIPLE 1117
  elseif ($PORTMAXINIT >= 1078)
    setvar $MCIC "-22"
    setvar $MULTIPLE 1110
  elseif ($PORTMAXINIT >= 1071)
    setvar $MCIC "-21"
    setvar $MULTIPLE 1105
  elseif ($PORTMAXINIT >= 1063)
    setvar $MCIC "-20"
    setvar $MULTIPLE 1102
  else
    setvar $MCIC 0
    setvar $MULTIPLE 1102
  end
end
setvar $COUNTER $OFFER
divide $COUNTER 10
multiply $COUNTER $MULTIPLE
divide $COUNTER 100
send $COUNTER&"*"
echo "*Line 791 - Waitfor counter*"
waitfor $COUNTER
setvar $MIDHAGGLES 0
:SELLOFFERLOOP

killalltriggers
echo "*Sell offer loop*"
settextlinetrigger DONEHAG :PDONE_HAGGLE "You have"
settextlinetrigger OFFERME :PREHAGGLE "We'll buy them for"
settextlinetrigger FINAL :FINALOFFER "Our final offer is"
settexttrigger NI :NI "We're not interested."
pause
:PREHAGGLE

getword CURRENTLINE $NEW_OFFER 5
striptext $NEW_OFFER ","
if ($NEW_OFFER = $OFFER)
  multiply $COUNTER 98
  divide $COUNTER 100
  send $COUNTER&"*"
  waitfor $COUNTER
  goto :SELLOFFERLOOP
else
  gettext CURRENTLINE $NEW_OFFER "for " " credits."
  striptext $NEW_OFFER ","
  setvar $OFFER_CHANGE $NEW_OFFER
  subtract $OFFER_CHANGE $OFFER
  if ($MCIC > "-35")
    multiply $OFFER_CHANGE 75
    divide $OFFER_CHANGE 100
    subtract $COUNTER $OFFER_CHANGE
    subtract $COUNTER 25
  elseif ($MCIC > "-55")
    multiply $OFFER_CHANGE 65
    divide $OFFER_CHANGE 100
    subtract $COUNTER $OFFER_CHANGE
    subtract $COUNTER 25
  else
    multiply $OFFER_CHANGE 60
    divide $OFFER_CHANGE 100
    subtract $COUNTER $OFFER_CHANGE
    subtract $COUNTER 10
  end
  send $COUNTER&"*"
  setvar $OFFER $NEW_OFFER
  waitfor $COUNTER
  add $MIDHAGGLES 1
  settexttrigger OFFERME :PREHAGGLE "We'll buy them for"
  pause
end
:FINALOFFER

killtrigger OFFERME
if (($PRODTOSELL = "ore") and (($MCIC <= "-75") and (($AMNT_SELL >= 25000) and ($MIDHAGGLES < 1))))
  setvar $FORCEFAIL 1
  setvar $THISOREFAILED 1
elseif (($PRODTOSELL = "org") and (($MCIC <= "-60") and (($AMNT_SELL >= 25000) and (($MIDHAGGLES < 2) and ($THISOREFAILED = 1)))))
  setvar $FORCEFAIL 1
  setvar $THISORGFAILED 1
elseif (($PRODTOSELL = "org") and (($MCIC <= "-60") and (($AMNT_SELL >= 15000) and (($MIDHAGGLES < 1) and ($THISOREFAILED = 1)))))
  setvar $FORCEFAIL 1
  setvar $THISORGFAILED 1
elseif (($PRODTOSELL = "equ") and ((($MCIC <= "-55") and ((($AMNT_SELL >= 20000) and ((($MIDHAGGLES < 2) and (($THISOREFAILED = 1) or ($THISORGFAILED = 1)))))))))
  setvar $FORCEFAIL 1
  setvar $THISEQUFAILED 1
elseif (($PRODTOSELL = "equ") and ((($MCIC <= "-55") and ((($AMNT_SELL >= 12000) and ((($MIDHAGGLES < 1) and (($THISOREFAILED = 1) or ($THISORGFAILED = 1)))))))))
  setvar $FORCEFAIL 1
  setvar $THISEQUFAILED 1
else
  setvar $FORCEFAIL 0
end
if ($FORCEFAIL = 0)
  getword CURRENTLINE $NEW_OFFER 5
  striptext $NEW_OFFER ","
  setvar $OFFER_CHANGE $NEW_OFFER
  subtract $OFFER_CHANGE $OFFER
  if ($PRODTOSELL = "ore")
    multiply $OFFER_CHANGE 30
  elseif ($PRODTOSELL = "org")
    multiply $OFFER_CHANGE 27
  elseif ($PRODTOSELL = "equ")
    multiply $OFFER_CHANGE 25
  end
  divide $OFFER_CHANGE 10
  subtract $COUNTER $OFFER_CHANGE
  subtract $COUNTER 10
  send $COUNTER&"*"
  pause
else
  settexttrigger DONEWITHPORT :DONEWITHPORT "] (?=Help)"
  send $COUNTER&" * * * * * n n q z n q z n "
  pause
end
:NI

setvar $NI 1
killtrigger DONEHAG
goto :SELLPRODUCT
:PDONE_HAGGLE

killtrigger NI
if ($PRODTOSELL = "ore")
  setvar $ORE 1
  setvar $CREDPEROREUNIT ($COUNTER / $AMNT_SELL)
  setvar $OREAMOUNT $AMNT_SELL
  setvar $OREPRICE $COUNTER
  setvar $FUELMCIC $MCIC
elseif ($PRODTOSELL = "org")
  setvar $ORG 1
  setvar $CREDPERORGUNIT ($COUNTER / $AMNT_SELL)
  setvar $ORGAMOUNT $AMNT_SELL
  setvar $ORGPRICE $COUNTER
  setvar $ORGSMCIC $MCIC
elseif ($PRODTOSELL = "equ")
  setvar $EQU 1
  setvar $CREDPEREQUUNIT ($COUNTER / $AMNT_SELL)
  setvar $EQUAMOUNT $AMNT_SELL
  setvar $EQUPRICE $COUNTER
  setvar $EQUIPMCIC $MCIC
end
goto :SELLPRODUCT
:DONEWITHPORT

killalltriggers
gettext CURRENTLINE $SEC "]:[" "] ("
send "'{" $BOT_NAME "} - CAP Trade, sold units at "&$SEC&":*"
if ($ORE = 1)
  send "   Ore : " $OREAMOUNT " units for " $OREPRICE ", (" $CREDPEROREUNIT "ppu) (mcic: " $FUELMCIC ")*"
  write GAMENAME&"_MCIC.txt" $SEC&" - Ore - "&$FUELMCIC
end
if ($ORG = 1)
  send "   Orgs : " $ORGAMOUNT " units for " $ORGPRICE ", (" $CREDPERORGUNIT "ppu) (mcic: " $ORGSMCIC ")*"
  write GAMENAME&"_MCIC.txt" $SEC&" - Orgs - "&$ORGSMCIC
end
if ($EQU = 1)
  send "   Equip : " $EQUAMOUNT " units for " $EQUPRICE ", (" $CREDPEREQUUNIT "ppu) (mcic: " $EQUIPMCIC ")*"
  write GAMENAME&"_MCIC.txt" $SEC&" - Equip - "&$EQUIPMCIC
end
send "*"
return
:FIX_LOCKUP

killtrigger DONEWITHPORT
settexttrigger DONEWITHPORT :DONEWITHPORT "] (?=Help)"
send "*"
pause
:HAGGLE

setvar $NI 0
setvar $MIDHAG "-1"
setvar $NOCRED 0
killtrigger 1
killtrigger 0
killtrigger DONEHAGGLING
settexttrigger DONEHAG :DONE_HAGGLE "Command [TL="
settexttrigger DONEHAGGLING :DONE_HAGGLE "empty cargo holds."
settexttrigger OFFERME :OFFERME "Your offer"
pause
:OFFERME

getword CURRENTLINE $OFFER 3
striptext $OFFER "["
striptext $OFFER "]"
striptext $OFFER ","
striptext $OFFER "?"
setvar $ORIG_OFFER $OFFER
:REHAGGLE

killtrigger 0
killtrigger 2
killtrigger 3
setvar $OFFER (($ORIG_OFFER * $MULTIPLIER) / 100)
send $OFFER "*"
add $MIDHAG 1
waitfor $OFFER
if ($MULTIPLIER > 100)
  subtract $MULTIPLIER 1
else
  add $MULTIPLIER 1
end
settexttrigger 0 :DONE_HAGGLE "How many holds of"
settexttrigger 1 :REHAGGLE "Your offer"
settexttrigger 2 :DONEHAG "We're not interested."
settexttrigger 3 :NOCREDS "You only have"
pause
:NOCREDS

setvar $NOCRED 1
send "0*0*"
goto :DONE_HAGGLE
:DONEHAG

setvar $NI 1
:DONE_HAGGLE

killtrigger DONEHAG
killtrigger 0
killtrigger 1
killtrigger 2
killtrigger 3
killtrigger REHAGGLE
killtrigger DONEHAGGLING
killtrigger OFFERME
return
:PPT

setvar $SEC $PORT1
setvar $OTHER $PORT2
setvar $STOPPER 0
gosub :QUIKSTATS
setvar $MAXHOLDS $HOLDS
setvar $FINHOLDS $ORE_HOLDS
setvar $OINHOLDS $ORGANIC_HOLDS
setvar $EINHOLDS $EQUIPMENT_HOLDS
setvar $TOTALINHOLDS ($FINHOLDS + ($OINHOLDS + $EINHOLDS))
if ($TOTALINHOLDS = $MAXHOLDS)
  if ("PORT.BUYORE[$SEC]" = 1)
    setvar $FINHOLDS 0
  end
  if (PORT.BUYORG[$SEC] = 1)
    setvar $OINHOLDS 0
  end
  if (PORT.BUYEQUIP[$SEC] = 1)
    setvar $EINHOLDS 0
  end
  setvar $TOTALINHOLDS ($FINHOLDS + ($OINHOLDS + $EINHOLDS))
  if ($TOTALINHOLDS = $MAXHOLDS)
    goto :NXTPORT
  end
end
:SUPG_PPT

killtrigger SELL
killtrigger BUY
killtrigger OFFPORT
send "pt"
waitfor "<Port>"
settexttrigger NOMORE :NOMORE "You don't have anything they want,"
settextlinetrigger FUEL :FUELAMT "Fuel Ore"
settextlinetrigger ORGS :ORGSAMT "Organics"
settextlinetrigger EQUIP :EQUIPAMT "Equipment"
settexttrigger MORETRADE :TRADERS "You have"
pause
:NOMORE

killtrigger FUEL
killtrigger ORGS
killtrigger EQUIP
killtrigger MORETRADE
return
:FUELAMT

getword CURRENTLINE $FUELAMT 5
striptext $FUELAMT "%"
pause
:ORGSAMT

getword CURRENTLINE $ORGAMT 4
striptext $ORGAMT "%"
pause
:EQUIPAMT

getword CURRENTLINE $EQUIPAMT 4
striptext $EQUIPAMT "%"
pause
:TRADERS

killtrigger NOMORE
settexttrigger SELLORBUY :SELLORBUY "]?"
settexttrigger OFFPORT :OFFPORT "Command [TL="
pause
:SELLORBUY

gettext CURRENTLINE $SLLOBY "to " " ["
if ($SLLOBY = "sell")
  goto :SELL
else
  goto :BUY
end
:SELL

killtrigger OFFPORT
getword CURRENTLINE $PRODUCT 5
send "*"
setvar $MULTIPLIER (100 + $HAGGLE)
gosub :HAGGLE
if ($NI = 1)
  goto :SUPG_PPT
end
gosub :STOPPER
settexttrigger SELLORBUY :SELLORBUY "]?"
pause
:BUY

killtrigger OFFPORT
killtrigger SELLORBUY
getword CURRENTLINE $PRODUCT 5
if ($PRODUCT = "Fuel")
  if ((PORT.BUYEQUIP[$SEC] = 0) and (PORT.BUYEQUIP[$OTHER] = 1)) or ((PORT.BUYORG[$SEC] = 0) and (PORT.BUYORG[$OTHER] = 1)) or (PORT.BUYFUEL[$OTHER] = 0)
    send "0*"
    gosub :STOPPER
    goto :TRADERS
  else
    gosub :BUYIT
  end
elseif ($PRODUCT = "Organics")
  if ((PORT.BUYEQUIP[$SEC] = 0) and (PORT.BUYEQUIP[$OTHER] = 1)) or (PORT.BUYORG[$OTHER] = 0)
    send "0*"
    gosub :STOPPER
    goto :TRADERS
  else
    gosub :BUYIT
  end
else
  if (PORT.BUYEQUIP[$OTHER] = 0)
    send "0*"
  else
    gosub :BUYIT
  end
end
if ($NI = 1)
  goto :SUPG_PPT
end
:OFFPORT

killtrigger SELLORBUY
gosub :STOPPER
:NXTPORT

if ($STOPPER = 0)
  setvar $OTHER $SEC
  if ($SEC = $PORT1)
    setvar $SEC $PORT2
  else
    setvar $SEC $PORT1
  end
  send "m" $SEC "**  "
  goto :SUPG_PPT
else
  killtrigger SELL
  killtrigger BUY
  return
end
:STOPPER

if ($PRODUCT = "Fuel")
  if ($FUELAMT <= $STOPPERC)
    if ((PORT.BUYEQUIP[$SEC] = 0) and (PORT.BUYEQUIP[$OTHER] = 1)) or ((PORT.BUYEQUIP[$SEC] = 1) and (PORT.BUYEQUIP[$OTHER] = 0)) or ((PORT.BUYORG[$SEC] = 0) and (PORT.BUYORG[$OTHER] = 1)) or ((PORT.BUYORG[$SEC] = 1) and (PORT.BUYORG[$OTHER] = 0))
      if ($FUELAMT = 0)
        setvar $STOPPER 1
      else
        setvar $STOPPER 0
      end
    else
      setvar $STOPPER 1
    end
  end
elseif ($PRODUCT = "Organics")
  if ($ORGAMT <= $STOPPERC)
    if ((PORT.BUYEQUIP[$SEC] = 0) and (PORT.BUYEQUIP[$OTHER] = 1)) or ((PORT.BUYEQUIP[$SEC] = 1) and (PORT.BUYEQUIP[$OTHER] = 0))
      if ($ORGAMT = 0)
        setvar $STOPPER 1
      else
        setvar $STOPPER 0
      end
    else
      setvar $STOPPER 1
    end
  end
elseif ($PRODUCT = "Equipment")
  if ($EQUIPAMT <= $STOPPERC)
    setvar $STOPPER 1
  end
end
return
:BUYIT

send "*"
setvar $MULTIPLIER (100 - $HAGGLE)
gosub :HAGGLE
return
:DONE_READ

killtrigger GETLINE
setvar $HCOUNT 0
:HCOUNT

if ($HCOUNT < 27)
  add $HCOUNT 1
  setvar $LNCOUNT 1
  :LNCOUNT

  if ($LNCOUNT < $CNT)
    add $LNCOUNT 1
    getwordpos $LINE[$LNCOUNT] $POS $H[$HCOUNT]
    if ($POS > 0)
      setvar $WORK $LINE[$LNCOUNT]
      cuttext $WORK $WORK $POS 9999
      uppercase $H[$HCOUNT]
      getword $WORK $QUIKSTATS[$H[$HCOUNT]] 2
      striptext $QUIKSTATS[$H[$HCOUNT]] ","
    else
      goto :LNCOUNT
    end
  end
  goto :HCOUNT
end
return
:EXPRESS

send "m" $EXPRESSTO "*"
settexttrigger TWARP :NO_TWARP "Do you want to engage the TransWarp drive?"
settexttrigger EXPRESS :EXPRESS_WARP "Engage the Autopilot?"
settexttrigger IN_ADJ :THERE "Sector  : "&$EXPRESSTO
settexttrigger VOIDED_SEC :VOIDED "Do you really want to warp there?"
settexttrigger INSEC :THERE "You are already in that sector!"
settexttrigger IG :IGD "An Interdictor Generator in this sector holds you fast!"
settexttrigger IG2 :IGD "<Re-Display>"
settexttrigger NOTURNS :EXP_NOTURNS "You don't have enough turns left."
pause
:VOIDED

killtrigger IG2
killtrigger NOTURNS
killtrigger IG
killtrigger TWARP
killtrigger EXPRESS
killtrigger HITFIG
killtrigger HITMINE
killtrigger CLEAR
killtrigger DONE
killtrigger CONTINUE
killtrigger IN_ADJ
killtrigger INSEC
getword CURRENTLINE $VOID 7
send "n"
setvar $EXPRESSTO "-2"
return
:EXP_NOTURNS

killtrigger IG2
killtrigger NOTURNS
killtrigger IG
killtrigger TWARP
killtrigger EXPRESS
killtrigger HITFIG
killtrigger HITMINE
killtrigger CLEAR
killtrigger DONE
killtrigger CONTINUE
killtrigger IN_ADJ
killtrigger INSEC
setvar $EXPRESSTO "-3"
return
:NO_TWARP

killtrigger NOTURNS
killtrigger IG
killtrigger IN_ADJ
killtrigger EXPRESS
killtrigger VOIDED_SEC
killtrigger IG2
send "n"
:EXPRESS_WARP

killtrigger NOTURNS
killtrigger IG
killtrigger TWARP
killtrigger IN_ADJ
killtrigger VOIDED_SEC
killtrigger IG2
send "e"
:THERE

killtrigger IG2
killtrigger NOTURNS
killtrigger IG
killtrigger VOIDED_SEC
killtrigger TWARP
killtrigger EXPRESS
killtrigger INSEC
gosub :CLEAR_SECTOR
return
:CLEAR_SECTOR

settexttrigger HITFIG :HIT_FIG "Your fighters:"
settexttrigger HITMINE :HIT_MINE "Mined Sector: Do you wish to Avoid this sector in the future? (Y/N)"
settexttrigger CLEAR :READY_STATE "Autopilot disengaging."
settexttrigger DONE :READY_STATE "Command [TL="
if ($SINGLESTEP = 1)
  settexttrigger CONTINUE :READY_STATE "Stop in this sector"
else
  settexttrigger CONTINUE :KEEP_ROLLIN "Stop in this sector"
end
settexttrigger IG :IGD "An Interdictor Generator in this sector holds you fast!"
settexttrigger PAUSE :PAUSE "[Pause]"
settexttrigger NOTURNS :EXP_NOTURNS "You don't have enough turns left."
pause
:PAUSE

send "*"
settexttrigger PAUSE :PAUSE "[Pause]"
pause
:KEEP_ROLLIN

send "n"
settexttrigger CONTINUE :KEEP_ROLLIN "Stop in this sector"
pause
:HIT_FIG

send "a999989796954939291911*"
settexttrigger HITFIG :HIT_FIG "Your fighters:"
pause
:HIT_MINE

send "n"
settexttrigger HITMINE :HIT_MINE "Mined Sector: Do you wish to Avoid this sector in the future? (Y/N)"
pause
:READY_STATE

killtrigger IG2
killtrigger NOTURNS
killtrigger IG
killtrigger TWARP
killtrigger EXPRESS
killtrigger HITFIG
killtrigger HITMINE
killtrigger CLEAR
killtrigger DONE
killtrigger CONTINUE
killtrigger IN_ADJ
killtrigger INSEC
killtrigger PAUSE
return
:IGD

killtrigger IG2
killtrigger NOTURNS
killtrigger IG
killtrigger TWARP
killtrigger EXPRESS
killtrigger HITFIG
killtrigger HITMINE
killtrigger CLEAR
killtrigger DONE
killtrigger CONTINUE
killtrigger IN_ADJ
killtrigger INSEC
killtrigger PAUSE
setvar $EXPRESSTO "-1"
return
:TWARP

send "m" $TWARPTO "*"
settexttrigger TWARP :TW_TWARP "Do you want to engage the TransWarp drive?"
settexttrigger NOTWARP :TW_NOTWARP "The shortest path ("
settexttrigger ADJACENT :TW_THERE "Sector  : "&$TWARPTO
settexttrigger IG :TW_IGD "An Interdictor Generator in this sector holds you fast!"
settexttrigger NOMOVE :TW_THERE "You are already in that sector!"
settexttrigger NOTURNS :TW_NOTURNS "You don't have enough turns left."
settexttrigger VOIDED :TW_NOTWARP "No route within"
pause
:TW_TWARP

killtrigger VOIDED
killtrigger NOTURNS
killtrigger NOMOVE
killtrigger NOTWARP
killtrigger ADJACENT
killtrigger IG
send "y"
settexttrigger GOGO :TW_SAFE "All Systems Ready, shall we engage?"
settexttrigger OUTAFUEL :TW_OUTAFUEL "You do not have enough Fuel Ore to make the jump."
settexttrigger NOGO :TW_BLIND "Do you want to make this jump blind?"
pause
:TW_SAFE

send "y  "
:TW_THERE

killtrigger VOIDED
killtrigger NOTURNS
killtrigger NOMOVE
killtrigger NOTWARP
killtrigger ADJACENT
killtrigger IG
killtrigger TWARP
killtrigger GOGO
killtrigger OUTAFUEL
killtrigger NOGO
gosub :CLEAR_SECTOR
return
:TW_NOTWARP

killtrigger VOIDED
killtrigger NOTURNS
killtrigger NOMOVE
killtrigger NOTWARP
killtrigger ADJACENT
killtrigger IG
killtrigger TWARP
send "n"
setvar $TWARPTO "-1"
return
:TW_IG

killtrigger VOIDED
killtrigger NOTURNS
killtrigger NOMOVE
killtrigger NOTWARP
killtrigger ADJACENT
killtrigger IG
killtrigger TWARP
setvar $TWARPTO "-2"
return
:TW_OUTAFUEL

killtrigger VOIDED
killtrigger NOTURNS
killtrigger NOMOVE
killtrigger GOGO
killtrigger OUTAFUEL
killtrigger NOGO
setvar $TWARPTO "-3"
return
:TW_BLIND

killtrigger VOIDED
killtrigger NOTURNS
killtrigger NOMOVE
killtrigger GOGO
killtrigger OUTAFUEL
killtrigger NOGO
send "n"
setvar $TWARPTO "-4"
return
:XPORT

send "x  "
settexttrigger CHOOSE :XP_CHOOSE "Choose which ship to"
settexttrigger NOSHIPS :XP_NOSHIPS "You do not own any other ships!"
pause
:XP_CHOOSE

killtrigger NOSHIPS
send $XPORTTO "*  q"
settexttrigger NOTURNS :XP_NOTURNS "You don't have any turns left!"
settexttrigger NOSHIP :XP_NOSHIP "That is not an available ship."
settexttrigger XPORT :XP_XPORT "Security code accepted,"
settexttrigger NOCEO :XP_NOCEO "Your retinal scan does not match"
settexttrigger RANGE :XP_RANGE "only has a transport range of"
settexttrigger COMM :XP_COMMISH "You are not commissioned by the"
settexttrigger EXP :XP_EXPERIENCE "You need "
settexttrigger NOSHIPS :XP_NOSHIP "You do not own any other ships!"
pause
:XP_NOTURNS

killtrigger NOTURNS
killtrigger NOSHIP
killtrigger NOSHIPS
killtrigger XPORT
killtrigger NOCEO
killtrigger RANGE
killtrigger COMM
killtrigger EXP
setvar $XPORTTO "-1"
return
:XP_NOSHIP

killtrigger NOSHIPS
killtrigger CHOOSE
killtrigger NOSHIP
killtrigger NOTURNS
killtrigger NOSHIP
killtrigger XPORT
killtrigger NOCEO
killtrigger RANGE
killtrigger COMM
killtrigger EXP
setvar $XPORTTO "-2"
return
:XP_NOCEO

killtrigger NOSHIPS
killtrigger NOTURNS
killtrigger NOSHIP
killtrigger XPORT
killtrigger NOCEO
killtrigger RANGE
killtrigger COMM
killtrigger EXP
setvar $XPORTTO "-3"
return
:XP_NOSHIPS

killtrigger NOSHIPS
killtrigger CHOOSE
killtrigger NOSHIP
killtrigger NOTURNS
killtrigger NOSHIP
killtrigger XPORT
killtrigger NOCEO
killtrigger RANGE
killtrigger COMM
killtrigger EXP
setvar $XPORTTO "-7"
return
:XP_RANGE

killtrigger NOSHIPS
killtrigger NOTURNS
killtrigger NOSHIP
killtrigger XPORT
killtrigger NOCEO
killtrigger RANGE
killtrigger COMM
killtrigger EXP
setvar $XPORTTO "-4"
return
:XP_COMMISH

killtrigger NOTURNS
killtrigger NOSHIP
killtrigger XPORT
killtrigger NOCEO
killtrigger RANGE
killtrigger COMM
killtrigger EXP
killtrigger NOSHIPS
setvar $XPORTTO "-5"
return
:XP_EXPERIENCE

killtrigger NOSHIPS
killtrigger NOTURNS
killtrigger NOSHIP
killtrigger XPORT
killtrigger NOCEO
killtrigger RANGE
killtrigger COMM
killtrigger EXP
setvar $XPORTTO "-6"
return
:XP_XPORT

killtrigger NOSHIPS
killtrigger NOTURNS
killtrigger NOSHIP
killtrigger XPORT
killtrigger NOCEO
killtrigger RANGE
killtrigger COMM
killtrigger EXP
return
:PTORP

settexttrigger FIRED :PT_FIRED "Photon Wave Duration"
settexttrigger NOTADJ :PT_NOTADJ "That is not an adjacent sector"
settexttrigger PTORDIS :PT_DISABLE "Photon Missiles are disabled."
settexttrigger NOFIRE :PT_NOFIRE "<Computer deactivated>"
settexttrigger FED :PT_FED "The Feds do not permit"
settexttrigger NOTORPS :PT_NOTORPS "You do not have any Photon Missiles!"
send "cpy  " $PHOTONTO "*q"
pause
:PT_FIRED

killtrigger NOTADJ
killtrigger PTORDIS
killtrigger NOFIRE
killtrigger FED
killtrigger NOTORPS
return
:PT_NOTADJ

killtrigger FIRED
killtrigger PTORDIS
killtrigger NOFIRE
killtrigger FED
killtrigger NOTORPS
setvar $PHOTONTO "-1"
send "q"
return
:PT_DISABLE

killtrigger FIRED
killtrigger NOFIRE
killtrigger FED
killtrigger NOTADJ
killtrigger NOTORPS
setvar $PHOTONTO "-2"
return
:PT_NOFIRE

killtrigger FIRED
killtrigger FED
killtrigger NOTADJ
killtrigger PTORDIS
killtrigger NOTORPS
setvar $PHOTONTO "-3"
return
:PT_FED

killtrigger FIRED
killtrigger NOFIRE
killtrigger NOTADJ
killtrigger PTORDIS
killtrigger NOTORPS
setvar $PHOTONTO "-4"
return
:PT_NOTORPS

killtrigger FIRED
killtrigger NOFIRE
killtrigger NOTADJ
killtrigger PTORDIS
killtrigger FED
setvar $PHOTONTO "-5"
return
:SETVOIDS

send "d"
waitfor "<Re-Display>"
settexttrigger CURSEC :VOID_CURSEC "] (?=Help)? :"
pause
:VOID_CURSEC

gettext CURRENTLINE $CURSEC "]:[" "] (?=Help)? :"
setvar $SETVOIDS 1
send "c"
while ($SETVOIDS <= SECTOR.WARPCOUNT[$CURSEC])
  send "v" SECTOR.WARPS[$CURSEC][$SETVOIDS] "*"
  add $SETVOIDS 1
end
send "q"
return
:CLEARVOIDS

send "d"
waitfor "<Re-Display>"
settexttrigger CURSEC :CLEARVOID_CURSEC "] (?=Help)? :"
pause
:CLEARVOID_CURSEC

gettext CURRENTLINE $CURSEC "]:[" "] (?=Help)? :"
setvar $SETVOIDS 1
send "c"
while ($SETVOIDS <= SECTOR.WARPCOUNT[$CURSEC])
  echo " " $SETVOIDS " "
  send "v0*yn" SECTOR.WARPS[$CURSEC][$SETVOIDS] "*"
  add $SETVOIDS 1
end
send "q"
return
:SSM

setvar $NOEXP 0
setvar $SEC $PORT1
gosub :QUIKSTATS
setvar $EXP $EXPERIENCE
setvar $THOLD $TOTAL_HOLDS
:STEAL

setvar $MAXHOLD $EXP
divide $MAXHOLD $STEAL_FACTOR
if ($MAXHOLD > $THOLD)
  setvar $MAXHOLD $THOLD
end
:SPORT

send "p  r  *  s  t  "
settexttrigger FAKE :FBUSTED "Corporate command [TL="
settexttrigger GOOD :CONT "Which product?"
pause
:CONT

killtrigger FAKE
settexttrigger SUCCESS :SUCCESS "Success!"
settexttrigger BUSTED :BUSTED "Suddenly you're Busted"
settexttrigger UPGRADE :UPGRADE "There aren't that many holds"
send "  3  " $MAXHOLD "   *   "
pause
:UPGRADE

killtrigger SUCCESS
killtrigger BUSTED
setvar $UPGRADE (($MAXHOLD / 10) + 1)
setvar $UPG_AMNT $UPGRADE
setvar $UPG_PROD 3
gosub :UPGRADEPORT
if ($UPG_AMNT = "-1")
  send "'{" $BOT_NAME "} - SSM - Could not upgrade port, it's either maxed or I don't have enough money*"
  goto :WAIT
end
goto :SPORT
:SUCCESS

killtrigger BUSTED
killtrigger UPGRADE
setvar $ADDEXP $MAXHOLD
multiply $ADDEXP 90
if ($ADDEXP < 1000)
  goto :NOREC
end
divide $ADDEXP 1000
add $EXP $ADDEXP
:RHAG

send "  p  t  *  "
setvar $MULTIPLIER (100 + $HAGGLE)
if (($HAG = 1) and ($MULTIPLIER <> 100))
  waitfor "How many holds of"
  setvar $NI 0
  gosub :HAGGLE
  if ($NI = 1)
    goto :RHAG
  end
else
  send "*"
end
if (PORT.BUYFUEL[$SEC] = 0)
  send "  0*  "
end
if (PORT.BUYORG[$SEC] = 0)
  send "  0*  "
end
if ($SEC = $PORT1)
  setvar $SEC $PORT2
else
  setvar $SEC $PORT1
end
send "   m   " $SEC "*   z   a   9999   *   z   r   *   "
goto :STEAL
:FBUSTED

killtrigger GOOD
send "   q   q   z   n   *   "
:BUSTED

killtrigger SUCCESS
killtrigger UPGRADE
setvar $BUSTED $SEC
return
:NOREC

echo "*Not enough experience*"
setvar $NOEXP 1
return
:HAGGLE

setvar $NI 0
setvar $MIDHAG "-1"
setvar $NOCRED 0
killtrigger 1
killtrigger 0
killtrigger DONEHAGGLING
settexttrigger DONEHAG :DONE_HAGGLE "Command [TL="
settexttrigger DONEHAGGLING :DONE_HAGGLE "empty cargo holds."
settexttrigger OFFERME :OFFERME "Your offer"
pause
:OFFERME

getword CURRENTLINE $OFFER 3
striptext $OFFER "["
striptext $OFFER "]"
striptext $OFFER ","
striptext $OFFER "?"
setvar $ORIG_OFFER $OFFER
:REHAGGLE

killtrigger 0
killtrigger 2
killtrigger 3
setvar $OFFER (($ORIG_OFFER * $MULTIPLIER) / 100)
send $OFFER "*"
add $MIDHAG 1
waitfor $OFFER
if ($MULTIPLIER > 100)
  subtract $MULTIPLIER 1
else
  add $MULTIPLIER 1
end
settexttrigger 0 :DONE_HAGGLE "How many holds of"
settexttrigger 1 :REHAGGLE "Your offer"
settexttrigger 2 :DONEHAG "We're not interested."
settexttrigger 3 :NOCREDS "You only have"
pause
:NOCREDS

echo "No creds*"
setvar $NOCRED 1
send "   0*   0*   "
goto :DONE_HAGGLE
:DONEHAG

echo "Done hag*"
setvar $NI 1
:DONE_HAGGLE

killtrigger DONEHAG
killtrigger 0
killtrigger 1
killtrigger 2
killtrigger 3
killtrigger REHAGGLE
killtrigger DONEHAGGLING
killtrigger OFFERME
return
:UPGRADEPORT

send "   o   " $UPG_PROD
settexttrigger MAXUPG :MAXUPG "to quit)"
pause
:MAXUPG

getword CURRENTLINE $UPG_MAXUPG 9
striptext $UPG_MAXUPG "("
if ($UPG_MAXUPG < $UPG_AMNT)
  setvar $UPG_AMNT "-1"
else
  send $UPG_AMNT "  *  q  "
end
return
:QUIKSTATS


setvar $CURRENT_PROMPT "Undefined"
killtrigger NOPROMPT
killtrigger PROMPT
killtrigger PROMPT1
killtrigger PROMPT2
killtrigger PROMPT3
killtrigger PROMPT4
killtrigger STATLINETRIG
killtrigger GETLINE2
settextlinetrigger PROMPT :ALLPROMPTS #145&#8
settextlinetrigger STATLINETRIG :STATSTART #179
send #145&"/"
pause
:ALLPROMPTS

getword CURRENTLINE $CURRENT_PROMPT 1
striptext $CURRENT_PROMPT #145
striptext $CURRENT_PROMPT #8
settextlinetrigger PROMPT :ALLPROMPTS #145&#8
pause
:STATSTART

killtrigger PROMPT
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
:UPGRADEPORT


send "o" $UPG_PROD
settexttrigger MAXUPG :MAXUPG "to quit)"
pause
:MAXUPG

getword CURRENTLINE $UPG_MAXUPG 9
striptext $UPG_MAXUPG "("

if ($UPG_MAXUPG < $UPG_AMNT)
  setvar $UPG_AMNT "-1"
else
  send $UPG_AMNT "*q"
end
return
:CHKCLASS

if ($CLASSCHK = 0)
  setvar $CLASS "Class 0"
elseif ($CLASSCHK = 1)
  setvar $CLASS "BBS"
elseif ($CLASSCHK = 2)
  setvar $CLASS "BSB"
elseif ($CLASSCHK = 3)
  setvar $CLASS "SBB"
elseif ($CLASSCHK = 4)
  setvar $CLASS "SSB"
elseif ($CLASSCHK = 5)
  setvar $CLASS "SBS"
elseif ($CLASSCHK = 6)
  setvar $CLASS "BSS"
elseif ($CLASSCHK = 7)
  setvar $CLASS "SSS"
elseif ($CLASSCHK = 8)
  setvar $CLASS "BBB"
elseif ($CLASSCHK = 9)
  setvar $CLASS "StarDock"
else
  setvar $CLASS "Unknown"
end
return
:UPDATE_CIM

send "^r"
:CIM_TRIG

settextlinetrigger NEXT :NEXT
pause
:NEXT

setvar $INFO CURRENTLINE
getword $INFO $END_TEST 1
if ($END_TEST = 0)
  goto :DONE
end
goto :CIM_TRIG
:DONE

send "Q"
return
:CN

settextlinetrigger CN1 :CN1 "(1) ANSI graphics"
settextlinetrigger CN2 :CN2 "(2) Animation display"
settextlinetrigger CN3 :CN3 "(3) Page on messages"
settextlinetrigger CN4 :CN4 "(4) Sub-space radio channel"
settextlinetrigger CN5 :CN5 "(5) Federation comm-link"
settextlinetrigger CN6 :CN6 "(6) Receive private hails"
settextlinetrigger CN7 :CN7 "(7) Silence ALL messages"
settextlinetrigger CN9 :CN9 "(9) Abort display on keys"
settextlinetrigger CNA :CNA "(A) Message Display Mode"
settextlinetrigger CNB :CNB "(B) Screen Pauses"
settextlinetrigger CNC :CNC "(C) Online Auto Flee"
send "cn"
pause
:CN1

getword CURRENTLINE $SET1 5
pause
:CN2

getword CURRENTLINE $SET2 5
pause
:CN3

getword CURRENTLINE $SET3 6
pause
:CN4

getword CURRENTLINE $SET4 6
pause
:CN5

getword CURRENTLINE $SET5 5
pause
:CN6

getword CURRENTLINE $SET6 6
pause
:CN7

getword CURRENTLINE $SET7 6
pause
:CN9

getword CURRENTLINE $SET9 7
pause
:CNA

getword CURRENTLINE $SETA 6
pause
:CNB

getword CURRENTLINE $SETB 5
pause
:CNC

getword CURRENTLINE $SETC 6
if ($CN1 <> 0)
  if ($SET1 <> $CN1)
    setvar $CN1CHANGE 1
    send 1
  end
end
if ($CN2 <> 0)
  if ($SET2 <> $CN2)
    setvar $CN2CHANGE 1
    send 2
  end
end
if ($CN3 <> 0)
  if ($SET3 <> $CN3)
    setvar $CN3CHANGE 1
    send 3
  end
end
if ($CN4 <> 0)
  if ($SET4 <> $CN4)
    setvar $CN4CHANGE 1
    send 4 $CN4 "*"
  end
end
if ($CN5 <> 0)
  if ($SET5 <> $CN5)
    setvar $CN5CHANGE 1
    send 5
  end
end
if ($CN6 <> 0)
  if ($SET6 <> $CN6)
    setvar $CN6CHANGE 1
    send 6
  end
end
if ($CN7 <> 0)
  if ($SET7 <> $CN7)
    setvar $CN7CHANGE 1
    send 7
  end
end
if ($CN9 <> 0)
  setvar $CN9CHANGE 0
  if ($SET9 <> $CN9)
    setvar $CN9CHANGE 1
    send 9
  end
end
if ($CNA <> 0)
  if ($SETA <> $CNA)
    setvar $CNACHANGE 1
    send "a"
  end
end
if ($CNB <> 0)
  if ($SETB <> $CNB)
    setvar $CNBCHANGE 1
    send "b"
  end
end
if ($CNC <> 0)
  if ($SETC <> $CNC)
    setvar $CNCCHANGE 1
    send "c"
  end
end
send "qq"
return
