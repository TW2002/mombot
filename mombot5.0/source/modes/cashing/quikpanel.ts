gosub :help~initialize
setvar $help~help[1] $help~tab&"SupG cashing control panel and automation helper."
setvar $help~help[2] $help~tab&"Opens an interactive panel for haggle, bust warning, PPT,"
setvar $help~help[3] $help~tab&"display options, auto steal/rob, blind warp, and fighter kill helpers."
setvar $help~help[4] $help~tab&"After setup it remains loaded and reacts to game prompts."
gosub :help~helpfile

loadvar $bot_name
loadvar $user_command_line
loadvar $bot_turn_limit
loadvar $steal_factor
loadvar $rob_factor
loadvar $unlimitedgame
loadvar $ptradesetting
loadvar $bot~folder
setvar $current_prompt 		"Undefined"
setvar $psychic_probe 		"No"
setvar $planet_scanner 		"No"
setvar $scan_type 		"None"
setvar $current_sector 		0
setvar $turns 			0
setvar $credits 		0
setvar $fighters 		0
setvar $shields 		0
setvar $total_holds 		0
setvar $ore_holds 		0
setvar $organic_holds 		0
setvar $equipment_holds 	0
setvar $colonist_holds		0
setvar $photons 		0
setvar $armids 			0
setvar $limpets 		0
setvar $genesis 		0
setvar $twarp_type 		0
setvar $cloaks 			0
setvar $beacons 		0
setvar $atomic 			0
setvar $corbo 			0
setvar $eprobes 		0
setvar $mine_disruptors 	0
setvar $alignment 		0
setvar $experience		0
setvar $corp 			0
setvar $ship_number		0
setvar $turns_per_warp 		0
systemscript
reqrecording
setvar $file $bot~folder&"/_MOM_" & gamename & "_QUIK.txt"
setvar $bustfile $bot~folder&"/_MOM_" & gamename & "_BUST.txt"
setvar $mcicfile $bot~folder&"/"&gamename & "_MCIC.txt"
fileexists $chk $file
if ($chk = 1)
	gosub :readfile
	gosub :save
	delete $file
end
loadvar $quiksaved
if ($quiksaved)
	loadvar $quik_ahaggle
	loadvar $quik_hfactor
	loadvar $quik_sfactor
	loadvar $quik_rfactor
	loadvar $quik_figkill
	loadvar $quik_pptstop
	loadvar $quik_bwarn
	loadvar $quik_bwarp
	loadvar $quik_asteal
	loadvar $quik_arob
	loadvar $quik_lsteal
	loadvar $quik_lbust
	loadvar $quik_showssm
	loadvar $quik_showore
	loadvar $quik_showorg
	loadvar $quik_showequ
else
	setvar $quik_ahaggle "Off"
	setvar $quik_hfactor 5
	setvar $quik_sfactor 21
	setvar $quik_rfactor 6
	setvar $quik_pptstop 25
	setvar $quik_figkill "Off"
	setvar $quik_bwarn "Off"
	setvar $quik_bwarp "Off"
	setvar $quik_asteal "Off"
	setvar $quik_arob "Off"
	setvar $quik_lsteal 0
	setvar $quik_lbust 0
	setvar $quik_showssm "Yes"
	setvar $quik_showore "Yes"
	setvar $quik_showorg "Yes"
	setvar $quik_showequ "Yes"
end
setvar $ahaggle $quik_ahaggle
setvar $hfactor $quik_hfactor
setvar $sfactor $quik_sfactor
setvar $rfactor $quik_rfactor
setvar $figkill $quik_figkill
setvar $bwarn $quik_bwarn
setvar $bwarp $quik_bwarp
setvar $asteal $quik_asteal
setvar $arob $quik_arob
setvar $lsteal $quik_lsteal
setvar $lbust $quik_lbust
gosub :save
if ($bwarn = "On")
	fileexists $chk $bustfile
	if ($chk = 1)

		:abust
		echo ansi_15 "**Would You like to clear your busts?**"
		getconsoleinput $clear singlekey
		if ($clear = "y") or ($clear = "Y")
			delete $bustfile
		elseif ($clear = "n") or ($clear = "N")
			setarray $busts sectors
			setvar $read 1

			:rbust
			read $bustfile $bustsec $read
			if ($bustsec <> "EOF")
				setvar $busts[$bustsec] 1
				add $read 1
				goto :rbust
			end
		else
			goto :abust
		end
	end
end

:setmenu
echo "[2J"
setvar $scriptname "SupGQuikPanel"

:menu
gosub :signature
echo ansi_15 "Settings for " gamename "*"
echo ansi_14 "1." ansi_15 " Haggle Factor         " ansi_10 "["
echo ansi_6 $hfactor
echo ansi_10 "]*"
echo ansi_14 "2." ansi_15 " Bust Warning          " ansi_10 "["
echo ansi_6 $bwarn
echo ansi_10 "]*"
echo ansi_14 "3." ansi_15 " PPT Stop Percentage   " ansi_10 "["
echo ansi_6 $quik_pptstop
echo ansi_10 "]*"
echo ansi_14 "D." ansi_15 " Display Options*"
echo ansi_5 "*Press the number of the option you*wish to change, or press" ansi_14 " C" ansi_5 " to continue.**"
getconsoleinput $choice singlekey
lowercase $choice
if ($choice = 1)
	getinput $hfactor "Enter Haggle Factor (Setting to 0 will turn Haggle Off)"
	isnumber $chk $hfactor
	if ($hfactor = 0)
		setvar $ahaggle "Off"
	end
	if ($chk = 0)
		setvar $hfactor 5
	end
elseif ($choice = 2)
	if ($bwarn = "Off")
		setvar $bwarn "On"
		fileexists $chk $bustfile
		if ($chk = 1)

			:askbust
			echo ansi_15 "*Would You like to clear your busts?*"
			getconsoleinput $clear singlekey
			if ($clear = "y") or ($clear = "Y")
				delete $bustfile
			elseif ($clear = "n") or ($clear = "N")
				setarray $busts sectors
				setvar $read 1

				:readbust
				read $bustfile $bustsec $read
				if ($bustsec <> "EOF")
					setvar $busts[$bustsec] 1
					add $read 1
					goto :readbust
				end
			else
				goto :askbust
			end
		end
	else
		setvar $bwarn "Off"
	end
elseif ($choice = 3)
	getinput $quik_pptstop "PPT stop percentage"
	isnumber $chk $quik_pptstop
	if ($chk = 0) or ($quik_pptstop < 0) or ($quik_pptstop > 100)
		setvar $quik_pptstop 25
	end
elseif ($choice = "d")
	gosub :displayoptions
elseif ($choice = "c")
	gosub :save
	goto :wait
else
	goto :setmenu
end
goto :setmenu

:wait
killalltriggers
settexttrigger autooff :autooff "SUPGSCRIPT_AUTO_OFF"
settexttrigger bwarpoff :bwarpoff "SUPGSCRIPT_BWARP_OFF"
settexttrigger figkilloff :killoff "SUPGSCRIPT_KILL_OFF"
if ($ahaggle = "On")
	setstrigger ptrade :bunits "do you want to buy"
	setstrigger strade :sunits "do you want to sell"
	settexttrigger planettrade :plnttrade "<Negotiate Planetary TradeAgreement>"
end
if ($asteal = "On")
	settexttrigger steal :steals "to swipe? ["
end
if ($arob = "On")
	settextlinetrigger rob :rob "has in excess of"
end
if ($figkill = "On")
	settexttrigger moving :moving "You have to destroy the fighters"
	settexttrigger mines :moving "<Re-Display>"
	settexttrigger citmine :moving "<Scan Sector>"
end
if ($bwarp = "On")
	setstrigger bwarp :bwarp "Do you want to make this jump blind?"
	setstrigger bbwar :bwarp "Do you want to make this transport blind?"
end
settexttrigger busted :busted "Suddenly you're Busted"
settexttrigger nobust :ssteal "Success!"
settexttrigger chkbust :chkbust "] (?=Help)?"
settexttrigger info :get_info "<Info>"
settextouttrigger sets :optmenu "~"
pause

:get_info
killalltriggers
settextlinetrigger alnexp :alnexp "Rank "
settexttrigger gotinf :wait "(?=Help)?"
pause

:alnexp
gettext currentline $knownexp ": " " points,"
striptext $knownexp ","
getword currentline $knownalign 7
striptext $knownalign "Alignment="
striptext $knownalign ","
pause

:plnttrade
killalltriggers
gosub :planet_neg
goto :wait

:bunits
setvar $multiplier (100 - $hfactor)
goto :units

:sunits
setvar $multiplier (100 + $hfactor)

:units
killtrigger ptrade
killtrigger strade
killtrigger go
killtrigger done
setstrigger ptrade :bunits "do you want to buy ["
setstrigger strade :sunits "do you want to sell ["
settextlinetrigger go :finishhaggle "Agreed, "
settextlinetrigger done :donehaggle "empty cargo holds."
pause

:finishhaggle
killtrigger done
gosub :haggle

:donehaggle
goto :wait

:moving
setvar $singlestep 1
gosub :clear_sector
goto :wait

:steals
gettext currentline $maxholds "[" "]"
setvar $stealholds ($knownexp / $steal_factor)
if ($stealholds > $maxholds)
	send $maxholds "*"
else
	send $stealholds "*"
end
pause

:rob
getword currentline $cop 11
striptext $cop ","
if ($cop = 0)
	send "*"
else
	setvar $robamount ($knownexp * $rob_factor)
	if ($robamount > $cop)
		setvar $cop (($cop * 110) / 100)
		send $cop "*"
	else
		send $robamount "*"
	end
end
pause

