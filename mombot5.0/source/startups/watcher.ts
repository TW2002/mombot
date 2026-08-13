systemscript

###########################################
#Making sure default MSL variables are set#
###########################################
loadvar $map~stardock
loadvar $bot~subspace
loadvar $bot~bot_password
loadvar $bot~bot_name
loadvar $bot~last_fighter_attack
loadvar $bot~mombot_directory
if ($bot~last_fighter_attack = 0)
	setvar $bot~last_fighter_attack 1
	#saveVar $bot~last_fighter_attack
end
setsectorparameter 1 "MSLSEC" true
setsectorparameter 2 "MSLSEC" true
setsectorparameter 3 "MSLSEC" true
setsectorparameter 4 "MSLSEC" true
setsectorparameter 5 "MSLSEC" true
setsectorparameter 6 "MSLSEC" true
setsectorparameter 7 "MSLSEC" true
setsectorparameter 8 "MSLSEC" true
setsectorparameter 9 "MSLSEC" true
setsectorparameter 10 "MSLSEC" true
if ($map~stardock > 0)
	setsectorparameter $map~stardock "MSLSEC" true
end

settextlinetrigger  federase        :federasefig        "The Federation We destroyed your Corp's "
settextlinetrigger  fighterserase       :erasefig       " of your fighters in sector "
settextlinetrigger  fightersave 	:fightersave "Deployed Fighters "
settextlinetrigger  limpsave		:limpsave	"Limpet mine in "
settextlinetrigger 	armidsave 		:armidsave "Your mines in "
settextlinetrigger  warpfigerase        :erasewarpfig       "You do not have any fighters in Sector "
settextlinetrigger  pgridadd    :pgridadd   "Successfully P-gridded into sector "
settextlinetrigger  pgridxportadd    :pgridxportadd   "Successfully P-gridded w/xport into sector "
settextlinetrigger  pgridremove    :pgridremove   "Unsuccessful P-grid into sector "
settextlinetrigger  clearbusts      :erasebusts     ">[Busted:"
settextlinetrigger  addfigs      :addfigs     ">[Figged:"
settextlinetrigger  planetmoved      :updateplanetmovement     " moved to sector "
settextlinetrigger      fightersadd     :addfig         "Should they be (D)efensive, (O)ffensive or Charge a (T)oll ?"
settextlinetrigger  getplanetnumber :setplanetnumber    "Planet #"
settextlinetrigger  getshipstats    :setshipoffensiveodds   "Offensive Odds: "
settextlinetrigger  getshipmaxfighters  :setshipmaxfigattack    " TransWarp Drive:   "
settextlinetrigger  capturelevelplanet  :capturelevelplanet " Level "
settextlinetrigger  capturenolevelplanet  :capturenolevelplanet " No Citadel"
settextlinetrigger  emergency_reboot      :emergency_reboot "<EMERGENCY REBOOT>"&$bot~bot_password
settextlinetrigger  shipdestroyed         :shipdestroyed "You will have to start over from scratch!"
settextlinetrigger  getplanetnumberraw    :setplanetnumberraw "Land on which planet <Q to abort> ? "
settextlinetrigger  getshipnumberraw       :setshipnumberraw "Choose which ship to beam to (Q=Quit) "
killtrigger         checkifbotalive
setdelaytrigger		checkifbotalive       :checkifbotalive 60000
settextlinetrigger lracheck :lracheck "For stealing from this port, your alignment"
settextlinetrigger lracheck2 :lracheck "For robbing this port, your alignment"
settextlinetrigger busted :busted "For getting caught your alignment went down by"
settextlinetrigger fakebusted :fakebusted "(You realize the guards saw you last time!)"
settextlinetrigger fakebusted2 :fakebusted "(You suddenly remember that you were caught stealing here before)"
settextlinetrigger manualsubspace :manualsubspace "Ok, you will send and receive sub-space messages on channel "
settextlinetrigger foundbigbubble :foundbigbubble "[Found Big Bubble]"
settextlinetrigger foundbigtunnel :foundbigtunnel "[Found Big Tunnel]"
settextlinetrigger ferrengihitcorp :ferrengihitcorp "Your Corp's fighters in sector "
settextlinetrigger ferrengihitpers :ferrengihitpers "Your fighters in sector "
settextlinetrigger underattack1 :underattack "Shipboard Computers"
settextlinetrigger underattack2 :underattack "is powering up weapons systems!"
pause

