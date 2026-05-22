gosub :loadvars~loadvars
gosub :help~initialize
gosub :combat~init

setvar $help~help[1]   $help~tab&" density {kill} {escape:#} {photon} {pel} "
setvar $help~help[2]   $help~tab&"         {call} {holo} {attack:#}"
setvar $help~help[3]   $help~tab&"   - Density scans until it sees ship or planet and "
setvar $help~help[4]   $help~tab&"     then performs an action  "
setvar $help~help[5]   $help~tab&"             "
setvar $help~help[6]   $help~tab&"          {kill} - will kill/holokill "
setvar $help~help[7]   $help~tab&"        {escape} - will escape to home sector "
setvar $help~help[8]   $help~tab&"      {escape:#} - will escape to sector provided"
setvar $help~help[9]   $help~tab&"      {attack:#} - will only photon sector provided"
setvar $help~help[10]  $help~tab&"        {photon} - photon sector"
setvar $help~help[11]  $help~tab&"          {holo} - holoscan sector and broadcast"
setvar $help~help[12]  $help~tab&"         {pgrid} - pgrid in to sector"
setvar $help~help[13]  $help~tab&"          {call} - calls saveme"
setvar $help~help[14]  $help~tab&"           {pel} - photon, enter, land"
setvar $help~help[15]  $help~tab&"         {pel:#} - pel with planet number"
setvar $help~help[16]  $help~tab&" {density:value} - only react to density changes of this "
setvar $help~help[17]  $help~tab&"                   value or higher. Default is 40."
setvar $help~help[18]  $help~tab&"      {killport} - Blows port with macro"
setvar $help~help[19]  $help~tab&"                  "
setvar $help~help[20]  $help~tab&"      Examples:   "
setvar $help~help[21]  $help~tab&"             >density kill call escape:1922"
setvar $help~help[22]  $help~tab&"             >density pel density:500"
setvar $help~help[23]  $help~tab&"             >density pel:10 "
setvar $help~help[24]  $help~tab&"             >density photon holo"
setvar $help~help[25]  $help~tab&"             >density pgrid killport kill escape:123"
gosub :help~helpfile

#check mines * on portkill
#check plist
#add kazi option

setvar $player~save true

gosub :player~quikstats
gosub :ship~getshipstats

setvar $startinglocation $player~current_prompt
setarray $adj 7
setarray $dens 7
setarray $adjsec 7
setarray $density 7
setvar $looking_for_planet false

if ($startinglocation = "Command")
elseif ($startinglocation = "Planet")
	gosub :planet~getplanetinfo
	send "q"
elseif ($startinglocation = "Citadel")
	send "q"
	gosub :planet~getplanetinfo
	send "q"
elseif ($startinglocation = "<StarDock>")
	send "q"
else
	setvar $switchboard~message "Must be run from Command, Planet, Citadel, or Stardock Prompt.*"
	gosub :switchboard~switchboard
	halt
end

getwordpos " "&$bot~user_command_line&" " $pos " kill "
setvar $kill false
if ($pos > 0)
	setvar $kill true
end

getwordpos " "&$bot~user_command_line&" " $pos " holo "
setvar $holo false
if ($pos > 0)
	setvar $holo true
	if (currentscantype <> "Holo")
		setvar $switchboard~message "Can't holoscan without a holoscanner.  Duh.*"
		goto :dtorp_end
	end
	if ((currentturns <= 0) and ($player~unlimitedgame <> true))
		setvar $switchboard~message "Can't holoscan without turns.*"
		goto :dtorp_end
	end
end

getwordpos " "&$bot~user_command_line&" " $pos " escape "
getwordpos " "&$bot~user_command_line&" " $pos2 " escape:"
setvar $escape false
if ($pos > 0) or ($pos2 > 0)
	setvar $escape true
	setvar $escape_sector $map~home_sector
	getwordpos $bot~user_command_line $pos "escape:"
	if ($pos > 0)
		gettext $bot~user_command_line&" " $escape_sector "escape:" " "
		isnumber $test $escape_sector
		if ($test <> true)
			setvar $switchboard~message "Escape sector should be a number.*"
			goto :dtorp_end
		end
	end
	if ($escape_sector = 0)
		setvar $switchboard~message "Escape sector is not defined.  Either define when calling, or define home sector.*"
		goto :dtorp_end
	end
end