:chkbust
gettext currentline $cursec "]:[" "] ("
if ($bwarn = "On")
	if ($lbust = $cursec)
		echo ansi_5 "[" ansi_12 "LAST BUST" ansi_5 "] : "
	elseif ($busts[$cursec] = 1)
		echo ansi_5 "[" ansi_12 "BUSTED" ansi_5 "] : "
	elseif ($lsteal = $cursec)
		echo ansi_5 "[" ansi_14 "LAST STEAL" ansi_5 "] : "
	end
end
goto :wait

:busted
waitfor "(?=Help)? :"
gettext currentline $cursec "]:[" "] ("
setvar $busts[$cursec] 1
write $bustfile $cursec
setvar $lbust $cursec
gosub :save
if ($bwarn = "On")
	echo ansi_5 "[" ansi_12 "LAST BUST" ansi_5 "] : "
end
goto :wait

:ssteal
waitfor "(?=Help)? :"
gettext currentline $cursec "]:[" "] ("
setvar $lsteal $cursec
gosub :save
if ($bwarn = "On")
	echo ansi_5 "[" ansi_14 "LAST STEAL" ansi_5 "] : "
end
goto :wait

:bwarp
send "n"
goto :wait

:optmenu
cuttext currentline $location 1 7
if ($location = "Command") or ($location = "Citadel") or ($location = "Compute") or ($location = "Corpora") or ($location = "<StarDo") or ($location = "Planet ") or ($location = "Engage ") or ($location = "Option?") or ($location = "<Tavern")
	gosub :quikstats
	setvar $cursec $current_sector
	setvar $align $alignment
else
	setvar $align $knownalign
end

:alnmenu
echo "[2J"
setvar $scriptname "SupGQuikPanel"
gosub :signature
echo ansi_15 "*Option Menu *"
if (port.class[$cursec] <> "-1")
	setvar $round 0
	setvar $menuitem 0

	:round
	if ($round < sector.warpcount[$cursec])
		add $round 1
		setvar $adjsec sector.warps[$cursec][$round]
		if (port.class[$adjsec] = "-1")
			goto :round
		end
		if ((port.buyequip[$cursec] = 1) and (port.buyequip[$adjsec] = 0) and ($quik_showequ = "Yes")) or ((port.buyorg[$cursec] = 0) and (port.buyorg[$adjsec] = 1) and ($quik_showorg = "Yes")) or ((port.buyequip[$cursec] = 0) and (port.buyequip[$adjsec] = 1) and ($quik_showequ = "Yes")) or ((port.buyorg[$cursec] = 1) and (port.buyorg[$adjsec] = 0) and ($quik_showorg = "Yes")) or ((port.buyfuel[$cursec] = 1) and (port.buyfuel[$adjsec] = 0) and ($quik_showore = "Yes")) or ((port.buyfuel[$cursec] = 0) and (port.buyfuel[$adjsec] = 1) and ($quik_showore = "Yes"))
			if (port.class[$cursec] <> 9) and (port.class[$adjsec] <> 9) and (port.class[$cursec] <> 0) and (port.class[$adjsec] <> 0) and ($location = "Command")
				add $menuitem 1
				setvar $classchk port.class[$cursec]
				gosub :chkclass
				setvar $class1 $class
				setvar $classchk port.class[$adjsec]
				gosub :chkclass
				setvar $class2 $class
				setvar $makemenu[$menuitem] "PPT " & $cursec & " " & $adjsec
				echo ansi_14 $menuitem ". " ansi_15 "PPT - " $cursec & " (" & $class1 & ")"
				if ($busts[$cursec] = 1)
					echo ansi_15 " (" ansi_12 "Busted" ansi_15 ") "
				end
				if ($lbust = $cursec)
					echo ansi_15 " (" ansi_12 "Last Bust" ansi_15 ") "
				end
				if ($lsteal = $cursec)
					echo ansi_15 " (" ansi_14 "Last Steal" ansi_15 ") "
				end
				echo "and " $adjsec  & " (" & $class2 & ")"
				if ($busts[$adjsec] = 1)
					echo ansi_15 " (" ansi_12 "Busted" ansi_15 ") "
				end
				if ($lbust = $adjsec)
					echo ansi_15 " (" ansi_12 "Last Bust" ansi_15 ") "
				end
				if ($lsteal = $adjsec)
					echo ansi_15 " (" ansi_14 "Last Steal" ansi_15 ") "
				end
				echo "*"
			end
		end
		if (port.buyequip[$cursec] = 1) and (port.buyequip[$adjsec] = 1) and ($align < "-100") and ($quik_showssm = "Yes") and ($location = "Command")
			add $menuitem 1
			setvar $makemenu[$menuitem] "SSM " & $cursec & " " & $adjsec
			echo ansi_14 $menuitem ". " ansi_15 "SSM - " $cursec
			if ($busts[$cursec] = 1)
				echo ansi_15 " (" ansi_12 "Busted" ansi_15 ") "
			end
			if ($lbust = $cursec)
				echo ansi_15 " (" ansi_12 "Last Bust" ansi_15 ") "
			end
			if ($lsteal = $cursec)
				echo ansi_15 " (" ansi_14 "Last Steal" ansi_15 ") "
			end
			echo " and " $adjsec
			if ($busts[$adjsec] = 1)
				echo ansi_15 " (" ansi_12 "Busted" ansi_15 ") "
			end
			if ($lbust = $adjsec)
				echo ansi_15 " (" ansi_12 "Last Bust" ansi_15 " )"
			end
			if ($lsteal = $adjsec)
				echo ansi_15 " (" ansi_14 "Last Steal" ansi_15 ") "
			end
			echo "*"
		end
		goto :round
	end
end
echo ansi_14 "S. " ansi_15 "Settings*"
echo ansi_14 "Q. " ansi_15 "Close Menu*"
if ($menuitem < 10)
	getconsoleinput $optchoice singlekey
else
	getconsoleinput $optchoice
end
lowercase $optchoice
isnumber $num $optchoice
if ($optchoice = "s")
	goto :setmenu
elseif ($optchoice = "q")
	goto :wait
elseif ($num = 1)
	if ($optchoice <= $menuitem) and ($optchoice > 0)
		getword $makemenu[$optchoice] $sub 1
		getword $makemenu[$optchoice] $port1 2
		getword $makemenu[$optchoice] $port2 3
	else
		goto :alnmenu
	end
	if ($sub = "PPT")
		killalltriggers
		setvar $port1 $port1
		setvar $port2 $port2
		setvar $haggle $hfactor
		setvar $stopperc $quik_pptstop
		settextouttrigger abort :return "~"
		gosub :ppt
	elseif ($sub = "SSM")
		killalltriggers
		send "jy"
		setvar $port1 $port1
		setvar $port2 $port2
		setvar $haggle $hfactor
		setvar $hag 1
		settextouttrigger abort :return "~"
		gosub :ssm
		killtrigger abort
		setvar $busts[$busted] 1
		write $bustfile $busted
		setvar $lbust $busted
		if ($port1 = $busted)
			setvar $lsteal $port2
		else
			setvar $lsteal $port1
		end
		gosub :save
	end
	goto :wait
else
	goto :alnmenu
end

:return
echo ansi_15 "*Returning to Normal Operation*"
goto :wait

:save
setvar $quik_ahaggle $ahaggle
setvar $quik_hfactor $hfactor
setvar $quik_sfactor $steal_factor
setvar $quik_rfactor $rob_factor
setvar $quik_figkill $figkill
setvar $quik_bwarn $bwarn
setvar $quik_bwarp $bwarp
setvar $quik_asteal $asteal
setvar $quik_arob $arob
setvar $quik_lsteal $lsteal
setvar $quik_lbust $lbust
savevar $quik_ahaggle
savevar $quik_pptstop
savevar $quik_hfactor
savevar $quik_sfactor
savevar $quik_rfactor
savevar $quik_figkill
savevar $quik_bwarn
savevar $quik_bwarp
savevar $quik_asteal
savevar $quik_arob
savevar $quik_lsteal
savevar $quik_lbust
savevar $quik_showssm
savevar $quik_showore
savevar $quik_showorg
savevar $quik_showequ
setvar $quiksaved 1
savevar $quiksaved
return

:readfile
read $file $ahaggle 1
read $file $hfactor 2
read $file $steal_factor 3
read $file $rob_factor 4
read $file $figkill 5
read $file $bwarn 6
read $file $bwarp 7
read $file $asteal 8
read $file $arob 9
read $file $lsteal 10
read $file $lbust 11
return

:autooff
echo "*heh"
if ($ahaggle = "On") or ($asteal = "On") or ($arob = "On")
	clientmessage "(SupGQuikPanel) - SupGCashing script started, turning off auto haggle, rob, steal."
	setvar $ahaggle "Off"
	setvar $asteal "Off"
	setvar $arob "Off"
end
goto :wait

:bwarpoff
if ($bwarp = "On")
	clientmessage "(SupGQuikPanel) - SupGMove/Colo script started, turning off blind warp protection."
	setvar $bwarp "Off"
end
goto :wait

:killoff
if ($figkill = "On")
	clientmessage "(SupGQuikPanel) - SupGClearing script started, turning off auto fighter killing."
	setvar $figkill "Off"
end
goto :wait

:displayoptions
:setdisplaymenu
echo "[2J"
setvar $scriptname "SupGQuikPanel"

