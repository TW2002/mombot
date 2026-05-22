gosub :loadvars~loadvars

setvar $switchboard~bot_name $bot~bot_name
setvar $switchboard~self_command $self_command
gosub  :player~currentprompt
setvar $startinglocation $player~current_prompt

if ($startinglocation = "Citadel")

	setvar $bot~validprompts "Citadel"
	setvar $bot~startinglocation $startinglocation
	gosub :player~checkstartingprompt

	loadvar $psimac_corp_limpet_drop_amt
	if ($psimac_corp_limpet_drop_amt < 1)
		setvar $psimac_corp_limpet_drop_amt 3
		savevar $psimac_corp_limpet_drop_amt
	end
	loadvar $psimac_corp_armid_drop_amt
	if ($psimac_corp_armid_drop_amt < 1)
		setvar $psimac_corp_armid_drop_amt 1
		savevar $psimac_corp_armid_drop_amt
	end
	loadvar $psimac_corp_ftr_drop_amt
	if ($psimac_corp_ftr_drop_amt < 1)
		setvar $psimac_corp_ftr_drop_amt 1
		savevar $psimac_corp_ftr_drop_amt
	end
	settextlinetrigger getp :getp "Planet #"
	send "q*c "
	pause

	:getp
	getword currentline $planet~planet 2
	striptext $planet~planet "#"
	waiton "Citadel command (?="

	:planetmacmenu
	:print_the__planet_menu
	:planet_menu_without_clear
	echo "**"
	echo ansi_15 "                       -=( " ansi_14 "Psi Planet Macros" ansi_15 " )=-  *"
	echo ansi_5  " -----------------------------------------------------------------------------*"
	echo ansi_9 #27&"[35m<"&#27&"[32m1"&#27&"[35m> " & ansi_14 &"Lay 1 personal limpet" & ansi_9 & ", land         " & ansi_11 &#27&"[35m<"&#27&"[32m5"&#27&"[35m> " & ansi_14 & "Holoscan" & ansi_9 & ", land*"
	echo #27&"[35m<"&#27&"[32m2"&#27&"[35m> " & ansi_14 & "Lay " & $psimac_corp_limpet_drop_amt & " corporate " & ansi_11 & #27&"[35m<"&#27&"[32mL"&#27&"[35m>" & ansi_14 & "impet(s)" & ansi_9 & ", land   " & ansi_11 #27&"[35m<"&#27&"[32m6"&#27&"[35m> " & ansi_14 & "Lift attack*"
	echo #27&"[35m<"&#27&"[32m3"&#27&"[35m> " & ansi_14 & "Lay " & $psimac_corp_armid_drop_amt & " corporate " & ansi_11 & #27&"[35m<"&#27&"[32mA"&#27&"[35m>" & ansi_14 & "rmid(s)" & ansi_9 & ", land    " & ansi_11 #27&"[35m<"&#27&"[32m7"&#27&"[35m> " & ansi_14 & "Drop " & $psimac_corp_ftr_drop_amt & " corporate " & ansi_11 & #27&"[35m<"&#27&"[32mF"&#27&"[35m>" & ansi_14 & "ighter(s)" & ansi_9 & "*"
	echo #27&"[35m<"&#27&"[32m4"&#27&"[35m> " & ansi_14 & "Density scan" & ansi_9 & ", land             " & ansi_11 & "     " & #27&"[35m<"&#27&"[32m8"&#27&"[35m> " & ansi_14 & "Launch a mine disrupter" & ansi_9 & ", land*"
	echo         "*"
	echo #27&"[35m<"&#27&"[32mB"&#27&"[35m> " & ansi_14 & "Get Xport List" & ansi_9 & ", land                " ansi_11 #27&"[35m<"&#27&"[32mE"&#27&"[35m> " & ansi_14 & "Toggle IG" & ansi_9 & ", land " ansi_11 "*"
	echo #27&"[35m<"&#27&"[32mC"&#27&"[35m> " & ansi_14 & "Xport into ship" & ansi_9 & ", land               " ansi_11 #27&"[35m<"&#27&"[32mG"&#27&"[35m> " & ansi_14 & "Swap Planets*"
	echo #27&"[35m<"&#27&"[32mD"&#27&"[35m> " & ansi_14 & "Get sector planet list" & ansi_9 & ", land " ansi_11 "*"
	echo ansi_5  " -----------------------------------------------------------------------------**"

	:getplanetmacroinput
	echo ansi_10 "Your choice? "
	getconsoleinput $chosen_option singlekey
	uppercase $chosen_option
	killalltriggers

	:process_command2
	if ($chosen_option = "1")
		goto :perslimp
	elseif ($chosen_option = "2")
		goto :corplimp
	elseif ($chosen_option = "3")
		goto :corparm
	elseif ($chosen_option = "4")
		gosub :dscan2
		halt
	elseif ($chosen_option = "5")
		gosub :hscan
		halt
	elseif ($chosen_option = "6")
		goto :lifta
	elseif ($chosen_option = "7")
		goto :dropfig
	elseif ($chosen_option = "8")
		gosub :player~quikstats
		if ($player~mine_disruptors > 0)
			getinput $test "Sector to disrupt: "
			isnumber $numtest $test
			if ($numtest < 1)
				echo ansi_12 "**Bad sector number!*"
				goto :planetmacmenu
			end
			if ($test > sectors) or ($test <= 10)
				echo ansi_12 "**Bad sector number!*"
				goto :planetmacmenu
			end
			send "q q c  w  y" & $test & "*  *  *  q  l " $planet~planet "* c s*  "
			waiton "Computer command [TL="
			waiton "Citadel command (?=help)"
			halt
		else
			setvar $switchboard~message "Out of mine disruptors!*"
			gosub :switchboard~switchboard
			halt
		end
	elseif ($chosen_option = "B")
		send "q q  x* *    l j"&#8&$planet~planet&"* c @"
		waiton "Average Interval Lag:"
		halt
	elseif ($chosen_option = "C")
		# Get and check input
		getinput $shipnum "Ship number to xport to: "
		isnumber $numtest $shipnum
		if ($numtest < 1)
			echo ansi_12 "*Invalid ship number!*"
			halt
		end
		if ($shipnum < 1) or ($shipnum > 65000)
			echo ansi_12 "*Invalid ship number!*"
			halt
		end
		setvar $msg ""
		killalltriggers
		settextlinetrigger tdet_trg1 :txport_notavail2 "That is not an available ship."
		settextlinetrigger tdet_trg2 :txport_badrange2 "only has a transport range of"
		settextlinetrigger tdet_trg3 :txport_security2 "SECURITY BREACH! Invalid Password, unable to link transporters."
		settextlinetrigger tdet_trg4 :txport_noaccess2 "Access denied!"
		settextlinetrigger tdet_trg5 :txport_xprtgood2 "Security code accepted, engaging transporter control."
		settexttrigger tdet_trg6 :txport_go_ahead2 "Average Interval Lag:"
		send "q q  x    " & $shipnum & "    *    *    *    l j"&#8&$planet~planet&"*  @"
		pause
		goto :print_the__planet_menu

		:txport_notavail2
		setvar $msg ansi_12 & "**That ship is not available.*"
		pause

		:txport_badrange2
		setvar $msg ansi_12 & "**That ship is too far away.*"
		pause

		:txport_security2
		setvar $msg ansi_12 & "**That ship is passworded.*"
		pause

		:txport_noaccess2
		setvar $msg ansi_12 & "**Cannot access that ship.*"
		pause

		:txport_xprtgood2
		setvar $msg ansi_10 & "**Xport good!*"
		pause

		:txport_go_ahead2
		gosub :player~quikstats
		if ($player~current_prompt = "Planet")
			send "c "
		end
		killalltriggers
		echo $msg
		halt
	elseif ($chosen_option = "D")
		send "q q  lj"&#8&$planet~planet&"* c @"
		waiton "Average Interval Lag:"
		halt
	elseif ($chosen_option = "E")
		send "q q b z y  l j"&#8&$planet~planet&"* c @"
		waiton "Average Interval Lag:"
		halt
	elseif ($chosen_option = "G")
		getinput $test "Planet to Swap to:: "
		isnumber $numtest $test
		if ($numtest < 1)
			echo ansi_12 "**Not a Planet Number!*"
			goto :planetmacmenu
		else
			setvar $psimac_planet_swap "q q l "&$test&"*"&$planet~planet&"* c"
			send $psimac_planet_swap
		end
		halt
	elseif ($chosen_option = "F")
		getinput $test "Fighters to deploy: "
		isnumber $numtest $test
		if ($numtest < 1)
			echo ansi_12 "**Bad fighter count!*"
		elseif ($test <= 0)
			setvar $psimac_corp_ftr_drop_amt 1
			savevar $psimac_corp_ftr_drop_amt
		else
			setvar $psimac_corp_ftr_drop_amt $test
			savevar $psimac_corp_ftr_drop_amt
		end
		goto :print_the__planet_menu
	elseif ($chosen_option = "L")
		getinput $test "Limpets to deploy: "
		isnumber $numtest $test
		if ($numtest < 1)
			echo ansi_12 "**Bad limpet count!*"
		elseif ($test > 250)
			setvar $psimac_corp_limpet_drop_amt 250
			savevar $psimac_corp_limpet_drop_amt
		elseif ($test <= 0)
			setvar $psimac_corp_limpet_drop_amt 1
			savevar $psimac_corp_limpet_drop_amt
		else
			setvar $psimac_corp_limpet_drop_amt $test
			savevar $psimac_corp_limpet_drop_amt
		end
		goto :print_the__planet_menu
	elseif ($chosen_option = "A")
		getinput $test "Armids to deploy: "
		isnumber $numtest $test
		if ($numtest < 1)
			echo ansi_12 "**Bad armid count!*"
		elseif ($test > 250)
			setvar $psimac_corp_armid_drop_amt 250
			savevar $psimac_corp_armid_drop_amt
		elseif ($test <= 0)
			setvar $psimac_corp_armid_drop_amt 1
			savevar $psimac_corp_armid_drop_amt
		else
			setvar $psimac_corp_armid_drop_amt $test
			savevar $psimac_corp_armid_drop_amt
		end
		goto :print_the__planet_menu
	else
		halt
	end

	:perslimp
	gosub :player~quikstats
	if ($player~limpets > 0)
		send "q q z n h21  *  p z n n * l " $planet~planet "* c s* "
		setvar $deptype "limpets"
		settextlinetrigger toomanypl :toomany "!  You are limited to "
		settextlinetrigger plclear :plclear "Done. You have "
		settextlinetrigger enemypl :noperdown "These mines are not under your control."
		pause
	else
		setvar $switchboard~message "Out of limpets!*"
		gosub :switchboard~switchboard
		halt
	end

	:plclear
	killalltriggers
	waiton "Citadel command (?=help)"
	send "s* "
	settextlinetrigger perdown :perdown "(Type 2 Limpet) (yours)"
	settextlinetrigger noperdown :noperdown "Citadel treasury contains"
	pause

	:perdown
	killalltriggers
	setvar $switchboard~message "Personal Limpet Deployed!*"
	gosub :switchboard~switchboard
	halt

	:noperdown
	killalltriggers
	setvar $switchboard~message "Sector already has enemy limpets present!*"
	gosub :switchboard~switchboard
	halt

	:corplimp
	gosub :player~quikstats

	if ($player~limpets > 0)
		send "q q z n h2z" & $psimac_corp_limpet_drop_amt & "* z c *  l " $planet~planet "* c s* "
		if ($psimac_corp_limpet_drop_amt > 1)
			setvar $deptype "Limpets"
		else
			setvar $deptype "Limpet"
		end
		settextlinetrigger toomanycl :toomany "!  You are limited to "
		settextlinetrigger clclear :clclear "Done. You have "
		settextlinetrigger enemycl :nocldown "These mines are not under your control."
		settextlinetrigger notenoughcl :notenough "You don't have that many mines available."
		pause
	else
		setvar $switchboard~message "Out of limpets!*"
		gosub :switchboard~switchboard
		halt
	end

	:clclear
	killalltriggers
	waiton "Citadel command (?=help)"
	send "s* "
	settextlinetrigger cldown :cldown "(Type 2 Limpet) (belong to your Corp)"
	settextlinetrigger nocldown :nocldown "Citadel treasury contains"
	pause

	:cldown
	killalltriggers
	setvar $switchboard~message ""&$psimac_corp_limpet_drop_amt&" Corporate "&$deptype&" Deployed!*"
	gosub :switchboard~switchboard
	halt

	:nocldown
	killalltriggers
	setvar $switchboard~message "Sector already has enemy limpets present!*"
	gosub :switchboard~switchboard
	halt
	#lays a corp armid
	:corparm
	gosub :player~quikstats
	if ($player~armids > 0)
		if ($psimac_corp_armid_drop_amt > 1)
			setvar $deptype "Armids"
		else
			setvar $deptype "Armid"
		end
		send "q q z n h1z" & $psimac_corp_armid_drop_amt & " * z c *  l " $planet~planet "* c s* "
		settextlinetrigger toomanya :toomany "!  You are limited to "
		settextlinetrigger aclear :aclear "Done. You have "
		settextlinetrigger enemya :noadown "These mines are not under your control."
		settextlinetrigger notenoughca :notenough "You don't have that many mines available."
		pause
	else
		setvar $switchboard~message "Out of armids!*"
		gosub :switchboard~switchboard
		halt
	end

	:aclear
	killalltriggers
	waiton "Citadel command (?=help)"
	send "s* "
	settextlinetrigger adown :adown "(Type 1 Armid) (belong to your Corp)"
	settextlinetrigger noadown :noadown "Citadel treasury contains"
	pause

	:adown
	killalltriggers
	setvar $switchboard~message $psimac_corp_armid_drop_amt&" Corporate"&$deptype&" Deployed!*"
	gosub :switchboard~switchboard
	halt

	:noadown
	killalltriggers
	setvar $switchboard~message "Sector already has enemy armids present!*"
	gosub :switchboard~switchboard
	halt

	:dscan2
	send "q q z n sdzn l " $planet~planet "* c  "
	waiton "<Enter Citadel>"
	waiton "Citadel command (?=help)"
	gosub :map~displayadjacentgridansi
	return

	:hscan
	send "q q z n s hzn* l " $planet~planet "*  c  "
	waiton "<Enter Citadel>"
	waiton "Citadel command (?=help)"
	gosub :map~displayadjacentgridansi
	return

	:lifta
	loadvar $ship~ship_max_attack
	send "q q z n a y y " $ship~ship_max_attack "* * z n q z n  l " $planet~planet "*  m  *** c s* @"
	waiton "Average Interval Lag:"
	goto :getplanetmacroinput

	:dropfig
	gosub :player~quikstats
	if ($player~fighters > 0)
		send " q q f z" & $psimac_corp_ftr_drop_amt & "* z c d *  l " $planet~planet "* c s* "
		if ($psimac_corp_ftr_drop_amt > 1)
			setvar $deptype "Fighters"
		else
			setvar $deptype "Fighter"
		end
		settextlinetrigger toomanyfig :toomany "Too many fighters in your fleet!"
		settextlinetrigger figclear :figclear " fighter(s) in close support."
		settextlinetrigger enemyfig :nofigdown "These fighters are not under your control."
		pause
	else
		setvar $switchboard~message "Out of fighters!*"
		gosub :switchboard~switchboard
		halt
	end

	:figclear
	killalltriggers
	waiton "Citadel command (?=help)"
	send "s* "
	settextlinetrigger figdown :figdown "(belong to your Corp) [Defensive]"
	settextlinetrigger nofigdown :nofigdown "Citadel treasury contains"
	pause

	:figdown
	killalltriggers
	setvar $switchboard~message ""&$psimac_corp_ftr_drop_amt&" Corporate "&$deptype&" Deployed!*"
	setvar $player~target $player~current_sector
	gosub :player~addfigtodata
	gosub :switchboard~switchboard
	halt

	:nofigdown
	killalltriggers
	setvar $switchboard~message "Sector already has enemy fighters present!*"
	gosub :switchboard~switchboard
	halt

	:toomany
	killalltriggers
	waiton "<Scan Sector>"
	waiton "Citadel command (?=help)"
	clientmessage "Ship cannot carry that many " & $deptype & "!"
	clientmessage "No " & $deptype & " were deployed!"
	halt

	:notenough
	killalltriggers
	waiton "<Scan Sector>"
	waiton "Citadel command (?=help)"
	clientmessage "Ship doesn't have that many " & $deptype & "!"
	clientmessage "No " & $deptype & " were deployed!"
	halt

	:donepsimacs
	echo #27 "[30D                           " #27 "[30D"
	halt
