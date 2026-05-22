systemscript

gosub :player~init

window coms 250 400 "Who's Playing?" ontop
setwindowcontents coms "Waiting for Who's Playing..*"

setvar $i 1
while ($i < $player~rankslength)
	setvar $temp $player~ranks[$i]
	striptext $temp "31m"
	striptext $temp "36m"
	settextlinetrigger lookfor&$i :lookfor&$i $temp
	add $i 1
end
settextlinetrigger start_new :start_new "Who's Playing"
pause

:start_new
killtrigger start_new
getwordpos currentansiline $pos "[1;44m"
if ($pos > 0)
	setvar $window_contents "     Who's Playing     *#######################**"
end
settextlinetrigger start_new :start_new "Who's Playing"
pause

:lookfor1
setvar $i 1
goto :set_the_triggers

:lookfor2
setvar $i 2
goto :set_the_triggers

:lookfor3
setvar $i 3
goto :set_the_triggers

:lookfor4
setvar $i 4
goto :set_the_triggers

:lookfor5
setvar $i 5
goto :set_the_triggers

:lookfor6
setvar $i 6
goto :set_the_triggers

:lookfor7
setvar $i 7
goto :set_the_triggers

:lookfor8
setvar $i 8
goto :set_the_triggers

:lookfor9
setvar $i 9
goto :set_the_triggers

:lookfor10
setvar $i 10
goto :set_the_triggers

:lookfor11
setvar $i 11
goto :set_the_triggers

:lookfor12
setvar $i 12
goto :set_the_triggers

:lookfor13
setvar $i 13
goto :set_the_triggers

:lookfor14
setvar $i 14
goto :set_the_triggers

:lookfor15
setvar $i 15
goto :set_the_triggers

:lookfor16
setvar $i 16
goto :set_the_triggers

:lookfor17
setvar $i 17
goto :set_the_triggers

:lookfor18
setvar $i 18
goto :set_the_triggers

:lookfor19
setvar $i 19
goto :set_the_triggers

:lookfor20
setvar $i 20
goto :set_the_triggers

:lookfor21
setvar $i 21
goto :set_the_triggers

:lookfor22
setvar $i 22
goto :set_the_triggers

:lookfor23
setvar $i 23
goto :set_the_triggers

:lookfor24
setvar $i 24
goto :set_the_triggers

:lookfor25
setvar $i 25
goto :set_the_triggers

:lookfor26
setvar $i 26
goto :set_the_triggers

:lookfor27
setvar $i 27
goto :set_the_triggers

:lookfor28
setvar $i 28
goto :set_the_triggers

:lookfor29
setvar $i 29
goto :set_the_triggers

:lookfor30
setvar $i 30
goto :set_the_triggers

:lookfor31
setvar $i 31
goto :set_the_triggers

:lookfor32
setvar $i 32
goto :set_the_triggers

:lookfor33
setvar $i 33
goto :set_the_triggers

:lookfor34
setvar $i 34
goto :set_the_triggers

:lookfor35
setvar $i 35
goto :set_the_triggers

:lookfor36
setvar $i 36
goto :set_the_triggers

:lookfor37
setvar $i 37
goto :set_the_triggers

:lookfor38
setvar $i 38
goto :set_the_triggers

:lookfor39
setvar $i 39
goto :set_the_triggers

:lookfor40
setvar $i 40
goto :set_the_triggers

:lookfor41
setvar $i 41
goto :set_the_triggers

:lookfor42
setvar $i 42
goto :set_the_triggers

:lookfor43
setvar $i 43
goto :set_the_triggers

:lookfor44
setvar $i 44
goto :set_the_triggers

:lookfor45
setvar $i 45
goto :set_the_triggers

:lookfor46
setvar $i 46

:set_the_triggers
setvar $temp $player~ranks[$i]
getwordpos currentansiline $pos5 "Trader Name   "
setvar $line currentansiline
getwordpos $line $pos "33m,[0;32m w/ "
if ($pos <= 0)
	getwordpos $line $pos "[0;32mw/ "
end
getwordpos $line $pos2 "[33m, [0;32mwith"
getwordpos $line $pos3 "[0;35m[[31mOwned by[35m]"
getwordpos $line $pos4 "[0;32mw/ "&#27&"[1;33m"
if ((($pos4 > 0) or ($pos > 0) or ($pos2 > 0)) and ($pos3 <= 0))
	//fake

elseif ($pos5 <= 0)
	setvar $window_contents $window_contents&currentline&"*"
	setvar $who_is_online $window_contents
	replacetext $who_is_online "     Who's Playing     *#######################**" ""
	replacetext $who_is_online "*" ","
	setvar $bot~who_is_online $who_is_online
	savevar $bot~who_is_online
	savevar $who_is_online
	setwindowcontents coms $window_contents
end
striptext $temp "31m"
striptext $temp "36m"
settextlinetrigger lookfor&$i :lookfor&$i $temp
pause

#includes:
include "source\include\player"
