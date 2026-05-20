loadVar $bot_name
loadVar $user_command_line
loadVar $bot_turn_limit
loadVar $steal_factor
loadVar $rob_factor
loadVar $unlimitedGame
loadVar $PTRADESETTING
loadvar $bot~folder
setVar $CURRENT_PROMPT 		"Undefined"
setVar $PSYCHIC_PROBE 		"No"
setVar $PLANET_SCANNER 		"No"
setVar $SCAN_TYPE 		"None"
setVar $CURRENT_SECTOR 		0
setVar $TURNS 			0
setVar $CREDITS 		0
setVar $FIGHTERS 		0
setVar $SHIELDS 		0
setVar $TOTAL_HOLDS 		0
setVar $ORE_HOLDS 		0
setVar $ORGANIC_HOLDS 		0
setVar $EQUIPMENT_HOLDS 	0
setVar $COLONIST_HOLDS		0
setVar $PHOTONS 		0
setVar $ARMIDS 			0
setVar $LIMPETS 		0
setVar $GENESIS 		0
setVar $TWARP_TYPE 		0
setVar $CLOAKS 			0
setVar $BEACONS 		0
setVar $ATOMIC 			0
setVar $CORBO 			0
setVar $EPROBES 		0
setVar $MINE_DISRUPTORS 	0
setVar $ALIGNMENT 		0
setVar $EXPERIENCE		0
setVar $CORP 			0
setVar $SHIP_NUMBER		0
setVar $TURNS_PER_WARP 		0
systemscript
reqrecording
setVar $file $bot~folder&"/_MOM_" & GAMENAME & "_QUIK.txt"
setVar $bustfile $bot~folder&"/_MOM_" & GAMENAME & "_BUST.txt"
setVar $mcicfile $bot~folder&"/"&GAMENAME & "_MCIC.txt"
fileExists $chk $file
IF ($chk = 1)
	gosub :readFile
	gosub :save
	delete $file
END
loadVar $quikSaved
IF ($quikSaved)
	loadVar $quik_ahaggle
	loadVar $quik_hfactor
	loadVar $quik_sfactor
	loadVar $quik_rfactor
	loadVar $quik_figkill
	loadVar $quik_pptstop
	loadVar $quik_bwarn
	loadVar $quik_bwarp
	loadVar $quik_asteal
	loadVar $quik_arob
	loadVar $quik_lsteal
	loadVar $quik_lbust
	loadVar $quik_showSSM
	loadVar $quik_showOre
	loadVar $quik_showOrg
	loadVAr $quik_showEqu
ELSE
	setVar $quik_ahaggle "Off"
	setVar $quik_hfactor 5
	setVar $quik_sfactor 21
	setVar $quik_rfactor 6
	setVar $quik_pptstop 25
	setVar $quik_figkill "Off"
	setVar $quik_bwarn "Off"
	setVar $quik_bwarp "Off"
	setVar $quik_asteal "Off"
	setVar $quik_arob "Off"
	setVar $quik_lsteal 0
	setVar $quik_lbust 0
	setVar $quik_showSSM "Yes"
	setVar $quik_showOre "Yes"
	setVAr $quik_showOrg "Yes"
	setVar $quik_showEqu "Yes"
END
setVar $ahaggle $quik_ahaggle
setVar $hfactor $quik_hfactor
setVar $sfactor $quik_sfactor
setVar $rfactor $quik_rfactor
setVar $figkill $quik_figkill
setVar $bwarn $quik_bwarn
setVar $bwarp $quik_bwarp
setVar $asteal $quik_asteal
setVar $arob $quik_arob
setVar $lsteal $quik_lsteal
setVar $lbust $quik_lbust
gosub :save
IF ($bwarn = "On")
	fileExists $chk $bustfile
	IF ($chk = 1)
	:abust
	echo ansi_15 "**Would You like to clear your busts?**"
	getConsoleInput $clear singlekey
	IF ($clear = "y") or ($clear = "Y")
		delete $bustfile
	ELSEIF ($clear = "n") or ($clear = "N")
		setArray $busts SECTORS
		setVar $read 1
	:rbust
	read $bustfile $bustsec $read
	IF ($bustsec <> "EOF")
		setVar $busts[$bustsec] 1
		add $read 1
		goto :rbust
	END
	ELSE
	goto :abust
	END
	END
END

:setmenu
echo "[2J"
setVar $scriptName "SupGQuikPanel"

:menu
gosub :signature
echo ANSI_15 "Settings for " GAMENAME "*"
echo ANSI_14 "1." ANSI_15 " Haggle Factor         " ANSI_10 "["
echo ANSI_6 $hfactor
echo ANSI_10 "]*"
echo ANSI_14 "2." ANSI_15 " Bust Warning          " ANSI_10 "["
echo ANSI_6 $bwarn
echo ANSI_10 "]*"
echo ANSI_14 "3." ANSI_15 " PPT Stop Percentage   " ANSI_10 "["
echo ANSI_6 $quik_pptstop
echo ANSI_10 "]*"
echo ANSI_14 "D." ANSI_15 " Display Options*"
echo ANSI_5 "*Press the number of the option you*wish to change, or press" ANSI_14 " C" ANSI_5 " to continue.**"
getConsoleInput $choice singlekey
lowercase $choice
IF ($choice = 1)
	getInput $hfactor "Enter Haggle Factor (Setting to 0 will turn Haggle Off)"
	isNumber $chk $hfactor
	if ($hfactor = 0)
	       setVar $ahaggle "Off"
	end
IF ($chk = 0)
		setVar $hfactor 5
	END
ELSEIF ($choice = 2)
	IF ($bwarn = "Off")
		setVar $bwarn "On"
		fileExists $chk $bustfile
		IF ($chk = 1)
		:askbust
		echo ansi_15 "*Would You like to clear your busts?*"
		getConsoleInput $clear singlekey
		IF ($clear = "y") or ($clear = "Y")
			delete $bustfile
		ELSEIF ($clear = "n") or ($clear = "N")
			setArray $busts SECTORS
			setVar $read 1
			:readbust
			read $bustfile $bustsec $read
			IF ($bustsec <> "EOF")
				setVar $busts[$bustsec] 1
				add $read 1
				goto :readbust
			END
			ELSE
			goto :askbust
			END
		END
	ELSE
		setVar $bwarn "Off"
	END
ELSEIF ($choice = 3)
	getInput $quik_pptstop "PPT stop percentage"
	isNumber $chk $quik_pptstop
	IF ($chk = 0) OR ($quik_pptstop < 0) OR ($quik_pptstop > 100)
		setVar $quik_pptstop 25
	END
ELSEIF ($choice = "d")
	gosub :displayOptions
ELSEIF ($choice = "c")
	gosub :save
	goto :wait
ELSE
	goto :setmenu
END
goto :setmenu

:wait
killalltriggers
setTextTrigger autooff :autooff "SUPGSCRIPT_AUTO_OFF"
setTextTrigger bwarpoff :bwarpoff "SUPGSCRIPT_BWARP_OFF"
setTextTrigger figkilloff :killoff "SUPGSCRIPT_KILL_OFF"
IF ($ahaggle = "On")
    SetTextTrigger ptrade :bunits "do you want to buy"
    SetTextTrigger strade :sunits "do you want to sell"
    setTextTrigger planettrade :plnttrade "<Negotiate Planetary TradeAgreement>"
END
IF ($asteal = "On")
    setTextTrigger steal :steals "to swipe? ["
END
IF ($arob = "On")
    setTextLineTrigger rob :rob "has in excess of"
END
IF ($figkill = "On")
	setTextTrigger moving :moving "You have to destroy the fighters"
	setTextTrigger mines :moving "<Re-Display>"
	setTextTrigger citmine :moving "<Scan Sector>"
END
IF ($bwarp = "On")
	setTextTrigger bwarp :bwarp "Do you want to make this jump blind?"
	setTextTrigger bbwar :bwarp "Do you want to make this transport blind?"
END
setTextTrigger busted :busted "Suddenly you're Busted"
setTextTrigger nobust :ssteal "Success!"
setTextTrigger chkbust :chkbust "] (?=Help)?"
setTextTrigger info :get_info "<Info>"
setTextOutTrigger sets :optmenu "~"
pause

:get_info
killalltriggers
setTextLineTrigger alnexp :alnexp "Rank "
setTextTrigger gotinf :wait "(?=Help)?"
pause

:alnexp
getText CURRENTLINE $knownexp ": " " points,"
stripText $knownexp ","
getWord CURRENTLINE $knownalign 7
stripText $knownalign "Alignment="
stripText $knownalign ","
pause

:plnttrade
killalltriggers
gosub :planet_neg
goto :wait

:bunits
setVar $multiplier (100 - $hfactor)
goto :units

:sunits
setVar $multiplier (100 + $hfactor)

:units
killtrigger ptrade
killtrigger strade
killtrigger go
killtrigger done
SetTextTrigger ptrade :bunits "do you want to buy ["
SetTextTrigger strade :sunits "do you want to sell ["
setTextLineTrigger go :finishhaggle "Agreed, "
setTextLineTrigger done :donehaggle "empty cargo holds."
pause

:finishhaggle
killtrigger done
gosub :haggle

:donehaggle
goto :wait

:moving
setVar $singlestep 1
gosub :clear_sector
goto :wait

:steals
getText CURRENTLINE $maxholds "[" "]"
setVar $stealholds ($knownExp / $steal_factor)
IF ($stealholds > $maxholds)
   send $maxholds "*"
ELSE
   send $stealholds "*"
END
pause

:rob
getWord CURRENTLINE $cop 11
stripText $cop ","
IF ($cop = 0)
    send "*"
