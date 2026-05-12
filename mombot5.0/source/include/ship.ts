#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:SHIP~GETSHIPCAPSTATS
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
send "cn"
waiton "(2) Animation display"
getword CURRENTLINE $SHIP~ANSI_ONOFF 5
if ($SHIP~ANSI_ONOFF = "On")
  send "2qq"
else
  send "qq"
end
setarray $SHIP~ALPHA 20
delete $SHIP~CAP_FILE
setvar $SHIP~ALPHA[1] "A"
setvar $SHIP~ALPHA[2] "B"
setvar $SHIP~ALPHA[3] "C"
setvar $SHIP~ALPHA[4] "D"
setvar $SHIP~ALPHA[5] "E"
setvar $SHIP~ALPHA[6] "F"
setvar $SHIP~ALPHA[7] "G"
setvar $SHIP~ALPHA[8] "H"
setvar $SHIP~ALPHA[9] "I"
setvar $SHIP~ALPHA[10] "J"
setvar $SHIP~ALPHA[11] "K"
setvar $SHIP~ALPHA[12] "L"
setvar $SHIP~ALPHA[13] "M"
setvar $SHIP~ALPHA[14] "N"
setvar $SHIP~ALPHA[15] "O"
setvar $SHIP~ALPHA[16] "P"
setvar $SHIP~ALPHA[17] "R"
setvar $SHIP~ALPHALOOP 0
setvar $SHIP~TOTALSHIPS 0
setvar $SHIP~FIRSTSHIPNAME ""
setvar $SHIP~NEXTPAGE 1
send "CC@?"
waiton "Average Interval Lag"

:SHIP~SHP_LOOP
settextlinetrigger GRAB_SHIP :SHIP~SHP_SHIPNAMES "> "
pause

:SHIP~SHP_SHIPNAMES
if (CURRENTLINE = "")
  goto :SHIP~SHP_LOOP
end
getword CURRENTLINE $SHIP~STOPPER 1
if ($SHIP~STOPPER = "<+>")
  send "+"
  waiton "(?=List) ?"
  setvar $SHIP~NEXTPAGE 1
  goto :SHIP~SHP_LOOP
elseif ($SHIP~STOPPER = "<Q>")
  goto :SHIP~SHP_GETSHIPSTATS
end
if ($SHIP~NEXTPAGE = 1)
  setvar $SHIP~SHIPNAME CURRENTLINE
  striptext $SHIP~SHIPNAME "<A> "
  if ($SHIP~SHIPNAME = $SHIP~FIRSTSHIPNAME)
    goto :SHIP~SHP_GETSHIPSTATS
  end
  setvar $SHIP~NEXTPAGE 0
end
add $SHIP~TOTALSHIPS 1
if ($SHIP~TOTALSHIPS = 1)
  setvar $SHIP~FIRSTSHIPNAME CURRENTLINE
  striptext $SHIP~FIRSTSHIPNAME "<A> "
end
goto :SHIP~SHP_LOOP

