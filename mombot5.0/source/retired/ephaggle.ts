systemscript

// author elder prophet - incredible coding and research went into this script.  all credit to him.

// brought to you by shadow's cts decompiler 2.0

setvar $verbose_debug_mode false
setvar $paused_debug_mode false
setvar $version 2019
setvar $sigline "EP's Perfect Haggle, v. " & $version

gosub :bot~loadvars
loadvar $game~ptradesetting

setvar $bot~command "ephaggle"
setvar $bot~help[1]  $bot~tab&"ephaggle {blue|worst} {planet"
setvar $bot~help[2]  $bot~tab&"  Best haggle routine "
setvar $bot~help[3]  $bot~tab&"      Options:  "
setvar $bot~help[4]  $bot~tab&"             blue   - haggle without gaining experience "
setvar $bot~help[5]  $bot~tab&"             worst  - get the worst price possible "
setvar $bot~help[5]  $bot~tab&"             planet - do planet negotiation too "
setvar $bot~help[6]  $bot~tab&"       "
setvar $bot~help[7]  $bot~tab&"      Default is normal haggle "
setvar $bot~help[8]  $bot~tab&"       "
setvar $bot~help[9]  $bot~tab&"      Author: Elder Prophet "
gosub :bot~helpfile

setvar $maxptrade 0
setvar $folder "scripts/"&$bot~mombot_directory&"/games/"&gamename
setvar $mcicfilename $folder&"/mcic.csv"
setvar $hahtoggle "Off"
setvar $wptoggle "Off"
setvar $game~mbbstoggle "Off"
#setvar $game~ptradesetting 100
setvar $bot~bluehaggle false
setvar $swathbidcap "On"
setvar $hagglestat "Active"

#addmenu "" "haggle" "Haggle Options" "." "" "Haggle" FALSE
#addmenu "haggle" "Execute" #27 & "[1;33mContinue" ";" :CONTINUE "" TRUE
#addmenu "haggle" "Haggle and Hold" "Haggle and Hold" 1 :HAHTOGGLE "" FALSE
#addmenu "haggle" "Worst Price" "Worst Price" 2 :WPTOGGLE "" FALSE
#addmenu "haggle" "MBBS Mode" "MBBS Mode" 3 :MBBSTOGGLE "" FALSE
#addmenu "haggle" "PTrade%" "Planetary Trade %" 4 :SETPTRADE% "" FALSE
#addmenu "haggle" "Blue Haggle" "Blue Haggle" 5 :SETBLUEHAGGLE "" FALSE
#addmenu "haggle" "Swath Offer Capture" "Swath Offer Capture" 6 :SETSWATHBIDCAP "" FALSE
#addmenu "haggle" "Haggle Toggle" "Haggle Toggle" 7 :HAGGLESTAT "" FALSE
#addmenu "haggle" "QueryPort" "Query DB for Current Port Info" 9 :QUERYPORT "" FALSE
#addmenu "haggle" "Import Parms" "Import Sector Parms From file" "i" :IMPORTPARMSFROMFILE "" FALSE
#addmenu "haggle" "Write Parms" "Write Sector Parms to file" "w" :WRITEPARMS2FILE "" FALSE
:continue
#setvar $bot~bluehaggle true
#setvar $bot~haggleandhold true
#setvar $bot~worstprice 0
#setvar $game~mbbs 0

loadvar $bot~bluehaggle
loadvar $bot~worstprice

if ($bot~bluehaggle)
	setvar $bot~worstprice false
	savevar $bot~worstprice
elseif ($bot~worstprice)
	setvar $bot~bluehaggle false
	savevar $bot~bluehaggle
end

getwordpos " "&$bot~user_command_line&" " $pos " blue"
getwordpos " "&$bot~user_command_line&" " $pos2 " worst"
if ($pos > 0)
	setvar $bot~worstprice false
	savevar $bot~worstprice
	setvar $bot~bluehaggle true
	savevar $bot~bluehaggle
elseif ($pos2 > 0)
	setvar $bot~worstprice true
	savevar $bot~worstprice
	setvar $bot~bluehaggle false
	savevar $bot~bluehaggle
else
	setvar $bot~worstprice false
	savevar $bot~worstprice
	setvar $bot~bluehaggle false
	savevar $bot~bluehaggle
end

getwordpos " "&$bot~user_command_line&" " $pos " planet "
if ($pos > 0)
	setvar $bot~planettrade true
else
	setvar $bot~planettrade false
end

loadvar $game~mbbs
loadvar $game~ptradesetting

setprecision 2
setvar $planet~planettrade_ratio ($game~ptradesetting / 100)
setprecision 0

killalltriggers
setvar $line currentansiline
gosub :player~quikstats

setvar $exp $player~experience
setvar $sector player~current_sector
gosub :checkforbluetrader

if ($bot~bluehaggle)
	setvar $tag "Blue Haggle"
elseif ($bot~worstprice)
	setvar $tag "Worst Haggle"
else
	setvar $tag "Normal Haggle"
end

if ($bot~planettrade)
	setvar $tag $tag&"  - Planet trade mode as well"
end

setvar $switchboard~message "EP Perfect Haggle loaded - "&$tag&"*"
gosub :switchboard~switchboard
goto :waittoport

:clsectornum
gettext currentline $sector "]:[" "] (?"
goto :waittoport

:waittoport
killalltriggers
setarray $average_price_per_hold 0
setarray $price_ratio_per_hold 0
setarray $lhteyh 0
if ($hagglestat = "Active")
	settexttrigger sector :getsector "] (?=Help)? :"
	settextlinetrigger quickstat :quickstat #179 & "Exp "
	settextlinetrigger trackexp :trackexp "experience point(s)"
	settextlinetrigger getday :getday "Commerce report for"
	pause
	goto :48
end
pause

:48
:getsector
gettext currentline $sector "]:[" "] (?"
settexttrigger sector :getsector "] (?=Help)? :"
pause

:quickstat
settextlinetrigger quickstatexp :quickstatexp "Exp "
pause

:quickstatexp
getword currentline $rank 1
if ($rank = "Rank")
	getword currentline $player~experience 5
	striptext $player~experience ","
	striptext $player~experience "."
	gosub :checkforbluetrader
	goto :50
end
setvar $temp currentline & #179
gettext $temp $temp "Exp" #179
striptext $temp ","
striptext $temp "."
striptext $temp " "
isnumber $yn $temp
if ($yn = 1)
	setvar $player~experience $temp
	gosub :checkforbluetrader
end

:50
settextlinetrigger quickstat :quickstat #179 & "Turns "
pause

:trackexp
setvar $line currentline
setvar $word 0
setvar $i 0

