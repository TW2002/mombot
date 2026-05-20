	gosub :LOADVARS~LOADVARS
	gosub :HELP~INITIALIZE
	loadVar $MAP~stardock
	loadvar $SWITCHBOARD~bot_name 
	loadvar $ship~ship_max_attack
	loadvar $planet~planet
    
	setVar $HELP~HELP[1]  $HELP~TAB&"              <<<< mow >>>>"
	setVar $HELP~HELP[2]  $HELP~TAB&" "
	setVar $HELP~HELP[3]  $HELP~TAB&" mow [destination] {figs} {kill} {cap} {saveme} {p} {back}"
	setVar $HELP~HELP[4]  $HELP~TAB&"                   {personal} {backdoor} {i1/i2/i3} "
	setVar $HELP~HELP[5]  $HELP~TAB&"                    "
	setVar $HELP~HELP[6]  $HELP~TAB&" Options:"
	setVar $HELP~HELP[7]  $HELP~TAB&"        {p} - port ship immediately upon arrival."
	setVar $HELP~HELP[8]  $HELP~TAB&"     {kill} - attempt to kill immediately upon arrival."
	setVar $HELP~HELP[9]  $HELP~TAB&"      {cap} - attempt to capture immediately upon arrival."
	setVar $HELP~HELP[10]  $HELP~TAB&"   {saveme} - call saveme to be picked up at destination."
	setVar $HELP~HELP[11]  $HELP~TAB&"     {back} - twarp back to start sector after mow"
	setVar $HELP~HELP[12]  $HELP~TAB&"   {hoover} - attempts to pull fighters from sectors "
	setVar $HELP~HELP[13]  $HELP~TAB&" {personal} - drops personal fighters instead of corp  "
	setVar $HELP~HELP[14]  $HELP~TAB&" {backdoor} - mow to sector via backdoor"
	setVar $HELP~HELP[15]  $HELP~TAB&" {i1/i2/i3} - Indirect mow, void 1-3 sectors"
	setVar $HELP~HELP[16]  $HELP~TAB&" {holo} - holo scans every sector - no checks/pauses"
	
	gosub :HELP~HELPFILE


	if (($bot~parm1 = "?") or ($bot~parm1 = "help"))
		goto :wait_for_command
	end

	gosub :PLAYER~quikstats
	setVar $homeSector $PLAYER~CURRENT_SECTOR
	setVar $bot~startingLocation $PLAYER~CURRENT_PROMPT
	setVar $bot~validPrompts "Command <Underground> Do How Corporate Citadel Planet Computer Terra <StarDock> <FedPolice> <Tavern> <Libram <Galactic <Hardware <Shipyards>"
	gosub :PLAYER~CHECKSTARTINGPROMPT

		setVar $PLAYER~destination $bot~parm1
		isNumber $number $PLAYER~destination
		if ($number <> 1)
			setVar $SWITCHBOARD~message "Sector entered is not a number, cannot mow!*"
			gosub :SWITCHBOARD~switchboard
			halt
		elseif (($PLAYER~destination <= 0) OR ($PLAYER~destination > SECTORS))
			setVar $SWITCHBOARD~message "Sector entered is not valid, cannot mow!*"
			gosub :SWITCHBOARD~switchboard
			halt
		end
		setVar $PLAYER~destination ($bot~parm1+0)
		if ($PLAYER~destination = $PLAYER~CURRENT_SECTOR)
			setVar $SWITCHBOARD~message "You are already in that sector!*"
			gosub :SWITCHBOARD~switchboard
			halt
		end   
	 getWordPos " "&$bot~user_command_line&" " $pos "backdoor"
	 if ($pos > 0)
		striptext $bot~user_command_line "backdoor"
		setVar $backdoorMow 1
		if ($bot~startingLocation = "Computer")
			send "q"
		elseif (($bot~startingLocation <> "Citadel") and ($bot~startingLocation <> "Command"))
			setVar $SWITCHBOARD~message "Can only backdoor mow from Command/Citadel prompt.*"
			gosub :SWITCHBOARD~switchboard
			halt
		end
		setVar $adjacent 0
		setVar $i 1
		while ($i <= SECTOR.WARPCOUNT[$PLAYER~CURRENT_SECTOR])
			if (SECTOR.WARPS[$PLAYER~CURRENT_SECTOR][$i] = $PLAYER~destination)
				setVar $SWITCHBOARD~message "Can not backdoor mow to an adjacent sector.*"
				gosub :SWITCHBOARD~switchboard
				halt
			end
			add $i 1
		end	
		if ($PLAYER~CURRENT_SECTOR = 1)
			goSub :voidfirstnotFed
		end
		gosub :sector~getbackdoor 
	end

	 getWordPos " "&$bot~user_command_line&" " $pos1 "i1"
	 getWordPos " "&$bot~user_command_line&" " $pos2 "i2"
	 getWordPos " "&$bot~user_command_line&" " $pos3 "i3"
	 if (($pos1 > 0) or ($pos2 > 0) or ($pos3 > 0))
		
		setVar $indirectMow 1
			gosub :voidIndirect 
		 end
	gosub :mow
	if (($PLAYER~CURRENT_PROMPT = "<StarDock>") OR ($PLAYER~CURRENT_PROMPT = "<Hardware"))
		setVar $SWITCHBOARD~message "Safely on Stardock*"
			gosub :SWITCHBOARD~switchboard
	end
	if (($PLAYER~CURRENT_SECTOR <> $PLAYER~destination) and ($twarp_back = FALSE))
		setVar $SWITCHBOARD~message "Mow did not reach destination!*"
			gosub :SWITCHBOARD~switchboard
	else
		if (($PLAYER~CURRENT_SECTOR <> $homeSector) and ($twarp_back = TRUE))
			setVar $SWITCHBOARD~message "Mow did not make it back to starting sector!*"
			gosub :SWITCHBOARD~switchboard
		else
			if (($twarp_back = TRUE) and ($PLAYER~CURRENT_SECTOR = $homeSector) and ($bot~startingLocation = "Citadel"))
				gosub :PLANET~landingSub
			end
		if (($backdoorMow = 1) or ($indirectMow = 1))
		send "cv0*yyq"
		end
			setVar $SWITCHBOARD~message "Mow completed.*"
			gosub :SWITCHBOARD~switchboard
		end
	end
	halt


