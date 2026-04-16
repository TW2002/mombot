:SHIP~GETSHIPCAPSTATS
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

settextlinetrigger GRAB_SHIP :SHP_SHIPNAMES "> "
pause
:SHIP~SHP_SHIPNAMES
if (CURRENTLINE = "")
  goto :SHP_LOOP
end
getword CURRENTLINE $SHIP~STOPPER 1
if ($SHIP~STOPPER = "<+>")
  send "+"
  waiton "(?=List) ?"
  setvar $SHIP~NEXTPAGE 1
  goto :SHP_LOOP
elseif ($SHIP~STOPPER = "<Q>")
  goto :SHP_GETSHIPSTATS
end
if ($SHIP~NEXTPAGE = 1)
  setvar $SHIP~SHIPNAME CURRENTLINE
  striptext $SHIP~SHIPNAME "<A> "
  if ($SHIP~SHIPNAME = $SHIP~FIRSTSHIPNAME)
    goto :SHP_GETSHIPSTATS
  end
  setvar $SHIP~NEXTPAGE 0
end
add $SHIP~TOTALSHIPS 1
if ($SHIP~TOTALSHIPS = 1)
  setvar $SHIP~FIRSTSHIPNAME CURRENTLINE
  striptext $SHIP~FIRSTSHIPNAME "<A> "
end
goto :SHP_LOOP
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
  settextlinetrigger SN :SN "Ship Class :"
  pause
  :SHIP~SN
  setvar $SHIP~LINE CURRENTLINE
  getwordpos $SHIP~LINE $SHIP~POS ":"
  add $SHIP~POS 2
  cuttext $SHIP~LINE $SHIP~SHIP_NAME $SHIP~POS 999
  settextlinetrigger HC :HC "Basic Hold Cost:"
  pause
  :SHIP~HC
  setvar $SHIP~LINE CURRENTLINE
  striptext $SHIP~LINE "Basic Hold Cost:"
  striptext $SHIP~LINE "Initial Holds:"
  striptext $SHIP~LINE "Maximum Shields:"
  getword $SHIP~LINE $SHIP~INIT_HOLDS 2
  getword $SHIP~LINE $SHIP~MAX_SHIELDS 3
  striptext $SHIP~MAX_SHIELDS ","
  settextlinetrigger OO :OO2 "Offensive Odds:"
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
  settextlinetrigger DO :DO "Defensive Odds:"
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
  settextlinetrigger SC :SC "Ship Base Cost:"
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
  settextlinetrigger MH :MH "Maximum Holds:"
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
