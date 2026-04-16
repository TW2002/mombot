	gosub :BOT~loadVars
	
    loadVar $MAP~STARDOCK
	loadVar $MAP~home_sector
	loadvar $ship~cap_file
	loadvar $planet~planet_file
	loadvar $game~port_max

	gosub :combat~init 
	#for auto kill on surround
	setvar $grid~kill true

 

	setVar $BOT~help[1]  $BOT~tab&"alienhunt {corp} {sell} {refuel} {upgrade} {cannon} {return}"
	setVar $BOT~help[2]  $BOT~tab&"          {passive} {buyfig} {buyshield} {patp} {home} "
	setVar $BOT~help[3]  $BOT~tab&"          {"&#34&"ship_filter"&#34&"} {"&#34&"alien_filter"&#34&"} "
	setVar $BOT~help[4]  $BOT~tab&"           "
	setVar $BOT~help[5]  $BOT~tab&"Hunts down aliens and captures their ships.  "
	setVar $BOT~help[6]  $BOT~tab&"Will automatically turn ships and planet personal."
	setVar $BOT~help[7]  $BOT~tab&"Will use shields on planet as well."
	setVar $BOT~help[8]  $BOT~tab&"Best to use with a defender ship."
	setVar $BOT~help[9]  $BOT~tab&"         "
	setVar $BOT~help[10] $BOT~tab&"Options: "
	setVar $BOT~help[11] $BOT~tab&"          {off} - Turns off script and sets planet and ship corporate."
	setVar $BOT~help[12] $BOT~tab&"         {corp} - Doesn't turn everything personal."
	setVar $BOT~help[13] $BOT~tab&"         {sell} - Sell everyship you capture at dock and deposit the cash."
	setVar $BOT~help[14] $BOT~tab&"       {refuel} - Refuel planet if possible."
	setVar $BOT~help[15] $BOT~tab&"      {upgrade} - Upgrade fuel port if possible."
	setVar $BOT~help[16] $BOT~tab&"       {cannon} - Will reset cannon levels after hunting alien."
	setVar $BOT~help[17] $BOT~tab&"       {return} - Return to starting sector after each hunt."
	setVar $BOT~help[18] $BOT~tab&"      {passive} - Surround passively when hunting."
	setVar $BOT~help[19] $BOT~tab&"       {buyfig} - Auto buy figs when low.  Withdraws from citadel."
	setVar $BOT~help[20] $BOT~tab&"    {buyshield} - Auto buy shields when low.  Withdraws from citadel."
	setVar $BOT~help[21] $BOT~tab&"         {patp} - When planet is less than 10% of fuel, run patp."
	setVar $BOT~help[22] $BOT~tab&"         {home} - Move ships to starting sector instead of stardock."
	setVar $BOT~help[23] $BOT~tab&"{"&#34&"ship_filter"&#34&"} - move ships matching this home, stardock for the others"
	setVar $BOT~help[24] $BOT~tab&"{"&#34&"alien_filter"&#34&"} - ignore aliens matching this text"
	gosub :bot~helpfile
 
	setVar $BOT~script_title "Alien Hunter"
	gosub :BOT~banner

	setVar $PLAYER~save TRUE

	setVar $START_FIG_HIT "Deployed Fighters Report Sector "
	setVar $END_FIG_HIT   ":"
	setVar $ALIEN_ANSI    #27 & "[1;36m" & #27 & "["
	setVar $START_FIG_HIT_OWNER ":"
	setVar $END_FIG_HIT_OWNER "'s"
	
	Window alienhunt_script 560 170 ("Alienhunt - " & GAMENAME) ONTOP


	getSectorParameter SECTORS "FIGSEC" $isFigged
	if (($MAP~stardock = 0) OR ($MAP~stardock = ""))
		setVar $SWITCHBOARD~message "Stardock is not defined.  Please define stardock variable in the bot.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	if ($isFigged = "")
		setVar $SWITCHBOARD~message "It appears no grid data is available.  Run a fighter grid checker that uses the sector parameter FIGSEC. (Try figs command)*"
		gosub :SWITCHBOARD~switchboard
		halt
	end

	gosub :PLAYER~quikstats
	setVar $startingLocation $PLAYER~CURRENT_PROMPT
	if ($PLAYER~current_prompt <> "Citadel")
		setVar $SWITCHBOARD~message "Must run alien hunter commands from citadel prompt.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end

	if ($bot~parm1 = "off")
		send "qoccco*cq"
		waitOn "<Computer deactivated>"
		setVar $SWITCHBOARD~message "Alien hunter shutting down.  Making ship and planet corporate again.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end

	if ($player~photons > 0)
		setVar $SWITCHBOARD~message "Please pick a ship with no photons.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	getwordpos $bot~user_command_line $pos "corp"
	if ($pos > 0)
		setvar $corp true
	else
		setvar $corp false
	end
	
	getwordpos $bot~user_command_line $pos "patp"
	if ($pos > 0)
		setvar $patp true
	else
		setvar $patp false
	end

	getwordpos $bot~user_command_line $pos "buyfig"
	if ($pos > 0)
		setvar $buyfig true
	else
		setvar $buyfig false
	end

	getwordpos $bot~user_command_line $pos "buyshield"
	if ($pos > 0)
		setvar $buyshield true
	else
		setvar $buyshield false
	end

	getwordpos $bot~user_command_line $pos "fuel"
	if ($pos > 0)
		setvar $refuel true
	else
		setvar $refuel false
	end

	getwordpos $bot~user_command_line $pos "upgrade"
	if ($pos > 0)
		setvar $upgrade true
	else
		setvar $upgrade false
	end

	getwordpos $bot~user_command_line $pos "sell"
	if ($pos > 0)
		setvar $sell true
	else
		setvar $sell false
	end

	getwordpos $bot~user_command_line $pos "cannon"
	if ($pos > 0)
		setvar $cannon true
	else
		setvar $cannon false
	end

	getwordpos $bot~user_command_line $pos "passive"
	if ($pos > 0)
		setvar $passive true
	else
		setvar $passive false
	end

	getwordpos $bot~user_command_line $pos "return"
	if ($pos > 0)
		setvar $return true
	else
		setvar $return false
	end

	getwordpos $bot~user_command_line $pos "home"
	if ($pos > 0)
		setvar $home true
	else
		setvar $home false
	end
	setvar $filterships ""
	getWordPos $bot~user_command_line $pos #34
	if ($pos > 0)
		getText $bot~user_command_line $filterships #34 #34
		replaceText $bot~user_command_line #34&$filterships&#34 " "
		if ($filterships = false)
			setVar $SWITCHBOARD~message "Invalid ship filter entered.*"
			gosub :SWITCHBOARD~switchboard
			halt			
		else
			setVar $SWITCHBOARD~message "Moving all ships matching: ["&$filterships&"], and bringing them home.*"
			gosub :SWITCHBOARD~switchboard
		end
	end

	setvar $filteraliens ""
	getWordPos $bot~user_command_line $pos #34
	if ($pos > 0)
		getText $bot~user_command_line $filteraliens #34 #34
		replaceText $bot~user_command_line #34&$filteraliens&#34 " "
		if ($filteraliens = false)
			setVar $SWITCHBOARD~message "Invalid alien filter entered.*"
			gosub :SWITCHBOARD~switchboard
			halt			
		else
			setVar $SWITCHBOARD~message "Ignoring aliens matching: ["&$filteraliens&"].*"
			gosub :SWITCHBOARD~switchboard
		end
	end


	

	gosub :PLAYER~getInfo
	setVar $homesector $PLAYER~CURRENT_SECTOR
		
	killalltriggers	
	send "q"
	gosub :PLANET~getPlanetInfo	
	gosub :setwindow
	setvar $starting_sector_cannon $planet~SECTOR_CANNON
	setvar $starting_atmos_cannon $planet~ATMOSPHERE_CANNON
	setvar $sector_total ((($planet~planet_FUEL * $starting_sector_cannon) / 100)/3)

	setTextTrigger need_ig :ig_was_off "Your Interdictor generator is now OFF"
	setTextTrigger skip_ig :skipig "is not equipped with an Interdictor Generator"
	send "q q q q* b"
	waitOn "Do you wish to change it? (Y/N)"
	send "*"
	goto :skipig

	:ig_was_off
		send "y"
		setVar $SWITCHBOARD~message "Turning on ship IG.*"
		gosub :SWITCHBOARD~switchboard

	:skipig
	killalltriggers
	send "l"&$planet~planet&"*"
	waitOn "Planet command"
	if ($corp <> true)
		send "op**tnl1*tnl2*tnl3*snl1*snl2*snl3*tnt1*m***cm0*co*pq"
	else
		send "**tnl1*tnl2*tnl3*snl1*snl2*snl3*tnt1*m***cm0*"
	end	

	if ($cannon = false)
		send "*ls0*la0*"
		setVar $SWITCHBOARD~message "Turning off quasar cannons.*"
		gosub :SWITCHBOARD~switchboard
	end
	gosub :PLAYER~quikstats
	if ($PLAYER~CURRENT_PROMPT = "Citadel")
		if ($corp <> true)
			setVar $SWITCHBOARD~message "Made ship and planet personal for convenience. Turning off military reaction.*"
		else
			setVar $SWITCHBOARD~message "Keeping planet and ship corporate for safety. Might be annoying. Turning off military reaction.*"
		end
		gosub :SWITCHBOARD~switchboard
	else
		setVar $SWITCHBOARD~message "Something went wrong during startup. Ship and planet should be personal now, so be careful.*"
		gosub :SWITCHBOARD~switchboard
	end

	#setTextTrigger need_ig :planet_ig_was_off "Your Interdictor Generator is now ACTIVE"
	#setTextTrigger skip_ig :skipplanetig "This Citadel does not have an Interdictor Generator."
	#send "n"
	#waitOn "Do you want to change this setting? (Y/N)"
	goto :skipplanetig

	:planet_ig_was_off
		send "y"
		setVar $SWITCHBOARD~message "Turning off planet IG.*"
		gosub :SWITCHBOARD~switchboard

	:skipplanetig
	killalltriggers


	if ($sell = true)
		setVar $SWITCHBOARD~message "Selling every ship after capture.  Will deposit money in the citadel.*"
		gosub :SWITCHBOARD~switchboard
	end

	gosub :PLAYER~quikstats

	loadvar $PLAYER~surroundFigs 
	if ($PLAYER~surroundFigs <= 0)
		setvar $PLAYER~surroundFigs 1
	end
	if ($passive = true)
		setvar $player~surroundPassive true
	end
	setVar $PLAYER~onlyAliens TRUE
	setVar $PLAYER~cappingAliens TRUE
	setVar $PLAYER~defenderCapping TRUE
	setVar $PLAYER~surroundAvoidShieldedOnly TRUE

	loadvar $ship~CAP_FILE	
	fileExists $CAP_FILE_chk $ship~CAP_FILE
	if ($CAP_FILE_chk)
		gosub :ship~loadshipinfo
	else
		gosub :ship~getShipCapStats
		gosub :ship~loadShipInfo
	end 

	if ($SHIP~SHIP_OFFENSIVE_ODDS <= 0)
		gosub :SHIP~getShipStats
	end

	while (TRUE)
		#gosub :PLAYER~quikstats
		if (($PLAYER~unlimitedGame = FALSE) AND (($PLAYER~turns-$player~turnsToEmpty) <= $BOT~bot_turn_limit))
			setVar $SWITCHBOARD~message "Turns too low to continue.*"
			gosub :SWITCHBOARD~switchboard
			gosub :gohome
		end
		if (CURRENTFIGHTERS < $SHIP~SHIP_FIGHTERS_MAX)
			if ($buyfig = true)
				gosub :with~run
				gosub :buyfig~run
				gosub :dep~run
			end
            if (CURRENTFIGHTERS < $SHIP~SHIP_FIGHTERS_MAX)
				setVar $SWITCHBOARD~message "Not enough fighters to continue the hunt.*"
				gosub :switchboard~switchboard
				gosub :gohome
            end
		end
		if ($return = true)
			send "p"&$homeSector&"*y"
		end
		if ($cannon = true)
			setVar $percentToSet (((3*$sector_total)*100)/$planet~planet_FUEL)
			if (((($planet~planet_FUEL * $percentToSet) / 100)/3) < $cannonDamage)
				add $percentToSet 1
			end
			if ($percentToSet > 100)
				setVar $percentToSet 100
			end

			send " *ls"&$percentToSet&"* la"&$starting_atmos_cannon&"*"  

		end
		setVar $lastTarget ""
		setVar $thisTarget ""

		gosub :attackandmoveship

		#loadvar $bot~last_alien_hit_sector
		#if (($lastSectorAttacked > 0) and ($bot~last_alien_hit_sector > 0) and ($bot~last_alien_hit_sector <> $lastSectorAttacked))
		#	setvar $dropSector $bot~last_alien_hit_sector
		#	gosub :go_to_drop_sector
		#end
		setvar $switchboard~message "* Waiting for something to hunt..*"
		gosub :bot~echo 

		:bot~restart
		gosub :validateFighterHit
		gosub :attackandmoveship
		gosub :dosurround
		gosub :attackandmoveship
	end
	halt

