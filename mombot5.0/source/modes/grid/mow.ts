gosub :loadvars~loadvars
gosub :help~initialize
loadvar $map~stardock
loadvar $switchboard~bot_name
loadvar $ship~ship_max_attack
loadvar $planet~planet

setvar $help~help[1]  $help~tab&"              <<<< mow >>>>"
setvar $help~help[2]  $help~tab&" "
setvar $help~help[3]  $help~tab&" mow [destination] {figs} {kill} {cap} {saveme} {p} {back}"
setvar $help~help[4]  $help~tab&"                   {personal} {backdoor} {i1/i2/i3} "
setvar $help~help[5]  $help~tab&"                    "
setvar $help~help[6]  $help~tab&" Options:"
setvar $help~help[7]  $help~tab&"        {p} - port ship immediately upon arrival."
setvar $help~help[8]  $help~tab&"     {kill} - attempt to kill immediately upon arrival."
setvar $help~help[9]  $help~tab&"      {cap} - attempt to capture immediately upon arrival."
setvar $help~help[10]  $help~tab&"   {saveme} - call saveme to be picked up at destination."
setvar $help~help[11]  $help~tab&"     {back} - twarp back to start sector after mow"
setvar $help~help[12]  $help~tab&"   {hoover} - attempts to pull fighters from sectors "
setvar $help~help[13]  $help~tab&" {personal} - drops personal fighters instead of corp  "
setvar $help~help[14]  $help~tab&" {backdoor} - mow to sector via backdoor"
setvar $help~help[15]  $help~tab&" {i1/i2/i3} - Indirect mow, void 1-3 sectors"
setvar $help~help[16]  $help~tab&" {holo} - holo scans every sector - no checks/pauses"

gosub :help~helpfile

if (($bot~parm1 = "?") or ($bot~parm1 = "help"))
	goto :wait_for_command
end

gosub :player~quikstats
setvar $homesector $player~current_sector
setvar $bot~startinglocation $player~current_prompt
setvar $bot~validprompts "Command <Underground> Do How Corporate Citadel Planet Computer Terra <StarDock> <FedPolice> <Tavern> <Libram <Galactic <Hardware <Shipyards>"
gosub :player~checkstartingprompt

setvar $player~destination $bot~parm1
isnumber $number $player~destination
if ($number <> 1)
	setvar $switchboard~message "Sector entered is not a number, cannot mow!*"
	gosub :switchboard~switchboard
	halt
elseif (($player~destination <= 0) or ($player~destination > sectors))
	setvar $switchboard~message "Sector entered is not valid, cannot mow!*"
	gosub :switchboard~switchboard
	halt
end
setvar $player~destination ($bot~parm1+0)
if ($player~destination = $player~current_sector)
	setvar $switchboard~message "You are already in that sector!*"
	gosub :switchboard~switchboard
	halt
end
getwordpos " "&$bot~user_command_line&" " $pos "backdoor"
if ($pos > 0)
	striptext $bot~user_command_line "backdoor"
	setvar $backdoormow 1
	if ($bot~startinglocation = "Computer")
		send "q"
	elseif (($bot~startinglocation <> "Citadel") and ($bot~startinglocation <> "Command"))
		setvar $switchboard~message "Can only backdoor mow from Command/Citadel prompt.*"
		gosub :switchboard~switchboard
		halt
	end
	setvar $adjacent 0
	setvar $i 1
	while ($i <= sector.warpcount[$player~current_sector])
		if (sector.warps[$player~current_sector][$i] = $player~destination)
			setvar $switchboard~message "Can not backdoor mow to an adjacent sector.*"
			gosub :switchboard~switchboard
			halt
		end
		add $i 1
	end
	if ($player~current_sector = 1)
		gosub :voidfirstnotfed
	end
	gosub :sector~getbackdoor
end