:SHIP~SHP_GETSHIPSTATS
setvar $SHIP~SHIPSTATLOOP 0
:SHIP~SHP_SHIPSTATS
while ($SHIP~SHIPSTATLOOP < $SHIP~TOTALSHIPS)
  add $SHIP~SHIPSTATLOOP 1
  add $SHIP~ALPHALOOP 1
  if ($SHIP~ALPHALOOP > 17)
    send "+"
    setvar $SHIP~ALPHALOOP 1
  end
  send $SHIP~ALPHA[$SHIP~ALPHALOOP]
  settextlinetrigger SN :SHIP~SN "Ship Class :"
  pause
  :SHIP~SN
  setvar $SHIP~LINE CURRENTLINE
  getwordpos $SHIP~LINE $SHIP~POS ":"
  add $SHIP~POS 2
  cuttext $SHIP~LINE $SHIP~SHIP_NAME $SHIP~POS 999
  settextlinetrigger HC :SHIP~HC "Basic Hold Cost:"
  pause
  :SHIP~HC
  setvar $SHIP~LINE CURRENTLINE
  striptext $SHIP~LINE "Basic Hold Cost:"
  striptext $SHIP~LINE "Initial Holds:"
  striptext $SHIP~LINE "Maximum Shields:"
  getword $SHIP~LINE $SHIP~INIT_HOLDS 2
  getword $SHIP~LINE $SHIP~MAX_SHIELDS 3
  striptext $SHIP~MAX_SHIELDS ","
  settextlinetrigger OO :SHIP~OO2 "Offensive Odds:"
  pause
  :SHIP~OO2
  setvar $SHIP~LINE CURRENTLINE
  striptext $SHIP~LINE "Main Drive Cost:"
  striptext $SHIP~LINE "Max Fighters:"
  striptext $SHIP~LINE "Offensive Odds:"
  getword $SHIP~LINE $SHIP~MAX_FIGS 2
  getword $SHIP~LINE $SHIP~OFF_ODDS 3
  striptext $SHIP~MAX_FIGS ","
  striptext $SHIP~OFF_ODDS ":1"
  striptext $SHIP~OFF_ODDS "."
  settextlinetrigger DO :SHIP~DO "Defensive Odds:"
  pause
  :SHIP~DO
  setvar $SHIP~LINE CURRENTLINE
  striptext $SHIP~LINE "Computer Cost:"
  striptext $SHIP~LINE "Turns Per Warp:"
  striptext $SHIP~LINE "Defensive Odds:"
  getword $SHIP~LINE $SHIP~DEF_ODDS 3
  striptext $SHIP~DEF_ODDS ":1"
  striptext $SHIP~DEF_ODDS "."
  getword $SHIP~LINE $SHIP~TPW 2
  settextlinetrigger SC :SHIP~SC "Ship Base Cost:"
  pause
  :SHIP~SC
  setvar $SHIP~LINE CURRENTLINE
  striptext $SHIP~LINE "Ship Base Cost:"
  getword $SHIP~LINE $SHIP~COST 1
  striptext $SHIP~COST ","
  getlength $SHIP~COST $SHIP~COSTLEN
  if ($SHIP~COSTLEN = 7)
    add $SHIP~COST 10000000
  end
  settextlinetrigger MH :SHIP~MH "Maximum Holds:"
  pause
  :SHIP~MH
  setvar $SHIP~LINE CURRENTLINE
  striptext $SHIP~LINE "Maximum Holds:"
  getword $SHIP~LINE $SHIP~MAX_HOLDS 1
  setvar $SHIP~ISDEFENDER FALSE
  write $SHIP~CAP_FILE $SHIP~MAX_SHIELDS&" "&$SHIP~DEF_ODDS&" "&$SHIP~OFF_ODDS&" "&$SHIP~COST&" "&$SHIP~MAX_HOLDS&" "&$SHIP~MAX_FIGS&" "&$SHIP~INIT_HOLDS&" "&$SHIP~TPW&" "&$SHIP~ISDEFENDER&" "&$SHIP~SHIP_NAME
end
send "qq"
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:SHIP~GETSHIPSTATS
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
send "c;"
settextlinetrigger GETSHIPOFFENSE :SHIP~SHIPOFFENSEODDS "Offensive Odds: "
settextlinetrigger GETSHIPFIGHTERS :SHIP~SHIPMAXFIGSPERATTACK " TransWarp Drive:   "
settextlinetrigger GETSHIPMINES :SHIP~SHIPMAXMINES " Mine Max:  "
settextlinetrigger GETSHIPGENESIS :SHIP~SHIPMAXGENESIS " Genesis Max:  "
settextlinetrigger GETSHIPSHIELDS :SHIP~SHIPMAXSHIELDS "Maximum Shields:"
settextlinetrigger GETSHIPRANGE :SHIP~SHIPTRANSPORTRANGE "Transport Range:"
pause

:SHIP~SHIPMAXSHIELDS
setvar $SHIP~SHIELD_LINE CURRENTLINE
replacetext $SHIP~SHIELD_LINE ":" "  "
replacetext $SHIP~SHIELD_LINE "," ""
getword $SHIP~SHIELD_LINE $SHIP~SHIP_SHIELD_MAX 10
savevar $SHIP~SHIP_SHIELD_MAX
pause

