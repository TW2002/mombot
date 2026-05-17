gosub :LOADVARS~LOADVARS
gosub :HELP~INITIALIZE
setVar $HELP~HELP[1]  $HELP~TAB&"Mayhem Experience Haggler"
setVar $HELP~HELP[2]  $HELP~TAB&" "
setVar $HELP~HELP[3]  $HELP~TAB&"Usage: hagexp {target} {mincash}"
setVar $HELP~HELP[4]  $HELP~TAB&" "
setVar $HELP~HELP[5]  $HELP~TAB&"{target} = target experience"
setVar $HELP~HELP[6]  $HELP~TAB&"{mincash} = minimum cash to stop at"
gosub :HELP~HELPFILE

setprecision 0
setvar $U1 18
setvar $U2 12
setvar $U3 6
setvar $prodtobuy 0
setvar $min_holds 15
setvar $HAGEXP~RESTORE_MESSAGES FALSE

gosub :player~quikstats
setvar $HERE $PLAYER~CURRENT_SECTOR
setvar $STARTINGPROMPT $PLAYER~CURRENT_PROMPT
setvar $SECTOR $PLAYER~CURRENT_SECTOR

setvar $planet~planet 0

if ($STARTINGPROMPT = "Planet")
	gosub :planet~getplanetinfo
elseif ($STARTINGPROMPT = "Citadel")
	send "Q"
	gosub :planet~getplanetinfo
elseif ($STARTINGPROMPT = "Command")
	setvar $PLANET 0
else
	setvar $switchboard~message "hagexp must start at Command, Planet, or Citadel prompt.*"
	gosub :switchboard~switchboard
	halt
end

if (PORT.EXISTS[$HERE] = 0) or (PORT.CLASS[$HERE] = 0) or (PORT.CLASS[$HERE] > 7) or (PORT.BUILDTIME[$HERE] > 0)
	gosub :LAND
	setvar $switchboard~message "There is no selling port here.*"
	gosub :switchboard~switchboard
		halt
end

if ($PLAYER~TOTAL_HOLDS < $min_holds)
	setvar $switchboard~message "hagexp must have at least " $min_holds " cargo holds.*"
	gosub :switchboard~switchboard
		halt
end

setvar $TURNS0 $PLAYER~TURNS
setvar $CREDS0 $PLAYER~CREDITS
setvar $EXP0 $PLAYER~EXPERIENCE
setvar $MINPERC 1
setvar $EXPSTOP (0 - 1)
if ($PARM1 <> 0)
	getwordpos $PARM1 $TESTPERC "%"
	setvar $P $PARM1
	striptext $P "%"
	isnumber $TEST $P
	if ($TEST)
		if ($TESTPERC > 0)
			if ($P >= 0) and ($P <= 100)
				setvar $MINPERC $P
			end
		else
			setvar $EXPSTOP $P
		end
 	end
end
if ($PARM2 <> 0)
	isnumber $test $parm2
	if ($test)
		setvar $mincash $parm2
 	else
 		setvar $mincash 0
 	end
end

setvar $QUIT 0
settextouttrigger QUIT :QUIT "~"
settexttrigger MORETURNS :MORETURNS " of your turns."
setvar $EXP $EXP0

setvar $switchboard~message "hagexp trading " $BUYSELL " port for exp at sector " $HERE ".*"

if ($MINPERC >= 0)
	setvar $switchboard~message $switchboard~message & "        Stopping when port percentage is below " $MINPERC "%.*"
end
if ($EXPSTOP >= 0)
	setvar $switchboard~message $switchboard~message & "        Stopping when experience reaches " $EXPSTOP ".*"
end
gosub :switchboard~switchboard

gosub :port~getportinfo
gosub :upgrade

:LOOP
gosub :DUMP
gosub :TRADE
gosub :upgrade
if ($QUIT = 0)
	goto :LOOP
end

:DONE
gosub :LAND
gosub :REPORT
setvar $mode "General"
savevar $mode
halt

:LAND
if ($PLANET~PLANET > 0)
	send "L " $PLANET~PLANET "*"
	if ($STARTINGPROMPT = "Citadel")
		send "C"
	end
end
return

:DUMP
if ($PLANET~PLANET = 0)
	send "J Y"
else
	send "L " $PLANET~PLANET "* T N L1* T N L2* T N L3* Q "
	send "J Y"
end
return

:QUIT
setvar $QUIT 1
pause

:upgrade
if ($BUYSELL[FUEL] = "SELLING") and (($PERCENT[FUEL] < ($MINPERC + 1)) or ($PORTQTY[FUEL] < 25))
	if (($CREDITS - $mincash) > 10000)
		send "o119*q* "
	end