ELSE
	setVar $robamount ($knownExp * $rob_factor)
	IF ($robamount > $cop)
		setVar $cop (($cop * 110) / 100)
		send $cop "*"
	ELSE
		send $robamount "*"
	END
END
pause

:chkbust
getText CURRENTLINE $cursec "]:[" "] ("
IF ($bwarn = "On")
	IF ($lbust = $cursec)
		echo ANSI_5 "[" ANSI_12 "LAST BUST" ANSI_5 "] : "
	ELSEIF ($busts[$cursec] = 1)
		echo ANSI_5 "[" ANSI_12 "BUSTED" ANSI_5 "] : "
	ELSEIF ($lsteal = $cursec)
		echo ANSI_5 "[" ANSI_14 "LAST STEAL" ANSI_5 "] : "
	END
END
goto :wait

:busted
waitFor "(?=Help)? :"
getText CURRENTLINE $cursec "]:[" "] ("
setVar $busts[$cursec] 1
write $bustfile $cursec
setVar $lbust $cursec
gosub :save
IF ($bwarn = "On")
   echo ANSI_5 "[" ANSI_12 "LAST BUST" ANSI_5 "] : "
END
goto :wait

:ssteal
waitFor "(?=Help)? :"
getText CURRENTLINE $cursec "]:[" "] ("
setVar $lsteal $cursec
gosub :save
IF ($bwarn = "On")
   echo ANSI_5 "[" ANSI_14 "LAST STEAL" ANSI_5 "] : "
END
goto :wait

:bwarp
send "n"
goto :wait

:optmenu
cutText CURRENTLINE $location 1 7
IF ($location = "Command") OR ($location = "Citadel") OR ($location = "Compute") OR ($location = "Corpora") OR ($location = "<StarDo") OR ($location = "Planet ") OR ($location = "Engage ") OR ($location = "Option?") OR ($location = "<Tavern")
	gosub :quikstats
	setVar $cursec $CURRENT_SECTOR
	setVar $align $ALIGNMENT
ELSE
	setVar $align $knownalign
END

:alnmenu
echo "[2J"
setVar $scriptName "SupGQuikPanel"
gosub :signature
echo ANSI_15 "*Option Menu *"
IF (PORT.CLASS[$cursec] <> "-1")
	setVar $round 0
	setVar $menuitem 0
	:round
	IF ($round < SECTOR.WARPCOUNT[$cursec])
		add $round 1
		setVar $adjsec SECTOR.WARPS[$cursec][$round]
		IF (PORT.CLASS[$adjsec] = "-1")
			goto :round
		END
		IF ((PORT.BUYEQUIP[$cursec] = 1) AND (PORT.BUYEQUIP[$adjsec] = 0) AND ($quik_showEqu = "Yes")) OR ((PORT.BUYORG[$cursec] = 0) AND (PORT.BUYORG[$adjsec] = 1) AND ($quik_showOrg = "Yes")) OR ((PORT.BUYEQUIP[$cursec] = 0) AND (PORT.BUYEQUIP[$adjsec] = 1) AND ($quik_showEqu = "Yes")) OR ((PORT.BUYORG[$cursec] = 1) AND (PORT.BUYORG[$adjsec] = 0) AND ($quik_showOrg = "Yes")) OR ((PORT.BUYFUEL[$cursec] = 1) AND (PORT.BUYFUEL[$adjsec] = 0) AND ($quik_showOre = "Yes")) OR ((PORT.BUYFUEL[$cursec] = 0) AND (PORT.BUYFUEL[$adjsec] = 1) AND ($quik_showOre = "Yes"))
			IF (PORT.CLASS[$cursec] <> 9) AND (PORT.CLASS[$adjsec] <> 9) AND (PORT.CLASS[$cursec] <> 0) AND (PORT.CLASS[$adjsec] <> 0) AND ($location = "Command")
				add $menuitem 1
				setVar $classchk PORT.CLASS[$cursec]
				gosub :chkclass
        				setVar $class1 $class
				setVar $classchk PORT.CLASS[$adjsec]
				gosub :chkclass
				setVar $class2 $class
				setVar $makemenu[$menuitem] "PPT " & $cursec & " " & $adjsec
				echo ANSI_14 $menuitem ". " ANSI_15 "PPT - " $cursec & " (" & $class1 & ")"
				IF ($busts[$cursec] = 1)
					echo ANSI_15 " (" ANSI_12 "Busted" ANSI_15 ") "
				END
				IF ($lbust = $cursec)
					echo ANSI_15 " (" ANSI_12 "Last Bust" ANSI_15 ") "
				END
				IF ($lsteal = $cursec)
					echo ANSI_15 " (" ANSI_14 "Last Steal" ANSI_15 ") "
				END
				echo "and " $adjsec  & " (" & $class2 & ")"
				IF ($busts[$adjsec] = 1)
					echo ANSI_15 " (" ANSI_12 "Busted" ANSI_15 ") "
				END
				IF ($lbust = $adjsec)
					echo ANSI_15 " (" ANSI_12 "Last Bust" ANSI_15 ") "
				END
				IF ($lsteal = $adjsec)
					echo ANSI_15 " (" ANSI_14 "Last Steal" ANSI_15 ") "
				END
				echo "*"
			END
		END
		IF (PORT.BUYEQUIP[$cursec] = 1) AND (PORT.BUYEQUIP[$adjsec] = 1) AND ($align < "-100") AND ($quik_showSSM = "Yes") AND ($location = "Command")
			add $menuitem 1
			setVar $makemenu[$menuitem] "SSM " & $cursec & " " & $adjsec
       			echo ANSI_14 $menuitem ". " ANSI_15 "SSM - " $cursec
			IF ($busts[$cursec] = 1)
				echo ANSI_15 " (" ANSI_12 "Busted" ANSI_15 ") "
        			END
			IF ($lbust = $cursec)
				echo ANSI_15 " (" ANSI_12 "Last Bust" ANSI_15 ") "
			END
			IF ($lsteal = $cursec)
				echo ANSI_15 " (" ANSI_14 "Last Steal" ANSI_15 ") "
			END
			echo " and " $adjsec
			IF ($busts[$adjsec] = 1)
				echo ANSI_15 " (" ANSI_12 "Busted" ANSI_15 ") "
			END
			IF ($lbust = $adjsec)
				echo ANSI_15 " (" ANSI_12 "Last Bust" ANSI_15 " )"
			END
			IF ($lsteal = $adjsec)
				echo ANSI_15 " (" ANSI_14 "Last Steal" ANSI_15 ") "
			END
			echo "*"
		END
		goto :round
	END
END
echo ANSI_14 "S. " ANSI_15 "Settings*"
echo ANSI_14 "Q. " ANSI_15 "Close Menu*"
IF ($menuitem < 10)
	getConsoleInput $optchoice singlekey
ELSE
	getConsoleInput $optchoice
END
lowercase $optchoice
isNumber $num $optchoice
IF ($optchoice = "s")
	goto :setmenu
ELSEIF ($optchoice = "q")
	goto :wait
ELSEIF ($num = 1)
	IF ($optchoice <= $menuitem) AND ($optchoice > 0)
		getWord $makemenu[$optchoice] $sub 1
       		getWord $makemenu[$optchoice] $port1 2
		getWord $makemenu[$optchoice] $port2 3
	ELSE
		goto :alnmenu
	END
	IF ($sub = "PPT")
		killalltriggers
		setVar $port1 $port1
		setVar $port2 $port2
		setVar $haggle $hfactor
		setVAr $stopperc $quik_pptstop
		setTextOutTrigger abort :return "~"
		gosub :ppt
	ELSEIF ($sub = "SSM")
		killalltriggers
		send "jy"
		setVar $port1 $port1
		setVar $port2 $port2
		setVar $haggle $hfactor
		setVar $hag 1
		setTextOutTrigger abort :return "~"
		gosub :ssm
		killtrigger abort
		setVar $busts[$busted] 1
		write $bustfile $busted
		setVar $lbust $busted
		IF ($port1 = $busted)
			setVar $lsteal $port2
		ELSE
			setVar $lsteal $port1
		END
		gosub :save
	END
	goto :wait
ELSE
	goto :alnmenu
END

:return
Echo ANSI_15 "*Returning to Normal Operation*"
goto :wait

:save
setVar $quik_ahaggle $ahaggle
setVar $quik_hfactor $hfactor
setVar $quik_sfactor $steal_factor
setVar $quik_rfactor $rob_factor
setVar $quik_figkill $figkill
setVar $quik_bwarn $bwarn
setVar $quik_bwarp $bwarp
setVar $quik_asteal $asteal
setVar $quik_arob $arob
setVar $quik_lsteal $lsteal
setVar $quik_lbust $lbust
saveVar $quik_ahaggle
saveVar $quik_pptstop
saveVar $quik_hfactor
saveVar $quik_sfactor
saveVar $quik_rfactor
saveVar $quik_figkill
saveVar $quik_bwarn
saveVar $quik_bwarp
saveVar $quik_asteal
saveVar $quik_arob
saveVar $quik_lsteal
saveVar $quik_lbust
saveVar $quik_showSSM
saveVar $quik_showOre
saveVar $quik_showOrg
saveVar $quik_showEqu
setVar $quikSaved 1
saveVar $quikSaved
return

:readFile
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
IF ($ahaggle = "On") OR ($asteal = "On") OR ($arob = "On")
   clientMessage "(SupGQuikPanel) - SupGCashing script started, turning off auto haggle, rob, steal."
   setVar $ahaggle "Off"
   setVar $asteal "Off"
   setVar $arob "Off"
END
goto :wait

