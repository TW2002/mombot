setvar	$furb_nholds	33
setvar	$furb_nletter	"h"
setvar	$furb_fholds	97
setvar	$furb_fletter	"o"
setvar	$the_nruns		0
setvar	$the_fruns		0
setvar	$start_cash		0
setvar	$furb_cost		0
setvar	$ck_mode		false
setvar	$version		"2.0.5"
setvar  $planet~citadel_furb	false

#gets figs after furbing, when it doesn't need to (or at least lets override)
#	- could pick up figs before furbing if below a threshold
#needs to scan to see if furb available
#needs an option to create furbs for sector, then scan to see if available

gosub :_start_
isnumber $tst $bot~parm1
if ($tst = 0)
	if ($bot~parm1 = "ck")
		setvar $ck_mode true
		#						[norm hold]
		isnumber $tst $bot~parm2
		if ($tst = 0)
			setvar $switchboard~message "Syntax Error: Normal Holds Value Is Not A Number*"
			gosub :switchboard~switchboard
			halt
		end
		if ($bot~parm2 < 1) or ($bot~parm2 > 255)
			if ($bot~parm2 <> 0)
				setvar $switchboard~message "Syntax Error: Normal Holds Value Out Of Range*"
				gosub :switchboard~switchboard
				halt
			end
		else
			setvar $furb_nholds $bot~parm2
		end
		#						[fake hold]
		isnumber $tst $bot~parm3
		if ($tst = 0)
			setvar $switchboard~message "Syntax Error: Fake-Bust Holds Value Is Not A Number*"
			gosub :switchboard~switchboard
			halt
		end
		if ($bot~parm3 < 1) or ($bot~parm3 > 255)
			if ($bot~parm2 <> 0)
				setvar $switchboard~message "Syntax Error: Fake-Bust Holds Value Out Of Range*"
				gosub :switchboard~switchboard
				halt
			end
		else
			setvar $furb_fholds $bot~parm3
		end
		#						[norm letter]
		replacetext $bot~parm4 "0" $furb_nletter
		if ($bot~parm4 = "a") or ($bot~parm4 = "b") or ($bot~parm4 = "c") or ($bot~parm4 = "d") or ($bot~parm4 = "e") or ($bot~parm4 = "f") or ($bot~parm4 = "g") or ($bot~parm4 = "h") or ($bot~parm4 = "i") or ($bot~parm4 = "j") or ($bot~parm4 = "k") or ($bot~parm4 = "l")  or ($bot~parm4 = "m") or ($bot~parm4 = "n") or ($bot~parm4 = "o") or ($bot~parm4 = "p") or ($bot~parm4 = "r")
			setvar $furb_nletter $bot~parm4
		else
			setvar $switchboard~message "Syntax Error: Normal Bust Ship-Letter Value Is Not Valid*"
			gosub :switchboard~switchboard
			halt
		end
		#						[fake letter]
		replacetext $bot~parm5 "0" $furb_fletter
		if ($bot~parm5 = "a") or ($bot~parm5 = "b") or ($bot~parm5 = "c") or ($bot~parm5 = "d") or ($bot~parm5 = "e") or ($bot~parm5 = "f") or ($bot~parm5 = "g") or ($bot~parm5 = "h") or ($bot~parm5 = "i") or ($bot~parm5 = "j") or ($bot~parm5 = "k") or ($bot~parm5 = "l")  or ($bot~parm5 = "m") or ($bot~parm5 = "n") or ($bot~parm5 = "o") or ($bot~parm5 = "p") or ($bot~parm5 = "r")
			setvar $furb_fletter $bot~parm5
		else
			setvar $switchboard~message "Syntax Error: Normal Bust Ship-Letter Value Is Not Valid*"
			gosub :switchboard~switchboard
			halt
		end
	end
