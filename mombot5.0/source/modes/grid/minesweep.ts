reqrecording
logging "OFF"
gosub :help~initialize
setvar $help~help[1] $help~tab&"Sweeps the fig grid by deploying/clearing mines."
setvar $help~help[2] $help~tab&"   "
setvar $help~help[3] $help~tab&"Usage:  minesweep {furb} {disr} {fast} {nonsafe} {border} {l:#} {a:#}"
setvar $help~help[4] $help~tab&"   "
setvar $help~help[5] $help~tab&"Arguments:"
setvar $help~help[6] $help~tab&"        {furb}   buy more mines/disruptors at dock when needed."
setvar $help~help[7] $help~tab&"        {disr}   use mine disruptors against enemy mines."
setvar $help~help[8] $help~tab&"        {fast}   use fast sector-clear macro."
setvar $help~help[9] $help~tab&"     {nonsafe}   use non-safe clear path unless fast is set."
setvar $help~help[10] $help~tab&"      {border}   target hostile border sectors."
setvar $help~help[11] $help~tab&"      {l:#} {a:#}   limpets and armids to deploy."
setvar $help~help[12] $help~tab&"   Run from Citadel with FIGSEC, MINESEC, and LIMPSEC data loaded."
gosub :help~helpfile

loadvar $bot_name
loadvar $unlimitedgame
loadvar $bot_turn_limit
loadvar $user_command_line
loadvar $parm1
loadvar $parm2
loadvar $parm3
loadvar $parm4
loadvar $parm5
loadvar $parm6
loadvar $parm7
loadvar $parm8
loadvar $stardock
loadvar $backdoor
loadvar $limpet_cost
loadvar $armid_cost
loadvar $limpet_removal_cost
loadvar $password
goto :minesweep_start
include "source\include\mines"

:minesweep_start
setvar $grid_limpets 1
setvar $grid_armids 4
setvar $refurb false
setvar $longjumplimit 5
setvar $version "1.0.5"
getsectorparameter sectors "FIGSEC" $isfigged
getsectorparameter sectors "MINESEC" $isarmided
getsectorparameter sectors "LIMPSEC" $islimped
if (($stardock = 0) or ($stardock = ""))
	setvar $switchboard~message "Stardock is not defined.  Please define stardock variable in the bot.*"
	gosub :switchboard~switchboard
	halt
end
if ($isfigged = "")
	setvar $switchboard~message "It appears no grid data is available.  Run a fighter grid checker that uses the sector parameter FIGSEC. (Try figs command)*"
	gosub :switchboard~switchboard
	halt
end
if ($isarmided = "")
	setvar $switchboard~message "It appears no armid data is available.  Run an armid grid checker that uses the sector parameter MINESEC. (Try armids command)*"
	gosub :switchboard~switchboard
	halt
end
if ($islimped = "")
	setvar $switchboard~message "It appears no limpet data is available.  Run a limpet grid checker that uses the sector parameter LIMPSEC. (Try limps command)*"
	gosub :switchboard~switchboard
	halt
end

gosub :player~quikstats
if ($player~current_prompt <> "Citadel")
	setvar $switchboard~message "Must must start mine sweeper from citadel prompt.*"
	gosub :switchboard~switchboard
	halt
end

if ($player~photons <> 0)
	setvar $switchboard~message "Cannot Have Fotons!*"
	gosub :switchboard~switchboard
	halt
end

setvar $temp " "&$user_command_line&" "
lowercase $temp

getwordpos $temp $pos " furb "
if ($pos = 0)
	setvar $refurb false
else
	setvar $refurb true
end

getwordpos $temp $pos " disr "
if ($pos = 0)
	setvar $disr false
else
	setvar $disr true
end

getwordpos $temp $pos " fast "
if ($pos = 0)
	setvar $fast false
else
	setvar $fast true
end

getwordpos $temp $pos " nonsafe "
if ($pos = 0)
	setvar $nonsafe false
else
	if ($fast)
		setvar $nonsafe false
	else
		setvar $nonsafe true
	end
end

getwordpos $temp $pos " border "
if ($pos = 0)
	setvar $border false
else
	setvar $border true
end

getwordpos $temp $pos " l:"
if ($pos = 0)
	setvar $grid_limpets 1
else
	gettext $temp $grid_limpets " l:" " "
	isnumber $tst $grid_limpets
	if ($tst = 0)
		setvar $grid_limpets 1
	else
		if ($grid_limpets > 250)
			setvar $grid_limpets 250
		elseif ($grid_limpets < 1)
			setvar $grid_limpets 1
		end
	end
end