:53
if ($word <> "EXPERIENCE") and ($i < 20)
	add $i 1
	getword $line $word $i
	uppercase $word
	goto :53
end
getword $line $player~experience_increase (($i -1))
getword $line $losegain (($i -2))
uppercase $losegain
if ($losegain = "LOSE")
	subtract $player~experience $player~experience_increase
	goto :56
end
isnumber $true $player~experience_increase
if ($true)
	add $player~experience $player~experience_increase
end

:56
round $player~experience 0
gosub :checkforbluetrader
settextlinetrigger trackexp :trackexp "experience point(s)"
pause

:getday
killtrigger "TRACKEXP"
getword currentline $for 3
if ($for = "for:")
	goto :waittoport
end
getword currentline $ampm 6
setvar $i 7

while (($ampm <> "AM") and ($ampm <> "PM"))
	getword currentline $ampm $i
	add $i 1
end
getword currentline $weekday $i
settexttrigger porting :getportinfo "-=-=-        Docking Log        -=-=-"
pause

:getportinfo
setvar $word 3
settextlinetrigger exp :neglectedport "neglected port"
settextlinetrigger exp2 :neglectedport "unused port"
settextlinetrigger fuelinfo :productinfo "Fuel Ore"
settextlinetrigger orgsinfo :productinfo "Organics"
settextlinetrigger equipinfo :productinfo "Equipment"
settextlinetrigger startcredits :startcredits "credits"
pause

:neglectedport
killtrigger "EXP"
killtrigger "EXP2"
getword currentline $player~experience_increase 8
if ($verbose_debug_mode = true)
	setvar $switchboard~message ansi_14&"*EXP added: "&$player~experience_increase
	gosub :bot~echo
end
add $player~experience $player~experience_increase
round $player~experience 0
gosub :checkforbluetrader
pause

:productinfo
getword currentline $product 1
uppercase $product
getword currentline $buysell[$product] $word
uppercase $buysell[$product]
getword currentline $portqty[$product] (($word + 1))
getword currentline $percent[$product] (($word + 2))
striptext $percent[$product] "%"
getword currentline $onboard[$product] (($word + 3))
setvar $word 2
pause

:startcredits
killalltriggers
setvar $finaloffer 0
if ($bot~planettrade)
	settextlinetrigger planettrade :planettrade "How many units"
end
settextlinetrigger shiptrade :shiptrade "How many holds"
settexttrigger done :waittoport "Command [TL"
pause

:planettrade
killalltriggers
setvar $planet~planetship "PLANET"
setvar $variance 0
setvar $rollhh 0
setvar $plryhh 0
setvar $eddhpo 0
setvar $pelhoh 0
goto :buysell

:shiptrade
killalltriggers
setvar $planet~planetship "SHIP"
setvar $variance "-.003"
setvar $rollhh "-.003"
setvar $plryhh ".003"

:buysell
getword currentline $product 5
uppercase $product
setvar $buysell $buysell[$product]
if ($buysell = "SELLING")
	setvar $plusminus "-1"
	goto :66
end
setvar $plusminus 1

:66
if ($bot~planettrade)
	settextlinetrigger planettrade :planettrade "How many units"
end
settextlinetrigger shiptrade :shiptrade "How many holds"
settexttrigger done :waittoport "Command [TL"
settextlinetrigger tradeqty :tradeqty "Agreed,"
pause

:tradeqty
killalltriggers
getword currentline $holds_to_trade 2
striptext $holds_to_trade ","
striptext $holds_to_trade "."
settextlinetrigger buyoffer :initoffer "We'll buy them for"
settextlinetrigger selloffer :initoffer "We'll sell them for"
pause

:initoffer
killalltriggers
if ($percent[$product] = 0)
	getsectorparameter $sector $product & "L" $tempprod1
	getsectorparameter $sector $product & "H" $tempprod2
	if ($tempprod1 = 0) or ($tempprod2 = 0)
		setvar $switchboard~message "*Can not derive values when Percentage is 0 and Productivity is unknown.*Complete haggling manually."
		gosub :bot~echo
		send "*"
		killalltriggers
		settextlinetrigger startcredits :startcredits "credits"
		settextlinetrigger goodtrade :goodtrade "For your good trading"
		settextlinetrigger greattrade :goodtrade "For your great trading"
		settexttrigger done :waittoport "Command [TL"
		if ($bot~planettrade)
			settextlinetrigger planettrade :planettrade "How many units"
		end
		settextlinetrigger shiptrade :shiptrade "How many holds"
		pause
	end
end
setarray $bid 0
getword currentline $offer 5
settexttrigger parseinitoffer :parseinitoffer "]"
pause

:parseinitoffer
striptext $offer ","
striptext $offer "."
striptext $offer "["
striptext $offer "]"
striptext $offer "?"
setvar $bid 1
setvar $bid[$bid] $offer
setvar $buysell $buysell[$product]
setvar $portqty $portqty[$product]
setvar $percent $percent[$product]

:control
gosub :prepare
gosub :setvars
gosub :start
gosub :bid

:prepare
gettime $starttime
setprecision 0
setvar $average_price_per_hold[fuel] "25.5"
setvar $average_price_per_hold[organics] "50.5"
setvar $average_price_per_hold[equipment] "90.5"
setvar $price_ratio_per_hold[fuel] "0.25"
setvar $price_ratio_per_hold[organics] "0.5"
setvar $price_ratio_per_hold[equipment] "0.9"
setvar $low_mcic_guess[fuel] 40
setvar $high_mcic_guess[fuel] 90
setvar $low_mcic_guess[organics] 30
setvar $high_mcic_guess[organics] 75
setvar $low_mcic_guess[equipment] 20
setvar $high_mcic_guess[equipment] 65
if ($planet~planetship = "PLANET")
	setvar $variance 0
	setvar $rollhh 0
	setvar $plryhh 0
	setarray $hhdyor 0
	setvar $eddhpo 0
	setvar $pelhoh 0
	setvar $under_1000_experience_rate 0
	goto :74
end
setvar $variance "-0.003"
setvar $rollhh "-0.003"
setvar $plryhh "0.003"
if ($weekday = "Mon")
	setvar $eddhpo 0
	setvar $pelhoh 5
	goto :76
end
if ($weekday = "Tue")
	setvar $eddhpo 7
	setvar $pelhoh 7
	goto :76
end
if ($weekday = "Wed")
	setvar $eddhpo 10
	setvar $pelhoh 15
	goto :76
end
if ($weekday = "Thu")
	setvar $eddhpo 9
	setvar $pelhoh 9
	goto :76
end
if ($weekday = "Fri")
	setvar $eddhpo 11
	setvar $pelhoh 12
	goto :76
end
if ($weekday = "Sat")
	setvar $eddhpo 11
	setvar $pelhoh 18
	goto :76