:validateFighterHit
	send "q "
	gosub :planet~getplanetinfo
	gosub :setwindow
	send "c "
	if ($planet~planet_fighters < ($planet~planet_fighters_max/10))
		if ($buyfig = true)
			gosub :with~run
			gosub :buyfig~run
			gosub :dep~run
		else
			setVar $SWITCHBOARD~message "Alien hunter shutting down.  Making ship and planet corporate again.  Check to make sure I made it home.*"
			gosub :SWITCHBOARD~switchboard
			gosub :gohome
		end
	end
	loadvar $planet~planet_shields
	if (($planet~planet_shields <= 300) and ($buyshield = true))
			gosub :with~run
			gosub :buyshield~run
			gosub :dep~run
	end
	setTextLineTrigger fig :checkFighter "Deployed Fighters Report Sector"
	setTextTrigger armid :attackSectorMine "Your mines in "
	setTextLineTrigger liftsoff :pwarpConfirmed " lifts off from "
	setTextLineTrigger 	warps 	:pwarpConfirmed 	"warps into the sector."
	setTextLineTrigger 	power 	:pwarpConfirmed 	"is powering up weapons systems!"
	settextlinetrigger  wave    :pwarpConfirmed    " launches a wave of fighters at the "
	
	gosub :bot~disconnecttriggers
	pause

	:attackSectorMine
		gosub :validateMineHit
		if ($isValid = true)
			goto :go_to_drop_sector
		else
			setTextTrigger armid :attackSectorMine "Your mines in "
			pause
		end
	pause
	:checkFighter
		cutText CURRENTLINE&" " $radio 1 1
		getText CURRENTLINE $dropSector $START_FIG_HIT $END_FIG_HIT
		getText CURRENTANSILINE $alien_check $START_FIG_HIT_OWNER $END_FIG_HIT_OWNER
		getWordPos $alien_check $apos $ALIEN_ANSI
		setvar $fighter_line CURRENTLINE
		lowercase $fighter_line
		lowercase $filteraliens
		setvar $alien_type_match 0
		if ($filteraliens <> "")
			getWordPos $fighter_line $alien_type_match $filteraliens
		end
		if ((($apos <= 0) OR ($radio <> "D")) or (($filteraliens <> "") AND ($alien_type_match > 0)))
			setTextLineTrigger fig :checkFighter "Deployed Fighters Report Sector"
			pause
		end

	:go_to_drop_sector
		killAllTriggers
		if ($dropSector <> $player~current_sector)
			if ($cannon = true)
                send "*ls0* la0*  "
            end
            send "p " $dropSector "*y"
			setTextLineTrigger pwarpNotOk :pwarpTryAdjacent "You do not have any fighters in Sector "
			setTextLineTrigger pwarpOk :pwarpConfirmed " Planetary TransWarp Drive Engaged! "
			setTextLineTrigger pwarpOk2 :pwarpConfirmed "You are already in that sector!"
			pause
			
			:pwarpDone
				killAllTriggers
		end
		:pwarpTryAdjacent
			killAllTriggers
			setSectorParameter $dropSector "FIGSEC" FALSE
			gosub :findAdjacent
			gosub :attemptDrop
			gosub :dosurround
			setvar $pwarp~destination $dropSector
			gosub :ensureCitadelForPwarp
			gosub :pwarp~run
			setVar $index 1
			setVar $checkSector SECTOR.WARPS[$dropSector][$index]
			while ($checkSector > 0)
				setvar $pwarp~destination $checksector
				gosub :ensureCitadelForPwarp
				gosub :pwarp~run
				gosub :attackandmoveship
				add $index 1
				setVar $checkSector SECTOR.WARPS[$dropSector][$index]
			end
			return
		:pwarpConfirmed
			killalltriggers
			gosub :player~quikstats
			gosub :dosurround
			gosub :attackandmoveship
			if ($dropSector <= 0)
				setvar $dropsector $player~current_sector
			end
			setVar $index 1
			setVar $checkSector SECTOR.WARPS[$dropSector][$index]
			while ($checkSector > 0)
				setvar $pwarp~destination $checksector
				gosub :ensureCitadelForPwarp
				gosub :pwarp~run
				gosub :attackandmoveship
				add $index 1
				setVar $checkSector SECTOR.WARPS[$dropSector][$index]
			end