getwordpos $temp $pos " a:"
if ($pos = 0)
	setvar $grid_armids 0
else
	gettext $temp $grid_armids " a:" " "
	isnumber $tst $grid_armids
	if ($tst = 0)
		setvar $grid_armids 0
	else
		if ($grid_armids > 250)
			setvar $grid_armids 250
		elseif ($grid_armids < 0)
			setvar $grid_armids 0
		end
	end
end

gosub :getinfo
setvar $homesector $player~current_sector

killalltriggers
gosub :checkavoidedsectors
send "q"
gosub :getplanetinfo

if (($grid_limpets = 0) and ($grid_armids = 0))
	setvar $switchboard~message "Nothing To Do!*"
	gosub :switchboard~switchboard
	halt
end

if (($player~organic_holds + ($player~equipment_holds + $player~colonist_holds)) <> 0)
	setvar $mac ""
	if ($player~organic_holds <> 0)
		setvar $mac $mac&" T  N  L 2* "
	end
	if ($player~equipment_holds <> 0)
		setvar $mac $mac&" T  N  L 3* "
	end
	if ($player~colonist_holds <> 0)
		setvar $mac $mac&" S  N  L 1* "
	end
	if ($mac <> "")
		send $mac&" t  n  t  1*  m  n t *  c"
		gosub :player~quikstats
		if (($player~organic_holds + ($player~equipment_holds + $player~colonist_holds)) <> 0)
			setvar $switchboard~message "Holds Not Empty*"
			gosub :switchboard~switchboard
			halt
		end
	end
else
	send $mac&" t  n  t  1*  m  n t *  c"
end

gosub :checkship

setvar $temp "{"&$bot_name&"}"
getlength $temp $len
setvar $s ""
setvar $i 1
while ($i <= $len)
	setvar $s $s&" "
	add $i 1
end
send "'*"
waitfor "Type sub-space message"
send "{" $bot_name "} - Mind ()ver Matter MineSweeper v"&$version&" Loading*"
if ($refurb)
	send $s&" - Furbing Mines/Disruptors*"
end
if ($disr)
	send $s&" - Disrupting Enemy Mines*"
end
if ($fast)
	send $s&" - FAST Sector-Clear Technology!*"
end
if ($nonsafe)
	send $s&" - SAFE Sector-Clear Technology!*"
end
if ($border)
	send $s&" - Targeting Hostile Sectors!*"
else
	send $s&" - Targeting Safe Sectors!*"
end
send $s&" - Deploying: "&$grid_armids&" Armids, "&$grid_limpets&" Limpets*"
send "*"

while (true)
	gosub :player~quikstats
	if ($player~limpets < $grid_limpets) or ($player~armids < $grid_armids) or (($player~mine_disruptors = 0) and $disr)
		if ($refurb)
			gosub :attemptrefurb
		else
			setvar $switchboard~message " Need to buy more mines before this script can continue.*"
			gosub :switchboard~switchboard
			halt
		end
	end
	gosub :findnexttarget
	send "  sz*    "
	waiton "Warps to Sector(s) :"
	setvar $haz_before sector.navhaz[$player~current_sector]
	setvar $planets_before sector.planetcount[$player~current_sector]
	if (sector.tradercount[$player~current_sector] <> 0)
		setvar $switchboard~message " Trader Is In Sector. Halting!*"
		gosub :switchboard~switchboard
		waiton "Message sent on sub-space channel"
		send "'"&$bot_name&" pwarp "&$homesector&"*"
		waiton "Message sent on sub-space channel"
		halt
	end
	if ($disr)
		gosub :disrupt
	end
	gosub :clearsector
	send "  sz*    "
	waiton "Warps to Sector(s) :"
	setvar $haz_after sector.navhaz[$player~current_sector]
	setvar $planets_after sector.planetcount[$player~current_sector]
	if (sector.tradercount[$player~current_sector] <> 0)
		setvar $switchboard~message " Trader Is In Sector. Halting!*"
		gosub :switchboard~switchboard
		waiton "Message sent on sub-space channel"
		send "'"&$bot_name&" pwarp "&$homesector&"*"
		waiton "Message sent on sub-space channel"
		halt
	end
	if ($haz_before <> $haz_after)
		setvar $switchboard~message " NavHAZ Changed. Halting!*"
		gosub :switchboard~switchboard
		waiton "Message sent on sub-space channel"
		send "'"&$bot_name&" holo*"
		waiton "Sub-space comm-link terminated"
		send "'"&$bot_name&" pwarp "&$homesector&"*"
		waiton "Message sent on sub-space channel"
		halt
	end
	if ($planets_after <> $planets_before)
		setvar $switchboard~message " New Planet in Sector. Halting!*"
		gosub :switchboard~switchboard
		waiton "Message sent on sub-space channel"
		send "'"&$bot_name&" pwarp "&$homesector&"*"
		waiton "Message sent on sub-space channel"
		halt
	end