getwordpos " "&$bot~user_command_line&" " $pos1 "i1"
getwordpos " "&$bot~user_command_line&" " $pos2 "i2"
getwordpos " "&$bot~user_command_line&" " $pos3 "i3"
if (($pos1 > 0) or ($pos2 > 0) or ($pos3 > 0))

	setvar $indirectmow 1
	gosub :voidindirect
end
gosub :mow
if (($player~current_prompt = "<StarDock>") or ($player~current_prompt = "<Hardware"))
	setvar $switchboard~message "Safely on Stardock*"
	gosub :switchboard~switchboard
end
if (($player~current_sector <> $player~destination) and ($twarp_back = false))
	setvar $switchboard~message "Mow did not reach destination!*"
	gosub :switchboard~switchboard
else
	if (($player~current_sector <> $homesector) and ($twarp_back = true))
		setvar $switchboard~message "Mow did not make it back to starting sector!*"
		gosub :switchboard~switchboard
	else
		if (($twarp_back = true) and ($player~current_sector = $homesector) and ($bot~startinglocation = "Citadel"))
			gosub :planet~landingsub
		end
		if (($backdoormow = 1) or ($indirectmow = 1))
			send "cv0*yyq"
		end
		setvar $switchboard~message "Mow completed.*"
		gosub :switchboard~switchboard
	end
end
halt

:mow
if ($bot~startinglocation = "Citadel")
	send "q"
	gosub :planet~getplanetinfo
	send "t*t1* c "
end

if ($bot~startinglocation = "Command")
	gosub :ship~getshipstats
	setvar $mow_ship_max_attack $ship~ship_max_attack
elseif ($ship~ship_max_attack <= 0)
	setvar $mow_ship_max_attack 99991111
else
	setvar $mow_ship_max_attack $ship~ship_max_attack
end
getwordpos " "&$bot~user_command_line&" " $pos "kill"
if ($pos > 0)
	gosub :combat~init
	setvar $mow_kill true
else
	setvar $mow_kill false
end
getwordpos " "&$bot~user_command_line&" " $pos "saveme"
if ($pos > 0)
	setvar $mow_saveme true
else
	setvar $mow_saveme false
end
getwordpos " "&$bot~user_command_line&" " $pos "hoover"
if ($pos > 0)
	setvar $hoover true
else
	setvar $hoover false
end
getwordpos " "&$bot~user_command_line&" " $pos "back"
if ($pos > 0)
	setvar $twarp_back true
	if ($player~ore_holds <= 10)
		setvar $switchboard~message "Need more fuel ore on your ship if you want to twarp back!*"
		gosub :switchboard~switchboard
		halt
	end
else
	setvar $twarp_back false
end
getwordpos " "&$bot~user_command_line&" " $pos " p "
if ($pos > 0)
	setvar $are_we_docking true
else
	setvar $are_we_docking false
end
getwordpos " "&$bot~user_command_line&" " $pos " pay "
if ($pos > 0)
	setvar $pay true
else
	setvar $pay false
end
getwordpos " "&$bot~user_command_line&" " $pos " personal "
if ($pos > 0)
	setvar $personal true
else
	setvar $personal false
end
getwordpos " "&$bot~user_command_line&" " $pos " holo "
if ($pos > 0)
	setvar $doholo true
	echo $player~scan_type
	if ($player~scan_type <> "Holo")
		setvar $switchboard~message "You need a holo scanner!*"
		gosub :switchboard~switchboard
		halt
	end
else
	setvar $doholo false
end

setvar $figstodrop $bot~parm2
isnumber $number $figstodrop
if ($number <> true)
	setvar $figstodrop 0
else
	if ($figstodrop > 50000)
		setvar $switchboard~message "Cannot drop more than 50,000 fighters per sector!*"
		gosub :switchboard~switchboard
		halt
	elseif ($figstodrop > $player~fighters)
		setvar $switchboard~message "Fighters to drop cannot exceed total ship fighters.*"
		gosub :switchboard~switchboard
		halt
	end