:displaymenu
gosub :signature
echo ansi_15 "Display Options*"
echo ansi_14 "1." ansi_15 " Display SSM Pairs      " ansi_10 "["
echo ansi_6 $quik_showssm
echo ansi_10 "]*"
echo ansi_14 "2." ansi_15 " Display Fuel Pairs     " ansi_10 "["
echo ansi_6 $quik_showore
echo ansi_10 "]*"
echo ansi_14 "3." ansi_15 " Display Organics Pairs " ansi_10 "["
echo ansi_6 $quik_showorg
echo ansi_10 "]*"
echo ansi_14 "4." ansi_15 " Display Equipment Pairs" ansi_10 "["
echo ansi_6 $quik_showequ
echo ansi_10 "]*"
echo ansi_14 "D." ansi_15 " Done"
echo ansi_5 "*Press the number of the option you*wish to change, or press" ansi_14 " D" ansi_5 " when you are done.**"
getconsoleinput $displaychoice singlekey
lowercase $displaychoice
if ($displaychoice = 1)
	if ($quik_showssm = "No")
		setvar $quik_showssm "Yes"
	else
		setvar $quik_showssm "No"
	end
elseif ($displaychoice = 2)
	if ($quik_showore = "No")
		setvar $quik_showore "Yes"
	else
		setvar $quik_showore "No"
	end
elseif ($displaychoice = 3)
	if ($quik_showorg = "No")
		setvar $quik_showorg "Yes"
	else
		setvar $quik_showorg "No"
	end
elseif ($displaychoice = 4)
	if ($quik_showequ = "No")
		setvar $quik_showequ "Yes"
	else
		setvar $quik_showequ "No"
	end
elseif ($displaychoice = "d")
	return
else
	goto :setdisplaymenu
end
goto :setdisplaymenu

:signature
echo ansi_6 "**-" ansi_5 "=" ansi_6 "-" ansi_5 "=" ansi_10 "("
setvar $text $scriptname
gosub :addspc
setvar $scriptname $text
echo ansi_15 $scriptname ansi_10 ")" ansi_5 "=" ansi_6 "-" ansi_5 "=" ansi_6 "-*"
gosub :addspc
return

:addspc
getlength $text $len
if ($len < $max)
	setvar $spaces ($max - $len)
	if ($spaces = 1)
		setvar $text " " & $text
	else
		setvar $spaces ($spaces / 2)
		setvar $cnt 0

		:addfront
		if ($cnt < $spaces)
			add $cnt 1
			setvar $text " " & $text
			goto :addfront
		end
		setvar $cnt 0

		:addback
		if ($cnt < $spaces)
			add $cnt 1
			setvar $text $text & " "
			goto :addback
		end
		getlength $text $len
		if ($len < $max)
			setvar $text " " & $text
		end
	end
end
return

:checkmax
if ($len > $max)
	setvar $max $len
end
return

:planet_neg
setvar $ni 0
setvar $ore 0
setvar $org 0
setvar $equ 0
setvar $oremcic "-90"
setvar $orgmcic "-75"
setvar $equmcic "-65"
if ($sdt = 1) or ($selloff = 1)
	send "PN"
	waitfor "<Negotiate Planetary TradeAgreement>"
end
settextlinetrigger orepct :orepct "Fuel Ore   Buying"
settextlinetrigger orgpct :orgpct "Organics   Buying"
settextlinetrigger equpct :equpct "Equipment  Buying"
settexttrigger gotpercts :gotpercts "Registry# and Planet Name"
settexttrigger noplninf :noplninf "Negotiate agreement"
pause

:noplninf
killtrigger orepct
killtrigger orgpct
killtrigger equpct
killtrigger gotpercts
killtrigger noplninf
echo ansi_15 "Could not obtain port information, unable to use Advanced Planet Trading."
return

:orepct
killtrigger noplninf
getword currentline $oretrading 4
getword currentline $orepercent 5
striptext $orepercent "%"
if ($orepercent < 100)
	add $orepercent 1
end
pause

:orgpct
killtrigger noplninf
getword currentline $orgtrading 3
getword currentline $orgpercent 4
striptext $orgpercent "%"
if ($orgpercent < 100)
	add $orgpercent 1
end
pause

:equpct
killtrigger noplninf
getword currentline $equtrading 3
getword currentline $equpercent 4
striptext $equpercent "%"
if ($equpercent < 100)
	add $equpercent 1
end
pause

:gotpercts
killtrigger orepct
killtrigger orgpct
killtrigger equpct
if ($sdt =1)
	if ($pnum = "Auto") or ($pnum = 0)

		:sdt_pnum
		waitfor "-----------------"
		settextlinetrigger num :num "<"
		pause

		:num
		gettext currentline $pnum "<" ">"
		striptext $pnum " "
		send $pnum "*"
	else
		send $pnum "*"
	end
end
if ($selloff = 1)
	send $pnum "*"
end

:sellproduct
echo "*Sell product*"
setstrigger sellfuel :sellfuel "How many units of Fuel Ore"
setstrigger sellorg :sellorg "How many units of Organics"
setstrigger sellequ :sellequ "How many units of Equipment"
settextlinetrigger selling :amnt_selling "Agreed, "
settexttrigger donewithport :donewithport "] (?=Help)"
pause

:sellfuel
killtrigger ni
setvar $prodtosell "ore"
if ($sdt = 1) or ($selloff = 1)
	send "0*"
end
pause

:sellorg
killtrigger ni
setvar $prodtosell "org"
if ($sdt = 1)
	send "0*"
end
if ($selloff = 1)
	if ($sellprod = "Organics") or ($sellprod = "Both")
		if ($orgpercent < $minperc)
			send "0*"
		else
			send "*"
		end
	else
		send "0*"
	end
end
pause

:sellequ
killtrigger ni
if ($sdt = 1)
	send "*"
end
if ($selloff = 1)
	if ($sellprod = "Equipment") or ($sellprod = "Both")
		if ($equpercent < $minperc)
			send "0*"
		else
			send "*"
		end
	else
		send "0*"
	end
end
setvar $prodtosell "equ"
pause

:amnt_selling
echo "*Amount selling*"
killtrigger sellfuel
killtrigger sellorg
killtrigger sellequ
killtrigger donewithport
getword currentline $amnt_sell 2
striptext $amnt_sell ","

:sellhaggle
killalltriggers
echo "*Sell haggle*"
settexttrigger sellfirstoffer :sellfirstoffer "Your offer ["
pause

:sellfirstoffer
killtrigger sellfirstoffer
settextlinetrigger bad_offer_1 :sellhaggle "This is the big leagues Jr.  Make a real offer."
settextlinetrigger bad_offer_2 :sellhaggle "What do you take me for, a fool?  Make a real offer!"
settextlinetrigger bad_offer_3 :sellhaggle "WHAT?!@!? you must be crazy!"
gettext currentline $offer "[" "]?"
striptext $offer ","
echo "*First offer*"
echo "*Offer: " $offer "*"
setvar $perunitinitoffer $offer
multiply $perunitinitoffer 100
divide $perunitinitoffer $amnt_sell
setvar $portmaxinit $perunitinitoffer
divide $perunitinitoffer 10
if ($prodtosell = "ore")
	setvar $basevalue 256055800
	setvar $basepercent 11725
	setvar $basepercentinverse 88275
	setvar $percentfrombase $orepercent
elseif ($prodtosell = "org")
	setvar $basevalue 506276400
	setvar $basepercent 11287
	setvar $basepercentinverse 88713
	setvar $percentfrombase $orgpercent
elseif ($prodtosell = "equ")
	setvar $basevalue 906281000
	setvar $basepercent 10989
	setvar $basepercentinverse 89010
	setvar $percentfrombase $equpercent
end

if ($percentfrombase >= 15)
	multiply $portmaxinit 100000
	subtract $portmaxinit $basevalue
	multiply $percentfrombase 1000
	subtract $percentfrombase $basepercent
	divide $portmaxinit $percentfrombase
	multiply $portmaxinit $basepercentinverse
	add $portmaxinit $basevalue
	divide $portmaxinit 1000000
elseif ($prodtosell = "ore")
	setvar $portmaxinit 340
elseif ($prodtosell = "org")
	setvar $portmaxinit 635
elseif ($prodtosell = "equ")
	setvar $portmaxinit 1063