:mow
		
if ($bot~startingLocation = "Citadel")
	send "q"
	gosub :PLANET~getPlanetInfo
	send "t*t1* c "
end

if ($bot~startingLocation = "Command")
	gosub :SHIP~getShipStats
	setVar $mow_SHIP_MAX_ATTACK $SHIP~SHIP_MAX_ATTACK
elseif ($SHIP~SHIP_MAX_ATTACK <= 0)
	setVar $mow_SHIP_MAX_ATTACK 99991111
else
	setVar $mow_SHIP_MAX_ATTACK $SHIP~SHIP_MAX_ATTACK
end
getWordPos " "&$bot~user_command_line&" " $pos "kill"
if ($pos > 0)
	gosub :combat~init 
	setVar $mow_kill TRUE
else
	setVar $mow_kill FALSE
end
getWordPos " "&$bot~user_command_line&" " $pos "saveme"
if ($pos > 0)
	setVar $mow_saveme TRUE
else
	setVar $mow_saveme FALSE
end
getWordPos " "&$bot~user_command_line&" " $pos "hoover"
if ($pos > 0)
	setVar $hoover TRUE
else
	setVar $hoover FALSE
end
getWordPos " "&$bot~user_command_line&" " $pos "back"
if ($pos > 0)
	setVar $twarp_back TRUE
	if ($player~ore_holds <= 10)
		setvar $switchboard~message "Need more fuel ore on your ship if you want to twarp back!*"
		gosub :switchboard~switchboard
		halt
	end
else
	setVar $twarp_back FALSE
end
getWordPos " "&$bot~user_command_line&" " $pos " p "
if ($pos > 0)
	setVar $are_we_docking TRUE
else
	setVar $are_we_docking FALSE
end
getWordPos " "&$bot~user_command_line&" " $pos " pay "
if ($pos > 0)
	setVar $pay TRUE
else
	setVar $pay FALSE
end
getWordPos " "&$bot~user_command_line&" " $pos " personal "
if ($pos > 0)
	setVar $personal TRUE
else
	setVar $personal FALSE
end
getWordPos " "&$bot~user_command_line&" " $pos " holo "
if ($pos > 0)
	setVar $doholo TRUE
	echo $PLAYER~SCAN_TYPE 
	if ($PLAYER~SCAN_TYPE <> "Holo")
		setvar $switchboard~message "You need a holo scanner!*"
		gosub :switchboard~switchboard
		halt
	end
else
	setVar $doholo FALSE
end

setVar $figsToDrop $bot~parm2
isNumber $number $figsToDrop
if ($number <> TRUE)
	setVar $figsToDrop 0
else
	if ($figsToDrop > 50000)
		setvar $switchboard~message "Cannot drop more than 50,000 fighters per sector!*"
		gosub :switchboard~switchboard
		halt
	elseif ($figsToDrop > $PLAYER~FIGHTERS)
		setvar $switchboard~message "Fighters to drop cannot exceed total ship fighters.*"
		gosub :switchboard~switchboard
		halt
	end
