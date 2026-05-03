	logging off
	gosub :LOADVARS~LOADVARS
	gosub :HELP~INITIALIZE
	loadVar $GAME~LATENCY
	setVar $HELP~HELP[1]  $HELP~TAB&"citkill {"&#34&"player name"&#34&"|corp#} {sg} {dt}"
	setVar $HELP~HELP[2]  $HELP~TAB&"        {empty} {smart} {override}"
	setVar $HELP~HELP[3]  $HELP~TAB&"Citadel Killer destroys enemy ships from planet citadel."
	setVar $HELP~HELP[4]  $HELP~TAB&"  "
	setVar $HELP~HELP[5]  $HELP~TAB&"{"&#34&"player name"&#34&"}   - Player to target, name must be"
	setVar $HELP~HELP[6]  $HELP~TAB&"                    surrounded by double quotes"
	setVar $HELP~HELP[7]  $HELP~TAB&"{corp#}           - Corporation number to target"
	setVar $HELP~HELP[8]  $HELP~TAB&"{sg}              - Shotgun mode, fires waves at"
	setVar $HELP~HELP[9]  $HELP~TAB&"                    first three possible targets"
	setVar $HELP~HELP[10] $HELP~TAB&"{dt}              - Doubletap mode, fires two waves"
	setVar $HELP~HELP[11] $HELP~TAB&"                    before refurbing"
	setVar $HELP~HELP[12] $HELP~TAB&"{empty}           - Will capture empty ships in sector"
	setVar $HELP~HELP[13] $HELP~TAB&"{smart}           - Notices changes in ship type/target"
	setVar $HELP~HELP[14] $HELP~TAB&"{override}        - Overrides safety on attacking defender bonus ships"
	setVar $HELP~HELP[15] $HELP~TAB&"{photon} (NA)     - Will fire photon to adjacent fig hits"
	setVar $HELP~HELP[16] $HELP~TAB&"{onetap}          - fire once only"
	setVar $HELP~HELP[17] $HELP~TAB&"{slowmo}          - Adds random pause between waves."
	
	gosub :HELP~HELPFILE

	setvar $SWITCHBOARD~MESSAGE "Citadel Killer starting up!*"
	gosub :SWITCHBOARD~SWITCHBOARD

	:cit_kill
	
	gosub :combat~init 
	gosub :player~quikstats	
	gosub :player~getInfo
	setVar $player~startingLocation $player~CURRENT_PROMPT
	setVar $player~targetingPerson FALSE
	setVar $player~targetingCorp FALSE
	setVar $player~target ""
		setvar $bot~mode "Citkill"
		saveVar $bot~mode
		
		if ($player~startingLocation <> "Citadel")
			setvar $switchboard~message "Citadel Killer must be run from the Citadel Prompt*"
			gosub :switchboard~switchboard
			setVar $bot~mode "General"
			savevar $bot~mode
			halt
		end
		isNumber $test $bot~parm1
		if ($test)
			if ($bot~parm1 > 0)
				setVar $player~targetingCorp TRUE
				setVar $player~target $bot~parm1
			end
		else
			getWordPos $bot~user_command_line $pos #34
			if ($pos > 0)	
				setVar $bot~user_command_line $bot~user_command_line&" "
				getText $bot~user_command_line $target " "&#34 #34&" "
				if ($target <> "")
					setVar $player~targetingPerson TRUE
					lowercase $player~target
					stripText $bot~user_command_line " "&#34&$player~target&#34&" "
				else
					setVar $player~targetingPerson FALSE
				end
			end
		end
		getWordPos $bot~user_command_line $pos "dt"
		if ($pos > 0)
			setVar $player~doubletap TRUE
		else
			setVar $player~doubletap FALSE
		end
		getWordPos $bot~user_command_line $pos "empty"
		if ($pos > 0)
			setVar $capEmptyShips TRUE
			setvar $player~empty_ships_only true
		else
			setVar $capEmptyShips FALSE
		end
		getWordPos $bot~user_command_line $pos "override"
		if ($pos > 0)
			setVar $override TRUE
		else
			setVar $override FALSE
		end
		getWordPos $bot~user_command_line $pos "smart"
		if ($pos > 0)
			setVar $player~smart TRUE
		else
			setVar $player~smart FALSE
		end
		getWordPos $bot~user_command_line $pos "sg"
		if ($pos > 0)
			setVar $player~shotgun TRUE
		else
			setVar $player~shotgun FALSE
		end
		getWordPos $bot~user_command_line $pos "onetap"
		if ($pos > 0)
			setVar $player~onetap TRUE
		else
			setVar $player~onetap FALSE
		end
		
		getWordPos $bot~user_command_line $pos "slowmo"
		if ($pos > 0)
			setVar $player~slowmo TRUE
		else
			setVar $player~slowmo FALSE
		end
		
		loadvar $ship~CAP_FILE
		fileExists $CAP_FILE_chk $ship~CAP_FILE
		if ($CAP_FILE_chk)
			gosub :ship~loadshipinfo
		else
			gosub :ship~getShipCapStats
			gosub :ship~loadShipInfo
		end 

	:start_cit_kill

	gosub :player~quikstats
	if ($player~CURRENT_PROMPT <> "Citadel")
		setvar $switchboard~message "Must start at the citadel prompt*"
		gosub :switchboard~switchboard
		halt
	end

	gosub :ship~getShipStats

