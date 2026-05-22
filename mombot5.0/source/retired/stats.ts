systemscript
loadvar $switchboard~bot_name
loadvar $bot~user_command_line
loadvar $bot~parm1
loadvar $bot~parm2
loadvar $bot~parm3
loadvar $self_command
loadvar $map~stardock
loadvar $map~backdoor
loadvar $map~rylos
loadvar $map~alpha_centauri
loadvar $player~unlimitedgame
loadvar $player~credits
loadvar $player~fighters
loadvar $player~shields
loadvar $player~total_holds
loadvar $player~ore_holds
loadvar $player~organic_holds
loadvar $player~equipment_holds
loadvar $player~colonist_holds
loadvar $player~photons
loadvar $player~armids
loadvar $player~limpets
loadvar $player~genesis
loadvar $player~twarp_type
loadvar $player~cloaks
loadvar $player~beacons
loadvar $player~atomic
loadvar $player~corbo
loadvar $player~eprobes
loadvar $player~mine_disruptors
loadvar $player~psychic_probe
loadvar $player~planet_scanner
loadvar $player~scan_type
loadvar $player~alignment
loadvar $player~experience
loadvar $player~ship_number
loadvar $player~trader_name

loadvar $switchboard~bot_name

window coms 280 650 "Stats" ontop
gosub :update_window

gosub :targeting~initializetargeting

:start_over
setvar $player~current_prompt      "Undefined"
killtrigger noprompt
killtrigger prompt
killtrigger statlinetrig
killtrigger getline2
killtrigger playerinfo
killtrigger getshipoffense
killtrigger getshipfighters
killtrigger getshipmines
settextlinetrigger  prompt      :allprompts     #145 & #8
settextlinetrigger  statlinetrig    :statstart      #179
settextlinetrigger  playerinfo :playerinfo  "<Info>"
settextlinetrigger  getshipoffense      :shipoffenseodds    "Offensive Odds: "
settextlinetrigger  getshipfighters     :shipmaxfigsperattack   " TransWarp Drive:   "
settextlinetrigger  getshipmines        :shipmaxmines       " Mine Max:  "

pause

:allprompts
getword currentline $player~current_prompt 1
setvar $player~full_current_prompt currentline
striptext $player~full_current_prompt #145
striptext $player~full_current_prompt #8
striptext $player~current_prompt #145
striptext $player~current_prompt #8
settextlinetrigger  prompt      :allprompts     #145 & #8
pause

:statstart
killtrigger prompt
setvar $stats ""
setvar $wordy ""

:statsline
killtrigger statlinetrig
killtrigger getline2
setvar $line2 currentline
replacetext $line2 #179 " "
striptext $line2 ","
setvar $stats $stats & $line2
getwordpos $line2 $pos "Ship"
if ($pos > 0)
	goto :gotstats
else
	settextlinetrigger getline2 :statsline
	pause
end

