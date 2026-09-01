reqrecording
logging "OFF"
gosub :loadvars~loadvars
gosub :help~initialize

setvar $help~help[1] $help~tab&"Bwarp Photon"
setvar $help~help[2] $help~tab&"Uses planet teleport-pad to arrive adjacent a fighter"
setvar $help~help[3] $help~tab&"hit; Launches a photon, returns, and lands"
setvar $help~help[4] $help~tab&"         "
setvar $help~help[5] $help~tab&"Options: "
setvar $help~help[6] $help~tab&"    {scrub sector} - use this if you want to scrub somewhere other"
setvar $help~help[7] $help~tab&"                     than your starting sector"
setvar $help~help[8] $help~tab&"            {holo) - holoscan after photon     "
setvar $help~help[9] $help~tab&"         {dens)ity - density scan after photon     "
setvar $help~help[10] $help~tab&"           {mine)s - trigger on mine hits too"
setvar $help~help[11] $help~tab&"           "
setvar $help~help[12] $help~tab&"  Usage:     "
setvar $help~help[13] $help~tab&"     >boton holo"
setvar $help~help[14] $help~tab&"     >boton 1234 dens"
setvar $help~help[15] $help~tab&"     >boton h mine "
setvar $help~help[16] $help~tab&"     >boton "

gosub :help~helpfile

setvar $tagline "LoneStar's BWARP PHOTON"
setvar $taglineb "[LSBOTON]"
setvar $curent_version "1.3"
setvar $taglinec "[LSBOTON v"&$curent_version&"]"

setvar $hit_sector 0
setvar $idx 11
setvar $start_sector 0

setvar $planet~planet 0
setvar $planet_level 0
setvar $planet~planet_fuel 0
setvar $planet~planet_fuel_min 100
setvar $planet_fig 0
setvar $planet~planet_tpad 0
setvar $ore_tolerance $planet~planet_fuel_min

setvar $firephoton true
setvar $aliens false
setvar $auto_return true

getwordpos " "&$bot~user_command_line&" " $pos " holo "

if ($pos > 0)
	setvar $holo_scan true
	setvar $den_scan false
else
	setvar $holo_scan false
end

getwordpos " "&$bot~user_command_line&" " $pos " dens "
if ($pos > 0)
	setvar $den_scan true
	setvar $holo_scan false
else
	setvar $den_scan false
end
setvar $continuous true
setvar $turn_limit $bot~bot_turn_limit
setvar $mine_reaction "None"

getwordpos " "&$bot~user_command_line&" " $pos " mine "
if ($pos > 0)
	setvar $mine_reaction "Armids/Limps"
else
	setvar $mine_reaction "None"
end

setvar $unlim $player~unlimitedgame
setvar $credit_limit 50000
setvar $credits_on_hand 10000
setvar $credits_withdraw 200000

setarray $figs sectors
setarray $sects sectors 5
setarray $holooutput 1000

isnumber $tst $bot~parm1
if ($tst = 0)
	setvar $scrub_sect 0
else
	setvar $scrub_sect $bot~parm1
end

setvar $switchboard~message $tagline&" v"&$curent_version&" - Loading...*"
gosub :switchboard~switchboard

gosub :player~quikstats
gosub :good_to_go

:fire_in_the_hole
setvar $suffix ""
if ($auto_return)
	if ($scrub_sect = 0)
		setvar $suffix " M "&$start_sector&"*  Y  Y  *  L Z"&#8&$planet~planet&"*  *  J  C  *  "
	else
		setvar $suffix " M "&$scrub_sect&"*  Y  Y  *  J  *  "
	end
end

gosub :read_in_figs
gosub :msgs_on
gosub :player~quikstats

if ($player~ore_holds < $player~total_holds)
	setvar $switchboard~message "Ship Holds Are Not Full of ORE.*"
	gosub :switchboard~switchboard
	halt
end