else
	isnumber $tst $bot~parm1
	if ($tst = 0)
		setvar $switchboard~message "Syntax Error: Ship Number Is Not A Number*"
		gosub :switchboard~switchboard
		halt
	end
	if ($bot~parm1 > 1) or ($bot~parm1 <= 2000)
		setvar $bustship $bot~parm1
	else
		setvar $switchboard~message "Syntax Error: Ship Number Is Out Of Range*"
		gosub :switchboard~switchboard
		halt
	end

	if ($planet~citadel_furb)

		killalltriggers
		send "C ZQ "
		waitfor "<Active Ship Scan>"

		:eachship
		settextlinetrigger shiploc :shiploc " "&$bustship&" "
		settextlinetrigger nofind :nofind "Computer command [TL="
		pause

		:nofind
		killtrigger shiploc
		setvar $switchboard~message "Can't find ship " & $bustship & "*"
		gosub :switchboard~switchboard
		halt

		:shiploc
		killtrigger nofind
		getword currentline $isbustship 1
		if ($isbustship = $bustship)
			getword currentline $bustloc 2
			if ($bustloc = stardock)
				setvar $switchboard~message "Cannot Furb StarDock Sector*"
				gosub :switchboard~switchboard
				halt
			end
			setvar $switchboard~message "Ship " & $bustship & " found, heading in to citadel furb.*"
			gosub :switchboard~switchboard
			setvar $player~warpto $bustloc
			gosub :move~twarp
			if ($player~twarpsuccess = false)
				setvar $switchboard~message "Couldn't TWARP - something is wrong.  Halting.*"
				gosub :switchboard~switchboard
				halt
			else
				send "l "&$planet~planet_number&"* c e y "
				if ($player~credits < 1000000)
					send "t f "&(1000000-$player~credits)&"*"
				end
				send "q t*l3*t*t1*c "
				setvar $player~warpto stardock
				if ($bwarp)
					gosub :player~bwarp
				else
					send "q q * * "
					gosub :move~twarp
				end
				gosub :player~quikstats
				if ((currentsector = 1) or (port.class[currentsector] = 0))
					if ($startinglocation = "Citadel")
						send "q "
						gosub :planet~getplanetinfo
						send "q "
					end
					send "p ty"
				elseif (currentsector = $map~stardock)
					send "p ss ys *p"
				else
					setvar $switchboard~message "Couldn't BWARP - something is wrong.  Halting.*"
					gosub :switchboard~switchboard
					halt
				end
				setvar $switchboard~message ""
				settextlinetrigger limpet   :marklimpet     "After an intensive scanning search, they find and remove the Limpet"
				settextlinetrigger limpetno     :marklimpetno   "The port official frowns at you (you haven't the funds!) and storms"
				settextlinetrigger holds  :buyholds    "A  Cargo holds     :"
				pause

				:marklimpet
				setvar $message "Limpet scrubbed off of hull.*"
				pause

				:marklimpetno
				setvar $message "Limpet exists, but not enough cash to get scrubbed.*"
				pause

				:buyholds
				killtrigger limpet
				killtrigger limpetno
				killtrigger holds
				getword currentline $holdstobuy 10
				send "a "&$holdstobuy&"* y q q q * "
				if ($startinglocation = "Citadel")
					gosub :planet~landingsub
				end
				gosub :player~quikstats
				if ($message <> "")
					setvar $switchboard~message $message
					gosub :switchboard~switchboard
				end
			end

		else
			goto :eachship
		end

	else

		isnumber $tst $bot~parm2
		if ($tst = 0)
			setvar $switchboard~message "Syntax Error: Holds Value Is Not A Number*"
			gosub :switchboard~switchboard
			halt
		end
		if ($bot~parm2 < 1) or ($bot~parm2 > 255)
			if ($bot~parm2 <> 0)
				setvar $switchboard~message "Syntax Error: Holds Value Out Of Range*"
				gosub :switchboard~switchboard
				halt
			else
				setvar $furb_nholds 0
			end
		else
			setvar $furb_nholds $bot~parm2
		end

		replacetext $bot~parm3 "0" $furb_nletter
		if ($bot~parm3 = "a") or ($bot~parm3 = "b") or ($bot~parm3 = "c") or ($bot~parm3 = "d") or ($bot~parm3 = "e") or ($bot~parm3 = "f") or ($bot~parm3 = "g") or ($bot~parm3 = "h") or ($bot~parm3 = "i") or ($bot~parm3 = "j") or ($bot~parm3 = "k") or ($bot~parm3 = "l")  or ($bot~parm3 = "m") or ($bot~parm3 = "n") or ($bot~parm3 = "o") or ($bot~parm3 = "p") or ($bot~parm3 = "r")
			setvar $furb_nletter $bot~parm3
		else
			setvar $switchboard~message "Syntax Error: Ship-Letter Value Is Not Valid*"
			gosub :switchboard~switchboard
			halt
		end
		striptext $bustship "."
		striptext $bustship ","
		setvar $addholds $furb_nholds
		setvar $shipletter $furb_nletter
		setvar $shipname "M()M FURB {" & $addholds & "}"
		echo "Starting...."
		goto :startfurb
	end
	halt