:warning
	send "q m * * * "
	gosub :player~quikstats
	gosub :planet~getPlanetInfo
	format $planet~planet_fighters $formatted_fighters NUMBER
	
	if ($player~targetingPerson)
		setvar $switchboard~message "Citadel Killer Targeting "&$target&" :: Running on Planet "&$planet~planet&" :: "&$formatted_fighters&" Fighters available on surface.*"
		gosub :switchboard~switchboard
	elseif ($player~targetingCorp)
		setvar $switchboard~message "Citadel Killer Targeting Corp "&$target&" :: Running on Planet "&$planet~planet&" :: "&$formatted_fighters&" Fighters available on surface.*"
		gosub :switchboard~switchboard
	else
		setvar $switchboard~message "Citadel Killer :: Running on Planet "&$planet~planet&" :: "&$formatted_fighters&" Fighters available on surface.*"
		gosub :switchboard~switchboard
	end
	if ($player~shotgun)
		setvar $switchboard~message "Shotgun mode enabled.*"
		gosub :switchboard~switchboard
	elseif ($player~doubletap)
		setvar $switchboard~message "Doubletap mode enabled.*"
		gosub :switchboard~switchboard
	end
	send "c  "

	goto :scanit_cit_kill

:main
	killalltriggers
	gosub :player~quikstats
	setTextLineTrigger 	limp 	:scanit_cit_kill 	"Limpet mine in "&$player~CURRENT_SECTOR
	setTextLineTrigger 	warps 	:scanit_cit_kill 	"warps into the sector."
	setTextLineTrigger 	lifts 	:scanit_cit_kill 	"lifts off from"
	setTextLineTrigger 	deffig 	:scanit_cit_kill 	"Deployed Fighters Report Sector "&$player~CURRENT_SECTOR
	setTextLineTrigger 	secgun 	:scanit_cit_kill 	"Quasar Cannon on"
	setTextLineTrigger 	ig		:scanit_cit_kill 	"Shipboard Computers The Interdictor Generator on"
	setTextLineTrigger 	power 	:scanit_cit_kill 	"is powering up weapons systems!"
	settextlinetrigger  wave    :scanit_cit_kill    " launches a wave of fighters at  "
	settextlinetrigger  planet  :scanit_cit_kill	" launches a Genesis Torpedo into the sector!"
	settextlinetrigger  atomic  :scanit_cit_kill    " appears from the planetary rubble."
	setTextLineTrigger 	exits 	:scanit_cit_kill 	"exits the game."
	setTextLineTrigger 	enters 	:scanit_cit_kill 	"enters the game."
	setDelayTrigger		delay	:scanit_cit_kill	30000
	setTextTrigger 		pause 	:pausing 		"Planet command (?="
	setTextTrigger 		pause2 	:pausing 		"Computer command ["
	setTextTrigger 		pause3 	:pausing 		"Corporate command ["
	pause


:pausing
	killAllTriggers
	echo ANSI_6 "*[" ANSI_14 "Citadel Killer paused. To restart, re-enter citadel prompt" ANSI_6 "]*" ANSI_7
	setTextTrigger restart :restarting "Citadel command ("
	pause
:restarting
	killAllTriggers
	echo ANSI_6 "*[" ANSI_14 "Citadel Killer restarted" ANSI_6 "]*" ANSI_7
	goto :main

:scanit_cit_kill
	killAllTriggers
	getWord CURRENTLINE $test 1
	if (($test = "P") OR ($test = "F") OR ($test = "R") OR ($test = ">"))
		echo ANSI_14 "*spoof attempt!*"
		goto :main
	end	
:scanit_again
	killAllTriggers
	gosub :player~quikstats
	setvar $planet~planet_count SECTOR.PLANETCOUNT[$player~current_sector]
	if (($planet~planet_count = 1) and ($overide = false))
		setvar $one_planet true
		setvar $player~override true
	else
		setvar $player~override $override
	end
	
	gosub :sector~getSectorData

	if ($sector~realTraderCount > ($sector~corpieCount + $sector~defenderShips))
	
		goSub :combat~fastCitadelAttack
		
		if ($player~fighters <= 0)
			setvar $switchboard~message "Fighters are gone - halting.*"
			gosub :switchboard~switchboard
			halt
		end
		goto :scanit_again
	elseif (($sector~emptyShipCount > $sector~myShipCount) AND ($capEmptyShips = TRUE))
	
		setvar $player~startinglocation "Citadel"
		gosub :combat~fastCapture
		gosub :player~quikstats
		if ($player~current_prompt = "Command")
			send " l " $PLANET~PLANET " * n n * j m * * * j c  *  "
			gosub :player~quikstats
			if ($player~fighters <= 0)
				setvar $switchboard~message "Fighters are gone - halting.*"
				gosub :switchboard~switchboard
				halt
			end
		end
		goto :scanit_again
	end
	goto :halt

:halt
:final
	echo ansi_12 "*NO Targets*"
	if ($sector~defenderShips > 0)
		setvar $switchboard~message "Enemy defender ship in sector!  Not attacking.  Override if you want to attempt to kill them.*"
		gosub :switchboard~switchboard
	end
	goto :main

halt

#INCLUDES:
include "source\include\planet"
include "source\include\combat"
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard"