getwordpos " "&$bot~user_command_line&" " $pos " attack:"
setvar $attack false
if ($pos > 0)
	setvar $attack true
	gettext $bot~user_command_line&" " $attack_sector "attack:" " "
	isnumber $test $attack_sector
	if ($test <> true)
		setvar $switchboard~message "Attack sector should be a number.*"
		goto :dtorp_end
	end
	if ($attack_sector = 0)
		setvar $switchboard~message "Escape sector is not defined.*"
		goto :dtorp_end
	end
end

getwordpos " "&$bot~user_command_line&" " $pos " photon "
setvar $photon false
if ($pos > 0)
	setvar $photon true
	if ($player~photons <= 0)
		setvar $switchboard~message "Without a photon, you can't run photon option.*"
		goto :dtorp_end
	end
end

getwordpos " "&$bot~user_command_line&" " $pos " pgrid "
setvar $pgrid false
if ($pos > 0)
	setvar $pgrid true
	if ($startinglocation <> "Citadel")
		setvar $switchboard~message "Need to start at citadel for pgrid mode.*"
		goto :dtorp_end
	end
end

getwordpos " "&$bot~user_command_line&" " $pos " killport "
setvar $killport false
if ($pos > 0)
	setvar $killport true
	send "c;q"
	waitfor "Figs Per Attack:"
	getword currentline $ship~maxfigattack 5
end

getwordpos " "&$bot~user_command_line&" " $pos " pel "
getwordpos " "&$bot~user_command_line&" " $pos2 " pel:"
setvar $pel false
if ($pos > 0) or ($pos2 > 0)
	setvar $pel true
	setvar $pel_planet 0
	getwordpos $bot~user_command_line $pos "pel:"
	if ($pos > 0)
		gettext $bot~user_command_line&" " $pel_planet "pel:" " "

		isnumber $test $pel_planet

		if ($test <> true)
			setvar $switchboard~message "Pel planet should be a number.*"
			goto :dtorp_end
		end
	end

	if ($player~photons <= 0)
		setvar $switchboard~message "Without a photon, you can't run pel option.*"
		goto :dtorp_end
	end

	if (($pel_planet = 0) and (currentplanetscanner = "Yes"))
		setvar $switchboard~message "Pel option can't be run with a planet scanner onboard unless you define a planet number.  Believe me, it'd just be messy.*"
		goto :dtorp_end
	end

end

getwordpos " "&$bot~user_command_line&" " $pos " call "
setvar $call false
if ($pos > 0)
	setvar $call true
end

getwordpos $bot~user_command_line $pos "density:"
setvar $density_change 40
if ($pos > 0)
	gettext $bot~user_command_line&" " $density_change "density:" " "

	isnumber $test $density_change

	if ($test <> true)
		setvar $switchboard~message "Density change amount should be a number.*"
		goto :dtorp_end
	end
	if ($density_change > 499)
		setvar $density_upper_limit 99999
	else
		setvar $density_upper_limit 499
	end
end
if ($density_change > 499)
	setvar $density_upper_limit 99999
else
	setvar $density_upper_limit 499
end

if ((pgrid <> true) and ($kill <> true) and ($killport <> true) and ($photon <> true) and ($pel <> true) and ($holo <> true) and ($call <> true) and ($escape <> true))
	setvar $photon true
end
setvar $message "Density Trigger running in sector "&$player~current_sector&"*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-"
setvar $message $message&"*        On Density Change >= ("&$density_change&" - "&$density_upper_limit&"), I will:"
if ($pgrid)
	setvar $message $message&"*          PGRID to Sector"
end
if ($kill)
	setvar $message $message&"*          Kill/Holokill"
end
if ($killport)
	setvar $message $message&"*          Kill Port"
end
if ($photon)
	setvar $message $message&"*          Photon"
elseif ($pel)
	setvar $message $message&"*          Photon, Enter, Land"
	if ($pel_planet <> 0)
		setvar $message $message&" on Planet "&$pel_planet
	end
end
if ($holo)
	setvar $message $message&"*          Holoscan"
end
if ($call)
	setvar $message $message&"*          Call Saveme"
end
if ($escape)
	setvar $message $message&"*          Escape to Sector "&$escape_sector
end
if ($attack)
	setvar $message $message&"*          Only Responding to Sector "&$attack_sector
end
setvar $message $message&"*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-**"
setvar $switchboard~message $message
gosub :switchboard~switchboard

:check_dens
setvar $mm 0
setvar $i 1
send "sz*"
waiton "Relative Density Scan"