elseif ($BUYSELL[ORGANICS] = "SELLING") and (($PERCENT[ORGANICS] < ($MINPERC + 1)) or ($PORTQTY[ORGANICS] < 25))
	if (($CREDITS - $mincash) > 10000)
		send "o29*q* "
	end
elseif ($BUYSELL[EQUIPMENT] = "SELLING") and (($PERCENT[EQUIPMENT] < ($MINPERC + 1)) or ($PORTQTY[EQUIPMENT] < 25))
	if (($CREDITS - $mincash) > 10000)
		send "o36*q* "
	end
else
	return
end
send "cr*q"
gosub :getportinfo
goto :upgrade

:MORETURNS
getwordpos CURRENTLINE $TEST "You recover "
if ($TEST = 1)
	gettext CURRENTLINE $MORETURNS "recover " "of"
	striptext $MORETURNS ","
	add $TURNS0 $MORETURNS
end
settexttrigger MORETURNS :MORETURNS " of your turns."
pause

#########################################################################################################################
:REPORT

gosub :player~quikstats
setvar $TURNSUSED ($TURNS0 - $PLAYER~TURNS)
setvar $CREDSUSED ($CREDS0 - $PLAYER~CREDITS)
setvar $EXPGAINED ($PLAYER~EXPERIENCE - $EXP0)
send "'{" $bot_name "} - hagexp spent " $TURNSUSED " turns and " $CREDSUSED " credits, gaining " $EXPGAINED " experience.*"
setprecision 2

if ($TURNSUSED > 0)
	setvar $EXP_TURN ($EXPGAINED / $TURNSUSED)
else
	setvar $EXP_TURN 0
end

if ($EXPGAINED > 0)
	setvar $CREDS_EXP ($CREDSUSED / $EXPGAINED)
else
	setvar $CREDS_EXP 0
end

setvar $switchboard~message $EXP_TURN " exp per turn / " $CREDS_EXP " credits per exp.*"
gosub :switchboard~switchboard
setprecision 0
setvar $switchboard~message "I have " $PLAYER~TURNS " turns, " $PLAYER~CREDITS " credits and " $PLAYER~EXPERIENCE " experience.*"
gosub :switchboard~switchboard
return

#########################################################################################################################
:TRADE

setvar $round 0
setvar $LASTCREDITS $CREDITS

gosub :player~quikstats
if ($PLAYER~EXPERIENCE >= $EXPSTOP)
     setvar $QUIT 1
     return
end

gosub :MSGS_OFF
send "P T"
gosub :getportinfo
settextlinetrigger STARTCREDITS :STARTCREDITS "credits"
pause

:getportinfo
killalltriggers
setTextLineTrigger foundport :foundport "Commerce report for"
setTextLineTrigger noport :noport "I have no information about a port in that sector."
setTextLineTrigger noport2 :noport "You have never visted sector"
setTextLineTrigger noport3 :noport "credits / next hold"
pause

:noport
killalltriggers
setvar $QUIT 1
if ($HAGEXP~RESTORE_MESSAGES = TRUE)
	gosub :MSGS_ON
end
return

:foundport
killtrigger noport
killtrigger noport2
killtrigger noport3
setvar $TEMP CURRENTLINE
getword $TEMP $AMPM 6
setvar $I 7
while ($AMPM <> "AM") and ($AMPM <> "PM")
 getword $TEMP $AMPM $I
 add $I 1
end
getword $TEMP $WEEKDAY $I

settextlinetrigger EXP :NEGLECTEDPORT "neglected port"
settextlinetrigger EXP2 :NEGLECTEDPORT "unused port"
settextlinetrigger FUELINFO :PRODUCTINFO "Fuel Ore"
settextlinetrigger ORGSINFO :PRODUCTINFO "Organics"
settextlinetrigger EQUIPINFO :PRODUCTINFO "Equipment"
#settexttrigger PORTOUT :PORTOUT "have anything they want"
settexttrigger HAGGLEDONE :HAGGLEDONE "Command [TL"
pause

:NEGLECTEDPORT
killtrigger "EXP"
killtrigger "EXP2"
getword CURRENTLINE $EXPDELTA 8
add $EXP $EXPDELTA
round $EXP 0
pause

:PRODUCTINFO
getword CURRENTLINE $PRODUCT 1
uppercase $PRODUCT
if ($PRODUCT = "FUEL")
	setvar $WORD 3
else
	setvar $WORD 2