elseif (($startinglocation = "Do") or ($startinglocation = "How"))

	:print_the__terra_menu
	gosub :player~quikstats
	echo "[2J"

	:terra_menu_without_clear
	echo "*"
	echo ansi_15 "               -=( " ansi_12 "M()M Terra Survival Toolkit" ansi_15 " )=-  "&ansi_7&"*"
	echo ansi_5  " -----------------------------------------------------------------------------"&ansi_7&"*"
	echo ansi_9&#27&"[35m<"&#27&"[32m1"&#27&"[35m> " & ansi_14 & " display Terra sector" & ansi_9 & ", land       " #27&"[35m<"&#27&"[32m5"&#27&"[35m> " & ansi_14 & " check twarp lock" & ansi_9 & ", land*"
	echo #27&"[35m<"&#27&"[32m2"&#27&"[35m> " & ansi_14 & " holoscan" & ansi_9 & ", land                   " #27&"[35m<"&#27&"[32m6"&#27&"[35m> " & ansi_14 & " lift, twarp out*"
	echo #27&"[35m<"&#27&"[32m3"&#27&"[35m> " & ansi_14 & " density scan" & ansi_9 & ", land               " #27&"[35m<"&#27&"[32m7"&#27&"[35m> " & ansi_14 & " lift, lock tow" & ansi_9 & ", twarp out*"
	echo #27&"[35m<"&#27&"[32m4"&#27&"[35m> " & ansi_14 & " get xport list" & ansi_9 & ", land             " #27&"[35m<"&#27&"[32m8"&#27&"[35m> " & ansi_14 & " xport" & ansi_9 & ", land*"
	echo         "*"
	echo #27&"[35m<"&#27&"[32mA"&#27&"[35m> " & ansi_14 & " set avoid" & ansi_9 & ",land                   " #27&"[35m<"&#27&"[32mE"&#27&"[35m> " & ansi_14 & " lift, cloak out*"
	echo #27&"[35m<"&#27&"[32mB"&#27&"[35m> " & ansi_14 & " clear avoided sector" & ansi_9 & ", land       " #27&"[35m<"&#27&"[32mF"&#27&"[35m> " & ansi_14 & " C U Y (enable t-warp)" & ansi_9 & " ,land*"
	echo #27&"[35m<"&#27&"[32mC"&#27&"[35m> " & ansi_14 & " plot course" & ansi_9 & ", land                " #27&"[35m<"&#27&"[32mG"&#27&"[35m> " & ansi_14 & " toggle cn9" & ansi_9 & ", land*"
	echo #27&"[35m<"&#27&"[32mD"&#27&"[35m> " & ansi_14 & " get corpie locations" & ansi_9 & ", land       *"
	echo ansi_5  " -----------------------------------------------------------------------------**"
	echo ansi_10 "Your choice? "
	getconsoleinput $chosen_option singlekey
	uppercase $chosen_option
	killalltriggers

	:process_command
	if ($chosen_option = "1")
		send "* * dl 1*  "
		gosub :player~quikstats
	elseif ($chosen_option = "2")
		send "* * shl 1*   "
		gosub :player~quikstats
	elseif ($chosen_option = "3")
		send "* * sdl 1*  "
		gosub :player~quikstats
	elseif ($chosen_option = "4")
		send "* *  x**    l 1*  "
		gosub :player~quikstats
	elseif ($chosen_option = "5")
		if ($player~twarp = "No")
			echo ansi_12 "**Cannot T-warp. No Twarp drive!*"
			halt
		elseif ($player~ore_holds < 3)
			echo ansi_12 "**Cannot T-warp. No ore!*"
			halt
		end
		getinput $sector "T-Warp to: "
		isnumber $numtest $sector
		if ($numtest < 1)
			echo ansi_12 "**Invalid sector number!*"
			halt
		end
		if ($sector < 1) or ($sector > sectors)
			echo ansi_12 "**Invalid sector number!*"
			halt
		end
		setvar $msg ""
		killalltriggers
		settextlinetrigger tdet_trg1 :tdet_blnd "Do you want to make this jump blind?"
		settextlinetrigger tdet_trg2 :tdet_fuel "You do not have enough Fuel Ore to make the jump."
		settextlinetrigger tdet_trg3 :tdet_good "Locating beam pinpointed, TransWarp Locked."
		settexttrigger tdet_trg4 :tdet_dock "Do you wish to (L)eave or (T)ake Colonists?"
		send "* *   m  " & $sector & "  *  y*  *  *  l 1*   "
		pause
		goto :print_the_menu

		:tdet_blnd
		setvar $msg ansi_12 & "**No fighter lock exists. Blind warp hazard!!*"
		pause

		:tdet_fuel
		setvar $msg ansi_12 & "**Not enough ore for that jump!*"
		pause

		:tdet_good
		setvar $msg ansi_10 & "**Fighter lock found. Looks good!*"
		pause

		:tdet_dock
		gosub :player~quikstats
		killalltriggers
		echo $msg
		halt
	elseif ($chosen_option = "6")
		if ($player~twarp = "No")
			echo ansi_12 "**Cannot T-warp. No Twarp drive!*"
			halt
		elseif ($player~ore_holds < 3)
			echo ansi_12 "**Cannot T-warp. No ore!*"
			halt
		end
		getinput $sector "T-Warp to: "
		isnumber $numtest $sector
		if ($numtest < 1)
			echo ansi_12 "**Invalid sector number!*"
			halt
		end
		if ($sector < 1) or ($sector > sectors)
			echo ansi_12 "**Invalid sector number!*"
			halt
		end
		send "* *  m  " & $sector & "  *  y  y  *  *"
		gosub :player~quikstats
		if ($player~current_sector = 1)
			send "l 1*  "
		end
		halt
	elseif ($chosen_option = "7")
		if ($player~twarp = "No")
			echo ansi_12 "*Cannot T-warp. No Twarp drive!*"
			halt
		elseif ($player~ore_holds < 3)
			echo ansi_12 "*Cannot T-warp. No ore!*"
			halt
		end
		getinput $shipnum "Ship number to tow: "
		isnumber $numtest $shipnum
		if ($numtest < 1)
			echo ansi_12 "*Invalid ship number!*"
			halt
		end
		if ($shipnum < 1) or ($shipnum > 65000)
			echo ansi_12 "*Invalid ship number!*"
			halt
		end
		getinput $sector "T-Warp to: "
		isnumber $numtest $sector
		if ($numtest < 1)
			echo ansi_12 "*Invalid sector number!*"
			halt
		end
		if ($sector < 1) or ($sector > sectors)
			echo ansi_12 "*Invalid sector number!*"
			halt
		end
		send "* * w  *  *  w  *" & $shipnum & "*  *  m  " & $sector & "  *  y  y  *  *"
		gosub :player~quikstats
		if ($player~current_sector = 1)
			send "l 1*  "
		end
		halt
	elseif ($chosen_option = "8")
		getinput $shipnum "Ship number to xport to: "
		isnumber $numtest $shipnum
		if ($numtest < 1)
			echo ansi_12 "*Invalid ship number!*"
			halt
		end
		if ($shipnum < 1) or ($shipnum > 65000)
			echo ansi_12 "*Invalid ship number!*"
			halt
		end
		setvar $msg ""
		killalltriggers
		settextlinetrigger tdet_trg1 :txport_notavail "That is not an available ship."
		settextlinetrigger tdet_trg2 :txport_badrange "only has a transport range of"
		settextlinetrigger tdet_trg3 :txport_security "SECURITY BREACH! Invalid Password, unable to link transporters."
		settextlinetrigger tdet_trg4 :txport_noaccess "Access denied!"
		settextlinetrigger tdet_trg5 :txport_xprtgood "Security code accepted, engaging transporter control."
		settexttrigger tdet_trg6 :txport_go_ahead "Do you wish to (L)eave or (T)ake Colonists?"
		settexttrigger tdet_trg7 :txport_go_ahead "That planet is not in this sector."
		settexttrigger tdet_trg8 :txport_go_ahead "Are you sure you want to jettison all cargo? (Y/N)"
		send "* *  x    z" & $shipnum & "*  *    l j"&#8&" 1*  "
		pause
		goto :print_the_menu

		:txport_notavail
		setvar $msg ansi_12 & "**That ship is not available.*"
		pause

		:txport_badrange
		setvar $msg ansi_12 & "**That ship is too far away.*"
		pause

		:txport_security
		setvar $msg ansi_12 & "**That ship is passworded.*"
		pause

		:txport_noaccess
		setvar $msg ansi_12 & "**Cannot access that ship.*"
		pause

		:txport_xprtgood
		setvar $msg ansi_10 & "**Xport good!*"
		pause

		:txport_go_ahead
		killalltriggers
		echo $msg
		halt
	elseif ($chosen_option = "A")
		getinput $sector "To sector: "
		isnumber $numtest $sector
		if ($numtest < 1)
			echo ansi_12 "**Invalid sector number!*"
			halt
		end
		if ($sector < 1) or ($sector > sectors)
			echo ansi_12 "**Invalid sector number!*"
			halt
		end
		send "* *  c  v  " & $sector & "*  q  l 1*  "
		gosub :player~quikstats
	elseif ($chosen_option = "B")
		getinput $sector "To sector: "
		isnumber $numtest $sector
		if ($numtest < 1)
			echo ansi_12 "**Invalid sector number!*"
			halt
		end
		if ($sector < 1) or ($sector > sectors)
			echo ansi_12 "**Invalid sector number!*"
			halt
		end
		send "* *  c  v  0  *  y  n  " & $sector & "*  q  l 1*  "
		gosub :player~quikstats
	elseif ($chosen_option = "C")
		getinput $sector "To sector: "
		isnumber $numtest $sector
		if ($numtest < 1)
			echo ansi_12 "**Invalid sector number!*"
			halt
		end
		if ($sector < 1) or ($sector > sectors)
			echo ansi_12 "**Invalid sector number!*"
			halt
		end
		send "^f*" & $sector & "*q"
		waiton "ENDINTERROG"
	elseif ($chosen_option = "E")
		if ($player~cloaks > 0)
			echo ansi_11 "*Are you sure you want to cloak out? (y/N)*"
			getconsoleinput $choice singlekey
			uppercase $choice
			if ($choice = "Y")
				send "* * q  y  y"
			else
				echo ansi_12 & "**Aborting cloak-out.*"
				halt
			end
			halt
		else
			echo ansi_12 & "**You have no cloaking devices!*"
		end
	elseif ($chosen_option = "D")
		send "* *  t  aq  l 1*  "
		gosub :player~quikstats
	elseif ($chosen_option = "G")
		send "* *  c  n  9q  q  l 1*  "
		gosub :player~quikstats
	elseif ($chosen_option = "F")
		send "* * c  u  y  q  l 1*  "
		gosub :player~quikstats
	else
		halt
	end
	halt

	:doneterrakit
	echo #27 "[30D                           " #27 "[30D"
	halt

