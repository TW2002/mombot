gosub :loadvars~loadvars
gosub :help~initialize
setvar $help~help[1]  $help~tab&"Mayhem Experience Haggler"
setvar $help~help[2]  $help~tab&" "
setvar $help~help[3]  $help~tab&"Usage: hagexp {target} {mincash}"
setvar $help~help[4]  $help~tab&" "
setvar $help~help[5]  $help~tab&"{target} = target experience"
setvar $help~help[6]  $help~tab&"{mincash} = minimum cash to stop at"
gosub :help~helpfile

setprecision 0
setvar $u1 18
setvar $u2 12
setvar $u3 6
setvar $prodtobuy 0
setvar $min_holds 15
setvar $hagexp~restore_messages false

gosub :player~quikstats
setvar $here $player~current_sector
setvar $startingprompt $player~current_prompt
setvar $sector $player~current_sector

setvar $planet~planet 0

if ($startingprompt = "Planet")
	gosub :planet~getplanetinfo
elseif ($startingprompt = "Citadel")
	send "Q"
	gosub :planet~getplanetinfo
elseif ($startingprompt = "Command")
	setvar $planet 0
else
	setvar $switchboard~message "hagexp must start at Command, Planet, or Citadel prompt.*"
	gosub :switchboard~switchboard
	halt
end

if (port.exists[$here] = 0) or (port.class[$here] = 0) or (port.class[$here] > 7) or (port.buildtime[$here] > 0)
	gosub :land
	setvar $switchboard~message "There is no selling port here.*"
	gosub :switchboard~switchboard
	halt
end

if ($player~total_holds < $min_holds)
	setvar $switchboard~message "hagexp must have at least " $min_holds " cargo holds.*"
	gosub :switchboard~switchboard
	halt
end

setvar $turns0 $player~turns
setvar $creds0 $player~credits
setvar $exp0 $player~experience
setvar $minperc 1
setvar $expstop (0 - 1)
if ($parm1 <> 0)
	getwordpos $parm1 $testperc "%"
	setvar $p $parm1
	striptext $p "%"
	isnumber $test $p
	if ($test)
		if ($testperc > 0)
			if ($p >= 0) and ($p <= 100)
				setvar $minperc $p
			end
		else
			setvar $expstop $p
		end
	end
end
if ($parm2 <> 0)
	isnumber $test $parm2
	if ($test)
		setvar $mincash $parm2
	else
		setvar $mincash 0
	end
end

setvar $quit 0
settextouttrigger quit :quit "~"
settexttrigger moreturns :moreturns " of your turns."
setvar $exp $exp0

setvar $switchboard~message "hagexp trading " $buysell " port for exp at sector " $here ".*"

if ($minperc >= 0)
	setvar $switchboard~message $switchboard~message & "        Stopping when port percentage is below " $minperc "%.*"
end
if ($expstop >= 0)
	setvar $switchboard~message $switchboard~message & "        Stopping when experience reaches " $expstop ".*"
end
gosub :switchboard~switchboard

gosub :port~getportinfo
gosub :upgrade

:loop
gosub :dump
gosub :trade
gosub :upgrade
if ($quit = 0)
	goto :loop
end

:done
gosub :land
gosub :report
setvar $mode "General"
savevar $mode
halt

:land
if ($planet~planet > 0)
	send "L " $planet~planet "*"
	if ($startingprompt = "Citadel")
		send "C"
	end
end
return

:dump
if ($planet~planet = 0)
	send "J Y"
else
	send "L " $planet~planet "* T N L1* T N L2* T N L3* Q "
	send "J Y"
end
return

:quit
setvar $quit 1
pause

:upgrade
if ($buysell[fuel] = "SELLING") and (($percent[fuel] < ($minperc + 1)) or ($portqty[fuel] < 25))
	if (($credits - $mincash) > 10000)
		send "o119*q* "
	end
elseif ($buysell[organics] = "SELLING") and (($percent[organics] < ($minperc + 1)) or ($portqty[organics] < 25))
	if (($credits - $mincash) > 10000)
		send "o29*q* "
	end
elseif ($buysell[equipment] = "SELLING") and (($percent[equipment] < ($minperc + 1)) or ($portqty[equipment] < 25))
	if (($credits - $mincash) > 10000)
		send "o36*q* "
	end
else
	return
end
send "cr*q"
gosub :getportinfo
goto :upgrade

:moreturns
getwordpos currentline $test "You recover "
if ($test = 1)
	gettext currentline $moreturns "recover " "of"
	striptext $moreturns ","
	add $turns0 $moreturns
end
settexttrigger moreturns :moreturns " of your turns."
pause

#########################################################################################################################
:report
gosub :player~quikstats
setvar $turnsused ($turns0 - $player~turns)
setvar $credsused ($creds0 - $player~credits)
setvar $expgained ($player~experience - $exp0)
send "'{" $bot_name "} - hagexp spent " $turnsused " turns and " $credsused " credits, gaining " $expgained " experience.*"
setprecision 2

if ($turnsused > 0)
	setvar $exp_turn ($expgained / $turnsused)
else
	setvar $exp_turn 0
end

if ($expgained > 0)
	setvar $creds_exp ($credsused / $expgained)
else
	setvar $creds_exp 0
end

setvar $switchboard~message $exp_turn " exp per turn / " $creds_exp " credits per exp.*"
gosub :switchboard~switchboard
setprecision 0
setvar $switchboard~message "I have " $player~turns " turns, " $player~credits " credits and " $player~experience " experience.*"
gosub :switchboard~switchboard
return

