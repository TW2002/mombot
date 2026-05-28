setvar $counter 0
setvar $average 0
setvar $min 999999
setvar $max 0

gosub :help~initialize
setvar $help~help[1] $help~tab&"ping   "
setvar $help~help[2] $help~tab&"      Measures and reports on your round-trip ping times to the server.  "
gosub :help~helpfile

send "|"

send "'*"
setdelaytrigger noss :noss 3000
settexttrigger begin :begin "Type sub-space message"
pause

:noss
echo ansi_12 "**You appear to be at a non-friendly prompt for SS messages.*"
echo ansi_12 "*This could be that ISP is off (bad, bad sysOp)*"
echo ansi_11 "*Try this script from the sector Command or Citadel prompts*"
halt

:begin
killalltriggers
settexttrigger ping :mscheck "S: ping"
gettime $msstart "h:m:s:zzz"
replacetext $msstart ":" " "
getword $msstart $ms1 4
getword $msstart $ss1 3
send "ping :"
pause

:mscheck
gettime $msend "h:m:s:zzz"
replacetext $msend ":" " "
getword $msend $ms2 4
getword $msend $ss2 3
if ($ss2 < $ss1)
	add $ss2 60
end
subtract $ss2 $ss1
if ($ss2 > 0)
	multiply $ss2 1000
	add $ms2 $ss2
end
setvar $ms ($ms2 - $ms1)
if ($ms < $min)
	setvar $min $ms
end
if ($ms > $max)
	setvar $max $ms
end

:ping
getlength $ms $len
setvar $pad ""
while ($len < 5)
	setvar $pad $pad&" "
	add $len 1
end
send " " $ms $pad "ms*"
add $average $ms

setdelaytrigger pingdelay :pingdelay 200
pause

:pingdelay
add $counter 1
if ($counter = 10)
	goto :done
end
goto :begin

:done
setvar $hilow $average
subtract $hilow $max
subtract $hilow $min
divide $hilow 8
divide $average 10
gosub :comment
send "----------------*"
send "Min: " $min "  Max: " $max "  Average: " $average $comment "*"
send "High/Low  Removed   Average: " $hilow "*"
setvar $consistent ($max - $min)
gosub :lag
send "Min:Max Split: " $consistent "  " $lagmsg
send "*"
settexttrigger ssdone :waitforprompt "Sub-space comm"
setdelaytrigger fubar :waitforprompt 2000
pause

:waitforprompt
killalltriggers
send "|"
halt

:lag
if ($consistent >= 250)
	setvar $lagmsg "Extreme Intermittent Lag Detected*"
elseif (($consistent >= 150) and ($consistent < 250))
	setvar $lagmsg "Moderate Intermittent Lag Detected*"
elseif (($consistent >= 75) and ($consistent < 150))
	setvar $lagmsg "Mild Intermittent Lag Detected*"
elseif (($consistent >= 25) and ($consistent < 75))
	setvar $lagmsg "Minimal Intermittent Lag Detected*"
elseif ($consistent < 25)
	setvar $lagmsg "No Lag has been Detected*"
end
return

:comment
getrnd $rnd 1 2
if ($average <= 150)
	setvar $comment " -- Muhahahaha, bring it on!!!"
end
if (($average > 150) and ($average <= 200))
	if ($rnd = 1)
		setvar $comment " -- Someone is gonna get podded!"
	else
		setvar $comment " -- Patience Hell! Time to SD someone!"
	end
end
if (($average > 200) and ($average <= 250))
	setvar $comment " -- On the edge"
end
if (($average > 250) and ($average <= 300))
	if ($rnd = 1)
		setvar $comment " -- Gridding, not a job, an adventure!"
	else
		setvar $comment " -- Damn, I hope someone is runnning saveMe!"
	end
end
if ($average > 300)
	if ($rnd = 1)
		setvar $comment " -- What the Hell am I doing here?"
	else
		setvar $comment " -- Just here to attack aliens :("
	end
end
return

include "source\include\help"