end
if ($weekday = "Sun")
	setvar $eddhpo 10
	setvar $pelhoh 12
	goto :76
end
setvar $switchboard~message "*GetDay failed, $weekday captured is:"&$weekday&"*halting..."
gosub :bot~echo
halt

:76
:74
return

:setvars
setprecision 15
setvar $odhpth $average_price_per_hold[$product]
setvar $price_ratio_per_hold $price_ratio_per_hold[$product]
setvar $base_var $eddhpo
if ($buysell = "SELLING")
	setvar $plusminus "-1"
	setvar $ehylod 1
	goto :84
end
if ($buysell = "BUYING")
	setvar $plusminus 1
	setvar $ehylod "-1"
end

:84
getsectorparameter $sector $product & "L" $lowproductivity
getsectorparameter $sector $product & "H" $highproductivity
if ($verbose_debug_mode = true)
	setvar $switchboard~message "*LowProductivity (Saved) = "&$lowproductivity
	gosub :bot~echo
	setvar $switchboard~message "*HighProductivity (Saved) = "&$highproductivity
	gosub :bot~echo
end
isnumber $isnumber $lowproductivity
if ($isnumber <> true)
	setvar $lowproductivity 0
end
isnumber $isnumber $highproductivity
if ($isnumber <> true)
	setvar $highproductivity 0
end
if ($percent = 100)
	setvar $hhrepp ($portqty / 10)
	round $hhrepp 0
	setvar $maxproductivity $hhrepp
	setvar $lowproductivity $hhrepp
	if ($productivity <= 0)
		setvar $productivity $lowproductivity
	end
	setvar $highproductivity $hhrepp
	if ($verbose_debug_mode = true)
		setvar $switchboard~message "*Percent=100, Productivity="&$productivity
		gosub :bot~echo
	end
	goto :93
end
if ($percent = 0)
	if ($lowproductivity = "") or ($highproductivity = "")
		setvar $switchboard~message "*Unable to determine MCIC when Percentage is zero, complete haggle by hand.*"
		gosub :bot~echo
		settextlinetrigger startcredits :startcredits "credits"
		settextlinetrigger goodtrade :goodtrade "For your good trading"
		settextlinetrigger greattrade :goodtrade "For your great trading"
		settexttrigger done :waittoport "Command [TL"
		if ($bot~planettrade)
			settextlinetrigger planettrade :planettrade "How many units"
		end
		settextlinetrigger shiptrade :shiptrade "How many holds"
		pause
	end
	setvar $hhrepp $lowproductivity
	setvar $maxproductivity $highproductivity
	goto :93
end
setvar $hhrepp (($portqty * 10) / ($percent + ".9999999999"))
round $hhrepp 0
setvar $maxproductivity ((($portqty / $percent) * 10) -".4999999999")
round $maxproductivity 0
if ($maxproductivity > 3276) and ($game~mbbs = 1)
	setvar $maxproductivity 3276
	goto :100
end
if ($maxproductivity > 6553) and ($game~mbbs = 0)
	setvar $maxproductivity 6553
end

:100
if ($lowproductivity < $hhrepp)
	setvar $lowproductivity $hhrepp
end
if ($highproductivity = 0) or ($maxproductivity < $highproductivity)
	setvar $highproductivity $maxproductivity
end

:93
setsectorparameter $sector $product & "L" $lowproductivity
setsectorparameter $sector $product & "H" $highproductivity
setvar $erytlo ""
getsectorparameter $sector $product & "-" $low_mcic_guess
getsectorparameter $sector $product & "+" $high_mcic_guess
isnumber $yn1 $low_mcic_guess
isnumber $yn2 $high_mcic_guess
if ($yn1) and ($yn2)
	if (($low_mcic_guess * $ehylod) < $low_mcic_guess[$product]) or (($low_mcic_guess * $ehylod) > $high_mcic_guess[$product]) or (($high_mcic_guess * $ehylod) < $low_mcic_guess[$product]) or (($high_mcic_guess * $ehylod) > $high_mcic_guess[$product])
		if ($verbose_debug_mode = true)
			setvar $switchboard~message "*Invalid Parameter previously saved for Sector "&$sector
			gosub :bot~echo
			setvar $switchboard~message "mcicMin was <"&$low_mcic_guess&">   mcicMax was <"&$high_mcic_guess&">    Resetting."
			gosub :bot~echo
		end
		setsectorparameter $sector $product & "-" ""
		setsectorparameter $sector $product & "+" ""
		setvar $low_mcic_guess ""
		setvar $high_mcic_guess ""
	end
end
if ($low_mcic_guess <> "") and ($high_mcic_guess <> "")
	if ($low_mcic_guess = $high_mcic_guess)
		if ($verbose_debug_mode = true)
			setvar $switchboard~message "*Using saved MCIC of "&$low_mcic_guess
			gosub :bot~echo
		end
		goto :115
	end
	if ($verbose_debug_mode = true)
		setvar $switchboard~message "*Using saved MCIC values: "&$low_mcic_guess&" - "&$high_mcic_guess
		gosub :bot~echo
	end

	:115
	goto :113
end
setvar $high_mcic_guess ($ehylod * $high_mcic_guess[$product])
round $high_mcic_guess 0
setvar $low_mcic_guess ($ehylod * $low_mcic_guess[$product])
round $low_mcic_guess 0

:113
return

:start
setvar $failed 0
gettime $starttime
isnumber $yn $player~experience
if ($yn = 0)
	setvar $switchboard~message "*At START, but $exp is not a number, pausing..."
	gosub :bot~echo
	pause
end
if ($player~experience > 999) or ($planet~planetship = "PLANET")
	setvar $under_1000_experience_rate 0
	goto :123
end
setvar $under_1000_experience_rate ($plusminus * ((1000 -$player~experience) / 100))

:123
setprecision 15
setvar $oeyrot ((($odhpth + ($plusminus * $pelhoh)) -$under_1000_experience_rate) -((($high_mcic_guess[$product] * $price_ratio_per_hold[$product]) * $portqty) / ($hhrepp * 10)))
setvar $ledreo (($highproductivity -$lowproductivity) + 1)
round $ledreo 0
if ($ledreo > 10) and ($planet~planetship = "SHIP")
	if ($verbose_debug_mode = true)
		setvar $switchboard~message "*Productivity range = "&ansi_12&$ledreo&ansi_10&", using LowPercent routine*"
		gosub :bot~echo
	end
	gosub :lowpercent
	goto :125
end
if ($verbose_debug_mode = true)
	setvar $switchboard~message "*Productivity range = "&ansi_12&$ledreo&ansi_10&", using Conventional routine*"
	gosub :bot~echo
end
gosub :conventional