:gotstats
setvar $stats $stats & " @@@"
setvar $current_word 0
while ($wordy <> "@@@")
	if ($wordy = "Sect")
		getword $stats $player~current_sector      ($current_word + 1)
	elseif ($wordy = "Turns")
		getword $stats $player~turns           ($current_word + 1)
	elseif ($wordy = "Creds")
		getword $stats $player~credits         ($current_word + 1)
	elseif ($wordy = "Figs")
		getword $stats $player~fighters        ($current_word + 1)
	elseif ($wordy = "Shlds")
		getword $stats $player~shields         ($current_word + 1)
	elseif ($wordy = "Hlds")
		getword $stats $player~total_holds         ($current_word + 1)
	elseif ($wordy = "Ore")
		getword $stats $player~ore_holds           ($current_word + 1)
	elseif ($wordy = "Org")
		getword $stats $player~organic_holds       ($current_word + 1)
	elseif ($wordy = "Equ")
		getword $stats $player~equipment_holds     ($current_word + 1)
	elseif ($wordy = "Col")
		getword $stats $player~colonist_holds      ($current_word + 1)
	elseif ($wordy = "Phot")
		getword $stats $player~photons         ($current_word + 1)
	elseif ($wordy = "Armd")
		getword $stats $player~armids          ($current_word + 1)
	elseif ($wordy = "Lmpt")
		getword $stats $player~limpets         ($current_word + 1)
	elseif ($wordy = "GTorp")
		getword $stats $player~genesis         ($current_word + 1)
	elseif ($wordy = "TWarp")
		getword $stats $player~twarp_type          ($current_word + 1)
	elseif ($wordy = "Clks")
		getword $stats $player~cloaks          ($current_word + 1)
	elseif ($wordy = "Beacns")
		getword $stats $player~beacons         ($current_word + 1)
	elseif ($wordy = "AtmDt")
		getword $stats $player~atomic          ($current_word + 1)
	elseif ($wordy = "Corbo")
		getword $stats $player~corbo           ($current_word + 1)
	elseif ($wordy = "EPrb")
		getword $stats $player~eprobes         ($current_word + 1)
	elseif ($wordy = "MDis")
		getword $stats $player~mine_disruptors     ($current_word + 1)
	elseif ($wordy = "PsPrb")
		getword $stats $player~psychic_probe       ($current_word + 1)
	elseif ($wordy = "PlScn")
		getword $stats $player~planet_scanner      ($current_word + 1)
	elseif ($wordy = "LRS")
		getword $stats $player~scan_type           ($current_word + 1)
	elseif ($wordy = "Aln")
		getword $stats $player~alignment           ($current_word + 1)
	elseif ($wordy = "Exp")
		getword $stats $player~experience          ($current_word + 1)
	elseif ($wordy = "Corp")
		getword $stats $player~corp            ($current_word + 1)
	elseif ($wordy = "Ship")
		getword $stats $player~ship_number         ($current_word + 1)
	end
	add $current_word 1
	getword $stats $wordy $current_word
end

:donequikstats
killtrigger statlinetrig
killtrigger getline2
gosub :update_window
goto :start_over

:playerinfo
settextlinetrigger gettradername            :gettradername "Trader Name    :"
settextlinetrigger getexpandalign           :getexpandalign "Rank and Exp"
settextlinetrigger getcorp          :getcorp "Corp           #"
settextlinetrigger getshiptype              :getshiptype "Ship Info      :"
settextlinetrigger gettpw           :gettpw "Turns to Warp  :"
settextlinetrigger getsect          :getsect "Current Sector :"
settextlinetrigger getturns                 :getturns "Turns left"
settextlinetrigger getholds                 :getholds "Total Holds"
settextlinetrigger getfighters              :getfighters "Fighters       :"
settextlinetrigger getshields               :getshields "Shield points  :"
settextlinetrigger getphotons               :getphotons "Photon Missiles:"
settextlinetrigger getscantype              :getscantype "LongRange Scan :"
settextlinetrigger gettwarptype1            :gettwarptype1 "  (Type 1 Jump):"
settextlinetrigger gettwarptype2            :gettwarptype2 "  (Type 2 Jump):"
settextlinetrigger getcredits               :getcredits "Credits"
settextlinetrigger checkig          :checkig "Interdictor ON :"
settexttrigger getinfodone          :getinfodone "Command [TL="
settexttrigger getinfodone2                 :getinfodone "Citadel command"
pause

:getinfo_cn9_check
setvar $noflip  true
pause

:gettradername
killtrigger getinfo_cn9_check_1
killtrigger getinfo_cn9_check_2
setvar $player~trader_name currentline
striptext $player~trader_name "Trader Name    : "
setvar $i 1
while ($i <= $player~rankslength)
	setvar $temp $player~ranks[$i]
	striptext $temp "31m"
	striptext $temp "36m"
	striptext $player~trader_name $temp&" "
	add $i 1
end
pause

:getexpandalign
getword currentline $player~experience 5
getword currentline $player~alignment 7
striptext $player~experience ","
striptext $player~alignment ","
striptext $player~alignment "Alignment="
pause

:getcorp
getword currentline $player~corp 3
striptext $player~corp ","
setvar $player~corpstring "[" & $player~corp & "]"
pause

:getshiptype
getwordpos currentline $shiptypeend "Ported="
subtract $shiptypeend 18
cuttext currentline $player~ship_type 18 $shiptypeend
pause

:gettpw
getword currentline $player~turns_per_warp 5
pause

:getsect
getword currentline $player~current_sector 4
pause

:getturns
getword currentline $player~turns 4
if ($player~turns = "Unlimited")
	setvar $player~unlimitedgame true