:underattack
getword currentline $bot~watcher_first_word 1
getwordpos currentline $bot~watcher_log_header_pos "Received from Shipboard Computers"
if (($bot~watcher_first_word <> ">") and ($bot~watcher_log_header_pos <= 0))
	setvar $bot~redalert true
end
killtrigger underattack1
killtrigger underattack2
settextlinetrigger underattack1 :underattack "Shipboard Computers"
settextlinetrigger underattack2 :underattack "is powering up weapons systems!"
pause

:foundbigbubble
gettext currentline $bsec " Door: " " Internal Sec:"
isnumber $test $bsec
if ($test = true)
	getsectorparameter $bsec "BUBBLEDOOR" $param_tunnel
	if ($param_tunnel = "")
		setvar $param_tunnel false
	end
	if ($param_tunnel = false)
		setsectorparameter $bsec "BUBBLEDOOR" 1
		gettext currentline $int "Internal Sec:" ""
		setsectorparameter $bsec "BUBBLEINT" $int
	end
end
settextlinetrigger foundbigbubble :foundbigbubble "[Found Big Bubble]"
pause

:foundbigtunnel
gettext currentline $dsec1 "Door 1: " " Door 2:"
gettext currentline $dsec2 "Door 2: " " Internal"
isnumber $test $dsec1
if ($test = true)
	getsectorparameter $dsec1 "TUNNELDOOR" $param_tunnel

	if ($param_tunnel = "")
		setvar $param_tunnel false
	end
	if ($param_tunnel = false)
		setsectorparameter $dsec1 "TUNNELDOOR" 1
		setsectorparameter $dsec2 "TUNNELDOOR" 1
		gettext currentline $int "Internal Sec:" ""
		setsectorparameter $dsec1 "TUNNELINT" $int
		setsectorparameter $dsec2 "TUNNELINT" $int
	end
end
settextlinetrigger foundbigtunnel :foundbigtunnel "[Found Big Tunnel]"
pause

:manualsubspace
gettext currentline&"  [XX][XX][XX]" $bot~subspace "Ok, you will send and receive sub-space messages on channel " " now.  [XX][XX][XX]"
savevar $bot~subspace
settextlinetrigger manualsubspace :manualsubspace "Ok, you will send and receive sub-space messages on channel "
pause

:busted
loadvar $player~current_sector
setsectorparameter $player~current_sector "BUSTED" true
setsectorparameter 1 "LRA" $player~current_sector
settextlinetrigger busted :busted "For getting caught your alignment went down by"
pause

:fakebusted
loadvar $player~current_sector
setsectorparameter $player~current_sector "BUSTED" true
setsectorparameter $player~current_sector "FAKEBUST" true
settextlinetrigger fakebusted :fakebusted "(You realize the guards saw you last time!)"
settextlinetrigger fakebusted2 :fakebusted "(You suddenly remember that you were caught stealing here before)"
pause

:lracheck
killtrigger lracheck
killtrigger lracheck2
loadvar $player~current_sector
setsectorparameter 1 "LRA" $player~current_sector
settextlinetrigger lracheck :lracheck "For stealing from this port, your alignment"
settextlinetrigger lracheck2 :lracheck "For robbing this port, your alignment"
pause

:setshipnumberraw
getword currentline $spoof 1
if ($spoof = "Choose")
	getword currentline $player~ship_number 8
	isnumber $test $player~ship_number
	if ($test = true)
		savevar $player~ship_number
	end
end
settextlinetrigger  getshipnumberraw       :setshipnumberraw "Choose which ship to beam to (Q=Quit) "
pause

pause

:setplanetnumberraw
getword currentline $spoof 1
if ($spoof = "Land")
	getword currentline $planet~planet 9
	isnumber $test $planet~planet
	if ($test = true)
		savevar $planet~planet
	end
end
settextlinetrigger  getplanetnumberraw    :setplanetnumberraw "Land on which planet <Q to abort> ? "
pause

pause

:federasefig
getword currentline $spoof 1
if ($spoof <> "The")
	goto :endfederasefig
end
gettext currentline&"  [XX][XX][XX]" $temp " fighters in sector " ".  [XX][XX][XX]"
if ($temp <> "")
	isnumber $test $temp
	if ($test = true)
		if (($temp <= sectors) and ($temp > 0))
			setvar $target $temp
			setsectorparameter $target "MSLSEC" true
			gosub :removefigfromdata
		end
	end