if (($scrub_sect <> 0) and $auto_return)

	setstrigger sector_is_good :sector_is_good "All Systems Ready, shall we engage?"
	setstrigger sector_is_bad1 :sector_is_bad "Do you want to make this transport blind"
	settextlinetrigger sector_is_bad2 :sector_is_bad "This planetary transporter does not have the range."
	settextlinetrigger sector_is_bad3 :sector_is_bad "This planet does not have enough Fuel Ore to transport you."
	send "B"&$scrub_sect&"*N*  "
	pause

	:sector_is_bad
	killalltriggers
	setvar $switchboard~message $taglineb&" - Cannot Obtain Fighter Lock On Scrub Sector. Halting!*"
	gosub :switchboard~switchboard
	halt

	:sector_is_good
	setvar $switchboard~message $taglineb&" - Scrub Sector Is Good!*"
	gosub :switchboard~switchboard
	killalltriggers
end

:disp_banner
if ($firephoton)
	setvar $switchboard~message $taglinec&" Running From Planet #"&$planet~planet&", with "&$player~photons&" Photons.*"
	gosub :switchboard~switchboard
else
	setvar $switchboard~message $taglinec&" Running From Planet #"&$planet~planet&", Not Firing A Photon.*"
	gosub :switchboard~switchboard
end

:inac
killalltriggers
send #27
seteventtrigger discod1 :discod "CONNECTION LOST"
seteventtrigger discod2 :discod "Connections have been temporarily disabled."
setdelaytrigger banner :banner 350000
setstrigger bwarp_blind :bwarp_blind "Do you want to make this transport blind"
setstrigger bwarp_go :bwarp_go "All Systems Ready, shall we engage?"
setslinetrigger bwarp_miss :bwarp_miss "Computer command [TL="
settextlinetrigger gotem :gotem "Photon Missile launched into sector"
settextlinetrigger wrong :wrong "That is not an adjacent sector"

:again
if ($aliens)
	settextlinetrigger fighit_a :fighit_a "Deployed Fighters Report Sector"
else
	settextlinetrigger fighit :fighit "Deployed Fighters Report Sector"
end

settextlinetrigger inac :inac "Session termination is imminent."

if (($mine_reaction = "Armids") or ($mine_reaction = "Armids/Limps"))
	if ($aliens)
		settextlinetrigger mines_a :mines_a "Your mines in"
	else
		settextlinetrigger mines :mines "Your mines in"
	end
end
if (($mine_reaction = "Limps") or ($mine_reaction = "Armids/Limps"))
	settextlinetrigger limp :limp "Limpet mine in"
end
pause

:banner
killalltriggers
goto :disp_banner

:discod
killalltriggers
echo "**"&ansi_14&$taglineb&ansi_15&" Disconnected **"

:disco_test
if (connected <> true)
	setdelaytrigger emancipate_cpu :emancipate_cpu 3000
	echo "**"&ansi_14&$taglineb&ansi_15&" Auto Land & Resume Initiated - Awaiting Connection!**"
	pause

	:emancipate_cpu
	goto :disco_test
end
waitfor "(?="
setdelaytrigger waitingabit :waitingabit 3000
echo "**"&ansi_14&$taglineb&ansi_15&" Connected - Waiting For Command Prompt!**"
pause

:waitingabit
killalltriggers
gosub :player~quikstats
if ($player~current_prompt = "Command")
	send " L Z"&#8&$planet~planet&"*  *  J  C  *  "
	setslinetrigger notlanded :notlanded "Are you sure you want to jettison all cargo?"
	settextlinetrigger landed :landed "<Enter Citadel>"
	setdelaytrigger testconn :testconn 3000
	pause

	:testconn
	killalltriggers
	if (connected = false)
		goto :disco_test
	else
		setvar $switchboard~message $taglineb&" Problem Detected Unable to Land!*"
		gosub :switchboard~switchboard
		halt
	end

	:notlanded
	killalltriggers
	setvar $switchboard~message $taglineb&" - Unable To Land After Reconnect,Check My TA!**"
	gosub :switchboard~switchboard
	halt

	:landed
	killalltriggers
	setvar $switchboard~self_command false
	setvar $switchboard~message $taglineb&" - Restarting!**"
	gosub :switchboard~switchboard
	waitfor "Message sent on sub-space channel"
	goto :inac
elseif ($player~current_prompt = "Citadel")
	setvar $switchboard~self_command false
	setvar $switchboard~message $taglineb&" - Restarting!**"
	gosub :switchboard~switchboard
	waitfor "Message sent on sub-space channel"
	goto :inac