end
halt

:checkship
killalltriggers
send "c;q"
waitfor "Offensive Odds:"
getwordpos currentline $pos "Offensive"
cuttext currentline $oddline $pos 99
gettext $oddline $offodd "Odds:" ":1"
striptext $offodd " "
striptext $offodd "."
waitfor "Mine Max:"
gettext currentline $maxmines "Mine Max:" "B"
striptext $maxmines " "
waitfor "Figs Per Attack:"
getword currentline $figs 5
multiply $offodd $figs
divide $offodd 12
gosub :player~quikstats
return

:attemptrefurb
setvar $limpetcashneeded ((($maxmines - $player~limpets) * $limpet_cost) + $limpet_removal_cost)
setvar $armidcashneeded (($maxmines - $player~armids) * $armid_cost)
setvar $cashneeded ($limpetcashneeded + $armidcashneeded)
if ($cashneeded > $player~credits)
	send "D"
	waiton "Citadel treasury contains "
	getword currentline $citadelcash 4
	striptext $citadelcash ","
	if ($citadelcash < $cashneeded)
		setvar $switchboard~message "Not enough cash for mine refurbs in treasury or on hand.*"
		gosub :switchboard~switchboard
		halt
	end
	send "t f "&($cashneeded - $player~credits)&"* "
end

setvar $i 1
setvar $start_sector $player~current_sector
setvar $weareadjdock false
while ($i <= sector.warpcount[$start_sector])
	setvar $adj_start sector.warps[$start_sector][$i]
	if ($adj_start = $stardock)
		setvar $weareadjdock true
	end
	add $i 1
end

if (($player~alignment < 1000) and ($weareadjdock = false))
	setvar $red_adj 0
	gosub :findjumpsector
	if ($red_adj <> 0)
		setvar $switchboard~message "Jump Sector Found - Using Sector "&$red_adj&"**"
		gosub :switchboard~switchboard
	else
		waitfor "Command [TL="
		setvar $switchboard~message "Cannot Find Jump Sector Adjacent Dock**"
		gosub :switchboard~switchboard
		halt
	end
end

if ($player~alignment >= 1000)
	if ($weareadjdock)
		send "^F"&$stardock&"*"&$start_sector&"*Q/ "
	else
		send "^F"&$start_sector&"*"&$stardock&"*F"&$stardock&"*"&$start_sector&"*Q/ "
	end
else
	if ($weareadjdock)
		send "^F"&$stardock&"*"&$start_sector&"*Q/ "
	else
		send "^F"&$start_sector&"*"&$red_adj&"*F"&$stardock&"*"&$start_sector&"*Q/ "
	end
end
settextlinetrigger nojoy :nojoy "*** Error - No route within"
settexttrigger cont :cont "(?="
pause

:nojoy
killalltriggers
setvar $switchboard~message "Cannot Find Path to StarDock!**"
gosub :switchboard~switchboard
halt

:cont
killalltriggers
setdelaytrigger latency_delay :latency_delay 500
pause

:latency_delay
echo "**"&ansi_14&"Please Stand By"&ansi_15&" - Calculating Distances...**"
if (($player~alignment >= 1000) or $weareadjdock)
	getdistance $dist1 $start_sector $stardock
else
	getdistance $dist1 $start_sector $red_adj
end

if ($dist1 <= 0)
	setvar $switchboard~message $taglineb&" - Insufficient Warp Data Plotting Course to Dock**"
	gosub :switchboard~switchboard
	halt
end

getdistance $dist2 $stardock $start_sector
if ($dist2 <= 0)
	setvar $switchboard~message $taglineb&" - Insufficient Warp Data Plotting Return Course From Dock**"
	gosub :switchboard~switchboard
	halt
end

setvar $ore_req (($dist1 + $dist2) * 3)

if ($player~ore_holds < $ore_req)
	setvar $switchboard~message "Not Enough ORE In Holds To Make Round Trip**"
	gosub :switchboard~switchboard
	halt
end

if ($player~twarp_type = "No")
	setvar $switchboard~message "Must Have Twarp 1 or 2**"
	gosub :switchboard~switchboard
	halt
end