:125
setvar $variance 0
setvar $base_var 0
setvar $price_ratio_per_hold 0
setvar $odhpth 0
setarray $average_price_per_hold 0
setarray $price_ratio_per_hold 0
return

:goodtrade
killtrigger "GOODTRADE"
killtrigger "GREATTRADE"
getword currentline $player~experience_increase 7
add $player~experience $player~experience_increase
round $player~experience 0
gosub :checkforbluetrader
pause

:finaloffer
setvar $finaloffer 1

:counteroffer
killtrigger "BUYOFFER"
killtrigger "SELLOFFER"
killtrigger "FINALOFFER"
killtrigger "STARTCREDITS"
killtrigger "GOODTRADE"
killtrigger "GREATTRADE"
killtrigger "DONE"
killtrigger "PLANETTRADE"
killtrigger "SHIPTRADE"
getword currentline $offer 5
settexttrigger parsecounteroffer :parsecounteroffer "]"
pause

:parsecounteroffer
striptext $offer ","
striptext $offer "."
add $bid 1
round $bid
setvar $bid[$bid] $offer
setvar $count $lhteyh
setvar $lhteyh 0
setvar $lastcounter $ltpehl
if ($planet~planetship = "PLANET") and ($planet~planettrade_ratio <> 1)
	setvar $lastcounter ($rhyedl / $planet~planettrade_ratio)
	if ($verbose_debug_mode = true)
		setvar $switchboard~message "*Faking LastCounter as "&$lastcounter&" instead of "&$rhyedl&"."
		gosub :bot~echo
	end
end
setvar $ltpehl 0
setvar $i 1

:134
if ($i <= $count)
	if ($verbose_debug_mode = true)
	end
	setvar $tlllhe ((($lastcounter -$lhteyh[$i][5]) * ".3") + $lhteyh[$i][5])
	setvar $tdplty (((($lhteyh[$i][1] / 1000) + $lhteyh[$i][3]) + 1) * $tlllhe)
	if ($verbose_debug_mode = true)
	end
	if ($planet~planetship = "PLANET") and ($planet~planettrade_ratio <> 1)
		multiply $tdplty $planet~planettrade_ratio
	end
	round $tdplty 0
	if ($tdplty = $offer)
		add $lhteyh 1
		round $lhteyh 0
		if ($i <> $lhteyh)
			setvar $lhteyh[$lhteyh][1] $lhteyh[$i][1]
			if ($verbose_debug_mode = true)
			end
			setvar $lhteyh[$lhteyh][2] $lhteyh[$i][2]
			setvar $lhteyh[$lhteyh][3] $lhteyh[$i][3]
			setvar $lhteyh[$lhteyh][4] $lhteyh[$i][4]
		end
		setvar $lhteyh[$lhteyh][5] $tlllhe
		setvar $lhteyh[$lhteyh][6] 0
	end
	add $i 1
	round $i 0
	goto :134
end
setvar $mcic 0
setvar $upper_range_mcic 0
setvar $hoddhl 0
setvar $pyhopr 0
setvar $i 1

:148
if ($i <= $lhteyh)
	if (($lhteyh[$i][1] * $ehylod) < ($mcic * $ehylod)) or ($mcic = 0)
		setvar $mcic $lhteyh[$i][1]
		if ($verbose_debug_mode = true)
		end
	end
	if (($lhteyh[$i][1] * $ehylod) > ($upper_range_mcic * $ehylod))
		setvar $upper_range_mcic $lhteyh[$i][1]
	end
	if ($lhteyh[$i][4] < $hoddhl) or ($hoddhl = 0)
		setvar $hoddhl $lhteyh[$i][4]
	end
	if ($lhteyh[$i][4] > $pyhopr)
		setvar $pyhopr $lhteyh[$i][4]
	end
	add $i 1
	round $i 0
	goto :148
end
if ($verbose_debug_mode = true)
end
setsectorparameter $sector $product & "-" $mcic
setsectorparameter $sector $product & "+" $upper_range_mcic
setsectorparameter $sector $product & "L" $hoddhl
setsectorparameter $sector $product & "H" $pyhopr

:bid
setvar $lhplhl 0
setvar $ptorpe 0
setvar $othytr 0
setvar $i 1

:162
if ($i <= $lhteyh)
	if ($finaloffer = 1)
		loadvar $bot~bluehaggle
		if (($bot~bluehaggle = true) and ($planet~planetship = "SHIP"))
			gosub :subbluehaggle
			goto :167
		end
		if ($buysell = "BUYING")
			setvar $ltpehl ($lhteyh[$i][5] -".5")
			if ($ltpehl < $lhplhl) or ($lhplhl = 0)
				setvar $lhplhl $ltpehl
			end
			goto :169
		end
		setvar $ltpehl ($lhteyh[$i][5] + ".5")
		if ($ltpehl > $ptorpe)
			setvar $ptorpe $ltpehl
		end

		:169
		:167
		goto :165
	end
	setvar $ltpehl ((((($lhteyh[$i][1] * ".004") / $bid) * (0 -1)) + 1) * $lhteyh[$i][5])
	if ($buysell = "SELLING") and ($bid = 1)
		setvar $hdpydh (($lhteyh[$i][5] / "1.5") + ".5")
		if ($ltpehl < $hdpydh)
			setvar $temp $ltpehl
			round $temp 4
			round $hdpydh 4
			if ($verbose_debug_mode = true)
				setvar $switchboard~message "*Counter ("&$temp&") is below StupidOffer ("&$hdpydh&"), adjusting."
				gosub :bot~echo
			end
			setvar $ltpehl ($hdpydh + ".5")
		end
	end
	if ($ltpehl < $lhplhl) or ($lhplhl = 0)
		setvar $lhplhl $ltpehl
	end
	if ($ltpehl > $ptorpe)
		setvar $ptorpe $ltpehl
	end
	if ($bid = 1)
		setvar $ltpehl ($lhteyh[$i][5] * "1.5")
		if ($verbose_debug_mode = true)
		end
		if ($ltpehl < $othytr) or ($othytr = 0)
			setvar $othytr $ltpehl
		end
	end

	:165
	add $i 1
	round $i 0
	goto :162
end
setvar $temp 0
setvar $hdpydh 0
if ($buysell = "BUYING")
	setvar $ltpehl $lhplhl
	if ($bid > 1) and ($ltpehl > $lastcounter)
		setvar $ltpehl $lastcounter
		goto :193
	end
	if ($bid = 1) and ($percent = 100) and ($ltpehl <> 0)
		subtract $ltpehl 1
	end

	:193
	goto :191
end
setvar $ltpehl $ptorpe
if ($bid > 1) and ($ltpehl < $lastcounter)
	setvar $ltpehl $lastcounter
	goto :196