end
if ($prodtosell = "ore")
	if ($portmaxinit >= 436)
		setvar $mcic "-90"
		setvar $multiple "1494"
	elseif ($portmaxinit >= 434)
		setvar $mcic "-89"
		setvar $multiple "1488"
	elseif ($portmaxinit >= 433)
		setvar $mcic "-88"
		setvar $multiple "1482"
	elseif ($portmaxinit >= 431)
		setvar $mcic "-87"
		setvar $multiple "1476"
	elseif ($portmaxinit >= 429)
		setvar $mcic "-86"
		setvar $multiple "1470"
	elseif ($portmaxinit >= 427)
		setvar $mcic "-85"
		setvar $multiple "1464"
	elseif ($portmaxinit >= 425)
		setvar $mcic "-84"
		setvar $multiple "1458"
	elseif ($portmaxinit >= 424)
		setvar $mcic "-83"
		setvar $multiple "1452"
	elseif ($portmaxinit >= 422)
		setvar $mcic "-82"
		setvar $multiple "1446"
	elseif ($portmaxinit >= 420)
		setvar $mcic "-81"
		setvar $multiple "1440"
	elseif ($portmaxinit >= 418)
		setvar $mcic "-80"
		setvar $multiple "1434"
	elseif ($portmaxinit >= 416)
		setvar $mcic "-79"
		setvar $multiple "1429"
	elseif ($portmaxinit >= 414)
		setvar $mcic "-78"
		setvar $multiple "1423"
	elseif ($portmaxinit >= 412)
		setvar $mcic "-77"
		setvar $multiple "1417"
	elseif ($portmaxinit >= 411)
		setvar $mcic "-76"
		setvar $multiple "1411"
	elseif ($portmaxinit >= 409)
		setvar $mcic "-75"
		setvar $multiple "1405"
	elseif ($portmaxinit >= 407)
		setvar $mcic "-74"
		setvar $multiple "1399"
	elseif ($portmaxinit >= 405)
		setvar $mcic "-73"
		setvar $multiple "1393"
	elseif ($portmaxinit >= 403)
		setvar $mcic "-72"
		setvar $multiple "1387"
	elseif ($portmaxinit >= 401)
		setvar $mcic "-71"
		setvar $multiple "1381"
	elseif ($portmaxinit >= 399)
		setvar $mcic "-70"
		setvar $multiple "1375"
	elseif ($portmaxinit >= 397)
		setvar $mcic "-69"
		setvar $multiple "1369"
	elseif ($portmaxinit >= 396)
		setvar $mcic "-68"
		setvar $multiple "1363"
	elseif ($portmaxinit >= 394)
		setvar $mcic "-67"
		setvar $multiple "1357"
	elseif ($portmaxinit >= 392)
		setvar $mcic "-66"
		setvar $multiple "1351"
	elseif ($portmaxinit >= 390)
		setvar $mcic "-65"
		setvar $multiple "1345"
	elseif ($portmaxinit >= 388)
		setvar $mcic "-64"
		setvar $multiple "1342"
	elseif ($portmaxinit >= 386)
		setvar $mcic "-63"
		setvar $multiple "1336"
	elseif ($portmaxinit >= 384)
		setvar $mcic "-62"
		setvar $multiple "1330"
	elseif ($portmaxinit >= 382)
		setvar $mcic "-61"
		setvar $multiple "1324"
	elseif ($portmaxinit >= 380)
		setvar $mcic "-60"
		setvar $multiple "1318"
	elseif ($portmaxinit >= 378)
		setvar $mcic "-59"
		setvar $multiple "1312"
	elseif ($portmaxinit >= 376)
		setvar $mcic "-58"
		setvar $multiple "1306"
	elseif ($portmaxinit >= 374)
		setvar $mcic "-57"
		setvar $multiple "1300"
	elseif ($portmaxinit >= 372)
		setvar $mcic "-56"
		setvar $multiple "1294"
	elseif ($portmaxinit >= 370)
		setvar $mcic "-55"
		setvar $multiple "1291"
	elseif ($portmaxinit >= 368)
		setvar $mcic "-54"
		setvar $multiple "1285"
	elseif ($portmaxinit >= 366)
		setvar $mcic "-53"
		setvar $multiple "1279"
	elseif ($portmaxinit >= 364)
		setvar $mcic "-52"
		setvar $multiple "1273"
	elseif ($portmaxinit >= 362)
		setvar $mcic "-51"
		setvar $multiple "1267"
	elseif ($portmaxinit >= 360)
		setvar $mcic "-50"
		setvar $multiple "1261"
	elseif ($portmaxinit >= 358)
		setvar $mcic "-49"
		setvar $multiple "1255"
	elseif ($portmaxinit >= 356)
		setvar $mcic "-48"
		setvar $multiple "1249"
	elseif ($portmaxinit >= 354)
		setvar $mcic "-46"
		setvar $multiple "1246"
	elseif ($portmaxinit >= 352)
		setvar $mcic "-46"
		setvar $multiple "1240"
	elseif ($portmaxinit >= 350)
		setvar $mcic "-45"
		setvar $multiple "1234"
	elseif ($portmaxinit >= 348)
		setvar $mcic "-44"
		setvar $multiple "1228"
	elseif ($portmaxinit >= 346)
		setvar $mcic "-43"
		setvar $multiple "1222"
	elseif ($portmaxinit >= 344)
		setvar $mcic "-42"
		setvar $multiple "1219"
	elseif ($portmaxinit >= 342)
		setvar $mcic "-41"
		setvar $multiple "1209"
	elseif ($portmaxinit >= 340)
		setvar $mcic "-40"
		setvar $multiple "1208"
	else
		setvar $mcic 0
		setvar $multiple "1208"
	end
elseif ($prodtosell = "org")
	if ($portmaxinit >= 813)
		setvar $mcic "-75"
		setvar $multiple "1405"
	elseif ($portmaxinit >= 810)
		setvar $mcic "-74"
		setvar $multiple 1399
	elseif ($portmaxinit >= 806)
		setvar $mcic "-73"
		setvar $multiple 1393
	elseif ($portmaxinit >= 802)
		setvar $mcic "-72"
		setvar $multiple 1387
	elseif ($portmaxinit >= 798)
		setvar $mcic "-71"
		setvar $multiple 1381
	elseif ($portmaxinit >= 795)
		setvar $mcic "-70"
		setvar $multiple 1375
	elseif ($portmaxinit >= 791)
		setvar $mcic "-69"
		setvar $multiple 1369
	elseif ($portmaxinit >= 787)
		setvar $mcic "-68"
		setvar $multiple 1363
	elseif ($portmaxinit >= 783)
		setvar $mcic "-67"
		setvar $multiple 1357
	elseif ($portmaxinit >= 779)
		setvar $mcic "-66"
		setvar $multiple 1351
	elseif ($portmaxinit >= 775)
		setvar $mcic "-65"
		setvar $multiple 1345
	elseif ($portmaxinit >= 772)
		setvar $mcic "-64"
		setvar $multiple 1339
	elseif ($portmaxinit >= 768)
		setvar $mcic "-63"
		setvar $multiple 1336
	elseif ($portmaxinit >= 764)
		setvar $mcic "-62"
		setvar $multiple 1330
	elseif ($portmaxinit >= 760)
		setvar $mcic "-61"
		setvar $multiple 1324
	elseif ($portmaxinit >= 756)
		setvar $mcic "-60"
		setvar $multiple 1318
	elseif ($portmaxinit >= 752)
		setvar $mcic "-59"
		setvar $multiple 1312
	elseif ($portmaxinit >= 748)
		setvar $mcic "-58"
		setvar $multiple 1306
	elseif ($portmaxinit >= 744)
		setvar $mcic "-57"
		setvar $multiple 1300
	elseif ($portmaxinit >= 740)
		setvar $mcic "-56"
		setvar $multiple 1294
	elseif ($portmaxinit >= 737)
		setvar $mcic "-55"
		setvar $multiple 1291
	elseif ($portmaxinit >= 733)
		setvar $mcic "-54"
		setvar $multiple 1285
	elseif ($portmaxinit >= 729)
		setvar $mcic "-53"
		setvar $multiple 1279
	elseif ($portmaxinit >= 725)
		setvar $mcic "-52"
		setvar $multiple 1273
	elseif ($portmaxinit >= 721)
		setvar $mcic "-51"
		setvar $multiple 1267
	elseif ($portmaxinit >= 717)
		setvar $mcic "-50"
		setvar $multiple 1261
	elseif ($portmaxinit >= 713)
		setvar $mcic "-49"
		setvar $multiple 1255
	elseif ($portmaxinit >= 709)
		setvar $mcic "-48"
		setvar $multiple 1252
	elseif ($portmaxinit >= 705)
		setvar $mcic "-47"
		setvar $multiple 1246
	elseif ($portmaxinit >= 701)
		setvar $mcic "-46"
		setvar $multiple 1236
	elseif ($portmaxinit >= 697)
		setvar $mcic "-45"
		setvar $multiple 1233
	elseif ($portmaxinit >= 693)
		setvar $mcic "-44"
		setvar $multiple 1227
	elseif ($portmaxinit >= 688)
		setvar $mcic "-43"
		setvar $multiple 1224
	elseif ($portmaxinit >= 684)
		setvar $mcic "-42"
		setvar $multiple 1214
	elseif ($portmaxinit >= 680)
		setvar $mcic "-41"
		setvar $multiple 1213
	elseif ($portmaxinit >= 676)
		setvar $mcic "-40"
		setvar $multiple 1203
	elseif ($portmaxinit >= 672)
		setvar $mcic "-39"
		setvar $multiple 1200
	elseif ($portmaxinit >= 668)
		setvar $mcic "-38"
		setvar $multiple 1194
	elseif ($portmaxinit >= 664)
		setvar $mcic "-37"
		setvar $multiple 1191
	elseif ($portmaxinit >= 660)
		setvar $mcic "-36"
		setvar $multiple 1181
	elseif ($portmaxinit >= 656)
		setvar $mcic "-35"
		setvar $multiple 1178
	elseif ($portmaxinit >= 651)
		setvar $mcic "-34"
		setvar $multiple 1172
	elseif ($portmaxinit >= 647)
		setvar $mcic "-33"
		setvar $multiple 1166
	elseif ($portmaxinit >= 643)
		setvar $mcic "-32"
		setvar $multiple 1160
	elseif ($portmaxinit >= 639)
		setvar $mcic "-31"
		setvar $multiple 1157
	elseif ($portmaxinit >= 635)
		setvar $mcic "-30"
		setvar $multiple 1154
	else
		setvar $mcic 0
		setvar $multiple "1154"
	end