else
	send " p d 0* 0* 0* * *** * c q q q q q z 2 2 c q * z * *** * * '"&$taglineb&"Attempting to Reach Correct Prompt...*"
	settextlinetrigger emq_complete :emq_delay "Attempting to Reach Correct Prompt..."
	setdelaytrigger emq_delay :emq_delay 3000
	pause

	:emq_delay
	killalltriggers
	goto :disco_test
end

:mines
killtrigger inac
killtrigger fighit
killtrigger limp
killtrigger mines
killtrigger fighit_a
getword currentline $ck 1
if ($ck <> "Your")
	goto :again
end
getword currentline $hit_sector 4
goto :pwarp_go

:mines_a
killtrigger mines_a
killtrigger fighit_a
killtrigger inac
killtrigger limp
getword currentline $hit_sector 4
getword currentansiline $ansi 9
cuttext $ansi $num 10 2
striptext $hit_sector ":"
if ($num <> 33)
	goto :pwarp_go
else
	goto :again
end

:limp
killtrigger fighit_a
killtrigger mines_a
killtrigger inac
killtrigger limp
killtrigger fighit
killtrigger mines
getword currentline $ck 1
if ($ck <> "Limpet")
	goto :again
end
getword currentline $hit_sector 4
goto :pwarp_go

:fighit_a
killtrigger inac
killtrigger mines_a
killtrigger fighit_a
killtrigger limp
getword currentline $hit_sector 5
getword currentansiline $ansi 6
cuttext $ansi $num 10 2
striptext $hit_sector ":"
isnumber $tst $hit_sector
if (($num <> 33) and ($tst <> 0))
	goto :pwarp_go
else
	goto :again
end

:fighit
killtrigger inac
killtrigger mines
killtrigger limp
killtrigger fighit
getword currentline $ck 1
if ($ck <> "Deployed")
	goto :again
end
getword currentline $hit_sector 5
striptext $hit_sector ":"
isnumber $tst $hit_sector
if ($tst = 0)
	goto :again
end

:pwarp_go
setvar $launch_from $sects[$hit_sector]
if ($launch_from <> 0)
	send " B "&$launch_from&"*  C  Q  "
	pause
else
	goto :again
end

:bwarp_blind
killalltriggers
send " N "
gosub :clear_sector
killalltriggers
goto :inac

:bwarp_miss
killalltriggers
gosub :clear_sector
goto :inac

:bwarp_go
killtrigger bwarp_miss
killtrigger bwarp_blind
killtrigger bwarp_go
if ($firephoton)
	send "y  *  c  p  y  "&$hit_sector&"**Q"
	pause
else
	send "y  *  "
	goto :gotem_with_no_photon
end

:gotem
killalltriggers
getword currentline $ck 1
if ($ck <> "Photon")
	goto :inac
end

:gotem_with_no_photon
if ($holo_scan)
	gosub :doscan
elseif ($den_scan)
	gosub :doscan_den
end