end
savevar $player~unlimitedgame
pause

:getholds
setvar $temp (currentline & " ")
gettext $temp $player~ore_holds "Ore=" " "
if ($player~ore_holds = "")
	setvar $player~ore_holds "0"
end
gettext $temp $player~organic_holds "Organics=" " "
if ($player~organic_holds = "")
	setvar $player~organic_holds "0"
end
gettext $temp $player~equipment_holds "Equipment=" " "
if ($player~equipment_holds = "")
	setvar $player~equipment_holds "0"
end
gettext $temp $player~colonist_holds "Colonists=" " "
if ($player~colonist_holds = "")
	setvar $player~colonist_holds "0"
end
gettext $temp $player~empty_holds "Empty=" " "
if ($player~empty_holds = "")
	setvar $player~empty_holds "0"
end
pause

:getfighters
getword currentline $player~fighters 3
striptext $player~fighters ","
pause

:getshields
getword currentline $player~shields 4
striptext $player~shields ","
pause

:getphotons
getword currentline $player~photons 3
pause

:getscantype
getword currentline $player~scan_type 4
pause

:gettwarptype1
getword currentline $player~twarp_1_range 4
setvar $player~twarp_type 1
pause

:gettwarptype2
getword currentline $player~twarp_2_range 4
setvar $player~twarp_type 2
pause

:getcredits
getword currentline $player~credits 3
striptext $player~credits ","
if ($player~igstat = 0)
	setvar $player~igstat "NO IG"
end
pause

:checkig
getword currentline $player~igstat 4
pause

:getinfodone
killtrigger getexpandalign
killtrigger getcorp
killtrigger getshiptype
killtrigger gettpw
killtrigger getsect
killtrigger getturns
killtrigger getholds
killtrigger getfighters
killtrigger getshields
killtrigger getphotons
killtrigger getscantype
killtrigger gettwarptype1
killtrigger gettwarptype2
killtrigger getcredits
killtrigger checkig
killtrigger getinfodone
killtrigger getinfodone2
gosub :update_window
goto :start_over

:ship_stats
:shipoffenseodds
getwordpos currentansiline $pos "[0;31m:[1;36m1"
if ($pos > 0)
	gettext currentansiline $ship~ship_offensive_odds "Offensive Odds[1;33m:[36m " "[0;31m:[1;36m1"
	striptext $ship~ship_offensive_odds " "
	gettext currentansiline $ship~ship_fighters_max "Max Fighters[1;33m:[36m" "[0;32m Offensive Odds"
	striptext $ship~ship_fighters_max ","
	striptext $ship~ship_fighters_max " "
end
pause

:shipmaxmines
gettext currentline $ship~ship_mines_max "Mine Max:" "Beacon Max:"
striptext $ship~ship_mines_max " "
pause

:shipmaxfigsperattack
getwordpos currentansiline $pos "[0m[32m Max Figs Per Attack[1;33m:[36m"
if ($pos > 0)
	gettext currentansiline $ship~ship_max_attack "[0m[32m Max Figs Per Attack[1;33m:[36m" "[0;32mTransWarp"
	striptext $ship~ship_max_attack " "
end

gosub :update_window
goto :start_over

:update_window
loadvar $map~stardock
loadvar $map~backdoor
loadvar $map~rylos
loadvar $map~alpha_centauri

setvar $contents ""
setvar $contents $contents&"----------------------------------*"
setvar $contents $contents&"      Game : "&gamename&"*"
setvar $contents $contents&"----------------------------------*"
setvar $contents $contents&"    Trader : "&$player~trader_name&"*"
setvar $contents $contents&"----------------------------------*"
if ($player~current_sector = 0)
	setvar $contents $contents&"    Sector : "&currentsector&"*"
else
	setvar $contents $contents&"    Sector : "&$player~current_sector&"*"
end
if ($planet~planet <> 0)
	setvar $contents $contents&"    Planet : "&$planet~planet&"*"
end
if ($player~unlimitedgame)
	setvar $contents $contents&"     Turns : Unlimited*"
else
	setvar $contents $contents&"     Turns : "&$player~turns&"*"