:bwarpoff
IF ($bwarp = "On")
   clientMessage "(SupGQuikPanel) - SupGMove/Colo script started, turning off blind warp protection."
   setVar $bwarp "Off"
END
goto :wait

:killoff
IF ($figkill = "On")
   clientMessage "(SupGQuikPanel) - SupGClearing script started, turning off auto fighter killing."
   setVar $figkill "Off"
END
goto :wait

:displayOptions

:setdisplaymenu
echo "[2J"
setVar $scriptName "SupGQuikPanel"

:displaymenu
gosub :signature
echo ANSI_15 "Display Options*"
echo ANSI_14 "1." ANSI_15 " Display SSM Pairs      " ANSI_10 "["
echo ANSI_6 $quik_showSSM
echo ANSI_10 "]*"
echo ANSI_14 "2." ANSI_15 " Display Fuel Pairs     " ANSI_10 "["
echo ANSI_6 $quik_showOre
echo ANSI_10 "]*"
echo ANSI_14 "3." ANSI_15 " Display Organics Pairs " ANSI_10 "["
echo ANSI_6 $quik_showOrg
echo ANSI_10 "]*"
echo ANSI_14 "4." ANSI_15 " Display Equipment Pairs" ANSI_10 "["
echo ANSI_6 $quik_showEqu
echo ANSI_10 "]*"
echo ANSI_14 "D." ANSI_15 " Done"
echo ANSI_5 "*Press the number of the option you*wish to change, or press" ANSI_14 " D" ANSI_5 " when you are done.**"
getConsoleInput $displaychoice singlekey
lowercase $displaychoice
IF ($displaychoice = 1)
   IF ($quik_showSSM = "No")
        setVar $quik_showSSM "Yes"
   ELSE
        setVar $quik_showSSM "No"
   END
ELSEIF ($displaychoice = 2)
   IF ($quik_showOre = "No")
        setVar $quik_showore "Yes"
   ELSE
        setVar $quik_showore "No"
   END
ELSEIF ($displaychoice = 3)
   IF ($quik_showorg = "No")
        setVar $quik_showorg "Yes"
   ELSE
        setVar $quik_showorg "No"
   END
ELSEIF ($displaychoice = 4)
   IF ($quik_showequ = "No")
        setVar $quik_showequ "Yes"
   	       ELSE
        setVar $quik_showequ "No"
   END
ELSEIF ($displaychoice = "d")
return
ELSE
   goto :setdisplaymenu
END
goto :setdisplaymenu

:signature
echo ANSI_6 "**-" ansi_5 "=" ansi_6 "-" ansi_5 "=" ansi_10 "("
setVar $text $scriptName
gosub :addspc
setVar $scriptName $text
echo ansi_15 $scriptName ansi_10 ")" ANSI_5 "=" ansi_6 "-" ansi_5 "=" ansi_6 "-*"
gosub :addspc
return

:addspc
getLength $text $len
IF ($len < $max)
   setVar $spaces ($max - $len)
   IF ($spaces = 1)
        setVar $text " " & $text
   ELSE
        setVar $spaces ($spaces / 2)
        setVar $cnt 0

        :addfront
       IF ($cnt < $spaces)
           add $cnt 1
           setVar $text " " & $text
           goto :addfront
       END
        setVar $cnt 0

        :addback
       IF ($cnt < $spaces)
           add $cnt 1
           setVar $text $text & " "
           goto :addback
       END
        getLength $text $len
        IF ($len < $max)
       setVar $text " " & $text
        END
   END
END
return

:checkMax
IF ($len > $max)
   setVar $max $len
END
return

:planet_neg
setVar $ni 0
setVar $ore 0
setVar $org 0
setVar $equ 0
setVar $oreMCIC "-90"
setVar $orgMCIC "-75"
setVar $equMCIC "-65"
IF ($sdt = 1) or ($selloff = 1)
   send "PN"
   waitFor "<Negotiate Planetary TradeAgreement>"
END
setTextLineTrigger orepct :orepct "Fuel Ore   Buying"
setTextLineTrigger orgpct :orgpct "Organics   Buying"
setTextLineTrigger equpct :equpct "Equipment  Buying"
setTextTrigger gotpercts :gotpercts "Registry# and Planet Name"
setTextTrigger noplninf :noplninf "Negotiate agreement"
pause

:noplninf
killtrigger orepct
killtrigger orgpct
killtrigger equpct
killtrigger gotpercts
killtrigger noplninf
echo ANSI_15 "Could not obtain port information, unable to use Advanced Planet Trading."
return

:orepct
killtrigger noplninf
getWord CURRENTLINE $oretrading 4
getWord CURRENTLINE $orepercent 5
striptext $orepercent "%"
IF ($orepercent < 100)
   add $orepercent 1
END
pause

:orgpct
killtrigger noplninf
getWord CURRENTLINE $orgtrading 3
getWord CURRENTLINE $orgpercent 4
striptext $orgpercent "%"
IF ($orgpercent < 100)
   add $orgpercent 1
END
pause

:equpct
killtrigger noplninf
getWord CURRENTLINE $equtrading 3
getWord CURRENTLINE $equpercent 4
striptext $equpercent "%"
IF ($equpercent < 100)
   add $equpercent 1
END
pause

:gotpercts
killtrigger orepct
killtrigger orgpct
killtrigger equpct
IF ($sdt =1)
   IF ($pnum = "Auto") OR ($pnum = 0)

         :sdt_pnum
         waitfor "-----------------"
         setTextLineTrigger num :num "<"
         pause

         :num
         getText CURRENTLINE $pnum "<" ">"
         stripText $pnum " "
         send $pnum "*"
   ELSE
         send $pnum "*"
   END
END
IF ($selloff = 1)
   send $pnum "*"
END

:sellproduct
echo "*Sell product*"
setTextTrigger sellfuel :sellfuel "How many units of Fuel Ore"
setTextTrigger sellorg :sellorg "How many units of Organics"
setTextTrigger sellequ :sellequ "How many units of Equipment"
setTextLineTrigger selling :amnt_selling "Agreed, "
setTextTrigger donewithport :donewithport "] (?=Help)"
pause

:sellfuel
killtrigger ni
setVar $prodtosell "ore"
IF ($sdt = 1) or ($selloff = 1)
   send "0*"
END
pause

:sellorg 
killtrigger ni
setVar $prodtosell "org"
IF ($sdt = 1)
   send "0*"
END
IF ($selloff = 1)
   IF ($sellprod = "Organics") OR ($sellprod = "Both")
         IF ($orgpercent < $minPerc)
	         send "0*"
         ELSE
	         send "*"
         END
    ELSE
         send "0*"
    END
END
pause

:sellequ
killtrigger ni
IF ($sdt = 1)
   send "*"
END
IF ($selloff = 1)
   IF ($sellprod = "Equipment") OR ($sellprod = "Both")
         IF ($equpercent < $minPerc)
	          send "0*"
         ELSE
	          send "*"
         END
   ELSE
         send "0*"
   END
END
setVar $prodtosell "equ"
pause

:amnt_selling
echo "*Amount selling*"
killtrigger sellfuel
killtrigger sellorg
killtrigger sellequ
killtrigger donewithport
getWord CURRENTLINE $amnt_sell 2
striptext $amnt_sell ","

:sellhaggle
killalltriggers
echo "*Sell haggle*"
setTextTrigger sellfirstoffer :sellfirstoffer "Your offer ["
pause

:sellfirstoffer
killtrigger sellfirstoffer
setTextLineTrigger bad_offer_1 :sellhaggle "This is the big leagues Jr.  Make a real offer."
setTextLineTrigger bad_offer_2 :sellhaggle "What do you take me for, a fool?  Make a real offer!"
setTextLineTrigger bad_offer_3 :sellhaggle "WHAT?!@!? you must be crazy!"
getText CURRENTLINE $offer "[" "]?"
striptext $offer ","
echo "*First offer*"
echo "*Offer: " $offer "*"
setVar $perunitinitoffer $offer
multiply $perunitinitoffer 100
divide $perunitinitoffer $amnt_sell
setVar $portmaxinit $perunitinitoffer
divide $perunitinitoffer 10
IF ($prodtosell = "ore")
   	       setVar $basevalue 256055800
   setVar $basepercent 11725
       setVar $basepercentinverse 88275
   setVar $percentfrombase $orepercent
ELSEIF ($prodtosell = "org")
   setVar $basevalue 506276400
   setVar $basepercent 11287
   setVar $basepercentinverse 88713
   setVar $percentfrombase $orgpercent
ELSEIF ($prodtosell = "equ")
   setVar $basevalue 906281000
   setVar $basepercent 10989
   setVar $basepercentinverse 89010
   setVar $percentfrombase $equpercent
END

IF ($percentfrombase >= 15)
   multiply $portmaxinit 100000
   subtract $portmaxinit $basevalue
   multiply $percentfrombase 1000
   subtract $percentfrombase $basepercent
   divide $portmaxinit $percentfrombase
   multiply $portmaxinit $basepercentinverse
   add $portmaxinit $basevalue
   divide $portmaxinit 1000000
ELSEIF ($prodtosell = "ore")
   setVar $portmaxinit 340
ELSEIF ($prodtosell = "org")
   setVar $portmaxinit 635
ELSEIF ($prodtosell = "equ")
   setVar $portmaxinit 1063
END
   IF ($prodtosell = "ore")