if ($auto_return)
	if ($scrub_sect <> 0)
		if ($firephoton)
			setvar $switchboard~message $taglineb&" FIRED "&$launch_from&"->"&$hit_sector&"* "
			gosub :switchboard~switchboard
			send $suffix
		else
			setvar $switchboard~message $taglineb&" TRIGGERED "&$launch_from&"->"&$hit_sector&"* "
			gosub :switchboard~switchboard
			send $suffix
		end
		setstrigger returnedsafe :returnedsafe "Are you sure you want to jettison all cargo"
		setdelaytrigger notsafe2 :whatsup 4000
		pause

		:returnedsafe
		killalltriggers
		gosub :player~quikstats
		if ($player~current_sector <> $scrub_sect)
			setvar $werehere $player~current_sector
			gosub :call_save_me
			halt
		end
		gosub :spit_it_out
		halt
	else
		if ($firephoton)
			setvar $switchboard~message $taglineb&" FIRED "&$launch_from&"->"&$hit_sector&"* "
			gosub :switchboard~switchboard
			send $suffix
		else
			setvar $switchboard~message $taglineb&" TRIGGERED "&$launch_from&"->"&$hit_sector&"* "
			gosub :switchboard~switchboard
			send $suffix
		end
		settextlinetrigger landed :doscan_landed "Enter Citadel"
		setstrigger notlanded :doscan_notlanded "Are you sure you want to jettison all cargo"
		setdelaytrigger whatsup :whatsup 4000
		pause

		:whatsup
		killalltriggers
		gosub :player~quikstats
		if ($player~current_prompt <> "Command")
			send " p d 0* 0* 0* * *** * c q q q q q z 2 2 c q * z * *** * * '"&$taglineb&" Attempting To Reach Correct Prompt...*"
			settextlinetrigger emq_complete :emq_delay "Attempting To Reach Correct Prompt..."
			setdelaytrigger emq_delay :emq_delay 3000
			pause

			:emq_delay
			killalltriggers
		end
		setvar $werehere currentsector
		gosub :call_save_me
		halt

		:doscan_notlanded
		killalltriggers
		settexttrigger wherearewe :wherearewe "(?="
		send "   *   "
		pause

		:wherearewe
		gettext currentline $werehere "]:[" "] (?=He"
		isnumber $tst $werehere
		if ($tst = 0)
			setvar $werehere 0
		end
		if ($werehere <> $start_sector)
			gosub :call_save_me
		else
			gosub :spit_it_out
			setvar $switchboard~message $taglineb&" Planet #"&$planet~planet&" Not In Sector, Halting!!*"
			gosub :switchboard~switchboard
			halt
		end
		halt

		:doscan_landed
		killalltriggers
	end
else

	if ($firephoton)
		setvar $switchboard~message $taglineb&" FIRED "&$launch_from&"->"&$hit_sector&", Halting!!*"
		gosub :switchboard~switchboard
	else
		setvar $switchboard~message $taglineb&" TRIGGERED "&$launch_from&"->"&$hit_sector&", Halting!!*"
		gosub :switchboard~switchboard
	end
	gosub :spit_it_out
	halt
end

gosub :spit_it_out
gosub :player~quikstats

if ($player~current_prompt = "Citadel")
	send " Q "
	gosub :planet~getplanetinfo
	send "T N L 2* T N L 3* T N T 1* C "
	if ($planet~planet_fuel < $ore_tolerance)
		setvar $cashamount $planet~planet_fuel
		gosub :commasize
		setvar $switchboard~message $taglineb&" Planet ORE at "&$cashamount&", Stopping*"
		gosub :switchboard~switchboard
		halt
	end
else
	setvar $switchboard~message $taglineb&" At Wrong Prompt. Should be in the Citadel!**"
	gosub :switchboard~switchboard
	halt
end

if ($continuous)
	if ($player~photons = 0)
		gosub :withdraw_cash
		if ($loot < $credit_limit)
			setvar $switchboard~message $taglineb&" Not Enough Cash To Furb - Halting!*"
			gosub :switchboard~switchboard
			halt
		end

		gosub :buy_fotons
		gosub :player~quikstats
		if ($player~photons = 0)
			setvar $switchboard~message $taglineb&" No Photons Furb'd - Halting!*"
			gosub :switchboard~switchboard
			halt
		end
		if ($player~credits > $credits_on_hand)
			send " TT"&($player~credits - $credits_on_hand)&"*"
			gosub :switchboard~switchboard
		end
	end
	gosub :player~quikstats
	if ($unlim = 0)
		if ($player~turns <= $turn_limit)
			setvar $switchboard~message $taglineb&" Turn Limit Reached. Halting!*"
			gosub :switchboard~switchboard
			halt
		end
	end

	if ($player~ore_holds < $player~total_holds)
		setvar $switchboard~message $taglineb&" Ship Holds Not Full Of ORE - Halting!*"
		gosub :switchboard~switchboard
		halt
	end
	goto :disp_banner
end
halt

:wrong
killalltriggers
gosub :player~quikstats
if ($player~current_prompt = "Citadel")