end
setvar $contents $contents&"       Exp : "&$player~experience&"*"
setvar $contents $contents&"     Align : "&$player~alignment&"*"
setvar $contents $contents&"   Credits : "&$player~credits&"*"
setvar $contents $contents&"----------------------------------*"
setvar $contents $contents&"Holds Info : "&$player~total_holds&"*"
setvar $contents $contents&"----------------------------------*"
setvar $contents $contents&"  Fuel Ore : "&$player~ore_holds&"*"
setvar $contents $contents&"  Organics : "&$player~organic_holds&"*"
setvar $contents $contents&" Equipment : "&$player~equipment_holds&"*"
setvar $contents $contents&" Colonists : "&$player~colonist_holds&"*"
setvar $empty_holds ($player~total_holds - $player~ore_holds)
setvar $empty_holds ($empty_holds - $player~organic_holds)
setvar $empty_holds ($empty_holds - $player~equipment_holds)
setvar $empty_holds ($empty_holds - $player~colonist_holds)

setvar $contents $contents&"     Empty : "&$player~empty_holds&"*"
setvar $contents $contents&"----------------------------------*"
setvar $contents $contents&"    Ship # : "&$player~ship_number&"*"
setvar $contents $contents&"----------------------------------*"
setvar $contents $contents&"  Fighters : "&$player~fighters&"*"
setvar $contents $contents&"   Shields : "&$player~shields&"*"
setvar $contents $contents&"  Max Figs : "&$player~ship_fighters_max&"*"
setvar $contents $contents&"  Max Wave : "&$player~ship_max_attack&"*"
setvar $contents $contents&"Turns/Warp : "&$player~turns_per_warp&"*"
setvar $contents $contents&"----------------------------------*"

cuttext $player~armids&"    " $player~armids 0 3
cuttext $player~cloaks&"    " $player~cloaks 0 3
cuttext $player~genesis&"    " $player~genesis 0 3
cuttext $player~mine_disruptors&"    " $player~mine_disruptors 0 3
cuttext $player~eprobes&"    " $player~eprobes 0 3
cuttext $player~twarp_type&"    " $player~twarp_type 0 3
cuttext $player~scan_type&"    " $player~scan_type 0 3

setvar $contents $contents&"   EProbes : "&$player~eprobes&" | Beacons : "&$player~beacons&"*"
setvar $contents $contents&"   Disrupt : "&$player~mine_disruptors&" | Photons : "&$player~photons&"*"
setvar $contents $contents&"    Armids : "&$player~armids&" | Limpets : "&$player~limpets&"*"
setvar $contents $contents&"   Genesis : "&$player~genesis&" | AtmDets : "&$player~atomic&"*"
setvar $contents $contents&"    Cloaks : "&$player~cloaks&" |  Corbos : "&$player~corbo&"*"
setvar $contents $contents&"     Twarp : "&$player~twarp_type&" | PlnScan : "&$player~planet_scanner&"*"
setvar $contents $contents&"   Scanner : "&$player~scan_type&" | PsiProb : "&$player~psychic_probe&"*"
setvar $contents $contents&"----------------------------------*"
setvar $contents $contents&"  Special Sectors*"
setvar $contents $contents&"----------------------------------*"
setvar $contents $contents&"     Dock  : "&$map~stardock&"*"
setvar $contents $contents&"     Alpha : "&$map~alpha_centauri&"*"
setvar $contents $contents&"     Rylos : "&$map~rylos&"*"
setvar $contents $contents&"  Backdoor : "&$map~backdoor&"*"
setvar $contents $contents&"----------------------------------*"
setwindowcontents coms $contents

savevar $player~unlimitedgame
savevar $player~credits
savevar $player~fighters
savevar $player~shields
savevar $player~total_holds
savevar $player~turns
savevar $player~ore_holds
savevar $player~organic_holds
savevar $player~equipment_holds
savevar $player~colonist_holds
savevar $player~photons
savevar $player~armids
savevar $player~limpets
savevar $player~genesis
savevar $player~twarp_type
savevar $player~cloaks
savevar $player~beacons
savevar $player~atomic
savevar $player~corbo
savevar $player~eprobes
savevar $player~mine_disruptors
savevar $player~psychic_probe
savevar $player~planet_scanner
savevar $player~scan_type
savevar $player~alignment
savevar $player~experience
savevar $player~ship_number
savevar $player~trader_name

return
# includes:
include "source\bot_includes\targeting\initializetargeting\targeting"