elseif ($prodtosell = "equ")
	if ($portmaxinit >= 1393)
		setvar $mcic "-65"
		setvar $multiple 1347
	elseif ($portmaxinit >= 1386)
		setvar $mcic "-64"
		setvar $multiple 1341
	elseif ($portmaxinit >= 1379)
		setvar $mcic "-63"
		setvar $multiple 1336
	elseif ($portmaxinit >= 1372)
		setvar $mcic "-62"
		setvar $multiple 1330
	elseif ($portmaxinit >= 1365)
		setvar $mcic "-61"
		setvar $multiple 1324
	elseif ($portmaxinit >= 1358)
		setvar $mcic "-60"
		setvar $multiple 1319
	elseif ($portmaxinit >= 1351)
		setvar $mcic "-59"
		setvar $multiple 1313
	elseif ($portmaxinit >= 1344)
		setvar $mcic "-58"
		setvar $multiple 1307
	elseif ($portmaxinit >= 1337)
		setvar $mcic "-57"
		setvar $multiple 1302
	elseif ($portmaxinit >= 1329)
		setvar $mcic "-56"
		setvar $multiple 1296
	elseif ($portmaxinit >= 1323)
		setvar $mcic "-55"
		setvar $multiple 1291
	elseif ($portmaxinit >= 1315)
		setvar $mcic "-54"
		setvar $multiple 1285
	elseif ($portmaxinit >= 1308)
		setvar $mcic "-53"
		setvar $multiple 1279
	elseif ($portmaxinit >= 1301)
		setvar $mcic "-52"
		setvar $multiple 1274
	elseif ($portmaxinit >= 1294)
		setvar $mcic "-51"
		setvar $multiple 1268
	elseif ($portmaxinit >= 1287)
		setvar $mcic "-50"
		setvar $multiple 1262
	elseif ($portmaxinit >= 1279)
		setvar $mcic "-49"
		setvar $multiple 1254
	elseif ($portmaxinit >= 1272)
		setvar $mcic "-48"
		setvar $multiple 1247
	elseif ($portmaxinit >= 1265)
		setvar $mcic "-47"
		setvar $multiple 1246
	elseif ($portmaxinit >= 1258)
		setvar $mcic "-46"
		setvar $multiple 1241
	elseif ($portmaxinit >= 1251)
		setvar $mcic "-45"
		setvar $multiple 1235
	elseif ($portmaxinit >= 1243)
		setvar $mcic "-44"
		setvar $multiple 1229
	elseif ($portmaxinit >= 1236)
		setvar $mcic "-43"
		setvar $multiple 1224
	elseif ($portmaxinit >= 1229)
		setvar $mcic "-42"
		setvar $multiple 1218
	elseif ($portmaxinit >= 1221)
		setvar $mcic "-41"
		setvar $multiple 1213
	elseif ($portmaxinit >= 1214)
		setvar $mcic "-40"
		setvar $multiple 1208
	elseif ($portmaxinit >= 1206)
		setvar $mcic "-39"
		setvar $multiple 1201
	elseif ($portmaxinit >= 1199)
		setvar $mcic "-38"
		setvar $multiple 1196
	elseif ($portmaxinit >= 1192)
		setvar $mcic "-37"
		setvar $multiple 1190
	elseif ($portmaxinit >= 1184)
		setvar $mcic "-36"
		setvar $multiple 1185
	elseif ($portmaxinit >= 1177)
		setvar $mcic "-35"
		setvar $multiple 1180
	elseif ($portmaxinit >= 1169)
		setvar $mcic "-34"
		setvar $multiple 1174
	elseif ($portmaxinit >= 1162)
		setvar $mcic "-33"
		setvar $multiple 1169
	elseif ($portmaxinit >= 1154)
		setvar $mcic "-32"
		setvar $multiple 1164
	elseif ($portmaxinit >= 1147)
		setvar $mcic "-31"
		setvar $multiple 1158
	elseif ($portmaxinit >= 1139)
		setvar $mcic "-30"
		setvar $multiple 1152
	elseif ($portmaxinit >= 1132)
		setvar $mcic "-29"
		setvar $multiple 1149
	elseif ($portmaxinit >= 1124)
		setvar $mcic "-28"
		setvar $multiple 1144
	elseif ($portmaxinit >= 1116)
		setvar $mcic "-27"
		setvar $multiple 1136
	elseif ($portmaxinit >= 1109)
		setvar $mcic "-26"
		setvar $multiple 1132
	elseif ($portmaxinit >= 1101)
		setvar $mcic "-25"
		setvar $multiple 1126
	elseif ($portmaxinit >= 1093)
		setvar $mcic "-24"
		setvar $multiple 1122
	elseif ($portmaxinit >= 1086)
		setvar $mcic "-23"
		setvar $multiple 1117
	elseif ($portmaxinit >= 1078)
		setvar $mcic "-22"
		setvar $multiple 1110
	elseif ($portmaxinit >= 1071)
		setvar $mcic "-21"
		setvar $multiple 1105
	elseif ($portmaxinit >= 1063)
		setvar $mcic "-20"
		setvar $multiple 1102
	else
		setvar $mcic "0"
		setvar $multiple 1102
	end
end
setvar $counter $offer
divide $counter 10
multiply $counter $multiple
divide $counter 100
send $counter & "*"
echo "*Line 791 - Waitfor counter*"
waitfor $counter
setvar $midhaggles 0

:sellofferloop
killalltriggers
echo "*Sell offer loop*"
settextlinetrigger donehag :pdone_haggle "You have"
settextlinetrigger offerme :prehaggle "We'll buy them for"
settextlinetrigger final :finaloffer "Our final offer is"
settexttrigger ni :ni "We're not interested."
pause

:prehaggle
getword currentline $new_offer 5
striptext $new_offer ","
if ($new_offer = $offer)
	multiply $counter 98
	divide $counter 100
	send $counter & "*"
	waitfor $counter
	goto :sellofferloop
else
	gettext currentline $new_offer "for " " credits."
	striptext $new_offer ","
	setvar $offer_change $new_offer
	subtract $offer_change $offer
	if ($mcic > "-35")
		multiply $offer_change 75
		divide $offer_change 100
		subtract $counter $offer_change
		subtract $counter 25
	elseif ($mcic > "-55")
		multiply $offer_change 65
		divide $offer_change 100
		subtract $counter $offer_change
		subtract $counter 25
	else
		multiply $offer_change 60
		divide $offer_change 100
		subtract $counter $offer_change
		subtract $counter 10
	end
	send $counter & "*"
	setvar $offer $new_offer
	waitfor $counter
	add $midhaggles 1
	settexttrigger offerme :prehaggle "We'll buy them for"
	pause
end

:finaloffer
killtrigger offerme
if (($prodtosell = "ore") and ($mcic <= "-75") and ($amnt_sell >= 25000) and ($midhaggles < 1))
	setvar $forcefail 1
	setvar $thisorefailed 1
elseif (($prodtosell = "org") and ($mcic <= "-60") and ($amnt_sell >= 25000) and ($midhaggles < 2) and ($thisorefailed = 1))
	setvar $forcefail 1
	setvar $thisorgfailed 1
elseif (($prodtosell = "org") and ($mcic <= "-60") and ($amnt_sell >= 15000) and ($midhaggles < 1) and ($thisorefailed = 1))
	setvar $forcefail 1
	setvar $thisorgfailed 1
elseif (($prodtosell = "equ") and ($mcic <= "-55") and ($amnt_sell >= 20000) and ($midhaggles < 2) and (($thisorefailed = 1) or ($thisorgfailed = 1)))
	setvar $forcefail 1
	setvar $thisequfailed 1
elseif (($prodtosell = "equ") and ($mcic <= "-55") and ($amnt_sell >= 12000) and ($midhaggles < 1) and (($thisorefailed = 1) or ($thisorgfailed = 1)))
	setvar $forcefail 1
	setvar $thisequfailed 1
else
	setvar $forcefail 0
end
if ($forcefail = 0)
	getword currentline $new_offer 5
	striptext $new_offer ","
	setvar $offer_change $new_offer
	subtract $offer_change $offer
	if ($prodtosell = "ore")
		multiply $offer_change 30
	elseif ($prodtosell = "org")
		multiply $offer_change 27
	elseif ($prodtosell = "equ")
		multiply $offer_change 25
	end
	divide $offer_change 10
	subtract $counter $offer_change
	subtract $counter 10
	send $counter & "*"
	pause
else
	settexttrigger donewithport :donewithport "] (?=Help)"
	send $counter & " * * * * * n n q z n q z n "
	pause
end

:ni
setvar $ni 1
killtrigger donehag
goto :sellproduct

:pdone_haggle
killtrigger ni
if ($prodtosell = "ore")
	setvar $ore 1
	setvar $credperoreunit ($counter/$amnt_sell)
	setvar $oreamount $amnt_sell
	setvar $oreprice $counter
	setvar $fuelmcic $mcic
elseif ($prodtosell = "org")
	setvar $org 1
	setvar $credperorgunit ($counter/$amnt_sell)
	setvar $orgamount $amnt_sell
	setvar $orgprice $counter
	setvar $orgsmcic $mcic
elseif ($prodtosell = "equ")
	setvar $equ 1
	setvar $credperequunit ($counter/$amnt_sell)
	setvar $equamount $amnt_sell
	setvar $equprice $counter
	setvar $equipmcic $mcic
end
goto :sellproduct

:donewithport
killalltriggers
gettext currentline $sec "]:[" "] ("
setvar $switchboard~message "CAP Trade, sold units at " & $sec & ":*"
gosub :switchboard~switchboard
if ($ore = 1)
	send "   Ore : " $oreamount " units for " $oreprice ", (" $credperoreunit "ppu) (mcic: " $fuelmcic ")*"
	write $mcicfile $sec & " - Ore - " & $fuelmcic
end
if ($org = 1)
	send "   Orgs : " $orgamount " units for " $orgprice ", (" $credperorgunit "ppu) (mcic: " $orgsmcic ")*"
	write $mcicfile $sec & " - Orgs - " & $orgsmcic
end
if ($equ = 1)
	send "   Equip : " $equamount " units for " $equprice ", (" $credperequunit "ppu) (mcic: " $equipmcic ")*"
	write $mcicfile $sec & " - Equip - " & $equipmcic
end
send "*"
return

:fix_lockup
killtrigger donewithport
settexttrigger donewithport :donewithport "] (?=Help)"
send "*"
pause