:SHIP~SHIPOFFENSEODDS
getwordpos CURRENTANSILINE $SHIP~POS "[0;31m:[1;36m1"
if ($SHIP~POS > 0)
  gettext CURRENTANSILINE $SHIP~SHIP_OFFENSIVE_ODDS "Offensive Odds[1;33m:[36m " "[0;31m:[1;36m1"
  striptext $SHIP~SHIP_OFFENSIVE_ODDS "."
  striptext $SHIP~SHIP_OFFENSIVE_ODDS " "
  gettext CURRENTANSILINE $SHIP~SHIP_FIGHTERS_MAX "Max Fighters[1;33m:[36m" "[0;32m Offensive Odds"
  striptext $SHIP~SHIP_FIGHTERS_MAX ","
  striptext $SHIP~SHIP_FIGHTERS_MAX " "
  savevar $SHIP~SHIP_FIGHTERS_MAX
  savevar $SHIP~SHIP_OFFENSIVE_ODDS
else
  getwordpos CURRENTLINE $SHIP~POS "Offensive Odds:"
  if ($SHIP~POS > 0)
    gettext CURRENTLINE $SHIP~SHIP_OFFENSIVE_ODDS "Offensive Odds:" ":1"
    striptext $SHIP~SHIP_OFFENSIVE_ODDS "."
    striptext $SHIP~SHIP_OFFENSIVE_ODDS " "
    gettext CURRENTLINE $SHIP~SHIP_FIGHTERS_MAX "Max Fighters:" "Offensive Odds:"
    striptext $SHIP~SHIP_FIGHTERS_MAX ","
    striptext $SHIP~SHIP_FIGHTERS_MAX " "
    savevar $SHIP~SHIP_FIGHTERS_MAX
    savevar $SHIP~SHIP_OFFENSIVE_ODDS
  end
end
pause

:SHIP~SHIPMAXMINES
gettext CURRENTLINE $SHIP~SHIP_MINES_MAX "Mine Max:" "Beacon Max:"
striptext $SHIP~SHIP_MINES_MAX " "
savevar $SHIP~SHIP_MINES_MAX
pause

:SHIP~SHIPMAXGENESIS
gettext CURRENTLINE $SHIP~SHIP_GENESIS_MAX "Genesis Max:" "Long Range Scan:"
striptext $SHIP~SHIP_GENESIS_MAX " "
savevar $SHIP~SHIP_GENESIS_MAX
pause

:SHIP~SHIPMAXFIGSPERATTACK
getwordpos CURRENTANSILINE $SHIP~POS "[0m[32m Max Figs Per Attack[1;33m:[36m"
if ($SHIP~POS > 0)
  gettext CURRENTANSILINE $SHIP~SHIP_MAX_ATTACK "[0m[32m Max Figs Per Attack[1;33m:[36m" "[0;32mTransWarp"
  striptext $SHIP~SHIP_MAX_ATTACK " "
else
  getwordpos CURRENTLINE $SHIP~POS "Max Figs Per Attack:"
  if ($SHIP~POS > 0)
    gettext CURRENTLINE $SHIP~SHIP_MAX_ATTACK "Max Figs Per Attack:" "TransWarp Drive:"
    striptext $SHIP~SHIP_MAX_ATTACK " "
  end
end
savevar $SHIP~SHIP_MAX_ATTACK
pause