end
getword CURRENTLINE $BUYSELL[$PRODUCT] $WORD
uppercase $BUYSELL[$PRODUCT]
getword CURRENTLINE $PORTQTY[$PRODUCT] (($WORD + 1))
getword CURRENTLINE $PERCENT[$PRODUCT] (($WORD + 2))
striptext $PERCENT[$PRODUCT] "%"
getword CURRENTLINE $ONBOARD[$PRODUCT] (($WORD + 3))
if ($BUYSELL[$PRODUCT] = "SELLING") and ($PERCENT[$PRODUCT] < ($MINPERC))
	setvar $QUIT 1
end
if ($PRODUCT = "EQUIPMENT")
	return
end
pause

:STARTCREDITS
killalltriggers
getWord CURRENTLINE $CREDITS 3
getword CURRENTLINE $HOLDS 6
stripText $CREDITS ","
#echo "round " $round " credits " $CREDITS " lastcredits " $LASTCREDITS "*"
if ($round > 0) and ($CREDITS = $LASTCREDITS)
	#echo "Haggle failed, resetting MCIC starting values.*"
	setsectorparameter $SECTOR $PRODUCT & "-" ""
  	setsectorparameter $SECTOR $PRODUCT & "+" ""
end
setvar $LASTCREDITS $CREDITS
setvar $FINALOFFER 0
setTextTrigger buy :buy "do you want to buy"
setTextTrigger sell :sell "do you want to sell"
settexttrigger HAGGLEDONE :HAGGLEDONE "Command [TL"
pause

:buy
getWord CURRENTLINE $PRODUCT 5
uppercase $PRODUCT
if ($PRODUCT = "FUEL")
 setvar $U $U1
elseif ($PRODUCT = "ORGANICS")
 setvar $U $U2
else
 setvar $U $U3
end
send $U "*"
add $round 1
if (HAGGLE)
	settextlinetrigger STARTCREDITS :STARTCREDITS "credits"
	settexttrigger HAGGLEDONE :HAGGLEDONE "Command [TL"
	pause
end
gosub :haggle~haggle
goto :HAGGLEDONE

:sell
getWord CURRENTLINE $PRODUCT 5
uppercase $PRODUCT
send "*"
add $round 1
if (HAGGLE)
	settextlinetrigger STARTCREDITS :STARTCREDITS "credits"
	settexttrigger HAGGLEDONE :HAGGLEDONE "Command [TL"
	pause
end
gosub :haggle~haggle
goto :HAGGLEDONE

:PORTOUT
setvar $QUIT 1
pause

:HAGGLEDONE
killtrigger "PORTOUT"
killtrigger "BUY"
killtrigger "SELL"
killtrigger "HAGGLEDONE"
killtrigger "DONE"
if ($HAGEXP~RESTORE_MESSAGES = TRUE)
	gosub :MSGS_ON
end
return

:MSGS_OFF
setvar $HAGEXP~MSGS_OFF_FIRST TRUE

:MSGS_OFF_AGAIN
settexttrigger HAGEXP_MSGS_OFF :MSGS_OFF_CONFIRMED "Silencing all messages."
settexttrigger HAGEXP_MSGS_ON :MSGS_OFF_WAS_ON "Displaying all messages."
send "|"
pause

:MSGS_OFF_WAS_ON
killtrigger HAGEXP_MSGS_OFF
killtrigger HAGEXP_MSGS_ON
if ($HAGEXP~MSGS_OFF_FIRST = TRUE)
	setvar $HAGEXP~RESTORE_MESSAGES FALSE
	setvar $HAGEXP~MSGS_OFF_FIRST FALSE
end
goto :MSGS_OFF_AGAIN

:MSGS_OFF_CONFIRMED
killtrigger HAGEXP_MSGS_OFF
killtrigger HAGEXP_MSGS_ON
if ($HAGEXP~MSGS_OFF_FIRST = TRUE)
	setvar $HAGEXP~RESTORE_MESSAGES TRUE
end
return

:MSGS_ON
settexttrigger HAGEXP_MSGS_ON_DONE :MSGS_ON_CONFIRMED "Displaying all messages."
settexttrigger HAGEXP_MSGS_ON_OFF :MSGS_ON_WAS_OFF "Silencing all messages."
send "|"
pause

:MSGS_ON_WAS_OFF
killtrigger HAGEXP_MSGS_ON_DONE
killtrigger HAGEXP_MSGS_ON_OFF
goto :MSGS_ON

:MSGS_ON_CONFIRMED
killtrigger HAGEXP_MSGS_ON_DONE
killtrigger HAGEXP_MSGS_ON_OFF
return


include "source\include\player"
include "source\include\port"
include "source\include\planet"
include "source\include\haggle"
include "source\include\switchboard"
include "source\include\loadvars"
include "source\include\help"