return
:findAdjacent
	getSectorParameter $dropSector "FIGSEC" $isFigged
	setVar $i 1
	setVar $checkSector SECTOR.WARPS[$dropSector][$i]
	setArray $targetSectors 6
	setVar $targetCount 0
	while ($checkSector > 0)
#		getSectorParameter $checkSector "FIGSEC" $isFigged
#		if ($isFigged = TRUE)
			add $targetCount 1
			setVar $targetSectors[$targetCount] $checkSector
#		end
		add $i 1
		setVar $checkSector SECTOR.WARPS[$dropSector][$i]
	end
	if ($targetCount <= 0)
		setvar $switchboard~message " No Targets..*"
		gosub :bot~echo 
		setVar $targetSectors[1] $dropSector
	end

return
:attemptDrop
	
	if ($targetCount > 0)
		getRnd $randomTarget 1 $targetCount
		setVar $gotoSector $targetSectors[$randomTarget]
		setvar $pwarp~destination $gotoSector
		gosub :ensureCitadelForPwarp
		gosub :pwarp~run
	end
	
return

:ensureCitadelForPwarp
	gosub :PLAYER~quikstats
	if ($PLAYER~CURRENT_PROMPT = "Command")
		gosub :PLANET~landingSub
		gosub :PLAYER~quikstats
	end
	if ($PLAYER~CURRENT_PROMPT = "Planet")
		send "c "
		gosub :PLAYER~quikstats
	end