if ($unlimitedgame = 0)
	gosub :turnsrequired
	if ($turnsrequired > $player~turns)
		setvar $switchboard~message "Not Enough Turns. "&ansi_12&$turnsrequired&ansi_15&", Required**"
		gosub :switchboard~switchboard
		halt
	elseif ($turnsrequired <= $player~turns)
		setvar $tmp ($player~turns - $turnsrequired)
		if ($tmp <= $bot_turn_limit)
			setvar $switchboard~message "Proceeding Will Leave Fewer Than "&$bot_turn_limit&" Turns!**"
			gosub :switchboard~switchboard
			halt
		end
	end
end

send " C R "&$stardock&"*Q "
settextlinetrigger itsalive :itsalive "Items     Status  Trading % of max OnBoard"
settextlinetrigger nosoupforme :nosoupforme "I have no information about a port in that sector"
pause

:nosoupforme
killalltriggers
setvar $switchboard~message $taglineb&" - StarDock appears to have been Blown Up!**"
gosub :switchboard~switchboard
halt

:itsalive
killalltriggers
waitfor "(?="
setvar $msg ""
if (($player~alignment >= 1000) and ($weareadjdock = false))
	setvar $twarpto $stardock
	gosub :dotwarp
elseif (($weareadjdock = false) and ($red_adj <> 0))
	setvar $twarpto $red_adj
	gosub :dotwarp
else
	send " m "&$stardock&"*  *  P  S G Y G Q "
end
if ($msg = "")
	waitfor "You leave the Galactic Bank."
else
	setvar $switchboard~message "Unknown Problem Detected. Check TA!**"
	gosub :switchboard~switchboard
	halt
end
gosub :player~quikstats

setvar $_limps "Max"
setvar $_mines "Max"
gosub :dopurchases
send "Q Q Q Q Z N M "&$start_sector&"* Y  Y  Y  * L Z"&#8&$planet&"* p  s  s * * c *"
gosub :player~quikstats
if ($player~current_sector = $stardock)
	setvar $switchboard~message "Twarp Error, Should be Hiding on Dock!**"
	gosub :switchboard~switchboard
	halt
end
send "q tnt1* c "

return

:checkavoidedsectors
setvar $avoidedsectors ""
gosub :sector~getavoids
setvar $avoid_i 0
while ($avoid_i < $sector~avoidcount)
	add $avoid_i 1
	setvar $avoidedsectors $avoidedsectors&" "&$sector~avoids[$avoid_i]&" "
end

return

:delaytrigger
setdelaytrigger delayuntilsaveme :callsaveme 1000
return

:callsaveme
killalltriggers
send "*"
waitfor "(?="
getword currentline $prompt 1
if ($prompt = "Citadel")
	echo "**Had to halt script, check ship to see if it is valid.**"
	goto :pausegridder
end
if (($prompt = "Computer") or ($prompt = "Corporate") or ($prompt = "NavPoint"))
	send "q"
	waitfor "Command [TL"
end
gosub :player~quikstats
setvar $figstodeploy 1
gosub :deployfigs
setvar $savetarget $player~current_sector
if ($savetarget < 10)
	setvar $savetarget 0000&$savetarget
elseif ($savetarget < 100)
	setvar $savetarget 000&$savetarget
elseif ($savetarget < 1000)
	setvar $savetarget 00&$savetarget
elseif ($savetarget < 10000)
	setvar $savetarget 0&$savetarget

end
send "'"&$savetarget&"=saveme*"
send "'pickup "&$player~current_sector&" ::*"

:waitforhelp
settextlinetrigger friendlytwarp :friendlytwarp "appears in a brilliant flash of warp energies!"
settextlinetrigger friendlyplanet :friendlyplanet "Saveme script activated - Planet "
settextlinetrigger towlocked :towlocked "locks a tractor beam on your ship."
setdelaytrigger timeout :timeout 30000
pause

:timeout
killalltriggers
send "'30 seconds after save call, script halted.*"
goto :pausegridder

:friendlytwarp
killalltriggers
setvar $figstodeploy "ALL"
gosub :deployfigs
goto :waitforhelp

:friendlyplanet
killalltriggers
gettext currentline $planet "Saveme script activated - Planet " " to "
send "L "&$planet&"* C 'I landed on planet "&$planet&"*"
goto :pausegridder

:towlocked
killalltriggers
setvar $figstodeploy 1
gosub :deployfigs
send "'Tow locked, get us out of here!*"
goto :pausegridder

:deployfigs
if ($figstodeploy = 0)
	setvar $figstodeploy 1
end
if (($player~current_sector < 11) or ($player~current_sector = $stardock))
	send "'Can't deploy figs in fed*"
	return
end
send "F"
settextlinetrigger nocontrol :nocontrol "These fighters are not under your control."
settextlinetrigger abletodeploy :abletodeploy "fighters available."
pause

