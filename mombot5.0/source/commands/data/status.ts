gosub :loadvars~loadvars
gosub :help~initialize

setvar $help~help[1] $help~tab&"Reports information about bot on subspace  "
setvar $help~help[2] $help~tab&"        "
setvar $help~help[3] $help~tab&"Special stats that are bot specific:        "
setvar $help~help[4] $help~tab&"  - Planet #: Last planet landed on"
setvar $help~help[5] $help~tab&"  - Team Name: What team name your bot respondeds to, if any"
setvar $help~help[6] $help~tab&"  - Bot mode:  What mode your bot is currently running"
setvar $help~help[7] $help~tab&"        "
gosub :help~helpfile

loadvar $planet~planet
loadvar $bot~mode
loadvar $bot~bot_team_name

# ============================== QSS ==============================
:qss
:status
gosub :player~quikstats
setvar $fedsafe false
if (($player~experience < 1000) and ($player~alignment >= 0))
	setvar $fedsafe true
end
setvar $player~startinglocation $player~current_prompt
if ($bot~mode = "General")
	if (($player~startinglocation = "Command") or ($player~startinglocation = "Citadel"))
		gosub :player~getinfo
		if ($player~noflip)
			send "CQ"
		else
			send "C N 9 Q Q "
		end
		waiton "Computer command [TL="
		gettext currentline $timeleft "Computer command [TL=" "]:"
	else
		setvar $igstat "Bad Prompt"
		setvar $timeleft "Bad Prompt"
	end
else
	setvar $igstat "Busy"
	setvar $timeleft "Busy"
end

if ($bot~parm1 <> "0")
	# check for specific stat #
	setvar $switchboard~message ""
	getwordpos " "&$bot~user_command_line&" " $pos " phot"
	if ($pos > 0)
		setvar $switchboard~message $switchboard~message&"Photons: "&$player~photons&"*"
	end
	getwordpos " "&$bot~user_command_line&" " $pos " tur"
	if ($pos > 0)
		setvar $switchboard~message $switchboard~message&"Turns: "&$player~turns&"*"
	end
	getwordpos " "&$bot~user_command_line&" " $pos " sect"
	if ($pos > 0)
		setvar $switchboard~message $switchboard~message&"Sector: "&$player~current_sector&"*"
	end
	getwordpos " "&$bot~user_command_line&" " $pos " ship"
	if ($pos > 0)
		setvar $switchboard~message $switchboard~message&"Ship Number: "&$player~ship_number&"*"
	end
	getwordpos " "&$bot~user_command_line&" " $pos " exp"
	if ($pos > 0)
		setvar $switchboard~message $switchboard~message&"Experience: "&$player~experience&"*"
	end
	getwordpos " "&$bot~user_command_line&" " $pos " ali"
	if ($pos > 0)
		setvar $switchboard~message $switchboard~message&"Alignment: "&$player~alignment&"*"
	end
	getwordpos " "&$bot~user_command_line&" " $pos " fue"
	if ($pos > 0)
		setvar $switchboard~message $switchboard~message&"Fuel Ore: "&$player~ore_holds&"*"
	end
	getwordpos " "&$bot~user_command_line&" " $pos " org"
	if ($pos > 0)
		setvar $switchboard~message $switchboard~message&"Organics: "&$player~organic_holds&"*"
	end
	getwordpos " "&$bot~user_command_line&" " $pos " eq"
	if ($pos > 0)
		setvar $switchboard~message $switchboard~message&"Equipment: "&$player~equipment_holds&"*"
	end
	getwordpos " "&$bot~user_command_line&" " $pos " at"
	if ($pos > 0)
		setvar $switchboard~message $switchboard~message&"Atomics: "&$player~atomic&"*"
	end
	getwordpos " "&$bot~user_command_line&" " $pos " hol"
	if ($pos > 0)
		setvar $switchboard~message $switchboard~message&"Holds: "&$player~total_holds&"*"
	end
	getwordpos " "&$bot~user_command_line&" " $pos " fig"
	if ($pos > 0)
		setvar $switchboard~message $switchboard~message&"Fighters: "&$player~fighters&"*"
	end
	getwordpos " "&$bot~user_command_line&" " $pos " sh"
	if ($pos > 0)
		setvar $switchboard~message $switchboard~message&"Shields: "&$player~shields&"*"
	end
	getwordpos " "&$bot~user_command_line&" " $pos " cre"
	if ($pos > 0)
		setvar $switchboard~message $switchboard~message&"Credits: "&$player~credits&"*"
	end
	getwordpos " "&$bot~user_command_line&" " $pos "prob"
	if ($pos > 0)
		setvar $switchboard~message $switchboard~message&"E-Probes: "&$player~eprobes&"*"
	end
	getwordpos " "&$bot~user_command_line&" " $pos " corb"
	if ($pos > 0)
		setvar $switchboard~message $switchboard~message&"Corbomite: "&$player~corbo&"*"
	end
	getwordpos " "&$bot~user_command_line&" " $pos " lim"
	if ($pos > 0)
		setvar $switchboard~message $switchboard~message&"Limpet Mines: "&$player~limpets&"*"
	end
	getwordpos " "&$bot~user_command_line&" " $pos " min"
	if ($pos > 0)
		setvar $switchboard~message $switchboard~message&"Armid Mines: "&$player~armids&"*"
	end
	getwordpos " "&$bot~user_command_line&" " $pos " col"
	if ($pos > 0)
		setvar $switchboard~message $switchboard~message&"Colonists: "&$player~colonist_holds&"*"
	end
	getwordpos " "&$bot~user_command_line&" " $pos "torp"
	if ($pos > 0)
		setvar $switchboard~message $switchboard~message&"Genesis Torpedos: "&$player~genesis&"*"
	end

	if ($switchboard~message <> "")
		gosub :switchboard~switchboard
		halt
	end