return


:dosurround
	if ($player~surroundPassive = true)
		gosub :dscan~run		
	end
	send "q "
	gosub :PLANET~getPlanetInfo
	gosub :setwindow
	send "q "
	gosub :grid~surround
	setVar $SWITCHBOARD~message "Surrounded sector "&$PLAYER~CURRENT_SECTOR&".*"
	gosub :SWITCHBOARD~switchboard
	send "l "&$planet~planet&"* m*** c "
	setvar $switchboard~message "* " & ANSI_14 & $PLAYER~surroundOutput & "*" & ANSI_7
	gosub :bot~echo

return

:attackandmoveship
		gosub :PLAYER~quikstats
		setvar $startingLocation $player~current_prompt
		if ($player~current_prompt = "Command")
			gosub :PLANET~landingSub		
			gosub :PLAYER~currentprompt
		end
		setVar $SECTOR~federalCount 0
		setvar $SECTOR~fakeTraderCount 1
		setVar $targetsFound FALSE
		while ($SECTOR~fakeTraderCount > $SECTOR~federalCount)
			gosub :PLAYER~quikstats
			setvar $player~startingLocation $player~current_prompt
			if ($player~current_prompt = "Command")
				gosub :PLANET~landingSub		
				gosub :PLAYER~currentprompt
				setvar $player~startingLocation $player~current_prompt
			end
			goSub :SECTOR~getSectorData			
			if ($SECTOR~realTraderCount > $SECTOR~corpieCount)
				setvar $targetsFound true
				gosub :combat~fastCitadelAttack
				send "'Just attacked (and hopefully killed) a trader in my sector! Sector "&$player~current_sector&".*"
			end
			if ($SECTOR~fakeTraderCount > $SECTOR~federalCount)
				setVar $targetsFound TRUE
				setvar $lastSectorAttacked $player~current_sector
				goSub :combat~fastCapture
			end
		end
		gosub :PLAYER~quikstats
		if ($player~current_prompt = "Command")
			gosub :PLANET~landingSub
		end
		if ($targetsFound = true)
			send "q m*** c "
			gosub :PLAYER~quikstats
			setVar $startingSector $PLAYER~CURRENT_SECTOR
			setVar $player~shields_needed ($SHIP~SHIP_SHIELD_MAX - $PLAYER~SHIELDS)
			setVar $planet~planet_shields_to_take ($player~shields_needed/10)
				
			if (($planet~planet_shields_to_take > 0) and ($planet~planet_shields > 360))
				send "gf"&$planet~planet_shields_to_take&"*"
			end
		else
			setVar $startingSector CURRENTSECTOR		
		end

		if ($targetsFound = TRUE)

			send "s*  "
			waiton "Warps to Sector(s) : "
			setVar $figowner SECTOR.FIGS.OWNER[currentsector]
			setVar $figCount SECTOR.FIGS.QUANTITY[currentsector]

			if (($figcount <= 0) or (($figOwner <> "belong to your Corp") AND ($figOwner <> "yours")))
				gosub :xenter~run
			end		
			setVar $emptyShips SECTOR.SHIPCOUNT[currentsector]
			if ($emptyShips > 0)
				loadVar $MAP~stardock
				if ($filterships <> "")
					setVar $BOT~user_command_line " moveship h silent "&#34&$filterships&#34
					setVar $BOT~parm1 $MAP~home_sector
					gosub :moveship~run
					send "s*  "
					gosub :player~quikstats
					setVar $emptyShips SECTOR.SHIPCOUNT[currentsector]
				end
				if ($emptyships > 0)
					if ($sell)
						if ($home = true)
							setVar $BOT~user_command_line " moveship "&$homesector&" silent"
							setVar $BOT~parm1 $homesector
						else
							setVar $BOT~user_command_line " moveship "&$MAP~stardock&" sell dep silent"
							setVar $BOT~parm1 $MAP~stardock
						end
					else
							setVar $BOT~user_command_line " moveship "&$MAP~stardock&" silent"
							setVar $BOT~parm1 $MAP~stardock						
					end
					gosub :moveship~run
					if ($startingSector <> currentsector)
						setvar $mow~destination $startingSector
						setvar $mow~deploy "1"
						gosub :mow~run
						gosub :PLANET~landingSub
					end
				end
				gosub :PLAYER~quikstats
				if ($player~current_prompt = "Command")
					gosub :PLANET~landingSub
				end
			end
		end

		killalltriggers
		setvar $is_fuel_buyer PORT.BUYFUEL[currentsector]
		setvar $is_port PORT.EXISTS[currentsector]
		setvar $class PORT.CLASS[currentsector]
		setvar $under_construction (PORT.BUILDTIME[currentsector] > 0)
		getSectorParameter currentsector "BUSTED" $isBusted
		getSectorParameter currentsector "UPGRADEF" $isUpgradedFuel
		loadvar $planet~planet_fuel_max
		loadvar $planet~planet_fuel
		if (($refuel = true) and ($is_fuel_buyer <> true) and ($is_port = true) and ($class > 0) and ($isBusted <> true) and ($under_construction <> true) and ($planet~planet_fuel < ($planet~planet_fuel_max-$game~port_max)))
			if (($upgrade = true) and ($isUpgradedFuel <> true))
				gosub :max~run
				gosub :setwindow
			else
				send "c r*q "
			end
			setvar $fuel PORT.FUEL[currentsector]
			if ((($upgrade = true) and ($fuel > 10000)) or (($upgrade <> true) and ($fuel > 1000)))
				gosub :buyfuel~run
			end
		end
		if (($patp = true) and ($planet~planet_fuel < ($planet~planet_fuel_max/10)))
			setvar $patp~minimum 1000
			setvar $patp~upgrade true
			gosub :patp~run
		end
		killalltriggers