end
if ($mow_SHIP_MAX_ATTACK > $PLAYER~FIGHTERS)
	setVar $mow_SHIP_MAX_ATTACK 9999
end
if ($mow_SHIP_MAX_ATTACK < 99) or ($PLAYER~FIGHTERS < 99)
if ($mow_SHIP_MAX_ATTACK = 0)
	setVar $mow_SHIP_MAX_ATTACK ""
end
setVar $mow_SHIP_MAX_ATTACK $mow_SHIP_MAX_ATTACK & "998877111"
end



if ($PLAYER~CURRENT_SECTOR <> CURRENTSECTOR)
	setVar $PLAYER~CURRENT_SECTOR 0
end
gosub :player~getCourse
if ($PLAYER~courseLength <= 0)
	halt
end
setVar $j 2
setVar $result "q q q * "
while ($j <= $PLAYER~courseLength)
	if ($PLAYER~course[$j] <> $PLAYER~CURRENT_SECTOR)
		setVar $result $result&"m  "&$PLAYER~course[$j]&"*   "
		if (($PLAYER~course[$j] > 10) AND ($PLAYER~course[$j] <> $MAP~stardock))
			if ($pay = true)
				setVar $result $result&"zp y  za  "&$mow_SHIP_MAX_ATTACK&"* *  "
			else
				setVar $result $result&"za  "&$mow_SHIP_MAX_ATTACK&"* *  "
			end
		end
		if ((($figsToDrop > 0) or ($hoover = true)) AND ($PLAYER~course[$j] > 10) AND ($PLAYER~course[$j] <> $MAP~stardock) AND ($j > 2))
			if ($hoover = true)
				setVar $result $result&"f * "
			else
				if ($personal = true)
					if ($pay = true)
						setVar $result $result&"f z"&$figsToDrop&" * z p "&$player~fighter_deploy_type&" * "
					else
						setVar $result $result&"f "&$figsToDrop&" * p "&$player~fighter_deploy_type&" "
					end
				else
					if ($pay = true)
						setVar $result $result&"f z"&$figsToDrop&" * z c "&$player~fighter_deploy_type&" * "
					else
						setVar $result $result&"f "&$figsToDrop&" * c "&$player~fighter_deploy_type&" "
					end
				end
				setVar $target $PLAYER~course[$j]
				gosub :player~addfigtodata
			end
		end
		if (($j >= $PLAYER~courseLength) AND ($mow_saveme = TRUE) AND ($figstoDrop = 0))
			setVar $result $result&"f 1 * c "&$player~fighter_deploy_type&" "
			setVar $target $PLAYER~course[$j]
			gosub :player~addfigtodata
		end
		if ($doholo = TRUE) and ($j <> ($PLAYER~courseLength))
			setVar $result $result&"sh"
		end
		if (($called = FALSE) AND ($mow_saveme = TRUE) AND ($j >= ($PLAYER~courseLength-2)))
			setVar $result $result&"'"&$PLAYER~destination&"=saveme*  "
			setVar $called TRUE
		end
		if (($twarp_back = TRUE) AND ($j = ($PLAYER~courseLength)))
			setVar $result $result&"  mz "&$homeSector&"*y  y    *    "
		end
	end
	add $j 1
end
setVar $docking_instructions ""
if ($are_we_docking)
	setVar $docking_instructions " p z t *"
	if ($PLAYER~destination = $MAP~stardock)
		setVar $docking_instructions " p z s g y g q h *"
	end
	setVar $result $result & $docking_instructions
elseif (($mow_saveme = TRUE) AND ($bot~startingLocation = "Citadel"))
	setVar $i 0
	while ($i < 8)
		add $i 1
		#setVar $result $result&"l j" & #8 & $planet~planet & "*  *  "
		setVar $result $result&"l j" & #8 & $planet~planet & "*  *  j  c  *  *  "
	end
end
send $result
gosub :PLAYER~quikstats
if (($PLAYER~CURRENT_PROMPT = "Command") AND ($mow_kill = TRUE))
	setVar $bot~startingLocation "Command"
	goSub :SECTOR~getSectorData
	goSub :combat~fastAttack
elseif ($PLAYER~CURRENT_PROMPT = "Planet")
	send "m * * * c "
	if ($mow_kill = FALSE)
		send "s* "
	else
		setVar $bot~startingLocation "Citadel"
		gosub :scanitcitkill
	end
elseif ($are_we_docking = FALSE)
	send "*"