end
if ($bid = 1) and ($percent = 100)
	add $ltpehl 1
end

:196
:191
loadvar $bot~worstprice
if ($bid = 1) and ($bot~worstprice = 1)
	if ($buysell = "SELLING")
		setvar $ltpehl ($othytr -1)
	end
end
if ($bid > 3) and ($finaloffer <> 1) or ($bot~haggleandhold = 1) and ($finaloffer = 1)
	setvar $ltpehl $lastcounter
end
if ($ltpehl = 0)
	setvar $switchboard~message ansi_12&"*Counter is ZERO, input Counter manually, (or ENTER to accept their offer):"
	gosub :bot~echo
	#getconsoleinput $LTPEHL
	send "*"
	if ($ltpehl = "")
		setvar $ltpehl $offer
	end
	if ($planet~planetship = "PLANET")
		divide $ltpehl $planet~planettrade_ratio
	end
end
#setvar $TOECHO ""
#if ($FINALOFFER = 1) or ($planet~planetSHIP = "SHIP") and ($bot~worstprice = 1) and ($BUYSELL = "SELLING")#
#	setvar $TOECHO ANSI_12 & "<<<  " & ANSI_11 & $PRODUCT & " MCIC = " & ANSI_14 & $MCIC
#	setvar $ANSILENGTH 28
#	if ($MCIC <> $UPPER_RANGE_MCIC)
#		setvar $TOECHO $TOECHO & ANSI_11 & " to " & ANSI_14 & $UPPER_RANGE_MCIC
#		setvar $ANSILENGTH 42
#	end
#	setvar $TOECHO $TOECHO & ANSI_12 & "  >>>"
#	replacetext $OUTTEXTSTRING "*" "[CR]"
#	if ($verbose_debug_mode = TRUE)
#		setvar $switchboard~message $toecho
#		gosub :bot~echo
#	end
#end
if ($lhteyh = 1) and ($lhteyh[1][6] = 1)
	if ($verbose_debug_mode = true)
		setvar $switchboard~message ansi_12&"*   <<<  "&ansi_14&"Exact .5 Anomaly Detected for this MCIC"&ansi_12&"  >>>"
		gosub :bot~echo
	end
end

if ($planet~planetship = "PLANET") and ($planet~planettrade_ratio <> 1)
	gosub :subptradenot100
	goto :223
end
if ($planet~planetship = "PLANET") and ($finaloffer = 1)
	if ($verbose_debug_mode = true)
		setvar $switchboard~message "*Deducting Final Counter by 1*"
		gosub :bot~echo
	end
	subtract $ltpehl 1
	round $ltpehl 0
	send $ltpehl "*"
	goto :223
end
round $ltpehl 0
send $ltpehl "*"

:223
setvar $ltpehl[$bid] $ltpehl
settextlinetrigger buyoffer :counteroffer "We'll buy them for"
settextlinetrigger selloffer :counteroffer "We'll sell them for"
settextlinetrigger finaloffer :finaloffer "Our final offer is"
settextlinetrigger startcredits :startcredits "credits"
settextlinetrigger goodtrade :goodtrade "For your good trading"
settextlinetrigger greattrade :goodtrade "For your great trading"
settexttrigger done :waittoport "Command [TL"
if ($bot~planettrade)
	settextlinetrigger planettrade :planettrade "How many units"
end
settextlinetrigger shiptrade :shiptrade "How many holds"
pause

:conventional
if ($verbose_debug_mode = true)
	setvar $switchboard~message  "*Calculated MinProductivity="&$hhrepp
	gosub :bot~echo
	setvar $switchboard~message  "*Calculated MaxProductivity="&$maxproductivity
	gosub :bot~echo
end
setvar $lhteyh 0
setarray $lhteyh 0
setvar $htoyey 0
setvar $mcic $low_mcic_guess
isnumber $yn1 $high_mcic_guess
isnumber $yn2 $ehylod
setvar $heeeoe ($high_mcic_guess + $ehylod)
round $heeeoe 0