:dtorp_start
killtrigger alldone
setvar $attack_sector_found false
settextlinetrigger getsec :getsec "Sector"
settexttrigger alldone :alldone "Command [TL="
pause

:getsec
gettext currentline $temp "Sector" "==>"
striptext $temp "("
striptext $temp ")"
striptext $temp " "
if ((($attack = true) and ($temp = $attack_sector)) or ($attack = false))
	if (($attack = true) and ($temp = $attack_sector))
		setvar $attack_sector_found true
	end
	setvar $adj[$i] $temp
	gettext currentline $dens[$i] "==>" "Warps :"
	striptext $dens[$i] ","
	striptext $dens[$i] " "
end
if ($attack <> true)
	add $i 1
end
settextlinetrigger getsec :getsec "Sector"
pause

:alldone
killtrigger getsec
if (($attack = true) and ($attack_sector_found <> true))
	setvar $switchboard~message "Attack sector is not adjacent.  Try again.*"
	goto :dtorp_end
end
gosub :firechk

:letslook
setvar $w 0

:sublooky
add $w 1
if ($w > $i)
	goto :alldone
elseif ($density[$w] <> $dens[$w])
	setvar $diff ($density[$w] - $dens[$w])
	if (($diff >= $density_change) and ($diff <= $density_upper_limit))
		gosub :do_action
		goto :dtorp_end
	else
		goto :sublooky
	end
else
	goto :sublooky
end

:firechk
setvar $y 1
send "sz*"
waiton "Relative Density Scan"

:looky
killtrigger manual_stop
killtrigger dtop_dtorp
killtrigger getsec
killtrigger alldone
killtrigger donelook
settextlinetrigger getsec :looksec "Sector"
settexttrigger donelook :donelook "Command [TL="
pause

:looksec
gettext currentline $temp "Sector" "==>"
striptext $temp "("
striptext $temp ")"
striptext $temp " "
if ((($attack = true) and ($temp = $attack_sector)) or ($attack = false))
	setvar $adjsec[$y] $temp
	gettext currentline $density[$y] "==>" "Warps :"
	striptext $density[$y] ","
	striptext $density[$y] " "
end
if ($attack <> true)
	add $y 1
end
settextlinetrigger getsec :looksec "Sector"
pause

:donelook
killtrigger getsec
return

:dtorp_end
if (($startinglocation = "Planet") or ($startinglocation = "Citadel"))
	if (($escape <> true) and ($call <> true) and ($photon <> true))
		gosub :planet~landingsub
	end
end
gosub :switchboard~switchboard

halt

:do_action
if (($photon = true) and ($player~photons > 0))
	if (($startinglocation = "Planet") or ($startinglocation = "Citadel"))
		send " c  p  y  " $adj[$w] "**q   l " $planet~planet " * n n * j m * * * j c  *  "
	else
		send " c  p  y  " $adj[$w] "**q   "
	end
end
gosub :player~quikstats

# #if we pgrid we want to do a different kill action
if (($pgrid = true) and ($player~fighters > 0))

	if ($player~current_prompt = "Command")
		gosub :planet~landingsub
	end
	setvar $grid~pgridsector $adj[$w]
	gosub :grid~pgrid
	if ($killport = true)
		send "s*"
		waitfor "Warps to Sector(s)"
		if (port.exists[$player~current_sector] = 1)
			if ($player~current_prompt = "Citadel")
				send "q q "
			end
			send "p a y " $ship~maxfigattack " * * z $ship~maxFigAttack * * "
			if ($player~current_prompt = "Citadel")
				send "l" $planet~planet "* c"
				waitfor "<Enter Citadel>"
			else
				settextlinetrigger endportdestroy :endportdestroy "ou destroyed the Star Port"
				setdelaytrigger endporttimeout :endporttimeout 150
				pause

				:endporttimeout
				:endportdestroy
				killalltriggers
			end
		end
	end
	if ($kill = true)
		gosub :player~quikstats

		:scanit_again2
		setvar $player~startinglocation $player~current_prompt
		gosub :sector~getsectordata
		if ($sector~realtradercount > ($sector~corpiecount + $sector~defenderships))
			gosub :combat~fastcitadelattack
			goto :scanit_again2
		elseif (($sector~emptyshipcount > $sector~myshipcount))
			gosub :combat~fastcapture
			goto :scanit_again2
		end
	end

	if ($escape = true)

		setvar $planet~warpto $escape_sector
		setvar $planet~pwarp_scan false
		gosub :player~quikstats

		if ($player~current_prompt = "Citadel")
			gosub :planet~pwarp
		end
	end