end
if ($mow_ship_max_attack > $player~fighters)
	setvar $mow_ship_max_attack 9999
end
if ($mow_ship_max_attack < 99) or ($player~fighters < 99)
	if ($mow_ship_max_attack = 0)
		setvar $mow_ship_max_attack ""
	end
	setvar $mow_ship_max_attack $mow_ship_max_attack & "998877111"
end

if ($player~current_sector <> currentsector)
	setvar $player~current_sector 0
end
gosub :player~getcourse
if ($player~courselength <= 0)
	halt
end
setvar $j 2
setvar $result "q q q * "
while ($j <= $player~courselength)
	if ($player~course[$j] <> $player~current_sector)
		setvar $result $result&"m  "&$player~course[$j]&"*   "
		if (($player~course[$j] > 10) and ($player~course[$j] <> $map~stardock))
			if ($pay = true)
				setvar $result $result&"zp y  za  "&$mow_ship_max_attack&"* *  "
			else
				setvar $result $result&"za  "&$mow_ship_max_attack&"* *  "
			end
		end
		if ((($figstodrop > 0) or ($hoover = true)) and ($player~course[$j] > 10) and ($player~course[$j] <> $map~stardock) and ($j > 1))
			if ($hoover = true)
				setvar $result $result&"f * "
			else
				if ($personal = true)
					if ($pay = true)
						setvar $result $result&"f z"&$figstodrop&" * z p "&$player~fighter_deploy_type&" * "
					else
						setvar $result $result&"f "&$figstodrop&" * p "&$player~fighter_deploy_type&" "
					end
				else
					if ($pay = true)
						setvar $result $result&"f z"&$figstodrop&" * z c "&$player~fighter_deploy_type&" * "
					else
						setvar $result $result&"f "&$figstodrop&" * c "&$player~fighter_deploy_type&" "
					end
				end
				setvar $target $player~course[$j]
				gosub :player~addfigtodata
			end
		end
		if (($j >= $player~courselength) and ($mow_saveme = true) and ($figstodrop = 0))
			setvar $result $result&"f 1 * c "&$player~fighter_deploy_type&" "
			setvar $target $player~course[$j]
			gosub :player~addfigtodata
		end
		if ($doholo = true) and ($j <> ($player~courselength))
			setvar $result $result&"sh"
		end
		if (($called = false) and ($mow_saveme = true) and ($j >= ($player~courselength-2)))
			setvar $result $result&"'"&$player~destination&"=saveme*  "
			setvar $called true
		end
		if (($twarp_back = true) and ($j = ($player~courselength)))
			setvar $result $result&"  mz "&$homesector&"*y  y    *    "
		end
	end
	add $j 1
end
setvar $docking_instructions ""
if ($are_we_docking)
	setvar $docking_instructions " p z t *"
	if ($player~destination = $map~stardock)
		setvar $docking_instructions " p z s g y g q h *"
	end
	setvar $result $result & $docking_instructions
elseif (($mow_saveme = true) and ($bot~startinglocation = "Citadel"))
	setvar $i 0
	while ($i < 8)
		add $i 1
		#setVar $result $result&"l j" & #8 & $planet~planet & "*  *  "
		setvar $result $result&"l j" & #8 & $planet~planet & "*  *  j  c  *  *  "
	end
end
send $result
gosub :player~quikstats
if (($player~current_prompt = "Command") and ($mow_kill = true))
	setvar $bot~startinglocation "Command"
	gosub :sector~getsectordata
	gosub :combat~fastattack
elseif ($player~current_prompt = "Planet")
	send "m * * * c "
	if ($mow_kill = false)
		send "s* "
	else
		setvar $bot~startinglocation "Citadel"
		gosub :scanitcitkill
	end
elseif ($are_we_docking = false)
	send "*"
end
return
# ======================     END MOW SUBROUTINES     ==========================
:scanitcitkill
gosub :player~quikstats
gosub :sector~getsectordata
if ($sector~corpiecount < $sector~realtradercount)
	gosub :combat~fastcitadelattack
	goto :scanitcitkill