:229
if ($mcic <> $heeeoe)
	if ($verbose_debug_mode = true)
		setvar $conventionalsubecho ""
		setvar $switchboard~message "*MCIC="&$mcic
		gosub :bot~echo
	end
	setvar $oohehy (($mcic / 1000) + 1)
	setvar $otyhly (($mcic * ($price_ratio_per_hold[$product] * $portqty)) / 10)
	setvar $productivity $lowproductivity

	:233
	if ($productivity <= $highproductivity)
		if ($verbose_debug_mode = true)
			setvar $switchboard~message " Productivity="&$productivity
			gosub :bot~echo
		end
		setvar $httypy ($otyhly / $productivity)
		setvar $base_var $eddhpo

		:237
		if ($base_var <= $pelhoh)
			if ($verbose_debug_mode = true)
				setvar $switchboard~message ansi_10&"*BaseVar="&$base_var
				gosub :bot~echo
			end
			setvar $eodery (($plusminus * $base_var) + $odhpth)
			setvar $calculated_price_per_hold (($eodery -$under_1000_experience_rate) -$httypy)
			setvar $pdhhly 0

			:241
			if ($calculated_price_per_hold < 4)
				add $calculated_price_per_hold 1
				add $pdhhly 1
				goto :241
			end
			setvar $oldpeh ($calculated_price_per_hold * $holds_to_trade)
			if ($verbose_debug_mode = true)
				setvar $echoexactprice $oldpeh
				round $echoexactprice 4
				setvar $switchboard~message " ExactPrice="&$echoexactprice
				gosub :bot~echo
			end
			setvar $olhyoy ((($oohehy -"0.003") * $oldpeh) -"0.5001")
			round $olhyoy 0
			setvar $tdleoh ((($oohehy + "0.003") * $oldpeh) + "0.5001")
			round $tdleoh 0
			if ($offer < $olhyoy) or ($offer > $tdleoh)
				if ($verbose_debug_mode = true)
					setvar $switchboard~message  ansi_15&" ("&$olhyoy&" - "&$tdleoh&")*"
					gosub :bot~echo
				end
				goto :246
			end
			if ($verbose_debug_mode = true)
				setvar $switchboard~message ansi_15&" ("&ansi_12&$olhyoy&ansi_15&" - "&ansi_12&$tdleoh&ansi_15&")*"
				gosub :bot~echo
				setvar $switchboard~message ansi_11&"*-.003 -.002 -.001 -000- +.001 +.002 +.003*"&ansi_10
				gosub :bot~echo
			end
			setvar $variance $rollhh

			:251
			if ($variance <= $plryhh)
				if ($verbose_debug_mode = true)
				end
				setvar $lhholr (($oohehy + $variance) * $oldpeh)
				if ($planet~planetship = "PLANET") and ($planet~planettrade_ratio <> 1)
					if ($verbose_debug_mode = true)
						setvar $switchboard~message "*PTrade="&$planet~planettrade_ratio&", IOTest changed from "&$lhholr&" to "
					end
					multiply $lhholr $planet~planettrade_ratio
					if ($verbose_debug_mode = true)
						setvar $switchboard~message $switchboard~message&$lhholr&"."
						gosub :bot~echo
					end
				end
				setvar $roundanomaly false
				setvar $tyoelt $lhholr
				round $tyoelt 0
				setvar $dyehhd ($lhholr -"0.5")
				round $dyehhd 7
				setvar $lpdood ($lhholr + "0.5")
				round $lpdood 7
				if ($tyoelt = $dyehhd)
					setvar $roundanomaly true
					setvar $isroundeddown true
					goto :262
				end
				if ($tyoelt = $lpdood)
					setvar $roundanomaly true
					setvar $isroundeddown false
				end

				:262
				round $lhholr 0
				setvar $iotpad ""
				getlength $lhholr $iotlength

				:264
				if ($iotlength < 5)
					setvar $iotpad $iotpad & " "
					add $iotlength 1
					goto :264
				end
				if ($lhholr = $offer)
					if ($verbose_debug_mode = true)
						setvar $switchboard~message ansi_12&$iotpad&$lhholr&" "
						gosub :bot~echo
					end
					gosub :conventionalsub
					goto :267
				end
				if ($roundanomaly = true)
					if ($isroundeddown = true)
						if (($lhholr + 1) = $offer)
							if ($verbose_debug_mode = true)
								setvar $switchboard~message ansi_13&$iotpad&"v"&ansi_12&$lhholr&" "
								gosub :bot~echo
							end
							gosub :conventionalsub
							goto :275
						end
						if ($verbose_debug_mode = true)
							setvar $switchboard~message ansi_13&$iotpad&"v"&ansi_10&$lhholr&" "
							gosub :bot~echo
						end

						:275
						goto :273
					end
					if ($isroundeddown = false)
						if (($lhholr -1) = $offer)
							if ($verbose_debug_mode = true)
								setvar $switchboard~message ansi_13&$iotpad&"^"&ansi_12&$lhholr&" "
								gosub :bot~echo
							end
							gosub :conventionalsub
							goto :282
						end
						if ($verbose_debug_mode = true)
							setvar $switchboard~message ansi_13&$iotpad&"^"&ansi_10&$lhholr&" "
							gosub :bot~echo
						end

						:282
					end

					:273
				end
				if ($verbose_debug_mode = true)
					if ($roundanomaly = false)
						if (($lhholr -$offer) = 1) or (($offer -$lhholr) = 1)
							setvar $switchboard~message ansi_13&$iotpad&$lhholr&" "
							gosub :bot~echo
							goto :292
						end
						setvar $switchboard~message ansi_10&$iotpad&$lhholr&" "
						gosub :bot~echo

						:292
					end
				end

				:267
				add $variance "0.001"
				round $variance 3
				goto :251
			end
			if ($verbose_debug_mode = true)
				setvar $switchboard~message "*"
				gosub :bot~echo
			end

			:246
			add $base_var 1
			round $base_var 0
			goto :237
		end
		add $productivity 1
		round $productivity 0
		goto :233
	end
	if ($verbose_debug_mode = true)
		setvar $switchboard~message ansi_15&$conventionalsubecho&ansi_10
		gosub :bot~echo
	end
	add $mcic $ehylod
	round $mcic 0
	goto :229
end
gosub :savederiveresults
if ($failed > 0)
	goto :conventional
end
return

:conventionalsub
add $lhteyh 1
round $lhteyh 0
round $mcic 0
round $base_var 1
round $variance 3
setvar $lhteyh[$lhteyh][1] $mcic
if ($verbose_debug_mode = true)
	setvar $conventionalsubecho $conventionalsubecho & "*$lHtEYh[" & $lhteyh & "][1] : MCIC=" & $mcic & " Prod=" & $productivity & " BaseVar=" & $base_var & " Variance=" & $variance
end
setvar $lhteyh[$lhteyh][2] $base_var
setvar $lhteyh[$lhteyh][3] $variance
setvar $lhteyh[$lhteyh][4] $productivity
setvar $lhteyh[$lhteyh][5] $oldpeh
if ($roundanomaly = true)
	setvar $lhteyh[$lhteyh][6] 1
end
setvar $rpoeel $oldpeh
round $rpoeel 3
setvar $hhdydo ($oohehy + $variance)
round $hhdydo 3
if ($pdhhly > $htoyey)
	setvar $htoyey $pdhhly
end
if ($productivity < $lowproductivity) or ($lowproductivity = 0)
	if ($verbose_debug_mode = true)
		setvar $conventionalsubecho $conventionalsubecho & "*Adjusting LowProductivity, from " & $lowproductivity & " to " & $productivity & " (Conventional)"
	end
	setvar $lowproductivity $productivity
end
if ($productivity > $highproductivity)
	if ($verbose_debug_mode = true)
		setvar $conventionalsubecho $conventionalsubecho & "*Adjusting HighProductivity, from " & $highproductivity & " to " & $productivity
	end
	setvar $highproductivity $productivity
end
return

:lowpercent
setvar $mcic $low_mcic_guess
gettime $starttime
setvar $lhteyh 0
setarray $lhteyh 0

