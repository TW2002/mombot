#
#loadVar $bot~user_command_line
#loadvar $PLAYER~unlimitedGame
#loadvar $bot~subspace

gosub :LOADVARS~LOADVARS
gosub :HELP~INITIALIZE
loadVar $GAME~rob_factor
loadVar $bot~bot_name
loadvar $bot~subspace




setVar $HELP~help[1] $HELP~tab&" rxr [ship1] [ship2] {ship3} {shipn} {resetlra}*"
setVar $HELP~help[2] $HELP~tab&"  "
setVar $HELP~help[3] $HELP~tab&"  Takes a list of ships and robs those ports until"
setVar $HELP~help[4] $HELP~tab&"  it has nothing to rob or runs out of xport options."
setVar $HELP~help[5] $HELP~tab&"  "
setVar $HELP~help[6] $HELP~tab&"  Does not mega rob."
setVar $HELP~help[7] $HELP~tab&"  "
setVar $HELP~help[8] $HELP~tab&"  - {resetlra} will reset last rob sector and exit"

gosub :HELP~HELPFILE

setvar $SWITCHBOARD~MESSAGE "Rob Xport Rob starting up!*"
gosub :SWITCHBOARD~SWITCHBOARD

if ($bot~parm1 = "resetlra")
	setSectorParameter 1 "LRA" 1
	send "'Last rob sector reset*"
	halt
end


# minRob - lets make min rob 80% of max rob but perhaps top it out at 500k (in case of insance exp)


# $robSettings[1] ship
# $robSettings[2] sector
# $robSettings[3] range
# $robSettings[4] UNUSEDMISTAKEUSEFORSOMETHINGTOMAKEMENOTLOOKLAZY
# $robSettings[5] busted
# $robSettings[6] creditscheck
# $robSettings[7] credits
# $robSettings[8] thisloop

SetVar $robSettings 0
setVar $shipi 0
setVar $currentShip 0
setVar $currentIndex 0
setVar $goodShips 0
getSectorParameter	1 "LRA" $last_rob_attempt


:StartupChecks

	gosub :PLAYER~quikstats
	setVar $bot~validPrompts "Command"
	setVar $bot~startingLocation $PLAYER~CURRENT_PROMPT

	if (($PLAYER~TURNS = 0) and ($PLAYER~unlimitedGame = FALSE))
		setvar $SWITCHBOARD~MESSAGE "I have no turns*"
		gosub :SWITCHBOARD~SWITCHBOARD
		halt
	end
	gosub :PLAYER~CHECKSTARTINGPROMPT
	cutText $PLAYER~ALIGNMENT $neg_ck 1 1
	stripText $PLAYER~ALIGNMENT "-"
	if ((($PLAYER~ALIGNMENT < 100) and ($neg_ck = "-")) OR ($neg_ck <> "-"))
		setvar $SWITCHBOARD~MESSAGE "Need -100 Alignment Minimum*"
		gosub :SWITCHBOARD~SWITCHBOARD
		halt
	end

# GET SHIP NUMS FROM COMMAND LINE
	setVar $cline $bot~user_command_line & " zzyyzzyyzz"

	setVar $wi 1
	getWord $cline $shipnum $wi 

	while ($shipnum <> "zzyyzzyyzz")

		isNumber $number $shipnum
		if (($number = 1) and ($shipnum <> 0))
			add $shipi 1
			setVar $robSettings[$shipi][1] $shipnum

		end
		if ($wi > 10)
			setVar $shipnum "zzyyzzyyzz"
		end
		add $wi 1
		getWord $cline $shipnum $wi 
	end
	