end

send "'*{" $switchboard~bot_name "} Starting CK Furb mode:*  -Normal Furbs*     Holds Added: "&$furb_nholds&"  Ship Letter: "&$furb_nletter&"*  -Fake Furbs*     Holds Added: "&$furb_fholds&"  Ship Letter: "&$furb_fletter&"**"
waitfor "Sub-space comm-link terminated"
setvar $switchboard~message "Bot is now mimicking CK Furb.  Use CK Furb calls while this mode is on.*"
gosub :switchboard~switchboard

:setckfurbtriggers
killalltriggers
gosub :player~quikstats

if (($player~fighters + $player~shields) < 1001)
	setvar $switchboard~message "Have too few Fighters/Shields To Survive 100% Haz*"
	gosub :switchboard~switchboard
	halt
end
if ($player~unlimitedgame = false) and ($player~turns < 10)
	setvar $switchboard~message "Too Low On Turns To Continue*"
	gosub :switchboard~switchboard
	halt
end
if ($player~unlimitedgame = false)
	setvar $switchboard~message "Ready To Bring A Furb (" &$player~turns & ")*"
	gosub :switchboard~switchboard
else
	setvar $switchboard~message "Ready To Bring A Furb*"
	gosub :switchboard~switchboard
end

setvar $_str_ (ansi_9 & "**{"&ansi_14&$switchboard~bot_name&ansi_9&"} " & ansi_15 & "---------- Furb v"&$version&" Running ----------*")
setvar $_str_ ($_str_ & ansi_15 & "    Normal Furb Runs  "&ansi_14&":"&ansi_7&" " & $the_nruns & "*")
setvar $_str_ ($_str_ & ansi_15 & "    Fake Furb Runs    "&ansi_14&":"&ansi_7&" " & $the_fruns & "*")
if ($player~unlimitedgame = false)
	setvar $_str_ ($_str_ & ansi_15 & "    Turns Left        "&ansi_14&":"&ansi_7&" " & $player~turns & "*")
else
	setvar $_str_ ($_str_ & ansi_15 & "    Turns Left        "&ansi_14&":"&ansi_7&" UNLIMITED*")
end
setvar $cashamount ($player~credits - $start_cash)
gosub :commasize
setvar $_str_ ($_str_ & ansi_15 & "    Profit            "&ansi_14&":"&ansi_7&"$" & $cashamount & "*")

if ($the_nruns <> 0) or ($the_fruns <> 0)
	add $furb_cost ($temp - ($player~credits - $decash))
end
setvar $cashamount $furb_cost
gosub :commasize
setvar $_str_ ($_str_ & ansi_15 & "    Expenditure       "&ansi_14&":"&ansi_7&"$" & $cashamount & "*")
setvar $_str_ ($_str_ & ansi_9 & "{"&ansi_14&$switchboard~bot_name&ansi_9&"} " & ansi_15 & "---------------------------------------**")
echo $_str_
settextlinetrigger 1 :ckfurbrequested "Busted in ship"
settextlinetrigger 2 :ckfakefurbrequested "FAKE Busted in Ship"
pause