:313
if (($mcic * $ehylod) <= ($high_mcic_guess * $ehylod))
	setvar $oeyrot ((($odhpth + ($plusminus * $pelhoh)) -$under_1000_experience_rate) -(($mcic * ($price_ratio_per_hold[$product] * $portqty)) / ($lowproductivity * 10)))
	round $oeyrot 3
	if ($oeyrot < 4)
		if ($verbose_debug_mode = true)
			setvar $switchboard~message "*Risk of anomaly at MCIC "&$mcic&", Min="&$oeyrot&", going to Conventional routine."
			gosub :bot~echo
		end
		gosub :conventional
		return
	end

	:319
	if ($base_var <= $pelhoh)

		:321
		if ($variance <= $plryhh)
			setvar $toeeee (($offer -".4999999999") / ((($mcic / 1000) + 1) + $variance))
			setvar $rydrth (($offer + ".4999999999") / ((($mcic / 1000) + 1) + $variance))
			setvar $oldlly ((($mcic * $price_ratio_per_hold) * $portqty) / (10 * ((($odhpth + ($base_var * $plusminus)) -$under_1000_experience_rate) -($rydrth / $holds_to_trade))))
			setvar $hlhtlr ((($mcic * $price_ratio_per_hold) * $portqty) / (10 * ((($odhpth + ($base_var * $plusminus)) -$under_1000_experience_rate) -($toeeee / $holds_to_trade))))
			if ($hlhtlr < $oldlly)
				setvar $temp $oldlly
				setvar $oldlly $hlhtlr
				setvar $hlhtlr $temp
			end
			setvar $b1 $oldlly
			setvar $b2 $hlhtlr
			add $b1 "0.4999999999"
			round $b1 0
			subtract $b2 "0.4999999999"
			round $b2 0
			if ($b1 <= $b2)
				setvar $a1 $lowproductivity
				setvar $a2 $highproductivity
				if ($a2 >= $b1) and ($a1 <= $b2)
					if ($a1 >= $b1)
						setvar $c1 $a1
						goto :330
					end
					setvar $c1 $b1

					:330
					if ($a2 <= $b2)
						setvar $c2 $a2
						goto :332
					end
					setvar $c2 $b2

					:332
					setvar $i $c1

					:333
					if ($i <= $c2)
						add $lhteyh 1
						round $lhteyh 0
						setvar $lhteyh[$lhteyh][1] $mcic
						setvar $lhteyh[$lhteyh][2] $base_var
						setvar $lhteyh[$lhteyh][3] $variance
						setvar $lhteyh[$lhteyh][4] $i
						setvar $lhteyh[$lhteyh][5] (((($odhpth + ($plusminus * $base_var)) -(($portqty / ($i * 10)) * ($mcic * $price_ratio_per_hold))) -$under_1000_experience_rate) * $holds_to_trade)
						add $i 1
						round $i 0
						goto :333
					end
				end
			end
			add $variance ".001"
			round $variance 3
			goto :321
		end
		setvar $variance $rollhh
		add $base_var 1
		round $base_var 0
		goto :319
	end
	setvar $base_var $eddhpo
	add $mcic $ehylod
	round $mcic 0
	goto :313
end
gosub :savederiveresults
if ($failed > 0)
	goto :lowpercent
end
return

:savederiveresults
if ($lhteyh > 0)
	setvar $failed 0
	setvar $mcic 0
	setvar $upper_range_mcic 0
	setvar $hoddhl 0
	setvar $pyhopr 0
	setvar $i 1

	:339
	if ($i <= $lhteyh)
		if (($lhteyh[$i][1] * $ehylod) < ($mcic * $ehylod)) or ($mcic = 0)
			setvar $mcic $lhteyh[$i][1]
			if ($verbose_debug_mode = true)
				setvar $switchboard~message "*In :saveDeriveResults, setting $MCIC to "&$lhteyh[$i][1]
				gosub :bot~echo
			end
		end
		if (($lhteyh[$i][1] * $ehylod) > ($upper_range_mcic * $ehylod))
			setvar $upper_range_mcic $lhteyh[$i][1]
		end
		if ($lhteyh[$i][4] < $hoddhl) or ($hoddhl = 0)
			setvar $hoddhl $lhteyh[$i][4]
		end
		if ($lhteyh[$i][4] > $pyhopr)
			setvar $pyhopr $lhteyh[$i][4]
		end
		add $i 1
		round $i 0
		goto :339
	end
	if ($verbose_debug_mode = true)
		setvar $switchboard~message "*Derived Min/Max MCIC = "&$mcic&" & "&$upper_range_mcic
		gosub :bot~echo
		setvar $switchboard~message "*Derived Min/Max Productivity = "&$hoddhl&" & "&$pyhopr
		gosub :bot~echo
	end
	setsectorparameter $sector $product & "-" $mcic
	setsectorparameter $sector $product & "+" $upper_range_mcic
	setsectorparameter $sector $product & "L" $hoddhl
	setsectorparameter $sector $product & "H" $pyhopr
	goto :338
end
if ($failed = 0)
	if ($verbose_debug_mode = true)
		setvar $switchboard~message ansi_12&"*Derive Failed Once, Adjusting highProductivity.*"
		gosub :bot~echo
		gosub :logderivefailure
		if ($paused_debug_mode = true)
			setvar $switchboard~message "*Press SPACE to continue..."
			gosub :bot~echo
			settextouttrigger debugpause :dbp1 " "
			pause

			:dbp1
		end
	end
	setvar $failed 1
	setvar $highproductivity $maxproductivity
	setsectorparameter $sector $product & "H" $maxproductivity
	goto :338
end
if ($failed = 1)
	if ($verbose_debug_mode = true)
		setvar $switchboard~message ansi_12&"*Derive Failed Twice, Resetting Productivity and MCIC values.*"
		gosub :bot~echo
		if ($paused_debug_mode = true)
			setvar $switchboard~message "*Press SPACE to continue..."
			gosub :bot~echo
			settextouttrigger debugpause :dbp2 " "
			pause

			:dbp2
		end
	end
	setvar $failed 2
	setvar $high_mcic_guess ($ehylod * $high_mcic_guess[$product])
	round $high_mcic_guess 0
	setvar $low_mcic_guess ($ehylod * $low_mcic_guess[$product])
	round $low_mcic_guess 0
	setsectorparameter $sector $product & "-" $low_mcic_guess
	setsectorparameter $sector $product & "+" $high_mcic_guess
	setvar $lowproductivity $hhrepp
	setsectorparameter $sector $product & "L" $hhrepp
	setvar $highproductivity $maxproductivity
	setsectorparameter $sector $product & "H" $maxproductivity
	setvar $eddhpo 0
	setvar $pelhoh 18
	goto :338
end
if ($failed = 2)
	setvar $switchboard~message ansi_12&"*Derive Failed, Port parameters could not be determined.*"
	gosub :bot~echo
	if ($paused_debug_mode = true)
		setvar $switchboard~message "*Press SPACE to continue..."
		gosub :bot~echo
		settextouttrigger debugpause :dbp3 " "
		pause

		:dbp3
	end
	if ($planet~planetship = "PLANET")
		setvar $switchboard~message "Ensure that MBBS and Planetary Trade values are correct.*"
		gosub :bot~echo
		goto :367
	end
	setvar $switchboard~message "Ensure that MBBS value is correct.*"
	gosub :bot~echo

	:367
	gosub :killtextouts
	setvar $failed 0
end

:338
return

:logderivefailure
:subbluehaggle
if ($buysell = "BUYING")
	setvar $ltpehl (($lhteyh[$i][5] * ".9799999999") -".5")
	if ($ltpehl < $lhplhl) or ($lhplhl = 0)
		setvar $lhplhl $ltpehl
	end
	goto :369
end
setvar $ltpehl (($lhteyh[$i][5] / ".9799999999") + ".5")
if ($ltpehl > $ptorpe)
	setvar $ptorpe $ltpehl
end

:369
return