end
setarray $h 35
setarray $qss 35
setarray $qss_var 35

setvar $h[1]  "Sector   :"
setvar $h[2]  "Turns    :"
setvar $h[3]  "Credits  :"
setvar $h[4]  " Fighters  :"
setvar $h[5]  " Shields   :"
setvar $h[6]  "Holds    :"
setvar $h[7]  "Fuel Ore :"
setvar $h[8]  "Organics :"
setvar $h[9]  "Equipment:"
setvar $h[10] "Colonists:"
setvar $h[11] "Photons  :"
setvar $h[12] " Armids   :"
setvar $h[13] " Limpets  :"
setvar $h[14] " Gen-Torps:"
setvar $h[15] " Transwarp :"
setvar $h[16] "Cloaks    :"
setvar $h[17] " Beacons   :"
setvar $h[18] " AtomicDet:"
setvar $h[19] " Corbomite :"
setvar $h[20] " E-Probes :"
setvar $h[21] " Disruptor:"
setvar $h[22] " PsiProbe  :"
setvar $h[23] " PlanetScn:"
setvar $h[24] " Scanner  :"
setvar $h[25] " Alignment :"
setvar $h[26] " Experience:"
setvar $h[27] " Ship ID   :"
setvar $h[28] " Planet # :"
setvar $h[29] "Time Left:"
setvar $h[30] "     Prompt:"
setvar $h[31] " IG Status:"
setvar $h[32] "  Bot Mode :"
setvar $h[33] " Team Name :"
setvar $h[34] "Planet #  :"
setvar $h[35] " Fed Safe: "
setvar $qss[1] $player~current_sector
if ($player~unlimitedgame)
	setvar $qss[2] "Unlim"
else
	setvar $qss[2] $player~turns
end
setvar $qss[3] $player~credits
setvar $qss[4] $player~fighters
setvar $qss[5] $player~shields
setvar $qss[6] $player~total_holds
setvar $qss[7] $player~ore_holds
setvar $qss[8] $player~organic_holds
setvar $qss[9] $player~equipment_holds
setvar $qss[10] $player~colonist_holds
setvar $qss[11] $player~photons
setvar $qss[12] $player~armids
setvar $qss[13] $player~limpets
setvar $qss[14] $player~genesis
setvar $qss[15] $player~twarp_type
setvar $qss[16] $player~cloaks
setvar $qss[17] $player~beacons
setvar $qss[18] $player~atomic
setvar $qss[19] $player~corbo
setvar $qss[20] $player~eprobes
setvar $qss[21] $player~mine_disruptors
setvar $qss[22] $player~psychic_probe
setvar $qss[23] $player~planet_scanner
setvar $qss[24] $player~scan_type
setvar $qss[25] $player~alignment
setvar $qss[26] $player~experience
setvar $qss[27] $player~ship_number
if (($player~startinglocation = "Planet") or ($player~startinglocation = "Citadel"))
	if ($planet~planet = "0")
		setvar $qss[28] "None"
	else
		setvar $qss[28] $planet~planet
	end