:ckfurbrequested
# R Cherok Busted in ship 2, FURB please, I still have 327 turns to run.
cuttext currentline $spoof 1 1
if ($spoof <> "R")
	if ($ck_mode)
		goto :setckfurbtriggers
	else
		halt
	end
end
getlength currentline $len
if ($len >= 25)
	cuttext currentline $bustship 25 4
else
	if ($ck_mode)
		goto :setckfurbtriggers
	else
		halt
	end
end
striptext $bustship "."
striptext $bustship ","
striptext $bustship " "
setvar $shipname "CK FURB "
setvar $addholds $furb_nholds
setvar $shipletter $furb_nletter
add $the_nruns 1
goto :startfurb

:ckfakefurbrequested
# R Cherok FAKE Busted in Ship 49, need a super furb
cuttext currentline $spoof 1 1
if ($spoof <> "R")
	if ($ck_mode)
		goto :setckfurbtriggers
	else
		halt
	end
end
getlength currentline $len
if ($len >= 30)
	cuttext currentline $bustship 30 4
else
	if ($ck_mode)
		goto :setckfurbtriggers
	else
		halt
	end
end
striptext $bustship "."
striptext $bustship ","
striptext $bustship " "
setvar $shipname "CK FAKE FURB"
setvar $addholds $furb_fholds
setvar $shipletter $furb_fletter
add $the_fruns 1
goto :startfurb

:startfurb
killalltriggers
send "C ZQ "

waitfor "<Active Ship Scan>"

:eachshiploc
settextlinetrigger shiploc :shiplocf " "&$bustship&" "
settextlinetrigger nofind :nofindf "Computer command [TL="
pause

:nofindf
killtrigger shiploc
setvar $switchboard~message "Can't find ship " & $bustship & "*"
gosub :switchboard~switchboard
if ($ck_mode)
	goto :setckfurbtriggers
else
	halt
end

:shiplocf
killtrigger nofind
getword currentline $isbustship 1

if ($isbustship = $bustship)

	getword currentline $bustloc 2
	if ($bustloc = stardock)
		setvar $switchboard~message "Cannot Furb StarDock Sector*"
		gosub :switchboard~switchboard
		if ($ck_mode)
			goto :setckfurbtriggers
		else
			halt
		end
	end
	setvar $switchboard~message "Ship " & $bustship & " found, bringing a furb.*"
	gosub :switchboard~switchboard
	gosub :buyfurbs
	goto :towfurb
else
	goto :eachshiploc
end

:towfurb
settexttrigger 		nofig 		:nofig "blind?"
settextlinetrigger 	lowshipore 	:lowshipore "You do not have enough Fuel Ore to make the jump."
settextlinetrigger	locked 		:locked "Locating beam pinpointed"
settexttrigger 		adj 		:adj "NavPoint Settings"
settextlinetrigger 	atdock 		:atdock "You are already in that sector!"
send "W  N " & $furb & "* M " & $bustloc & "* Y"
pause

:nofig
killtrigger nofig
killtrigger lowshipore
killtrigger locked
killtrigger adj
killtrigger atdock
send "N W "
if ($furbtype = "furb")
	subtract $i 1
end
setvar $switchboard~message "No fighter down at that ship number, drop a fig.*"
gosub :switchboard~switchboard
if ($ck_mode)
	goto :setckfurbtriggers
else
	halt
end

:adj
killtrigger nofig
killtrigger lowshipore
killtrigger locked
killtrigger adj
killtrigger atdock
send "* q * "
setvar $switchboard~message "Why am I furbing adjacent to stardock?*"
gosub :switchboard~switchboard
goto :locked