# CHECK WE HAVE ACCESS AND GATHER ROB INFO


	send "czq"
	waitOn "---------------------------------"
	:nextShip
	setTextLineTrigger		Ships	:Ships
	pause
	:Ships
		getWord CURRENTLINE $shipNum 1

		isNumber $tst $shipNum
		if ($tst <> 0)
			setVar $tempLine CURRENTLINE
			replaceText $tempLine "+" " "
	
			getWord $tempLine $sector 2 
			
			setVar $i 1
			while ($i <= $shipi)
				if ($robSettings[$i][1] = $shipNum)
					setVar $y 1
					while ($y <= $shipi)
						if ($sector = $robSettings[$y][2])
							setVar $SWITCHBOARD~message "Ship in this sector " & $shipNum & "/" &  $sector & " is a double up sector; skipping*"
							gosub :SWITCHBOARD~switchboard
							goto :NextShip
						end
						add $y 1
					end

					setVar $robSettings[$i][2] $sector
					getSectorParameter $sector "BUSTED" $bustthissec
					getSectorParameter $sector "FAKEBUST" $fakethissec 
					if (($bustthissec = 1) or ($fakethissec = 1))
						setVar $robSettings[$i][5] 1
						setVar $SWITCHBOARD~message "Ship " & $shipNum & "/" &  $sector & " has had a bust skipping*"
						gosub :SWITCHBOARD~switchboard
					else
						setVar $robSettings[$i][5] 0
						add $goodShips 1
					end
					
				end
				add $i 1
			end
			if ($shipNum = $PLAYER~SHIP_NUMBER)
				# just note we are in one of the current ships
				setVar $currentShip $shipNum
			end
			goto :NextShip
		end


	
	
	
	
	if ($goodShips < 2)
		setVar $SWITCHBOARD~message "Less than two ships in safe rob sectors*"
		gosub :SWITCHBOARD~switchboard
		halt
	end

	setVar $rob ($GAME~rob_factor*$PLAYER~EXPERIENCE)
	
	setPrecision 1
	setVar $minRob ($rob * 0.8)
	round $minRob 0
	setPrecision 0

	if ($player~current_sector = $last_rob_attempt)
		goSub :xportToNext
	end

	setVar $found 0
	setVar $i 1
	while ($i <= $shipi)

		if ($robSettings[$i][1] = $PLAYER~ship_number)
			setVar $found 1
		end
		
		add $i 1
	end
	

	if ($found = 0)

		goSub :xportToNext
	end
    
    setVar $lc 0
    setVar $lci 0
    setVar $lowCash "Low Cash Sectors: "
    
    # turn limit should also be factor
    setVar $go 1
    while ($go = 1)
	
	goSub :shipReport
	goSub :rob
	goSub :shipReport
	goSub :xportToNext
	
	#waitfor "Rank and Exp   :"


    end
    
    
    halt



  :xportToNext
	gosub :PLAYER~quikstats
	setVar $i 1
	while ($i <= $shipi)
		setVAr $robSettings[$i][8] 0
		add $i 1
	end
	
	:tryAgain

	
	setVar $i 1
	setVar $nextShip 0
	setVar $nextShipi 0
	setVar $nextShipCash 0
	while ($i <= $shipi)


		if ($robSettings[$i][8] = 0)
			if ($robSettings[$i][5] = 0)
				if (($robSettings[$i][6] = 0) or (($robSettings[$i][6] = 1) and ($robSettings[$i][7] > $minRob)))
					if ($robSettings[$i][2] <> $last_rob_attempt)
						if ($nextShipi <> 0)
							# Prioritise the ship that hasn't had port check OR the most cash
							if ($robSettings[$i][6] = 0)
								setVar $nextShip $robSettings[$i][1]
								setVar $nextShipi $i
								setVar $currentIndex $i
								setVar $nextShipCash $robSettings[$i][7]
								# always takes precdence
								setVar $i 100
							elseif ($robSettings[$i][7] > $nextShipCash)
								setVar $nextShip $robSettings[$i][1]
								setVar $nextShipi $i
								setVar $currentIndex $i
								setVar $nextShipCash $robSettings[$i][7]
							end
						else
							# First good one
							setVar $nextShip $robSettings[$i][1]
							setVar $nextShipi $i
							setVar $currentIndex $i
							setVar $nextShipCash $robSettings[$i][7]
							if ($robSettings[$i][6] = 0)
								# if we've never been here, it should always take precedence and go there.
								setVar $i 100
							end
						end
	
					end
				else
					setVar $foundLCi 0
					setVar $xx 1
					while ($xx <= $lci)
						if ($robSettings[$i][1]= $lc[$xx])
							setVar $foundLCi 1
						end
						add $xx 1
					end
					if ($foundLCi = 0)
						setVar $lowCash $lowCash & " " & $robSettings[$i][1] & "/" & $robSettings[$i][2]
						add $lci 1
						setVar $lc[$lci] $robSettings[$i][1]
					end
				end			
			end
		end
		add $i 1
	end
	
	if ($nextShip = 0)
		
		setVar $i 1
		setVar $exitMsg "Last Rob: " & $last_rob_attempt & " Busts: "
		while ($i <= $shipi)
				
			if ($robSettings[$i][5] = 1)
				setVar $exitMsg $exitMsg & " " & $robSettings[$i][1] & "/" & $robSettings[$i][2]
			end
			add $i 1
		end
		setVar $SWITCHBOARD~message "No ships in range/All busted/Nothing to rob*" & $exitMsg & "*" & $lowCash & "*"
		gosub :SWITCHBOARD~switchboard
		halt
	end

	setVar $xportSuccess 0
	goSub :xport
	if ($xportSuccess = 0)
		setVar $robSettings[$nextShipi][8] 1
		setVar $SWITCHBOARD~message "That ship was out of range; lets try again.*"
		gosub :SWITCHBOARD~switchboard
		goto :tryAgain


	end
	gosub :PLAYER~quikstats
  return
    