else
	setvar $qss[28] "None"
end
if ($timeleft = "00:00:00")
	setvar $qss[29] "Unlim"
else
	setvar $qss[29] $timeleft
end

if (($player~startinglocation = "Planet") or ($player~startinglocation = "Citadel") or ($player~startinglocation = "Corporate") or ($player~startinglocation = "Command"))
	setvar $qss[30] $player~startinglocation
else
	setvar $prompt $player~full_current_prompt
	getlength $prompt $prompt_length
	if ($prompt_length > 10)
		cuttext $prompt $prompt 1 10
	end
	setvar $qss[30] $prompt
end
setvar $qss[31] $player~igstat
setvar $qss[32] $bot~mode
if (($bot~bot_team_name = "all") or ($bot~bot_team_name = false))
	setvar $qss[33] "None"
else
	setvar $qss[33] $bot~bot_team_name
end
if ($planet~planet = "0")
	setvar $qss[34] "None"
else
	setvar $qss[34] $planet~planet
end
if ($fedsafe = true)
	setvar $qss[35] "Yes"
else
	setvar $qss[35] "No"
end

setvar $qss_ss 0
setvar $qss_count 1
setvar $spc " "
setvar $overall 15

:qss_gather
while ($qss_count <= 35)
	setvar $spc_count 1
	#upperCase $h[$qss_count]
	setvar $qss_var[$qss_count] $h[$qss_count]&$qss[$qss_count]
	setvar $total_length 18
	getlength $qss_var[$qss_count] $text_length
	subtract $total_length $text_length
	while ($total_length >= 0)
		setvar $qss_var[$qss_count] $qss_var[$qss_count]&$spc
		subtract $total_length 1
	end
	add $qss_count 1
end

:qss_send
setvar $switchboard~message "                    --- Status Update ---                        *"
setvar $switchboard~message $switchboard~message&"----------------------------------------------------------------*"
setvar $switchboard~message $switchboard~message&"  "&$qss_var[1]&$qss_var[27]&$qss_var[28]&"*"
setvar $switchboard~message $switchboard~message&"  "&$qss_var[3]&$qss_var[4]&$qss_var[13]&"*"
setvar $switchboard~message $switchboard~message&"  "&$qss_var[2]&$qss_var[5]&$qss_var[12]&"*"
setvar $switchboard~message $switchboard~message&"  "&$qss_var[11]&$qss_var[25]&$qss_var[21]&"*"
setvar $switchboard~message $switchboard~message&"  "&$qss_var[6]&$qss_var[26]&$qss_var[20]&"*"
setvar $switchboard~message $switchboard~message&"  "&$qss_var[7]&$qss_var[17]&$qss_var[14]&"*"
setvar $switchboard~message $switchboard~message&"  "&$qss_var[8]&$qss_var[22]&$qss_var[18]&"*"
setvar $switchboard~message $switchboard~message&"  "&$qss_var[9]&$qss_var[19]&$qss_var[23]&"*"
setvar $switchboard~message $switchboard~message&"  "&$qss_var[10]&$qss_var[15]&$qss_var[24]&"*"
setvar $switchboard~message $switchboard~message&"  "&$qss_var[29]&$qss_var[33]&$qss_var[31]&"*"
setvar $switchboard~message $switchboard~message&"    *"
setvar $switchboard~message $switchboard~message&$qss_var[32]&"  "&$qss_var[30]&"    "&$qss_var[35]&"*"
setvar $switchboard~message $switchboard~message&"----------------------------------------------------------------**"

if ($switchboard~self_command <> true)
	setvar $switchboard~self_command 2
else
	setvar $switchboard~message "   *"&$switchboard~message
end
gosub :switchboard~switchboard
halt
# ============================== END QSS SUB ==============================

# includes:
include "source\include\player"
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