:atdock
killtrigger nofig
killtrigger lowshipore
killtrigger locked
killtrigger adj
killtrigger atdock
send "* "
if ($furbtype = "furb")
	subtract $i 1
end
setvar $switchboard~message "That ship is at stardock, try again*"
gosub :switchboard~switchboard
if ($ck_mode)
	goto :setckfurbtriggers
else
	halt
end

:lowshipore
killtrigger nofig
killtrigger lowshipore
killtrigger locked
killtrigger adj
killtrigger atdock
send "W"
if ($furbtype = "furb")
	subtract $i 1
end
setvar $switchboard~message "*"
gosub :switchboard~switchboard
send "'I don't have enough ore, how did this happen?*"
send "'You can try to make me furb a closer ship that has an ore selling port.*"
send "'If that doesn't work, I just can't help you.*"
if ($ck_mode)
	goto :setckfurbtriggers
else
	halt
end

:locked
killtrigger nofig
killtrigger lowshipore
killtrigger locked
killtrigger adj
killtrigger atdock
send "Y  * * W"
waitfor "You shut off your Tractor Beam."
setvar $switchboard~message "Furb delivered*"
gosub :switchboard~switchboard
waiton "Message sent on sub-space channel"
settextlinetrigger firstship :firstship "Ships   : "
send "d"
pause

:firstship
killtrigger firstship
gettext currentline $name "Ships   : " " [Owned by]"
if ($name = $shipname)
	setvar $foundn 1
	goto :doneships
end
setvar $shiplisti 1

:moreships
settextlinetrigger nextship :nextship "ftrs,"
settextlinetrigger doneships :doneships "Warps to Sector(s) :"
pause

:nextship
add $shiplisti 1
killtrigger nextship
killtrigger doneships
gettext currentline $name "          " " [Owned by]"
if ($name = $shipname)
	setvar $foundn $shiplisti
	goto :doneships
end

goto :moreships

:doneships
killtrigger nextship
killtrigger doneships
echo "#" $foundn "#"
if ($waitsecs > 0)
	send "tc"
	settexttrigger		there		:there		"Exchange with"
	settextlinetrigger	notthere	:notthere	"Your Associate must be in the same sector to conduct transfers!"
	pause

	:there
	send "YF"
	waitfor "credits, and"
	gettext currentline $decash " has " "."
	striptext $decash ","
	striptext $decash " "
	if ($nodecash = true)
		if ($player~credits < 500000)
			setvar $decash (500000-$player~credits)
			send $decash & "*"
		else
			setvar $decash 0
			send "*"
		end
	else
		if ($decash > 500000)
			setvar $decash ($decash - 500000)
			send $decash & "*"
		else
			setvar $decash 0
			send "*"
		end
	end
	setvar $figs 0
	send "fyt"
	waitfor "fighters, and"
	gettext currentline $figs " has " "."
	striptext $figs " "
	striptext $figs ","
	if ($figs < 100)
		send (100 - $figs) & "*"
	else
		send "*"
	end
	send "  *   *   "

	:notthere
	killalltriggers
	send "   * *    "
end

:loadore
:checkport
send "D"
gosub :player~quikstats
if ($planet~planet_number <> "0")
	send "l "&$planet~planet_number&"* tnt1* q q * "