:SHIP~SHIPTRANSPORTRANGE
gettext CURRENTLINE $SHIP~SHIP_MAX_HOLDS "Maximum Holds:" "Transport Range:"
striptext $SHIP~SHIP_MAX_HOLDS " "
	gettext CURRENTLINE $SHIP~SHIP_XPORT_RANGE "Transport Range:" "Photon Missiles:"
	striptext $SHIP~SHIP_XPORT_RANGE " "
	savevar $SHIP~SHIP_XPORT_RANGE
	send "q"
	settexttrigger WAITON45 :SHIP~GETSHIPSTATS_RETURNPROMPT "Command [TL="
	settexttrigger WAITON45CITADEL :SHIP~GETSHIPSTATS_RETURNPROMPT "Citadel command (?=help)"
	pause
	:SHIP~GETSHIPSTATS_RETURNPROMPT
	killalltriggers
	return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:SHIP~LOADSHIPINFO
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
setvar $SHIP~SHIPCOUNTER 1
:SHIP~COUNT_THE_SHIPS
loadvar $SHIP~CAP_FILE
fileexists $SHIP~EXISTS $SHIP~CAP_FILE
if ($SHIP~EXISTS)
  read $SHIP~CAP_FILE $SHIP~SHIPINF $SHIP~SHIPCOUNTER
  if ($SHIP~SHIPINF <> "EOF")
    add $SHIP~SHIPCOUNTER 1
    goto :SHIP~COUNT_THE_SHIPS
  end
  setarray $SHIP~SHIPLIST $SHIP~SHIPCOUNTER 9
  setvar $SHIP~SHIPCOUNTER 1
  :SHIP~READSHIPLIST
  read $SHIP~CAP_FILE $SHIP~SHIPINF $SHIP~SHIPCOUNTER
  if ($SHIP~SHIPINF <> "EOF")
    gosub :SHIP~PROCESS_SHIP_LINE
    setvar $SHIP~SHIP[$SHIP~SHIPNAME] $SHIP~SHIELDS&" "&$SHIP~DEFODD
    setvar $SHIP~SHIPLIST[$SHIP~SHIPCOUNTER] $SHIP~SHIPNAME
    setvar $SHIP~SHIPLIST[$SHIP~SHIPCOUNTER][1] $SHIP~SHIELDS
    setvar $SHIP~SHIPLIST[$SHIP~SHIPCOUNTER][2] $SHIP~DEFODD
    setvar $SHIP~SHIPLIST[$SHIP~SHIPCOUNTER][3] $SHIP~OFF_ODDS
    setvar $SHIP~SHIPLIST[$SHIP~SHIPCOUNTER][4] $SHIP~MAX_HOLDS
    setvar $SHIP~SHIPLIST[$SHIP~SHIPCOUNTER][5] $SHIP~MAX_FIGHTERS
    setvar $SHIP~SHIPLIST[$SHIP~SHIPCOUNTER][6] $SHIP~INIT_HOLDS
    setvar $SHIP~SHIPLIST[$SHIP~SHIPCOUNTER][7] $SHIP~TPW
    setvar $SHIP~SHIPLIST[$SHIP~SHIPCOUNTER][8] $SHIP~ISDEFENDER
    setvar $SHIP~SHIPLIST[$SHIP~SHIPCOUNTER][9] $SHIP~SHIP_COST
    add $SHIP~SHIPCOUNTER 1
    goto :SHIP~READSHIPLIST
  end
  setvar $SHIP~SHIPSTATS TRUE