end

:endfederasefig
settextlinetrigger  federase        :federasefig        "The Federation We destroyed "
pause

:erasefig
setvar $line currentline
setvar $ansi_line currentansiline
cuttext $line&"     " $spoof 1 2
cuttext $line&"     " $spoof2 1 1
if (($spoof = "R ") or ($spoof = "F ") or ($spoof = "P ") or ($spoof2 = "'") or ($spoof2 = "`"))
	goto :enderasefig
end
gettext $line&" [XX][XX][XX]" $temp " destroyed " " [XX][XX][XX]"
if ($temp <> "")
	getword $temp $fig_hit 7
	getword $temp $fig_number 1
	isnumber $test $fig_hit
	if (($test = true) and ($fig_number <> "0"))
		if (($fig_hit <= sectors) and ($fig_hit > 0))
			setvar $target $fig_hit
			setvar $bot~last_fighter_hit $fig_hit
			setvar $bot~last_hit $fig_hit
			savevar $bot~last_fighter_hit
			savevar $bot~last_hit
			gosub :removefigfromdata
		end
	end
end

:enderasefig
settextlinetrigger fighterserase :erasefig " of your fighters in sector "
pause

:erasewarpfig
getword currentline $spoof 1
if ($spoof <> "You")
	settextlinetrigger      warpfigerase        :erasewarpfig       "You do not have any fighters in Sector "
	pause
end
gettext currentline&" [XX][XX][XX]" $temp "You do not have any fighters in Sector " ". [XX][XX][XX]"
if ($temp <> "")
	isnumber $test $temp
	if ($test)
		if (($temp <= sectors) and ($temp > 0))
			setvar $target $temp
			gosub :removefigfromdata
		end
	end
end
settextlinetrigger      warpfigerase        :erasewarpfig       "You do not have any fighters in Sector "
pause

:limpsave
setvar $line currentline
cuttext $line&"     " $spoof 1 2
cuttext $line&"     " $spoof2 1 1
if (($spoof = "R ") or ($spoof = "F ") or ($spoof = "P ") or ($spoof2 = "'") or ($spoof2 = "`"))
	goto :endsavelimp
end
gettext $line&" [XX][XX][XX]" $temp "Limpet mine in " " activated"
if ($temp <> "")
	setvar $limp_hit $temp
	isnumber $test $limp_hit
	if ($test = true)
		if (($limp_hit <= sectors) and ($limp_hit > 0))
			setvar $bot~last_limpet_attack $line
			savevar $bot~last_limpet_attack
			setvar $bot~last_hit_type "limpet"
			savevar $bot~last_hit_type
			setvar $bot~last_limpet_hit $limp_hit
			setvar $bot~last_hit $limp_hit
			savevar $bot~last_hit
			savevar $bot~last_limpet_hit
		end
	end
end

:endsavelimp
settextlinetrigger  limpsave		:limpsave	"Limpet mine in "
pause

:armidsave
setvar $line currentline
setvar $ansi_line currentansiline
cuttext $line&"     " $spoof 1 2
cuttext $line&"     " $spoof2 1 1
if (($spoof = "R ") or ($spoof = "F ") or ($spoof = "P ") or ($spoof2 = "'") or ($spoof2 = "`"))
	goto :endsavearmid
end
#Your mines in 4441 did 628 damage to Mind
gettext $line&" [XX][XX][XX]" $temp "Your mines in " " did "
if ($temp <> "")
	setvar $mine_hit $temp
	isnumber $test $mine_hit
	if ($test = true)
		if (($mine_hit <= sectors) and ($mine_hit > 0))
			setvar $bot~last_armid_attack $line
			setvar $bot~ansi_last_armid_attack $ansi_line
			savevar $bot~last_armid_attack
			savevar $bot~ansi_last_armid_attack
			setvar $bot~last_hit_type "armid"
			savevar $bot~last_hit_type
			setvar $bot~last_armid_hit $mine_hit
			setvar $bot~last_hit $mine_hit
			savevar $bot~last_hit
			savevar $bot~last_armid_hit
		end
	end
end

:endsavearmid
settextlinetrigger 	armidsave 		:armidsave "Your mines in "
pause

:fightersave
setvar $line currentline
setvar $ansi_line currentansiline
cuttext $line&"     " $spoof 1 2
cuttext $line&"     " $spoof2 1 1
if (($spoof = "R ") or ($spoof = "F ") or ($spoof = "P ") or ($spoof2 = "'") or ($spoof2 = "`"))
	goto :endfightersave