else

	if (($kill = true) and ($player~fighters > 0))
		gosub :player~quikstats

		:scanit_again
		setvar $player~startinglocation $player~current_prompt
		gosub :sector~getsectordata
		if ($sector~realtradercount > ($sector~corpiecount + $sector~defenderships))
			gosub :combat~fastattack
			goto :scanit_again
		elseif (($sector~emptyshipcount > $sector~myshipcount))
			gosub :combat~fastcapture
			goto :scanit_again
		end
		setvar $before_holo_kill_sector $player~current_sector
		gosub :combat~holokill
		if ($player~current_sector <> $before_holo_kill_sector)
			setvar $player~warpto $before_holo_kill_sector
			gosub :move~twarp
			if (($player~twarpsuccess = false) and ($player~msg <> "Already in that sector!"))
				setvar $switchboard~message "Could not make it back to starting sector before holokill. - ["&$player~msg&"]*"
				gosub :switchboard~switchboard
			end
		end
	end

	if ($holo = true)
		gosub :holo_run
	end

	if ($pel = true)
		if ($pel_planet = 0)
			# Fake planet number to make script trigger - no scanners so will still land
			setvar $pel_planet 99999
		end
		setvar $bot~command "invader"
		setvar $bot~command_typed "pel"
		setvar $bot~user_command_line " pel "&$adj[$w]&" "&$pel_planet
		setvar $bot~parm1 $adj[$w]
		setvar $bot~parm2 $pel_planet
		setvar $bot~parm3 ""
		setvar $bot~parm4 ""
		setvar $bot~parm5 ""
		setvar $bot~parm6 ""
		savevar $bot~parm1
		savevar $bot~parm2
		savevar $bot~parm3
		savevar $bot~parm4
		savevar $bot~parm5
		savevar $bot~parm6
		savevar $bot~command
		savevar $bot~command_typed
		savevar $bot~user_command_line
		load "scripts\"&$bot~mombot_directory&"\commands\offense\invader.cts"
		seteventtrigger pelended :pelended "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\commands\offense\invader.cts"
		pause

		:pelended
		halt
	end

	if ($call = true)

		:call
		gosub :combat~callsaveme
		gosub :player~quikstats
		if ($player~current_prompt <> "Citadel")
			setvar $switchboard~message "Not on planet even after call saveme.  I'm in real trouble.  Will try again in 15 seconds.*"
			gosub :switchboard~switchboard
			killalltriggers
			setdelaytrigger callretry :call 15000
			pause
		end
	end

	if ($escape = true)
		killalltriggers

		setvar $planet~warpto $escape_sector
		setvar $planet~pwarp_scan false
		if (($startinglocation = "Planet") or ($startinglocation = "Citadel"))
			gosub :player~quikstats
			if (($player~current_prompt <> "Citadel") and ($player~current_prompt <> "Planet"))
				gosub :planet~landingsub
			end
			gosub :player~quikstats
			if ($player~current_prompt = "Citadel")
				gosub :planet~pwarp
			else
				goto :twarp
			end
		else

			:twarp
			gosub :move~twarp
			if (($player~twarpsuccess = false) and ($player~msg <> "Already in that sector!"))
				setvar $switchboard~message "Could not escape. - ["&$player~msg&"]*"
				gosub :switchboard~switchboard
				halt
			end
		end
	end

end

setvar $switchboard~message "Density trigger complete.*"
gosub :switchboard~switchboard

return

:holo_run
:holo
setvar $bot~command "holo"
setvar $bot~user_command_line " holo"
setvar $bot~parm1 ""
setvar $bot~parm2 ""
setvar $bot~parm3 ""
setvar $bot~parm4 ""
setvar $bot~parm5 ""
setvar $bot~parm6 ""
savevar $bot~command
savevar $bot~user_command_line
savevar $bot~parm1
savevar $bot~parm2
savevar $bot~parm3
savevar $bot~parm4
savevar $bot~parm5
savevar $bot~parm6
load "scripts\"&$bot~mombot_directory&"\commands\data\holo.cts"
seteventtrigger holoend1 :holo_end1 "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\commands\data\holo.cts"
pause

:holo_end1
return

#INCLUDES:
include "source\include\planet"
include "source\include\combat"
include "source\include\loadvars"
include "source\include\help"
include "source\include\grid"
include "source\include\combat"
include "source\include\switchboard.ts"