IF ($portmaxinit >= 436)
setVar $MCIC "-90"
setVar $multiple "1494"
ELSEIF ($portmaxinit >= 434)
setVar $MCIC "-89"
setVar $multiple "1488"
ELSEIF ($portmaxinit >= 433)
setVar $MCIC "-88"
setVar $multiple "1482"
ELSEIF ($portmaxinit >= 431)
setVar $MCIC "-87"
setVar $multiple "1476"
ELSEIF ($portmaxinit >= 429)
setVar $MCIC "-86"
setVar $multiple "1470"
ELSEIF ($portmaxinit >= 427)
setVar $MCIC "-85"
setVar $multiple "1464"
ELSEIF ($portmaxinit >= 425)
setVar $MCIC "-84"
setVar $multiple "1458"
ELSEIF ($portmaxinit >= 424)
setVar $MCIC "-83"
setVar $multiple "1452"
ELSEIF ($portmaxinit >= 422)
setVar $MCIC "-82"
setVar $multiple "1446"
ELSEIF ($portmaxinit >= 420)
setVar $MCIC "-81"
setVar $multiple "1440"
ELSEIF ($portmaxinit >= 418)
setVar $MCIC "-80"
setVar $multiple "1434"
ELSEIF ($portmaxinit >= 416)
setVar $MCIC "-79"
setVar $multiple "1429"
ELSEIF ($portmaxinit >= 414)
setVar $MCIC "-78"
setVar $multiple "1423"
ELSEIF ($portmaxinit >= 412)
setVar $MCIC "-77"
setVar $multiple "1417"
ELSEIF ($portmaxinit >= 411)
setVar $MCIC "-76"
setVar $multiple "1411"
ELSEIF ($portmaxinit >= 409)
setVar $MCIC "-75"
setVar $multiple "1405"
ELSEIF ($portmaxinit >= 407)
setVar $MCIC "-74"
setVar $multiple "1399"
ELSEIF ($portmaxinit >= 405)
setVar $MCIC "-73"
setVar $multiple "1393"
ELSEIF ($portmaxinit >= 403)
setVar $MCIC "-72"
setVar $multiple "1387"
ELSEIF ($portmaxinit >= 401)
setVar $MCIC "-71"
setVar $multiple "1381"
ELSEIF ($portmaxinit >= 399)
setVar $MCIC "-70"
setVar $multiple "1375"
ELSEIF ($portmaxinit >= 397)
setVar $MCIC "-69"
setVar $multiple "1369"
ELSEIF ($portmaxinit >= 396)
setVar $MCIC "-68"
setVar $multiple "1363"
ELSEIF ($portmaxinit >= 394)
setVar $MCIC "-67"
setVar $multiple "1357"
ELSEIF ($portmaxinit >= 392)
setVar $MCIC "-66"
setVar $multiple "1351"
ELSEIF ($portmaxinit >= 390)
setVar $MCIC "-65"
setVar $multiple "1345"
ELSEIF ($portmaxinit >= 388)
setVar $MCIC "-64"
setVar $multiple "1342"
ELSEIF ($portmaxinit >= 386)
setVar $MCIC "-63"
setVar $multiple "1336"
ELSEIF ($portmaxinit >= 384)
setVar $MCIC "-62"
setVar $multiple "1330"
ELSEIF ($portmaxinit >= 382)
setVar $MCIC "-61"
setVar $multiple "1324"
ELSEIF ($portmaxinit >= 380)
setVar $MCIC "-60"
setVar $multiple "1318"
ELSEIF ($portmaxinit >= 378)
setVar $MCIC "-59"
setVar $multiple "1312"
ELSEIF ($portmaxinit >= 376)
setVar $MCIC "-58"
setVar $multiple "1306"
ELSEIF ($portmaxinit >= 374)
setVar $MCIC "-57"
setVar $multiple "1300"
ELSEIF ($portmaxinit >= 372)
setVar $MCIC "-56"
setVar $multiple "1294"
ELSEIF ($portmaxinit >= 370)
setVar $MCIC "-55"
setVar $multiple "1291"
ELSEIF ($portmaxinit >= 368)
setVar $MCIC "-54"
setVar $multiple "1285"
ELSEIF ($portmaxinit >= 366)
setVar $MCIC "-53"
setVar $multiple "1279"
ELSEIF ($portmaxinit >= 364)
setVar $MCIC "-52"
setVar $multiple "1273"
ELSEIF ($portmaxinit >= 362)
setVar $MCIC "-51"
setVar $multiple "1267"
ELSEIF ($portmaxinit >= 360)
setVar $MCIC "-50"
setVar $multiple "1261"
ELSEIF ($portmaxinit >= 358)
setVar $MCIC "-49"
setVar $multiple "1255"
ELSEIF ($portmaxinit >= 356)
setVar $MCIC "-48"
setVar $multiple "1249"
ELSEIF ($portmaxinit >= 354)
setVar $MCIC "-46"
setVar $multiple "1246"
ELSEIF ($portmaxinit >= 352)
setVar $MCIC "-46"
setVar $multiple "1240"
ELSEIF ($portmaxinit >= 350)
setVar $MCIC "-45"
setVar $multiple "1234"
ELSEIF ($portmaxinit >= 348)
setVar $MCIC "-44"
setVar $multiple "1228"
ELSEIF ($portmaxinit >= 346)
setVar $MCIC "-43"
setVar $multiple "1222"
ELSEIF ($portmaxinit >= 344)
setVar $MCIC "-42"
setVar $multiple "1219"
ELSEIF ($portmaxinit >= 342)
setVar $MCIC "-41"
setVar $multiple "1209"
ELSEIF ($portmaxinit >= 340)
setVar $MCIC "-40"
setVar $multiple "1208"
ELSE
setVar $MCIC 0
setVar $multiple "1208"
END
   ELSEIF ($prodtosell = "org")
IF ($portmaxinit >= 813)
setVar $MCIC "-75"
setVar $multiple "1405"
ELSEIF ($portmaxinit >= 810)
setVar $MCIC "-74"
setVar $multiple 1399
ELSEIF ($portmaxinit >= 806)
setVar $MCIC "-73"
setVar $multiple 1393
ELSEIF ($portmaxinit >= 802)
setVar $MCIC "-72"
setVar $multiple 1387
ELSEIF ($portmaxinit >= 798)
setVar $MCIC "-71"
setVar $multiple 1381
ELSEIF ($portmaxinit >= 795)
setVar $MCIC "-70"
setVar $multiple 1375
ELSEIF ($portmaxinit >= 791)
setVar $MCIC "-69"
setVar $multiple 1369
ELSEIF ($portmaxinit >= 787)
setVar $MCIC "-68"
setVar $multiple 1363
ELSEIF ($portmaxinit >= 783)
setVar $MCIC "-67"
setVar $multiple 1357
ELSEIF ($portmaxinit >= 779)
setVar $MCIC "-66"
setVar $multiple 1351
ELSEIF ($portmaxinit >= 775)
setVar $MCIC "-65"
setVar $multiple 1345
ELSEIF ($portmaxinit >= 772)
setVar $MCIC "-64"
setVar $multiple 1339
ELSEIF ($portmaxinit >= 768)
setVar $MCIC "-63"
setVar $multiple 1336
ELSEIF ($portmaxinit >= 764)
setVar $MCIC "-62"
setVar $multiple 1330
ELSEIF ($portmaxinit >= 760)
setVar $MCIC "-61"
setVar $multiple 1324
ELSEIF ($portmaxinit >= 756)
setVar $MCIC "-60"
setVar $multiple 1318
ELSEIF ($portmaxinit >= 752)
setVar $MCIC "-59"
setVar $multiple 1312
ELSEIF ($portmaxinit >= 748)
setVar $MCIC "-58"
setVar $multiple 1306
ELSEIF ($portmaxinit >= 744)
setVar $MCIC "-57"
setVar $multiple 1300
ELSEIF ($portmaxinit >= 740)
setVar $MCIC "-56"
setVar $multiple 1294
ELSEIF ($portmaxinit >= 737)
setVar $MCIC "-55"
setVar $multiple 1291
ELSEIF ($portmaxinit >= 733)
setVar $MCIC "-54"
setVar $multiple 1285
ELSEIF ($portmaxinit >= 729)
setVar $MCIC "-53"
setVar $multiple 1279
ELSEIF ($portmaxinit >= 725)
setVar $MCIC "-52"
setVar $multiple 1273
ELSEIF ($portmaxinit >= 721)
setVar $MCIC "-51"
setVar $multiple 1267
ELSEIF ($portmaxinit >= 717)
setVar $MCIC "-50"
setVar $multiple 1261
ELSEIF ($portmaxinit >= 713)
setVar $MCIC "-49"
setVar $multiple 1255
ELSEIF ($portmaxinit >= 709)
setVar $MCIC "-48"
setVar $multiple 1252
ELSEIF ($portmaxinit >= 705)
setVar $MCIC "-47"
setVar $multiple 1246
ELSEIF ($portmaxinit >= 701)
setVar $MCIC "-46"
setVar $multiple 1236
ELSEIF ($portmaxinit >= 697)
setVar $MCIC "-45"
setVar $multiple 1233
ELSEIF ($portmaxinit >= 693)
setVar $MCIC "-44"
setVar $multiple 1227
ELSEIF ($portmaxinit >= 688)
setVar $MCIC "-43"
setVar $multiple 1224
ELSEIF ($portmaxinit >= 684)
setVar $MCIC "-42"
setVar $multiple 1214
ELSEIF ($portmaxinit >= 680)
setVar $MCIC "-41"
setVar $multiple 1213
ELSEIF ($portmaxinit >= 676)
setVar $MCIC "-40"
setVar $multiple 1203
ELSEIF ($portmaxinit >= 672)
setVar $MCIC "-39"
setVar $multiple 1200
ELSEIF ($portmaxinit >= 668)
setVar $MCIC "-38"
setVar $multiple 1194
ELSEIF ($portmaxinit >= 664)
setVar $MCIC "-37"
setVar $multiple 1191
ELSEIF ($portmaxinit >= 660)
setVar $MCIC "-36"
setVar $multiple 1181
ELSEIF ($portmaxinit >= 656)
setVar $MCIC "-35"
setVar $multiple 1178
ELSEIF ($portmaxinit >= 651)
setVar $MCIC "-34"
setVar $multiple 1172
ELSEIF ($portmaxinit >= 647)
setVar $MCIC "-33"
setVar $multiple 1166
ELSEIF ($portmaxinit >= 643)
setVar $MCIC "-32"
setVar $multiple 1160
ELSEIF ($portmaxinit >= 639)
setVar $MCIC "-31"
setVar $multiple 1157
ELSEIF ($portmaxinit >= 635)
setVar $MCIC "-30"
setVar $multiple 1154
ELSE
setVar $MCIC 0
setVar $multiple "1154"
END
   ELSEIF ($prodtosell = "equ")