elseif (port.exists[$player~current_sector] = false) or (port.buyfuel[$player~current_sector] = true) or (port.class[$player~current_sector] <= 0) or (port.class[$player~current_sector] >= 9)
	if ($topplanet = 1)

		setvar $planet~planetnumok 0
		send "lq*"

		:checkplanetsinsector
		settextlinetrigger orenoplanet :orenoplanet "There isn't a planet in this sector."
		settextlinetrigger oreoneplanet :oreoneplanet "-------  ---------  ---------  ---------  ---------  --"
		settextlinetrigger orestartplannum :orestartplannum "and Planet Name"
		settextlinetrigger orestartplanetsok :orestartplanetsok "< "

		pause

		:orestartplannum
		killalltriggers
		setvar $planet~planetnumok 1
		goto :checkplanetsinsector

		:orenoplanet
		killalltriggers
		setvar $switchboard~message "I'd love to get ore off a planet but there isn't one here!*"
		gosub :switchboard~switchboard
		goto :checkplanetsfinishwait

		:orestartplanetsok
		killalltriggers
		if ($planet~planetnumok = 1)

			getword currentline $cplanetnum 2
			striptext $cplanetnum ">"

			send "l" $cplanetnum "* t n t 1 * q "
			goto :checkplanetsfinishwait
		else
			goto :checkplanetsinsector
		end

		:oreoneplanet
		killalltriggers
		send "l t n t 1 * q "

		:checkplanetsfinishwait
	else
		setvar $switchboard~message "This is not an ore selling port and I don't know the planet number, THAT SUCKS!*"
		gosub :switchboard~switchboard
	end
else

	send "P T * * 0* 0*"
	waitfor "Enter your choice [T]"
	waitfor "Command ["
	gosub :player~quikstats
	setvar $empty_holds ($player~total_holds - ($player~ore_holds + $player~organic_holds + $player~equipment_holds + $player~colonist_holds))
	echo $empty_holds
	if ($empty_holds > 0)
		setvar $switchboard~message "Ore at port critically low!*"
		gosub :switchboard~switchboard
		setdelaytrigger pauseforport :pauseforport 4000
		pause

		:pauseforport
		killtrigger pauseforport
	end

end
settexttrigger 		nofig2 		:nofig2 		"blind?"
settextlinetrigger 	lowshipore2 :lowshipore2 	"You do not have enough Fuel Ore to make the jump."
settextlinetrigger 	locked2 	:locked2 		"Locating beam pinpointed"
settexttrigger 		adj2 		:adj2 			"NavPoint Settings"
#send "NSY"
send "M" & stardock & "*Y"
pause

:nofig2
killtrigger nofig2
killtrigger lowshipore2
killtrigger locked2
killtrigger adj2
send "N "
setvar $switchboard~message "I SEEM TO HAVE LOST MY COMMISSION, SCRIPT HALTED*"
gosub :switchboard~switchboard
halt

:lowshipore2
killtrigger nofig2
killtrigger lowshipore2
killtrigger locked2
killtrigger adj2
setvar $switchboard~message "I don't have enough ore. SCRIPT HALTED*"
gosub :switchboard~switchboard
halt

:locked2
killtrigger nofig2
killtrigger lowshipore2
killtrigger locked2
killtrigger adj2
# Removing as this is wasting a turn!
#if ($FIGS = 0)
send "Y "
if ($doblow = 1)
	subtract $foundn 1
	setvar $mac "mac a"
	setvar $maci 1
	while ($maci <= $foundn)
		setvar $mac $mac &"n"
		add $maci 1
	end

	setvar $mac $mac &"y99^M"
	send "'" $blowbot " " $mac "*"
end
#else
#	send "Y P S G Y G Q S P B " & (100 - $FIGS) & "* Q Q Q "
#end
if ($ck_mode)
	goto :setckfurbtriggers
else
	halt
end

:adj2
killtrigger nofig2
killtrigger lowshipore2
killtrigger locked2
killtrigger adj2
send "* "
if ($ck_mode)
	goto :setckfurbtriggers
else
	halt
end

:buyfurbs
setvar $temp $player~credits
send "P S G Y G Q S B N Y " & $shipletter & "Y qrP " & $shipname &"* * * "
if ($player~fighters <= 1001)
	setvar $ftobuy (1002 - $player~fighters)
	send "P B " $ftobuy "* q  "
end
waitfor "[Pause]"

:listfurbs
send "S"
waitfor "<Sell an old Ship>"
settextlinetrigger notefurb :notefurb $shipname
settextlinetrigger nofurb :nofurb "You do not own any other ships orbiting the Stardock!"
settexttrigger nofurb2 :nofurb "Choose which ship to sell (Q=Quit)"
pause