:nocontrol
killalltriggers
send "'We don't control the figs in this sector!*"
goto :pausegridder

:abletodeploy
killalltriggers
getword currentline $figsavailable 3
striptext $figsavailable ","
if ($figstodeploy = "ALL")
	setvar $figstodeploy $figsavailable
end
if ($figsavailable = 0)
	send "0* ZC D* 'I have no figs to deploy!*"
else
	send $figstodeploy&"* ZC D* '"&$figstodeploy&" figs deployed*"
end
return

:disrupt
if ($player~mine_disruptors = 0)
	return
end
setdelaytrigger whoa_wuzup :whoa_wuzup 4000
settextlinetrigger scan_complete :scan_complete "Warps to Sector(s)"
send " Q Q S  H* "
pause

:whoa_wuzup
killalltriggers
send "'Unknown Problem Occured, Attempting to reach Command Prompt!*  P D 0* 0* 0* * *** * C  Q  Q  Q  Q  Q  Z  2  2  C  Q  *  Z  *  ***  *  *  ^Q"
waitfor ": ENDINTERROG"
gosub :player~quikstats
send "'Unknown Problem Occured, at '"&$player~current_prompt&"' Prompt!*"
halt

:scan_complete
killalltriggers
setarray $adj2hit 6 1
setarray $mines~adj2hit 6 1
setvar $idx 1

while (sector.warps[$player~current_sector][$idx] > 0)
	setvar $adj sector.warps[$player~current_sector][$idx]
	if (sector.mines.quantity[$adj] <> 0)
		if ((sector.mines.owner[$adj] <> "belong to your Corp") and (sector.mines.owner[$adj] <> "yours"))
			setvar $adj2hit[$idx] $adj
			setvar $adj2hit[$idx][1] sector.mines.quantity[$adj]
		else
			setvar $adj2hit[$idx][1] 0
		end
	end
	add $idx 1
end

setvar $idx 1
while ($idx <= 6)
	setvar $mines~adj2hit[$idx] $adj2hit[$idx]
	setvar $mines~adj2hit[$idx][1] $adj2hit[$idx][1]
	add $idx 1
end
setvar $mines~bursting $bursting
setvar $mines~total_mines_poofed $total_mines_poofed
gosub :mines~star_burst
setvar $total_mines_poofed $mines~total_mines_poofed
send " Q Q Q Z N L Z"&#8&$planet&"*  *  J  C  *  * "
setstrigger landed :landed "Citadel command (?"
setslinetrigger notlanded :notlanded "Are you sure you want to jettison all cargo"
pause

:notlanded
:nolanded
killalltriggers
send "'Unknown Problem Occured after StarBurst!*"
halt

:landed
killalltriggers
return

:findnexttarget
getnearestwarps $nearest $player~current_sector
setvar $checked ""
setvar $i 1
while ($i <= $nearest)
	setvar $focus $nearest[$i]
	setvar $checked $checked&" "&$player~current_sector&" "

	getwordpos $avoidedsectors $pos " "&$focus&" "
	getsectorparameter $focus "FIGSEC" $isfigged
	getsectorparameter $focus "MINESEC" $isarmided
	getsectorparameter $focus "LIMPSEC" $islimped
	isnumber $tst $isfigged
	if ($tst = 0)
		setvar $isfigged false
	end
	isnumber $tst $islimped
	if ($tst = 0)
		setvar $islimped false
	end
	isnumber $tst $isarmided
	if ($tst = 0)
		setvar $isarmided false
	end

	if ($border = true)
		setvar $p 1
		while (sector.warps[$focus][$p] > 0)
			setvar $temp sector.warps[$focus][$p]
			getsectorparameter $temp "FIGSEC" $isfigadjacent
			if ($isfigadjacent <> true)
				goto :we_got_game
			end
			add $p 1
		end
		goto :next_poss_targ
	else
		setvar $p 1
		while (sector.warps[$focus][$p] > 0)
			setvar $temp sector.warps[$focus][$p]
			getsectorparameter $temp "FIGSEC" $isfigadjacent
			if ($isfigadjacent <> true)
				goto :next_poss_targ
			end
			add $p 1
		end
	end

	:we_got_game
	if ((($islimped <= 0) or ($isarmided <= 0)) and (($isfigged > 0) and ($pos <= 0)))
		getdistance $distancethere $player~current_sector $focus
		getdistance $distanceback $focus $player~current_sector
		if ($distancethere < 0)
			send "^f"&$player~current_sector&"*"&$focus&"*q"
			waiton "ENDINTERROG"
			getdistance $distancethere $player~current_sector $focus
		end
		if ($distanceback < 0)
			send "^f"&$focus&"*"&$player~current_sector&"*q"
			waiton "ENDINTERROG"
			getdistance $distanceback $focus $player~current_sector
		end
		if (($distancethere > 30) and ($longjumplimit <> 0))
			setvar $switchboard~message "Next fighter is over 30 hops away, stopping mine sweeper.*"
			gosub :switchboard~switchboard
			gosub :gohome
			halt
		else
			subtract $longjumplimit 1
		end
		killalltriggers
		send "p "&$focus&"*y"
		settextlinetrigger pwarpnoship1 :pwarpnoship1 "You do not have any fighters in Sector "
		settextlinetrigger pwarpyesship1 :pwarpyesship1 " Planetary TransWarp Drive Engaged! "
		settextlinetrigger pwarpnofuel1 :pwarpnofuel1 "You do not have enough Fuel Ore on this planet to make the jump."
		settextlinetrigger pwarpyesship2 :pwarpyesship1 "You are already in that sector!"
		pause

		:pwarpnofuel1
		killalltriggers
		setvar $switchboard~message "Not enough fuel on planet "&$planet&". Stopping mine sweeper.*"
		gosub :switchboard~switchboard
		halt

		:pwarpyesship1
		killalltriggers
		setvar $avoidedsectors $avoidedsectors&" "&$focus&" "
		gosub :player~quikstats
		return

		:pwarpnoship1
		killalltriggers
	end

	:next_poss_targ
	add $i 1