:haggle
setvar $ni 0
setvar $midhag "-1"
setvar $nocred 0
killtrigger 1
killtrigger 0
killtrigger donehaggling
setstrigger donehag :done_haggle "Command [TL="
settexttrigger donehaggling :done_haggle "empty cargo holds."
settexttrigger offerme :offerme "Your offer"
pause

:offerme
getword currentline $offer 3
striptext $offer "["
striptext $offer "]"
striptext $offer ","
striptext $offer "?"
setvar $orig_offer $offer

:rehaggle
killtrigger 0
killtrigger 2
killtrigger 3
setvar $offer (($orig_offer * $multiplier) / 100)
send $offer "*"
add $midhag 1
waitfor $offer
if ($multiplier > 100)
	subtract $multiplier 1
else
	add $multiplier 1
end
setstrigger 0 :done_haggle "How many holds of"
settexttrigger 1 :rehaggle "Your offer"
settexttrigger 2 :donehag "We're not interested."
settexttrigger 3 :nocreds "You only have"
pause

:nocreds
setvar $nocred 1
send "0*0*"
goto :done_haggle

:donehag
setvar $ni 1

:done_haggle
killtrigger donehag
killtrigger 0
killtrigger 1
killtrigger 2
killtrigger 3
killtrigger rehaggle
killtrigger donehaggling
killtrigger offerme
return

:ppt
setvar $sec $port1
setvar $other $port2
setvar $stopper 0
gosub :quikstats
setvar $maxholds $holds
setvar $finholds $ore_holds
setvar $oinholds $organic_holds
setvar $einholds $equipment_holds
setvar $totalinholds ($finholds + $oinholds + $einholds)
if ($totalinholds = $maxholds)
	if (port.buyore[$sec] = 1)
		setvar $finholds 0
	end
	if (port.buyorg[$sec] = 1)
		setvar $oinholds 0
	end
	if (port.buyequip[$sec] = 1)
		setvar $einholds 0
	end
	setvar $totalinholds ($finholds + $oinholds + $einholds)
	if ($totalinholds = $maxholds)
		goto :nxtport
	end
end

:supg_ppt
killtrigger sell
killtrigger buy
killtrigger offport
send "pt"
waitfor "<Port>"
settexttrigger nomore :nomore "You don't have anything they want,"
settextlinetrigger fuel :fuelamt "Fuel Ore"
settextlinetrigger orgs :orgsamt "Organics"
settextlinetrigger equip :equipamt "Equipment"
settexttrigger moretrade :traders "You have"
pause

:nomore
killtrigger fuel
killtrigger orgs
killtrigger equip
killtrigger moretrade
return

:fuelamt
getword currentline $fuelamt 5
striptext $fuelamt "%"
pause

:orgsamt
getword currentline $orgamt 4
striptext $orgamt "%"
pause

:equipamt
getword currentline $equipamt 4
striptext $equipamt "%"
pause

:traders
killtrigger nomore
settexttrigger sellorbuy :sellorbuy "]?"
setstrigger offport :offport "Command [TL="
pause

:sellorbuy
gettext currentline $slloby "to " " ["
if ($slloby = "sell")
	goto :sell
else
	goto :buy
end

:sell
killtrigger offport
getword currentline $product 5
send "*"
setvar $multiplier (100 + $haggle)
gosub :haggle
if ($ni = 1)
	goto :supg_ppt
end
gosub :stopper
settexttrigger sellorbuy :sellorbuy "]?"
pause

:buy
killtrigger offport
killtrigger sellorbuy
getword currentline $product 5
if ($product = "Fuel")
	if ((port.buyequip[$sec] = 0) and (port.buyequip[$other] = 1)) or ((port.buyorg[$sec] = 0) and (port.buyorg[$other] = 1)) or (port.buyfuel[$other] = 0)
		send "0*"
		gosub :stopper
		goto :traders
	else
		gosub :buyit
	end
elseif ($product = "Organics")
	if ((port.buyequip[$sec] = 0) and (port.buyequip[$other] = 1)) or (port.buyorg[$other] = 0)
		send "0*"
		gosub :stopper
		goto :traders
	else
		gosub :buyit
	end
else
	if (port.buyequip[$other] = 0)
		send "0*"
	else
		gosub :buyit
	end
end
if ($ni = 1)
	goto :supg_ppt
end

:offport
killtrigger sellorbuy
gosub :stopper

:nxtport
if ($stopper = 0)
	setvar $other $sec
	if ($sec = $port1)
		setvar $sec $port2
	else
		setvar $sec $port1
	end
	send "m" $sec "**  "
	goto :supg_ppt
else
	killtrigger sell
	killtrigger buy
	return
end

:stopper
if ($product = "Fuel")
	if ($fuelamt <= $stopperc)
		if ((port.buyequip[$sec] = 0) and (port.buyequip[$other] = 1)) or ((port.buyequip[$sec] = 1) and (port.buyequip[$other] = 0)) or ((port.buyorg[$sec] = 0) and (port.buyorg[$other] = 1)) or ((port.buyorg[$sec] = 1) and (port.buyorg[$other] = 0))
			if ($fuelamt = 0)
				setvar $stopper 1
			else
				setvar $stopper 0
			end
		else
			setvar $stopper 1
		end
	end
elseif ($product = "Organics")
	if ($orgamt <= $stopperc)
		if ((port.buyequip[$sec] = 0) and (port.buyequip[$other] = 1)) or ((port.buyequip[$sec] = 1) and (port.buyequip[$other] = 0))
			if ($orgamt = 0)
				setvar $stopper 1
			else
				setvar $stopper 0
			end
		else
			setvar $stopper 1
		end
	end
elseif ($product = "Equipment")
	if ($equipamt <= $stopperc)
		setvar $stopper 1
	end
end
return

:buyit
send "*"
setvar $multiplier (100 - $haggle)
gosub :haggle
return

:done_read
killtrigger getline
setvar $hcount 0

:hcount
if ($hcount < 27)
	add $hcount 1
	setvar $lncount 1

	:lncount
	if ($lncount < $cnt)
		add $lncount 1
		getwordpos $line[$lncount] $pos $h[$hcount]
		if ($pos > 0)
			setvar $work $line[$lncount]
			cuttext $work $work $pos 9999
			uppercase $h[$hcount]
			getword $work $quikstats[$h[$hcount]] 2
			striptext $quikstats[$h[$hcount]] ","
		else
			goto :lncount
		end
	end
	goto :hcount
end
return

:express
send "m" $expressto "*"
setstrigger twarp :no_twarp "Do you want to engage the TransWarp drive?"
setstrigger express :express_warp "Engage the Autopilot?"
settexttrigger in_adj :there "Sector  : " & $expressto
setstrigger voided_sec :voided "Do you really want to warp there?"
settexttrigger insec :there "You are already in that sector!"
settexttrigger ig :igd "An Interdictor Generator in this sector holds you fast!"
settexttrigger ig2 :igd "<Re-Display>"
settexttrigger noturns :exp_noturns "You don't have enough turns left."
pause

:voided
killtrigger ig2
killtrigger noturns
killtrigger ig
killtrigger twarp
killtrigger express
killtrigger hitfig
killtrigger hitmine
killtrigger clear
killtrigger done
killtrigger continue
killtrigger in_adj
killtrigger insec
getword currentline $void 7
send "n"
setvar $expressto "-2"
return

:exp_noturns
killtrigger ig2
killtrigger noturns
killtrigger ig
killtrigger twarp
killtrigger express
killtrigger hitfig
killtrigger hitmine
killtrigger clear
killtrigger done
killtrigger continue
killtrigger in_adj
killtrigger insec
setvar $expressto "-3"
return

:no_twarp
killtrigger noturns
killtrigger ig
killtrigger in_adj
killtrigger express
killtrigger voided_sec
killtrigger ig2
send "n"

:express_warp
killtrigger noturns
killtrigger ig
killtrigger twarp
killtrigger in_adj
killtrigger voided_sec
killtrigger ig2
send "e"

:there
killtrigger ig2
killtrigger noturns
killtrigger ig
killtrigger voided_sec
killtrigger twarp
killtrigger express
killtrigger insec
gosub :clear_sector
return

:clear_sector
settexttrigger hitfig :hit_fig "Your fighters:"
setstrigger hitmine :hit_mine "Mined Sector: Do you wish to Avoid this sector in the future? (Y/N)"
settexttrigger clear :ready_state "Autopilot disengaging."
setstrigger done :ready_state "Command [TL="
if ($singlestep = 1)
	settexttrigger continue :ready_state "Stop in this sector"
else
	settexttrigger continue :keep_rollin "Stop in this sector"
end
settexttrigger ig :igd "An Interdictor Generator in this sector holds you fast!"
settexttrigger pause :pause "[Pause]"
settexttrigger noturns :exp_noturns "You don't have enough turns left."
pause

:pause
send "*"
settexttrigger pause :pause "[Pause]"
pause

:keep_rollin
send "n"
settexttrigger continue :keep_rollin "Stop in this sector"
pause

:hit_fig
send "a999989796954939291911*"
settexttrigger hitfig :hit_fig "Your fighters:"
pause

:hit_mine
send "n"
setstrigger hitmine :hit_mine "Mined Sector: Do you wish to Avoid this sector in the future? (Y/N)"
pause

:ready_state
killtrigger ig2
killtrigger noturns
killtrigger ig
killtrigger twarp
killtrigger express
killtrigger hitfig
killtrigger hitmine
killtrigger clear
killtrigger done
killtrigger continue
killtrigger in_adj
killtrigger insec
killtrigger pause
return

:igd
killtrigger ig2
killtrigger noturns
killtrigger ig
killtrigger twarp
killtrigger express
killtrigger hitfig
killtrigger hitmine
killtrigger clear
killtrigger done
killtrigger continue
killtrigger in_adj
killtrigger insec
killtrigger pause
setvar $expressto "-1"
return