#########################################################################################################################
:trade
setvar $round 0
setvar $lastcredits $credits

gosub :player~quikstats
if ($player~experience >= $expstop)
	setvar $quit 1
	return
end

gosub :msgs_off
send "P T"
gosub :getportinfo
settextlinetrigger startcredits :startcredits "credits"
pause

:getportinfo
killalltriggers
settextlinetrigger foundport :foundport "Commerce report for"
settextlinetrigger noport :noport "I have no information about a port in that sector."
settextlinetrigger noport2 :noport "You have never visted sector"
settextlinetrigger noport3 :noport "credits / next hold"
pause

:noport
killalltriggers
setvar $quit 1
if ($hagexp~restore_messages = true)
	gosub :msgs_on
end
return

:foundport
killtrigger noport
killtrigger noport2
killtrigger noport3
setvar $temp currentline
getword $temp $ampm 6
setvar $i 7
while ($ampm <> "AM") and ($ampm <> "PM")
	getword $temp $ampm $i
	add $i 1
end
getword $temp $weekday $i

settextlinetrigger exp :neglectedport "neglected port"
settextlinetrigger exp2 :neglectedport "unused port"
settextlinetrigger fuelinfo :productinfo "Fuel Ore"
settextlinetrigger orgsinfo :productinfo "Organics"
settextlinetrigger equipinfo :productinfo "Equipment"
#settexttrigger PORTOUT :PORTOUT "have anything they want"
setstrigger haggledone :haggledone "Command [TL"
pause

:neglectedport
killtrigger "EXP"
killtrigger "EXP2"
getword currentline $expdelta 8
add $exp $expdelta
round $exp 0
pause

:productinfo
getword currentline $product 1
uppercase $product
if ($product = "FUEL")
	setvar $word 3
else
	setvar $word 2
end
getword currentline $buysell[$product] $word
uppercase $buysell[$product]
getword currentline $portqty[$product] (($word + 1))
getword currentline $percent[$product] (($word + 2))
striptext $percent[$product] "%"
getword currentline $onboard[$product] (($word + 3))
if ($buysell[$product] = "SELLING") and ($percent[$product] < ($minperc))
	setvar $quit 1
end
if ($product = "EQUIPMENT")
	return
end
pause

:startcredits
killalltriggers
getword currentline $credits 3
getword currentline $holds 6
striptext $credits ","
#echo "round " $round " credits " $CREDITS " lastcredits " $LASTCREDITS "*"
if ($round > 0) and ($credits = $lastcredits)
	#echo "Haggle failed, resetting MCIC starting values.*"
	setsectorparameter $sector $product & "-" ""
	setsectorparameter $sector $product & "+" ""
end
setvar $lastcredits $credits
setvar $finaloffer 0
setstrigger buy :buy "do you want to buy"
setstrigger sell :sell "do you want to sell"
setstrigger haggledone :haggledone "Command [TL"
pause

:buy
getword currentline $product 5
uppercase $product
if ($product = "FUEL")
	setvar $u $u1
elseif ($product = "ORGANICS")
	setvar $u $u2
else
	setvar $u $u3
end
send $u "*"
add $round 1
if (haggle)
	settextlinetrigger startcredits :startcredits "credits"
	setstrigger haggledone :haggledone "Command [TL"
	pause
end
gosub :haggle~haggle
goto :haggledone

:sell
getword currentline $product 5
uppercase $product
send "*"
add $round 1
if (haggle)
	settextlinetrigger startcredits :startcredits "credits"
	setstrigger haggledone :haggledone "Command [TL"
	pause
end
gosub :haggle~haggle
goto :haggledone

:portout
setvar $quit 1
pause

:haggledone
killtrigger "PORTOUT"
killtrigger "BUY"
killtrigger "SELL"
killtrigger "HAGGLEDONE"
killtrigger "DONE"
if ($hagexp~restore_messages = true)
	gosub :msgs_on
end
return

:msgs_off
setvar $hagexp~msgs_off_first true

:msgs_off_again
settexttrigger hagexp_msgs_off :msgs_off_confirmed "Silencing all messages."
settexttrigger hagexp_msgs_on :msgs_off_was_on "Displaying all messages."
send "|"
pause

:msgs_off_was_on
killtrigger hagexp_msgs_off
killtrigger hagexp_msgs_on
if ($hagexp~msgs_off_first = true)
	setvar $hagexp~restore_messages false
	setvar $hagexp~msgs_off_first false
end
goto :msgs_off_again

:msgs_off_confirmed
killtrigger hagexp_msgs_off
killtrigger hagexp_msgs_on
if ($hagexp~msgs_off_first = true)
	setvar $hagexp~restore_messages true
end
return

:msgs_on
settexttrigger hagexp_msgs_on_done :msgs_on_confirmed "Displaying all messages."
settexttrigger hagexp_msgs_on_off :msgs_on_was_off "Silencing all messages."
send "|"
pause

:msgs_on_was_off
killtrigger hagexp_msgs_on_done
killtrigger hagexp_msgs_on_off
goto :msgs_on

:msgs_on_confirmed
killtrigger hagexp_msgs_on_done
killtrigger hagexp_msgs_on_off
return

include "source\include\player"
include "source\include\port"
include "source\include\planet"
include "source\include\haggle"
include "source\include\switchboard"
include "source\include\loadvars"
include "source\include\help"