end
#Deployed Fighters Report Sector 8920: Mind's Imperial StarShip entered sector.
gettext $line&" [XX][XX][XX]" $temp "Deployed Fighters Report Sector " ": "
if ($temp <> "")
	setvar $fighit $temp
	isnumber $test $fighit
	if ($test = true)
		if (($fighit <= sectors) and ($fighit > 0))
			setvar $bot~last_hit_type "fighter"
			savevar $bot~last_hit_type
			setvar $bot~last_fighter_attack $line
			savevar $bot~last_fighter_attack
			setvar $bot~ansi_last_fighter_attack $ansi_line
			savevar $bot~ansi_last_fighter_attack
			setvar $bot~last_fighter_hit $fighit
			setvar $bot~last_hit $fighit
			savevar $bot~last_hit
			savevar $bot~last_fighter_hit
		end
	end
end

:endfightersave
settextlinetrigger  fightersave 	:fightersave "Deployed Fighters "
pause

:erasebusts
loadvar $bot~subspace
cuttext currentline&"   " $spoof 1 1
getwordpos currentline $pos "<"&$bot~subspace&">["
getwordpos currentline $pos2 "]<"&$bot~subspace&">"
if (($pos <= 0) or ($pos2 <= 0))
	setvar $spoof true
end
if ($spoof <> "R")
	settextlinetrigger  clearbusts      :erasebusts     ">[Busted:"
	pause
end
gettext currentline&" [XX][XX][XX]" $temp ">[Busted:" "]<"

if ($temp <> "")
	isnumber $test $temp
	if ($test)
		if (($temp <= sectors) and ($temp > 0))
				setsectorparameter $temp "BUSTED" false
				setsectorparameter $temp "FAKEBUST" false
		end
	end
end
settextlinetrigger  clearbusts      :erasebusts     ">[Busted:"
pause

:addfigs
loadvar $bot~subspace
cuttext currentline&"   " $spoof 1 1
getwordpos currentline $pos "<"&$bot~subspace&">["
getwordpos currentline $pos2 "]<"&$bot~subspace&">"
if (($pos <= 0) or ($pos2 <= 0))
	setvar $spoof true
end
if ($spoof <> "R")
	settextlinetrigger  addfigs      :addfigs     ">[Figged:"

	pause
end
gettext currentline&" [XX][XX][XX]" $temp ">[Figged:" "]<"
if ($temp <> "")
	setvar $junk "JUNKJUNK"
	setvar $i 1

	:check_figs_again
	getword $temp $temp_sector $i $junk
	if ($temp_sector <> $junk)
		isnumber $test $temp_sector
		if ($test)
			setsectorparameter $temp_sector "FIGSEC" true
			getsectorparameter 2 "FIG_COUNT" $figcount
			setsectorparameter 2 "FIG_COUNT" ($figcount+1)
		end
		add $i 1
		goto :check_figs_again
	end
end
settextlinetrigger  addfigs      :addfigs     ">[Figged:"
pause

:updateplanetmovement
cuttext currentline&"   " $spoof 1 1
if ($spoof <> "R")
	settextlinetrigger  planetmoved      :updateplanetmovement     " moved to sector "
	pause
end
getwordpos currentline $pos "} - Planet #"
getwordpos currentline $pos2 " moved to sector "
if (($pos > 0) and ($pos2 > 0))
	getword currentline $planet~planet_id 6
	getword currentline $planet~planet_sector 10
	replacetext $planet~planet_id "#" ""
	replacetext $planet~planet_sector "." ""
	isnumber $test $planet~planet_sector
	if ($test)
		setsectorparameter $planet~planet_id "PSECTOR" $planet~planet_sector
	end
end
settextlinetrigger  planetmoved      :updateplanetmovement     " moved to sector "
pause

:pgridadd
cuttext currentline&"   " $spoof 1 1
if ($spoof <> "R")
	settextlinetrigger  pgridadd    :pgridadd   "Successfully P-gridded into sector "
	pause
end

gettext currentline&" [XX][XX][XX]" $temp "Successfully P-gridded into sector " " [XX][XX][XX]"
if ($temp <> "")
	isnumber $test $temp
	if ($test)
		if (($temp <= sectors) and ($temp > 0))
			setvar $target $temp
			gosub :addfigtodata
		end
	end