end
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:SHIP~PROCESS_SHIP_LINE
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
getword $SHIP~SHIPINF $SHIP~SHIELDS 1
getlength $SHIP~SHIELDS $SHIP~SHIELDLEN
getword $SHIP~SHIPINF $SHIP~DEFODD 2
getlength $SHIP~DEFODD $SHIP~DEFODDLEN
getword $SHIP~SHIPINF $SHIP~OFF_ODDS 3
getlength $SHIP~OFF_ODDS $SHIP~FILLER1LEN
getword $SHIP~SHIPINF $SHIP~SHIP_COST 4
getlength $SHIP~SHIP_COST $SHIP~FILLER2LEN
getword $SHIP~SHIPINF $SHIP~MAX_HOLDS 5
getlength $SHIP~MAX_HOLDS $SHIP~FILLER3LEN
getword $SHIP~SHIPINF $SHIP~MAX_FIGHTERS 6
getlength $SHIP~MAX_FIGHTERS $SHIP~FILLER4LEN
getword $SHIP~SHIPINF $SHIP~INIT_HOLDS 7
getlength $SHIP~INIT_HOLDS $SHIP~FILLER5LEN
getword $SHIP~SHIPINF $SHIP~TPW 8
getlength $SHIP~TPW $SHIP~FILLER6LEN
getword $SHIP~SHIPINF $SHIP~ISDEFENDER 9
getlength $SHIP~ISDEFENDER $SHIP~FILLER7LEN
setvar $SHIP~STARTLEN ($SHIP~SHIELDLEN + ($SHIP~DEFODDLEN + ($SHIP~FILLER1LEN + ($SHIP~FILLER2LEN + ($SHIP~FILLER3LEN + ($SHIP~FILLER4LEN + ($SHIP~FILLER5LEN + ($SHIP~FILLER6LEN + ($SHIP~FILLER7LEN + 10)))))))))
cuttext $SHIP~SHIPINF $SHIP~SHIPNAME $SHIP~STARTLEN 999
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:SHIP~SAVETHESHIP
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
setvar $SHIP~SHIPCOUNTER 1
:SHIP~SAVETHESHIP_READSHIPLIST
loadvar $SHIP~CAP_FILE
read $SHIP~CAP_FILE $SHIP~SHIPINF $SHIP~SHIPCOUNTER
if ($SHIP~SHIPINF <> "EOF")
  gosub :SHIP~PROCESS_SHIP_LINE
  setvar $SHIP~DATABASE $SHIP~DATABASE&"^^^^^^"&$SHIP~SHIPNAME&"^^^^^^"
  add $SHIP~SHIPCOUNTER 1
  goto :SHIP~SAVETHESHIP_READSHIPLIST
end
send "c"
waiton "Computer command"
send ";"
:SHIP~SAVETHESHIP_KEEPLOOKINGSHIPNAME
killalltriggers
settextlinetrigger CHECKINGFORSHIPNAME :SHIP~SAVETHESHIP_CHECKSHIPNAME
pause
:SHIP~SAVETHESHIP_CHECKSHIPNAME
if (CURRENTLINE = "")
  goto :SHIP~SAVETHESHIP_KEEPLOOKINGSHIPNAME
else
  setvar $SHIP~CURRENT_LINE CURRENTLINE
  getword $SHIP~CURRENT_LINE $SHIP~TEMP 1
  cuttext $SHIP~TEMP $SHIP~FRONTLETTER 1 1
  gettext $SHIP~CURRENT_LINE $SHIP~SHIP_NAME $SHIP~FRONTLETTER "          "
  setvar $SHIP~SHIP_NAME $SHIP~FRONTLETTER&$SHIP~SHIP_NAME
  getwordpos $SHIP~DATABASE $SHIP~POS "^^^^^^"&$SHIP~SHIP_NAME&"^^^^^^"
  if ($SHIP~POS > 0)
    setvar $SWITCHBOARD~MESSAGE "This ship is already stored in bot file.*"
    gosub :SWITCHBOARD~SWITCHBOARD
    send "q "
    return
  end