elseif ($player~current_prompt = "Command")
	if ($player~current_sector <> $start_sector)
		setvar $werehere $player~current_sector
		gosub :call_save_me
		halt
	else
		send " L Z"&#8&$planet~planet&"*  *  J  C  *  ^ Q "
		waitfor ": ENDINTERROG"
		gosub :player~quikstats
		if ($player~current_prompt <> "Citadel")
			setvar $switchboard~message $taglineb&" At Wrong Prompt. Should be in the Citadel!**"
			gosub :switchboard~switchboard
			halt
		end
	end

	send "  Q  "
	gosub :planet~getplanetinfo
	send "T  N  L  2*  T  N  L  3*  T  N  T  1*  C  "

	if ($unlim = 0)
		if ($player~turns <= $turn_limit)
			setvar $switchboard~message $taglineb&" Turn Limit Reached. Halting!*"
			gosub :switchboard~switchboard
			halt
		end
	end

	if ($planet~planet_fuel < $ore_tolerance)
		setvar $cashamount $planet~planet_fuel
		gosub :commasize
		setvar $switchboard~message $taglineb&" Planet ORE at "&$cashamount&", Stopping*"
		gosub :switchboard~switchboard
		halt
	end
	if ($player~photons = 0)
		setvar $switchboard~message $taglineb&" Out Of Photons, Stopping!*"
		gosub :switchboard~switchboard
		halt
	end
else
	setvar $switchboard~message $taglineb&" At Wrong Prompt. Should be in the Citadel!**"
	gosub :switchboard~switchboard
	halt
end
goto :inac
halt

:aliens_check
settextlinetrigger aliens :alienracefound "are on the move"
settexttrigger nadda :nadda "(?="
send "#"
waitfor "Who's Playing"
pause

:alienracefound
killalltriggers
setvar $aliens true
return

:nadda
killalltriggers
setvar $aliens false
return

:call_save_me
settexttrigger friendlyplanet :friendlyplanet "Saveme script activated - Planet "
setdelaytrigger timeout :timeout 30000
send "'"&$werehere&"=saveme* F Z 1 * Z C D * "
pause

:timeout
killalltriggers
setvar $switchboard~message $taglineb&" 30 seconds after save call, script halted.**"
gosub :switchboard~switchboard
halt

:friendlyplanet
killalltriggers
gettext currentline $planet "Saveme script activated - Planet " " to "
send "L "&$planet&"* C 'I landed on planet "&$planet&"* * "
halt
return

:good_to_go
if ($player~current_prompt <> "Citadel")
	setvar $switchboard~message $taglineb&" Must Start From The Citadel**"
	gosub :switchboard~switchboard
	halt
end

if ((stardock = "") or (stardock = 0))
	setvar $switchboard~message $taglineb&" StarDock Not In TWX DBase!**"
	gosub :switchboard~switchboard
	halt
end

if ($player~photons <= 0)
	setvar $switchboard~message $taglineb&" Ship is out of photons, shutting down.*"
	gosub :switchboard~switchboard
	halt
else
	setvar $firephoton true
end

setvar $start_sector $player~current_sector

if ($player~credits > $credits_on_hand)
	send "TT"&($player~credits - $credits_on_hand)&"*"
	gosub :switchboard~switchboard
end
send "q "
gosub :planet~getplanetinfo
send "c "
if ($planet~planet_tpad = 0)
	setvar $switchboard~message $taglineb&" Planet Does Not Appear To Have Transport Pad*"
	gosub :switchboard~switchboard
	halt
end

if ($planet~planet = 0)
	setvar $switchboard~message $taglineb&" Unable To Obtain Planet Number.*"
	gosub :switchboard~switchboard
	halt
end

if ($planet~planet_fuel < $planet~planet_fuel_min)
	setvar $switchboard~message $taglineb&" Planet Has Too Little Fuel ORE*"
	gosub :switchboard~switchboard
	halt
end

send " cn"
settextlinetrigger cn1 :cn1 " ANSI graphics            - Off"
settextlinetrigger cn2 :cn2 " Animation display        - On"
settextlinetrigger cn9 :cn9 " Abort display on keys    - ALL KEYS"
settextlinetrigger cna :cna " Message Display Mode     - Long"
settextlinetrigger cnb :cnb " Screen Pauses            - Yes"
settextlinetrigger cnc :cnc " Online Auto Flee         - On"
setstrigger cnd :cnd "Settings command (?=Help)"
pause

:cn1
killtrigger cn1
setvar $cn1 true
pause

:cn2
killtrigger cn2
setvar $cn2 true
pause

:cn9
killtrigger cn9
setvar $cn9 true
pause

:cna
killtrigger cna
setvar $cna true
pause

