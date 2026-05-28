gosub :help~initialize
setvar $help~help[1] $help~tab&"Keeps personal limpets loaded in the current sector."
setvar $help~help[2] $help~tab&"   "
setvar $help~help[3] $help~tab&"Usage:  plimper {saveme}"
setvar $help~help[4] $help~tab&"   "
setvar $help~help[5] $help~tab&"   {saveme} - start CK saveme before running."
setvar $help~help[6] $help~tab&"   Run from Citadel, blue alignment, with T-warp and Stardock known."
setvar $help~help[7] $help~tab&"   Refurbs limpets at Stardock and reloads the sector after limp hits."
gosub :help~helpfile

setvar $limit 100
setvar $tagline "'[PLIMP] "
setvar $version "1.1a"
gosub :player~quikstats
if (stardock < 1)
	send $tagline & "StarDock Not Known*"
	waitfor "Message sent on sub-space channel"
	halt
end
if ($player~current_prompt <> "Citadel")
	send $tagline & "Start In Citadel*"
	waitfor "Message sent on sub-space channel"
	halt
end
if ($player~twarp_type = "No")
	send $tagline & "Must Have TWARP DRIVE*"
	waitfor "Message sent on sub-space channel"
	halt
end

send $tagline & "Trader Vics Limpet Tracker Avoidance Script Powering Up!*"
waiton "Message sent on sub-space channel"
waiton "elp"
if ($player~alignment < 1000)
	send $tagline & "Blue check failed, this script loads limps from sd.*"
	waitfor "Message sent on sub-space channel"
	halt
end

loadvar $bot~user_command_line
loadvar $switchboard~bot_name

setvar $temp (" " & $bot~user_command_line & " ")
getwordpos $temp $pos "saveme"
if ($pos <> 0)
	stop "_ck_saveme.cts"
	stop "_ck_saveme.cts"
	stop "_ck_saveme.cts"
	load "_ck_saveme.cts"
	waiton "CK Advanced Saveme v. 3.0.0 - Running from planet"
end

setvar $mac ""
if ($player~ore_holds <> 0)
	setvar $mac ($mac & " T N L 1* ")
end
if ($player~organic_holds <> 0)
	setvar $mac ($mac & " T N L 2* ")
end
if ($player~equipment_holds <> 0)
	setvar $mac ($mac & " T N L 3* ")
end

send "tf5000000* q" & $mac & " t n t 1* dc"
waiton "Planet #"
getword currentline $planet~planet 2
striptext $planet~planet " "
striptext $planet~planet "#"
waiton "<Enter Citadel>"

gosub :msgs_off
send "sn*"
waiton "Sector  :"
waiton "Warps to Sector(s) :"
gosub :msgs_on
setvar $figowner sector.figs.owner[$player~current_sector]
if (($figowner <> "belong to your Corp") and ($figowner <> "yours"))
	send $tagline & "*No Fighter Present In Current Sector*"
	waitfor "Message sent on sub-space channel"
	halt
end
if (sector.limpets.owner[$player~current_sector] <> "yours")
	setvar $drop $player~limpets
	add $drop sector.limpets.quantity[$player~current_sector]

	if ($drop > 250)
		setvar $drop 250
	end

	send " Q Q H 2 Z " & $drop & "* Z P * L " & $planet~planet & "* C "
end
send $tagline & "Blue check passed, alignment entered as " & $player~alignment & "*"
waitfor "Message sent on sub-space channel"
send $tagline & "Version "&$version&" - Script activated!*"
waitfor "Message sent on sub-space channel"
send $tagline & "As long as there is cash in cit i will keep sector loaded with personal limps.*"
waitfor "Message sent on sub-space channel"

:reload_limps
gosub :player~quikstats
if ($player~total_holds <> $player~ore_holds)
	echo $tagline & "Planet Short On Gas*"
	waitfor "Message sent on sub-space channel"
	halt
end
send " C R " & stardock & "*Q "
settextlinetrigger	itsalive 	:itsalive		"Items     Status  Trading % of max OnBoard"
settextlinetrigger	nosoupforme	:nosoupforme	"I have no information about a port in that sector"
setdelaytrigger		wehaveaprob	:wehaveaprob	3000
pause

:wehaveaprob
killalltriggers
waitfor "Citadel command"
echo "*Unexpected Problem. Halting.*"
halt

:nosoupforme
killalltriggers
waitfor "Citadel command"
echo "*Dock Is gone*"
halt

:itsalive
killalltriggers
waitfor "Citadel command"

send "Q Q M " & stardock & "* Y"
waiton "Federation beacon acknowledged,"
send "y    p s g y g q h "
waitfor "<Hardware Emporium>"
send "l"
waitfor "How many mines do you want"
gettext currentline $buylimps "(Max" ")"
send $buylimps "*q q  "
send "m " & $player~current_sector & "* y y * l " $planet~planet "* c "
waitfor "Citadel command"