end
:SHIP~SAVETHESHIP_SN
settextlinetrigger HC :SHIP~SAVETHESHIP_HC "Basic Hold Cost:"
pause
:SHIP~SAVETHESHIP_HC
setvar $SHIP~LINE CURRENTLINE
striptext $SHIP~LINE "Basic Hold Cost:"
striptext $SHIP~LINE "Initial Holds:"
striptext $SHIP~LINE "Maximum Shields:"
getword $SHIP~LINE $SHIP~INIT_HOLDS 2
getword $SHIP~LINE $SHIP~MAX_SHIELDS 3
striptext $SHIP~MAX_SHIELDS ","
settextlinetrigger OO :SHIP~SAVETHESHIP_OO2 "Offensive Odds:"
pause
:SHIP~SAVETHESHIP_OO2
setvar $SHIP~LINE CURRENTLINE
striptext $SHIP~LINE "Main Drive Cost:"
striptext $SHIP~LINE "Max Fighters:"
striptext $SHIP~LINE "Offensive Odds:"
getword $SHIP~LINE $SHIP~MAX_FIGS 2
getword $SHIP~LINE $SHIP~OFF_ODDS 3
striptext $SHIP~MAX_FIGS ","
striptext $SHIP~OFF_ODDS ":1"
striptext $SHIP~OFF_ODDS "."
settextlinetrigger DO :SHIP~SAVETHESHIP_DO "Defensive Odds:"
pause
:SHIP~SAVETHESHIP_DO
setvar $SHIP~LINE CURRENTLINE
striptext $SHIP~LINE "Computer Cost:"
striptext $SHIP~LINE "Turns Per Warp:"
striptext $SHIP~LINE "Defensive Odds:"
getword $SHIP~LINE $SHIP~DEF_ODDS 3
striptext $SHIP~DEF_ODDS ":1"
striptext $SHIP~DEF_ODDS "."
getword $SHIP~LINE $SHIP~TPW 2
settextlinetrigger SC :SHIP~SAVETHESHIP_SC "Ship Base Cost:"
pause
:SHIP~SAVETHESHIP_SC
setvar $SHIP~LINE CURRENTLINE
striptext $SHIP~LINE "Ship Base Cost:"
getword $SHIP~LINE $SHIP~COST 1
striptext $SHIP~COST ","
getlength $SHIP~COST $SHIP~COSTLEN
if ($SHIP~COSTLEN = 7)
  add $SHIP~COST 10000000
end
settextlinetrigger MH :SHIP~SAVETHESHIP_MH "Maximum Holds:"
pause
:SHIP~SAVETHESHIP_MH
setvar $SHIP~LINE CURRENTLINE
striptext $SHIP~LINE "Maximum Holds:"
getword $SHIP~LINE $SHIP~MAX_HOLDS 1
setvar $SHIP~ISDEFENDER FALSE
write $SHIP~CAP_FILE $SHIP~MAX_SHIELDS&" "&$SHIP~DEF_ODDS&" "&$SHIP~OFF_ODDS&" "&$SHIP~COST&" "&$SHIP~MAX_HOLDS&" "&$SHIP~MAX_FIGS&" "&$SHIP~INIT_HOLDS&" "&$SHIP~TPW&" "&$SHIP~ISDEFENDER&" "&$SHIP~SHIP_NAME
setvar $SWITCHBOARD~MESSAGE $SHIP~SHIP_NAME&" added to bot's ship file.*"
gosub :SWITCHBOARD~SWITCHBOARD
send "q"
gosub :SHIP~LOADSHIPINFO
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:SHIP~SAVE_THE_SHIP
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
setvar $SHIP~SHIPCOUNTER 1
:SHIP~SAVE_THE_SHIP_READSHIPLIST
loadvar $SHIP~CAP_FILE
read $SHIP~CAP_FILE $SHIP~SHIPINF $SHIP~SHIPCOUNTER
if ($SHIP~SHIPINF <> "EOF")
  gosub :SHIP~PROCESS_SHIP_LINE
  setvar $SHIP~DATABASE $SHIP~DATABASE&"^^^^^^"&$SHIP~SHIPNAME&"^^^^^^"
  add $SHIP~SHIPCOUNTER 1
  goto :SHIP~SAVE_THE_SHIP_READSHIPLIST
end
send "c"
waiton "Computer command"
send ";"
:SHIP~SAVE_THE_SHIP_KEEPLOOKINGSHIPNAME
killalltriggers
settextlinetrigger CHECKINGFORSHIPNAME :SHIP~SAVE_THE_SHIP_CHECKSHIPNAME
pause
:SHIP~SAVE_THE_SHIP_CHECKSHIPNAME
if (CURRENTLINE = "")
  goto :SHIP~SAVE_THE_SHIP_KEEPLOOKINGSHIPNAME