end
setvar $switchboard~message "All sectors possible swept. Halting mine sweeper.*"
gosub :switchboard~switchboard
gosub :gohome
return

:gohome
gosub :player~quikstats
if ($player~current_prompt = "Citadel")
	send "p"&$homesector&"* y"
	settextlinetrigger pwarp_lock :pwarp_lock "Locating beam pinpointed"
	settextlinetrigger no_pwarp_lock :no_pwarp_lock "Your own fighters must be"
	settextlinetrigger already :already "You are already in that sector!"
	settextlinetrigger no_ore :no_ore "You do not have enough Fuel Ore"
	pause

	:no_pwarp_lock
	killalltriggers
	setvar $switchboard~message "No fighter down at that location!*"
	gosub :switchboard~switchboard
	return

	:no_ore
	killalltriggers
	setvar $switchboard~message "Not enough fuel for that pwarp.*"
	gosub :switchboard~switchboard
	return

	:pwarp_lock
	killalltriggers
	waiton "Planet is now in sector"
	setvar $switchboard~message "Planet returned Home*"
	gosub :switchboard~switchboard
	return

	:already
	killalltriggers
	setvar $switchboard~message "Planet already in that sector!.*"
	gosub :switchboard~switchboard
	return
else
	setvar $switchboard~message "Cannot Pwarp Home. Wrong Prompt!*"
	gosub :switchboard~switchboard
	halt
end
return

:clearsector
setvar $laid_armid false
setvar $laid_limp false
setvar $beforesector $player~current_sector
setvar $beforelimpets $player~limpets
setvar $beforearmids $player~armids
setvar $placedlimpet false
setvar $placedarmid false

send "   sz*    "

waiton "Warps to Sector(s) :"
setvar $limpetowner sector.limpets.owner[$player~current_sector]
setvar $armidowner sector.mines.owner[$player~current_sector]
gosub :deployequipment

if ($fast or $nonsafe)
	while (($placedlimpet = false) or ($placedarmid = false))
		gosub :attemptclearingmines
	end
	setsectorparameter $player~current_sector "MINESEC" true
	setsectorparameter $player~current_sector "LIMPSEC" true
else
	if ($placedarmid)
		setsectorparameter $player~current_sector "MINESEC" true
	end
	if ($placedlimpet)
		setsectorparameter $player~current_sector "LIMPSEC" true
	end
end

return

:xenter
send "q y * t* * *" password "*    *    *       za9999*   z*   "
return

:attemptclearingmines
killalltriggers
setvar $laid_armid false
setvar $laid_limp false

if ($fast)
	setvar $i 0
	send "q  q  q  z   n  *   "
	while ($i <= 3)
		gosub :xenter
		add $i 1
	end
	if ($grid_armids = 0)
		setvar $_armids_ " "
	else
		setvar $_armids_ " h 1 z "&$grid_armids&"* z c * "
	end
	if ($grid_limpets = 0)
		setvar $_limps_ " "
	else
		setvar $_limps_ "h 2 z "&$grid_limpets&"* z c * "
	end

	send $_armids_&$_limps_&" l "&$planet&"*  c  "
	settextlinetrigger laid_limp :laid_limp "Limpet mine(s) on board."
	settextlinetrigger laid_armid :laid_armid "Armid mine(s) on board."
	waiton "Citadel command"