gosub :player~quikstats

if ($player~current_prompt <> "Citadel")
	send $tagline & "*Not In Citadel. Something's Wrong*"
	waitfor "Message sent on sub-space channel"
	halt
end

if ($player~limpets < 10)
	send $tagline & "Furb Failed. Halting*"
	waitfor "Message sent on sub-space channel"
	halt
end

if ($player~fighters < 100)
	send $tagline & "Ship Fighters Below 100. Kinda Dangerous*"
	waitfor "Message sent on sub-space channel"
	halt
end

if ($player~credits > 50000)
	send "tt" & ($player~credits - 50000) & "*"
	waiton "How much to transfer?"
end

:rerun
if (sector.limpets.quantity[$player~current_sector] < $limit) or ($player~limpets < ($limit + 10))
	send "tf6000000* q t n t 1* m n t * q h 2 z 250* z p * dl " & $planet~planet & "* C "
	waiton "Sector  :"
	waiton "Warps to Sector(s) :"
	waiton "Citadel command"
	if (sector.limpets.owner[$player~current_sector] <> "yours") or (sector.limpets.quantity[$player~current_sector] < 1)
		send $tagline & "Unable To Drop Personal Limps*"
		waitfor "Message sent on sub-space channel"
		halt
	end
	send $tagline & sector.limpets.quantity[$player~current_sector] & " mines deployed personal*"
	waitfor "Message sent on sub-space channel"
	goto :reload_limps
end

killalltriggers
echo ansi_15 & "***                    "&ansi_14&"!!"&ansi_15&" WAITING FOR LIMP HIT "&ansi_14&"!!"&"*"
echo ansi_7 & "                       Press "&ansi_14&"@"&ansi_7&" To Force A Furb**"
settextlinetrigger	hit		:hit	"Limpet mine in " & $player~current_sector & " activated"
settextouttrigger	furbme	:furbme	"@"
settexttrigger 		p1 		:paused "Planet command (?=help) [D]"
settexttrigger 		p2 		:paused "] (?=Help)?"
settexttrigger 		p3 		:paused "Beam to what sector? (U=Upgrade Q=Quit)"
settexttrigger 		p4 		:paused "Transfer To or From the Planetary Shield System (T/F) [T]?"
settexttrigger 		p5 		:paused "Qcannon Control Type :"
settexttrigger 		p6 		:paused "What level do you want (0-100) ?"
settexttrigger 		p7 		:paused "Do you want to change this setting? (Y/N)"
settexttrigger 		p8 		:paused "What sector do you want to warp this planet to? (Q to Abort)"
settexttrigger 		p9 		:paused "Transfer To or From the Treasury (T/F) [F]?"
settexttrigger 		p10 	:paused "[Pause]"
settexttrigger 		p11 	:paused "Sub-space radio"
settexttrigger 		p12 	:paused "Federation comm-link:"
pause

:paused
killalltriggers
echo "**" ansi_11 "Paused. Return to Cidadel Prompt to Restart.**"
settextlinetrigger	hit2		:hit2	"Limpet mine in " & $player~current_sector & " activated"
setdelaytrigger		reminder	:paused 180000
waiton "Citadel command (?="
goto :rerun

:hit2
#this tracks limp hits while script is paused
killalltriggers
subtract $player~limpets 1
if (sector.limpets.quantity[$player~current_sector] < $limit) or ($player~limpets < ($limit + 10))
	echo "***"& ansi_12 & "                     !!!"&ansi_15&" LIMPET LIMIT REACHED " &ansi_12&"!!!***"
end
goto :paused

:hit
killalltriggers
subtract $player~limpets 1
goto :rerun

:furbme
killalltriggers
gosub :player~quikstats
if ($player~current_prompt <> "Citadel")
	send $tagline & "Wrong Prompt. Halting*"
	halt
end
send "sn*"
waiton "Sector  :"
waiton "Warps to Sector(s) :"
goto :rerun

:msgs_on
:on_again
settexttrigger onmsgs_on :onmsgs_on "Displaying all messages."
settexttrigger onmsgs_off :onmsgs_off "Silencing all messages."
send "|"
pause

:onmsgs_off
killalltriggers
goto :on_again

:onmsgs_on
killalltriggers
setvar $msgs_on true
return

:msgs_off
:off_again
settexttrigger offmsgs_off :offmsgs_off "Silencing all messages."
settexttrigger offmsgs_on :offmsgs_on "Displaying all messages."
send "|"
pause

:offmsgs_on
killalltriggers
goto :off_again

:offmsgs_off
setvar $msgs_on false
killalltriggers
return

include "source\include\player"
include "source\include\help"