IF ($portmaxinit >= 1393)
setVar $MCIC "-65"
setVar $multiple 1347
ELSEIF ($portmaxinit >= 1386)
setVar $MCIC "-64"
setVar $multiple 1341
ELSEIF ($portmaxinit >= 1379)
setVar $MCIC "-63"
setVar $multiple 1336
ELSEIF ($portmaxinit >= 1372)
setVar $MCIC "-62"
setVar $multiple 1330
ELSEIF ($portmaxinit >= 1365)
setVar $MCIC "-61"
setVar $multiple 1324
ELSEIF ($portmaxinit >= 1358)
setVar $MCIC "-60"
setVar $multiple 1319
ELSEIF ($portmaxinit >= 1351)
setVar $MCIC "-59"
setVar $multiple 1313
ELSEIF ($portmaxinit >= 1344)
setVar $MCIC "-58"
setVar $multiple 1307
ELSEIF ($portmaxinit >= 1337)
setVar $MCIC "-57"
setVar $multiple 1302
ELSEIF ($portmaxinit >= 1329)
setVar $MCIC "-56"
setVar $multiple 1296
ELSEIF ($portmaxinit >= 1323)
setVar $MCIC "-55"
setVar $multiple 1291
ELSEIF ($portmaxinit >= 1315)
setVar $MCIC "-54"
setVar $multiple 1285
ELSEIF ($portmaxinit >= 1308)
setVar $MCIC "-53"
setVar $multiple 1279
ELSEIF ($portmaxinit >= 1301)
setVar $MCIC "-52"
setVar $multiple 1274
ELSEIF ($portmaxinit >= 1294)
setVar $MCIC "-51"
setVar $multiple 1268
ELSEIF ($portmaxinit >= 1287)
setVar $MCIC "-50"
setVar $multiple 1262
ELSEIF ($portmaxinit >= 1279)
setVar $MCIC "-49"
setVar $multiple 1254
ELSEIF ($portmaxinit >= 1272)
setVar $MCIC "-48"
setVar $multiple 1247
ELSEIF ($portmaxinit >= 1265)
setVar $MCIC "-47"
setVar $multiple 1246
ELSEIF ($portmaxinit >= 1258)
setVar $MCIC "-46"
setVar $multiple 1241
ELSEIF ($portmaxinit >= 1251)
setVar $MCIC "-45"
setVar $multiple 1235
ELSEIF ($portmaxinit >= 1243)
setVar $MCIC "-44"
setVar $multiple 1229
ELSEIF ($portmaxinit >= 1236)
setVar $MCIC "-43"
setVar $multiple 1224
ELSEIF ($portmaxinit >= 1229)
setVar $MCIC "-42"
setVar $multiple 1218
ELSEIF ($portmaxinit >= 1221)
setVar $MCIC "-41"
setVar $multiple 1213
ELSEIF ($portmaxinit >= 1214)
setVar $MCIC "-40"
setVar $multiple 1208
ELSEIF ($portmaxinit >= 1206)
setVar $MCIC "-39"
setVar $multiple 1201
ELSEIF ($portmaxinit >= 1199)
setVar $MCIC "-38"
setVar $multiple 1196
ELSEIF ($portmaxinit >= 1192)
setVar $MCIC "-37"
setVar $multiple 1190
ELSEIF ($portmaxinit >= 1184)
setVar $MCIC "-36"
setVar $multiple 1185
ELSEIF ($portmaxinit >= 1177)
setVar $MCIC "-35"
setVar $multiple 1180
ELSEIF ($portmaxinit >= 1169)
setVar $MCIC "-34"
setVar $multiple 1174
ELSEIF ($portmaxinit >= 1162)
setVar $MCIC "-33"
setVar $multiple 1169
ELSEIF ($portmaxinit >= 1154)
setVar $MCIC "-32"
setVar $multiple 1164
ELSEIF ($portmaxinit >= 1147)
setVar $MCIC "-31"
setVar $multiple 1158
ELSEIF ($portmaxinit >= 1139)
setVar $MCIC "-30"
setVar $multiple 1152
ELSEIF ($portmaxinit >= 1132)
setVar $MCIC "-29"
setVar $multiple 1149
ELSEIF ($portmaxinit >= 1124)
setVar $MCIC "-28"
setVar $multiple 1144
ELSEIF ($portmaxinit >= 1116)
setVar $MCIC "-27"
setVar $multiple 1136
ELSEIF ($portmaxinit >= 1109)
setVar $MCIC "-26"
setVar $multiple 1132
ELSEIF ($portmaxinit >= 1101)
setVar $MCIC "-25"
setVar $multiple 1126
ELSEIF ($portmaxinit >= 1093)
setVar $MCIC "-24"
setVar $multiple 1122
ELSEIF ($portmaxinit >= 1086)
setVar $MCIC "-23"
setVar $multiple 1117
ELSEIF ($portmaxinit >= 1078)
setVar $MCIC "-22"
setVar $multiple 1110
ELSEIF ($portmaxinit >= 1071)
setVar $MCIC "-21"
setVar $multiple 1105
ELSEIF ($portmaxinit >= 1063)
setVar $MCIC "-20"
setVar $multiple 1102
ELSE
setVar $MCIC "0"
setVar $multiple 1102
END
   END
setVar $counter $offer
divide $counter 10
multiply $counter $multiple
divide $counter 100
send $counter & "*"
echo "*Line 791 - Waitfor counter*"
waitfor $counter
setVar $midhaggles 0

:sellofferloop
killalltriggers
echo "*Sell offer loop*"
setTextLineTrigger donehag :pdone_haggle "You have"
SetTextLineTrigger offerme :prehaggle "We'll buy them for"
setTextLineTrigger final :finaloffer "Our final offer is"
setTextTrigger ni :ni "We're not interested."
pause

:prehaggle
getWord CURRENTLINE $new_offer 5
striptext $new_offer ","
IF ($new_offer = $offer)
   multiply $counter 98
       divide $counter 100
       send $counter & "*"
   waitFor $counter
       goto :sellofferloop
ELSE
   getText CURRENTLINE $new_offer "for " " credits."
   stripText $new_offer ","
   setVar $offer_change $new_offer
       subtract $offer_change $offer
       IF ($MCIC > "-35")
                multiply $offer_change 75
                divide $offer_change 100
                subtract $counter $offer_change
                subtract $counter 25
       ELSEIF ($MCIC > "-55")
                multiply $offer_change 65
                divide $offer_change 100
                subtract $counter $offer_change
                subtract $counter 25
       ELSE
        multiply $offer_change 60
                divide $offer_change 100
                subtract $counter $offer_change
                subtract $counter 10
       END
       send $counter & "*"
   setVar $offer $new_offer
   waitfor $counter
   add $midhaggles 1
   setTextTrigger offerme :prehaggle "We'll buy them for"
   pause
END

:finaloffer
killtrigger offerme
IF (($prodtosell = "ore") and ($MCIC <= "-75") and ($amnt_sell >= 25000) and ($midhaggles < 1))
       setVar $forcefail 1
       setVar $thisorefailed 1
ELSEIF (($prodtosell = "org") and ($MCIC <= "-60") and ($amnt_sell >= 25000) and ($midhaggles < 2) and ($thisorefailed = 1))
       setVar $forcefail 1
   setVar $thisorgfailed 1
ELSEIF (($prodtosell = "org") and ($MCIC <= "-60") and ($amnt_sell >= 15000) and ($midhaggles < 1) and ($thisorefailed = 1))
       setVar $forcefail 1
   setVar $thisorgfailed 1
ELSEIF (($prodtosell = "equ") and ($MCIC <= "-55") and ($amnt_sell >= 20000) and ($midhaggles < 2) and (($thisorefailed = 1) or ($thisorgfailed = 1)))
   setVar $forcefail 1
       setVar $thisequfailed 1
ELSEIF (($prodtosell = "equ") and ($MCIC <= "-55") and ($amnt_sell >= 12000) and ($midhaggles < 1) and (($thisorefailed = 1) or ($thisorgfailed = 1)))
       setVar $forcefail 1
       setVar $thisequfailed 1
ELSE
   setVar $forcefail 0
END
IF ($forcefail = 0)
   getWord CURRENTLINE $new_offer 5
   striptext $new_offer ","
   setVar $offer_change $new_offer
   subtract $offer_change $offer
   IF ($prodtosell = "ore")
        multiply $offer_change 30
   ELSEIF ($prodtosell = "org")
        multiply $offer_change 27
   ELSEIF ($prodtosell = "equ")
        multiply $offer_change 25
   END
   divide $offer_change 10
   subtract $counter $offer_change
   subtract $counter 10
   send $counter & "*"
   pause