:xport
	setTextLineTrigger bad_ship_trig    :ship_not_available             "That is not an available ship."
	setTextLineTrigger bad_range_trg    :out_of_range           "only has a transport range of"
	setTextLineTrigger cannot_xport     :cannot_xport           "Access denied!"
	setTextTrigger     xport_passw      :xport_password         "Enter the password for"
	setTextLineTrigger xport_good       :xport_good             "Security code accepted, engaging transporter control."
	
	send "x   " & $nextShip & "*    *"
	
	pause

	:ship_not_available
		killalltriggers
		setVar $SWITCHBOARD~message "Alert Ship Missing!! Maybe under attack.*"
		gosub :SWITCHBOARD~switchboard
		return
	:out_of_range
	:xport_password
		killalltriggers
		setVar $SWITCHBOARD~message "This ship had a password!*"
		gosub :SWITCHBOARD~switchboard
		return
	:cannot_xport
		killalltriggers
		return
	:xport_good
		setVar $xportSuccess 1
		killalltriggers


return


:rob


	

	send "p r * r"
	setTextLineTrigger fake :port_fake "Busted!"
	setTextLinetrigger mega :port_ok "port has in excess of"
	pause
	:port_fake
		killAllTriggers
		setVar $robSettings[$currentIndex][5] 1
		setSectorParameter $PLAYER~CURRENT_SECTOR "FAKEBUST" TRUE
		setVar $SWITCHBOARD~message "Fake Bust in sector: " & $robSettings[$currentIndex][2] & " - should not happen?*"
		gosub :SWITCHBOARD~switchboard
		return
	:port_ok
	
		killAllTriggers
		setVar $rob ($GAME~rob_factor*$PLAYER~EXPERIENCE)
		getWord CURRENTLINE $port_cash 11
		stripText $port_cash ","
		if ($robSettings[$currentIndex][6] = 0)
			setVar $robSettings[$currentIndex][6] 1
			setVar $robSettings[$currentIndex][7] $port_cash
		end

		setVar $port_cash (($port_cash*10)/9)
		if ($port_cash < $rob)
			setVar $rob $port_cash
		end
		send $rob "*"
		setVar $actual_cash $rob
		setTextLineTrigger port_empty :port_issue "Maybe some other day, eh?"
		setTextLineTrigger mega_suc :port_suc "Success!"
		setTextLineTrigger port_bust :port_bust "Busted!"
		pause
		:port_issue
			killAllTriggers
			setVar $SWITCHBOARD~message "No Credits at this port, bummer*"
			gosub :SWITCHBOARD~switchboard
			return
		:port_bust
			killAllTriggers
			
			setSectorParameter $PLAYER~CURRENT_SECTOR "BUSTED" TRUE
			send "'<"&$bot~subspace&">[Busted:"& $PLAYER~CURRENT_SECTOR "]<"&$bot~subspace&">*"
			
			setVar $robSettings[$currentIndex][5] 1
			return
		:port_suc
			killAllTriggers
			setVar $robSettings[$currentIndex][7] ($robSettings[$currentIndex][7] - $actual_cash)
			setSectorParameter 1 "LRA" $PLAYER~CURRENT_SECTOR
			SetVar $ckLRA $PLAYER~CURRENT_SECTOR
			SaveVar $ckLRA    
			setVar $last_rob_attempt $PLAYER~CURRENT_SECTOR
			setVar $SWITCHBOARD~message "Success! - " & $actual_cash & " credits robbed*"
			gosub :SWITCHBOARD~switchboard

		return


	
return

:shipReport
	# DEBUG ONLY
	return
	setVar $s 1
	while ($s <= $shipi)
		echo "*###"
		echo "ship:" $robSettings[$s][1] 
		echo "sector:" $robSettings[$s][2] 
		echo "buster:" $robSettings[$s][5] 
		echo "creditscheck:" $robSettings[$s][6] 
		echo "credits:" $robSettings[$s][7] 

		add $s 1
	end


return


#INCLUDES:
include "source\include\loadvars"
include "source\include\help"
include "source\include\player"
include "source\include\switchboard"