end
return
# ======================     END MOW SUBROUTINES     ==========================

:scanitcitkill
gosub :PLAYER~quikstats
gosub :SECTOR~getSectorData
if ($SECTOR~CORPIECOUNT < $SECTOR~REALTRADERCOUNT)
	gosub :COMBAT~FASTCITADELATTACK
	goto :scanitcitkill
end
echo ANSI_12 "*NO Targets*"
return

:wait_for_command
halt

:killthetriggers
killalltriggers
return

:voidIndirect
if ($bot~startingLocation = "Computer")
	send "q"
elseif (($bot~startingLocation <> "Citadel") and ($bot~startingLocation <> "Command"))
	setVar $SWITCHBOARD~message "Indirect mow should be run from command or citadel prompts.*"
	gosub :SWITCHBOARD~switchboard
	halt
end
setVar $adjacent 0
setVar $i 1
while ($i <= SECTOR.WARPCOUNT[$PLAYER~CURRENT_SECTOR])
	if (SECTOR.WARPS[$PLAYER~CURRENT_SECTOR][$i] = $PLAYER~destination)
		setVar $SWITCHBOARD~message "Can not indirect mow to an adjacent sector.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	add $i 1
end

getWordPos " "&$bot~user_command_line&" " $pos "i1"
if ($pos > 0)
	setVar $voids 1
end
getWordPos " "&$bot~user_command_line&" " $pos "i2"
if ($pos > 0)
	setVar $voids 2
end
getWordPos " "&$bot~user_command_line&" " $pos "i3"
if ($pos > 0)
	setVar $voids 3
end
if ($PLAYER~CURRENT_SECTOR = 1)
	goSub :voidfirstnotFed
end
setVar $i 1

while ($i <= $voids)
	goSub :voidlast
	add $i 1
end

return

:voidlast
	
send "cf" $PLAYER~CURRENT_SECTOR "*" $PLAYER~destination "*q"
setVar $course ""
setTextLineTrigger voidl :voidl "The shortest path" 
setTextLineTrigger noindirect :noindirect "Error - No route within"
pause
	:noindirect
	killalltriggers
	send "yq"
	setVar $SWITCHBOARD~message "Ran out of indirect void options; halting.*"
	gosub :SWITCHBOARD~switchboard
	halt
	:voidl
	killalltriggers
		:keepadding
		setTextLineTrigger addCourse :addCourse ">"
		setTextTrigger endCourse :endCourse "Computer command [" 
		pause
		:addCourse
		killalltriggers
		setVar $course $course & " " & CURRENTLINE
		goto :keepadding
		:endCourse
		killalltriggers
		setVar $prevwarp ""
		setVar $y 1
		setVar $go 1
		while ($go = 1)
				
			getWord $course $warp $y
			if ($warp <> ">")
				stripText $warp "("
				stripText $warp ")"
				if ($warp = $PLAYER~destination)
					setVar $go 0
					send "cv" $prevwarp "*q"
				end
					
				setVar $prevwarp $warp
			end
			add $y 1
			if ($y > 50)
				setVar $go 0
			end
		end



return

:voidfirstnotFed
	
send "cf" $PLAYER~CURRENT_SECTOR "*" $PLAYER~destination "*q"
setVar $course ""
setTextLineTrigger voidnotfedl :voidnotfedl "The shortest path" 
setTextLineTrigger noindirectfed :noindirectfed "Error - No route within"
pause
	:noindirectfed
	killalltriggers
	send "yq"
	setVar $SWITCHBOARD~message "Not initial path, exiting.*"
	gosub :SWITCHBOARD~switchboard
	halt
	:voidnotfedl
	killalltriggers
		:keepaddingfed
		setTextLineTrigger addCoursefed :addCoursefed ">"
		setTextTrigger endCoursefed :endCoursefed "Computer command [" 
		pause
		:addCoursefed
		killalltriggers
		setVar $course $course & " " & CURRENTLINE
		goto :keepaddingfed
		:endCoursefed
		killalltriggers
		setVar $prevwarp ""
		setVar $y 1
		setVar $go 1
		while ($go = 1)
				
			getWord $course $warp $y
			if ($warp <> ">")
				stripText $warp "("
				stripText $warp ")"
				echo $warp "*"
				if (($warp > 10) and ($y > 1))
					if ($warp <> $PLAYER~destination)
						send "cv" $warp "*q"
					end
					setVar $go 0
						
				end					
				setVar $prevwarp $warp
			end
			add $y 1
			if ($y > 50)
				setVar $go 0
			end
		end



return
#INCLUDES:
include "source\include\planet"
include "source\include\combat"
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