ELSE
       setTextTrigger donewithport :donewithport "] (?=Help)"
   send $counter & " * * * * * n n q z n q z n "
   pause
END

:ni
setVar $ni 1
killtrigger donehag
goto :sellproduct

:pdone_haggle
killtrigger ni
IF ($prodtosell = "ore")
   setVar $ore 1
   setVar $credperoreunit ($counter/$amnt_sell)
   setVar $oreamount $amnt_sell
   setVar $oreprice $counter
   setVar $fuelMCIC $MCIC
ELSEIF ($prodtosell = "org")
   setVar $org 1
   setVar $credperorgunit ($counter/$amnt_sell)
   setVar $orgamount $amnt_sell
   setVar $orgprice $counter
   setVar $orgsMCIC $MCIC
ELSEIF ($prodtosell = "equ")
   setVar $equ 1
   setVar $credperequunit ($counter/$amnt_sell)
   setVar $equamount $amnt_sell
   setVar $equprice $counter
   setVar $equipMCIC $MCIC
END
goto :sellproduct

:donewithport
killalltriggers
getText CURRENTLINE $sec "]:[" "] ("
setvar $switchboard~message "CAP Trade, sold units at " & $sec & ":*"
gosub :switchboard~switchboard
IF ($ore = 1)
   send "   Ore : " $oreamount " units for " $oreprice ", (" $credperoreunit "ppu) (mcic: " $fuelMCIC ")*"
   write $mcicfile $sec & " - Ore - " & $fuelMCIC
END
IF ($org = 1)
   send "   Orgs : " $orgamount " units for " $orgprice ", (" $credperorgunit "ppu) (mcic: " $orgsMCIC ")*"
   write $mcicfile $sec & " - Orgs - " & $orgsMCIC
END
IF ($equ = 1)
   send "   Equip : " $equamount " units for " $equprice ", (" $credperequunit "ppu) (mcic: " $equipMCIC ")*"
   write $mcicfile $sec & " - Equip - " & $equipMCIC
END
send "*"
return

:fix_lockup
killtrigger donewithport
setTextTrigger donewithport :donewithport "] (?=Help)"
send "*"
pause

:haggle
setVar $ni 0
setVar $midhag "-1"
setVar $nocred 0
killtrigger 1
killtrigger 0
killtrigger donehaggling
setTextTrigger donehag :done_haggle "Command [TL="
SetTextTrigger donehaggling :done_haggle "empty cargo holds."
SetTextTrigger offerme :offerme "Your offer"
pause

:offerme
getWord CURRENTLINE $offer 3
stripText $offer "["
stripText $offer "]"
stripText $offer ","
stripText $offer "?"
setVar $orig_offer $offer

:rehaggle
killtrigger 0
killtrigger 2
killtrigger 3
setVar $offer (($orig_offer * $multiplier) / 100)
send $offer "*"
add $midhag 1
waitFor $offer
IF ($multiplier > 100)
   subtract $multiplier 1
ELSE
   add $multiplier 1
END
setTextTrigger 0 :done_haggle "How many holds of"
setTextTrigger 1 :rehaggle "Your offer"
setTextTrigger 2 :donehag "We're not interested."
setTextTrigger 3 :nocreds "You only have"
pause

:nocreds
setVAr $nocred 1
send "0*0*"
goto :done_haggle

:donehag
setVar $ni 1

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
setVar $sec $port1
setVar $other $port2
setVar $stopper 0
gosub :quikstats
setVar $maxholds $HOLDS
setVAr $finholds $ORE_HOLDS
setVar $oinholds $ORGANIC_HOLDS
setVar $einholds $EQUIPMENT_HOLDS
setVar $totalinholds ($finholds + $oinholds + $einholds)
       IF ($totalinholds = $maxholds)
            IF (PORT.BUYORE[$sec] = 1)
                 setVar $finholds 0
            END
   IF (PORT.BUYORG[$sec] = 1)
        setVar $oinholds 0
   END
   IF (PORT.BUYEQUIP[$sec] = 1)
        setVar $einholds 0
END
   setVar $totalinholds ($finholds + $oinholds + $einholds)
   IF ($totalinholds = $maxholds)
        goto :nxtport
   END
END

:supg_PPT
killtrigger sell
killtrigger buy
killtrigger offport
send "pt"
waitfor "<Port>"
setTextTrigger nomore :nomore "You don't have anything they want,"
setTextLineTrigger fuel :fuelamt "Fuel Ore"
setTextLineTrigger orgs :orgsamt "Organics"
setTextLineTrigger equip :equipamt "Equipment"
setTextTrigger moretrade :traders "You have"
pause

:nomore
killtrigger fuel
killtrigger orgs
killtrigger equip
killtrigger moretrade
return

:fuelamt
getWord CURRENTLINE $fuelamt 5
stripText $fuelamt "%"
pause

:orgsamt
getWord CURRENTLINE $orgamt 4
stripText $orgamt "%"
pause

:equipamt
getWord CURRENTLINE $equipamt 4
stripText $equipamt "%"
pause

:traders
killtrigger nomore
setTextTrigger sellorbuy :sellorbuy "]?"
setTextTrigger offport :offport "Command [TL="
pause

:sellorbuy
getText CURRENTLINE $slloby "to " " ["
IF ($slloby = "sell")
   goto :sell
ELSE
   goto :buy
END

:sell
killtrigger offport
getWord CURRENTLINE $product 5
send "*"
setVar $multiplier (100 + $haggle)
gosub :haggle
IF ($ni = 1)
   goto :supg_PPT
END
gosub :stopper
setTextTrigger sellorbuy :sellorbuy "]?"
pause

:buy
killtrigger offport
killtrigger sellorbuy
getWord CURRENTLINE $product 5
IF ($product = "Fuel")
   IF ((PORT.BUYEQUIP[$sec] = 0) AND (PORT.BUYEQUIP[$other] = 1)) OR ((PORT.BUYORG[$sec] = 0) AND (PORT.BUYORG[$other] = 1)) or (PORT.BUYFUEL[$other] = 0)
        send "0*"
        gosub :stopper
        goto :traders
       ELSE
        gosub :buyit
   END
ELSEIF ($product = "Organics")
   IF ((PORT.BUYEQUIP[$sec] = 0) AND (PORT.BUYEQUIP[$other] = 1)) or (PORT.BUYORG[$other] = 0)
        send "0*"
        gosub :stopper
        goto :traders
   ELSE
        gosub :buyit
   END
ELSE
   IF (PORT.BUYEQUIP[$other] = 0)
        send "0*"
   ELSE
        gosub :buyit
   	       END
END
IF ($ni = 1)
   goto :supg_PPT
END

:offport
killtrigger sellorbuy
gosub :stopper

:nxtport
IF ($stopper = 0)
   setVar $other $sec
   IF ($sec = $port1)
        setVar $sec $port2
   ELSE
        setVar $sec $port1
   END
            send "m" $sec "**  "
   goto :supg_PPT
ELSE
   killtrigger sell
   killtrigger buy
return
END

:stopper
IF ($product = "Fuel")
   IF ($fuelamt <= $stopperc)
        IF ((PORT.BUYEQUIP[$sec] = 0) AND (PORT.BUYEQUIP[$other] = 1)) OR ((PORT.BUYEQUIP[$sec] = 1) AND (PORT.BUYEQUIP[$other] = 0)) OR ((PORT.BUYORG[$sec] = 0) AND (PORT.BUYORG[$other] = 1)) OR ((PORT.BUYORG[$sec] = 1) AND (PORT.BUYORG[$other] = 0))
	       IF ($fuelamt = 0)
		        setVar $stopper 1
	       ELSE
		        setVar $stopper 0
	       END
        ELSE
	       setVar $stopper 1
        END
   END
ELSEIF ($product = "Organics")
   IF ($orgamt <= $stopperc)
        IF ((PORT.BUYEQUIP[$sec] = 0) AND (PORT.BUYEQUIP[$other] = 1)) OR ((PORT.BUYEQUIP[$sec] = 1) AND (PORT.BUYEQUIP[$other] = 0))
	       IF ($orgamt = 0)
		        setVar $stopper 1
	       ELSE
		        setVar $stopper 0
	       END
        ELSE
	       setVar $stopper 1
        END
   END
ELSEIF ($product = "Equipment")
   IF ($equipamt <= $stopperc)
        setVar $stopper 1
   	       END
END
return

:buyit
send "*"
setVar $multiplier (100 - $haggle)
gosub :haggle
return

:done_read
killtrigger getLine
setVar $hcount 0

:hcount
IF ($hcount < 27)
   add $hcount 1
   setVar $lncount 1

:lncount
IF ($lncount < $cnt)
add $lncount 1
getWordPos $line[$lncount] $pos $h[$hcount]
IF ($pos > 0)
  setVar $work $line[$lncount]
  cutText $work $work $pos 9999
  upperCase $h[$hcount]
  getWord $work $quikstats[$h[$hcount]] 2
  stripText $quikstats[$h[$hcount]] ","
ELSE
  goto :lncount
END
END
goto :hcount
END
return

:express
send "m" $expressto "*"
setTextTrigger twarp :no_twarp "Do you want to engage the TransWarp drive?"
setTextTrigger express :express_warp "Engage the Autopilot?"
setTextTrigger in_adj :there "Sector  : " & $expressto
setTextTrigger voided_sec :voided "Do you really want to warp there?"
setTextTrigger insec :there "You are already in that sector!"
setTextTrigger ig :igd "An Interdictor Generator in this sector holds you fast!"
setTextTrigger ig2 :igd "<Re-Display>"
setTextTrigger noturns :exp_noturns "You don't have enough turns left."
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
getWord CURRENTLINE $void 7
send "n"
setVar $expressto "-2"
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
setVar $expressto "-3"
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
setTextTrigger hitfig :hit_fig "Your fighters:"
setTextTrigger hitmine :hit_mine "Mined Sector: Do you wish to Avoid this sector in the future? (Y/N)"
setTextTrigger clear :ready_state "Autopilot disengaging."
setTextTrigger done :ready_state "Command [TL="
IF ($singlestep = 1)
   setTextTrigger continue :ready_state "Stop in this sector"