:twarp
send "m" $twarpto "*"
setstrigger twarp :tw_twarp "Do you want to engage the TransWarp drive?"
settexttrigger notwarp :tw_notwarp "The shortest path ("
settexttrigger adjacent :tw_there "Sector  : " & $twarpto
settexttrigger ig :tw_ig "An Interdictor Generator in this sector holds you fast!"
settexttrigger nomove :tw_there "You are already in that sector!"
settexttrigger noturns :tw_noturns "You don't have enough turns left."
settexttrigger voided :tw_notwarp "No route within"
pause

:tw_twarp
killtrigger voided
killtrigger noturns
killtrigger nomove
killtrigger notwarp
killtrigger adjacent
killtrigger ig
send "y"
setstrigger gogo :tw_safe "All Systems Ready, shall we engage?"
settexttrigger outafuel :tw_outafuel "You do not have enough Fuel Ore to make the jump."
setstrigger nogo :tw_blind "Do you want to make this jump blind?"
pause

:tw_safe
send "y  "

:tw_there
killtrigger voided
killtrigger noturns
killtrigger nomove
killtrigger notwarp
killtrigger adjacent
killtrigger ig
killtrigger twarp
killtrigger gogo
killtrigger outafuel
killtrigger nogo
gosub :clear_sector
return

:tw_notwarp
killtrigger voided
killtrigger noturns
killtrigger nomove
killtrigger notwarp
killtrigger adjacent
killtrigger ig
killtrigger twarp
send "n"
setvar $twarpto "-1"
return

:tw_ig
killtrigger voided
killtrigger noturns
killtrigger nomove
killtrigger notwarp
killtrigger adjacent
killtrigger ig
killtrigger twarp
setvar $twarpto "-2"
return

:tw_noturns
killtrigger voided
killtrigger noturns
killtrigger nomove
killtrigger notwarp
killtrigger adjacent
killtrigger ig
killtrigger twarp
setvar $twarpto "-1"
return

:tw_outafuel
killtrigger voided
killtrigger noturns
killtrigger nomove
killtrigger gogo
killtrigger outafuel
killtrigger nogo
setvar $twarpto "-3"
return

:tw_blind
killtrigger voided
killtrigger noturns
killtrigger nomove
killtrigger gogo
killtrigger outafuel
killtrigger nogo
send "n"
setvar $twarpto "-4"
return

:xport
send "x  "
setstrigger choose :xp_choose "Choose which ship to"
settexttrigger noships :xp_noships "You do not own any other ships!"
pause

:xp_choose
killtrigger noships
send $xportto "*  q"
settexttrigger noturns :xp_noturns "You don't have any turns left!"
settexttrigger noship :xp_noship "That is not an available ship."
settexttrigger xport :xp_xport "Security code accepted,"
settexttrigger noceo :xp_noceo "Your retinal scan does not match"
settexttrigger range :xp_range "only has a transport range of"
settexttrigger comm :xp_commish "You are not commissioned by the"
settexttrigger exp :xp_experience "You need "
settexttrigger noships :xp_noship "You do not own any other ships!"
pause

:xp_noturns
killtrigger noturns
killtrigger noship
killtrigger noships
killtrigger xport
killtrigger noceo
killtrigger range
killtrigger comm
killtrigger exp
setvar $xportto "-1"
return

:xp_noship
killtrigger noships
killtrigger choose
killtrigger noship
killtrigger noturns
killtrigger noship
killtrigger xport
killtrigger noceo
killtrigger range
killtrigger comm
killtrigger exp
setvar $xportto "-2"
return

:xp_noceo
killtrigger noships
killtrigger noturns
killtrigger noship
killtrigger xport
killtrigger noceo
killtrigger range
killtrigger comm
killtrigger exp
setvar $xportto "-3"
return

:xp_noships
killtrigger noships
killtrigger choose
killtrigger noship
killtrigger noturns
killtrigger noship
killtrigger xport
killtrigger noceo
killtrigger range
killtrigger comm
killtrigger exp
setvar $xportto "-7"
return

:xp_range
killtrigger noships
killtrigger noturns
killtrigger noship
killtrigger xport
killtrigger noceo
killtrigger range
killtrigger comm
killtrigger exp
setvar $xportto "-4"
return

:xp_commish
killtrigger noturns
killtrigger noship
killtrigger xport
killtrigger noceo
killtrigger range
killtrigger comm
killtrigger exp
killtrigger noships
setvar $xportto "-5"
return

:xp_experience
killtrigger noships
killtrigger noturns
killtrigger noship
killtrigger xport
killtrigger noceo
killtrigger range
killtrigger comm
killtrigger exp
setvar $xportto "-6"
return

:xp_xport
killtrigger noships
killtrigger noturns
killtrigger noship
killtrigger xport
killtrigger noceo
killtrigger range
killtrigger comm
killtrigger exp
return

:ptorp
settexttrigger fired :pt_fired "Photon Wave Duration"
settexttrigger notadj :pt_notadj "That is not an adjacent sector"
settexttrigger ptordis :pt_disable "Photon Missiles are disabled."
settexttrigger nofire :pt_nofire "<Computer deactivated>"
settexttrigger fed :pt_fed "The Feds do not permit"
settexttrigger notorps :pt_notorps "You do not have any Photon Missiles!"
send "cpy  " $photonto "*q"
pause

:pt_fired
killtrigger notadj
killtrigger ptordis
killtrigger nofire
killtrigger fed
killtrigger notorps
return

:pt_notadj
killtrigger fired
killtrigger ptordis
killtrigger nofire
killtrigger fed
killtrigger notorps
setvar $photonto "-1"
send "q"
return

:pt_disable
killtrigger fired
killtrigger nofire
killtrigger fed
killtrigger notadj
killtrigger notorps
setvar $photonto "-2"
return

:pt_nofire
killtrigger fired
killtrigger fed
killtrigger notadj
killtrigger ptordis
killtrigger notorps
setvar $photonto "-3"
return

:pt_fed
killtrigger fired
killtrigger nofire
killtrigger notadj
killtrigger ptordis
killtrigger notorps
setvar $photonto "-4"
return

:pt_notorps
killtrigger fired
killtrigger nofire
killtrigger notadj
killtrigger ptordis
killtrigger fed
setvar $photonto "-5"
return

:setvoids
send "d"
waitfor "<Re-Display>"
settexttrigger cursec :void_cursec "] (?=Help)? :"
pause

:void_cursec
gettext currentline $cursec "]:[" "] (?=Help)? :"
setvar $setvoids 1
send "c"
while ($setvoids <= sector.warpcount[$cursec])
	send "v" sector.warps[$cursec][$setvoids] "*"
	add $setvoids 1
end
send "q"
return

:clearvoids
send "d"
waitfor "<Re-Display>"
settexttrigger cursec :clearvoid_cursec "] (?=Help)? :"
pause

:clearvoid_cursec
gettext currentline $cursec "]:[" "] (?=Help)? :"
setvar $setvoids 1
send "c"
while ($setvoids <= sector.warpcount[$cursec])
	echo " " $setvoids " "
	send "v0*yn" sector.warps[$cursec][$setvoids] "*"
	add $setvoids 1
end
send "q"
return

:ssm
setvar $noexp 0
setvar $sec $port1
gosub :quikstats
setvar $exp $experience
setvar $thold $total_holds

:steal
setvar $maxhold $exp
divide $maxhold $steal_factor
if ($maxhold > $thold)
	setvar $maxhold $thold
end

:sport
send "p  r  *  s  t  "
setstrigger fake :fbusted "Corporate command [TL="
settexttrigger good :cont "Which product?"
pause

:cont
killtrigger fake
settexttrigger success :success "Success!"
settexttrigger busted :busted "Suddenly you're Busted"
settexttrigger upgrade :upgrade "There aren't that many holds"
send "  3  " $maxhold "   *   "
pause

:upgrade
killtrigger success
killtrigger busted
setvar $upgrade (($maxhold / 10) + 1)
setvar $upg_amnt $upgrade
setvar $upg_prod 3
gosub :upgradeport
if ($upg_amnt = "-1")
	setvar $switchboard~message "SSM - Could not upgrade port, it's either maxed or I don't have enough money*"
	gosub :switchboard~switchboard
	goto :wait
end
goto :sport

:success
killtrigger busted
killtrigger upgrade
setvar $addexp $maxhold
multiply $addexp 90
if ($addexp < 1000)
	goto :norec
end
divide $addexp 1000
add $exp $addexp

:rhag
send "  p  t  *  "
setvar $multiplier (100 + $haggle)
if ($hag = 1) and ($multiplier <> 100)
	waitfor "How many holds of"
	setvar $ni 0
	gosub :haggle
	if ($ni = 1)
		goto :rhag
	end
else
	send "*"
end
if (port.buyfuel[$sec] = 0)
	send "  0*  "
end
if (port.buyorg[$sec] = 0)
	send "  0*  "
end
if ($sec = $port1)
	setvar $sec $port2
else
	setvar $sec $port1
end
send "   m   " $sec "*   z   a   9999   *   z   r   *   "
goto :steal

:fbusted
killtrigger good
send "   q   q   z   n   *   "

:busted
killtrigger success
killtrigger upgrade
setvar $busted $sec
return

:norec
echo "*Not enough experience*"
setvar $noexp 1
return

:haggle
setvar $ni 0
setvar $midhag "-1"
setvar $nocred 0
killtrigger 1
killtrigger 0
killtrigger donehaggling
setstrigger donehag :done_haggle "Command [TL="
settexttrigger donehaggling :done_haggle "empty cargo holds."
settexttrigger offerme :offerme "Your offer"
pause