:cnb
killtrigger cnb
setvar $cnb true
pause

:cnc
killtrigger cnc
setvar $cnc true
pause

:cnd
killalltriggers
setvar $str ""
if ($cn1)
	setvar $str $str&1
end
if ($cn2)
	setvar $str $str&2
end
if ($cn9)
	setvar $str $str&9
end
if ($cna)
	setvar $str $str&"A"
end
if ($cnb)
	setvar $str $str&"B"
end
if ($cnc)
	setvar $str $str&"C"
end

send $str&" q q "
waitfor "Citadel command (?="
send " SZ*  Q  T  N  L  1*  T  N  L  2*  T  N  L  3*  T  N  T  1*  C  C  U  Y  V  0*  Y  Y  Q"
waitfor "<Computer deactivated>"
waitfor "Citadel command (?="

if ((sector.figs.owner[$start_sector] <> "belong to your Corp") and (sector.figs.owner[$start_sector] <> "yours"))
	setvar $switchboard~message $taglineb&" Must Have Friendly Fighter(s) Deployed In Start Sector!!*"
	gosub :switchboard~switchboard
	halt
end
return

:read_in_figs
echo "**"&ansi_14&$taglineb&ansi_15&" Reading Sector Parameters & Building Arrays...**"
gosub :switchboard~switchboard
setvar $idx 11

while ($idx <= sectors)
	getsectorparameter $idx "FIGSEC" $flag
	isnumber $tst $flag
	if ($tst <> 0)
		if ($flag > 0)
			setvar $figs[$idx] 1
		end
	end
	add $idx 1
end

setvar $idx 11
setvar $fcnt 0

while ($idx <= sectors)
	setvar $i 1
	setvar $ptr 1
	while ($i <= sector.warpcount[$idx])
		setvar $adj sector.warps[$idx][$i]
		if (($figs[$adj] <> 0) and ($ptr <= 5))
			if ($ptr = 1)
				setvar $sects[$idx] $adj
				add $fcnt 1
			else
				setvar $sects[$idx][$ptr] $adj
			end
			add $ptr 1
		end
		add $i 1
	end
	add $idx 1
end

if ($fcnt = 0)
	setvar $switchboard~message $taglineb&" No Deployed Fighter Data Located. Update FIG List!*"
	gosub :switchboard~switchboard
	halt
end

return

:clear_sector
if ($launch_from <> 0)
	setvar $ptr $sects[$launch_from]
	setvar $j 1
	while ($j <= 5)
		if ($ptr <> 0)
			setvar $i 1
			while ($i < 5)
				if (($sects[$ptr][$i] = $launch_from) or ($sects[$ptr][$i] = 0))
					if ($i = 1)
						setvar $sects[$ptr] $sects[$ptr][$i]
						setvar $sects[$ptr][$i] 0
					else
						setvar $sects[$ptr][$i] $sects[$ptr][($i + 1)]
						setvar $sects[$ptr][($i + 1)] 0
					end
				end
				add $i 1
			end
		end
		setvar $ptr $sects[$launch_from][$j]
		add $j 1
	end
	setvar $sects[$launch_from] 0
	setvar $sects[$launch_from][1] 0
	setvar $sects[$launch_from][2] 0
	setvar $sects[$launch_from][3] 0
	setvar $sects[$launch_from][4] 0
	setvar $sects[$launch_from][5] 0
end
return

:doscan_den
setvar $line_pointer 1
send "  S  D*  J  *  "
waitfor "-------------------------------------------"
setstrigger donescan_d :donescan_d "Command [TL="
setstrigger end_of_lines_d :end_of_lines_d "Are you sure you want to jettison all cargo"

:reset_trigger_d
settextlinetrigger line :line_d
pause

:line_d
setvar $scan_line_d currentline
if (($scan_line_d = "") or ($scan_line_d = 0))
	goto :reset_trigger_d
end
if ($line_pointer <= 1000)
	replacetext $scan_line_d " ==>    " " => "
	replacetext $scan_line_d "  Warps : " "  Warps: "
	replacetext $scan_line_d "   NavHaz :   " " Haz: "
	replacetext $scan_line_d "  Anom : " " Anom: "
	setvar $holooutput[$line_pointer] $scan_line_d
	add $line_pointer 1