end
settextlinetrigger  pgridadd    :pgridadd   "Successfully P-gridded into sector "
pause

:pgridxportadd
cuttext currentline&"   " $spoof 1 1
if ($spoof <> "R")
	settextlinetrigger  pgridxportadd    :pgridxportadd   "Successfully P-gridded w/xport into sector "
	pause
end

gettext currentline&" [XX][XX][XX]" $temp "Successfully P-gridded w/xport into sector " " [XX][XX][XX]"
if ($temp <> "")
	isnumber $test $temp
	if ($test)
		if (($temp <= sectors) and ($temp > 0))
			setvar $target $temp
			gosub :addfigtodata
		end
	end
end
settextlinetrigger  pgridxportadd    :pgridxportadd   "Successfully P-gridded w/xport into sector "
pause

:pgridremove
cuttext currentline&"   " $spoof 1 1
if ($spoof <> "R")
	settextlinetrigger  pgridremove    :pgridremove   "Unsuccessful P-grid into sector "
	pause
end

gettext currentline&" [XX][XX][XX]" $temp "Unsuccessful P-grid into sector " ". Someone make sure bot is picked up."
if ($temp <> "")
	isnumber $test $temp
	if ($test)
		if (($temp <= sectors) and ($temp > 0))
			setvar $target $temp
			gosub :removefigfromdata
		end
	end
end
settextlinetrigger  pgridremove    :pgridremove   "Unsuccessful P-grid into sector "
pause

:ferrengihitcorp
setvar $line currentline
cuttext $line&"     " $spoof 1 2
cuttext $line&"     " $spoof2 1 1
if (($spoof = "R ") or ($spoof = "F ") or ($spoof = "P ") or ($spoof2 = "'") or ($spoof2 = "`"))
	goto :endferrengihitcorp
end
#Your Corp's fighters in sector 14179 lost 1 fighting off Tejgek Ceuggeem.
gettext $line&" [XX][XX][XX]" $temp "Your Corp's fighters in sector " " lost "
if ($temp <> "")
	setvar $target $temp
	isnumber $test $target
	if ($test = true)
		if (($target <= sectors) and ($target > 0))
			gosub :removefigfromdata
		end
	end
end

:endferrengihitcorp
settextlinetrigger ferrengihitcorp :ferrengihitcorp "Your Corp's fighters in sector "
pause

:ferrengihitpers
setvar $line currentline
cuttext $line&"     " $spoof 1 2
cuttext $line&"     " $spoof2 1 1
if (($spoof = "R ") or ($spoof = "F ") or ($spoof = "P ") or ($spoof2 = "'") or ($spoof2 = "`"))
	goto :endferrengihitpers
end
#Your fighters in sector 4994 lost 1 fighting off Lufchar Ceacnaes
gettext $line&" [XX][XX][XX]" $temp "Your fighters in sector " " lost "
if ($temp <> "")
	setvar $target $temp
	isnumber $test $target
	if ($test = true)
		if (($target <= sectors) and ($target > 0))
			gosub :removefigfromdata
		end
	end
end

:endferrengihitpers
settextlinetrigger ferrengihitpers :ferrengihitpers "Your fighters in sector "
pause

:addfig
isnumber $test currentsector
if ($test)
	if ((currentsector > 10) and (currentsector < sectors))
		setvar $target currentsector
		gosub :addfigtodata
	end
end
settextlinetrigger      fightersadd     :addfig         "Should they be (D)efensive, (O)ffensive or Charge a (T)oll ?"
pause

:removefigfromdata
getsectorparameter $target "FIGSEC" $check
if ($check = true)
	getsectorparameter 2 "FIG_COUNT" $figcount
	setsectorparameter 2 "FIG_COUNT" ($figcount-1)
end
setsectorparameter $target "FIGSEC" false
return

:addfigtodata
getsectorparameter $target "FIGSEC" $check
if ($check <> true)
	getsectorparameter 2 "FIG_COUNT" $figcount
	setsectorparameter 2 "FIG_COUNT" ($figcount+1)
end
setsectorparameter $target "FIGSEC" true
return

# ============================== START GET PLANET STATS TRIGGERS==============================
:setplanetnumber
getwordpos rawpacket $pos "Planet " & #27 & "[1;33m#" & #27 & "[36m"
if ($pos > 0)
	gettext rawpacket $planet~planet "Planet " & #27 & "[1;33m#" & #27 & "[36m" #27 & "[0;32m in sector "
	isnumber $test $planet~planet
	if ($test = true)
		savevar $planet~planet
		setsectorparameter $planet~planet "PSECTOR" currentsector
	end