end
echo ansi_12 "*NO Targets*"
return

:wait_for_command
halt

:killthetriggers
killalltriggers
return

:voidindirect
if ($bot~startinglocation = "Computer")
	send "q"
elseif (($bot~startinglocation <> "Citadel") and ($bot~startinglocation <> "Command"))
	setvar $switchboard~message "Indirect mow should be run from command or citadel prompts.*"
	gosub :switchboard~switchboard
	halt
end
setvar $adjacent 0
setvar $i 1
while ($i <= sector.warpcount[$player~current_sector])
	if (sector.warps[$player~current_sector][$i] = $player~destination)
		setvar $switchboard~message "Can not indirect mow to an adjacent sector.*"
		gosub :switchboard~switchboard
		halt
	end
	add $i 1
end

getwordpos " "&$bot~user_command_line&" " $pos "i1"
if ($pos > 0)
	setvar $voids 1
end
getwordpos " "&$bot~user_command_line&" " $pos "i2"
if ($pos > 0)
	setvar $voids 2
end
getwordpos " "&$bot~user_command_line&" " $pos "i3"
if ($pos > 0)
	setvar $voids 3
end
if ($player~current_sector = 1)
	gosub :voidfirstnotfed
end
setvar $i 1

while ($i <= $voids)
	gosub :voidlast
	add $i 1
end

return

:voidlast
send "cf" $player~current_sector "*" $player~destination "*q"
setvar $course ""
settextlinetrigger voidl :voidl "The shortest path"
settextlinetrigger noindirect :noindirect "Error - No route within"
pause

:noindirect
killalltriggers
send "yq"
setvar $switchboard~message "Ran out of indirect void options; halting.*"
gosub :switchboard~switchboard
halt

:voidl
killalltriggers

:keepadding
settextlinetrigger addcourse :addcourse ">"
settexttrigger endcourse :endcourse "Computer command ["
pause

:addcourse
killalltriggers
setvar $course $course & " " & currentline
goto :keepadding

:endcourse
killalltriggers
setvar $prevwarp ""
setvar $y 1
setvar $go 1
while ($go = 1)

	getword $course $warp $y
	if ($warp <> ">")
		striptext $warp "("
		striptext $warp ")"
		if ($warp = $player~destination)
			setvar $go 0
			send "cv" $prevwarp "*q"
		end

		setvar $prevwarp $warp
	end
	add $y 1
	if ($y > 50)
		setvar $go 0
	end
end

return

:voidfirstnotfed
send "cf" $player~current_sector "*" $player~destination "*q"
setvar $course ""
settextlinetrigger voidnotfedl :voidnotfedl "The shortest path"
settextlinetrigger noindirectfed :noindirectfed "Error - No route within"
pause

:noindirectfed
killalltriggers
send "yq"
setvar $switchboard~message "Not initial path, exiting.*"
gosub :switchboard~switchboard
halt

:voidnotfedl
killalltriggers

:keepaddingfed
settextlinetrigger addcoursefed :addcoursefed ">"
settexttrigger endcoursefed :endcoursefed "Computer command ["
pause

:addcoursefed
killalltriggers
setvar $course $course & " " & currentline
goto :keepaddingfed

:endcoursefed
killalltriggers
setvar $prevwarp ""
setvar $y 1
setvar $go 1
while ($go = 1)

	getword $course $warp $y
	if ($warp <> ">")
		striptext $warp "("
		striptext $warp ")"
		echo $warp "*"
		if (($warp > 10) and ($y > 1))
			if ($warp <> $player~destination)
				send "cv" $warp "*q"
			end
			setvar $go 0

		end
		setvar $prevwarp $warp
	end
	add $y 1
	if ($y > 50)
		setvar $go 0
	end
end

return
#INCLUDES:
include "source\include\planet"
include "source\include\combat"
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