end
goto :reset_trigger_d

:end_of_lines_d
killtrigger line_d
setvar $holooutput[$line_pointer] "ENDENDENDENDENDENDEND"
pause

:donescan_d
killalltriggers
return

:doscan
setvar $line_pointer 1
send " S H*  J  *  "
settextlinetrigger donescan :donescan "Warps to Sector(s) :"
setslinetrigger noscan :noscan "Handle which mine type, 1 Armid or 2 Limpet"
setstrigger end_of_lines :end_of_lines "Are you sure you want to jettison all cargo"

:reset_trigger
settextlinetrigger line :line
pause

:line
setvar $holooutput[$line_pointer] currentline
if ($line_pointer <= 1000)
	add $line_pointer 1
end
goto :reset_trigger

:donescan
killtrigger line
setvar $holooutput[$line_pointer] "ENDENDENDENDENDENDEND"
pause

:noscan
killalltriggers

halt

:end_of_lines
killalltriggers
return

:commasize
if ($cashamount < 1000)

elseif ($cashamount < 1000000)
	getlength $cashamount $len
	setvar $len ($len - 3)
	cuttext $cashamount $tmp 1 $len
	cuttext $cashamount $tmp1 ($len + 1) 999
	setvar $tmp $tmp&","&$tmp1
	setvar $cashamount $tmp
elseif ($cashamount <= 999999999)
	getlength $cashamount $len
	setvar $len ($len - 6)
	cuttext $cashamount $tmp 1 $len
	setvar $tmp $tmp&","
	cuttext $cashamount $tmp1 ($len + 1) 3
	setvar $tmp $tmp&$tmp1&","
	cuttext $cashamount $tmp1 ($len + 4) 999
	setvar $tmp $tmp&$tmp1
	setvar $cashamount $tmp
end
return

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
return

:spit_it_out
if ($line_pointer > 0)
	if ($holo_scan)
		setvar $i 1
		send "'*"
		send "{"&$switchboard~bot_name&"} "&$taglineb&" -------- Sector Scan From "&$launch_from&" ---------*"
		while ($i < $line_pointer)
			getwordpos $holooutput[$i] $pos "Sector  : "&$hit_sector
			if ($pos <> 0)
				while ($i < $line_pointer)
					getwordpos $holooutput[$i] $pos "Warps to Sector(s) :"
					if (($holooutput[$i] = "") or ($pos <> 0))
						send "     **"
						goto :done_scn
					end
					send $holooutput[$i]&"*"
					add $i 1
				end
			end
			add $i 1
		end

		:done_scn
	elseif ($den_scan)
		setvar $i 1
		send "'*"
		send "{"&$switchboard~bot_name&"} "&$taglineb&" ------- Sector Density Scan From "&$launch_from&" --------*"
		while ($i < $line_pointer)
			getwordpos $holooutput[$i] $pos "Command [TL="
			if ($pos = 0)
				send $holooutput[$i]&"*"
			else
				send "    **"
				goto :done_scn_d
			end
			add $i 1
		end

		:done_scn_d
	end
end
return

:buy_fotons
killalltriggers
if ($player~alignment < 1000)
	setvar $switchboard~message $taglineb&" Unable To Furb - Alignment's Below 1,000!*"
	gosub :switchboard~switchboard
	halt
end

settextlinetrigger doneburst :doneburst ": ENDINTERROG"

send " C V O* Y N "&stardock&"* V 0* Y N "&$start_sector&"* U Y Q* ^F"&$player~current_sector&"*"&stardock&"*F"&stardock&"*"&$player~current_sector&"*Q"
pause

:doneburst
killalltriggers

setdelaytrigger wait_a_bit :wait_a_bit 1000
pause

:wait_a_bit
killalltriggers

getdistance $dist $player~current_sector stardock
if ($planet~planet_tpad < $dist)
	setvar $switchboard~message $taglineb&" Unable To Furb - StarDock Is Out Of Range Of T-Pad!*"
	gosub :switchboard~switchboard
	halt
end
getdistance $dist stardock $player~current_sector
if ($dist > ($player~ore_holds / 3))
	setvar $switchboard~message $taglineb&" Unable To Furb - Not Enough Gas For Return Trip!*"
	gosub :switchboard~switchboard
	halt