end
settextlinetrigger  getplanetnumber :setplanetnumber    "Planet #"
pause
# =============================== END GET PLANET STATS TRIGGERS===============================
# ============================== CHECK SECTOR DATA ========================================
:checksectordata
gettext currentline $cursec "]:[" "] ("
if ($cursec = currentsector)
	setvar $player~current_sector $cursec
	savevar $player~current_sector
	getsectorparameter $player~current_sector "BUSTED" $isbusted
	loadvar $bot~command_prompt_extras
	if (($bot~command_prompt_extras = true) and ($isbusted = true))
		echo ansi_5 "[" ansi_12 "BUSTED" ansi_5 "] : "
	end
	getsectorparameter $player~current_sector "MSLSEC" $ismsl
	if (($bot~command_prompt_extras = true) and ($ismsl = true))
		echo ansi_5 "[" ansi_9 "MSL" ansi_5 "] : "
	end
end
pause
# ============================ END CHECK SECTOR DATA ========================================
# ============================== START GET SHIP STATS TRIGGERS==============================
:setshipoffensiveodds
getwordpos currentansiline $pos "[0;31m:[1;36m1"
if ($pos > 0)
	gettext currentansiline $ship~ship_offensive_odds "Offensive Odds[1;33m:[36m " "[0;31m:[1;36m1"
	striptext $ship~ship_offensive_odds "."
	striptext $ship~ship_offensive_odds " "
	savevar $ship~ship_offensive_odds
	gettext currentansiline $ship~ship_fighters_max "Max Fighters[1;33m:[36m" "[0;32m Offensive Odds"
	striptext $ship~ship_fighters_max ","
	striptext $ship~ship_fighters_max " "
	savevar $ship~ship_fighters_max
else
	getwordpos currentline $pos "Offensive Odds:"
	if ($pos > 0)
		gettext currentline $ship~ship_offensive_odds "Offensive Odds:" ":1"
		striptext $ship~ship_offensive_odds "."
		striptext $ship~ship_offensive_odds " "
		savevar $ship~ship_offensive_odds
		gettext currentline $ship~ship_fighters_max "Max Fighters:" "Offensive Odds:"
		striptext $ship~ship_fighters_max ","
		striptext $ship~ship_fighters_max " "
		savevar $ship~ship_fighters_max
	end
end
settextlinetrigger  getshipstats    :setshipoffensiveodds   "Offensive Odds: "
pause

:setshipmaxfigattack
getwordpos currentansiline $pos "[0m[32m Max Figs Per Attack[1;33m:[36m"
if ($pos > 0)
	gettext currentansiline $ship~ship_max_attack "[0m[32m Max Figs Per Attack[1;33m:[36m" "[0;32mTransWarp"
	striptext $ship~ship_max_attack " "
	savevar $ship~ship_max_attack
else
	getwordpos currentline $pos "Max Figs Per Attack:"
	if ($pos > 0)
		gettext currentline $ship~ship_max_attack "Max Figs Per Attack:" "TransWarp Drive:"
		striptext $ship~ship_max_attack " "
		savevar $ship~ship_max_attack
	end
end
settextlinetrigger  getshipmaxfighters  :setshipmaxfigattack    " TransWarp Drive:   "
pause
# ============================== END GET SHIP STATS TRIGGERS==============================
return

:capturelevelplanet
#do better ansi checks for spoofing
getwordpos currentansiline $pos "[32mLevel [1;33m"
if ($pos > 0)
	getword currentline $planet~planet_sector 1
	getword currentline $planet~planet_id 2
	if ($planet~planet_id = "T")
		getword currentline $planet~planet_id 3
	end
	replacetext $planet~planet_id "#" ""
	isnumber $test $planet~planet_id
	getwordpos $planet~planet_id $pos "."
	if (($test = true) and ($pos <= 0))
		if ($planet~planet_id > 0)
			setsectorparameter $planet~planet_id "PSECTOR" $planet~planet_sector
		end
	end
end
settextlinetrigger  capturelevelplanet  :capturelevelplanet " Level "
pause