else
	send "r y y "
	waiton "Epic Interactive Strategy"
	send game
	waiton "[Pause]"
	send "   *    "
	waiton "Enter your choice:"
	settextlinetrigger laid_limp :laid_limp "Limpet mine(s) on board."
	settextlinetrigger laid_armid :laid_armid "Armid mine(s) on board."
	send "t*   *    *"&password&"*    *    *   q  *  *  h 1 z "&$grid_armids&"* z c * h 2 z "&$grid_limpets&"* z c * l "&$planet&"*  c  "
	waiton "Citadel command"
end
if (($laid_armid <> true) or ($laid_limp <> true))
	goto :attemptclearingmines
end
setvar $placedlimpet true
setvar $placedarmid true
return

:laid_armid
setvar $laid_armid true
pause

:laid_limp
setvar $laid_limp true
pause

:deployequipment
send "q  q  h  1  z "&$grid_armids&"*  z c  *  h  2  z "&$grid_limpets&"*  z c  *   l "&$planet&"*  c "
gosub :player~quikstats
if ($beforesector <> $player~current_sector)
	gosub :callsaveme
end
if ($player~current_prompt <> "Citadel")
	echo "**Unexpected Problem.. Halting**"
	halt
end
if (($beforelimpets > $player~limpets) or ($player~limpets < 3) or ($limpetowner = "belong to your Corp") or ($limpetowner = "yours"))
	setvar $placedlimpet true
end
if (($beforearmids > $player~armids) or ($player~armids < 3) or ($armidowner = "belong to your Corp") or ($armidowner = "yours"))
	setvar $placedarmid true
end
return

:dotwarp
setvar $msg ""
if ($twarpto > 0)
	send "q q* mz"&$twarpto " * "
	settexttrigger there :adj_warp "You are already in that sector!"
	settextlinetrigger adj_warp :adj_warp "Sector  : "&$twarpto&" "
	setstrigger locking :locking "Do you want to engage the TransWarp drive?"
	settexttrigger igd :twarpigd "An Interdictor Generator in this sector holds you fast!"
	settexttrigger noturns :twarpphotoned "Your ship was hit by a Photon and has been disabled"
	setstrigger noroute :twarpnoroute "Do you really want to warp there? (Y/N)"
	pause

	:adj_warp
	killalltriggers
	send "z*"
	goto :twarp_adj

	:locking
	killalltriggers
	send "y"
	settextlinetrigger twarp_lock :twarp_lock "TransWarp Locked"
	settextlinetrigger no_twrp_lock :no_twarp_lock "No locating beam found"
	settextlinetrigger twarp_adj :twarp_adj "<Set NavPoint>"
	settextlinetrigger no_fuel :twarpnofuel "You do not have enough Fuel Ore"
	pause

	:twarpnofuel
	killalltriggers
	setvar $msg "Not enough fuel for T-warp."
	goto :twarpdone

	:twarp_adj
	killalltriggers
	send " * p s"
	goto :twarpdone

	:twarpnoroute
	killalltriggers
	send "n* z* "
	setvar $msg "No route available!"
	goto :twarpdone

	:no_twarp_lock
	killalltriggers
	send "n* z* "
	setvar $msg "No fighter Deployed, cannot Twarp"
	goto :twarpdone

	:twarpigd
	killalltriggers
	setvar $msg "My ship is being held by Interdictor!"
	goto :twarpdone

	:twarpphotoned
	killalltriggers
	setvar $msg "I have been photoned and can not T-warp!"
	goto :twarpdone

	:twarp_lock
	killalltriggers
	if ($player~alignment >= 1000)
		send "y * * p s g y g q "
	else
		send "y  *  *  m "&$stardock&" *  *  p s g y g q "
	end

	:twarpdone
	if ($msg <> "")
		setvar $switchboard~message "Twarp Error - "&$msg&"**"
		gosub :switchboard~switchboard
	end
end
return

:getinfo
gosub :player~getinfo
setvar $trader_name $player~trader_name
setvar $corpstring $player~corpstring
setvar $turns_per_warp $player~turns_per_warp
setvar $twarp_1_range $player~twarp_1_range
setvar $twarp_2_range $player~twarp_2_range
setvar $empty_holds $player~empty_holds
return
killtrigger getphotons
killtrigger getscantype
killtrigger gettwarptype1
killtrigger gettwarptype2
killtrigger getcredits

return