ELSE
   setTextTrigger continue :keep_rollin "Stop in this sector"
END
setTextTrigger ig :igd "An Interdictor Generator in this sector holds you fast!"
setTextTrigger pause :pause "[Pause]"
setTextTrigger noturns :exp_noturns "You don't have enough turns left."
pause

:pause
send "*"
setTextTrigger pause :pause "[Pause]"
pause

:keep_rollin
send "n"
setTextTrigger continue :keep_rollin "Stop in this sector"
pause

:hit_fig
send "a999989796954939291911*"
setTextTrigger hitfig :hit_fig "Your fighters:"
pause

:hit_mine
send "n"
setTextTrigger hitmine :hit_mine "Mined Sector: Do you wish to Avoid this sector in the future? (Y/N)"
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
setVar $expressto "-1"
return

:twarp
send "m" $twarpto "*"
setTextTrigger twarp :tw_twarp "Do you want to engage the TransWarp drive?"
setTextTrigger notwarp :tw_notwarp "The shortest path ("
setTextTrigger adjacent :tw_there "Sector  : " & $twarpto
setTextTrigger ig :tw_ig "An Interdictor Generator in this sector holds you fast!"
setTextTrigger nomove :tw_there "You are already in that sector!"
setTextTrigger noturns :tw_noturns "You don't have enough turns left."
setTextTrigger voided :tw_notwarp "No route within"
pause

:tw_twarp
killtrigger voided
killtrigger noturns
killtrigger nomove
killtrigger notwarp
killtrigger adjacent
killtrigger ig
send "y"
setTextTrigger gogo :tw_safe "All Systems Ready, shall we engage?"
setTextTrigger outafuel :tw_outafuel "You do not have enough Fuel Ore to make the jump."
setTextTrigger nogo :tw_blind "Do you want to make this jump blind?"
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
setVar $twarpto "-1"
return

:tw_ig
killtrigger voided
killtrigger noturns
killtrigger nomove
killtrigger notwarp
killtrigger adjacent
killtrigger ig
killtrigger twarp
setVar $twarpto "-2"
return

:tw_noturns
killtrigger voided
killtrigger noturns
killtrigger nomove
killtrigger notwarp
killtrigger adjacent
killtrigger ig
killtrigger twarp
setVar $twarpto "-1"
return

:tw_outafuel
killtrigger voided
killtrigger noturns
killtrigger nomove
killtrigger gogo
killtrigger outafuel
killtrigger nogo
setVar $twarpto "-3"
return

:tw_blind
killtrigger voided
killtrigger noturns
killtrigger nomove
killtrigger gogo
killtrigger outafuel
killtrigger nogo
send "n"
setVar $twarpto "-4"
return

:xport
send "x  "
setTextTrigger choose :xp_choose "Choose which ship to"
setTextTrigger noships :xp_noships "You do not own any other ships!"
pause

:xp_choose
killtrigger noships
send $xportto "*  q"
setTextTrigger noturns :xp_noturns "You don't have any turns left!"
setTextTrigger noship :xp_noship "That is not an available ship."
setTextTrigger xport :xp_xport "Security code accepted,"
setTextTrigger noceo :xp_noceo "Your retinal scan does not match"
setTextTrigger range :xp_range "only has a transport range of"
setTextTrigger comm :xp_commish "You are not commissioned by the"
setTextTrigger exp :xp_experience "You need "
setTextTrigger noships :xp_noship "You do not own any other ships!"
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
setVar $xportto "-1"
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
setVar $xportto "-2"
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
setVar $xportto "-3"
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
setVar $xportto "-7"
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
setVar $xportto "-4"
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
setVar $xportto "-5"
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
setVar $xportto "-6"
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
setTextTrigger fired :pt_fired "Photon Wave Duration"
setTextTrigger notadj :pt_notadj "That is not an adjacent sector"
setTextTrigger ptordis :pt_disable "Photon Missiles are disabled."
setTextTrigger nofire :pt_nofire "<Computer deactivated>"
setTextTrigger fed :pt_fed "The Feds do not permit"
setTextTrigger notorps :pt_notorps "You do not have any Photon Missiles!"
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
setVar $photonto "-1"
send "q"
return

:pt_disable
killtrigger fired
killtrigger nofire
killtrigger fed
killtrigger notadj
killtrigger notorps
setVar $photonto "-2"
return

:pt_nofire
killtrigger fired
killtrigger fed
killtrigger notadj
killtrigger ptordis
killtrigger notorps
setVar $photonto "-3"
return

:pt_fed
killtrigger fired
killtrigger nofire
killtrigger notadj
killtrigger ptordis
killtrigger notorps
setVar $photonto "-4"
return

:pt_notorps
killtrigger fired
killtrigger nofire
killtrigger notadj
killtrigger ptordis
killtrigger fed
setVar $photonto "-5"
return

:setVoids
send "d"
waitfor "<Re-Display>"
setTextTrigger cursec :void_cursec "] (?=Help)? :"
pause

:void_cursec
getText CURRENTLINE $cursec "]:[" "] (?=Help)? :"
setVar $setVoids 1
send "c"
while ($setVoids <= SECTOR.WARPCOUNT[$cursec])
   send "v" SECTOR.WARPS[$cursec][$setVoids] "*"
   add $setVoids 1
END
send "q"
return

:clearVoids
send "d"
waitfor "<Re-Display>"
setTextTrigger cursec :clearvoid_cursec "] (?=Help)? :"
pause

:clearvoid_cursec
getText CURRENTLINE $cursec "]:[" "] (?=Help)? :"
setVar $setVoids 1
send "c"
while ($setVoids <= SECTOR.WARPCOUNT[$cursec])
   echo " " $setVoids " "
       send "v0*yn" SECTOR.WARPS[$cursec][$setVoids] "*"
   add $setVoids 1
END
send "q"
return

:ssm
setVar $noexp 0
setVar $sec $port1
gosub :quikstats
setVar $exp $EXPERIENCE
setVar $thold $TOTAL_HOLDS

:steal
setVar $maxhold $exp
divide $maxhold $steal_factor
IF ($maxhold > $thold)
   setVar $maxhold $thold
END

:sport
send "p  r  *  s  t  "
setTextTrigger fake :fbusted "Corporate command [TL="
setTextTrigger good :cont "Which product?"
pause

:cont
killtrigger fake
setTextTrigger success :success "Success!"
setTextTrigger busted :busted "Suddenly you're Busted"
setTextTrigger upgrade :upgrade "There aren't that many holds"
send "  3  " $maxhold "   *   "
pause

:upgrade
killtrigger success
killtrigger busted
setVar $upgrade (($maxhold / 10) + 1)
setVar $upg_amnt $upgrade
setVAr $upg_prod 3
gosub :upgradePort
IF ($upg_amnt = "-1")
   setvar $switchboard~message "SSM - Could not upgrade port, it's either maxed or I don't have enough money*"
   gosub :switchboard~switchboard
   goto :wait
END
goto :sport

:success
killtrigger busted
killtrigger upgrade
setVar $addexp $maxhold
multiply $addexp 90
IF ($addexp < 1000)
   goto :norec
END
divide $addexp 1000
add $exp $addexp

:rhag
send "  p  t  *  "
setVar $multiplier (100 + $haggle)
IF ($hag = 1) and ($multiplier <> 100)
   waitFor "How many holds of"
   setVar $ni 0
   gosub :haggle
   IF ($ni = 1)
         goto :rhag
   END
ELSE
   send "*"
END
IF (PORT.BUYFUEL[$sec] = 0)
   send "  0*  "
END
IF (PORT.BUYORG[$sec] = 0)
   send "  0*  "
END
IF ($sec = $port1)
   setVar $sec $port2
ELSE
   setVar $sec $port1
END
send "   m   " $sec "*   z   a   9999   *   z   r   *   "
goto :steal

:fbusted
killtrigger good
send "   q   q   z   n   *   "

:busted
killtrigger success
killtrigger upgrade
setVar $busted $sec
return

:norec
echo "*Not enough experience*"
setVar $noexp 1
return

:haggle
setVar $ni 0
setVar $midhag "-1"
setVar $nocred 0
killtrigger 1
killtrigger 0
killtrigger donehaggling
setTextTrigger donehag :done_haggle "Command [TL="
SetTextTrigger donehaggling :done_haggle "empty cargo holds."
SetTextTrigger offerme :offerme "Your offer"
pause

:offerme
getWord CURRENTLINE $offer 3
stripText $offer "["
stripText $offer "]"
stripText $offer ","
stripText $offer "?"
setVar $orig_offer $offer

:rehaggle
killtrigger 0
killtrigger 2
killtrigger 3
setVar $offer (($orig_offer * $multiplier) / 100)
send $offer "*"
add $midhag 1
waitFor $offer
IF ($multiplier > 100)
   subtract $multiplier 1
ELSE
   add $multiplier 1
END
setTextTrigger 0 :done_haggle "How many holds of"
setTextTrigger 1 :rehaggle "Your offer"
setTextTrigger 2 :donehag "We're not interested."
setTextTrigger 3 :nocreds "You only have"
pause

:nocreds
echo "No creds*"
setVar $nocred 1
send "   0*   0*   "
goto :done_haggle