:nofurb
send "q q '{" $switchboard~bot_name "} Furb purchase not possible (maybe not enough cash on hand?)*"
if ($ck_mode)
	goto :setckfurbtriggers
else
	halt
end

:notefurb
killtrigger nofurb
killtrigger nofurb2
getword currentline $isdock 2
if ($isdock = stardock)
	getword currentline $furb 1
end

:listend
send "Q Q Q "
if ($addholds > 0)
	send "x    " & $furb & "* Q P S S P A " & $addholds & "* Y Q Q Q X    " & $towship & "* q "
end
return

:_start_
loadvar $switchboard~bot_name
loadvar $bot~user_command_line
loadvar $player~unlimitedgame
gosub :loadvars~loadvars
gosub :help~initialize

setvar $help~help[1] $help~tab&"FURB - Buys and delivers a Ship to a Corpy to attack  "
setvar $help~help[2] $help~tab&"- furb [ship number] {swap} {bwarp} {extra holds} {ship letter} {topp}"
setvar $help~help[3] $help~tab&"- [ship number]   = ship number that needs the furb"
setvar $help~help[4] $help~tab&"- [extra holds]   = extra holds to buy      - default is 33"
setvar $help~help[5] $help~tab&"- [ship letter]   = ship letter to purchase - default is H"
setvar $help~help[6] $help~tab&"- [swap]          = swap furb (only use with twarp ships)"
setvar $help~help[7] $help~tab&"- [bwarp]         = bwarp from furb planet"
setvar $help~help[8] $help~tab&"- [planet:#]      = planet # of furb planet"
setvar $help~help[9] $help~tab&"- [topp]          = attempts to get ore from top planet in sector if port low"
setvar $help~help[10] $help~tab&"                "
setvar $help~help[11] $help~tab&" CK Furb Mode (Mimicks CK Furb)"
setvar $help~help[12] $help~tab&"- furb ck {[norm hold] [fake hold] [norm letter] [fake letter]}"
setvar $help~help[13] $help~tab&"- [normal holds]  = extra holds to buy - Normal    - default is 33"
setvar $help~help[14] $help~tab&"- [fake holds]    = extra holds to buy - Fake      - default is 97"
setvar $help~help[15] $help~tab&"- [normal letter] = ship letter to buy - Normal    - default is H"
setvar $help~help[16] $help~tab&"- [fake letter]   = ship letter to buy - Fake      - default is O"
gosub :help~helpfile

getwordpos $bot~user_command_line $pos "planet:"
setvar $planet~planet_number 0
if ($pos > 0)
	cuttext $bot~user_command_line $line $pos 9999
	getword $line $planet~planet_line 1
	replacetext $planet~planet_line ":" " "
	getword $planet~planet_line $planet~planet_number 2
	replacetext $bot~user_command_line "planet:"&$planet~planet_number " "
	isnumber $is_a_number $planet~planet_number
	if ($is_a_number <> true)
		setvar $planet~planet_number 0
	end
end

getwordpos $bot~user_command_line $pos "blow:"
setvar $blowbot ""
setvar $doblow 0
if ($pos > 0)
	cuttext $bot~user_command_line $line $pos 9999
	getword $line $blowline 1
	replacetext $blowline ":" " "
	getword $blowline $blowbot 2
	replacetext $bot~user_command_line "blow:"&$blowbot " "
	setvar $doblow 1
end

getwordpos $bot~user_command_line $pos "swap"
if ($pos > 0)
	setvar $planet~citadel_furb true
	if ($planet~planet_number = "0")
		setvar $switchboard~message "Planet must be defined for swap furbing.*"
		gosub :switchboard~switchboard
		halt
	end
end

setvar $nodecash false
getwordpos $bot~user_command_line $pos "nodecash"
if ($pos > 0)
	setvar $nodecash true
end

setvar $topplanet false
getwordpos $bot~user_command_line $pos "topp"
if ($pos > 0)
	striptext $bot~user_command_line "topp"
	setvar $topplanet true