else
	setvar $bot~validprompts "<StarDock> <Hardware <Libram <FedPolice> <Shipyards> <Tavern> Do How Citadel"
	setvar $bot~startinglocation $startinglocation
	gosub :player~checkstartingprompt

	:print_the_menu
	gosub :player~quikstats
	echo "[2J"

	:menu_without_clear
	echo "*"
	echo ansi_15 "               -=( " ansi_12 "Dnyarri's Dock Survival Toolkit" ansi_15 " )=-  *"
	echo ansi_5  " -----------------------------------------------------------------------------*"
	echo ansi_9 #27&"[35m<"&#27&"[32m1"&#27&"[35m> " & ansi_14 & " display stardock sector" & ansi_9 & ", re-dock " #27&"[35m<"&#27&"[32m6"&#27&"[35m> " & ansi_14 & " check twarp lock" & ansi_9 & ", re-dock*"
	echo #27&"[35m<"&#27&"[32m2"&#27&"[35m> " & ansi_14 & " holoscan" & ansi_9 & ", re-dock                " #27&"[35m<"&#27&"[32m7"&#27&"[35m> " & ansi_14 & " twarp out*"
	echo #27&"[35m<"&#27&"[32m3"&#27&"[35m> " & ansi_14 & " density scan" & ansi_9 & ", re-dock            " #27&"[35m<"&#27&"[32m8"&#27&"[35m> " & ansi_14 & " lock tow" & ansi_9 & ", twarp out*"
	echo #27&"[35m<"&#27&"[32m4"&#27&"[35m> " & ansi_14 & " get xport list" & ansi_9 & ", re-dock          " #27&"[35m<"&#27&"[32m9"&#27&"[35m> " & ansi_14 & " xport" & ansi_9 & ", re-dock*"
	echo #27&"[35m<"&#27&"[32m5"&#27&"[35m> " & ansi_14 & " get planet list" & ansi_9 & ", re-dock         *"
	echo         "*"
	echo #27&"[35m<"&#27&"[32mA"&#27&"[35m> " & ansi_14 & " launch mine disruptor" & ansi_9 & ", re-dock   " #27&"[35m<"&#27&"[32mE"&#27&"[35m> " & ansi_14 & " make a planet" & ansi_9 & ", re-dock*"
	echo #27&"[35m<"&#27&"[32mB"&#27&"[35m> " & ansi_14 & " set avoid" & ansi_9 & ",re-dock                " #27&"[35m<"&#27&"[32mF"&#27&"[35m> " & ansi_14 & " land on planet and drop ore" & ansi_9 & ", re-dock*"
	echo #27&"[35m<"&#27&"[32mC"&#27&"[35m> " & ansi_14 & " clear avoided sector" & ansi_9 & ", re-dock    " #27&"[35m<"&#27&"[32mG"&#27&"[35m> " & ansi_14 & " land on planet and take all" & ansi_9 & ", re-dock*"
	echo #27&"[35m<"&#27&"[32mD"&#27&"[35m> " & ansi_14 & " plot course" & ansi_9 & ", re-dock             " #27&"[35m<"&#27&"[32mH"&#27&"[35m> " & ansi_14 & " land on and destroy planet" & ansi_9 & ", re-dock*"
	echo "*"
	echo #27&"[35m<"&#27&"[32mZ"&#27&"[35m> " & ansi_14 & " cloak out*"
	echo #27&"[35m<"&#27&"[32mL"&#27&"[35m> " & ansi_14 & " get corpie locations" & ansi_9 & ", re-dock*"
	echo #27&"[35m<"&#27&"[32mW"&#27&"[35m> " & ansi_14 & " C U Y (enable t-warp)" & ansi_9 & " ,re-dock*"
	echo #27&"[35m<"&#27&"[32mT"&#27&"[35m> " & ansi_14 & " toggle cn9" & ansi_9 & ", re-dock*"
	echo #27&"[35m<"&#27&"[32mO"&#27&"[35m> " & ansi_14 & " Ore Swapper X-port*"
	echo ansi_5  " -----------------------------------------------------------------------------**"
	echo ansi_10 "Your choice? "
	getconsoleinput $chosen_option singlekey
	uppercase $chosen_option
	killalltriggers

	:process_command
	if ($chosen_option = "1")
		send "qqq  z  n  dp  s  s "
		waiton "Landing on Federation StarDock."
		waiton "<Shipyards> Your option (?)"
	elseif ($chosen_option = "2")
		send "qqq  z  n  sh*  p  s  s "
		waiton "Landing on Federation StarDock."
		gosub :player~quikstats
		waiton "<Shipyards> Your option (?)"
	elseif ($chosen_option = "3")
		send "qqq  z  n  sdp  s  s "
		waiton "Landing on Federation StarDock."
		waiton "<Shipyards> Your option (?)"
	elseif ($chosen_option = "4")
		send "qqq  z  n  x**    p  s  s "
		waiton "Landing on Federation StarDock."
		waiton "<Shipyards> Your option (?)"
	elseif ($chosen_option = "5")
		send "qqq  z  n  l*  q  q  z  n  p  s  s "
		waiton "Landing on Federation StarDock."
		waiton "<Shipyards> Your option (?)"
	elseif ($chosen_option = "6")
		if ($player~twarp = "No")
			echo ansi_12 "**Cannot T-warp. No Twarp drive!*"
			halt
		elseif ($player~ore_holds < 3)
			echo ansi_12 "**Cannot T-warp. No ore!*"
			halt
		end
		getinput $sector "T-Warp to: "
		isnumber $numtest $sector
		if ($numtest < 1)
			echo ansi_12 "**Invalid sector number!*"
			halt
		end
		if ($sector < 1) or ($sector > sectors)
			echo ansi_12 "**Invalid sector number!*"
			halt
		end
		setvar $msg ""
		killalltriggers
		settextlinetrigger det_trg1 :det_blnd "Do you want to make this jump blind?"
		settextlinetrigger det_trg2 :det_fuel "You do not have enough Fuel Ore to make the jump."
		settextlinetrigger det_trg3 :det_good "Locating beam pinpointed, TransWarp Locked."
		settextlinetrigger det_trg4 :det_dock "Landing on Federation StarDock."
		send "qqq  z  n  m  " & $sector & "  *  yn  *  *  p  s  s "
		pause
		goto :print_the_menu

		:det_blnd
		setvar $msg ansi_12 & "**No fighter lock exists. Blind warp hazard!!*"
		pause

		:det_fuel
		setvar $msg ansi_12 & "**Not enough ore for that jump!*"
		pause

		:det_good
		setvar $msg ansi_10 & "**Fighter lock found. Looks good!*"
		pause

		:det_dock
		waiton "<Shipyards> Your option (?)"
		killalltriggers
		echo $msg
		halt
	elseif ($chosen_option = "7")
		if ($player~twarp = "No")
			echo ansi_12 "**Cannot T-warp. No Twarp drive!*"
			halt
		elseif ($player~ore_holds < 3)
			echo ansi_12 "**Cannot T-warp. No ore!*"
			halt
		end
		getinput $sector "T-Warp to: "
		isnumber $numtest $sector
		if ($numtest < 1)
			echo ansi_12 "**Invalid sector number!*"
			halt
		end
		if ($sector < 1) or ($sector > sectors)
			echo ansi_12 "**Invalid sector number!*"
			halt
		end
		send "qqq  z  n  m  " & $sector & "  *  y  y  *  *"
		halt
	elseif ($chosen_option = "8")
		if ($player~twarp = "No")
			echo ansi_12 "*Cannot T-warp. No Twarp drive!*"
			halt
		elseif ($player~ore_holds < 3)
			echo ansi_12 "*Cannot T-warp. No ore!*"
			halt
		end
		getinput $shipnum "Ship number to tow: "
		isnumber $numtest $shipnum
		if ($numtest < 1)
			echo ansi_12 "*Invalid ship number!*"
			halt
		end
		if ($shipnum < 1) or ($shipnum > 65000)
			echo ansi_12 "*Invalid ship number!*"
			halt
		end
		getinput $sector "T-Warp to: "
		isnumber $numtest $sector
		if ($numtest < 1)
			echo ansi_12 "*Invalid sector number!*"
			halt
		end
		if ($sector < 1) or ($sector > sectors)
			echo ansi_12 "*Invalid sector number!*"
			halt
		end
		send "qqq  z  n  w  n  *  w  n" & $shipnum & "*  *  m  " & $sector & "  *  y  y  *  *"
		halt
	elseif ($chosen_option = "9")
		getinput $shipnum "Ship number to xport to: "
		isnumber $numtest $shipnum
		if ($numtest < 1)
			echo ansi_12 "*Invalid ship number!*"
			halt
		end
		if ($shipnum < 1) or ($shipnum > 65000)
			echo ansi_12 "*Invalid ship number!*"
			halt
		end
		setvar $msg ""
		killalltriggers
		settextlinetrigger det_trg1 :xport_notavail "That is not an available ship."
		settextlinetrigger det_trg2 :xport_badrange "only has a transport range of"
		settextlinetrigger det_trg3 :xport_security "SECURITY BREACH! Invalid Password, unable to link transporters."
		settextlinetrigger det_trg4 :xport_noaccess "Access denied!"
		settextlinetrigger det_trg5 :xport_xprtgood "Security code accepted, engaging transporter control."
		settextlinetrigger det_trg6 :xport_go_ahead "Landing on Federation StarDock."
		send "qqq  z  n  x    " & $shipnum & "    *    *    *    p  s  s "
		pause
		goto :print_the_menu

		:xport_notavail
		setvar $msg ansi_12 & "**That ship is not available.*"
		pause

		:xport_badrange
		setvar $msg ansi_12 & "**That ship is too far away.*"
		pause

		:xport_security
		setvar $msg ansi_12 & "**That ship is passworded.*"
		pause

		:xport_noaccess
		setvar $msg ansi_12 & "**Cannot access that ship.*"
		pause

		:xport_xprtgood
		setvar $msg ansi_10 & "**Xport good!*"
		pause

		:xport_go_ahead
		gosub :player~quikstats
		waiton "<Shipyards> Your option (?)"
		killalltriggers
		echo $msg
		halt
	elseif ($chosen_option = "A")
		getinput $sector "To sector: "
		isnumber $numtest $sector
		if ($numtest < 1)
			echo ansi_12 "**Invalid sector number!*"
			halt
		end
		if ($sector < 1) or ($sector > sectors)
			echo ansi_12 "**Invalid sector number!*"
			halt
		end
		setvar $msg ""
		killalltriggers
		settextlinetrigger det_trg1 :dis_nadj "That is not an adjacent sector"
		settextlinetrigger det_trg2 :dis_ndis "You do not have any Mine Disruptors!"
		settextlinetrigger det_trg3 :dis_done "Disruptor launched into sector"
		settextlinetrigger det_trg4 :dis_okay "Landing on Federation StarDock."
		send "qqq  z  n  c  w  y  " & $sector & "  *  q  q  q  z  n  p  s  h "
		pause

		:dis_nadj
		setvar $msg ansi_10 & "**That sector isn't adjacent to StarDock.*"
		pause

		:dis_ndis
		setvar $msg ansi_10 & "**Out of disruptors.*"
		pause

		:dis_done
		setvar $msg ansi_10 & "**Disruptor launched!*"
		pause

		:dis_okay
		gosub :player~quikstats
		waiton "<Hardware Emporium> So what are you looking for (?)"
		killalltriggers
		echo $msg
		halt
	elseif ($chosen_option = "B")
		getinput $sector "To sector: "
		isnumber $numtest $sector
		if ($numtest < 1)
			echo ansi_12 "**Invalid sector number!*"
			halt
		end
		if ($sector < 1) or ($sector > sectors)
			echo ansi_12 "**Invalid sector number!*"
			halt
		end
		send "qqq  z  n  c  v  " & $sector & "*  q  p  s  s "
		waiton "Landing on Federation StarDock."
		waiton "<Shipyards> Your option (?)"
	elseif ($chosen_option = "C")
		getinput $sector "To sector: "
		isnumber $numtest $sector
		if ($numtest < 1)
			echo ansi_12 "**Invalid sector number!*"
			halt
		end
		if ($sector < 1) or ($sector > sectors)
			echo ansi_12 "**Invalid sector number!*"
			halt
		end
		send "qqq  z  n  c  v  0  *  y  n  " & $sector & "*  q  p  s  s "
		waiton "Landing on Federation StarDock."
		waiton "<Shipyards> Your option (?)"
		goto :print_the_menu
	elseif ($chosen_option = "D")
		getinput $sector "To sector: "
		isnumber $numtest $sector
		if ($numtest < 1)
			echo ansi_12 "**Invalid sector number!*"
			halt
		end
		if ($sector < 1) or ($sector > sectors)
			echo ansi_12 "**Invalid sector number!*"
			halt
		end
		send "^f*" & $sector & "*q"
		waiton "ENDINTERROG"
	elseif ($chosen_option = "E")
		if ($player~genesis > 0)
			send "qqq  z  n  u  y  *  .*  z  c  *  p  s  h "
			waiton "Landing on Federation StarDock."
			gosub :player~quikstats
			waiton "<Hardware Emporium> So what are you looking for (?)"
		else
			echo ansi_12 "**You don't have any Genesis Torps!*"
			halt
		end
	elseif ($chosen_option = "F")
		if ($player~ore_holds < 1)
			echo ansi_12 "**You have no ore to drop!*"
			halt
		end
		getinput $pnum "Planet number: "
		isnumber $numtest $pnum
		if ($numtest < 1)
			echo ansi_12 "**Invalid planet number!*"
			halt
		end
		if ($pnum < 1) or ($pnum > 33000)
			echo ansi_12 "**Invalid planet number!*"
			halt
		end
		setvar $msg ""
		killalltriggers
		settextlinetrigger det_trg1 :pland_trg_1 "Engage the Autopilot?"
		settextlinetrigger det_trg2 :pland_trg_2 "That planet is not in this sector."
		settextlinetrigger det_trg3 :pland_trg_3 "<Take all>"
		settextlinetrigger det_trg4 :pland_trg_4 "<Take/Leave Products>"
		settextlinetrigger det_trg5 :pland_trg_5 "Landing on Federation StarDock."
		send "qqq  z  n  l " & $pnum & "  *  *  z  n  z  n  *  z  q  t  n  z  l  1  *  q  q  z  n  p  s  h "
		pause
	elseif ($chosen_option = "G")
		getinput $pnum "Planet number: "
		isnumber $numtest $pnum
		if ($numtest < 1)
			echo ansi_12 "**Invalid planet number!*"
			halt
		end
		if ($pnum < 1) or ($pnum > 33000)
			echo ansi_12 "**Invalid planet number!*"
			halt
		end
		setvar $msg ""
		killalltriggers
		settextlinetrigger det_trg1 :pland_trg_1 "Engage the Autopilot?"
		settextlinetrigger det_trg2 :pland_trg_2 "That planet is not in this sector."
		settextlinetrigger det_trg3 :pland_trg_3 "<Take all>"
		settextlinetrigger det_trg4 :pland_trg_4 "<Take/Leave Products>"
		settextlinetrigger det_trg5 :pland_trg_5 "Landing on Federation StarDock."
		send "qqq  z  n  l " & $pnum & "  *  *  z  n  z  n  *  z  q  a  *  q  q  z  n  p  s  h "
		pause
	elseif ($chosen_option = "H")
		if ($player~atomic < 1)
			echo ansi_12 "**You don't have any Atomic Dets!*"
			halt
		end
		getinput $pnum "Planet number: "
		isnumber $numtest $pnum
		if ($numtest < 1)
			echo ansi_12 "**Invalid planet number!*"
			halt
		end
		if ($pnum < 1) or ($pnum > 33000)
			echo ansi_12 "**Invalid planet number!*"
			halt
		end
		setvar $msg ""
		killalltriggers
		settextlinetrigger det_trg1 :pland_trg_1 "Engage the Autopilot?"
		settextlinetrigger det_trg2 :pland_trg_2 "That planet is not in this sector."
		settextlinetrigger det_trg3 :pland_trg_3 "<Take all>"
		settextlinetrigger det_trg4 :pland_trg_4 "<Take/Leave Products>"
		settextlinetrigger det_trg5 :pland_trg_5 "Landing on Federation StarDock."
		settextlinetrigger det_trg6 :pland_trg_6 "<DANGER> Are you sure you want to do this?"
		send "qqq  z  n  l " & $pnum & "  *  *  z  n  z  n  *  z  d  y  p  s  h "
		pause
	elseif ($chosen_option = "Z")
		if ($player~cloaks > 0)
			echo ansi_11 "*Are you sure you want to cloak out? (y/N)*"
			getconsoleinput $choice singlekey
			uppercase $choice
			if ($choice = "Y")
				goto :cloak_on_out
			else
				echo ansi_12 & "**Aborting cloak-out.*"
				halt
			end

			:cloak_on_out
			send "qqq  y  y"
			halt
		else
			echo ansi_12 & "**You have no cloaking devices!*"
		end
	elseif ($chosen_option = "L")
		send "qqq  z  n  t  aq  p  s  s "
		waiton "Landing on Federation StarDock."
		waiton "<Shipyards> Your option (?)"
	elseif ($chosen_option = "T")
		send "qqq  z  n  c  n  9q  q  p  s  s "
		waiton "Landing on Federation StarDock."
		waiton "<Shipyards> Your option (?)"
	elseif ($chosen_option = "W")
		send "qqq  z  n  c  u  y  q  p  s  s "
		waiton "Landing on Federation StarDock."
		waiton "<Shipyards> Your option (?)"
	elseif ($chosen_option = "O")
		goto :swap_ore
	end
	halt
	# -------------------------------------------------------------------
	:swap_ore
	echo "**"
	echo ansi_11 "This automates the process of trading ore between ships.**"
	echo ansi_15 "It pops a planet, drops ore and re-docks.*"
	echo ansi_15 "After a brief pause it then lifts, xports, grabs the ore and re-docks.*"
	echo ansi_15 "The result... you're in your new ship, safe at dock w/ ore.*"
	echo ansi_15 "It tries to be as safe as possible but there's always some risk.*"
	echo "*"
	echo ansi_14 "Are you sure you want to start the Ore Swapper X-port? (y/N)*"
	getconsoleinput $choice singlekey
	uppercase $choice
	if ($choice = "Y")
		goto :init_ore_swap_vars
	else
		echo ansi_12 & "**Aborting Ore Swapper X-port.*"
		halt
	end

	:init_ore_swap_vars
	setvar $funky_counter 0
	getinput $shipnum "Ship number to transfer fuel to: "
	isnumber $numtest $shipnum
	if ($numtest < 1)
		echo ansi_12 "*Invalid ship number!*"
		halt
	end
	if ($shipnum < 1) or ($shipnum > 65000)
		echo ansi_12 "*Invalid ship number!*"
		halt
	end

	:top_of_ore_swap
	gosub :player~quikstats
	add $funky_counter 1
	if ($player~genesis < 1)
		echo ansi_12 "**Out of Genesis Torps. You're going to need one for this.*"
		halt
	end
	if ($player~ore_holds < 3)
		echo ansi_12 "**There's no ore on your ship! You can't drop ore if you don't have any.*"
		halt
	end
	send "qqq  z  n  u  y  *  .*  z  c  *  p  s  h "
	waiton "Landing on Federation StarDock."
	getrnd $rand_wait 100 300
	killtrigger safety_delay
	setdelaytrigger safety_delay :lift_stuff $rand_wait
	pause

	:lift_stuff
	send "qqq  z  n  l*  *  z  q  t  n  z  l  1  *  q  q  z  n  p  s  h "
	killalltriggers
	settextlinetrigger result_trg1 :res_torps "You don't have any Genesis Torpedoes to launch!"
	settextlinetrigger result_trg2 :res_nopln "There isn't a planet in this sector."
	settextlinetrigger result_trg3 :res_mltpl "Registry# and Planet Name"
	settextlinetrigger result_trg4 :res_landd "Landing sequence engaged..."
	settextlinetrigger result_trg5 :res_backd "Landing on Federation StarDock."
	pause

	:res_torps
	echo ansi_12 "**You somehow ran out of Genesis Torps before launching. This should not have happened! Check your status!*"
	send "? "
	halt

	:res_nopln
	echo ansi_12 "**The planet is gone! Someone might be messing with us.*"
	if ($funky_counter < 4)
		goto :top_of_ore_swap
	else
		echo ansi_12 "**I've tried this 3 times, something is definately going on. Check your status!*"
		send "? "
		halt
	end

	:res_landd
	waiton "Planet #"
	getword currentline $pnum 2
	striptext $pnum "#"
	waiton "(?="
	echo ansi_10 "**We've landed and dropped our ore on planet #" & $pnum & "!*"
	pause

	:res_mltpl
	waiton "--------------------"
	killalltriggers
	setvar $p_array_idx 0
	setarray $p_array 255
	killalltriggers
	settextlinetrigger plist_trig :plist_line ">"
	settextlinetrigger plist_end  :plist_end  "Land on which planet"
	pause
	halt

	:plist_line
	add $p_array_idx 1
	setvar $line currentline
	striptext $line "<"
	striptext $line ">"
	getword $line $a_number 1
	setvar $p_array[$p_array_idx] $a_number
	killtrigger plist_trig
	settextlinetrigger plist_trig :plist_line "<"
	pause
	halt

	:plist_end
	killalltriggers
	if ($p_array_idx < 1)
		echo ansi_12 "**The planet is gone! Someone might be messing with us.*"
		if ($funky_counter < 4)
			goto :top_of_ore_swap
		else
			echo ansi_12 "**I've tried this 3 times, something is definately going on. Check your status!*"
			send "? "
			halt
		end
	end
	waiton "Landing on Federation StarDock."
	waiton "<Hardware Emporium> So what are you looking for (?)"
	getrnd $rand_wait 100 300
	killtrigger safety_delay
	setdelaytrigger safety_delay :more_lift_stuff $rand_wait
	pause

	:more_lift_stuff
	getrnd $rnd_idx 1 $p_array_idx
	setvar $pnum $p_array[$rnd_idx]
	killalltriggers
	settextlinetrigger result_trg1 :res_baddd "Engage the Autopilot?"
	settextlinetrigger result_trg2 :res_baddd "That planet is not in this sector."
	settextlinetrigger result_trg3 :res_land2 "<Take/Leave Products>"
	settextlinetrigger result_trg4 :res_backd "Landing on Federation StarDock."
	send "qqq  z  n  l " & $pnum & "  *  *  z  n  z  n  *  z  q  t  n  z  l  1  *  q  q  z  n  p  s  h "
	pause

	:res_baddd
	killalltriggers
	echo ansi_12 "**Our planet is gone! Someone might be messing with us.*"
	if ($funky_counter < 4)
		goto :top_of_ore_swap
	else
		echo ansi_12 "**I've tried this 3 times, something is definately going on. Check your status!*"
		send "? "
	end
	halt

	:res_land2
	echo ansi_10 "**We've landed and dropped our ore on planet #" & $pnum & "!*"
	pause

	:res_backd
	killalltriggers
	gosub :player~quikstats
	waiton "<Hardware Emporium> So what are you looking for (?)"
	getrnd $rand_wait 100 300
	killtrigger safety_delay
	setdelaytrigger safety_delay :yet_more_lift_stuff $rand_wait
	pause

	:yet_more_lift_stuff
	setvar $msg ""
	settextlinetrigger result_trg1 :swap_xport_notavail "That is not an available ship."
	settextlinetrigger result_trg2 :swap_xport_badrange "only has a transport range of"
	settextlinetrigger result_trg3 :swap_xport_security "SECURITY BREACH! Invalid Password, unable to link transporters."
	settextlinetrigger result_trg4 :swap_xport_noaccess "Access denied!"
	settextlinetrigger result_trg5 :swap_xport_xprtgood "Security code accepted, engaging transporter control."
	settextlinetrigger result_trg6 :swap_pland_noplnet1 "Engage the Autopilot?"
	settextlinetrigger result_trg7 :swap_pland_noplnet2 "That planet is not in this sector."
	settextlinetrigger result_trg8 :swap_pland_noplnet3 "Invalid registry number, landing aborted."
	settextlinetrigger result_trg9 :swap_pland_prodtakn "<Take all>"
	settextlinetrigger result_trg0 :swap_pland_complete "Landing on Federation StarDock."
	send "qqq  z  n  "
	send "x    " & $shipnum & "    *    *    *   "
	send "l " & $pnum & "  *  *  z  n  z  n  *  z  q  a  *  q  q  z  n  "
	send "p  s  h "
	pause

	:swap_xport_notavail
	setvar $msg $msg & ansi_12 & "*That ship is not available, using the original ship...*"
	pause

	:swap_xport_badrange
	setvar $msg $msg & ansi_12 & "*That ship is too far away, using the original ship...*"
	pause

	:swap_xport_security
	setvar $msg $msg & ansi_12 & "*That ship is passworded, using the original ship...*"
	pause

	:swap_xport_noaccess
	setvar $msg $msg & ansi_12 & "*Cannot access that ship, using the original ship...*"
	pause

	:swap_xport_xprtgood
	setvar $msg $msg & ansi_10 & "*Xport good!*"
	pause

	:swap_pland_noplnet1
	setvar $msg $msg & ansi_12 & "*The planet has gone missing. Check your status!*"
	pause

	:swap_pland_noplnet2
	setvar $msg $msg & ansi_12 & "*The planet has gone missing. Check your status!*"
	pause

	:swap_pland_noplnet3
	setvar $msg $msg & ansi_12 & "*The planet has gone missing. Check your status!*"
	pause

	:swap_pland_prodtakn
	setvar $msg $msg & ansi_10 & "*Products collected!*"
	pause

	:swap_pland_complete
	killalltriggers
	gosub :player~quikstats
	waiton "<Hardware Emporium> So what are you looking for (?)"
	echo $msg
	halt
	pause
	halt
	# -------------------------------------------------------------------
	:pland_trg_1
	setvar $msg ansi_12 & "**There are no planets in the StarDock sector!*"
	pause

	:pland_trg_2
	setvar $msg ansi_12 & "**That planet is not in the StarDock sector!*"
	pause

	:pland_trg_3
	setvar $msg ansi_10 & "**Products taken!*"
	pause

	:pland_trg_4
	setvar $msg ansi_10 & "**Fuel dropped!*"
	pause

	:pland_trg_6
	setvar $msg ansi_10 & "**Planet destroyed!*"
	pause

	:pland_trg_5
	gosub :player~quikstats
	waiton "<Hardware Emporium> So what are you looking for (?)"
	killalltriggers
	echo $msg
	halt

	:donedockkit
	echo #27 "[30D                        " #27 "[30D"
	halt
end
include "source\include\map"
include "source\include\loadvars"
include "source\include\switchboard.ts"