else
  setvar $SHIP~CURRENT_LINE CURRENTLINE
  getword $SHIP~CURRENT_LINE $SHIP~TEMP 1
  cuttext $SHIP~TEMP $SHIP~FRONTLETTER 1 1
  gettext $SHIP~CURRENT_LINE $SHIP~SHIP_NAME $SHIP~FRONTLETTER "          "
  setvar $SHIP~SHIP_NAME $SHIP~FRONTLETTER&$SHIP~SHIP_NAME
  getwordpos $SHIP~DATABASE $SHIP~POS "^^^^^^"&$SHIP~SHIP_NAME&"^^^^^^"
  if ($SHIP~POS > 0)
    setvar $switchboard~message "This ship is already stored in bot file.*"
    gosub :switchboard~switchboard
    return
  end
end
:SHIP~SAVE_THE_SHIP_SN
settextlinetrigger HC :SHIP~SAVE_THE_SHIP_HC "Basic Hold Cost:"
pause
:SHIP~SAVE_THE_SHIP_HC
setvar $SHIP~LINE CURRENTLINE
striptext $SHIP~LINE "Basic Hold Cost:"
striptext $SHIP~LINE "Initial Holds:"
striptext $SHIP~LINE "Maximum Shields:"
getword $SHIP~LINE $SHIP~INIT_HOLDS 2
getword $SHIP~LINE $SHIP~MAX_SHIELDS 3
striptext $SHIP~MAX_SHIELDS ","
settextlinetrigger OO :SHIP~SAVE_THE_SHIP_OO2 "Offensive Odds:"
pause
:SHIP~SAVE_THE_SHIP_OO2
setvar $SHIP~LINE CURRENTLINE
striptext $SHIP~LINE "Main Drive Cost:"
striptext $SHIP~LINE "Max Fighters:"
striptext $SHIP~LINE "Offensive Odds:"
getword $SHIP~LINE $SHIP~MAX_FIGS 2
getword $SHIP~LINE $SHIP~OFF_ODDS 3
striptext $SHIP~MAX_FIGS ","
striptext $SHIP~OFF_ODDS ":1"
striptext $SHIP~OFF_ODDS "."
settextlinetrigger DO :SHIP~SAVE_THE_SHIP_DO "Defensive Odds:"
pause
:SHIP~SAVE_THE_SHIP_DO
setvar $SHIP~LINE CURRENTLINE
striptext $SHIP~LINE "Computer Cost:"
striptext $SHIP~LINE "Turns Per Warp:"
striptext $SHIP~LINE "Defensive Odds:"
getword $SHIP~LINE $SHIP~DEF_ODDS 3
striptext $SHIP~DEF_ODDS ":1"
striptext $SHIP~DEF_ODDS "."
getword $SHIP~LINE $SHIP~TPW 2
settextlinetrigger SC :SHIP~SAVE_THE_SHIP_SC "Ship Base Cost:"
pause
:SHIP~SAVE_THE_SHIP_SC
setvar $SHIP~LINE CURRENTLINE
striptext $SHIP~LINE "Ship Base Cost:"
getword $SHIP~LINE $SHIP~COST 1
striptext $SHIP~COST ","
getlength $SHIP~COST $SHIP~COSTLEN
if ($SHIP~COSTLEN = 7)
  add $SHIP~COST 10000000
end
settextlinetrigger MH :SHIP~SAVE_THE_SHIP_MH "Maximum Holds:"
pause
:SHIP~SAVE_THE_SHIP_MH
setvar $SHIP~LINE CURRENTLINE
striptext $SHIP~LINE "Maximum Holds:"
getword $SHIP~LINE $SHIP~MAX_HOLDS 1
setvar $SHIP~ISDEFENDER FALSE
write $SHIP~CAP_FILE $SHIP~MAX_SHIELDS&" "&$SHIP~DEF_ODDS&" "&$SHIP~OFF_ODDS&" "&$SHIP~COST&" "&$SHIP~MAX_HOLDS&" "&$SHIP~MAX_FIGS&" "&$SHIP~INIT_HOLDS&" "&$SHIP~TPW&" "&$SHIP~ISDEFENDER&" "&$SHIP~SHIP_NAME
setvar $switchboard~message ""&$SHIP~SHIP_NAME&" added to bot's ship file.*"
gosub :switchboard~switchboard
send "q"
gosub :SHIP~LOADSHIPINFO
return

include "source\include\switchboard"