end

getwordpos $bot~user_command_line $pos "bwarp"
if ($pos > 0)

	setvar $bwarp true
end

getword $bot~user_command_line $bot~parm1 1 0
getword $bot~user_command_line $bot~parm2 2 0
getword $bot~user_command_line $bot~parm3 3 0
getword $bot~user_command_line $bot~parm4 4 0
getword $bot~user_command_line $bot~parm5 5 0

gosub :player~quikstats

setvar $start_cash $player~credits
setvar $startinglocation $player~current_prompt

if ($startinglocation <> "Command") or ($player~current_sector <> stardock)
	setvar $switchboard~message "Furb must be run from Command Prompt at StarDock.*"
	gosub :switchboard~switchboard
	halt
end

if ($player~twarp_type <> 2)
	setvar $switchboard~message "Furbing Ship Must Have Twarp Type-2*"
	gosub :switchboard~switchboard
	halt
end

#if ($PLAYER~ALIGNMENT < 1000)
#	send "'{" $switchboard~bot_name "} - Must Have a Commission*"
#	halt
#end

if ($player~unlimitedgame = false) and ($player~turns < 30)
	setvar $switchboard~message "Must Have At Least 30 Turns*"
	gosub :switchboard~switchboard
	halt
end

if ($player~credits < 100000)
	setvar $switchboard~message "Must Have At Least 100,000 Cred On Hand*"
	gosub :switchboard~switchboard
	halt
end

setvar $waitsecs   10
setvar $waitms ($waitsecs * 1000)
setvar $towship $player~ship_number

send " C R " & stardock & "*"
settextlinetrigger itsalive 		:itsalive 		"Items     Status  Trading % of max OnBoard"
settextlinetrigger nosoupforme 		:nosoupforme 	"I have no information about a port in that sector"
pause

:nosoupforme
killalltriggers
send " Q  '{" $switchboard~bot_name "} " & $taglineb & " - StarDock appears to have been Blown Up!**"
waitfor "Message sent on sub-space channel"
halt

:itsalive
killalltriggers
send " U Y V 0* Y Y Q "
waitfor "Avoided sectors Cleared."
waitfor "Command ["

return

:commasize
if ($cashamount < 1000)
	#do nothing
elseif ($cashamount < 1000000)
	getlength $cashamount $len
	setvar $len ($len - 3)
	cuttext $cashamount $tmp 1 $len
	cuttext $cashamount $tmp1 ($len + 1) 999
	setvar $tmp $tmp & "," & $tmp1
	setvar $cashamount $tmp
elseif ($cashamount <= 999999999)
	getlength $cashamount $len
	setvar $len ($len - 6)
	cuttext $cashamount $tmp 1 $len
	setvar $tmp $tmp & ","
	cuttext $cashamount $tmp1 ($len + 1) 3
	setvar $tmp $tmp & $tmp1 & ","
	cuttext $cashamount $tmp1 ($len + 4) 999
	setvar $tmp $tmp & $tmp1
	setvar $cashamount $tmp
end
return

:debugffs
echo "*###################"
echo "* # $bot~parm1 " $bot~parm1
echo "* # $bot~parm2 " $bot~parm2
echo "* # $bot~parm3 " $bot~parm3
echo "* # $bot~parm4 " $bot~parm4
echo "* # $bot~parm5 " $bot~parm5

echo "***##### FURB DEBUG $FURB_nHOLDS"
echo "*### $FURB_nHOLDS " $planet~citadel_furb
echo "*### $FURB_nLETTER " $furb_nletter
echo "*### $FURB_fHOLDS " $furb_fholds
echo "*### $FURB_fLETTER " $furb_fletter
echo "*### $CK_MODE " $ck_mode
echo "*### $planet~CITADEL_furb " $planet~citadel_furb

return

#INCLUDES:
include "source\include\planet"
include "source\include\move"
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
