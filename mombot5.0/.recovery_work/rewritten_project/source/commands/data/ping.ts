


setvar $COUNTER 0
setvar $AVERAGE 0
setvar $MIN 999999
setvar $MAX 0


send "|"


send "'*"
setdelaytrigger NOSS :NOSS 3000
settexttrigger BEGIN :BEGIN "Type sub-space message"
pause
:NOSS
echo ANSI_12 "**You appear to be at a non-friendly prompt for SS messages.*"
echo ANSI_12 "*This could be that ISP is off (bad, bad sysOp)*"
echo ANSI_11 "*Try this script from the sector Command or Citadel prompts*"
halt
:BEGIN

killalltriggers
settexttrigger PING :MSCHECK "S: ping"
gettime $MSSTART "h:m:s:zzz"
replacetext $MSSTART ":" " "
getword $MSSTART $MS1 4
getword $MSSTART $SS1 3
send "ping :"
pause
:MSCHECK

gettime $MSEND "h:m:s:zzz"
replacetext $MSEND ":" " "
getword $MSEND $MS2 4
getword $MSEND $SS2 3
if ($SS2 < $SS1)
  add $SS2 60
end
subtract $SS2 $SS1
if ($SS2 > 0)
  multiply $SS2 1000
  add $MS2 $SS2
end
setvar $MS ($MS2 - $MS1)
if ($MS < $MIN)
  setvar $MIN $MS
end
if ($MS > $MAX)
  setvar $MAX $MS
end
:PING
getlength $MS $LEN
setvar $PAD ""
while ($LEN < 5)
  setvar $PAD $PAD&" "
  add $LEN 1
end
send " " $MS $PAD "ms*"
add $AVERAGE $MS

setdelaytrigger PINGDELAY :PINGDELAY 200
pause
:PINGDELAY
add $COUNTER 1
if ($COUNTER = 10)
  goto :DONE
end
goto :BEGIN
:DONE

setvar $HILOW $AVERAGE
subtract $HILOW $MAX
subtract $HILOW $MIN
divide $HILOW 8
divide $AVERAGE 10
gosub :COMMENT
send "----------------*"
send "Min: " $MIN "  Max: " $MAX "  Average: " $AVERAGE $COMMENT "*"
send "High/Low  Removed   Average: " $HILOW "*"
setvar $CONSISTENT ($MAX - $MIN)
gosub :LAG
send "Min:Max Split: " $CONSISTENT "  " $LAGMSG
send "*"
settexttrigger SSDONE :WAITFORPROMPT "Sub-space comm"
setdelaytrigger FUBAR :WAITFORPROMPT 2000
pause
:WAITFORPROMPT
killalltriggers
send "|"
halt
:LAG




if ($CONSISTENT >= 250)
  setvar $LAGMSG "Extreme Intermittent Lag Detected*"
elseif (($CONSISTENT >= 150) and ($CONSISTENT < 250))
  setvar $LAGMSG "Moderate Intermittent Lag Detected*"
elseif (($CONSISTENT >= 75) and ($CONSISTENT < 150))
  setvar $LAGMSG "Mild Intermittent Lag Detected*"
elseif (($CONSISTENT >= 25) and ($CONSISTENT < 75))
  setvar $LAGMSG "Minimal Intermittent Lag Detected*"
elseif ($CONSISTENT < 25)
  setvar $LAGMSG "No Lag has been Detected*"
end
return
:COMMENT


getrnd $RND 1 2
if ($AVERAGE <= 150)
  setvar $COMMENT " -- Muhahahaha, bring it on!!!"
end
if (($AVERAGE > 150) and ($AVERAGE <= 200))
  if ($RND = 1)
    setvar $COMMENT " -- Someone is gonna get podded!"
  else
    setvar $COMMENT " -- Patience Hell! Time to SD someone!"
  end
end
if (($AVERAGE > 200) and ($AVERAGE <= 250))
  setvar $COMMENT " -- On the edge"
end
if (($AVERAGE > 250) and ($AVERAGE <= 300))
  if ($RND = 1)
    setvar $COMMENT " -- Gridding, not a job, an adventure!"
  else
    setvar $COMMENT " -- Damn, I hope someone is runnning saveMe!"
  end
end
if ($AVERAGE > 300)
  if ($RND = 1)
    setvar $COMMENT " -- What the Hell am I doing here?"
  else
    setvar $COMMENT " -- Just here to attack aliens :("
  end
end
return