:donehag
echo "Done hag*"
setVar $ni 1

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

:upgradePort
send "   o   " $upg_prod
setTextTrigger maxupg :maxupg "to quit)"
pause

:maxupg
getWord CURRENTLINE $upg_maxupg 9
striptext $upg_maxupg "("
IF ($upg_maxupg < $upg_amnt)
   setVar $upg_amnt "-1"
ELSE
   send $upg_amnt "  *  q  "
END
return

#=================================QUIKSTATS================================================
:quikstats
setVar $CURRENT_PROMPT 		"Undefined"
killtrigger noprompt
killtrigger prompt
killtrigger prompt1
killtrigger prompt2
killtrigger prompt3
killtrigger prompt4
killtrigger statlinetrig
killtrigger getLine2
setTextLineTrigger 	prompt		:allPrompts	 	#145 & #8
setTextLineTrigger 	statlinetrig 	:statStart 		#179
send #145&"/"
pause

:allPrompts
getWord CURRENTLINE $CURRENT_PROMPT 1
stripText $CURRENT_PROMPT #145
stripText $CURRENT_PROMPT #8
setTextLineTrigger 	prompt		:allPrompts	 	#145 & #8
pause

:statStart
killtrigger prompt
killtrigger prompt2
killtrigger prompt3
killtrigger prompt4
killtrigger noprompt
setVar $stats ""
setVar $wordy ""


:statsline
killtrigger statlinetrig
killtrigger getLine2
setVar $line2 CURRENTLINE
replacetext $line2 #179 " "
striptext $line2 ","
setVar $stats $stats & $line2
getWordPos $line2 $pos "Ship"
if ($pos > 0)
	goto :gotStats
else
	setTextLineTrigger getLine2 :statsline
	pause
end

:gotStats
setVar $stats $stats & " @@@"

setVar $current_word 0
while ($wordy <> "@@@")
	if ($wordy = "Sect")
		getWord $stats $CURRENT_SECTOR   	($current_word + 1)
	elseif ($wordy = "Turns")
		getWord $stats $TURNS  			($current_word + 1)
	elseif ($wordy = "Creds")
		getWord $stats $CREDITS  		($current_word + 1)
	elseif ($wordy = "Figs")
		getWord $stats $FIGHTERS   		($current_word + 1)
	elseif ($wordy = "Shlds")
		getWord $stats $SHIELDS  		($current_word + 1)
	elseif ($wordy = "Hlds")
		getWord $stats $TOTAL_HOLDS   		($current_word + 1)
	elseif ($wordy = "Ore")
		getWord $stats $ORE_HOLDS    		($current_word + 1)
	elseif ($wordy = "Org")
		getWord $stats $ORGANIC_HOLDS    	($current_word + 1)
	elseif ($wordy = "Equ")
		getWord $stats $EQUIPMENT_HOLDS    	($current_word + 1)
	elseif ($wordy = "Col")
		getWord $stats $COLONIST_HOLDS    	($current_word + 1)
	elseif ($wordy = "Phot")
		getWord $stats $PHOTONS   		($current_word + 1)
	elseif ($wordy = "Armd")
		getWord $stats $ARMIDS   		($current_word + 1)
	elseif ($wordy = "Lmpt")
		getWord $stats $LIMPETS   		($current_word + 1)
	elseif ($wordy = "GTorp")
		getWord $stats $GENESIS  		($current_word + 1)
	elseif ($wordy = "TWarp")
		getWord $stats $TWARP_TYPE  		($current_word + 1)
	elseif ($wordy = "Clks")
		getWord $stats $CLOAKS   		($current_word + 1)
	elseif ($wordy = "Beacns")
		getWord $stats $BEACONS 		($current_word + 1)
	elseif ($wordy = "AtmDt")
		getWord $stats $ATOMIC  		($current_word + 1)
	elseif ($wordy = "Corbo")
		getWord $stats $CORBO   		($current_word + 1)
	elseif ($wordy = "EPrb")
		getWord $stats $EPROBES   		($current_word + 1)
	elseif ($wordy = "MDis")
		getWord $stats $MINE_DISRUPTORS   	($current_word + 1)
	elseif ($wordy = "PsPrb")
		getWord $stats $PSYCHIC_PROBE  		($current_word + 1)
	elseif ($wordy = "PlScn")
		getWord $stats $PLANET_SCANNER  	($current_word + 1)
	elseif ($wordy = "LRS")
		getWord $stats $SCAN_TYPE    		($current_word + 1)
	elseif ($wordy = "Aln")
		getWord $stats $ALIGNMENT    		($current_word + 1)
	elseif ($wordy = "Exp")
		getWord $stats $EXPERIENCE    		($current_word + 1)
	elseif ($wordy = "Corp")
		getWord $stats $CORP   			($current_word + 1)
	elseif ($wordy = "Ship")
		getWord $stats $SHIP_NUMBER   		($current_word + 1)
	end
	add $current_word 1
	getWord $stats $wordy $current_word
end
:doneQuikstats
killtrigger prompt1
killtrigger prompt2
killtrigger prompt3
killtrigger prompt4
killtrigger statlinetrig
killtrigger getLine2

return
# ============================== END QUICKSTATS SUB==============================

:upgradePort
send "o" $upg_prod
setTextTrigger maxupg :maxupg "to quit)"
pause

:maxupg
getWord CURRENTLINE $upg_maxupg 9
striptext $upg_maxupg "("

IF ($upg_maxupg < $upg_amnt)
   setVar $upg_amnt "-1"
ELSE
   send $upg_amnt "*q"
END
return

:chkclass
IF ($classchk = 0)
   setvar $class "Class 0"
ELSEIF ($classchk = 1)
   setvar $class "BBS"
ELSEIF ($classchk = 2)
   setvar $class "BSB"
ELSEIF ($classchk = 3)
   setvar $class "SBB"
ELSEIF ($classchk = 4)
   setvar $class "SSB"
ELSEIF ($classchk = 5)
   setvar $class "SBS"
ELSEIF ($classchk = 6)
   setvar $class "BSS"
ELSEIF ($classchk = 7)
   setvar $class "SSS"
ELSEIF ($classchk = 8)
   setvar $class "BBB"
ELSEIF ($classchk = 9)
   setvar $class "StarDock"
ELSE
   setvar $class "Unknown"
END
return

:update_cim
send "^r"

:cim_trig
setTextLineTrigger next :next
pause

:next
setVar $info CURRENTLINE
getWord $info $END_test 1
IF ($END_test = "0")
   goto :done
END
goto :cim_trig

:done
send "Q"
return

:cn
setTextLineTrigger cn1 :cn1 "(1) ANSI graphics"
setTextLineTrigger cn2 :cn2 "(2) Animation display"
setTextLineTrigger cn3 :cn3 "(3) Page on messages"
setTextLineTrigger cn4 :cn4 "(4) Sub-space radio channel"
setTextLineTrigger cn5 :cn5 "(5) Federation comm-link"
setTextLineTrigger cn6 :cn6 "(6) Receive private hails"
setTextLineTrigger cn7 :cn7 "(7) Silence ALL messages"
setTextLineTrigger cn9 :cn9 "(9) Abort display on keys"
setTextLineTrigger cna :cna "(A) Message Display Mode"
setTextLineTrigger cnb :cnb "(B) Screen Pauses"
setTextLineTrigger cnc :cnc "(C) Online Auto Flee"
send "cn"
pause

:cn1
getWord CURRENTLINE $set1 5
pause

:cn2
getWord CURRENTLINE $set2 5
pause

:cn3
getWord CURRENTLINE $set3 6
pause

:cn4
getWord CURRENTLINE $set4 6
pause

:cn5
getWord CURRENTLINE $set5 5
pause

:cn6
getWord CURRENTLINE $set6 6
pause

:cn7
getWord CURRENTLINE $set7 6
pause

:cn9
getWord CURRENTLINE $set9 7
pause

:cna
getWord CURRENTLINE $seta 6
pause

:cnb
getWord CURRENTLINE $setb 5
pause

:cnc
getWord CURRENTLINE $setc 6
IF ($cn1 <> 0)
   IF ($set1 <> $cn1)
	setVar $cn1change 1
	send "1"
   END
END
IF ($cn2 <> 0)
   IF ($set2 <> $cn2)
	 setVar $cn2change 1
	 send "2"
   END
END
IF ($cn3 <> 0)
   IF ($set3 <> $cn3)
	 setVar $cn3change 1
 	 send "3"
   END
END
IF ($cn4 <> 0)
   IF ($set4 <> $cn4)
         setVar $cn4change 1
         send "4" $cn4 "*"
   END
END
IF ($cn5 <> 0)
   IF ($set5 <> $cn5)
         setVar $cn5change 1
         send "5"
   END
END
IF ($cn6 <> 0)
   IF ($set6 <> $cn6)
         setVar $cn6change 1
 	         send "6"
   END
END
IF ($cn7 <> 0)
   IF ($set7 <> $cn7)
         setVar $cn7change 1
         send "7"
   END
END
IF ($cn9 <> 0)
   setVar $cn9change 0
       IF ($set9 <> $cn9)
         setVar $cn9change 1
         send "9"
   END
END
IF ($cna <> 0)
   IF ($seta <> $cna)
         setVar $cnachange 1
         send "a"
   END
END
IF ($cnb <> 0)
   IF ($setb <> $cnb)
         setVar $cnbchange 1
         send "b"
   END
END
IF ($cnc <> 0)
   IF ($setc <> $cnc)
	 setVar $cncchange 1
	 send "c"
   END
END
send "qq"
return
include "source\include\switchboard.ts"