:capturenolevelplanet
getwordpos currentansiline $pos "[32m No Citadel"
if ($pos > 0)
	getword currentline $planet~planet_sector 1
	getword currentline $planet~planet_id 2
	if ($planet~planet_id = "T")
		getword currentline $planet~planet_id 3
	end
	replacetext $planet~planet_id "#" ""
	isnumber $test $planet~planet_id
	getwordpos $planet~planet_id $pos "."
	if (($test = true) and ($pos <= 0))
		if ($planet~planet_id > 0)
			setsectorparameter $planet~planet_id "PSECTOR" $planet~planet_sector
		end
	end
end
settextlinetrigger  capturenolevelplanet  :capturenolevelplanet " No Citadel"
pause

:shipdestroyed
getwordpos currentansiline $pos "[32mYou will have to start over"
if ($pos > 0)
	setvar $bot~isshipdestroyed true
	savevar $bot~isshipdestroyed
	if (isnativebot = true)
		setvar $bot~do_not_resuscitate true
		savevar $bot~do_not_resuscitate
		echo "Mombot stopped: ship destroyed.**"
		nativebot stop
		halt
	end
	disconnect
	setvar $i 1
	setvar $found false
	setvar $rebooted false
	echo "Mombot rebooting..**"
	setdelaytrigger waitforrebootlist :listokaynow 1500
	pause

	:listokaynow
	listactivescripts $scripts
	while ($i <= $scripts)
		getwordpos "<><><>"&$scripts[$i] $pos "<><><>mombot"
		if ($pos > 0)
			if ($rebooted = false)
				setdelaytrigger waitforreboot :okaynow 3000
				pause

				:okaynow
				load "scripts\"&$bot~mombot_directory&"\"&$scripts[$i]
				setvar $rebooted true
			end
			stop $scripts[$i]
			setvar $found true
		end
		add $i 1
	end
	if ($found = false)
		echo "No mombot script found to reboot.**"
	end
end

settextlinetrigger  shipdestroyed         :shipdestroyed "You will have to start over from scratch!"
pause

:emergency_reboot
loadvar $bot~subspace
loadvar $bot~bot_name
loadvar $bot~bot_password
getwordpos currentline $pos $bot~bot_name&" "&$bot~subspace&"<EMERGENCY REBOOT>"&$bot~bot_password
if ($pos <= 0)
	settextlinetrigger  emergency_reboot      :emergency_reboot "<EMERGENCY REBOOT>"&$bot~bot_password
	pause
end
setvar $i 1
setvar $found false
setvar $rebooted false
setdelaytrigger listokaynowemergency :listokaynowemergency 1500
pause

:listokaynowemergency
listactivescripts $scripts
while ($i <= $scripts)
	getwordpos "<><><>"&$scripts[$i] $pos "mombot"
	if ($pos > 0)
		stop $scripts[$i]
		if ($found = false)
			setvar $boot_this $scripts[$i]
			setvar $found true
		end
	end
	add $i 1
end
if ($found = false)
	echo "No mombot script found to kill, so assuming default of mombot.cts*"
	setvar $boot_this "mombot.cts"
end
setdelaytrigger okaynowemergency :okaynowemergency 3000
pause

:okaynowemergency
load "scripts\"&$bot~mombot_directory&"\"&$boot_this
settextlinetrigger  emergency_reboot      :emergency_reboot "<EMERGENCY REBOOT>"&$bot~bot_password
pause

:checkifbotalive
loadvar $bot~do_not_resuscitate
loadvar $map~stardock
loadvar $bot~subspace
loadvar $bot~bot_password
loadvar $bot~bot_name

if (isnativebot = true)
	killtrigger         checkifbotalive
	setdelaytrigger		checkifbotalive       :checkifbotalive 60000
	pause
end

if ($bot~do_not_resuscitate <> true)
	setvar $found false
	listactivescripts $scripts
	setvar $i 1
	while (($i <= $scripts) and ($found = false))
		getwordpos "<><><>"&$scripts[$i] $pos "mombot"
		if ($pos > 0)
			if ($found = false)
				setvar $found true
			end
		end
		add $i 1
	end
	if ($found = false)
		echo "**"&ansi_2&"["&ansi_4&"No mombot is running, automatically booting up mombot."&ansi_2&"]**"
		load "scripts\"&$bot~mombot_directory&"\mombot.cts"
	end
	killtrigger         checkifbotalive
	setdelaytrigger		checkifbotalive       :checkifbotalive 60000
	pause
end