return

:validateMineHit
	setVar $isValid FALSE
	cutText CURRENTLINE&"    " $ck 1 1
	if ($ck <> "Y")
		return
	end
	getText CURRENTLINE $dropSector "Your mines in " " did"
	getText CURRENTANSILINE&"[][][]" $alien_check "Your mines in" "[][][]"
	getWordPos CURRENTLINE $pos " damage to "
	getWordPos $alien_check $apos $ALIEN_ANSI
	if (($apos > 0) OR ($pos = 0))
		return
	end
	setVar $isValid TRUE
return


:setWindow
	setVar $msg "*   Current Sector: " & currentsector &"                            "
	cutText $msg $msg 1 30
	if ($player~unlimitedGame = true)
		setVar $msg $msg & "   Turns: Unlimited"
	else
		setVar $msg $msg & "   Turns: " & currentturns
	end
	setarray $window_lines 7
	setvar $window_lines[1] "* Alienhunt Planet: " & $planet~planet
	setvar $window_lines[2] "* ---------------------------------------------------------------"
	loadvar $planet~planet_fuel
	format $planet~planet_fuel $formatted_value NUMBER
	setvar $window_lines[3] "*      Planet Fuel: " & $formatted_value&"                          "
	cutText $window_lines[3] $window_lines[3] 1 30
	loadvar $planet~planet_fighters
	format $planet~planet_fighters $formatted_value NUMBER
	setvar $window_lines[4] "   Planet Fighters: " & $formatted_value
	loadvar $planet~planet_shields
	format $planet~planet_shields $formatted_value NUMBER
	setvar $window_lines[5] "*   Planet Shields: " & $formatted_value&"                          "
	cutText $window_lines[5] $window_lines[5] 1 30
	loadvar $planet~citadel_credits
	format $planet~citadel_credits $formatted_value NUMBER
	setvar $window_lines[6] "   Citadel Credits: " & $formatted_value
	format $player~fighters $formatted_value NUMBER
	setvar $window_lines[7] "*    Ship Fighters: " & $formatted_value&"*"

	setvar $i 1
	while ($i <= 7)
		setvar $msg $msg&$window_lines[$i]
		add $i 1
	end
	setWindowContents alienhunt_script $msg 
	setVar $window_content $msg 
	replaceText $window_content "*" "[][]"
	saveVar $window_content
return

:gohome
	setvar $pwarp~destination $homesector
	gosub :ensureCitadelForPwarp
	gosub :pwarp~run
	setvar $scrub~seek true
	gosub :scrub~run
	if ($cannon = true)
		send " *ls"&$percentToSet&"* la"&$starting_atmos_cannon&"*"  
	end
	send "qoccco*cq"
	waitOn "<Computer deactivated>"

	halt
return


#INCLUDES:
include "source\include\bot"
include "source\include\combat"
include "source\include\player"
include "source\include\planet"
include "source\include\ship"
include "source\include\grid"
include "source\include\sector"
include "source\include\buyfig"
include "source\include\buyshield"
include "source\include\dep"
include "source\include\with"
include "source\include\dscan"
include "source\include\moveship"
include "source\include\xenter"
include "source\include\mow"
include "source\include\max"
include "source\include\pwarp"
include "source\include\buyfuel"
include "source\include\scrub"
include "source\include\patp"