end

settextlinetrigger itsalive :buy_fotons_itsalive "Items     Status  Trading % of max OnBoard"
settextlinetrigger nosoupforme :buy_fotons_nosoupforme "I have no information about a port in that sector"
setdelaytrigger wehaveaprob :buy_fotons_wehaveaprob 3000
send "CR"&stardock&"*Q "
waitfor "Computer command [TL"
pause

:buy_fotons_wehaveaprob
killalltriggers
setvar $switchboard~message $taglineb&" Unable To Furb - Problem Comfirming StarDock's Alive (Timed Out)!*"
gosub :switchboard~switchboard
halt

:buy_fotons_nosoupforme
killalltriggers
setvar $switchboard~message $taglineb&" Unable To Furb - StarDock Appears To Have Been Blown!*"
gosub :switchboard~switchboard
halt

:buy_fotons_itsalive
killalltriggers

gosub :player~quikstats

setstrigger buy_fotons_blind :buy_fotons_blind "Do you want to make this transport blind"
setstrigger buy_fotons_go :buy_fotons_go "All Systems Ready, shall we engage?"
setslinetrigger buy_fotons_miss :buy_fotons_miss "Computer command [TL="
send " B "&stardock&"* C Q "
pause

:buy_fotons_blind
killalltriggers
setvar $switchboard~message $taglineb&" Unable To Furb - Unable To Obtain B-Warp Lock!*"
gosub :switchboard~switchboard
halt

:buy_fotons_miss
killalltriggers
setvar $switchboard~message $taglineb&" Unable To Furb - Unable To B-Warp. Planet ORE May Be Low!*"
gosub :switchboard~switchboard
halt

:buy_fotons_go
killalltriggers
send " Y  P  SGYGQHP"
waitfor "How many Photon Missiles do you want"
gettext currentline $lets_buy "(Max " ")"
send $lets_buy "*"

setstrigger buy_fotonstwarp_lock :buy_fotonstwarp_lock "All Systems Ready, shall we engage"
setstrigger buy_fotonsno_twrp_lock :buy_fotonsno_twarp_lock "Do you want to make this jump blind"
send "Q  Q  Q  Z  N  *  M"&$start_sector&"* Y "
pause

:buy_fotonsno_twarp_lock
killalltriggers
send " N  *  P  SGYG"
setvar $switchboard~message $taglineb&" Unable To Return, Blind Warp Averted Hiding On Dock!*"
gosub :switchboard~switchboard
halt

:buy_fotonstwarp_lock
killalltriggers
send " Y *  *  L Z"&#8&$planet~planet&"*  * JC*"
gosub :switchboard~switchboard
setslinetrigger buy_fotons_notlanded1 :buy_fotons_notlanded1 "Are you sure you want to jettison all cargo?"
setdelaytrigger buy_fotons_notlanded2 :buy_fotons_notlanded2 4000
settextlinetrigger buy_fotons_landed :buy_fotons_landed "<Enter Citadel>"
pause

:buy_fotons_notlanded1
killalltriggers
setvar $switchboard~message $taglineb&" Not Landed. Planet "&$planet~planet&", Not Found!*"
gosub :switchboard~switchboard
halt

:buy_fotons_notlanded2
killalltriggers
setvar $switchboard~message $taglineb&" Return Trip Timed Out - Check My TA!*"
gosub :switchboard~switchboard
halt

:buy_fotons_landed
killalltriggers
send "Q T N T 1* * C"
return

:withdraw_cash
setvar $loot 0
settextlinetrigger treasury :treasury "Citadel treasury contains"
setdelaytrigger tellers_on_a_smokebreak :tellers_on_a_smokebreak 3000
send "  D"
pause

:tellers_on_a_smokebreak
killalltriggers
setvar $switchboard~message $taglineb&" Unable To Take Cash From Citadel, Halting!*"
gosub :switchboard~switchboard
halt

:treasury
killalltriggers
gettext currentline $loot "contains" "credits."
striptext $loot ","
striptext $loot " "
if ($loot > $credits_withdraw)
	setvar $loot $credits_withdraw
end
send "TF"&$loot&"*"
return

# includes:
include "source\include\planet"
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