:subptradenot100
setvar $rhyedl ($ltpehl * $planet~planettrade_ratio)
if ($verbose_debug_mode = true)
	setvar $switchboard~message "*PTradeCounter="&$ltpehl&" X "&$planet~planettrade_ratio&" = "&$rhyedl&"*"
	gosub :bot~echo
end
if ($finaloffer = 1)
	if ($buysell = "BUYING")
		setvar $rhyedl ($rhyedl -".4999999999")
		goto :379
	end
	setvar $rhyedl ($rhyedl + ".4999999999")

	:379
end
round $rhyedl 0
setvar $switchboard~message "$RHYEDL:"&$rhyedl&"*"
gosub :bot~echo
send $rhyedl "*"
return

:textout
killtrigger "TEXTOUT0"
killtrigger "TEXTOUT1"
killtrigger "TEXTOUT2"
killtrigger "TEXTOUT3"
killtrigger "TEXTOUT4"
killtrigger "TEXTOUT5"
killtrigger "TEXTOUT6"
killtrigger "TEXTOUT7"
killtrigger "TEXTOUT8"
killtrigger "TEXTOUT9"
killtrigger "TEXTOUTENTER"
getouttext $outtext
setvar $outtextstring $outtextstring & $outtext
settextouttrigger textout0 :textout 0
settextouttrigger textout1 :textout 1
settextouttrigger textout2 :textout 2
settextouttrigger textout3 :textout 3
settextouttrigger textout4 :textout 4
settextouttrigger textout5 :textout 5
settextouttrigger textout6 :textout 6
settextouttrigger textout7 :textout 7
settextouttrigger textout8 :textout 8
settextouttrigger textout9 :textout 9
settextouttrigger textoutenter :textout "*"
pause

:killtextouts
killtrigger "TEXTOUT0"
killtrigger "TEXTOUT1"
killtrigger "TEXTOUT2"
killtrigger "TEXTOUT3"
killtrigger "TEXTOUT4"
killtrigger "TEXTOUT5"
killtrigger "TEXTOUT6"
killtrigger "TEXTOUT7"
killtrigger "TEXTOUT8"
killtrigger "TEXTOUT9"
killtrigger "TEXTOUTENTER"
return

:readmcicfile
setprecision 0
setvar $switchboard~message ansi_10&"*Merging data from file into Database..."
gosub :bot~echo
setvar $errors ""
setvar $mcicfileline 2
read $mcicfilename $$filetest 1
if ($filetest <> "Sector,Product,LowMCIC,HighMCIC,LowProductivity,HighProductivity")
	setvar $switchboard~message ansi_12&"FAILED!*THIS FILE IS NOT A VALID EXPORT!**"
	gosub :bot~echo
	return
end
read $mcicfilename $mcicfiledata $mcicfileline

:382
if ($mcicfiledata <> "EOF")
	replacetext $mcicfiledata "," " "
	getword $mcicfiledata $tempsec 1
	getword $mcicfiledata $tempproduct 2
	getword $mcicfiledata $tempmcic1 3
	getword $mcicfiledata $tempmcic2 4
	getword $mcicfiledata $tempprod1 5
	getword $mcicfiledata $tempprod2 6
	isnumber $yn1 $tempsec
	isnumber $yn2 $tempmcic1
	isnumber $yn3 $tempmcic2
	isnumber $yn4 $tempprod1
	isnumber $yn5 $tempprod2
	setvar $failed 0
	if ($yn1)
		if ($tempsec >= 1) and ($tempsec <= sectors)
			if ($tempproduct = "FUEL") or ($tempproduct = "ORGANICS") or ($tempproduct = "EQUIPMENT") and ($yn2) and ($yn3) and ($yn4) and ($yn5)
				setvar $importitem $tempmcic1
				striptext $importitem "-"
				getsectorparameter $tempsec $tempproduct & "-" $temp
				if ($importitem > $temp)
					setsectorparameter $tempsec $tempproduct & "-" $tempmcic1
				end
				setvar $importitem $tempmcic2
				striptext $importitem "-"
				getsectorparameter $tempsec $tempproduct & "+" $temp
				if ($importitem < $temp) or ($temp = 0)
					setsectorparameter $tempsec $tempproduct & "+" $tempmcic2
				end
				setvar $importitem $tempprod1
				getsectorparameter $tempsec $tempproduct & "L" $temp
				if ($importitem > $temp)
					setsectorparameter $tempsec $tempproduct & "L" $tempprod1
				end
				setvar $importitem $tempprod2
				getsectorparameter $tempsec $tempproduct & "H" $temp
				if ($importitem > $temp)
					setsectorparameter $tempsec $tempproduct & "H" $tempprod2
				end
				goto :389
			end
			setvar $failed 1

			:389
			goto :387
		end
		setvar $failed 1

		:387
		goto :385
	end
	setvar $failed 1

	:385
	if ($failed = 1)
		setvar $errors $errors & "*Sector:" & $tempsec & ", Product=" & $tempproduct
	end
	add $mcicfileline 1
	read $mcicfilename $mcicfiledata $mcicfileline
	goto :382
end
setvar $switchboard~message ansi_10&"COMPLETE*"
gosub :bot~echo
if ($errors <> "")
	setvar $switchboard~message ansi_12&"*ERRORS ENCOUNTERED, UNMERGED DATA AS FOLLOWS:"&ansi_11&$errors&"*"
	gosub :bot~echo
end
return

:writemcicfile
setvar $switchboard~message ansi_10&"*Exporting known MCIC data..."
gosub :bot~echo

write $mcicfilename "Test Passed"
delete $mcicfilename
write $mcicfilename "Sector,Product,LowMCIC,HighMCIC,LowProductivity,HighProductivity"
setprecision 0
setvar $i 1
setvar $products "FUEL ORGANICS EQUIPMENT"

:402
if ($i <= sectors)
	setvar $word 1

	:404
	if ($word <= 3)
		getword $products $product $word
		getsectorparameter $i $product & "-" $a
		if ($a <> "")
			getsectorparameter $i $product & "+" $b
			getsectorparameter $i $product & "L" $c
			getsectorparameter $i $product & "H" $d
			write $mcicfilename $i & "," & $product & "," & $a & "," & $b & "," & $c & "," & $d
		end
		add $word 1
		goto :404
	end
	add $i 1
	goto :402
end
setprecision 15
setvar $switchboard~message ansi_11&"COMPLETE**Data saved in the TWX Proxy folder as "&$mcicfilename&".**"
gosub :bot~echo
return

:checkforbluetrader
if (($player~alignment >= 0) and ($player~experience > 800) and ($player~experience < 1000) and ($bot~worstprice <> true))
	setvar $bot~bluehaggle true
	savevar $bot~bluehaggle
end
return

include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\bot_includes\player\quikstats\player"