:pausegridder
killalltriggers
echo ansi_6 "*[" ansi_14 "M()M Limpet Gridder Options" ansi_6 "]*" ansi_7
echo ansi_6 "  [" ansi_14 "-" ansi_6 "]" ansi_15 " Change Gridder Settings*"
echo ansi_6 "  [" ansi_14 "+" ansi_6 "]" ansi_15 " Continue Gridding*"
echo ansi_6 "[" ansi_14 "M()M Limpet Gridder paused..." ansi_6 "]*" ansi_7
settextouttrigger pausegridder :restartingpause "+"
settextouttrigger pausegridder2 :start_menu "-"
pause

:start_menu
goto :pausegridder

:restartingpause
killalltriggers
send "* "
waitfor "(?="
getword currentline $location 1
if ($location = "Citadel")
	echo ansi_6 "*[" ansi_14 "M()M Unlimited Gridder restarted" ansi_6 "]*" ansi_7
	goto :pausegridder
else
	echo ansi_6 "*[" ansi_14 "M()M Unlimited Gridder not at citadel prompt, cannot restart" ansi_6 "]*" ansi_7
	goto :pausegridder
end

:getplanetinfo
gosub :planet~getplanetinfo
setvar $planet $planet~planet
setvar $player~current_sector $planet~current_sector
setvar $planet_fuel $planet~planet_fuel
setvar $planet_fuel_max $planet~planet_fuel_max
setvar $planet_organics $planet~planet_organics
setvar $planet_organics_max $planet~planet_organics_max
setvar $planet_equipment $planet~planet_equipment
setvar $planet_equipment_max $planet~planet_equipment_max
setvar $planet_fighters $planet~planet_fighters
setvar $planet_fighters_max $planet~planet_fighters_max
setvar $citadel $planet~citadel
setvar $citadel_credits $planet~citadel_credits
setvar $atmosphere_cannon $planet~atmosphere_cannon
setvar $sector_cannon $planet~sector_cannon
return
killtrigger citadelstart
killtrigger cannon

return

:findjumpsector
setvar $i 1
setvar $red_adj 0
send "qq*"
while (sector.warpsin[$stardock][$i] > 0)
	setvar $red_adj sector.warpsin[$stardock][$i]
	send "m "&$red_adj&"* y"
	setstrigger twarpblind :twarpblind "Do you want to make this jump blind? "
	setstrigger twarplocked :twarplocked "All Systems Ready, shall we engage? "
	settextlinetrigger twarpvoided :twarpvoided "Danger Warning Overridden"
	settextlinetrigger twarpadj :twarpadj "<Set NavPoint>"
	pause

	:twarpadj
	killalltriggers
	send " * "
	return

	:twarpvoided
	killalltriggers
	send " N N "
	goto :tryingnextadj

	:twarplocked
	killalltriggers
	send " N "

	goto :sectorlocked

	:twarpblind
	killalltriggers
	send " N "

	:tryingnextadj
	add $i 1
end

:noadjsfound
setvar $red_adj 0
return

:sectorlocked
return

:turnsrequired
send "i"
settextlinetrigger turnsrequired_tpw :turnsrequired_tpw "Turns to Warp  : "
pause

:turnsrequired_tpw
killalltriggers
getword currentline $turnsrequired_tpw 5

if ($red_adj > 0)

	setvar $turnsrequired_temp ($turnsrequired_tpw * 3)
	if ($_tow > 0)

		add $turnsrequired_temp 2

		add $turnsrequired_temp 3
	else
		add $turnsrequired_temp 1
	end
else
	setvar $turnsrequired_temp ($turnsrequired_tpw * 2)

	add $turnsrequired_temp 1
end

setvar $turnsrequired $turnsrequired_temp
return

:dopurchases
send "h "
waitfor "<Hardware Emporium>"

if ($_limps <> "")
	send "L "
	waitfor "How many mines do you want"
	if ($_limps = "Max")
		gettext currentline $buy "(Max" ")"
		send $buy&"* "
	else
		send $buy $_limps&"* "
	end
	waitfor "<Hardware Emporium>"
end

if ($_mines <> "")
	send "M "
	setvar $buy 0
	waitfor "How many mines do you"
	if ($_mines = "Max")
		gettext currentline $buy "(Max" ")"
		send $buy&"* "
	else
		send $_mines&"* "
	end
	waitfor "<Hardware Emporium>"
end

send "s"
waitfor "How many Mine Disruptors"
gettext currentline $buy "(Max" ")"
send $buy&"* "
waitfor "<Hardware Emporium>"
return
include "source\include\switchboard.ts"
include "source\include\sector"
include "source\include\help"