:offerme
getword currentline $offer 3
striptext $offer "["
striptext $offer "]"
striptext $offer ","
striptext $offer "?"
setvar $orig_offer $offer

:rehaggle
killtrigger 0
killtrigger 2
killtrigger 3
setvar $offer (($orig_offer * $multiplier) / 100)
send $offer "*"
add $midhag 1
waitfor $offer
if ($multiplier > 100)
	subtract $multiplier 1
else
	add $multiplier 1
end
setstrigger 0 :done_haggle "How many holds of"
settexttrigger 1 :rehaggle "Your offer"
settexttrigger 2 :donehag "We're not interested."
settexttrigger 3 :nocreds "You only have"
pause

:nocreds
echo "No creds*"
setvar $nocred 1
send "   0*   0*   "
goto :done_haggle

:donehag
echo "Done hag*"
setvar $ni 1

:done_haggle
killtrigger donehag
killtrigger 0
killtrigger 1
killtrigger 2
killtrigger 3
killtrigger rehaggle
killtrigger donehaggling
killtrigger offerme
return

:upgradeport
send "   o   " $upg_prod
settexttrigger maxupg :maxupg "to quit)"
pause

:maxupg
getword currentline $upg_maxupg 9
striptext $upg_maxupg "("
if ($upg_maxupg < $upg_amnt)
	setvar $upg_amnt "-1"
else
	send $upg_amnt "  *  q  "
end
return

#=================================QUIKSTATS================================================
:quikstats
setvar $current_prompt 		"Undefined"
killtrigger noprompt
killtrigger prompt
killtrigger prompt1
killtrigger prompt2
killtrigger prompt3
killtrigger prompt4
killtrigger statlinetrig
killtrigger getline2
settextlinetrigger 	prompt		:allprompts	 	#145 & #8
settextlinetrigger 	statlinetrig 	:statstart 		#179
send #145&"/"
pause

:allprompts
getword currentline $current_prompt 1
striptext $current_prompt #145
striptext $current_prompt #8
settextlinetrigger 	prompt		:allprompts	 	#145 & #8
pause

:statstart
killtrigger prompt
killtrigger prompt2
killtrigger prompt3
killtrigger prompt4
killtrigger noprompt
setvar $stats ""
setvar $wordy ""

:statsline
killtrigger statlinetrig
killtrigger getline2
setvar $line2 currentline
replacetext $line2 #179 " "
striptext $line2 ","
setvar $stats $stats & $line2
getwordpos $line2 $pos "Ship"
if ($pos > 0)
	goto :gotstats
else
	settextlinetrigger getline2 :statsline
	pause
end

:gotstats
setvar $stats $stats & " @@@"

setvar $current_word 0
while ($wordy <> "@@@")
	if ($wordy = "Sect")
		getword $stats $current_sector   	($current_word + 1)
	elseif ($wordy = "Turns")
		getword $stats $turns  			($current_word + 1)
	elseif ($wordy = "Creds")
		getword $stats $credits  		($current_word + 1)
	elseif ($wordy = "Figs")
		getword $stats $fighters   		($current_word + 1)
	elseif ($wordy = "Shlds")
		getword $stats $shields  		($current_word + 1)
	elseif ($wordy = "Hlds")
		getword $stats $total_holds   		($current_word + 1)
	elseif ($wordy = "Ore")
		getword $stats $ore_holds    		($current_word + 1)
	elseif ($wordy = "Org")
		getword $stats $organic_holds    	($current_word + 1)
	elseif ($wordy = "Equ")
		getword $stats $equipment_holds    	($current_word + 1)
	elseif ($wordy = "Col")
		getword $stats $colonist_holds    	($current_word + 1)
	elseif ($wordy = "Phot")
		getword $stats $photons   		($current_word + 1)
	elseif ($wordy = "Armd")
		getword $stats $armids   		($current_word + 1)
	elseif ($wordy = "Lmpt")
		getword $stats $limpets   		($current_word + 1)
	elseif ($wordy = "GTorp")
		getword $stats $genesis  		($current_word + 1)
	elseif ($wordy = "TWarp")
		getword $stats $twarp_type  		($current_word + 1)
	elseif ($wordy = "Clks")
		getword $stats $cloaks   		($current_word + 1)
	elseif ($wordy = "Beacns")
		getword $stats $beacons 		($current_word + 1)
	elseif ($wordy = "AtmDt")
		getword $stats $atomic  		($current_word + 1)
	elseif ($wordy = "Corbo")
		getword $stats $corbo   		($current_word + 1)
	elseif ($wordy = "EPrb")
		getword $stats $eprobes   		($current_word + 1)
	elseif ($wordy = "MDis")
		getword $stats $mine_disruptors   	($current_word + 1)
	elseif ($wordy = "PsPrb")
		getword $stats $psychic_probe  		($current_word + 1)
	elseif ($wordy = "PlScn")
		getword $stats $planet_scanner  	($current_word + 1)
	elseif ($wordy = "LRS")
		getword $stats $scan_type    		($current_word + 1)
	elseif ($wordy = "Aln")
		getword $stats $alignment    		($current_word + 1)
	elseif ($wordy = "Exp")
		getword $stats $experience    		($current_word + 1)
	elseif ($wordy = "Corp")
		getword $stats $corp   			($current_word + 1)
	elseif ($wordy = "Ship")
		getword $stats $ship_number   		($current_word + 1)
	end
	add $current_word 1
	getword $stats $wordy $current_word
end

:donequikstats
killtrigger prompt1
killtrigger prompt2
killtrigger prompt3
killtrigger prompt4
killtrigger statlinetrig
killtrigger getline2

return
# ============================== END QUICKSTATS SUB==============================
:upgradeport
send "o" $upg_prod
settexttrigger maxupg :maxupg "to quit)"
pause

:maxupg
getword currentline $upg_maxupg 9
striptext $upg_maxupg "("

if ($upg_maxupg < $upg_amnt)
	setvar $upg_amnt "-1"
else
	send $upg_amnt "*q"
end
return

:chkclass
if ($classchk = 0)
	setvar $class "Class 0"
elseif ($classchk = 1)
	setvar $class "BBS"
elseif ($classchk = 2)
	setvar $class "BSB"
elseif ($classchk = 3)
	setvar $class "SBB"
elseif ($classchk = 4)
	setvar $class "SSB"
elseif ($classchk = 5)
	setvar $class "SBS"
elseif ($classchk = 6)
	setvar $class "BSS"
elseif ($classchk = 7)
	setvar $class "SSS"
elseif ($classchk = 8)
	setvar $class "BBB"
elseif ($classchk = 9)
	setvar $class "StarDock"
else
	setvar $class "Unknown"
end
return

:update_cim
send "^r"

:cim_trig
settextlinetrigger next :next
pause

:next
setvar $info currentline
getword $info $end_test 1
if ($end_test = "0")
	goto :done
end
goto :cim_trig

:done
send "Q"
return

:cn
settextlinetrigger cn1 :cn1 "(1) ANSI graphics"
settextlinetrigger cn2 :cn2 "(2) Animation display"
settextlinetrigger cn3 :cn3 "(3) Page on messages"
settextlinetrigger cn4 :cn4 "(4) Sub-space radio channel"
settextlinetrigger cn5 :cn5 "(5) Federation comm-link"
settextlinetrigger cn6 :cn6 "(6) Receive private hails"
settextlinetrigger cn7 :cn7 "(7) Silence ALL messages"
settextlinetrigger cn9 :cn9 "(9) Abort display on keys"
settextlinetrigger cna :cna "(A) Message Display Mode"
settextlinetrigger cnb :cnb "(B) Screen Pauses"
settextlinetrigger cnc :cnc "(C) Online Auto Flee"
send "cn"
pause

:cn1
getword currentline $set1 5
pause

:cn2
getword currentline $set2 5
pause

:cn3
getword currentline $set3 6
pause

:cn4
getword currentline $set4 6
pause

:cn5
getword currentline $set5 5
pause

:cn6
getword currentline $set6 6
pause

:cn7
getword currentline $set7 6
pause

:cn9
getword currentline $set9 7
pause

:cna
getword currentline $seta 6
pause

:cnb
getword currentline $setb 5
pause

:cnc
getword currentline $setc 6
if ($cn1 <> 0)
	if ($set1 <> $cn1)
		setvar $cn1change 1
		send "1"
	end
end
if ($cn2 <> 0)
	if ($set2 <> $cn2)
		setvar $cn2change 1
		send "2"
	end
end
if ($cn3 <> 0)
	if ($set3 <> $cn3)
		setvar $cn3change 1
		send "3"
	end
end
if ($cn4 <> 0)
	if ($set4 <> $cn4)
		setvar $cn4change 1
		send "4" $cn4 "*"
	end
end
if ($cn5 <> 0)
	if ($set5 <> $cn5)
		setvar $cn5change 1
		send "5"
	end
end
if ($cn6 <> 0)
	if ($set6 <> $cn6)
		setvar $cn6change 1
		send "6"
	end
end
if ($cn7 <> 0)
	if ($set7 <> $cn7)
		setvar $cn7change 1
		send "7"
	end
end
if ($cn9 <> 0)
	setvar $cn9change 0
	if ($set9 <> $cn9)
		setvar $cn9change 1
		send "9"
	end
end
if ($cna <> 0)
	if ($seta <> $cna)
		setvar $cnachange 1
		send "a"
	end
end
if ($cnb <> 0)
	if ($setb <> $cnb)
		setvar $cnbchange 1
		send "b"
	end
end
if ($cnc <> 0)
	if ($setc <> $cnc)
		setvar $cncchange 1
		send "c"
	end
end
send "qq"
return
include "source\include\switchboard.ts"
include "source\include\help"
